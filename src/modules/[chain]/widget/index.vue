<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import type { Connection } from '@/types';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';

const props = defineProps(['chain']);
const chainStore = useBlockchain();
const baseStore = useBaseStore();
const endpoint = ref(chainStore.current?.endpoints?.rest?.at(0)?.address);

const chainId = computed(() => baseStore.latest?.block?.header?.chain_id || '');
const chainName = computed(() => chainStore?.current?.prettyName || '');
const hdPath = computed(() => {
  return `m/44'/${chainStore.current?.coinType}/0'/0/0`;
});
</script>
<template>
  <div>
    <div class="bg-base-100 shadow">
      <div class="px-8 flex item-center justify-between border-buttom">
        <h2 class="card-title">{{ $t('widget.title') }}</h2>
        <div
          class="grid grid-flow-col auto-cols-max place-content-center overflow-auto"
        >
          <div class="form-control">
            <div class="input-group">
              <span>{{ $t('widget.endpoint') }}</span>
              <select v-model="endpoint" class="select select-bordered w-fit">
                <option disabled selected>
                  {{ $t('widget.select_endpoint') }}
                </option>
                <option
                  v-for="v in chainStore.current?.endpoints.rest"
                  :value="v.address"
                >
                  {{ v.address }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 pt-3 pb-4">
        <span class="text-base text-color">{{ $t('widget.text_1') }}</span>
        <div class="mockup-code bg-[#f7f7f7] my-2">
          <pre
            class="text-[#999999]"
            data-prefix="1"
          ><code class="text-gray-800 dark:invert">&lt;script type="module" src="https://unpkg.com/ping-widget@latest/dist/ping-widget.js"&gt;</code></pre>
        </div>
      </div>
    </div>
    <div class="bg-base-100 my-5 shadow">
      <div class="border-buttom flex item-center px-8 pt-3 pb-4">
        <h2 class="card-title">{{ $t('module.widget') }}</h2>
      </div>
      <div class="px-8 pt-3 pb-4">
        <span class="text-base text-color"> 1. {{ $t('widget.text_2') }}</span>
        <div class="mockup-code bg-[#f7f7f7] my-2">
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-[#999999]">&lt;!-- This widget is optional. --&gt; </code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code  class="text-gray-800 dark:invert">&lt;ping-connect-wallet chain-id="{{ chainId }}" hd-path="{{ hdPath }}"/&gt;</code></pre>
        </div>

        <span class="text-base text-color"> 2. {{ $t('widget.text_3') }}</span>
        <div class="mockup-code bg-[#f7f7f7] my-2">
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class=" text-gray-800 dark:invert">&lt;ping-token-convert chain-name="{{ chainName }}" endpoint="{{endpoint}}" hd-path="{{hdPath}}"/&gt;</code></pre>
          <pre
            class="text-[#999999]"
            data-prefix=">"
          ><code class="text-gray-800 dark:invert">&lt;label for="PingTokenConvert" class="btn btn-sm"&gt;Buy {{chainName.toUpperCase()}}&lt;/label&gt;</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: false,
        order: 300,

      }
    }
</route>

<style scoped lang="scss">
.input-group > :last-child {
  border: 0px solid !important;
  border-top-right-radius: 1.5rem !important;
  border-bottom-right-radius: 1.5rem !important;
  background-color: #f7f7f7 !important;

  height: 2.5rem !important;
  min-height: 2.5rem !important;
}

.input-group :where(span) {
  border: 1px solid var(--color-r) !important;
  border-top-left-radius: 1.5rem !important;
  border-bottom-left-radius: 1.5rem !important;
  background-color: #4352d4 !important;
  color: #fff !important;
  height: 2.5rem !important;
}
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
</style>
