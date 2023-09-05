<template>
    <div class="order">

        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getOrderList">{{ $t('button.refresh')
                }}
            </el-button>
        </div>

        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  highlight-current-row :data="orderList" size="small" v-loading="orderListLoading">
            <el-table-column label="ID" prop="id" width="40" align="center"></el-table-column>
            <el-table-column :label="$t('table.title')" show-overflow-tooltip width="180">
                <template v-slot="{row}">
                    <span>{{ row.goods.title }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.seller')" prop="seller" width="50" align="center"></el-table-column>
            <el-table-column :label="$t('table.volume')" prop="volume" width="50" align="center"></el-table-column>
            <el-table-column :label="$t('table.unitPrice')" prop="usdprice" width="70" align="center"></el-table-column>
            <el-table-column :label="$t('table.amount')" prop="amount" width="100"></el-table-column>
            <el-table-column :label="$t('table.payTime')" prop="cretime" width="110" align="center"></el-table-column>
            <el-table-column :label="$t('table.payStatus')" width="70" align="center">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <el-tag v-if="row.request_settle" type="success">{{ $t('order.pay') }}</el-tag>
                        <el-tag size="mini"
                                v-if="!row.request_settle && !row.hold && !row.buyer_mediate && !row.seller_mediate &&
                  !row.buyer_complaint && !row.seller_complaint">{{ $t('order.paying') }}
                        </el-tag>
                        <el-tag size="mini" v-if="row.hold" type="danger">{{ $t('order.hold') }}</el-tag>
                        <el-tag size="mini" type="warning"
                                v-if="(row.buyer_mediate || row.seller_mediate) &&
                    !row.buyer_complaint && !row.seller_complaint">{{ $t('order.mediate') }}
                        </el-tag>
                        <el-tag size="mini" type="warning"
                                v-if="(row.buyer_complaint || row.seller_complaint) &&
                    !row.buyer_mediate && !row.seller_mediate">{{ $t('order.complaint') }}
                        </el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.orderStatus')" width="80" align="center">
                <template v-slot="{row}">
                    <el-tag size="mini" v-if="row.status === 0">{{ $t('order.trading') }}</el-tag>
                    <el-tag size="mini" v-if="row.status === 1" type="info">{{ $t('order.refunded') }}</el-tag>
                    <el-tag size="mini" v-if="row.status === 2" type="success">{{ $t('order.success') }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.onlineStatus')" width="80" align="center">
                <template v-slot="{row}">
                    <el-tag size="mini" :type="row.goods.down ? 'info' : ''">
                        {{ row.goods.down ? $t('order.offline') : $t('order.online') }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.goodsStatus')" width="80" align="center">
                <template v-slot="{row}">
                    <el-tag size="mini" v-if="row.goods.status === 1">{{ $t('order.normal') }}</el-tag>
                    <el-tag size="mini" v-if="row.goods.status === 2" type="info">{{ $t('order.closed') }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" align="center">
                <template v-slot="{row}">
                    <el-button size="mini" v-if="row.goods.status !== 2" type="primary"
                               @click="inTo(row)">{{ $t('table.view') }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getOrderList()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />
    </div>
</template>

<script>
    import {generateTitle} from '@/utils/i18n'
    import {mapState} from 'vuex'

    export default {
        name: "myOrder",
        data() {
            return {
                total: 0,
                orderList: [],
                orderListLoading: false,
                listQuery: {page: 1, limit: 20}
            }
        },
        computed: {
            ...mapState({
                mediation_costs: state => state.site.siteSetting.mediation_costs_chars,
            }),
        },
        created() {
            this.getOrderList()
        },
        methods: {
            generateTitle,
            getOrderList() {
                this.orderListLoading = true
                let params = this.listQuery
                params.my = 1
                this.$http.get('WebMyOrder', {params}).then(res => {
                    if (res) {
                        this.total = res.total
                        this.orderList = res.data
                    }
                    this.orderListLoading = false
                })
            },
            handleClick(row, opt, op, type) {
                let contents, params
                if (type) { // 1挂起/2申诉
                    this.$prompt('请输入理由', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        inputValidator: (value) => {  //对输入内容校验
                            if (!value) return '内容不能为空！';
                        },
                    }).then(({value}) => {
                        if (type === 1) contents = '挂起理由：' + value;
                        if (type === 2) contents = '申诉理由：' + value;
                        params = {
                            opt, op,
                            to_uid: row.seller,
                            partner: row.buyer,
                            contents,
                        }
                        this.$http('WebMyOrder/update', {method: 'post', params: {...params, id: row.id}}).then(res => {
                            if (res) {
                                this.$message.success('操作成功')
                                this.$http('/WebMyReplys/create', {method: 'post', params: {...params, id: row.tid}})
                                this.getOrderList()
                            }
                        })
                    }).catch(() => {})
                } else {
                    this.$http('WebMyOrder/update', {method: 'post', params : {opt, op, id: row.id}}).then(res => {
                        if (res) {
                            this.$message.success('操作成功')
                            this.getOrderList()
                        }
                    })
                }
            },
            // 调解
            applyConciliation(row, opt, op) {
                this.$confirm(
                    row.buyer_mediate ? `是否需要取消调解？`
                        : `申请调解需要支付 ${parseFloat(this.mediation_costs) || 0} BTC, 是否继续?`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                    op = row.buyer_mediate ? op : ''
                    this.$http('WebMyOrder/update', {method: 'post', params: {opt, id: row.id, op}}).then(res => {
                        if (res) {
                            this.$message.success('操作成功')
                            this.$store.dispatch('user/getInfo')
                            this.getOrderList()
                        }
                    })
                }).catch(() => {});
            },

            inTo(row) {
                console.log(row)
                this.$store.commit('goods/changeTab', 'orderList')
                this.$router.push({name: 'goods-details', query: {id: row.tid, oId: row.id}})
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        a {
            color: #409EFF;
        }
    }
</style>
