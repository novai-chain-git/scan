//合约地址名称
//合约币地址
export enum addresses {
  //NFT合约地址
  nftAddress = '0x0c1b3Cb5c5916fa53e7a90d4b8D291cA06BfEd2E',

  //跨链桥合约
  ChainConnect = '0xD5623e87466Ec6CcA12A7EB259Ae87B0490F0b72',

  //新 老板合约Wnovai
  wNovai = "0x2Ab2b37CfB556fE54f9d1B91A8dA8066d0fa3226",
  //货币合约
  // wNovai
  Wnovai = '0x4ac2abddf928c3d01a208e880e101a1423db6c73',

  // nUSDT
  novaichain = '0xE623AED6b4dAf04553B8fEe8daECCF1cfaAece37',

  //btc钱包地址
  btcAddress = '0xd6a3c0b4Db6181cC4E8045CA89AB9Cc3F9F97E3d',

  //swap合约
  UniswapV2Factory = '0xfe85454ec800b8Bb5F462B495036cAc7a89D56CA',
  UniswapV2Router01 = '0xC4025331019A0EB9BF855F59844E34A8eB4EB1CA',

  //ETH 合约
  ETH_MAINNET = '0xdac17f958d2ee523a2206206994597c13d831ec7',
  //MATIC 链
  MATIC_MAINNET = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  //bsc 币安链
  BSC_MAINNET = '0x55d398326f99059ff775485246999027b3197955',

  //波场钱包地址
  TRON_MAIN_NET = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',

  Multicall = '0xc32F798dB3F25c6251F85C47239a442e6B4FcdFe',

  //水龙头合约
  NovaiFaucet = '0x16BdAD6e3Dbb2f066bd5a5f5744FeB9B2335FB8B',
  //矿工奖励合约
  MinerRewardDistributor = '0x988Ee60ec3De0400D05F7De4707D4fB7a156171a',

  Coinstake = '0x045D9b579b3147E06ed7efBB17Fa33BA20042b6F',
  Bonstake = '0xbf5D94618054Ac3AE1a17745eAe5a9e730eAb55f',
  Bank = '0x47796e766187749E7b16eD8bD33a378968250DB6',
  ETF = '0x8c2D8204b5395299D1AcC684EB232950CBEAe661',

  USDT_Novai = '0x0F1a55329CB0a3f1548EE69404444e2617402CE0',
  NUSD_Novai = '0x3782dCB2f442f2f6471Bc460AA64967f3088A339',
  nUSDT_Novai = '0xE623AED6b4dAf04553B8fEe8daECCF1cfaAece37',
  nBTC_Novai = '0xd6a3c0b4Db6181cC4E8045CA89AB9Cc3F9F97E3d',
  WNOVAI_Novai = '0x4aC2abdDF928C3D01a208e880E101a1423dB6C73',
  NovaiFaucet_Novai = '0x16BdAD6e3Dbb2f066bd5a5f5744FeB9B2335FB8B',
  MinerRewardDistributor_Novai = '0x988Ee60ec3De0400D05F7De4707D4fB7a156171a',

}
interface Address {
  name: string;
// age: number;
}
export const addressesName:{ [key: string]: Address } = {
  [addresses.Coinstake]: {
    name: 'Coinstake'
  },
  [addresses.Bonstake]: {
    name: 'Bonstake'
  },
  [addresses.Bank]: {
    name: 'Bank'
  },
  [addresses.ETF]: {
    name: 'ETF'
  },
  [addresses.USDT_Novai]: {
    name: 'USDT'
  },
  [addresses.NUSD_Novai]: {
    name: 'NUSD'
  },
  [addresses.nUSDT_Novai]: {
    name: 'nUSDT'
  },
  [addresses.nBTC_Novai]: {
    name: 'nBTC'
  },
  [addresses.WNOVAI_Novai]: {
    name: 'WNOVAI'
  },
  [addresses.NovaiFaucet_Novai]: {
    name: 'NovaiFaucet'
  },
  [addresses.MinerRewardDistributor_Novai]: {
    name: 'MinerRewardDistributor'
  },
}

export enum ChainId {
  NOVAI_MAINNET = 7256,
  BSC_MAINNET = 56,
  MATIC_MAINNET = 137,
  ETH_MAINNET = 1,
}
export type chainIdTypes =
  | ChainId.NOVAI_MAINNET
  | ChainId.BSC_MAINNET
  | ChainId.MATIC_MAINNET
  | ChainId.ETH_MAINNET;
