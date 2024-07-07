import {Link} from "react-router-dom";
import {List, Skeleton, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {useWalletProvider} from "../hooks/useWalletProvider";
import {MarketContract} from "@/hooks/useContract.jsx";
import {Deal} from "@/model/Deal.js";
import Offer from "@/model/Offer.js";

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

function DealItem({deal}) {
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
DealItem.propTypes = {
    deal: Deal
};

export default function UserDeals()
{
    const { account } = useWalletProvider();

    const [deals, setDeals] = useState();

    useEffect(() => {
        if (account) {
            Promise.all([
                MarketContract.queryFilter(MarketContract.filters.DealCreated(account)), // as owner (maker)
                MarketContract.queryFilter(MarketContract.filters.DealCreated(null, account)), // as taker
            ]).then(([asOwner, asTaker]) => {
                const fetching = asOwner.concat(asTaker).map(log =>
                    (new Deal(log.args[3])).fetch().then(deal => {
                        return Offer.fetch(deal.offerId).then(offer => {
                            deal.offer = offer;
                            return deal;
                        }).then(deal => {
                            return MarketContract.runner.getBlock(log.blockHash).then(block => {
                                deal.createdAt = block;
                                return deal;
                            })
                        });
                    })
                );
                Promise.all(fetching).then(setDeals);
            })
        }
    }, [account]);

    if (deals === undefined) {
        return <Skeleton active/>
    } else {
        return (
        <List itemLayout={"vertical"} bordered={true}>
            {deals.reverse().map((deal, i) => {
                return (<DealItem key={i} deal={deal} />)
            })}
        </List>
        );
    }
}
