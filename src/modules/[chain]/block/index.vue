<script lang="ts" setup>
import { useBaseStore, useFormatter } from '@/stores';
import { onMounted, ref, watch, watchEffect,computed } from 'vue';
import { Icon } from '@iconify/vue';
import TxsElement from '@/components/dynamic/TxsElement.vue';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import { onBeforeRouteUpdate } from 'vue-router';
import type { Block } from '@/types';
import Countdown from '@/components/Countdown.vue';
import tabModule from '@/components/tabModule/index.vue';
import { formatUnits } from 'ethers';
import { useI18n } from 'vue-i18n';

const props = defineProps(['chain']);
const base = useBaseStore();
const { t } = useI18n();
const current = ref({} as Block)

const target = ref((Number(base.latest?.block?.header.height || 0) + 10000) || 0)

const tab = ref('blocks');



const format = useFormatter();

const list = computed(() => {
  // const recents = base.recents
  // return recents.sort((a, b) => (Number(b.block.header.height) - Number(a.block.header.height)))
  return base.recents;
});

const tabList = computed(() => {
  return [
    {
      label: t('block.recent'),
      value: 'blocks',
    },
    {
      label: t('block.future'),
      value: 'times',
    },
    {
      label: t('account.transactions'),
      value: 'transactions',
    }
  ]
});

const height = computed(() => {
  return Number(current.value.block?.header?.height || (Number(base.latest?.block?.header.height || 0) + 10000) || 0);
});

const isFutureBlock = computed({
  get: () => {
    const latest = base.latest?.block?.header.height
    const isFuture = latest ? target.value > Number(latest) : true
    if (!isFuture && !current.value.block_id) base.fetchBlock(target.value).then(x => current.value = x)
    return isFuture
  },
  set: val => {
    console.log(val)
  }
})

const remainingBlocks = computed(() => {
  const latest = base.latest?.block?.header.height
  return latest ? Number(target.value) - Number(latest) : 0
})

const estimateTime = computed(() => {
  const seconds = remainingBlocks.value * Number((base.blocktime / 1000).toFixed()) * 1000
  return seconds
})

const estimateDate = computed(() => {
  return new Date(new Date().getTime() + estimateTime.value)
})

const edit = ref(false)
const newHeight = ref(Number(base.latest?.block?.header.height || 0) + 10000)
console.log('newHeight', base.latest?.block?.header.height, newHeight.value, target.value);

function updateTarget() {
  target.value = Number(newHeight.value)
  console.log(target.value)
}

onBeforeRouteUpdate(async (to, from, next) => {
  if (from.path !== to.path) {
    base.fetchBlock(String(to.params.height)).then(x => current.value = x);
    next();
  }
});

const switchTimes = () => {
  tab.value = 'times'
  target.value = Number(base.latest?.block?.header.height || 0) + 10000
}
function getAmount(value: any) {
  if (value) return Number(formatUnits(value, 18)).toFixed(6);
  return ``;
}

const getTxsInRecents = computed(() => {
  if(base.getLoging) return [];
  return base.getTransaction.slice(-20);
})
</script>
<template>
  <div class="bg_jb  rounded-[16px]">
    <div class="  md:pl-7 pl-7 md:text-[14px]  py-[8px] border-b 
    border-[#FFFFFF]/[.16]  tracking-[.5px] ">
    <tabModule :list="tabList" v-model:tab="tab"></tabModule>
    </div>


    <div v-show="tab === 'blocks'" class="grid xl:!grid-cols-4 md:!grid-cols-2 grid-cols-1 gap-3 p-8">
      <RouterLink v-for="item in list" class="flex flex-col justify-between bg-[#ffffff]/[.1] rounded-[16px]"
        :to="`/${chain}/block/${item.block.header.height}`">
        <div class="flex items-center justify-between  text-[#ffffff] px-5 py-[10px] border-b-[1px] border-[#ffffff]/[.16]">
          <h3 class="text-[14px]  ]">
            {{ item.block.header.height }}
          </h3>
          <span class="text-[14px] font-medium  text-[#ffffff] rounded whitespace-nowrap">
            {{ format.toDay(item.block?.header?.time, 'from') }}
          </span>
        </div>
        <div class="flex justify-between px-5 py-[10px] tooltip text-[#ffffff] text-[14px]"
          data-tip="Block Proposor">
          <div class=" hidden sm:!block truncate">
            <span>{{
              format.validator(item.block?.header?.proposer_address)
            }}</span>
          </div>
          <span class=" text-right whitespace-nowrap">
            {{ item.block?.data?.txs.length }} txs
          </span>
        </div>
      </RouterLink>
    </div>
    <div v-show="tab === 'times'" class="p-6">
      <div>
        <div v-if="isFutureBlock" class="text-center text-[#ffffff]">
          <div v-if="remainingBlocks > 0">
            <div class="my-10 text-lg  text-[#ffffff] font-[OrbitronMedium] tracking-[.5px]">#{{ target }}</div>
            <Countdown :time="estimateTime" css="md:!text-5xl font-sans md:mx-5" />
            <div class="my-5">{{ $t('block.estimated_time') }}: <span class="text-xl font-bold">{{
              format.toLocaleDate(estimateDate) }}</span>
            </div>
            <div class="flex justify-center pt-10">
              <table class="table rounded-lg w-max">
                <tbody>
                  <tr class="cursor-pointer new_border " @click="edit = !edit">
                    <td>{{ $t('block.countdown_for_block') }}:</td>
                    <td class="text-right"><span class="md:!ml-40">{{ target }}</span></td>
                  </tr>
                  <tr v-if="edit" class="new_border">
                    <td colspan="2" class="text-center">
                      <h3 class="text-lg font-bold">{{ $t('block.countdown_for_block_input') }}
                      </h3>
                      <p class="py-4">
                      <div class="join">
                        <input class="input input-bordered join-item" v-model="newHeight" type="number" />
                        <button class="btn btn-primary join-item" @click="updateTarget()">{{
                          $t('block.btn_update')
                        }}</button>
                      </div>
                      </p>
                    </td>
                  </tr>
                  <tr class="new_border">
                    <td>{{ $t('block.current_height') }}:</td>
                    <td class="text-right">#{{ base.latest?.block?.header.height }}</td>
                  </tr>
                  <tr class="new_border">
                    <td>{{ $t('block.remaining_blocks') }}:</td>
                    <td class="text-right">{{ remainingBlocks }}</td>
                  </tr>
                  <tr class="new_border">
                    <td>{{ $t('block.average_block_time') }}:</td>
                    <td class="text-right">{{ (base.blocktime / 1000).toFixed(1) }}s</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
       
        <div  v-else class="text-[#ffffff]">
          <div class="  pb-4 mb-4 rounded shadow bg-[#ffffff]/[.1]">
            <h2 class="px-4  md:pl-[24px] md:pt-[16px] py-[8px] border-b border-[#FFFFFF]/[.16] flex flex-row justify-between card-title">
              <p class="font-[OrbitronMedium] tracking-[.5px] text-[14px]">#{{ current.block?.header?.height }}</p>
              <div class="flex" v-if="newHeight">
                <RouterLink :to="`/${base.blockchain.chainName}/block/${height - 1}`"
                  class="p-1 mr-2 text-2xl btn btn-primary btn-sm">
                  <Icon icon="mdi-arrow-left" class="w-full h-full text-[#181A20]" />
                </RouterLink>
                <RouterLink :to="`/${base.blockchain.chainName}/block/${height + 1}`"
                  class="p-1 text-2xl btn btn-primary btn-sm">
                  <Icon icon="mdi-arrow-right" class="w-full h-full text-[#181A20]" />
                </RouterLink>
              </div>
            </h2>
            <div>
              <DynamicComponent :value="current.block_id" />
            </div>
          </div>

          <div class="  pb-4 mb-4 rounded shadow bg-[#ffffff]/[.1]">
            <h2 class="px-4 pt-[8px] pb-[8px] md:pl-[24px] md:pt-[16px] md:pb-[13px]  text-[14px] border-b border-[#FFFFFF]/[.16] card-title font-[OrbitronMedium] tracking-[.5px]">{{ $t('block.block_header') }}</h2>
            <DynamicComponent :value="current.block?.header" />
          </div>

          <div class="  pb-4 mb-4 rounded shadow bg-[#ffffff]/[.1]">
            <h2 class="px-4 pt-[8px] pb-[8px] md:pl-[24px] md:pt-[16px] md:pb-[13px] text-[14px] border-b border-[#FFFFFF]/[.16] card-title font-[OrbitronMedium] tracking-[.5px]">{{ $t('account.transactions') }}</h2>
            <TxsElement :value="current.block?.data?.txs" />
          </div>

          <div class=" pb-4 rounded shadow bg-[#ffffff]/[.1]">
            <h2 class="px-4 pt-[8px] pb-[8px] md:pl-[24px] md:pt-[16px] md:pb-[13px] text-[14px] border-b border-[#FFFFFF]/[.16] card-title font-[OrbitronMedium] tracking-[.5px]">{{ $t('block.last_commit') }}</h2>
            <DynamicComponent :value="current.block?.last_commit" />
          </div>
        </div>
      </div>
    </div>
    <div v-show="tab === 'transactions'" class="overflow-x-auto">
      <table class="table w-full table-compact">
        <thead>
          <tr class="border-[#FFFFFF]/[.16] text-[12px] text-[#ffffff]/[.54]">
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
        <tbody>
          <tr class="border-b-[1px] border-[#FFFFFF]/[.16] border-dashed" v-if="getTxsInRecents.length === 0">
              <td colspan="10">
                <div class="text-center text-[#ffffff]">
                  {{ $t('account.loading') }}
                </div>
              </td>
            </tr>
          <tr v-for="(item, index) in getTxsInRecents" :index="index"
            class="border-b-[1px] border-[#FFFFFF]/[.16] border-dashed dark:hover:bg-[#384059] text-[14px]  text-[#ffffff]/[.87] border-none">
            <td class="text-sm textjb-lv">
              <RouterLink :to="`/${props.chain}/block/${item.height}`">{{
                item.height
              }}</RouterLink>
            </td>
            <td class="truncate font-[OrbitronMedium] max-w-[125px] textjb-lv" width="50%">
              <RouterLink :to="`/${props.chain}/tx/${item.hash}`">{{
                item.hash
              }}</RouterLink>
            </td>
            <td>{{ format.messages(item.tx.body.messages) }}</td>
            <td>

              <!-- <template v-if="item.to || item.form">
                {{ item.automation ? item.to : item.value?item.value:getAmount(item.objValue.value) }}<br />
                <span>
                  {{ item.form }}
                </span>
              </template>
              <span v-else>
                {{ item.value ? item.value : getAmount(item.objValue.value) }}
              </span> -->
              <template v-if="!item?.methodName || item.methodName  == 'transferFrom' || item.methodName == 'transfer'">
                  <template v-if="item.to || item.form ">
                    {{item.automation?item.to:item.value?item.value:getAmount(item.objValue.value)}}<br/>
                    <span>
                      {{item.form}}
                    </span>
                  </template>
                  <span v-else>
                    <!-- {{ item.value ? item.value : getAmount(item.objValue.value) }} -->
                    <template v-if="item.value || item.transactionType">{{ item.value }}</template>
                    <template v-else>
                      {{ item.objValue.value == 0 && Number(item.tx_response.gas_used) > 40000 ? $t("account.ContractCall") : getAmount(item.objValue.value) }}
                    </template>
                  </span>
                </template>
                <template v-else>
                  {{item.methodName}}
                 </template>
            </td>
            <td class="truncate">
              <template v-if="item.to || item.form">
                <RouterLink class="textjb-lv" v-if="item.automation" :to="`/${props.chain}/token/${item.toAddress}`">
                  {{ item.nameTo }}
                </RouterLink>
                <span v-else>NOVAI</span>
                <br />
                <RouterLink v-if="item.nameForm != 'NOVAI'" class="textjb-lv" :to="`/${props.chain}/token/${item.formAddress}`">
                  {{ item.nameForm }}
                </RouterLink>
                <span v-else>{{ item.nameForm }}</span>
              </template>
              <RouterLink v-else-if="item.name" class="textjb-lv" :to="`/${props.chain}/token/${item.objValue.to}`">{{
                item.name
              }}</RouterLink>
              <span v-else-if="!item.name && !item.to">
                {{ !item.name && !item.to ? "NOVAI" : "" }}
              </span>

            </td>
            <td>{{ format.formatTokens(item.tx.authInfo.fee?.amount) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="p-4">
        <div class="relative bg-transparent   p-6">
          <div class="absolute inset-x-0 inset-y-0 w-full h-full alert bg-info opacity-10"></div>
          <div class="flex items-center text-[#ffffff] ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="flex-shrink-0 w-6 h-6 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="pl-[10px]">{{ $t('block.only_tx') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<route>
    {
      meta: {
        i18n: 'blocks',
        order: 2
      }
    }
  </route>
