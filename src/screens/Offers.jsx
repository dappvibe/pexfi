import {Link, useLoaderData} from "react-router-dom";
import {Avatar, Button, List } from "antd";
import React from "react";

export default function Offers() {
    const { tokens, fiats, methods, offers } = useLoaderData();

    return (
        <List
            className={"offers-list"}
            itemLayout={"horizontal"}
            bordered={true}
            dataSource={offers}
            renderItem={offer => (
                <List.Item
                    actions={[<Button>{offer.isSell ? 'Sell' : 'Buy'}</Button>]}
                >
                    <List.Item.Meta
                        avatar={<Avatar
                            src={'https://effigy.im/a/'+offer.owner+'.svg'}
                            draggable={false}
                        />}
                        title={offer.method}
                        description={offer.min + ' - ' + offer.max + ' ' + tokens[offer.token].symbol}
                    />
                    <div>{offer.price + ' ' + fiats[offer.fiat].symbol}</div>
                </List.Item>
            )}
        >
        </List>
    );
}
