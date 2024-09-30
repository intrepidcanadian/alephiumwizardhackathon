import React, { useCallback, useEffect, useRef } from 'react'
import { FC, useState } from 'react'
// import styles from '../styles/Home.module.css'
import styles from '../styles/TokenDapp.module.css'
import { withdrawToken, withdrawTokenGasless, withdrawAllTokensGaslessSequential } from '@/services/token.service'
import { getLastPrice, getLastTimestamp, getMessage, getLastPriceInCents, getAlphPrice } from '@/services/oracle.services'


import { TxStatus } from './TxStatus'
import { node } from "@alephium/web3"
import { TokenFaucetConfig } from '@/services/utils'
import Snow from './Snow'

import { NodeProvider } from '@alephium/web3'
import {useWallet, useBalance} from '@alephium/web3-react'

export const TokenDapp: FC<{
  config: TokenFaucetConfig
}> = ({ config }) => {
  const { signer, account, connectionStatus } = useWallet()

  const [isWizardMode, setIsWizardMode] = useState(false)

  const [ongoingTxIds, setOngoingTxIds] = useState<string[]>([])
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const [oracleData, setOracleData] = useState({
    lastPrice: '',
    lastTimestamp: '',
    message: '',
    lastPriceInCents: '',
  })

  const formatPrice = (price: string): string => {
    const num = Number(price) / 100000000; // Assuming 8 decimal points
    return num.toFixed(8);
  }
  
  const decodeMessage = (hexMessage: string): string => {
    const bytes = new Uint8Array(hexMessage.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return new TextDecoder().decode(bytes);
  }
  
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString(); // This will format the date according to the user's locale
  }



  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [ongoingTxId, setOngoingTxId] = useState<string>()

  const [tokenBalances, setTokenBalances] = useState({
    gryffindor: '0',
    hufflepuff: '0',
    ravenclaw: '0',
    slytherin: '0'
  })

  const {balance: alphBalance, updateBalanceForTx} = useBalance(account?.address)

  const [nodeProvider, setNodeProvider] = useState<NodeProvider | undefined>(undefined)

  useEffect(() => {
    audioRef.current = new Audio('/harrypotter.mp4') 
    audioRef.current.loop = true
  }, [])

  const toggleWizardMode = () => {
    setIsWizardMode(!isWizardMode)
    if (!isWizardMode) {
      audioRef.current?.play()
    } else {
      audioRef.current?.pause()
      if (audioRef.current) {
        audioRef.current.currentTime = 5
      }
    }
  }

  useEffect(() => {
    const initializeNodeProvider = async () => {
      if (!nodeProvider) {
        try {
          const provider = new NodeProvider(config.nodeUrl)
          setNodeProvider(provider)
          if (signer && 'setNodeProvider' in signer) {
            await (signer as { setNodeProvider: (provider: any) => Promise<void> }).setNodeProvider(provider)
          }
        } catch (error) {
          console.error('Error initializing NodeProvider:', error)
        }
      }
    }

    initializeNodeProvider()
  }, [signer, nodeProvider, config.nodeUrl])


  const fetchTokenBalances = useCallback(async () => {
    if (account && connectionStatus === 'connected' && nodeProvider) {
      try {
        const balance = await nodeProvider.addresses.getAddressesAddressBalance(account.address, {mempool: true})
        const newBalances = { gryffindor: '0', hufflepuff: '0', ravenclaw: '0', slytherin: '0' }
        
        Object.entries(config.faucetTokenIds).forEach(([house, tokenId]) => {
          const tokenBalance = balance.tokenBalances?.find(token => token.id === tokenId)
          newBalances[house as keyof typeof newBalances] = tokenBalance ? tokenBalance.amount : '0'
        })

        setTokenBalances(newBalances)
        console.log('Fetched balances:', newBalances)
      } catch (error) {
        console.error('Error fetching token balances:', error)
      }
    }
  }, [account, connectionStatus, config.faucetTokenIds, nodeProvider])

  useEffect(() => {
    fetchTokenBalances()
  }, [fetchTokenBalances, account, connectionStatus])

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signer && account) {
      setIsWithdrawing(true)
      try {
        const tokenIds = config.faucetTokenIds ? Object.values(config.faucetTokenIds) : []
        if (tokenIds.length === 0) {
          throw new Error("No token IDs found in config")
        }
  
        if (isWizardMode) {
          const results = await withdrawAllTokensGaslessSequential(signer, withdrawAmount, tokenIds, account.address)
          setOngoingTxIds(results.map(result => result.txId))
        } else {
          const tokenId = tokenIds[0]
          const result = await withdrawToken(signer, withdrawAmount, tokenId)
          setOngoingTxIds([result.txId])
        }
      } catch (error) {
        console.error('Error during withdrawal:', error)
      } finally {
        setIsWithdrawing(false)
      }
    }
  }

  const fetchOracleData = useCallback(async () => {
    try {
      const [lastPrice, lastTimestamp, message, lastPriceInCents] = await Promise.all([
        getLastPrice(),
        getLastTimestamp(),
        getMessage(),
        getLastPriceInCents(),
      ])
      setOracleData({
        lastPrice: formatPrice(lastPrice.toString()),
        lastTimestamp: formatTimestamp(lastTimestamp.toString()),
        message: decodeMessage(message),
        lastPriceInCents: lastPriceInCents.toString(),
      })
    } catch (error) {
      console.error('Error fetching oracle data:', error)
    }
  }, [])

  useEffect(() => {
    fetchOracleData()
  }, [fetchOracleData])

  const handleUpdateAlphPrice = async () => {
    if (signer) {
      try {
        const txId = await getAlphPrice(signer)
        console.log('ALPH price update transaction submitted:', txId)
        // You might want to add this txId to your ongoingTxIds state
        setOngoingTxIds(prev => [...prev, txId])
      } catch (error) {
        console.error('Error updating ALPH price:', error)
      }
    }
  }

  const renderOracleSection = () => (
    <div className={styles.infoSection}>
      <h3 className={styles.sectionTitle}>Oracle Data</h3>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <div className={styles.label}>Last Price:</div>
          <div className={styles.value}>{oracleData.lastPrice}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>Last Timestamp:</div>
          <div className={styles.value}>{oracleData.lastTimestamp}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>Message:</div>
          <div className={styles.value}>{oracleData.message}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>Last Price in Cents:</div>
          <div className={styles.value}>{oracleData.lastPriceInCents}</div>
        </div>
      </div>
      <button onClick={handleUpdateAlphPrice} className={styles.button}>
        Update ALPH Price
      </button>
    </div>
  )

  const renderNormalForm = () => (
    <form onSubmit={handleWithdrawSubmit} className={styles.form}>
      <p>Maximum 2 tokens can be withdrawn at a time.</p>
      <label htmlFor="withdraw-amount" className={styles.label}>Amount</label>
      <input
        type="number"
        id="withdraw-amount"
        name="amount"
        max="2"
        min="1"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        className={styles.input}
      />
         <input 
        type="submit" 
        disabled={isWithdrawing || ongoingTxIds.length > 0} 
        value={isWithdrawing ? "Withdrawing..." : "Send Me Token"}
        className={styles.button}
      />
    </form>
  )

  const renderWizardForm = () => (
    <form onSubmit={handleWithdrawSubmit} className={`${styles.form} ${styles.wizardForm}`}>
      <p>Summon your magical tokens (max 2), wizard!</p>
      <label htmlFor="wizard-withdraw-amount" className={styles.label}>Magical Amount</label>
      <input
        type="number"
        id="wizard-withdraw-amount"
        name="amount"
        max="2"
        min="1"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        className={`${styles.input} ${styles.wizardInput}`}
      />
      <input 
        type="submit" 
        disabled={isWithdrawing || ongoingTxIds.length > 0} 
        value={isWithdrawing ? "Summoning..." : "SUMMON ALL HOUSE TOKENS(Gasless)"}
        className={`${styles.button} ${styles.wizardButton}`}
      />
    </form>
  )

  const txStatusCallback = useCallback(async (status: node.TxStatus, numberOfChecks: number): Promise<any> => {
    if (
      (status.type === 'Confirmed' && numberOfChecks > 2) ||
      (status.type === 'TxNotFound' && numberOfChecks > 3)
    ) {
      setOngoingTxIds(prevIds => prevIds.filter(id => id !== status.txId))
      fetchTokenBalances()
      if (account) {
        updateBalanceForTx(account.address)
      }
    }

    return Promise.resolve()
  }, [setOngoingTxIds, fetchTokenBalances, updateBalanceForTx, account])


  const formatAlphBalance = (balance: string): string => { 
    const balanceNumber = BigInt(balance);
    const divisor = BigInt(10**18);
    const wholePart = balanceNumber / divisor;
    const fractionalPart = balanceNumber % divisor;
    
    const formattedWholePart = wholePart.toString();
    const formattedFractionalPart = fractionalPart.toString().padStart(18, '0').slice(0, 8);
  
    return `${formattedWholePart}.${formattedFractionalPart}`;
  }
  
  const renderAccountInfo = () => (
    <div className={styles.infoSection}>
      <h3 className={styles.sectionTitle}>Account Information</h3>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <div className={styles.label}>Address:</div>
          <div className={styles.value}>{account?.address ?? '???'}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>Public Key:</div>
          <div className={styles.value}>{account?.publicKey ?? '???'}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>ALPH Balance:</div>
          <div className={styles.value}>{alphBalance ? formatAlphBalance(alphBalance.balance) : 'Loading...'} ALPH</div>
        </div>
      </div>
    </div>
  )

  const renderTokenBalances = () => (
    <div className={styles.infoSection}>
      <h3 className={styles.sectionTitle}>Token Balances</h3>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <div className={styles.label}>Gryffindor Balance:</div>
          <div className={styles.value}>{tokenBalances.gryffindor}</div>
   
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>Hufflepuff Balance:</div>
          <div className={styles.value}>{tokenBalances.hufflepuff}</div>
         
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>Ravenclaw Balance:</div>
          <div className={styles.value}>{tokenBalances.ravenclaw}</div>
    
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>Slytherin Balance:</div>
          <div className={styles.value}>{tokenBalances.slytherin}</div>
       
        </div>
      </div>
    </div>
  )



  return (
    <div className={`${styles.container} ${isWizardMode ? styles.flashing: ''}`}>
         {isWizardMode && <Snow />}
            <div className={styles.toggleContainer}>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isWizardMode}
            onChange={toggleWizardMode}
          />
          <span className={styles.slider}></span>
        </label>
        <span>Wizard Mode</span>
      </div>
      {ongoingTxIds.map(txId => (
        <TxStatus key={txId} txId={txId} txStatusCallback={txStatusCallback} />
      ))}
      <h2 className={`${styles.title} ${isWizardMode ? styles.wizardModeTitle : ''}`}>Intrepid Wizards and Wands Token Faucet {config.network}</h2>
      {renderAccountInfo()}
      {renderTokenBalances()}
      {renderOracleSection()}
      {isWizardMode ? renderWizardForm() : renderNormalForm()}
    </div>
  )
}
