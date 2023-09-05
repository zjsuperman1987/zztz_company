<template>
    <div class="container">
        <!-- 担保列表 -->
        <div style="padding: 10px;background: #fff">
            <div class="header_text">担保列表:</div>
            <el-table :data="list" size="mini" border highlight-current-row
                        @row-click="rowClickChange">
                <el-table-column label="ID" prop="id" width="60" align="center"></el-table-column>
                <el-table-column label="担保名称" prop="title" width="250"></el-table-column>
                <el-table-column label="发起人" prop="uid_a" align="center" width="60">
                    <template v-slot="{row}">
                        <el-button type="text" @click="userClick(row.uid_a)">{{ row.uid_a }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="参与人" prop="uid_b" align="center" width="60">
                    <template v-slot="{row}">
                        <el-button type="text" @click="userClick(row.uid_b)" v-if="row.uid_b">{{ row.uid_b }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="观察员" prop="observer" align="center" width="60">
                    <template v-slot="{row}">
                        <el-button type="text" @click="userClick(row.observer)" v-if="row.observer">{{ row.observer }}</el-button>
                    </template>
                </el-table-column>
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
    
    name: 'guaranteeManage',
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
    computed: {
        ...mapState ({
            userID: state => state.user.userInfo.id,   // 用户的id
            isAdm: state => state.user.userInfo.is_adm,
        })
    },
    mounted() {
        this.getGuarantee()
        console.log(this.userID)
        console.log(this.isAdm)
    },
    methods: {
        rowClickChange(val) {
            console.log(val)
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
            let res = await myFunctions.post('AdmGuarantee/list', params)
            if(res) {
                for(let prop of res.data) {
                    prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                    if(prop.status === 1) prop.status = '进行中'
                    if(prop.status === 2) prop.status = '申诉中'
                    if(prop.status === 3) prop.status = '已完成'
                }
                this.list = res.data.reverse()
                this.guaranteeTotal = res.total
            }
            if(res) console.log(res)
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
    .header_text {
        margin-bottom: 5px;
    }
</style>
