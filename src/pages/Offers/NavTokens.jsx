import {useInventory} from "../../hooks/useInventory.jsx";
import {Menu, Skeleton} from "antd";
import {generatePath, Link, useParams} from "react-router-dom";
import React from "react";

export default function NavTokens() {
    const { inventory } = useInventory();
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = null
    } = useParams();

    // wait for inventory to load
    if (!inventory) return (<Skeleton active paragraph={false} />)

    const { tokens } = inventory;

    const tokensMenu = Object.keys(tokens).map(token => {
        return {
            key: token,
            label: (<Link to={generatePath('/trade/:side/:token/:fiat/:method?', {side, token, fiat, method})}>
                {tokens[token].symbol}
            </Link>),
        }
    });

    return (
    <Menu
        mode={"horizontal"}
        items={tokensMenu}
        defaultSelectedKeys={[token]}
    />
    );
}
