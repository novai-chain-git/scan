import { defineStore } from 'pinia';
import { useBlockchain } from '@/stores';
import { decodeTxRaw, type DecodedTxRaw } from '@cosmjs/proto-signing';
import { addresses, GetContract,getFormatUnits } from '@/libs/web3/index';
import {  formatUnits} from 'ethers';
import dayjs from 'dayjs';
import type { Block, Tx, TxResponse } from '@/types';
import { hashTx } from '@/libs';
import { fromBase64, toHex } from '@cosmjs/encoding';
import { useRouter } from 'vue-router';
import { get } from '@/libs';
import { Interface } from 'ethers';
import { nusdtAbi, uniswap } from '@/libs/web3/abi/index';
import { formatNumberWithCommas } from "@/libs/utils"

export const useBaseStore = defineStore('baseStore', {
  state: () => {
    return {
      earlest: {} as Block,
      latest: {} as Block,
      start: false,
      loading: true,
      recents: [] as Block[],
      theme: (window.localStorage.getItem('theme') || 'light') as
        | 'light'
        | 'dark',
      connected: true,
      transaction: [] as any[],
    };
  },
  getters: {
    blocktime(): number {
      if (this.earlest && this.latest) {
        if (
          this.latest.block?.header?.height !==
          this.earlest.block?.header?.height
        ) {
          const diff = dayjs(this.latest.block?.header?.time).diff(
            this.earlest.block?.header?.time
          );
          const blocks =
            Number(this.latest.block.header.height) -
            Number(this.earlest.block.header.height);
          return diff / blocks;
        }
      }
      return 6000;
    },
    blockchain() {
      return useBlockchain();
    },
    currentChainId(): string {
      return this.latest.block?.header.chain_id || '';
    },
    getLoging(): boolean {
      return this.loading;
    },
    txsInRecents() {
      const txs = [] as {
        height: string;
        hash: string;
        tx: DecodedTxRaw;
      }[];
      this.recents.forEach((b) => {
        if (b && b.block) {
          b.block?.data?.txs.forEach((tx: string) => {
            if (tx) {
              const raw = fromBase64(tx);
              try {
                txs.push({
                  height: b.block.header.height,
                  hash: hashTx(raw),
                  tx: decodeTxRaw(raw),
                });

                // this.getTxs(b.block.header.height)
                //减50
              } catch (e) {
                console.error(e);
              }
            }
          });
        }
      });
      return txs.sort((a, b) => {
        return Number(b.height) - Number(a.height);
      });
    },
    getTransaction(): any[] {
      return this.transaction.sort((a, b) => {
        return Number(b.height) - Number(a.height);
      });
    },
  },
  actions: {
    async initial() {
      this.fetchLatest();
    },
    async clearRecentBlocks() {
      this.recents = [];

      this.transaction = [];
    },
    async fetchLatest() {
      try {
        this.latest = await this.blockchain.rpc?.getBaseBlockLatest();

        //console.log(this.latest, 'latest');

        this.connected = true;
      } catch (e) {
        this.connected = false;
      }
      if (
        !this.earlest ||
        this.earlest?.block?.header?.chain_id !=
          this.latest?.block?.header?.chain_id
      ) {
        //reset earlest and recents
        this.earlest = this.latest;
        //清空数据去除
        // this.recents = [];
      }
      //check if the block exists in recents
      if (
        this.recents.findIndex(
          (x) => x?.block_id?.hash === this.latest?.block_id?.hash
        ) === -1
      ) {
        if (!this.start && this.latest?.block?.header.height) {
          this.start = true;
          this.getTxs(this.latest?.block?.header.height);
          // let res:any =
          // if(res?.block?.data?.txs.length){
          //     this.recents.push(res);
          // }
        }

        if (this.recents.length >= 50) {
          this.recents.shift();
        }

        this.recents.push(this.latest);
        this.setTransaction(this.latest);
      }
      return this.latest;
    },
    //

    async fetchValidatorByHeight(height?: number, offset = 0) {
      return this.blockchain.rpc.getBaseValidatorsetAt(String(height), offset);
    },
    async fetchLatestValidators(offset = 0) {
      return this.blockchain.rpc.getBaseValidatorsetLatest(offset);
    },
    //向上查高度
    getTxs(height?: number | string, key = 1) {
      let completed = 0;
      for (let i = 1; i <= 20; i++) {
        this.fetchBlock(parseInt(height ? height.toString() : '0') - i)
          .then((res) => {
            if (res?.block?.data?.txs.length) {
              this.recents.unshift(res);
              this.setTransaction(res);
            }
          })
          .finally(() => {
            completed++;
            if (completed >= 20) {
              this.loading = false;
            }
          });
      }
    },
    //添加列表数据
    setTransaction(res: Block) {
      if (res && res.block) {
        let txs = res.block.data.txs;
        txs.forEach((tx: string) => {
          if (tx) {
            const raw = fromBase64(tx);
            const hash = hashTx(raw);
            if (hash.match(/^0x.*/)) {
              get(`/evmos/ethermint/ai/find_evmtx/${hash}`).then((res) => {
                this.blockchain.rpc
                  .getTx(res.cosmostx)
                  .then(async (tx: { tx: Tx; tx_response: TxResponse }) => {
                    let  va = await this.parseErc20Data(tx);
                    console.log(tx,'tx',decodeTxRaw(raw),'va',va)
                    this.transaction.push({
                      height: res.block.header.height,
                      hash: hash,
                      tx_response:tx.tx_response,
                      tx: decodeTxRaw(raw),
                      ...va
                    });
                  });
              });
            } else {
              this.blockchain.rpc
                .getTx(hash)
                .then(async (tx: { tx: Tx; tx_response: TxResponse }) => {
                  let va = await this.parseErc20Data(tx);
                //  console.log(tx,'tx',decodeTxRaw(raw),'decodeTxRaw(raw)',va)
                  this.transaction.push({
                    height: res.block.header.height,
                    hash: hash,
                    tx: decodeTxRaw(raw),
                    tx_response:tx.tx_response,
                    ...va
                  });
                });
            }
           
          }
        });
      }
    },
    getTxn(tx: { tx: Tx; tx_response: TxResponse }){
      let messages: any = tx.tx.body.messages;
      let tx_messages: any = tx.tx_response.tx.body.messages;
      if (messages.length) {
        
      }
    },
    //判断是否存在交易
    async parseErc20Data(tx: { tx: Tx; tx_response: TxResponse }) {
      const abi = [
        'function transfer(address to, uint amount)',
        'function name() view returns (string)',
        'function decimals() view returns (uint8)',
      ];
      const iface = new Interface(abi);

      const ifaceNusdt = new Interface(nusdtAbi);

      const ifaceUniswap = new Interface(uniswap);
      let messages: any = tx.tx.body.messages;
      let tx_messages: any = tx.tx_response.tx.body.messages;
      let value:any = 0
      let name = ''
      let methodName = ''
      let transactionType = ''
      try {
        if (messages.length) {
          let bus: any = messages[0]?.data.to;
          let contract = GetContract(bus);
          const base64Data = fromBase64(messages[0]?.data.data);
          var hexData = toHex(base64Data);
          let transactionData: any = '';
         // console.log(bus,'bus',bus === addresses.UniswapV2Router01)
          if (bus === addresses.UniswapV2Router01) {
            transactionData = ifaceUniswap.parseTransaction({
              data: `0x${hexData}`,
            });
            let args = transactionData.args
            let decimalsTo = 'nameTo', nameTo = '',numTo:any = 0
            if(args.length == 5){
              decimalsTo = await GetContract(args[2][0]).decimals()
              nameTo = await GetContract(args[2][0]).name()
              
              nameTo = nameTo.replace("Wrapped ", "")
              numTo = getFormatUnits(args[0], decimalsTo).toFixed(6)
      
            }
            let decimalsForm = await GetContract(args[args.length == 5?2:1][1]).decimals()
            let nameForm = await GetContract(args[args.length == 5?2:1][1]).name()
            nameForm = nameForm.replace("Wrapped ", "")
            let numform = getFormatUnits(args[args.length == 5?1:0], decimalsForm).toFixed(6)
            transactionType = 'uniswap'
            return{
              value:value,
              to:numTo,
              form:numform,
              nameTo,
              nameForm,
              automation: args.length == 5,
              toAddress:args[args.length == 5?2:1][0],
              formAddress:args[args.length == 5?2:1][1],
              objValue:tx_messages.length?tx_messages[0].data:{},
              name:"",
              methodName:'',
              transactionType
            }
          }else if (bus === addresses.novaichain) {
            transactionData = ifaceNusdt.parseTransaction({
              data: `0x${hexData}`,
            });
          } else {
            transactionData = iface.parseTransaction({
              data: `0x${hexData}`,
            });
          }
          if(transactionData){
            methodName = transactionData.name
            name = await contract.name();
            const decimals = await contract.decimals();
           // value = getFormatUnits(transactionData.args[1], decimals)
            value = formatNumberWithCommas(formatUnits(transactionData.args[1], decimals),6,'');
            transactionType = 'erc20'
          }
        }
      } catch (error) {
        console.log('error：', error);
      } 
      
      return {
        value:value,
        objValue:tx_messages.length?tx_messages[0].data:{},
        name:name,
        methodName:"",
        transactionType
      }

      // let bus:string = tx.tx.body.messages[0].data.to
      //;

      // ;
      //
    },
    async fetchBlock(height?: number | string) {
      return this.blockchain.rpc.getBaseBlockAt(String(height));
    },
    async fetchAbciInfo() {
      return this.blockchain.rpc.getBaseNodeInfo();
    },
    // async fetchNodeInfo() {
    //     return this.blockchain.rpc.no()
    // }
  },
});
