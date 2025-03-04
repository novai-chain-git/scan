<template>
  <dialog
    ref="dialogRef"
    class="dialog_pop_up "
    :class="
      location === 'top'
        ? 'dialog_pop_up_top'
        : location === 'bottom'
        ? 'dialog_pop_up_bottom'
        : 'dialog_pop_up_content'
    "
  >
    <div class="dialog-content rounded-[16px] border-t border-[#5AC27C]/[.16] bg-[#131315] p-[16px] " 
    :style="{ width: `${width}px` }">
      <div class="dialog-header text-[#ffffff] flex items-center" v-if="header">
        <div class="text-[14px]  lg:text-[16px] font-[OrbitronMedium] tracking-[.5px]">{{ title }}</div>
        <div @click="closeDialog" class="ml-auto">
          <img
            src="@/assets/images/svg/closure.svg"
            alt=""
            class="w-[20px] h-[20px] cursor-pointer"
          />
        </div>
      </div>
      <slot name="header"></slot>
      <slot></slot>
      <slot name="footer"></slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
const model = defineModel({
  type:Boolean,
  default: false
})
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  // open: {
  //   type: Boolean,
  //   default: false,
  // },
  header: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '500',
  },
  location: {
    type: String,
    default: 'top', // top为上面,content中间,bottom底部
  },
});
const dialogRef = ref(null as any);

const closeDialog = () => {
  dialogRef.value.close();
  document.body.style.overflow = '';
  model.value = false
  //
};
const openDialog = () => {
  dialogRef.value?.showModal();
  document.body.style.overflow = 'hidden';
};

onMounted(() => {
  model.value && openDialog();
  document.body.appendChild(dialogRef.value);
});
onUnmounted(() => {
  dialogRef.value && document.body.removeChild(dialogRef.value);
});
watch(
  () => model.value,
  (newOpen) => {
    newOpen ? openDialog() : closeDialog();
  }
);
</script>

<style scoped lang="scss">
.dialog_pop_up {
  width: 100%;
  height: 100vh;

  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.5);
}
.dialog_pop_up .dialog-content {
  position: absolute;
  z-index: 9999;
  left: 50%;
}

.dialog_pop_up_top .dialog-content {
  top: 50px;
  transform: translateX(-50%);
}
.dialog_pop_up_content .dialog-content {
  top: 50%;
  transform: translate(-50%, -50%);
}
.dialog_pop_up_bottom .dialog-content {
  bottom: 50px;
  transform: translateX(-50%);
}

@media screen and (max-width: 768px) {
  .dialog_pop_up .dialog-content {
    width: 90% !important;
  }
}
</style>
