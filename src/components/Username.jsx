import PropTypes from "prop-types";
import ExplorerLink from "./ExplorerLink.jsx";
import {formatAddress} from "../utils.js";
import {Avatar, Space} from "antd";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {useContract} from "@/hooks/useContract.jsx";

export default function Username({address, avatar = false})
{
    const { RepToken } = useContract();

    const [ trades, setTrades ] = useState('0');
    const [ rating, setRating ] = useState('0');

    useEffect(() => {
        if (RepToken) {
            RepToken.ownerToTokenId(address).then(tokenId => {
                RepToken.stats(tokenId).then(stats => {
                    setTrades(String(stats[5]));
                    const upvotes = Number(stats[1]);
                    const downvotes = Number(stats[2]);
                    const total = upvotes + downvotes;
                    if (total === 0) {
                        return setRating('- ');
                    } else {
                        setRating(String(upvotes / total * 100));
                    }
                });
            });
        }
    });

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
