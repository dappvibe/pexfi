// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";

/**
 * @title Provides addresses of the live contracts implementing certain interfaces.
 * @dev Upgradeable version of UMA's Finder.
 */
abstract contract Finder is FinderInterface, OwnableUpgradeable {
    mapping(bytes32 => address) public interfacesImplemented;

    event InterfaceImplementationChanged(bytes32 indexed interfaceName, address indexed newImplementationAddress);

    /**
     * @notice Updates the address of the contract that implements `interfaceName`.
     * @param interfaceName bytes32 of the interface name that is either changed or registered.
     * @param implementationAddress address of the implementation contract.
     */
    function changeImplementationAddress(bytes32 interfaceName, address implementationAddress)
        external
        virtual
        override
        onlyOwner
    {
        interfacesImplemented[interfaceName] = implementationAddress;

        emit InterfaceImplementationChanged(interfaceName, implementationAddress);
    }

    /**
     * @notice Gets the address of the contract that implements the given `interfaceName`.
     * @param interfaceName queried interface.
     * @return implementationAddress address of the defined interface.
     */
    function getImplementationAddress(bytes32 interfaceName) external view virtual override returns (address) {
        address implementationAddress = interfacesImplemented[interfaceName];
        require(implementationAddress != address(0x0), "Implementation not found");
        return implementationAddress;
    }
}
