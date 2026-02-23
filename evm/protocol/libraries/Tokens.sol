// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

error InvalidToken(bytes8 token);

library Tokens {
  struct Token {
    IERC20Metadata api;
    uint8 decimals;
    uint16 uniswapPoolFee;
  }

  struct Storage {
    bytes8[] keys;
    mapping(bytes8 => Token) values;
  }

  function add(Storage storage self, address token, uint16 uniswapPoolFee) internal {
    IERC20Metadata api = IERC20Metadata(token);
    bytes8 key = bytes8(bytes(api.symbol()));
    if (address(self.values[key].api) == address(0)) {
      self.keys.push(key);
    }
    self.values[key] = Token(api, api.decimals(), uniswapPoolFee);
  }

  function get(Storage storage self, bytes8 symbol) internal view returns (Token storage) {
    require(address(self.values[symbol].api) != address(0), InvalidToken(symbol));
    return self.values[symbol];
  }

  function list(Storage storage self) internal view returns (bytes8[] memory) {
    return self.keys;
  }

  function remove(Storage storage self, bytes8 symbol) internal {
    require(address(self.values[symbol].api) != address(0), InvalidToken(symbol));
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
