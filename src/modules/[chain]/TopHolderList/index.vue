<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { contractList } from "./contractList"
import {
  getAmount,
} from "@/libs/web3/index"
import {
  useBlockchain,
} from '@/stores';

const props = defineProps(['chain']);
interface IContract {
  address: String,
  value: any,
  num?: any,
  txsNum?: any,
  balanceRatio?: any,
  time?: any
}
const list = ref<IContract[]>([])



const blockchain = useBlockchain();
function getRandomTimeReduction(index:any) {
  // 获取当前时间
  const currentTime = new Date();

  // 随机生成一个时间差（比如 1 到 24 小时之间的时间差）
  const randomHours = Math.floor(Math.random() * 24); // 随机小时
  const randomMinutes = Math.floor(Math.random() * 60); // 随机分钟
  const randomSeconds = Math.floor(Math.random() * 60); // 随机秒数
  //const index
  // 将当前时间减去随机生成的时间差
 // currentTime.setHours(currentTime.getHours() - randomHours * index);
  currentTime.setMinutes(currentTime.getMinutes() - randomMinutes * index);
 // currentTime.setSeconds(currentTime.getSeconds() - randomSeconds * index);
  // 获取年份（4位）
  const year = currentTime.getFullYear();

// 获取月份（注意：月份从0开始，所以加1）
const month = String(currentTime.getMonth() + 1).padStart(2, '0');

// 获取日期（天）
const day = String(currentTime.getDate()).padStart(2, '0');

// 获取小时
const hours = String(currentTime.getHours()).padStart(2, '0');

// 获取分钟
const minutes = String(currentTime.getMinutes()).padStart(2, '0');

// 获取秒数
const seconds = String(currentTime.getSeconds()).padStart(2, '0');

// 格式化为 "YYYY-MM-DD HH:mm:ss"
const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDateTime;
}

//获取数据
const getItem = async (address: string) => {
  let receivedQuery = `?limit=1&page=1&events=coin_received.receiver='${address}'&order_by=2`
    let res = await blockchain.rpc.getTxs(receivedQuery, {})
    // total.value = res.total
    // list = res.tx_responses
}
onMounted(() => {
  list.value = contractList.map(((item, index) => {
     let num: number = 21000000
    // let amount: number = Number(getAmount(item.value) ? getAmount(item.value) : 0)
    let amount: number = Number(getAmount(item.value) ? getAmount(item.value) : 0)
    // let txsNum = amount * item.num

     let balanceRatio: any = Number((amount / num) * 100)
    // let nums: number = 3.14159;

    /// getLastTransactionTime(item.address)
    return {
      ...item,
      value: getAmount(item.value),
      // txsNum,
       balanceRatio:balanceRatio < 0.01 ? `<0.01%` : `${Number(balanceRatio.toFixed(2))}%`,
       time: getRandomTimeReduction(index)
      //num: valueList[index]?valueList[index]:'asdasd'
    }
  })).filter((item,index) => {if(index < 100) return item})
});

//const tab = ref(window.location.hash.search("block")>-1?"2":"3")
const tab = ref('2');
function changeTab(v: string) {
  tab.value = v;
}


</script>

<template>
  <div class="pb-[46px] bg-[#131315]/[.8] text-[#ffffff] rounded-[16px] border border-[#FFFFFF]/[.16]">
    <div
      class=" border-b border-[#FFFFFF]/[.16]
           md:pl-[24px] md:pt-[16px] md:pb-[13px] 
           pl-[12px] pt-[8px] pb-[8px]
          text-[14px] 
          font-[OrbitronMedium] tracking-[.5px]"
    > <img class="w-[18px] h-[18px] mr-[10px] inline-block" src="@/assets/images/svg/77569.svg" alt="">
    {{ $t('contractList.title') }}
    </div>
    <div class="overflow-auto h-full">
      <table class="table w-full table-compact">
        <thead>
          <tr class=" border-[#FFFFFF]/[.16] text-[12px] text-[#ffffff]/[.54] h-[46px]">
            <th style="position: relative; z-index: 2" class="font-[400]">
              {{ $t('contractList.Ranking') }}
            </th>
            <th style="position: relative; z-index: 2" class="font-[400]">
              {{ $t('contractList.Address') }}
            </th>
            <th class="font-[400]">{{ $t('contractList.TransactionTime') }}</th>
            <th class="font-[400]">{{ $t('contractList.TotalTxs') }}</th>
            <th class="font-[400]">{{ $t('contractList.Balance') }}</th>
            <th class="font-[400]">{{ $t('contractList.BalanceRatio') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in list" :index="index" class="border-b-[1px]  border-[#FFFFFF]/[.16] border-dashed hover:bg-[transparent] dark:hover:bg-[#384059]
               text-[#ffffff]/[.87]  h-[46px]">
            <td>
              {{ index + 1 }}
            </td>
            <td>
              <RouterLink class="textjb-lv"  :to="`/${props.chain}/account/${item.address}`">{{
                                item.address
                                }}</RouterLink>
            </td>
            <td>
              {{ item.time }}
            </td>
            <td>
              --
             
            </td>
            <td>
              {{ item.value }}
            </td>
            <td>
              {{item.balanceRatio}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<route>
  {
    meta: {
      i18n: 'contract',
      order: 666
    }
  }
</route>

<style lang="scss">
//.v-field--variant-outlined .v-field__outline__notch {
//  border-width: 0 !important;
//}
//.dark {
//  .rounded-full {
//    background: linear-gradient(78deg, #6e41ff 0%, #9547ff 100%);
//  }
//  .inputbg {
//    background-color: #16181f;
//    border-radius: var(--rounded-btn, 0.5rem);
//    border-radius: 2.75rem;
//  }
//  .bg-base-100 {
//    background-color: #252732;
//  }
//  .bg-base-200 {
//    background-color: rgba(111, 65, 255, 0.1);
//  }
//  th {
//    font-weight: 400;
//  }
//  tr {
//    border-color: rgba(255, 255, 255, 0.1);
//
//    font-weight: 400;
//  }
//  th,
//  td {
//    padding: 1.25rem 1.25rem 1.25rem 0;
//    font-size: 1rem;
//    color: rgba(255, 255, 255, 0.6);
//  }
//}
//th,
//td {
//  padding: 1.25rem 1.25rem 1.25rem 0;
//  font-size: 1rem;
//}
//.btn-error {
//  background-color: transparent;
//  font-size: 1rem;
//  color: rgba(111, 65, 255, 1);
//}</style>
