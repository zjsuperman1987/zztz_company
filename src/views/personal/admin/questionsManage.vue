<template>
    <div style="width: 100%">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getQuestions">{{ $t('button.refresh')
                }}
            </el-button>
        </div>
        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  highlight-current-row :data="questionsList" size="mini" v-loading="loading">
            <el-table-column label="ID" width="60" prop="pid"></el-table-column>
            <el-table-column label="发起人" width="60">
                <template v-slot="{row}">
                    <el-button type="text" @click="userClick(row)">{{ row.uid }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="标题" prop="title"></el-table-column>
            <el-table-column label="创建时间" prop="ctime" width="110"></el-table-column>
            <el-table-column label="最后回复" prop="last_reply_time" width="110"></el-table-column>
            <el-table-column label="讨论" prop="last_reply_count" width="110"></el-table-column>
            <el-table-column label="状态" width="80">
                <template v-slot="{row}">
                    <el-tag size="small" :type="row.del ? 'info' : 'success'">{{ row.del ? '已关闭' : '正常' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center">
                <template v-slot="{row}">
                    <el-button-group>
                        <el-button size="mini" type="primary"
                                   @click="detail(row)">
                            查看
                        </el-button>
                        <el-button size="mini" type="warning" @click="closeQuestion(row)">关闭</el-button>
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
                @pagination="getQuestions()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />
    </div>
</template>

<script>
    import {mapState} from 'vuex'

    export default {
        name: "questionsManage",
        data() {
            return {
                questionsList: [],
                loading: false,
                listQuery: {
                    limit: 20,
                    page: 1
                },
                total: 0,
            }
        },
        computed: {
            ...mapState({
                site_static: state => state.site.siteSetting.site_static_chars
            })
        },
        created() {
            this.getQuestions()
        },
        methods: {
            getQuestions() {
                this.loading = true
                let params = this.listQuery
                this.$http.get('/AdmFeedback', {params}).then(res => {
                    if (res) {
                        this.questionsList = res.data
                        this.total = res.total
                    }
                    this.loading = false
                })
            },
            // 关闭
            closeQuestion(row) {
                this.$confirm('确认是否关闭当前问题反馈?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    confirmButtonClass: 'confirm-class',
                    cancelButtonClass: 'cancel-class',
                    type: 'warning',
                    closeOnPressEscape: false,
                    closeOnClickModal: false,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            this.$http('/AdmFeedback/update', {method: 'post', params: {id: row.id, del: 1}}).then(res => {
                                if (res) {
                                    this.$message.success('操作成功')
                                    this.getQuestions()
                                    done()
                                }
                                instance.confirmButtonLoading = false
                            })
                        } else done()
                    }
                }).catch(() => {});
            },
            detail(row){
                sessionStorage.setItem('questionsManage',JSON.stringify({pid:row.pid,partner:row.partner}))
                this.$emit('openByName','questionsDetails')
            },

             //用户点击事件
            userClick(row) {
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
