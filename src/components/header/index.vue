<template>
    <div class="header">
        <!-- 顶部广告栏 -->
        <ad :adList="topAdData" :min_height="min_height" :maxNum="maxNum" :minNum="minNum" :interval="time"></ad>

        <div class="header__content" :style="{ background: theme.headerBgC }">
            <el-row class="row">

                <!-- 电报交易市场 -->
                <el-col :span="4">
                    <ul class="header-left">
                        <li><span class="item" style="color: #67c23a;cursor: pointer;margin-left: 10px;font-size: 16px;"
                                  @click="$router.push({ name: 'home' })">{{ $t('home.indexName') }}</span></li>
                        <li v-if="!isAdm">
                            <el-tooltip placement="bottom-start" :disabled="Boolean(trade_end_time)">
                                <div slot="content" v-if="!isLogin">请先登录</div>
                                <div slot="content" v-if="isLogin && !trade_end_time">交易权限未激活或已过期, 请激活</div>
                                <span v-if="release" :style="{ color: tend_time ? '' : (trade_end_time?'#c45500':'')}"
                                    class="iconfont icon-VIP" @click="getVIPlist(0)"></span>
                            </el-tooltip>
                            <el-tooltip placement="bottom-start" :disabled="Boolean(post_end_time)">
                                <div slot="content" v-if="!isLogin">请先登录</div>
                                <div slot="content" v-if="isLogin && !post_end_time">回复权限未激活或已过期, 请激活</div>
                                <span v-if="reply" :style="{ color: pend_time ? '' : (post_end_time?'#3396FF':'')}"
                                    class="iconfont icon-VIP" @click="getVIPlist(1)"></span>
                            </el-tooltip>
                        </li>
                    </ul>
                </el-col>

                <!--平台公告资讯-->
                <el-col :span="10">
                    <el-carousel :interval="8000" height="30px" direction="vertical" indicator-position="none"
                                 class="carousel">
                        <el-carousel-item v-for="item in options" :key=item.id>
                            <router-link :to="{ name: 'notice-details',query: { id: item.id, type: 'info' } }">
                                <span class="small">{{item.title}}</span>
                            </router-link>
                        </el-carousel-item>
                    </el-carousel>
                </el-col>

                <!--用户导航栏-->
                <el-col :span="10">
                    <ul class="nav-user">
                        <!-- 用户ID -->
                        <li v-if="isLogin">
                            <span class="user">{{ $t('account.id') }}：{{ userID }}</span>
                        </li>
                        <!-- 管理员 -->
                        <li v-if="isLogin && isAdm">
                            <span class="item" type="text" @click="$router.push({ name: 'admin' })">{{ $t('home.admin') }}</span>
                        </li>
                        <!-- 注册 -->
                        <li v-if="!isLogin">
                            <span class="item" type="text" @click="$router.push({ name: 'register' })">{{$t('home.createAccount') }}</span>
                        </li>
                        <!-- 登录 -->
                        <li>
                            <!-- <el-dropdown trigger="hover"> -->
                                <div class="el-dropdown-link nav-link">
                                    <span class="nav-line-1 item" v-if="!isLogin"
                                          @click="$router.push({ name: 'login' })">{{ $t('home.login') }}</span>
                                    <span v-else>
                                        <router-link :to="{ name: 'userInfo' }">
                                            <span class="nav-line-2 item">{{ $t('home.personal') }}</span>
                                        </router-link>
                                       <!-- <span class="nav-line-2 item">{{ $t('home.personal') }}</span> -->
                                       <!-- <i class="el-icon-arrow-down el-icon--right item"></i> -->
                                    </span>
                                </div>
                                <!-- <el-dropdown-menu slot="dropdown" class="header-dropdown"> -->
                                    <!-- <div v-if="!isLogin" style="display: flex;flex-direction: column">
                                        <div class="new item">
                                            <p>{{ $t('home.newAccount') }}</p>
                                            <router-link :to="{ name: 'register' }" class="register">{{
                                                $t('home.createAccount') }}
                                            </router-link>
                                        </div>
                                        <el-divider></el-divider> -->
                                    <!-- </div>  -->
                                    <!-- <ul> -->
                                        <!-- 我的账户 -->
                                        <!-- <li class="item">
                                            <router-link :to="{ name: 'userInfo' }">{{ $t('home.personal') }}
                                            </router-link>
                                        </li> -->
                                        <!-- 我的广告 -->
                                        <!-- <li class="item">
                                            <router-link :to="{ name: 'myAD' }">{{ $t('home.myAD') }}</router-link>
                                        </li> -->
                                        <!-- 我的商品 -->
                                        <!-- <li class="item">
                                            <router-link :to="{ name: 'myGoods' }">{{ $t('home.myGoods') }}
                                            </router-link>
                                        </li> -->
                                        <!-- 发布商品 -->
                                        <!-- <li class="item">
                                            <router-link to="" @click.native="pub">{{ $t('home.publishGoods') }}
                                            </router-link>
                                        </li> -->
                                        <!-- 我的买单 -->
                                        <!-- <li class="item">
                                            <router-link :to="{ name: 'myOrder' }">{{ $t('home.order') }}</router-link>
                                        </li> -->
                                        <!-- 个人钱包 -->
                                        <!-- <li class="item">
                                            <router-link :to="{ name: 'wallet' }">{{ $t('home.wallet') }}
                                            </router-link>
                                        </li>
                                        <el-divider v-if="isLogin"></el-divider> -->
                                        <!-- 退出登录 -->
                                        <!-- <li class="item" v-if="isLogin">
                                            <a @click="handleLogout">{{ $t('home.logOut') }}</a>
                                        </li> -->
                                    <!-- </ul> -->
                                <!-- </el-dropdown-menu>
                            </el-dropdown> -->
                        </li>

                        <!-- 消息 -->
                        <!-- <li v-show="isLogin && !unreadTotal">
                            <router-link class="item" v-show="isLogin" :to="{ name: 'notification' }">
                                {{ $t('home.myNotice')}}
                            </router-link>
                        </li> -->
                        <!-- 未读消息 -->
                        <li v-show="isLogin">
                            <el-button type="text" class="item unread" v-show="isLogin" @click="$router.push({name: 'note'})">
                                <span>
                                    {{ $t('home.myNotice')}}
                                </span>
                                <span class="header-unread-number" v-if="unreadTotal">
                                  {{ this.unreadMessage + this.unreadWords + this.unreadChatNun }}
                                </span>
                            </el-button>
                        </li>

                        <!-- 收藏 -->
                        <li>
                            <span class="item" type="text" @click="$router.push({name: 'favorites'})" v-if="isLogin">
                                <!-- {{ $t('home.favorites', { fav: favoritesTotal }) }} 可以显示收藏条数-->  
                                {{ $t('home.favorites')}}
                            </span>
                        </li>

                        <!-- 客服 -->
                        <!-- <li v-show="isLogin">
                            <div class="item" @click="getActive(true)">{{ $t('home.service')}}</div>
                        </li> -->

                        <!-- 语言选择 -->
                        <li>
                            <lang-select class="item" />
                        </li>

                        <!-- 退出 -->
                        <li v-if="isLogin">
                            <span class="item" @click="handleLogout">{{ $t('home.logOut') }}</span>
                        </li>

                    </ul>
                </el-col>
            </el-row>
        </div>

        <!-- VIP组件 -->
        <vip-dialog :tabIndex="tabIndex" :show.sync="visible"></vip-dialog>
    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions";
    const ad = () => import('@/components/ad/advertisement')
    const vipDialog = () => import('@/components/vip')
    import LangSelect from '@/components/LangSelect'

    const service = () => import('@/components/service/service')
    import {mapState} from 'vuex'

    export default {
        name: "index",
        components: { vipDialog, LangSelect, service, ad},
        data() {
            return {
                exchangeRate: '',  //获取汇率存放
                tabIndex: null,
                visible: false,
                options: [],
                number: '',
                time: 1000,
                isActive: false,  // 聊天窗口是否活跃
                userID: '',  //用户ID
                initWidth: 0,    //父元素的宽-自适应值
                initHeight: 0,   //父元素的高-自适应值
                startClientX: 0, //元素拖拽前距离浏览器的X轴位置
                startClientY: 0, //元素拖拽前距离浏览器的Y轴位置
                elLeft: 0,       //元素的左偏移量
                elTop: 0,        //元素的右偏移量
                chatIdx: '',
                chatService: ['10123', '10125', '10126'],  // 客服人员id列表
                admin: '',  //管理员ID
                topAdData: {},
                min_height: '16px',
                maxNum: 999,
                minNum: 6,
            }
        },
        created() {
            this.userID = localStorage.getItem('uid')
            this.getNotice()
            this.getAdList()
            console.log(this.isAdm)
        },
        computed: {
            unreadChatNun() {
                let num = 0;
                for (let prop of this.unreadChatMessage) num += prop.count
                return num
            },
            unreadTotal() {
                return this.unreadMessage + this.unreadWords + this.unreadChatNun
            },
            ...mapState({
                theme: state => state.settings.theme,
                isLogin: state => state.user.token,
                isAdm: state => state.user.is_adm * 1,
                trade_end_time: state => state.user.userInfo.trade_end_time,
                post_end_time: state => state.user.userInfo.post_end_time,
                favoritesTotal: state => state.user.userInfo.favorite || 0,
                site_name_chars: state => state.site.siteSetting.site_name_chars,
                release: state => state.site.siteSetting.goods_release_chars * 1,
                reply: state => state.site.siteSetting.goods_reply_chars * 1,
                addRoutes: state => state.permission.addRoutes,
                unreadMessage: state => state.unread.unreadMessage,   //未读消息数量
                unreadChatMessage: state => state.unread.unreadChatMessage,   //未读消息数量
                unreadWords: state => state.unread.unreadWords,       //未读留言数量
                tend_time: state => {
                    let time = state.user.userInfo.tend_time * 1000
                    if (time < new Date().getTime()) {
                        return true
                    }
                },
                pend_time: state => {
                    let time = state.user.userInfo.pend_time * 1000
                    if (time < new Date().getTime()) {
                        return true
                    }
                },
            })
        },
        mounted() {
            console.log(this.release)
            console.log(this.reply)
        },
        methods: {
            // 获取vip信息
            getVIPlist(tab) {
                console.log(typeof tab)
                if (!this.isLogin) return
                this.tabIndex = tab
                this.visible = true
            },
            pub() {
                if (this.isLogin) {
                    if (!this.post_end_time) {
                        this.$message.warning(`您当前未激活交易权限或权限已经过期请激活交易权限的商品发布权`)
                        setTimeout(() => {
                            this.tabIndex = 0
                            this.visible = true
                        }, 1000)
                    } else this.$router.push({name: 'publishGoods'})
                } else this.$router.push({name: 'publishGoods'})
            },
            getNotice() {
                this.$http.get('/WebArticle').then(res => {
                    if (res) this.options = res.data;
                })
            },
            //  退出
            handleLogout() {
                this.$store.dispatch('user/logout')
                this.$store.dispatch('unread/getClearWords')
                this.$store.dispatch('unread/getClearMessage')
                this.$store.dispatch('unread/getClearChatMessage')
                this.$store.commit('settings/REMOVE_SETTING')
                this.$store.commit('message/CLEAR_message')
                this.$store.commit('permission/CLEAR_STATE')
                if (this.$route.path !== '/') this.$router.push({path: '/'})
            },
            messageClear() {
                this.$store.commit('message/CLEAR_message')
            },
            //打开聊天窗口方发
            getActive(is) {
                this.isActive = !this.isActive
                this.chatIdx = this.chatService[Math.floor(Math.random() * 3)] // 随机客服人员id
                myFunctions.openChat(this.isActive, this.userID, this.chatIdx, is)
            },
            //获取广告数据
            async getAdList(type) {
                let res = await myFunctions.get('/WebAdv', {type: type})
                if (res) this.topAdData = res
            },
        }
    }
</script>

<style scoped lang="less">
    @import "../../styles/common";

    .header {
        max-width: @maxWidth;
        min-width: @minWidth;
        width: 100%;
        margin: auto;

        .header__content {
            background-color: #545c64;
            padding: 0 8px;
            margin: 0 auto;

            .row {
                padding: 6px 10px 6px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .item {
                    color: rgba(255, 255, 255, 0.8);
                }

                li {
                    display: inline-block;
                }
                
                .carousel {
                    overflow-y: hidden;

                    ::v-deep .el-carousel__item {
                        display: flex;
                        align-items: center;
                    }

                    .small {
                        color: #fff;
                        font-size: 14px;

                        &:hover {
                            color: #c3c3c3;
                        }
                    }

                    ::v-deep .el-carousel__container:hover {
                        .el-carousel__arrow {
                            display: none !important;
                        }
                    }
                }

                .header-left {
                    display: flex;
                    align-items: center;

                    li {
                        margin-right: 20px;

                        .icon-VIP {
                            cursor: pointer;
                            color: rgba(255, 255, 255, 0.4);

                            &:not(:last-child) {
                                margin-right: 10px;
                            }
                        }
                    }


                }

                .nav-user {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: flex-end;

                    li {
                        margin-left: 10px;
                        .item {
                            display: inline-block;
                            height: 18px;
                            line-height: 18px;
                            span{
                                display: inline-block;
                            }
                            .header-unread-number{
                                text-align: center;
                                display: inline-block;
                                color: white;
                                border-radius: 50%;
                                background: #ff0000;
                                line-height: 18px;
                                width: 18px;
                            }
                        }
                        .item:hover{
                            cursor: pointer;
                            color: #c45500;
                        }
                        .user{
                            display: inline-block;
                            height: 18px;
                            line-height: 18px;
                            color: rgba(255, 255, 255, 0.8);
                        }
                        .unread{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                    }

                    .el-dropdown {
                        .el-dropdown-link {
                            cursor: pointer;
                            border: 1px solid transparent;

                            &:focus {
                                border: 1px solid transparent;
                            }

                            .nav-line-1:hover {
                                color: #c45500;
                            }
                        }

                        &:focus {
                            border: 1px solid transparent;
                        }
                    }

                    a {
                        border-radius: @border-radius;
                        border: 1px solid transparent;
                    }

                    
                }
            }
        }
    }

    .chat_box {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -30%);

        .drag_box {
            position: absolute;
            z-index: 10;
            user-select: none;

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
</style>
