<script lang="ts" setup>
import { Decimals, nameItem } from './valueItem';
import {
  addresses,
  getAmount,
  getToUpperCase,
  getFormatUnits,
  GetContract,
} from '@/libs/web3/index';
const props = defineProps(['value', 'type', 'chain']);
// niswapV2Router01,novaichain,ChainConnect

//判断数据
function JudgingData(str: string, str1: string): boolean {
  return getToUpperCase(str) == getToUpperCase(str1);
}

//通过合约获取 decimals精度
function getDecimals(address: string, amount: any) {
  // return 'asda'
  switch (address) {
    case addresses.UniswapV2Router01:
      return; // amount.toNumber() / 10 ** 18
    case addresses.ChainConnect:
      return; //amount.toNumber() / 10 ** 18 // 18位小数
    case addresses.btcAddress:
      return; //amount.toNumber() / 10 ** 8 // 8位小数
    case addresses.nftAddress:
      return; //amount.toNumber() // 无小数
    default:
      //所有eth链下的合约处理
      ethDecimals(address, amount).then((res) => {
        console.log(res, '');
      });
      return '';
  }
  return '';
}

// eth链处理
async function ethDecimals(address: string, amount: any): Promise<any> {
  // let contract = GetContract(address);

  try {
    let decimalsTo = await GetContract(address).decimals();
    const normalNumber = Number(amount);
    console.log(
      getFormatUnits(
        normalNumber.toLocaleString().split(',').join(''),
        decimalsTo
      ).toFixed(6)
    );
  } catch (error) {
    console.log(error);
  }
}
</script>
<template>
  <div>
    <template v-if="type === 'value'">
      <template v-if="value.contractData.type"
        >
        <template
          v-if="JudgingData(value.contractData.value.to, addresses.Bonstake)"
        >
          <Decimals
            :decimals="value.contractData.value.decimals"
            :amount="value.contractData.value.data.amount"
          ></Decimals>
        </template>
        <template
          v-else-if="
            JudgingData(
              value.contractData.value.to,
              addresses.UniswapV2Router01
            )
            || JudgingData(
              value.contractData.value.to,
              addresses.nAI_UniSwap
            )
          "
        >
          <template v-if="value.contractData.value.data.path">
            <Decimals
              :address="value.contractData.value.data.path[0]"
              :amount="
                value.contractData.value.data.amount0In ||
                value.contractData.value.data.amount1In
              "
            >
            </Decimals>
            <br />
            <Decimals
              :address="value.contractData.value.data.path[1]"
              :amount="
                value.contractData.value.data.amount0Out ||
                value.contractData.value.data.amount1Out
              "
            ></Decimals>
          </template>
          <template v-else>{{ value.contractData.value.name }}</template>
        </template>
 

        <template
          v-else-if="
            JudgingData(value.contractData.value.to, addresses.ChainConnect)
          "
        >
          <Decimals
            :address="value.contractData.value.data.tokenContractAddress"
            :amount="value.contractData.value.data.amount"
          ></Decimals>
        </template>

        <template
          v-else-if="
            value.contractData.value &&
            value.contractData?.value?.eventName == 'ERC1155'
          "
        >
          {{
            value.contractData?.value?.data.to ==
            '0x0000000000000000000000000000000000000000'
              ? $t('account.Burn')
              : $t('account.Transfer')
          }}
        </template>
        <template
          v-else-if="
            value.contractData.value &&
            typeof value.contractData.value.data.value &&
            value.contractData.value.data.value >= 0
          "
        >
          <Decimals
            :address="value.contractData.value.to"
            :amount="value.contractData.value.data.value"
          ></Decimals>
        </template>

        <template v-else>{{ value.contractData.value.name }}</template>
      </template>
      <template v-else-if="value.value >= 0">
        <Decimals :amount="value.value"></Decimals>
      </template>
      <!-- <template v-if="value.contractData.value.to == addresses.ChainConnect"></template>

      <template v-if="value.contractData.value.to == addresses.btcAddress"></template>

      <template v-if="value.contractData.value.to == addresses.nftAddress"></template>

      <template v-if="value.contractData.value.to == addresses.novaichain"></template> -->
    </template>

    <template v-if="type === 'token'">
      <template v-if="value.contractData.type">
        <template
          v-if="
            JudgingData(
              value.contractData.value.to,
              addresses.UniswapV2Router01
            )
          "
        >
          <template v-if="value.contractData.value.data.path">
            <RouterLink
              class="textjb-lv"
              v-if="
                JudgingData(
                  value.contractData.value.data.path[0],
                  addresses.novaichain
                )
              "
              :to="`/${chain}/token/${value.contractData.value.data.path[0]}`"
            >
              nUSDT
            </RouterLink>
            <span v-else>NOVAI</span>
            <br />
            <RouterLink
              v-if="
                JudgingData(
                  value.contractData.value.data.path[1],
                  addresses.novaichain
                )
              "
              class="textjb-lv"
              :to="`/${chain}/token/${value.contractData.value.data.path[1]}`"
            >
              nUSDT
            </RouterLink>
            <span v-else>NOVAI</span>
          </template>
          <template v-else> -- </template>
        </template>
        <template
          v-else-if="
            JudgingData(value.contractData.value.to, addresses.nAI_UniSwap)
          "
        >
          <template v-if="value.contractData.value.data.path">
            <RouterLink
              class="textjb-lv"
              v-if="
                JudgingData(
                  value.contractData.value.data.path[0],
                  addresses.nAI
                )
              "
              :to="`/${chain}/token/${value.contractData.value.data.path[0]}`"
            >
              nAI
            </RouterLink>
            <span v-else>NOVAI</span>
            <br />
            <RouterLink
              v-if="
                JudgingData(
                  value.contractData.value.data.path[1],
                  addresses.nAI
                )
              "
              class="textjb-lv"
              :to="`/${chain}/token/${value.contractData.value.data.path[1]}`"
            >
              nAI
            </RouterLink>
            <span v-else>NOVAI</span>
          </template>
          <template v-else> -- </template>
        </template>
        <template
          v-else-if="
            JudgingData(value.contractData.value.to, addresses.ChainConnect)
          "
        >
          <nameItem
            :address="value.contractData.value.data.tokenContractAddress"
          ></nameItem>
        </template>

        <template v-else-if="value.contractData.value.eventName == 'ERC1155'">
          {{ value.contractData.value.eventName }}
        </template>

        <template v-else-if="value.contractData.value.to">
          <nameItem :address="value.contractData.value.to"></nameItem>
        </template>
        <!--  -->
        <!-- <template v-else-if="value.contractData.value.to == addresses.ChainConnect">
        <RouterLink class="textjb-lv" :to="`/${chain}/token/${value.contractData.value.to}`">
          {{ value.contractData.contractName }}
        </RouterLink>

      </template> -->
      </template>
      <template v-else>
        <nameItem :address="value.to"></nameItem>
      </template>
    </template>
  </div>
</template>
