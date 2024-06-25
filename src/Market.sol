// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {IRepToken} from "./interfaces/IRepToken.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {Deal} from "./Deal.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IInventory} from "./interfaces/IInventory.sol";

contract Market is IMarket,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using Strings for string;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeERC20 for IERC20Metadata;

    IRepToken public repToken;
    IInventory public inventory;

    mapping (bytes32 => Method) public method;
    EnumerableSet.Bytes32Set private _methods;

    mapping(uint => Offer) public offers;
    /// @dev crypto => fiat => method => ids[] ("0" is a special method to list all offers)
    mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => EnumerableSet.UintSet))) private _sellOffersByPair;
    mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => EnumerableSet.UintSet))) private _buyOffersByPair;
    uint24 private _nextOfferId;

    EnumerableSet.AddressSet private _deals;
    mapping(uint => IDeal[]) private _offerDeals;

    address public mediator;
    uint8 internal constant FEE = 100; // 1%

    function initialize(address repToken_, address inventory_) initializer external {
        __Ownable_init(msg.sender);

        setRepToken(repToken_);
        inventory = IInventory(inventory_);

        // 0 values are invalid and Upgradable can't use default values
        _nextOfferId++;
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    function methods() public view returns (bytes32[] memory) { return _methods.values(); }

    /// @param isSell_ offers posted by Sellers, i.e. offers to buy tokens for fiat
    /// @param method_ may be empty string to list all offers
    function getOffers(bool isSell_, string calldata token_, string calldata fiat_, string calldata method_)
    external view
    returns (Offer[] memory $offers)
    {
        bytes32 $token = bytes32(bytes(token_));
        bytes32 $fiat = bytes32(bytes(fiat_));
        bytes32 $method = bytes32(bytes(method_));

        EnumerableSet.UintSet storage $offersSet = isSell_ ? _sellOffersByPair[$token][$fiat][$method] : _buyOffersByPair[$token][$fiat][$method];
        uint $length = $offersSet.length();
        $offers = new Offer[]($length);

        for (uint i = 0; i < $length; i++) {
            $offers[i] = offers[$offersSet.at(i)];
        }
    }

    struct OfferCreateParams {
        bool isSell;
        string token;
        string fiat;
        string method;
        uint16 rate; // 4 decimals
        uint32 min; // in fiat
        uint32 max;
        uint16 acceptanceTime; // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
        string terms;
    }
    function offerCreate(OfferCreateParams calldata params_) external {
        try inventory.getPrice(params_.token, params_.fiat) returns (uint) {} catch { revert("invalid pair"); }
        require(_methods.contains(bytes32(bytes(params_.method))), "method not exist");
        require (params_.rate > 0, "empty rate");
        require (params_.min > 0, "min");
        require (params_.max > 0, "max");
        require (params_.min <= params_.max, "minmax");
        require (params_.acceptanceTime >= 900, "time");

        // TODO convert min to USD and check offers' minimum

        Offer memory $offer = Offer({
            id: _nextOfferId,
            owner: msg.sender,
            isSell: params_.isSell,
            token: params_.token,
            fiat: params_.fiat,
            method: params_.method,
            rate: params_.rate,
            min: params_.min,
            max: params_.max,
            acceptanceTime: params_.acceptanceTime,
            terms: params_.terms,
            kycRequired: false
        });

        _saveOffer($offer);

        emit OfferCreated(msg.sender, params_.token, params_.fiat, $offer);
    }

    function createDeal(
        uint offerId_,
        uint fiatAmount_, // 6 decimals
        string memory paymentInstructions_ // FIXME this is not the case if buying
    ) external
    {
        Offer memory $offer = offers[offerId_];

        uint $tokenAmount = inventory.convert(fiatAmount_, $offer.fiat, $offer.token, $offer.rate);

        Deal $deal = new Deal(
            offerId_,
            $offer.isSell,
            $offer.owner,
            msg.sender,
            mediator,
            inventory.token(bytes32(bytes($offer.token))),
            $tokenAmount,
            fiatAmount_,
            FEE,
            paymentInstructions_,
            block.timestamp + $offer.acceptanceTime,
            1 hours
        );
        _deals.add(address($deal));
        _offerDeals[offerId_].push($deal);

        emit DealCreated(offerId_, mediator, $deal);

        if (!$offer.isSell) {
            IERC20Metadata $token = IERC20Metadata(inventory.token(bytes32(bytes($offer.token))));
            $token.safeTransferFrom(msg.sender, address($deal), $tokenAmount);
        }
    }

    /// @dev users provide allowance once to the market
    function fundDeal() external returns (bool) {
        require(_deals.contains(msg.sender), "no deal");

        IDeal $deal = IDeal(msg.sender);
        require($deal.state() == IDeal.State.Accepted, "not accepted");

        Offer memory $offer = offers[$deal.offerId()];
        require ($offer.isSell, "not selling offer");

        IERC20Metadata $token = IERC20Metadata(inventory.token(bytes32(bytes($offer.token))));
        $token.safeTransferFrom($deal.seller(), address($deal), $deal.tokenAmount());

        return true;
    }
    // ---- end of public functions

    function _saveOffer(Offer memory offer_) private {
        offers[_nextOfferId] = offer_;

        bytes32 $token = bytes32(bytes(offer_.token));
        bytes32 $fiat = bytes32(bytes(offer_.fiat));
        bytes32 $method = bytes32(bytes(offer_.method));

        if (offer_.isSell) {
            _sellOffersByPair[$token][$fiat][''].add(offer_.id);
            _sellOffersByPair[$token][$fiat][$method].add(offer_.id);
        } else {
            _buyOffersByPair[$token][$fiat][''].add(offer_.id);
            _buyOffersByPair[$token][$fiat][$method].add(offer_.id);
        }

        _nextOfferId++;
    }

    function addMethods(Method[] calldata new_) external onlyOwner {
        for (uint i = 0; i < new_.length; i++) {
            bytes32 $name = bytes32(bytes((new_[i].name)));
            if (_methods.add($name)) {
                method[$name] = new_[i];
                emit MethodAdded(new_[i].name, new_[i]);
            }
        }
    }
    function removeMethods(string[] calldata names_) external onlyOwner {
        for (uint i = 0; i < names_.length; i++) {
            bytes32 $name = bytes32(bytes(names_[i]));
            if (_methods.remove($name)) {
                delete method[$name];
                emit MethodRemoved(names_[i]);
            }
        }
    }

    function setRepToken(address repToken_) public onlyOwner { repToken = IRepToken(repToken_); }
    function setInventory(address inventory_) public onlyOwner { inventory = IInventory(inventory_); }
    function setMediator(address mediator_) public onlyOwner { mediator = mediator_; }
}
