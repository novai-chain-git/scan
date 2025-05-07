<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { Interface, JsonRpcProvider, Contract } from 'ethers';
import { getFormatUnits } from '@/libs/web3/index';
import { pairAbi, factoryAbi } from '@/libs/web3/abi/index';
import {
  fromBase64,
  fromBech32,
  toBech32,
  toHex,
  fromHex,
} from '@cosmjs/encoding';
const props = defineProps(['tx', 'hash']);
const attributes = computed()
const logs = computed(() => {
  let arr: any[] = [];
  let attributes: any = {
    address: '',
    topics: '',
    inNum: '',
    inputSymbol: '',
    outNum:"",
    outputSymbol: ''
  };
  // if(props.tx.tx_response && props.tx.tx_response.logs && props.tx.tx_response.logs){
  //   arr = props.tx.tx_response.logs && props.tx.tx_response.logs.length? props.tx.tx_response.logs[0].events : []
  // }
  // return arr.filter(item => item)

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
            let topics =
              '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';

            // const parsed = getInterface.parseLog(value)
            // console.log(parsed,'parsed')
            if (
              value.topics &&
              value.topics.find((item: string) => item === topics)
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

              const provider = new JsonRpcProvider(
                'https://rpc.novaichain.com'
              );
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
              const [inputSymbol, inputDecimals, outputSymbol, outputDecimals] =
                await Promise.all([
                  token0Contract.symbol(),
                  token0Contract.decimals(),
                  token1Contract.symbol(),
                  token1Contract.decimals(),
                ]);
                console.log("输入代币:", inputSymbol, "数量:", inputAmount,inputDecimals,getFormatUnits(inputAmount,inputDecimals).toFixed(6));
console.log("输出代币:", outputSymbol, "数量:", outputAmount,outputDecimals,getFormatUnits(outputAmount,outputDecimals).toFixed(6));

              attributes = {
                address: value.address,
                topics: topics,
                inNum: getFormatUnits(inputAmount,inputDecimals).toFixed(6),
                inputSymbol: inputSymbol,
                outNum: getFormatUnits(outputAmount,outputDecimals).toFixed(6),
                outputSymbol: outputSymbol
              };
            }
            // return {
            //   ...item,
            //   value,
            // };
          })
      : [];
  }
  // if(arr.length){
  //   arr = arr.map(item => {})
  // }
  console.log(attributes, 'attributes');
  return attributes;
});
</script>
<template>
  <div
    class="text-[#ffffff] bg-[#131315]/[.8] rounded-[16px] px-4 pt-3 pb-4 shadow mb-4"
  >
    <div v-if="tx.tx_response">
      <div>
        <div>
          {{ $t('tx.From') }}：{{ logs.inNum }}
        </div>
        <div>
          {{ $t('tx.To') }}：{{ logs.outputSymbol }}
        </div>
        <!-- <div>
          <div>
            <div>Address</div>
            <div>{{ logs.address }}</div>
          </div>
          <div>
            <div>Name</div>
            <div></div>
          </div>
          <div>
            <div>Topics</div>
            <div>{{ logs.topics }}</div>
          </div>
          <div>
            <div>Data</div>
            <div></div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
