<template>
    <div>
        <el-table  :data="child"  border  highlight-current-row ref="logoList">
            <el-table-column label="ID" prop="id" width="80" align="center"></el-table-column>
            <el-table-column label="撤资id" prop="uid" width="80" align="center"></el-table-column>
            <el-table-column label="撤资金额" prop="amount"  width="80" align="center"></el-table-column>
            <el-table-column label="撤资时间" prop="create_time" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
                <template  slot-scope="{ row }">
                    <el-button type="primary" size="mini" plain v-if="row.uid !== userID">同意</el-button>
                    <el-button type="primary" size="mini" plain v-if="row.uid !== userID">拒绝</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- <div style="text-align: center">
            <el-pagination @current-change="handler"
                :current-page.sync="withdrawQuery.page" :page-size="withdrawQuery.limit" 
            layout="total, prev, pager, next">
            </el-pagination>
        </div> -->
    </div>
</template>

<script>
import {mapState} from "vuex";
export default {
    name: 'withdrawItem',
    props: {
        child: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
        }
    },
    computed: {
        ...mapState({
            userID: (state) => state.user.userInfo.id,
        })
    }
    
}
</script>