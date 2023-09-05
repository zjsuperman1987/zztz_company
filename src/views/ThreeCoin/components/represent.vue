<template>
    <div class="container">
        <el-row v-if="appealList.length>=1">
            <el-col :span="4">
                <div v-if="appealList.length>1">
                    <span style="display:inline-block;padding-bottom: 10px;font-weight: 700;">{{$t('currency.list')}}</span>
                    <div v-for="(item,index) in appealList" :key="index" class="user-left">
                        <div @click="appealDetails(item)" class="user-left-u" :class="{isActive:item.id===s1}">
                            <span>{{ item.snapshot.sn }}</span>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :span="13">
                <div v-if="formRep" class="form-info">
                    <div class="appeal-info">{{$t('currency.info')}}</div>
                    <el-form class="form-item" :show-message="false">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.petitioner')">
                                    {{ formRep.pUserInfo.id }}
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.respondent')">
                                    {{ formRep.aUserInfo.id }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.progress')">
                                    <el-tag size="small" v-show="formRep.status === 0">处理中</el-tag>
                                    <el-tag size="small" v-show="formRep.status === 1 || formRep.status === 2"
                                            type="success">已处理
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.time')" class="time">
                                    {{formRep.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col>
                                <el-form-item :label="$t('currency.reason')">
                                    <p class="reason">{{ formRep.reason }}</p>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                    <div class="appeal-info">{{$t('currency.message')}}</div>
                    <el-form class="form-item" :show-message="false">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.ID')">
                                    {{snapshot.sn}}
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.create_time')" class="time">
                                    {{snapshot.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.unitPrice')">
                                    {{snapshot.unit_price}} CNY
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.totalPrice')">
                                    {{ snapshot.total_price }} CNY
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.order_amount')">
                                    {{parseFloat(snapshot.number)}} BTC
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="$t('currency.orderState')">
                                    <el-tag size="small">{{ statusInfo }}</el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-button type="primary" class="chat" @click="getActive(true)">{{$t('currency.contact')}}
                        </el-button>
                    </el-form>
                </div>
            </el-col>
        </el-row>
        <div v-else style="text-align: center">
            <span>{{ $t('currency.orderInfo.noMessage')}}</span>
        </div>
    </div>
</template>

<script>
    import Avatar from 'vue-avatar'
    import {mapState} from 'vuex'
    import myFunctions from '@/utils/myFunctions'

    export default {
        name: "representation",
        components: {Avatar},
        data() {
            return {
                id: this.$route.query.id,
                statusInfo: '',
                s1: '',
                appealList: [],
                formRep: '',
                snapshot: {},
                chatIdx: '',
                chatService: ['10123', '10125', '10126'],  // 客服人员id列表
            }
        },
        computed: {
            ...mapState({
                userID: state => state.user.userInfo.id,   // 用户的id
                uid: state => (state.user.userInfo.id),
                site_static: state => state.site.siteSetting.site_static,
            })
        },
        created() {
            this.getRep()
        },
        methods: {
            //获取用户申诉列表
            async getRep() {
                let res = await myFunctions.get('WebUser/appealList')
                this.appealList = res.list
                if (res) {
                    for (let prop of this.appealList) prop.snapshot = JSON.parse(prop.snapshot)
                    this.appealDetails(this.appealList[0] || '')
                }
            },
            appealDetails(item) {
                if (item === '') {
                    this.formRep = ''
                    return
                }
                this.s1 = item.id
                this.id = item.id
                if (item.snapshot.s_type === 0) this.statusInfo = (this.uid === item.snapshot.subscribe_id) ? '待转账' : '等待对方转账'
                else this.statusInfo = (this.uid === item.snapshot.subscribe_id) ? '等待对方转账' : '待转账'
                this.formRep = item
                this.snapshot = item.snapshot
            },
            //打开聊天窗口方法
            getActive(is) {
                this.isActive = !this.isActive
                this.chatIdx = this.chatService[Math.floor(Math.random() * 3)] // 随机客服人员id
                myFunctions.openChat(this.isActive, this.userID, this.chatIdx, is)
            },
        }
    }
</script>

<style scoped lang="less">
.container{
    margin-top: 20px;
    .user-left {
        max-height: 600px;
        margin-left: 10px;

        .isActive {
            background-color: #d9d9d9;
        }

        .user-left-u {
            font-weight: 600;
            text-align: center;
            padding: 6px 0;
            cursor: pointer;

            .time {
                font-size: 12px;
                color: #888888;
            }
        }
    }

    .form-info {
        border: 1px solid #d8d8d8;

        .form-item {
            padding: 10px 10px 20px 10px;

            /deep/ .el-form-item {
                margin-bottom: 0;
            }

            /deep/ .el-form-item__content {
                font-size: 12px;
            }

            .reason {
                display: inline-block;
            }

            /deep/ .el-form-item__label {
                padding: 0;
            }

            .chat {
                position: relative;
                left: 460px;
                top: 10px;
            }
        }

        .appeal-info {
            padding-left: 24px;
            line-height: 48px;
            border-bottom: 1px solid #e6ecf2;
            color: #18232d;
            background-color: #f2f6fa;
        }

        .el-form {
            margin-left: 30px;

            /deep/ .el-form-item__label {
                padding-right: 10px;
            }
        }



    }

    ::v-deep {
        .el-col-13{
            margin-top: 25px;
        }
    }

    /* 效果过程 */
    .my-fade-enter-active,
    .my-fade-leave-active {
        transition: all 0.8s linear;
    }
    /* 进场的瞬间与离场的效果添加 */
    .my-fade-enter,
    .my-fade-leave-to {
        opacity: 0;
        transform: translateX(200px);
    }
}

</style>
