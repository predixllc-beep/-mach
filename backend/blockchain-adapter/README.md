# Blockchain Adapter

This module serves as the bridge between the off-chain Genesis trading engine and the EVM-compatible blockchain.

## Responsibilities
- Listen to on-chain events (deposits, withdrawals, market resolutions)
- Submit off-chain state commitments to the blockchain (rollups/settlement)
- Interact with GenesisMarket and GenesisToken smart contracts
- Handle gas estimation and transaction signing (for protocol-managed wallets)
