<script lang="ts" setup>
const props = defineProps(['list', 'tab'])

const emit = defineEmits(['update:tab', 'delete'])
function setTab(type: any, value: string) {
  emit(type, value)
}
</script>
<template>
  <div class="flex items-center  text-[#ffffff] py-2 font-[OrbitronMedium] tracking-[.5px] border-[#000000]/[0.1]">
    <template v-for="(item, index) in list" :key="index">
      <a v-if="!item.routerPath" class="text-sm px-4 py-1 leading-10 cursor-pointer "
        :class="{ 'bg-lv  rounded-full text-[#181A20]': tab === item.value }" @click="setTab('update:tab', item.value)">
        {{ item.label }}
      </a>
      <RouterLink v-else :to="item.routerPath">
        <a  class="text-sm px-4 py-1 leading-10 cursor-pointer "
          :class="{ 'bg-lv  rounded-full text-[#181A20]': tab === item.value }"
          >
          {{ item.label }}
        </a>
      </RouterLink>
    </template>
  </div>
</template>
