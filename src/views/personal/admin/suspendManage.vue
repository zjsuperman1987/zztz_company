<template>
    <div style="width: 100%">

        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getSuspendList">{{ $t('button.refresh')
                }}
            </el-button>
        </div>

        <el-table :data="tableData" v-loading="loading" highlight-current-row border
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}" size="mini">
            <el-table-column label="ID" width="50">
                <template v-slot="{$index,row}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="交易编号" prop="tid" width="60"></el-table-column>
            <el-table-column label="所属分类" prop="ea_title" width="60" align="center"></el-table-column>
            <el-table-column label="商品名称" show-overflow-tooltip>
                <template v-slot="{row}">
                    <router-link
                            :to="{ name: 'goods-details', query: { id: row.tid, oId: row.id, partner: row.buyer } }">{{
                        row.goods_title }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="卖家" width="60" align="center">
                <template v-slot="{row}">
                    <el-button type="text" @click="userClick(row.seller)">{{ row.seller }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="交易金额(BTC)" prop="amount" width="90"></el-table-column>
            <el-table-column label="买家" width="60" align="center">
                <template v-slot="{row}">
                    <el-button type="text" @click="userClick(row.buyer)">{{ row.buyer }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="付款时间" prop="cretime" width="120" align="center"></el-table-column>
            <el-table-column label="挂起时间" prop="appeal_time" width="120" align="center"></el-table-column>
            <el-table-column label="讨论" prop="last_post_count" width="30" align="center"></el-table-column>
            <el-table-column label="最后答复" prop="last_post_time" width="80" align="center"></el-table-column>
            <el-table-column label="操作" align="center" width="50">
                <template v-slot="{row}">
                    <el-button size="mini" type="primary"
                               @click="$router.push({ name: 'goods-details', query: { id: row.tid, oId: row.id, partner: row.buyer } })">
                        打开
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
                @pagination="getSuspendList()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />
    </div>
</template>

<script>
    export default {
        name: "suspendManage",
        data() {
            return {
                tableData: [],
                loading: false,
                listQuery: {
                    limit: 20,
                    page: 1
                },
                total: 0,
            }
        },
        created() {
            this.getSuspendList()
        },
        methods: {
            getSuspendList() {
                this.loading = true
                let params = {
                    limit: this.listQuery.limit,
                    page: this.listQuery.page,
                    status: 0,
                }
                this.$http.get('/AdmHangUp', {params}).then(res => {
                    if (res) {
                        this.tableData = res.data
                        this.total = res.total
                    }
                    this.loading = false
                })
            },
            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row)
                this.$emit('openByName','userDetails')
            }
        }
    }
</script>

