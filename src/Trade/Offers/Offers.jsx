import {Await, generatePath, useNavigate, useOutletContext, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Input, Select, Skeleton, Space} from "antd";
import OffersTable from "@/Trade/Offers/OffersTable.jsx";
import {useContract} from "@/hooks/useContract.jsx";
import Offer from "@/model/Offer.js";
import {useChainId} from "wagmi";

export default function Offers({offers: argOffers}) {
    const chainId = useChainId();
    const {fiats, methods} = useOutletContext();
    const navigate = useNavigate();
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = null
    } = useParams();
    const { Market, Offer: OfferContract } = useContract();

    const [offers, setOffers] = useState([]);
    const [allOffers, setAllOffers] = useState(argOffers);
    const [filterAmount, setFilterAmount] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (argOffers) {
            setAllOffers(argOffers);
        } else {
            let price;
            setLoading(true);
            Promise.all([
                Market.getOffers(side === 'sell', token, fiat, method || 'ANY'),
                Market.getPrice(token, fiat)
            ])
            .then(([offers, p]) => {
                price = p;
                return Promise.all(offers.map(offer =>
                    Offer.fetch(OfferContract.attach(offer))));
            })
            .then((offers) => {
                offers = offers.map(offer => offer.setPairPrice(price))
                offers = offers.sort((a, b) => b.price - a.price);
                return offers;
            })
            .then(setAllOffers)
            .then(() => setLoading(false));
        }
    }, [chainId, side, token, fiat, method]);

    useEffect(() => {
        if (allOffers) {
            if (filterAmount === '') {
                setOffers(allOffers);
            } else {
                setOffers(allOffers.filter(offer => offer.min <= filterAmount && offer.max >= filterAmount));
            }
        }
    }, [filterAmount, allOffers]);

    return (<>
    <Space style={{margin: '10px 0 0 10px'}}>
        <Await resolve={fiats}>
            {(fiats) => (
            <Input placeholder={"Amount"}
                   style={{maxWidth: 200}}
                   allowClear
                   onChange={(e) => setFilterAmount(e.target.value)}
                   addonAfter={(
                       <Select placeholder="Search to Select"
                               showSearch
                               options={fiats.map(fiat => ({value: fiat}))}
                               defaultValue={fiat}
                               onChange={(fiat) => navigate(
                                   generatePath('/trade/:side/:token/:fiat/:method?', {side, token, fiat, method}))}
                       />
                   )}
            />
            )}
        </Await>
        <Await resolve={methods}>
            {(methods) => (
            <Select placeholder="Payment method"
                style={{width: 200}}
                allowClear
                showSearch
                defaultValue={method}
                options={Object.keys(methods).map(method => ({value: method}))}
                onChange={(method) => navigate(
                    generatePath('/trade/:side/:token/:fiat/:method?', {side, token, fiat, method}))}
            />
            )}
        </Await>
    </Space>
    {loading ? <Skeleton active /> : <OffersTable offers={offers} />}
    </>);
}
