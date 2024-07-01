import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider('http://localhost:8545');

import contracts from '../../contracts/deployed_addresses.json';
import { abi as InventoryAbi} from '../../contracts/artifacts/Inventory_Inventory.json';
import { abi as MarketAbi} from '../../contracts/artifacts/Market_ERC1967Proxy.json';

const Inventory = new ethers.Contract(
    contracts['Inventory#Inventory'],
    InventoryAbi,
    provider
);
const Market = new ethers.Contract(
    contracts['Market#ERC1967Proxy'],
    MarketAbi,
    provider
);

export { Inventory, Market };
