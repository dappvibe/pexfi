import {Await, Link, useAsyncValue, useLoaderData} from "react-router-dom";
import {Avatar, Button, Form, Input, List, Select, Skeleton, Space} from "antd";
import React, {useState} from "react";

export default function Offers() {
    const [expandedOffer, setExpandedOffer] = useState(null);

    const { data } = useLoaderData();

    function expandOffer(offerId) {
        setExpandedOffer(offerId);
    }

    function title(offer) {
        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: offer.fiat,
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        });

        return [
            formatter.format(offer.price),
            offer.method,
            `[${offer.min} - ${offer.max}]`,
        ].join(' / ');
    }

    return (
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={data}>
                {({offers, price}) => (
                <List
                    className={"offers-list"}
                    itemLayout={"horizontal"}
                    bordered={true}
                    dataSource={offers}
                    renderItem={offer => (
                        <List.Item
                            actions={[
                                expandedOffer === offer.id && (
                                    <>
                                        <Space.Compact>
                                            <Select defaultValue={offer.fiat}>
                                                <Select.Option value="fiat">{offer.fiat}</Select.Option>
                                                <Select.Option value="token">{offer.token}</Select.Option>
                                            </Select>
                                            <Input style={{maxWidth: 80}} placeholder={"Amount"}/>
                                            <Button>
                                                {offer.isSell ? 'Sell' : 'Buy'}
                                            </Button>
                                        </Space.Compact>
                                    </>
                                ) || (
                                    <Button key={offer.id} onClick={() => expandOffer(offer.id)}>
                                        {offer.isSell ? 'Sell' : 'Buy'}
                                    </Button>
                                )
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar
                                    src={'https://effigy.im/a/'+offer.owner+'.svg'}
                                    draggable={false}
                                />}
                                title={title(offer)}
                                description={"lorem ipsum dolor sit amet"}
                            />
                        </List.Item>
                        )
                    }
                >
                </List>
                )}
            </Await></React.Suspense>
    );
}
