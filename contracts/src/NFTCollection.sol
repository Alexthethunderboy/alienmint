// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721A} from "erc721a/ERC721A.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NFTCollection
/// @author nweb
/// @notice Gas-optimized ERC721A NFT collection with public minting on Base Sepolia.
/// @dev Uses ERC721A for batch minting optimization, OZ Ownable for access control,
///      and OZ ReentrancyGuard for safe ETH handling.
contract NFTCollection is ERC721A, Ownable, ReentrancyGuard {
    // ──────────────────────────────────────────────
    //  Constants
    // ──────────────────────────────────────────────

    /// @notice Maximum number of tokens that can ever be minted.
    uint256 public constant MAX_SUPPLY = 10_000;

    /// @notice Price per token in wei (0.05 ETH).
    uint256 public constant MINT_PRICE = 0.05 ether;

    /// @notice Maximum number of tokens that can be minted in a single transaction.
    uint256 public constant MAX_PER_TX = 5;

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @dev Base URI for computing {tokenURI}.
    string private _baseTokenURI;

    // ──────────────────────────────────────────────
    //  Custom Errors (gas-efficient)
    // ──────────────────────────────────────────────

    /// @dev Thrown when the requested mint quantity is zero.
    error ZeroQuantity();

    /// @dev Thrown when the requested quantity exceeds MAX_PER_TX.
    error MintExceedsMaxPerTx();

    /// @dev Thrown when minting would exceed MAX_SUPPLY.
    error MintExceedsMaxSupply();

    /// @dev Thrown when msg.value does not match the required payment.
    error InsufficientPayment();

    /// @dev Thrown when an ETH transfer (withdrawal) fails.
    error WithdrawalFailed();

    /// @dev Thrown when an empty base URI is supplied.
    error InvalidBaseURI();

    /// @notice Emitted whenever the collection metadata base URI changes.
    event BaseURIUpdated(string previousURI, string newURI);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /// @param name_ The collection name (e.g., "NFT Collection").
    /// @param symbol_ The collection symbol (e.g., "NFTC").
    /// @param baseURI_ The initial base URI for token metadata.
    constructor(string memory name_, string memory symbol_, string memory baseURI_)
        ERC721A(name_, symbol_)
        Ownable(msg.sender)
    {
        if (bytes(baseURI_).length == 0) revert InvalidBaseURI();
        _baseTokenURI = baseURI_;
    }

    // ──────────────────────────────────────────────
    //  Public Minting
    // ──────────────────────────────────────────────

    /// @notice Mint `quantity` tokens to the caller.
    /// @param quantity The number of tokens to mint (1–5).
    /// @dev Requires exact ETH payment. Protected against reentrancy.
    function publicMint(uint256 quantity) external payable nonReentrant {
        if (quantity == 0) revert ZeroQuantity();
        if (quantity > MAX_PER_TX) revert MintExceedsMaxPerTx();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert MintExceedsMaxSupply();
        if (msg.value != MINT_PRICE * quantity) revert InsufficientPayment();

        _safeMint(msg.sender, quantity);
    }

    // ──────────────────────────────────────────────
    //  Owner Functions
    // ──────────────────────────────────────────────

    /// @notice Update the base URI for token metadata.
    /// @param baseURI_ The new base URI string.
    function setBaseURI(string calldata baseURI_) external onlyOwner {
        if (bytes(baseURI_).length == 0) revert InvalidBaseURI();
        string memory previousURI = _baseTokenURI;
        _baseTokenURI = baseURI_;
        emit BaseURIUpdated(previousURI, baseURI_);
    }

    /// @notice Withdraw the entire contract ETH balance to the owner.
    /// @dev Uses low-level call to forward all gas and avoid transfer/send limitations.
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success,) = payable(owner()).call{value: balance}("");
        if (!success) revert WithdrawalFailed();
    }

    // ──────────────────────────────────────────────
    //  Internal Overrides
    // ──────────────────────────────────────────────

    /// @dev Returns the base URI set by the owner.
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @dev Token IDs start at 1 instead of the default 0.
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
