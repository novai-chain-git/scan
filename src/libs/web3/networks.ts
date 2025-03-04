import { ChainId } from './addresses';
// 区块链浏览器地址配置
export const MAIN_BSC_SCAN_URLS = {
    [ChainId.NOVAI_MAINNET]: 'https://scan.novaichain.com/novaichain',
    [ChainId.ETH_MAINNET]: 'https://etherscan.io/',
    [ChainId.MATIC_MAINNET]: 'https://polygonscan.com/',
    [ChainId.BSC_MAINNET]: 'https://bscscan.com/'
  };

export const ETHEREUM_CHAIN_MAINNET = {

  [ChainId.NOVAI_MAINNET]:{
    chainName: 'NOVAI',
    chainId: `0x${ChainId.NOVAI_MAINNET.toString(16)}`,
    nativeCurrency: {
      name: 'NOVAI',
      symbol: 'NOVAI',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.novaichain.com'],
    blockExplorerUrls:[MAIN_BSC_SCAN_URLS[ChainId.NOVAI_MAINNET]]
  },
  [ChainId.BSC_MAINNET]:{
    chainName: 'BNB-ChainConnect',
    chainId: `0x${ChainId.BSC_MAINNET.toString(16)}`,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://endpoints.omniatech.io/v1/bsc/mainnet/public/'],
    blockExplorerUrls:[MAIN_BSC_SCAN_URLS[ChainId.BSC_MAINNET]]
  },
  [ChainId.MATIC_MAINNET]:{
    chainId: `0x${ChainId.MATIC_MAINNET.toString(16)}`,
    chainName: 'Polygon-ChainConnect',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      'https://polygon-bor-rpc.publicnode.com/',
      'https://polygon-pokt.nodies.app',
    ],
    blockExplorerUrls:[MAIN_BSC_SCAN_URLS[ChainId.MATIC_MAINNET]]
  },

  [ChainId.ETH_MAINNET]:{
    chainId: `0x${ChainId.ETH_MAINNET.toString(16)}`,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.mevblocker.io', 'https://eth.drpc.org'],
    blockExplorerUrls: [MAIN_BSC_SCAN_URLS[ChainId.ETH_MAINNET]],
  },
}