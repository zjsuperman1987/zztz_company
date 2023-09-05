<template>
  <div class="demo">
    <div class="btn_box">
      <el-button  size="mini" v-for="(tab, index) in tabs" :key="index" type="primary"
                  :class="['tab-button', { active: currentTab === index }]" @click="changeTab(index)">
        {{ tab }}
      </el-button>
    </div>
    <div class="container">
      <el-container class="main">
        <el-aside width="120px" class="aside">
          <el-menu
            @select="handleOpen"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            :default-active="currentTabComponent"
          >
            <el-menu-item
              v-for="(item) in addRoutes"
              :key="item.id"
              :index="item.component"
            >
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

      <component :is="currentTabComponent" @openByName='openByName'></component>
      </el-container>
    </div>
  </div>
</template>

<script>
import myFunctions from "@/utils/myFunctions";

const acceptanceManage = () => import("@/views/personal/btcAdmin/acceptanceManage");
const appealManage = () => import("@/views/personal/btcAdmin/appealManage");
const appealDetails = () => import("@/views/personal/btcAdmin/appealDetails");
const orderManage = () => import("@/views/personal/btcAdmin/orderManage");
const assetsManage = () => import("@/views/personal/admin/assetsManage");
const adManage = () => import("@/views/personal/admin/adManage");
const themeSettings = () => import("@/views/personal/admin/themeSettings");
const information = () => import("@/views/personal/admin/information");
const publishAD = () => import("@/views/AD/publishAD");
const questionsManage = () => import("@/views/personal/admin/questionsManage");
const questionsDetails = () => import("@/views/personal/admin/questionsDetails");
const btcManage = () => import("@/views/personal/admin/btcManage");
const userGroup = () => import("@/views/personal/admin/userGroup");
const userDetails = () => import("@/views/personal/admin/userDetails");
const menuManage = () => import("@/views/personal/admin/menuManage");
const userManage = () => import("@/views/personal/admin/userManage");
const siteSetting = () => import("@/views/personal/admin/siteSetting");

const goodsManage = () => import("@/views/personal/admin/goodsManage");
const replyManage = () => import("@/views/personal/admin/replyManage");
const reasonManage = () => import("@/views/personal/admin/reasonManage");
const mediationManage = () => import("@/views/personal/admin/mediationManage");
const complaintManage = () => import("@/views/personal/admin/complaintManage");
const suspendManage = () => import("@/views/personal/admin/suspendManage");
const sortManage = () => import("@/views/personal/admin/sortManage");

const order = () => import("@/views/personal/admin/orderManage");
const appeal = () => import("@/views/personal/btcAdmin/appealManage");

const publishInformation = () => import("@/views/AD/publishAD");
const guaranteeManage = () => import("@/views/personal/admin/guaranteeManage");
const guaranteeAppeal = () => import("@/views/personal/admin/guaranteeAppeal");
export default {
  name: "index",
  components: {
    guaranteeManage,
    guaranteeAppeal,
    publishInformation,
    userDetails,
    acceptanceManage,
    appealManage,
    appealDetails,
    orderManage,
    appeal,
    assetsManage,
    adManage,
    themeSettings,
    information,
    publishAD,
    questionsManage,
    questionsDetails,
    btcManage,
    userGroup,
    menuManage,
    userManage,
    siteSetting,
    goodsManage,
    replyManage,
    reasonManage,
    mediationManage,
    complaintManage,
    suspendManage,
    sortManage,
    order,
  },
  data() {
    return {
      tabs: ["网站管理", "商品交易", "法币买卖", "担保交易"],
      add: [], // 站点名称
      addRoutes: [],
      currentTab: 0,
      tables: ["webManage", "mall", "currencyManage", "guarantee"],
      currentTabComponent: '',
    };
  },
  watch:{
    currentTabComponent: function (val, oldVal) {
      console.log(val,oldVal)
      sessionStorage.setItem('admcurrentTabComponent',val)
    },
    currentTab: function (val, oldVal) {
      sessionStorage.setItem('admcurrentTab',val)
    }
  },
  created() {
    let tab=sessionStorage.getItem('admcurrentTab')
    this.changeTab(tab!=null?tab:0)

    this.currentTabComponent=sessionStorage.getItem('admcurrentTabComponent')?sessionStorage.getItem('admcurrentTabComponent'):this.currentTabComponent
  },
  methods: {
    //获取名称列表
    async getRoute(val) {
      let res = await myFunctions.get("/WebUser/routes", { type: val });
      if (res) this.addRoutes = res;
      console.log(res)
    },
    changeTab(val) {
      val=parseInt(val)
      this.currentTab = val;
      if (val == 0) this.currentTabComponent = 'assetsManage'
      if (val == 1) this.currentTabComponent = 'goodsManage'
      if (val == 2) this.currentTabComponent = "acceptanceManage"
      if (val == 3) this.currentTabComponent = "guaranteeManage"
      this.getRoute(val+1);
    },

    handleOpen(key) {
      this.addRoutes.map((item) => {
        if (key == item.component) {
          this.currentTabComponent = item.component
        }
      })
    },
    openByName(name){console.log(name)
      this.currentTabComponent = name
    },
  },
};
</script>

<style scoped lang="less">
@import "../../../styles/personal/index";
.demo {
  font-family: sans-serif;
  border-radius: 2px;
  margin: 5px 0 40px;
  user-select: none;
  .btn_box {
    margin-bottom: 5px;
  }
  .tab-button {
    margin-left: 10px;
  }
  .tab-button:hover {
    background: #e0e0e0;
    color: #0a0a0a;
  }
  .tab-button.active {
    background: #e0e0e0;
    color: #0a0a0a;
  }

  .aside {
    min-height: 700px;
  }
}

@import "~@/styles/common.less";
@line-height: 30px; //头部行高
@border-bottom: #e6ecf2; //个人中心下横线
@bg-color: #9bf0d6; // 头部标题背景色
@lineHeight-des: 24px; //行内文字行高
@img-size: 30px; //图片大小

.main {
  max-width: @maxWidth;
  min-width: @minWidth;
  margin: auto;
  background-color: #f0f0f0;
  height: 100%;
  ::v-deep .el-menu {
    height: 100%;
    padding-top: 10px;
    .el-menu-item {
      min-width: 0;
      line-height: 30px;
      height: 30px;
    }
  }
  ::v-deep .el-main {
    padding: 10px;
    .el-card__body {
      padding: 10px;
    }
  }
}
</style>
