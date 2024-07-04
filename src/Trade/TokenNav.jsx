import PropTypes from "prop-types";
import {Menu} from "antd";
import {generatePath, Link, useParams} from "react-router-dom";

export default function TokenNav({tokens}) {
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = null
    } = useParams();

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

TokenNav.propTypes = {
    tokens: PropTypes.object.isRequired,
};
