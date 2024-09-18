const { expect } = require('chai');
const { ethers } = require('hardhat');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

describe('Merkle Airdrop', function () {
    let token, airdrop, baycNFT, merkleTree, owner, addr1, addr2;
    let merkleRoot, leaf, proof;

    beforeEach(async function () {
        // Deploy mock ERC20 token and BAYC NFT
        const MockERC20 = await ethers.getContractFactory('MockERC20');
        token = await MockERC20.deploy();
        await token.deployed();

        const MockBAYC = await ethers.getContractFactory('MockBAYC');
        baycNFT = await MockBAYC.deploy();
        await baycNFT.deployed();

        // Prepare the Merkle tree
        [owner, addr1, addr2] = await ethers.getSigners();
        const airdropEntries = [
            { address: owner.address, amount: 1000 },
            { address: addr1.address, amount: 2000 }
        ];
        const leaves = airdropEntries.map(entry => keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [entry.address, entry.amount])));
        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        merkleRoot = merkleTree.getHexRoot();
        leaf = leaves[0];
        proof = merkleTree.getHexProof(leaf);

        // Deploy the Airdrop contract
        const MerkleAirdrop = await ethers.getContractFactory('MerkleAirdrop');
        airdrop = await MerkleAirdrop.deploy(token.address, merkleRoot, baycNFT.address);
        await airdrop.deployed();

        // Mint tokens and BAYC NFTs
        await token.mint(airdrop.address, 10000);
        await baycNFT.mint(owner.address);
        await baycNFT.mint(addr1.address);
    });

    it('Should allow eligible users to claim their airdrop if they own a BAYC NFT', async function () {
        await airdrop.claim(1000, proof);
        const balance = await token.balanceOf(owner.address);
        expect(balance).to.equal(1000);
    });

    it('Should not allow users without a BAYC NFT to claim', async function () {
        await baycNFT.transferFrom(addr1.address, addr2.address, 1); // Transfer BAYC from addr1 to addr2
        const claimProof = merkleTree.getHexProof(keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [addr1.address, 2000])));
        await expect(airdrop.connect(addr1).claim(2000, claimProof)).to.be.revertedWith('Must own a BAYC NFT to claim.');
    });
});
