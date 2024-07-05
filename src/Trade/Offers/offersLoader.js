import {defer} from "react-router-dom";
import Offer from "../../model/Offer.js";
import {InventoryContract, MarketContract} from "@/hooks/useContract.jsx";

export async function offersLoader(request) {
    const params = request.params;
    const token = params['token'] || 'WBTC';
    const fiat = params['fiat'] || 'USD';
    const method = params['method'] || 'ANY';
    const side = params['side'] !== 'sell';

    return defer({ offers:
        Promise.all([
            MarketContract.getOffers(side, token, fiat, method),
            InventoryContract.getPrice(token, fiat)
        ]).then(([offers, price]) => {
            offers = offers.map(offer => Offer.hydrate(offer).setPairPrice(price));
            offers = offers.sort((a, b) => b.price - a.price);
            return {
                offers: offers,
                price: Number(price),
            };
        })
    });
}
