<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';

import { Interface, JsonRpcProvider, Contract, hexlify } from 'ethers';
import { getFormatUnits } from '@/libs/web3/index';
import { pairAbi, factoryAbi } from '@/libs/web3/abi/index';
import {
  fromBase64,
  fromBech32,
  toBech32,
  toHex,
  fromHex,
} from '@cosmjs/encoding';
const props = defineProps(['tx', 'hash', 'chain']);
// const attributes = reactive({
//   address: '',
//   topics: '',
//   inNum: '',
//   inputSymbol: '',
//   outNum: '',
//   outputSymbol: '',
// });
// });
const swap = ref<any[]>([]);
const transferList = ref<any[]>([]);
const approvalList = ref<any[]>([]);
watch(
  () => props.tx.tx_response,
  () => {
    let arr: any[] = [];

    const provider = new JsonRpcProvider('https://rpc.novaichain.com');
    if (
      props.tx.tx_response &&
      props.tx.tx_response.logs &&
      props.tx.tx_response.logs
    ) {
      arr =
        props.tx.tx_response.logs && props.tx.tx_response.logs.length
          ? props.tx.tx_response.logs[0].events
          : [];
    }
    if (arr.length) {
      arr = arr.filter((item) => item.type == 'tx_log').length
        ? arr
            .filter((item) => item.type == 'tx_log')[0]
            .attributes.forEach(async (item: { value: string }) => {
              let value = JSON.parse(item.value);
              let swapTopics =
                '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';
              let Approval =
                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';
              let Transfer =
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

              // const parsed = getInterface.parseLog(value)
              // console.log(parsed,'parsed')
              if (
                value.topics &&
                value.topics.find((item: string) => item === swapTopics)
              ) {
                let getInterface = new Interface(pairAbi);
                const base64Data = value.data;
                // const hexData =
                //   '0x' + Buffer.from(base64Data, 'base64').toString('hex');
                const byteArray = fromBase64(base64Data);
                const hexData = '0x' + toHex(byteArray);
                const log = {
                  ...value,
                  data: hexData,
                };
                const parsed = getInterface.parseLog(log);
                const args = parsed?.args;
                console.log(parsed, 'parsed');

                // 创建 Pair 合约实例
                const pairContract = new Contract(
                  value.address,
                  pairAbi,
                  provider
                );
                const [token0Address, token1Address] = await Promise.all([
                  pairContract.token0(),
                  pairContract.token1(),
                ]);
                console.log(token0Address, 'token0Address', token1Address);
                let inputTokenAddress,
                  inputAmount,
                  outputTokenAddress,
                  outputAmount;
                if (args?.amount0In > 0n) {
                  inputTokenAddress = token0Address;
                  inputAmount = args?.amount0In;
                  outputTokenAddress = token1Address;
                  outputAmount = args?.amount1Out;
                } else {
                  inputTokenAddress = token1Address;
                  inputAmount = args?.amount1In;
                  outputTokenAddress = token0Address;
                  outputAmount = args?.amount0Out;
                }
                const token0Contract = new Contract(
                  inputTokenAddress,
                  pairAbi,
                  provider
                );
                const token1Contract = new Contract(
                  outputTokenAddress,
                  pairAbi,
                  provider
                );
                const [
                  inputSymbol,
                  inputDecimals,
                  outputSymbol,
                  outputDecimals,
                ] = await Promise.all([
                  token0Contract.symbol(),
                  token0Contract.decimals(),
                  token1Contract.symbol(),
                  token1Contract.decimals(),
                ]);
                swap.value.push({
                  name: 'swap',
                  inNum: Number(
                    getFormatUnits(inputAmount, inputDecimals).toFixed(6)
                  ),
                  inputTokenAddress,
                  outputTokenAddress,
                  inputSymbol: inputSymbol,
                  outNum: Number(
                    getFormatUnits(outputAmount, outputDecimals).toFixed(6)
                  ),
                  outputSymbol: outputSymbol,
                  topics: swapTopics,
                });
              } else if (
                value.topics &&
                value.topics.find((item: string) => item === Approval)
              ) {
                const owner = '0x' + value.topics[1].slice(26);
                const spender = '0x' + value.topics[2].slice(26);
                // 提取授权金额
                const amountBytes = fromBase64(value.data); // Uint8Array
                const hex = hexlify(amountBytes);
                const amount = BigInt(hex); // 授权金额

                const tokenAddress = value.address;

                const tokenContract = new Contract(
                  tokenAddress,
                  pairAbi,
                  provider
                );
                const symbol = await tokenContract.symbol();
                const decimals = await tokenContract.decimals();
                // 输出结果
                console.log('代币地址:', value.address);
                console.log('Owner (批准人):', owner);
                console.log('Spender (被批准人):', spender);
                console.log('授权金额 (raw):', amount.toString());
                approvalList.value.push({
                  symbol,
                  decimals,
                  address: value.address,
                  owner,
                  spender,
                  amount: Number(getFormatUnits(amount, decimals).toFixed(6)),
                });
              } else if (
                value.topics &&
                value.topics.find((item: string) => item === Transfer)
              ) {
                let getInterface = new Interface(pairAbi);
                const base64Data = value.data;
                const bytes = fromBase64(value.data);
                const hexValue = hexlify(bytes);
                const amount = BigInt(hexValue);

                const hex = toHex(bytes);
                console.log(hex); // 输出十六进制表示的数值

                const from = '0x' + value.topics[1].slice(26); // 去掉前缀 0x 和 12 个字节填充
                const to = '0x' + value.topics[2].slice(26);
                const tokenAddress = value.address;

                const tokenContract = new Contract(
                  tokenAddress,
                  pairAbi,
                  provider
                );
                const symbol = await tokenContract.symbol();
                const decimals = await tokenContract.decimals();
                // console.log(symbol,'symbolsymbolsymbol')

                transferList.value.push({
                  amount: Number(getFormatUnits(amount, decimals).toFixed(6)),
                  symbol,
                  decimals,
                  to,
                  from,
                  hex,
                });
                console.log(to, from,value.topics[2]);
              }

              // return {
              //   ...item,
              //   value,
              // };
            })
        : [];
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
const logs = computed(() => {
  let arr: any[] = [];
  let attributes: any = {
    address: '',
    topics: '',
    inNum: '',
    inputSymbol: '',
    outNum: '',
    outputSymbol: '',
  };
  // if(props.tx.tx_response && props.tx.tx_response.logs && props.tx.tx_response.logs){
  //   arr = props.tx.tx_response.logs && props.tx.tx_response.logs.length? props.tx.tx_response.logs[0].events : []
  // }
  // return arr.filter(item => item)

  // if(arr.length){
  //   arr = arr.map(item => {})
  // }
  console.log(attributes, 'attributes');
  return attributes;
});
</script>
<template>
  <div class="text-[#ffffff]">
    <div v-if="tx.tx_response">
      <div class="border-b border-[#FFFFFF]/[.16] pb-4">
        <div>{{ $t('tx.swap') }}</div>
        <div v-for="(item, index) in swap" :key="`swap${index}`"
        :class="`${ index != 0 ? 'pt-4':''}`">
          <div>
            {{ $t('tx.From') }}：{{ item.inNum }}
            {{ item.inputSymbol }} {{ item.inputTokenAddress }}
          </div>
          <div>
            {{ $t('tx.To') }}：{{ item.outNum }}
            {{ item.outputSymbol }} {{ item.outputTokenAddress }}
          </div>
        </div>
      </div>

      <div class="border-b border-[#FFFFFF]/[.16] py-4">
        <div>{{ $t('tx.transfer') }}</div>
        <div
         v-for="(item, index) in transferList" :key="`transfer${index}`"
         :class="`${ index != 0 ? 'pt-4':''}`">
          <div>
            {{ $t('tx.From') }}：
            {{ item.from }}
          </div>
          <div>
            {{ $t('tx.To') }}：

            {{ item.to }}
          </div>
          <div>
            {{ $t('tx.Amount') }}：{{ item.amount }}
            {{ item.symbol }}
          </div>
        </div>
      </div>
      <div class="pt-4">
        <div>{{ $t('tx.approva') }}</div>
        <div v-for="(item, index) in approvalList" :key="`approva${index}`"
        :class="`${ index != 0 ? 'pt-4':''}`">
          <div>{{ $t('tx.Owner') }}：{{ item.owner }}</div>
          <div>{{ $t('tx.Spender') }}：{{ item.spender }}</div>
          <div>{{ $t('tx.Amount') }}：{{ item.amount }} {{ item.symbol }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
