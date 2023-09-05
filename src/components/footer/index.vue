<template>
  <div class="footer">
    <div class="nav-foot">
      <el-row>
        <el-col :span="4">
          <div>
            <p>购物指南</p>
            <ul>
              <li>购物流程</li>
              <li>会员介绍</li>
              <li>常见问题</li>
              <li>联系客服</li>
            </ul>
          </div>
        </el-col>
        <el-col :span="4">
          <div>
            <p>支付方式</p>
            <ul>
              <li>在线支付</li>
              <li>分期付款</li>
              <li>公司转账</li>
            </ul>
          </div>
        </el-col>
        <el-col :span="4"></el-col>
        <el-col :span="4"></el-col>
        <el-col :span="4"></el-col>
        <el-col :span="4"></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import {mapState} from "vuex";
  export default {
    name: "index",
    data() {
      return {
        article: [],
      }
    },
    created() {
      // this.getClause()
    },
    computed: {
      ...mapState({
        copyright: state => state.site.siteSetting.copyright,
        telegram_service: state => state.site.siteSetting.telegram_service,
      })
    },
    methods: {
      getClause() {
        let params = {
          topping: 1,
          symbol: 'otc.web_article.get_list'
        }
        this.$http({method: 'get', params }).then(res => {
          if (res) {
            let obj = {};
            res.list.forEach((item, index) => {
              const { title } = item.artType;
              if (!obj[title]) {
                obj[title] = {
                  children: []
                }
              }
              obj[title].children.push(item);
            });
            if (obj.hasOwnProperty('服务')) {
              const help = {
                tid: 2,
                title: '帮助中心'
              }
              obj.服务.children.push(help)
            }
            this.article = obj
          }
        })
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/styles/common.less";

  .footer {
    width: 100%;
    background: #eeeeee;
  }
</style>
