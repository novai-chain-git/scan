<script lang="ts" setup>
import { post } from '@/libs';
import paging from '../paging.vue';
import { computed, ref } from '@vue/reactivity';
import { onMounted, watch } from 'vue';
import {
  useBlockchain,
  useFormatter,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import { getAmount, getToUpperCase } from '@/libs/web3/index';
import { get, toCosmosAddress, toETHAddress } from '@/libs';
import PaginationBar from '@/components/PaginationBar.vue';
import CopyItem from '@/components/CopyItem.vue';

import tdItem from './tdItem/index.vue';
import type { TxResponse } from '@/types';
import { isAddress } from 'ethers';
import { getFormatUnits } from '@/libs/web3';
import { formatNumberWithCommas } from '@/libs/utils';
// import t from "@/plugins/i18n"

// const t = i18n()
const props = defineProps([
  'address',
  'chain',
  'parseErc20Data',
  'limit',
  'to',
]);
interface TxResponseErcObj {
  type?: boolean;
  value?: any;
}
interface TxResponseErc {
  NewAddress: string;
  NewToAddress: string;
  address: string;
  blockHash: string;
  blockNumber: string;
  chainID: number;
  gas: number;
  gasFeeCap: number;
  gasPrice: number;
  gasTipCap: number;
  nonce: number;
  status: boolean;
  timestamp: number;
  to: string;
  transactionFee: number;
  txHash: string;
  txIndex: string;
  value: number;

  loding: boolean;
  contractData?: TxResponseErcObj;
}

// interface TxResponseErc extends TxResponse {
//   showErc20?: boolean;
//   loding?: boolean
// }

const format = useFormatter();
const blockchain = useBlockchain();
const recentReceived = ref([] as TxResponseErc[]);
const contractData = ref([] as any[]);
const recentReceivedLoding = ref(true as Boolean);
const txsRecentReceived = ref(true);
const errTypre = ref(true as Boolean);
const total = ref('' as any);
//const limit = ref(20)
const page = ref(1);

// const columns = ref([
// { label: t('account.height'), prop: 'name' },
//   { label: t('account.hash'), prop: 'age' },
//   { label: t('account.from'), prop: 'address' }
// ])

watch(
  () => props.address,
  async (newAccount: any) => {
    recentReceived.value = [] as TxResponseErc[];
    if (newAccount) {
      getPageList();
    }
  },
  {
    immediate: true,
  }
);
// const getRecentReceived = computed(() => {
//   //return recentReceived.value
//   let list = recentReceived.value
//   if(props.to){
//     list = list.filter(item => getForm(item) != getToUpperCase(props.address))
//   }
//   if (!txsRecentReceived.value || page.value != 1) return list
//   return list.slice(0, 10)
// })

// const getRecentReceivedErc = computed(() => {
//   //return recentReceived.value
//   let list = recentReceived.value.filter(item => item.value?.showErc20)
//   if (!txsRecentReceived.value || page.value != 1 ) return list
//   return list.slice(0, 10)
// })

// const max = computed(() => {
//   const totals = Number(total.value || 0)
//   return Math.ceil(totals / props.limit)
// })

async function callback() {
  //recentReceivedLoding.value = false
  if (page.value >= total.value || recentReceivedLoding.value) return;
  if (errTypre.value) {
    page.value = page.value + 1;
  }
  recentReceivedLoding.value = true;
  getPageList();
}
function errLoding() {
  if (!errTypre.value) {
    getPageList();
  }
}
//添加数据查看数据中是否存在
// function getList(list: any[]) {
//   list.map(item => {
//     //recentReceived.value.some( items => items.height === item.height)
//     const exists = recentReceived.value.find(items => items.height === item.height);
//     if (!exists) {
//       recentReceived.value.push({
//         ...item,
//         loding: true
//       })
//     }
//   })
//   //排序
//   recentReceived.value.sort((a, b) => Number(b.height) - Number(a.height))
// }
//获取数据二次处理
function getToken(value: any): TxResponseErcObj {
  let obj = contractData.value.find((item) => {
    return getToUpperCase(item.txHash) == getToUpperCase(value.txHash);
  });
  // console.log(obj, 'objobjobj',!!(obj))
  return {
    type: !!obj,
    value: obj,
  };
}
//
//获取分页数据
async function getPageList() {
  let address = props.address;
  let list: TxResponseErc[] = [];
  // contractData.value = []
  // recentReceived.value = []
  if (isAddress(address)) {
    // address = toCosmosAddress(address);
  }

  errTypre.value = true
  try {
    let { data } = await post('/chainFinder/api/GetEventsByAddress', {
      address: address,
      pageNo: page.value,
      pageSize: props.limit,
    });
    total.value = data.pageNumber;
    let arr = data.event || [];
    contractData.value = [...contractData.value, ...(data.contractData2 || [])];
    arr = arr.map((item: TxResponseErc) => {
      return {
        ...item,
        contractData: getToken(item),
      };
    });
    recentReceived.value = [...recentReceived.value, ...arr];

    recentReceivedLoding.value = false;
    if (recentReceived.value.length < 50) return callback();
  } catch (err) {
    recentReceivedLoding.value = false;
    errTypre.value = false
  }

  // try {
  //   let receivedQuery = `?limit=${props.limit}&page=${page.value}&events=coin_received.receiver='${address}'&order_by=2`
  //   let res = await blockchain.rpc.getTxs(receivedQuery, {})
  //   total.value = res.total
  //   list = res.tx_responses
  // } catch (err) {

  // }
  // try {
  //   let receivedQuerys = `?limit=${props.limit}&page=${page.value}&events=message.sender='${address}'&order_by=2`
  //   let res = await blockchain.rpc.getTxs(receivedQuerys, {})
  //   total.value = Number(total.value) > Number(res.total) ? total.value : res.total
  //   list = [...list, ...res.tx_responses]
  // } catch (err) {

  // }
  // if (list.length == 0) return callback()
  // getList(list)
  // recentReceived.value.forEach(async (item: TxResponseErc, index) => {
  //   if (item.loding) {
  //     props.parseErc20Data(item).then((res: any) => {
  //       recentReceived.value[index] = {
  //         ...item,
  //         value: res,
  //         loding: false
  //       }
  //     })
  //   }

  // })

  // recentReceivedLoding.value = false
  // if (recentReceived.value.length < 50) return callback()
}

const getForm = function (tx: TxResponse) {
  if (tx && tx.raw_log) {
    let attributes: { attributes: any[] } = { attributes: [] };
    try {
      let raw_log: [any] = JSON.parse(tx.raw_log)[0].events;
      attributes = raw_log.find((item) => {
        return item.type === 'message';
      });
    } catch (error) {}
    if (attributes && attributes.attributes.length) {
      let sender = attributes.attributes.find((item) => {
        return item.key === 'sender' && item.value.indexOf('novaichain') === -1;
      })?.value;
      return sender;
    }
    return '';
  }
  return '';
};

//获取地址
const getAddress = function (value: any) {
  if (value.eventName == 'ERC1155') return value.to;
  if (value.data.to) return value.data.to;
  if (value.data.spender) return value.data.spender;
  if (value.data.approved) return value.data.approved;

  return value.to;
};
</script>
<template>
  <div>
    <paging
      :api="getPageList"
      :callback="callback"
      :limit="limit"
      :page="page"
      :total="total"
    >
      <table class="table w-full text-sm">
        <thead>
          <tr
            class="sticky top-[0px] bg-[#131315] text-[12px] text-[#ffffff]/[.54] z-[10]"
          >
            <th class="!font-[400]">{{ $t('account.height') }}</th>
            <th class="!font-[400] py-3">{{ $t('account.hash') }}</th>
            <!-- <th class="py-3">{{ $t('account.amount') }}</th> -->
            <th class="!font-[400] py-3">{{ $t('account.from') }}</th>
            <th class="!font-[400] py-3">{{ $t('account.to') }}</th>
            <th class="!font-[400]">{{ $t('tx.Value') }}</th>
            <th class="!font-[400]">{{ $t('account.contract') }}</th>
            <th class="!font-[400]">{{ $t('block.fees') }}</th>
            <th class="!font-[400]">{{ $t('account.time') }}</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <template v-for="(v, index) in recentReceived" :key="index">
            <tr class="border-dashed">
              <td class="text-sm py-3">
                <RouterLink
                  :to="`/${chain}/block/${v.blockNumber}`"
                  class="textjb-lv dark:invert"
                  >{{ v.blockNumber }}
                </RouterLink>

                <!-- <RouterLink :to="`/${chain}/block/${v.height}`" class="textjb-lv dark:invert">{{ v.height }}
                </RouterLink> -->
              </td>
              <td
                class="truncate py-3 font-[OrbitronMedium]"
                style="max-width: 200px"
              >
                <RouterLink
                  :to="`/${chain}/tx/${v.txHash}`"
                  class="textjb-lv dark:invert"
                >
                  {{ v.txHash }}
                </RouterLink>
              </td>

              <td class="py-3" style="max-width: 200px">
                <CopyItem :value="v.address">
                  <template
                    v-if="getToUpperCase(v.address) != getToUpperCase(address)"
                  >
                    <RouterLink
                      v-if="v.address"
                      :to="`/${chain}/account/${v.address}`"
                      class="textjb-lv dark:invert"
                    >
                      {{ v.address }}
                    </RouterLink>
                  </template>
                  <template v-else>{{ v.address }}</template>
                </CopyItem>
              </td>
              <td class="py-3" style="max-width: 200px">
                <template v-if="v.contractData?.type">
                  <CopyItem :value="getAddress(v.contractData.value)">
                    <template
                      v-if="
                        getToUpperCase(getAddress(v.contractData.value)) !=
                        getToUpperCase(address)
                      "
                    >
                      <RouterLink
                        v-if="v.address"
                        :to="`/${chain}/account/${getAddress(
                          v.contractData.value
                        )}`"
                        class="textjb-lv dark:invert"
                      >
                        {{ getAddress(v.contractData.value) }}
                      </RouterLink>
                    </template>
                    <template v-else>{{
                      getAddress(v.contractData.value)
                    }}</template>
                  </CopyItem>
                </template>

                <CopyItem v-else-if="v.to" :value="v.to">
                  <template
                    v-if="getToUpperCase(v.to) != getToUpperCase(address)"
                  >
                    <RouterLink
                      v-if="v.address"
                      :to="`/${chain}/account/${v.to}`"
                      class="textjb-lv dark:invert"
                    >
                      {{ v.to }}
                    </RouterLink>
                  </template>
                  <template v-else>{{ v.to }}</template>
                </CopyItem>
                <span v-else> new contract </span>
              </td>
              <td class="truncate" style="max-width: 200px">
                <tdItem :value="v" type="value" :chain="chain"></tdItem>
              </td>
              <td class="truncate">
                <tdItem :value="v" type="token" :chain="chain"></tdItem>
              </td>

              <td>
                {{
                  formatNumberWithCommas(
                    getFormatUnits(String(v.gas * v.gasPrice))
                  )
                }}
                <!-- {{ formatNumberWithCommas(getFormatUnits((v.gas * v.gasPrice))) }} NOVAI -->
              </td>

              <td class="py-3" style="min-width: 200px">
                {{ format.toLocaleDate(v.timestamp * 1000) }}
                <span class="text-xs"
                  >({{ format.toDay(v.timestamp * 1000, 'from') }})
                </span>
              </td>
            </tr>
          </template>
          <tr class="border-dashed">
            <td colspan="10">
              <div class="text-center" @click="errLoding()">
                {{
                  !recentReceivedLoding && !errTypre
                    ? $t('account.errText')
                    : !recentReceivedLoding && recentReceived.length === 0
                    ? $t('account.no_transactions')
                    : recentReceivedLoding || page < total
                    ? $t('account.loading')
                    : ''
                }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- <div></div> -->
    </paging>
  </div>
</template>
