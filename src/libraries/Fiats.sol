// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IChainlink.sol";

library Fiats {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct Fiat {
        string symbol;
        IChainlink toUSD;
    }

    struct Storage {
        EnumerableSet.Bytes32Set set;
        mapping(bytes32 => Fiat) fiat;
    }

    function add(Storage storage self, Fiat memory fiat) internal {
        bytes32 key = bytes32(bytes(fiat.symbol));
        self.set.add(key);
        self.fiat[key] = fiat;
    }

    function get(Storage storage self, string memory symbol) internal view returns (Fiat storage) {
        return self.fiat[bytes32(bytes(symbol))];
    }

    function list(Storage storage self) internal view returns (Fiat[] memory fiats) {
        fiats = new Fiat[](self.set.length());
        for (uint i = 0; i < fiats.length; i++) {
            bytes32 key = self.set.at(i);
            fiats[i] = self.fiat[key];
        }
    }

    function remove(Storage storage self, string memory symbol) internal {
        bytes32 key = bytes32(bytes(symbol));
        self.set.remove(key);
        delete self.fiat[key];
    }
}
