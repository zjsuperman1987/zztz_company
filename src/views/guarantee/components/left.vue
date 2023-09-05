<template>
  <div class="container">
    <div>
      <div class="header_title header_box">
        <span class="header">发起方: <span>{{list.uid}}</span> <span>抵押金额:</span> <span class="header">{{list.promoter_promoter}}</span></span>
        <span class="header" v-if="list.joiner !== 0">加入方: <span>{{list.uid}}</span> <span>抵押金额:</span> <span>{{list.promoter_promoter}}</span></span>
        <span class="header" v-if="list.joiner !== 0">观察员: <span>{{list.uid}}</span> <span>抵押金额:</span> <span>{{list.promoter_promoter}}</span></span>
        <span>担保单状态</span> <span>{{list.status}}</span>
        
        
        
        <span class="header middle">担保币种: {{ list.currency_id }}</span>
        <span class="header right">担保ID: {{ list.id }}</span>
        <span class="header">担保金额: </span>
        <span class="header">担保方: </span>
      </div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="担保内容: ">
          <span class="content">{{ list.content }}</span>
        </el-form-item>
      </el-form>
      <div class="header_box">
        
        <div class="add_box">
          
          <div class="control_btn">
            <span>操作: </span>
            <el-button type="primary" icon="el-icon-plus" @click="dialogGuarantee = true" >担保金</el-button >
            <el-button type="primary" @click="openDeal">创建交易单</el-button>
          </div>
        </div>
        <ul v-for="(item, index) in members" :key="index">
          <li class="header_li">
            <span class="header_item">担保方: {{ item.uid }}</span>
            <span class="header_item"
              >担保金额: {{ parseFloat(item.security_deposit)
              }}{{ list.currency_id }}</span
            >
          </li>
        </ul>
      </div>  
    </div>



    <!--交易列表-->
    <h3 style="margin: 0 10px; color: #777">交易列表:</h3>
    <div style="padding: 10px; background: #fff">
      <el-table
        :data="dealList"
        @row-click="rowClick"
        border
        highlight-current-row
        ref="logoList"
      >
        <!-- 展开部分 -->
        <el-table-column type="expand" width="1">
          <template>
            <el-table style="font-size: '12px'">
              <el-table-column
                label="id"
                prop="id"
                width="60"
                align="center"
              ></el-table-column>
              <el-table-column
                label="钱包"
                prop="wallet_id"
                width="70"
                align="center"
              ></el-table-column>
              <el-table-column
                label="内容"
                prop="content"
                width="427"
              ></el-table-column>
              <el-table-column
                label="创建时间"
                prop="create_time"
                width="160"
                align="center"
              ></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          label="ID"
          prop="id"
          width="80"
          align="center"
        ></el-table-column>
        <el-table-column
          label="人数"
          prop="member"
          width="80"
          align="center"
        ></el-table-column>
        <el-table-column
          label="交易量"
          prop="num"
          width="80"
          align="center"
        ></el-table-column>
        <el-table-column
          label="担保金额"
          prop="security_deposit"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" prop="num" align="center" width="180">
          <el-button type="primary" @click="createSonOrder">加入</el-button>
          <el-button type="primary" @click="getRecord">充值记录</el-button>
        </el-table-column>
      </el-table>
      <!-- <div style="text-align: center">
            <el-pagination @current-change="usdtRecord()"
                :current-page.sync="dealListQuery.page" :page-size="dealListQuery.limit" 
              layout="total, prev, pager, next" :total="dealTotal">
            </el-pagination>
        </div> -->
    </div>

    <!--担保金充值列表-->
    <div class="content" v-if="openRecord">
      <template>
        <span style="display: inline-block; margin: 20px 10px 0 10px; font-weight: 700;color: #777;">
          担保金充值列表
        </span>
        <div style="padding: 10px; background: #fff">
          <el-table :data="recordList" size="mini" border>
            <el-table-column
              type="index"
              width="30"
              align="center"
            ></el-table-column>
            <el-table-column
              label="人员"
              prop="uid"
              width="100"
              align="center"
            ></el-table-column>
            <el-table-column
              label="详情"
              prop="rmk"
              width="240"
              align="center"
            ></el-table-column>
            <el-table-column
              label="充值时间"
              prop="create_time"
              width="190"
              align="center"
            ></el-table-column>
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
      </template>
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

    <!-- 担保金额输入弹框 -->
    <el-dialog :visible.sync="dialogGuarantee" width="30%">
      <span style="margin-right: 10px">请输入担保金额:</span>
      <el-input
        v-model="guaranteeNum"
        placeholder="请输入担保金额"
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

export default {
  name: "left",
  data() {
    return {
      form: {
        name: "",
      },
      sponsor_num: null,
      response_num: null,
      guaranteeNum: null, //担保金额
      dialogPayPassword: false, //打开密码输入框
      loading: false,
      dialogGuarantee: false, //打开输入担保金额弹框
      key: null, //控制按钮执行相关函数
      dealList: [], //交易列表
      oid: '', //子单id
      members: [],
      user_guarantee: '',
      formPayPassword: {
        payPwd: "",
      },
      dealTotal: 0,
      dealListQuery: {
        limit: 20,
        page: 1,
      },
      openRecord: false,
      recordList: [],
      recordTotal: 0,
      recordListQuery: {
        limit: 20,
        page: 1,
      },
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
      userID: (state) => state.user.userInfo.id,
      dollarRate: (state) => state.user.rate.BTC.usd,
      payPwd: (state) => state.user.userInfo.paypwd,
      list: (state) => state.order.guarantee_list,
    })
  },
  watch: {
    list: {
      handler() {
        this.getDealOrder();
        // this.getMemberInfo();
      },
      deep: true,
    },
  },
  mounted(){
    // this.getDealOrder()
  },
  methods: {
    // 是否需要输入密码
    Submit() {
      if (!this.guaranteeNum > 0)
        return this.$message.warning("请输入担保金额");
      this.dialogPayPassword = true;
      this.dialogGuarantee = false;
      this.key = 1;
    },

    //验证交易密码
    onSubmit(formName) {
      if (this.payPwd) {
        this.$refs[formName].validate(async (valid, object) => {
          if (valid) {
            this.loading = true;
            if (this.key === 1) this.upGuarantee();
            if (this.key === 2) this.onDeal();
            if (this.key === 3) this.joinOrder();
            this.loading = false;
          } else this.myNotify(object);
        });
      } else this.$router.push({ name: "userInfo" });
    },

    //提交保证金
    async upGuarantee() {
      let params = {
        id: this.list.id,
        amount: this.guaranteeNum,
        pinpass: MD5(this.formPayPassword.payPwd).toString(),
      };
      let res = await myFunctions.post("/WebGuarantee/recharge", params);
      if (res) {
        console.log(res)
        this.$message.success("成功");
        this.dialogPayPassword = false;
        this.$emit("call");
        this.guaranteeNum = null;
        this.formPayPassword.payPwd = "";
      }
    },

    //发起交易
    openDeal() {
      this.dialogPayPassword = true;
      this.key = 2;
    },

    //创建担保交易
    async onDeal(formName) {
      let params = {
        id: this.list.id,
        amount: this.user_guarantee,
        pinpass: MD5(this.formPayPassword.payPwd).toString(),
        content: this.list.content,
        title: this.list.title,
      };
      let res = await myFunctions.post("/WebGuarantee/order", params);
      if (res) {
        console.log(res)
        this.$message.success("成功");
        this.$emit("call");
        this.dialogPayPassword = false;
        this.formPayPassword.payPwd = "";
      }
    },

    //获取交易单列表
    async getDealOrder() {
      let res = await myFunctions.get("/WebGuarantee/DetailOrders", {
        limit: 20,
        page: 1,
        id: this.list.id,
      });
      if (res) {
        for (let prop of res.data) {
          prop.security_deposit = parseFloat(prop.security_deposit);
        }
        this.dealList = res.data;
        console.log(this.dealList)
        this.dealTotal = res.total;
      }
    },

    //获取交易成员详情
    async getMemberInfo() {
      let res = await myFunctions.get("/WebGuarantee/DetailMembers", {
        limit: 20,
        page: 1,
        id: this.list.id,
      });
      if (res) this.members = res.data;
      for (let prop of this.members) {
        if (prop.uid === this.userID) this.user_guarantee = prop.security_deposit;
      }
    },

    //获取充值列表
    async getRecord() {
      this.openRecord = true;
      let res = await myFunctions.get("/WebGuarantee/DetailRecords", {
        limit: 20,
        page: 1,
        id: this.list.id,
      });
      if (res) {
        for (let prop of res.data) {
          prop.create_time = parseTime(prop.create_time);
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
     joinOrder() {
      setTimeout(async() => {
        let params = {
          oid: this.oid,
          pinpass: MD5(this.formPayPassword.payPwd).toString(),
        };
        let res = await myFunctions.post("/WebGuarantee/joinOrder", params);
        console.log(res);
      },300)
    },

    //点击行子交易单函数
    rowClick(row) {
      this.oid = row.id
    }
  },
};
</script>

<style scoped lang="less">
.container {
  padding: 0 5px;
  background: #D8D8D8;

  .header_title {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
  }
  .header_box {
    .add_box {
      display: flex;
      justify-content: space-between;
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

  .content {
    display: block;
    height: 100px;
    border: 1px solid #efefef;
    text-indent: 20px;
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