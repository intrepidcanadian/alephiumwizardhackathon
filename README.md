# Alephium NextJS Template: Hogwarts House Token Faucet

## Overview

- Video Demo: https://www.loom.com/share/37eaf7de10b948ccbec36579050e435a
- Website: https://alephiumwizardhackathon.vercel.app/

This project is a NextJS-based web application that implements a token faucet for Hogwarts House tokens on the Alephium blockchain. 

- An oracle is used to get the price of ALPH in USD and if it is even price (in cents) then a message is updated to "PLATFORM IS READY" and if it is odd (in cents) then a message is updated to "ALL ABOARD"
- It also serves as a template and demonstration of how to create gasless transactions on Alephium (i.e. the user doesn't need to pay for gas fees and the gas fees are refunded to them)
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
- **Funding of Contracts**: Each faucet contract is funded with alephium so that it can cover gas fee for users. The faucet contracts have a deposit function added so that the newly created mneomic wallet can deposit alephium into the contract

- **Addition of Gas-Free in Ralph**: Each faucet contract has a function to withdraw faucet tokens paying gas (status quo) and a function to withdraw faucet tokens paying gas-less. The gas-less function is added to the contract and can be called by any address. The function is implemented by first paying for the gas fees and then calling an internal withdraw function that does not pay gas fees.

```javascript

    @using(preapprovedAssets = true, assetsInContract = true, checkExternalCaller = false)
    pub fn deposit(amount: U256) -> () {
       transferTokenToSelf!(callerAddress!(), ALPH, amount)
    }

    @using(assetsInContract = true, checkExternalCaller = false)
    pub fn withdrawGasless(to: Address, amount: U256) -> () {
        payGasFee!(selfAddress!(), txGasFee!())
        withdrawInternal(to, amount)
    }
```
- **Transaction Scripts Added**: A transaction script is added to call the withdrawGasless function for each of the token faucet contracts. The transaction script is executed with the token ids and the amount of tokens to withdraw for each contract. 

```javascript
// this is the transaction script that is executed
TxScript WithdrawGasless(token: TokenFaucet, to: Address, amount: U256) {
    token.withdrawGasless(to, amount)
}
// this is the service that is used to execute the transaction script
export const withdrawAllTokensGaslessSequential = async (
  signerProvider: SignerProvider, 
  amount: string, 
  tokenIds: string[], 
  address: string
): Promise<ExecuteScriptResult[]> => {
  const results: ExecuteScriptResult[] = []
  for (const tokenId of tokenIds) {
    const result = await withdrawTokenGasless(signerProvider, amount, tokenId, address)
    results.push(result)
  }
  return results
}

```

- **Oracle Added**: A oracle is deployed on mainnet. The key feature is changing the message of the Oracle contract if the price of ALPH is even or odd.

```javascript
Contract OracleConsumer(
    oracle: IDIAOracle,
    mut lastPrice: U256,
    mut lastTimestamp: U256,
    mut message: ByteVec
) {
    @using(updateFields = true, checkExternalCaller = false)
    pub fn getAlphPrice() -> () {
        let result = oracle.getValue(b`ALPH/USD`)
        lastPrice = result.value
        lastTimestamp = result.timestamp
        
        let priceInCents = lastPrice / 1_000_000
        
        if (priceInCents % 2 == 0) {
            message = b`PLATFORM IS READY`
        } else {
            message = b`ALL ABOARD`
        }
        
    }
```

- **Oracle Outputs Displayed**: Oracle outputs are displayed on the UI by viewing the state of the OracleConsumer contract through the node provider.

```javascript
export async function getLastPriceInCents(): Promise<bigint> {
    try {
      const result = await oracleConsumer.view.getLastPriceInCents()
      return result.returns
    } catch (error) {
      console.error('Error fetching last price in cents:', error)
      throw error
    }
  }

  export async function getAlphPrice(signer: SignerProvider): Promise<string> {
    try {
      const result = await oracleConsumer.transact.getAlphPrice({signer})
      return result.txId
    } catch (error) {
      console.error('Error updating ALPH price:', error)
      throw error
    }
  }
```