import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { TokenFaucet } from '../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { DUST_AMOUNT } from '@alephium/web3'
import dotenv from 'dotenv'

import { deriveHDWalletPrivateKey } from '@alephium/web3-wallet';
import { publicKeyFromPrivateKey, addressFromPublicKey } from '@alephium/web3';

dotenv.config()


const deployFaucet: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const issueTokenAmount = network.settings.issueTokenAmount
  // const mnemonic = "wizards are the best"

  // const devnetPrivateKeys = [
  //   deriveHDWalletPrivateKey(mnemonic, 'default', 0)
  // ];

  // const publicKey = publicKeyFromPrivateKey(devnetPrivateKeys[0], 'default');
  // const address = addressFromPublicKey(publicKey, 'default');

  // const signer = new PrivateKeyWallet({ privateKey: devnetPrivateKeys[0], nodeProvider: deployer.provider })

  const mainnetPrivateKeys = process.env.MAINNET_PRIVATE_KEYS
  if (!mainnetPrivateKeys) throw new Error("MAINNET_PRIVATE_KEYS is not defined")

  const signer = new PrivateKeyWallet({ privateKey: mainnetPrivateKeys, nodeProvider: deployer.provider })
  
  const oneAlph = BigInt(10**18) 
  const depositAmount = oneAlph * BigInt(1)

  const faucets = [
    { symbol: 'HP1', name: 'Gryffindor' },
    { symbol: 'HP2', name: 'Slytherin' },
    { symbol: 'HP3', name: 'Ravenclaw' },
    { symbol: 'HP4', name: 'Hufflepuff' },
  ]

  for (let i = 0; i < faucets.length; i++) {
    const { symbol, name } = faucets[i]
    const result = await deployer.deployContract(TokenFaucet, {
      initialFields: {
        symbol: Buffer.from(symbol, 'utf8').toString('hex'),
        name: Buffer.from(name, 'utf8').toString('hex'),
        decimals: 0n,
        supply: issueTokenAmount,
        balance: issueTokenAmount
      },
      issueTokenAmount: issueTokenAmount
    }, `TokenFaucet${i + 1}`) 
    
    console.log(`Token faucet contract ${i + 1} id: ${result.contractInstance.contractId}`)
    console.log(`Token faucet contract ${i + 1} address: ${result.contractInstance.address}`)

    const tokenFaucet = TokenFaucet.at(result.contractInstance.address)
    
    const depositTx = await tokenFaucet.transact.deposit({
      args: { amount: depositAmount },
      attoAlphAmount: depositAmount,
      signer: signer
    })

    console.log(`Deposited ${depositAmount.toString()} attoALPH to ${name}`)
  }
}

export default deployFaucet