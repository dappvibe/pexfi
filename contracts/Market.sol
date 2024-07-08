// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {FullMath} from "../lib/v4-core/src/libraries/FullMath.sol";
import {TickMath} from "../lib/v4-core/src/libraries/TickMath.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import "./libraries/Errors.sol";
import {Tokens} from "./libraries/Tokens.sol";
import {Deals} from "./libraries/Deals.sol";
import {Methods} from "./libraries/Methods.sol";
import {Offers} from "./libraries/Offers.sol";
import {Fiats} from "./libraries/Fiats.sol";

import {IMarket} from "./interfaces/IMarket.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {IDealFactory} from "./interfaces/IDealFactory.sol";
import {IRepToken} from "./interfaces/IRepToken.sol";


contract Market is IMarket, OwnableUpgradeable, UUPSUpgradeable
{
    using Strings   for string;
    using SafeERC20 for IERC20Metadata;

    using Tokens    for Tokens.Storage;
    using Fiats     for Fiats.Storage;
    using Methods   for Methods.Storage;
    using Offers    for Offers.Storage;
    using Deals     for Deals.Storage;

    Tokens.Storage  private tokens;
    Fiats.Storage   private fiats;
    Methods.Storage private methods;
    Offers.Storage  private offers;
    Deals.Storage   private deals;

    IDealFactory    public dealFactory;
    IRepToken       public repToken;

    IUniswapV3Factory private uniswap;

    address public mediator;
    uint8 internal constant FEE = 100; // 1%

    function initialize(address repToken_, address uniswap_) initializer external {
        __Ownable_init(msg.sender);
        mediator = msg.sender;
        setRepToken(repToken_);
        uniswap = IUniswapV3Factory(uniswap_);
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    /// @param isSell_ offers posted by Sellers, i.e. offers to buy tokens for fiat
    /// @param method_ may be empty string to list all offers
    function getOffers(bool isSell_, string calldata token_, string calldata fiat_, string calldata method_)
    external view
    returns (Offers.Offer[] memory) {
        return offers.list(isSell_, token_, fiat_, method_);
    }
    function getOffer(uint id_) external view returns (Offers.Offer memory) {
        return offers.all[id_];
    }

    struct CreateOfferParams {
        bool isSell;
        string token;
        string fiat;
        string method;
        uint16 rate; // 4 decimals
        uint32 min; // in fiat
        uint32 max;
        string terms;
    }
    function createOffer(CreateOfferParams calldata params_) external {
        if (params_.rate <= 0)                      revert InvalidArgument("rate");
        if (params_.min <= 0 || params_.max <= 0)   revert InvalidArgument("minmax");
        if (params_.min >= params_.max)             revert InvalidArgument("lowmax");
        require(getPrice(params_.token, params_.fiat) != 0, "pair");
        if (methods.get(params_.method).name.equal('')) revert InvalidArgument("method");
        // TODO convert min to USD and check offers' minimum

        Offers.Offer storage $offer = offers.add(Offers.Offer({
            id: 0,
            owner: msg.sender,
            isSell: params_.isSell,
            token: params_.token,
            fiat: params_.fiat,
            method: params_.method,
            rate: params_.rate,
            min: params_.min,
            max: params_.max,
            terms: params_.terms,
            kycRequired: false
        }));

        emit OfferCreated(msg.sender, params_.token, params_.fiat, $offer);
    }

    /// @param fiatAmount_ must have 6 decimals
    // FIXME instructions is not the case if buying
    // TODO cryptoAmount parameter for people who REALLY want to count in crypto. One of amounts must be 0

    // FIXME call factory directly and factory notify market. offer is deal factory!
    // OfferFactory notifies Market about new offer, check sender address in Market to add to listing
    function createDeal(uint offerId_, uint fiatAmount_, string memory paymentInstructions_)
    external
    {
        Offers.Offer storage $offer = offers.all[offerId_];

        require(msg.sender != $offer.owner, "self deal");

        uint $tokenAmount = convert(fiatAmount_, $offer.fiat, $offer.token, $offer.rate);

        address $deal = dealFactory.create(
            address(repToken),
            offerId_,
            $offer.isSell,
            $offer.owner,
            msg.sender,
            mediator,
            address(token($offer.token)),
            $tokenAmount,
            fiatAmount_,
            paymentInstructions_
        );
        deals.add($deal, offerId_);

        emit DealCreated($offer.owner, msg.sender, offerId_, $deal);

        if (!$offer.isSell) {
            IERC20Metadata $token = IERC20Metadata(token($offer.token));
            $token.safeTransferFrom(msg.sender, $deal, $tokenAmount);
        }

        repToken.grantRole('DEAL_ROLE', $deal);
    }

    /// @dev users provide allowance once to the market
    function fundDeal() external returns (bool) {
        require(deals.has(msg.sender), "NE");

        IDeal $deal = IDeal(msg.sender);
        require($deal.state() == IDeal.State.Accepted, "not accepted");

        Offers.Offer memory $offer = offers.all[$deal.offerId()];
        require ($offer.isSell, "not selling offer");

        IERC20Metadata $token = IERC20Metadata(token($offer.token));
        $token.safeTransferFrom($deal.seller(), address($deal), $deal.tokenAmount());

        return true;
    }

    function setRepToken(address repToken_) public onlyOwner { repToken = IRepToken(repToken_); }
    function setDealFactory(address dealFactory_) public onlyOwner { dealFactory = IDealFactory(dealFactory_); }
    function setMediator(address mediator_) public onlyOwner { mediator = mediator_; }

    /// @param amount_ must have 6 decimals as a fiat amount
    /// @param denominator ratio (4 decimal) to apply to resulting amount
    /// @return $amount of tokens in precision of given token
    function convert(uint amount_, string memory fromFiat_, string memory toToken_, uint denominator) public view returns (uint256 $amount) {
        if (fromFiat_.equal("USD") && toToken_.equal("USDT")) return FullMath.mulDiv(amount_, 10**4, denominator);

        uint decimals = tokens.get(toToken_).decimals;
        $amount = FullMath.mulDiv(amount_, 10**decimals, getPrice(toToken_, fromFiat_));
        return FullMath.mulDiv($amount, 10**4, denominator);
    }

    /// @return price with 6 decimals
    function getPrice(string memory token_, string memory fiat_) public view returns (uint256 price) {
        if (!token_.equal('USDT')) {
            price = _uniswapRateForUSDT(tokens.get(token_));
        }
        else price = 10**6;

        // convert to other currency
        if (!fiat_.equal("USD")) {
            (,int $fiatToUSD,,,) = fiats.get(fiat_).toUSD.latestRoundData();
            price = price * 10**8 / uint($fiatToUSD); // $fiat.decimals() is always 8
        }
    }

    function token(string memory symbol_) public view returns (IERC20Metadata) { return tokens.get(symbol_).api; }
    function getTokens() public view returns (Tokens.Token[] memory) { return tokens.list(); }
    function fiat(string memory symbol_) public view returns (Fiats.Fiat memory) { return fiats.get(symbol_); }
    function getFiats() public view returns (bytes32[] memory) { return fiats.list(); }
    function method(string memory symbol_) public view returns (Methods.Method memory) { return methods.get(symbol_); }
    function getMethods() public view returns (Methods.Method[] memory) { return methods.list(); }

    function addTokens(address[] calldata tokens_, uint16 uniswapPoolFee) external onlyOwner {
        for (uint8 i = 0; i < tokens_.length; i++) {
            tokens.add(tokens_[i], uniswapPoolFee);
        }
    }
    function removeTokens(string[] calldata token_) external onlyOwner {
        for (uint8 i = 0; i < token_.length; i++) {
            tokens.remove(token_[i]);
        }
    }
    function addFiats(Fiats.Fiat[] calldata fiats_) external onlyOwner {
        for (uint8 i = 0; i < fiats_.length; i++) {
            fiats.add(fiats_[i]);
        }
    }
    function removeFiats(string[] calldata fiat_) external onlyOwner {
        for (uint8 i = 0; i < fiat_.length; i++) {
            fiats.remove(fiat_[i]);
        }
    }
    function addMethods(Methods.Method[] calldata new_) external onlyOwner {
        for (uint i = 0; i < new_.length; i++) {
            methods.add(new_[i]);
        }
    }
    function removeMethods(string[] calldata names_) external onlyOwner {
        for (uint i = 0; i < names_.length; i++) {
            methods.remove(names_[i]);
        }
    }

    /// @return price of token_ in USDT (6 decimals)
    function _uniswapRateForUSDT(Tokens.Token storage token_) internal view returns (uint)
    {
        IUniswapV3Pool pool = IUniswapV3Pool(uniswap.getPool(
            address(token_.api),
            address(tokens.get("USDT").api),
            token_.uniswapPoolFee
        ));

        uint32[] memory secs = new uint32[](2);
        secs[0] = 300; // 5 minutes TWAP
        secs[1] = 0;
        (int56[] memory tickCumulatives,) = pool.observe(secs);
        int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];
        uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(int24(tickCumulativesDelta / 300));

        // return in USDT (tokenB) precision
        return FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10**token_.decimals, 1 << 192);
    }
}
