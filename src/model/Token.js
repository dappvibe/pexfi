import {ethers} from "ethers";
import {MarketContract, provider} from "@/hooks/useContract.jsx";

import { abi } from '../../contracts/artifacts/ERC20.json';

export class Token {
    constructor(address) {
        this.contract = new ethers.Contract(address, abi, provider);
    }

    fetch() {
        return Promise.all([
            this.contract.name(),
            this.contract.symbol(),
            this.contract.decimals(),
        ])
        .then(([name, symbol, decimals]) => {
            this.name = name;
            this.symbol = symbol;
            this.decimals = Number(decimals);
            return this;
        });
    }

    allowance(owner) {
        return this.contract.allowance(owner, MarketContract.target)
    }

    approve() {
        return this.contract.approve(MarketContract.target, ethers.MaxUint256);
    }
}
