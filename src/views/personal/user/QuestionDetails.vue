<template>
    <div>

        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <router-link :to="{ name: 'feedback-list' }">
                <el-button size="mini" type="primary" icon="el-icon-back">返回</el-button>
            </router-link>
        </div>

        <div class="title-info">
            <div class="title">
        <span>
        标题: {{ data.title }}
        </span>
            </div>
            <div class="content">
        <span>
          内容: <span v-html="data.contents"></span>
        </span>
            </div>
        </div>

        <div v-if="!data.del">
            <ubb-textarea v-model="replyValue" path="feedback" :uid="uid" :minRows="3" :type="100"
                          ref="textarea" :idList="idList" :fileList="fileList" :attachList="attachList"></ubb-textarea>
            <el-button size="mini" type="primary" id="custom-submit-button"
                       class="submit-button" @click="submitReply">回复
            </el-button>
        </div>

        <div v-if="questionsList.length">
            <el-row type="flex" v-viewer v-for="item in questionsList" :key="item.pid" class="every-list"
                    :class="item.is_adm ? 'adm' : 'user' ">
                <el-col :span="3" class="left">
                    <span :style="{ color: item.is_adm ? 'red' : '' }">UID：{{ item.uid }}</span>
                    <p class="time">{{ item.ctime }}</p>
                </el-col>
                <el-col :span="21" class="right">
                    <span v-html="item.contents"></span>
                </el-col>
            </el-row>
        </div>
        <div v-else style="margin-top: 10px;text-align: center">
            <span style="font-size: 16px;font-weight: 600">暂无更多数据</span>
        </div>

        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getQuestionsDetails()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />
    </div>
</template>

<script>
    import {mapState} from "vuex";

    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "QuestionDetails",
        components: {ubbTextarea},
        data() {
            return {
                id: this.$route.query.id,
                userId: this.$route.query.uid,
                data: {},
                questionsList: [],
                total: 0,
                listQuery: {
                    limit: 20,
                    page: 1
                },
                replyValue: '',
                attachList: [],
                idList: [],
                fileList: [],
            }
        },
        computed: {
            uid() {
                return localStorage.getItem('uid') * 1
            },
            ...mapState({
                site_static: state => state.site.siteSetting.site_static,
            })
        },
        created() {
            this.getQuestionsDetails()
        },
        methods: {
            getQuestionsDetails() {
                const params = this.listQuery
                params.id = this.id
                this.$http.get('/WebMyFeedback/read', {params}).then(res => {
                    if (res) {
                        this.data = res.info
                        this.questionsList = res.list.data
                        this.total = res.list.total
                    }
                })
            },
            // 回复
            submitReply() {
                if (!this.replyValue) return this.$message.warning('发送消息为空');
                const params = {
                    content: this.replyValue,
                    id: this.id,
                    partner: this.data.partner,
                    attach: this.idList.length ? this.idList.toString() : 0,
                }
                this.$http('/WebMyFeedback/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.replyValue = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getQuestionsDetails()
                    }
                })
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep .card {
        .el-card__body {
            padding: 3px !important;
        }
    }

    .submit-button {
        margin: 10px auto;
    }

    .adm {
        .el-card {
            background: #eee;
        }
    }

    .every-list {
        margin-bottom: 10px;

        .left {
            padding: 6px;
            background: #ECF5FF;

            a {
                color: #409EFF;
            }

            .time {
                color: #999;
            }
        }

        .right {
            padding: 6px;
            background: #D1D8DF;
        }
    }

    .title-info {
        margin-bottom: 6px;

        .title {
            padding: 3px 6px;
            background: #D7F2FB;
        }

        .content {
            padding: 3px 6px;
            background: #0da88b;
        }

        span {
            font-size: 14px;
        }
    }
</style>

