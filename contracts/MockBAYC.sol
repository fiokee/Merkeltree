// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockBAYC is ERC721 {
    uint256 private _tokenIdCounter;

    constructor() ERC721("Bored Ape Yacht Club", "BAYC") {}

    function mint(address to) external {
        _tokenIdCounter++;
        _mint(to, _tokenIdCounter);
    }
}
