<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import overview from '@/components/tx/Overview.vue';
import Logs from '@/components/tx/Logs.vue';
import State from '@/components/tx/State.vue';
import tabModule from '@/components/tabModule/index.vue';

import { computed, ref } from '@vue/reactivity';
import type { Tx, TxResponse } from '@/types';
import { get } from '@/libs';

import { JsonViewer } from 'vue3-json-viewer';
// if you used v1.0.5 or latster ,you should add import "vue3-json-viewer/dist/index.css"
import 'vue3-json-viewer/dist/index.css';

const props = defineProps(['hash', 'chain']);

const { t } = useI18n();
const tabs = ref('messages');
const tab = ref('1');
const blockchain = useBlockchain();
const baseStore = useBaseStore();
const format = useFormatter();
const tx = ref(
  {} as {
    tx: Tx;
    tx_response: TxResponse;
  }
);

watch(
  () => props.hash,
  () => {
    initData();
  },
  { immediate: true }
);
function setResData(x: { tx: Tx; tx_response: TxResponse }) {
  tx.value = x;
}
function initData() {
  if (props.hash) {
    if (props.hash.match(/^0x.*/)) {
      get(`/evmos/ethermint/ai/find_evmtx/${props.hash}`).then((res) => {
        blockchain.rpc.getTx(res.cosmostx).then(setResData);
      });
    } else {
      blockchain.rpc.getTx(props.hash).then(setResData);
    }
  }
}

const messages = computed(() => {
  return (
    tx.value.tx?.body?.messages.map((x) => {
      if (x.packet?.data) {
        // @ts-ignore
        x.message = format.base64ToString(x.packet.data);
      }
      return x;
    }) || []
  );
});
const getHash = computed(() => {
  return tx.value.tx?.body?.messages[0].hash || props.hash;
});
const changeTab = (val: '1' | '2' | '3') => {
  tab.value = val;
};

const tabList = computed(() => {
  return [
    {
      label: `${t('account.messages')} :${(messages.value as any[]).length}`,
      value: 'messages',
    },
    {
      label: 'logos',
      value: 'logos',
    },
  ];
});
</script>
<template>
  <div>
    <div>
      <overview
        v-if="tx.tx_response"
        :chain="props.chain"
        :tx="tx"
        :hash="getHash"
        :class="{ hidden: tab !== '1' }"
      />
    </div>

    <div
      v-if="tx.tx_response?.code === 0"
      class="text-[#ffffff] bg-[#131315]/[.8] rounded-[16px] mb-4"
    >
      <!-- <div>
        <h2
          class="card-title truncate mb-2 font-[OrbitronMedium] font-[400] tracking-[.5px] text-[14px]"
        >
          {{ $t('account.messages') }}: ({{ messages.length }})
        </h2>
        <h2
          class="card-title truncate mb-2 font-[OrbitronMedium] font-[400] tracking-[.5px] text-[14px]"
        >
          logos
        </h2>
      </div> -->
      <div
        class="px-4 font-[OrbitronMedium] tracking-[.5px] py-[8px] border-b border-[#FFFFFF]/[.16] text-[#ffffff] py-2 border-b"
      >
        <tabModule :list="tabList" v-model:tab="tabs"></tabModule>
      </div>
      <div class="px-4 pt-3 pb-4">
        <div :class="`${tabs === 'messages' ? 'block' : 'hidden'}`">
          <div v-for="(msg, i) in messages">
            <div class="rounded-md mt-4">
              <DynamicComponent :value="msg" />
            </div>
          </div>
          <div v-if="messages.length === 0">{{ $t('tx.no_messages') }}</div>
        </div>
        <div :class="`${tabs === 'logos' ? 'block' : 'hidden'}`">
          <Logs :tx="tx" :hash="getHash" :chain="props.chain" />
        </div>
      </div>
    </div>
<!-- 
    <div v-if="tx.tx_response?.code === 0">
      
    </div> -->

    <div
      v-if="tx.tx_response?.code === 0"
      class="text-[#ffffff] bg-[#131315]/[.8] rounded-[16px] px-4 pt-3 pb-4 mb-4"
    >
      <h2
        class="card-title truncate mb-2 text-[14px] font-[400] font-[OrbitronMedium] tracking-[.5px]"
      >
        JSON
      </h2>
      <JsonViewer
        :value="tx"
        theme="dark"
        style="background: transparent"
        copyable
        boxed
        sort
        expand-depth="5"
      />
      <!-- {{baseStore.theme}} -->
    </div>
  </div>
</template>
