// 在 TypeScript 中声明一个模块
declare module 'jazzicon' {
    import { VueConstructor } from 'vue';

    // 定义 Jazzicon 组件的 props
    interface JazziconProps {
      diameter: number;
      seed: number;
      address: string;
      // 可以根据需要添加其他 props
    }
  
    // 导出 VueConstructor 类型，这样可以在 Vue.use 中使用
    const Jazzicon: VueConstructor;
  
    export default Jazzicon;
  }