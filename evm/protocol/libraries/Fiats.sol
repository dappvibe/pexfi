// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import "../interfaces/IChainlink.sol";

error InvalidFiat(bytes3 fiat);

library Fiats {
  struct Fiat {
    bytes3 symbol;
    IChainlink toUSD;
  }

  struct Storage {
    bytes3[] keys;
    mapping(bytes3 => IChainlink) values;
  }

  function add(Storage storage self, Fiat calldata fiat) internal {
    if (address(self.values[fiat.symbol]) == address(0)) {
      self.keys.push(fiat.symbol);
    }
    self.values[fiat.symbol] = fiat.toUSD;
  }

  function get(Storage storage self, bytes3 symbol) internal view returns (IChainlink) {
    IChainlink feed = self.values[symbol];
    require(address(feed) != address(0), InvalidFiat(symbol));
    return feed;
  }

  function list(Storage storage self) internal view returns (bytes3[] memory) {
    return self.keys;
  }

  function remove(Storage storage self, bytes3 symbol) internal {
    require(address(self.values[symbol]) != address(0), InvalidFiat(symbol));
    uint len = self.keys.length;
    for (uint i = 0; i < len; i++) {
      if (self.keys[i] == symbol) {
        self.keys[i] = self.keys[len - 1];
        self.keys.pop();
        break;
      }
    }
    delete self.values[symbol];
  }
}
