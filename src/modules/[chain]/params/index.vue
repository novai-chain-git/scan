<script lang="ts" setup>
import { useParamStore } from '@/stores';
import { ref, onMounted } from 'vue';
import CardParameter from '@/components/CardParameter.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue';
const store = useParamStore();
const chain = ref(store.chain);
onMounted(() => {
  // fetch the data
  store.initial();
});
</script>
<template>
  <div class="overflow-hidden">
    <div class="bg-base-100 pb-4 car">
      <!-- Chain ID -->
      <div class="px-8 pt-3 pb-4 rounded">
        <div class="text-2xl mb-3 text-main">{{ chain.title }}</div>
        <div
          class="grid grid-cols-2 md:!grid-cols-4 lg:!grid-cols-5 2xl:!grid-cols-6 gap-4"
        >
          <div
            v-for="(item, index) of chain.items"
            :key="index"
            class="rounded-sm bg-[#f7f7f7] px-4 py-2"
          >
            <div class="text-sm mb-2 text-secondary">{{ item.subtitle }}</div>
            <div class="text-base text-main">{{ item.value }}</div>
          </div>
        </div>
      </div>
      <!-- minting Parameters  -->
      <CardParameter :cardItem="store.mint" />
      <!-- Staking Parameters  -->
      <CardParameter :cardItem="store.staking" />
      <!-- Governance Parameters -->
      <!-- <CardParameter :cardItem="store.gov" /> -->
      <!-- Distribution Parameters -->
      <CardParameter :cardItem="store.distribution" />
      <!-- Slashing Parameters -->
      <CardParameter :cardItem="store.slashing" />
    </div>
    <!-- Application Version -->
    <div class="bg-base-100 pt-3 pb-4 rounded-sm mt-6">
      <div class="text-base px-8 pb-3 text-main">
        {{ store.appVersion?.title }}
      </div>
      <ArrayObjectElement :value="store.appVersion?.items" :thead="false" />
    </div>

    <!-- Node Information -->
    <div class="bg-base-100 pt-3 pb-4 rounded-sm mt-6">
      <div class="text-base px-8 pb-3 text-main">
        {{ store.nodeVersion?.title }}
      </div>
      <ArrayObjectElement :value="store.nodeVersion?.items" :thead="false" />
    </div>
  </div>
</template>

<!-- <route>
{
  meta: {
    i18n: false,
    order: 298,
  }
}
</route> -->

<style scoped lang="scss">
.dark .bg-base-100 {
  background-color: #252732;
}
.CardParameter {
  margin: 0;
}

.text-base {
  font-size: 1.5rem !important;
}

.dark {
  .bg-active {
    background-color: rgba(111, 65, 255, 0.1);
  }
  .text-sm {
    color: rgba(255, 255, 255, 0.6);
  }
}
.pb-3 {
  padding-bottom: 1.875rem;
}
.pt-3 {
  padding-top: 1.875rem;
}
</style>
