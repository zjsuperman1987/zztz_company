<template>
    <div>
        <div v-if="token && ((reply && post_end_time) || (!reply))">
            <ubb-textarea v-model="replyText" path="comment" ref="textarea" :minRows="3"
                          :idList="idList" :fileList="fileList" :attachList="attachList">
            </ubb-textarea>
            <el-button id="custom-submit-button" type="primary"
                       :loading="submitLoading" class="submit-button" @click="submitText">发表咨询
            </el-button>
        </div>
        <div v-if="!token" class="no-pass">
            您还未登录, 请点此<span @click="$router.push('login')">登录</span>
        </div>
        <div v-if="(reply&&!post_end_time) || !token " class="no-pass">
            您未激活交易权限或权限已过期, 请点此<span @click="visible = true"> 激活 </span>交易权限
        </div>
        <div>
            <div class="reply-list" v-if="consultingList.length">
                <div v-for="item in consultingList" :key="item.id" class="every-list">
                    <div class="top">
                        <div class="left">
                            <span style="margin-right: 30px"
                                  :style="{ color: fontColor(item) }">发布者：{{ item.sender }}</span>
                            <span>时间：{{ item.post.ctime }}</span>
                        </div>
                        <div class="right">
                            <el-button v-if="isAdm && !item.post.hidden" size="mini" type="text"
                                       @click="handleOP(item,'hidden')">隐藏
                            </el-button>
                            <el-button v-if="(item.sender === uid || isAdm) && !item.post.del" size="mini" type="text"
                                       @click="handleOP(item,'del')">删除
                            </el-button>
                        </div>
                    </div>
                    <div class="bottom" v-viewer><span v-html="item.post.contents"></span></div>
                </div>
            </div>
            <div class="no-replay-list" v-else>暂无内容</div>
            <page-nation
                    v-show="total>0"
                    :total="total"
                    layout="total, prev, pager, next"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getConsultingList"
                    :page-size="listQuery.limit"
            />
        </div>

        <vip-dialog :tabIndex="tabIndex" :show.sync="visible"></vip-dialog>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions";

    const ubbTextarea = () => import('@/components/textarea/index')
    const vipDialog = () => import('@/components/vip')
    export default {
        name: "buyer",
        components: {vipDialog, ubbTextarea},
        data() {
            return {
                id: this.$route.query.id,
                tabIndex: 1,
                visible: false,
                replyText: '',
                attachList: [],
                idList: [],
                fileList: [],
                listQuery: {
                    page: 1,
                    limit: 10,
                },
                consultingList: [],
                total: 0,
                submitLoading: false,
            }
        },
        computed: {
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                uid: state => state.user.userInfo.id,
                goodsInfo: state => state.goods.goodsInfo,
                token: state => state.user.token,
                post_end_time: state => state.user.userInfo.post_end_time,
                reply: state => state.site.siteSetting.goods_reply_chars * 1,
                trade_end_time: state => state.user.userInfo.trade_end_time,
                release: state => state.site.siteSetting.goods_release_chars*1,
                refreshValue: state => state.goods.refreshValue,
            })
        },
        watch: {
            refreshValue() {
                this.getConsultingList()
            }
        },
        created() {
            this.getConsultingList()
        },
        methods: {
            getConsultingList() {
                if (!this.token) return
                const params = {
                    id: this.id,
                    page: this.listQuery.page,
                    limit: this.listQuery.limit,
                    partner: this.uid
                }
                this.$http.get('/WebReply/getConsult', {params}).then(res => {
                    if (res) {
                        this.total = res.total
                        this.consultingList = res.data
                        console.log(res.data)
                    }
                })
            },

            submitText() {
                if (!this.replyText) return this.$message.warning('内容为空')
                this.submitLoading = true
                let params = {
                    id: this.id,
                    to_uid: this.goodsInfo.uid,
                    contents: this.replyText,
                    partner: this.uid,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                this.$http('/WebMyReplys/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.replyText = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getConsultingList()
                        myFunctions.noticeOpposite(5, this.goodsInfo.uid)  //卖家留言未读消息实现更新
                    }
                    this.submitLoading = false
                })
            },

            // 隐藏/删除
            handleOP(item, type) {
                const params = {id: item.pid}
                if (type === 'hidden') params.hidden = 1
                if (type === 'del') params.del = 1
                this.$http.get('/WebMyReplys/update', {params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.getConsultingList()
                    }
                })
            },

            fontColor(item) {
                if (item.is_adm) {
                    return 'red'
                } else if (item.sender === this.uid) {
                    return '#409cef'
                } else return '#67c23a'
            }
        }
    }
</script>

<style scoped lang="less">
    .no-pass {
        padding: 10px;
        border: 1px solid #999;

        span {
            color: #409EFF;
            cursor: pointer;
        }
    }

    .submit-button {
        border-radius: 0;
    }

    .reply-list {
        background: #f4f4f4;
        margin-top: 10px;
        max-height: 500px;
        overflow-y: auto;

        .every-list {
            border: 1px solid #000;

            &:not(:last-child) {
                margin-bottom: 6px;
            }
        }

        .top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #DDDADA;
            padding: 0 6px;
            min-height: 28px;
            line-height: 28px;
        }

        .bottom {
            padding: 4px;
            min-height: 40px;
        }
    }

    .no-replay-list {
        margin-top: 10px;
        text-align: center;
        padding: 10px;
        background-color: #fff;
    }
</style>
