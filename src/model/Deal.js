export default class Deal {
  constructor(contract) {
    this.contract = contract
  }

  clone(overrides = {}) {
    return Object.assign(new Deal(this.contract.target), { ...this, ...overrides })
  }

  fetch() {
    return Promise.all([
      this.contract.offer(),
      this.contract.taker(),
      this.contract.tokenAmount(),
      this.contract.fiatAmount(),
      this.contract.state(),
      this.contract.paymentInstructions(),
      this.contract.allowCancelUnacceptedAfter(),
      this.contract.allowCancelUnpaidAfter(),
    ]).then(
      ([
        offer,
        taker,
        tokenAmount,
        fiatAmount,
        state,
        paymentInstructions,
        allowCancelUnacceptedAfter,
        allowCancelUnpaidAfter,
      ]) => {
        this.offer = offer
        this.taker = taker
        this.tokenAmount = Number(tokenAmount)
        this.fiatAmount = Number(fiatAmount) / 10 ** 6 // FIXME test with large input
        this.state = Number(state) // FIXME constants
        this.paymentInstructions = paymentInstructions
        this.allowCancelUnacceptedAfter = new Date(Number(allowCancelUnacceptedAfter) * 1000)
        this.allowCancelUnpaidAfter = new Date(Number(allowCancelUnpaidAfter) * 1000)
        return this
      }
    )
  }

  isParticipant(address) {
    // TODO mediator is not yet in deal contract
    return [this.taker.toLowerCase(), this.offer.owner.toLowerCase()].includes(address.toLowerCase())
  }
}
