import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useContract } from '@/hooks/useContract.jsx';

const fetchInventory = async (Market) => {
    const [tokensRes, fiatsRes, methodsRes] = await Promise.all([
        Market.getTokens(),
        Market.getFiats(),
        Market.getMethods()
    ]);

    const tokens = tokensRes.reduce((acc, token) => {
        acc[token[1]] = {
            address: token[0],
            symbol: token[1],
            name: token[2],
            decimals: Number(token[3]),
        };
        return acc;
    }, {});

    const fiats = fiatsRes.map(ethers.decodeBytes32String);

    const methods = methodsRes.reduce((acc, method) => {
        acc[method[0]] = {
            name: method[0],
            group: Number(method[1]),
        };
        return acc;
    }, {});

    return { tokens, fiats, methods };
};

export function useInventory() {
    const { Market } = useContract();
    const { data } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => fetchInventory(Market),
    });

    return data;
}
