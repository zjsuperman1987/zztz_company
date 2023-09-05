<template>
    <div>
        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
            <div>
                <el-button size="mini" type="primary" icon="el-icon-edit-outline" @click="publish">{{ $t('home.pubAD')
                    }}
                </el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getADList">{{ $t('button.refresh')
                    }}
                </el-button>
            </div>
        </div>

        <el-table size="small" :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  highlight-current-row :data="adList" class="table" v-loading="adListLoading">
            <el-table-column label="ID" prop="tid" width="80"></el-table-column>
            <el-table-column :label="$t('table.title')" show-overflow-tooltip>
                <template v-slot="{row}">
                    <router-link :to="{ name: 'ad-details',query: { id: row.tid, type: 'ad' }}">{{ row.title }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.showPo')" width="130">
                <template v-slot="{row}">
                    <div v-if="row.adv !== undefined">
                        <span v-if="row.adv.type === 0">{{$t('table.banner')}}</span>
                        <span v-if="row.adv.type === 1">{{$t('table.middle')}}</span>
                        <span v-if="row.adv.type === 2">{{$t('table.both')}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.timeStart')" width="110" prop="adv.start"></el-table-column>
            <el-table-column :label="$t('table.timeEnd')" width="110" prop="adv.end"></el-table-column>
            <el-table-column :label="$t('table.status')" width="80">
                <template v-slot="{row}">
                    <template v-if="row.adv !== undefined">
                        <!--            状态[0正常|1已停展|2管理员关闭]-->
                        <el-tag type="success" size="small" v-if="row.adv.status === 0">正常</el-tag>
                        <el-tag type="warning" size="small" v-if="row.adv.status === 1">停展</el-tag>
                        <el-tag type="info" size="small" v-if="row.adv.status === 2">关闭</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" width="130">
                <template v-slot="{row}">
                    <el-button-group v-if="!row.expire">
                        <el-button size="small" :type="row.adv ? 'primary' : 'success'" :loading="buyLoading"
                                   @click="dialogBUY(row)">{{row.adv ? $t('ad.renew') : $t('ad.buy')}}
                        </el-button>
                        <el-button size="small" type="primary" v-if="!row.adv"
                                   @click="$router.push({ name: 'publishAD',query: { id: row.tid.toString(), type: 'ad' }})">
                            {{ $t('table.edit') }}
                        </el-button>
                        <el-button size="mini" v-if="row.adv" :type="row.adv.status ? 'primary' : 'danger'"
                                   @click="activation(row,row.adv && row.adv.status ? 0 : 1)">
                            {{row.adv.status ? $t('ad.show') : $t('ad.stopShow')}}
                        </el-button>
                        <!-- status [0待发布|1已发布|2已结束|3关闭|4管理员关闭|5删除]-->
                        <!--<el-button v-if="row.status !== 1" size="small" type="danger" @click="deleteAD(row)">删除</el-button>-->
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="total>0"
                :total="total"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getADList()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"/>

        <el-dialog :title="$t('ad.pay')" custom-class="width350" v-dialogDrag :visible.sync="dialogADVisible"
                   :close-on-click-modal="false" @close="reset('buyAD')">
            <el-form :model="buyAD" ref="buyAD" :rules="rules" size="small" :show-message="false" label-position="top">
                <el-form-item :label="$t('table.showPo')" prop="position">
                    <el-radio-group v-model="radio3" size="mini">
                        <el-radio-button type="primary" plain label="1">顶部横幅</el-radio-button>
                        <el-radio-button type="primary" plain label="2">首页中部</el-radio-button>
                        <el-radio-button type="primary" plain label="3">两者全选</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('ad.weeks')" prop="week">
                    <div class="weeks">
                        <el-radio-group v-model="radio2" size="mini">
                            <el-radio-button type="primary" plain label="2">2周</el-radio-button>
                            <el-radio-button type="primary" plain label="4">4周</el-radio-button>
                            <el-radio-button type="primary" plain label="8">8周</el-radio-button>
                            <el-radio-button type="primary" plain label="52">一年</el-radio-button>
                        </el-radio-group>
                        <el-input size="small" style="margin-left: 10px;width: 80px" v-model="radio2"
                                  oninput="value=value.replace(/[^\d]/g,'')">
                            <template slot="append">{{ $t('ad.week') }}</template>
                        </el-input>
                    </div>
                </el-form-item>
                <el-form-item>
                    <span style="display: inline-block;margin-top: 10px;">{{ $t('ad.total') }}
                        <span style="font-weight: 600">{{(tfee * radio2).toFixed(2) }} USD</span>
                    </span>

                    <div class="current_select">
                        <span class="pay_type">
                            选择支付方式:
                        </span>
                        <el-radio-group v-model="radio1" size="mini" class="btn-currency">
                            <el-radio label="1" border>BTC</el-radio>
                            <el-radio label="2" border>USDT</el-radio>
                        </el-radio-group>
                        <div style="margin-top:10px">
                            折合：{{ BTCRate | cutPoint(5) }} BTC
                            折合：{{ USDTRate | cutPoint(2) }} USDT
                        </div>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogADVisible = false">{{ $t('button.cancel') }}</el-button>
        <el-button size="small" type="primary" @click="submitAD('buyAD')">{{ $t('ad.payment') }}</el-button>
      </span>
        </el-dialog>


    </div>
</template>

<script>
    import {generateTitle} from '@/utils/i18n'
    import {mapState} from "vuex";

    export default {
        name: "myAD",
        data() {
            let balance = (rule, value, callback) => {
                if (Number(value) === 1) callback(new Error('最少购买2周'));
                if (this.balance <= (this.tfee * this.radio2) / this.rate.btc_usd) callback(new Error(this.$t('ad.balance')));
                else callback()
            }
            return {
                radio1: '1',
                radio2: '2',
                radio3: '1',
                dialogADVisible: false,
                adListLoading: false,
                buyAD: {
                    radio2: '',
                    radio3: '',
                },
                showPosition: '',
                tid: '',
                tfee: '',
                options: [],
                adList: [],
                total: 0,
                listQuery: {
                    page: 1,
                    limit: 20,
                },
                buyLoading: false,
                rules: {
                    radio3: [{required: true, message: this.$t('ad.desPosition'), trigger: 'change'}],
                    radio2: [{required: true, message: this.$t('ad.desWeeks'), trigger: 'blur'}, {
                        validator: balance,
                        trigger: "blur"
                    }]
                },
            }
        },
        computed: {
            weekOptions() {
                return [
                    {label: this.$t('ad.twoWeeks'), value: 2},
                    {label: this.$t('ad.fourWeeks'), value: 4},
                    {label: this.$t('ad.eightWeeks'), value: 8},
                    {label: this.$t('ad.oneYear'), value: 52},
                ]
            },
            BTCRate() {
                return (1 / this.rate.BTC.usd) * (this.tfee * this.radio2)
            },
            USDTRate() {
                return (1 / this.rate.USDT.usd) * (this.tfee * this.radio2)
            },
            ...mapState({
                balance: state => state.user.userInfo.balance * 1,
                rate: state => state.user.rate,
                tend_time: state => state.user.userInfo.tend_time * 1,
                release: state => state.site.siteSetting.release_power_chars * 1,
            })
        },
        created() {
            this.getADList()
        },
        watch: {
            $route(to, from) {
                if (from.path === '/publishAD') this.getADList()
            },
            radio3: {
                handler(val) {
                    console.log(val)
                    for (let item of this.options) {
                        if ((val-1) == item.value) this.tfee = item.tfee
                    }
                    console.log(this.tfee)
                },
                immediate:true
            }
        },
        methods: {
            generateTitle,
            getADList() {
                this.adListLoading = true
                let params = {
                    ea: this.showPosition.value,
                    page: this.listQuery.page,
                    limit: this.listQuery.limit
                }
                this.$http.get('/WebMyAdv', {params}).then(res => {
                    if (res) {
                        for (let item of res.data) {
                            if (item.adv && item.adv.end) {
                                let time = item.adv.end * 1000
                                item.adv.end = this.$moment(time).format('YYYY-MM-DD HH:mm')
                                if (time < new Date().getTime()) item.expire = true
                            }
                        }
                        this.adList = res.data
                        this.total = res.total
                    }
                    this.adListLoading = false
                })
            },
            getSelect() {
                return new Promise((resolve) => {
                    this.$http.get('/WebCategory/all', {params: {type: 1}}).then(res => {
                        if (res) {
                            console.log(res)
                            this.options = res
                            resolve(res)
                            this.choose(this.radio3)
                        }
                    })
                })
            },
            weekButtonClick(item) {
                this.radio2 = item.value
            },
            choose(val) {
                for (let item of this.options) {
                    if (val == (item.value+1)) this.tfee = item.tfee
                }
                console.log(this.tfee)
            },
            publish() {
                if (this.release) {
                    let nowTime = Math.round(new Date().getTime() / 1000)
                    if (this.tend_time < nowTime) this.$message.warning('发布权已过期，请重新购买')
                    else this.$router.push({name: 'publishAD', query: {type: 'ad'}});
                } else this.$router.push({name: 'publishAD', query: {type: 'ad'}});
            },
            submitAD(formName) {
                this.$refs[formName].validate((valid, object) => {
                    if (valid) {
                        let params = {
                            currency_id: this.radio1,
                            type: 2,
                            week: this.radio2,
                            position: this.radio3 - 1,
                            tid: this.tid,
                        }
                        console.log(params)
                        this.$http('/WebBuyVip/create', {method: 'post', params}).then(res => {
                            if (res) {
                                this.$message.success('购买成功')
                                this.getADList()
                                this.dialogADVisible = false
                            }
                        })
                    } else this.$validateNotify(object)
                })
            },
            dialogBUY(row) {
                this.buyLoading = true
                this.getSelect().then(() => {
                    this.getRate()
                    this.tid = row.tid
                })
            },

            getRate() {
                this.dialogADVisible = true
                this.buyLoading = false
            },

            reset(formName) {
                this.$refs[formName].resetFields()
            },

            activation(row, sign) {
                this.$http(`/WebMyAdv/${row.tid}`, {method: 'put', params: {status: sign}}).then(res => {
                    if (res) {
                        this.$message({type: 'success', message: '操作成功!'});
                        this.getADList()
                    }
                })
            },

            // deleteAD(row) {
            //     this.$confirm('是否要删除当前广告', '提示', {
            //         confirmButtonText: '确定',
            //         cancelButtonText: '取消',
            //         type: 'warning',
            //         closeOnClickModal: false,
            //         closeOnPressEscape: false,
            //         beforeClose: (action, instance, done) => {
            //             if (action === 'confirm') {
            //                 instance.confirmButtonLoading = true
            //                 this.$http('/WebMyAdv/delete', {method: 'post', params: {id: row.tid}}).then(res => {
            //                     if (res) {
            //                         this.$message({type: 'success', message: '删除成功!'});
            //                         this.getADList()
            //                         done()
            //                     }
            //                     instance.confirmButtonLoading = false
            //                 })
            //             } else done()
            //         }
            //     }).catch(() => {});
            // },
            resetFilter() {
                this.showPosition = ''
                this.getADList()
            }
        },
    }
</script>

<style scoped lang="less">
    ::v-deep .table {
        a {
            color: #409EFF;
        }

        p {
            line-height: 1.3;
        }
    }

    ::v-deep {
        .el-radio {
            width: auto;
            background: #fff;
            margin-right: 10px;

            &:hover {
                background: #E4F0FA;
            }

            .el-radio__input {
                display: none;
            }

            .el-radio__label {
                padding-left: 0;
            }

            &.is-checked {
                background: #3c648c;
            }

            &.is-bordered + .el-radio.is-bordered {
                margin-left: 0;
            }

            .el-radio__input.is-checked + .el-radio__label {
                color: #fff;
            }
        }
    }

    .weeks {
        display: flex;

        /deep/.el-input {
                .el-input-group__append{
                    padding: 0 12px;
                }
                .el-input__inner{
                    padding-left: 12px;
                    height: 28px;
                }
            }
    }

    .current_select {
        position: relative;
        margin-top: 5px;
        .el-radio--mini {
            width: 60px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            padding: 0;
            margin-left: 15px;
        }
    }

</style>
