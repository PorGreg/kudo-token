// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

/// @custom:security-contact porgreg@gmail.com
contract KudoToken is ERC721, ERC721URIStorage, Ownable {
    event Mint(uint256 tokenId, string cid);
    event SetMintable(address to, uint16 oldAmount, uint16 newAmount);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    mapping(address => uint16) public mintable;
    mapping(address => uint16) public minted;

    constructor() ERC721('KudoToken', 'KT') {}

    function setMintable(address to, uint16 amount) public onlyOwner {
        uint16 oldAmount = mintable[to];
        mintable[to] = amount;
        emit SetMintable(to, oldAmount, mintable[to]);
    }

    function safeMint(
        address from,
        address to,
        string memory cid
    ) public onlyOwner {
        require(from != to, '`from` and `to` addresses are the same');
        require(
            mintable[from] > minted[from],
            'This address cannot send more Kudo'
        );
        minted[from]++;
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, cid);
        emit Mint(tokenId, cid);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(
            from == address(0) || to == address(0),
            'You cannot transfer this Kudo'
        );
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, 'Only token owner can burn it');
        _burn(tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return 'ipfs://';
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
