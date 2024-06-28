import {Inventory, Market} from './contracts.js'

export async function inventory() {
    let tokens = await Inventory.getTokens().then((res) => {
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
    });

    let fiats = await Inventory.getFiats().then((res) => {
        let out = {};
        res.map(fiat => {
            out[fiat[0]] = {
                symbol: fiat[0],
            }
        });
        return out;
    });

    let methods = await Inventory.getMethods().then(res => {
        let out = {};
        res.map(method => {
            out[method[0]] = {
                name: method[0],
                group: Number(method[1]),
            }
        });
        return out;
    });

    return {
        tokens: tokens,
        fiats: fiats,
        methods: methods,
    };
}

export async function offersLoader(request) {
    const { tokens, fiats, methods } = await inventory();

    const params = request.params;
    const token = tokens[params['token']] || tokens['WBTC'];
    const fiat = fiats[params['fiat']] || fiats['USD'];
    const method = params['method'] || 'ANY';

    let side = params['side'] !== 'buy';

    let offers = await Market.getOffers(side, token.symbol, fiat.symbol, method);
    let price = await Inventory.getPrice(token.symbol, fiat.symbol);
    price = price / BigInt(Math.pow(10, token.decimals));
    offers = offers.map(offer => hydrateOffer(offer, price));
    return {
        tokens: tokens,
        fiats: fiats,
        methods: methods,
        offers: offers,
    };
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
        price: price,
        rate: rate,
        min: Number(offer[7]),
        max: Number(offer[8]),
        terms: offer[9]
    };
}
