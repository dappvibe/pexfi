import {Await, generatePath, useLoaderData, useNavigate, useOutletContext, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Input, Select, Skeleton, Space} from "antd";
import OffersTable from "@/Trade/Offers/OffersTable.jsx";

export default function Offers() {
    const {fiats, methods} = useOutletContext();
    const { offers } = useLoaderData();
    const navigate = useNavigate();
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = null
    } = useParams();

    const [activeOffers, setActiveOffers] = useState([]);
    const [filterAmount, setFilterAmount] = useState('');

    useEffect(() => {
        offers.then(({ offers }) => {
            if (filterAmount === '') {
                setActiveOffers(offers);
            } else {
                setActiveOffers(offers.filter(offer => offer.min <= filterAmount && offer.max >= filterAmount));
            }
        });
    }, [filterAmount, offers]);

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

    <React.Suspense fallback={<Skeleton active />}>
        <Await resolve={offers}>
        {({offers, price}) => (
            <OffersTable offers={activeOffers} price={price} />
        )}
        </Await>
    </React.Suspense>
    </>);
}
