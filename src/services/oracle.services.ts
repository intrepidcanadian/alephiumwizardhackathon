import { web3, SignerProvider } from '@alephium/web3'
import { OracleConsumer } from '../../artifacts/ts'

const NODE_URL = 'https://node.mainnet.alephium.org' 
const ORACLE_CONSUMER_ADDRESS = 'zeWvrmWvA8nuoNqjUgq5H5GkA4mLSBMHojhVFFVNakVd'

web3.setCurrentNodeProvider(NODE_URL)

const oracleConsumer = OracleConsumer.at(ORACLE_CONSUMER_ADDRESS)

export async function getLastPrice(): Promise<bigint> {
  try {
    const result = (await oracleConsumer.view.getLastPrice())
    return result.returns
  } catch (error) {
    console.error('Error fetching last price:', error)
    throw error
  }
}

export async function getLastTimestamp(): Promise<bigint> {
    try {
      const result = await oracleConsumer.view.getLastTimestamp()
      return result.returns
    } catch (error) {
      console.error('Error fetching last timestamp:', error)
      throw error
    }
  }
  
  export async function getMessage(): Promise<string> {
    try {
      const result = await oracleConsumer.view.getMessage()
      return result.returns
    } catch (error) {
      console.error('Error fetching message:', error)
      throw error
    }
  }
  
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