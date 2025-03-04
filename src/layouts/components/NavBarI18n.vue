<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

const isShowLang = ref(false);
const i18nLangs: Array<{ label: string; i18nLang: string }> = [
  {
    label: 'English',
    i18nLang: 'en',
  },
  {
    label: '中文',
    i18nLang: 'cn',
  } /* ,
    {
        label: 'Indonesian',
        i18nLang: 'id',
    }, */,
];

let locale = ref(useI18n({ useScope: 'global' }).locale);

//网页设置标题和描述
const htmlTitle = (val: any) => {
  let title = '';
  let content = '';
  let meta = document.querySelector('meta[name="description"]');
  if (val && val == 'cn') {
    title = 'Novai Scan：全面的 Novai Chain 区块链浏览器';
    content =
      'Novai Scan 提供 Novai Chain 的深入区块链浏览器，提供交易、区块和智能合约的实时数据和见解。';
  } else {
    title = 'Novai Scan: Comprehensive Blockchain Explorer for Novai Chain';
    content =
      'Novai Scan provides an in-depth blockchain explorer for Novai Chain, offering real-time data and insights into transactions, blocks, and smart contracts.';
  }
  document.title = title;
  if (meta) meta.setAttribute('content', content);
};

watch(
  locale,
  (val) => {
    document.documentElement.setAttribute('lang', val as string);
    if (val) {
      htmlTitle(val);
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

let currentLang = ref(localStorage.getItem('lang') || 'en');

watch(currentLang, (val: string) => {
  document.documentElement.setAttribute('lang', val as string);
});

let dropdownContentRef = ref();
const handleLangChange = (lang: string) => {
  isShowLang.value = false;
  locale.value = lang;
  currentLang.value = lang;
  localStorage.setItem('lang', lang);
  //window.blur()
  dropdownContentRef.value.blur();
  // 获取所有带有焦点的元素
  //   const focusedElements = document.querySelectorAll(':focus');
  // console.log(focusedElements)
  // 遍历所有带有焦点的元素并调用blur()方法取消焦点
};
</script>

<template>
  <div class="h-[100%]" style="cursor: pointer">
    <div class="h-[100%] relative z-[2001] mlauto mr40 flex align-center <md:( )" @mouseenter="isShowLang = true"
      @mouseleave="isShowLang = false">
      <img src="@/assets/images/svg/icon4.svg" alt="" class="w-[20px] h[20px] <md:(w16 h16)"
        @click="isShowLang = true" />
      <div class="bg_jb p-[1px] absolute top-[60px] right-[0] dropdown_item rounded-[10px] 
         w-[120px] z-[2001]"
         :class="[isShowLang ? 'dropdown_item' : 'dropdown_items']">
        <ul class="bg-[#131315] rounded-[10px] 
             py-[10px]
          text-15 ">
          <li v-for="lang in i18nLangs" :key="lang.i18nLang"
            class="h-[40px] px-[20px] flex items-center justify-between cursor-pointer <md:(px10) text-[#ffffff]" text="14 c15"
            :class="{ '': locale === lang.i18nLang }"
             @click="handleLangChange(lang.i18nLang)">
            {{ lang.label }}
            <img v-if="locale === lang.i18nLang" src="@/assets/images/choose.svg" alt="" class="mlauto w-[12px]" />
          </li>
        </ul>
      </div>

    </div>
    <!--        <label tabindex="0" class="ml-5">-->
    <!--&lt;!&ndash;            <Icon&ndash;&gt;-->
    <!--&lt;!&ndash;                icon="mdi-translate"&ndash;&gt;-->
    <!--&lt;!&ndash;                class="text-2xl text-gray-500 dark:text-gray-400"&ndash;&gt;-->
    <!--&lt;!&ndash;            />&ndash;&gt;-->
    <!--          <span class="text-base text-[#5B5B5B] font-medium">-->
    <!--            {{currentLang}}-->
    <!--          </span>-->
    <!--&lt;!&ndash;          <span class="text-[8px] pl-[4px] text-[#000000]/[0.6]">▼</span>&ndash;&gt;-->
    <!--        </label>-->
    <!--        <ul-->
    <!--            tabindex="0"-->
    <!--            ref="dropdownContentRef"-->
    <!--            class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-[1000]"-->
    <!--        >-->
    <!--            <li v-for="lang in i18nLangs" :key="lang.i18nLang">-->
    <!--                <a-->
    <!--                    class="hover:bg-gray-100 dark:hover:bg-[#373f59]"-->
    <!--                    :class="{ 'text-primary': currentLang === lang.i18nLang }"-->
    <!--                    @click="handleLangChange(lang.i18nLang)"-->
    <!--                    >{{ lang.label }}</a-->
    <!--                >-->
    <!--            </li>-->
    <!--        </ul>-->
  </div>
</template>
<style>
.dropdown_item {
  transition: all 0.3s;
  transform: scale(1);
}

.dropdown_items {
  transition: all 0.3s;
  transform: scale(0);
}

.dropdown_ite {
  transition: all 0.3s;
  transform: scale(1);
}

.dropdown_ites {
  transition: all 0.3s;
  transform: scale(0);
}
</style>
