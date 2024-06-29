import {Await, Link, useAsyncValue, useLoaderData} from "react-router-dom";
import {Avatar, Button, Form, Input, List, Skeleton} from "antd";
import React, {useState} from "react";

export default function Offers() {
    const [expandedOffer, setExpandedOffer] = useState(null);

    const { data } = useLoaderData();

    function expandOffer(offerId) {
        setExpandedOffer(offerId);
    }

    return (
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={data}>
                {({offers, price, tokens, fiats, methods}) => (
                <List
                    className={"offers-list"}
                    itemLayout={"horizontal"}
                    bordered={true}
                    dataSource={offers}
                    renderItem={offer => (
                        <List.Item
                            actions={[offer.min + ' - ' + offer.max + ' ' + offer.fiat]}
                            extra={[
                                <Button onClick={() => expandOffer(offer.id)}>{offer.isSell ? 'Sell' : 'Buy'}</Button>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar
                                    src={'https://effigy.im/a/'+offer.owner+'.svg'}
                                    draggable={false}
                                />}
                                title={offer.method}
                                description={offer.price + ' ' + fiats[offer.fiat].symbol}
                            />
                            {expandedOffer === offer.id && (
                                <Form>
                                    <Form.Item name="name" label="Crypto">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="name" label="Fiat">
                                        <Input />
                                    </Form.Item>
                                    <Button>Go</Button>
                                </Form>
                            )}
                        </List.Item>
                    )}
                >
                </List>
                )}
            </Await></React.Suspense>
    );
}
