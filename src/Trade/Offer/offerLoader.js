import {defer} from "react-router-dom";
import {MarketContract} from "@/hooks/useContract.jsx";
import Offer from "@/model/Offer.js";

// TODO if returned 0 throw 404
export async function offerLoader(request) {
    const params = request.params;
    const offerId = params['offerId'];
    return defer({
        offer: Offer.fetch(offerId)
            .then((offer) => {
                return MarketContract.getPrice(offer.token, offer.fiat)
                    .then((price) => offer.setPairPrice(price))
            })
    });
}
