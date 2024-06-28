import {useLoaderData} from "react-router-dom";
import {Table} from "antd";
import React from "react";

export default function Offers() {
    const { tokens, fiats, methods, offers } = useLoaderData();

    const tableRows = [];
    offers.forEach((offer) => {
        tableRows.push({
            key: offer.id,
            price: offer.price,
            min: offer.min,
            max: offer.max
        });
    });

    const columns = [
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Min',
            dataIndex: 'min',
            key: 'min',
        },
        {
            title: 'Max',
            dataIndex: 'max',
            key: 'max',
        },
    ];

    return (
        <Table dataSource={tableRows} columns={columns} />
    );
}
