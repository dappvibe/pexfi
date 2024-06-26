// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";

library Methods {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    enum Group {
        Other,  // undefined
        Crypto, // other chains, mediation can be automated
        Cash,   // anonymous cash delivery to ATM or otherwise
        Bank    // any regulated KYC'ed transfer entity
    }
    struct Method {
        string name;
        Group group;
        //Country country;
    }

    struct Storage {
        EnumerableSet.Bytes32Set keys;
        mapping (bytes32 => Method) values;
    }

    function add(Storage storage self, Method calldata method) internal {
        bytes32 $name = bytes32(bytes(method.name));
        if (self.keys.add($name)) {
            self.values[$name] = method;
        }
    }

    function get(Storage storage self, string memory name) internal view returns (Method memory) {
        return self.values[bytes32(bytes(name))];
    }

    function list(Storage storage self) internal view returns (Method[] memory) {
        Method[] memory result = new Method[](self.keys.length());
        for (uint i = 0; i < self.keys.length(); i++) {
            result[i] = self.values[self.keys.at(i)];
        }
        return result;
    }

    function has(Storage storage self, string memory name) internal view returns (bool) {
        return self.keys.contains(bytes32(bytes(name)));
    }

    function remove(Storage storage self, string memory name) internal {
        bytes32 $name = bytes32(bytes(name));
        self.keys.remove($name);
        delete self.values[$name];
    }
}
