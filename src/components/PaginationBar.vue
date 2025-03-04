<script lang="ts" setup>
import { computed, ref } from 'vue';

const props = defineProps({
  total: { type: String },
  limit: { type: Number },
  callback: { type: Function, required: true },
});
const current = ref(1)
const showSize = 1
const pages = computed(() => {
  const pages: { type: boolean, page: number|string, key: number }[] = []
  const total = Number(props.total || 0)
  if (total > 0 && props.limit && total > props.limit) {
    let page:number|string = 0

    let limit = (props.limit || 20)
    let max = Math.ceil(total / limit)
    while (true) {
      if (page * props.limit >= total) break
      page += 1
      let text:number|string = page
      let type = true
      let cli = true
      // if (total / props.limit > 6 && page > showSize && page < (total / props.limit - showSize + 1)) {
      //   if (!(page >= current.value - 2 && page <= current.value + 2)) {
      //     continue
      //   }
      // }

      if (!(current.value <= 2 && page <= 5)
        && !(current.value >= max - 1 && page >= max - 4)
        && page != 1 && page < (total / (limit) - showSize + 1)) {
        if (!(page >= current.value - 2 && page <= current.value + 2)) {
        //  continue
        type = false
      //  cli = false
        }
      }
      if(
        (
          (current.value > 4 && page == 2) || 
        (current.value < max - 3 && (page == max - 1)) 
        )
        && !type){
        text = '...'
        type = true
      }
      pages.push({
        type: type,
        page: text,
        key:page
      })
    }
  }
  return pages
})


function gotoPage(pageNum: number) {
  current.value = pageNum
  props.callback(pageNum)
}
//判断当前是否显示
function getType(page: number) {
  const total = Number(props.total || 0)
  let limit = (props.limit || 20)
  //current.value = total / limit - showSize + 1
  let max = (total / limit - showSize + 1)
  // if(!(current.value >= max && page >= max - 5)){
  //   return false
  // }
  if (!(current.value <= 2 && page <= 5)
    && !(current.value >= max - 1 && page >= max - 4)
    && page != 1 && page < (total / (limit) - showSize + 1)) {
    if (!(page >= current.value - 2 && page <= current.value + 2)) {
      return false
    }
  }

  return true
}

</script>
<template>
  <div class="my-5 text-center">
    <div v-if="total && limit" class="btn-group">
      <button v-for="{ page, type, key } in pages" :key="key"
      v-show="type"
        class="btn bg-gray-100 text-gray-500 hover:text-white border-none dark:bg-gray-800 dark:text-white" :class="{
          '!btn-primary btn-primary !bg-[#4352D4]': page == current,
        }" @click="page != '...'?gotoPage(key):''">
        {{ page }}
      </button>
    </div>
    <!-- 
    <div v-if="total && limit" class="btn-group">
      <button v-for="(page, key) in (Number(total) / limit)" :key="key" v-show="getType(page)"
        class="btn bg-gray-100 text-gray-500 hover:text-white border-none dark:bg-gray-800 dark:text-white" :class="{
          '!btn-primary btn-primary !bg-[#4352D4]': page === current,
        }" @click="gotoPage(page)">
        {{ page }}
      </button>
    </div> -->
  </div>
</template>

<style scoped lang="scss">
.btn {
  height: 1.5rem;
  min-height: 1.5rem;
}

.btn:last-child,
.btn:first-child {
  border-radius: 0 !important;
}

.dark {
  .bg-gray-100 {
    background-color: rgba(45, 42, 71, 1) !important;
    color: rgba(255, 255, 255, .6);
  }

  .btn-primary {
    color: #ffffff;
    background-color: rgba(111, 65, 255, .1) !important;
  }
}
</style>
