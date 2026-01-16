import { ethers } from 'ethers'

import { abi } from 'contracts/artifacts/ERC20.json'

export default class Token {
  constructor(contract) {
    this.contract = contract
  }

  fetch() {
    return Promise.all([this.contract.name(), this.contract.symbol(), this.contract.decimals()]).then(
      ([name, symbol, decimals]) => {
        this.name = name
        this.symbol = symbol
        this.decimals = Number(decimals)
        return this
      }
    )
  }

  allowance(owner) {
    return this.contract.allowance(owner, MarketContract.target)
  }

  approve() {
    return this.contract.approve(MarketContract.target, ethers.MaxUint256)
  }
}
