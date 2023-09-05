<template>
    <div class="container">
        <el-row>
            <el-col :span="24">
                <el-form :model="appealDetails" v-if="appealDetails.snapshot !== undefined">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="订单号：">
                                <span>{{appealDetails.snapshot.sn}}</span>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="创建时间：">
                                <span>{{appealDetails.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="单价：">
                                <span>{{appealDetails.snapshot.unit_price }}</span>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="数量：">
                                <span>{{appealDetails.snapshot.number }}</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="发起人：">
                                <span>{{ appealDetails.uid }}</span>
                                <!-- 联系申诉人 -->
                                <el-button class="chat-btn" @click="getActive(true, appealDetails.uid)">联系申诉人</el-button>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="被发起人：">
                                <span>{{appealDetails.auid }}</span>
                                <!-- 联系被申诉人 -->
                                <el-button class="chat-btn" @click="getActive(true,appealDetails.auid)">联系被申诉人</el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="申诉前状态：">
                                <el-tag v-show="appealDetails.snapshot.status === 0" type="danger">待付款</el-tag>
                                <el-tag v-show="appealDetails.snapshot.status === 1" type="danger">待放币</el-tag>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="操作：">
                                <el-button :disabled="btn_put" v-if="appealDetails.status === 1" size="mini" type="danger"
                                        @click="handleSubmit(2)">放币
                                </el-button>
                                <el-button :disabled="btn_Refund" v-if="appealDetails.status === 1" size="mini"
                                        type="danger" @click="handleSubmit(1)">退币
                                </el-button>
                                <!-- <el-button :disabled="btn_repulse" v-if="appealDetails.status === 1" size="mini"
                                        type="danger" @click="closeAppeal(appealDetails)">打回
                                </el-button> -->
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="申诉原因：">
                        <span>{{appealDetails.reason}}</span>
                    </el-form-item>
                    <el-form-item label="交易双方聊天记录：">
                        <el-button @click="show = !show">查看聊天记录</el-button>
                        <div class="msg-box" ref="msg-box" @scroll="scrollUP" v-if="show">
                            <div style="color: #aaa;text-align: center;margin-top: 5px;">{{loading}}</div>
                            <div :style='{transform:"translateY("+translateY+"px)",transition: transition}'>
                                <div v-for="(i,index) in historyList" :key="index" class="msg"
                                    :style="i.send_uid === appealDetails.uid?'flex-direction:row-reverse':''">
                                    <div v-if="i.tool===1" class="t_group">
                                        {{i.t>=nowDay?new Date(i.t*1000).toLocaleTimeString():new Date(i.t*1000).toLocaleDateString()}}
                                    </div>
                                    <template v-else>
                                        <div class="user-head">
                                            <span>{{ i.send_uid }}</span>
                                        </div>
                                        <!-- 文本 type为1时,对方发送的普通聊天信息-->
                                        <div class="user-msg" v-if='i.content.type===1'>
                                            <div :style="i.send_uid === appealDetails.uid?' float: right;':''"
                                                :class="i.send_uid !== appealDetails.uid?'right':'left'">
                                                {{i.content.msg}}
                                            </div>
                                        </div>
                                        <!--  type为3时,系统发布的订单信息-->
                                        <div class="user-msg" v-if='i.content.type===0'>
                                            <div :style="i.send_uid === appealDetails.uid?' float: right;':''"
                                                :class="i.send_uid !== appealDetails.uid?'right':'left'">
                                                系统: {{ i.content.systemMsg}}
                                                <router-link v-if="i.content.o_type===1"
                                                            :to="{ path: 'order', query: { id: i.content.oid}}">查看
                                                </router-link>
                                            </div>
                                        </div>
                                        <!-- 图片 -->
                                        <div class="user-msg imgBox" v-if='i.content.type===2'>
                                            <div :style="i.send_uid === appealDetails.uid?' float: right;':''"
                                                :class="i.send_uid !== appealDetails.uid?'right':'left'">
                                                <img :src="i.content.img" alt=""></div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <el-badge :value="unread?unread:''" v-if="showTB" class="item caret-bottom">
                            <i class="el-icon-caret-bottom" @click="scrollBottom"></i>
                        </el-badge>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import Viewer from 'v-viewer'
    import 'viewerjs/dist/viewer.css'
    import Vue from 'vue'
    import myFunctions from "@/utils/myFunctions";
    import {mapState} from "vuex";

    Vue.use(Viewer)
    export default {
        name: 'appealDetails',
        data() {
            return {
                historyList: [], //历史聊天记录的数组
                unreadL: [],//聊天框收到的未读消息的距离
                unread: 0,//聊天框收到的未读消息数量

                toID: '',
                id: 0,//this.$route.query.id,
                appealDetails: {},
                messageInfo: [],
                questions: {
                    textarea: '',
                },
                dialogImageUrl: '',
                limitCountImg: 1,
                dialogVisible: false,
                noneBtnImg: false,
                active: false,
                show: false,
                loading: '',
                page: 1,
                limit: 15,
                translateY: 0,//用于实现滚动动画
                transition: '',//用于实现滚动动画
                btn_put: false,
                btn_Refund: false,
                btn_repulse: false,
                lastScrollTop: -1,
                one_day_second: 24 * 60 * 60,
                showTB: false,//是否显示滚动到底部按钮
            }
        },
        computed: {
            ...mapState({
                userID: state => state.user.userInfo.id,   // 用户的id
            }),
            nowDay(){
                const eight_hours_second = 8 * 60 * 60  //8小时秒数
                return parseInt(new Date() / 1000 + '') - parseInt(new Date() / 1000 + '') % this.one_day_second - eight_hours_second   //今日0点时间戳
            },
        },
        created() {
            this.id=sessionStorage.getItem('appealManage')
            this.getDetails()
        },
        methods: {
            async getDetails() {
                let res = await myFunctions.get('Admc2cOrder/appealDetail', {id: this.id})
                if (res) {
                    res.snapshot = JSON.parse(res.snapshot)
                    this.appealDetails = res
                    this.toID = res.uid
                }
                this.checkChatMessage().catch()
            },

            //获取交易双方聊天记录
            async checkChatMessage() {
                let params = {
                    page: 1,
                    limit: 20,
                    send_uid: this.appealDetails.uid,
                    recv_uid: this.appealDetails.auid
                }
                let res = await myFunctions.get('Admc2cOrder/chatList', params)
                let arr = res.data
                for (let prop of arr) prop.content = JSON.parse(prop.content)
                this.historyList = res.data
            },

            // 申诉状态 完成/取消
            handleSubmit(sign) {
                this.$prompt('备注', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputErrorMessage: '输入不能为空',
                    inputValidator: (value) => {       // 点击按钮时，对文本框里面的值进行验证
                        if (!value) return '输入不能为空';
                    },
                }).then(async ({value}) => {
                    let res = await myFunctions.post('Admc2cOrder/update', {id: this.id, opt: sign, reason_adm: value})
                    if (res) {
                        this.getDetails().catch()
                        this.$notify({
                            title: '成功',
                            message: '订单已完成操作',
                            type: 'success',
                            duration: 2000
                        })
                    }
                }).catch(() => {});
            },

            //打开聊天窗口方法
            getActive(is, id) {
                this.active = true
                this.isActive = !this.isActive
                myFunctions.openChat(this.isActive, this.userID, id, is)
            },

            //获取最大滚动高度
            maxScroll() {
                return this.$refs['msg-box'].scrollHeight - this.$refs['msg-box'].clientHeight
            },

            //滚动 节流
            scrollUP: myFunctions.throttle(function (e) {
                if (this.lastScrollTop != -1 && this.lastScrollTop < e.target.scrollTop &&
                    e.target.scrollTop != this.maxScroll()) this.showTB = true
                else this.showTB = false
                for (let i in this.unreadL) {
                    if (this.unreadL[i] - 20 < this.lastScrollTop) {
                        this.unreadL.splice(i, 1)
                        this.unread--
                    }
                }
                if (this.lastScrollTop > e.target.scrollTop && e.target.scrollTop === 0) {
                    this.page++
                    this.getLastMessage()
                }
                this.lastScrollTop = e.target.scrollTop
            },1500),


            // 拉取曾经的聊天信息
            getLastMessage() {
                if (this.loading === '没有更多了') return
                this.loading = '加载中...'
                this.$myFunctions.WsSend({
                    recv_uid: this.appealDetails.uid,  //拉取对方的ID的聊天历史消息,数据由使用当前组件的页面传过来
                    page: this.page,
                    limit: this.limit,
                    type: 5,
                }, (data) => { //拉取同步消息
                    console.log('历史聊天记录', data)
                    if (data) {
                        if (data.data.length > 0) this.lastMsgTime = data.data[0].create_time
                        let last_time = 0, nd = this.nowDay
                        for (let prop of data.data) {
                            prop.content = JSON.parse(prop.content)
                            if (prop.create_time >= nd) {//今天的消息
                                if (last_time !== 0) {
                                    if (last_time - prop.create_time > this.groupInterval) this.historyList.unshift({tool: 1, t: last_time})
                                }
                                last_time = prop.create_time
                            } else {
                                if (last_time >= nd) {
                                    this.historyList.unshift({tool: 1, t: last_time});
                                    last_time = nd - this.one_day_second;
                                } else if (last_time === 0) last_time = nd - this.one_day_second
                                else if (prop.create_time < last_time) {
                                    this.historyList.unshift({tool: 1, t: last_time});
                                    last_time -= this.one_day_second;
                                }
                            }
                            this.historyList.unshift(prop)
                            //标记消息已读
                            if (prop.update_time === 0 && prop.recv_uid === this.userID) this.setReadMsg(prop.send_uid, prop.id)
                        }
                        this.$nextTick(function () {
                            let lsh = this.maxScroll()
                            this.lastScrollTop = this.$refs['msg-box'].scrollTop = lsh - this.lastScrollHeight
                            this.lastScrollHeight = lsh
                        })
                        if (data.data.length === 0 || data.data.length !== 15) {
                            if (last_time) this.historyList.unshift({tool: 1, t: last_time});
                            this.loading = '没有更多了'
                        } else this.loading = '加载更多'
                    }
                })
            },

            // 打回申诉
            closeAppeal(row) {
                this.$prompt('打回申诉理由:', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputErrorMessage: '输入不能为空',
                    inputValidator: (value) => {       // 点击按钮时，对文本框里面的值进行验证
                        if (!value) return '输入不能为空';
                    },
                }).then(async ({value}) => {
                    let res = await myFunctions.post('Admc2cOrder/reject', {id:row.id,reason_adm: value})
                    if (res) {
                        this.getDetails().catch(()=>{})
                        this.btn_repulse = true
                        this.$message.success('打回成功')
                    }
                }).catch(() => {})
            },

            //滚动条到底部
            scrollBottom() {
                this.transition = '.5s'
                let lh = this.maxScroll()
                this.translateY = -(lh - this.$refs['msg-box'].scrollTop);
                setTimeout(() => {
                    this.$refs['msg-box'].scrollTop = lh;
                    this.transition = 'none'
                    this.translateY = 0
                    this.showTB = false
                    this.unread = 0
                    this.unreadL = []
                }, 500)
            },
        }
    }
</script>

<style scoped lang="less">
.container {
    width: 60%;
    .chat-btn {
        border-radius: 8px;
        margin-left: 20px;
        cursor: pointer;
    }

    .msg-box {
        margin: 20px;
        height: 500px;
        overflow: auto;
        overflow-y: scroll;
        scrollbar-track-color: transparent;
        -ms-scrollbar-track-color: transparent;
        box-sizing: border-box;

        .msg {
            width: 95%;
            min-height: 2.5rem;
            padding: 1rem 0.5rem;
            position: relative;
            display: flex;
            box-sizing: border-box;
            // justify-content: flex-start !important;
            .user-head {
                min-width: 2.5rem;
                // width: 20%;
                width: 38px;
                height: 38px;
                line-height: 38px;
                border-radius: 50%;
                background: #f1f1f1;
                display: flex;
                justify-content: center;
                align-items: center;

                .head {
                    width: 1.2rem;
                    height: 1.2rem;
                }

                // position: absolute;
            }

            .user-msg {
                width: 80%;
                // position: absolute;
                word-break: break-all;
                position: relative;
                z-index: 5;
                margin: 0 5px;

                div {
                    display: inline-block;
                    padding: 0.5rem 0.7rem;
                    border-radius: 0.5rem;
                    margin-top: 0.2rem;
                    font-size: 0.88rem;
                }

                img {
                    width: 200px;
                    height: 200px;
                }

                .left {
                    background: white;
                    animation: toLeft 0.5s ease both 1;
                }

                .right {
                    background: #53a8ff;
                    color: white;
                    animation: toright 0.5s ease both 1;
                }

                @keyframes toLeft {
                    0% {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0px);
                    }
                }
                @keyframes toright {
                    0% {
                        opacity: 0;
                        transform: translateX(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0px);
                    }
                }
            }

            .imgBox {
                width: 200px;
                height: 200px;

                display: flex;
                justify-content: center;
                align-items: center;

                img {
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                }
            }
        }
    }
    .caret-bottom {
        position: absolute;
        right: 32px;
        bottom: 28px;
    }

    .el-icon-caret-bottom {

        font-size: 20px;
        background-color: #409EFF;
        border-radius: 50%;
        color: #fff;
        padding: 3px;
        cursor: pointer;
        box-shadow: 0 2px 1px 1px rgb(0 0 0 / 15%), 0 0px 6px 0 rgb(0 0 0 / 20%) !important
    }

    .t_group {
        margin: auto;
        color: #88a;
    }
}
</style>
