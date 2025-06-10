<script lang="ts" setup>
import FormItem from './FormItem.vue';
import { onMounted, ref, watch, watchEffect, computed } from 'vue';
const props = defineProps(['tx', 'name', 'chain']);



function selectByElement() {
  switch (props.name) {
    case 'form':
      return FormItem;
    default:
      return FormItem;
  }
}
</script>
<template>
  <div>
    <!-- <div></div>
    <RouterLink v-if="form" :to="`/${props.chain}/account/${form}`">{{
      form
    }}</RouterLink> -->

    <Component :is="selectByElement()" :tx="tx" :chain="chain"></Component>
  </div>
</template>
