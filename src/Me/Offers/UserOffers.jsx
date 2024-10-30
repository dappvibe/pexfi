import {useWalletProvider} from "@/hooks/useWalletProvider";
import {useEffect, useState} from "react";
import Offer from "@/model/Offer.js";
import Offers from "@/pages/Trade/Offers/Offers";
import {Skeleton} from "antd";
import {useAccount} from "wagmi";
import {useContract} from "@/hooks/useContract.jsx";

export default function UserOffers()
{
    const {address} = useAccount();
    const {Market, Offer: OfferContract} = useContract();

    const [offers, setOffers] = useState();

    useEffect(() => {
        if (address) {
            const filter = Market.filters.OfferCreated(address);
            Market.queryFilter(filter).then(logs => {
                return Promise.all(logs.map(log => Offer.fetch(OfferContract.attach(log.args[3]))));
            })
            .then(offers => {
                return Promise.all(offers.map(offer => {
                    return Market.getPrice(offer.token, offer.fiat).then(price => offer.setPairPrice(price));
                }));
            })
            .then(setOffers);
        }
    }, [address]);

    if (offers === undefined)
        return (<Skeleton active />)
    else
        return (<Offers offers={offers} />);
}
