<template>
  <div class="container">
    <div>
      <div class="header_title">
        <span class="header">
          <span class="member">发起方: {{list.uid_a}}</span> 
          <span class="amount">抵押金额:</span>
          <span class="header">{{ parseFloat(list.amount_a) }} {{ list.currency_id }}</span>
          <span class="amount">冻结金额:</span>
          <span class="header">{{ parseFloat(list.frozen_a) }} {{ list.currency_id }}</span>
        </span>
        <span class="header" v-if="list.uid_b">
          <span class="member">加入方: {{list.uid_b}}</span>
          <span class="amount">抵押金额:</span> 
          <span class="header">{{ parseFloat(list.amount_b) }} {{ list.currency_id }}</span>
          <span class="amount">冻结金额:</span> 
          <span class="header">{{ parseFloat(list.frozen_b) }} {{ list.currency_id }}</span>
        </span>
        <span class="header" v-if="list.observer">观察员: <span>{{list.observer}}</span></span>
        <span class="header">担保单状态:  {{list.status}}</span>
      </div>
      <div class="des_box">
        <span class="header">担保内容:</span>
        <span class="content">{{ list.content }}</span>
      </div>
      
      <div class="header_box">
        <!-- 创建子单 -->
        <div class="control_btn" v-if="userID === list.uid_a || userID === list.uid_b || isAdm || userID === list.observer">
          <el-form class="form" :model="pay" ref="pay" :rules="rules" size="small" :show-message="false">
            <div class="input_box" v-if="payStatus && payPwd">
              <el-input v-model="deal_amount" placeholder="请输入金额"></el-input>
              <el-input v-model="deal_text" placeholder="请输入标题"></el-input>
              <el-button type="primary" :loading="submitLoading" size="mini" @click="onDeal"  >
                  {{ payPwd ? $t('goodsDetails.buyer.buttonCreate') : $t('goodsDetails.buyer.setPwd')}}
              </el-button>
            </div>
            <div class="check_box" v-else>
              <span>请先核对交易密码:</span>
              <el-input size="mini" style="width: 35%;margin: 0 10px" v-model="pay.payPassword"
                                          @keyup.enter.native="checkPassword('pay')" type="password"
                                          :placeholder="$t('goodsDetails.buyer.desInput')">
              </el-input>
              <el-button type="primary" :loading="submitLoading" size="mini"
                        @click="payPwd ? checkPassword('pay') : $router.push({name: 'userInfo'})">
                        {{ payPwd ? $t('goodsDetails.buyer.sureBtn') : $t('goodsDetails.buyer.setPwd')}}
              </el-button>
            </div>
            <el-button type="primary" @click="getRecord">查看资金记录</el-button>
          </el-form>
        </div>

        <!--担保子单子列表-->
        <guarantee-item></guarantee-item>

        <!--担保金充值列表-->
        <div class="charge_box" v-if="openRecord">
          <span class="charge_title">
            担保金流水:
          </span>
          <el-table :data="recordList" size="mini" border>
            <el-table-column type="index" width="50" align="center"></el-table-column>
            <el-table-column label="类型" prop="type" align="center"></el-table-column>
            <el-table-column label="手续费" prop="fee" align="center"></el-table-column>
            <el-table-column label="充值时间" prop="create_time" align="center"></el-table-column>
          </el-table>
          <div style="text-align: center">
            <el-pagination
              @current-change="getRecord()"
              :current-page.sync="recordListQuery.page"
              :page-size="recordListQuery.limit"
              layout="total, prev, pager, next"
              :total="recordTotal"
            >
            </el-pagination>
          </div>
        </div>

      </div>  
    </div>

    <!--    交易密码弹窗-->
    <el-dialog
      title="请输入交易密码"
      :visible.sync="dialogPayPassword"
      :close-on-click-modal="false"
      v-dialog-drag
      custom-class="width400"
    >
      <el-form
        :model="formPayPassword"
        ref="formPayPassword"
        :rules="rules"
        @submit.native.prevent
        :show-message="false"
      >
        <el-form-item prop="payPwd">
          <el-input
            @keyup.enter.native="onSubmit('formPayPassword')"
            type="password"
            size="small"
            v-model="formPayPassword.payPwd"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          type="primary"
          :loading="loading"
          @click="onSubmit('formPayPassword')"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 金额输入弹框 -->
    <el-dialog :visible.sync="dialogGuarantee" width="30%">
      <span style="margin-right: 10px">请输入金额:</span>
      <el-input
        v-model="guaranteeNum"
        placeholder="请输入金额"
        style="width: 200px"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogGuarantee = false">取 消</el-button>
        <el-button type="primary" @click="Submit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import myFunctions from "@/utils/myFunctions";
import { MD5 } from "crypto-js";
import { mapState } from "vuex";
import { param, parseTime } from "@/utils";
const guaranteeItem = () => import('./components/guaranteeItem')
export default {
  name: "left",
  components: {guaranteeItem},
  data() {
    return {
      applyList: [],  //申请列表
      isShow: true,
      deal_amount: null, //交易单金额
      deal_text: null,   //交易名称
      form: {
        name: "",
      },
      pay: {
        payPassword: ''
      },
      submitLoading: false,
      sponsor_num: null,
      response_num: null,
      guaranteeNum: null, //金额
      dialogPayPassword: false, //打开密码输入框
      loading: false,
      dialogGuarantee: false, //打开输入担保金额弹框
      key: null, //控制按钮执行相关函数
      dealList: [], //交易列表
      oid: '', //子单id
      members: [],
      formPayPassword: {
        payPwd: "",
      },
      dealTotal: 0,
      openRecord: false,
      recordList: [],
      recordTotal: 0,
      recordListQuery: {
        limit: 20,
        page: 1,
      },

      radio: 1,
      payer: '',  //需要理赔的一方(受害方)
      payDialog: false, //管理员理赔弹窗管理
      uid_a: '',
      uid_b: '',
      rules: {
        payPwd: [
          { required: true, message: "【请输入密码】", trigger: "blur" },
          {
            pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/,
            message: "【格式错误，字母数字特殊三选二，最少6位】",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    ...mapState({
      token: state => state.user.token,
      userID: (state) => state.user.userInfo.id,
      dollarRate: (state) => state.user.rate.BTC.usd,
      payPwd: (state) => state.user.userInfo.paypwd,
      payStatus: state => state.user.userInfo.verify_pinpass,
      list: (state) => state.order.guarantee_list,
      isAdm: state => state.user.userInfo.is_adm,
    })
  },

  methods: {
    // 是否需要输入密码
    Submit() {
      if (!this.guaranteeNum > 0)
        return this.$message.warning("请输入金额");
      this.dialogPayPassword = true;
      this.formPayPassword.payPwd = ''
      this.deal_amount = null
    },

    //核对密码
    checkPassword(form) {
        if(!this.token) return this.$router.push({name: 'login'})
        if(!this.payPwd) return this.$router.push({name: 'userInfo'})
        if (this.token && this.payPwd) {
            this.$refs[form].validate(async(valid, object) => {
                if(!valid) this.$validateNotify(object)
                let params = { password: MD5(this.pay.payPassword).toString() }
                if(valid) {
                    let res = await myFunctions.post('WebUser/verifyPinpass', params)
                    if(res) {
                        this.$message.success(this.$t('$message.success'))
                        this.$store.dispatch('user/getInfo')
                        this.$store.commit('goods/changeTab', 'orderList')
                        this.$store.commit('goods/refresh', new Date().getTime())
                        this.$emit('refreshInfo')
                        this.pay.password = ''
                    }
                }
            })
        }
    },


    //验证交易密码
    onSubmit(formName) {
      if (this.payPwd) {
        this.$refs[formName].validate(async (valid, object) => {
          if (valid) {
            this.loading = true;
            if (this.key === 1) this.upGuarantee();
            if (this.key === 2) this.onDeal();
            this.loading = false;
          } else this.myNotify(object);
        });
      } else this.$router.push({ name: "userInfo" });
    },

    //发起交易
    openDeal() {
      this.dialogPayPassword = true;
      this.key = 2;
    },

    //创建担保交易
    async onDeal(formName) {
      if(this.deal_amount <= 0) return this.$message.warning('请输入交易金额!!')
      if(!this.deal_amount) return this.$message.warning('请输入名称')
      let params = {
        id: this.list.id,
        amount: this.deal_amount,
        pinpass: MD5(this.formPayPassword.payPwd).toString(),
        content: this.list.content,
        title: this.deal_text,
      };
      let res = await myFunctions.post("/WebGuarantee/order", params);
      if (res) {
        console.log(res)
        this.$message.success("成功");
        this.$emit("call");
        this.dialogPayPassword = false;
        this.formPayPassword.payPwd = "";
        this.deal_amount = ''
        this.deal_text = ''
      }
    },

    //获取充值列表
    async getRecord() {
      this.openRecord = !this.openRecord;
      let res = await myFunctions.get("/WebGuarantee/DetailRecords", {
        limit: 20,
        page: 1,
        id: this.list.id,
      });
      if (res) {
        for (let prop of res.data) {
          prop.create_time = parseTime(prop.create_time);
          prop.fee = parseFloat(prop.fee)
          if(prop.type === 1) prop.type = '充值'
          if(prop.type === 2) prop.type = '撤资'
          if(prop.type === 3) prop.type = '补偿'
          if(prop.type === 4) prop.type = '赔偿'
          if(prop.type === 5) prop.type = '冻结'
          if(prop.type === 6) prop.type = '解冻'
        }
        this.recordTotal = res.total;
        this.recordList = res.data;
      }
    },

    //创建子交易单
    createSonOrder() {
      this.dialogPayPassword = true;
      this.key = 3;
    },

    // 加入子交易单
    async joinOrder(row, val) {
      if(this.userID === row.uid) return this.$message.warning('您已加入, 不用再加入了!!')
      if(this.userID === this.list.uid && row.confirm_b === 2) return this.$message.warning('您已加入, 不用再加入了!!')
      if(this.userID !== this.list.uid_b && row.confirm_b === 1) return this.$message.warning('您暂无权限加入!!') 
      let params = { oid: row.oid, opt: val };
      let res = await myFunctions.post("/WebGuarantee/joinOrder", params);
      if(res) this.getDealOrder();
    },

    //点击行子交易单函数
    rowClick(row) {
      this.oid = row.id
      console.log(row.id)
    },

    //完成子单子交易
    async complete( row ) {
      let res = await myFunctions.post('/WebGuarantee/completeOrder',{oid: row.oid})
      if(res) this.getDealOrder()
      this.$message.success('你已完成交易')
    },

    //查看我的申请和通过其他人的申请 列表
    view() {
        this.pass = !this.pass
        if(this.pass) this.getApplyList()
    },

    
    // 管理员强制取消或者完成 子单子
    async admHandler(row, val) {
        let res = await myFunctions.post('/WebGuarantee/admDealOrder', {oid: row.oid, opt: val})
        if(res) this.getDealOrder()
    },

    //管理员理赔提交
    async paySubmit() {
        if(this.radio === '1') this.payer = this.uid_a
        if(this.radio === '2') this.payer = this.uid_b
        let params = { oid:this.oid,payer: this.payer, amount: this.formPay.amount }
        let res = await myFunctions.post('/WebGuarantee/admCompensate',params)
        if(res) {
            this.getDealOrder()
            this.payDialog = false
            console.log(res)
            this.$message.success('理赔成功!')
        } 
    },
    
  },
};
</script>

<style scoped lang="less">
.container {
  // margin: 0 5px;

  .header_title {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #D8D8D8;
    padding: 10px;

    .header {
      font-size: 14px;
      font-weight: 700;
      margin-right: 20px;

      .amount{
        margin-left: 10px;
      }

      .member{
        font-weight: 700;
        display: inline-block;
        width: 80px;
      }
    }
  }
  .des_box{
    background: #B6C6E7;
    padding-bottom: 1px;
    overflow: hidden;

    .header{
      display: inline-block;
      font-size: 14px;
      font-weight: 700;
      margin: 5px 0 0 10px;
    }

    .content {
      display: block;
      height: 100px;
      margin: 5px 10px 5px;
      border: 1px solid #efefef;
      text-indent: 20px;
      box-sizing: border-box;
    }
  }
  .header_box {
    background: #DEEAF6;

    .control_btn{
      padding: 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .input_box{
        display: inline-block;
        .el-input {
          width: 100px;
          margin-right: 6px;

        }
      }
      .check_box{
        display: inline-block;
        width: 280px;

      }
      .el-button{
        margin-right: 8px;
      }
    }
    .deal_box{
      margin: 10px;
      padding: 10px;
      background: #fff;
    }
    .charge_title {
      display: inline-block; 
      margin-bottom: 5px;
      font-weight: 700;
      color: #777;
    }
    .charge_box{
      margin: 10px;
      padding: 10px;
      background: #fff;
    }
    .header {
      display: inline-block;
      text-align: left;
      padding: 6px 10px;
      line-height: 24px;
      font-size: 16px;
      font-weight: 700;
      color: #777;
    }
    .header_li {
      margin: 5px 0 15px 20px;

      .header_item {
        margin-right: 20px;
      }
    }
  }



  .control {
    display: flex;
    justify-content: space-between;
    margin: 0 20px;
    ::v-deep {
      .el-input {
        display: inline-block;
        width: 35%;
        margin-left: 15px;
      }
    }
    .amount {
      margin: 15px;
    }
    .control_btn {
      display: inline-block;
      text-align: right;
      padding-bottom: 10px;
      box-sizing: border-box;

      span {
        margin-right: 10px;
      }
    }
  }
}
</style>