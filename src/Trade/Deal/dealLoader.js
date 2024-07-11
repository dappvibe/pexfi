import {defer} from "react-router-dom";

import {Deal} from "@/model/Deal.js";

export async function dealLoader(request) {
    const dealContract = DealContract.attach(request.params.dealId);
    return defer({
        deal: Promise.all([
            (new Deal(dealContract.target).fetch()),
            dealContract.queryFilter('*'),
        ]).then(([deal, logs]) => {
            deal.logs = logs;
            return deal;
        })
    });
}
