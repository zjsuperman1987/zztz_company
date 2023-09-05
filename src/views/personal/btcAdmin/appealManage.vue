<template>
    <div style="width: 100%">
        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" size="small" v-loading="listLoading"
                  :data="list" highlight-current-row style="width: 100%;">
            <el-table-column label="订单号" prop="snapshot.sn" width="120" show-overflow-tooltip></el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
                </template>
            </el-table-column>
            <el-table-column label="订单状态">
                <template slot-scope="{row}">
                    <el-tag size="mini" :type="appealStatusOptions[row.snapshot.status+1].type">
                        {{ appealStatusOptions[row.snapshot.status+1].key }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="发起人">
                <template slot-scope="{row}">
                    <el-button type="text" @click="userClick(row.pUserInfo.id)">{{ row.pUserInfo.id }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="被发起人">
                <template slot-scope="{row}">
                    <el-button type="text" @click="userClick(row.aUserInfo.id)">{{ row.aUserInfo.id }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="发起时间" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
                </template>
            </el-table-column>
            <el-table-column label="申述状态">
                <template slot-scope="{row}">
                    <el-tag size="mini" v-show="row.status === 1">待处理</el-tag>
                    <el-tag size="mini" v-show="row.status === 2" type="success">通过</el-tag>
                    <el-tag size="mini" v-show="row.status === 3" type="info">不通过</el-tag>
                    <el-tag size="mini" v-show="row.status === 4" type="info">已取消</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template slot-scope="{row}">
                    <el-button size="mini" style="box-sizing: border-box" @click="detail(row)">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <pagination
                v-show="total>0"
                :total="total"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getAppeal"
                :page-size="listQuery.limit"
                :page-sizes="[15, 35, 50]"
        />
    </div>
</template>

<script>
    import Pagination from '@/components/Pagination/index'
    import myFunctions from "@/utils/myFunctions";

    export default {
        name: 'appeal',
        components: {Pagination},
        data() {
            return {
                listLoading: false,
                list: [],
                total: 0,
                listQuery: {
                    // 分页
                    page: 1,
                    limit: 15,
                    status: null,
                    timerange: null,
                },
                appealStatusOptions: [
                    {key: '全部', value: null},
                    {key: '待付款', value: '0', type: 'danger'},
                    {key: '待放币', value: '1', type: 'danger'},
                    {key: '已完成', value: '2', type: 'success'},
                    {key: '已取消', value: '3', type: 'info'},
                    {key: '被动取消', value: '4', type: 'info'},
                    {key: '被动完成', value: '5', type: 'success'},
                    {key: '申述中', value: '6', type: 'danger'},
                    {key: '申诉取消', value: '7', type: 'warning'},
                    {key: '申诉完成', value: '8', type: 'success'}
                ],
            }
        },
        filters: {
            bankNuberFilter(value) {
                if (value == '' || value == null) return
                else return value.replace(/(\d{4})(?=\d)/g, "$1 ");
            }
        },
        created() {
            this.getAppeal()
        },
        methods: {
            async getAppeal() {
                let params = {
                    limit: this.listQuery.limit,
                    page: this.listQuery.page
                }
                params.type = 1
                this.listLoading = true
                let res = await myFunctions.get('Admc2cOrder/appealList', params)
                if (res) {
                    for (let prop of res.list) prop.snapshot = JSON.parse(prop.snapshot)
                    this.total = res.count
                    this.list = res.list
                }
                this.listLoading = false
            },
            detail(row){
                //console.log(row)
                sessionStorage.setItem('appealManage',row.id)
                this.$emit('openByName','appealDetails')
            },

            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row)
                this.$emit('openByName','userDetails')
            }
        }
    }
</script>

