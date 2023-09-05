<template>
    <div>
        <div class="header">
            <div class="header-content">
                <span class="name">{{$t('currency.orderInfo.info')}}</span>
            </div>
        </div>
        <div class="main-order">
            <div class="content">
                <el-row :gutter="20" class="left-right">
                    <el-col :span="15">
                        <left-components  :data="orderInfo" :use="user" :payRNB="payRNB" @refresh="refresh"></left-components>
                    </el-col>
                    <el-col :span="9">
                    </el-col>
                </el-row>
            </div>
            <div class="footer">
                <ul v-show="buyer">
                    <li>1.给卖方付款安全吗？<br><span>广告方在发布广告之前已经通过高级认证，并冻结一部分数字资产作为保证资产，您可放心交易。</span></li>
                    <li>2.法币交易会自动扣款吗？<br><span>法币交易不会自动扣款，您需要按照卖方提供的支付方式，通过网银或者支付宝等方式自行转账给卖方，转账时，请务必认真核对卖方提供的收款方式。</span></li>
                    <li>3.转款注意事项<br><span>请勿在转账时使用“BTC”、“比特币”、“USDT”等与虚拟货币相关的词汇，以免您的银行卡遭到冻结。</span>
                        <br><span>若交易金额大于50,000 CNY，法定假日或工作日17：00以后汇款到银行卡可能会到账不及时，请分批支付保证及时到账，若未及时到账，卖方有权拒绝成交。</span>
                    </li>
                </ul>
                <ul v-show="seller">
                    <li>1.买方下单后一直未付款，如何处理？<br><span>目前只有买方可以取消，卖方无法取消订单，未收到款项前请勿点击确认放币按钮，如倒计时结束未收到汇款您可发起申述，客服人员将配合解决。</span></li>
                    <li>2.我收到钱，但是订单并未标记成对方已转账怎么办？<br><span>买方已转账，因买方未及时点击"我已转账"，导致订单超时取消，卖方有权选择继续交易或者拒绝交易，如若拒绝交易，卖方需要将款项原路退回至买方。</span></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions"
    const leftComponents = ()=> import('./components/left')
    export default {
        inject: ['reload'],
        name: "orderInfo",
        components: { leftComponents },
        data() {
            return {
                id : this.$route.query.id,
                buyer: false,
                seller: false,
                listQuery: {
                    status: 0,
                    page: 1,
                    limit: 10
                },
                status: null,
                orderInfo: {},
                payRNB: false,
                user: {
                    uid: '',
                    toUid: '',
                    nick_name: '',
                    full_name: '',
                    otherName: '',
                },
            }
        },
        computed: {
            userID() {
                return localStorage.getItem('uid')
            },
            ...mapState({
                order: state => state.order.orderRefresh,
            })
        },
        watch:{
            order() {
                this.getOrderDes();
            },
        },
        created() {
            this.getOrderDes()
        },

        methods: {

            //获取订单详情
            async getOrderDes(){
                let res = await myFunctions.get('Webc2cOrder/getInfo', {id : this.$route.query.id})
                if (res.self === 1) {
                    this.user = {
                        uid: res.subscribe_id,
                        toUid: res.release_id,
                        nick_name: res.relUserInfo.nick_name, //header头像昵称
                        full_name: res.relUserInfo.full_name, //header头像下面真实姓名
                        otherName: res.relUserInfo.nick_name //聊天框对方姓名
                    }
                }else {
                    this.user = {
                        uid: res.release_id,
                        toUid: res.subscribe_id,
                        nick_name: res.subUserInfo.nick_name, //header头像昵称
                        full_name: res.subUserInfo.full_name, //header头像下面真实姓名
                        otherName: res.subUserInfo.nick_name //聊天框对方姓名
                    }
                }
                this.$store.commit('order/user', this.user)
                this.orderInfo = res
                if(res.release_id===this.userID * 1)if(res.s_type===1) this.payRNB=true   //挂单的人
                if(res.subscribe_id===this.userID * 1) if(res.s_type===0) this.payRNB=true//下单的人
            },

            // 刷新方法
            refresh () {
                this.reload()
            }
        },
    }
</script>

<style scoped lang="less">
    @import "../../../styles/common";
    .main-order {
        max-width: @maxWidth;
        min-width: @minWidth;
        margin: 0 auto;
        .content {
            padding: 0 10px;
            margin: 20px auto 0;
            .left-right {
                display: flex;
                flex-wrap: nowrap;
            }
        }
    }
    .header {
        padding: 30px 0;
        background-color: #1b2945;
        display: flex;
        align-items: center;
        .header-content {
            max-width: @maxWidth;
            min-width: @minWidth;
            margin: auto;
            width: 100%;
            .name {
                font-size: @fontSize20;
                color: @fff;
                margin-left: 10px;
            }
        }
    }
    .footer {
        padding: 10px;
        margin: 10px auto;
        ul li {
            text-align: left;
            color: #909399;
        }
    }
</style>
