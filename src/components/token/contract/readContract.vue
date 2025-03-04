<script lang="ts" setup>

import { watch, computed } from "vue"
import operation from "./operation/index.vue"
const props = defineProps(['contractInfo', 'info','tab', "token"])


const list = computed(() =>{
  if(!props.contractInfo || !props.contractInfo?.abi) return []

  return JSON.parse(props.contractInfo?.abi).filter((item: { type: string; stateMutability: string; }) => 
    item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure')
  )
})
</script>
<template>
  <div>
    <slot></slot>
    <div class="pb-2">{{ $t('token.Read Contract Information') }}</div>
    <operation v-bind="{ ...$props, tab,list }" ></operation>
  </div>
  <!-- 

   -->
</template>
