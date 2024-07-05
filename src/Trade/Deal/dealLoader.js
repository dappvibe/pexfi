import {defer} from "react-router-dom";

import {DealContract, MarketContract} from "@/hooks/useContract.jsx";
import Offer from "@/model/Offer.js";
import {Deal} from "@/model/Deal.js";

export async function dealLoader(request) {
    const contract = DealContract.attach(request.params.dealId);
    return defer({
        deal: Promise.all([
            (new Deal(contract.target).fetch()),
            contract.queryFilter('*'),
            contract.offerId().then(MarketContract.getOffer).then(Offer.hydrate)
        ]).then(([deal, logs, offer]) => {
            deal.logs = logs;
            deal.offer = offer;
            return deal;
        })
    });
}
