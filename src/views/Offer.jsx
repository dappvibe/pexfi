import {Await, Link, useAsyncValue, useLoaderData} from "react-router-dom";
import {Avatar, Breadcrumb, Button, Descriptions, Form, Input, List, Modal, Select, Skeleton, Space, Tag} from "antd";
import React, {useState} from "react";

export default function Offer() {
    const { data } = useLoaderData();

    function title(offer) {
        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: offer.fiat,
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        });

        return formatter.format(offer.price);
    }

    return (
        <>
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={data}>
                {(offer) => (
                <>
                <Breadcrumb items={[
                    {title: <Link to={`/trade/sell/${offer.token}/${offer.fiat}/${offer.method}`}>Back to offers</Link>}
                ]} />
                <Descriptions title={`Offer to ${offer.isSell ? 'Sell' : 'Buy'} ${offer.token} for ${offer.fiat}`}
                    items={[
                        {label: 'Owner', children: <a href={`https://arbiscan.io/address/${offer.owner}`} target={"_blank"}>{offer.owner}</a>},
                        {label: 'Token', children: offer.token},
                        {label: 'Fiat', children: offer.fiat},
                        {label: 'Price', children: offer.price},
                        {label: 'Limits', children: `${offer.min} - ${offer.max}`},
                        {label: 'Method', children: offer.method},
                        {label: 'Terms', children: offer.terms},
                    ]}
                />
                <Form>
                    <Input placeholder={"Crypto Amount"}/>
                    <Input placeholder={"Fiat Amount"}/>
                    <Input type={"textarea"} placeholder={"Payment instructions"}/>
                    <Button type={"primary"}>Submit</Button>
                </Form>
                </>
                )}
            </Await>
        </React.Suspense>
        </>
    );
}
