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
                    return res.map(ethers.decodeBytes32String);
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

export async function userOffersLoader(request) {
    const params = request.params;

    const filter = Market.filters.OfferCreated(params.address);
    return defer({ data:
         Market.queryFilter(filter).then(logs => {
            const list = logs.map(log => {
                return hydrateOffer(log.args[3], 0); // FIXME correct price
            });
            return {
                offers: list,
                price: 0
            };
        }).catch((e) => {
            console.error(e);
        }),
    });
}

export async function userDealsLoader(request)
{
    // resolves with more promises
    return defer({
        deals: Promise.all([
            Market.queryFilter(Market.filters.DealCreated(request.params.address)), // as owner (maker)
            Market.queryFilter(Market.filters.DealCreated(null, request.params.address)), // as taker
        ]).then(([asOwner, asTaker]) => {
            return asOwner.concat(asTaker).map(log => {
                return loadDeal(log.args[3]);
            })
        })
    });
}

// TODO if returned 0 throw 404
export async function offerLoader(request) {
    const params = request.params;
    const offerId = params['offerId'];
    return defer({ offer: Promise.all([
        Market.getOffer(offerId),
        Inventory.getPrice(params['token'], params['fiat'])
    ]).then(([offer, price]) => {
        price = Number(price / 10000n) / 100;
        return hydrateOffer(offer, price);
    })});
}

function loadDeal(address) {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const dealContract = new ethers.Contract(
        address,
        DealAbi,
        provider
    )
    return Promise.all([
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
        dealContract.allowCancelUnacceptedAfter(),
        dealContract.queryFilter('*').then(logs => {
            return provider.getBlock(logs[logs.length - 1].blockHash);
        })
    ]).then(([offer,
           buyer,
           seller,
           mediator,
           token,
           tokenAmount,
           fiatAmount,
           state,
           paymentInstructions,
           allowCancelUnacceptedAfter,
           createdAt
       ]) => {
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
            allowCancelUnacceptedAfter: Number(allowCancelUnacceptedAfter),
            createdAt: createdAt
        };
    }).then(deal => {
        deal.contract = dealContract;
        const token = new ethers.Contract(
            deal.token,
            ['function decimals() view returns (int8)'],
            dealContract.runner
        );
        return token.decimals().then(decimals => {
            deal.tokenAmount = deal.tokenAmount / 10**Number(decimals);
            return deal;
        });
    })
}

export async function dealLoader(request) {
    const params = request.params;
    const dealId = params['dealId'];
    const dealContract = new ethers.Contract(
        dealId,
        DealAbi,
        new ethers.JsonRpcProvider('http://localhost:8545')
    );
    return defer({
        contract: dealContract,
        deal: loadDeal(dealId),
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
