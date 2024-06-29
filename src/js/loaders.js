import {Inventory, Market} from './contracts.js'
import {defer} from "react-router-dom";

let cache = null;
export async function inventory() {
    // TODO save values to local storage here with expiry time
    let tokens, fiats, methods;
    if (!cache) {
        [tokens, fiats, methods] = await Promise.all([
            Inventory.getTokens().then((res) => {
                let out = {};
                res.map(token => {
                    out[token[1]] =  {
                        address: token[0],
                        symbol: token[1],
                        name: token[2],
                        decimals: Number(token[3]),
                    }
                });
                return out;
            }),

            Inventory.getFiats().then((res) => {
                let out = {};
                res.map(fiat => {
                    out[fiat[0]] = {
                        symbol: fiat[0],
                    }
                });
                return out;
            }),

            await Inventory.getMethods().then(res => {
                let out = {};
                res.map(method => {
                    out[method[0]] = {
                        name: method[0],
                        group: Number(method[1]),
                    }
                });
                return out;
            })
        ]);
        cache = { tokens, fiats, methods };
    } else {
        ({ tokens, fiats, methods } = cache);
    }
    return { tokens, fiats, methods };
}

export async function offersLoader(request) {
    let { tokens, fiats, methods } = await inventory();

    const params = request.params;
    const token = tokens[params['token']] || tokens['WBTC'];
    const fiat = fiats[params['fiat']] || fiats['USD'];
    const method = params['method'] || 'ANY';
    const side = params['side'] !== 'buy';

    return defer({ data:
        Promise.all([
            Market.getOffers(side, token.symbol, fiat.symbol, method),
            Inventory.getPrice(token.symbol, fiat.symbol)
        ]).then(([offers, price]) => {
            price = Number(price / 10000n) / 100;
            offers = offers.map(offer => hydrateOffer(offer, price));
            offers = offers.sort((a, b) => b.price - a.price);
            return {
                offers: offers,
                price: price,
                tokens: tokens,
                fiats: fiats,
                methods: methods,
            };
        })
    });
}

function hydrateOffer(offer, price) {
    let rate = Number(offer[6]) / 10**4;
    return {
        id: Number(offer[0]),
        owner: offer[1],
        isSell: offer[2],
        token: offer[3],
        fiat: offer[4],
        method: offer[5],
        price: (price * rate).toFixed(3),
        rate: rate,
        min: Number(offer[7]),
        max: Number(offer[8]),
        terms: offer[9]
    };
}
