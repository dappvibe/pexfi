// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

error InvalidToken(string token);

library Tokens {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct Token {
        IERC20Metadata api;
        string symbol;
        string name;
        uint8 decimals;
        uint16 uniswapPoolFee;
    }

    struct Storage {
        EnumerableSet.Bytes32Set keys;
        mapping(bytes32 => Token) values;
    }

    function add(Storage storage self, address token, uint16 uniswapPoolFee) internal {
        IERC20Metadata api = IERC20Metadata(token);
        string memory symbol = api.symbol();
        bytes32 key = bytes32(bytes(symbol));
        self.keys.add(key);
        self.values[key] = Token(api, symbol, api.name(), api.decimals(), uniswapPoolFee);
    }

    function get(Storage storage self, string memory symbol) internal view returns (Token storage) {
        bytes32 key = bytes32(bytes(symbol));
        require(self.keys.contains(key), InvalidToken(symbol));
        return self.values[key];
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
