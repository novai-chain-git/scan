<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';
import { useFormatter } from '@/stores';
import { Interface, JsonRpcProvider, Contract, formatUnits } from 'ethers';
import { toReadableAmount } from '@/libs/utils';
import { addresses, GetContract, getFormatUnits } from '@/libs/web3/index';
import { nusdtAbi, NovaiFaucetAbi, uniswap } from '@/libs/web3/abi/index';
import { post } from "@/libs"

import dayjs from 'dayjs';
import {
  fromBase64,
  fromBech32,
  toBech32,
  toHex,
  fromHex,
} from '@cosmjs/encoding';

const props = defineProps(['tx', 'hash', 'chain']);
const format = useFormatter();
const transfersType = ref('1');
const launch = ref(false);

const form = computed(() => {
  if (props.tx.tx_response && props.tx.tx_response.raw_log) {
    let attributes: { attributes: any[] } = { attributes: [] };
    try {
      let raw_log: [any] = JSON.parse(props.tx.tx_response.raw_log)[0].events;
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
});
const msgIndex = computed(() => {
  let index = '';
  if (props.tx.tx_response && props.tx.tx_response.raw_log) {
    try {
      let raw_log: [any] = JSON.parse(props.tx.tx_response.raw_log);
      index = raw_log[0].msg_index;
    } catch (error) { }
  }
  return index;
});
const objValue = computed(() => {
  // if(transData.showErc20){
  //    mapAmount(props.tx.tx_response.events)
  // }
  let obj: {
    to?: string;
    value?: any;
    nonce?: string;
    data?: string
  } = { to: '', value: '0' };
  if (props.tx?.tx_response?.tx?.body) {
    let messages: [any] = props.tx.tx_response.tx.body.messages;

    if (messages.length) {
      obj = messages[0].data ? messages[0].data : {};

      // obj.value = obj.value?formatter.format(Number(obj.value)):''

    }
  }
  // if(obj.value){
  //   console.log(getAmount(obj.value),'getAmount(obj.value)')
  //      obj.value = getAmount(obj.value)
  //     }
  return obj;
});

function mapAmount(
  events: { type: string; attributes: { key: string; value: string }[] }[]
) {
  if (!events) return [];
  let a = events
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

      // let str = num.match(/^(\d+)(\D*)$/)
      //  return `${Number(formatUnits(num.replace(/\D+$/, ''),18)).toFixed(6)}`
      //return num
      let str = num.match(/^(\d+)(\D*)$/);
      if (str?.length) {
        return `${Number(formatUnits(str[1], 18)).toFixed(6)} ${str[2]}`;
        //  return `${Number(formatUnits(str[1]),18)).toFixed(6)}`
      }
      return x.key === 'amount'
        ? x.value
        : String.fromCharCode(...fromBase64(x.value ?? ''));
    });
  console.log(a, 'a');
}

function getAmount(value: any) {
  if (value) return Number(Number(formatUnits(value, 18)).toFixed(6));
  return ``;
}

const gasLimit = computed(() => {
  if (props.tx.tx.auth_info && props.tx.tx.auth_info.fee) {
    return props.tx.tx.auth_info.fee.amount[0].amount;
  }
  return '';
});
const gas = computed(() => {
  if (props.tx.tx.body && props.tx.tx.body.messages) {
    let gas = props.tx.tx.body.messages[0]
      ? props.tx.tx.body.messages[0].data.gas
      : '';
    return gas;
  }
  return '';
});

function calculatePercentage(numerator: any, denominator: any) {
  if (denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
    return 0; // 防止除以0或非数字输入
  }

  return `${(numerator / denominator) * 100}%`;
}

const abi = [
  'function transfer(address to, uint amount)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
];
const iface = new Interface(abi);

const ifaceNusdt = new Interface(nusdtAbi);
const ifaceUniswap = new Interface(uniswap);

const getNovaiFaucetAbi = new Interface(NovaiFaucetAbi);



const NovaiFaucetData = reactive({
  type: false,
  value:'0' 
})
const transData = reactive({
  value: '0',
  to: '',
  tokenName: '',
  showErc20: false,
  decimals: '',
  name:""
});

const swapData = reactive({
  address: "",
  to: '',
  form: "",
  toAddress: "",
  formAddress: "",
  decimals: '',
  time: "",
  automation:false,
  showSwap: false
});

//1155查询
const get1155 = reactive({
  show1155: false
})
const getEventsByInfo = ref<any>('')

const provider = new JsonRpcProvider('https://rpc.novaichain.com');
const contract = computed(() => {
  return new Contract(objValue.value.to!, abi, provider);

});
const swapContract = computed(() => {
  return new Contract(objValue.value.to!, uniswap, provider);

});

async function getTokenInfo(value: any) {
  try {

    const name = await contract.value.name();
    const decimals = await contract.value.decimals();
    console.log('getTokenInfo：', name, decimals);
    transData.tokenName = name;
    transData.decimals = decimals;
    transData.value = toReadableAmount(value, decimals);
  } catch (error) {
    console.log('getTokenInfo error：', error);
  } finally {
    transData.showErc20 = true;
   
  }
}
async function GetEventsByTxHash() {
  try {
    let { data } = await post('/chainFinder/api/GetEventsByTxHash', {
      TxHash: props.hash,
    })
    if(data.contractData[0] && data.contractData[0].eventName == 'ERC1155'){
      get1155.show1155 = true
    }
    getEventsByInfo.value = data
    console.log(data,'data')
  } catch (error) {
    console.log('getTokenInfo error：', error);
  } finally {
  //  transData.showErc20 = true;
  }
}

function parseErc20Data() {
  try {
    const base64Data = fromBase64(props.tx.tx.body.messages[0].data.data);
    var hexData = toHex(base64Data);
    console.log(hexData, 'hexData')
    let bus: any = props.tx.tx.body.messages[0]?.data.to;
    let transactionData: any = ''
    if(bus === addresses.NovaiFaucet){
      transactionData = getNovaiFaucetAbi.parseTransaction({
        data: `0x${hexData}`,
      })
      NovaiFaucetData.type = true
      console.log(transactionData,'transactionData')
      getNovaiFaucet(transactionData.args)
     // const faucet = await GetContract()
      return;
    } else if (props.tx.tx.body.messages[0].data.to === addresses.novaichain) {
      transactionData = ifaceNusdt.parseTransaction({
        data: `0x${hexData}`,
      });
      console.log(transactionData,'transactionData')
      // console.log(transactionData.name,'transactionData')
      // GetContract(bus,nusdtAbi)[transactionData.name]().then(res =>{
      // console.log(res,'res')
    // })
    } else if (props.tx.tx.body.messages[0].data.to === addresses.UniswapV2Router01) {
      transactionData = ifaceUniswap.parseTransaction({
        data: `0x${hexData}`,
      });
      console.log(transactionData,'transactionData')
      getSwapInfo(transactionData.args)
      return;
    } else {
      GetEventsByTxHash()
      transactionData = iface.parseTransaction({
        data: `0x${hexData}`,
      });
     // transData.name = transactionData.name
    }

    if (!transactionData) {
      return;
    }
    
    transData.name = transactionData.name
    //GetContract(transactionData,transactionData.fragment)
    transData.to = transactionData.args[0];
    getTokenInfo(transactionData.args[1]);
  } catch (error) {
    console.log('error：', error);
  }
}

//取水龙头已
async function getNovaiFaucet(args: any) {
 // debugger
  //console.log(args,'args')
  let bus: any = props.tx.tx.body.messages[0]?.data.to;
 //let decimalsTo = await GetContract(bus,NovaiFaucetAbi).decimals()
 //let nameTo = await GetContract(bus,NovaiFaucetAbi).Transfer()
 //console.log(nameTo,'decimalsTo')
 NovaiFaucetData.value = args[1]
}
//swap
async function getSwapInfo(args: any) {

  try {
    console.log(args,'args')
    let decimalsTo = 'nameTo', nameTo = '',numTo:any = 0
    if(args.length == 5){
      decimalsTo = await GetContract(args[2][0]).decimals()
     nameTo = await GetContract(args[2][0]).name()
     numTo = getFormatUnits(args[0], decimalsTo).toFixed(6)
    }
    let decimalsForm = await GetContract(args[args.length == 5?2:1][1]).decimals()
    let nameForm = await GetContract(args[args.length == 5?2:1][1]).name()

     
    let numform = getFormatUnits(args[args.length == 5?1:0], decimalsForm).toFixed(6)

    swapData.address = args[ args.length == 5?3:2];
    swapData.time = format.toDay(Number(args[args.length == 5?4:3]) * 1000)

    swapData.to = `${numTo} ${nameTo}`
    swapData.form = `${numform} ${nameForm}`
    swapData.toAddress = args[2][0]
    swapData.formAddress = args[2][1]
    swapData.automation = args.length == 5
    swapData.showSwap = true;
  } finally {
   
  }
}
parseErc20Data();
</script>
<template>
  <div class="">
    <div v-if="tx.tx_response">
      <div class="text-[#ffffff] bg-[#131315]/[.8] rounded-[16px] px-4 pt-3 pb-4   mb-4">
        <h2 class="card-title truncate mb-2  text-[14px] font-[400] font-[OrbitronMedium] tracking-[.5px]">{{ $t('tx.title') }}</h2>
        <div>
          <table class="table text-sm">
            <tbody>
              <tr>
                <td class="w-[80px] lg:w-[240px]">
                  {{ $t('tx.TransactionHash') }}
                </td>
                <td>{{ hash }}</td>
              </tr>
              <tr>
                <td>{{ $t('tx.Status') }}</td>
                <td>
                  <span class="text-xs truncate relative py-1 px-4 w-fit mr-2 " 
                  :class="`${tx.tx_response.code === 0 ? ' text-[#B2E235]' : 'text-error'
                    }`">
                    <span class="inset-x-0 inset-y-0  absolute rounded-full"
                     :class="`${tx.tx_response.code === 0 ? ' bg-[#5AC27C]/[.3]' : 'bg-error/[.3]'
                      }`"></span>
                    {{ tx.tx_response.code === 0 ? 'Success' : 'Failed' }}
                  </span>
                  <!-- <span>
                {{ tx.tx_response.code === 0 ? '' : tx?.tx_response?.raw_log }}
              </span> -->
                </td>
              </tr>
              <tr>
                <td>{{ $t('tx.Block') }}</td>
                <td>{{ tx.tx_response.height }}</td>
              </tr>
              <tr>
                <td>{{ $t('tx.Timestamp') }}</td>
                <td>
                  {{ format.toLocaleDate(tx.tx_response.timestamp) }} ({{
                    format.toDay(tx.tx_response.timestamp, 'from')
                  }})
                </td>
              </tr>
              <tr>
                <td>{{ $t('tx.From') }}</td>
                <td>{{ form }}</td>
              </tr>
              <tr>
                <td>{{ $t('tx.InteractedWith', [$t('tx.To')]) }}</td>
                <td>{{ objValue.to }}</td>
              </tr>
              <tr v-if="transData.showErc20">
                <td>{{ $t('tx.Transferred') }}</td>
                <td>
                  <div v-if="transData.name == 'transferFrom' || transData.name == 'transfer'">
                    <div class="bg-transparent tabs-boxed ">
                    {{ $t('tx.From') }}：
                    <span class="textjb-lv">
                      <RouterLink :to="`/${chain}/account/${form}`">{{
                        form
                      }}</RouterLink>
                    </span><br />
                    {{ $t('tx.To') }}：
                    <span class="textjb-lv">
                      <RouterLink :to="`/${chain}/account/${transData.to}`">{{
                        transData.to
                      }}</RouterLink>
                    </span><br />
                    <span class="">For</span> {{ transData.value }}
                    {{ transData.tokenName }}
                  </div>
                  </div>
                  
                  <div v-else>
                    {{ $t('tx.method') }}： {{ transData.name }}
                    <br/>
                    <span class="">For</span> {{ transData.value }}
                    {{ transData.tokenName }}
                  </div>
                  
                  {{ format.toLocaleDate(tx.tx_response.timestamp) }} ({{
                    format.toDay(tx.tx_response.timestamp, 'from')
                  }})
                </td>
              </tr>
              <tr v-if="swapData.showSwap">
                <td>{{ $t('tx.swap') }}</td>
                <td>
                  <div class="bg-transparent tabs-boxed ">
                    <!-- {{ $t('tx.From') }}：
                    <span class="text-primary">
                      <RouterLink :to="`/${chain}/account/${form}`">{{
                        form
                        }}</RouterLink>
                    </span><br /> -->

                    <span>{{ $t('tx.issue') }}：</span>
                    <span class="textjb-lv" v-if="swapData.automation">
                      <RouterLink :to="`/${chain}/token/${swapData.toAddress}`">{{
                        swapData.to
                      }}</RouterLink>
                    </span>
                    <span v-else>{{ objValue.value ? getAmount(objValue.value) : objValue.value }}NOVAI</span>
                    <br />
                    <span>{{ $t('tx.receive') }}：</span>
                    <span class="textjb-lv">
                      <RouterLink :to="`/${chain}/token/${swapData.formAddress}`">{{
                        swapData.form
                      }}</RouterLink>
                    </span>
                    <br />
                    {{ $t('tx.To') }}：
                    <span class="textjb-lv">
                      <RouterLink :to="`/${chain}/account/${swapData.address}`">{{
                        swapData.address
                      }}</RouterLink>
                    </span><br />
                    <span>{{ $t('tx.deadline') }}:</span> {{ swapData.time }}


                  </div>
                  {{ format.toLocaleDate(tx.tx_response.timestamp) }} ({{
                    format.toDay(tx.tx_response.timestamp, 'from')
                  }})
                </td>
              </tr>
              <tr v-if="get1155.show1155">
                <td>{{getEventsByInfo.contractData[0]?.eventName}}</td>
                <td>
                  {{ getEventsByInfo.contractData[0]?.data.to == '0x0000000000000000000000000000000000000000'?$t('account.Burn'):$t('account.Transfer')}}
                  <br />
                  <span>ID:{{ getEventsByInfo.contractData[0]?.data.id }}</span><br />
          
                  <span>value:{{ getEventsByInfo.contractData[0]?.data.value }}</span> <br />
                  <span v-show="getEventsByInfo.contractData[0]?.data.to != '0x0000000000000000000000000000000000000000'">to:{{ getEventsByInfo.contractData[0]?.data.to}}</span>
                </td>  
              </tr>
              <tr>
                <td>{{ $t('tx.Value') }}</td>
                <td>
                  <span v-if="transData.showErc20 && (transData.name == 'transferFrom' || transData.name == 'transfer')">
                    {{ transData.value }}
                  </span>
                  <span v-else-if="NovaiFaucetData.type ">
                    {{ getAmount(NovaiFaucetData.value) }}
                  </span>
                  <span v-else>
                    {{ objValue.value ? getAmount(objValue.value) : objValue.value }}
                  </span>
                </td>
              </tr>
              <tr>
                <td>{{ $t('tx.TransactionFee') }}</td>
                <td>0</td>
              </tr>
              <tr>
                <td>{{ $t('tx.GasPrice') }}</td>
                <td>{{ getAmount(gasLimit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="text-[#ffffff] bg-[#131315]/[.8] rounded-[16px] px-4 pt-3 pb-4 shadow mb-4">
        <div v-if="tx.tx_response">
          <div class="max-h-[0px] overflow-hidden" style="transition: all 0.3s" :class="{ '  !max-h-dvh': launch }">
            <table class="table text-sm">
              <tbody>
                <tr class="w-[80px] lg:w-[240px]">
                  <td class="w-[240px]">{{ $t('tx.Gas') }}</td>
                  <td> {{ gas }}&nbsp;|&nbsp;{{ gas }} (100%)</td>
                </tr>
                <tr class="!border-none">
                  <td class="w-[240px]">{{ $t('tx.OtherAttributes') }}</td>
                  <td>
                    <div class="tabs ">
                      <div class="h-6 px-5  rounded-full">
                        {{ $t('tx.Nonce') }}:{{ objValue.nonce }}
                      </div>
                      <div class="h-6 ml-2 px-5  rounded-full">
                        {{ $t('tx.PositionInBlock') }}:{{ msgIndex }}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr class="!border-b border-[#ffffff]/[0.16]">
                  <td class="w-[240px]">{{ $t('tx.InputData') }}</td>
                  <td>
                    <div class="tabs ">
                      <!--                    <div class="h-6 px-5 bg-[#f7f7f7] rounded-full">{{ format.toLocaleDate(tx.tx_response.timestamp) }} </div>-->
                      <!--                    <div class="h-6 px-5 ml-2 bg-[#f7f7f7] rounded-full">({{-->
                      <!--                        format.toDay(tx.tx_response.timestamp, 'from')-->
                      <!--                      }})</div>-->
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <table class="table text-sm">
            <tbody>
              <tr @click="launch = !launch" class="!border-none w-[80px] lg:w-[240px]">
                <td class="w-[240px]">{{ $t('tx.MoreDetails') }}</td>
                <td class="textjb-lv" style="cursor: pointer">
                  <span :class="{ hidden: !launch }">
                    {{ $t('tx.ClickToShowLess') }}
                  </span>
                  <span :class="{ hidden: launch }">
                    {{ $t('tx.ClickToShowMore') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
td {
  word-wrap: break-word;
  word-break: break-all;
}
</style>
