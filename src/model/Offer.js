export default class Offer {
  static async fetch(contract) {
    const self = new Offer()
    self.contract = contract
    self.address = contract.target
    try {
      const [owner, isSell, token, fiat, methods, rate, limits, terms, disabled] = await Promise.all([
        self.contract.owner(),
        self.contract.isSell(),
        self.contract.token(),
        self.contract.fiat(),
        self.contract.methods(),
        self.contract.rate(),
        self.contract.limits(),
        self.contract.terms(),
        self.contract.disabled(),
      ])
      self.owner = owner
      self.isSell = isSell
      self.token = token
      self.fiat = fiat
      self.method = methods // keep singular for compatibility with other parts of app
      self.rate = Number(rate) / 10 ** 4
      self.min = Number(limits[0])
      self.max = Number(limits[1])
      self.terms = terms
      self.disabled = disabled
      return self
    } catch (e) {
      throw e
    }
  }

  /**
   * @param response Response from the contract
   */
  static from(response) {
    const self = new Offer()
    self.owner = response.owner
    self.isSell = response.isSell
    self.token = response.token
    self.fiat = response.fiat
    self.method = response.method
    self.rate = response.rate
    self.min = response.min
    self.max = response.max
    self.terms = response.terms
    self.disabled = response.disabled
    return self
  }

  /**
   * @param marketPrice BigInt from Market contract
   */
  setPairPrice = (marketPrice) => {
    const price = Number(marketPrice / 10000n) / 100
    this.price = (price * this.rate).toFixed(3)
    return this
  }
}
