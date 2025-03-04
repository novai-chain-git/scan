## 区块链浏览器部署

1.修改vite.config.ts
```ts
  server: {
    proxy: {
      '/cosmos': {
        target: 'http://节点ip:1317',
        changeOrigin: true,
      },
      '/evmos': {
        target: 'http://节点ip:1317',
        changeOrigin: true,
      }
    },
  },
```

2.在./src/mainnet目录下新增cosmos.json
```json
{
    "chain_name": "novaichain",
    "api": [
        {
            "address": "", 
            "provider": "Ping"
        }
    ], 
    "rpc": [
        {
            "address": "http://192.168.101.13:9090",     //链的ip地址
            "provider": "Ping"
        }
    ],
    "sdk_version": "0.46.11",
    "coin_type": "118",
    "min_tx_fee": "800",
    "assets": [{
        "base": "NOVAI",   //货币名称
        "symbol": "NOVAI",  //货币符号
        "exponent": "6",  //货币精度
        "coingecko_id": "cosmos", 
        "logo": "https://ping.pub/logos/osmosis.jpg"
    }],
    "addr_prefix": "novaichain", //链名称
    "theme_color": "#ce4747",
    "logo": "https://becole.com/static/logo/logo_becole.png"
}
```
3.启动区块链浏览器
```


目录结构：

```
alphahomebridging
├─ 📁.vscode
├─ 📁public // 静态资源
├─ 📁chains // cosmos配置文件
│  ├─ 📁mainnet //
│  │  └─ 📄cosmos.json //配置文件
├─ 📁src
│  ├─ 📁api // 接口请求
│  │  └─ 📄index.js
│  ├─ 📁assets // 静态资源
│  │  ├─ 📁images  // 图片资源
│  │  ├─ 📁wallets  // 图片资源
│  ├─ 📁components  // 公共组件
│  ├─ 📁layouts  // 公共组件
│  ├─ 📁libs  // 工具函数
│  ├─ 📁config // 项目配置
│  ├─ 📁modules // 页面文件
│  ├─ 📁pege // 主页面文件
│  ├─ 📁plugins  // 语言包
│  │  └─ 📁i18n //语言包
│  │  └─ 📁pinia //
│  ├─ 📁router  // 路由
│  ├─ 📁store // Pinia状态管理
│  ├─ 📁utils  // 工具函数
│  ├─ 📁types  // 接口定义文件 
│  ├─ 📁style // 样式
│  ├─ 📄App.vue // 根组件
│  └─ 📄main.js // 入口文件
├─ 📄.gitignore // git忽略文件
├─ 📄.prettierrc.cjs // 代码格式化配置
├─ 📄index.html // 入口html文件
├─ 📄jsconfig.json // js配置
├─ 📄package.json // 项目依赖
├─ 📄README.md
└─ 📄vite.config.js // vite配置
```



项目首先需要安装依赖：yarn install 
运行项目：yarn dev
打包项目：yarn build
