<template>
    <div class="container">
        <div class="public_box">
            <!-- 当前币种汇率 -->
            <div class="rate_box">
                <span>当前汇率:</span>
                <span> BTC: {{nowRate.BTC.cny}} CNY</span>
                <span>USDT: {{nowRate.USDT.cny}} CNY</span>
            </div>
            <!-- 发布购买和出售订单 -->
            <el-form :rules="formRule" :model="infoOfPublish" ref="infoOfPublish" label-width="50px"
                    class="demo-ruleForm">

                <!-- 选择发布的币种 -->
                <el-form-item :label="$t('assets.currency')" prop="type" label-width="80px">
                    <el-radio-group v-model="radio" size="mini">
                        <el-radio-button v-for="item in option" :key="item.value" :label="item.label" :value="item.value"></el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <!-- 购买和出售选择按钮 -->
                <el-form-item :label="$t('currency.class')" prop="type" label-width="80px">
                    <el-radio-group v-model="radio1" size="mini">
                        <el-radio-button v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <!-- 数量 -->
                <el-form-item :label="$t('currency.amount')" prop="total" label-width="80px">
                    <el-input step="20" type="number"
                            v-model.number="infoOfPublish.total" autocomplete="off"
                            :placeholder="$t('currency.enterAmount')">
                        <template slot="suffix">{{ currency_s }}</template>
                    </el-input>
                </el-form-item>
                <!-- 单价  输入框只能输入数字且首位不能为0 -->
                <el-form-item :label="$t('currency.unitPrice')" prop="unit_price" label-width="80px">
                    <el-input type="number" v-model.number="infoOfPublish.unit_price" autocomplete="off"
                            οninput='this.value=this.value.replace( /^[0] + [0 - 9] * $ / gi, "").replace(/[^d]/g, ")'>
                        <template slot="suffix">CNY</template>
                    </el-input>
                </el-form-item>
                <!-- 限额 -->
                <el-form-item class="limit" :label="$t('currency.limit')" prop="range_start" label-width="80px">
                    <el-input :placeholder="$t('currency.startLimit')" type="number"
                            v-model.number="infoOfPublish.range_start"
                            autocomplete="off">
                        <template slot="suffix"> CNY</template>
                    </el-input>
                </el-form-item>
                <span class="range iconfont icon-hr"></span>
                <el-form-item class="limit" prop="range_end">
                    <el-input :placeholder="$t('currency.endLimit')" type="number"
                            v-model.number="infoOfPublish.range_end"
                            autocomplete="off">
                        <template slot="suffix"> CNY</template>
                    </el-input>
                </el-form-item>

                <!-- 备注 -->
                <el-form-item prop="remark" class="remark">
                    <el-input  type="textarea" v-model.number="infoOfPublish.remark"
                            :placeholder="$t('currency.remarks')" :autosize="{ minRows: 3, maxRows: 6}"></el-input>
                </el-form-item>
                <!-- 提交 -->
                <div  class="submitBtn">
                    <el-button type="primary" @click="submitBuyForm('infoOfPublish')">{{$t('currency.submit')}}</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>


<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions"
    import Currency from "@/components/common/Currency";   //引入myFunctions js文件
    export default {
        name: "publish",
        components: { Currency },
        data() {
            //  自定义表单验证规则
            let checkNumber = (rule, value, callback) => {
                if (!value) callback(new Error('【数量不能为空】'))
                if (this.value2 === 2) {  //  选择的币种为 USDT时
                    if (value < 20) {
                        this.infoOfPublish.total = 20
                        callback(new Error('【最小发布数量为20】'))
                    }
                }
                if (this.value2 === 1 && value > 10) {  //  选择的币种为 BTC时
                    this.infoOfPublish.total = 10
                    callback(new Error('【最大发布数量为10】'))
                }
                callback()
            }
            let checkPrice = (rule, value, callback) => {
                if (!value) callback(new Error('【数量不能为空】'))
                if (this.value2 === 2) {  //  选择的币种为 USDT时
                    if (value < this.nowRate.USDT.cny * 0.5) {
                        this.infoOfPublish.unit_price = this.nowRate.USDT.cny * 0.5
                        callback(new Error('【单价低于市场价的50%!!!!】'))
                    }
                }
                if (this.value2 === 1) {  //  选择的币种为 BTC时
                    if (value < this.nowRate.BTC.cny * 0.5) {
                        this.infoOfPublish.unit_price = this.nowRate.BTC.cny * 0.5
                        callback(new Error('【单价低于市场价的50%!!!!】'))
                    }
                }
                callback()
            }
            let checkStart = (rule, value, callback) => {
                if (!value) callback(new Error('【起始限额不能为空】'))
                if (!this.infoOfPublish.unit_price || !this.infoOfPublish.total) callback(new Error('【单价或者总量不能为空】'))
                if (this.value2 === 1) {  //  选择的币种为 BTC时
                    if (value < 2000) {
                        this.infoOfPublish.range_start = 2000
                        callback(new Error('【起始限额最小为2000】'))
                    }
                    if (value > this.infoOfPublish.total * this.infoOfPublish.unit_price) {
                        this.infoOfPublish.range_start = this.infoOfPublish.total * this.infoOfPublish.unit_price;
                        callback(new Error('【不能大于总量】'))
                    }
                }
                if (this.value2 === 2) {  //  选择的币种为 USDT时
                    if (value < 10) {
                        this.infoOfPublish.range_start = 10
                        callback(new Error('【起始限额最小为10】'))
                    }
                    if (value > this.infoOfPublish.total * this.infoOfPublish.unit_price) {
                        this.infoOfPublish.range_start = this.infoOfPublish.total * this.infoOfPublish.unit_price;
                        callback(new Error('【不能大于总量】'))
                    }
                }
                callback()
            }
            let checkEnd = (rule, value, callback) => {
                if (!value) callback(new Error('【结束限额不能为空】'))
                if (value < this.infoOfPublish.range_start) {
                    this.infoOfPublish.range_end = this.infoOfPublish.range_start + 1
                    callback(new Error('【不能小于起始限额】'))
                }
                if (value > this.infoOfPublish.total * this.infoOfPublish.unit_price) {
                    this.infoOfPublish.range_end = this.infoOfPublish.total * this.infoOfPublish.unit_price;
                    callback(new Error('【不能大于总数】'))
                }
                callback()
            }
            return {
                radio: 'BTC',
                radio1: '购买',
                options: [{value: '0', label: '购买'}, {value: '1', label: '出售'}],
                option: [{value: '1', label: 'BTC'}, {value: '2', label: 'USDT'}],
                currency_s: '', //币种
                currencyList: [],
                // 发布购买表单
                infoOfPublish: {
                    buyNumber: "",
                    currency_id: '',
                    type: '',
                    range_start: '',
                    range_end: '',
                    unit_price: '',
                    remark: '',
                    buyLimit: '',
                },
                //  表单规则
                formRule: {
                    unit_price: [{required: true, validator: checkPrice, trigger: 'blur'}],
                    total: [{required: true, validator: checkNumber, trigger: 'blur'}],
                    range_start: [{required: true, validator: checkStart, trigger: 'blur'}],
                    range_end: [{validator: checkEnd, trigger: 'blur'}],
                },
            }
        },
        watch: {
            value2(value) {
                if (value === 1) this.currency_s = 'BTC'
                if (value === 2) this.currency_s = 'USDT'
            },
            '$i18n.locale': {
                handler: function () {
                    if (this.$i18n.locale === 'zh') {
                        this.options = [{value: '0', label: '购买',}, {value: '1', label: '出售',}]
                    } else this.options = [{value: '0', label: 'Buy',}, {value: '1', label: 'Sell',}]
                },
                immediate: true
            }
        },
        computed: {
            ...mapState({
                nowRate: state => state.user.rate,
            })
        },
        methods: {
            // 提交发布表单
            submitBuyForm(formName) {
                if(this.radio === 'BTC') this.radio = '1'
                else this.radio = '2'
                if(this.radio1 === '购买') this.radio1 = '1'
                else this.radio1 = '2'
                this.$refs[formName].validate(async (valid, object) => {
                    if (!valid) this.myNotify(object)
                    if (valid) {
                        if (parseFloat(this.infoOfPublish.range_start) > parseFloat(this.infoOfPublish.range_end)) {
                            [this.infoOfPublish.range_start, this.infoOfPublish.range_end] =
                                [this.infoOfPublish.range_end, this.infoOfPublish.range_start]
                        }
                        let params = {
                            currency_id: this.radio,
                            type: this.radio1,
                            amount: this.infoOfPublish.total,
                            price: this.infoOfPublish.unit_price,
                            range_start: this.infoOfPublish.range_start,
                            range_end: this.infoOfPublish.range_end,
                            remark: this.infoOfPublish.remark
                        }
                        console.log(params)
                        let res = await myFunctions.post('WebAccept/create', params);
                        if (res) {
                            this.$message.success('发布成功')
                            this.infoOfPublish = {}
                        }
                    } 
                })
            },
        }
    }
</script>

<style lang="less" scoped>
    .container {
        margin-top: 30px;
        .public_box{
            display: inline-block;
            padding: 10px 10px 10px;
            border: 1px solid #DCDFE6;
            background: #baf1f8;
            .rate_box{
                line-height: 30px;
                margin-bottom: 10px;
                margin-left: 30px;
                span{
                    font-size: 14px;
                    margin-right: 20px;
                    color: #555;
                }
            }
        }
    }
    .demo-ruleForm {
        display: inline-block;
        text-align: left;

        .el-form-item {
            padding-bottom: 12px;
            width: 250px;
        }

        .submitBtn{
            text-align: right;
        }

        .remark {
            width: 100%;
        }
    }


    .el-form-item__label {
        text-align: left;
    }

    .range {
        position: relative;
        left: 25px;
        top: 2px;
    }

    .rate {
        display: block;
        border: none;
    }

    .limit {
        display: inline-block;
    }

</style>>
