<script lang="ts" setup>
import { watch, ref, nextTick } from "vue"
import {VAceEditor} from 'vue3-ace-editor';

const editor = ref()
const constent = ref('asdasdasdasd')
const props = defineProps({
    value: {
        type: String,
        default: ""
    },
    readonly: {
        type: Boolean,
        default: true

    }
})

const options = {
    useWorker: false
}

watch(() => props.value,async (value) => {
   // console.log(value,'value')
    constent.value = value
    await nextTick()
    editor.value.getAceInstance().setShowPrintMargin(false)
},{
    immediate: true
})
</script>
<template>
    <div>
        <!-- <v-ace-editor></v-ace-editor> -->
        <v-ace-editor ref="editor" v-model:value="constent" lang="javascript" theme="github" 
        :readonly="readonly"
         :options="options"
            style="height: 300px;background-color: transparent;color: #ffffff;">
        </v-ace-editor>
    </div>
</template>
<style lang="scss" scoped>

::v-deep .ace-tm .ace_gutter{
  background-color: transparent;
  color: #ffffff;
}
</style>