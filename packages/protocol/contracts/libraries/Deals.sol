// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library Deals {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Storage {
        EnumerableSet.AddressSet all;
        mapping(address => address[]) byOffer;
    }

    function add(Storage storage self, address deal, address offer) internal {
        self.all.add(deal);
        self.byOffer[offer].push(deal);
    }

    function has(Storage storage self, address deal) internal view returns (bool) {
        return self.all.contains(deal);
    }
}
