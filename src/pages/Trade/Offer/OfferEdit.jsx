import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Offer from "@/model/Offer.js";
import {useContract} from "@/hooks/useContract.jsx";
import {useAccount, useChainId} from "wagmi";
import {Skeleton} from "antd";
import OfferForm from "@/pages/Trade/Offer/OfferForm.jsx";

export default function OfferEdit()
{
    const { offerId } = useParams();
    const chainId = useChainId();
    const account = useAccount();
    const { Market, Offer: OfferContract, Token, DealFactory, signed } = useContract();
    const [offer, setOffer] = useState();

    useEffect(() => {
        Offer.fetch(OfferContract.attach(offerId))
            .then(setOffer);
    }, [chainId, account?.address]);

    if (!offer) return <Skeleton active />;

    return <OfferForm offer={offer} />;
}
