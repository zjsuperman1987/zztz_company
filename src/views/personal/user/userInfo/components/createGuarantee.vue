<template>
  <div class="container">
    <!-- 创建担保 -->
    <span class="title">请填写名称:</span>
    <el-input v-model="input" placeholder="担保名称:"></el-input>
    <div class="select_content">
      <div class="select_box">
        <span class="radio">请选择币种:</span>
        <el-radio v-model="radio" :label="1">BTC</el-radio>
        <el-radio v-model="radio" :label="2">USDT</el-radio>
      </div>
      <div class="select_box">
        <span class="radio">是否公开:</span>
        <el-radio v-model="radio1" :label="1">公开</el-radio>
        <el-radio v-model="radio1" :label="2">私密</el-radio>
      </div>
    </div>
    <ubb-textarea v-model="textarea" path="goods" ref="textarea" :title="$t('guarantee.createInfo')"
                  :idList="idList" :fileList="fileList" :attachList="attachList">
    </ubb-textarea>

    <div class="footer">
      <el-button @click="$router.push({name:'start-guarantee'})">取 消</el-button>
      <el-button type="primary" @click="createGuarantee">确 定</el-button>
    </div>
  </div>
</template>

<script>
import myFunctions from "@/utils/myFunctions";
const ubbTextarea = () => import('@/components/textarea/index')
export default {
  name: "create",
  components: { ubbTextarea },
  props: {
    open: Boolean,
  },
  data() {
    return {
      dialogGuarantee: this.open,
      radio: 1,
      radio1: 1,
      input: "",
      textarea: "",
      idList: [],
      fileList: [],
      attachList: [],
    };
  },
  methods: {
    // 创建担保
    async createGuarantee() {
      if(this.title === '') return this.$message.error('请填写名称')
      if(this.textarea === '') return this.$message.error('请填写担保内容')
      let res = await myFunctions.post("/WebGuarantee/Save", {
        title: this.input,
        content: this.textarea,
        currency_id: this.radio,
        secrecy: this.radio1,
        attach: this.idList.length ? this.idList.toString() : 0
      });
      this.dialogGuarantee = false;
      this.input = "";
      this.textarea = "";
      this.comeback()
    },
    //返回
    comeback() {
      this.$router.push('start-guarantee')
    }
  },
};
</script>

<style scoped lang="less">
.container {
  height: 80%;
  margin: 50px 250px;
  padding: 20px;
  border: 1px solid #ededed;
  box-sizing: border-box;
  border-radius: 10px;
  // background: #b96e6e3f;
  // color: #fff;
  .title{
    margin: 0 15px 0 20px;
  }
  .select_content{
    display: flex;
    justify-content: space-between;
    margin:20px;
    .select_box{
      display: inline-block;
      .radio {
      margin-right: 10px;
    }
    }
  }

  .footer{
    margin: 20px 20px 20px 0;
    text-align: right;
  }
}
::v-deep {
    .el-box {
      padding: 5px 0;
    }

    .el-input {
      display: inline-block;
      padding: 10px 0;
      width: 60%;
    }

    .el-input__inner{
      width: 60%;
    }

}
</style>