
export default class Offer
{
    static fetch (contract) {
        const self = new Offer();
        self.contract = contract;
        self.address = contract.target;
        return Promise.all([
            self.contract.owner(),
            self.contract.isSell(),
            self.contract.token(),
            self.contract.fiat(),
            self.contract.method(),
            self.contract.rate(),
            self.contract.limits(),
            self.contract.terms(),
        ]).then(([owner, isSell, token, fiat, method, rate, limits, terms]) => {
            self.owner = owner;
            self.isSell = isSell;
            self.token = token;
            self.fiat = fiat;
            self.method = method;
            self.rate = Number(rate) / 10**4;
            self.min = Number(limits[0]);
            self.max = Number(limits[1]);
            self.terms = terms;
            return self;
        });
    }

    /**
     * @param response Response from the contract
     */
    static hydrate(response) {
        const self = new Offer();
        self.id     = Number(response[0]);
        self.owner  = response[1];
        self.isSell = response[2];
        self.token  = response[3];
        self.fiat   = response[4];
        self.method = response[5];
        self.rate   = Number(response[6]) / 10**4;
        self.min    = Number(response[7]);
        self.max    = Number(response[8]);
        self.terms  = response[9];
        return self;
    }

    /**
     * @param marketPrice BigInt from Market contract
     */
    setPairPrice = (marketPrice) => {
        const price = Number(marketPrice / 10000n) / 100;
        this.price = (price * this.rate).toFixed(3);
        return this;
    }
}
