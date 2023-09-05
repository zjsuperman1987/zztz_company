<template>
    <div>
        <div class="main-left-bottom">
            <!--       订单正常进入时展示-->
            <el-row class="bottom-show" :gutter="20" v-if="data.status === 0 || data.status === 1">
                <el-col :span="14">
                    <div class="bottom-top-left">
                        <span>{{data.appeal==0?desText+'&emsp;'+lastPayTime:$t('currency.orderInfo.wait')}}</span>
                        <span class="money">{{data.total_price }} <sub>CNY</sub></span>
                    </div>
                </el-col>
                <el-col :span="10">
                    <div>
                        <el-button @click="chooseSet" type="primary" :disabled="noClick" size="small"
                                   :loading="buttonLoading">{{buttonText}}
                        </el-button>
                        <el-button @click="getActive(true)">{{$t('goodsDetails.contactBuyer')}}
                        </el-button>
                    </div>
                    <div class="main-left-cancel">
                        <span @click="dialogAppeal = true">
                            {{ appealStatus }}
                        </span>
                    </div>
                </el-col>
            </el-row>
            <!--       订单处于完成状态的时候显示-->
            <div class="bottom-hide" v-if="data.status === 2 || data.status === 5">
                <div class="hide-item">{{$t('currency.orderInfo.completed')}}</div>
                <div  @click="getActive(true)" class="contact">{{$t('goodsDetails.contactBuyer')}}</div>
            </div>
            <!--       订单已取消状态-->
            <div class="bottom-hide" v-if="data.status === 3 || data.status === 4 || data.status === 7">
                <div class="hide-item">{{$t('currency.orderInfo.cancel')}}</div>
                <div @click="getActive(true)" class="contact">{{$t('goodsDetails.contactBuyer')}}</div>
            </div>
        </div>

        <!--  申诉提醒弹窗-->
        <el-dialog :title="$t('currency.orderInfo.question')" :visible.sync="dialogAppeal" v-dialog-drag
                   :close-on-click-modal="false" custom-class="width500">
            <appeal-text></appeal-text>
            <div class="appeal-btn">
                <el-button size="small" type="primary" @click="doAppeal">{{$t('currency.orderInfo.appeal')}}</el-button>
            </div>
        </el-dialog>

        <!--    申诉弹窗-->
        <el-dialog :title="$t('currency.orderInfo.appeal')" :visible.sync="diaAppeal" v-dialog-drag
                   :close-on-click-modal="false" custom-class="width400">
            <el-form @submit.native.prevent :show-message="false">
                <el-form-item :label="$t('currency.orderInfo.description')" required>
                    <el-input @keyup.enter.native="submitAppeal" size="small"
                              type="textarea" :rows="5" :placeholder="$t('currency.orderInfo.enter')" v-model="textarea"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="small" type="primary" @click="submitAppeal">{{$t('currency.submit')}}</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--    交易弹窗-->
        <el-dialog title="请输入交易密码" :visible.sync="dialogPayPassword" :close-on-click-modal="false"
                   v-dialog-drag custom-class="width400">
            <el-form :model="formPayPassword" ref="formPayPassword"
                     :rules="rules" @submit.native.prevent :show-message="false">
                <el-form-item prop="payPwd">
                    <el-input @keyup.enter.native="pulled('formPayPassword')" type="password"
                              size="small" v-model="formPayPassword.payPwd"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" :loading="payLoading" @click="pulled('formPayPassword')">确 定</el-button>
      </span>
        </el-dialog>

    </div>
</template>

<script>
    import {mapState} from "vuex";
    import {MD5} from "crypto-js";
    import myFunctions from "@/utils/myFunctions";
    import appealText from "@/views/ThreeCoin/order/components/appealText";

    export default {
        inject: ['reload'],
        name: "seller",
        components: { appealText },
        props: {
            data: Object,
            user: Object
        },
        data() {
            return {
                buttonLoading: false,
                noClickBtn: false,
                noClick: false,
                desText: '',  // 文字描述
                buttonText: '',  // 按钮文字描述
                timer: null,  // 倒计时
                lastPayTime: '', // 最后支付时间

                formPayPassword: {
                    payPwd: ''
                },
                payLoading: false,
                textarea: '',
                dialogAppeal: false,
                diaAppeal: false,
                dialogPayPassword: false,
                tbTelPassword: false,
                isActive: false,
                rules: {
                    payPwd: [
                        {required: true, message: '【请输入密码】', trigger: 'blur'},
                        {
                            pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/,
                            message: '【格式错误，字母数字特殊三选二，最少6位】', trigger: 'blur'
                        }
                    ]
                },
                appeal: '申诉',
                doing: '正在',
                opposite: '对方',
                appealing: '申诉中...'
            }
        },
        watch: {
            data: {
                handler(val) {
                    if (val.self === 0) {
                        if (val.s_type === 0) {
                            this.desText = '等待对方转账'
                            this.buttonText = '等待对方付款'
                            this.noClick = true
                            if (val.status === 1) {
                                this.desText = '对方已完成转账，可以放币了'
                                this.buttonText = '确认放币'
                                this.noClick = false
                            }
                        } else {
                            this.desText = '请向对方转账'
                            this.buttonText = '我已完成转账，下一步'
                            if (val.status === 1) {
                                this.noClick = true
                                this.desText = '等待对方放币'
                                this.buttonText = '等待对方放币'
                            }
                        }
                    } else {
                        if (val.s_type === 1) {
                            this.noClick = true
                            this.desText = '等待对方转账'
                            this.buttonText = '等待对方付款'
                            if (val.status === 1) {
                                this.desText = '对方已完成转账，可以放币了'
                                this.buttonText = '确认放币'
                                this.noClick = false
                            }
                        } else {
                            this.desText = '请向对方转账'
                            this.buttonText = '我已完成转账，下一步'
                            if (val.status === 1) {
                                this.buttonText = '等待对方放币'
                                this.desText = '等待对方放币'
                                this.noClick = true
                            }
                        }
                    }
                    this.countDown(val.end_time)
                },
                deep: true,
                immediate: false
            },
            async dialogAppeal(newName) {
                if (newName === true && this.data.appeal !== 0) {
                    this.dialogAppeal = false
                    if(this.data.appeal==2){
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
            },
            '$i18n.locale': {  //监听中英文切换
                handler: function () {
                    if (this.$i18n.locale === 'en') {
                        this.appeal = 'Appeal'
                        this.doing = 'Doing'
                        this.opposite = 'Opposite'
                        this.appealing = 'appealing..'
                    }
                },
                immediate: true
            }
        },
        computed: {
            ...mapState({
                userID: state => state.user.userInfo.id,   // 用户的id
                token: state => state.user.token,
                paypwd: state => state.user.userInfo.paypwd,
            }),
            appealStatus(){
                return this.data.appeal===0 ? this.$t('currency.orderInfo.appeal')  : ( this.data.appeal===2 ?
                     this.$t('currency.orderInfo.doing')+this.$t('currency.orderInfo.appeal'): this.$t('currency.orderInfo.opposite')+this.$t('currency.orderInfo.appealing') )
            }
        },
        
        created() {
            EventBus.$on('websocketCancel', () => {this.refresh();}) 
            EventBus.$on('mallGetOrderList', () => {this.refresh();}) 
            EventBus.$on('mallMoneyCome', () => {this.refresh();}) 
        },
        methods: {

            refresh() {   //刷新
                this.reload()
            },

            chooseSet() {  // 是否需要输入密码
                if (this.data.appeal !== 0) return this.$message.warning('申诉中,不能进行此操作');
                this.dialogPayPassword = true
            },
            //使用交易密码放币
            pulled(formName) {
                if(!this.paypwd) this.$router.push({name: 'userInfo'})
                if (this.paypwd) {
                    this.$refs[formName].validate(async (valid, object) => {
                        if(!valid) this.myNotify(object)
                        if (valid) {
                            this.payLoading = true
                            let params = {
                                id: this.data.id,
                                password: MD5(this.formPayPassword.payPwd).toString(),
                            }
                            let res = await myFunctions.post('Webc2cOrder/released', params)
                            if (res) {
                                this.dialogPayPassword = false
                                this.$message.success('放币成功')
                                this.reload()
                                myFunctions.noticeOpposite(3, this.user.toUid)  //放币
                                // let msg = {
                                //     recv_uid: this.user.toUid,//接收者
                                //     send_uid: this.userID, //发送消息者
                                //     type: 1,//消息类型
                                //     content: JSON.stringify({
                                //         systemMsg: '订单[' + this.data.sn + ']已经放币',
                                //         type: 0,
                                //         o_type: 1,
                                //         oid: this.data.id
                                //     }) //type:0->购买
                                // }
                                // this.$myFunctions.WsSend(msg, () => {})
                                // EventBus.$emit('websocketMsg', msg)
                            }
                            this.payLoading = false
                        }
                    })
                }
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
                            console.log(11111)
                            window.clearInterval(_this.timer)
                            _this.timer = null
                        }, 1000)
                    } else {
                        // _this.lastPayTime = `剩余0分0秒`
                        // if(_this.data.status !== 3) _this.cancel()
                        // window.clearInterval(_this.timer)
                        _this.lastPayTime = `剩余0分0秒`
                        window.clearInterval(_this.timer)
                        _this.timer = null
                    } 
                    window.clearInterval(_this.timer)
                }, 1000)
            },

            // 申诉
            doAppeal() {
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
                    this.data.appeal = 2
                    this.textarea = ''
                    this.$message.success('您的信息已提交')
                    this.diaAppeal = false
                    
                    myFunctions.noticeOpposite('appeal', this.user.toUid,this.data.appeal)//通知对方
                }
            },
            
            Appealmsg(appeal){this.data.appeal=appeal},

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
        padding: 20px;
        background-color: #f2f6fa;

        .bottom-show {
            width: 100%;
            display: flex;
            justify-content: space-around;
            align-items: center;

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

                .money {
                    font-size: 22px;
                    font-weight: bold;
                    color: #0da88b;
                }
            }

            .main-left-cancel {
                margin-top: 8px;

                span {
                    margin: 0 0 0 10px;
                    color: #1baaec;
                    cursor: pointer;
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
            }

            .contact {
                color: #1baaec;
                cursor: pointer;
                line-height: 29px;
            }
        }
    }

    .dialog-text-title {
        text-indent: 20px;
        margin: 10px 0;
    }

    .dialog-text-item {
        text-indent: 20px;
        margin-bottom: 5px;
    }
    .appeal-btn{
        text-align: right;
    }
</style>
