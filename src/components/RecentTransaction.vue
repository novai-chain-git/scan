<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { useBaseStore, useFormatter } from '@/stores';
import { onMounted, ref, watch, watchEffect } from 'vue';
import { Icon } from '@iconify/vue';
import TxsElement from '@/components/dynamic/TxsElement.vue';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import { onBeforeRouteUpdate } from 'vue-router';
import type { Block } from '@/types';
import Countdown from '@/components/Countdown.vue';
import {  formatUnits } from 'ethers';

const props = defineProps(['chain']);
const base = useBaseStore();

const current = ref({} as Block);

const target = ref(Number(base.latest?.block?.header.height || 0) + 10000 || 0);

const tab = ref('transactions');

const format = useFormatter();

const list = computed(() => {
  // const recents = base.recents
  // return recents.sort((a, b) => (Number(b.block.header.height) - Number(a.block.header.height)))
  return base.recents;
});

const height = computed(() => {
  return Number(
    current.value.block?.header?.height ||
      Number(base.latest?.block?.header.height || 0) + 10000 ||
      0
  );
});

const isFutureBlock = computed({
  get: () => {
    const latest = base.latest?.block?.header.height;
    const isFuture = latest ? target.value > Number(latest) : true;
    if (!isFuture && !current.value.block_id)
      base.fetchBlock(target.value).then((x) => (current.value = x));
    return isFuture;
  },
  set: (val) => {
    console.log(val);
  },
});

const remainingBlocks = computed(() => {
  const latest = base.latest?.block?.header.height;
  return latest ? Number(target.value) - Number(latest) : 0;
});

const estimateTime = computed(() => {
  const seconds =
    remainingBlocks.value * Number((base.blocktime / 1000).toFixed()) * 1000;
  return seconds;
});

const estimateDate = computed(() => {
  return new Date(new Date().getTime() + estimateTime.value);
});

const edit = ref(false);
const newHeight = ref(Number(base.latest?.block?.header.height || 0) + 10000);
console.log(
  'newHeight',
  base.latest?.block?.header.height,
  newHeight.value,
  target.value
);

function updateTarget() {
  target.value = Number(newHeight.value);
  console.log(target.value);
}

onBeforeRouteUpdate(async (to, from, next) => {
  if (from.path !== to.path) {
    base.fetchBlock(String(to.params.height)).then((x) => (current.value = x));
    next();
  }
});

function getAmount(value: any) {
  if (value) return Number(formatUnits(value, 18)).toFixed(6);
  return ``;
}
const switchTimes = () => {
  tab.value = 'times';
  target.value = Number(base.latest?.block?.header.height || 0) + 10000;
};

const getTxsInRecents = computed(() => {
  if(base.getLoging) return [];
  return base.getTransaction.slice(-20);
})
</script>
<template>
  <div class="border border-[#FFFFFF]/[.16] text-[#ffffff]
      bg-[#131315] rounded-[16px]">
    <div
      class=" border-b border-[#FFFFFF]/[.16]
           md:pl-[24px] md:pt-[16px] md:pb-[13px] 
           pl-[12px] pt-[8px] pb-[8px]
          text-[14px] 
          font-[OrbitronMedium] tracking-[.5px]"
    >
    {{ $t('account.recent_transaction') }}
    </div>
    <div class="   ">
      <div class="overflow-auto h-full">
        <table class="table w-full table-compact">
          <thead>
            <tr class=" border-[#FFFFFF]/[.16] text-[12px] text-[#ffffff]/[.54]">
              <th style="position: relative; z-index: 2" class="font-[400]">
                {{ $t('account.height') }}
              </th>
              <th style="position: relative; z-index: 2" class="font-[400]">
                {{ $t('account.hash') }}
              </th>
              <th class="font-[400]">{{ $t('account.messages') }}</th>
              <th class="font-[400]">{{ $t('tx.Value') }}</th>
              <th class="font-[400]">{{ $t('tx.Token') }}</th>
              <th class="font-[400]">{{ $t('block.fees') }}</th>
            </tr>
          </thead>
          <tbody >
            <tr class="border-b-[1px] border-[#FFFFFF]/[.16] border-dashed" v-if="getTxsInRecents.length === 0">
              <td colspan="10">
                <div class="text-center">
                  {{ $t('account.loading') }}
                </div>
              </td>
            </tr>
            <tr
              v-for="(item, index) in getTxsInRecents"
              :index="index"
              class="border-b-[1px]  border-[#FFFFFF]/[.16] border-dashed hover:bg-[transparent] dark:hover:bg-[#384059]
               text-[#ffffff]/[.87]  h-[64px]"
            >
              <td class="text-sm textjb-lv">
                <RouterLink :to="`/${props.chain}/block/${item.height}`">{{
                  item.height
                }}</RouterLink>
              </td>
              <td class="truncate font-[OrbitronMedium] textjb-lv max-w-[125px]">
                <RouterLink :to="`/${props.chain}/tx/${item.hash}`">{{
                  item.hash
                }}</RouterLink>
              </td>
              <td>
                {{ format.messages(item.tx.body.messages) }}</td>
              <td  >
                
                
                <template v-if="!item?.methodName || item.methodName  == 'transferFrom' || item.methodName == 'transfer'">
                  <template v-if="item.to || item.form ">
                    {{item.automation?item.to:item.value?item.value:getAmount(item.objValue.value)}}<br/>
                    <span>
                      {{item.form}}
                    </span>
                  </template>
                  <span v-else>
                  <!-- {{ item.value?item.value:getAmount(item.objValue.value) }} -->
                  <template v-if="Number(item.value) || item.transactionType">{{ item.value }}</template>

                    <template v-else>
                      {{ item.objValue.value == 0 && Number(item.tx_response.gas_used) > 40000 ?  $t("account.ContractCall") : getAmount(item.objValue.value) }}
                    </template>
                  </span>
                </template>
                <template v-else>
                  {{item.methodName}}
                 </template>
              </td>

              <td :class="[item.name || item.to?'truncate ':''] " >
                <template v-if="item.to || item.form">
                  <RouterLink class="textjb-lv" v-if="item.automation" :to="`/${props.chain}/token/${item.toAddress}`">
                    {{item.nameTo}}
                  </RouterLink>
                  <span v-else>NOVAI</span>
                  <br/>
                  <RouterLink v-if="item.nameForm != 'NOVAI'" class="textjb-lv" :to="`/${props.chain}/token/${item.formAddress}`">
                    {{item.nameForm}}
                  </RouterLink>
                  <span v-else>{{ item.nameForm }}</span>
               </template>
                <RouterLink class="textjb-lv" v-else-if="item.name " :to="`/${props.chain}/token/${item.objValue.to}`">{{
                                item.name
                                }}</RouterLink>
                <span v-else-if="!item.name && !item.to">
                  {{!item.name && !item.to? "NOVAI":""}}
                </span>
                    
              </td>

              <td>{{ format.formatTokens(item.tx.authInfo.fee?.amount,true,) }}</td>
            </tr>
          </tbody>
        </table>

      </div>
      <div v-if="!base.getLoging">

      </div>
    </div>
    <div class="text-center text-[#ffffff] py-4">
      <router-link to="/novaichain/block" class="underline">
        {{ $t('MORE') }}
      </router-link>
    </div>
  </div>
</template>

