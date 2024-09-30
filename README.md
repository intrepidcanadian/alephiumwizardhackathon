# Alephium NextJS Template: Hogwarts House Token Faucet

## Overview

This project is a NextJS-based web application that implements a token faucet for Hogwarts House tokens on the Alephium blockchain. 

- It serves as a template and demonstration of how to create gasless transactions on Alephium (i.e. the user doesn't need to pay for gas fees and the gas fees are refunded to them)
- It demonstrates how to fund a contract with alephium so that it can be used to cover gas fees for users
- It demonstrates how to create a private key from a mnemonic phrase and use it to deploy a smart contract. 
- The idea is that if any mnemonic can create a private key and a public key / public address then hypothetically, data scanned from a NFC wallet can be used to create an Alephium Wallet
- The transactions are batched together in transaction script that calls up each of the token faucet ids and sends them to the user

## Features

- **Token Faucet**: Non-wizards can request and receive Gryffindor tokens.
- **Wizard Mode**: In wizard mode, (1) wizards can request and recieve all house tokens (Gryffindor, Hufflepuff, Ravenclaw, and Slytherin) & (2) the tokens are recieved GAS-LESS & (3) Music and animation plays to activate WIZARD MODE.
- **Deployment of Contract using Mnemonic**: The contract is deployed using a mnemonic "Wizards are the best". This can be substituted with scanned NFC data from a passport to create a wallet on Alephium..

```javascript

const mnemonic = "wizards are the best"

const devnetPrivateKeys = [
  deriveHDWalletPrivateKey(mnemonic, 'default', 0)
];

const publicKey = publicKeyFromPrivateKey(devnetPrivateKeys[0], 'default');
const address = addressFromPublicKey(publicKey, 'default');

console.log('Private Key:', devnetPrivateKeys);
console.log('Public Key:', publicKey);
console.log('Address:', address);
```
- **Funding of Contracts**: Each faucet contract is funded with alephium so that it can cover gas fee for users


