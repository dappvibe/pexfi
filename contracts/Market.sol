// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/Errors.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {RepToken} from "./RepToken.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {Deal} from "./Deal.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IInventory} from "./interfaces/IInventory.sol";
import {Offers} from "./libraries/Offers.sol";
import {Deals} from "./libraries/Deals.sol";
import {Methods} from "./libraries/Methods.sol";

contract Market is IMarket, OwnableUpgradeable, UUPSUpgradeable
{
    using Strings   for string;
    using SafeERC20 for IERC20Metadata;
    using Offers    for Offers.Storage;
    using Deals     for Deals.Storage;

    Offers.Storage  private offers;
    Deals.Storage   private deals;

    RepToken   public repToken;
    IInventory public inventory;

    address public mediator;
    uint8 internal constant FEE = 100; // 1%

    function initialize(address repToken_, address inventory_) initializer external {
        __Ownable_init(msg.sender);
        mediator = msg.sender;
        setRepToken(repToken_);
        inventory = IInventory(inventory_);
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
        try inventory.getPrice(params_.token, params_.fiat) returns (uint) {} catch { revert InvalidArgument("pair"); }
        if (inventory.method(params_.method).name.equal('')) revert InvalidArgument("method");
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
    function createDeal(uint offerId_, uint fiatAmount_, string memory paymentInstructions_)
    external
    {
        Offers.Offer storage $offer = offers.all[offerId_];

        uint $tokenAmount = inventory.convert(fiatAmount_, $offer.fiat, $offer.token, $offer.rate);

        Deal $deal = new Deal(
            repToken,
            offerId_,
            $offer.isSell,
            $offer.owner,
            msg.sender,
            mediator,
            inventory.token($offer.token),
            $tokenAmount,
            fiatAmount_,
            FEE,
            paymentInstructions_
        );
        deals.add(address($deal), offerId_);

        emit DealCreated(offerId_, mediator, $deal);

        if (!$offer.isSell) {
            IERC20Metadata $token = IERC20Metadata(inventory.token($offer.token));
            $token.safeTransferFrom(msg.sender, address($deal), $tokenAmount);
        }

        repToken.grantRole('DEAL_ROLE', address($deal));
    }

    /// @dev users provide allowance once to the market
    function fundDeal() external returns (bool) {
        require(deals.has(msg.sender), "NE");

        IDeal $deal = IDeal(msg.sender);
        require($deal.state() == IDeal.State.Accepted, "not accepted");

        Offers.Offer memory $offer = offers.all[$deal.offerId()];
        require ($offer.isSell, "not selling offer");

        IERC20Metadata $token = IERC20Metadata(inventory.token($offer.token));
        $token.safeTransferFrom($deal.seller(), address($deal), $deal.tokenAmount());

        return true;
    }
    // ---- end of public functions

    function setRepToken(address repToken_) public onlyOwner { repToken = RepToken(repToken_); }
    function setInventory(address inventory_) public onlyOwner { inventory = IInventory(inventory_); }
    function setMediator(address mediator_) public onlyOwner { mediator = mediator_; }
}
