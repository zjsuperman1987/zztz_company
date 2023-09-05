<template>
    <div>

        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
            <div>
                <el-button size="small" type="primary" @click="$router.push({ name: 'feedback' })"
                           icon="el-icon-plus">{{ $t('feedback.new') }}
                </el-button>
                <el-button size="small" type="primary" @click="getQuestions"
                           icon="el-icon-refresh">{{ $t('feedback.refresh') }}
                </el-button>
            </div>
        </div>

        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  :data="questionsList" size="mini" v-loading="loading" border>
            <el-table-column label="ID" prop="pid" width="60"></el-table-column>
            <el-table-column :label="$t('table.title')" prop="title"></el-table-column>
            <el-table-column :label="$t('table.time')" prop="ctime" width="120"></el-table-column>
            <el-table-column :label="$t('feedback.lastReplyTime')" prop="last_replay_time"
                             width="120"></el-table-column>
            <el-table-column :label="$t('feedback.replyCount')" prop="last_replay_count" width="120"></el-table-column>
            <el-table-column :label="$t('feedback.lastReplyPeople')" prop="last_replay_uid"
                             width="120"></el-table-column>
            <el-table-column :label="$t('table.status')" align="center" width="80">
                <template v-slot="{row}">
                    <el-tag size="small" :type="row.del ? 'info' : 'success'">{{ row.del ? '已关闭' : '正常' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" width="60" align="center">
                <template v-slot="{row}">
                    <router-link :to="{ name: 'feedback-details', query: { id: row.pid, uid: row.uid } }">
                        <el-button size="mini" type="primary">{{ $t('table.view') }}</el-button>
                    </router-link>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="totalPages>0" :total="totalPages"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getQuestions()"
                :page-size="listQuery.limit"
                :page-sizes="[10, 40, 60]"/>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import {generateTitle} from '@/utils/i18n'

    export default {
        name: "questions",
        data() {
            return {
                loading: false,
                listQuery: {
                    limit: 10,
                    page: 1
                },
                questionsList: [],
                totalPages: 0,
            }
        },
        computed: {
            ...mapState({
                uid: state => state.user.userInfo.id,
            })
        },
        created() {
            this.getQuestions()
        },
        watch: {
            $route(to, from) {
                if (from.path === '/feedback') this.getQuestions()
            }
        },
        methods: {
            generateTitle,
            // 获取问题
            getQuestions() {
                this.loading = true
                let params = {
                    feedback: 1,
                    order: 'ctime',
                    self: 1,
                    limit: this.listQuery.limit,
                    page: this.listQuery.page
                }
                this.$http.get('/WebMyFeedback', {params}).then(res => {
                    if (res) {
                        this.totalPages = res.total
                        this.questionsList = res.data
                    }
                    this.loading = false
                })
            },
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-card__body {
            padding: 6px !important;
        }

        .el-row {
            .time {
                text-align: right;
                color: #999;
            }

            .info {
                display: flex;
                flex-direction: column;

                span {
                    display: inline-block;
                    word-break: break-all;
                }
            }
        }
    }

    .input {
        display: flex;
        padding: 0 0 10px 0;

        .el-input {
            margin-right: 20px;
        }
    }

    .user-wrap-questions {
        .every-list {
            margin-bottom: 10px;
        }
    }
</style>
