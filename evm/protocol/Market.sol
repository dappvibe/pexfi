// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {FullMath} from "./libraries/FullMath.sol";
import {TickMath} from "./libraries/TickMath.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import "./libraries/Errors.sol";
import {Tokens} from "./libraries/Tokens.sol";
import {Deals} from "./libraries/Deals.sol";
import {Methods} from "./libraries/Methods.sol";
import {Offers} from "./libraries/Offers.sol";
import {Fiats} from "./libraries/Fiats.sol";

import {DealFactory} from "./DealFactory.sol";
import {Deal} from "./Deal.sol";
import {OfferFactory} from "./OfferFactory.sol";
import {Offer} from "./Offer.sol";
import {RepToken} from "./RepToken.sol";

contract Market is OwnableUpgradeable, UUPSUpgradeable
{
    event OfferCreated(address indexed owner, string indexed token, string indexed fiat, Offer offer);
    event DealCreated(address indexed offerOwner, address indexed taker, address indexed offer, address deal);

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

    DealFactory     public dealFactory;
    OfferFactory    public offerFactory;
    RepToken        public repToken;
    IUniswapV3Factory private uniswap;

    address public mediator;

    function initialize(
        address offerFactory_,
        address dealFactory_,
        address repToken_,
        address uniswap_
    )
    initializer external
    {
        __Ownable_init(msg.sender);
        mediator = msg.sender;
        offerFactory = OfferFactory(offerFactory_);
        dealFactory = DealFactory(dealFactory_);
        repToken = RepToken(repToken_);
        uniswap = IUniswapV3Factory(uniswap_);
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    /// @param isSell_ offers posted by Sellers, i.e. offers to buy tokens for fiat
    /// @param method_ filter can be disabled by passing "ANY"
    function getOffers(bool isSell_, string calldata token_, string calldata fiat_, string calldata method_)
    external view
    returns (address[] memory) {
        return offers.list(isSell_, token_, fiat_, method_);
    }

    function addOffer(Offer offer) external {
        require(msg.sender == address(offerFactory), UnauthorizedAccount(msg.sender));
        offers.add(offer);
        emit OfferCreated(offer.owner(), offer.token(), offer.fiat(), offer);
    }
    function hasOffer(address offer_) external view returns (bool) { return offers.has(offer_); }

    function addDeal(Deal deal) external {
        require(msg.sender == address(dealFactory), UnauthorizedAccount(msg.sender));

        Offer offer = deal.offer();

        deals.add(address(deal), address(offer));
        emit DealCreated(offer.owner(), deal.taker(), address(offer), address(deal));

        repToken.grantRole('DEAL_ROLE', address(deal));
    }

    /// @dev users provide allowance once to the market
    function fundDeal() external {
        require(deals.has(msg.sender), UnauthorizedAccount(msg.sender));

      // FIXME critical security flaw!
      // buyer can't cancel after deal is accepted
      // потому что как только продавец покажет даже в мемпуле фанд транзакцию, то покупатель фронтраном отменит, а это атака на пользователей.
      // таким образом транзакция дойдёт до сделки и там зависнет
      // ПРАВИЛЬНЫМ решением будет проверка статуса сделки при Market.fundDeal() перед отправкой
      // отменять accepted сделку можно только по таймауту, или ещё лучше не фандить вообще и забить (но тогда будет висеть в UI)
        Deal $deal = Deal(msg.sender);
        require($deal.state() == Deal.State.Accepted, "not accepted");

        Offer $offer = $deal.offer();
        IERC20Metadata $token = token($offer.token()).api;

        address seller = $offer.isSell() ? $offer.owner() : $deal.taker();
        $token.safeTransferFrom(seller, address($deal), $deal.tokenAmount());
    }

    function setDealFactory(address dealFactory_) public onlyOwner { dealFactory = DealFactory(dealFactory_); }
    function setOfferFactory(address offerFactory_) public onlyOwner { offerFactory = OfferFactory(offerFactory_); }
    function setMediator(address mediator_) public onlyOwner { mediator = mediator_; }

    /// @param amount_ must have 6 decimals as a fiat amount
    /// @param denominator ratio (4 decimal) to apply to resulting amount
    /// @return amount of tokens in precision of given token // FIXME precision is not respected
    function convert(uint amount_, string memory fromFiat_, string memory toToken_, uint denominator)
    public view
    returns (uint256 amount)
    {
        if (fromFiat_.equal("USD") && toToken_.equal("USDT")) return FullMath.mulDiv(amount_, 10**4, denominator);

        uint decimals = tokens.get(toToken_).decimals;
        amount = FullMath.mulDiv(amount_, 10**decimals, getPrice(toToken_, fromFiat_));
        return FullMath.mulDiv(amount, 10**4, denominator);
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

    function token(string memory symbol_) public view returns (Tokens.Token memory) { return tokens.get(symbol_); }
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
