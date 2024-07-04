import {createContext, useEffect, useState} from "react";
import {useContract} from "./useContract.jsx";
import {ethers} from "ethers";

export const InventoryContext = createContext({
    inventory: null,
    getPrice: async (token, fiat) => {},
});

export const InventoryProvider = ({children}) => {
    const { inventory: contract } = useContract();
    const [inventory, setInventory] = useState()

    useEffect(() => {
        const now = new Date();
        const cache = localStorage.getItem("inventoryCache");
        if (cache) {
            const { timestamp, data } = JSON.parse(cache);
            const cacheHours = (now.getTime() - timestamp) / (1000 * 60 * 60);
            if (cacheHours < 24) {
                setInventory(data);
                return; // Use cached data
            }
        }

        Promise.all([
            contract.getTokens().then(res => {
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
            contract.getFiats().then(res => {
                return res.map(ethers.decodeBytes32String);
            }),
            contract.getMethods().then(res => {
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
        ]).then(([tokens, fiats, methods]) => {
            const inv = {
                tokens: tokens,
                fiats: fiats,
                methods: methods
            };
            setInventory(inv);
            localStorage.setItem(
                "inventoryCache",
                JSON.stringify({ timestamp: now.getTime(), data: inv })
            );
        });
    }, [])

    const contextValue = {
        inventory: inventory,
        getPrice: contract.getPrice,
    }

    return (
        <InventoryContext.Provider value={contextValue}>
            {children}
        </InventoryContext.Provider>
    )
}
