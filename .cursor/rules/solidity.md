# Solidity Smart Contract Development Rules

## Overview
Rules for developing secure, gas-efficient Solidity smart contracts.

## Applies To
- `contracts/**/*.sol` - All Solidity contract files
- `test/**/*.js` - Test files
- `scripts/**/*.js` - Deployment scripts

---

## Security First

### Reentrancy Protection
- ALWAYS follow Checks-Effects-Interactions pattern
- Use `ReentrancyGuard` from OpenZeppelin for functions with external calls
- Update state BEFORE making external calls

```solidity
// CORRECT: State updated before external call
function withdraw() external nonReentrant {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "No balance");
    balances[msg.sender] = 0;  // Effect first
    (bool success, ) = msg.sender.call{value: amount}("");  // Interaction last
    require(success, "Transfer failed");
}
```

### Access Control
- ALWAYS protect privileged functions with access control
- Use OpenZeppelin's `Ownable` or `AccessControl`
- NEVER use `tx.origin` for authentication (use `msg.sender`)

### Input Validation
- Validate all external inputs
- Check for zero addresses: `require(addr != address(0), "Zero address")`
- Validate array bounds before access

---

## Gas Optimization

### Storage
- Pack storage variables (uint128, uint128 in same slot vs two uint256)
- Use `calldata` instead of `memory` for read-only external array parameters
- Prefer `mapping` over arrays for lookups

### Loops
- Use `unchecked { ++i }` for loop counters (safe in Solidity 0.8+)
- Avoid unbounded loops that could exceed block gas limit
- Cache array length outside loop

```solidity
// OPTIMIZED loop
uint256 length = array.length;
for (uint256 i = 0; i < length; ) {
    // process
    unchecked { ++i; }
}
```

---

## Code Quality

### Events
- Emit events for ALL state changes
- Use indexed parameters for filterable fields (addresses, IDs)
- Event names should describe what happened

```solidity
event TokenTransferred(address indexed from, address indexed to, uint256 amount);
```

### Error Handling
- Use custom errors for gas efficiency (Solidity 0.8.4+)
- Provide descriptive error messages
- Use `require` for input validation, `revert` for complex conditions

```solidity
error InsufficientBalance(uint256 requested, uint256 available);

function withdraw(uint256 amount) external {
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(amount, balances[msg.sender]);
    }
}
```

### Documentation
- Use NatSpec comments for all public/external functions
- Document parameters, return values, and possible reverts

```solidity
/// @notice Transfers tokens to a recipient
/// @param to The recipient address
/// @param amount The amount to transfer
/// @return success Whether the transfer succeeded
function transfer(address to, uint256 amount) external returns (bool success);
```

---

## Testing Requirements

### Coverage
- Test all public/external functions
- Test success AND failure cases
- Test edge cases (zero values, max values, empty arrays)
- Test access control (authorized AND unauthorized callers)

### Test Structure
```javascript
describe("Contract", function () {
    describe("Deployment", function () { /* deployment tests */ });
    describe("Function", function () {
        it("Should succeed when...", async function () { });
        it("Should fail when...", async function () { });
    });
});
```

---

## OpenZeppelin Usage

### Recommended Contracts
- `ERC20`, `ERC721`, `ERC1155` - Token standards
- `Ownable`, `AccessControl` - Access control
- `ReentrancyGuard` - Reentrancy protection
- `Pausable` - Emergency stop
- `SafeERC20` - Safe token transfers

### Import Pattern
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| `tx.origin` auth | Phishing attacks | Use `msg.sender` |
| Floating pragma | Inconsistent builds | Lock to `0.8.24` |
| Unchecked calls | Silent failures | Check return values |
| Public secrets | All data is public | Never store secrets on-chain |
| Push payments | DoS vulnerability | Use pull-over-push |

---

## Hardhat Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run tests with gas report
REPORT_GAS=true npx hardhat test

# Start local node
npx hardhat node

# Deploy to local
npx hardhat run scripts/deploy.js --network localhost

# Open console
npx hardhat console --network localhost
```
