// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {NFTCollection} from "../src/NFTCollection.sol";

contract Deploy is Script {
    error InvalidDeploymentConfig(string field);

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deploying contracts with the account:", deployer);

        string memory name = vm.envString("NFT_NAME");
        string memory symbol = vm.envString("NFT_SYMBOL");
        string memory baseURI = vm.envString("NFT_BASE_URI");

        _validate(name, "NFT_NAME", "NFT Collection");
        _validate(symbol, "NFT_SYMBOL", "NFTC");
        _validate(baseURI, "NFT_BASE_URI", "ipfs://QmPlaceholderBaseURI/");

        vm.startBroadcast(deployerPrivateKey);

        NFTCollection nft = new NFTCollection(name, symbol, baseURI);

        vm.stopBroadcast();

        console2.log("NFTCollection deployed to:", address(nft));
    }

    function _validate(string memory value, string memory field, string memory placeholder) internal pure {
        if (bytes(value).length == 0 || keccak256(bytes(value)) == keccak256(bytes(placeholder))) {
            revert InvalidDeploymentConfig(field);
        }
    }
}
