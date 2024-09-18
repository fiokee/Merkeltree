const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');

async function main() {
  const csv = fs.readFileSync('./airdrop.csv', 'utf-8');
  const lines = csv.split('\n').slice(1); // Remove header row
  const leaves = lines.map(line => {
    const [address, amount] = line.split(',');
    return keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [address.trim(), amount.trim()]));
  });

  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = merkleTree.getHexRoot();
  console.log('Merkle Root:', root);

  // Save proof for a specific address (example for unit testing)
  const leaf = leaves[0];
  const proof = merkleTree.getHexProof(leaf);
  console.log('Merkle Proof for first address:', proof);
}

main();
