import {Avatar, Button, Divider, Flex, Input, List, Select, Space, Table, Tag} from "antd";
import {generatePath, Link, useNavigate, useParams} from "react-router-dom";
import React, {useState} from "react";
import PropTypes from "prop-types";
import Username from "../../components/Username.jsx";
import {useInventory} from "../../hooks/useInventory.jsx";
import {useWalletProvider} from "../../hooks/useWalletProvider";

export default function OffersList({offers, price})
{
    let { side, token, fiat, method } = useParams();
    const { selectedAccount: account } = useWalletProvider();
    const { inventory} = useInventory();
    const navigate = useNavigate();
    const [rows, setRows] = useState(offers);

    function title() {
        let title = side === 'sell' ? 'Buy' : 'Sell';
        title += ' ' + token;
        title += ' for ' + fiat;
        if (method && method !== 'ANY') title += ' using ' + method;
        return title;
    }

    const filters = () => {
        const fiats = inventory.fiats.map(fiat => {
            return {
                value: fiat,
            }
        });
        const methods = [
            {value: 'ANY', label: '-- Any --'},
            ...Object.keys(inventory.methods).map(method => {
                return {
                    value: method,
                }
            })
        ];
        const navigateFiat = (fiat) => {
            navigate(generatePath("/trade/:side/:token/:fiat/:method?", { side, token, fiat, method }));
        }
        const navigateMethod = (method) => {
            navigate(generatePath("/trade/:side/:token/:fiat/:method?", { side, token, fiat, method }));
        }
        const filterAmount = (e) => {
            if (e.target.value === '') setRows(offers);
            else setRows(offers.filter(offer => offer.min <= e.target.value && offer.max >= e.target.value));
        }
        return (
            <Space>
                <Input placeholder={"Amount"}
                       style={{ maxWidth: 200 }}
                       onChange={filterAmount}
                       addonAfter={(
                           <Select
                               showSearch
                               placeholder="Search to Select"
                               filterSort={(optionA, optionB) =>
                                   (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                               }
                               options={fiats}
                               defaultValue={fiat}
                               onChange={navigateFiat}
                           />
                       )}
                />
                <Select
                    showSearch
                    defaultValue={method}
                    style={{ width: 200 }}
                    placeholder="Payment method"
                    options={methods}
                    onChange={navigateMethod}
                />
            </Space>
        );
    }

    // TODO move to utils
    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: fiat,
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });

    const columns = [
        {
            title: '',
            width: 0,
            render: (_, offer) => {
                if (offer.owner.toLowerCase() === account.toLowerCase()) {
                    return (
                        <Space>
                            <Button type="primary">
                                Edit
                            </Button>
                        </Space>
                    );
                } else {
                    return (
                        <Space size={"middle"}>
                            <Link to={`/trade/${side}/${offer.token}/${offer.fiat}/${offer.method}/${offer.id}`}>
                                <Button>{offer.isSell ? 'Buy' : 'Sell'}</Button>
                            </Link>
                        </Space>
                    )
                }
            }
            // TODO more buttons for owner
        },
        {
            title: 'Price',
            width: 0,
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price,
            defaultSortOrder: 'descend',
            render: (text) => <b>{formatter.format(text)}</b>,
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
            title: 'Terms', // TODO show terms tags and text below
            responsive: ['md'],
            render: (text, offer) => <Tag>{offer.method}</Tag>,
        },
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
    ];

    return (
        <>
        <Divider orientation={"left"}>
            <b>{title()}</b>
            <span style={{marginLeft: 20}}>Market: {formatter.format(price)}</span>
        </Divider>
        {/*<Flex gap={"middle"} style={{padding: 10}}>{filters()}</Flex>*/}
        <Table columns={columns} dataSource={rows} pagination={false}
               rowKey={offer => offer.id}
               title={filters}
               /*expandable={{
                   expandedRowRender: offer => <p>{offer.terms}</p>,
                   rowExpandable: offer => offer.terms !== '',
               }}*/
        />
        </>
    )
}

OffersList.propTypes = {
    offers: PropTypes.array.isRequired,
    price: PropTypes.number.isRequired,
}
