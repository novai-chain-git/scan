<script lang="ts" setup>
import { ref, watch, inject } from 'vue'
import operationForm from './operationForm.vue'
import { connectWallet, provider, GetContract, getERC20Contract, getActiveLibrary } from "@/libs/web3/index"
const props = defineProps(["contractInfo", 'tab', "token", "abiItem"])


//const formData = ref<{ [key: string]: any }>({})
let data = ref('' as any)
const loding = ref(false)
const errText = ref('' as any)
const formData = ref([] as any[])
const formDatas = ref(['asdasd'] as any[])
const walletAddress = inject('walletAddress',ref('')) 

console.log(props.abiItem, props.token, 'this.token')

watch(props.abiItem?.inputs, () => {
  if (props.abiItem?.inputs) {
    formData.value = props.abiItem.inputs.map((item: { name: string | number; }, key: number) => {
      return ''
    })
    //for( abiItem.inputs in key){}
    // formData.value = 
  }
}, {
  immediate: true,
})
//执行判断方法
async function getResult() {
  //   if(props.abiItem.outputs.length > 1) return
  //   let GetContractFun = GetContract(props.token)
  // //  console.log(item,'item',GetContractFun,"item.name",item.name)
  //   try {
  //    let res = await GetContractFun[props.abiItem.name]()
  //    str.value = res
  //    console.log(res, 'resss',props.abiItem.name,props.abiItem)
  //   }catch (err) {
  //     console.log(err, 'errerrerrerr',props.abiItem.name,props.abiItem)
  //   }
  //return 'res'
}
function getPlaceholder(item: { name: any; type: any; }) {
  return `${item.name || '<input>'} (${item.type})`
}

//写入数据
async function onWrite() {
  console.log(walletAddress,'walletAddress')
  
  if (!walletAddress.value || loding.value) return
  loding.value = true
  errText.value = ''
  try {
    const library = getActiveLibrary();
    library?.send('eth_requestAccounts', []);
    const signer = await library?.getSigner();
    console.log(signer,'signer',library)
    console.log(['asdadsa'])
    console.log(props.abiItem.name,formDatas.value, 'props.abiItem.name',formData.value,formData.value[0],typeof formData.value)
    let GetContractFun = getERC20Contract(props.token, JSON.parse(props.contractInfo.abi), signer)
    let tx:any = ''

    
    if (formData.value.length > 0) {
      tx = await GetContractFun[props.abiItem.name](...formData.value)
      console.log(tx, 'res')
    } else {
      tx = await GetContractFun[props.abiItem.name]()
      console.log(tx, 'res')
    }
  }catch (err: any) {
    console.log(err,'err')
    errText.value = err.message || err.stack
  } finally {
    loding.value = false
  }

}
//读取数据
async function onSubmit() {
  if (loding.value) return
  loding.value = true
  errText.value = ''
  //debugger
  let GetContractFun = GetContract(props.token, JSON.parse(props.contractInfo.abi))
  try {
    //let res
    data.value = await GetContractFun[props.abiItem.name](...formData.value[0])

  } catch (err: any) {
    data.value = ''
    errText.value = err.message || err.stack
  } finally {
    loding.value = false
  }

}
</script>
<template>
  <div class="">
    <template v-for="(item, key) in abiItem.inputs " :key="key">
      <div class="pb-2">
        <label>{{ getPlaceholder(item) }}</label>
      </div>
      <div class="pb-2">
        <input class="rounded w-full border p-1 bg-[#0A0B0F] border-[#ffffff]/[0.16]" type="text" v-model="formData[key]"
          :placeholder="getPlaceholder(item)">
      </div>
    </template>
    <div class="flex items-center">
      <button v-if="abiItem.type === 'function'
        && (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure')"
         @click="onSubmit" class="text-sm px-2 py-1 leading-10 cursor-pointer bg-lv
       text-[#181A20] rounded-lg">
        {{ $t("token.Query") }}
      </button>
      <button v-else @click="onWrite" :class="[walletAddress ? 'cursor-pointer' : '!cursor-auto']" 
      class="text-sm px-2 py-1 leading-10  bg-lv
       text-[#181A20] rounded-lg">
        {{ $t("token.write") }}
      </button>
      <span v-if="!abiItem.outputs.length" class="text-[red] pl-1 text-xs">{{ errText }}</span>
      <img v-show="loding" class="ml-1" src="@/assets/images/gif/loader2.gif" width="100"></img>
    </div>

    <div class="" v-if="abiItem.outputs.length">
      <img src="@/assets/svg/shape.svg" class="inline-block" width="8"></img>
      <template v-for="(item, key) in abiItem.outputs " :key="key">
        <span>{{ item.name }}</span>&nbsp; <span class="italic text-xs">{{ item.type }}</span>
      </template>
      <span class="text-[red] pl-1 text-xs">{{ errText }}</span>
    </div>
    <div v-show="data !== ''" class="pt-2">
      <div>[{{ abiItem.name }}(
        <template v-for="(item, key) in abiItem.inputs " :key="key">
          <span>{{ key > 0 ? ',' : '' }} {{ item.type }} </span>
        </template> ) method Response]
      </div>
      <div>
        <template v-if="abiItem.outputs.length">
          <i class="text-[#5cee00] iconfont transition-all duration-300 icon-a-30Byoushuangjiantou rotate-0"></i>

          <template v-for="(item, key) in abiItem.outputs " :key="key">
            <span>{{ item.name }}</span>&nbsp; <span class="italic text-xs">{{ item.type }}</span>
          </template>
          :{{ data }}
        </template>

      </div>
    </div>
  </div>
</template>
