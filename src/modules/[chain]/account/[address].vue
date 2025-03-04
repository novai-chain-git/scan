<script lang="ts" setup>
import {
  useBlockchain,
  useFormatter,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import { get, toCosmosAddress, toETHAddress } from '@/libs';

import { GetContract, addresses, abi, getParseUnits, getFormatUnits, getInterface } from "@/libs/web3/index"
import { erc1155, nusdtAbi, uniswap } from "@/libs/web3/abi"

import {
  getAddress,
  isAddress,
  formatUnits,
  getBigInt,
  toUtf8String,
  decodeBase64,
} from 'ethers';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import DonutChart from '@/components/charts/DonutChart.vue';


import transaction from '@/components/account/transaction.vue';
import tokenNrcs from "@/components/account/tokenNrcs.vue"


import { computed, ref } from '@vue/reactivity';
import { onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { formatNumberWithCommas } from "@/libs/utils"
//import {  } from 'ethers';

import type {
  AuthAccount,
  Delegation,
  TxResponse,
  DelegatorRewards,
  UnbondingResponses,
  Tx,
  RawLog,
  ToLog,
  Attributes,
  Events,
} from '@/types';
import type { Coin } from '@cosmjs/amino';
import Countdown from '@/components/Countdown.vue';
import { fromBase64, toHex } from '@cosmjs/encoding';
import tabModule from '@/components/tabModule/index.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps(['address', 'chain']);
const { t } = useI18n();
const blockchain = useBlockchain();
const stakingStore = useStakingStore();
const dialog = useTxDialog();
const format = useFormatter();
const account = ref({} as AuthAccount);
const txs = ref([] as TxResponse[]);
const delegations = ref([] as Delegation[]);
const rewards = ref({} as DelegatorRewards);
const balances = ref([] as Coin[]);
const unbonding = ref([] as UnbondingResponses[]);
const unbondingTotal = ref(0);
const chart = {};
const limit = ref(100)

// const recentReceived = ref([] as TxResponseErc[]);
// const recentReceivedLoding = ref(false as Boolean)

// const total = ref('' as any)
// const limit = ref(20)
// const page = ref(1)

const novaiUsdt = ref(0);
const novaiName = ref('nUSDT');

const nft = ref(0);
const nftName = ref('AINPC');

const nBtc = ref(0);
const nBtcName = ref('nBTC');

const wNovai = ref(0)
const wNovaiName = ref("wNOVAI")

onMounted(() => { });



const createInfo = () => {
  novaiUsdt.value = 0
  novaiName.value = ''
  nBtc.value = 0
  nBtcName.value = ''
  wNovai.value = 0
  account.value = {} as AuthAccount
  txs.value = [] as TxResponse[]
  rewards.value = {} as DelegatorRewards
  delegations.value = [] as Delegation[]
  balances.value = [] as Coin[]

  unbonding.value = [] as UnbondingResponses[]
  unbondingTotal.value = 0
}

watch(
  () => props.address,
  async (newAccount: any) => {


    createInfo()
    if (newAccount) {
      loadAccount(props.address);

    }
  },
  {
    immediate: true
  }
);

const tabList = computed(() => {
  return [
    {
      label: t('account.transactions'),
      value: 'transaction',
    },
    {
      label: t('account.TokenTransfers'),
      value: 'TokenTransfers',
    }
  ]
});
const totalAmountByCategory = computed(() => {
  // let sumDel = 0;
  // delegations.value?.forEach((x) => {
  //   sumDel += Number(x.balance.amount);
  // });
  // let sumRew = 0;
  // rewards.value?.total?.forEach((x) => {
  //   sumRew += Number(x.amount);
  // });
  // let sumBal = 0;
  // balances.value?.forEach((x) => {
  //   sumBal += Number(x.amount);
  // });
  // let sumUn = 0;
  // unbonding.value?.forEach((x) => {
  //   x.entries?.forEach((y) => {
  //     sumUn += Number(y.balance);
  //   });
  // });
  // return [sumBal, sumDel, sumRew, sumUn];

  let sumBal = 0;
  balances.value?.forEach((x) => {
    sumBal += Number(formatUnits(x.amount, 18));
    //sumBal += Number(format.formatToken(x))
  });

  const novaiNum = Number(novaiUsdt.value)
  const nBtcNum = Number(nBtc.value)
  const wNovaiNum = Number(wNovai.value)
  const nftNum = Number(nft.value)
  const totalNum = sumBal + novaiNum + nBtcNum + nftNum + wNovaiNum
  return {
    fanChartData: [sumBal, novaiNum, nBtcNum, nftNum, wNovaiNum],
    //fanChartData: [0, 0, 0, 0],
    totalNum,

  };
});
const labels = computed(() => ['NOVAI', novaiName.value, nBtcName.value, nftName.value, wNovaiName.value]);
// const labels = ['Balance', 'Delegation', 'Reward', 'Unbonding'];

// const totalAmount = computed(() => {
//   return totalAmountByCategory.value.reduce((p, c) => c + p, 0);
// });
const getUnbonding = computed(() => {
  return unbonding.value;
});
const tab = ref('transaction')
const txsType = ref(true);
const getRecentReceivedErcType = ref(true)
const getTxs = computed(() => {
  // return txs.value
  if (!txsType.value) return txs.value
  return txs.value.slice(0, 10)
})




const totalValue = computed(() => {
  let value = 0;
  delegations.value?.forEach((x) => {
    value += format.tokenValueNumber(x.balance);
  });
  rewards.value?.total?.forEach((x) => {
    value += format.tokenValueNumber(x);
  });
  balances.value?.forEach((x) => {
    value += format.tokenValueNumber(x);
  });
  unbonding.value?.forEach((x) => {
    x.entries?.forEach((y) => {
      value += format.tokenValueNumber({
        amount: y.balance,
        denom: stakingStore.params.bond_denom,
      });
    });
  });
  return format.formatNumber(value, '0,0.00');
});

//获取Navai链下的 usdt数量
async function getUsdt(address: string) {
  GetContract(addresses.novaichain, abi)
    .balanceOf(address)
    .then((res) => {
      // const number = ;
      novaiUsdt.value = Number(formatUnits(res, 6));
    })
    .catch((err) => {
      console.log(err, 'err');
    });
  GetContract(addresses.novaichain, abi)
    .name()
    .then((res) => {
      novaiName.value = res;
    })
    .catch((err) => {
      console.log(err, 'err');
    });

  GetContract(addresses.btcAddress, abi)
    .balanceOf(address)
    .then((res) => {
      // const number = ;
      nBtc.value = Number(formatUnits(res, 6));
    })
    .catch((err) => {
      console.log(err, 'err');
    });
  GetContract(addresses.btcAddress, abi)
    .name()
    .then((res) => {
      nBtcName.value = res;
    })
    .catch((err) => {
      console.log(err, 'err');
    });

  GetContract(addresses.wNovai, abi)
    .balanceOf(address)
    .then((res) => {
      // const number = ;
      console.log(res, 'res')
      wNovai.value = Number(formatUnits(res, 18));
    })
    .catch((err) => {
      console.log(err, 'err');
    });

  let nfts = GetContract(addresses.nftAddress, erc1155);
  let erc1155List = [
    'function balanceOf(address account, uint256 id) view returns(uint256)',
  ];
  GetContract(addresses.nftAddress, erc1155List)
    .balanceOf(address, getParseUnits('1', 0))
    .then((res) => {
      console.log(res, 'res');
      // const number = ;
      nft.value = res.toString();
    })
    .catch((err) => {
      console.log(err, 'err');
    });
}

function loadAccount(address: string) {
  if (address) {
    getUsdt(address);
  }

  if (isAddress(address)) {
    address = toCosmosAddress(address);
  }
  blockchain.rpc.getAuthAccount(address).then((x) => {
    account.value = x.account;
  });
  blockchain.rpc.getTxsBySender(address).then((x) => {
    txs.value = x.tx_responses;

    // txs.value = x.tx_responses.map( async(item:TxResponse) =>{
    //   let res = await parseErc20Data(item)
    //   return {
    //     ...item,
    //     value:res
    //   }
    // })
    txs.value.forEach(async (item: TxResponse, index) => {
      let res = await parseErc20Data(item)
      txs.value[index] = {
        ...item,
        value: res
      }
      // recentReceived.value.push(

      // )
      //return 
    })
    console.log(txs.value, 'txs.value')
  });
  blockchain.rpc.getDistributionDelegatorRewards(address).then((x) => {
    rewards.value = x;
  });
  blockchain.rpc.getStakingDelegations(address).then((x) => {
    delegations.value = x.delegation_responses;
  });
  blockchain.rpc.getBankBalances(address).then((x) => {
    console.log(x.balances, 'x.balances')
    balances.value = x.balances;
  });
  blockchain.rpc.getStakingDelegatorUnbonding(address).then((x) => {
    unbonding.value = x.unbonding_responses;
    x.unbonding_responses?.forEach((y) => {
      y.entries.forEach((z) => {
        unbondingTotal.value += Number(z.balance);
      });
    });
  });



}


//获取交易信息
async function parseErc20Data(tx_response: TxResponse) {
  const iface = getInterface();
  const ifaceNusdt = getInterface(nusdtAbi);
  const ifaceUniswap = getInterface(uniswap);

  let messages: any = tx_response.tx.body.messages;
  let tx_messages: any = tx_response.tx.body.messages;
  let value: any = 0
  let name = ''
  let methodName = ''
  let showErc20 = false
  let transactionData: any = '';
  try {
    if (messages.length) {
      let bus: any = messages[0]?.data.to;
      let contract = GetContract(bus);
      const base64Data = fromBase64(messages[0]?.data.data);
      var hexData = toHex(base64Data);
      if (bus === addresses.UniswapV2Router01) {
        transactionData = ifaceUniswap.parseTransaction({
          data: `0x${hexData}`,
        });
        let args = transactionData.args
        let decimalsTo = 'nameTo', nameTo = '', numTo: any = 0
        if (args.length == 5) {
          decimalsTo = await GetContract(args[2][0]).decimals()
          nameTo = await GetContract(args[2][0]).name()
          nameTo = nameTo.replace("Wrapped ", "")
          numTo = getFormatUnits(args[0], decimalsTo).toFixed(6)
        }
        let decimalsForm = await GetContract(args[args.length == 5 ? 2 : 1][1]).decimals()
        let nameForm = await GetContract(args[args.length == 5 ? 2 : 1][1]).name()
        nameForm = nameForm.replace("Wrapped ", "")
        let numform = getFormatUnits(args[args.length == 5 ? 1 : 0], decimalsForm).toFixed(6)

        return {
          value: value,
          to: numTo,
          form: numform,
          nameTo,
          nameForm,
          automation: args.length == 5,
          toAddress: args[args.length == 5 ? 2 : 1][0],
          formAddress: args[args.length == 5 ? 2 : 1][1],
          address: args[args.length == 5 ? 3 : 2],
          objValue: tx_messages.length ? tx_messages[0].data : {},
          name: ""
        }
      } else if (bus === addresses.novaichain) {
        transactionData = ifaceNusdt.parseTransaction({
          data: `0x${hexData}`,
        });
      } else {
        transactionData = iface.parseTransaction({
          data: `0x${hexData}`,
        });
      }
      if (transactionData) {
        showErc20 = true
        //  console.log(transactionData, 'transactionData')
        methodName = transactionData?.name
        // nameTo = transactionData.args[0]
        name = await contract.name();
        const decimals = await contract.decimals();
        // value = formatUnits(transactionData.args[1], decimals);
        value = formatNumberWithCommas(formatUnits(transactionData.args[1], decimals), 6, '');
        // value = getFormatUnits(transactionData.args[1], decimals).toFixed(6)
        //console.log(value, 'valuevalue', transactionData, getFormatUnits(transactionData.args[1], decimals), decimals)
      }
    }

  } catch (error) {
    console.log('error：', error);
  }
  return {
    value: value,
    objValue: tx_messages.length ? tx_messages[0].data : {},
    name: name,
    methodName,
    showErc20: showErc20,
    ercto: showErc20 ? transactionData?.args[0] : "",

  }

}

function updateEvent() {
  loadAccount(props.address);
}

function mapAmount(
  events: { type: string; attributes: { key: string; value: string }[] }[]
) {
  if (!events) return [];
  return events
    .find((x) => x.type === 'coin_received')
    ?.attributes.filter((x) => x.key === 'YW1vdW50' || x.key === `amount`)
    .map((x) => {
      console.log('x.value：', fromBase64(x.value ?? ''));
      // let num =  x.key==='amount'? x.value : String.fromCharCode(...fromBase64(x.value ?? ''))
      let num =
        x.key === 'amount'
          ? x.value
          : String.fromCharCode(...fromBase64(x.value ?? ''));
      // if(num) num = toUtf8String(fromBase64(x.value ?? ''));

      //  return `${Number(formatUnits(num.replace(/\D+$/, ''),18)).toFixed(6)}`
      // return num
      let str = num.match(/^(\d+)(\D*)$/);
      console.log(str, 'strstrstrstr');
      if (str?.length) {
        return `${Number(formatUnits(str[1], 18)).toFixed(6)} ${str[2]}`;
        //  return `${Number(formatUnits(str[1]),18)).toFixed(6)}`
      }
      return x.key === 'amount'
        ? x.value
        : String.fromCharCode(...fromBase64(x.value ?? ''));
    });
}


//
function getToAddress(tx: TxResponse) {
  console.log(tx, 'tx')
  return ''
}

const getRawLog = (tx: TxResponse) => {
  let raw_log: string = tx.raw_log
  console.log(tx, 'tx')
  if (raw_log) {
    let raw: RawLog[] = JSON.parse(raw_log)
    if (raw.length) {

      let events: Events[] = raw[0].events
      console.log(events, 'events')
      let eventsObj: undefined | Events = events.find((item: any) => {
        return item.type == 'tx_log'
      })
      if (eventsObj && eventsObj.attributes) {
        let attributes = eventsObj.attributes
        console.log(attributes, 'attributes', 'find')
        let obj: ToLog = JSON.parse(attributes[0].value)
        console.log(obj, 'obj')
        return obj.address ? obj.address : false
      }

      // return attributes.length?obj.address
      // console.log(attributes,'attributes')
      //  console.log(attributes,'attributes')
      //  if(attributes.length){
      //   let txLog = attributes.filter(itme:any => itme.key == "txLog")
      //  }
    }
  }
  // console.log(raw_log,'raw')
  return false

}

//计算
const percentage = (v: any, k: any) => {
  //let ke:number = 
  if (!v || !k) return 0
  if (typeof v != 'number') {
    v = parseFloat(v)
  }
  if (typeof k != 'number') {
    k = parseFloat(k)
  }
  return parseFloat((v / k).toFixed(4)) * 100
}



//字母转小写
// const getToLowerCase = ( str:string )<T> =>{
//   return str.toLowerCase()
// }

</script>
<template>
  <div v-if="account" class="text-[#ffffff]">
    <!-- address -->
    <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]  px-4 pt-3 pb-4  mb-4 sadow">
      <div class="flex items-center">
        <!-- img -->
        <div class="inline-flex relative w-11 h-11 rounded-md">
          <div class="w-11 h-11 absolute rounded-md opacity-30 bg-primary bg-lv"></div>
          <div class="w-full inline-flex items-center align-middle flex-none justify-center">
            <Icon icon="mdi-qrcode" class="text-[#5AC27C]" style="width: 27px; height: 27px" />
          </div>
        </div>
        <!-- content -->
        <div class="flex flex-1 flex-col truncate pl-4">
          <h2 class="text-sm card-title !font-[500]">{{ $t('account.address') }}:</h2>
          <span class="text-xs truncate"> {{ address }}</span>
        </div>
      </div>
    </div>

    <!-- Assets -->
    <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px] px-4 pt-3 pb-4  mb-4 shadow">
      <div class="flex justify-between">
        <h2 class="card-title text-[14px] !font-[400] mb-4 font-[OrbitronMedium] tracking-[.5px]">{{
          $t('account.assets') }}</h2>
        <!-- button -->
        <!-- <div class="flex justify-end mb-4 pr-5">
            <label
              for="send"
              class="btn btn-primary btn-sm mr-2"
              @click="dialog.open('send', {}, updateEvent)"
              >{{ $t('account.btn_send') }}</label
            >
            <label
              for="transfer"
              class="btn btn-primary btn-sm"
              @click="
                dialog.open(
                  'transfer',
                  {
                    chain_name: blockchain.current?.prettyName,
                  },
                  updateEvent
                )
              "
              >{{ $t('account.btn_transfer') }}</label
            >
          </div> -->
      </div>
      <div class=" md:!grid-cols-3 md:grid">
        <div class="md:!col-span-1">
          <DonutChart :series="totalAmountByCategory.fanChartData" :labels="labels" />
        </div>
        <div class="mt-4 md:!col-span-2 md:!mt-0 md:!ml-4">
          <div class="overflow-x-auto">
            <table class="table text-sm w-full">
              <thead>
                <tr class="text-[12px]">
                  <th class="py-3 text-[#ffffff]/[.54] font-[400]">{{ $t('account.Chain') }}</th>
                  <th class="py-3 text-[#ffffff]/[.54] font-[400]">{{ $t('account.Token') }}</th>
                  <th class="py-3 text-[#ffffff]/[.54] font-[400]">{{ $t('account.Portfolio') }}</th>
                  <th class="py-3 text-[#ffffff]/[.54] font-[400]">{{ $t('account.Amount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in balances" :key="index">
                  <td>{{ item.denom }}</td>
                  <td class="flex items-center">
                    <img class="w-[28px] mr-2" src="@/assets/images/novaiIcon.svg"></img>
                    {{ item.denom }}
                  </td>

                  <td>
                    {{ percentage(formatUnits(item.amount, 18), totalAmountByCategory.totalNum) }}%
                  </td>
                  <td>{{ format.formatToken(item, true, '0.[000000]') }}</td>
                </tr>
                <tr>
                  <td>{{ novaiName }}</td>
                  <td class="flex items-center">
                    <img class="w-[28px] mr-2" src="@/assets/images/usdtIcon.png"></img>
                    {{ novaiName }}
                  </td>
                  <td>{{ percentage(novaiUsdt, totalAmountByCategory.totalNum) }}%</td>
                  <td>{{ novaiUsdt + ' ' + novaiName }}</td>
                </tr>
                <tr>
                  <td>{{ nBtcName }}</td>
                  <td class="flex items-center">
                    <img class="w-[28px] mr-2" src="@/assets/images/btc.png"></img>
                    {{ nBtcName }}
                  </td>
                  <td>{{ percentage(nBtc, totalAmountByCategory.totalNum) }}%</td>
                  <td>{{ nBtc + ' ' + nBtcName }}</td>
                </tr>
                <tr>
                  <td>{{ nftName }}</td>
                  <td class="flex items-center">
                    <img class="w-[28px] mr-2" src="@/assets/images/novaiIcon.svg"></img>
                    {{ nftName }}
                  </td>
                  <td>{{ percentage(nft, totalAmountByCategory.totalNum) }}%</td>
                  <td>{{ nft + ' ' + nftName }}</td>
                </tr>
                <tr>
                  <td>{{ wNovaiName }}</td>
                  <td class="flex items-center">
                    <img class="w-[28px] mr-2" src="@/assets/images/8913.svg"></img>
                    {{ wNovaiName }}
                  </td>
                  <td>{{ percentage(wNovai, totalAmountByCategory.totalNum) }}%</td>
                  <td>{{ wNovai + ' ' + wNovaiName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- list-->

        </div>
      </div>
    </div>

    <!-- Delegations -->
    <!-- <div class="bg-base-100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <div class="flex justify-between">
        <h2 class="card-title mb-4">{{ $t('account.delegations') }}</h2>
        <div class="flex justify-end mb-4">
          <label
            for="delegate"
            class="btn btn-primary btn-sm mr-2"
            @click="dialog.open('delegate', {}, updateEvent)"
            >{{ $t('account.btn_delegate') }}</label
          >
          <label
            for="withdraw"
            class="btn btn-primary btn-sm"
            @click="dialog.open('withdraw', {}, updateEvent)"
            >{{ $t('account.btn_withdraw') }}</label
          >
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="table w-full text-sm table-zebra">
          <thead>
            <tr>
              <th class="py-3">{{ $t('account.validator') }}</th>
              <th class="py-3">{{ $t('account.delegation') }}</th>
              <th class="py-3">{{ $t('account.rewards') }}</th>
              <th class="py-3">{{ $t('account.action') }}</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-if="delegations.length === 0"><td colspan="10"><div class="text-center">{{ $t('account.no_delegations') }}</div></td></tr>
            <tr v-for="(v, index) in delegations" :key="index">
              <td class="text-caption text-primary py-3">
                <RouterLink
                  :to="`/${chain}/staking/${v.delegation.validator_address}`"
                  >{{
                    format.validatorFromBech32(v.delegation.validator_address) || v.delegation.validator_address
                  }}</RouterLink
                >
              </td>
              <td class="py-3">
                {{ format.formatToken(v.balance, true, '0,0.[000000]') }}
              </td>
              <td class="py-3">
                {{
                  format.formatTokens(
                    rewards?.rewards?.find(
                      (x) =>
                        x.validator_address === v.delegation.validator_address
                    )?.reward
                  )
                }}
              </td>
              <td class="py-3">
                <div v-if="v.balance" class="flex justify-end">
                  <label
                    for="delegate"
                    class="btn btn-primary btn-xs mr-2"
                    @click="
                      dialog.open(
                        'delegate',
                        {
                          validator_address: v.delegation.validator_address,
                        },
                        updateEvent
                      )
                    "
                    >{{ $t('account.btn_delegate') }}</label
                  >
                  <label
                    for="redelegate"
                    class="btn btn-primary btn-xs mr-2"
                    @click="
                      dialog.open(
                        'redelegate',
                        {
                          validator_address: v.delegation.validator_address,
                        },
                        updateEvent
                      )
                    "
                    >{{ $t('account.btn_redelegate') }}</label
                  >
                  <label
                    for="unbond"
                    class="btn btn-primary btn-xs"
                    @click="
                      dialog.open(
                        'unbond',
                        {
                          validator_address: v.delegation.validator_address,
                        },
                        updateEvent
                      )
                    "
                    >{{ $t('account.btn_unbond') }}</label
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->

    <!-- Unbonding Delegations -->
    <!-- <div class="bg-base-100 px-4 pt-3 pb-4 rounded mb-4 shadow" v-if="unbonding && unbonding.length > 0">
      <h2 class="card-title mb-4">{{ $t('account.unbonding_delegations') }}</h2>
      <div class="overflow-x-auto">
        <table class="table text-sm w-full">
          <thead>
            <tr>
              <th class="py-3">{{ $t('account.creation_height') }}</th>
              <th class="py-3">{{ $t('account.initial_balance') }}</th>
              <th class="py-3">{{ $t('account.balance') }}</th>
              <th class="py-3">{{ $t('account.completion_time') }}</th>
            </tr>
          </thead>
          <tbody class="text-sm" v-for="(v, index) in unbonding" :key="index">
            <tr>
              <td class="text-caption text-[#4352D4] py-3 bg-slate-200" colspan="10">
                <RouterLink :to="`/${chain}/staking/${v.validator_address}`">{{
                  v.validator_address
                }}</RouterLink>
              </td>
            </tr>
            <tr v-for="entry in v.entries">
              <td class="py-3">{{ entry.creation_height }}</td>
              <td class="py-3">
                {{
                  format.formatToken(
                    {
                      amount: entry.initial_balance,
                      denom: stakingStore.params.bond_denom,
                    },
                    true,
                    '0,0.[00]'
                  )
                }}
              </td>
              <td class="py-3">
                {{
                  format.formatToken(
                    {
                      amount: entry.balance,
                      denom: stakingStore.params.bond_denom,
                    },
                    true,
                    '0,0.[00]'
                  )
                }}
              </td>
              <td class="py-3">
                <Countdown :time="new Date(entry.completion_time).getTime() -
                  new Date().getTime()
                  " />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->

    <!-- Transactions -->
    <!-- <div class="bg-base-100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <h2 class="card-title mb-4">{{ $t('account.transactions') }}</h2>
   
      <div class="overflow-x-auto">
        <table class="table w-full text-sm" v-if="tab === 'transactions'">
          <thead>
            <tr>
              <th class="py-3">{{ $t('account.height') }}</th>
              <th class="py-3">{{ $t('account.hash') }}</th>
              <th class="py-3">{{ $t('account.from') }}</th>
              <th class="py-3">{{ $t('account.to') }}</th>
              <th class="py-3">{{ $t('account.messages') }}</th>
              <th class="font-[400]">{{ $t('tx.Value') }}</th>
              <th class="font-[400]">{{ $t('tx.Token') }}</th>
              <th class="font-[400]">{{ $t('block.fees') }}</th>

              <th class="py-3">{{ $t('account.time') }}</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-if="txs.length === 0">
              <td colspan="10">
                <div class="text-center">
                  {{ $t('account.no_transactions') }}
                </div>
              </td>
            </tr>
            <tr v-for="(v, index) in getTxs" :key="index">
              <td class="text-sm py-3">
                <RouterLink :to="`/${chain}/block/${v.height}`" class="text-[#4352D4] dark:invert">{{ v.height }}
                </RouterLink>
              </td>
              <td class="truncate py-3" style="max-width: 200px">
                <RouterLink :to="`/${chain}/tx/${v.tx.body.messages?.[0]?.hash}`" class="text-[#4352D4] dark:invert">
                  {{ v.tx.body.messages?.[0]?.hash }}
                </RouterLink>
              </td>
              <td class="truncate py-3" style="max-width: 200px">
                <RouterLink :to="`/${chain}/tx/${v.tx.body.messages?.[0]?.hash}`" class="text-[#4352D4] dark:invert">
                  {{ getForm(v) }}
                </RouterLink>
              </td>
              <td class="truncate py-3" style="max-width: 200px">
                <RouterLink v-if="v.tx.body.messages?.[0]?.data?.to"
                  :to="`/${chain}/tx/${v.tx.body.messages?.[0]?.hash}`" class="text-[#4352D4] dark:invert">
                  {{ v.tx.body.messages?.[0]?.data?.to }}
                </RouterLink>
                <span v-if="!v.tx.body.messages?.[0]?.data?.to">
                  new contract
                </span>
              </td>
              <td class=" py-3 ">
                <div class="mr-2 flex">
                  {{ format.messages(v.tx.body.messages) }}
                  <Icon v-if="v.code === 0" icon="mdi-check" class="text-success text-lg" />
                  <Icon v-else icon="mdi-multiply" class="text-error text-lg" />
                </div>
              </td>
              <td class="truncate" style="max-width: 200px">


                <template
                  v-if="!v.value?.methodName || v.value.methodName == 'transferFrom' || v.value.methodName == 'transfer'">
                  <template v-if="v.value && (v.value.to || v.value.form)">
                    {{ v.value.automation ? v.value.to : v.value.value ? v.value.value :
                      getAmount(v.value.objValue.value)
                    }}<br />
                    <span>
                      {{ v.value.form }}
                    </span>
                  </template>
<span v-else-if="v.value">
  <template v-if="v.value.value">{{ v.value.value }}</template>

  <template v-else>
                      {{ v.value.objValue.value == 0 && Number(v.gas_used) > 40000 ? $t("account.ContractCall") : getAmount(v.value.objValue.value) }}
                    </template>
</span>
</template>
<template v-else>
                  {{ v.value.methodName }}
                </template>
</td>
<td class="truncate ">
  <template v-if="v.value && (v.value.to || v.value.form)">
                  <RouterLink class="text-[#4352D4]" v-if="v.value.automation"
                    :to="`/${chain}/token/${v.value.toAddress}`">
                    {{ v.value.nameTo }}
                  </RouterLink>
                  <span v-else>NOVAI</span>
                  <br />
                  <RouterLink v-if="v.value.nameForm != 'NOVAI'" class="text-[#4352D4]"
                    :to="`/${chain}/token/${v.value.formAddress}`">
                    {{ v.value.nameForm }}
                  </RouterLink>
                  <span v-else>{{ v.value.nameForm }}</span>
                </template>
  <RouterLink class="text-[#4352D4]" v-else-if="v.value && v.value.name" :to="`/${chain}/token/${v.value.objValue.to}`">
    {{
    v.value.name
    }}</RouterLink>
  <span v-else-if="v.value && !v.value.name && !v.value.to">
    {{ !v.value.name && !v.value.to ? "NOVAI" : "" }}
  </span>

</td>

<td>{{ format.formatTokens(v.tx.auth_info.fee?.amount) }}</td>

<td class="py-3" style="min-width: 200px">{{ format.toLocaleDate(v.timestamp) }} <span class=" text-xs">({{
    format.toDay(v.timestamp, 'from') }})</span> </td>
</tr>
</tbody>
</table>


</div>
<div class="flex justify-center pt-[10px]" v-if="txs.length > 10">
  <div @click="txsType = !txsType" class="cursor-pointer">
    {{ txsType ? $t("account.Expand") : $t("account.Collapse") }}
  </div>
</div>
</div> -->

    <!-- Received -->
    <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[18px]   mb-4">


      <div
        class=" px-4 font-[OrbitronMedium] tracking-[.5px] py-[8px] border-b border-[#FFFFFF]/[.16] text-[#ffffff] py-2 border-b ">

        <tabModule :list="tabList" v-model:tab="tab"></tabModule>

      </div>

      <div>
        <transaction v-if="tab === 'transaction'" :address="address" :chain="chain" :limit="limit" :to="false"
          :parseErc20Data='parseErc20Data'></transaction>
        <tokenNrcs v-if="tab === 'TokenTransfers'" :address="address" :chain="chain" :limit="limit"
          :parseErc20Data='parseErc20Data'></tokenNrcs>

      </div>
      <!-- <PaginationBar v-if="!txsRecentReceived" :total="total" :limit="limit" :callback="callback"></PaginationBar>
       -->
      <!-- <div class="flex justify-center pt-[10px]" v-if="getRecentReceivedErc.length > 10 && tab === 'TokenTransfers' && page === 1">
        <div @click="getRecentReceivedErcType = !getRecentReceivedErcType" class="cursor-pointer">
          {{ getRecentReceivedErcType ? $t("account.Expand") : $t("account.Collapse") }}
        </div>
      </div> -->

    </div>

    <!-- Account -->
    <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[18px] px-4 pt-3 pb-4  mb-4 ">
      <h2 class="card-title !font-[400] mb-4 font-[OrbitronMedium] tracking-[.5px] text-[14px]">{{ $t('account.acc') }}
      </h2>
      <DynamicComponent :value="account" :limit="limit" />
    </div>
  </div>
  <div v-else class="text-no text-sm">{{ $t('account.error') }}</div>
</template>
