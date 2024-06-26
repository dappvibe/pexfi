// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library Tokens {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct Token {
        IERC20Metadata api;
        string symbol;
        string name;
        uint8 decimals;
        // TODO uniswapPoolFee
    }

    struct Storage {
        EnumerableSet.Bytes32Set keys;
        mapping(bytes32 => Token) values;
    }

    function add(Storage storage self, address token) internal {
        IERC20Metadata api = IERC20Metadata(token);
        string memory symbol = api.symbol();
        bytes32 symbol32 = bytes32(bytes(symbol));
        self.keys.add(symbol32);
        self.values[symbol32] = Token(api, symbol, api.name(), api.decimals());
    }

    function get(Storage storage self, string memory symbol) internal view returns (Token storage) {
        return self.values[bytes32(bytes(symbol))];
    }

    function list(Storage storage self) internal view returns (Token[] memory tokens) {
        tokens = new Token[](self.keys.length());
        for (uint i = 0; i < tokens.length; i++) {
            tokens[i] = self.values[self.keys.at(i)];
        }
    }

    function remove(Storage storage self, string memory symbol) internal {
        bytes32 $symbol = bytes32(bytes(symbol));
        self.keys.remove($symbol);
        delete self.values[$symbol];
    }
}
