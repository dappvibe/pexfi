import PropTypes from "prop-types";
import ExplorerLink from "./ExplorerLink.jsx";
import {formatAddress} from "../utils.js";
import {Avatar, Space} from "antd";

export default function Username({address, avatar = false})
{
    const link = (
        <ExplorerLink address={address}>
            {formatAddress(address)}
        </ExplorerLink>
    );

    if (avatar) {
        return (
            <Space>
                <Avatar src={'https://effigy.im/a/'+address+'.svg'} draggable={false}/>
                {link}
            </Space>
        )
    }
    else return link;
}

Username.propTypes = {
    address: PropTypes.string.isRequired,
    avatar: PropTypes.bool,
};
