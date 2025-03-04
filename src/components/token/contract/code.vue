<script lang="ts" setup>
import editor from "@/components/editorModule.vue"

import textCard from "@/components/textCard.vue"
const props = defineProps(['contractInfo', 'info'])
</script>
<template>
  <div>
    <div class="text-[16px]">
      <span class="pr-2  ">
        {{ $t("token.ContractSourceCodeVerified") }}
      </span>
      <span>
        ({{ $t("token.ExactMatch") }})
      </span>
    </div>
    <div class="grid lg:!grid-cols-2 gap-[10px]">
      <div class="grid-cols-1 divide-y">
        <div class="py-2 grid grid-cols-3">
          <div> {{ $t("token.ContractName") }}:</div>
          <div class="col-span-2"></div>
          <span> {{ info.name }}</span>
        </div>
      </div>
      <div class="grid-cols-1 divide-y">
        <div class="py-2 grid grid-cols-3">
          <div> {{ $t("token.CompilerVersion") }}:</div>
          <div class="col-span-2"></div>
          <span>{{ contractInfo?.compilerVersion }}</span>
        </div>

      </div>
    </div>
    <div class="pb-6">
      <div class="text-[16px] pb-2">
        <span class="pr-2  ">
          {{ $t("token.ContractSourceCode") }}
        </span>
        <span class="pr-2">({{ $t("token.Solidity") }})</span>
        <span class="bg-[#5AC27C]/[.3] text-[#B2E235] text-[13px] py-0.5 px-3 rounded-full">
          {{ $t("token.AuditReport") }}
        </span>
      </div>


      <editor :value="contractInfo?.sourceCode"></editor>
    </div>

    <div class="pb-6">
      <div class="text-[16px] pb-2">
        <span class="pr-2  ">
          {{ $t("token.ContractABI") }}
        </span>
      </div>
      <textCard :text="contractInfo?.abi"> </textCard>
    </div>
    <div class="pb-6">
      <div class="text-[16px] pb-2">
        <span class="pr-2  ">
          {{ $t("token.ContractCreationCode") }}
        </span>
      </div>
      <textCard :text="contractInfo?.creationCode"> </textCard>
    </div>
  </div>
  <!-- 

   -->
</template>