import PexfiTokenModule from '../../evm/modules/PexfiToken.ts';
import {expect} from 'chai';

let PexfiToken;
let deployer;

let hre, ethers, ignition, network;

before(async function() {
  const hardhat = await import('hardhat');
  hre = hardhat.default;
  network = await hre.network.connect();
  ({ ethers, ignition } = network);
  [deployer] = await ethers.getSigners();
});

describe('PexfiToken', function() {
    it('deploys successfully', async function() {
        ({ pexfi: PexfiToken } = await ignition.deploy(PexfiTokenModule));
        expect(PexfiToken.target).to.not.eq(ethers.ZeroAddress);
    });

    it('has correct name and symbol', async function() {
        expect(await PexfiToken.name()).to.eq('Pexfi Token');
        expect(await PexfiToken.symbol()).to.eq('PEXFI');
    });

    it('mints initial supply to deployer', async function() {
        const decimals = await PexfiToken.decimals();
        const expectedSupply = 1_000_000n * 10n ** decimals;
        expect(await PexfiToken.totalSupply()).to.eq(expectedSupply);
        expect(await PexfiToken.balanceOf(deployer.address)).to.eq(expectedSupply);
    });

    it('supports permit', async function() {
         // Just check if DOMAIN_SEPARATOR exists, which implies Permit support
         expect(await PexfiToken.DOMAIN_SEPARATOR()).to.not.be.undefined;
    });
});
