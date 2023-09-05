<template>
    <div id="app" v-loading="gloading"
    element-loading-text="加载中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
        <router-view v-if="isRouterAlive" :key="$route.fullPath"></router-view>
        <service v-if="readyWebsocket"></service>
    </div>
</template>

<script>

    import store from "@/store";
    import router from '@/router'
    import request from "@/utils/request";
    import Service from "@/components/service/service";
    import {mapState} from 'vuex'

    export default {
        name: 'App',
        components: {Service},
        provide() {
            return {
                reload: this.reload
            }
        },
        data() {
            return {
                isRouterAlive: true,
            }
        },
        computed:{
            ...mapState({
                gloading: state => state.home.gloading,
                readyWebsocket: state => state.home.readyWebsocket,
            })
        },
        sockets: {
            connect: () => {
                console.log("连接成功")
                const engine = window.$socket.io.engine
                engine.once("upgrade", () => {
                    if(engine.transport.name=='websocket'){
                        store.state.home.readyWebsocket=true
                    }else{
                        alert('websocket异常')
                    }
                })
            },
            //自定义事件 买卖双方消息关联
            msg: function (res) {
                //如果是回调消息，就调用回调
                if (res.async) {
                    window['WsSendCallback' + res['async']](res)
                    delete window['WsSendCallback' + res['async']]
                } else {
                    if (res['type'] === 1) {//普通消息
                        res.content = JSON.parse(res.content)
                        if (res.content.type === 0) {//系统消息
                            console.log(1111111111)
                            this.$message.success("你有订单来了!");
                            EventBus.$emit('websocketMsg', res)
                        } else if (res.content.type === 1) {
                            console.log('app.vue', res)
                            this.$message.success("买家已付款!");
                            EventBus.$emit('websocketMsg', res)
                        } else if (res.content.type === 3) {
                            console.log('app.vue', res)
                            this.$message.success("您商城订购的商品有人回应了!");
                            EventBus.$emit('websocketMsg', res)
                        } 
                        else {
                            console.log('app.vue else', res)
                            EventBus.$emit('websocketMsg', res)
                            this.$store.dispatch('unread/getUnreadChatMessage')
                        }

                    } else if (res['type'] === 7) {//通知对方的订单详情 数据更新
                        console.log(res.content.type)
                        if (res.content.type === 0) { //type为0 取消订单
                            this.$message.success("你有订单被取消了!");
                            EventBus.$emit('websocketCancel', res)
                        }
                        if (res.content.type === 2) {  //type为2 商城:告诉卖家有订单来了
                            this.$message.success("你有订单来了!!");
                            this.$store.dispatch('unread/getUnreadMessage')
                            EventBus.$emit('mallGetOrderList', res)
                        }
                        if (res.content.type === 1) {  //type为1 商城: 买家已确认打款
                            this.$message.success("买家已确认打款,请您确认钱到账后打币!!");
                            EventBus.$emit('mallMoneyCome', res)
                        }
                        if (res.content.type === 3) {  //type为3 商城:卖家已放币
                            this.$message.success("卖家已放币!!");
                            EventBus.$emit('mallIconCome', res)
                        }
                        if (res.content.type === 4) {  //type为4 商城:告诉卖家对方申诉了订单
                        }
                        if (res.content.type === 5) {  //type为5 商城:实现留言未读消息实时更新
                            this.$store.dispatch('unread/getUnreadWords')
                        }
                        if (res.content.type === 6) {  //type为6 商城:告诉买方对方退款了
                            this.$message.success("你退款到账了!!");
                            EventBus.$emit('mallRefund', res)
                        }
                        if (res.content.type === 'appeal'||res.content.type === 'appealCancel') {  //法币交易申诉
                            EventBus.$emit('o2owsmsg', res)
                        }
                        if (res.content.type === 7) {  //type为7 担保聊天消息实时更新
                            this.$message.success("你消息来了!!");
                            EventBus.$emit('guarantee_chat', res)
                        }
                        if (res.content.type === 8) {  //type为8 担保申请消息实时更新
                            this.$message.success("你的申请通过了!!");
                            EventBus.$emit('guarantee_apply', res)
                        }
                        if (res.content.type === 9) {  //type为9 担保申请消息实时更新
                            this.$message.success("有人向您提交申请,请尽快处理!!");
                            EventBus.$emit('apply', res)
                        }
                        if (res.content.type === 11) {  //type为11 商品留言信息提醒
                            this.$message.success("你消息来了!!");
                            // EventBus.$emit('apply', res)
                        }
                        EventBus.$emit('websocketOrder', res)
                    }

                }
            },
            //自定义事件
            message: res => {
                if (res.type === 'chat') {
                    if (res.data.uid === store.getters.id) {
                        let v = new Vue()
                        if (res.data.rid) { // 有rid表示是订单
                            let notify = v.$notify({
                                title: '提示',
                                dangerouslyUseHTMLString: true,
                                message: v.$createElement('a', {
                                    style: 'cursor: pointer;color: #409EFF',
                                    on: {
                                        click: () => {
                                            notify.close()
                                            store.commit('goods/changeTab', 'orderList')
                                            router.push({
                                                name: 'goods-details',
                                                query: {oId: res.data.rid, id: res.data.tid}
                                            })
                                        }
                                    }
                                }, res.data.msg),
                                type: 'info',
                                duration: 5000
                            })
                        } else { // 否则就是发送的消息（回复与咨询里面的）
                            let notify = v.$notify({
                                title: '提示',
                                dangerouslyUseHTMLString: true,
                                message: v.$createElement('a', {
                                    style: 'cursor: pointer;color: #409EFF',
                                    on: {
                                        click: () => {
                                            notify.close()
                                            router.push({name: 'note'})
                                        }
                                    }
                                }, res.data.msg),
                                type: 'info',
                                duration: 5000
                            })
                        }
                        store.commit('message/SET_message', res.data)
                    }
                } else {
                    if (res.data.uid === store.getters.id) {
                        let v = new Vue()
                        let notify = v.$notify({
                            title: '提示',
                            dangerouslyUseHTMLString: true,
                            message: v.$createElement('a', {
                                style: 'cursor: pointer;color: #409EFF',
                                on: {
                                    click: () => {
                                        notify.close()
                                        router.push({name: 'note'})
                                    }
                                }
                            }, res.data.msg),
                            type: 'info',
                            duration: 5000
                        })
                    }
                }
            }
        },
        created() {
            this.compareTheme()
            // this.$socket赋值给window，方便调用
            window.$socket = this.$socket

            //全局定义，将eventBus直接绑定到window对象上.
            window.EventBus = new Vue();
        },
        methods: {
            //页面加载方法
            reload() {
                this.isRouterAlive = false
                this.$nextTick(function () {
                    this.isRouterAlive = true
                })
            },
            compareTheme() {
                const themeV = localStorage.getItem('themeV')
                if (!themeV) {
                    console.log('没有版本号,获取版本号并获取主题')
                    this.getThemeVer()
                    this.getTheme()
                } else {  //本地有主题版本 需要对比
                    this.getThemeVer().then(res => {
                        if (Number(res) !== Number(themeV)) {  // 如果不等 重新获取
                            console.log('有版本号但是不一致，接口获取')
                            this.getTheme()
                        } else {   //相等 从缓存获取
                            console.log('未改动,缓存获取')
                            const theme = JSON.parse(localStorage.getItem('theme'))
                            document.body.style.background = theme.bodyBgC
                            store.commit('settings/RESETTING', theme)
                        }
                    })
                }
            },

            getTheme() {
                this.$http.get('/WebHome/getTheme').then(res => {
                    if (res) {
                        localStorage.setItem('theme', JSON.stringify(res))
                        document.body.style.backgroundColor = res.bodyBgC
                        store.commit('settings/RESETTING', res)
                    }
                })
            },

            getThemeVer() {
                return new Promise((resolve) => {
                    request.get('/WebHome/getThemeVer').then(res => {
                        if (res) {
                            localStorage.setItem('themeV', res)
                            resolve(res)
                        }
                    })
                })
            },
        }
    }
</script>

<style lang="less">
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    .header-dropdown {
        min-width: 70px;
        padding: 6px !important;
        /*text-align: center;*/

        a {
            color: #444;

            &:hover {
                color: #c45500 !important;
            }
        }

        .login-button {
            margin: auto;
        }

        .new {
            margin-top: 6px;

            .register {
                color: #1baaec;
            }
        }

        .item {
            padding: 2px 0;
            text-align: right;
        }

        .el-divider--horizontal {
            margin: 6px 0;
        }
    }

    .validate-notify {
        padding: 10px 26px 10px 10px;

        .el-notification__group {
            margin-left: 0;

            .el-notification__title {
                font-size: 14px;
                font-weight: 600;
                color: red;
            }

            .el-notification__closeBtn {
                top: 10px;
            }
        }
    }


    .language-dropdown {
        .el-dropdown-menu__item {
            line-height: 24px;
            padding: 0 6px;
        }
    }
</style>
