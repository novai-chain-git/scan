<script lang="ts" setup>
import { computed, ref } from 'vue';
const props = defineProps({
  total: { type: String },
  limit: { type: Number, required: true },
  page: { type: Number, required: true },
  callback: { type: Function, required: true },
});
const current = ref(1)



const handleScroll = function(event:any) {
  let target = event.target
  const scrollTop = target.scrollTop
//  const container = this.$refs.chatContainer;
      // 检查是否滚动到底部
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
        loadMoreMessages();
   }
}
const loadMoreMessages = function() {
 
  props.callback()
}
</script>
<template>
  <div>
    <div class="">
      
    </div>
    <div class="pagination  max-h-[600px] min-h-[100px] overflow-x-auto" ref="chatContainer" @scroll="handleScroll">
      <slot></slot>
    </div>
  </div>
</template>