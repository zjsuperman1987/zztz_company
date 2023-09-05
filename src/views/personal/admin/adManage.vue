<template>
    <div style="width:100%">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getADList">{{ $t('button.refresh') }}
            </el-button>
        </div>

        <el-table :data="adList" :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  highlight-current-row v-loading="loading" size="mini" border>
            <el-table-column label="ID" width="60">
                <template v-slot="{$index,row}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="发布人" width="60">
                <template v-slot="{row}">
                    <el-button type="text" @click="clickDetail(row)">{{ row.uid }}</el-button>
                    <!-- <router-link :to="{ name: 'userDetails', query: { id: row.uid } }">{{ row.uid }}</router-link> -->
                </template>
            </el-table-column>
            <el-table-column label="标题" show-overflow-tooltip>
                <template v-slot="{row}">
                    <router-link :to="{ name: 'ad-details', query: { id: row.tid, type: 'ad' } }">{{ row.title }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="类型" width="150">
                <!--        [0首页广告|1置顶横幅广告|2两者]-->
                <template v-slot="{row}">
                    <template v-if="row.adv !== null">
                        <el-tag size="mini" effect="dark" v-if="row.adv.type === 0">首页广告</el-tag>
                        <el-tag size="mini" effect="dark" v-if="row.adv.type === 1">置顶横幅广告</el-tag>
                        <el-tag size="mini" effect="dark" v-if="row.adv.type === 2">两者</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="广告状态" width="100">
                <!--        0正常|1已停展|2管理员关闭-->
                <template v-slot="{row}">
                    <el-tag size="mini" effect="dark" v-if="row.adv_status === 0" type="success">展示中</el-tag>
                    <el-tag size="mini" effect="dark" v-if="row.adv_status === 1" type="info">已过期</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作状态" width="100">
                <!--        0正常|1已停展|2管理员关闭-->
                <template v-slot="{row}">
                    <template v-if="row.adv">
                        <el-tag size="mini" effect="dark" v-if="row.adv.status === 0" type="success">正常</el-tag>
                        <el-tag size="mini" effect="dark" v-if="row.adv.status === 1" type="info">已停展</el-tag>
                        <el-tag size="mini" effect="dark" v-if="row.adv.status === 2" type="info">管理员关闭</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="购买时间" prop="adv.start" width="130"></el-table-column>
            <el-table-column label="到期时间" prop="adv.end" width="130"></el-table-column>
            <el-table-column label="操作" width="120">
                <template v-slot="{row}">
                    <el-button-group>
                        <el-button size="mini" type="primary"
                                   @click="$router.push({name: 'publishAD', query: { id: row.tid, type: 'ad' }})">修改
                        </el-button>
                        <el-button size="mini" :type="row.adv.status === 0 ? 'danger' : 'success'"
                                   @click="handleAD(row, '')"
                                   v-if="row.adv">{{row.adv.status === 0 ? '下架' : '上架'}}
                        </el-button>
                        <!--            <el-button size="mini" type="danger"-->
                        <!--                       @click="handleAD(row,'del')">删除</el-button>-->
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getADList()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />

        <el-alert title="无" type="info" :closable="false" style="text-align: left;margin-top: 10px">
            <template slot='title'>
                <div style="font-size: 14px; line-height: 24px; font-weight: 600;">备注:</div>
                <div> - 未付款广告不显示在此列表</div>
                <div> - 用户下架标注为停展，管理员下架标注为管理员关闭</div>
            </template>
        </el-alert>
    </div>
</template>

<script>
    export default {
        name: "adManage",
        data() {
            return {
                adList: [],
                total: 0,
                loading: false,
                listQuery: {
                    limit: 20,
                    page: 1
                },
            }
        },
        created() {
            this.getADList()
        },
        watch: {
            $route(to, from) {
                if (from.path === '/publishAD') {
                    this.getADList()
                }
            }
        },
        methods: {
            getADList() {
                this.loading = true
                let params = this.listQuery
                this.$http.get('/AdmAdv', {params}).then(res => {
                    if (res) {
                        this.adList = res.data
                        this.total = res.total
                    }
                    this.loading = false
                })
            },
            handleAD(row, op) {
                let params = {
                    status: op ? '' : (row.adv.status === 0 ? 2 : 0)  // 停展:展示
                }
                let url = op === 'del' ? '/AdmAdv/delete' : `/AdmAdv/${row.tid}`
                let method = op === 'del' ? 'delete' : `put`
                if (op) {
                    this.$confirm('确认是否删除？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: "warning"
                    }).then(() => {
                        this.$http(url, {method, params}).then(res => {
                            if (res) this.$message.success('操作成功');
                            this.getADList()
                        })
                    }).catch(() => {})
                } else {
                    this.$http(url, {method, params}).then(res => {
                        if (res) {
                            this.$message.success('操作成功');
                            this.getADList()
                        }
                    })
                }
            },

            //发布人点击跳转事件
            clickDetail(row){
                sessionStorage.setItem('userManage',row.uid)
                this.$emit('openByName','userDetails')
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-table {
            p {
                line-height: 1.3;
            }
        }
    }
</style>
