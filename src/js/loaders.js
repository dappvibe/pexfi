import {Inventory, Market} from './contracts.js'
import {defer} from "react-router-dom";

import { abi as DealAbi} from '../../contracts/artifacts/Deal.json';
import {ethers} from "ethers";

let cache = null;
export function inventory() {
    if (!cache) {
        return defer({
            inventory: Promise.all([
                Inventory.getTokens().then((res) => {
                    let out = {};
                    res.map(token => {
                        out[token[1]] = {
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

                Inventory.getMethods().then(res => {
                    let out = {};
                    res.map(method => {
                        out[method[0]] = {
                            name: method[0],
                            group: Number(method[1]),
                        }
                    });
                    return out;
                }),
            ]).then(([tokens, fiats, methods]) => {
                return cache = [tokens, fiats, methods];
            })
        });
    }
    else {
        return defer({inventory: cache});
    }
}

export async function offersLoader(request) {
    const params = request.params;
    const token = params['token'] || 'WBTC';
    const fiat = params['fiat'] || 'USD';
    const method = params['method'] || 'ANY';
    const side = params['side'] !== 'buy';

    return defer({ data:
        Promise.all([
            Market.getOffers(side, token, fiat, method),
            Inventory.getPrice(token, fiat)
        ]).then(([offers, price]) => {
            price = Number(price / 10000n) / 100;
            offers = offers.map(offer => hydrateOffer(offer, price));
            offers = offers.sort((a, b) => b.price - a.price);
            return {
                offers: offers,
                price: price,
            };
        })
    });
}

export async function offerLoader(request) {
    const params = request.params;
    const offerId = params['offerId'];
    return defer({ data: Promise.all([
        Market.getOffer(offerId),
        Inventory.getPrice(params['token'], params['fiat'])
    ]).then(([offer, price]) => {
        price = Number(price / 10000n) / 100;
        return hydrateOffer(offer, price);
    })});
}

export async function dealLoader(request) {
    const params = request.params;
    const dealId = params['dealId'];
    const dealContract = new ethers.Contract(
        dealId,
        DealAbi,
        new ethers.BrowserProvider(window.ethereum)
    );
    return defer({
        contract: dealContract,
        deal: Promise.all([
            dealContract.offerId().then(id => {
                return Market.getOffer(id).then(offer => {
                    return hydrateOffer(offer, 0); // FIXME correct price
                });
            }),
            dealContract.buyer(),
            dealContract.seller(),
            dealContract.mediator(),
            dealContract.token(),
            dealContract.tokenAmount(),
            dealContract.fiatAmount(),
            dealContract.state(),
            dealContract.paymentInstructions(),
            dealContract.allowCancelUnacceptedAfter()
        ]).then(([offer, buyer, seller, mediator, token, tokenAmount, fiatAmount, state, paymentInstructions, allowCancelUnacceptedAfter]) => {
            return {
                offer: offer,
                buyer: buyer,
                seller: seller,
                mediator: mediator,
                token: token,
                tokenAmount: Number(tokenAmount),
                fiatAmount: Number(fiatAmount) / 10**6,
                state: Number(state),
                paymentInstructions: paymentInstructions,
                allowCancelUnacceptedAfter: Number(allowCancelUnacceptedAfter)
            };
        }).then(deal => {
            const token = new ethers.Contract(
                deal.token,
                ['function decimals() view returns (int8)'],
                dealContract.runner
            );
            return token.decimals().then(decimals => {
                deal.tokenAmount = deal.tokenAmount / 10**Number(decimals);
                return deal;
            });
        }),
        logs: dealContract.queryFilter('Message'),
    });
}

export function hydrateOffer(offer, price) {
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
