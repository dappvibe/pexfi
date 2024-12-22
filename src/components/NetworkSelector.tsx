import {Select, Space, Switch, Tooltip} from "antd";
import {useChainId, useSwitchChain} from "wagmi";
import {arbitrum, arbitrumSepolia} from "wagmi/chains";
import arbitrumLogo from "assets/images/arbitrum_monochrome.svg";

export default function NetworkSelector()
{
    // so that devs and testers may choose coming networks
    if (import.meta.env.MODE !== 'production') {
        return NetworkSelectorAll();
    }

    const { switchChain } = useSwitchChain();

    const handleChange = (checked: boolean) => {
        if (checked) {
            switchChain({ chainId: arbitrum.id });
        } else {
            switchChain({ chainId: arbitrumSepolia.id });
        }
    };

    return (
        <Space direction="horizontal" style={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Mainnet is not deployed yet.">
                <Switch
                    checked={false}
                    checkedChildren={"Mainnet"}
                    unCheckedChildren={"Sepolia"}
                    disabled={true}
                    onChange={handleChange}
                    style={{
                        backgroundColor: "#555",
                        opacity: 0.9, // Slight transparent effect for bright appearance
                    }}
                />
            </Tooltip>

            <Tooltip title={"Arbitrum One"}>
                <img
                    src={arbitrumLogo}
                    alt="Arbitrum"
                    style={{
                        width: "30px",
                        height: "auto",
                        padding: "4px",
                        verticalAlign: "middle",
                    }}
                />
            </Tooltip>
        </Space>
    );
}

export function NetworkSelectorAll() {
    const chainId = useChainId();
    const {chains, switchChain} = useSwitchChain();

    const options = chains.map((chain) => ({
        label: chain.name,
        value: chain.id,
    }));

    return (
        <Select
            style={{width: 150}}
            options={options}
            value={chainId}
            onSelect={(id) => switchChain({ chainId: id })}
        />
    );
}
