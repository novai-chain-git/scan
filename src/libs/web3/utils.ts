import {
  JsonRpcProvider,
  Contract,
  formatUnits,
  parseUnits,
  getBigInt,
  getNumber,
  BrowserProvider,
  Interface,
  ethers
} from 'ethers';
import type { chainIdTypes } from './addresses';
import { ETHEREUM_CHAIN_MAINNET } from './networks';

export enum rbc_url {
  novaichain = 'https://rpc.novaichain.com',
  // @ts-ignore
  '7256' = 'https://rpc.novaichain.com',
  // @ts-ignore
  '56' = 'https://bsc.drpc.org',
  // @ts-ignore
  '137' = 'https://polygon-bor-rpc.publicnode.com/',
  // @ts-ignore
  '1' = 'https://rpc.mevblocker.io',
}

export const abi: string[] = [
  'function transfer(address to, uint amount)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns(uint256)',
  'function totalSupply() view returns(uint256)',
  'function owner() view returns (address)',
];

//获取小狐狸
export const getActiveLibrary = () => {
  if (window?.ethereum) {
    console.log('MetaMask钱包, ');
    return getLibrary(window.ethereum);
  }
  console.log('请安装MetaMask钱包, ');
  return null;
};

// 链接钱包
export const connectWallet = async () => {
  const library = getActiveLibrary();
  if (!library) return [];
  const accounts = await library.send('eth_requestAccounts', []);
  console.log('accounts', accounts);
  if (accounts.length) {
    return accounts[0];
  } else {
    return '';
  }
};

// 切换链
export const switchNetwork = async (chainId: chainIdTypes) => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: ETHEREUM_CHAIN_MAINNET[chainId]?.chainId,
          },
        ],
      });
    } catch (error: object | any) {
      const message = error.message || error.msg;
      if (
        message?.includes('Unrecognized chain ID') ||
        message?.includes('chainId not match') ||
        error?.code === 4902
      ) {
        await walletAddChain(chainId);
        console.log('切换链：walletSwitchChain');
      }
    }
  }
};

// 添加链
const walletAddChain = async (chainId: chainIdTypes) => {
  if (window.ethereum) {
    const data = { ...ETHEREUM_CHAIN_MAINNET[chainId] };

    console.log('data', data, ETHEREUM_CHAIN_MAINNET[chainId]);

    try {
      // 添加当前DAPP使用的链
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [data],
      });
    } catch (error) {
      console.error(error);
    }
  }
  return undefined;
};

export const getLibrary = (provider: any) => {
  const library = new BrowserProvider(provider);
  library.pollingInterval = 12000;
  return library;
}; //获取rbc方法

export function provider(rbc = rbc_url.novaichain) {
  return new JsonRpcProvider(rbc);
}

export function getERC20Contract(address: string, abiStr: any = abi, rbc: any) {
  return new Contract(address, abiStr, rbc);
}
//通过合约地址获取abi和约文件并获取其方法
export function GetContract(
  address: string,
  abiStr: any = abi,
  rbc = rbc_url.novaichain
) {
  return getERC20Contract(address, abiStr, provider(rbc));
}

export function getFormatUnits(amount: any, unit: any = 18): number {
  return Number(formatUnits(amount, unit));
}
//保留小数
// 转换为链上可读数据
export function getParseUnits(value: string, unit?: string | number) {
  return parseUnits(value, unit);
}

export function ethJsonRpcRequest(data: any) {
  if (window?.ethereum) {
    return window.ethereum.request(data);
  }
  console.log('请安装MetaMask钱包, ');
  return null;
}
export function getInterface(abiStr: any = abi) {
  return new Interface(abiStr);
}

export function getAmount(value: any) {
//   if (value) {
//     let bigNumberValue = getBigInt(value.toString()); 
//     console.log("BigNumber Value:", bigNumberValue.toString(),value);
// // 将 BigNumber 转换为 BigInt
// //let bigIntValue = BigInt(bigNumber.toString());
//     console.log(value,'value',value.toFixed(0))
//     return `qwe${formatLargeNumber(value)}`
//   }

  if (value) return Number(Number(formatUnits(getNormalNumber(value), 18)).toFixed(6));
 // if (value) return Number(Number(formatUnits(value.toString(), 18)).toFixed(6));
  return ``;
}

export function getToUpperCase<T extends string>(input: T): T {
  return input.toUpperCase() as T;
}
 //防止后端传递数据过大
export function getNormalNumber(value: any): any {
  return value.toLocaleString().split(",").join("")
 }

