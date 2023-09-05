<template>
    <div>
        <el-table size="mini" :data="consultTableData" highlight-current-row
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  v-loading="consultLoading" @row-click="getCurrent" border>
            <el-table-column label="ID" prop="tid" width="40" align="center"></el-table-column>
            <el-table-column :label="$t('goodsDetails.consultant')" prop="partner" align="center"></el-table-column>
            <el-table-column :label="$t('goodsDetails.time')" prop="replay_count" align="center"></el-table-column>
            <el-table-column :label="$t('goodsDetails.replay_time')" prop="replay_time"
                             align="center"></el-table-column>
            <el-table-column :label="$t('goodsDetails.replay_uid')" prop="replay_uid" align="center">
                <template v-slot="{row}">
          <span :style="{ color: row.reply_uid !== uid ? '#bf2323' : '' }">
            {{ row.replay_uid }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('currency.operation')" fixed="right" align="center" width="70">
                <template v-slot="{row}">
                    <el-button size="mini" type="primary" @click="getConsultingList(row)">{{ $t('table.view') }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="consultTotal>0"
                :total="consultTotal"
                layout="total, prev, pager, next"
                :page.sync="consultListQuery.page"
                :limit.sync="consultListQuery.limit"
                @pagination="getConsultingList"
                :page-size="consultListQuery.limit"
        />

        <div class="order-details-left" v-if="JSON.stringify(clickRow) !== '{}'">
            <ubb-textarea v-model="replyText" path="comment" ref="textarea" :minRows="3"
                          :title="$t('goodsDetails.buyer.areaTitle')" :partner="clickRow.partner"
                          :idList="idList" :fileList="fileList" :attachList="attachList">
            </ubb-textarea>
            <el-button type="primary" id="custom-submit-button" class="submit-button" :loading="buttonLoading"
                       @click="handleReply">{{$t('goodsDetails.orderList.submit')}}
            </el-button>
            <div class="reply-list" v-if="detailsList.length">
                <div v-for="item in detailsList" :key="item.id" class="every-list">
                    <div class="top">
                        <div class="left">
                            <span style="margin-right: 30px" :style="{ color: fontColor(item) }">{{$t('goodsDetails.orderList.publisher')}}：{{ item.sender }}</span>
                            <span>{{$t('goodsDetails.orderList.time')}}：{{ item.post.ctime }}</span>
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
        name: "seller",
        components: {ubbTextarea},
        data() {
            return {
                id: this.$route.query.id,
                clickRow: {},
                buttonLoading: false,
                replyText: '',
                attachList: [],
                idList: [],
                fileList: [],
                // 咨询清单相关
                consultTableData: [],
                consultTotal: 0,
                consultLoading: false,
                consultListQuery: {
                    page: 1,
                    limit: 15
                },
                // 详情
                detailsList: [],
                detailsTotal: 0,
                detailsListQuery: {
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
                uid: state => state.user.id * 1,
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
            // 获取咨询消息
            getConsultingList() {
                this.consultLoading = true
                const params = {
                    tid: this.goodsInfo.tid || this.id,
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

            //评论-发布评论
            handleReply() {
                if (!this.replyText) return this.$message.warning('内容为空');
                this.buttonLoading = true
                let to_uid = this.clickRow.partner
                const params = {
                    id: this.goodsInfo.tid || this.id,
                    to_uid,
                    contents: this.replyText,
                    partner: this.clickRow.partner,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                this.$http('/WebMyReplys/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.replyText = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getDetails(this.clickRow)
                        this.getConsultingList()
                    }
                    this.buttonLoading = false
                })
            },

            // 点击行打开
            getCurrent(row) {
                this.clickRow = row
                this.getDetails(row)
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
    .submit-button {
        border-radius: 0;
    }

    .reply-list {
        background: #f4f4f4;
        margin-top: 10px;
        max-height: 500px;
        overflow-y: auto;

        .every-list {
            margin-bottom: 6px;
            border: 1px solid #000;
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
