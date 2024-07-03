import React from "react";
import {Button, Flex, Form, Input, Layout, Menu, Select, Skeleton, Dropdown, Tooltip, Space, message} from "antd";
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import {Link, useLoaderData, useNavigate, useParams} from "react-router-dom";

export default function Inventory(args)
{
    // TODO sort top 10 fiats and then others
    const [ tokens, fiats, methods ] = args.data;

    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = 'ANY'
    } = useParams();
    const navigate = useNavigate();
    const tokensMenu = Object.keys(tokens).map(token => {
        return {
            key: token,
            label: (<Link to={constructUrl(token)}>{tokens[token].symbol}</Link>),
        }
    });
    function constructUrl(token) {
        let url = "/trade";
        if (side) url += `/${side}`;
        url += `/${token}`;
        if (fiat) url += `/${fiat}`;
        if (method && method !== 'ANY') url += `/${method}`;
        return url;
    }
    const fiatSelect = fiats.map(fiat => {
        return {
            value: fiat,
            label: fiat,
        }
    });
    const methodSelect = Object.keys(methods).map(methoda => {
        return {
            value: methoda,
            label: methoda,
        }
    });

    function handleFiatChange(fiat) {
        // Construct the new URL
        let url = "/trade";
        if (side) url += `/${side}`;
        if (token) url += `/${token}`;
        url += `/${fiat}`;
        if (method && method !== 'ANY') url += `/${method}`;
        navigate(url);
    }

    function handleMethodChange(methodb) {
        // Construct the new URL
        let url = "/trade";
        url += `/${side}`;
        url += `/${token}`;
        url += `/${fiat}`;
        url += `/${methodb}`;
        navigate(url);
    }


    return (
        <>
        <Menu
            mode={"horizontal"}
            items={tokensMenu}
            defaultSelectedKeys={[token]}
        />
        <Flex gap={"middle"} style={{padding: 10}}>
            <Input placeholder={"Amount"}
                   style={{ maxWidth: 200 }}
                   addonAfter={(
                       <Select
                           showSearch
                           placeholder="Search to Select"
                           optionFilterProp="label"
                           filterSort={(optionA, optionB) =>
                               (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                           }
                           options={fiatSelect}
                           defaultValue={fiat}
                           onChange={handleFiatChange}
                       />
                   )}
            />
            <Select
                showSearch
                style={{
                    width: 200,
                }}
                placeholder="Payment method"
                optionFilterProp="label"
                options={methodSelect}
                onChange={handleMethodChange}
            />
        </Flex>
        </>
    )
}
