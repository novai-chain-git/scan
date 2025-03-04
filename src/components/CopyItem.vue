<script lang="ts" setup>
import { computed} from 'vue';
const props = defineProps(['value','tips','position']);
async function copyText() {
  console.log(props.value,'props.value')
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(props.value); // 使用 Clipboard API 复制文本
  } else {

    let input = document.createElement('textarea');
    input.style.cssText = 'position: absolute; top: 0; left: 0; opacity: 0; z-index: -10;';
    input.value = props.value;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);



  }

}
const getPosition = computed(()  =>{
  let str = ''
  switch (props.position) {
    case 'left':
      str = 'translate-y-[-50%] top-1/2 right-[100%]  bg-[#131315]'
      break;
  
    default:
      str = 'bottom-full left-1/2 translate-x-[-50%] bg-[#131315]'
      break;
  }
  return str
})
</script>


<template>
  <div class=" cursor-pointer group/items relative flex">
    <div class="truncate flex-1">
      <slot></slot>
    </div>

    
    <div v-show="value" class="" @click.native.stop="copyText">
      <slot name="icon" v-if="$slots.icon"></slot>
      <img  v-else src="@/assets/images/svg/copy.svg" alt="" class="w-[16px] h-[16px] md:!w-[20px] md:!h-[20px]" />
      
    </div>
    <div
    v-if="value"
    :class="getPosition"
      class="absolute  whitespace-nowrap   border-[#FFFFFF]/[.16]
      shadow-[0px_0px_10px_1px_rgba(79,115,163,0.16)] px-4 py-2 hidden group-hover/items:!block z-[10]">
      {{ tips?tips:value }}

    </div>
    
  </div>
</template>