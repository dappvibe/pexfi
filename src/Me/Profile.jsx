import {useWalletProvider} from "../hooks/useWalletProvider";
import {useContract} from "../hooks/useContract.jsx";
import {useEffect, useState} from "react";
import LoadingButton from "../components/LoadingButton.jsx";
import {Card, Descriptions, Result} from "antd";
import Username from "@/components/Username.jsx";

export default function Profile()
{
    const { account } = useWalletProvider();
    const { repToken, signed } = useContract();
    const [tokenId, setTokenId] = useState(null);
    const [stats, setStats] = useState({});

    useEffect(() => {
        if (account) {
            repToken.ownerToTokenId(account).then((tokenId) => {
                if (!tokenId) return;
                setTokenId(tokenId);
                refreshStats(tokenId);
            });
        }
        return () => {
            setTokenId(null);
            setStats(null);
        }
    }, [account]);

    async function create() {
        const rep = await signed(repToken);
        return rep.register().then((tx) => {
            tx.wait().then((receipt) => {
                const {args} = repToken.interface.parseLog(receipt.logs[0]);
                setTokenId(args[2])
                refreshStats(args[2]);
            });
        });
    }

    async function refreshStats(tokenId) {
        let result = await repToken.stats(tokenId);
        result = result.map(Number)
        result = {
            createdAt:      new Date(result[0] * 1000),
            upvotes:        result[1],
            downvotes:      result[2],
            volumeUSD:      result[3],
            dealsCompleted: result[4],
            dealsExpired:   result[5],
            disputesLost:   result[6],
            avgPaymentTime: result[7],
            avgReleaseTime: result[8],
        }
        setStats(result);
    }

    function rating(upvotes, downvotes) {
        const totalVotes = upvotes + downvotes;
        if (totalVotes === 0) return '-';
        const ratingPercentage = (upvotes / totalVotes) * 100;
        return `${ratingPercentage.toFixed(2)}%`;
    }

    if (tokenId && stats) {
        return (
        <Card title={"Profile token ID: " + tokenId}>
            <Descriptions layout={"vertical"} title={<Username address={account} avatar />}>
                <Descriptions.Item label={"Registered"}>{stats.createdAt.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label={"Rating"}>{rating(stats.upvotes, stats.downvotes)}</Descriptions.Item>
                <Descriptions.Item label={"Deals completed"}>{stats.dealsCompleted}</Descriptions.Item>
                <Descriptions.Item label={"Volume"}>{stats.volumeUSD} USD</Descriptions.Item>
                <Descriptions.Item label={"Deals expired"}>{stats.dealsExpired}</Descriptions.Item>
                <Descriptions.Item label={"Disputes lost"}>{stats.disputesLost}</Descriptions.Item>
                <Descriptions.Item label={"Average payment time"}>{stats.avgPaymentTime} seconds</Descriptions.Item>
                <Descriptions.Item label={"Average release time"}>{stats.avgReleaseTime} seconds</Descriptions.Item>
            </Descriptions>
        </Card>
        );
    }
    else {
        return (<Result title={"You do not have a profile token yet."}
                        extra={<LoadingButton type={"primary"} onClick={create}>Mint</LoadingButton>} />
        );
    }
}
