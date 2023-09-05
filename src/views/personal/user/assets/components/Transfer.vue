<template>
    <div class="content">
        <div class="select_btn">
            <span class="currency_type">请选择币种:</span>
            <el-radio-group v-model="radio">
                <el-radio-button size="mini" label="1" border>BTC</el-radio-button>
                <el-radio-button size="mini" label="2" border>USDT</el-radio-button>
            </el-radio-group>
        </div>
        <el-form inline :model="transform" ref="transform" :rules="rules" :show-message="false" v-if="payStatus && payPwd">
            <el-form-item>{{ $t('assets.transfer') }}</el-form-item>
            <el-form-item prop="uid">
                <el-input size="small" :validate-event="false" @keyup.enter.native="submitTransform('transform')"
                          style="width: 80px;"
                          v-model="transform.uid" :placeholder="$t('assets.transferID')"></el-input>
            </el-form-item>
            <el-form-item prop="amount">
                <el-input size="small" :validate-event="false" @keyup.enter.native="submitTransform('transform')"
                          style="width: 80px;"
                          v-model="transform.amount" :placeholder="$t('assets.amount')"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" @click="submitTransform('transform')">{{ $t('button.confirm') }}</el-button>
            </el-form-item>
        </el-form>
        <div class="check_box" v-else>
            <el-form :model="pay" ref="pay" :rules="rules" size="small" :show-message="false">
                <template v-if="payPwd">
                    <span>请先核对交易密码:</span>
                    <el-input size="mini" style="width: 35%;margin: 0 10px" v-model="pay.payPassword"
                                                @keyup.enter.native="checkPassword('pay')" type="password"
                                                :placeholder="$t('goodsDetails.buyer.desInput')" >
                    </el-input>
                </template>
                <span style="padding-right: 10px" v-if="!payPwd">请先设置交易密码:</span>
                <el-button type="primary" :loading="submitLoading" size="mini"
                        @click="payPwd ? checkPassword('pay') : $router.push({name: 'userInfo'})">
                        {{ payPwd ? $t('goodsDetails.buyer.sureBtn') : $t('goodsDetails.buyer.setPwd')}}
                </el-button>
            </el-form>
        </div>
    </div>
</template>

<script>
    import {MD5} from "crypto-js";
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions";

    const currency = () => import('@/components/common/Currency')
    export default {

        name: "Transfer",
        components:{currency},
        data(){
            return{
                dialogTransform: false,
                radio: '1',
                transform: {
                    uid: '',
                    amount: ''
                },
                pay: {
                    payPassword: ''
                },
                submitLoading:false,
                rules: {
                    uid: [{required: true, message: this.$t('assets.desID'), trigger: 'blur'}],
                    amount: [{required: true, message: this.$t('assets.desAmount'), trigger: 'blur'}],
                    pwd: [{required: true, message: '请输入交易密码', trigger: 'blur'}],
                },
            }
        },
        computed: {
            ...mapState({
                token: state => state.user.token,
                payStatus: state => state.user.userInfo.verify_pinpass,
                payPwd: (state) => state.user.userInfo.paypwd,
            })
        },
        methods: {
            //核对密码
            checkPassword(form) {
                if(!this.token) return this.$router.push({name: 'login'})
                if(!this.payPwd) return this.$router.push({name: 'userInfo'})
                if (this.token && this.payPwd) {
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
                                console.log(this.verify_pinpass)
                                this.pay.password = ''
                            }
                        }
                    })
                }
            },
            submitTransform(form) {
                this.$refs[form].validate( async (valid, object)=> {
                    if(!valid) this.$validateNotify(object)
                    if (valid) {
                        let params = {
                            uid: this.transform.uid,
                            amount: this.transform.amount,
                            currency_id:this.radio,
                        }
                        let res = await myFunctions.post('/WebMyWithdrawal/transfer', params)
                            if (res) {
                                this.$message.success('操作成功')
                                Object.keys(this.transform).forEach(key=> { this.transform[key] = '' })
                                this.$store.dispatch('user/getInfo').then()
                            }
                    }
                })
            },
        }
    }
</script>

<style scoped lang="less">
    .content{
        padding-top: 5px;

        .select_btn{
            margin-left: 20px;

            .currency_type {
                margin-right: 10px;
            }
        }
    }
  /deep/.el-form{
      margin-top: 5px;
  }
</style>