import PropTypes from "prop-types";
import {Menu} from "antd";
import {generatePath, Link, useParams} from "react-router-dom";
import {useInventory} from "@/hooks/useInventory.tsx";

export default function TokenNav() {
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = null
    } = useParams();
    const { tokens } = useInventory();

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
        selectedKeys={[token]}
    />
    );
}
