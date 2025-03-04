<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue';
import { Icon } from '@iconify/vue';
import TxsElement from '@/components/dynamic/TxsElement.vue';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import { computed } from '@vue/reactivity';
import { onBeforeRouteUpdate } from 'vue-router';
import { useBaseStore, useFormatter } from '@/stores';
import type { Block } from '@/types';
import Countdown from '@/components/Countdown.vue';

const props = defineProps(['height', 'chain']);

const store = useBaseStore();
const format = useFormatter()
const current = ref({} as Block)
const target = ref(Number(props.height || 0))

const height = computed(() => {
  return Number(current.value.block?.header?.height || props.height || 0);
});

const isFutureBlock = computed({
  get: () => {
    const latest = store.latest?.block?.header.height
    const isFuture = latest ? target.value > Number(latest) : true
    if (!isFuture && !current.value.block_id) store.fetchBlock(target.value).then(x => current.value = x)
    return isFuture
  },
  set: val => {
    console.log(val)
  }
})

const remainingBlocks = computed(() => {
  const latest = store.latest?.block?.header.height
  return latest ? Number(target.value) - Number(latest) : 0
})

const estimateTime = computed(() => {
  const seconds = remainingBlocks.value * Number((store.blocktime / 1000).toFixed()) * 1000
  return seconds
})

const estimateDate = computed(() => {
  return new Date(new Date().getTime() + estimateTime.value)
})

const edit = ref(false)
const newHeight = ref(props.height)
function updateTarget() {
  target.value = Number(newHeight.value)
  console.log(target.value)
}

onBeforeRouteUpdate(async (to, from, next) => {
  if (from.path !== to.path) {
    store.fetchBlock(String(to.params.height)).then(x => current.value = x);
    next();
  }
});
</script>
<template>
  <div class="text-[#ffffff] mb-[10px]">
    <div v-if="isFutureBlock" class="text-center text-[#ffffff]">
      <div v-if="remainingBlocks > 0">
        <div class="my-10 text-lg  text-[14px] font-[OrbitronMedium] tracking-[.5px]">#{{ target }}</div>
        <Countdown :time="estimateTime" css="md:!text-5xl font-sans md:mx-5" />
        <div class="my-5">{{ $t('block.estimated_time') }}: <span class="text-xl font-bold">{{
          format.toLocaleDate(estimateDate) }}</span>
        </div>
        <div class="flex justify-center pt-10">
          <table class="table  w-max border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]">
            <tbody>
              <tr class="cursor-pointer hover border-[#FFFFFF]/[.16]" @click="edit = !edit">
                <td>{{ $t('block.countdown_for_block') }}:</td>
                <td class="text-right"><span class="md:!ml-40">{{ target }}</span></td>
              </tr>
              <tr v-if="edit" class="border-[#FFFFFF]/[.16]">
                <td colspan="2" class="text-center">
                  <h3 class="text-lg font-bold">{{ $t('block.countdown_for_block_input') }}</h3>
                  <p class="py-4">
                  <div class="join">
                    <input class="input input-bordered join-item" v-model="newHeight" type="number" />
                    <button class="btn btn-primary join-item" @click="updateTarget()">{{ $t('block.btn_update')
                      }}</button>
                  </div>
                  </p>
                </td>
              </tr>
              <tr>
                <td>{{ $t('block.current_height') }}:</td>
                <td class="text-right">#{{ store.latest?.block?.header.height }}</td>
              </tr>
              <tr>
                <td>{{ $t('block.remaining_blocks') }}:</td>
                <td class="text-right">{{ remainingBlocks }}</td>
              </tr>
              <tr>
                <td>{{ $t('block.average_block_time') }}:</td>
                <td class="text-right">{{ (store.blocktime / 1000).toFixed(1) }}s</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
    <div v-else>
      <div class="  pb-4 mb-4  border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]">
        <h2 class="border-b border-[#FFFFFF]/[.16] flex px-4 pt-[6px] pb-[6px] md:px-[24px] md:pt-[14px] md:pb-[11px] flex-row justify-between card-title">
          <p class="  font-[OrbitronMedium] tracking-[.5px] text-[14px]">#{{ current.block?.header?.height }}</p>
          <div class="flex " v-if="props.height">
            <RouterLink :to="`/${store.blockchain.chainName}/block/${height - 1}`"
              class="p-1 mr-2 text-2xl btn btn-primary btn-sm">
              <Icon icon="mdi-arrow-left" class="w-full h-full text-[#181A20]" />
            </RouterLink>
            <RouterLink :to="`/${store.blockchain.chainName}/block/${height + 1}`"
              class="p-1 text-2xl btn btn-primary btn-sm ">
              <Icon icon="mdi-arrow-right" class="w-full h-full text-[#181A20]" />
            </RouterLink>
          </div>
        </h2>
        <div>
          <DynamicComponent :value="current.block_id" />
        </div>
      </div>
      <div class="pb-4 mb-4  shadow border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]">
        <div class="pt-[8px] pb-[8px] md:pl-[24px] md:pt-[16px] md:pb-[13px] border-b border-[#FFFFFF]/[.16]   px-4  card-title  
        text-[14px] font-[OrbitronMedium] tracking-[.5px]">{{ $t('block.block_header') }}</div>
        <DynamicComponent :value="current.block?.header" />
      </div>

      <div class="pb-4 mb-4  shadow border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]">
        <h2 class="pt-[8px] pb-[8px] md:pl-[24px] md:pt-[16px] md:pb-[13px] border-b border-[#FFFFFF]/[.16] px-4 flex f card-title  text-[14px] font-[OrbitronMedium] tracking-[.5px]">{{ $t('account.transactions') }}</h2>
        <TxsElement :value="current.block?.data?.txs" />
      </div>

      <div class="pb-4  shadow border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px]">
        <h2 class="pt-[8px] pb-[8px] md:pl-[24px] md:pt-[16px] md:pb-[13px] border-b border-[#FFFFFF]/[.16] px-4 flex  card-title  text-[14px] font-[OrbitronMedium] tracking-[.5px]">{{ $t('block.last_commit') }}</h2>
        <DynamicComponent :value="current.block?.last_commit" />

      </div>
    </div>
  </div>
</template>
<style scoped>
.card-title{
  font-weight: 400
}
</style>
