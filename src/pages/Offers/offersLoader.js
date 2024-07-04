import {defer} from "react-router-dom";
import {Inventory, Market} from "../../js/contracts.js";
import Offer from "../../model/Offer.js";

export async function offersLoader(request) {
    const params = request.params;
    const token = params['token'] || 'WBTC';
    const fiat = params['fiat'] || 'USD';
    const method = params['method'] || 'ANY';
    const side = params['side'] !== 'buy';

    return defer({ offers:
        Promise.all([
            Market.getOffers(side, token, fiat, method),
            Inventory.getPrice(token, fiat)
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
