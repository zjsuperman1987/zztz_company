<template>
    <div>
        <div v-if="token">
            <div class="replay-button" v-if="isAdm ? true : post_end_time" id="replay-button">
                <span class="otherReplyText" v-if="otherReplyText">{{ otherReplyText }}</span>
                <div class="button">
                    <ubb-textarea v-model="replyText" path="feedback" ref="textarea" :minRows="3"
                                  :idList="idList" :fileList="fileList" :attachList="attachList"></ubb-textarea>
                    <el-button id="custom-submit-button" class="submit-button"
                               :loading="submitLoading" type="primary" @click="handleReply">{{
                        $t('goodsDetails.orderList.comment') }}
                    </el-button>
                </div>
            </div>
            <div v-if="!post_end_time && !isAdm" class="no-pass">
                您未激活咨询回复权限或权限已过期, 请点此<span @click="visible = true"> 激活 </span>交易权限
            </div>
        </div>

        <div v-else class="no-pass">
            您还未登录, 请点此<span @click="$router.push('login')"> 登录</span>
        </div>

        <div class="reply-list" v-if="replayList.length">
            <div v-for="item in replayList" :key="item.id" class="every-list">
                <div class="top">
                    <div class="left">
                        <span :style="{ color: fontColor(item) }">{{ $t('goodsDetails.orderList.publisher') }}{{ item.uid }}</span>
                        <span style="margin: 0 30px">{{ $t('goodsDetails.orderList.time') }}{{ item.ctime }}</span>
                        <span v-if="item.del" style="color: #a11616">{{ $t('goodsDetails.orderList.desDelete', { time: item.deltime, dealer: item.deler }) }}</span>
                    </div>
                    <div class="right">
                        <el-button v-if="item.uid === uid || isAdm" size="mini" type="text"
                                   @click="handleOP(item,'del')">{{ $t('goodsDetails.orderList.delete') }}
                        </el-button>
                    </div>
                </div>
                <div v-viewer class="bottom" v-html="item.contents"></div>
            </div>
        </div>
        <div class="no-replay-list" v-else>{{ $t('table.noData') }}</div>
        <!--        分页模块-->
        <page-nation
                layout="total, prev, pager, next, jumper"
                v-show="listCount>0"
                :total="listCount"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getReplyList"
                :page-size="listQuery.limit"
        />
        <vip-dialog :tabIndex="tabIndex" :show.sync="visible"></vip-dialog>
    </div>
</template>

<script>
    import {mapState} from 'vuex'

    const vipDialog = () => import('@/components/vip')
    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "PublicComment",
        components: {vipDialog, ubbTextarea},
        data() {
            return {
                id: this.$route.query.id,
                tabIndex: 1,
                visible: false,
                replyText: '',
                submitLoading: false,
                otherReplyText: '',
                userToUserID: '',
                userTouserName: '',
                replayList: [],
                listCount: 0,
                listQuery: {
                    page: 1,
                    limit: 10,
                },

                attachList: [],
                idList: [],
                fileList: [],
            }
        },
        created() {
            this.getReplyList()
        },
        activated() {
            this.getReplyList()
        },
        computed: {
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                uid: state => state.user.userInfo.id,
                token: state => state.user.token,
                post_end_time: state => state.user.userInfo.post_end_time,
                goodsInfo: state => state.goods.goodsInfo,
                refreshValue: state => state.goods.refreshValue,
            })
        },
        watch: {
            refreshValue() {
                this.getReplyList()
            }
        },
        methods: {
            // 获取评论消息
            getReplyList() {
                return new Promise(((resolve) => {
                    let params = {
                        id: this.goodsInfo.tid || this.id,
                        page: this.listQuery.page,
                        limit: this.listQuery.limit
                    }
                    this.$http.get('/WebReply/getComment', {params}).then(res => {
                        if (res) {
                            for (let item of res.data) item.show = true
                            this.listCount = res.total
                            this.replayList = res.data
                        }
                    })
                    resolve()
                }))
            },

            scrollTo() {
                document.getElementById('replay-button').scrollIntoView()
            },
            //评论-发布评论
            handleReply() {
                if (!this.replyText) return this.$message.warning('内容为空')
                this.submitLoading = true
                let params = {
                    id: this.id,
                    to_uid: this.userToUserID ? this.userToUserID : this.uid,
                    contents: this.userToUserID ? '回复 ' + this.userTouserName + ' : ' + this.replyText : this.replyText,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                this.$http('/WebMyReplys/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.replyText = ''
                        this.userToUserID = ''
                        this.otherReplyText = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getReplyList()
                    }
                    this.submitLoading = false
                })
            },
            handleOP(item, type) {
                const params = {id: item.pid}
                if (type === 'hidden') params.hidden = 1
                if (type === 'del') params.del = 1
                const url = this.isAdm ? '/AdmReply/update' : '/WebMyReplys/update'
                this.$http.get(url, {params}).then(res => {
                    if (res) this.$message.success('操作成功')
                    this.getReplyList()
                })
            },

            fontColor(item) {
                if (item.is_adm) return '#bb0d0d'
                else if (item.uid === this.uid) return '#409cef'
                else return '#67c23a'
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

    ::v-deep {
        .pagination-container {
            padding-top: 0;

            button, li, .el-pagination__total, .el-input__inner, .el-pagination__jump {
                height: 20px;
                line-height: 20px;
            }
        }
    }

    .no-pass {
        padding: 10px;
        border: 1px solid #999;
        /*background: #ddd;*/

        span {
            color: #409EFF;
            cursor: pointer;
        }
    }

    .contents {
        font-size: 12px;
        padding: 6px 0;
    }

    .no-replay-list {
        margin-top: 10px;
        text-align: center;
        padding: 10px;
        background-color: #fff;
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

    .replay-button {
        .otherReplyText {
            white-space: nowrap; /*强制span不换行*/
            display: inline-block; /*将span当做块级元素对待*/
            width: 100%; /*限制宽度 可设px*/
            overflow: hidden; /*超出宽度部分隐藏*/
            text-overflow: ellipsis; /*超出部分以点号代替*/
            font-size: 14px;
            color: #999;
        }
    }
</style>

