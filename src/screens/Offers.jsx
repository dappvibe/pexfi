import {useLoaderData} from "react-router-dom";
import {Table} from "antd";
import React from "react";

export default function Offers() {
    const { tokens, fiats, methods, offers } = useLoaderData();

    const tableRows = [];
    offers.forEach((offer) => {
        tableRows.push({
            key: offer.id,
            owner: offer.owner,
            price: offer.price + ' ' + fiats[offer.fiat].symbol,
            limits: offer.min + ' - ' + offer.max,
            button: '<button>Trade</button>'
        });
    });

    const columns = [
        {
            title: 'User',
            dataIndex: 'owner',
            key: 'owner',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Limits',
            dataIndex: 'limits',
            key: 'limits',
        },
        {
            title: '',
            dataIndex: 'button',
            key: 'button',
        },
    ];

    return (
        <Table dataSource={tableRows} columns={columns} />
    );
}
