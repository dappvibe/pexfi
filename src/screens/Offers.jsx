import {Link, useLoaderData} from "react-router-dom";
import {Avatar, Button, Form, Input, List} from "antd";
import React, {useState} from "react";

export default function Offers() {
    const { tokens, fiats, methods, offers } = useLoaderData();
    const [expandedOffer, setExpandedOffer] = useState(null);

    function expandOffer(offerId) {
        setExpandedOffer(offerId);
    }

    return (
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
    );
}
