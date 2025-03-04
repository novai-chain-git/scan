<script lang="ts" setup>
import { defineProps, ref, computed,inject } from 'vue'
import CopyItem from '@/components/CopyItem.vue'
import operationItme from "./operationItme.vue"
import { useRoute } from 'vue-router';

const getContract = inject('getContract',function(){}) 
const props = defineProps(["contractInfo", 'tab', "token", "list"])
const route = useRoute(); // 获取路由对象
const loding = ref(true)

const currentUrl = window.location;
//onsole.log(currentUrl, 'currentUrl');
//获取当前展开的
const sign = ref<{ [key: string]: boolean }>({})

//当前展开对象和列表数
const getSignNumType = computed(() => {
  return Object.keys(sign.value).length === props.list.length
})
function setSign(index: number) {
  let name = `F${index}`
  if (sign.value[name]) {
    delete sign.value[name]
    return
  }
  sign.value[name] = true
  console.log(sign.value, '设置sign')
}
function getSign(index: number) {
  let name = `F${index}`
  return sign.value[name] ? true : false
}

const getLink = (key: number) => {
  return `${currentUrl.origin}${currentUrl.pathname}?link=${props.tab}#F${key}`
}
const onFold = () => {
  if (getSignNumType.value) {
    sign.value = {}
  } else {
    for(let i = 0; i < props.list.length; i++){
      let name = `F${i+1}`
      sign.value[name] = true
    }
  }
}
const onReset = () => {
  getContract()
}

if (route.query?.link == props.tab) {
  const result = route.hash.replace(/[#F]/g, ''); // 去掉逗号和感叹号
  setSign(Number(result))
}

</script>
<template>
  <div class="relative">
    <div v-if="list.length === 0" class="h-[300px]">

    </div>
    <div class="flex text-sm textjb-lv mb-2 absolute bottom-full right-[0px]">
      <div @click="onFold" class="cursor-pointer">[{{ getSignNumType?$t("token.CollapseAll"):$t("token.ExpandAll")}}]</div>
      <div @click="onReset" class="ml-2 cursor-pointer">[{{ $t("token.Reset") }}]</div>
    </div>
    <template v-for="(item, index) in list" :key="index">
      <div class="border !border-[#ffffff]/[.16] border-inherit mb-2 rounded">
        <div class="flex justify-between items-center p-2 cursor-pointer bg-[]" @click="setSign(index + 1)">
          <div>{{ index + 1 }}.{{ item.name }}</div>
          <div class="flex items-center">
            <CopyItem :value="item.name" :tips="$t('token.copyName')" position='left' class="mr-2">

              <template v-slot:icon>
                <i class="hover:text-[#4352D4] iconfont icon-fuzhi"></i>
              </template>
            </CopyItem>
            <CopyItem :value="getLink(index + 1)" :tips="$t('token.copyPermalink')" position='left' class="mr-2">
              <template v-slot:icon>
                <i class="hover:text-[#4352D4] iconfont icon-icon-"></i>
              </template>
            </CopyItem>
            <i :class="[getSign(index + 1) ? '!rotate-90' : '']"
              class="hover:text-[#4352D4] iconfont transition-all duration-300 icon-arrdown rotate-0"></i>
          </div>
        </div>
        <div class="overflow-hidden transition-all  max-h-0" :class="[getSign(index + 1) ? 'max-h-[500px]' : '']">
          <div class="border-t border-[#ffffff]/[.16]">

            <!-- <operationItme v-if="item.stateMutability === 'view' || item.stateMutability === 'pure'" v-bind="{...$props,abiItem:item}"></operationItme>
            <div v-else>
            </div> -->
            <operationItme v-bind="{ ...$props, abiItem: item }"></operationItme>
          </div>

        </div>
      </div>
    </template>
  </div>
</template>
