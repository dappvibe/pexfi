pragma solidity ^0.8.0;

import "../enums/countries.sol";

contract PaymentMethodOracle
{
    struct Method {
        string name;
        //Country[] onlyCountries; // GLOBAL if empty
    }

    mapping(uint16 => Method) public methodsAvailable;
}
