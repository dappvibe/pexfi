import {Select} from "antd";
import {useChainId, useSwitchChain} from "wagmi";

export default function NetworkSelector()
{
    const chainId = useChainId();
    const { chains, switchChain } = useSwitchChain();

    const options = [];
    chains.forEach((chain) => {
        options.push({
            label: chain.name,
            value: chain.id
        });
    });

    return (<Select style={{width: 150}} options={options} value={chainId} onSelect={(id) => switchChain({chainId: id})} />);
}
