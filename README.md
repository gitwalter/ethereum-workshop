# Ethereum Smart Contract Workshop (L1)

> Learning project for the Cursor Agent Factory L1 Workshop

## Quick Start

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Start local blockchain node
npm run node

# Deploy to local network (in another terminal)
npm run deploy:local
```

## Project Structure

```
ethereum-workshop/
├── contracts/          # Solidity smart contracts
│   └── SimpleToken.sol # Your first ERC20 token
├── test/               # Test files
│   └── SimpleToken.test.js
├── scripts/            # Deployment scripts
│   └── deploy.js
├── hardhat.config.js   # Hardhat configuration
└── package.json
```

## Workshop Phases

### Phase 1: Concept (30 min)
- Understand EVM architecture
- Learn about gas and storage costs
- Explore account types (EOA vs Contract)

### Phase 2: Demo (30 min)
- Walk through SimpleToken.sol
- Understand ERC20 standard
- Learn OpenZeppelin patterns

### Phase 3: Exercise (45 min)
- Build a Voting contract
- Add access control
- Write comprehensive tests

### Phase 4: Challenge (30 min)
- Create a Mini-NFT (ERC721)
- Implement minting logic
- Add metadata storage

### Phase 5: Reflection (15 min)
- Review security best practices
- Discuss gas optimization
- Plan next steps

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile all contracts |
| `npm run test` | Run all tests |
| `npm run node` | Start local Hardhat node |
| `npm run deploy:local` | Deploy to localhost |
| `npm run clean` | Clear cache and artifacts |

## Documentation

- **[Learning Guide](docs/LEARNING_GUIDE.md)** — Comprehensive guide covering all Ethereum development concepts

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethereum Developer Docs](https://ethereum.org/developers)

---

*Part of the Cursor Agent Factory Learning Workshop Ecosystem*
