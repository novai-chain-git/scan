<script lang="ts" setup>
import { ref, watch,nextTick } from 'vue';
const props = defineProps({
    text:{
        type: String,
        default:""
    }, 
    copy:{
        type:Boolean,
        default: false
    }
});
const mianRef = ref<any>()
//console.log(mianRef.value,'mianRef')
const texType = ref<boolean>(false)

const clientHeight = ref(0)
async function copyToClipboard() {
    try {
        // 
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(props.text);
        } else {
            document.execCommand(props.text);
            var textarea = document.createElement("textarea");
            textarea.value = props.text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }

        // console.log('内容已复制到剪贴板');
    } catch (err) {
        console.error('复制到剪贴板失败:', err);
    }
}
watch(() => props.text,
async (value) => {
    await nextTick()
  //  console.log(value?.clientHeight,'value')
    if(value){

        clientHeight.value = mianRef?.value?.clientHeight
    
    }
},{
    deep:true,
    immediate: true
})
</script>
<template>
    <div>
        <div :class="[copy?'':'pt-5']" class="px-5 !pb-0 rounded  shadow   "
         >
                <div class="py-2 text-right" v-if="copy">
                    <span class="textjb-lv cursor-pointer " @click="copyToClipboard()">copy</span>
                </div>
                <div  class="overflow-hidden" :class="[texType ? '' : 'max-h-[240px]']">
                    
                    <div ref="mianRef" class="whitespace-pre-wrap text-wrap" style="word-wrap:break-word;">{{ text }}</div>
                </div>
                <div  class="py-2 text-center text-gray-500 w-[100%]  inset-x-0 bottom-[0px]"
                    >
                    <span v-if="clientHeight > 240" @click="texType = !texType" class="cursor-pointer select-none">{{ texType ? '▲' : '▼' }}</span>

                </div>
            </div>
    </div>
</template>