<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import type { NodeInfo } from '@/types';
import { fromBase64, toHex } from '@cosmjs/encoding';
import { onMounted, ref } from 'vue';
import { computed } from 'vue';

const props = defineProps(['hash', 'chain']);
const blockchain = useBlockchain();
const base = useBaseStore();
const nodeInfo = ref({} as NodeInfo);

const height = ref(0);
const hash = ref('');

base.$subscribe((m, { latest }) => {
  let h = Number(latest.block?.header?.height);
  h = Math.round((h - 2000) / 1000) * 1000;
  if (h > height.value) {
    height.value = h;
    base.fetchBlock(h).then((res) => {
      hash.value = toHex(fromBase64(res.block_id.hash)).toUpperCase();
    });
  }
});

const rpcs = computed(() => {
  return blockchain.current?.endpoints?.rpc?.map((x) => x.address).join(',');
});

const appName = computed(() => {
  return nodeInfo.value.application_version?.app_name || 'gaiad';
});

onMounted(() => {
  blockchain.rpc.getBaseNodeInfo().then((x) => {
    nodeInfo.value = x;
  });
});
</script>
<template>
  <div>
    <div class="bg-base-100 mb-4 shadow">
      <div class="border-buttom flex item-center px-8 pt-3 pb-4">
        <h2 class="card-title truncate">{{ $t('statesync.title') }}</h2>
      </div>
      <div class="text-sm px-8 pt-3 pb-4">
        {{ $t('statesync.description') }}
        <a
          class="text-primary lowercase"
          href="https://blog.cosmos.network/cosmos-sdk-state-sync-guide-99e4cf43be2f"
          >{{ $t('statesync.here') }}&nbsp;</a
        >
        <a class="lowercase"> {{ $t('statesync.for_more_info') }}.</a>
      </div>
    </div>

    <div class="bg-base-100 mb-4 shadow">
      <div class="border-buttom flex item-center px-8 pt-3 pb-4">
        <h2 class="card-title truncate">
          {{ $t('statesync.title_2') }}
        </h2>
      </div>

      <div class="text-sm px-8 pt-3 pb-4">
        <span class="">
          1. {{ $t('statesync.text_1') }} ({{ appName }}
          {{ $t('statesync.version') }}:
          {{ nodeInfo.application_version?.version || '' }})
        </span>
        <br />
        {{ $t('statesync.text_1_1') }}.
        <br />
        <br />
        <span>2. {{ $t('statesync.text_2') }}</span
        ><br />
        {{ $t('statesync.text_2_1') }}. <br /><br />
        <div class="mockup-code bg-base-200 my-2">
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">[state-sync]</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">enable = true</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800"></code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">rpc_servers = "{{ rpcs }}"</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">trust_height = {{ height }} </code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">trust_hash = "{{ hash }}"</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert"></code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-green-400"># 2/3 of unbonding time</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">trust_period = "168h"</code></pre>
        </div>
        <br />
        <span>
          3. {{ $t('statesync.text_3') }}:
          <code class="bg-base-200 text-gray-600 px-2 py-px mx-1 shadow"
            >{{ appName }} start</code
          >
        </span>
        <br />
        {{ $t('statesync.text_3_1') }}
        <code class="bg-base-200 text-gray-600 px-2 py-px mx-1 shadow"
          >{{ appName }} unsafe-reset-all</code
        >
        or
        <code class="bg-base-200 text-gray-600 px-2 py-px mx-1 shadow"
          >{{ appName }} tendermint unsafe-reset-all --home ~/.HOME</code
        >
        {{ $t('statesync.text_3_2') }}.
      </div>
    </div>

    <div class="bg-base-100 px-4 pt-3 pb-4 shadow">
      <div class="border-buttom flex item-center px-8 pt-3 pb-4">
        <h2 class="card-title truncate mb-2">{{ $t('statesync.title_3') }}</h2>
      </div>
      <div class="text-sm px-8 pt-3 pb-4">
        {{ $t('statesync.text_title_3') }}
        <br /><br />
        <div class="mockup-code bg-base-200 my-2">
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">[state-sync]</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-green-400"># snapshot-interval specifies the block interval at which local state sync snapshots are</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-green-400"># taken (0 to disable). Must be a multiple of pruning-keep-every.</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">snapshot-interval = 1000</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert"></code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-green-400"># snapshot-keep-recent specifies the number of recent snapshots to keep and serve (0 to keep all). Each snapshot is about 500MiB</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">snapshot-keep-recent = 2</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- <route>
    {
      meta: {
        i18n: 'state-sync',
    order: 299,
      }
    }
  </route> -->

<style scoped lang="scss">
.border-buttom {
  //  opacity: 0.1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 4.875rem;
}

.dark .card-title {
  color: #ffffff;
}

.dark .text-color {
  color: #ffffff;
}

.mockup-code {
  border-radius: 0px !important;
}
.mockup-code:before {
  display: none;
}

.dark .bg-base-200 {
  background-color: rgba(111, 65, 255, 0.1);
}

.dark .bg-base-100 {
  background-color: #252732;
}
.dark .text-gray-600 {
  color: #ffffff;
}
.dark span {
  color: #ffffff;
}
</style>
