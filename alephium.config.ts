import { Configuration } from '@alephium/cli'
import { Number256 } from '@alephium/web3'


import { deriveHDWalletPrivateKey } from '@alephium/web3-wallet';
import { publicKeyFromPrivateKey, addressFromPublicKey } from '@alephium/web3';


// Settings are usually for configuring
export type Settings = {
  issueTokenAmount: Number256
}
const defaultSettings: Settings = { issueTokenAmount: 100n }

const mnemonic = "wizards are the best"

const devnetPrivateKeys = [
  deriveHDWalletPrivateKey(mnemonic, 'default', 0)
];

const publicKey = publicKeyFromPrivateKey(devnetPrivateKeys[0], 'default');
const address = addressFromPublicKey(publicKey, 'default');

console.log('Private Key:', devnetPrivateKeys);
console.log('Public Key:', publicKey);
console.log('Address:', address);

const configuration: Configuration<Settings> = {
  networks: {
    devnet: {
      nodeUrl: 'http://localhost:22973',
      // privateKeys: [
      //   'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5', // group 0
      // ],
      privateKeys: devnetPrivateKeys,
      settings: defaultSettings
    },

    testnet: {
      nodeUrl: process.env.NODE_URL as string ?? 'https://wallet-v20.testnet.alephium.org',
      privateKeys: process.env.PRIVATE_KEYS === undefined ? [] : process.env.PRIVATE_KEYS.split(','),
      settings: defaultSettings
    },

    mainnet: {
      nodeUrl: process.env.NODE_URL as string ?? 'https://wallet-v20.mainnet.alephium.org',
      privateKeys: process.env.PRIVATE_KEYS === undefined ? [] : process.env.PRIVATE_KEYS.split(','),
      settings: defaultSettings
    }
  }
}

export default configuration
