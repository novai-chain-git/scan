<script lang="ts" setup>
import { computed, ref, toRaw } from 'vue';
import fetch from 'cross-fetch';
import { isAddress } from 'ethers';
import {
  getActiveLibrary,
  GetContract,
  getERC20Contract,
  rbc_url,
  ETHEREUM_CHAIN_MAINNET,
  ethJsonRpcRequest,
  getParseUnits,
  ChainId
} from '@/libs/web3/index';
import { upgradeable, usdtAbi } from '@/libs/web3/abi';

interface nativeCurrency {
  name: string;
  addresses: string;
}
interface listFace {
  chainOriginalId: number | string | any;
  nativeCurrency: nativeCurrency;
  account?: string;
}

// interface listFaces extends listFace{
//     nativeCurrency?: nativeCurrency
// }
const addressesList = ref<listFace[]>([]);
const walletAddress = ref<String>('');
const signer = ref();

const ifShow = ref<Boolean>(false);
const sign = ref<any>(0);

const ifIssue = ref<Boolean>(false);

const loading = ref<Boolean>(false);
const chainId = ref<any>()
const formValue = ref<any>({
  form: '',
  to: '',
  num:0
});
const tips = ref<any>('');

// {
//         "chainOriginalId":7256,
//         "nativeCurrency":{
//             "name":"nUSDT",
//             "addresses": "0xE623AED6b4dAf04553B8fEe8daECCF1cfaAece37"
//         }
//     }
//获取列表数据
const getContractArray = async () => {
  const response = await fetch('/contractArray.json');
  response.json().then(async (res: listFace[]) => {
    // let list = res
    addressesList.value = res;
    addressesList.value.forEach((item, index) => {
      owner(item.nativeCurrency, rbc_url[item.chainOriginalId as keyof typeof rbc_url]).then(
        (account) => {
          addressesList.value[index].account = account;
        }
      );
    });
    // await Promise.all(list.map(async (item) => {
    //     try {
    //         // 假设这里有一个异步请求获取详细信息的函数 fetchDetails
    //     //     console.log(item.nativeCurrency, 'item.nativeCurrency')
    //     //     if (item.nativeCurrency.name != 'Chain') {
    //     //    }
    //        const account = await owner(item.nativeCurrency);
    //             // 在成功获取详细信息后，更新列表中的对象
    //         item.account = account; // 假设 details 是从异步请求中获取到的信息

    //     } catch (error) {
    //     }
    // }));
  });
};
// claimOwnership
// renounceOwnership
//获取当前合约地址的所有人
const owner = async (nativeCurrency: nativeCurrency, chainOriginalId: any) => {
  // if (nativeCurrency.name == 'Chain') {
  //     const contract = await GetContract(nativeCurrency.addresses, upgradeable, 'http://192.168.101.44:8545').owner()
  //     return contract
  // } else


  if (nativeCurrency.name == 'nBTC' || nativeCurrency.name == 'nUSDT') {
    // const contract = await GetContract(nativeCurrency.addresses, usdtAbi,'http://192.168.101.44:8545').getOwner()
    const contract = await GetContract(
      nativeCurrency.addresses,
      usdtAbi,
      chainOriginalId
    ).getOwner();
    return contract;
  } else {
    const contract = await GetContract(
      nativeCurrency.addresses,
      upgradeable,
      chainOriginalId
    ).owner();
   // console.log(contract, nativeCurrency, 'nativeCurrency', chainOriginalId)
    return contract;
  }
  //  const contract = await GetContract(addresses,(name == 'nBTC'|| name == 'nUSDT'?usdtAbi:upgradeable)).owner()
};

//查询当前合约地址所有人
getContractArray();


//获取小狐狸当前链
const getNetwork = async () => {
  let provider: any = getActiveLibrary();
  if (provider) {
    try {
      let network = await provider.getNetwork();

      chainId.value = Number(network.chainId)
    } catch (error) {
      console.error('断开连接钱包时出错：', error);
    }
  }
}
//切换小狐狸链
const setChainOriginalId = async (listFaceObj: listFace) => {

  let provider: any = getActiveLibrary();
  if (provider) {
    try {
      let network = await provider.getNetwork();

      chainId.value = Number(network.chainId)
      if (chainId.value != listFaceObj.chainOriginalId) {
        await ethJsonRpcRequest({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: `0x${listFaceObj.chainOriginalId.toString(16)}`
            }
          ]
        })
        chainId.value = listFaceObj.chainOriginalId

      }
      //  return true

    } catch (error: any) {
      loading.value = false;

      const message = error.message || error.msg;
      if (message?.includes('Unrecognized chain ID') || message?.includes('chainId not match') || error?.code === 4902) {
        await walletAddChain(listFaceObj)
      }
      console.error('切换小狐狸链时出错：', error);
    }
  }
  //判断当前链ID是否与小狐狸当前连接链是否一致

}
//添加链
async function walletAddChain(listFaceObj: listFace) {
  let provider: any = getActiveLibrary();
  let chainOriginalId: ChainId = Number(listFaceObj.chainOriginalId)
  const data: any = {
    ...ETHEREUM_CHAIN_MAINNET[chainOriginalId]
  };

  const bscChainDetails = {
    chainId: '0x38', // Chain ID for Binance Smart Chain (BSC)
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  };

  console.log(data, 'data')


  if (provider) {
    try {
      await ethJsonRpcRequest({
        method: 'wallet_addEthereumChain',
        params: [data]
      })
      await setChainOriginalId(listFaceObj)
    } catch (error) {
      loading.value = false;
      console.log(error);
      console.error('添加链链时出错：', error);
      // return new Promise(error);
    }

  }
}
//

//获取并连接钱包
const connect = async () => {
  //await window.ethereum.request({ method: 'eth_requestAccounts' })
  let provider: any = getActiveLibrary();
  if (provider) {
    try {
      let [account] = await provider.send('eth_requestAccounts');
      //let signer = provider.getSigner()
      //  let address  = signer.value.getAddress()
      walletAddress.value = account;
      // getNetwork()

      getContractArray();
    } catch (error) {
      console.log('连接钱包时出错：', error);
    }
  }
};

const accountsChanged = () => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: any) => {
      // accounts 是一个数组，包含用户当前的所有账户
      console.log('Accounts changed:', accounts);
      walletAddress.value = accounts.length ? accounts[0] : '';
      // 在这里更新你的应用程序中的用户账户信息或执行其他逻辑

      getNetwork()
    });
  }
};
accountsChanged();
//断开连接
const Disconnect = async () => {
  walletAddress.value = '';
  let provider = getActiveLibrary();
  if (provider) {
    try {
      await provider.send('wallet_revokePermissions', [{ eth_accounts: {} }]);

      getContractArray();
    } catch (error) {
      console.error('断开连接钱包时出错：', error);
    }
  }
};

//监听小狐狸账户变动



//领取所有权
const renounceOwnership = async (item: listFace, nativeCurrency: { addresses: string }) => {
  if (loading.value) return;

  loading.value = true;


  await setChainOriginalId(item)
  if (chainId.value == item.chainOriginalId) {
    try {




      let provider: any = getActiveLibrary();
      let signer = await provider.getSigner();
      if (provider) {
        const contract = await getERC20Contract(
          nativeCurrency.addresses,
          upgradeable,
          signer
        ).acceptOwnership();
        console.log(contract, 'contract');
        await contract.wait();
      }

      getContractArray();
    } catch (err) {
    } finally {
      loading.value = false;
    }

  }

};
//增发数据
const issue = async () => {
  try {
    loading.value = true;
    let provider: any = getActiveLibrary();
    let signer = await provider.getSigner();
    let res: listFace = addressesList.value[sign.value];
    console.log(signer)
    
    console.log(res,'res',formValue.value.num)
    let num = getParseUnits(formValue.value.num.toString(),6)
    console.log(res,'getParseUnits',num)
    const contract = await getERC20Contract(
      res.nativeCurrency.addresses,
      usdtAbi,
      signer
    ).issue(num);
    await contract.wait();
   setIfIssue(false);
    console.log(contract,'contract')
  } catch (err) {
    loading.value = false;
  }finally {
      loading.value = false;
    }
}

//转让
const transferOwnership = async () => {
  if (loading.value) return;
  const addr = /^[a-z\d]+1[a-z\d]{38,58}$/;
  if (
    formValue.value.to &&
    (addr.test(formValue.value.to) || isAddress(formValue.value.to))
  ) {
    try {
      loading.value = true;
      let provider: any = getActiveLibrary();
      let signer = await provider.getSigner();
      if (provider) {
        //  let  = formValue.value
        let { nativeCurrency }: listFace = addressesList.value[sign.value];
        console.log(nativeCurrency, 'nativeCurrency', formValue.value);
        let abi = nativeCurrency.name === 'nUSDT' ? usdtAbi : upgradeable;
        console.log(abi, 'abi');
        // let to = formValue.value.to
        const contract = await getERC20Contract(
          nativeCurrency.addresses,
          abi,
          signer
        ).transferOwnership(formValue.value.to);
        await contract.wait();
      }
      setIfShow(false);
      getContractArray();
    } catch (err) {
      tips.value = err;
    } finally {
      loading.value = false;
    }
  } else {
    tips.value = '钱包地址不正确';
  }
};

//
async function setIfShow(type: Boolean, index?: any) {
  if (type === true) {

    sign.value = index;
    tips.value = '';
    let listFaceObj: listFace = addressesList.value[sign.value];
    formValue.value.form = listFaceObj.account;
    formValue.value.to = '';

    await setChainOriginalId(listFaceObj)
    if (chainId.value == listFaceObj.chainOriginalId) {
      ifShow.value = type;
    }


  } else {
    ifShow.value = type;
  }

}

async function setIfIssue(type: Boolean, index?: any) {
  if (type === true) {

    sign.value = index;
    formValue.value.num = 0
    tips.value = '';
    let listFaceObj: listFace = addressesList.value[sign.value];
    // formValue.value.form = listFaceObj.account;
    // formValue.value.to = '';

    await setChainOriginalId(listFaceObj)
    if (chainId.value == listFaceObj.chainOriginalId) {
      ifIssue.value = type;
    }


  } else {
    ifIssue.value = type;
  }
}
</script>
<template>
  <div>
    <div class="bg-base-100 px-4 pt-3 pb-4 rounded shadow mb-4">
      <!-- <select class="md:!h-[47px] h-[37px] w-[100%] rounded-full my-[10px] px-[20px] border-solid border-2">
                <option :value="item.nativeCurrency.addresses" v-for="(item, key) in getAddressesList">
                    {{ item.nativeCurrency.name }}-{{ item.nativeCurrency.addresses }}
                </option>
            </select> -->

      <button v-if="!walletAddress" @click="connect" type="submit"
        class="ml-2 py-[8px] px-[16px] rounded-full !bg-[#1A1A1A] text-[#ffffff]">
        连接钱包
      </button>
      <div v-else>
        {{ walletAddress }}
        <button @click="Disconnect" type="submit"
          class="ml-2 py-[8px] px-[16px] rounded-full !bg-[#1A1A1A] text-[#ffffff]">
          断开连接
        </button>
      </div>
    </div>
    <div class="bg-base-100 px-4 pt-3 pb-4 rounded shadow mb-4 overflow-x-auto w-full">
      <table class="table w-full table-compact table-zebra">
        <thead>
          <tr>
            <th>合约名称</th>
            <th>合约地址</th>

            <!--  -->
            <th v-if="walletAddress">操作</th>
            <!-- <th>转让所有权</th>
                        <th>领取所有权</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in addressesList" :key="index">
            <!-- {{ item }} -->
            <td>{{ item.nativeCurrency.name }}</td>
            <td class="text-ellipsis">
              <div>地址：{{ item.nativeCurrency.addresses }}</div>
              <div class="">持有者：{{ item.account }}</div>
            </td>

            <td v-if="walletAddress">
              <div>
                <!--    -->
                <button v-if="
                  walletAddress?.toLowerCase() == item.account?.toLowerCase()
                " type="submit" @click="setIfShow(true, index)"
                  class="py-[8px] px-[16px] rounded-full !bg-[#1A1A1A] text-[#ffffff]">
                  转让
                </button>
                <!--  -->
                <button v-if="
                  item.nativeCurrency.name != 'nUSDT' &&
                  walletAddress?.toLowerCase() != item.account?.toLowerCase()
                " @click="renounceOwnership(item, item.nativeCurrency)" type="submit"
                  class="ml-2 py-[8px] px-[16px] rounded-full !bg-[#1A1A1A] text-[#ffffff]">
                  领取
                </button>
                <!-- &&
                   -->
                <button v-if="
                  item.nativeCurrency.name == 'nUSDT' &&
                  walletAddress?.toLowerCase() == item.account?.toLowerCase()" 
                @click="setIfIssue(true, index)" type="submit"
                  class="ml-2 py-[8px] px-[16px] rounded-full !bg-[#1A1A1A] text-[#ffffff]">
                  增发
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal !opacity-100 !visible !pointer-events-auto" v-show="ifShow">
      <div class="modal-box relative">
        <label for="add-validator" @click="setIfShow(false)"
          class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h3 class="text-lg font-bold">持有人：</h3>
        <h3 class="text-lg font-bold">{{ formValue.form }}</h3>
        <h3 class="text-lg font-bold mt-5">转让地址：</h3>
        <div class="form-control border-2">
          <div class="input-group input-group-md">
            <input v-model="formValue.to" type="text" class="input w-full" placeholder="请输入转让钱包地址" />
          </div>
        </div>
        <div v-show="tips" class="mb-5bg-base-100 rounded shadow text-rose-700 border border-rose-600">
          {{ tips }}
        </div>
        <div class="modal-action">
          <button class="btn btn-primary !bg-[#4352D4] !border-[#4352D4]" @click="transferOwnership">
            确认转让
          </button>
        </div>
      </div>
    </div>

    <div class="modal !opacity-100 !visible !pointer-events-auto" v-show="ifIssue">
      <div class="modal-box relative">
        <label for="add-validator" @click="setIfShow(false)"
          class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h3 class="text-lg font-bold mt-5">增发数量：</h3>
        <div class="form-control border-2">
          <div class="input-group input-group-md">
            <input v-model="formValue.num" type="number" class="input w-full" placeholder="请输入增发数量" />
          </div>
        </div>
        <div v-show="tips" class="mb-5bg-base-100 rounded shadow text-rose-700 border border-rose-600">
          {{ tips }}
        </div>
        <div class="modal-action">
          
          <button class="btn btn-primary !bg-[#4352D4] !border-[#4352D4]" @click="issue">
            增发
          </button>
        </div>
      </div>
    </div>

    <div v-show="loading" class="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.3)] flex items-center justify-center">
      <div>
        <div></div>
        <div class="text-white text-xl">...执行中</div>
      </div>
    </div>
  </div>
</template>
