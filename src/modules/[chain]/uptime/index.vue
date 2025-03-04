<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { fromHex, toBase64 } from '@cosmjs/encoding';
import {
  useFormatter,
  useStakingStore,
  useBaseStore,
  useBlockchain,
} from '@/stores';
import UptimeBar from '@/components/UptimeBar.vue';
import tabModule from '@/components/tabModule/index.vue';
import type { Commit, SlashingParam, SigningInfo } from '@/types';
import {
  consensusPubkeyToHexAddress,
  pubKeyToValcons,
  valconsToBase64,
} from '@/libs';
import { useI18n } from 'vue-i18n';

const props = defineProps(['chain']);
const { t } = useI18n();

const stakingStore = useStakingStore();
const format = useFormatter();
const baseStore = useBaseStore();
const chainStore = useBlockchain();
const latest = ref(0);
const commits = ref([] as Commit[]);
const keyword = ref('');
const live = ref(true);
const slashingParam = ref({} as SlashingParam);

const signingInfo = ref({} as Record<string, SigningInfo>);

// filter validators by keywords
const validators = computed(() => {
  if (keyword)
    return stakingStore.validators.filter(
      (x) => x.description.moniker.indexOf(keyword.value) > -1
    );
  return stakingStore.validators;
});

const list = computed(() => {
  if (chainStore.isConsumerChain) {
    stakingStore.loadKeyRotationFromLocalstorage(
      baseStore.latest?.block?.header?.chain_id
    );

    const window = Number(slashingParam.value.signed_blocks_window || 0);
    const vset = validators.value.map((v) => {
      const hexAddress = stakingStore.findRotatedHexAddress(v.consensus_pubkey);
      const signing = signingInfo.value[hexAddress];
      return {
        v,
        signing,
        hex: toBase64(fromHex(hexAddress)),
        uptime:
          signing && window > 0
            ? (window - Number(signing.missed_blocks_counter)) / window
            : undefined,
      };
    });
    return vset;
  } else {
    const window = Number(slashingParam.value.signed_blocks_window || 0);
    const vset = validators.value.map((v) => {
      const signing =
        signingInfo.value[consensusPubkeyToHexAddress(v.consensus_pubkey)];
      return {
        v,
        signing,
        hex: toBase64(fromHex(consensusPubkeyToHexAddress(v.consensus_pubkey))),
        uptime:
          signing && window > 0
            ? (window - Number(signing.missed_blocks_counter)) / window
            : undefined,
      };
    });
    return vset;
  }
});

onMounted(() => {
  live.value = true;
  baseStore.fetchLatest().then((l) => {
    let b = l;
    if (
      baseStore.recents?.findIndex((x) => x.block_id.hash === l.block_id.hash) >
      -1
    ) {
      b = baseStore.recents?.at(0) || l;
    }
    latest.value = Number(b.block.header.height);
    commits.value.unshift(b.block.last_commit);
    const height = Number(b.block.header?.height || 0);
    if (height > 50) {
      // constructs sequence for loading blocks
      let promise = Promise.resolve();
      for (let i = height - 1; i > height - 50; i -= 1) {
        promise = promise.then(
          () =>
            new Promise((resolve, reject) => {
              if (live.value && commits2.value.length < 50) {
                // continue only if the page is living
                baseStore.fetchBlock(i).then((x) => {
                  commits.value.unshift(x.block.last_commit);
                  resolve();
                });
              }
            })
        );
      }
    }
  });

  updateTotalSigningInfo();

  chainStore.rpc.getSlashingParams().then((x) => {
    slashingParam.value = x.params;
  });
});

function updateTotalSigningInfo() {
  chainStore.rpc.getSlashingSigningInfos().then((x) => {
    x.info?.forEach((i) => {
      signingInfo.value[valconsToBase64(i.address)] = i;
    });
  });
}

const tabList = computed(() => {
  return [
    {
      label: t('uptime.overall'),
      value: '3',
    },
    {
      label: t('module.blocks'),
      value: '2',
    },
    {
      label: t('uptime.customize'),
      value: '1',
      routerPath:`/${props.chain}/uptime/customize`
    }
  ]
});
const commits2 = computed(() => {
  const la = baseStore.recents.map((b) => b.block.last_commit);
  // trigger update total signing info
  if (la.length > 1 && Number(la.at(la.length - 1)?.height || 0) % 10 === 7) {
    updateTotalSigningInfo();
  }
  const all = [...commits.value, ...la];
  return all.length > 50 ? all.slice(all.length - 50) : all;
});

onUnmounted(() => {
  live.value = false;
});

//const tab = ref(window.location.hash.search("block")>-1?"2":"3")
const tab = ref('2');
function changeTab(v: string) {
  tab.value = v;
}

function fetchAllKeyRotation() {
  stakingStore.fetchAllKeyRotation(baseStore.latest?.block?.header?.chain_id);
}
</script>

<template>
  <div class=" bg_jb text-[#ffffff] rounded-[16px]">
    <div
      class="flex flex-col md:!flex-row md:!items-center items-start justify-between min-h-20 py-[8px] border-b-[1px] border-[#ffffff]/[0.16] px-7 w-full"
    >
      <!-- <div class="flex items-center text-[#ffffff]">
        <a
          class="font-[OrbitronMedium] tracking-[.5px] md:!h-10 h-8 md:！px-5 px-2 text-[16px] leading-8 md:!leading-10 cursor-pointer uppercase"
          :class="{ 'bg-lv font-[OrbitronBold] text-[#181A20] rounded-full': tab === '3' }"
          @click="changeTab('3')"
          >{{ $t('uptime.overall') }}</a
        >
        <a
          class="font-[OrbitronMedium] tracking-[.5px] md:!h-10 h-8 md:！px-5 px-2  text-[16px] leading-8 md:!leading-10 cursor-pointer uppercase"
          :class="{ 'bg-lv font-[OrbitronBold] text-[#181A20] rounded-full': tab === '2' }"
          @click="changeTab('2')"
          >{{ $t('module.blocks') }}</a
        >
        <RouterLink :to="`/${chain}/uptime/customize`">
          <a
            class=" font-[Orbit ronMedium] tracking-[.5px] md:!h-10 h-8 md:!px-5 px-2  text-[16px] leading-8 md:!leading-10 cursor-pointer uppercase"
            >{{ $t('uptime.customize') }}</a
          >
        </RouterLink>
      </div> -->
      
    <tabModule :list="tabList" v-model:tab="tab"></tabModule>

      <div class="flex items-center gap-x-4 mt-2 md:!mt-[0]">
        <div class="flex items-center px-4 rounded-full inputbg h-11 bg-[#0A0B0F] border-[#ffffff]/[0.16]">
          <img src="" alt="" />
          <input
            type="text"
            v-model="keyword"
            placeholder="Keywords to filter validators"
            class="flex-1 !text-[13px] text-white  bg-transparent input rounded-full !h-full"
          />
        </div>

        <button v-if="chainStore.isConsumerChain"
          class="btn btn-sm h-10 btn-primary !text-[#ffffff]"
          @click="fetchAllKeyRotation"
        >
          Load Rotated Keys
        </button>
      </div>
    </div>
    <div class=" ">
      
      <div
        v-if="
          chainStore.isConsumerChain &&
          Object.keys(stakingStore.keyRotation).length === 0
        "
        class="my-4 alert alert-warning px-7 pt-5"
      >
        Note: Please load rotated keys to see the correct uptime
      </div>
      <!-- grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-4 mt-4 -->
      <div
        class="flex flex-row flex-wrap justify-center mt-4 gap-x-4 px-7 pt-5"
        :class="tab === '2' ? '' : 'hidden'"
      >
        <div v-for="({ v, signing, hex }, i) in list" :key="i">
          <div class="flex items-center justify-between py-0 w-[298px]">
            <label class="text-sm truncate">
              <span class="ml-1  dark:text-white text-[#ffffff]"
                >{{ i + 1 }}.{{ v.description.moniker }}</span
              >
            </label>
            <div
              v-if="Number(signing?.missed_blocks_counter || 0) > 10"
              class="font-bold text-red-500 bg-transparent border-0 badge badge-sm"
            >
              {{ signing?.missed_blocks_counter }}
            </div>
            <div
              v-else
              class="font-bold text-green-600 bg-transparent border-0 badge badge-sm"
            >
              {{ signing?.missed_blocks_counter }}
            </div>
          </div>
          <UptimeBar :blocks="commits2" :validator="hex" />
        </div>
      </div>

      <div :class="tab === '3' ? '' : 'hidden'" class="overflow-x-auto">
        <table class="table w-full table-compact">
          <thead class="capitalize">
            <tr class="text-[#ffffff]/[.54] text-[12px]">
              <th class="font-[400]">{{ $t('account.validator') }}</th>
              <th class="font-[400]">{{ $t('module.uptime') }}</th>
              <th class="font-[400]">{{ $t('uptime.last_jailed_time') }}</th>
              <th class="font-[400]">{{ $t('uptime.signed_precommits') }}</th>
              <th class="font-[400]">{{ $t('uptime.start_height') }}</th>
              <th class="font-[400]">{{ $t('uptime.tombstoned') }}</th>
            </tr>
          </thead>

          <tr v-for="({ v, signing, uptime }, i) in list" class="border-b-[1px] border-[#FFFFFF]/[.16] border-dashed text-[#ffffff]/[.87] text-[14px]">
            <td>
              <div class="max-w-sm truncate ">
                {{ i + 1 }}. {{ v.description.moniker }}
              </div>
            </td>
            <td class="">
              <span
                v-if="signing"
                class=""
                :class="
                  uptime && uptime > 0.95 ? 'text-green-500' : 'text-red-500'
                "
              >
                <div
                  class="tooltip"
                  :data-tip="`${signing.missed_blocks_counter} missing blocks`"
                >
                  {{ format.percent(uptime) }}
                </div>
              </span>
            </td>
            <td>
              <span v-if="signing && !signing.jailed_until.startsWith('1970')">
                <div
                  class="tooltip"
                  :data-tip="format.toDay(signing?.jailed_until, 'long')"
                >
                  <span>{{ format.toDay(signing?.jailed_until, 'from') }}</span>
                </div>
              </span>
            </td>
            <td class="text-xs">
              <span
                v-if="signing && signing.jailed_until.startsWith('1970')"
                class="text-right"
                >{{
                  format.percent(
                    Number(signing.index_offset) /
                      (latest - Number(signing.start_height))
                  )
                }}</span
              >
              {{ signing?.index_offset }}
            </td>
            <td class="">{{ signing?.start_height }}</td>
            <td class="capitalize">{{ signing?.tombstoned }}</td>
          </tr>
          <tfoot>
            <tr>
              <td colspan="6" class="text-center text-[#ffffff] font-[400]">
                {{ $t('uptime.minimum_uptime') }}:
                <span
                  class="lowercase tooltip"
                  :data-tip="`Window size: ${slashingParam.signed_blocks_window}`"
                  ><span class="ml-2 rounded-full bg-lv btn-xs text-[#181A20]">{{
                    format.percent(slashingParam.min_signed_per_window)
                  }}</span>
                </span>
              </td>
              <td colspan="8"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="h-6"></div>
    </div>
  </div>
</template>
<route>
  {
    meta: {
      i18n: 'uptime',
      order: 3
    }
  }
</route>

<style lang="scss">
//.v-field--variant-outlined .v-field__outline__notch {
//  border-width: 0 !important;
//}
//.dark {
//  .rounded-full {
//    background: linear-gradient(78deg, #6e41ff 0%, #9547ff 100%);
//  }
//  .inputbg {
//    background-color: #16181f;
//    border-radius: var(--rounded-btn, 0.5rem);
//    border-radius: 2.75rem;
//  }
//  .bg-base-100 {
//    background-color: #252732;
//  }
//  .bg-base-200 {
//    background-color: rgba(111, 65, 255, 0.1);
//  }
//  th {
//    font-weight: 400;
//  }
//  tr {
//    border-color: rgba(255, 255, 255, 0.1);
//
//    font-weight: 400;
//  }
//  th,
//  td {
//    padding: 1.25rem 1.25rem 1.25rem 0;
//    font-size: 1rem;
//    color: rgba(255, 255, 255, 0.6);
//  }
//}
//th,
//td {
//  padding: 1.25rem 1.25rem 1.25rem 0;
//  font-size: 1rem;
//}
//.btn-error {
//  background-color: transparent;
//  font-size: 1rem;
//  color: rgba(111, 65, 255, 1);
//}
</style>
