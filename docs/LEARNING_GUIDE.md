# Ethereum Smart Contract Development Guide

> A comprehensive learning guide for the L1 Ethereum Smart Contract Workshop

---

## Table of Contents

1. [The Foundation — Understanding the "Why"](#part-1-the-foundation--understanding-the-why)
2. [The Machine — How Ethereum Works](#part-2-the-machine--how-ethereum-works)
3. [Accounts — The Two Citizens](#part-3-accounts--the-two-citizens)
4. [Transactions — The Heartbeat](#part-4-transactions--the-heartbeat)
5. [Gas — The Fuel](#part-5-gas--the-fuel)
6. [Solidity — The Language](#part-6-solidity--the-language)
7. [Contract Structure — Anatomy](#part-7-contract-structure--anatomy)
8. [Modifiers — Guard Clauses](#part-8-modifiers--guard-clauses)
9. [Events — The Logging System](#part-9-events--the-logging-system)
10. [Error Handling — Fail Safely](#part-10-error-handling--fail-safely)
11. [Security Patterns](#part-11-security-patterns)
12. [Testing — Your Safety Net](#part-12-testing--your-safety-net)
13. [Deployment — Going Live](#part-13-deployment--going-live)
14. [Project Files Explained](#part-14-project-files-explained)

---

## Part 1: The Foundation — Understanding the "Why"

### The Problem: Trust

Imagine you want to buy a rare digital artwork from a stranger online.

**Traditional approach:**

```
You ──── send money ────> Bank ────> Seller
Seller ── send artwork ──> ? (maybe they don't)
```

Problems:
- You must trust the seller
- You must trust the bank
- Disputes require lawyers, courts, time

**The blockchain insight:** What if we could write a program that:
- Holds your money
- Holds the artwork
- Automatically swaps them — no trust needed?

```
You ──── money ────┐
                   ├──> Smart Contract ──> Swap happens automatically
Seller ── artwork ─┘
```

This is the core idea: **Code as law. Automatic, trustless execution.**

---

## Part 2: The Machine — How Ethereum Works

### Think of Ethereum as a Global Computer

```
┌─────────────────────────────────────────────────────────┐
│                    THE WORLD COMPUTER                   │
│                                                         │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│   │ Node 1  │   │ Node 2  │   │ Node 3  │  ... 10,000+ │
│   │ (copy)  │   │ (copy)  │   │ (copy)  │              │
│   └─────────┘   └─────────┘   └─────────┘              │
│        │             │             │                    │
│        └─────────────┼─────────────┘                    │
│                      │                                  │
│              ALL HAVE IDENTICAL                         │
│              STATE (data + code)                        │
└─────────────────────────────────────────────────────────┘
```

**Key insight:** Every node runs the same computation and reaches the same result. This is how we achieve consensus without a central authority.

### State: The Global Spreadsheet

Think of Ethereum's state as a giant spreadsheet that everyone agrees on:

```
┌─────────────────────────────────────────────────────────┐
│ ADDRESS                      │ BALANCE    │ CODE/DATA   │
├─────────────────────────────────────────────────────────┤
│ 0xABC123... (Alice)          │ 5.2 ETH    │ (none)      │
│ 0xDEF456... (Bob)            │ 1.0 ETH    │ (none)      │
│ 0x789GHI... (SimpleToken)    │ 0 ETH      │ [contract]  │
│   └─ storage[owner]          │            │ 0xABC123... │
│   └─ storage[totalSupply]    │            │ 1000000     │
│   └─ storage[balances[Alice]]│            │ 500000      │
│   └─ storage[balances[Bob]]  │            │ 500000      │
└─────────────────────────────────────────────────────────┘
```

**Transactions change this state.** When Alice sends tokens to Bob, the state updates atomically (all or nothing).

### The Ethereum Virtual Machine (EVM)

The EVM is Ethereum's runtime environment:

**Key Properties:**
- **Deterministic** — Same input always produces same output
- **Isolated** — Contracts run in a sandbox
- **Turing-complete** — Can compute anything (with enough gas)

---

## Part 3: Accounts — The Two Citizens

### Externally Owned Accounts (EOAs) — The Humans

You control an EOA with a **private key** (a secret number):

```
Private Key (secret)          Public Address (shareable)
─────────────────────────────────────────────────────────
0x4c0883a69102937d...   →    0x742d35Cc6634C0532...
     (256-bit number)             (derived from key)
         │
         ▼
    NEVER share this!           Share this freely
    Like a password             Like an email address
```

**What EOAs can do:**
- Hold Ether (ETH)
- Initiate transactions
- Sign messages (prove identity)

### Contract Accounts — The Robots

Contracts are **autonomous programs** living on the blockchain:

```
┌────────────────────────────────────────┐
│ Contract: SimpleToken                  │
│ Address: 0x123...                      │
├────────────────────────────────────────┤
│ CODE (immutable):                      │
│   function transfer(...)               │
│   function mint(...)                   │
│   function balanceOf(...)              │
├────────────────────────────────────────┤
│ STORAGE (mutable):                     │
│   owner: 0xABC...                      │
│   balances[0xABC...]: 1000000          │
│   balances[0xDEF...]: 0                │
└────────────────────────────────────────┘
```

**Critical difference:** Contracts cannot act on their own. They only respond when called.

### Comparison Table

| Feature | EOA (Externally Owned Account) | Contract Account |
|---------|-------------------------------|------------------|
| Controlled by | Private key (human/wallet) | Code |
| Can initiate transactions | Yes | No (only respond) |
| Has code | No | Yes |
| Example | Your MetaMask wallet | The SimpleToken contract |

---

## Part 4: Transactions — The Heartbeat

Every state change requires a **transaction** — a signed instruction from an EOA:

```
┌─────────────────────────────────────────────────────────┐
│                     TRANSACTION                         │
├─────────────────────────────────────────────────────────┤
│ from:      0xABC123... (Alice)                          │
│ to:        0x789GHI... (SimpleToken contract)           │
│ value:     0 ETH                                        │
│ data:      transfer(0xDEF456..., 100)                   │
│ gasLimit:  100000                                       │
│ gasPrice:  20 gwei                                      │
│ nonce:     42 (Alice's 43rd transaction)                │
│ signature: [cryptographic proof Alice signed this]      │
└─────────────────────────────────────────────────────────┘
```

### Transaction Lifecycle

```
1. CREATE          2. SIGN             3. BROADCAST
┌──────────┐      ┌──────────┐        ┌──────────┐
│ Build TX │ ──>  │ Sign with│  ──>   │ Send to  │
│          │      │ priv key │        │ network  │
└──────────┘      └──────────┘        └──────────┘
                                            │
                                            ▼
4. MEMPOOL         5. INCLUDE           6. EXECUTE
┌──────────┐      ┌──────────┐        ┌──────────┐
│ Wait in  │ <──  │ Validator│  ──>   │ Run code │
│ queue    │      │ picks TX │        │ Update   │
└──────────┘      └──────────┘        │ state    │
                                      └──────────┘
```

---

## Part 5: Gas — The Fuel

### Why Gas Exists

Problem: Code can loop forever. How do we prevent abuse?

```solidity
// Malicious code
function evil() public {
    while(true) {
        // Run forever, freeze the network!
    }
}
```

Solution: **Every operation costs gas. When gas runs out, execution stops.**

### Gas Mental Model

Think of gas like fuel in a car:

```
┌─────────────────────────────────────────────────────────┐
│  YOUR TRANSACTION                                       │
│                                                         │
│  Gas Limit: 100,000  ◄── Maximum you're willing to pay │
│  Gas Price: 20 gwei  ◄── Price per unit of gas         │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │ Operation          │ Gas Cost       │               │
│  ├─────────────────────────────────────┤               │
│  │ Addition (a + b)   │ 3              │               │
│  │ Comparison (a > b) │ 3              │               │
│  │ Read storage       │ 200            │               │
│  │ Write storage (new)│ 20,000         │ ◄── Expensive!│
│  │ Write storage (upd)│ 5,000          │               │
│  │ Create contract    │ 32,000         │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  Total Gas Used: 65,000                                │
│  Cost: 65,000 × 20 gwei = 0.0013 ETH                   │
│  Unused: 35,000 (refunded!)                            │
└─────────────────────────────────────────────────────────┘
```

### Why Storage is Expensive

Storage persists **forever** on every node in the network:

```
            ┌─────┐ ┌─────┐ ┌─────┐
            │Node1│ │Node2│ │Node3│ ... 10,000+ nodes
            └──┬──┘ └──┬──┘ └──┬──┘
               │       │       │
            ┌──▼───────▼───────▼──┐
            │  Your 32 bytes of   │
            │  storage lives on   │
            │  ALL of them FOREVER│
            └─────────────────────┘

That's why writing 32 bytes costs 20,000 gas (~$1-50 depending on prices)
```

---

## Part 6: Solidity — The Language

### Data Types: Building Blocks

```solidity
// Value Types (stored directly)
bool    isActive = true;           // true or false
uint256 balance = 1000;            // unsigned integer (0 to 2²⁵⁶-1)
int256  temperature = -10;         // signed integer
address wallet = 0xABC...;         // 20-byte Ethereum address
bytes32 hash = keccak256(...);     // fixed-size byte array

// Reference Types (stored by reference)
string  name = "Alice";            // dynamic string
bytes   data = hex"1234";          // dynamic byte array
uint[]  numbers = [1, 2, 3];       // dynamic array

// Mappings (hash tables)
mapping(address => uint256) balances;  // key-value store
```

### Visibility: Who Can Call What?

```solidity
contract Example {
    uint256 public  balance;    // Anyone can READ (auto-getter)
    uint256 private secret;     // Only this contract
    uint256 internal shared;    // This contract + children
    
    function publicFn() public { }    // Anyone can call
    function externalFn() external { } // Only from outside
    function privateFn() private { }   // Only this contract
    function internalFn() internal { } // This + children
}
```

Visual representation:

```
                    ┌─────────────────────────────┐
                    │       OUTSIDE WORLD         │
                    │   (other contracts, users)  │
                    └──────────────┬──────────────┘
                                   │
              can call: public, external
                                   │
                    ┌──────────────▼──────────────┐
                    │       YOUR CONTRACT         │
                    │                             │
                    │  public    ✓ accessible     │
                    │  external  ✓ accessible     │
                    │  internal  ✓ accessible     │
                    │  private   ✓ accessible     │
                    └──────────────┬──────────────┘
                                   │
              inherits: public, internal
                                   │
                    ┌──────────────▼──────────────┐
                    │      CHILD CONTRACT         │
                    │                             │
                    │  public    ✓ accessible     │
                    │  internal  ✓ accessible     │
                    │  private   ✗ NOT accessible │
                    └─────────────────────────────┘
```

### The Special Variables

```solidity
function example() public payable {
    msg.sender;     // Who called this function (address)
    msg.value;      // ETH sent with this call (in wei)
    msg.data;       // Raw calldata
    
    block.timestamp; // Current block's timestamp
    block.number;    // Current block number
    
    tx.origin;      // Original EOA (DON'T use for auth!)
    
    address(this);  // This contract's address
    this.balance;   // This contract's ETH balance
}
```

---

## Part 7: Contract Structure — Anatomy

### Dissecting SimpleToken.sol

```solidity
// 1. LICENSE - Required by Solidity
// SPDX-License-Identifier: MIT

// 2. VERSION - Which compiler to use
pragma solidity ^0.8.24;

// 3. IMPORTS - Bring in external code
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 4. CONTRACT DEFINITION - Inheritance with "is"
contract SimpleToken is ERC20, Ownable {
    
    // 5. STATE VARIABLES
    // (ERC20 already has: _balances, _allowances, _totalSupply)
    // (Ownable already has: _owner)
    
    // 6. CONSTRUCTOR - Runs ONCE at deployment
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
    
    // 7. FUNCTIONS
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### Line-by-Line Explanation

| Line | Code | Explanation |
|------|------|-------------|
| 1 | `// SPDX-License-Identifier: MIT` | License identifier — Required by Solidity. MIT = open source |
| 2 | `pragma solidity ^0.8.24;` | Compiler version — `^` means "0.8.24 or higher, but less than 0.9.0" |
| 4 | `import "...ERC20.sol";` | Imports complete ERC20 token implementation |
| 5 | `import "...Ownable.sol";` | Imports ownership pattern (owner, onlyOwner modifier) |
| 16 | `contract SimpleToken is ERC20, Ownable` | Multiple inheritance from both contracts |
| 24 | `constructor(...)` | Special function, runs once at deployment |
| 25 | `string memory name` | Token name in temporary memory (not storage) |
| 28 | `ERC20(name, symbol)` | Call parent constructor |
| 28 | `Ownable(msg.sender)` | Set deployer as owner |
| 30 | `_mint(msg.sender, initialSupply)` | Create tokens for deployer |
| 38 | `function mint(...) public onlyOwner` | Anyone can call, but modifier restricts to owner |

### Inheritance Visualization

```
┌─────────────────────┐     ┌─────────────────────┐
│       ERC20         │     │      Ownable        │
├─────────────────────┤     ├─────────────────────┤
│ _balances           │     │ _owner              │
│ _totalSupply        │     │ onlyOwner modifier  │
│ transfer()          │     │ transferOwnership() │
│ balanceOf()         │     │ renounceOwnership() │
│ _mint()             │     └──────────┬──────────┘
└──────────┬──────────┘                │
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │     SimpleToken       │
           ├───────────────────────┤
           │ (inherits all above)  │
           │ + mint() [new]        │
           └───────────────────────┘
```

---

## Part 8: Modifiers — Guard Clauses

Modifiers are reusable checks that run before (or after) a function:

```solidity
// Definition
modifier onlyOwner() {
    require(msg.sender == owner, "Not the owner");
    _;  // ◄── "Continue with the function body here"
}

// Usage
function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
}

// Is equivalent to:
function mint(address to, uint256 amount) public {
    require(msg.sender == owner, "Not the owner");  // Guard
    _mint(to, amount);                               // Body
}
```

The `_` (underscore) marks where the function body gets inserted:

```
┌─────────────────────────────────┐
│ modifier onlyOwner() {          │
│     require(msg.sender == owner)│ ──► Runs BEFORE
│     _;  ◄─────────────────────────── Function body here
│ }                               │
└─────────────────────────────────┘
```

---

## Part 9: Events — The Logging System

Events are cheap, permanent logs that don't affect state:

```solidity
// Declaration
event Transfer(
    address indexed from,   // "indexed" = searchable
    address indexed to,
    uint256 value
);

// Emission
function transfer(address to, uint256 amount) public {
    // ... do transfer logic ...
    emit Transfer(msg.sender, to, amount);
}
```

**Why Events?**
- Cheap storage (logs, not state)
- Frontend apps can listen for them
- Useful for debugging and auditing

```
Frontend App                    Blockchain
    │                               │
    │◄──── Subscribe to ────────────┤
    │      Transfer events          │
    │                               │
    │                          [TX occurs]
    │                               │
    │◄──── Event: Transfer ─────────┤
    │      from: 0xABC...           │
    │      to: 0xDEF...             │
    │      value: 100               │
    │                               │
    ▼                               ▼
 Update UI                    Logs stored
```

---

## Part 10: Error Handling — Fail Safely

### Three Ways to Revert

```solidity
function withdraw(uint256 amount) public {
    // 1. require() - Validate inputs & conditions
    require(amount > 0, "Amount must be positive");
    require(balances[msg.sender] >= amount, "Insufficient balance");
    
    // 2. revert() - Explicit failure with custom errors
    if (paused) {
        revert("Contract is paused");
    }
    
    // 3. assert() - Check invariants (should NEVER fail)
    assert(totalSupply >= amount);  // If this fails, there's a bug
    
    // ... proceed with withdrawal ...
}
```

### Custom Errors (Gas Efficient)

```solidity
// Declaration (at contract level)
error InsufficientBalance(uint256 available, uint256 required);

// Usage
function withdraw(uint256 amount) public {
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(balances[msg.sender], amount);
    }
}
```

---

## Part 11: Security Patterns

### The Checks-Effects-Interactions Pattern

**The #1 most important pattern for security:**

```solidity
function withdraw(uint256 amount) public {
    // 1. CHECKS - All validation first
    require(balances[msg.sender] >= amount, "Insufficient");
    
    // 2. EFFECTS - Update YOUR state
    balances[msg.sender] -= amount;
    
    // 3. INTERACTIONS - External calls LAST
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

**Why this order?**

```
WRONG ORDER (vulnerable to reentrancy):
┌───────────────────────────────────────────────────────┐
│ 1. Send ETH to attacker                              │
│    └──► Attacker's receive() calls withdraw() again! │
│        └──► Balance not updated yet!                 │
│            └──► Attacker drains contract!            │
│ 2. Update balance (too late)                         │
└───────────────────────────────────────────────────────┘

CORRECT ORDER (safe):
┌───────────────────────────────────────────────────────┐
│ 1. Check balance                                     │
│ 2. Update balance FIRST                              │
│ 3. Then send ETH                                     │
│    └──► If attacker calls again, balance is 0        │
└───────────────────────────────────────────────────────┘
```

### Common Vulnerabilities

| Vulnerability | Description | Prevention |
|--------------|-------------|------------|
| **Reentrancy** | Attacker calls back into your contract mid-execution | Checks-Effects-Interactions pattern |
| **Integer Overflow** | Numbers wrap around | Use Solidity 0.8+ (built-in checks) |
| **Access Control** | Missing permission checks | Use OpenZeppelin's Ownable/AccessControl |
| **Front-running** | Attackers see pending transactions | Commit-reveal schemes |

---

## Part 12: Testing — Your Safety Net

### Test Structure

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
    
    // Fixture: Reusable setup
    async function deployTokenFixture() {
        const [owner, alice, bob] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("SimpleToken");
        const token = await Token.deploy("Test", "TST", 1000000);
        return { token, owner, alice, bob };
    }
    
    // Test case
    it("Should transfer tokens correctly", async function () {
        // Arrange
        const { token, owner, alice } = await deployTokenFixture();
        
        // Act
        await token.transfer(alice.address, 100);
        
        // Assert
        expect(await token.balanceOf(alice.address)).to.equal(100);
    });
    
    // Test failure case
    it("Should reject unauthorized minting", async function () {
        const { token, alice, bob } = await deployTokenFixture();
        
        await expect(
            token.connect(alice).mint(bob.address, 100)
        ).to.be.reverted;
    });
});
```

### What to Test

```
┌─────────────────────────────────────────────────────────┐
│                    TEST COVERAGE                        │
├─────────────────────────────────────────────────────────┤
│ ✓ Deployment                                           │
│   - Initial state is correct                           │
│   - Constructor parameters work                        │
│                                                         │
│ ✓ Happy Path                                           │
│   - Functions work as expected                         │
│   - State changes correctly                            │
│   - Events are emitted                                 │
│                                                         │
│ ✓ Failure Cases                                        │
│   - Invalid inputs revert                              │
│   - Unauthorized access reverts                        │
│   - Edge cases handled                                 │
│                                                         │
│ ✓ Access Control                                       │
│   - Only authorized users can call protected functions │
│   - Ownership transfers work                           │
│                                                         │
│ ✓ Edge Cases                                           │
│   - Zero values                                        │
│   - Maximum values                                     │
│   - Empty arrays/strings                               │
└─────────────────────────────────────────────────────────┘
```

### Key Testing Patterns

| Pattern | Code | Purpose |
|---------|------|---------|
| Fresh deployment | `await deployTokenFixture()` | Each test gets isolated state |
| Call as different user | `token.connect(addr1).mint(...)` | Test access control |
| Expect success | `expect(await token.balanceOf(...)).to.equal(100)` | Verify state changes |
| Expect failure | `await expect(...).to.be.reverted` | Verify guards work |
| Expect event | `.to.emit(token, "Transfer").withArgs(...)` | Verify logging |

---

## Part 13: Deployment — Going Live

### Network Progression

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   HARDHAT    │    │   TESTNET    │    │   MAINNET    │
│   (local)    │───►│  (Sepolia)   │───►│  (real $$$)  │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ Instant      │    │ Real network │    │ Production   │
│ Free         │    │ Free test ETH│    │ Real money   │
│ Reset anytime│    │ Public       │    │ Permanent    │
│ Development  │    │ Staging      │    │ CAREFUL!     │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Deployment Script Explained

```javascript
async function main() {
    // 1. Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    
    // 2. Deploy contract
    const Token = await ethers.getContractFactory("SimpleToken");
    const token = await Token.deploy("MyToken", "MTK", 1000000);
    
    // 3. Wait for confirmation
    await token.waitForDeployment();
    
    // 4. Log address
    console.log("Token deployed to:", await token.getAddress());
}
```

| Step | Code | Explanation |
|------|------|-------------|
| 1 | `ethers.getSigners()` | Get accounts — first is deployer |
| 2 | `getContractFactory()` | Load compiled contract |
| 3 | `.deploy(...)` | Send deployment transaction |
| 4 | `waitForDeployment()` | Wait for block confirmation |
| 5 | `getAddress()` | Get the new contract's address |

---

## Part 14: Project Files Explained

### package.json

```json
{
  "name": "ethereum-workshop",
  "scripts": {
    "compile": "npx hardhat compile",  // Compile .sol → bytecode
    "test": "npx hardhat test",         // Run all tests
    "node": "npx hardhat node",         // Start local blockchain
    "deploy:local": "npx hardhat run scripts/deploy.js --network localhost"
  },
  "devDependencies": {
    "hardhat": "^2.28.4",               // Development framework
    "@nomicfoundation/hardhat-toolbox": "^5.0.0"  // Testing tools
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.2" // Audited contract library
  }
}
```

### hardhat.config.js

```javascript
module.exports = {
  solidity: {
    version: "0.8.24",      // Compiler version
    settings: {
      optimizer: {
        enabled: true,       // Optimize bytecode
        runs: 200            // Optimize for ~200 calls
      }
    }
  },
  networks: {
    hardhat: {},            // In-memory (for tests)
    localhost: {
      url: "http://127.0.0.1:8545"  // Local node
    }
  },
  paths: {
    sources: "./contracts", // Solidity files
    tests: "./test",        // Test files
    artifacts: "./artifacts" // Compiled output
  }
};
```

### Compilation Output (artifacts/)

After running `npm run compile`:

```
artifacts/
├── contracts/
│   └── SimpleToken.sol/
│       ├── SimpleToken.json    ← ABI + bytecode
│       └── SimpleToken.dbg.json
└── @openzeppelin/
    └── contracts/
        ├── token/ERC20/...
        └── access/Ownable/...
```

The `.json` file contains:
- **ABI**: Interface definition for calling the contract
- **bytecode**: Machine code deployed to blockchain
- **deployedBytecode**: Runtime code (constructor stripped)

---

## Summary: The Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│                    ETHEREUM MENTAL MODEL                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USERS (EOAs)                                               │
│    │                                                        │
│    │ sign & send transactions                               │
│    ▼                                                        │
│  TRANSACTIONS ────► CONTRACTS ────► STATE CHANGES           │
│    │                    │               │                   │
│    │ cost gas           │ execute code  │ permanent         │
│    │                    │               │                   │
│    ▼                    ▼               ▼                   │
│  VALIDATORS         STORAGE          EVENTS                 │
│  process TXs        persist data     log activity           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      KEY PRINCIPLES                         │
│                                                             │
│  • Immutable: Deployed code cannot change                   │
│  • Deterministic: Same input = same output always           │
│  • Transparent: All data is public                          │
│  • Costly: Storage and computation cost gas                 │
│  • Trustless: Code executes automatically, no intermediary  │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile all Solidity contracts |
| `npm run test` | Run all tests |
| `npm run test:gas` | Run tests with gas reporting |
| `npm run node` | Start local Hardhat blockchain |
| `npm run deploy:local` | Deploy to local network |
| `npm run clean` | Clear cache and artifacts |
| `npm run console` | Interactive Hardhat console |

---

## Next Steps

1. **Modify SimpleToken** — Try adding a `burn` function
2. **Build a Voting contract** — Access control, state management
3. **Create a Mini-NFT** — ERC721 token standard

---

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethereum Developer Docs](https://ethereum.org/developers)

---

*Part of the Cursor Agent Factory Learning Workshop Ecosystem*
