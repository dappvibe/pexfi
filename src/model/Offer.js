import {InventoryContract, MarketContract} from "@/hooks/useContract.jsx";

export default class Offer
{
    static fetch (id) {
        return MarketContract.getOffer(id)
            .then((offer) => Offer.hydrate(offer))
            .then((offer) => {
                return InventoryContract.getPrice(offer.token, offer.fiat)
                    .then((price) => offer.setPairPrice(price))
            })
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
     * @param marketPrice BigInt from Inventory contract
     */
    setPairPrice = (marketPrice) => {
        const price = Number(marketPrice / 10000n) / 100;
        this.price = (price * this.rate).toFixed(3);
        return this;
    }
}
