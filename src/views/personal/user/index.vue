<!--suppress ALL -->
<template>
  <!-- 我的账户 页面-->
  <div style="height: 100%">
    <el-container class="main">
      <el-aside width="120px">
        <el-menu
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            :router="true" :unique-opened="true"
            :default-active="activeMenu"
            @select="handler"
            class="el-menu-vertical-demo">
          <el-menu-item v-for="item in menuList" :index="item.router" :key="item.id">
            <i :class="item.icon"></i>
            <span slot="title">{{ item.name }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <el-card shadow="hover" class="router-view">
          <transition name="fade-transform" mode="out-in">
            <!-- 登录密码 交易密码 电报账号 组件-->
            <keep-alive exclude="userDetails,QuestionDetails,publishAD">
              <router-view v-if="isRouterAlive"></router-view>
            </keep-alive>
          </transition>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  export default {
    provide() {
      return {
        reload: this.reload
      }
    },
    name: "index",
    data() {
      return {
        isRouterAlive:true
      }
    },
    computed: {
      ...mapState({
        isAdm: state => state.user.userInfo.is_adm,
      }),
      menuList() {
        return [
          { id: 1, router: '/personal/userInfo', icon: 'el-icon-s-custom', name: this.$t('menu.account') },
          { id: 2, router: '/personal/message/note', icon: 'el-icon-message', name: this.$t('menu.msg') },
          { id: 3, router: '/personal/myAD', icon: 'el-icon-s-flag', name: this.$t('home.myAD') },
          { id: 4, router: '/personal/myGoods', icon: 'el-icon-shopping-bag-1', name: this.$t('home.myGoods') },
          { id: 5, router: '/personal/myOrder', icon: 'el-icon-s-order', name: this.$t('menu.buy') },
          { id: 6, router: '/personal/sellOrder', icon: 'el-icon-s-order', name: this.$t('menu.sell') },
          { id: 7, router: '/personal/assets/recharge', icon: 'el-icon-coin', name: this.$t('home.wallet') },
          { id: 8, router: '/personal/feedback-list', icon: 'el-icon-chat-dot-square', name: this.$t('menu.feedback') },
          { id: 9, router: '/personal/more-information', icon: 'el-icon-chat-dot-square', name: this.$t('menu.info') },
          { id: 10, router: '/personal/start-guarantee', icon: 'el-icon-position', name: this.$t('menu.start') },
          { id: 11, router: '/personal/join-guarantee', icon: 'el-icon-connection', name: this.$t('menu.join') },
        ]
      },
      activeMenu() {    // 活跃菜单按钮
        const route = this.$route
        const {meta, path} = route
        if (meta.activeMenu) return meta.activeMenu
        return path
      },
    },
    methods: {
      handler(val) {
        if(val === '/') {
          this.$store.dispatch('user/logout')
          this.$store.commit('settings/REMOVE_SETTING')
          this.$store.commit('message/CLEAR_message')
          this.$store.commit('permission/CLEAR_STATE')
          if (this.$route.path !== '/') this.$router.push({path: '/'})
        }
      },
      reload() {
        this.isRouterAlive = false
        this.$$nextTick(function(){
          this.isRouterAlive = true
        })
      }

    }
  }
</script>

<style scoped lang="less">
  @import "~@/styles/personal/index.less";
</style>
