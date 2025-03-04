<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import DynamicComponent from './DynamicComponent.vue';

const props = defineProps({
  value: { type: null as any },
  thead: {
    type: Boolean,
    default: true,
  },
});

const header = computed(() => {
  if (props.value && props.value.length > 0) {
    return Object.keys(props.value[0]);
  }
  return [];
});
</script>
<template>
  <div class="overflow-auto max-h-96 border-t-[1px] border-[#000000]/[0.1]">
    <table class="table w-full table-xs table-compact table-pin-rows">
      <thead v-if="thead">
        <tr class="border-[#ffffff]/[0.1] bg-[transparent] text-[12px] text-[#ffffff]/[.54]">
          <th
            v-for="(item, index) in header"
            :key="index"
            class="text-left capitaliz py-[14px] px-[20px] font-[400]"
          >
            {{ item.replace(/_/g, ' ') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in value"
          :key="index"
          class=" "
        >
          <td v-for="(el, key) in header" class=" px-[20px] py-[14px] text-[14px]" :key="key">
            <DynamicComponent :value="item[el]" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
//.table :where(th, td) {
//  padding-left: 2rem !important;
//  padding-right: 2rem !important;
//  padding-top: 1.6rem;
//  padding-bottom: 1.6rem;
//  font-size: 1rem;
//}
//.dark td{
//  color: rgba(255, 255, 255, .6);
//}
</style>
