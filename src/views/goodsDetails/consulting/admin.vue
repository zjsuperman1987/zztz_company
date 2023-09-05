<template>
    <div>
        <el-table size="mini" :data="consultTableData" @row-click="getCurrent"
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  v-loading="consultLoading" highlight-current-row border>
            <el-table-column label="ID" prop="tid" width="40" align="center"></el-table-column>
            <el-table-column label="咨询方" align="center">
                <template v-slot="{row}">
                    <router-link :to="{ name: 'userDetails', query: { id: row.partner } }">{{ row.partner }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="回复次数" prop="replay_count" align="center"></el-table-column>
            <el-table-column label="最后回复时间" prop="replay_time"></el-table-column>
            <el-table-column label="回复人" align="center">
                <template v-slot="{row}">
                    <router-link :to="{ name: 'userDetails', query: { id: row.replay_uid } }">{{ row.replay_uid }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" align="center" width="50">
                <template v-slot="{row}">
                    <el-button size="mini" type="primary" @click="getCurrent(row)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="consultTotal>0"
                :total="consultTotal"
                :pager-count="5"
                layout="total, prev, pager, next"
                :page.sync="consultListQuery.page"
                :limit.sync="consultListQuery.limit"
                @pagination="getConsultingList"
                :page-size="consultListQuery.limit"
        />

        <div class="order-details-left" v-if="JSON.stringify(clickRow) !== '{}'">
            <ubb-textarea v-model="replyText" path="comment" ref="textarea" :minRows="3"
                          title="回复咨询" :partner="clickRow.partner"
                          :idList="idList" :fileList="fileList" :attachList="attachList">
            </ubb-textarea>
            <el-button type="primary" id="custom-submit-button" class="submit-button" :loading="buttonLoading"
                       @click="handleReply">提交回复
            </el-button>
            <div class="reply-list" v-if="detailsList.length">
                <div v-for="item in detailsList" :key="item.id" class="every-list">
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
                            <el-button v-if="item.sender === uid || isAdm" size="mini" type="text"
                                       @click="handleOP(item,'del')">删除
                            </el-button>
                        </div>
                    </div>
                    <div class="bottom"><span v-html="item.post.contents"></span></div>
                </div>
            </div>
            <div class="no-replay-list" v-else>暂无内容</div>
            <page-nation
                    v-show="detailsTotal>0"
                    :total="detailsTotal"
                    layout="total, prev, pager, next"
                    :page.sync="detailsListQuery.page"
                    :limit.sync="detailsListQuery.limit"
                    @pagination="getDetails(clickRow)"
                    :page-size="detailsListQuery.limit"
            />
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "admin",
        components: {ubbTextarea},
        data() {
            return {
                id: this.$route.query.id,
                clickRow: {},
                replyText: '',
                attachList: [],
                idList: [],
                fileList: [],
                buttonLoading: false,

                detailsList: [],
                detailsTotal: 0,
                detailsListQuery: {
                    page: 1,
                    limit: 15
                },

                // 咨询清单相关
                consultTableData: [],
                consultTotal: 0,
                consultLoading: false,
                consultListQuery: {
                    page: 1,
                    limit: 15
                },
            }
        },
        computed: {
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                uid: state => state.user.userInfo.id,
                goodsInfo: state => state.goods.goodsInfo,
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
                this.consultLoading = true
                const params = {
                    tid: this.id,
                    page: this.consultListQuery.page,
                    limit: this.consultListQuery.limit,
                }
                this.$http.get('/WebMyReplys', {params}).then(res => {
                    if (res) {
                        this.consultTableData = res.data
                        this.consultTotal = res.total
                    }
                    this.consultLoading = false
                })
            },

            getDetails(row) {
                const params = {
                    id: this.goodsInfo.tid || this.id,
                    page: this.detailsListQuery.page,
                    limit: this.detailsListQuery.limit,
                    partner: row ? row.partner : ''
                }
                this.$http.get('/WebReply/getConsult', {params}).then(res => {
                    if (res) {
                        this.detailsList = res.data
                        this.detailsTotal = res.total
                    }
                })
            },

            // 点击行打开
            getCurrent(row) {
                this.clickRow = row
                this.getDetails(row)
            },

            //评论-发布评论
            handleReply() {
                if (!this.replyText) return this.$message.warning('内容为空');
                this.buttonLoading = true
                let to_uid = this.clickRow.partner
                const params = {
                    id: this.goodsInfo.tid || this.id,
                    to_uid,
                    contents: this.replyText,
                    partner: to_uid,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                this.$http('/WebMyReplys/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.replyText = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getDetails(this.clickRow)
                    }
                    this.buttonLoading = false
                })
            },

            // 隐藏/删除
            handleOP(item, type) {
                const params = {id: item.pid}
                if (type === 'hidden') params.hidden = 1
                if (type === 'del') params.del = 1
                this.$http.get('/AdmReply/update', {params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.getDetails(this.clickRow)
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
