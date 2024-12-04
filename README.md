# Mine your first block

## Overview
the simulation of mining process of a block, which includes validating and including transactions from a given set of transactions.
The repository contains a folder `mempool` which contains JSON files. 
These files represent individual transactions, some of which may be invalid. 
we select some of the transaction to the mempool where successfully mine a block by including only the valid transactions,

## Objective

The output of your script should be a file named `output.txt` that follows a specific format.
where the ouptut.txt contain the data which one block have like blockhash and target difficulty and the list of transaction , merkle root . 

## Requirements
### Input
 Each in mempool file represents a transaction that includes all necessary information for validation.
- Among these transactions, some are invalid. from this list of mempool you have to select some of the trnsaction which you think you have to mine 
  

### Output
output file named is with the structure like 
- First line: The block header.
- Second line: The serialized coinbase transaction.
- Following lines: The transaction IDs (txids) of the transactions mined in the block, in order. The first txid should be that of the coinbase transaction

### Difficulty Target
The difficulty target is `0000ffff00000000000000000000000000000000000000000000000000000000`. This is the value that the block hash must be less than for the block to be successfully mined.


# This part is when you have to run minning algorithim from the terminal . 
## Execution
- A `run.sh` file is Create that contains the command to execute your script. This file contain a single command which run the all the needed file to run the mining alogrithim without anyother manulally interaction  .


<!-- # Solution
- **Design Approach:** Describe the approach you took to design your block construction program, explain all the key concepts of creating a valid block.

- **Implementation Details:** Provide pseudo code of your implementation, including sequence of logic, algorithms and variables used etc.

- **Results and Performance:** Present the results of your solution, and analyze the efficiency of your solution.

- **Conclusion:** Discuss any insights gained from solving the problem, and outline potential areas for future improvement or research. Include a list of references or resources consulted during the problem-solving process. -->

# WHAT I DONT DO : 

- **Do Not Use Bitcoin Libraries for Transaction Validation:** You must not use any Bitcoin-specific libraries or frameworks that automate transaction validation processes. The intent of this challenge is for you to understand and implement the validation logic manually.
  
- **Permissible Libraries:** The use of standard cryptographic libraries, such as secp256k1 for elliptic curve cryptography, and standard hashing libraries (e.g., for SHA-256) is allowed and encouraged. These libraries are essential for implementing the cryptographic underpinnings of bitcoin without reinventing the wheel.

- **Implement the Mining Algorithm :**  To implement the mining algorithm on my own. in which creating a way to correctly form a block header, calculate the hash, and meet the challenge of finding a hash below a certain target.


