<script lang="ts" setup>
import Drawer from "@/components/Drawer.vue"
import { list, Optimization, EVMOption, LicenseOption } from "./vwrifycontract"
import { getAddress, isAddress } from 'ethers';
import { ref, watch, reactive, onMounted } from 'vue';
import { useBlockchain } from '@/stores';
import { useRoute, useRouter } from 'vue-router';
import { post } from '@/libs';

const route = useRoute();
const router = useRouter()
const props = defineProps(['verifycontract', 'chain']);
const step = ref(1)
const loading = ref(false)
const mseeage = ref("")
const blockStore = useBlockchain();

const current = blockStore?.current?.chainName || '';
// {
//   "abi": "string",
//   "address": "string",
//   "compilerType": "string",
//   "compilerVersion": "string",
//   "evmVersion": "string",
//   "licenseType": "string",
//   "sourceCode": "string"
// }
const info = reactive({

    abi: "",
    address: props.verifycontract,
    compilerType: "Solidity (Multi-Part files)",
    compilerVersion: "",
    licenseType: "3) MIT License (MIT)",
    evmVersion: "default (compiler defaults)",
    sourceCode: "",



})

const verifycontractType = ref<String>('')
const VersionType = ref<String>('')
const sourceCodeType = ref()
const abiType = ref()
const evmVersionType = ref()
const versionList = list

onMounted(() => {
    // if (route.query?.Version && route.query?.step) {
    //     step.value = 2
    // }
})

//返回第一步
function onSetStep(value: any) {
    switch (value) {
        case 1:
            step.value = 1
            //  router.push(`/novaichain/verifycontract/${props.verifycontract}`)
            // router.push({ path: `/novaichain/verifycontract/${props.verifycontract}`})
            break;
        case 2:
            step.value = 2
            // router.push(`/novaichain/verifycontract/${props.verifycontract}?step=2&Version=${info.Version}`)
            break;
    }
    //  window.location.reload();
}

function onReset() {
    switch (step.value) {
        case 1:
            info.compilerVersion = ''
            info.address = ''
            break;
        case 2:
            info.abi = ''
            info.sourceCode = ''
            info.evmVersion = 'default (compiler defaults)'
            break;
        default:
            break;
    }
}

function form1() {
    onverifycontract()
    ifVersionType()
    if (!VersionType.value && !verifycontractType.value) {
        //  step.value = 2

        onSetStep(2)
    }
}
function form2() { 
    ifAbiType()
   // ifEvmVersionType()
    ifSourceCodeType()
    if (!abiType.value && !sourceCodeType.value) {
        //  step.value = 2

        verifyApi()
    }
}
function ifAbiType() {
    abiType.value = ifValue(info.abi)
}
function ifEvmVersionType() {
    evmVersionType.value = ifValue(info.evmVersion)
}
function ifSourceCodeType() {
    sourceCodeType.value = ifValue(info.sourceCode)
}

function ifValue(val: any) {
    if (!val) {
        return 'Required'
    }
    return ''
}

function ifVersionType() {
    VersionType.value = ifValue(info.compilerVersion)
}
function onverifycontract() {

    const addr = /^[a-z\d]+1[a-z\d]{38,58}$/;
   // console.log(isAddress(info?.address), 'isAddress(info.verifycontract)')
    if (ifValue(info?.address)) {
        verifycontractType.value = ifValue(info?.address)
    } else if (!addr.test(info?.address) && !isAddress(info?.address)) {
        verifycontractType.value = "Invalid Length"
    } else {
        verifycontractType.value = ''
    }
}

function verifyApi() {
  loading.value = true
    mseeage.value = ''
    post(`/api/contract/verify`, info).then((x) => {
        // console.log(code, 'x')
        // if(code)
        if(x.code === 0){
            router.push(`/${current}/token/${props.verifycontract}`)
        }else {
            mseeage.value = x.mseeage
        }
      
    }).finally(() =>{
        loading.value = false
    })
}



</script>
<template>
    <div class="md:w-[725px] w-[100%] ml-auto mr-auto px-[10px] md:!px-[0px] text-[#ffffff]">
        <div class="text-center">
            <div class=" md:!text-2xl md:!pb-[20px] pb-[10px]  font-[OrbitronMedium] tracking-[.5px]">{{ $t("verify.title") }}</div>
            <div class=" md:!text-[15px] text-sm md:!pb-[20px] pb-[10px]  ">{{ $t("verify.centerText") }}</div>
            <div v-show="step === 2" class=" md:!text-[15px] md:!pb-[20px] pb-[10px] text-sm ">{{
                $t("verify.centerText2") }}</div>
        </div>
        <div class="font-[OrbitronMedium] tracking-[.5px] flex justify-center items-center md:!text-[15px] text-sm md:!mb-[30px] mb-[20px]">
            <div class="flex items-center justify-center " @click="onSetStep(1)" 
            :class="{ 'cursor-pointer': step !== 1 }">
                <div :class="[step === 1 ? 'text-[#181A20] bg-lv' : '!bg-[#282829] text-[#ffffff]/[.5] ']"
                    class="w-[24px] h-[24px] text-[15px] mr-[8px] flex justify-center items-center rounded-full">1</div>
                {{ $t("verify.EnterContractDetails") }}
            </div>
            <div class="h-[1px] bg-black w-[40px] mx-[10px]"></div>
            <div class="flex items-center justify-center">
                <div :class="[step === 2 ? '!text-[#181A20] bg-lv' : '!bg-[#282829] text-[#ffffff]/[.5]']"
                    class="w-[24px] h-[24px] text-[15px] mr-[8px] flex justify-center items-center rounded-full">2</div>
                {{ $t("verify.Verify_&_Publish") }}
            </div>
        </div>
        <div>

            <div v-if="step === 1" class="border border-[#FFFFFF]/[.16] bg-[#131315]/[.8] rounded-[16px] px-4 pt-3 pb-4 md:!text-[17px]  text-[15px]">
                <div>
                    <div>{{ $t("verify.Please") }}</div>
                    <input @input="onverifycontract" :class="{ '!border-rose-600': verifycontractType }"
                        class="md:!h-[47px] h-[37px] w-[100%] rounded-full my-[10px] 
                        bg-[#0A0B0F] border-[#ffffff]/[0.16]
                        px-[20px] border-solid border-2"
                        v-model="info.address" placeholder="0x..." />
                    <div class="text-rose-700">{{ verifycontractType }}</div>
                </div>
                <div>
                    <div>{{ $t("verify.Please1") }}</div>
                    <select placeholder="Please Select" disabled
                        class="md:!h-[47px] h-[37px] w-[100%] rounded-full 
                        bg-[#0A0B0F] border-[#ffffff]/[0.16]
                        my-[10px] px-[20px] border-solid border-2"
                        v-model="info.compilerType">
                        <option value="Solidity (Multi-Part files)">Solidity (Multi-Part files)</option>
                    </select>
                </div>
                <div>
                    <div>{{ $t("verify.Please2") }}</div>
                    <select placeholder="Please Select" @change="ifVersionType()"
                        :class="{ '!border-rose-600': VersionType }"
                        class="md:!h-[47px] h-[37px] w-[100%] rounded-full my-[10px] 
                        bg-[#0A0B0F] border-[#ffffff]/[0.16]
                        px-[20px] border-solid border-2"
                        v-model="info.compilerVersion">
                        <option :value="item.value" v-for="(item, key) in versionList" :key="key">
                            {{ item.label }}

                        </option>
                    </select>
                    <div class="text-rose-700">{{ VersionType }}</div>
                </div>
                <div>
                    <div>{{ $t("verify.Please3") }}</div>
                    <div>
                        <select placeholder="Please Select" disabled
                            class="md:!h-[47px] h-[37px] w-[100%] 
                            bg-[#0A0B0F] border-[#ffffff]/[0.16]
                            rounded-full my-[10px] px-[20px] border-solid border-2"
                            v-model="info.licenseType">
                            <option value="3) MIT License (MIT)">3) MIT License (MIT)</option>
                        </select>

                    </div>
                </div>
            </div>
            <div v-else>
                <Drawer>
                    <template v-slot:title >
                        {{ $t("verify.Upload") }}
                    </template>
                    <template v-slot:main>
                        <div class="md:!text-[15px] text-sm">
                            <div class="   md:!pb-[10px] pb-[4px]">{{ $t("verify.Upload1") }}</div>
                            <div class="md:!pb-[10px] pb-[14px]">{{ $t("verify.Upload2") }}</div>
                            <div class=" md:!pb-[10px] pb-[4px]">{{ $t("verify.Upload3") }}</div>
                            <div class="bg-[#0A0B0F] p-3 rounded shadow  border-[#ffffff]/[0.16]">
                                <div class="md:grid md:grid-cols-3 pb-2">
                                    <div class="">{{ $t("verify.ContractAddres") }}:</div>
                                    <div class="font-bold md:col-span-2">{{ info.address }}</div>
                                </div>
                                <div class="md:grid md:grid-cols-3  pb-2">
                                    <div>{{ $t("verify.CompilerType") }}:</div>
                                    <div class="font-bold md:col-span-2">SOLIDITY MULTI-PART VERIFIER (IMPORTS)</div>
                                </div>
                                <div class="md:grid md:grid-cols-3 ">
                                    <div>{{ $t("verify.CompilerVersion") }}:</div>
                                    <div class="font-bold md:col-span-2">{{ info.compilerVersion }}</div>
                                </div>
                            </div>

                            <div class="font-bold md:!py-4 py-2">{{ $t("verify.EnterThe") }}</div>
                            <textarea v-model="info.sourceCode"
                             @input="ifSourceCodeType"
                            :class="{ '!border-rose-600': sourceCodeType }"
                                class="min-h-28 w-full p-3 border-solid border-2 border-[#ffffff]/[0.16] bg-[#0A0B0F] rounded " />
                            <div class="text-rose-700">{{ sourceCodeType }}</div>                        
                            </div>
                    </template>
                </Drawer>

                <Drawer>
                    <template v-slot:title>
                        {{ $t("verify.Advanced") }}
                    </template>
                    <template v-slot:main>
                        <div class="md:!text-[15px] text-sm md:grid md:!grid-cols-4 grid-cols-1 gap-[10px]">
                            <!-- <div class="grid-cols-1">
                                <div class="pb-1 md:!pb-1.5">{{ $t("verify.Optimization") }}</div>
                                <select placeholder="Please Select" @change="ifVersionType()"
                                    :class="{ '!border-rose-600': VersionType }"
                                    class="md:!h-[47px] h-[37px] w-[100%] rounded-full px-[20px] border-solid border-2"
                                    v-model="info.Optimization">
                                    <option :value="item.value" v-for="(item, key) in Optimization" :key="key">
                                        {{ item.label }}

                                    </option>
                                </select>
                            </div>
                            <div class="grid-cols-1">
                                <div class="pb-1 md:!pb-1.5">{{ $t("verify.Runs") }}</div>
                                <input :class="{ '!border-rose-600': verifycontractType }"
                                    class="md:!h-[47px] h-[37px] w-[100%] rounded-full px-[20px] border-solid border-2"
                                    v-model="info.runs" placeholder="" />
                            </div> -->
                            <div class="md:!col-span-2">
                                <div class="pb-1 md:!pd-1">{{ $t("verify.EVM") }}</div>
                                <select placeholder="Please Select" @change="ifEvmVersionType()"
                                    
                                    class="md:!h-[47px] h-[37px] w-[100%] rounded-full px-[20px] border-solid border-2
                                    border-[#ffffff]/[0.16] bg-[#0A0B0F]"
                                    v-model="info.evmVersion">
                                    <option :value="item.value" v-for="(item, key) in EVMOption" :key="key">
                                        {{ item.label }}

                                    </option>
                                </select>
                                <!-- <div class="text-rose-700">{{ evmVersionType }}</div> -->
                            </div>
                            <div class="md:!col-span-2">
                                <div class="pb-1 md:!pb-1.5">{{ $t("verify.License") }}</div>
                                <select v-model="info.licenseType" placeholder="Please Select" 
                                    :class="{ '!border-rose-600': VersionType }"
                                    class="md:!h-[47px] h-[37px] w-[100%] rounded-full px-[20px] border-solid border-2
                                    border-[#ffffff]/[0.16] bg-[#0A0B0F]">
                                    <option value="3) MIT License (MIT)">3) MIT License (MIT)</option>
                                </select>

                            </div>
                        </div>
                    </template>
                </Drawer>

                <Drawer>
                    <template v-slot:title>
                        <div>
                            <p> {{ $t("verify.Constructor") }}</p>
                            <span class="text-sm font-medium"> {{ $t("verify.Constructor1") }}</span>
                        </div>
                    </template>
                    <template v-slot:main>
                        <div>
                            <textarea v-model="info.abi"
                            :class="{ '!border-rose-600': abiType }"
                            @input="ifAbiType"
                                class="min-h-28 w-full p-3 border-solid border-2 border-[#ffffff]/[0.16] bg-[#0A0B0F] rounded " />
                                <div class="text-rose-700">{{ abiType }}</div>
                                <p>
                                {{ $t("verify.For") }}
                            </p>
                        </div>
                    </template>
                </Drawer>

                <div v-show="mseeage" class="p-3 bg-base-100 rounded shadow text-rose-700 border border-rose-600">
                    {{mseeage}}
                </div>
            </div>

        </div>
        <div v-if="step === 1" class="flex items-center justify-center pt-[20px] font-[OrbitronMedium] tracking-[.5px]">
          
          <button @click="onReset"  class="py-[8px] px-[16px] rounded-full !bg-[#282829] text-[#ffffff]/[.5] w-[200px]">
                {{ $t("verify.Reset") }}</button>  
          <button @click="form1" class="ml-2 py-[8px] px-[16px] rounded-full w-[200px] 
             text-[#181A20]  bg-lv">
                {{ $t("verify.Continue") }}</button>
        </div>
        <div v-else class="flex items-center justify-center pt-[20px] font-[OrbitronMedium] tracking-[.5px]">
          
          <button @click="onReset"  class=" py-[8px] px-[16px] rounded-full w-[200px] !bg-[#282829] text-[#ffffff]/[.5]
             !bg-stone-300">
                {{ $t("verify.Reset") }}</button>
            <button @click="form2"  class="ml-2 py-[8px] px-[16px] rounded-full w-[200px]
            text-[#181A20] bg-lv">
                {{ $t("verify.Verify") }}</button>
        </div>

        <div v-show="loading" class="fixed inset-0 z-50 bg-[rgba(0,0,0,0.3)] flex items-center justify-center">
            <div>
                <div></div>
                <div class="text-white text-xl">...执行中</div>
            </div>
        </div> 
    </div>
</template>