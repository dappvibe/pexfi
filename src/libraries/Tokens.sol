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
    }

    struct Storage {
        EnumerableSet.Bytes32Set set;
        mapping(bytes32 => Token) metadata;
    }

    function add(Storage storage self, address token) internal {
        IERC20Metadata api = IERC20Metadata(token);
        string memory symbol = api.symbol();
        bytes32 symbol32 = bytes32(bytes(symbol));
        self.set.add(symbol32);
        self.metadata[symbol32] = Token(api, symbol, api.name(), api.decimals());
    }

    function get(Storage storage self, string memory symbol) internal view returns (Token storage) {
        return self.metadata[bytes32(bytes(symbol))];
    }

    function list(Storage storage self) internal view returns (Token[] memory) {
        uint length = self.set.length();
        Token[] memory result = new Token[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = self.metadata[self.set.at(i)];
        }
        return result;
    }

    function remove(Storage storage self, string memory symbol) internal {
        bytes32 $symbol = bytes32(bytes(symbol));
        self.set.remove($symbol);
        delete self.metadata[$symbol];
    }
}
