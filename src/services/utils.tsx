import { NetworkId } from "@alephium/web3";
import { loadDeployments } from "../../artifacts/ts/deployments"

export interface TokenFaucetConfig {
  network: NetworkId
  groupIndex: number
  tokenFaucetAddresses: {
    gryffindor: string
    hufflepuff: string
    ravenclaw: string
    slytherin: string
  }
  faucetTokenIds: {
    gryffindor: string
    hufflepuff: string
    ravenclaw: string
    slytherin: string
  }
  nodeUrl: string

}

function getNetwork(): NetworkId {
  // const network = (process.env.NEXT_PUBLIC_NETWORK ?? 'mainnet') as NetworkId
  return 'mainnet'
}

function getTokenFaucetConfig(): TokenFaucetConfig {
  const network = getNetwork()
  // const tokenFaucet = loadDeployments(network).contracts.TokenFaucet.contractInstance
  const deployments = loadDeployments(network)
  const gryffindorFaucet = deployments.contracts.TokenFaucet_TokenFaucet1?.contractInstance
  const hufflepuffFaucet = deployments.contracts.TokenFaucet_TokenFaucet4?.contractInstance
  const ravenclawFaucet = deployments.contracts.TokenFaucet_TokenFaucet3?.contractInstance
  const slytherinFaucet = deployments.contracts.TokenFaucet_TokenFaucet2?.contractInstance
  const groupIndex = gryffindorFaucet?.groupIndex

  // const groupIndex = tokenFaucet.groupIndex
  // const tokenFaucetAddress = tokenFaucet.address
  // const faucetTokenId = tokenFaucet.contractId
  const tokenFaucetAddresses = {
    gryffindor: gryffindorFaucet?.address,
    hufflepuff: hufflepuffFaucet?.address,
    ravenclaw: ravenclawFaucet?.address,
    slytherin: slytherinFaucet?.address
  }
  const faucetTokenIds = {
    gryffindor: gryffindorFaucet?.contractId,
    hufflepuff: hufflepuffFaucet?.contractId,
    ravenclaw: ravenclawFaucet?.contractId,
    slytherin: slytherinFaucet?.contractId
  }

  // const nodeUrl = process.env.NEXT_PUBLIC_NODE_URL || 'http://localhost:22973' 
  const nodeUrl = 'https://node.mainnet.alephium.org'

  return { network, groupIndex: groupIndex ?? 0, tokenFaucetAddresses: {
    gryffindor: tokenFaucetAddresses.gryffindor ?? '',
    hufflepuff: tokenFaucetAddresses.hufflepuff ?? '',
    ravenclaw: tokenFaucetAddresses.ravenclaw ?? '',
    slytherin: tokenFaucetAddresses.slytherin ?? ''},   faucetTokenIds: {
      gryffindor: faucetTokenIds.gryffindor ?? '',
      hufflepuff: faucetTokenIds.hufflepuff ?? '',
      ravenclaw: faucetTokenIds.ravenclaw ?? '',
      slytherin: faucetTokenIds.slytherin ?? ''
    }, nodeUrl }
}

export const tokenFaucetConfig = getTokenFaucetConfig()
