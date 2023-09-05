<template>
    <div>
        <div class="nav-select">
            <span class="currency_type">请选择币种:</span>
            <el-radio-group v-model="radio" @change="currency_change">
                <el-radio-button size="mini" label="1" border>BTC</el-radio-button>
                <el-radio-button size="mini" label="2" border>USDT</el-radio-button>
            </el-radio-group>
        </div>
        <div class="row-form" v-if="payStatus && payPwd">
            <el-form :model="withdrawForm" ref="withdrawForm" :rules="rules" inline size="small" :show-message="false">
                <el-form-item :label="$t('assets.address')" prop="address">
                    <el-input size="small" clearable v-model="withdrawForm.address"
                              @keyup.enter.native="submitWithdraw('withdrawForm')"
                              :placeholder="$t('assets.desAddr')" :validate-event="false"
                              style="width: 250px"></el-input>
                </el-form-item>
                <el-form-item :label="$t('assets.wdAmount')" prop="amount">
                    <el-input size="small" v-model="withdrawForm.amount"
                              @keyup.enter.native="submitWithdraw('withdrawForm')"
                              :placeholder="$t('assets.desAmount')" style="width: 80px"
                              @input="limitInput"
                              :validate-event="false"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="small" type="primary"
                               @click="submitWithdraw('withdrawForm')">{{ $t('button.confirm') }}
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="check_box" v-else>
            <el-form :model="pay" ref="pay" :rules="rules" size="small" :show-message="false">
                <span>请先核对交易密码:</span>
                <el-input size="mini" style="width: 35%;margin: 0 10px" v-model="pay.payPassword"
                                            @keyup.enter.native="checkPassword('pay')" type="password"
                                            :placeholder="$t('goodsDetails.buyer.desInput')">
                </el-input>
                <el-button type="primary" :loading="submitLoading" size="mini"
                        @click="payPwd ? checkPassword('pay') : $router.push({name: 'userInfo'})">
                        {{ payPwd ? $t('goodsDetails.buyer.sureBtn') : $t('goodsDetails.buyer.setPwd')}}
                </el-button>
            </el-form>
        </div>

        <div class="row-table">
            <div class="table-title" style="display: flex;justify-content: space-between">
                <span>{{ $t('assets.wdHistory') }}</span>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getRecords">{{ $t('button.refresh')
                    }}
                </el-button>
            </div>
            <el-table fit size="small" :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="recordList" ref="recordList" v-loading="loading">
                <el-table-column label="ID" width="40">
                    <template v-slot="{$index,row}">
                        {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('assets.address')" prop="address" width="350"></el-table-column>
                <el-table-column :label="$t('assets.wdAmount')" prop="amount"></el-table-column>
                <el-table-column :label="$t('table.submitTime')" prop="crestamp"></el-table-column>
                <el-table-column :label="$t('table.status')" prop="status">
                    <template v-slot="{row}">
                        <el-tag size="small" v-if="row.status===0 || row.status===1 || row.status===3">{{
                            $t('assets.audit') }}
                        </el-tag>
                        <el-tag size="small" type="success" v-if="row.status===2">{{ $t('assets.auditSuccess') }}
                        </el-tag>
                        <el-popover v-if="row.status===2"
                            placement="bottom"
                            title=""
                            width="200"
                            trigger="click"
                            :content="row.tx">
                            <el-button  type="primary" size="mini" slot="reference">打币地址</el-button>
                        </el-popover>
                        <el-tag size="small" type="danger" v-if="row.status===5 || row.status===4">
                            {{$t('assets.auditFail') }}
                        </el-tag>
                        <el-popover v-if="row.status===5 || row.status===4"
                            placement="bottom"
                            title=""
                            width="200"
                            trigger="click"
                            :content="row.rmk">
                            <el-button  type="primary" size="mini" slot="reference">查看详情</el-button>
                        </el-popover>
                        <el-tag size="small" type="info" v-if="row.status===6">已撤销</el-tag>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('table.actions')" width="80">
                    <template v-slot="{row}">
                        <el-button v-if="row.status === 0" type="primary" size="mini"
                                   :loading="row.loading" @click="cancel(row)">撤销
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="withdrawRecordsCount>0"
                    :total="withdrawRecordsCount"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getRecords()"
                    :page-size="listQuery.limit"
                    :page-sizes="[10, 20, 40]"/>
        </div>

        <el-alert title="无" type="success" :closable="false" style="text-align: left;margin-top: 10px">
            <template slot='title'>
                <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}:</div>
                <div> - {{ $t('assets.tips1') }}</div>
                <div> - {{ $t('assets.tips2') }}</div>
            </template>
        </el-alert>
    </div>
</template>

<script>
    import myFunctions from '@/utils/myFunctions'
    import {mapState} from 'vuex'
    import {MD5} from "crypto-js";

    const currency = () => import('@/components/common/Currency')
    export default {
        name: "Withdraw",
        components: {currency},
        data() {
            return {
                radio: '1',
                recordList: [], //提币记录数组
                withdrawRecords: [],
                withdrawRecordsCount: 0,
                loading: false,
                withdrawForm: {
                    address: '',
                    amount: '',
                    pwd: '',
                },
                pay: {
                    payPassword: ''
                },
                submitLoading: false,
                listQuery: {
                    page: 1,
                    limit: 10,
                },
                rules: {
                    address: [{required: true, message: '请填入地址'}],
                    amount: [{required: true, message: '请填入数量'}],
                    pwd: [{required: true, message: '请填入交易密码'}],
                },
            }
        },
        computed: {
            ...mapState({
                token: state => state.user.token,
                balance: state => state.user.userInfo.balance,
                payStatus: state => state.user.userInfo.verify_pinpass,
                payPwd: (state) => state.user.userInfo.paypwd,
            })
        },
        created() {
            this.getRecords()
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
            //获取提币历史记录
            getRecords() {
                this.loading = true
                let params = this.listQuery
                params.currency_id = this.radio
                this.$http.get('/WebMyWithdrawal', {params}).then(res => {
                    if (res) {
                        this.withdrawRecordsCount = res.total
                        this.recordList = res.data
                    }
                    this.loading = false
                })
            },

            //提交提币请求
            submitWithdraw(form) {
                if(!this.radio) this.$message.warning('请选择您要币种!!')
                if(this.radio){
                    this.$refs[form].validate((valid, object) => {
                        if (!valid) this.$validateNotify(object)
                        if (valid) {
                            let params = {
                                address: this.withdrawForm.address,
                                amount: this.withdrawForm.amount,
                                currency_id: this.radio,
                            }
                            this.$http('/WebMyWithdrawal/save', {method: 'post', params}).then(res => {
                                if (res) {
                                    this.$message.success('提币成功')
                                    this.$refs[form].resetFields()
                                    this.$store.dispatch('user/getInfo')
                                    this.getRecords()
                                }
                            })
                        }
                    })
                }
            },
            limitInput(val) {
                this.withdrawForm.amount = this.$myFunctions.cutPoint(val, 5)
            },
            cancel(row) {
                this.$set(row, 'loading', true)
                this.$http('/WebMyWithdrawal/update', {method: 'post', params : {id: row.id, status: 6}}).then(res => {
                    if (res) {
                        this.$message.success('撤销成功')
                        this.getRecords()
                    }
                    this.$set(row, 'loading', false)
                })
            },
            currency_change(){
                this.getRecords()
            },
        },
    }
</script>

<style scoped lang="less">
    @import "../../../../../styles/common";

    .nav-select {
        padding: 5px 0 10px 20px;

        .currency_type{
            margin-right: 10px;
        }
    }

    .row-form {
        background: #CBD6D8;
        padding: 3px 6px;

        ::v-deep {
            .el-form-item {
                margin-bottom: 0;
            }
        }
    }

    .row-table {
        margin-top: 10px;
    }
</style>
