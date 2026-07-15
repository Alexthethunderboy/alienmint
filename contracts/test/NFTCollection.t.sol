// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {NFTCollection} from "../src/NFTCollection.sol";

contract NFTCollectionHarness is NFTCollection {
    constructor() NFTCollection("Harness", "HRN", "ipfs://harness/") {}

    function seedSupply(uint256 quantity) external {
        _mint(address(this), quantity);
    }
}

contract MintReceiver {
    function mint(NFTCollection collection, uint256 quantity) external payable {
        collection.publicMint{value: msg.value}(quantity);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

contract RejectingMintReceiver {
    function mint(NFTCollection collection) external payable {
        collection.publicMint{value: msg.value}(1);
    }
}

contract RejectingOwner {
    function withdraw(NFTCollection collection) external {
        collection.withdraw();
    }

    receive() external payable {
        revert("reject ETH");
    }
}

contract NFTCollectionTest is Test {
    event BaseURIUpdated(string previousURI, string newURI);
    NFTCollection public nft;

    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    string constant NAME = "NFT Collection";
    string constant SYMBOL = "NFTC";
    string constant BASE_URI = "ipfs://QmTestBaseURI/";

    uint256 constant MINT_PRICE = 0.05 ether;
    uint256 constant MAX_PER_TX = 5;
    uint256 constant MAX_SUPPLY = 10_000;

    // ──────────────────────────────────────────────
    //  Setup
    // ──────────────────────────────────────────────

    function setUp() public {
        vm.prank(owner);
        nft = new NFTCollection(NAME, SYMBOL, BASE_URI);

        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    // ──────────────────────────────────────────────
    //  Constructor & Initialization
    // ──────────────────────────────────────────────

    function test_Constructor_SetsNameAndSymbol() public view {
        assertEq(nft.name(), NAME);
        assertEq(nft.symbol(), SYMBOL);
    }

    function test_Constructor_SetsOwner() public view {
        assertEq(nft.owner(), owner);
    }

    function test_Constructor_StartsWithZeroSupply() public view {
        assertEq(nft.totalSupply(), 0);
    }

    function test_Constructor_RevertsOnEmptyBaseURI() public {
        vm.prank(owner);
        vm.expectRevert(NFTCollection.InvalidBaseURI.selector);
        new NFTCollection(NAME, SYMBOL, "");
    }

    function test_StartTokenId_ReturnsOne() public {
        // Mint one token and verify it has ID 1, not 0
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE}(1);
        assertEq(nft.ownerOf(1), alice);

        // Token ID 0 should not exist
        vm.expectRevert();
        nft.ownerOf(0);
    }

    // ──────────────────────────────────────────────
    //  Public Minting — Happy Paths
    // ──────────────────────────────────────────────

    function test_PublicMint_SingleToken() public {
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE}(1);

        assertEq(nft.totalSupply(), 1);
        assertEq(nft.ownerOf(1), alice);
        assertEq(nft.balanceOf(alice), 1);
    }

    function test_PublicMint_BatchOfFive() public {
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE * 5}(5);

        assertEq(nft.totalSupply(), 5);
        assertEq(nft.balanceOf(alice), 5);

        // Verify ownership of all five tokens
        for (uint256 i = 1; i <= 5; i++) {
            assertEq(nft.ownerOf(i), alice);
        }
    }

    function test_PublicMint_MultipleUsers() public {
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE * 3}(3);

        vm.prank(bob);
        nft.publicMint{value: MINT_PRICE * 2}(2);

        assertEq(nft.totalSupply(), 5);
        assertEq(nft.balanceOf(alice), 3);
        assertEq(nft.balanceOf(bob), 2);
    }

    function test_PublicMint_AccumulatesContractBalance() public {
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE * 3}(3);

        assertEq(address(nft).balance, MINT_PRICE * 3);
    }

    // ──────────────────────────────────────────────
    //  Public Minting — Reverts
    // ──────────────────────────────────────────────

    function test_PublicMint_RevertsOnZeroQuantity() public {
        vm.prank(alice);
        vm.expectRevert(NFTCollection.ZeroQuantity.selector);
        nft.publicMint{value: 0}(0);
    }

    function test_PublicMint_RevertsWhenExceedsMaxPerTx() public {
        vm.prank(alice);
        vm.expectRevert(NFTCollection.MintExceedsMaxPerTx.selector);
        nft.publicMint{value: MINT_PRICE * 6}(6);
    }

    function test_PublicMint_RevertsOnInsufficientPayment() public {
        // Underpay by 1 wei
        vm.prank(alice);
        vm.expectRevert(NFTCollection.InsufficientPayment.selector);
        nft.publicMint{value: MINT_PRICE - 1}(1);
    }

    function test_PublicMint_RevertsOnOverpayment() public {
        // Overpay by 1 wei — exact payment required
        vm.prank(alice);
        vm.expectRevert(NFTCollection.InsufficientPayment.selector);
        nft.publicMint{value: MINT_PRICE + 1}(1);
    }

    function testFuzz_PublicMint_ExactPayment(uint256 quantity) public {
        quantity = bound(quantity, 1, MAX_PER_TX);
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE * quantity}(quantity);

        assertEq(nft.totalSupply(), quantity);
        assertEq(nft.balanceOf(alice), quantity);
        assertLe(nft.totalSupply(), MAX_SUPPLY);
    }

    function testFuzz_PublicMint_RejectsWrongPayment(uint256 quantity, uint256 payment) public {
        quantity = bound(quantity, 1, MAX_PER_TX);
        uint256 requiredPayment = MINT_PRICE * quantity;
        payment = bound(payment, 0, 100 ether);
        vm.assume(payment != requiredPayment);
        vm.deal(alice, payment);

        vm.prank(alice);
        vm.expectRevert(NFTCollection.InsufficientPayment.selector);
        nft.publicMint{value: payment}(quantity);
    }

    function test_PublicMint_RevertsOnSupplyExhaustion() public {
        NFTCollectionHarness harness = new NFTCollectionHarness();
        harness.seedSupply(MAX_SUPPLY);
        assertEq(harness.totalSupply(), MAX_SUPPLY);

        // Attempting to mint one more should revert
        vm.prank(alice);
        vm.expectRevert(NFTCollection.MintExceedsMaxSupply.selector);
        harness.publicMint{value: MINT_PRICE}(1);
    }

    function test_PublicMint_RevertsWhenPartialBatchExceedsSupply() public {
        NFTCollectionHarness harness = new NFTCollectionHarness();
        harness.seedSupply(MAX_SUPPLY - 2);

        // Try to mint 5 when only 2 slots remain
        vm.prank(alice);
        vm.expectRevert(NFTCollection.MintExceedsMaxSupply.selector);
        harness.publicMint{value: MINT_PRICE * 5}(5);
    }

    function test_PublicMint_AllowsExactFinalSupply() public {
        NFTCollectionHarness harness = new NFTCollectionHarness();
        harness.seedSupply(MAX_SUPPLY - 2);

        vm.prank(alice);
        harness.publicMint{value: MINT_PRICE * 2}(2);
        assertEq(harness.totalSupply(), MAX_SUPPLY);
    }

    function test_PublicMint_SafeMintsToReceiver() public {
        MintReceiver receiver = new MintReceiver();
        receiver.mint{value: MINT_PRICE}(nft, 1);
        assertEq(nft.ownerOf(1), address(receiver));
    }

    function test_PublicMint_RevertsForInvalidReceiver() public {
        RejectingMintReceiver receiver = new RejectingMintReceiver();
        vm.expectRevert();
        receiver.mint{value: MINT_PRICE}(nft);
        assertEq(nft.totalSupply(), 0);
    }

    // ──────────────────────────────────────────────
    //  Token URI
    // ──────────────────────────────────────────────

    function test_TokenURI_ReturnsCorrectURI() public {
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE}(1);

        string memory expectedURI = string(abi.encodePacked(BASE_URI, "1"));
        assertEq(nft.tokenURI(1), expectedURI);
    }

    function test_SetBaseURI_UpdatesTokenURI() public {
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE}(1);

        string memory newBaseURI = "ipfs://QmNewBaseURI/";
        vm.expectEmit(false, false, false, true, address(nft));
        emit BaseURIUpdated(BASE_URI, newBaseURI);
        vm.prank(owner);
        nft.setBaseURI(newBaseURI);

        string memory expectedURI = string(abi.encodePacked(newBaseURI, "1"));
        assertEq(nft.tokenURI(1), expectedURI);
    }

    function test_SetBaseURI_RevertsForNonOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        nft.setBaseURI("ipfs://unauthorized/");
    }

    function test_SetBaseURI_RevertsOnEmptyURI() public {
        vm.prank(owner);
        vm.expectRevert(NFTCollection.InvalidBaseURI.selector);
        nft.setBaseURI("");
    }

    // ──────────────────────────────────────────────
    //  Withdrawal
    // ──────────────────────────────────────────────

    function test_Withdraw_TransfersBalanceToOwner() public {
        // Accumulate some ETH from minting
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE * 3}(3);

        uint256 contractBalance = address(nft).balance;
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        nft.withdraw();

        assertEq(address(nft).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + contractBalance);
    }

    function test_Withdraw_RevertsForNonOwner() public {
        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE}(1);

        vm.prank(alice);
        vm.expectRevert();
        nft.withdraw();
    }

    function test_Withdraw_SucceedsWithZeroBalance() public {
        // Withdraw with zero balance should succeed (sends 0 ETH)
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        nft.withdraw();

        assertEq(owner.balance, ownerBalanceBefore);
    }

    function test_Withdraw_RevertsWhenOwnerRejectsETH() public {
        RejectingOwner rejectingOwner = new RejectingOwner();
        vm.prank(owner);
        nft.transferOwnership(address(rejectingOwner));

        vm.prank(alice);
        nft.publicMint{value: MINT_PRICE}(1);

        vm.expectRevert(NFTCollection.WithdrawalFailed.selector);
        rejectingOwner.withdraw(nft);
        assertEq(address(nft).balance, MINT_PRICE);
    }

    function test_Ownership_CanBeTransferred() public {
        vm.prank(owner);
        nft.transferOwnership(alice);
        assertEq(nft.owner(), alice);
    }

    function test_Ownership_RejectsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("OwnableInvalidOwner(address)", address(0)));
        nft.transferOwnership(address(0));
    }

    // ──────────────────────────────────────────────
    //  Constants Verification
    // ──────────────────────────────────────────────

    function test_Constants_AreCorrect() public view {
        assertEq(nft.MAX_SUPPLY(), 10_000);
        assertEq(nft.MINT_PRICE(), 0.05 ether);
        assertEq(nft.MAX_PER_TX(), 5);
    }
}
