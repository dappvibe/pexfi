import {useWalletProvider} from "@/hooks/useWalletProvider";
import {useEffect, useState} from "react";
import {MarketContract} from "@/hooks/useContract.jsx";
import Offer from "@/model/Offer.js";
import Offers from "@/Trade/Offers/Offers.jsx";
import {Skeleton} from "antd";

export default function UserOffers()
{
    const {account} = useWalletProvider();

    const [offers, setOffers] = useState();

    useEffect(() => {
        if (account) {
            const filter = MarketContract.filters.OfferCreated(account);
            MarketContract.queryFilter(filter).then(logs => {
                return logs.map(log => Offer.hydrate(log.args[3]));
            })
            // wrap it to meet <Offers/> expectations
            .then(offers => setOffers(Promise.resolve({offers: offers})));

        }
    }, [account]);

    if (offers === undefined)
        return (<Skeleton active />)
    else
        return (<Offers offers={offers} />);
}
