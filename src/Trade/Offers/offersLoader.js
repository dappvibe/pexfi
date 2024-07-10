import {defer} from "react-router-dom";
import Offer from "../../model/Offer.js";
import {MarketContract} from "@/hooks/useContract.jsx";

export async function offersLoader(request) {
    const params = request.params;
    const token = params['token'] || 'WBTC';
    const fiat = params['fiat'] || 'USD';
    const method = params['method'] || 'ANY';
    const side = params['side'] !== 'sell';

    return defer({ offers:
        MarketContract.getOffers(side, token, fiat, method)
        .then((offers) => {
            return Promise.all(offers.map(offer => Offer.fetch(offer)));
        }).then(offers => {
            return MarketContract.getPrice(token, fiat).then(price => {
                offers = offers.sort((a, b) => b.price - a.price);
                return {
                    offers: offers.map(offer => offer.setPairPrice(price)),
                    price: Number(price)
                };
            });
        })
    });
}
