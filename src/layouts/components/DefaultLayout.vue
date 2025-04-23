<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { ref, computed,onBeforeUnmount } from 'vue';
// Components
import newFooter from '@/layouts/components/NavFooter.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavbarSearch from '@/layouts/components/NavbarSearch.vue';
import ChainProfile from '@/layouts/components/ChainProfile.vue';
import MaskSvg from '@/assets/images/Mask.svg';
import Ellipse from '@/assets/images/Ellipse.png';

import { useDashboard } from '@/stores/useDashboard';
import { useBlockchain } from '@/stores';

import NavBarI18n from './NavBarI18n.vue';
import NavBarWallet from './NavBarWallet.vue';
import type {
  NavGroup,
  NavLink,
  NavSectionTitle,
  VerticalNavItems,
} from '../types';

const dashboard = useDashboard();
dashboard.initial();
const blockchain = useBlockchain();
blockchain.randomSetupEndpoint();

const getbg = ref({
  backgroundImage: `url(${MaskSvg})`,
  backgroundSize: '100% auto',
  backgroundAttachment: 'fixed',
});
const getbgs = ref({
  backgroundImage: `url(${Ellipse})`,
  backgroundSize: '36% auto',
  backgroundAttachment: 'fixed',
});
const current = ref(''); // the current chain
const temp = ref('');
blockchain.$subscribe((m, s) => {
  if (current.value === s.chainName && temp.value != s.endpoint.address) {
    temp.value = s.endpoint.address;
    blockchain.initial();
  }
  if (current.value != s.chainName) {
    current.value = s.chainName;
    blockchain.randomSetupEndpoint();
  }
});

const sidebarShow = ref(false);
const sidebarOpen = ref(true);

const changeOpen = (index: Number) => {
  if (index === 0) {
    sidebarOpen.value = !sidebarOpen.value;
  }
};
const showDiscord = window.location.host.search('Novai') > -1;

function isNavGroup(nav: VerticalNavItems | any): nav is NavGroup {
  return (<NavGroup>nav).children !== undefined;
}
function isNavLink(nav: VerticalNavItems | any): nav is NavLink {
  return (<NavLink>nav).to !== undefined;
}
function isNavTitle(nav: VerticalNavItems | any): nav is NavSectionTitle {
  return (<NavSectionTitle>nav).heading !== undefined;
}
function selected(route: any, nav: NavLink) {
  const b =
    route.path === nav.to?.path ||
    (route.path.startsWith(nav.to?.path) &&
      nav.title.indexOf('dashboard') === -1);
  return b;
}
const dropdownContentRef = ref();
const dropdownContentRefs = ref();
//取消焦点
function handleLangChange() {
  sidebarShow.value = false;
  // const focusedElements:any = document.querySelectorAll(':focus');
  // focusedElements[0]?.blur()
}

//滚动到窗口顶部
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
const scrollPosition = ref(0);
function handleScroll() {
  scrollPosition.value = window.scrollY || document.documentElement.scrollTop;
}
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
window.addEventListener('scroll', handleScroll);
</script>

<template>
  <div class="bg-[#131315] dark:bg-[#0B0C10]" :style="getbg">
    <div class="bg-left-top bg-no-repeat md:!bg-left" :style="getbgs">
      <!-- sidebar -->

      <!--    <div
      class="fixed top-0 bottom-0 left-0 z-50 w-64 overflow-auto border-r border-gray-100 dark:bg-[#252732] dark:border-gray-700"
      :class="{ block: sidebarShow, 'hidden xl:!block': !sidebarShow }"
    >
      <div class="flex justify-between py-4 pl-4 mt-1 mb-1">
        <RouterLink to="/" class="flex items-center">
           <img class="w-10 h-10" src="../../assets/logo.svg" />
          <h1 class="flex-1 ml-3 text-2xl font-semibold dark:text-white">
            Novai {{sidebarShow}}
          </h1>
        </RouterLink>
        <div
          class="pr-4 cursor-pointer xl:!hidden"
          @click="sidebarShow = false"
        >
          <Icon icon="mdi-close" class="text-2xl" />
        </div>
      </div>
      <div
        v-for="(item, index) of blockchain.computedChainMenu"
        :key="index"
        class=""
      >
        <div
          v-if="isNavGroup(item)"
          :tabindex="index"
          class="rounded-none collapse"
          :class="{
            'collapse-arrow': item?.children?.length > 0,
            'collapse-open': index === 0 && sidebarOpen,
            'collapse-close': index === 0 && !sidebarOpen,
          }"
        >
          <input
            type="checkbox"
            class="new-bg cursor-pointer !h-10 block"
            @click="changeOpen(index)"
          />
          <div
            class="new-bg collapse-title !py-0 px-4 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-[#373f59]"
          >
            <Icon
              v-if="item?.icon?.icon"
              :icon="item?.icon?.icon"
              class="mr-2 text-xl"
              :class="{
                'text-yellow-500': item?.title === 'Favorite',
                'text-blue-500': item?.title !== 'Favorite',
              }"
            />
            <img
              v-if="item?.icon?.image"
              :src="item?.icon?.image"
              class="w-6 h-6 mr-3 rounded-full"
            />
            <div
              class="flex-1 text-base text-gray-700 capitalize dark:text-gray-200 whitespace-nowrap"
            >
              {{ item?.title }}
            </div>
            <div
              v-if="item?.badgeContent"
              class="mr-6 text-white border-none badge badge-sm"
              :class="item?.badgeClass"
            >
              {{ item?.badgeContent }}
            </div>
          </div>
          <div class="collapse-content">
            <div
              v-for="(el, key) of item?.children"
              class="menu dark:bg-[#252732] w-full !p-0"
            >
              <RouterLink
                v-if="isNavLink(el)"
                @click="sidebarShow = false"
                class="collapse-menu-item flex items-center hover:bg-gray-100 dark:hover:bg-[#373f59] rounded cursor-pointer px-3 py-4 flex items-center"
                :class="{
                  'selected-bg': selected($route, el),
                }"
                :to="el.to"
              >
                &lt;!&ndash; <Icon
                  v-if="!el?.icon?.image"
                  icon="mdi:chevron-right"
                  class="ml-3 mr-2"
                  :class="{
                    'text-white':
                      $route.path === el?.to?.path &&
                      item?.title !== 'Favorite',
                  }"
                />
                <img
                  v-if="el?.icon?.image"
                  :src="el?.icon?.image"
                  class="w-6 h-6 ml-4 mr-3 rounded-full " :class="{
                  'border border-gray-300 bg-white': selected($route, el),
                }"
                /> &ndash;&gt;
                <div class="yuans flex items-center">
                  <div class="yuans-main" :class="{
                    'yuans-c': selected($route, el),
                  }"></div>
                </div>

                <div
                  class="text-base flex-1 text-black capitalize dark:text-gray-300"
                  :class="{
                    'text-black': selected($route, el),
                  }"
                >
                  {{ item?.title === 'Favorite' ? el?.title : $t(el?.title) }}
                </div>
                <div class="collapse-menu-item-cl">

                </div>
              </RouterLink>
            </div>
          </div>
        </div>

        <RouterLink
          v-if="isNavLink(item)"
          :to="item?.to"
          @click="sidebarShow = false"
          class="cursor-pointer rounded-lg px-4 flex items-center py-4 hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon
            v-if="item?.icon?.icon"
            :icon="item?.icon?.icon"
            class="mr-2 text-xl"
            :class="{
              'text-yellow-500': item?.title === 'Favorite',
              'text-blue-500': item?.title !== 'Favorite',
            }"
          />
          <img
            v-if="item?.icon?.image"
            :src="item?.icon?.image"
            class="w-6 h-6 mr-3 border border-blue-100 rounded-full"
          />
          <div
            class="flex-1 text-base text-gray-700 capitalize dark:text-gray-200 whitespace-nowrap"
          >
            {{ item?.title }}
          </div>
          <div
            v-if="item?.badgeContent"
            class="text-white border-none badge badge-sm"
            :class="item?.badgeClass"
          >
            {{ item?.badgeContent }}
          </div>
        </RouterLink>
        <div
          v-if="isNavTitle(item)"
          class="px-4 pb-2 text-sm text-gray-400 uppercase"
        >
          {{ item?.heading }}
        </div>
      </div>
      <div class="px-2">
        &lt;!&ndash; <div class="px-4 pt-2 pb-2 text-sm text-gray-400 uppercase">
          {{ $t('module.sponsors') }}
        </div>
        <a
          href="https://osmosis.zone"
          target="_blank"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <img
            src="https://ping.pub/logos/osmosis.jpg"
            class="w-6 h-6 mr-3 rounded-full"
          />
          <div
            class="flex-1 text-sm text-gray-600 capitalize dark:text-gray-200"
          >
            Osmosis
          </div>
        </a>
        <a
          href="https://celestia.org"
          target="_blank"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <img
            src="https://ping.pub/logos/celestia.png"
            class="w-6 h-6 mr-3 rounded-full"
          />
          <div
            class="flex-1 text-sm text-gray-600 capitalize dark:text-gray-200"
          >
            Celestia
          </div>
        </a>
        <a
          href="https://becole.com"
          target="_blank"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <img
            src="https://becole.com/static/logo/logo_becole.png"
            class="w-6 h-6 mr-3 rounded-full"
          />
          <div
            class="flex-1 text-sm text-gray-600 capitalize dark:text-gray-200"
          >
            Becole
          </div>
        </a> &ndash;&gt;

        &lt;!&ndash; <div class="px-4 pt-2 pb-2 text-sm text-gray-400 uppercase">
            Tools
          </div>
          <RouterLink to="/wallet/suggest"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
          >
            <Icon icon="mdi:frequently-asked-questions" class="mr-2 text-xl" />
            <div
              class="flex-1 text-base text-gray-600 capitalize dark:text-gray-200"
            >
              Wallet Helper
            </div>
          </RouterLink> &ndash;&gt;

        &lt;!&ndash; <div class="px-4 pt-2 pb-2 text-sm text-gray-400 uppercase">{{ $t('module.links') }}</div> &ndash;&gt;
        &lt;!&ndash; <a
          href="https://twitter.com/ping_pub"
          target="_blank"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:twitter" class="mr-2 text-xl" /> &ndash;&gt;
        &lt;!&ndash; <div
            class="flex-1 text-base text-gray-600 capitalize dark:text-gray-200"
          >
            Twitter
          </div>
        </a> &ndash;&gt;
        &lt;!&ndash; <a
          v-if="showDiscord"
          href="https://discord.com/invite/CmjYVSr6GW"
          target="_blank"
          class="py-2 px-4 flex items-center rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:discord" class="mr-2 text-xl" />
          <div
            class="flex-1 text-base text-gray-600 capitalize dark:text-gray-200"
          >
            Discord
          </div>
        </a> &ndash;&gt;
        &lt;!&ndash; <a
          href="https://github.com/ping-pub/explorer/discussions"
          target="_blank"
          class="py-2 px-4 flex items-center rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:frequently-asked-questions" class="mr-2 text-xl" />
          <div
            class="flex-1 text-base text-gray-600 capitalize dark:text-gray-200"
          >
            FAQ
          </div> &ndash;&gt;
        &lt;!&ndash; </a> &ndash;&gt;
      </div>
    </div>-->
      <div class="min-h-[100vh]">
        <!-- header -->
        <div class="h-[74px] md:h-[72px] dark:bg-[#2a2839]"></div>
        <div
          class="w100% h-[74px] top-0 right-0 z-10 flex items-center px-[20px] lg:px-[23px] fixed z-[2001] top-0 left-0"
          :class="[scrollPosition >= 70 ? 'backdrop-blur-[10px]' : '']"
        >
          <ChainProfile />
          <a href="https://www.novaichain.com/#/">
            <img
              class="h-[29px] md:!h-[42px]"
              src="../../assets/home_logo.svg"
            />
          </a>

          <div class="flex-1 w-0"></div>
          <div v-for="(el, key) of blockchain.computedChainMenu">
            <RouterLink
              :to="el.to"
              class="hidden"
              :class="[key < 3 ? 'lg:!block' : '']"
            >
              <div
                class="text-[#ffffff] font-[OrbitronMedium] tracking-[.5px] border-b-[1px] border-solid border-transparent mr-[40px] text-base "
                :class="selected($route, el) && ' !border-[#85d25a]'"
              >
                {{ el?.title ? $t(el?.title) : '' }}
              </div>
            </RouterLink>
          </div>

          <NavbarThemeSwitcher class="!inline-block" />
          <NavBarI18n />

          <div
            style="cursor: pointer"
            class="h-[100%] text-2xl lg:!hidden relative z-[2001] mlauto ml-[40px] flex items-center <md:( )"
            @mouseenter="sidebarShow = true"
            @mouseleave="sidebarShow = false"
          >
            <Icon icon="mdi-menu" class="text-[#ffffff]" @click="sidebarShow = true" />

            <ul
              class="absolute top-[60px] right-[-32px] rounded-[10px] bg-[#ffffff] py-[10px] w-[160px] z-[2001] shadow-[0px_0px_10px_1px_rgba(79,115,163,0.16)]"
              :class="[sidebarShow ? 'dropdown_ite' : 'dropdown_ites']"
            >
              <li
                v-for="(el, key) of blockchain.computedChainMenu"
                :key="key"
                class="h-[40px] px-[20px] flex items-center justify-between cursor-pointer <md:(px10)"
                text="14 c15"
                :class="{
                  'bg-[#4352d4]/[0.05]': selected($route, el),
                  hidden: key > 2,
                }"
                @click="sidebarShow == false"
              >
                <RouterLink :to="el.to" :class="[key > 2 ? 'hidden' : '']">
                  <div
                    @click="handleLangChange"
                    :class="[
                      selected($route, el)
                        ? 'text-[#000000]'
                        : 'text-[#848484]',
                    ]"
                    class="text-base font-[OrbitronMedium] tracking-[.5px] py-[14px] px-[20px] text-center"
                  >
                    {{ el?.title === 'Favorite' ? el?.title : $t(el?.title) }}
                  </div>
                </RouterLink>
              </li>
            </ul>
          </div>

          <!--        <div :class="{ '!block': sidebarShow }"-->
          <!--             class="absolute top-[74px] right-0 left-0  lg:!hidden hidden bottom-0-->
          <!--          z-[1000]" @click="sidebarShow = false">-->
          <!--          <ul style="float: right"-->
          <!--              class=" max-w-[40%] dropdown-content bg-[#ffffff] w-64 overflow-auto h-[100%] dark:bg-[#252732]  bg-base-100    ">-->
          <!--            <li v-for="(el, key) of blockchain.computedChainMenu" :key="key">-->
          <!--              <RouterLink :to="el.to" :class="[ key > 2 ? 'hidden':'']">-->
          <!--                <div @click="handleLangChange" :class="[-->
          <!--                selected($route, el)? 'text-[#000000]':'text-[#848484]'-->
          <!--            ]" class="  text-base font-medium py-[14px] px-[20px] text-center">-->
          <!--                  {{ el?.title === 'Favorite' ? el?.title : $t(el?.title) }}-->
          <!--                </div>-->
          <!--              </RouterLink>-->

          <!--            </li>-->
          <!--          </ul>-->
          <!--        </div>-->

          <!--        <div-->
          <!--            class="pl-[40px] lg:!hidden dropdown dropdown-bottom dropdown-end text-2xl  cursor-pointer "-->
          <!--        >-->
          <!--          <label tabindex="2">-->
          <!--            <Icon icon="mdi-menu" />-->
          <!--          </label>-->
          <!--          <ul tabindex="2"-->
          <!--              ref="dropdownContentRefs"-->
          <!--              class="dropdown-content  shadow bg-base-100  w-[140px] max-h-[80vh] xl:!h-auto overflow-y-auto  z-10">-->
          <!--            <li v-for="(el, key) of blockchain.computedChainMenu" :key="key">-->
          <!--              <RouterLink :to="el.to" :class="[ key > 2 ? 'hidden':'']">-->
          <!--                <div @click="handleLangChange" :class="[-->
          <!--                selected($route, el)? 'text-[#000000]':'text-[#848484]'-->
          <!--            ]" class="  text-base font-medium py-[14px] px-[20px] text-center">-->
          <!--                  {{ el?.title === 'Favorite' ? el?.title : $t(el?.title) }}-->
          <!--                </div>-->
          <!--              </RouterLink>-->

          <!--            </li>-->
          <!--          </ul>-->
          <!--        </div>-->
          <!-- <NavBarWallet /> -->
        </div>
        <div class="pt-[41px] pb-[27px]">
          <div class="w-[100%]">
            <NavbarSearch />
          </div>
        </div>
        <!-- 👉 Pages -->
        <div
          class="px-[20px] md:py-[0px]"
          style="min-height: calc(100vh - 180px); margin: auto;max-width: 1240px; "
        >
          <RouterView v-slot="{ Component }">
            <Transition mode="out-in">
              <Component :is="Component" />
            </Transition>
          </RouterView>
        </div>

        <!-- <newFooter /> -->
        <div class="border-t border-[#FFFFFF]/[.16] bg-[#131315] mt-4">
          <div class="max-w-[1240px] pb-[20px] pt-[41px] md:px-[0px] md:!mx-auto   mx-[20px]">
            <div class="flex justify-end pb-[6px] pr-[10px] md:pr-[0px]">
              <img
                class="w-[11px] cursor-pointer"
                @click="scrollToTop"
                src="@/assets/images/svg/8807.svg"
              />
            </div>
            <div class="md:flex md:justify-between md:!text-left text-center">
              <div>
                <img
                  class="w-[92px] h-[42px] inline-block md:!block"
                  src="@/assets/home_logo.svg"
                  alt=""
                />
                <div class="mt-[15px] text-[#FFFFFF]">
                  {{ $t('footer.footer_subtitle') }}
                </div>
                <ul
                  class="flex text-[14px] mt-[20px] justify-center mb-[5px] md:!justify-start md:mt-[76px] md:!mb-[0]"
                >
                  <li class="mr-[27px]">
                    <a href="mailto:marketing@novaichain.co" target="_blank">
                      <img class="w-[16px]" src="@/assets/images/svg/8804.svg"
                    /></a>
                  </li>
                  <li class="mr-[27px]">
                    <a href="https://t.me/Novai_Community" target="_blank">
                      <img class="w-[16px]" src="@/assets/images/svg/8805.svg"
                    /></a>
                  </li>
                  <li class="mr-[27px]">
                    <a href="https://x.com/NovaiChain_" target="_blank">
                      <img class="w-[16px]" src="@/assets/images/svg/8806.svg"
                    /></a>
                  </li>
                  <li class="mr-[27px]">
                    <a href="https://medium.com/@novaidao" target="_blank">
                      <img class="w-[16px]" src="@/assets/images/svg/8808.svg"
                    /></a>
                  </li>
                  <li class="">
                    <a href="https://t.me/novarchain1" target="_blank">
                      <img
                        class="w-[16px]"
                        src="@/assets/images/svg/8809.svg"
                      />
                    </a>
                  </li>
                </ul>
              </div>
              <div class="md:flex">
                <ul class="md:pr-[97px] mt-[10px] md:mt-[0px]">
                  <li
                    class="text-[#5AC27C] text-[14px] font-bold leading-[22px]"
                  >
                    {{ $t('footer.About_Us') }}
                  </li>
                  <li
                    class="text-[#ffffff] opacity-[.54] hover:translate-x-[10px] transition text-[14px] leading-[20px] mt-[10px]"
                  >
                    <router-link to="/novaichain/aboutUs/privacyPolicy">
                      {{ $t('footer.Privacy_Policy') }}
                    </router-link>
                  </li>
                  <li
                    class="text-[#ffffff] opacity-[.54] hover:translate-x-[10px] transition text-[14px] leading-[20px] mt-[10px]"
                  >
                    <router-link to="/novaichain/aboutUs/termsOfService">
                      {{ $t('footer.Terms_of_Service') }}
                    </router-link>
                  </li>
                </ul>
                <ul class="md:pr-[97px] mt-[10px] md:mt-[0px]">
                  <li
                    class="text-[#5AC27C] text-[14px] font-bold leading-[22px]"
                  >
                    {{ $t('footer.Services_&_Support') }}
                  </li>
                  <li
                    class="text-[#ffffff] opacity-[.54] hover:translate-x-[10px] transition text-[14px] leading-[20px] mt-[10px]"
                  >
                    <a href="https://medium.com/@novaidao" target="_blank">{{
                      $t('footer.Medium')
                    }}</a>
                  </li>
                  <li
                    class="text-[#ffffff] opacity-[.54] hover:translate-x-[10px] transition text-[14px] leading-[20px] mt-[10px]"
                  >
                    <a href="mailto:marketing@novaichain.co" target="_blank">{{
                      $t('footer.Contact_Us')
                    }}</a>
                  </li>
                </ul>
                <ul class="md:pr-[30px] mt-[10px] md:mt-[0px]">
                  <li
                    class="text-[#5AC27C] text-[14px] font-bold leading-[22px]"
                  >
                    {{ $t('footer.Resources') }}
                  </li>
                  <li
                    class="text-[#ffffff] opacity-[.54] hover:translate-x-[10px] transition text-[14px] leading-[20px] mt-[10px]"
                  >
                    <a
                      href="https://scan.novaichain.com/novai_chain_intro.pdf"
                      target="_blank"
                      >{{ $t('footer.Introduce') }}</a
                    >
                  </li>
                  <li
                    class="text-[#ffffff] opacity-[.54] hover:translate-x-[10px] transition text-[14px] leading-[20px] mt-[10px]"
                  >
                    <a
                      href="https://scan.novaichain.com/novai_chain_white_paper.pdf"
                      target="_blank"
                      >{{ $t('footer.Whitepaper') }}</a
                    >
                  </li>
                </ul>
              </div>
            </div>
            <div
              class="md:mt-[20px] mt-[10px] text-[14px] text-[#ffffff] md:!text-left text-center"
            >
              Copyright© 2017-2025 novaichain.com
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.collapse-menu-item-cl {
  width: 0.5rem;
  height: 0.5rem;
  transform: rotate(317deg);
  box-shadow: 2px 2px;
  margin-right: 0.4rem;
}

.yuans {
  width: 12px;
  height: 12px;
  margin-right: 0.8rem;
}

.yuans-main {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  border: 1px solid #ffffff;
  opacity: 0.6;
}

.yuans-c {
  width: 12px;
  height: 12px;
}

.head-bg {
  background-color: red;
  //background: url("../../assets/images/pages/header_bg.png") no-repeat;
  //background-size: 100% 100%;
}
</style>
<style scoped lang="scss">
.collapse-content {
  padding: 0 !important;
}

.sticky {
  //background-color: rgba(184, 71, 255, .2);
}

.dark .bg-base-100 {
  background-color: #252732;
}

.collapse-menu-item {
  padding-left: 28px !important;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 6px;
    top: 0;
    bottom: 0;
    left: 0;
    background: transparent;
  }

  &.selected-bg {
    &::before {
      background: linear-gradient(78deg, #6e41ff 0%, #9547ff 100%);
    }
  }
}
</style>
