<script lang="ts" setup>
import { useGovStore } from '@/stores';
import ProposalListItem from '@/components/ProposalListItem.vue';
import { ref, onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { PageRequest } from '@/types';

const tab = ref('2');
const store = useGovStore();
const pageRequest = ref(new PageRequest());

onMounted(() => {
  store.fetchProposals('2').then((x) => {
    if (x?.proposals?.length === 0) {
      tab.value = '3';
      store.fetchProposals('3');
    }
    store.fetchProposals('3');
    store.fetchProposals('4');
  });
});

const changeTab = (val: '2' | '3' | '4') => {
  tab.value = val;
};

function page(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposals(tab.value, pageRequest.value);
}
</script>
<template>
  <div class="bg-[#ffffff]">
    <div
      class="flex items-center justify-between px-[20px] text-[24px] text-[#333333] h-20 border-b-[1px] border-[#fff]/[0.1]"
    >
      <div>Active Proposals</div>
      <div class="text-center bg-transparent tabs tabs-boxed text-[#333333]">
        <a
          class="h-10 px-5 text-[16px] leading-10 cursor-pointer uppercase"
          :class="{ 'bg-[#4352D4] rounded-full  text-[#ffffff]': tab === '2' }"
          @click="changeTab('2')"
          >{{ $t('gov.voting') }}</a
        >
        <a
          class="h-10 px-5 text-[16px] leading-10 cursor-pointer uppercase"
          :class="{ 'bg-[#4352D4] rounded-full text-[#ffffff]': tab === '3' }"
          @click="changeTab('3')"
          >{{ $t('gov.passed') }}</a
        >
        <a
          class="h-10 px-5 text-[16px] leading-10 cursor-pointer uppercase"
          :class="{ 'bg-[#4352D4] rounded-full text-[#ffffff]': tab === '4' }"
          @click="changeTab('4')"
          >{{ $t('gov.rejected') }}</a
        >
      </div>
    </div>
    <ProposalListItem :proposals="store?.proposals[tab]" />
    <PaginationBar
      :total="store?.proposals[tab]?.pagination?.total"
      :limit="pageRequest.limit"
      :callback="page"
    />
  </div>
</template>
<!-- <route>
  {
    meta: {
      // i18n: 'governance',
      order: 2,
    }
  }
</route> -->
