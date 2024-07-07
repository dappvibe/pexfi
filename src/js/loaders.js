import {defer} from "react-router-dom";

import { abi as DealAbi} from '../../contracts/artifacts/Deal.json';
import {ethers} from "ethers";
import Offer from "@/model/Offer.js";
import {MarketContract} from "@/hooks/useContract.jsx";

export async function userDealsLoader(request)
{
    // resolves with more promises
    return defer({
        deals: Promise.all([
            MarketContract.queryFilter(MarketContract.filters.DealCreated(request.params.address)), // as owner (maker)
            MarketContract.queryFilter(MarketContract.filters.DealCreated(null, request.params.address)), // as taker
        ]).then(([asOwner, asTaker]) => {
            return asOwner.concat(asTaker).map(log => {
                return loadDeal(log.args[3]);
            })
        })
    });
}
