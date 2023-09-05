<template>
    <div class="info_box">

        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
            <div>
                <span>{{ $t('account.id') }}：{{ uid }}</span>
            </div>
        </div>
        <ul>
            <li><span class="info_title">{{ $t('account.ID') }}</span><span class="info_data">{{ user.id }}</span></li>
            <li><span class="info_title">{{ $t('account.register') }}</span><span class="info_data">{{ user.cretime }}</span></li>
            <li><span class="info_title">{{ $t('account.BTC') }}</span><span class="info_data">{{ BTC.balance }}</span></li>
            <li><span class="info_title">{{ $t('account.BTCfrozen') }}</span><span class="info_data">{{ BTC.frozen }}</span></li>
            <li><span class="info_title">{{ $t('account.USDT') }}</span><span class="info_data">{{ USDT.balance ? USDT.balance : 0 }}</span></li>
            <li><span class="info_title">{{ $t('account.USDTfrozen') }}</span><span class="info_data">{{ USDT.frozen ? USDT.frozen : 0 }}</span></li>
            <li><span class="info_title">{{ $t('account.loginPwd') }}</span>
                <span class="info_data width login">
                    <login-pwd></login-pwd>
                </span>
            </li>
            <li><span class="info_title">{{ $t('account.payPwd') }}</span>
                <span class="info_data width login">
                    <deal-pwd @handler="handler" @listenChild="childHandler"></deal-pwd>
                </span>
            </li>
            <li><span class="info_title">{{ $t('account.status') }}</span><span class="info_data">{{ admin  }}</span></li>
            <li><span class="info_title">{{ $t('account.group') }}</span><span class="info_data">{{ group  }}</span></li>
            <li><span class="info_title">{{ $t('account.lastOnline') }}</span><span class="info_data">{{ user.lastonline  }}</span></li>
            <li><span class="info_title">{{ $t('account.publisher') }}</span><span class="info_data">{{ user.trade_end_time ? user.trade_end_time : '无' }}</span></li>
            <li><span class="info_title">{{ $t('account.reply') }}</span><span class="info_data">{{ user.post_end_time ? user.post_end_time : '无' }}</span></li>
        </ul>

        <el-dialog title="交易密码设置成功" :visible.sync="centerDialogVisible" width="30%" center>
            <div class="text">请牢记交易密码，任何资金操作,都需要验证交易密码后方可进行.</div>
            <div class="text">请记录如下的安全验证码,存放在当前电脑/手机之外的地方.</div>
            <div><span style="margin-right: 10px">安全码:</span><span>{{ pinKey }}</span></div>
            <div class="text">修改交易密码需要验证该安全码.</div>
            <div class="text">紧急冻结账户需要验证该安全码.</div>
        </el-dialog>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    const dealPwd = () => import('./components/DealPwd')
    const loginPwd = () => import('./components/LoginPwd')
    import {generateTitle} from '@/utils/i18n'
    import myFunctions from '@/utils/myFunctions';

    export default {
        inject: ["reload"],
        name: "index",
        components: {dealPwd, loginPwd},
        data() {
            return {
                centerDialogVisible: false,
                totalBalance: 0,
                loading: false,
                nowRate: [],
                balanceList: [],
                BTC: [],
                USDT: [],
                total: '',
                data: [],
                admin: '',
                group: '',
                pinKey: ''
            }
        },
        computed: {
            ...mapState({
                user: state => state.user.userInfo,
                uid: state => state.user.userInfo.id,
                balance: state => state.user.userInfo.balance,
            }),
        },
        mounted() {
            this.getBalance()
            this.user_status()
        },
        methods: {
            generateTitle,
            async refresh() {
                this.loading = true
                await this.$store.dispatch('user/getInfo')
                this.loading = false
            },

            user_status() {
                if(this.user.is_adm) this.admin = '管理组'
                else this.admin = '普通组'
                if(this.user.group) this.group = '特殊组'
                else this.group = '普通组'
            },

            //获取币种余额
            async getBalance() {
                let res = await myFunctions.get('WebMyRecharge/currencyBalance', {page: 1, limit: 10})
                if(res) {
                    this.balanceList=res.data
                    for(let prop of res.data) {
                        if(prop.currency_id === 1) this.BTC = prop
                        else this.USDT = prop
                    }
                }
            },
            // 接收打开弹窗的值
            handler(data) {
                this.centerDialogVisible = data
            },
            //接收子组件数据
            childHandler(data) {
                this.pinKey = data
            }
        }
    }
</script>


<style scoped lang="less">
    .info_box{
    margin: 5px;
    border: 1px solid #999;
    ul{
        padding: 3px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content:baseline;
        margin-left: 5px;
        li{
            list-style: none;
            display: inline-block;
            line-height: 18px;
            margin: 0 6px;
            width: 240px;
            margin-bottom: 2px;
            .info_title {
                width: 90px;
                border: 1px solid #77A5B1;
                background: #ADC8DE;
                padding: 1px;
                padding-left: 5px;
            }
            .info_data {
                text-align: center;
                border: 1px solid #77A5B1;
                width: 150px;
                background: #fff;
                padding: 1px;
            }
            .width {
                width: 150px;
            }
            .login {
                cursor: pointer;
                color: #59C6FF;
            }
            span {
                display: inline-block;
                box-sizing: border-box;
            }
        }
    }
    .text{
        text-align: left;
        margin: 20px 0 20px;
    }
}
</style>