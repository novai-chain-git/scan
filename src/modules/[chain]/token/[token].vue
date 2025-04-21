<script lang="ts" setup>
import textCard from "@/components/textCard.vue"
import Jazzicon from "jazzicon"

import { Icon } from '@iconify/vue';
import { provider, GetContract, getFormatUnits, addresses, abi } from "@/libs/web3/index"
import { useBlockchain } from '@/stores';
import { ref, watch, reactive, computed } from 'vue';
import numeral from "numeral"
import { encryptString, formatNumberWithCommas } from "@/libs/utils"
import editor from "@/components/editorModule.vue"
import contractModule from "@/components/token/contract/index.vue"
import { name } from "@/libs/clients/evmos";
import nAIImg from "@/assets/images/nai.png"
import novaiIconImg from "@/assets/images/novaiIcon.svg"
import usdtIcon from "@/assets/images/usdtIcon.png"
import btcIcon from "@/assets/images/btc.png"
import wNovaiIcon from "@/assets/images/8913.svg"
//import { getBankBalances } from "@/libs/client"

let blockchain = useBlockchain()

const props = defineProps(['token', 'chain']);
const blockStore = useBlockchain();



const current = blockStore?.current?.chainName || '';

const iconDom = ref("")

const tex = ref<any>("")

//当前主
const total = ref<any>(null)

const sum = ref()

const contractInfo = ref()
const info = reactive({
  total: 0,
  totalS: 0,

  from: "",
  txHash: "",
  name: "",

  //判断是否已经上传
  code: null

})

const balanList = reactive([
{
    name:"NOVAI",
    abi:abi,
    img: novaiIconImg,
    num: 0
  },
  {
    name:"nUSDT",
    addresses: addresses.novaichain,
    abi:abi,
    img: usdtIcon,
    num: 0
  },
  {
    name:"nBTC",
    addresses: addresses.btcAddress,
    abi:abi,
    img: btcIcon,
    num: 0
  },
  {
    name:"wNOVAI",
    addresses: addresses.wNovai,
    abi:abi,
    img: wNovaiIcon,
    num: 0
  },
  {
    name:"nAI",
    addresses: addresses.nAI,
    abi:abi,
    img: nAIImg,
    num: 0
  },
])
const novai = ref(0)
const novaiName = ref('NOVAI')

const nUsdt = ref(0)
const nUsdtName = ref('nUSDT')



const nBtc = ref(0)
const nBtcName = ref('nBTC')

const wNovai = ref(0)
const wNovaiName = ref("wNOVAI")

async function getUsdt() {

  balanList.forEach((item,index) =>{
    if(item.name == 'NOVAI'){
      provider().getBalance(props.token).then(res => {
         balanList[index].num = Number(getFormatUnits(res, 18))
        })
    }else if(item.addresses){
      GetContract(item.addresses, item.abi).balanceOf(props.token).then(res => {
        console.log(res,'resresres')
        balanList[index].num = Number(getFormatUnits(res, 6))
      }).catch(err => {
        console.log(err, 'err')
      })

      GetContract(item.addresses, item.abi).name().then((res) => {
        console.log(res,'resNmae')
        balanList[index].name = res
  }).catch(err => {
    console.log(err, 'err')
  })

    }
  })

  // GetContract(addresses.novaichain, abi).balanceOf(props.token).then(res => {
  //   // const number = ;
  //   nUsdt.value = Number(getFormatUnits(res, 6))
  // }).catch(err => {
  //   console.log(err, 'err')
  // })

  // GetContract(addresses.novaichain, abi).name().then((res) => {
  //   nUsdtName.value = res
  // }).catch(err => {
  //   console.log(err, 'err')
  // })


  // GetContract(addresses.btcAddress, abi).balanceOf(props.token).then(res => {
  //   // const number = ;
  //   nBtc.value = Number(getFormatUnits(res, 6))
  // }).catch(err => {
  //   console.log(err, 'err')
  // })
  // GetContract(addresses.btcAddress, abi).name().then((res) => {
  //   nBtcName.value = res
  // }).catch(err => {
  //   console.log(err, 'err')
  // })

  // GetContract(addresses.wNovai, abi).balanceOf(props.token).then(res => {
  //   // const number = ;
  //   console.log(res,'res')
  //   wNovai.value = Number(getFormatUnits(res, 18));
  // }).catch(err => {
  //   console.log(err, 'err')
  // })

  // provider().getBalance(props.token).then(res => {
  //   novai.value = Number(getFormatUnits(res, 18))
  // })
}
watch(
  () => props.token,
  async (newAccount: any) => {
    contractInfo.value = {}
    info.from = ''
    info.txHash = ''
    info.code = null
    info.name = ''
    info.total = 0
    info.totalS = 0
    if (newAccount) {
      iconDom.value = Jazzicon(24, parseInt(newAccount.slice(2, 10), 24)).outerHTML;

      idtoken()

    }
  },
  {
    immediate: true
  }
);

//获取当前地址是否是合约地址，获取
async function idtoken() {
  getContract()
  getUsdt()
  totalSupply()

  getSum()

}

//获取当前币最大发行量
async function totalSupply() {
  try {
    let GetContractFun = GetContract(props.token)
    //获取发行总数
    let num = await GetContractFun.totalSupply()
    //获取合约币精度
    let decimals = await GetContractFun.decimals()
    console.log(decimals,'decimals')
    info.total = getFormatUnits(num, decimals);

    //获取合约币名称
    GetContractFun.name().then(res => {
      info.name = res
    })       // return decimals
  } catch (err) {

  }
}
//获取主钱包当前还有多少数量
async function getSum() {
  try {
    // sum.value = await GetContract(addresses.novaichain).balanceOf(addresses.mainWallet)

    //获取当前链币主钱包地址
    let GetContractFun = GetContract(props.token)
    let owner = await GetContractFun.owner()

    let num = await GetContractFun.balanceOf(owner)
    //获取合约币精度
    let decimals = await GetContractFun.decimals()
    let total = getFormatUnits(num, decimals);

    info.totalS = total
    //  let decimals = await GetContractFun.decimals()
    //  let total = getFormatUnits(num, decimals);

  } catch (err) {

  }
  //     GetContract(addresses.novaichain).balanceOf(addresses.mainWallet).then(res => {
  //     // const number = ;
  //     sum.value = Number(getFormatUnits(res, 6))
  //   }).catch(err => {
  //     console.log(err, 'err')
  //   })
}
//获取合约中的各种币数据
//获取合约创建者
async function getContract() {
  try {
    let { data, code } = await blockchain.rpc?.getContractToken(props.token)
    console.log(data,'datadata')
    // console.log(res,'res')
    info.from = data?.from
    info.txHash = data?.txHash
    info.code = code
    if (code !== 0) {
    }
    contractInfo.value = data
    //    form:""
    //    txHash:"",
  } catch (err) {
  }

}

//获取流通供应市值
let getTotalS = computed(() => {
  return numeral(info.total).difference(info.totalS)
})


</script>
<template>
  <div class="text-[#ffffff]">
    <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px] 
    px-4 pt-3 pb-4 mb-4  
    flex items-center">
      <div v-html="iconDom" class="mr-[10px] w-[24px] h-[24px]"></div>

      <span class="  mr-[10px] font-[400] pt-[1px]">{{ $t('token.account') }} </span>
      <span class=" truncate  pt-[1px]">{{ token }}</span>
    </div>
    <div>

    </div>

    <div class="  mb-4 grid grid-cols-1  gap-[10px]"
      :class="info?.name == 'USDT' ? 'lg:!grid-cols-3' : 'lg:!grid-cols-2'">
      <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]  px-4 pt-3 pb-4 w-full">
        <div class="text-[14px]  pb-1 font-[OrbitronMedium] tracking-[.5px]">{{ $t('token.Overview') }}</div>
        <div class=" mb-2">
          <span class="pb-1">
            {{ $t('token.MAX_TOTAL_SUPPLY') }}
          </span>
          <br>
          <span class="pb-1">
            {{ formatNumberWithCommas(info.total) }} {{ info.name }}
          </span>
        </div>
        <div v-if="contractInfo?.from && contractInfo?.txHash">
          <div class="pb-1 font-[OrbitronMedium] tracking-[.5px]">
            {{ $t('token.CONTRACT_CREATOR') }}
          </div>
          <div class="truncate">
            <RouterLink :to="{
              path: `/${current}/account/${contractInfo?.from}`
            }">
              <span class=" textjb-lv">
                {{ encryptString(contractInfo?.from) }}
              </span>
            </RouterLink>
            <span class="px-1">ant</span>
            <span class="pr-1">txn</span>
            <RouterLink :to="{
              path: `/${current}/tx/${contractInfo?.txHash}`
            }">
              <span class=" textjb-lv">
                {{ contractInfo?.txHash }}
              </span>
            </RouterLink>
          </div>

        </div>
      </div>
      <div v-show="info.name == 'USDT'" class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]  px-4 pt-3 pb-4">
        <div class="text-[14px]  font-[OrbitronMedium] tracking-[.5px]">{{ $t('token.MoreInfo') }}</div>
        <div class="mb-2">
          <span class="pb-1"></span>
          {{ $t('token.PRICE') }}
          <br>
          <span class="pb-1">
            $1.00 @ 1 {{ info.name }}
          </span>
        </div>
        <div class="mb-2">
          {{ $t('token.ONCHAIN_MARKET_CAP') }}
          <br>
          <span class="pb-1">
            ${{ formatNumberWithCommas(info.total) }}
          </span>
        </div>
        <div>
          {{ $t('token.CIRCULATING_SUPPLY_MARKET_CAP') }}
          <span class="pb-1"></span>
          <br>
          <span>
            $ {{ formatNumberWithCommas(getTotalS) }}
          </span>
        </div>
      </div>
      <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]  px-4 pt-3 pb-4">
        <div class="text-[14px]  font-[OrbitronMedium] tracking-[.5px]">{{ $t('token.MultichainInfo') }}</div>
        <div>
          <span class="pb-1">{{ $t('token.TOKEN_CONTRACT') }}</span>

          <br>
          <span>{{ token }}</span>
        </div>
      </div>
      <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px] px-4 pt-3 pb-4">
        <div class="text-[14px]  font-[OrbitronMedium] tracking-[.5px]">{{ $t('token.currency') }}</div>

        <div>
          <div v-for="(item,key) in balanList" :key="key" class="flex items-center px-4 my-2 md:!my-[22px]">
            <img class="w-[28px] mr-4" :src="item.img"></img>
            <div class="flex-1">
              <div class=" ">
                {{
                  item.num
                }}
                {{ item.name }}
              </div>
            </div>
          </div>
          <!-- <div class="flex items-center px-4 my-2 md:!my-[22px]">
            <img class="w-[28px] mr-4" src="@/assets/images/novaiIcon.svg"></img>
            <div class="flex-1">
              <div class=" ">
                {{
                  novai
                }}
                {{ novaiName }}
              </div>
            </div>
          </div>
          <div class="flex items-center px-4 mb-2 md:!mb-[22px]">
            <img class="w-[28px] mr-4" src="@/assets/images/usdtIcon.png"></img>
            <div class="flex-1">
              <div class=" ">
                {{
                  nUsdt
                }}
                {{ nUsdtName }}
              </div>
            </div>
          </div>

          <div class="flex items-center px-4 mb-2 md:!mb-[22px]">
            <img class="w-[28px] mr-4" src="@/assets/images/btc.png"></img>
            <div class="flex-1">
              <div class=" ">
                {{
                  nBtc
                }}
                {{ nBtcName }}
              </div>
            </div>
          </div>
          <div class="flex items-center px-4 mb-2 md:!mb-[22px]">
            <img class="w-[28px] mr-4" src="@/assets/images/8913.svg"></img>
            <div class="flex-1">
              <div class=" ">
                {{
                  wNovai
                }}
                {{ wNovaiName }}
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <div v-if="contractInfo?.status === 0" class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] 
    rounded-[16px] px-4 pt-3 pb-4 mb-4">
      <div class="text-base pb-5">
        {{ $t('token.Are_you_the_contract_creator') }}
        <RouterLink :to="{
          path: `/${current}/verifycontract/${token}`
        }">
          <span class=" textjb-lv">
            {{ $t('token.Verify_and_Publish') }}
          </span>
        </RouterLink>
        {{ $t('token.your_contract_source_code_today') }}
      </div>
      <textCard :text="contractInfo?.creationCode" copy> </textCard>
    </div>

    <contractModule v-bind="$props" :contractInfo="contractInfo" :info="info" 
    v-if="contractInfo?.status === 1">
    </contractModule>
    <div v-if="contractInfo?.status === 1">

    </div>
  </div>
</template>
