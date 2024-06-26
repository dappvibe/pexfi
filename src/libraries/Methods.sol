// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library  Methods {
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
        EnumerableSet.Bytes32Set names;
        mapping (bytes32 => Method) details;
    }

    function add(Storage storage self, Method calldata method) internal {
        bytes32 $name = bytes32(bytes(method.name));
        if (self.names.add($name)) {
            self.details[$name] = method;
        }
    }

    function remove(Storage storage self, string memory name) internal {
        bytes32 $name = bytes32(bytes(name));
        self.names.remove($name);
        delete self.details[$name];
    }
}
