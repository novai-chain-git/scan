<script setup lang="ts">
import { themeChange } from 'theme-change';
import { onMounted } from 'vue';
import TxDialog from './components/TxDialog.vue';

onMounted(() => {
  themeChange(false);
});
</script>

<template>
  <div class="app_main">
    <RouterView />
    <TxDialog />
  </div>
</template>
<style>
::-webkit-scrollbar {
  display: none;
}


@font-face {
  font-family: 'Orbitron';
  src: url('@/assets/font/orbitron/orbitron-black.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}

@font-face {
  font-family: 'OrbitronBold';
  src: url('@/assets/font/orbitron/orbitron-bold.otf') format('opentype');
  font-style: normal;
  font-weight: normal;
}

@font-face {
  font-family: 'OrbitronMedium';
  src: url('@/assets/font/orbitron/orbitron-medium.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}
@font-face {
  font-family: 'OrbitronLight';
  src: url('@/assets/font/orbitron/orbitron-light.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}

@font-face {
  font-family: 'PoppinsRegular';
  src: url('@/assets/font/Poppins-Regular.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}
.app_main{
font-size: 14px;
}
:focus-visible {
    outline: -webkit-focus-ring-color auto 0px;

}
.br{
border-image: linear-gradient(180deg, #5AC27C 0%, #B2E235 100%) 1 !important;
}


.bg_jb{
  background: linear-gradient(90deg, rgba(178, 226, 53, 0.2) 0%, rgba(31, 43, 2, 0.8) 100%);
}

.textjb-lv,.jv-container .jv-button{
  background-image: linear-gradient(180deg, #5AC27C 0%, #B2E235 100%) !important;

}
.textjb-lv,.jv-container .jv-button{
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; /* 使文字填充为透明 */
  background-clip: text;  /* 非 Webkit 浏览器使用这个 */
  color: transparent;  /* 必须将字体颜色设置为透明 */
}

.btn-primary {
  --tw-border-opacity: 1;
  border-color: transparent !important;
  --tw-bg-opacity: 1;
  background: linear-gradient(180deg, #5AC27C 0%, #B2E235 100%) !important;
  --tw-text-opacity: 1;
  color: hsl(var(--pc) / var(--tw-text-opacity));
  outline-color: hsl(var(--p) / 1);
}
.btn-primary:hover {
  border-color: transparent !important;

}

.table :where(thead, tbody) :where(tr:not(:last-child)), .table :where(thead, tbody) :where(tr:first-child:last-child) {
    border-bottom-width: 1px;
    --tw-border-opacity: 1;
    border-bottom-color: hsl(0deg 0% 100% / 16%) !important;
}
</style>
