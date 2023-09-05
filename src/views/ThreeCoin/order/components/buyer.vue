<template>
    <div>
        <div class="main-left-bottom">
            <!--       订单正常进入时展示-->
            <el-row class="bottom-show" v-if="data.status === 0 || data.status === 1">
                <el-col :span="12">
                    <div class="bottom-top-left">
                        <span> {{ data.appeal==0 ? (desText + '&emsp;' + lastPayTime) : $t('currency.orderInfo.wait') }}</span>
                        <span class="money">{{data.total_price }} <sub>CNY</sub></span>
                    </div>
                </el-col>
                <el-col :span="12">
                    <div>
                        <template v-if="data.appeal === 0">
                            <el-button @click.native="payed(data.id)" type="primary" :loading="buttonLoading" size="small"
                                    :disabled="noClickBtn">{{buttonText}}
                            </el-button>
                        </template>
                        <el-button @click="getActive(true)">{{$t('goodsDetails.contactSeller')}}
                        </el-button>
                    </div>
                    <div class="main-left-cancel">
                        <el-button size="mini" type="text" @click="dialogAppeal = true">
                            {{ appealStatus }}
                        </el-button>
                        <el-button size="mini" type="text" @click="cancelOrder" :disabled="noClick"
                                   v-if="data.status === 0">{{$t('button.cancel')}}
                        </el-button>
                    </div>
                </el-col>
            </el-row>
            <!--       订单处于完成状态的时候显示-->
            <div class="bottom-hide" v-if="data.status === 2 || data.status === 5">
                <div class="hide-item">{{$t('currency.orderInfo.completed')}}</div>
                <div @click="getActive(true)" class="contact">{{$t('goodsDetails.contactSeller')}}</div>
            </div>

            <!--       订单已取消状态-->
            <div class="bottom-hide" v-if="data.status === 3 || data.status === 4">
                <div class="hide-item">{{$t('currency.orderInfo.canceled')}}</div>
                <div @click="getActive(true)" class="contact">{{$t('goodsDetails.contactSeller')}}</div>
            </div>
        </div>

        <!-- 申诉提醒弹窗 -->
        <el-dialog :title="$t('currency.orderInfo.question')" :visible.sync="dialogAppeal" v-dialog-drag
                   :close-on-click-modal="false" custom-class="width500">
            <appeal-text></appeal-text>
            <div class="appeal-btn">
                <el-button size="small" type="primary" @click="appeal">{{$t('currency.orderInfo.appeal')}}</el-button>
            </div>
        </el-dialog>

        <!--    申诉弹窗-->
        <el-dialog title="申诉" :visible.sync="diaAppeal" v-dialog-drag
                   :close-on-click-modal="false" custom-class="width400">
            <el-form @submit.native.prevent :show-message="false">
                <el-form-item label="问题描述：" required>
                    <el-input @keyup.enter.native="submitAppeal" size="small"
                              type="textarea" :rows="5" placeholder="请输入您遇到的问题" v-model="textarea"></el-input>
                </el-form-item>
                <el-form-item class="appeal-btn">
                    <el-button size="small" type="primary" @click="submitAppeal">提交</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions";
    import appealText from "@/views/ThreeCoin/order/components/appealText";

    export default {
        inject: ['reload'],
        name: "buyer",
        components: { appealText },
        props: {
            data: Object,
            user: Object,
        },
        data() {
            return {
                buttonLoading: false,
                noClickBtn: false,
                noClick: false,
                timer: null,  // 倒计时
                lastPayTime: '', // 最后支付时间
                desText: '',  // 描述性文字
                buttonText: '',  // 按钮文字
                textarea: '',
                dialogAppeal: false,
                diaAppeal: false,
                chatId: this.user.toUid,
            }
        },
        watch: {
            data: {
                handler(val) {
                    if (val.self === 1) {
                        if (val.s_type === 0) {
                            this.desText = '请向对方转账'
                            this.buttonText = '已完成转账,下一步'
                            if (val.status === 1) {
                                this.buttonText = '等待对方放币'
                                this.desText = '等待对方放币'
                                this.noClickBtn = true
                            }
                        } else {
                            this.noClick = true
                            this.desText = '等待对方转账'
                            this.buttonText = '等待对方付款'
                            if (val.status === 1) {
                                this.desText = '对方已完成转账，可以放币了'
                                this.buttonText = '确认放币'
                            }
                        }
                    } else {
                        if (val.s_type === 0) {
                            this.noClick = true
                            this.desText = '等待对方转账'
                            this.buttonText = '等待对方付款'
                            if (val.status === 1) {
                                this.buttonText = '确认放币'
                                this.desText = '确认放币'
                                this.noClick = false
                            }
                        } else {
                            this.desText = '请向对方转账，'
                            this.buttonText = '我已完成转账，下一步'
                            if (val.status === 1) {
                                this.buttonText = '等待对方放币'
                                this.desText = '等待对方放币'
                                this.noClickBtn = true
                            }
                        }
                    }
                    this.countDown(val,val.end_time)
                },
                deep: true,
                immediate: true
            },
            async dialogAppeal(newName) {
                if (newName === true && this.data.appeal !== 0) {
                    this.dialogAppeal = false
                    if(this.data.appeal==1){
                        let res = await myFunctions.post('WebUser/appealCancel', {id: this.data.id})
                        if (res) {
                            this.data.appeal = 0
                            this.textarea = ''
                            this.$message.success('操作成功')
                            this.diaAppeal = false
                            
                            myFunctions.noticeOpposite('appealCancel', this.user.toUid,this.data.appeal)//通知对方
                        }
                    }
                    else return this.$message.warning('现在不能申诉');
                }
            }
        },
        computed: {
            ...mapState({
                userID: state => state.user.userInfo.id,   // 用户的id
                orderData: state => state.order.orderData,
                fullName: state => state.user.userInfo.full_name,
                site_static: state => state.site.siteSetting.site_static,
            }),
            appealStatus(){
                return this.data.appeal===0 ? this.$t('currency.orderInfo.appeal')  : ( this.data.appeal===1 ?
                      this.$t('currency.orderInfo.doing')+this.$t('currency.orderInfo.appeal'): this.$t('currency.orderInfo.opposite')+this.$t('currency.orderInfo.appealing') )
            }
        },
        created() {
            EventBus.$on('mallIconCome', () => {this.reload()} ) 
        },
        methods: {
            // 买方付款
            async payed(id) {
                if (this.data.appeal !== 0) return this.$message.warning('申诉中,不能进行此操作');
                this.buttonLoading = true
                let res = await myFunctions.post('Webc2cOrder/payment', {id: id,})
                if (res) {
                    this.$emit('refresh')
                    this.$message.success('付款成功')
                    myFunctions.noticeOpposite(1, this.user.toUid)  //通知对方已付款
                    // let msg = {
                    //     recv_uid: this.user.toUid,//接收者
                    //     send_uid: this.userID, //发送消息者
                    //     type: 1,//消息类型
                    //     content: JSON.stringify({
                    //         systemMsg: '订单[' + this.data.sn + ']已经付款',
                    //         type: 0,
                    //         o_type: 1,
                    //         oid: this.data.id
                    //     }) //type:0->购买
                    // }
                    // this.$myFunctions.WsSend(msg, () => {})
                    // EventBus.$emit('websocketMsg', msg)
                }
                this.buttonLoading = false
                this.noClickBtn = true
            },

            //倒计时
            countDown(time) {
                let _this = this
                if (_this.timer) window.clearInterval(_this.timer);
                _this.timer = window.setInterval(function () {
                    let t = time - parseInt(Math.round(new Date().getTime() / 1000).toString());
                    if (t > 0) {
                        let minute = Math.floor(t / 60);
                        let seconds = t - minute * 60
                        _this.lastPayTime = `剩余${minute}分${seconds}秒`
                    } else if (t === 0) {
                        setTimeout(() => {
                            _this.$emit('refresh')
                            window.clearInterval(_this.timer)
                        }, 1000)
                    } else {
                        // _this.lastPayTime = `剩余0分0秒`
                        // if(_this.data.status !== 3) _this.cancel()
                        // window.clearInterval(_this.timer)
                        _this.lastPayTime = `剩余0分0秒`
                        window.clearInterval(_this.timer)
                        _this.timer = null
                    }
                }, 1000)
            },

            // 申诉
            appeal() {
                this.dialogAppeal = false
                this.diaAppeal = true
            },

            // 申诉确认提交
            async submitAppeal() {
                if (!this.textarea) return this.$message.warning('请输入内容');
                let params = {
                    id: this.data.id,
                    type: 1,
                    phone: '0',
                    reason: this.textarea,
                    attachments: '照片'
                }
                let res = await myFunctions.post('WebUser/appeal', params)
                if (res) {
                    this.data.appeal = 1
                    this.textarea = ''
                    this.$message.success('您的信息已提交')
                    this.diaAppeal = false
                    
                    myFunctions.noticeOpposite('appeal', this.user.toUid,this.data.appeal)//通知对方
                }
            },
            
            Appealmsg(appeal){this.data.appeal=appeal},

            //取消订单
            cancelOrder() {
                if (this.data.appeal !== 0) return this.$message.warning('申诉中,不能进行此操作');
                this.$confirm('取消订单后不会退款，如您已付款，请勿取消订单。', '取消订单', {
                    confirmButtonText: '确认取消',
                    cancelButtonText: '我再想想',
                    confirmButtonClass: 'confirm-class',
                    cancelButtonClass: 'cancel-class',
                    type: 'warning',
                    beforeClose:  (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            this.cancel()
                            this.$emit('refresh')
                            done()
                            myFunctions.noticeOpposite(0, this.user.toUid)   //通知对方订单已取消
                            // let msg = {
                            //     recv_uid: this.user.toUid,//接收者
                            //     send_uid: this.userID, //发送消息者
                            //     type: 1,//消息类型
                            //     content: JSON.stringify({
                            //         systemMsg: '订单[' + this.data.sn + ']已被取消',
                            //         type: 0,
                            //         o_type: 1,
                            //         oid: this.data.id
                            //     }) //type:0->购买
                            // }
                            // this.$myFunctions.WsSend(msg, () => {})
                            // EventBus.$emit('websocketMsg', msg)
                            instance.confirmButtonLoading = false
                        } else done()
                    },
                })
            },

            //请求取消订单接口
            async cancel() {
                let res = await myFunctions.post('Webc2cOrder/cancel',{id: this.data.id})
            },

            //打开聊天窗口方发
            getActive(is) {
                this.isActive = !this.isActive
                myFunctions.openChat(this.isActive, this.user.uid, this.user.toUid, is)
            },
        }
    }
</script>

<style scoped lang="less">
    .main-left-bottom {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
        background-color: #f2f6fa;

        .bottom-show {
            width: 100%;
            padding: 0 20px;

            .complete {
                font-size: 26px;

                .icon-gouhao {
                    font-size: 28px;
                    color: #0da88b;
                }
            }

            .bottom-top-left {
                display: flex;
                align-items: flex-start;
                flex-direction: column;
                line-height: 25px;
                padding-left: 10px;

                .money {
                    font-size: 22px;
                    font-weight: bold;
                    color: #0da88b;
                }
            }

            .main-left-cancel {
                margin-top: 8px;

                .el-button {
                    padding: 0;
                }
            }
        }

        .bottom-hide {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-around;

            .hide-item {
                font-size: 22px;

                .icongouhao {
                    font-size: 18px;
                }
            }

            .contact {
                color: #1baaec;
                cursor: pointer;
            }
        }

    }

    .appeal-btn {
        text-align: right;
    }
</style>
