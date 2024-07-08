// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IChainlink.sol";

error InvalidFiat(string fiat);

library Fiats {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct Fiat {
        string symbol;
        IChainlink toUSD;
    }

    struct Storage {
        EnumerableSet.Bytes32Set keys;
        mapping(bytes32 => Fiat) values;
    }

    function add(Storage storage self, Fiat memory fiat) internal {
        bytes32 key = bytes32(bytes(fiat.symbol));
        self.keys.add(key);
        self.values[key] = fiat;
    }

    function get(Storage storage self, string memory symbol) internal view returns (Fiat storage) {
        bytes32 key = bytes32(bytes(symbol));
        require(self.keys.contains(key), InvalidFiat(symbol));
        return self.values[key];
    }

    function list(Storage storage self) internal view returns (bytes32[] memory) {
        return self.keys.values();
    }

    function remove(Storage storage self, string memory symbol) internal {
        bytes32 key = bytes32(bytes(symbol));
        self.keys.remove(key);
        delete self.values[key];
    }
}
