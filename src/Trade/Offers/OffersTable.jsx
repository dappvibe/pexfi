import {Avatar, Button, Divider, Space, Table, Tag} from "antd";
import {Link, useParams} from "react-router-dom";
import PropTypes from "prop-types";
import Username from "@/components/Username.jsx";
import {formatMoney} from "@/utils.js";
import {useAccount} from "wagmi";

export default function OffersTable({offers})
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
                            <Link to={`/trade/offer/edit/${offer.address}`}>
                                <Button type="primary">Edit</Button>
                            </Link>
                        </Space>
                    );
                } else {
                    return (
                        <Space size={"middle"}>
                            <Link to={`/trade/offer/${offer.address}`}>
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
            sorter: (a, b) => a.price - b.price,
            defaultSortOrder: 'descend',
            render: (text) => <b>{formatMoney(fiat, text)}</b>,
        },
        {
            title: 'Limits',
            width: 120,
            responsive: ['sm'],
            sorter: (a, b) => a.min - b.min,
            render: (text, offer) => <span>{`${offer.min} - ${offer.max}`}</span>
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
                    <Username address={offer.owner} />
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
        <Table columns={columns} dataSource={offers} pagination={false}
               rowKey={offer => offer.address}
               showSorterTooltip={false} /*Buggy tooltip blinks on render*/
               title={title}
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
