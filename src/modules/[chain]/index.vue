<script lang="ts" setup>
import MdEditor from 'md-editor-v3';
import PriceMarketChart from '@/components/charts/PriceMarketChart.vue';
import ApexCharts from 'vue3-apexcharts';
import { Icon } from '@iconify/vue';
import {
  useBlockchain,
  useFormatter,
  useTxDialog,
  useWalletStore,
  useStakingStore,
  useParamStore,
  useBaseStore
} from '@/stores';
import { formatUnits } from 'ethers';
import { onMounted, ref, nextTick, defineProps } from 'vue';
import { useIndexModule, colorMap } from './indexStore';
import { computed } from '@vue/reactivity';
import { formatNumberWithCommas } from "@/libs/utils"
import CardStatisticsVertical from '@/components/CardStatisticsVertical.vue';
import TotalCommit from '@/components/TotalCommit.vue';
import ProposalListItem from '@/components/ProposalListItem.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue';
import HomeStaking from '@/components/HomeStaking.vue';
import RecentTransaction from '@/components/RecentTransaction/index.vue';

const props = defineProps(['chain']);

const base = useBaseStore();
const blockchain = useBlockchain();
const store = useIndexModule();
const walletStore = useWalletStore();
const format = useFormatter();
const dialog = useTxDialog();
const stakingStore = useStakingStore();
const paramStore = useParamStore();


const atStart = ref(true);
const atEnd = ref(false);
const scrollContainer = ref<HTMLElement | null>(null)
const coinInfo = computed(() => {
  return store.coinInfo;
});

const series = ref([{
  name: '',
  data: [10, 10, 10, 10, 10, 10, 10, 10]
}])

const scrollToEnd = (type:boolean = false) => {
  if (scrollContainer.value) {
      scrollContainer.value?.scrollTo({
        left: type?0:scrollContainer.value?.scrollWidth,
        behavior: 'smooth' // 平滑滚动效果
      })
    }
}
function onScroll() {
   const el = scrollContainer.value;
  if (!el) return;

  atStart.value = el.scrollLeft === 0;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1; // 减1防止误差
}
const pricesList = ref<any[]>([])

//时间格式化
function formatDate(date: any): string {
  const pastDate = new Date(date)
  const day = pastDate.getDate()
  let currentMonth = pastDate.toLocaleDateString('en-US', { month: 'long' });
  return `${day} ${currentMonth}`
}
function isMilliseconds(timestamp: any) {
  // 假设时间戳是以毫秒为单位的
  // 如果时间戳大于当前时间（以毫秒计），则它是毫秒
  return timestamp > Date.now();
}
const chartOptions = computed(() => {

  function getPastDays(days: number) {
    let arr: any[] = []
    if (pricesList.value.length) {
      arr = pricesList.value
    } else {
      for (let i = 0; i < days; i++) {
        const today = new Date();
        // const pastDate = new Date(today.setDate(today.getDate() - 1));
        const pastDate = new Date(today.setDate(today.getDate() - i));
        arr.unshift(formatDate(pastDate))
      }
    }



    return arr;
  }

  return {
    chart: {
      toolbar: {
        show: false,
        type: 'area'
      },
    },
    stroke: {
      curve: 'smooth'
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      enabled: true, // 启用提示框
      theme: 'dark',  // 设置提示框主题
      style: {
        color: '#ffffff'  // 设置文字颜色
      },
      background: '#333', // 设置背景颜色
      y: {
        title: {

        }
      }
    },
    legend: {
      show: false
    },
    grid: {
      show: false, // 关闭网格线（横线和纵线）
    },
    // markers: {
    //   size: 0,
    // },
    title: {
      text: '',
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: '400'
      }
    },
    //colors: ['linear-gradient(180deg, #5AC27C 0%, #B2E235 100%)'],  // 设置颜色border: 3px solid;
    colors: ['rgba(108, 201, 109, 1)'],
    // fill: {
    //   type: 'gradient',
    //   gradient: {
    //     shade: 'light', // 渐变的色调
    //   type: 'horizontal', // 渐变的方向（可以是 'vertical', 'horizontal'）
    //   shadeIntensity: 0.5, // 渐变的强度
    //   gradientToColors: ['#5AC27C'], // 渐变终点的颜色
    //   opacityFrom: 1, // 渐变开始的透明度
    //   opacityTo: 0.5, // 渐变结束的透明度
    //   stops: [0, 100] // 渐变的起止点（从0%到100%）
    //     // shadeIntensity: 1,
    //     // inverseColors: false,
    //     // opacityFrom: 0.5,
    //     // opacityTo: 0,
    //     // stops: [0, 0, 0]
    //   },
    // },
    yaxis: {
      // show:false,
      title: {
        text: ''
      },
    },
    xaxis: {
      //type: 'datetime',
      show: false,
      categories: getPastDays(7)
      //categories: ['21 May', '24 May', '27May','21 May', '24 May', '27May','21 May', '24 May', '27May','21 May']
    },
  }
})

onMounted(() => {
  store.loadDashboard();
  walletStore.loadMyAsset();
  paramStore.handleAbciInfo();
  // if(!(coinInfo.value && coinInfo.value.name)) {
  // }
});
const ticker = computed(() => store.coinInfo.tickers[store.tickerIndex]);

const blocksList = computed(() => {
  return base.recents.slice(-6)
  // return base.recents.filter( (item, index) => {
  //   if(index < 4) return item
  // });
});
const latestList = computed(() => {
  return base.getLatestList.slice(-8).sort((a, b) => {
        return Number(a.height) - Number(b.height);
      })
  // return base.recents.filter( (item, index) => {
  //   if(index < 4) return item
  // });
});

const currName = ref('');
blockchain.$subscribe((m, s) => {
  if (s.chainName !== currName.value) {
    currName.value = s.chainName;
    store.loadDashboard();
    walletStore.loadMyAsset();
    paramStore.handleAbciInfo();
  }
});
function shortName(name: string, id: string) {
  return name.toLowerCase().startsWith('ibc/') ||
    name.toLowerCase().startsWith('0x')
    ? id
    : name;
}


interface Item {
  subtitle: string;
  value: string;
  // 其他属性...
}

//固定数值
const stats = computed(() => {
  return store.stats.map(itme => {
    if (itme.title === "Supply") {
      return {
        ...itme,
        stats: "21,000,000"
      }
    }
    return itme
  })
})
const list = computed(() => {
  function updateAppVersion(items: any[]): Item[] | undefined {
    if (items && items.length) {
      return items
        .filter((item) => {
          return (
            item.subtitle !== 'build_deps' &&
            item.subtitle !== 'git_commit' &&
            item.subtitle !== 'go_version' &&
            item.subtitle !== 'build_tags' &&
            item.subtitle !== 'cosmos_sdk_version'
          );
        })
        .map((item: Item) => {
          if (item.subtitle === 'name' || item.subtitle === 'app_name') {
            return {
              ...item,
              value: 'novai',
            };
          }
          return item;
        });
    }
    return [];
  }
  return updateAppVersion(paramStore.appVersion?.items);
});
const comLinks = [
  {
    name: 'Website',
    icon: 'mdi-web',
    href: store.homepage,
  },
  {
    name: 'Twitter',
    icon: 'mdi-twitter',
    href: store.twitter,
  },
  {
    name: 'Telegram',
    icon: 'mdi-telegram',
    href: store.telegram,
  },
  {
    name: 'Github',
    icon: 'mdi-github',
    href: store.github,
  },
];

// wallet box
const change = computed(() => {
  const token = walletStore.balanceOfStakingToken;
  return token ? format.priceChanges(token.denom) : 0;
});
const color = computed(() => {
  switch (true) {
    case change.value > 0:
      return 'text-green-600';
    case change.value === 0:
      return 'text-grey-500';
    case change.value < 0:
      return 'text-red-600';
  }
});

function updateState() {
  walletStore.loadMyAsset();
}

function trustColor(v: string) {
  return `text-${colorMap(v)}`;
}

const quantity = ref(100);
const qty = computed({
  get: () => {
    return parseFloat(quantity.value.toFixed(6));
  },
  set: (val) => {
    quantity.value = val;
  },
});
const amount = computed({
  get: () => {
    return quantity.value * ticker.value.converted_last.usd || 0;
  },
  set: (val) => {
    quantity.value = val / ticker.value.converted_last.usd || 0;
  },
});

function getAmount(value: any, num: number = 18) {
  if (value) return Number(Number(formatUnits(value, num)).toFixed(6));
  return ``;
}
const getTxs = function (item: any) {
  if (item.tx_response && item.tx_response.tx.body.messages.length) {
      let messages: any[] = item.tx_response.tx.body.messages; 
      let obj = messages[0].data ? messages[0].data : {};
      return obj.value ? getAmount(obj.value) : 0
      // obj.value = obj.value?formatter.format(Number(obj.value)):''

    }
  return 0
}


//获取7日价格
const getApTokenPrices = function () {
  blockchain.rpc?.getTokenPrices().then(res => {
    let { data, code } = res
    if (code == 0) {
      let listTime: any[] = []
      let arr = data.map((item: any) => {
        listTime.push(formatDate(new Date(isMilliseconds(item.time) ? item.time : item.time * 1000)))
        return Number(formatNumberWithCommas(item.price, 2, ''))
      })
      pricesList.value = listTime

      if (data.length < 7) {
        let minObj = data.reduce((min: any, obj: any) => obj.time < min.time ? obj : min);
        let inx = 0
        for (let i = listTime.length; i < 7; i++) {
          inx += 1
          const today = new Date(isMilliseconds(minObj.time) ? minObj.time : minObj.time * 1000);
          const pastDate = new Date(today.setDate(today.getDate() - inx));
          pricesList.value.unshift(formatDate(pastDate))
        }

      }

      while (arr.length < 7) {
        arr.unshift(0)
      }
      //console.log(arr, 'arr', arr.length)
      series.value = [
        {
          name: "",
          data: arr
        }
      ]
    }
  })
}
getApTokenPrices()
</script>

<template>
  <div>
    <TotalCommit :chain="props.chain" />

    <div class="rounded-[16px] mb-[12px] mb:[24px] border border-[#FFFFFF]/[.16] bg-[#131315]/[.8]" style="">

      <div class="text-[#ffffff]">
        <div class="  border-b border-[#FFFFFF]/[.16]
           md:pl-[24px] md:pt-[16px] md:pb-[13px] 
           pl-[12px] pt-[8px] pb-[8px]
          text-[14px] 
          font-[OrbitronMedium] tracking-[.5px] ">
          <img class="w-[20px] h-[20px] inline-block" src="../../assets/images/Dashboard.svg" alt="">
          {{ $t('module.dashboard') }}
        </div>

        <div class="flex justify-between flex-wrap flex-col md:!flex-row lg: px-[24px] pb-[32px]">
          <div v-for="(item, key) in stats" :key="key">
            <CardStatisticsVertical v-bind="item">
              <template v-if="key == stats.length - 1">
                <img class="w-[18px] ml-[4px] mr-[4px]" src="../../assets/images/novaiIcon.svg"></img>
                <span class="text-[#913FFB] text-[16px]">NOVAI</span>
              </template>
            </CardStatisticsVertical>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-[10px] rounded-[16px] mb-[12px] mb:[24px] border border-[#FFFFFF]/[.16] bg-[#131315]/[.8]">
       <div class=" ">

        <div class="text-[#ffffff]  flex flex-col">
          <div class="border-b border-[#FFFFFF]/[.16]
            md:pt-[16px] md:pb-[13px] 
            pl-[12px] pt-[8px] pb-[8px]
          text-[14px] 
          font-[OrbitronMedium] tracking-[.5px]">
            <img class="w-[18px] h-[18px] inline-block" src="../../assets/images/Blocks.svg" alt="">
            {{ $t('module.blocks') }}
          </div>
          <!-- -->
          <div class="flex-1 px-[24px] py-[20px] min-h-[100px]">
            <div class=" items-center relative">
            <div @click="scrollToEnd(true)" class="hidden md:!block  w-[24px] h-[24px] translate-y-[50%] absolute top-50% left-[-24px]
             z-10 rounded-full bg-[#3b3b3b96]
             text-center leading-[27px]"><</div>
            <div @click="scrollToEnd(false)" class="hidden md:!block w-[24px] h-[24px] translate-y-[50%] absolute top-50% right-[-24px] 
            z-10 rounded-full bg-[#3b3b3b96]
             text-center leading-[27px]">></div>
            <div @scroll="onScroll" ref="scrollContainer" class="w-[100%] overflow-x-auto w-auto whitespace-nowrap md:()   ">
            <div :class="`w-[48%] md:!w-[22%] ${key == 7?'mr-[0%]':'mr-[7%] '} ${key == 3 ||key ==7?'md:!mr-[0%]':'md:!mr-[4%]'} inline-block`"
             v-for="(item, key) in latestList" :key="key">
              <RouterLink 
              v-if="item?.block.header?.height"
              class=" text-[#999999] text-sm font-medium text-left"
              :to="`/${chain}/block/${item.block.header.height}`">
              <div class="  h-[100%]">
                <div class="">
                  <div class="" :class="[(key + 1) % 3 == 0 ? '' : (key + 1) % 2 == 0 ? 'b' : 'c']">
                    <span class="text-[#ffffff] text-[18px] md:text-[20px] font-[OrbitronMedium] tracking-[.5px]">
                      #{{ item.block.header.height }}
                    </span>
                  </div>
                  <div class="text-[12px] flex justify-between text-center">
                    <span class="text-[12px] font-[400] italic">
                      {{ format.toDay(item.block?.header?.time, 'from') }}
                    </span>
                    <span>
                      {{ item.block?.data?.txs.length }} Transactions
                    </span>
                  </div>
                  <div class="text-[12px] flex justify-between text-center">
                    <span>
                      Reward {{ item.block?.data?.txs.length * 0.002 }}
                      <!-- {{ format.validator(item.block?.header?.proposer_address) }} -->
                    </span>
                    <span>
                      {{ getTxs(item) }} novai
                    </span>
                  </div>
                </div>
              </div>

            </RouterLink>
            </div>
            
            </div>
          </div>
          
          </div>
          <!-- <div class="flex flex-1  flex-wrap  px-[24px]  grid grid-cols-1  md:!grid-cols-2 lg:!grid-cols-3">
            <RouterLink v-for="(item, key) in blocksList" :key="key"
              class="py-[5px] md:py-[10px] w-[100%] md:w-[50%] lg:w-[33.33%] text-[#999999] text-sm font-medium text-center lg:!text-left"
              :to="`/${chain}/block/${item.block.header.height}`">
              <div class="flex items-center justify-center  h-[100%]">
                <div class="text-center">
                  <div class="" :class="[(key + 1) % 3 == 0 ? '' : (key + 1) % 2 == 0 ? 'b' : 'c']">
                    <span class="text-[#ffffff] text-[18px] md:text-[20px] font-[OrbitronMedium] tracking-[.5px]">
                      {{ item.block.header.height }}
                    </span>
                    <span class="text-[12px] font-[400] italic">
                      ({{ format.toDay(item.block?.header?.time, 'from') }})
                    </span>
                  </div>
                  <div class="text-[12px]  text-center">
                    <span>
                      {{ format.validator(item.block?.header?.proposer_address) }}
                    </span>
                    <span>
                      {{ item.block?.data?.txs.length }} txs
                    </span>
                  </div>
                </div>
              </div>

            </RouterLink> 
          </div>-->
        </div>
      </div>
    </div>

    <div class="grid mt-[10px] lg:!flex-row grid-cols-1 lg:!grid-cols-3 gap-[10px]">
      <div class="lg:!col-span-2 min-h-[100%]">
        <RecentTransaction :chain="props.chain" />
      </div>
     
      <div class="lg:!col-span-1  text-[#ffffff] border border-[#FFFFFF]/[.16]
      bg-[#131315]/[.8] rounded-[16px]">
        <div class="border-b border-[#FFFFFF]/[.16]
           md:pl-[24px] md:pt-[16px] md:pb-[13px] 
           pl-[12px] pt-[8px] pb-[8px]
          text-[14px] 
          font-[OrbitronMedium] tracking-[.5px]">7 days of price records</div>
        <!-- <div id="chart" class="" style="height: 100%; 
        min-height: 166px max-height: 310px;">
          <ApexCharts type="area" height="100%" :options="chartOptions" :series="series"></ApexCharts>
        </div> -->
        <div style="height: 100%; min-height: 166px; max-height: 290px;">
<div id="chart" style="height: 100%;">
          <ApexCharts type="area" height="100%" :options="chartOptions" :series="series"></ApexCharts>
        </div>
        </div>
      </div>
    </div>



    <!-- <div class="mt-[10px] border-[#FFFFFF]/[.16]
      bg-[#131315]/[.8] rounded-[16px]">

      <RecentTransaction :chain="props.chain" />
    </div> -->


  </div>
</template>

<route>
  {
    meta: {
      i18n: 'dashboard',
      order: 1,
    }
  }
</route>
