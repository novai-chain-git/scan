<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { post } from "@/libs"
import { onMounted, watch } from 'vue';
import {
  useBlockchain,
  useFormatter,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import { getAmount, getToUpperCase, getFormatUnits,addresses } from "@/libs/web3/index"
import { get, toCosmosAddress, toETHAddress } from '@/libs';
import CopyItem from '@/components/CopyItem.vue'
import paging from '../paging.vue';;
import tdItem from './tdItem/index.vue';
import { formatNumberWithCommas } from "@/libs/utils"

import type {
  TxResponse
} from '@/types';
import {
  isAddress
} from 'ethers';
const props = defineProps(['address', 'chain', 'parseErc20Data', 'limit']);
interface TxResponseErcObj {
  type?: boolean,
  value?: any
}
interface TxResponseErc {

  NewAddress: string,
  NewToAddress: string,
  address: string,
  blockHash: string,
  blockNumber: string,
  chainID: number,
  gas: number,
  gasFeeCap: number,
  gasPrice: number,
  gasTipCap: number,
  nonce: number,
  status: boolean,
  timestamp: number,
  to: string,
  transactionFee: number,
  txHash: string,
  txIndex: string,
  value: number,

  loding: boolean,
  contractData?: TxResponseErcObj
}

const format = useFormatter();
const blockchain = useBlockchain();
const recentReceived = ref([] as TxResponseErc[]);
const contractData = ref([] as any[])
const recentReceivedLoding = ref(true as Boolean)
const txsRecentReceived = ref(true);
const total = ref('' as any)
//const limit = ref(20)
const page = ref(1)


watch(
  () => props.address,
  async (newAccount: any) => {


    recentReceived.value = [] as TxResponseErc[]
    if (newAccount) {
      getPageList();

    }
  },
  {
    immediate: true
  }
);
// const getRecentReceived = computed(() => {
//   let list = recentReceived.value.filter(item => {
//     return item.contractData?.type && (item.to == addresses.novaichain)
//   })
//   return list
// })



// const max = computed(() => {
//   const totals = Number(total.value || 0)
//   return Math.ceil(totals / props.limit)
// })

function callback() {

  if (page.value >= total.value || recentReceivedLoding.value) return
  recentReceivedLoding.value = true
  page.value = page.value + 1
  getPageList()
}
//获取数据二次处理
function getToken(value: any,list:TxResponseErc[]):TxResponseErcObj {
  let obj = list.find(item => {
    return getToUpperCase(item.txHash) == getToUpperCase(value.txHash)
  })
 // console.log(obj, 'objobjobj',!!(obj))
  return {
    type: !!(obj),
    value: obj
  }
}
//
//获取分页数据
async function getPageList() {
  let address = props.address
  // recentReceived.value = []
  let list: TxResponseErc[] = []
  if (isAddress(address)) {
    //  address = toCosmosAddress(address);
  }


  try {
    console.log('asdasdasdasd')
    let { data } = await post('/chainFinder/api/GetContractEventsByAddress', {
      address: address,
      pageNo: page.value,
      pageSize: props.limit
    })
    console.log(data, 'GetEventsByAddress')
    total.value = data.pageNumber
    let arr = data.event
    contractData.value = [...contractData.value, ...data.contractData]
    arr = arr.map((item: TxResponseErc) => {
      return {
        ...item,
        contractData: getToken(item,data.contractData)
      }

    }).filter((item: TxResponseErc) => item.contractData && item.contractData?.type)
    console.log(arr, 'arr')
    recentReceived.value = [...recentReceived.value, ...arr]
    // .filter((item: TxResponseErc) => 
    // item.contractData?.type && 
    // (item.contractData.value.name == 'Transfer' || item.contractData.value.name == 'Approval'))
    // console.log(arr, 'arr')
    // recentReceived.value = [...recentReceived.value, ...arr]

    recentReceivedLoding.value = false
  if (recentReceived.value.length < 50) return callback()
  } catch (err) {
    recentReceivedLoding.value = false
  }

}

const getForm = function (tx: TxResponse) {
  if (tx && tx.raw_log) {
    let attributes: { attributes: any[] } = { attributes: [] };
    try {
      let raw_log: [any] = JSON.parse(tx.raw_log)[0].events;
      attributes = raw_log.find((item) => {
        return item.type === 'message';
      });
    } catch (error) { }
    if (attributes && attributes.attributes.length) {
      let sender = attributes.attributes.find((item) => {
        return item.key === 'sender' && item.value.indexOf('novaichain') === -1;
      })?.value;
      return sender;
    }
    return '';
  }
  return '';
}
//获取地址
const getAddress = function (value: any) {
  if(value.eventName == 'ERC1155') return value.to
  if(value.data.to) return value.data.to
  if(value.data.spender) return value.data.spender
  if(value.data.approved) return value.data.approved
  
  return value.to
}
</script>
<template>
  <div>


    <paging :api="getPageList" :callback="callback" :limit="limit" :page="page" :total="total">
      <table class="table w-full text-sm">
        <thead>
          <tr class="sticky top-[0px] bg-[#131315] text-[#ffffff]/[.54] text-[12px]  z-[10]">
            <th class="!font-[400] py-3">{{ $t('account.height') }}</th>
            <th class="!font-[400] py-3">{{ $t('account.hash') }}</th>
            <!-- <th class="py-3">{{ $t('account.amount') }}</th> -->
            <th class="!font-[400] py-3">{{ $t('account.from') }}</th>
            <th class="!font-[400] py-3">{{ $t('account.to') }}</th>
            <th class="!font-[400]">{{ $t('tx.Value') }}</th>
            <th class="!font-[400]">{{ $t('account.contract') }}</th>
            <th class="!font-[400]">{{ $t('block.fees') }}</th>
            <th class="py-3 !font-[400]">{{ $t('account.time') }}</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <template v-for="(v, index) in recentReceived" :key="index">
            <tr class="border-dashed">
              <td class="text-sm py-3">
                <RouterLink :to="`/${chain}/block/${v.blockNumber}`" class="textjb-lv dark:invert">{{ v.blockNumber }}
                </RouterLink>


                <!-- <RouterLink :to="`/${chain}/block/${v.height}`" class="textjb-lv dark:invert">{{ v.height }}
                </RouterLink> -->

              </td>
              <td class="truncate py-3 font-[OrbitronMedium]" style="max-width: 200px">
                <RouterLink :to="`/${chain}/tx/${v.txHash}`" class="textjb-lv dark:invert">
                  {{ v.txHash }}
                </RouterLink>

              </td>

              <td class=" py-3" style="max-width: 200px">


                <CopyItem :value="v.address">
                  <template v-if="getToUpperCase(v.address) != getToUpperCase(address)">
                    <RouterLink v-if="v.address" :to="`/${chain}/account/${v.address}`" class="textjb-lv dark:invert">
                      {{ v.address }}
                    </RouterLink>


                  </template>
                  <template v-else>{{ v.address }}</template>
                </CopyItem>
              </td>
              <td class=" py-3" style="max-width: 200px">
                <template  v-if="v.contractData?.type">
                  <CopyItem
                    :value="getAddress(v.contractData.value)">
                    <template
                      v-if="getToUpperCase(getAddress(v.contractData.value)) != getToUpperCase(address)">
                      <RouterLink v-if="v.address"
                        :to="`/${chain}/account/${getAddress(v.contractData.value)}`"
                        class="textjb-lv dark:invert">
                        {{ getAddress(v.contractData.value) }}
                      </RouterLink>


                    </template>
                    <template v-else>{{ getAddress(v.contractData.value) }}</template>
                  </CopyItem>
                </template>


                <CopyItem v-else-if="v.to" :value="v.to">
                  <template v-if="getToUpperCase(v.to) != getToUpperCase(address)">
                    <RouterLink v-if="v.address" :to="`/${chain}/account/${v.to}`" class="textjb-lv dark:invert">
                      {{ v.to }}
                    </RouterLink>


                  </template>
                  <template v-else>{{ v.to }}</template>
                </CopyItem>
                <span v-else>
                  new contract
                </span>




              </td>
              <td class="truncate" style="max-width: 200px">

                <tdItem :value="v" type="value" :chain="chain"></tdItem>


              </td>
              <td class="truncate ">
                <tdItem :value="v" type="token" :chain="chain"></tdItem>


              </td>

              <td>{{ formatNumberWithCommas(getFormatUnits(String(v.gas * v.gasPrice))) }}
                <!-- {{ formatNumberWithCommas(getFormatUnits((v.gas * v.gasPrice))) }} NOVAI -->

              </td>

              <td class="py-3" style="min-width: 200px">
                {{ format.toLocaleDate(v.timestamp * 1000) }} <span class=" text-xs">({{
                  format.toDay(v.timestamp * 1000, 'from') }}) </span>
              </td>
            </tr>
          </template>
          <tr class="border-dashed">
            <td colspan="10">
              <div class="text-center">

                {{ !recentReceivedLoding && recentReceived.length === 0 ? $t('account.no_transactions') :
                  recentReceivedLoding || page < total ? $t('account.loading') : '' }} </div>
            </td>
          </tr>
        </tbody>
      </table>
    </paging>


    <!-- <PaginationBar v-if="!txsRecentReceived" :total="total" :limit="limit" :callback="callback"></PaginationBar>
      <div class="flex justify-center pt-[10px]" v-if="recentReceived.length > 10 && page === 1">
        <div @click="txsRecentReceived = !txsRecentReceived" class="cursor-pointer">
          {{ txsRecentReceived ? $t("account.Expand") : $t("account.Collapse") }}
        </div>
      </div> -->
  </div>
</template>
