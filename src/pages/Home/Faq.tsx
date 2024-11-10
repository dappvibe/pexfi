import { Collapse } from "antd";

export default function Faq() {
    const faq = [
        {
            key: '4',
            label: 'How to trade Bitcoin?',
            children: <p>Bitcoin must be bridged first. The platform supports ERC20 tokens only.</p>
        },
        {
            key: '1',
            label: 'Do you need a license?',
            children: <p>This website is a tool to publish smart contracts to open blockchains. Then published contracts are listed in catalogue.
            The website does not touch crypto or fiat money in any way. It does not provide any financial services.
            </p>
        },
        {
            key: '2',
            label: 'Who are mediators?',
            children: <p>Mediators are arbitrators who can resolve disputes between traders. They are members of the DAO.</p>
        },
        {
            key: '3',
            label: 'Are there any fees?',
            children: <><p>Offer makers pay <b>1%</b> on crypto amount. Takers pay no fees.</p><p>Fees can be paid with tokens to get 50% discount.</p></>
        },
        {
            key: '5',
            label: 'Can I trade Monero?',
            children: <p>Yes. Coming soon.</p>
        },
        {
            key: '6',
            label: 'Where are token prices come from?',
            children: <p>Market prices of crypto are fetched from Uniswap at real-time.</p>
        },
        {
            key: '7',
            label: 'Why Arbitrum?',
            children: <p>Arbitrum is a Layer 2 solution that provides low fees and fast transactions. Because of low fees it is now possible to build fully decentralized website like this.</p>
        }
    ];

    return (
        <div>
            <h2>F.A.Q.</h2>
            <Collapse items={faq} />
        </div>
    );
}
