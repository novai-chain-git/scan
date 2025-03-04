<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import { get, toCosmosAddress } from '@/libs';
import { getAddress, isAddress } from 'ethers';
import { provider, rbc_url } from '@/libs/web3/index';
import { useBlockchain } from '@/stores';
const vueRouters = useRouter();
const useRoutes = useRoute()
const blockStore = useBlockchain();
let searchModalShow = ref(false);
let searchQuery = ref('');
let errorMessage = ref('');
onMounted(() => { });

function closeSearchModal() {
  searchModalShow.value = false;
  console.log(useRoutes,'useRoutes')
 // vueRouters.go(0)
  // window.location.reload()
}
function openSearchModal() {
  searchModalShow.value = true;
}

function preventClick(event: any) {
  event.preventDefault();
  event.stopPropagation();
}
async function confirm() {
  errorMessage.value = '';
  let key = searchQuery.value;
  if (!key) {
    errorMessage.value = 'Please enter a value!';
    return;
  }
console.log(key,'keykeykey')
  // if (key.match(/^0x.*/)) {
  /* let res = await get(`/evmos/ethermint/ai/find_evmtx/${key}`);
  console.log('res：', res);
  key = res.cosmostx;
} */

  /* if (isAddress(key)) {
    key = toCosmosAddress(key);
  } */
  const height = /^\d+$/;
  const txhash = /^[A-Z\d]{64}$/;
  const ethTxhash = /^0x[A-Za-z\d]{64}$/;
  const addr = /^[a-z\d]+1[a-z\d]{38,58}$/;


  const current = blockStore?.current?.chainName || '';
  const routeParams = vueRouters?.currentRoute?.value;
  if (!Object.values(routeParams?.params).includes(key)) {
    if (height.test(key)) {
      vueRouters.push({ path: `/${current}/block/${key}` });
      setTimeout(() => {
        closeSearchModal();
      }, 600);
    } else if (ethTxhash.test(key) || txhash.test(key)) {
      console.log('ethTxhash.test(key)：', ethTxhash.test(key));
      vueRouters.push({ path: `/${current}/tx/${key}` });
      setTimeout(() => {
        closeSearchModal();
      }, 600);
      //     this.$router.push({ name: 'transaction', params: { chain: c.chain_name, hash: key } })
    } else if (addr.test(key) || isAddress(key)) {
      console.log(isAddress(key),'isAddress(key)')
      //判断验证当前是否是钱包地址还是合约地址
      provider().getCode(key).then((code: any) => {
        console.log(code.length,'code.length')
        if (code.length > 2) {
          vueRouters.push({ path: `/${current}/token/${key}` })
        } else {
           vueRouters.push({ path: `/${current}/account/${key}` });
        }
        setTimeout(() => {
          closeSearchModal();
        }, 600);
      })
      // vueRouters.push({ path: `/${current}/account/${key}` });
      //   setTimeout(() => {
      //     closeSearchModal();
      //   }, 1000);
      //console.log(key,'key')
      //vueRouters.push({ path: `/${current}/account/${key}` });

    } else {
      errorMessage.value = 'The input not recognized';
    }
  }
}
</script>
<template>
  <div class="">
    <!--    <button-->
    <!--      class="btn btn-ghost btn-circle btn-sm mx-1"-->
    <!--      @click="openSearchModal"-->
    <!--    >-->
    <!--      <Icon-->
    <!--        icon="mdi:magnify"-->
    <!--        class="text-2xl text-gray-500 dark:text-gray-400"-->
    <!--      />-->
    <!--    </button>-->

    <!-- modal -->
    <div class="cursor-pointer w-full  !pointer-events-auto !opacity-100 !visible"
      @click="closeSearchModal">
      <div class="relative cursor-default" @click="(event) => preventClick(event)">
        <!-- header -->
        <div class=" pb-[17px] md:pb-[27px]">
          <div class=" font-[600] font-[OrbitronMedium] tracking-[.5px] text-center">
            <span class=" text-[#ffffff] text-[28px] md:text-[48px] textjb-lv" >{{$t("search.title")}}</span>
          </div>
        </div>
        <!-- body -->
        <div class="flex justify-center">
          <div class="relative w-[90%] md:w-[500px]">
            <div class="flex pl-[25px] py-[6px] pr-[6px] !bg-[#0A0B0F] !pr-[4px] w-full !input-bordered rounded-full items-center">
              
              <input class="flex-1 text-[#ffffff] text-[13px] !bg-[#0A0B0F]" v-model="searchQuery" @keyup.enter="confirm"
                placeholder="Height/Token/Transaction/Account Address" />
              <button @click="confirm"
                class="w-[36px] h-[36px] btn-primary bg-lv rounded-full flex justify-center items-center"> 
                <img class="h-[19px] md:h-[19px]" src="../../assets/images/pages/Layer.svg" />
              </button>
            </div>
            <div class="pt-2 text-right text-sm text-error absolute left-0 top-[100%] right-0" v-show="errorMessage">
              {{ errorMessage }}
            </div>
          </div>
        </div>
        <!-- foot -->
        <!--        <div class="mt-6">-->
        <!--          <button class="w-full btn btn-primary" @click="confirm">-->
        <!--            Confirm-->
        <!--          </button>-->
        <!--        </div>-->
      </div>
    </div>
  </div>
</template>
