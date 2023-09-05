<template>
  <el-dialog :title="$t('vip.title')" :visible.sync="visible" @close="onClose"
             v-dialogDrag :close-on-click-modal="false" custom-class="minWidth">
    <el-alert title="无" type="info" effect="dark"
        :closable="false"
        style="text-align: left;">
      <template slot='title'>
        <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ title }}</div>
        <template v-if="tabActive === 0">
          <div v-if="tend_time">{{ $t('vip.outPubEXP') }}</div>
          <div v-else>
            <div v-if="trade_end_time">{{ $t('vip.desPub1', { msg: trade_end_time }) }}</div>
            <div v-else>{{ $t('vip.desPub2') }}</div>
          </div>
        </template>
        <template v-else>
          <div v-if="pend_time">{{ $t('vip.outBuyEXP') }}</div>
          <div v-else>
            <div v-if="post_end_time">{{ $t('vip.desBuy', { msg: post_end_time }) }}</div>
          </div>
        </template>
        <div style="font-size: 12px;">{{ $t('vip.tips') }}</div>
      </template>
    </el-alert>
    
    <!-- <div class="tab-title">
        <span v-for="(item,index) of tabTitle" :key="index"
              :class="tabActive === index ? 'tabActive': 'tabNoActive'"
              :style="isShowStyle(item)"
              @click="changeTabActive(index)">
          {{ tabActive  === 0 ? $t('vip.pub') : $t('vip.buy') }}</span>
    </div> -->

    <div class="tab-title">
      <span>{{ title }}</span>
    </div>
    
    <div class="list-vip">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(item,index) in vipList" :key="index">
          <div class="lab" @click="changeActive(item)"
               :class="listActive === item.id ? 'gold-active' : ''">
            <!-- <span class="unit">BTC</span> -->
            <span class="title">{{item.title}}</span>
            <div v-if="vipList.length-1 !== index">
              <span class="money">{{parseFloat(item.total)}}</span>
            </div>
            <div v-else>
              <el-input size="mini" v-model="customMonth"
                        @input="changeAmount(item)"
                        oninput="value=value.replace(/[^\d]/g,'')"
                        type="text" style="width: 80%;margin-bottom: 20px">
                <template slot="append">月</template>
              </el-input>
              <p class="money">{{ customMonth * item.amt | cutPoint(8) }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row class="buy-vip-footer">
        <el-col :span="9">
          <span style="margin-right: 10px">{{ $t('vip.pay') }}</span>
          <el-radio-group v-model="radio" size="mini">
            <el-radio-button label="1">BTC</el-radio-button>
            <el-radio-button label="2">USDT</el-radio-button>
          </el-radio-group>
          
        </el-col>
        <el-divider direction="vertical"></el-divider>
        <el-col :span="10">
          <p style="word-break: break-word">{{ $t('vip.pay1') }}<span class="amount">{{ amount | cutPoint(8) }}</span>{{ $t('vip.pay2') }}</p>
        </el-col>
        <el-col :span="6" style="display: flex;justify-content: space-between">
          <span class="button" @click="submitVIP">{{ $t('button.confirm') }}</span>
          <span class="button" @click="onClose">{{ $t('vip.close') }}</span>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
import myFunctions from '@/utils/myFunctions'
  import {mapState} from 'vuex'

  export default {
    name: "vip",
    props: {
      tabIndex: {
        type: Number,
        default: null
      },
      show: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        radio: '1',
        visible: this.show,
        tabActive: null,
        vipList: [],
        month: 1,    // 要传的月份
        listActive: 1,  // 列表点击高亮
        amount: '',   //要支付的金额
        customMonth: 1,    //自定义月份
        type: null,
        title: '',
        path: ''
      }
    },
    watch: {
      show: {
        handler(val) {
          this.visible = this.show
          this.tabActive = this.tabIndex
          this.type = this.tabIndex
          if (val) this.getVIPlist(this.tabIndex);
        }
      },
      tabIndex: {
        handler(val) {
          console.log(val)
          if(val === 0) this.title = '商品发布权'
          else this.title = '咨询发布权'
        }
      }
    },
    computed: {
      tabTitle() {
        return [
          {code: 'gold',name: this.$t('vip.pub') },
          {code: 'silver',name: this.$t('vip.buy') },
        ]
      },
      ...mapState({
        trade_end_time: state => state.user.userInfo.trade_end_time,
        post_end_time: state => state.user.userInfo.post_end_time,
        release: state => state.site.siteSetting.release_power_chars*1,
        reply: state => state.site.siteSetting.goods_reply_chars*1,
        tend_time: state => {
          let time = state.user.userInfo.tend_time * 1000
          if (time < new Date().getTime()) return true
        },
        pend_time: state => {
          let time = state.user.userInfo.pend_time * 1000
          if (time < new Date().getTime()) return true
        },
      })
    },
    methods: {
      isShowStyle(item) {
        if (item.code === 'gold' && !this.release) return { visibility: 'hidden' }
        if (item.code === 'silver' && !this.reply) return { visibility: 'hidden' }
      },
      // 点击上面的tab改变内容
      changeTabActive(index) {
        this.tabActive = index
        this.type = index
        this.customMonth = 1
        if (index === 0) this.getVIPlist(0)
        if (index === 1) this.getVIPlist(1)
      },
      // 根据字段获取数据
      getVIPlist(type) {
        this.$http.get('WebBuyVip/config',{ params: { type }}).then(res=> {
          if (res) {
            this.vipList = res
            this.amount = res[0].total
          }
        })
      },
      // 点击月份
      changeActive(item) {
        this.month = item.month
        this.listActive = item.id
        this.amount = item.total
      },
      // input改变下面的金额跟着变动
      changeAmount(item) {
        this.month = item.month = this.customMonth
        this.amount = item.total = item.amt * this.customMonth
      },
      // 提交开通会员
      async submitVIP() {
        // if(this.tabIndex === 0)  this.path = '/WebBuyVip/buy_release'  else this.path = '/WebBuyVip/buy_reply'   //调用私有方法
        this.path = '/WebBuyVip/create'
        let params = { type: this.type, month: this.month, currency_id: this.radio}
        let res = await myFunctions.post(this.path, params) 
        if (res) {
              this.$store.dispatch('user/getInfo')
              this.$message.success('开通/续费成功')
            }
      },

      onClose() {
        this.$emit('update:show', false)
        this.tabActive = null
        this.type = null
      },
    }
  }
</script>

<style scoped lang="less">
  ::v-deep .minWidth {
    min-width: 660px;
    max-width: 700px;
    .el-dialog__header {
      padding: 10px 20px;
      background: #505050;
      span,.el-dialog__headerbtn {
        color: #fff!important;
      }
      .el-dialog__close {
        color: #fff;
        font-size: 16px;
      }
      .el-dialog__headerbtn {
        top: 10px;
      }
    }
    .el-dialog__body {
      padding: 0;
      .tabActive {
        color: #7c561e;
        font-size: 14px;
        font-weight: 600;
        background: linear-gradient(120deg,#fff7ec,#ffcb7e);
      }
      .tabNoActive {
        color: rgba(255,255,255,.6);
      }
      .el-alert {
        border-radius: 0;
        background: #505050;
        color: #fff;
      }
    }
  }

  .gold-active {
    background: linear-gradient(120deg,#fff7ec,#ffcb7e);
  }

  .tab-title {
    display: flex;
    span {
      text-align: center;
      padding: 10px 0;
      width: 50%;
      background: linear-gradient(120deg,#fff7ec,#ffcb7e);
      &:nth-child(odd) {
        border-radius: 0 50px 0 0;
      }
      &:nth-child(even) {
        border-radius: 50px 0 0 0;
      }
    }
  }
  .list-vip {
    padding: 20px;
    .lab {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      text-align: center;
      height: 200px;
      border: 1px solid #dcdcdc;
      position: relative;
      overflow: hidden;
      &:hover {
        cursor: pointer;
        background: linear-gradient(120deg,#fff7ec,#ffcb7e);
      }
      .title {
        margin-bottom: 20px;
        font-weight: 600;
        font-size: 16px;
        color: #40444b;
      }
      .money {
        font-size: 24px;
        font-weight: 600;
        color: #ba7a5c;
      }
      .unit {
        position: absolute;
        top: -8px;
        display: block;
        transform: rotate(45deg);
        padding: 20px 20px 0 20px;
        right: -25px;
        background-color: #FFCC33;
      }
    }
    .buy-vip-footer {
      padding: 10px 20px;
      margin-top: 20px;
      display: flex;
      align-items: center;
      border: 1px solid #d7d7d7;
      .amount {
        font-size: 20px;
        font-weight: 600;
        color: #ba7a5c;
      }
      .button {
        border-radius: 4px;
        padding: 6px 16px;
        background-color: #fff1df;
        cursor: pointer;
        &:hover {
          background-color: #ffcb7e;
        }
      }
      .close {
        cursor: pointer;
        margin-left: 10px;
      }
    }
  }
</style>
