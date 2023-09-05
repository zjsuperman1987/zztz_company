<template>
    <div>
        <p class="tips">{{ paypwd ? $t('goodsDetails.buyer.buy') : $t('goodsDetails.buyer.pwd') }}</p>
        <el-row class="operations">
            <el-col :span="token ? 15 : 24">
                <el-form class="form" :model="pay" ref="pay" :rules="rules" size="small" :show-message="false">
                    <el-row>
                        <el-col :lg="24" :md="12" :sm="12" :xs="24">
                            <el-form-item class="item-nav">
                                <span class="select_btn">付款方式:</span>
                                <el-radio-group v-model="radio" size="mini">
                                    <el-radio-button :label="$t('goodsDetails.buyer.BTC')"></el-radio-button>
                                    <el-radio-button :label="$t('goodsDetails.buyer.USDT')"></el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :lg="24" :md="16" :sm="24" :xs="24">
                            <div v-if="isPayStatus" class="currency">
                                <span> {{$t('goodsDetails.buyer.total')}}</span>
                                <span style="color: #c35501">${{ totalPrice | cutPoint(2) }}</span>
                                <span style="margin-left:10px">美元计价,
                                <span style="color: red; margin: 0 5px 0 2px">{{ radio }}</span>结算</span>
                            </div>
                        </el-col>
                        <el-col :lg="10" :md="10" :sm="13" :xs="24">
                            <el-form-item prop="num" v-if="isPayStatus">
                                <el-input-number @change="toInteger" size="small" v-model="pay.num" style="height: 24px" :min="1">
                                </el-input-number>
                            </el-form-item>
                            <el-form-item prop="num" v-else>
                                <span>请先核对交易密码:</span>
                            </el-form-item>
                        </el-col>
                        <el-col :lg="16" :md="10" :sm="11" :xs="24" v-if="!isPayStatus && paypwd">
                            <el-form-item prop="payPassword" style="height: 24px">
                                <el-input size="small" style="width: 90%" v-model="pay.payPassword"
                                          @keyup.enter.native="checkPassword('pay')" type="password"
                                          :placeholder="$t('goodsDetails.buyer.desInput')">
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :lg="4" :md="4" :sm="12" :xs="24" >
                            <el-form-item v-if="!isPayStatus">
                                <el-button type="primary" :loading="submitLoading" size="mini"
                                           @click="paypwd ? checkPassword('pay') : toSetting()">
                                    {{ paypwd ? $t('goodsDetails.buyer.sureBtn') : $t('goodsDetails.buyer.setPwd')}}
                                </el-button>
                            </el-form-item>
                            <el-form-item v-else>
                                    <el-button type="primary" :loading="submitLoading" size="mini" 
                                    @click="paypwd ? submitOrder('pay') : toSetting()" v-if="data.down !== 1">
                                        {{ paypwd ? $t('goodsDetails.buyer.buttonBuy') : $t('goodsDetails.buyer.setPwd') }}
                                    </el-button>
                                    <el-button type="primary" v-else>已下线</el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>
            <el-col v-if="token" :span="9" class="right-t">
                <ul class="right-t">
                    <li><span class="info_title">{{ $t('goodsDetails.BTC') }}</span><span class="info_data width">{{ BTC }}</span></li>
                    <li><span class="info_title">{{ $t('goodsDetails.USDTBalance') }}</span><span class="info_data width">{{ USDT ? USDT : 0 }}</span></li>
                    <li><span class="info_title">{{ $t('goodsDetails.buyer.goods') }}</span>
                        <span class="info_data width textColor">
                                <el-button :type="goodsInfo.favorite ? 'text' : 'text'" @click="handleFavorites" style="padding: 1px 6px">
                                    {{ goodsInfo.favorite ? $t('goodsDetails.buyer.cancelColl') :
                                    $t('goodsDetails.buyer.collect') }}
                                </el-button>
                        </span>
                    </li>
                    <li><span class="info_title">{{ $t('goodsDetails.buyer.account') }}</span>
                        <span class="info_data width textColor">
                            <el-button type="text" size="mini" @click="$router.push({ name: 'recharge' })" style="padding: 1px 6px">
                                {{ $t('goodsDetails.buyer.recharge') }}
                            </el-button>
                        </span>
                    </li>
                </ul>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import {MD5} from "crypto-js";
    import myFunctions from "@/utils/myFunctions"   //引入myFunctions js文件
    export default {
        name: "buyer",
        props: {
            data: Object,
            isPayStatus: String / Number,
            currentBTC: String / Number,
            currentUSDT: String / Number,
        },
        data() {
            let password = (rule, value, callback) => {
                if (this.isPayStatus) callback()
                else {
                    if (!value) callback(new Error(this.$t('goodsDetails.buyer.desPwd')))
                    else callback()
                }
            }
            return {
                radio: 'BTC',
                BTC: '',
                USDT: '',
                currency_type: '', //币种类型
                submitLoading: false,
                pay: {
                    num: 1,
                    payPassword: '',
                },
                rules: {
                    num: [
                        {required: true, message: this.$t('goodsDetails.buyer.desBuy'), trigger: 'blur'}
                    ],
                    payPassword: [
                        {validator: password, trigger: "blur"}
                    ]
                },
                nowRate: {}
            }
        },
        computed: {
            totalPrice() {
                return this.pay.num * this.goodsInfo.usdprice
            },
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                balance: state => state.user.userInfo.balance,
                goodsInfo: state => state.goods.goodsInfo,
                token: state => state.user.token,
                paypwd: state => state.user.userInfo.paypwd,
                id: state => state.user.userInfo.id * 1,
            })
        },
        created() {
            this.Balance()
        },
        mounted() {
            console.log(this.data)
        },
        methods: {
            // 整数限制
            toInteger() {
                let reg = /^[0-9]+$/
                if (!reg.test(this.pay.num)) {
                    this.$message.warning(this.$t('goodsDetails.buyer.desNum'))
                    // 用以在dom渲染挂载后重新触发dom渲染挂载
                    this.$nextTick(() => {
                        this.pay.num = parseInt(this.pay.num)
                    })
                }
            },

            
            //核对密码
            checkPassword(form) {
                if(!this.token) return this.$router.push({name: 'login'})
                if(!this.paypwd) return this.$router.push({name: 'userInfo'})
                if (this.token && this.paypwd) {
                    this.$refs[form].validate(async(valid, object) => {
                        if(!valid) this.$validateNotify(object)
                        let params = { password: MD5(this.pay.payPassword).toString() }
                        if(valid) {
                            let res = await myFunctions.post('WebUser/verifyPinpass', params)
                            if(res) {
                                this.$message.success(this.$t('$message.success'))
                                this.$store.dispatch('user/getInfo')
                                this.$store.commit('goods/changeTab', 'orderList')
                                this.$store.commit('goods/refresh', new Date().getTime())
                                this.$emit('refreshInfo')
                                this.pay.password = ''
                            }
                        }
                    })
                }
            },

            // 提交订单
            submitOrder(form,val) {
                if(this.radio === 'BTC') this.currency_type = 1
                else this.currency_type = 2
                if(!this.radio) return this.$message.warning('请选择你要结算的币种!!!')
                if(!this.token) return this.$router.push({name: 'login'})
                if(!this.paypwd) return this.$router.push({name: 'userInfo'})
                if (this.radio && this.token && this.paypwd) {
                    this.$refs[form].validate((valid, object) => {
                        if (!valid) this.$validateNotify(object)
                        if (valid) {
                            this.submitLoading = true
                            let params = {
                                currency_id: this.currency_type,
                                id: this.goodsInfo.tid,
                                volume: this.pay.num,
                                password: MD5(this.pay.payPassword).toString(),
                            }
                            this.$http('WebMyOrder/save', {method: 'post', params}).then(res => {
                                if (res) {
                                    console.log(res)
                                    window.localStorage.setItem('goodsId', res.id)
                                    myFunctions.noticeOpposite(2, this.data.uid)  //参数为2 是为下订单提醒卖家 有订单了
                                    this.$message.success(this.$t('$message.success'))
                                    this.$store.dispatch('user/getInfo')
                                    this.$store.commit('goods/changeTab', 'orderList')
                                    this.$store.commit('goods/refresh', new Date().getTime())
                                    this.$emit('refreshInfo')
                                    this.pay.num = 1
                                    this.pay.payPassword = ''
                                }
                                this.submitLoading = false
                            })
                        }
                    })
                }
            },

            toSetting() {
                this.$router.push({name: 'userInfo'})
            },

           //获取币种余额
            async Balance() {
                let res = await myFunctions.get('WebMyRecharge/currencyBalance', {page: 1, limit: 10})
                if(res) {
                    if(res.total === 1) this.BTC = res.data[0].balance
                    else {
                        this.BTC = res.data[1].balance
                        this.USDT = res.data[0].balance
                    }                
                }
            },

            //收藏/取消收藏
            handleFavorites() {
                let url = this.goodsInfo.favorite ? 'WebMyFavorite/delete' : 'WebMyFavorite/save'
                this.$http(url, {method: 'post', params: {id: this.goodsInfo.tid}}).then(res => {
                    if (res) {
                        this.$message.success(this.$t('$message.success'))
                        this.$store.dispatch('user/getInfo')
                        this.$emit('refreshInfo')
                    }
                })
            },
        }
    }
</script>

<style scoped lang="less">
    .tips {
        background: #eee;
        padding: 0 4px;
    }
    .control{
        background: #ADC8DE;
    }

    .operations {
        display: flex;
        ::v-deep{
            .el-button--text{
                color: #1421db;
            }
        }
        
        .form {
            background: #B9DCF2;
            padding: 4px;
            height: 100%;

            .el-form-item {
                margin-bottom: 0;
            }

            ::v-deep {
                .el-input-number {
                    width: 100px;

                    .el-input-number__decrease, .el-input-number__increase {
                        width: 24px;
                    }
                }
                .el-radio-button__inner{
                    padding: 2px 5px;
                }
            }

            .item-nav {
                color: #555;
                .select_btn{
                    display: inline-block;
                    margin-right: 20px;
                }
            }
        }
        .right-t {
            background: #B6C4C7;
            padding: 3px;
            // border: 1px solid #999;
            li{
                list-style: none;
                display: inline-block;
                line-height: 18px;
                width: 180px;
                margin-right: 3px;
                .info_title {
                    width: 80px;
                    border: 1px solid #FFF;
                    background: #ADC8DE;
                    padding: 1px;
                    padding-left: 5px;
                }
                .info_data {
                    text-align: left;
                    border: 1px solid #fff;
                    width: 100px;
                    background: #77A5B1;
                    padding: 1px;
                }
                .width {
                    width: 100px;
                    padding-left: 5px;
                }
                .textBtn{
                    color: #fff;
                }
                
                span {
                    display: inline-block;
                    box-sizing: border-box;
                }
            }
        }
        .currency{
            margin: 8px 0;
        }
    }
</style>
