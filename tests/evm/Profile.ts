import ProfileModule from '../../evm/modules/Profile.ts';
import {expect} from 'chai';

let ethers, ignition;
let profile, deployer, seller, buyer, coolhacker;

before(async function() {
    const hardhat = await import('hardhat');
    const hre = hardhat.default;
    const network = await hre.network.connect();
    ({ ethers, ignition } = network);
    [deployer, seller, buyer, coolhacker] = await ethers.getSigners();
});

export async function deployProfile() {
    const { Profile } = await ignition.deploy(ProfileModule, { deploymentId: 'profile-test' });
    return Profile;
}

describe("Profile", function(){
    this.timeout(20000);

    before(async function() {
        profile = await deployProfile();
    });

    describe('deploy', function() {
        it('deployer is admin', async function() {
            await expect(profile.hasRole(ethers.ZeroHash, deployer.address))
                .to.eventually.true;
            await expect(profile.hasRole(ethers.ZeroHash, coolhacker.address))
                .to.eventually.false;
        });

        it('grant deployer MARKET_ROLE', async function() {
            const MARKET_ROLE = ethers.encodeBytes32String('MARKET_ROLE');
            await profile.grantRole(MARKET_ROLE, deployer.address);
            await expect(profile.hasRole(MARKET_ROLE, deployer.address)).to.eventually.true;
        });
    });

    describe('Registration', function() {
        it ('anyone can mint new profile', async function() {
            await profile.connect(seller).register();
            expect(profile.balanceOf(seller.address)).to.eventually.eq(1);
            await profile.connect(buyer).register();
            expect(profile.balanceOf(buyer.address)).to.eventually.eq(1);
            await profile.connect(coolhacker).register();
            expect(profile.balanceOf(coolhacker.address)).to.eventually.eq(1);
        });
    });

    describe('Market stats', function() {
        before(async function() {
            const MARKET_ROLE = ethers.encodeBytes32String('MARKET_ROLE');
            const DEAL_ROLE = ethers.encodeBytes32String('DEAL_ROLE');
            // DEAL_ROLE admin is MARKET_ROLE, so deployer (with MARKET_ROLE) can grant DEAL_ROLE
            await profile.grantRole(DEAL_ROLE, deployer.address);
        });

        it('increase deal count', async function() {
            await profile.statsDealCompleted(1);
            const stats = await profile.stats(1);
            expect(stats.dealsCompleted).to.eq(1);
        });
    });
});
