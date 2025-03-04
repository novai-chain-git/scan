<script lang="ts" setup>
import DynamicComponent from './DynamicComponent.vue';
import { ref } from 'vue';
const props = defineProps(['value']);
const tab = ref(Object.keys(props.value)[0] || '');

const changeTab = (val: string) => {
  tab.value = val;
};
</script>
<template>
  <div>
    <div class="tabs">
      <a
        class="tab tab-bordered text-[#ffffff] capitalize"
        v-for="(item, index) of value"
        :value="index"
        :class="{ 'tab-active ': tab === String(index) }"
        @click="changeTab(String(index))"
        >{{ index }}</a
      >
    </div>
    <div class="min-h-[25px] mt-4">
      <div v-for="(v, k) of value" :value="k">
        <DynamicComponent :value="v" v-show="tab === String(k)" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.tab-bordered{
  border-color: transparent;

  border-image: linear-gradient(180deg, rgba(90,194,124,.1) 0%, rgba(178,226,53,.1) 100%) 1!important;
}
 .tab-active{
  border-color: transparent;

  border-image: linear-gradient(180deg, #5AC27C 0%, #B2E235 100%) 1!important;
}

</style>
