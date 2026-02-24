// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IMarket} from "../interfaces/IMarket.sol";

library Methods {
  enum Group {
    Other,
    Crypto,
    Cash,
    Bank
  }

  struct Method {
    bool exists;
    Group group;
  }

  struct Storage {
    bytes16[] keys;
    mapping(bytes16 => Method) values;
  }

  function add(Storage storage self, bytes16 name, Group group) internal {
    if (!self.values[name].exists) {
      self.keys.push(name);
    }
    self.values[name] = Method(true, group);
  }

  function get(Storage storage self, bytes16 name) internal view returns (Method memory) {
    require(self.values[name].exists, IMarket.InvalidMethod(name));
    return self.values[name];
  }

  function list(Storage storage self) internal view returns (bytes16[] memory) {
    return self.keys;
  }

  function has(Storage storage self, bytes16 name) internal view returns (bool) {
    return self.values[name].exists;
  }

  function remove(Storage storage self, bytes16 name) internal {
    require(self.values[name].exists, IMarket.InvalidMethod(name));
    uint len = self.keys.length;
    for (uint i = 0; i < len; i++) {
      if (self.keys[i] == name) {
        self.keys[i] = self.keys[len - 1];
        self.keys.pop();
        break;
      }
    }
    delete self.values[name];
  }
}
