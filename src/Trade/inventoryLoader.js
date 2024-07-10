import {ethers} from "ethers";
import {MarketContract as contract} from "@/hooks/useContract.jsx";
import {defer} from "react-router-dom";

export default async function inventoryLoader() {
    const cached = (key, promise) => {
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

    return defer({
        tokens: cached('tokens', contract.getTokens().then(res => {
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
        fiats: cached('fiats', contract.getFiats().then(res => {
            return res.map(ethers.decodeBytes32String);
        })),
        methods: cached('methods', contract.getMethods().then(res => {
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
}
