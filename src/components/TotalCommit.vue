<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { get, post } from '@/libs';
import {
  useFormatter,
  useBaseStore,
  useBlockchain
} from '@/stores';
import { GetContract, addresses, abi, getParseUnits, getFormatUnits, getInterface } from "@/libs/web3/index"

const { chain } = defineProps(['chain']);
const total_accounts = ref<any>(0)
const totalTransactions = ref(0)
const format = useFormatter();
const base = useBaseStore();
const blockchain = useBlockchain();
const totalTransferVolume = ref(0)

const getTotal = () => {
  get(`cosmos/auth/v1beta1/accounts`).then((res) => {
    console.log(res)
    let { pagination } = res
    console.log(res)
    total_accounts.value = pagination.total
  })
}

getTotal()
const GetAllERC20TokenStats = () => {
    post(`chainFinder/api/GetTotalEventCount`).then((res) => {
    console.log(res,'GetTotalEventCount')
    totalTransactions.value = res.data
  })
  post(`chainFinder/api/GetAllERC20TokenStats`,{
    "pageNo":1,
    "pageSize":10
  }).then((res) => {
    console.log(res,'GetAllERC20TokenStats')

    let { stat } = res.data
    let nums = 0
    stat.forEach((item: { ContractAddress: string,TotalTransferredAmount:any}) => {
      //let data = )
      if( item.ContractAddress.toLowerCase() == addresses.nAI.toLowerCase() || 
      item.ContractAddress.toLowerCase() == addresses.novaichain.toLowerCase() 
      || item.ContractAddress.toLowerCase() == addresses.wNovai.toLowerCase()) {
        GetContract(item.ContractAddress).decimals().then((decimals) => {
          let num = getFormatUnits(item.TotalTransferredAmount.toString(), decimals)
          nums += num
          totalTransferVolume.value = Number(nums.toFixed(0))
        })
      }
    })
    
  })
}
GetAllERC20TokenStats()



</script>
<template>
  <div>
    <div class="rounded-[16px] mb-[12px] mb:[24px] border border-[#FFFFFF]/[.16] bg_jb" style="">

      <div class="text-[#ffffff]">

        <div class="font-[OrbitronMedium] flex justify-between flex-wrap flex-col md:!flex-row lg: px-[24px] pb-[32px] text-center">
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_accounts') }}</div>
            <div class="text-[18px] md:!text-[20px]">{{ total_accounts }}</div>
          </div>
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_value_locked') }}</div>
            <div class="text-[18px] md:!text-[20px]">21,000,000</div>
          </div>
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_transactions') }}</div>
            <div class="text-[18px] md:!text-[20px]">{{totalTransactions}}</div>
          </div>
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_transfer_volume') }}</div>
            <div class="text-[18px] md:!text-[20px]">{{totalTransferVolume}}</div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>