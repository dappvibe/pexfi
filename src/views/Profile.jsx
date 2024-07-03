import {useWalletProvider} from "../hooks/useWalletProvider";
import {useContract} from "../hooks/useContract.jsx";
import {useEffect, useState} from "react";
import LoadingButton from "../components/LoadingButton.jsx";
import {Descriptions} from "antd";

export default function Profile()
{
    const { selectedWallet, selectedAccount } = useWalletProvider();
    const { repToken } = useContract();
    const [tokenId, setTokenId] = useState(null);
    const [stats, setStats] = useState(null);

    function refreshStats(tokenId) {
        repToken.stats(tokenId).then((stats) => {
            stats = stats.map(Number);
            stats = {
                createdAt:      stats[0],
                upvotes:        stats[1],
                downvotes:      stats[2],
                volumeUSD:      stats[3],
                dealsCompleted: stats[4],
                dealsExpired:   stats[5],
                disputesLost:   stats[6],
                avgPaymentTime: stats[7],
                avgReleaseTime: stats[8],
            }
            setStats(stats);
        });
    }

    useEffect(() => {
        if (selectedAccount) {
            repToken.ownerToTokenId(selectedAccount).then((tokenId) => {
                if (!tokenId) return;
                setTokenId(tokenId);
                refreshStats(tokenId);
            });
        }
        return () => {
            setTokenId(null);
            setStats(null);
        }
    }, [selectedAccount]);

    function create() {
        return repToken.register().then((tx) => {
            tx.wait().then((receipt) => {
                const logs = repToken.interface.parseLog(receipt.logs[0]);
                setTokenId(logs[2])
                refreshStats(logs[2]);
            });
        });
    }

    let descriptions = [];
    for (const key in stats) {
        descriptions.push({key: key, label: key, children: stats[key]});
    }

    return(
        <>
            {stats ? (
                <Descriptions title={"Profile"} items={descriptions} />
            ) : (
            <>
            You do not have a token yet.
            <LoadingButton onClick={create}>Create one</LoadingButton>
            </>
        )}
        </>
    );
}
