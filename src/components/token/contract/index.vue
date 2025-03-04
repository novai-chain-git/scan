<script lang="ts" setup>
import { defineProps, ref, computed, provide } from 'vue';
import popUp from '@/components/popUp/index.vue';
import codeModule from './code.vue';
import readContract from './readContract.vue';
import writeContract from './writeContract.vue';
import tabModule from '../../tabModule/index.vue';
import { useBlockchain } from '@/stores';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { connectWallet, switchNetwork, ChainId } from '@/libs/web3/index';
import { encryptString } from '@/libs/utils';

const route = useRoute(); // 获取路由对象
const props = defineProps(['contractInfo', 'info', 'token']);

const blockchain = useBlockchain();
const { t } = useI18n();

const current = blockchain?.current?.chainName || '';
const contract = ref()
// 钱包地址
const walletAddress = ref<string>('');
//连接钱包
const linkWallet = ref(false);
const tab = ref('codeModule');


console.log(route, 'route.query?.link');
if (route.query?.link) {
  tab.value = String(route.query?.link);
}

const list = computed(() => {
  return [
    {
      label: t('token.Code'),
      value: 'codeModule',
    },
    {
      label: t('token.Read'),
      value: 'readContract',
    },
    {
      label: t('token.Write'),
      value: 'writeContract',
    },
  ];
});
const getTab = computed(() => {
  if (tab.value == 'codeModule') return codeModule;
  if (tab.value == 'readContract') return readContract;
  return writeContract;
});

const connectWalletAlert = () => {
  const res = confirm(t('token.Responsibility Statement'));
  if (res) {
    linkWallet.value = true;
  }
};

// 链接钱包功能
const linkWalletClick = async () => {
  linkWallet.value = false;
  console.log('account');
  const account = await connectWallet();
  console.log(account, 'account');
  switchNetwork(ChainId.NOVAI_MAINNET);
  walletAddress.value = account;
};

async function getContract() {
  try {
    contract.value = ''
    let { data, code } = await blockchain.rpc?.getContractToken(props.token)

    contract.value = data
    //    form:""
    //    txHash:"",
  } catch (err) {

  }

}
getContract()

provide('walletAddress', walletAddress)
provide('getContract', getContract)
//const
</script>
<template>
  <div class="p-5 border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px] mb-4">
    <tabModule :list="list" v-model:tab="tab"></tabModule>
    <keep-alive>
      <component :is="getTab" v-bind="{ ...$props, tab, contractInfo: contract }">
        <div class="py-2 mb-2 flex    text-[#000000]">
          <!-- <div>asd</div> <div>asd</div> -->
          <div v-if="walletAddress" class="flex  items-center text-sm px-[12px]  h-[30px]  
          cursor-pointer rounded-full bg-base-100">
            <div class=" w-[12px] h-[12px] rounded-[50%] bg-lv mr-[12px]"></div>
            
            <div  class="pt-[1px]">
              {{ t('token.ConnectedToWeb3') }}
              <RouterLink :to="{
                path: `/${current}/account/${walletAddress}`
              }">[
                <span class="font-bold textjb-lv">
                  {{ encryptString(walletAddress) }}
                </span>]
              </RouterLink>
            </div>
          </div>
          <div v-else class="flex  items-center  px-[12px] h-[30px]  
          cursor-pointer rounded-full bg-base-100" @click="connectWalletAlert">
            <div class=" w-[12px] h-[12px] rounded-[50%] !bg-[#0A0B0F] mr-[12px]"></div>
            <div class="pt-[1px]">{{ t('token.ConnectToWeb3') }}</div>
          </div>
        </div>
      </component>
    </keep-alive>
  </div>
  <div class="modal"></div>
  <popUp v-model="linkWallet" title="Connect a Wallet">
    <div class="mt-[20px] text-[#ffffff]">

      <div class="bg-lv p-[1px] rounded-[6px]">
        <div class="flex rounded-[6px] bg-[#131315] justify-between items-center px-[12px] text-[14px]  
  
          h-[50px] cursor-pointer  
         lg:text-[16px]" @click="linkWalletClick">
          <div>MetaMask</div>
          <img src="@/assets/images/svg/metamask.svg" alt="" class="w-[25px] h-[25px]" />
        </div>
      </div>
    </div>
  </popUp>
</template>
