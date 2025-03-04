<script lang="ts" setup>
import { useBlockchain, useFormatter, useTxDialog } from '@/stores';
import { useWasmStore } from './WasmStore';
import { ref } from 'vue';
import type { PaginabledCodeInfos } from './types';
import { PageRequest } from '@/types';
import PaginationBar from '@/components/PaginationBar.vue';
import router from '@/router';

const props = defineProps(['chain']);

const codes = ref({} as PaginabledCodeInfos);

const pageRequest = ref(new PageRequest());
const wasmStore = useWasmStore();
const dialog = useTxDialog();
const creator = ref('');

function pageload(pageNum: number) {
  pageRequest.value.setPage(pageNum);
  wasmStore.wasmClient.getWasmCodeList(pageRequest.value).then((x) => {
    codes.value = x;
  });
}
pageload(1);

function myContracts() {
  router.push(`/${props.chain}/cosmwasm/${creator.value}/contracts`);
}
</script>
<template>
  <div class="bg-base-100 rounded shadow">
    <div class="border-buttom flex px-4 item-center">
      <h2 class="card-title truncate w-full">{{ $t('cosmwasm.title') }}</h2>

      <div class="join border border-primary !bg-[#f7f7f7]">
        <input
          v-model="creator"
          type="text"
          class="input input-bordered w-40 join-item !bg-[#f7f7f7]"
          placeholder="creator address"
        />
        <button
          class="join-item btn btn-primary !bg-[#4352D4]"
          @click="myContracts()"
        >
          {{ $t('cosmwasm.btn_query') }}
        </button>
      </div>
    </div>
    <div class="overflow-x-auto px-4 pt-3 pb-4">
      <table class="table table-compact w-full mt-4 text-sm">
        <thead>
          <tr>
            <th>{{ $t('cosmwasm.code_id') }}</th>
            <th>{{ $t('cosmwasm.code_hash') }}</th>
            <th>{{ $t('cosmwasm.creator') }}</th>
            <th>{{ $t('cosmwasm.permissions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, index) in codes.code_infos" :key="index">
            <td>{{ v.code_id }}</td>
            <td>
              <RouterLink
                :to="`/${props.chain}/cosmwasm/${v.code_id}/contracts`"
                class="truncate max-w-[200px] block text-primary dark:invert"
                :title="v.data_hash"
              >
                {{ v.data_hash }}
              </RouterLink>
            </td>
            <td>{{ v.creator }}</td>
            <td>
              {{ v.instantiate_permission?.permission }}
              <span
                >{{ v.instantiate_permission?.address }}
                {{ v.instantiate_permission?.addresses.join(', ') }}</span
              >
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between">
        <PaginationBar
          :limit="pageRequest.limit"
          :total="codes.pagination?.total"
          :callback="pageload"
        />
        <label
          for="wasm_store_code"
          class="btn btn-primary my-5"
          @click="dialog.open('wasm_store_code', {})"
          >{{ $t('cosmwasm.btn_up_sc') }}</label
        >
      </div>
    </div>
  </div>
</template>

<!-- <route>
    {
      meta: {
        i18n: 'cosmwasm'
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
input {
  background-color: rgba(22, 24, 31, 1);
}
input,
.btn {
  height: 2.5rem;
  min-height: 2.5rem;
}
.join {
  margin: auto 0;
  background-color: rgba(22, 24, 31, 1);
}
.border-primary {
  border-radius: 1.25rem !important;
  border: 0;
}

.btn,
.join .join-item:last-child:not(:first-child),
.join *:last-child:not(:first-child) .join-item {
  background: #4352d4;
  border-radius: 1.25rem !important;
  border: 0;
  font-weight: 500;
  line-height: 2.5rem;
}
td,
th {
  font-weight: 400;
  font-size: 1rem;
  color: #999;
}
tr {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.dark .bg-base-100 {
  background-color: #252732;
}
</style>
