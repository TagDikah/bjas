// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CaseAnchor {
    error NotAuthorized();
    error AlreadyAnchored();
    error HashAlreadyUsed();

    address public owner;
    mapping(address => bool) public writers;

    mapping(bytes32 => bool) public usedHash;
    mapping(string => bytes32) public latestHashForId;

    event Anchored(
        string indexed recordId,
        bytes32 indexed contentHash,
        bytes32 indexed prevHash,
        address actor,
        uint256 blockTime,
        string action
    );

    constructor() {
        owner = msg.sender;
        writers[msg.sender] = true;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier onlyWriter() {
        if (!writers[msg.sender]) revert NotAuthorized();
        _;
    }

    function setWriter(address who, bool allowed) external onlyOwner {
        writers[who] = allowed;
    }

    function anchor(
        string calldata recordId,
        bytes32 contentHash,
        string calldata action
    ) external onlyWriter {
        if (latestHashForId[recordId] == contentHash) revert AlreadyAnchored();
        if (usedHash[contentHash]) revert HashAlreadyUsed();

        bytes32 prev = latestHashForId[recordId];

        usedHash[contentHash] = true;
        latestHashForId[recordId] = contentHash;

        emit Anchored(recordId, contentHash, prev, msg.sender, block.timestamp, action);
    }

    function getLatestHash(string calldata recordId) external view returns (bytes32) {
        return latestHashForId[recordId];
    }
}