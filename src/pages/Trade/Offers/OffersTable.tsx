import {Avatar, Button, Divider, Flex, Space, Table, Tag} from "antd";
import {Link, useParams} from "react-router-dom";
import PropTypes from "prop-types";
import Username from "@/components/Username";
import {formatMoney} from "@/utils.js";
import {useAccount} from "wagmi";

export default function OffersTable({offers, loading, loadMore, totalOffers})
{
    const { address } = useAccount();
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = null
    } = useParams();

    const columns = [
        {
            title: '',
            width: 0,
            render: (_, offer) => {
                if (address && offer.owner.toLowerCase() === address.toLowerCase()) {
                    return (
                        <Space>
                            <Link to={`/trade/offer/edit/${offer.id}`}>
                                <Button type="primary">Edit</Button>
                            </Link>
                        </Space>
                    );
                } else {
                    return (
                        <Space size={"middle"}>
                            <Link to={`/trade/offer/${offer.id}`}>
                                <Button>{offer.isSell ? 'Buy' : 'Sell'}</Button>
                            </Link>
                        </Space>
                    )
                }
            }
        },
        {
            title: 'Price',
            width: 0,
            dataIndex: 'price',
            render: (text) => <b>{formatMoney(fiat, text)}</b>,
        },
        {
            title: 'Limits',
            width: 120,
            responsive: ['sm'],
            render: (text, offer) => <span>{`${offer.minFiat} - ${offer.maxFiat}`}</span>
        },
        //Table.EXPAND_COLUMN,
        {
            title: 'User',
            dataIndex: 'owner',
            width: 180,
            // TODO sort by reputation
            render: (text, offer) => (
                <Space>
                    <Avatar
                        src={'https://effigy.im/a/'+offer.owner+'.svg'}
                        draggable={false}
                    />
                    <Username address={offer.owner} profile={offer.profile} />
                </Space>
            )
        },
        {
            title: 'Terms', // TODO show terms tags and text below
            responsive: ['md'],
            render: (text, offer) => <Tag>{offer.method}</Tag>,
        },
    ];

    function title() {
        let title = side === 'sell' ? 'Sell' : 'Buy';
        title += ' ' + token;
        title += ' for ' + fiat;
        if (method) title += ' using ' + method;
        return title;
    }

    return (
        <>
        <Divider orientation={"left"}>
        </Divider>
        <Table columns={columns} dataSource={offers} pagination={false} loading={loading}
               rowKey={offer => offer.id}
               showSorterTooltip={false} /*Buggy tooltip blinks on render*/
               title={title}
               footer={() =>
                   <Flex justify={"center"}>
                       {totalOffers !== null && `Shown all ${totalOffers} offers` || <Button onClick={loadMore}>Load more...</Button>}
                   </Flex>}
               /*expandable={{
                   expandedRowRender: offer => <p>{offer.terms}</p>,
                   rowExpandable: offer => offer.terms !== '',
               }}*/
        />
        </>
    )
}

OffersTable.propTypes = {
    offers: PropTypes.array.isRequired,
}
