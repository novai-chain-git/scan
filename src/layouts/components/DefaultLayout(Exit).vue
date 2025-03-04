<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

// Components
import newFooter from '@/layouts/components/NavFooter.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavbarSearch from '@/layouts/components/NavbarSearch.vue';
import ChainProfile from '@/layouts/components/ChainProfile.vue';

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
</script>

<template>
  <div class="bg-gray-100 dark:bg-[#0B0C10]">
    <!-- sidebar -->
    <div
        class="fixed top-0 bottom-0 left-0 z-50 w-64 overflow-auto border-r border-gray-100 dark:bg-[#252732] dark:border-gray-700"
        :class="{ block: sidebarShow, 'hidden xl:!block': !sidebarShow }"
    >
      <div class="flex justify-between py-4 pl-4 mt-1 mb-1">
        <RouterLink to="/" class="flex items-center">
          <!-- <img class="w-10 h-10" src="../../assets/logo.svg" /> -->
          <h1 class="flex-1 ml-3 text-2xl font-semibold dark:text-white">
            Novai
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
                <!-- <Icon
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
                /> -->
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
        <!-- <div class="px-4 pt-2 pb-2 text-sm text-gray-400 uppercase">
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
        </a> -->

        <!-- <div class="px-4 pt-2 pb-2 text-sm text-gray-400 uppercase">
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
          </RouterLink> -->

        <!-- <div class="px-4 pt-2 pb-2 text-sm text-gray-400 uppercase">{{ $t('module.links') }}</div> -->
        <!-- <a
          href="https://twitter.com/ping_pub"
          target="_blank"
          class="py-2 px-4 flex items-center cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:twitter" class="mr-2 text-xl" /> -->
        <!-- <div
            class="flex-1 text-base text-gray-600 capitalize dark:text-gray-200"
          >
            Twitter
          </div>
        </a> -->
        <!-- <a
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
        </a> -->
        <!-- <a
          href="https://github.com/ping-pub/explorer/discussions"
          target="_blank"
          class="py-2 px-4 flex items-center rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#373f59]"
        >
          <Icon icon="mdi:frequently-asked-questions" class="mr-2 text-xl" />
          <div
            class="flex-1 text-base text-gray-600 capitalize dark:text-gray-200"
          >
            FAQ
          </div> -->
        <!-- </a> -->
      </div>
    </div>
    <div class="xl:!ml-64 px-3 min-h-[100vh]">
      <!-- header -->
      <div
          class=" top-0 z-10 flex items-center px-4 py-3 mb-4 bg-[#2a2839]"
      >
        <div
            class="text-2xl pr-3 cursor-pointer xl:!hidden"
            @click="sidebarShow = true"
        >
          <Icon icon="mdi-menu" />
        </div>

        <ChainProfile />

        <div class="flex-1 w-0"></div>

        <!-- <NavSearchBar />-->
        <NavBarI18n class="hidden md:!inline-block" />
        <NavbarThemeSwitcher class="!inline-block" />
        <NavbarSearch class="!inline-block" />
        <!-- <NavBarWallet /> -->
      </div>

      <!-- 👉 Pages -->
      <div style="min-height: calc(100vh - 180px)">
        <RouterView v-slot="{ Component }">
          <Transition mode="out-in">
            <Component :is="Component" />
          </Transition>
        </RouterView>
      </div>

      <!-- <newFooter /> -->
    </div>
  </div>
</template>

<style lang="scss">
.collapse-menu-item-cl{
  width: 0.5rem;
  height: 0.5rem;
  transform: rotate(317deg);
  box-shadow: 2px 2px;
  margin-right: .4rem;

}
.yuans{
  width: 12px;
  height: 12px;
  margin-right: .8rem;

}
.yuans-main{
  width: 5px;
  height: 5px;
  border-radius: 50%;
  border: 1px solid #FFFFFF;
  opacity: 0.6;
}
.yuans-c{
  width: 12px;
  height: 12px;
}
</style>
<style scoped lang="scss">
.collapse-content {
  padding: 0 !important;
}
.sticky{
  //background-color: rgba(184, 71, 255, .2);
}

.dark .bg-base-100{
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
