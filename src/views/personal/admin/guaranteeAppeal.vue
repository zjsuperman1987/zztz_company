<template>
    <div class="container">
        <!-- 担保列表 -->
        <div style="padding: 10px;background: #fff">
            <div class="header_text">申诉列表:</div>
            <el-table :data="list" size="mini" border highlight-current-row
                        @row-click="rowClickChange">
                <el-table-column label="ID" prop="id" width="60" align="center"></el-table-column>
                <el-table-column label="担保ID" prop="guarantee_id" width="60" align="center"></el-table-column>
                <el-table-column label="担保名称" prop="title" width="250">
                    <template slot-scope="{ row }">
                        <span>{{ row.guarantee.title }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="申诉人" prop="uid" align="center" width="60"></el-table-column>
                <el-table-column label="处理理由" prop="reason_adm" align="center" width="160"></el-table-column>
                <el-table-column label="创建时间" prop="create_time" width="120" align="center"></el-table-column>
                <el-table-column label="状态" prop="status" align="center" width="60"></el-table-column>
                <el-table-column label="操作" align="center">
                        <el-button type="primary" size="mini" icon="el-icon-view" @click="in_details">详情</el-button>
                </el-table-column>
            </el-table>
            <div style="text-align: center">
                <el-pagination @current-change="getGuarantee"
                                :current-page.sync="guaranteeQuery.page"
                                :page-size="guaranteeQuery.limit" layout="total, prev, pager, next"
                                :total="guaranteeTotal">
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import myFunctions from '@/utils/myFunctions';
import {mapState} from "vuex";
export default {
    
    name: 'guaranteeAppeal',
    data() {
        return {
            id: '',
            list: [],
            guaranteeTotal: 0,
            guaranteeQuery: {
                limit: 20,
                page: 1
            }
        }
    },
    mounted() {
        this.getGuarantee()
    },
    methods: {
        rowClickChange(val) {
            this.id = val.id
        },

        in_details() {
            setTimeout(() => {
                this.$router.push({name: 'guaranteeDetail', query: {id: this.id}})
            },300)
        },

        getDealOrder(val) {
            this.id = val.id
        },

        //获取管理员担保列表
        async getGuarantee() {
            let params = this.guaranteeQuery
            let res = await myFunctions.get('AdmGuarantee/appealList', params)
            if(res) {
                for(let prop of res.data) {
                    if(prop.status === 1) prop.status = '申诉中'
                    if(prop.status === 2) prop.status = '已解决'
                    prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                }
                this.list = res.data.reverse()
                this.guaranteeTotal = res.total
            }
        },
    }
}
</script>

<style lang="less" scoped>
    .header_text{
        margin-bottom: 5px;
    }
</style>

