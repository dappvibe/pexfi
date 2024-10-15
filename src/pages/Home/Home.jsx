export default function Home() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1>Welcome to P2P Crypto Trading Platform</h1>
                <p>Trade securely and directly on the blockchain</p>
            </header>
            <section style={{ marginBottom: '40px' }}>
                <h2>Main Features</h2>
                <ul>
                    <li>Non-custodial: Users upload their own smart contracts directly to the blockchain</li>
                    <li>No KYC: Users set their own rules for KYC/AML</li>
                    <li>Secure dispute mediation</li>
                    <li>Support for multiple cryptocurrencies</li>
                    <li>Flexible payment methods</li>
                    <li>Real-time market data</li>
                </ul>
            </section>
            <section>
                <h2>Benefits</h2>
                <ul>
                    <li>Full control over your assets</li>
                    <li>Enhanced privacy and security</li>
                    <li>Decentralized and trustless environment</li>
                </ul>
            </section>
        </div>
    );
}
