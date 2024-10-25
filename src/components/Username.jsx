import PropTypes from "prop-types";
import ExplorerLink from "./ExplorerLink.jsx";
import {formatAddress} from "../utils.js";
import {Avatar, Space} from "antd";
import {Link} from "react-router-dom";

export default function Username({address, avatar = false})
{
    const link = (
        <Link to={"/profile/"+address}>{formatAddress(address)}</Link>
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
