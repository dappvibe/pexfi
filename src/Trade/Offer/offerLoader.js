import {defer} from "react-router-dom";
import {InventoryContract, MarketContract} from "@/hooks/useContract.jsx";
import Offer from "@/model/Offer.js";

// TODO if returned 0 throw 404
export async function offerLoader(request) {
    const params = request.params;
    const offerId = params['offerId'];
    return defer({
        offer: MarketContract.getOffer(offerId)
            .then((offer) => Offer.hydrate(offer))
            .then((offer) => {
                return InventoryContract.getPrice(offer.token, offer.fiat)
                    .then((price) => offer.setPairPrice(price))
            })
    });
}
