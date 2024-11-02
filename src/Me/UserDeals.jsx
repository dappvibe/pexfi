import {Link} from "react-router-dom";
import {Empty, List, Skeleton, Tag} from "antd";
import React, {useEffect, useState} from "react";
import Deal from "@/model/Deal.js";
import {useAccount} from "wagmi";
import {useContract} from "@/hooks/useContract.tsx";
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
    const { account: address} = useAccount();

    function title(deal) {
        const href = '/trade/deal/' + deal.contract.target;
        let title = deal.seller === address ? "Sell " : "Buy ";
        title += deal.tokenAmount + ' ' + deal.offer.token + " for " + deal.fiatAmount + ' ' + deal.offer.fiat + " with " + deal.offer.method;
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
    const { address } = useAccount();
    const { Market, Deal: DealContract, Offer: OfferContract } = useContract();
    const [deals, setDeals] = useState();

    useEffect(() => {
        if (address) {
            Promise.all([
                Market.queryFilter(Market.filters.DealCreated(address)), // as owner (maker)
                Market.queryFilter(Market.filters.DealCreated(null, address)), // as taker
            ]).then(([asOwner, asTaker]) => {
                const fetching = asOwner.concat(asTaker).map(log =>
                    (new Deal(DealContract.attach(log.args[3]))).fetch().then(deal => {
                        return Market.runner.getBlock(log.blockHash).then(block => {
                            deal.createdAt = block;
                            return deal;
                        })
                        .then(deal => {
                            return Offer.fetch(OfferContract.attach(deal.offer)).then(offer => {
                                deal.offer = offer;
                                return Market.token(offer.token).then(token => {
                                    deal.tokenAmount /= 10**Number(token.decimals);
                                    return deal;
                                });
                            });
                        })
                    })
                );
                Promise.all(fetching).then(setDeals);
            })
        }
    }, [address]);

    if (deals === undefined) {
        return <Skeleton active/>
    } else {
        if (deals.length === 0) return <Empty />;
        return (
        <List itemLayout={"vertical"} bordered={true}>
            {deals.reverse().map((deal, i) => {
                return (<DealItem key={i} deal={deal} />)
            })}
        </List>
        );
    }
}
