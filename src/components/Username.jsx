import PropTypes from "prop-types";
import ExplorerLink from "./ExplorerLink.jsx";
import {formatAddress} from "../utils.js";
import {Avatar, Space} from "antd";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {useContract} from "@/hooks/useContract.jsx";

export default function Username({address, avatar = false, profile = null})
{
    let trades, rating;
    if (profile) {
        trades = profile.dealsCompleted
        rating = profile.rating
    } else {
        trades = '0';
        rating = '??'
    }

    const link = (
        <Link to={"/profile/"+address}>{formatAddress(address)} ({trades}; {rating}%)</Link>
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
