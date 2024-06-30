const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {deployMockERC20} = require("./mocks");

function address(number) {
    let hexString = number.toString(16);

    while (hexString.length < 40) {
        hexString = '0' + hexString;
    }
    return '0x' + hexString;
}

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const MARKET_ROLE = ethers.encodeBytes32String('MARKET_ROLE');

let MockUniswap, MockBTC, MockETH, MockUSDT, MockDummy,
    PriceFeeds = {}, RepToken, Inventory, Market,
    deployer, seller, buyer, mediator,
    offers = [], deal;

/**
 * Only mocks here. Actual deployment is explained in the first test.
 */
before(async function() {
    [deployer, seller, buyer, mediator] = await ethers.getSigners();
    MockBTC = await deployMockERC20('WBTC', 8);
    MockETH =  await deployMockERC20('WETH', 18);
    MockUSDT = await deployMockERC20('USDT', 6);
    MockDummy = await deployMockERC20('Dummy', 18);
    await MockBTC.transfer(seller.address, 10n * 10n**8n); // seller has 10 coins to sell
    await MockETH.transfer(seller.address, 2000n * 10n**18n);
    await MockUSDT.transfer(seller.address, 20000000n * 10n**6n);

    const PoolBTC = await ethers.deployContract('PoolBTC');
    const PoolETH = await ethers.deployContract('PoolETH');
    MockUniswap = await ethers.deployContract('MockUniswapV3Factory');
    MockUniswap.setPool(MockBTC.target, PoolBTC.target);
    MockUniswap.setPool(MockETH.target, PoolETH.target);
});

/**
 * In tests all contracts are deployed directly without proxy to ease debugging, speedup runs and keep stacktraces clean.
 * Deployment scripts MUST deploy proxies.
 */
describe('Deployment', function()
{
    describe('Fiat oracles to extend chainlink', function()
    {
        ['THB', 'EUR', 'XXX']
        .forEach((fiat, i) => {
            it (`${fiat} is deployed`, function() {
                return ethers.deployContract('PriceFeed', [fiat])
                    .then((feed) => PriceFeeds[fiat] = feed);
            });
        });

        it ('update prices regularly', async function() {
            await PriceFeeds['EUR'].set(106927500);
            const data = await PriceFeeds['EUR'].latestRoundData();
            expect(data[1]).to.eq(106927500);
        });
    });

    describe('Reputation token', function(){
        it('is deployed', async function() {
            RepToken = await ethers.deployContract('RepToken');
            await expect(RepToken.initialize().then(tx => tx.wait())).to
                .emit(RepToken, 'RoleGranted')
                .withArgs(DEFAULT_ADMIN_ROLE, deployer.address, deployer.address);
            return expect(RepToken.target).to.be.properAddress;
        });

        it ('deployer is default admin', async function() {
            return expect(RepToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.eventually.true;
        });
    });

    describe('Inventory', function() {
        it('is deployed', async function() {
            Inventory = await ethers.deployContract('Inventory', [MockUniswap.target]);
            return expect(Inventory.target).to.be.properAddress;
        });

        it ('add supported tokens', async function() {
            const tokens = [MockBTC.target, MockETH.target, MockUSDT.target, MockDummy.target];
            await expect(Inventory.addTokens(tokens, 500)).to.not.reverted;
        });

        it ('remove a token', async function() {
            const kill = await MockDummy.symbol();
            await expect(Inventory.removeTokens([kill])).to.not.reverted;
        });

        it ('add supported fiats', async function() {
            let fiats = [];
            for (const [key, value] of Object.entries(PriceFeeds)) {
                fiats.push([key, value.target]);
            }
            await expect(Inventory.addFiats(fiats)).to.not.reverted;
        });

        it ('remove a fiat', async function() {
            await expect(Inventory.removeFiats(['XXX'])).to.not.reverted;
        });


        // this is an expensive, but required one-time operation. Mediators must know the methods to solve disputes.
        it('add payment methods', async function() {
            const methods = [
                {name: 'Zelle', group: 3, country: 188},
                {name: 'SEPA',  group: 3, country: 1},
                {name: 'Monero', group: 1, country: 0},
                {name: 'Cash To ATM',  group: 2, country: 0},
            ];
            await expect(Inventory.addMethods(methods)).to.not.reverted;
        });

        it ('remove a payment method' , async function() {
            const receipt = await Inventory.removeMethods(['Monero']).then((tx) => tx.wait());
            await expect(receipt).to.not.reverted;
        });
    });

    describe('Market', function() {
        it ('is upgradable', async function() {
            const MarketFactory = await ethers.getContractFactory("Market");
            expect(upgrades.validateImplementation(MarketFactory)).to.eventually.be.undefined; // no error
        });

        it ('is deployed', async function() {
            Market = await ethers.deployContract('Market');
            await Market.initialize(RepToken.target, Inventory.target).then(tx => tx.wait());
            expect(Market.target).to.be.properAddress;
        });

        it('is owned by deployer', function() {
            return expect(Market.owner()).to.eventually.eq(deployer.address);
        });

        it ('set mediator address', async function() {
            await Market.setMediator(mediator.address);
            await expect(await Market.mediator()).to.eq(mediator.address);
        });

        it('set market address in rep token', async function() {
            await RepToken.grantRole(MARKET_ROLE, Market.target).then(tx => tx.wait());
            await expect(RepToken.hasRole(MARKET_ROLE, Market.target)).to.eventually.true;
        });
    });
});

/**
 * How to get data for React client.
 */
describe('Browser builds UI', function ()
{
    let tokens, fiats, methods = [];

    it ('get tokens', async function() {
        tokens = await Inventory.getTokens();
        expect(tokens).to.have.length(3);
        expect(tokens[0][1]).to.eq('WBTC');
        expect(tokens[1][1]).to.eq('WETH');
        expect(tokens[2][1]).to.eq('USDT');
    });

    it ('get fiats', async function() {
        fiats = await Inventory.getFiats();
        fiats = fiats.map(ethers.decodeBytes32String);
        expect(fiats).to.have.length(2);
        expect(fiats[0]).to.eq('THB');
        expect(fiats[1]).to.eq('EUR');
    });

    it ('get methods', async function() {
        methods = await Inventory.getMethods();
        await expect(methods).to.have.length(3);
        await expect(methods[0][0]).to.eq('Zelle');
        await expect(methods[1][0]).to.eq('SEPA');
        await expect(methods[2][0]).to.eq('Cash To ATM');
    });

    it ('get prices', async function() {
        await expect(Inventory.getPrice(await MockETH.symbol(), "USD")).to.eventually.eq(3474_809672); // 3474.8096 USDT per ETH
        await expect(Inventory.getPrice(await MockETH.symbol(), "EUR")).to.eventually.eq(3249_687565);
        await expect(Inventory.getPrice(await MockUSDT.symbol(), "USD")).to.eventually.eq(1000000);
        await expect(Inventory.getPrice(await MockUSDT.symbol(), "EUR")).to.eventually.eq(935213);
    });
});

describe('Users post offers', function()
{
    it ('seller provides allowance', async function() {
        await MockBTC.connect(seller).approve(Market.target, ethers.MaxUint256);
        await MockETH.connect(seller).approve(Market.target, ethers.MaxUint256);
    });

    [
        [true, 'WBTC', 'USD', 'Zelle', 10250, 1000, 5000, ''],
        [true, 'WBTC', 'USD', 'Zelle', 10400, 100,  1000, ''],
        [true, 'WETH', 'EUR', 'SEPA',  10250, 1000, 5000, ''],
        [true, 'USDT', 'USD', 'Zelle', 10250, 1000, 5000, 'arbitrary terms'],
        [false, 'WBTC', 'USD', 'Zelle', 9800, 1000, 5000, ''],
        [false, 'WBTC', 'USD', 'Zelle', 9650, 100,  1000, ''],
        [false, 'WETH', 'EUR', 'SEPA',  9750, 1000, 5000, ''],
        [false, 'USDT', 'USD', 'Zelle', 9950, 1000, 5000, ''],
    ].forEach((params, i) => {
        const title = `#${i+1} ${params[0] ? 'Sell' : 'Buy'} ${params[1]} for ${params[2]}`;
        it(title, async function() {
            const provider = params[0] ? seller : buyer;
            Market = Market.connect(provider);
            const response = Market.createOffer(params).then((tx) => tx.wait()).then(receipt => {
                const OfferCreated = Market.interface.parseLog(receipt.logs[0]);
                offers.push(OfferCreated.args[3]);
                return receipt;
            });
            await expect(response)
                .to.emit(Market, 'OfferCreated')
                .withArgs(provider.address, anyValue, anyValue, anyValue);
        });
    });

    describe('Get an offer', async function() {
        await expect(Market.getOffer(offers[0][0])).to.eventually.have.length(9);
    });

    describe('invalid input', async function() {
        function params(replace = {}) {
            return {
                isSell: true,
                token: "WBTC",
                fiat:  "EUR",
                rate: 10250, // 1.025 * market price
                min: 1000,
                max: 5000,
                method: 'Zelle',
                acceptanceTime: 900,
                terms: 'No KYC',
                ...replace
            };
        }
        it('invalid fiat currency', async function() {
            await expect(Market.createOffer(params({fiat: 'USDT'}))).to.be.reverted;
            await expect(Market.createOffer(params({fiat: 'XXX'}))).to.be.reverted;
        });

        it('invalid rate', async function() {
            await expect(Market.createOffer(params({rate: 0}))).to.be.reverted;
        });

        it ('invalid min', async function() {
            await expect(Market.createOffer(params({min: 0}))).to.be.reverted;
        });

        it('invalid max', async function() {
            await expect(Market.createOffer(params({max: 0}))).to.be.reverted;
        });

        it('invalid method', async function() {
            await expect(Market.createOffer(params({method: 'Hugs and kisses'}))).to.be.reverted;
        });
    });
});

describe('Browser fetches offers', function() {
    it('get SELL WBTC for USD with Zelle', async function() {
        //const offers = await Market.getOffers(true, 'WBTC', 'USD', 'Zelle');
        const offers = await Market.getOffers(true, 'WBTC', 'USD', 'Zelle');
        expect(offers).to.have.length(2);
    });

    it('get BUY WETH for EUR with any method', async function() {
        const offers = await Market.getOffers(true, 'WETH', 'EUR', 'ANY');
        expect(offers).to.have.length(1);
    });
});

describe('Taker sells', function() {
    it ('provides allowance', async function() {
        await MockUSDT.connect(seller).approve(Market.target, ethers.MaxUint256);
    });

    it('deal created', async function() {
        Market = await Market.connect(seller);
        const response = Market.createDeal(offers[7][0], 5002000000n, 'zelle@google.com')
            .then((tx) => tx.wait()).then(receipt => {
                receipt.logs.forEach(log => {
                    const DealCreated = Market.interface.parseLog(log);
                    if (DealCreated) deal = DealCreated.args[2];
                });
                return receipt;
            });
        await expect(response)
            .to.emit(Market, 'DealCreated')
            .withArgs(offers[7][0], mediator.address, anyValue);
        deal = await ethers.getContractAt('Deal', deal);
    });

    it ('USDT is deposited', async function() {
        await expect(MockUSDT.balanceOf(deal.target)).to.eventually.eq(5027135678);
    })

    it ('accepted by mediator', async function() {
        deal = await deal.connect(mediator);
        await expect(deal.accept()).to.not.emit(deal, 'DealState');
    });

    it ('accepted by owner', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.accept()).to.emit(deal, 'DealState').not.emit(MockUSDT, 'Transfer');
    });
});

describe('Buyer opens deal', function() {
    it('WETH to EUR created', async function() {
        Market = await Market.connect(buyer);
        const response = Market.createDeal(
            offers[2][0],
            1234_500000,
            'IBAN:DE89370400440532013000',
        ).then((tx) => tx.wait()).then(receipt => {
            const DealCreated = Market.interface.parseLog(receipt.logs[9]);
            deal = DealCreated.args[2];
            return receipt;
        });
        await expect(response)
            .to.emit(Market, 'DealCreated')
            .withArgs(offers[2][0], mediator.address, anyValue);
        deal = await ethers.getContractAt('Deal', deal);
    });

    it ('deal token amount in wei', async function() {
        await expect(deal.tokenAmount()).to.eventually.eq(370617242369402679n);
    });

    it ('accepted by mediator', async function() {
        deal = await deal.connect(mediator);
        await expect(deal.accept()).to.not.emit(deal, 'DealState');
    });

    it ('accepted by owner', async function() {
        deal = await deal.connect(seller);
        await expect(deal.accept()).to.emit(deal, 'DealState').emit(MockETH, 'Transfer');
    });

    it ('tokens are deposited', async function() {
        await expect(MockETH.balanceOf(deal.target)).to.eventually.eq(370617242369402679n);
    })
});

describe('Buyer marks paid', function() {
    it('event emitted', async function() {
        deal = await deal.connect(buyer);
        const response = deal.paid(deal).then((tx) => tx.wait());
        await expect(response).to.emit(deal, 'DealState');
    });
});

describe('Seller releases tokens', function() {
    it('event emitted', async function() {
        deal = await deal.connect(seller);
        const response = deal.release(deal).then((tx) => tx.wait());
        await expect(response).to
            .emit(deal, 'DealState')
            .emit(MockETH, 'Transfer')
            .emit(MockETH, 'Transfer');
    });
    it('buyer receives tokens', async function() {
        await expect(MockETH.balanceOf(buyer.address)).to.eventually.eq(366911069945708653n);
    });
    it('mediator receives fees', async function() {
        await expect(MockETH.balanceOf(mediator.address)).to.eventually.eq(3706172423694026n);
    });
});

describe('Buyer cancels deal', function() {
    it ('open another deal', async function() {
        Market = await Market.connect(buyer);
        const response = Market.createDeal(
            offers[2][0],
            1234_500000,
            'IBAN:DE89370400440532013000',
        ).then((tx) => tx.wait()).then(receipt => {
            const DealCreated = Market.interface.parseLog(receipt.logs[9]);
            deal = DealCreated.args[2];
            return receipt;
        });
        await expect(response)
            .to.emit(Market, 'DealCreated')
            .withArgs(offers[2][0], mediator.address, anyValue);
        deal = await ethers.getContractAt('Deal', deal);
    });
    it ('accepted by seller', async function() {
        deal = await deal.connect(seller);
        await expect(deal.accept()).to.emit(deal, 'DealState').emit(MockETH, 'Transfer');
    });
    it('seller cannot cancel', async function() {
        deal = await deal.connect(seller);
        const response = deal.cancel().then((tx) => tx.wait());
        await expect(response).to.reverted;
    });
    it('buyer can cancel any time', async function() {
        deal = await deal.connect(buyer);
        const response = deal.cancel().then((tx) => tx.wait());
        await expect(response).to
            .emit(deal, 'DealState')
            .emit(MockETH, 'Transfer');
    });
    it ('seller gets refund', async function() {
        await expect(MockETH.balanceOf(deal.target)).to.eventually.eq(0);
        await expect(MockETH.balanceOf(seller.address)).to.eventually.eq(1999629382757630597321n);
    });
});

describe('buyer disputes deal', function() {
    it ('open another deal', async function() {
        Market = await Market.connect(buyer);
        const response = Market.createDeal(
            offers[2][0],
            1234_500000,
            'IBAN:DE89370400440532013000',
        ).then((tx) => tx.wait()).then(receipt => {
            const DealCreated = Market.interface.parseLog(receipt.logs[9]);
            deal = DealCreated.args[2];
            return receipt;
        });
        await expect(response)
            .to.emit(Market, 'DealCreated')
            .withArgs(offers[2][0], mediator.address, anyValue);
        deal = await ethers.getContractAt('Deal', deal);
    });
    it ('accepted by seller', async function() {
        deal = await deal.connect(seller);
        await expect(deal.accept()).to.emit(deal, 'DealState').emit(MockETH, 'Transfer');
    });
    it ('deal disputed', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.dispute(deal)).to.emit(deal, 'DealState');
    });
});

describe('Cancelation by state', async function() {
    async function openDeal(provider, offer) {
        Market = await Market.connect(provider);
        const response = Market.createDeal(offer[0], 1234_500000, 'IBAN:DE89370400440532013000', )
            .then((tx) => tx.wait()).then(receipt => {
            receipt.logs.forEach(log => {
                const DealCreated = Market.interface.parseLog(log);
                if (DealCreated) deal = DealCreated.args[2];
            });
            return receipt;
        });
        await expect(response)
            .to.emit(Market, 'DealCreated')
            .withArgs(offer[0], mediator.address, anyValue);
        deal = await ethers.getContractAt('Deal', deal);
    }

    it ('everyone can cancel before acceptance', async function() {
        await openDeal(seller, offers[7]);
        deal = await deal.connect(seller);
        await expect(deal.cancel()).to.emit(deal, 'DealState');
        await openDeal(buyer, offers[1]);
        deal = await deal.connect(buyer);
        await expect(deal.cancel()).to.emit(deal, 'DealState');
    });

    it ('seller cannot cancel after acceptance', async function() {
        await openDeal(seller, offers[7]);
        await deal.connect(buyer).accept();
        await expect(deal.cancel()).to.be.reverted;
    });

    it ('seller can cancel if not accepted in time', async function() {
        await openDeal(seller, offers[7]);
        await ethers.provider.send('evm_increaseTime', [901]);
        await expect(deal.connect(seller).cancel()).to.emit(deal, 'DealState');
    });

    it ('seller can cancel if not paid in time', async function() {
        await openDeal(seller, offers[7]);
        await deal.connect(buyer).accept();
        await ethers.provider.send('evm_increaseTime', [3601]);
        await expect(deal.connect(seller).cancel()).to.emit(deal, 'DealState');
    });
});

describe('Messaging', function() {
    it('seller sends message', async function() {
        deal = await deal.connect(seller);
        await expect(deal.message('Hello buyer!')).to.emit(deal, 'Message');
    });
    it('buyer sends message', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.message('Hello seller!')).to.emit(deal, 'Message');
    });
});

describe('Feedback', function() {
    it('seller rates buyer', async function() {
        deal = await deal.connect(seller);
        await expect(deal.feedback(true, 'good')).to.emit(deal, 'FeedbackGiven');
    });
    it('buyer rates seller', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.feedback(false, 'bad')).to.emit(deal, 'FeedbackGiven');
    });
});
