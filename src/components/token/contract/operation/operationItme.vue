<script lang="ts" setup>
import { ref } from 'vue'
import operationForm from './operationForm.vue'
import { provider, GetContract } from "@/libs/web3/index"
const props = defineProps(["contractInfo", 'tab', "token", "abiItem"])

let str = ref('')
//let GetContractFun = GetContract(props.token)

//执行判断方法
async function getResult(){
  if(props.abiItem.inputs.length != 0 || (props.abiItem.stateMutability === 'nonpayable' || props.abiItem.stateMutability === 'payable')) return
  let GetContractFun = GetContract(props.token,JSON.parse(props.contractInfo.abi))
//  console.log(item,'item',GetContractFun,"item.name",item.name)
  try {
    console.log(GetContractFun,'GetContractFun')
   let res = await GetContractFun[props.abiItem.name]()
   str.value = res
   console.log(res, 'resss',props.abiItem.name,props.abiItem)
  }catch (err) {
    console.log(err, 'errerrerrerr',props.abiItem.name,props.abiItem)
  }
//return 'res'
}
getResult()

</script>
<template>
  <div class="p-2">
    <div v-if="abiItem.inputs.length == 0 && (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure')">
      {{str}} <span class="text-xs">{{abiItem.outputs[0]?.type}}</span> 
    </div>
    <operationForm v-else v-bind="$props">

    </operationForm>
  </div>
</template>
