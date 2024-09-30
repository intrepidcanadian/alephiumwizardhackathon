import { DUST_AMOUNT, ExecuteScriptResult, SignerProvider } from '@alephium/web3'
import { Withdraw, WithdrawGasless } from '../../artifacts/ts/scripts'

export const withdrawToken = async (signerProvider: SignerProvider, amount: string, tokenId: string): Promise<ExecuteScriptResult> => {
  return await Withdraw.execute(signerProvider, {
    initialFields: {
      token: tokenId,
      amount: BigInt(amount)
    },
    attoAlphAmount: DUST_AMOUNT,
  })
}

export const withdrawTokenGasless = async (signerProvider: SignerProvider, amount: string, tokenId: string, address: string): Promise<ExecuteScriptResult> => {
  return await WithdrawGasless.execute(signerProvider, {
    initialFields: {
      token: tokenId,
      to: address,
      amount: BigInt(amount)
    },
    attoAlphAmount: DUST_AMOUNT,
  })
}

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