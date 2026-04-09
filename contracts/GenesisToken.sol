// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title GenesisToken
 * @dev The native utility and governance token for the Genesis Prediction Protocol.
 */
contract GenesisToken is ERC20, Ownable, ERC20Permit {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion GEN

    constructor(address initialOwner)
        ERC20("Genesis", "GEN")
        Ownable(initialOwner)
        ERC20Permit("Genesis")
    {
        _mint(initialOwner, MAX_SUPPLY);
    }

    /**
     * @dev Allows the owner (or governance) to burn tokens from their balance.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
