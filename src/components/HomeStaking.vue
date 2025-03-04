<template>
  <div class="bg-[#ffffff] flex-1  pb-4">
    <div
      class="flex items-center justify-between border-b-[1px] py-[11px] border-[#000000]/[0.1]"
    >
      <div
        class="bg-transparent tabs tabs-boxed text-[#333333] px-[20px] text-[18px] font-bold"
      >
        {{ $t('module.staking') }}
      </div>

      <!-- <div class="text-lg font-semibold">
          {{ list.length }}/{{ staking.params.max_validators }}
        </div> -->
    </div>

    <div class="px-4 pt-3 pb-4 h-[260px]">
      <div class="overflow-auto h-full">
        <table class="table w-full staking-table">
          <thead>
            <tr class="border-none text-[16px] text-[#999999]">
              <th scope="col" class="uppercase font-[400] text-[14px]">
                {{ $t('staking.validator') }}
              </th>
              <th
                scope="col"
                class="text-right uppercase font-[400] text-[14px]"
              >
                {{ $t('staking.voting_power') }}
              </th>
              <th
                scope="col"
                class="text-right uppercase font-[400] text-[14px]"
              >
                {{ $t('staking.commission') }}
              </th>
              <th
                scope="col"
                class="text-center uppercase font-[400] text-[14px]"
              >
                {{ $t('staking.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="({ v, logo }, i) in list"
              :key="v.operator_address"
              class="hover:bg-gray-100 dark:hover:bg-[#384059] border-none"
            >
              <!-- 👉 Validator -->
              <td>
                <div
                  class="flex items-center overflow-hidden"
                  style="max-width: 300px"
                >
                  <div class="relative w-8 h-8 mr-4 rounded-full avatar">
                    <div
                      class="absolute w-8 h-8 bg-gray-400 rounded-full opacity-10"
                    ></div>
                    <div class="w-8 h-8 rounded-full">
                      <img
                        v-if="logo"
                        :src="logo"
                        class="object-contain"
                        @error="
                          (e) => {
                            const identity = v.description?.identity;
                            if (identity) loadAvatar(identity);
                          }
                        "
                      />
                      <Icon
                        v-else
                        class="text-3xl"
                        :icon="`mdi-help-circle-outline`"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col">
                    <span class="overflow-hidden text-sm whitespace-nowrap">
                      <RouterLink
                        :to="{
                          name: 'chain-staking-validator',
                          params: {
                            validator: v.operator_address,
                          },
                        }"
                        class="font-medium text-[#333333] text-[16px]"
                      >
                        {{ v.description?.moniker }}
                      </RouterLink>
                    </span>
                    <span
                      class="text-xs text-[12px] text-[#999999] font-medium"
                      >{{
                        v.description?.website || v.description?.identity || '-'
                      }}</span
                    >
                  </div>
                </div>
              </td>

              <!-- 👉 Voting Power -->
              <td class="text-right">
                <div class="flex flex-col">
                  <div
                    class="text-[16px] whitespace-nowrap text-[#333333] font-medium"
                  >
                    {{
                      format.formatToken(
                        {
                          amount: parseInt(v.tokens).toString(),
                          denom: staking.params.bond_denom,
                        },
                        true,
                        '0,0'
                      )
                    }}
                  </div>
                  <span class="text-[12px] font-medium text-[#999999]">{{
                    format.calculatePercent(
                      v.delegator_shares,
                      staking.totalPower
                    )
                  }}</span>
                </div>
              </td>
              <!-- 👉 commission -->
              <td class="text-[16px] text-center">
                {{
                  format.formatCommissionRate(
                    v.commission?.commission_rates?.rate
                  )
                }}
              </td>
              <!-- 👉 Action -->
              <td class="text-center">
                <div
                  v-if="v.jailed"
                  class="text-[#F10000]/[0.6] font-medium badge border-none bg-transparent"
                >
                  {{ $t('staking.jailed') }}
                </div>
                <div
                  v-else
                  class="text=[#333] font-medium badge border-none bg-transparent"
                  @click="
                    dialog.open('delegate', {
                      validator_address: v.operator_address,
                    })
                  "
                >
                  {{ $t('account.btn_delegate') }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="text-center text-[#4352D4]">
      <router-link to="/novaichain/staking" class="underline">
        {{ $t('MORE') }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  useBaseStore,
  useBlockchain,
  useFormatter,
  useMintStore,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { computed } from '@vue/reactivity';

const staking = useStakingStore();
const format = useFormatter();
const dialog = useTxDialog();

const cache = JSON.parse(localStorage.getItem('avatars') || '{}');
const avatars = ref(cache || {});

const fetchAvatar = (identity: string) => {
  // fetch avatar from keybase
  return new Promise<void>((resolve) => {
    staking
      .keybase(identity)
      .then((d) => {
        if (Array.isArray(d.them) && d.them.length > 0) {
          const uri = String(d.them[0]?.pictures?.primary?.url).replace(
            'https://s3.amazonaws.com/keybase_processed_uploads/',
            ''
          );

          avatars.value[identity] = uri;
          resolve();
        } else throw new Error(`failed to fetch avatar for ${identity}`);
      })
      .catch((error) => {
        // console.error(error); // uncomment this if you want the user to see which avatars failed to load.
        resolve();
      });
  });
};
const loadAvatar = (identity: string) => {
  // fetches avatar from keybase and stores it in localStorage
  fetchAvatar(identity).then(() => {
    localStorage.setItem('avatars', JSON.stringify(avatars.value));
  });
};

const logo = (identity?: string) => {
  if (!identity || !avatars.value[identity]) return '';
  const url = avatars.value[identity] || '';
  return url.startsWith('http')
    ? url
    : `https://s3.amazonaws.com/keybase_processed_uploads/${url}`;
};
const list = computed(() => {
  return staking.validators.map((x, i) => ({
    v: x,
    logo: logo(x.description.identity),
  }));
});
</script>

<style scoped lang="scss"></style>
