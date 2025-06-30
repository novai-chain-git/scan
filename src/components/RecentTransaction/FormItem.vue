<script lang="ts" setup>
import { onMounted, ref, watch, watchEffect, computed, toRefs } from 'vue';
import { useBaseStore, useFormatter } from '@/stores';
import { formatUnits } from 'ethers';
import { provider } from '@/libs/web3/index';
import { useRouter } from 'vue-router';

interface Props {
  tx: any;
  chain: string;
}
const props = defineProps<Props>();
// const props = defineProps({
//   tx: {
//     type: Object as () => any,
//     required: true
//   },
//   chain: {
//     type: String,
//     required: true
//   }
// });
const { tx, chain } = toRefs(props);
const format = useFormatter();
const vueRouters = useRouter();

const form = computed(() => {
  if (props.tx.tx_response && props.tx.tx_response.raw_log) {
    let attributes: { attributes: any[] } = { attributes: [] };
    try {
      let raw_log: [any] = JSON.parse(props.tx.tx_response.raw_log)[0].events;
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
});
const toAddress = computed(() => {
  if (props.tx.showSwap) return props.tx.toAddress;
  if (
    props.tx.showErc20 &&
    (props.tx.showErc20Name == 'transferFrom' ||
      props.tx.showErc20Name == 'transfer')
  )
    return props.tx.toAddress;
  if (props.tx.show1155) return props.tx.toAddress;
  let messages: any = props.tx.tx.body.messages;
  let bus: any = messages[0]?.data.to;
  return bus;
});
const getAmount = computed(() => {
  if (props.tx.showSwap)
    return `${props.tx.numTo} ${props.tx.nameTo}/${props.tx.numForm} ${props.tx.nameForm}`;
  if (props.tx.showErc20) return `${props.tx.value} ${props.tx.tokenName}`;
  if (props.tx.show1155) return props.tx.value;
  if (props.tx.BonstakeData || props.tx.NovaiFaucet) return props.tx.value;
  let messages: any = props.tx.tx.body.messages;
  if (messages[0]?.data.value)
    return Number(formatUnits(messages[0]?.data.value, 18)).toFixed(6);
  return messages[0]?.data.value;
});

const getTransfer = computed(() => {
  if (props.tx.showSwap) return `swap`;
  if (props.tx.showErc20) return `${props.tx.tokenName}`;

  return '';
});
const jump = (address: any) => {
  provider()
    .getCode(address)
    .then((code: any) => {
      if (code.length > 2) {
        vueRouters.push({ path: `/${props.chain}/token/${address}` });
      } else {
        vueRouters.push({ path: `/${props.chain}/account/${address}` });
      }
    });
};
</script>
<template>
  <div
    class="flex items-center justify-between p-[5px] md:p-[10px] border-b-[1px] border-[#FFFFFF]/[.16]"
  >
    <div>
      <div class="truncate font-[OrbitronMedium] textjb-lv max-w-[125px] pr-10">
        <RouterLink :to="`/${chain}/tx/${props.tx.hash}`">{{
          props.tx.hash
        }}</RouterLink>
      </div>
      <div>{{ format.toDay(props.tx.block?.header?.time, 'from') }}</div>
    </div>
    <div class="flex-1 text-left">
      <div>
        Form
        <RouterLink
          class="textjb-lv"
          v-if="form"
          :to="`/${chain}/account/${form}`"
          >{{ form }}</RouterLink
        >
      </div>
      <div>
        to
        <span class="textjb-lv cursor-pointer" v-if="toAddress" @click="jump(toAddress)">
          {{ toAddress }}
        </span>
      </div>
    </div>
    <div class="text-right">
      <div>
        <template
          v-if="
            !props.tx?.methodName ||
            props.tx.methodName == 'transferFrom' ||
            props.tx.methodName == 'transfer'
          "
        >
          {{ getAmount }}
        </template>
        <template v-else>
          {{ props.tx.methodName }}
        </template>
      </div>
      <div>Transfer {{ getTransfer }}</div>
    </div>
  </div>
</template>
