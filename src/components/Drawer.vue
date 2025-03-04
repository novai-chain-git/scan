<script lang="ts" setup>
import { ref } from '@vue/reactivity';
const drawerType = ref(false)
</script>
<template>
    <div class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px] mb-[10px]">
        <div @click="drawerType = !drawerType" class="flex items-center justify-between px-4 py-[8px] cursor-pointer">
            <div class="text-[14px]  font-[OrbitronMedium] tracking-[.5px]">
                <slot name="title"></slot>
                
            </div>
            
            <div class=" transition duration-150" :class="[drawerType?'!rotate-[225deg]':'rotate-45']">
                <div class="w-[12px] h-[12px] border-b-[2px] border-r-[2px]  border-zinc-950"></div>
            </div>
        </div>
        <div class="transition duration-150 " :class="[drawerType?'h-[0px] overflow-hidden':'max-h-[100000px]']">
            <div class="h-[1px] bg-[#FFFFFF]/[.16] ">
            </div>
            <div class="p-3">
                <slot name="main"></slot>
            </div>
        </div>
    </div>
</template>