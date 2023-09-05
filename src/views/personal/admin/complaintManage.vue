<template>
    <div style="width: 100%">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="refresh">{{ $t('button.refresh') }}
            </el-button>
        </div>

        <div class="buyer">
            <p>买家投诉列表</p>
            <el-table :data="buyerTableData" v-loading="buyerLoading" highlight-current-row border
                      :header-cell-style="{background:'#eef1f6',color:'#606266'}" size="mini">
                <el-table-column label="ID" width="50">
                    <template v-slot="{$index,row}">
                        {{ $index + (buyerListQuery.page - 1) * buyerListQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="交易编号" prop="id" width="60" align="center"></el-table-column>
                <el-table-column label="投诉人" prop="tid" width="60" align="center">
                    <template v-slot="{row}">
                        <el-button type="text" @click="userClick(row.buyer)">{{ row.buyer }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="投诉时间" prop="appeal_time" width="80" align="center"></el-table-column>
                <el-table-column label="所属分类" prop="ea_title" width="75"  align="center"></el-table-column>
                <el-table-column label="商品名称" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link @click.native="inTO(row)" to="">{{ row.goods_title }}</router-link>
                    </template>
                </el-table-column>
                <el-table-column label="卖家" width="60" align="center">
                    <template v-slot="{row}">
                        <el-button type="text" @click="userClick(row.seller)">{{ row.seller }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="交易金额(BTC)" prop="amount" width="90"></el-table-column>
                <el-table-column label="付款时间" prop="cretime" width="110" align="center"></el-table-column>
                <el-table-column label="讨论" prop="last_post_count" width="40" align="center"></el-table-column>
                <el-table-column label="最后答复时间 | 人" width="120" align="center">
                    <template v-slot="{row}">
                        <span>{{ row.last_post_time }} | {{ row.last_post_uid }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="50">
                    <template v-slot="{row}">
                        <el-button size="mini" type="primary" @click="inTO(row)">打开</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="buyerTotal>0"
                    :total="buyerTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="buyerListQuery.page"
                    :limit.sync="buyerListQuery.limit"
                    @pagination="getBuyerSuspendList()"
                    :page-size="buyerListQuery.limit"
                    :page-sizes="[20, 40, 60]"
            />
        </div>

        <div class="seller">
            <p>卖家投诉列表</p>
            <el-table :data="sellerTableData" v-loading="sellerLoading" highlight-current-row border
                      :header-cell-style="{background:'#eef1f6',color:'#606266'}" size="mini">
                <el-table-column label="ID" width="50">
                    <template v-slot="{$index,row}">
                        {{ $index + (sellerListQuery.page - 1) * sellerListQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="编号" prop="tid" width="60"></el-table-column>
                <el-table-column label="所属分类" prop="ea_title" show-overflow-tooltip></el-table-column>
                <el-table-column label="商品名称" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link @click.native="inTO(row)" to="">{{ row.goods_title }}</router-link>
                    </template>
                </el-table-column>
                <el-table-column label="卖家" width="60">
                    <template v-slot="{row}">
                        <el-button type="text" @click="userClick(row.seller)">{{ row.seller }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="买家" width="60">
                    <template v-slot="{row}">
                        <el-button type="text" @click="userClick(row.buyer)">{{ row.buyer }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="金额(BTC)" prop="amount" width="80"></el-table-column>
                <el-table-column label="付款时间" prop="cretime" width="105"></el-table-column>
                <el-table-column label="投诉时间" prop="appeal_time" width="70"></el-table-column>
                <el-table-column label="讨论" prop="last_post_count" width="30"></el-table-column>
                <el-table-column label="最后答复" prop="last_post_time" width="80"></el-table-column>
                <el-table-column label="操作" align="center" width="50">
                    <template v-slot="{row}">
                        <el-button size="mini" type="primary" @click="inTO(row)">打开</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="sellerTotal>0"
                    :total="sellerTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="sellerListQuery.page"
                    :limit.sync="sellerListQuery.limit"
                    @pagination="getSellerSuspendList()"
                    :page-size="sellerListQuery.limit"
                    :page-sizes="[20, 40, 60]"
            />
        </div>
    </div>
</template>

<script>
    export default {
        name: "complaintManage",
        data() {
            return {
                buyerTableData: [],
                buyerLoading: false,
                buyerListQuery: {
                    limit: 20,
                    page: 1
                },
                buyerTotal: 0,

                sellerTableData: [],
                sellerLoading: false,
                sellerListQuery: {
                    limit: 20,
                    page: 1
                },
                sellerTotal: 0,
            }
        },
        created() {
            this.getBuyerSuspendList()
            this.getSellerSuspendList()
        },
        methods: {
            refresh() {
                this.getBuyerSuspendList()
                this.getSellerSuspendList()
            },
            getBuyerSuspendList() {
                this.buyerLoading = true
                let params = {
                    limit: this.buyerListQuery.limit,
                    page: this.buyerListQuery.page,
                    status: 1,
                    role: 0
                }
                this.$http.get('/AdmComplaints', {params}).then(res => {
                    if (res) {
                        this.buyerTableData = res.data
                        this.buyerTotal = res.total
                    }
                    this.buyerLoading = false
                })
            },

            getSellerSuspendList() {
                this.sellerLoading = true
                let params = {
                    limit: this.sellerListQuery.limit,
                    page: this.sellerListQuery.page,
                    status: 1,
                    role: 1
                }
                this.$http.get('/AdmComplaints', {params}).then(res => {
                    if (res) {
                        this.sellerTableData = res.data
                        this.sellerTotal = res.total
                    }
                    this.sellerLoading = false
                })
            },

            inTO(row) {
                this.$store.commit('goods/changeTab', 'orderList')
                this.$router.push({name: 'goods-details', query: {id: row.tid, oId: row.id}})
            },

            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row)
                this.$emit('openByName','userDetails')
            }
        }
    }
</script>

<style scoped lang="less">
    .buyer, .seller {
        p {
            background: #9bf0d6;
            padding: 2px 10px;
            font-weight: 600;
        }
    }

    .seller {
        margin-top: 20px;
    }
</style>
