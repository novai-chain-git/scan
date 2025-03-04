<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps(['tx','hash'])

const logs = computed(() =>{
  let arr:any[] = []
  if(props.tx.tx_response && props.tx.tx_response.logs && props.tx.tx_response.logs){
    arr = props.tx.tx_response.logs && props.tx.tx_response.logs.length? props.tx.tx_response.logs[0].events : []
  }
  return arr
})
</script>
<template>
  <div>
    <div v-if="tx.tx_response">
      <div v-for="(item,key) in logs" :key="key">
        <div></div>
        <div>
          <div>
            <div>Address</div>
            <div></div>
          </div>
          <div>
            <div>Name</div>
            <div></div>
          </div>
          <div>
            <div>Topics</div>
            <div></div>
          </div>
          <div>
            <div>Data</div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
