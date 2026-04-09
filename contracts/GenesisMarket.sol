// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GenesisMarket
 * @dev Handles multi-outcome prediction markets, liquidity, and settlement.
 */
contract GenesisMarket is Ownable {
    IERC20 public collateralToken; // e.g., USDC
    
    struct Outcome {
        uint256 id;
        string title;
        uint256 reserves;
    }

    struct Market {
        uint256 id;
        string title;
        uint256 totalLiquidity;
        uint256 resolvedOutcomeId;
        bool isResolved;
        uint256 endTime;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(uint256 => Outcome)) public marketOutcomes;
    mapping(uint256 => uint256) public outcomeCounts;

    event MarketCreated(uint256 indexed marketId, string title, uint256 endTime);
    event MarketResolved(uint256 indexed marketId, uint256 winningOutcomeId);
    event SharesBought(uint256 indexed marketId, address indexed buyer, uint256 outcomeId, uint256 amount);

    constructor(address _collateralToken, address initialOwner) Ownable(initialOwner) {
        collateralToken = IERC20(_collateralToken);
    }

    function createMarket(
        uint256 marketId,
        string memory title,
        string[] memory outcomeTitles,
        uint256 endTime
    ) external onlyOwner {
        require(markets[marketId].endTime == 0, "Market already exists");
        require(outcomeTitles.length >= 2, "Must have at least 2 outcomes");

        markets[marketId] = Market({
            id: marketId,
            title: title,
            totalLiquidity: 0,
            resolvedOutcomeId: 0,
            isResolved: false,
            endTime: endTime
        });

        for (uint256 i = 0; i < outcomeTitles.length; i++) {
            marketOutcomes[marketId][i] = Outcome({
                id: i,
                title: outcomeTitles[i],
                reserves: 0
            });
        }
        outcomeCounts[marketId] = outcomeTitles.length;

        emit MarketCreated(marketId, title, endTime);
    }

    // Additional functions for buying/selling shares via CPMM and resolving markets would go here.
}
