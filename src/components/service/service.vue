<template>
    <div class="chat_box" style="z-index: 99;" ref="chat_box">
        <div class="drag_box" draggable="true" @dragstart="dragstart($event)"
             @dragend="dragend($event)" :style="`right:${elRigth}px;bottom:${elBottom}px`" v-if="showChat.show">
            <i class="el-icon-close" @click="show(false)"></i>
            <div class="container">
                <div class="header">
                    <div class="head-box">
                        <span>{{userID?(showChat.toUid?$t('table.chat')+showChat.toUid+ $t('table.contact'):'未选择'):'未登录'}}</span>
                        <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            <el-badge :value="totalUnread?totalUnread:''" class="item"><el-button size="small">{{$t('table.switch')}}</el-button></el-badge>
                        </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item v-for="(i,index) in friendsList" :key="index"
                                                  @click.native="changeF(i)">
                                    <el-badge :value="i.unread?i.unread:''" class="item">{{i.fid}}</el-badge>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                        <el-button size="small" @click="deleteContact" v-if="this.friendsListMap[showChat.toUid]" class="deleteContact">{{$t('table.deleteContact')}}</el-button>
                    </div>
                </div>
                <div class="msg-box" ref="msg-box" @scroll="scrollUP">
                    <div style="color: #aaa;text-align: center;margin-top: 5px;">{{loading}}
                    </div>
                    <div :style='{transform:"translateY("+translateY+"px)",transition: transition}'>
                        <div v-for="(i,index) in list" :key="index" class="msg"
                             :style="i.send_uid === userID?'flex-direction:row-reverse':''">
                            <div v-if="i.tool===1" class="tgroup">{{i.t>=nowday?new
                                Date(i.t*1000).toLocaleTimeString():new Date(i.t*1000).toLocaleDateString()}}
                            </div>
                            <template v-else>
                                <div class="user-head">
                                    <!-- <div class="head" :style="` background: hsl(${getUserHead(i.send_uid,'bck')}, 88%, 62%);
                                  clip-path:polygon(${getUserHead(i.send_uid,'polygon')}% 0,100% 100%,0% 100%);
                                   transform: rotate(${getUserHead(i.send_uid,'rotate')}deg)`"></div> -->
                                    <span>{{i.send_uid === userID?$t('table.me'):$t('table.opposite')}}</span>
                                </div>
                                <!-- 文本 type为1时,对方发送的普通聊天信息-->
                                <div class="user-msg" v-if='i.content.type===1'>
                                    <div :style="i.send_uid == userID?' float: right;':''"
                                         :class="i.userID == userID?'right':'left'">
                                        {{i.content.msg}}
                                    </div>
                                </div>
                                <!--  type为3时,系统发布的订单信息-->
                                <div class="user-msg" v-if='i.content.type===0'>
                                    <div :style="i.send_uid === userID?' float: right;':''"
                                         :class="i.userID !== userID?'right':'left'">
                                        系统: {{ i.content.systemMsg}}
                                        <router-link v-if="i.content.o_type===1"
                                                     :to="{ path: 'orderInfo', query: { id: i.content.oid }}">{{
                                            $t('chat.view')}}
                                        </router-link>
                                    </div>
                                </div>
                                <!-- 图片 -->
                                <div class="user-msg imgBox" v-if='i.content.type===2'>
                                    <div :style="i.send_uid === userID?' float: right;':''"
                                         :class="i.userID === userID?'right':'left'">
                                        <!--  插件控制图片的放大,拖拽  -->
                                        <viewer>
                                            <img :src="i.content.img" alt="">
                                        </viewer>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <el-badge :value="unread?unread:''" v-if="showTB" class="item caret-bottom">
                    <i class="el-icon-caret-bottom" @click="scrollBottom"></i>
                </el-badge>
                <div class="input-box">
                    <el-upload ref="upload" class="avatar-uploader" action=""
                               :multiple="false" :limit="1" :show-file-list="false"
                               accept="image/jpeg,image/jpg,image/png" :disabled="showChat.toUid==0"
                               :http-request="submitPicture">
                        <i class="el-icon-picture-outline" style="font-size: 25px;cursor: pointer"></i>
                    </el-upload>
                    <input @activated="onActivated" type="text" ref="sendMsg" v-model="contentText"
                           @keyup.enter="sendText()"/>
                    <div class="btn" :class="{['btn-active']:contentText}" @click="sendText()">{{$t('table.send')}}
                    </div>
                </div>
            </div>
        </div>
        <el-dropdown class="msg-btn">
            <span class="el-dropdown-link">
                <el-badge :value="totalUnread?totalUnread:''" class="item">
                    <i class="el-icon-chat-dot-round" v-if="!showChat.show" @click="show(true)"></i>
                </el-badge>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(i,index) in friendsList" :key="index" @click.native="changeF(i)">
                    <el-badge :value="i.unread?i.unread:''" class="item">{{i.fid}}</el-badge>
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
    import myFunctions from '@/utils/myFunctions';
    import {mapState} from "vuex";

    export default {
        name: 'service',
        data() {
            return {
                chat_name: this.$route.query.chatName,
                count: 0,
                recv_uid: null, //接收信息用户ID

                list: [], //聊天记录的数组
                page: 1,
                limit: 15,
                loading: '',
                lastScrollTop: -1,
                showTB: false,//是否显示滚动到底部按钮
                unread: 0,//聊天框收到的未读消息数量
                unreadL: [],//聊天框收到的未读消息的距离
                translateY: 0,//用于实现滚动动画
                transition: '',//用于实现滚动动画
                lastScrollHeight: 0,
                nowday: parseInt(new Date() / 1000) - parseInt(new Date() / 1000) % 86400 - 28800,//今日0点时间戳
                lastMsgTime: 0,//上一次消息时间
                groupInterval: 120,//消息分组间隔
                cacheMsg: [],//消息接收时,如果聊天窗口隐藏状态,先缓存

                contentText: "", //input输入的值
                friendsList: [], //好友列表
                friendsListMap: [], //好友列表map
                input: '',
                // 图片
                fileRaw: {},
                fileList: Array,  // 文件合集:主要用来回显
                attachList: Array,  // 文件合集 用来存放[aid]id[/aid]
                idList: Array,  // id合集 存放单独的id数组
                imgUrl: '',
                content: null,
                imgPath: '',
                m_type: 1,
                i_type: 2,

                initWidth: 0,    //父元素的宽-自适应值
                initHeight: 0,   //父元素的高-自适应值
                startClientX: 0, //元素拖拽前距离浏览器的X轴位置
                startClientY: 0, //元素拖拽前距离浏览器的Y轴位置
                elLeft: 0,       //元素的左偏移量
                elRigth: 0,        //元素的右偏移量
                elTop: 0,        //元素的上偏移量
                elBottom: 0,        //元素的下偏移量
            }
        },
        watch: {
            userID: {
                handler(newValue, oldValue) {
                    if (newValue == undefined && oldValue) {//退出登录
                        this.showChat.toUid=0
                        this.list = []
                        this.friendsList = []
                        this.$myFunctions.WsSend({
                            type: 10,
                        }, () => {})
                    } else if (newValue && oldValue == undefined) {//登录
                        this.init()
                    }
                }
            },
            showChat: {
                handler(newValue) {
                    if (newValue.show) {
                        //判断聊天对象是否改变
                        if (newValue.toUid != newValue.toUidOld) {
                            newValue.toUidOld = newValue.toUid
                            this.page = 1
                            this.list = []
                            this.lastScrollHeight = 0
                            this.lastScrollTop = -1
                            this.unread = 0
                            this.unreadL = []
                            if(newValue.toUid){
                            this.loading = '加载中...'
                            this.getLastMessage()
                            }else this.loading = ''
                        } else if(newValue.toUid){
                            this.$nextTick(function () {
                                this.$refs['msg-box'].scrollTop = this.lastScrollTop
                                if (this.unread > 0) {
                                    setTimeout(() => {
                                        this.showTB = true
                                    }, 1)
                                }
                            })
                            if (this.cacheMsg.length > 0) {//展示缓存的消息
                                setTimeout(() => {
                                    for (let v of this.cacheMsg) {
                                        this.pushMsgR(v)
                                        this.setUnread(v.send_uid, -1)
                                    }
                                    this.cacheMsg = []
                                }, 100)
                            }
                        }
                    }
                },
                deep: true,
                immediate: false
            }
        },
        computed: {
            ...mapState({
                token: state => state.user.token,
                userID: state => state.user.userInfo.id,
                showChat: state => {
                    return state.home.showChat
                },
            }),
            totalUnread: function () {
                let t = 0
                for (let v of this.friendsList) t += v.unread
                return t
            },
        },
        created() {
            if(this.userID)this.init()

            //使用方式二定义时  接收的数据
            EventBus.$on('websocketMsg', (data) => {
                if (typeof data.content == 'string') data.content = JSON.parse(data.content)
                console.log('新消息', data)
                if (data.content.type == 1 || data.content.type == 2 || data.content.type == 0) {
                    //判断并添加好友
                    let send_uid = this.userID == data.send_uid ? data.recv_uid : data.send_uid
                    this.addFR2S(send_uid, () => {
                        //判断是否正在聊天
                        if (this.showChat.toUid == send_uid) {
                            //聊天窗口是否正显示
                            if (this.showChat.show) this.pushMsgR(data)
                            else {
                                this.cacheMsg.push(data)
                                this.setUnread(send_uid, 1)
                            }
                        } else this.userID != data.send_uid && this.setUnread(send_uid, 1)  //增加未读数量
                    })
                }
            })

        },
        methods: {
            //初始化
            init(){
            this.$myFunctions.WsSend({
                            token: this.token,
                            type: 9,
                        }, () => {
                            //获取好友列表
                            this.$myFunctions.WsSend({
                                type: 3,//消息类型
                            }, (data) => {
                                if (data.ok) {
                                    this.friendsList = data.data;
                                    if (this.friendsList.length == 0) return
                                    this.$myFunctions.WsSend({
                                        type: 6,//未读消息数量
                                    }, (data) => {
                                        if (data.ok) {
                                            let temp = {}
                                            for (let v of data.data) temp[v.send_uid] = v
                                            for (let v of this.friendsList) {
                                                this.$set(v, 'unread', temp[v.fid] ? temp[v.fid].count : 0)
                                            }
                                            console.log('好友列表', this.friendsList, data.data)
                                        } // else return this.$message.warning('获取好友列表失败')
                                    })
                                    this.friendsListMap = {}
                                    for (let v of this.friendsList) this.friendsListMap[v.fid] = v
                                } // else return this.$message.warning('获取好友列表失败')
                            })
                        })
            },
            //插入消息
            pushMsg(msg) {
                if (msg.create_time - this.lastMsgTime > this.groupInterval) this.list.push({tool: 1, t: msg.create_time});
                this.lastMsgTime = msg.create_time
                this.list.push(msg);
            },
            //插入接收的消息
            pushMsgR(msg) {
                this.pushMsg(msg)
                this.$nextTick(function () {
                    let lh = this.maxScroll()
                    console.log(this.$refs['msg-box'].scrollTop, lh)
                    if (lh > this.$refs['msg-box'].scrollTop) {
                        this.unread++
                        this.unreadL.push(lh)
                        setTimeout(() => {
                            this.showTB = true
                        }, 1)
                    }
                })
                this.userID != msg.send_uid && this.setReadMsg(0, msg.id)
            },
            // 拉取曾经的聊天信息
            getLastMessage() {
                if (this.loading == '没有更多了') return
                this.loading = '加载中...'
                this.$myFunctions.WsSend({
                    recv_uid: this.showChat.toUid,  //拉取对方的ID的聊天历史消息,数据由使用当前组件的页面传过来
                    page: this.page,
                    limit: this.limit,
                    type: 5,
                }, (data) => { //拉取同步消息
                    console.log('历史聊天记录', data)
                    if (data.ok === true) {
                        if (data.data.length > 0) this.lastMsgTime = data.data[0].create_time
                        let lasttime = 0, nd = this.nowday
                        for (let prop of data.data) {
                            prop.content = JSON.parse(prop.content)
                            if (prop.create_time >= nd) {//今天的消息
                                if (lasttime != 0) {
                                    if (lasttime - prop.create_time > this.groupInterval) {//分组
                                        this.list.unshift({tool: 1, t: lasttime})
                                    }
                                }
                                lasttime = prop.create_time
                            } else {
                                if (lasttime >= nd) {
                                    this.list.unshift({tool: 1, t: lasttime});
                                    lasttime = nd - 86400;
                                } else if (lasttime == 0) lasttime = nd - 86400
                                else if (prop.create_time < lasttime) {
                                    this.list.unshift({tool: 1, t: lasttime});
                                    lasttime -= 86400;
                                }
                            }
                            this.list.unshift(prop)
                            //标记消息已读
                            if (prop.update_time == 0 && prop.recv_uid == this.userID) this.setReadMsg(prop.send_uid, prop.id)
                        }
                        this.$nextTick(function () {
                            let lsh = this.maxScroll()
                            this.lastScrollTop = this.$refs['msg-box'].scrollTop = lsh - this.lastScrollHeight
                            this.lastScrollHeight = lsh
                        })
                        if (data.data.length < this.limit) {
                            if (lasttime) this.list.unshift({tool: 1, t: lasttime});
                            this.loading = '没有更多了'
                        } else this.loading = '加载更多'
                    }
                })
            },
            //标记消息已读
            setReadMsg(fid, id, send_uid) {
                this.$myFunctions.WsSend({
                    type: 2,//消息类型
                    id: id,
                    send_uid: send_uid,
                }, (data) => {
                    if (data.ok) {
                        this.setUnread(fid, -1)
                    } else return this.$message.warning('设置已读失败')
                })
            },
            setUnread(fid, v) {
                let fr = this.friendsListMap[fid]
                if (fr) {
                    fr.unread = fr.unread + v
                    if (fr.unread < 0) fr.unread = 0
                }
            },
            //切换聊天对象
            changeF(i) {
                //console.log(i)
                if (this.showChat.toUid != i.fid) this.showChat.toUid = i.fid
                if (!this.showChat.show) this.showChat.show = true
            },
            //判断并添加好友,会发送添加好友请求
            addFR2S(fid, callback) {
                //判断是否是好友
                if (this.userID != fid && !this.friendsListMap[fid]) {
                    this.$myFunctions.WsSend({
                        type: 8,
                        recv_uid: fid
                    }, (data1) => {
                        if (data1.ok) {
                            this.addFR(data1.data)
                            callback()
                        } else return this.$message.warning('添加好友失败')
                    })
                } else callback()
            },
            //添加好友
            addFR(f) {
                f.unread = 0
                this.friendsList.unshift(f)
                this.friendsListMap[f.fid] = f
            },
            //滚动事件
            scrollUP: myFunctions.throttle(function (e) {
                if (this.lastScrollTop != -1 && this.lastScrollTop < e.target.scrollTop &&
                    e.target.scrollTop != this.maxScroll()) this.showTB = true
                else this.showTB = false
                console.log(this.showTB)
                for (let i in this.unreadL) {
                    if (this.unreadL[i] - 20 < this.lastScrollTop) {
                        this.unreadL.splice(i, 1)
                        this.unread--
                    }
                }
                if (this.lastScrollTop > e.target.scrollTop && e.target.scrollTop == 0) {
                    this.page++
                    this.getLastMessage()
                }
                this.lastScrollTop = e.target.scrollTop
            },1500),
            //获取最大滚动高度
            maxScroll() {
                return this.$refs['msg-box'].scrollHeight - this.$refs['msg-box'].clientHeight
            },
            //发送
            sendMsg(msg) {
                //判断并添加好友
                this.addFR2S(this.showChat.toUid, () => {})
                this.$myFunctions.WsSend(msg, (data) => {
                        if (data.ok) {
                            msg.content = JSON.parse(msg.content)
                            this.pushMsg(msg);
                            setTimeout(() => { //让消息的滚动条一直下拉触底
                                this.scrollBottom();
                            }, 500);
                        } else return this.$message.warning('发送失败')
                    }
                )
            },
            //发送聊天信息
            sendText() {
                if (this.showChat.toUid == 0) return this.$message.warning('没有发送的对象')
                let _this = this;
                if (!_this.contentText) return;
                this.sendMsg({
                    send_uid: this.userID,
                    recv_uid: this.showChat.toUid,//接收者
                    type: 1,//消息类型
                    content: JSON.stringify({msg: this.contentText, type: this.m_type}),
                    create_time: parseInt(new Date() / 1000)
                })
                this.contentText = "";     //让发送了的消息清空
            },
            // 发送图片
            submitPicture(file) {
                let formData = new FormData();
                if (this.fileRaw) {
                    formData.append('image', file.file);
                    this.$http('/WebAttach/upload', {
                        headers: {'Content-Type': 'multipart/form-data'},
                        method: 'post',
                        params: {path: this.path, type: this.type, uid: this.userID},
                        data: formData
                    }).then(res => {
                        if (res) {
                            this.id = res.id
                            let path = myFunctions.getImg(res.path)
                            let url = myFunctions.getImg(res.url)
                            this.imgUrl = url
                            this.imgPath = path
                            file.onSuccess(res)
                            this.sendMsg({
                                send_uid: this.userID,
                                recv_uid: this.showChat.toUid,//接收者
                                type: 1,//消息类型
                                content: JSON.stringify({img: this.imgPath, type: this.i_type}),
                                create_time: parseInt(new Date() / 1000)
                            })
                            this.$refs.upload.clearFiles()
                        }
                    })
                }
                setTimeout(() => {
                    this.scrollBottom();
                }, 500);
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
            // 聚焦input输入框
            onActivated() {
                this.$refs.input.focus()
            },

            //拖拽开始事件
            dragstart(e) {
                this.startClientX = e.clientX; // 记录拖拽元素初始位置
                this.startClientY = e.clientY;
            },
            //拖拽完成事件
            dragend(e) {
                console.log(e)
                let x = e.clientX - this.startClientX; // 计算偏移量
                let y = e.clientY - this.startClientY;
                this.elRigth -= x
                this.elBottom -= y
            },
            //显示隐藏聊天框
            show(is) {
                this.showChat.show = is
            },
            //删除联系人
            deleteContact(){
                this.$myFunctions.WsSend({
                        type: 4,
                        recv_uid: this.showChat.toUid,
                    }, (data) => {
                        if (data.ok) {
                            for(let i=0;i<this.friendsList.length;i++){
                                if(this.friendsList[i].fid==this.showChat.toUid){
                                    this.friendsList.splice(i,1)
                                    delete this.friendsListMap[this.showChat.toUid]
                                    break
                                }
                            }
                            this.showChat.toUid=0
                        } else return this.$message.warning('删除失败')
                    }
                )
            },
        },
    }
</script>

<style lang="less" scoped>
    .container {
        height: 500px;
        border: 1px solid #efefef;
        background: #fff;
        position: relative;
        overflow: hidden;
        margin: 0 auto;

        .header {
            height: 40px;
            background: rgb(13, 168, 139);

            .head-box {
                display: inline-block;
                padding-left: 10px;
                font-size: 16px;
                height: 40px;
                line-height: 40px;

                .el-dropdown {
                    position: absolute;
                    left: 110px;
                }
                .deleteContact{
                    position: absolute;
                    left: 160px;
                    margin-top: 11px;
                }
            }
        }

        .friends {
            position: absolute;
            width: 12em;
            height: 550px;
            background: rgb(73, 89, 106);

            .title {
                font-size: 24px;
                color: #fff;
            }

            .friends-list {
                text-indent: 10px;
                height: 30px;
                line-height: 30px;
                font-size: 18px;
                color: #fff;
                background: rgb(54, 62, 71);
            }
        }

        .msg-box {
            position: absolute;
            height: calc(100% - 7rem);
            width: 100%;
            overflow: auto;
            overflow-y: scroll;
            scrollbar-color: transparent transparent;
            scrollbar-track-color: transparent;
            -ms-scrollbar-track-color: transparent;


            .msg {
                width: 95%;
                min-height: 2.5rem;
                margin: 1rem 0.5rem;
                position: relative;
                display: flex;

                .user-head {
                    min-width: 2.5rem;
                    // width: 20%;
                    width: 5rem;
                    height: 2.5rem;
                    border-radius: 8px;
                    background: #f1f1f1;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .head {
                        width: 1.2rem;
                        height: 1.2rem;
                    }
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
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;

                    img {
                        width: auto;
                        max-width: 100%;
                        max-height: 100%;
                    }
                }
            }
        }

        ::-webkit-scrollbar {

            display: none;
        }

        .input-box {
            width: 100%;
            padding: 0 0.5rem;
            position: absolute;
            bottom: 0;
            height: 3.5rem;
            background: #fafafa;
            box-shadow: 0 0 5px #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;

            input {
                height: 2.3rem;
                display: inline-block;
                width: 100%;
                padding: 0.5rem;
                margin-left: 1em;
                border: none;
                border-radius: 0.2rem;
                font-size: 0.88rem;

            }

            .btn {
                height: 2.3rem;
                min-width: 4rem;
                background: #e0e0e0;
                padding: 0.5rem;
                font-size: 0.88rem;
                color: white;
                text-align: center;
                border-radius: 0.2rem;
                margin-left: 0.5rem;
                transition: 0.5s;
            }

            .btn-active {
                background: #409eff;
            }
        }
    }
    .chat_box {
        position: fixed;
        top: 50%;
        left: 50%;
        // transform: translate(-50%, -30%);

        .drag_box {
            position: fixed;
            z-index: 10;
            user-select: none;
            width: 400px;
            height: 500px;
            box-shadow: 0 10px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19) !important;

            .el-icon-close {
                cursor: pointer;
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 99;
                background: white;
                font-size: 24px;
            }
        }
    }

    .msg-btn {
        position: fixed;
        right: 20px;
        bottom: 10px;
    }

    .el-icon-chat-dot-round {
        font-size: 40px;
        cursor: pointer;
    }

    .caret-bottom {
        position: absolute;
        right: 16px;
        bottom: 58px;
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

    .tgroup {
        margin: auto;
        color: #88a;
    }

    .el-badge {
        line-height: initial;
    }
</style>