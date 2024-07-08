// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../Offer.sol";
import "hardhat/console.sol";

library Offers
{
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Storage {
        uint length;
        EnumerableSet.AddressSet all;
        mapping(string token => mapping(string fiat => mapping(string method => EnumerableSet.AddressSet))) sell;
        mapping(string token => mapping(string fiat => mapping(string method => EnumerableSet.AddressSet))) buy;
    }

    function add(Storage storage self, Offer offer)
    internal
    {
        require(self.all.add(address(offer)), 'exists');

        /*bytes32 token   = bytes32(bytes(offer.token().symbol()));
        bytes32 fiat    = bytes32(bytes(offer.fiat()));
        (string memory m,) = offer.method();
        bytes32 method  = bytes32(bytes(m));*/

        string memory token   = offer.token().symbol();
        string memory fiat    = offer.fiat();
        (string memory method,)  = offer.method();

        if (offer.isSell()) {
            self.sell[token][fiat]['ANY'].add(address(offer));
            self.sell[token][fiat][method].add(address(offer));
        } else {
            self.buy[token][fiat]['ANY'].add(address(offer));
            self.buy[token][fiat][method].add(address(offer));
        }
    }

    function list(Storage storage self, bool isSell_, string calldata token_, string calldata fiat_, string calldata method_)
    internal view
    returns (address[] memory offers)
    {
        console.log(isSell_, token_, fiat_, method_);

        /*bytes32 token   = bytes32(bytes(token_));
        bytes32 fiat    = bytes32(bytes(fiat_));
        bytes32 method  = bytes32(bytes(method_));*/

        EnumerableSet.AddressSet storage offersSet = isSell_ ? self.sell[token_][fiat_][method_] : self.buy[token_][fiat_][method_];

        return offersSet.values();
    }
}
