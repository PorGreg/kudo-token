// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

/// @custom:security-contact porgreg@gmail.com
contract KudoToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    mapping(address => uint16) public mintable;
    mapping(address => uint16) public minted;

    constructor() ERC721('KudoToken', 'KT') {}

    function setMintable(address to, uint16 amount) public onlyOwner {
        mintable[to] = amount;
    }

    function safeMint(
        address from,
        address to,
        string memory uri
    ) public onlyOwner {
        require(
            mintable[from] > minted[from],
            'Cannot mint more Kudos to this address'
        );
        minted[from]++;
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0), 'You cannot transfer this Kudo');
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        require(msg.sender == address(0), 'You cannot burn this Kudo');
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
