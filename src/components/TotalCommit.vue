<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { get, post } from '@/libs';
import {
  useFormatter,
  useBaseStore,
  useBlockchain
} from '@/stores';

const { chain } = defineProps(['chain']);
const total_accounts = ref<any>(0)
const format = useFormatter();
const base = useBaseStore();
const blockchain = useBlockchain();

const getTotal = () => {
  get(`cosmos/auth/v1beta1/accounts`).then((res) => {
    console.log(res)
    let { pagination } = res
    console.log(res)
    total_accounts.value = pagination.total
  })
}

getTotal()


</script>
<template>
  <div>
    <div class="rounded-[16px] mb-[12px] mb:[24px] border border-[#FFFFFF]/[.16] bg_jb" style="">

      <div class="text-[#ffffff]">

        <div class="flex justify-between flex-wrap flex-col md:!flex-row lg: px-[24px] pb-[32px] text-center">
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_accounts') }}</div>
            <div class="text-[18px] md:!text-[20px]">{{ total_accounts }}</div>
          </div>
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_value_locked') }}</div>
            <div class="text-[18px] md:!text-[20px]">0</div>
          </div>
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_transactions') }}</div>
            <div class="text-[18px] md:!text-[20px]">0</div>
          </div>
          <div>
            <div class="pt-[26.5px]">{{ $t('module.total_transfer_volume') }}</div>
            <div class="text-[18px] md:!text-[20px]">0</div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>