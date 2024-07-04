import {Await, Link, useAsyncValue, useLoaderData} from "react-router-dom";
import {List, Skeleton, Tag} from "antd";
import React from "react";
import {useWalletProvider} from "../hooks/useWalletProvider";

function StateTag(args) {
    const index = [
        'Initiated',
        'Accepted',
        'Funded',
        'Paid',
        'Disputed',
        'Canceled',
        'Resolved',
        'Completed'
    ];
    return <Tag color={args.state === 7 ? 'green' : 'blue'}>{index[args.state]}</Tag>;
}

function DealItem() {
    const deal = useAsyncValue();
    const { account } = useWalletProvider();

    function title(deal) {
        const href = '/trade/deal/' + deal.contract.target;
        let title = deal.seller === account ? "Sell " : "Buy ";
        title += deal.tokenAmount + ' ' + deal.offer.token + " for " + deal.tokenAmount + ' ' + deal.offer.fiat + " with " + deal.offer.method;
        return <Link to={href}>{title}</Link>;
    }

    function time(block) {
        return new Date(block.timestamp * 1000).toLocaleString();
    }

    return (
        <List.Item>
            <List.Item.Meta
                title={title(deal)}
                description={<><StateTag state={deal.state} />Created: {time(deal.createdAt)}</>}
            />
        </List.Item>
    );
}

export default function Deals() {
    const data = useLoaderData();
    // TODO table with client side sorting
    return (
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={data.deals}>
                {(deals) =>  (
                    <List itemLayout={"vertical"}
                        bordered={true}>
                        {deals.reverse().map((deal, i) => {
                            return (
                            <React.Suspense key={i} fallback={<Skeleton active />}>
                            <Await key={i} resolve={deal}>
                                <DealItem />
                            </Await>
                            </React.Suspense>
                            )
                        })}
                    </List>
                )}
            </Await>
        </React.Suspense>
    );
}
