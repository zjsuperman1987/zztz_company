<template>
    <div class="container">
        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
            <div>
                <el-button type="primary" icon="el-icon-plus" @click="$router.push({ name: 'create'})">创建担保</el-button>
            </div>
        </div>

        <section class="section">
            <h3 class="header_title">
                <span class="header_text">我的担保:</span>
            </h3>
            <div style="padding: 10px;background: #fff">
                <el-table :data="guarantee_list" size="mini" border highlight-current-row >
                    <el-table-column label="ID" prop="id" width="60" align="center"></el-table-column>
                    <el-table-column label="标题" prop="title"  width="120"></el-table-column>
                    <el-table-column label="参与人" prop="uid_b" width="80" align="center"></el-table-column>
                    <el-table-column label="观察人" prop="observer" width="80" align="center"></el-table-column>
                    <el-table-column label="创建时间" prop="create_time" width="110" align="center"></el-table-column>
                    <el-table-column label="类型" prop="secrecy" width="110" align="center"></el-table-column>
                    <el-table-column label="状态" prop="status" align="center" width="60"></el-table-column>
                    <el-table-column label="操作" prop="update_time" align="center">
                        <template slot-scope="{ row }">
                            <el-button icon="el-icon-view" type="primary" plain @click="$router.push({name: 'guaranteeDetail',query: {id: row.id}})">详情</el-button>
                            <el-button icon="el-icon-circle-check" type="success" plain @click="over(row)">结束</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div style="text-align: center">
                    <el-pagination @current-change="getMyGuarantee"
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
    const create = () => import('@/views/personal/user/userInfo/components/createGuarantee')
    export default {
        name: "start",
        components: { create },
        data() {
            return {
                guarantee_list: [],  //我的担保列表
                guaranteeTotal: 0,
                guaranteeQuery: {
                    limit: 20,
                    page: 1,
                },
            }
        },
        created() {
            this.getMyGuarantee()
        },
        methods: {
            generateTitle,
            // 获取担保列表
            getMyGuarantee() {
                let params = {limit: this.guaranteeQuery.limit, page: this.guaranteeQuery.page}
                this.$http('/WebGuarantee/List', { method: 'get', params }).then(res => {
                    if(res) {
                        let arr = res.data.reverse()
                        for (let prop of arr) {
                            if (prop.status === 2) prop.status = '有投诉'
                            else prop.status = '正常'
                            prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                            if(prop.uid_b === 0) prop.uid_b = '未加入'
                            if(prop.observer === '') prop.observer = '未加入'
                            if(prop.secrecy === 1) prop.secrecy = '公开'
                            else prop.secrecy = '私密'
                        }
                        this.guarantee_list = res.data
                        this.guaranteeTotal = res.total
                    }
                })
            },

            //结束担保
            async over(row) {
                let res = await myFunctions.post('/WebGuarantee/complete', {id: row.id})
                if(res) this.getMyGuarantee()
            },
        }
    }
</script>

<style scoped lang="less">
.section {
    margin: 20px 0;

    .header_title {
        display: flex;
        justify-content: space-between;
        margin: 5px 20px;

        .header_text {
            display: inline-block;
            width: 180px;
            margin-right: 20px;
            text-align: left;
        }
    }
}
</style>