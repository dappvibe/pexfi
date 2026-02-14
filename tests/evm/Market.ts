import MarketModule from '../../evm/modules/Market.ts';
import {expect} from 'chai';

let Uniswap, Tokens = {},
    PriceFeeds = {}, Profile, Market, DealFactory, OfferFactory,
    deployer, buyer, seller, mediator,
    offers = [], deal;

let hre, ethers, ignition, config, network;
before(async function() {
  const hardhat = await import('hardhat');
  hre = hardhat.default;
  console.log('HRE keys:', Object.keys(hre.network));
  network = await hre.network.connect();
  ({ ethers, ignition } = network);
  config = hre.config;
  [deployer, seller, buyer, mediator] = await ethers.getSigners();
});

async function openDeal(provider, offer) {
    DealFactory = await DealFactory.connect(provider);
    const response = DealFactory.create(offer.target, 1234_500000, 'IBAN:DE89370400440532013000', )
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

describe('Deployment', function()
{
    describe('Mocks', () => {
        it ('ERC20 Tokens', async function() {
            const tokens = [
                ['WBTC', 8], ['WETH', 18], ['USDT', 6]
            ];
            const factory = await ethers.getContractFactory("MockERC20");
            for (const token of tokens) {
                const t = Tokens[token[0]] = await factory.deploy(...token);
                // deployer has all the tokens minted, share some for the tests
                await t.transfer(seller.address, BigInt(100000 * Math.pow(10, token[1])));
            }
        });

        it ('Uniswap Factory', async function() {
            Uniswap = await ethers.deployContract('MockUniswapV3Factory');
            // see uniswap contract for hardcoded return values
            Uniswap.setPool(Tokens['WBTC'], await ethers.deployContract('PoolBTC'));
            Uniswap.setPool(Tokens['WETH'], await ethers.deployContract('PoolETH'));
        });
    });

    describe ('Fiat oracles', function()
    {
        const fiats = {
            USD: 1_00000000, EUR: 1_06927500, THB: 36_43338519
        }
        for (let fiat in fiats) {
            it (`${fiat} is deployed`, async function() {
                PriceFeeds[fiat] = await ethers.deployContract('PriceFeed', [fiat]);
            });
            it (`set() ${fiat} rate`, async function() {
                await PriceFeeds[fiat].set(fiats[fiat]);
                const data = await PriceFeeds[fiat].latestRoundData();
                expect(data[1]).to.eq(fiats[fiat]);
            });
        }
    });

    describe('Market', function()
    {
        this.timeout(20000);

        it ('ignition bundle', async function() {
            ({ Market, OfferFactory, DealFactory, Profile } = await ignition.deploy(MarketModule, {
                parameters: { Market: {
                    uniswap: Uniswap.target,
                    addTokens_0: Object.values(Tokens).map(t => t.target),
                    addTokens_1: 500,
                    fiats: [
                        ['USD', PriceFeeds['USD'].target],
                        ['EUR', PriceFeeds['EUR'].target],
                        ['THB', PriceFeeds['THB'].target],
                        ['XXX', ethers.ZeroAddress] // this will be removed
                    ],
                    methods: [
                        ['Zelle', 0],
                        ['SEPA', 0],
                    ]
                }},
                deploymentId: 'test',
            }));
            await expect(await Market.owner()).to.eq(deployer.address);
            await expect(await Market.mediator()).to.eq(deployer.address);
            await expect(await Market.offerFactory()).to.not.eq(ethers.ZeroAddress);
            await expect(await Market.dealFactory()).to.not.eq(ethers.ZeroAddress);
            await expect(await Market.profile()).to.not.eq(ethers.ZeroAddress);

            await expect(await OfferFactory.market()).to.eq(Market.target);
            await expect(await DealFactory.market()).to.eq(Market.target);
            await expect(await Profile.hasRole(ethers.encodeBytes32String('MARKET_ROLE'), Market.target)).to.be.true;
        });

        it ('set mediator', async function () {
            await Market.setMediator(mediator.address);
            expect(await Market.mediator()).to.eq(mediator.address);
        })
    });
});

describe('UI fetch inventory', function ()
{
    let tokens, fiats, methods = [];

    it ('get tokens', async function() {
        tokens = await Market.getTokens();
        expect(tokens).to.have.length(3);
    });

    it ('get fiats', async function() {
        fiats = await Market.getFiats();
        fiats = fiats.map(ethers.decodeBytes32String);
        expect(fiats).to.have.length(4);
    });

    it ('get methods', async function() {
        methods = await Market.getMethods();
        await expect(methods).to.have.length(2);
    });

    it ('get prices', async function() {
        expect(await Market.getPrice('WETH', "USD")).to.eq(3474_809672); // 3474.8096 USDT per ETH
        expect(await Market.getPrice('WETH', "EUR")).to.eq(3249_687565);
        expect(await Market.getPrice('USDT', "USD")).to.eq(1000000);
        expect(await Market.getPrice('USDT', "EUR")).to.eq(935213);
    });
});

describe('Users post offers', function()
{
    it ('seller provides allowance', async function() {
        await Tokens['WBTC'].connect(seller).approve(Market.target, ethers.MaxUint256);
        await Tokens['WETH'].connect(seller).approve(Market.target, ethers.MaxUint256);
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
            OfferFactory = OfferFactory.connect(provider);
            const tx = await OfferFactory.create(params[0], params[1], params[2], params[3], params[4], [params[5], params[6]], params[7]);
            const receipt = await tx.wait();
            const OfferCreated = Market.interface.parseLog(receipt.logs[0]);
            const offer = await ethers.getContractAt('Offer', OfferCreated.args[3]);
            offers.push(offer);
            await expect(await offer.owner()).to.eq(await provider.getAddress());
        });
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
        await Tokens['USDT'].connect(seller).approve(Market.target, ethers.MaxUint256);
    });

    it('deal created', async function() {
        DealFactory = await DealFactory.connect(seller);
        const response = DealFactory.create(offers[7].target, 5002000000n, 'zelle@google.com')
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

    it ('no deposit before accept', async function() {
        await expect(Tokens['USDT'].balanceOf(deal.target)).to.eventually.eq(0);
    })

    it ('accepted by owner', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.accept()).to.emit(deal, 'DealState').not.emit(Tokens['USDT'], 'Transfer');
    });

    it ('funded by seller', async function() {
        deal = await deal.connect(seller);
        await expect(deal.fund()).to.emit(deal, 'DealState').emit(Tokens['USDT'], 'Transfer');
    });

    it ('USDT is deposited', async function() {
        await expect(Tokens['USDT'].balanceOf(deal.target)).to.eventually.eq(5027135678);
    })
});

describe('Buyer opens deal', function() {
    it('WETH to EUR created', async function() {
        deal = await openDeal(buyer, offers[2]);
    });

    it ('deal token amount in wei', async function() {
        await expect(deal.tokenAmount()).to.eventually.eq(370617242369402679n);
    });

    it ('accepted by owner', async function() {
        deal = await deal.connect(seller);
        await expect(deal.accept()).to.emit(deal, 'DealState').not.emit(Tokens['WETH'], 'Transfer');
    });

    it ('funded by seller', async function() {
        await expect(deal.fund()).to.emit(deal, 'DealState').emit(Tokens['WETH'], 'Transfer');
    });

    it ('tokens are deposited', async function() {
        await expect(Tokens['WETH'].balanceOf(deal.target)).to.eventually.eq(370617242369402679n);
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
            .emit(Tokens['WETH'], 'Transfer')
            .emit(Tokens['WETH'], 'Transfer');
    });
    it('buyer receives tokens', async function() {
        await expect(Tokens['WETH'].balanceOf(buyer.address)).to.eventually.eq(366911069945708653n);
    });
    it('mediator receives fees', async function() {
        await expect(Tokens['WETH'].balanceOf(mediator.address)).to.eventually.eq(3706172423694026n);
    });
});

// this must be tested on a completed deal because of state requirement
describe('Feedback', function() {
    it ('users create profiles', async function() {
        await Profile.connect(seller).register();
        await Profile.connect(buyer).register();
    });

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
    it ('accepted and funded by seller', async function() {
        deal = await openDeal(buyer, offers[2]);
        deal = await deal.connect(seller);
        await expect(deal.accept()).to.emit(deal, 'DealState').not.emit(Tokens['WETH'], 'Transfer');
        await expect(deal.fund()).to.emit(deal, 'DealState').emit(Tokens['WETH'], 'Transfer');
    });
    it('seller cannot cancel', async function() {
        deal = await deal.connect(seller);
        const response = deal.cancel().then((tx) => tx.wait());
        await expect(response).to.reverted;
    });
    it('buyer can cancel after funding', async function() {
        deal = await openDeal(buyer, offers[2]);
        deal = await deal.connect(seller);
        await deal.accept();
        await deal.fund();
        deal = await deal.connect(buyer);
        const response = deal.cancel().then((tx) => tx.wait());
        await expect(response).to
            .emit(deal, 'DealState')
            .emit(Tokens['WETH'], 'Transfer');
    });
    it ('seller gets refund', async function() {
        await expect(Tokens['WETH'].balanceOf(deal.target)).to.eventually.eq(0);
        await expect(Tokens['WETH'].balanceOf(seller.address)).to.eventually.eq(99999258765515252806034n);
    });
});

describe('buyer disputes deal', function() {
    it ('open another deal', async function() {
        deal = await openDeal(buyer, offers[2]);
    });
    it ('accepted and funded by seller', async function() {
        deal = await deal.connect(seller);
        await expect(deal.accept()).to.emit(deal, 'DealState').not.emit(Tokens['WETH'], 'Transfer');
        await expect(deal.fund()).to.emit(deal, 'DealState').emit(Tokens['WETH'], 'Transfer');
    });
    it ('deal disputed', async function() {
        deal = await deal.connect(buyer);
        await expect(deal.dispute(deal)).to.emit(deal, 'DealState');
    });
});

describe('Cancellation by state', async function() {
    it ('only owner can cancel during acceptance window', async function() {
        deal = await openDeal(seller, offers[7]);
        deal = await deal.connect(seller);
        await expect(deal.cancel()).to.reverted;
        deal = await openDeal(seller, offers[7]);
        deal = await deal.connect(buyer);
        await expect(deal.cancel()).to.not.reverted;
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
        let stats = await Profile.stats(1);
        await expect(stats[5]).to.eq(1);
        stats = await Profile.stats(2);
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
