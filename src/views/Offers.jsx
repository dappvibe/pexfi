import {Await, generatePath, Link, useAsyncValue, useLoaderData} from "react-router-dom";
import {Avatar, Button, Descriptions, Form, Input, List, Modal, Select, Skeleton, Space, Tag} from "antd";
import React, {useState} from "react";
import {Market} from "../js/contracts.js";
import {hydrateOffer} from "../js/loaders.js"

export default function Offers() {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalOffer, setModalOffer] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { data } = useLoaderData();

    const modal = {
        open: function (offerId, marketPrice) {
            setModalOpen(true);
            Market.getOffer(offerId).then(offer => {
                console.log(offer);
                return hydrateOffer(offer, marketPrice);
            });
        },

        cancel: () => {
            setModalOpen(false);
            setModalOffer(null);
        },

        ok: () => {
            setModalOffer('The modal will be closed after two seconds');
            setConfirmLoading(true);
            setTimeout(() => {
                setFormOpen(false);
                setConfirmLoading(false);
            }, 2000);
        }
    }

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
