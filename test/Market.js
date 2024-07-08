const {expect} = require("chai");
const {ethers, upgrades, ignition} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {deployMockERC20} = require("./mocks")
const DealFactoryModule = require("../ignition/modules/DealFactory");
const OfferFactoryModule = require("../ignition/modules/OfferFactory");

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
    PriceFeeds = {}, RepToken, Market, DealFactory, OfferFactory,
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

async function openDeal(provider, offer) {
    Market = await Market.connect(provider);
    const response = Market.createDeal(offer[0], 1234_500000, 'IBAN:DE89370400440532013000', )
        .then((tx) => tx.wait()).then(receipt => {
            receipt.logs.forEach(log => {
                const DealCreated = Market.interface.parseLog(log);
                if (DealCreated) deal = DealCreated.args[3];
            });
            return receipt;
        });
    await expect(response).to.emit(Market, 'DealCreated');
    return await ethers.getContractAt('Deal', deal);
}

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
        it ('Mint tokens for users in this test', async function() {
            let signed = await RepToken.connect(buyer);
            await signed.register();
            await expect(signed.ownerToTokenId(buyer)).to.eventually.eq(1);
            signed = await RepToken.connect(seller);
            await signed.register();
            return expect(signed.ownerToTokenId(seller)).to.eventually.eq(2);
        })
    });

    describe('Market', function() {
        it ('is upgradable', async function() {
            const MarketFactory = await ethers.getContractFactory("Market");
            expect(upgrades.validateImplementation(MarketFactory)).to.eventually.be.undefined; // no error
        });

        it ('is deployed', async function() {
            Market = await ethers.deployContract('Market');
            await Market.initialize(RepToken.target, MockUniswap.target).then(tx => tx.wait());
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

        it ('add supported tokens', async function() {
            const tokens = [MockBTC.target, MockETH.target, MockUSDT.target, MockDummy.target];
            await expect(Market.addTokens(tokens, 500)).to.not.reverted;
        });

        it ('remove a token', async function() {
            const kill = await MockDummy.symbol();
            await expect(Market.removeTokens([kill])).to.not.reverted;
        });

        it ('add supported fiats', async function() {
            let fiats = [];
            for (const [key, value] of Object.entries(PriceFeeds)) {
                fiats.push([key, value.target]);
            }
            await expect(Market.addFiats(fiats)).to.not.reverted;
        });

        it ('remove a fiat', async function() {
            await expect(Market.removeFiats(['XXX'])).to.not.reverted;
        });


        // this is an expensive, but required one-time operation. Mediators must know the methods to solve disputes.
        it('add payment methods', async function() {
            const methods = [
                {name: 'Zelle', group: 3, country: 188},
                {name: 'SEPA',  group: 3, country: 1},
                {name: 'Monero', group: 1, country: 0},
                {name: 'Cash To ATM',  group: 2, country: 0},
            ];
            await expect(Market.addMethods(methods)).to.not.reverted;
        });

        it ('remove a payment method' , async function() {
            const receipt = await Market.removeMethods(['Monero']).then((tx) => tx.wait());
            await expect(receipt).to.not.reverted;
        });
    });

    describe('DealFactory', function() {
        it ('is deployed', async function() {
            const res = await ignition.deploy(DealFactoryModule);
            DealFactory = res.DealFactory;
            expect(DealFactory.target).to.be.properAddress;
            expect(await DealFactory.initialize(Market.target)).to.not.reverted;
            expect(await Market.setDealFactory(DealFactory.target)).to.not.reverted;
        });
    });

    describe('OfferFactory', function() {
        it ('is deployed', async function() {
            const res = await ignition.deploy(OfferFactoryModule);
            OfferFactory = res.OfferFactory;
            expect(OfferFactory.target).to.be.properAddress;
            expect(await OfferFactory.initialize(Market.target)).to.not.reverted;
            expect(await Market.setOfferFactory(OfferFactory.target)).to.not.reverted;
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
        tokens = await Market.getTokens();
        expect(tokens).to.have.length(3);
        expect(tokens[0][1]).to.eq('WBTC');
        expect(tokens[1][1]).to.eq('WETH');
        expect(tokens[2][1]).to.eq('USDT');
    });

    it ('get fiats', async function() {
        fiats = await Market.getFiats();
        fiats = fiats.map(ethers.decodeBytes32String);
        expect(fiats).to.have.length(2);
        expect(fiats[0]).to.eq('THB');
        expect(fiats[1]).to.eq('EUR');
    });

    it ('get methods', async function() {
        methods = await Market.getMethods();
        await expect(methods).to.have.length(3);
        await expect(methods[0][0]).to.eq('Zelle');
        await expect(methods[1][0]).to.eq('SEPA');
        await expect(methods[2][0]).to.eq('Cash To ATM');
    });

    it ('get prices', async function() {
        await expect(Market.getPrice(await MockETH.symbol(), "USD")).to.eventually.eq(3474_809672); // 3474.8096 USDT per ETH
        await expect(Market.getPrice(await MockETH.symbol(), "EUR")).to.eventually.eq(3249_687565);
        await expect(Market.getPrice(await MockUSDT.symbol(), "USD")).to.eventually.eq(1000000);
        await expect(Market.getPrice(await MockUSDT.symbol(), "EUR")).to.eventually.eq(935213);
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
            const tx = await OfferFactory.create(params[0], params[1], params[2], params[3], params[4], [params[5], params[6]], params[7]);
            const receipt = await tx.wait();
            const OfferCreated = Market.interface.parseLog(receipt.logs[1]);
            offers.push(OfferCreated.args[3]);
            expect(OfferCreated.args[3]).to.properAddress;
        });
    });

    describe('Get an offer', async function() {
        await expect(Market.getOffer(offers[0][0])).to.eventually.have.length(9);
    });

    describe('invalid input', async function() {
        function params(i, replace) {
            const p = [true, 'WBTC', 'USD', 'Zelle', 10250, [1000, 5000], ''];
            p[i] = replace;
            return p;
        }
        it('invalid token', async function() {
            await expect(OfferFactory.create(...params(1, 'XXX'))).to.be.reverted;
        });

        it('invalid fiat', async function() {
            await expect(OfferFactory.create(...params(2, 'USDT'))).to.be.reverted;
            await expect(OfferFactory.create(...params(2, 'XXX'))).to.be.reverted;
        });

        it('invalid method', async function() {
            await expect(OfferFactory.create(...params(3, 'Hugs and kisses'))).to.be.reverted;
        });

        it('invalid rate', async function() {
            await expect(OfferFactory.create(...params(4, 0))).to.be.reverted;
        });

        it ('invalid limits', async function() {
            await expect(OfferFactory.create(...params(5, [100, 0]))).to.be.reverted;
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
                    if (DealCreated) deal = DealCreated.args[3];
                });
                return receipt;
            });
        await expect(response)
            .to.emit(Market, 'DealCreated');
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
        deal = await openDeal(buyer, offers[2]);
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

// this must be tested on a completed deal because of state rquirement
describe('Feedback', function() {
    it('seller rates buyer', async function() {
        deal = await deal.connect(seller);
        await expect(deal.feedback(true, 'good')).to.emit(deal, 'FeedbackGiven');
    });
    it('cannot post twice', async function() {
        deal = await deal.connect(seller);
        await expect(deal.feedback(true, 'good')).to.reverted;
    });
    it('buyer rates seller', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.feedback(false, 'bad')).to.emit(deal, 'FeedbackGiven');
    });
    it('cannot post twice', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.feedback(true, 'good')).to.reverted;
    });
});

describe('Buyer cancels deal', function() {
    it ('accepted by seller', async function() {
        deal = await openDeal(buyer, offers[2]);
        deal = await deal.connect(seller);
        await expect(deal.accept()).to.emit(deal, 'DealState').emit(MockETH, 'Transfer');
    });
    it('seller cannot cancel', async function() {
        deal = await deal.connect(seller);
        const response = deal.cancel().then((tx) => tx.wait());
        await expect(response).to.reverted;
    });
    it('buyer can cancel after acceptance', async function() {
        deal = await openDeal(buyer, offers[2]);
        deal = await deal.connect(seller);
        await deal.accept();
        deal = await deal.connect(buyer);
        const response = deal.cancel().then((tx) => tx.wait());
        await expect(response).to
            .emit(deal, 'DealState')
            .emit(MockETH, 'Transfer');
    });
    it ('seller gets refund', async function() {
        await expect(MockETH.balanceOf(deal.target)).to.eventually.eq(0);
        await expect(MockETH.balanceOf(seller.address)).to.eventually.eq(1999258765515261194642n);
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
            deal = DealCreated.args[3];
            return receipt;
        });
        await expect(response)
            .to.emit(Market, 'DealCreated');
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
    it ('noone can cancel during acceptance window', async function() {
        deal = await openDeal(seller, offers[7]);
        deal = await deal.connect(seller);
        await expect(deal.cancel()).to.reverted;
        deal = await openDeal(seller, offers[7]);
        deal = await deal.connect(buyer);
        await expect(deal.cancel()).to.reverted;
    });
    it ('everyone can cancel when acceptance window expired', async function() {
        deal = await openDeal(seller, offers[7]);
        await ethers.provider.send('evm_increaseTime', [1000]);
        deal = await deal.connect(seller);
        await expect(deal.cancel()).to.emit(deal, 'DealState');
        deal = await openDeal(buyer, offers[1]);
        await ethers.provider.send('evm_increaseTime', [1000]);
        deal = await deal.connect(buyer);
        await expect(deal.cancel()).to.emit(deal, 'DealState');
    });
    it ('offer owner get expired deal recorded if not accepted in time', async function() {
        let stats = await RepToken.stats(1);
        await expect(stats[5]).to.eq(1);
        stats = await RepToken.stats(2);
        await expect(stats[5]).to.eq(1);
    });

    it ('seller cannot cancel after acceptance', async function() {
        deal = await openDeal(seller, offers[7]);
        await deal.connect(buyer).accept();
        await expect(deal.cancel()).to.be.reverted;
    });

    it ('seller can cancel if not accepted in time', async function() {
        deal = await openDeal(seller, offers[7]);
        await ethers.provider.send('evm_increaseTime', [901]);
        await expect(deal.connect(seller).cancel()).to.emit(deal, 'DealState');
    });

    it ('seller can cancel if not paid in time', async function() {
        deal = await openDeal(seller, offers[7]);
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
