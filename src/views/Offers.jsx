import {Await, Link, useLoaderData} from "react-router-dom";
import {Avatar, List, Skeleton, Tag} from "antd";
import React from "react";

export default function Offers() {
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
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={data}>
                {({offers, price}) => (
                <List
                    className={"offers-list"}
                    itemLayout={"vertical"}
                    bordered={true}
                    dataSource={offers}
                    renderItem={offer => (
                        <List.Item
                            /*extra={[
                                <Button key={offer.id} onClick={() => modal.open(offer.id, price)}>
                                    {offer.isSell ? 'Sell' : 'Buy'}
                                </Button>
                            ]}*/
                        >
                            <List.Item.Meta
                                avatar={<Avatar
                                    src={'https://effigy.im/a/'+offer.owner+'.svg'}
                                    draggable={false}
                                />}
                                title={<Link to={`/trade/sell/${offer.token}/${offer.fiat}/${offer.method}/${offer.id}`}>
                                    <div>{title(offer)}</div>
                                </Link>}
                                description={<><Tag>{offer.method}</Tag>Limits: {offer.min} - {offer.max}</>}
                            />
                            {"lorem ipsum dolor sit amet"}
                        </List.Item>
                    )}
                >
                </List>
            )}
            </Await>
        </React.Suspense>
    );
}
