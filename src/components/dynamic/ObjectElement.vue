<script lang="ts" setup>
import { select } from './index';

const props = defineProps(['value']);
</script>
<template>
  <div class="overflow-auto">
    <table class="table table-compact w-full ">
      <tbody>
        <tr v-for="(v, k) of value">
          <td
            class="capitalize whitespace-break-spaces min-w-max"
          >
            {{ String(k).replaceAll('_', ' ') }}
          </td>
          <td class="w-4/5">
            <div class="overflow-hidden w-auto whitespace-normal " >
              <Component
                v-if="v"
                :is="select(v, 'horizontal')"
                :value="v"
              ></Component>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped lang="scss">
.table :where(th, td) {
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  padding-top: 14px;
  padding-bottom: 14px;
  
}
.dark .table :where(thead, tbody) :where(tr:not(:last-child)), .table :where(thead, tbody) :where(tr:first-child:last-child) {
  border-bottom-width: 1px;
  --tw-border-opacity: 1;
  border-bottom-color: rgba(255, 255, 255, 0.16);
}

.dark td{
  color: rgba(255, 255, 255, .6);
}
</style>
