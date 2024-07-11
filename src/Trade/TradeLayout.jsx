import TokenNav from "@/Trade/TokenNav.jsx";
import {Await, Outlet} from "react-router-dom";
import {Suspense, useEffect, useState} from "react";
import {Skeleton} from "antd";
import {ethers} from "ethers";
import {useContract} from "@/hooks/useContract.jsx";

export default function TradeLayout() {
    const { Market } = useContract();

    const [inventory, setInventory] = useState();

    useEffect(() => {
        setInventory({
            tokens: Market.getTokens().then(res => {
                let tokens = {};
                res.map(token => {
                    token = {
                        address: token[0],
                        symbol: token[1],
                        name: token[2],
                        decimals: Number(token[3]),
                    }
                    tokens[token.symbol] = token;
                });
                return tokens;
            }),
            fiats: Market.getFiats().then(res => {
                return res.map(ethers.decodeBytes32String);
            }),
            methods: Market.getMethods().then(res => {
                let methods = {};
                res.map(method => {
                    method = {
                        name: method[0],
                        group: Number(method[1]),
                    }
                    methods[method.name] = method;
                });
                return methods;
            })
        });
    }, []);

    if (!inventory) return;

    return (
    <>
        <Suspense fallback={<Skeleton active paragraph={false}/> }>
            <Await resolve={inventory.tokens}>
                {(tokens) => <TokenNav tokens={tokens} />}
            </Await>
        </Suspense>
        <Outlet context={inventory} />
    </>
    );
}
