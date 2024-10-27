import {Card, Col, Collapse, Row} from "antd";

export default function Home() {
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
    ]

    return (
    <>
        <div style={{ padding: '20px' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1>Fully Decentralized P2P Crypto Marketplace</h1>
                <p>Trade ERC20 tokens securely and censorship-resistant — entirely on-chain.</p>
                <p>Make crypto decentralized again, as it was meant to be: peer-to-peer.</p>
            </header>
            <Row gutter={16}>
                <Col span={8}>
                    <Card title={'Unstoppable'}>
                        <p>The marketplace operates without a central server.</p>
                        <p>The client app connects directly to the blockchain.</p>
                        <p>Download and use it locally for a fully decentralized experience.</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={"Non-custodial"}>
                        <p>No accounts needed — your crypto, your wallet.</p>
                        <p>Each trade is facilitated by an on-demand funded smart contract.</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={"Anonymous"}>
                        <p>The platform does not handle funds and does not enforce KYC/AML requirements.</p>
                        <p>Individual traders may request KYC if they choose.</p>
                    </Card>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Card title={"No Limits"}>
                        <p>Traders set their own rules for their ads — any amount goes.</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={"Tokenized Reputation"}>
                        <p>Trading stats are represented as an NFT, making it flexible.</p>
                        <p>It can be linked to multiple addresses, transferred, or sold.</p>
                        <p>Your reputation is your asset.</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={"Secure"}>
                        <p>Traded crypto is held in a smart contract for security.</p>
                        <p>A dispute resolution system is in place.</p>
                        <p>Arbitrators can only release or revert payments — they cannot redirect funds elsewhere.</p>
                    </Card>
                </Col>
            </Row>
        </div>
        <div>
            <h2>F.A.Q.</h2>
            <Collapse items={faq} />
        </div>
    </>
    );
}
