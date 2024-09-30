import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { OracleConsumer } from '../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

const deployOracle: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {

  const oracleAddress = '285zrkZTPpUCpjKg9E3z238VmpUBQEAbESGsJT6yX7Rod'

  const privateKey = network.privateKeys[0]
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY environment variable is not set')
  }

  const signer = new PrivateKeyWallet({ privateKey, nodeProvider: deployer.provider })
 
  const oracleResult = await deployer.deployContract(OracleConsumer, {
    initialFields: {
      oracle: oracleAddress,
      lastPrice: 0n,
      lastTimestamp: 0n,
      message: Buffer.from('', 'utf8').toString('hex')
    }
  })

  console.log(`Oracle Consumer contract deployed:`)
  console.log(`Contract ID: ${oracleResult.contractInstance.contractId}`)
  console.log(`Contract Address: ${oracleResult.contractInstance.address}`)

  // Initialize the Oracle Consumer contract
  const oracleConsumer = OracleConsumer.at(oracleResult.contractInstance.address)

  // Fetch initial price
  const initTx = await oracleConsumer.transact.getAlphPrice({
    signer: signer
  })

  console.log(`Initial price fetched, transaction ID: ${initTx.txId}`)
}

export default deployOracle