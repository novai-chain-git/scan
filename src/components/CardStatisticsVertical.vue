<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { controlledComputed } from '@vueuse/core';

interface Props {
  title: string;
  color?: string;
  icon: string;
  stats: string;
  change?: number;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
});

const isPositive = controlledComputed(
  () => props.change,
  () => Math.sign(props.change || 0) === 1
);
</script>

<template>
  <div class="  ">
    <div class="flex items-center justify-center">

      <div
        v-if="props.change"
        :class="isPositive ? 'text-success' : 'text-error'"
        class="flex items-center text-sm font-semibold"
      >
        <span>{{ isPositive ? `+${props.change}` : props.change }}%</span>
        <Icon :icon="isPositive ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
      </div>
    </div>

    <div class="">
      <div class="pt-[26.5px] pb-[4px] text-[18px] md:!text-[20px]  font-[OrbitronMedium] tracking-[.5px] 
      flex items-center justify-center text-[#ffffff]">
      
        {{ props.stats || '-' }} <slot></slot>
      </div>
      <p class="text-[12px] text-center text-[#ffffff]/[.54]">
        {{ props.title }}
      </p>

      <div v-if="props.subtitle" size="x-small" class="font-semibold">
        <span class="truncate">{{ props.subtitle }}</span>
      </div>
    </div>
  </div>
</template>
