import TokenNav from "@/Trade/TokenNav.jsx";
import {Await, Outlet} from "react-router-dom";
import {Suspense, useEffect, useState} from "react";
import {Skeleton} from "antd";
import {ethers} from "ethers";
import {useContract} from "@/hooks/useContract.jsx";

function cached(key, promise) {
    const now = new Date();
    const cache = localStorage.getItem(key);
    if (cache) {
        return Promise.resolve(JSON.parse(cache).data);
    } else {
        return promise.then((res) => {
            localStorage.setItem(key, JSON.stringify({ timestamp: now.getTime(), data: res }));
            return res;
        });
    }
}

export default function TradeLayout() {
    const { Market } = useContract();

    const [inventory, setInventory] = useState();

    useEffect(() => {
        setInventory({
            tokens: cached('tokens', Market.getTokens().then(res => {
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
            })),
            fiats: cached('fiats', Market.getFiats().then(res => {
                return res.map(ethers.decodeBytes32String);
            })),
            methods: cached('methods', Market.getMethods().then(res => {
                let methods = {};
                res.map(method => {
                    method = {
                        name: method[0],
                        group: Number(method[1]),
                    }
                    methods[method.name] = method;
                });
                return methods;
            }))
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
