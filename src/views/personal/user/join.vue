<template>
    <div class="container">
        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
        </div>
        <section class="section">
            <!-- 担保列表 -->
            <div style="padding: 10px;background: #fff">
                <span class="header_text">担保列表:</span>
                <el-table :data="dataList" size="mini" border highlight-current-row>
                    <el-table-column label="ID" prop="id" width="60" align="center"></el-table-column>
                    <el-table-column label="担保名称" prop="title" show-overflow-tooltip ></el-table-column>
                    <el-table-column label="状态" prop="status" align="center" width="60"></el-table-column>
                    <el-table-column label="发起人" prop="uid_a" align="center" width="60"></el-table-column>
                    <el-table-column label="参与人" prop="uid_b" align="center" width="60"></el-table-column>
                    <el-table-column label="观察员" prop="observer" align="center"></el-table-column>
                    <el-table-column label="创建时间" prop="create_time" width="80" align="center"></el-table-column>
                    <el-table-column label="操作" prop="update_time" align="center">
                        <template slot-scope="{ row }">
                            <el-button type="primary" size="mini" icon="el-icon-plus" @click="applyJoin(row)">申请加入</el-button>
                            <el-button type="primary" size="mini" icon="el-icon-view" @click="in_details(row)">详情</el-button>
                        </template>
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
        </section>
    </div>
</template>

<script>
    import {generateTitle} from '@/utils/i18n'
    import myFunctions from "@/utils/myFunctions";
    import {mapState} from "vuex";
    export default {

        name: "join",
        data() {
            return {
                dataList: [],
                input: '',
                guaranteeTotal: 0,
                guaranteeQuery: {
                    limit: 20,
                    page: 1,
                },
            }
        },
        computed: {
            ...mapState({
                userID: (state) => state.user.userInfo.id,
                isAdm: state => state.user.userInfo.is_adm,
            }),
        },
        mounted() {
            this.getGuarantee()
        },
        methods: {
            generateTitle,
            //获取担保列表
            async getGuarantee() {
                let params = {limit: this.guaranteeQuery.limit, page: this.guaranteeQuery.page, status: 1}
                let res =await myFunctions.get('/WebHome/getGuarantee', params)
                if(res) {
                    this.dataList = res.data.reverse()
                    this.guaranteeTotal = res.total
                    for(let l of res.data) {
                        l.create_time = myFunctions.parseTime(l.create_time, '{y}-{m}-{d}')
                        if(l.status === 1) l.status = '进行中' 
                        if(l.status ===2) l.status = '申诉中'
                        if(l.status ===3) l.status = '已完成'
                        if(l.uid_b === 0) l.uid_b = '未加入'
                        if(!l.observer) l.observer = '未加入'
                    }
                }
            },
             
            // 进入详情页
            in_details(row) {
                if(this.userID !== row.uid_a && this.userID !== row.uid_b && this.userID !== row.observe && !this.isAdm) 
                return this.$message.error('您还未加入,请先加入!!')
                this.$router.push({name: 'guaranteeDetail', query: {id: row.id}})
            },

            //申请加入担保
            async applyJoin(row) {
                if(this.userID === row.uid_a || this.userID === row.uid_b || this.userID === row.observe ) 
                return this.$message.error('您已经在了, 不用再申请!!')
                let res =await myFunctions.post('/WebGuarantee/applyJoin', {id: row.id, type: 1})
                if(res) {
                    this.$message.success('申请成功,请等待通过')
                    myFunctions.noticeOpposite(9, row.uid_a)
                }
            },
        }
    }
</script>

<style scoped lang="less">
    .container {
        .section {
            margin: 20px 0;
            .header_text {
                display: inline-block;
                margin-bottom: 5px;
                color: #777;
                font-weight: 777;
            }
            .deal_box{
                margin-left: 10px;
            }
            .btn_box{
                display: inline-block;
                width: 80px;
            }
        }
    }
</style>