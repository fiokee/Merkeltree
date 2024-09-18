// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    IERC20 public token;
    bytes32 public merkleRoot;
    IERC721 public baycNFT;
    mapping(address => bool) public claimed;

    constructor(address _tokenAddress, bytes32 _merkleRoot, address _baycAddress) {
        token = IERC20(_tokenAddress);
        merkleRoot = _merkleRoot;
        baycNFT = IERC721(_baycAddress);
    }

    function claim(uint256 amount, bytes32[] calldata proof) external {
        require(!claimed[msg.sender], "Airdrop already claimed.");
        require(baycNFT.balanceOf(msg.sender) > 0, "Must own a BAYC NFT to claim.");
        
        // Verify the Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid Merkle proof.");

        claimed[msg.sender] = true;
        require(token.transfer(msg.sender, amount), "Token transfer failed.");
    }
}
