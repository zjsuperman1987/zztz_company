<template>
    <div class="container">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <div>
                <el-button size="mini" type="primary" icon="el-icon-back"
                           @click="$router.push({ name: 'questionsManage' })">返回
                </el-button>
                <el-button size="mini" v-if="!data.del" type="warning" icon="el-icon-close" @click="closeQuestion">关闭
                </el-button>
            </div>
        </div>

        <div class="title-info">
            <div class="title">
                <span>标题:</span>
                {{ data.title }}
            </div>
        </div>

        <el-row class="row">
            <el-col :span="8">
                发布人：{{ data.uid }}
            </el-col>
            <el-col :span="8">
                发布时间：{{ data.ctime }}
            </el-col>
            <el-col :span="8">
                状态：{{ data.del ? '已关闭' : '开启' }}
            </el-col>
        </el-row>

        <div class="content">
            <span v-html="data.contents"></span>
        </div>

        <div v-if="!data.del">
            <ubb-textarea v-model="replyValue" path="feedback" ref="textarea" :minRows="3" title="回复："
                          :idList="idList" :fileList="fileList" :attachList="attachList"></ubb-textarea>
            <el-button size="mini" type="primary" id="custom-submit-button"
                       class="submit-button" @click="submitReply">发 布
            </el-button>
        </div>

        <el-row type="flex" v-viewer v-for="item in questionsList" :key="item.pid"
                class="every-list" :class="item.is_adm ? 'adm' : 'user' ">
            <el-col :span="3" class="left">
                <div>
          <span>uid：<router-link :style="{ color: item.is_adm ? 'red' : '' }"
                                 :to="{ name: 'userDetails', query: { id: item.uid } }">{{ item.uid }}</router-link></span>
                </div>
                <p class="time">{{ item.ctime }}</p>
            </el-col>
            <el-col :span="21" class="right">
                <span v-html="item.contents"></span>
            </el-col>
        </el-row>
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
        name: "questionsDetails",
        components: {ubbTextarea},
        data() {
            return {
                id: 0,//this.$route.query.id,
                partner: 0,//this.$route.query.partner,
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
            ...mapState({
                site_static: state => state.site.siteSetting.site_static_chars,
                uid: state => state.user.userInfo.id,
            })
        },
        created() {
            let params=JSON.parse(sessionStorage.getItem('questionsManage'))
            this.partner=params.partner
            this.id=params.pid
            this.getQuestionsDetails()
        },
        methods: {
            getQuestionsDetails() {
                const params = this.listQuery
                params.id = this.id
                this.$http.get('/AdmFeedback/read', {params}).then(res => {
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
                    partner: this.partner,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                this.$http('/AdmFeedback/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.replyValue = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getQuestionsDetails()
                    }
                })
            },

            // 关闭
            closeQuestion() {
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
                            this.$http('/AdmFeedback/update', {
                                method: 'post',
                                params: {id: this.id, del: 1}
                            }).then(res => {
                                if (res) {
                                    this.$message.success('操作成功')
                                    this.$router.push({name: 'questionsManage'})
                                    done()
                                }
                                instance.confirmButtonLoading = false
                            })
                        } else done()
                    }
                }).catch(() => {});
            }
        }
    }
</script>

<style scoped lang="less">
.container{
    width: 100%;
}
    .submit-button {
        margin: 10px auto;
    }

    .adm {
        background: #eee;
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
        .title {
            padding: 3px 6px;
            background: #598935;
        }
    }

    .row {
        padding: 3px 6px;
        background: #285C8C;
        color: #fff;
    }

    .content {
        margin-bottom: 6px;
        padding: 3px 6px;
        background: #85B5E5;
    }
</style>
