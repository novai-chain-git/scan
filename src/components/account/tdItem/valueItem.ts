import { defineComponent, defineAsyncComponent, ref, h } from 'vue';
import {
  addresses,
  getAmount,
  getToUpperCase,
  getFormatUnits,
  GetContract,
  addressesName,
  getNormalNumber,
  provider,
} from '@/libs/web3/index';
//通过合约获取 合约名称,
async function getName(address: string) {
  // return addressesName[address].name
  // if(addressesName?[address]) {
  //   return addressesName[address as keyof typeof addressesName].name;
  // }
  const addressData = addressesName[address as keyof typeof addressesName];
  if (addressData) {
    return addressData.name;
  }

  return await ethName(address);
  //  switch (address) {
  //    case addresses.Coinstake:
  //      return addressesName[address].name
  //   //  case addresses.Bonstake:
  //   //    return addressesName[address].name
  //   //  case addresses.Bank:
  //   //   return addressesName[address].name
  //   //  case addresses.ETF:
  //   //    return addressesName[address].name
  //    default:
  //      //所有eth链下的合约处理
  //      return await ethName(address);
  //  }
  //  return ''
}

// 获取
// eth链处理
function ethName(address: string): Promise<any> {
  return GetContract(address).name();
  // try {
  //   //
  //    let name = await GetContract(address).name()
  //    console.log(name,'address',address)

  //  }catch (error) {
  //    console.log(error,'error',address)
  //  }
}

//获取弄格式化名
export const nameItem = defineComponent({
  name: 'name',
  // props: defineProps(['address', 'amount']),
  props: {
    address: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    let name = ref('');
    console.log(props.address, 'props.address');
    provider()
      .getCode(props.address)
      .then((code: any) => {

        if (code.length > 2) {
          getName(props.address)
            .then((res) => {
              name.value = res;
            })
        } else {
          name.value = 'NOVAI';
        }
      })
      .catch((error: any) => {
       // name.value = '合约调用';
      })
      .finally(() => {
        console.log(props.address, 'props.addressprops.address');
      });

    return () => h('span', {}, `${name.value || `--`}`);
  },
});

//通过合约获取 decimals精度
async function getDecimals(address: string, amount: any) {
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

    case addresses.NovaiFaucet:
      return `${getDecimalsTo(amount, 18)}`; // 无小数
    default:
      //所有eth链下的合约处理
      return await ethDecimals(address, amount);
  }
  // return 'asda'
}

// eth链处理
async function ethDecimals(address: string, amount: any): Promise<any> {
  // let contract = GetContract(address);

  // console.log(getFormatUnits(normalNumber.toLocaleString().split(",").join(""),decimalsTo).toFixed(6))
  try {
    // if(!address) {
    //   amount = getNormalNumber(amount)
    //   return `${Number(getFormatUnits(amount,18).toFixed(6))}`
    // }
    if (!address) return getAmount(amount);
    let decimalsTo = await GetContract(address).decimals();
    amount = getNormalNumber(amount);
    return getDecimalsTo(amount, decimalsTo);
    // return `${Number(getFormatUnits(amount,decimalsTo).toFixed(6))}`
  } catch (error) {
    console.log(error);
  }
}
//格式化数据
const getDecimalsTo = (amount: string, decimals: any) => {
  return `${Number(getFormatUnits(amount, decimals).toFixed(6))}`;
};
//  //防止后端传递数据过大
//  function getNormalNumber(value: any): any {
//   return value.toLocaleString().split(",").join("")
//  }

//获取并格式化金额
export const Decimals = defineComponent({
  name: 'Decimals',
  // props: defineProps(['address', 'amount']),
  props: {
    address: {
      type: String,
      default: '',
    },
    amount: {
      type: String,
      default: '',
    },
    decimals: {
      type: [String, Number],
      default: '',
    },
  },
  setup(props) {
    let num = ref<any>(0);

    if (props.decimals) {
      let decimals =
        typeof props.decimals == 'number'
          ? props.decimals
          : Number(props.decimals);
      // let nums = getDecimalsTo(props.amount, props.decimals)
      num.value = `${Number(
        getFormatUnits(props.amount, decimals).toFixed(6)
      )}`;
    } else {
      getDecimals(props.address, props.amount).then((res) => {
        num.value = res;
      });
    }
    console.log(props.address, 'props.address');
    // return  () =>  h('span', {}, `${num.value || '--'}`)

    return () => h('span', {}, `${num.value || '--'}`);
  },
});
