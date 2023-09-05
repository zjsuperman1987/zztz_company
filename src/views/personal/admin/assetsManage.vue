<template>
    <div>
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="refresh">{{ $t('button.refresh') }}
            </el-button>
        </div>

        <el-card shadow="always" style="margin-bottom: 10px">
            <div slot="header" class="clear-fix">
                <span>BTC :</span>
            </div>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">总资金：</label>{{ btcSiteForm.total }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">管理员总账：</label>{{ btcSiteForm.admin_ledger }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">用户资金：</label>{{ btcSiteForm.user_balance }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">已提币：</label>{{ btcSiteForm.already_withdrawal }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">待提币：</label>{{ btcSiteForm.wait_withdrawal }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">待提币笔数：</label>{{ btcSiteForm.wait_withdrawal_count }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">充值：</label>{{ btcSiteForm.recharge }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">待结算：</label>{{ btcSiteForm.user_settle }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">最近BTC汇率：</label>{{ parseFloat(btcSiteForm.last_rate *  siteForm.last_usd_rate).toFixed(6)}}
                    </div>
                </el-col>

                <el-col :span="6" class="item">
                    <div>
                        <label class="label">最近USD汇率：</label>{{ siteForm.last_usd_rate }}
                    </div>
                </el-col>
                <el-col :span="6">
                    <div>
                        <label class="label">最近USD更新时间：</label>{{ siteForm.last_settle_time }}
                    </div>
                </el-col>
                <el-col :span="6">
                    <div>
                        <label class="label">保证金：</label>{{ btcSiteForm.security_deposit }}
                    </div>
                </el-col>
            </el-row>
        </el-card>
        <el-card shadow="always" style="margin-bottom: 10px">
            <div slot="header" class="clearfix">
                <span>USDT :</span>
            </div>
            <el-row>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">总资金：</label>{{ usdtSiteForm.total }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">管理员总账：</label>{{ usdtSiteForm.admin_ledger }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">用户资金：</label>{{ usdtSiteForm.user_balance }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">已提币：</label>{{ usdtSiteForm.already_withdrawal }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">待提币：</label>{{ usdtSiteForm.wait_withdrawal }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">待提币笔数：</label>{{ usdtSiteForm.wait_withdrawal_count }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">充值：</label>{{ usdtSiteForm.recharge }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">待结算：</label>{{ usdtSiteForm.user_settle }}
                    </div>
                </el-col>

                <el-col :span="6" class="item">
                    <div>
                        <label class="label">最近USDT汇率：</label>{{ usdtSiteForm.last_rate }}
                    </div>
                </el-col>
                <el-col :span="6" class="item">
                    <div>
                        <label class="label">最近USD汇率：</label>{{ siteForm.last_usd_rate }}
                    </div>
                </el-col>
                <el-col :span="6">
                    <div>
                        <label class="label">最近USD更新时间：</label>{{ siteForm.last_settle_time }}
                    </div>
                </el-col>
                <el-col :span="6">
                    <div>
                        <label class="label">保证金：</label>{{ usdtSiteForm.security_deposit }}
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <el-table size="small" :data="tableData" :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  highlight-current-row border v-loading="loading">
            <el-table-column label="ID" width="40" align="center">
                <template v-slot="{$index}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="时间" prop="create_time" width="120" align="center"></el-table-column>
            <el-table-column label="用户" width="60" align="center">
                <template v-slot="{row}">
                    <el-button type="text" @click="userClick(row)">{{ row.uid }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="类型" prop="type_title" width="90" align="center"></el-table-column>
            <el-table-column label="借贷" width="30" align="center">
                <template v-slot="{row}">
                    <span v-if="row.guide === 0">平</span>
                    <span v-if="row.guide === 1" style="color: #8AD72D">入账</span>
                    <span v-if="row.guide === 2" style="color: red">支出</span>
                </template>
            </el-table-column>
            <el-table-column label="金额" prop="amount" width="90">
                 <template slot-scope="{ row }">
                    {{ row.amount}} {{ row.currency.ift_name}}
                </template>
            </el-table-column>
            <el-table-column label="账户资金前"  width="120">
                <template slot-scope="{ row }">
                    {{ row.befor_balance}} {{ row.currency.ift_name}}
                </template>
            </el-table-column>
            <el-table-column label="账户资金后" width="120">
                <template slot-scope="{ row }">
                    {{ row.after_balance}} {{ row.currency.ift_name}}
                </template>
            </el-table-column>
            <el-table-column label="结算资金前" width="110">
                <template slot-scope="{ row }">
                    {{ row.befor_freeze}} {{ row.currency.ift_name}}
                </template>
            </el-table-column>
            <el-table-column label="结算资金后" width="110">
                <template slot-scope="{ row }">
                    {{ row.after_freeze}} {{ row.currency.ift_name}}
                </template>
            </el-table-column>
            <el-table-column label="备注" prop="rmk" show-overflow-tooltip></el-table-column>
        </el-table>
        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getAssets()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions";

    export default {
        name: "assetsManage",
        data() {
            return {
                tableData: [],
                total: 0,
                listQuery: {limit: 20, page: 1},
                siteForm: {},
                btcSiteForm: {},
                usdtSiteForm: {},
                loading: false
            }
        },
        computed: {
            ...mapState({
                rate: state => state.user.rate
            })
        },
        created() {
            this.getAssets()
            this.getAssetsTotal()
        },
        methods: {
            refresh() {
                this.getAssets()
                this.getAssetsTotal()
            },
            getAssets() {
                this.loading = true
                let params = this.listQuery
                this.$http.get('/AdmSiteStatus', {params}).then(res => {
                    if (res) {
                        for(let prop of res.data){
                            prop.create_time = myFunctions.parseTime(prop.create_time,'{y}-{m}-{d} {h}:{i}')
                        }
                        this.tableData = res.data
                        console.log(this.tableData)
                        this.total = res.total
                    }
                    this.loading = false
                })
            },

            getAssetsTotal() {
                this.$http.get('/AdmSiteStatus/statistics').then(res => {
                    if (res) {
                        this.siteForm = res
                        this.btcSiteForm = res.BTC
                        this.usdtSiteForm = res.USDT
                    }
                })
            },

            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row.uid)
                this.$emit('openByName','userDetails')
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-card {
            .el-card__header{
                padding: 0;
                margin: 5px 0 0 10px;
            }
            .clear-fix:before,
            .clear-fix:after {
                display: table;
                content: "";
            }
            .clear-fix:after {
                clear: both
            }
            .item {
                margin-bottom: 6px;
            }
            .el-row{
                margin: 0;
            }

            .label {
                margin-right: 6px;
                font-weight: 600;
            }

        }
    }
</style>