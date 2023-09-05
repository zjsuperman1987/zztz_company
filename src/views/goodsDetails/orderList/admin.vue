<template>
    <div>
        <el-table size="mini" :data="dealTableData" :row-class-name="tableRowClass"
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  v-loading="dealLoading" @current-change="handleOidChange"
                  highlight-current-row @row-click="getCurrentDeal">
            <el-table-column label="ID" prop="id" width="50"></el-table-column>
            <el-table-column label="买家" width="50">
                <template v-slot="{row}">
                    <router-link :to="{ name: 'userDetails', query: { id: row.buyer } }">{{ row.buyer }}</router-link>
                </template>
            </el-table-column>
            <el-table-column label="购买时间" prop="cretime" width="110"></el-table-column>
            <el-table-column label="数量" prop="volume" width="40"></el-table-column>
            <el-table-column label="单价" prop="usdprice" width="70"></el-table-column>
            <el-table-column label="总价" width="60">
                <template v-slot="{row}">
                    {{ row.volume * row.usdprice }}
                </template>
            </el-table-column>
            <el-table-column label="结算金额" prop="amount" width="100"></el-table-column>
            <el-table-column label="保护期截止" width="110">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <span v-if="row.hold && row.protect_time">等待纠纷结束</span>
                        <span v-if="!row.hold && row.protect_time !== 0">{{ row.protect_time }}</span>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="交易结算期" width="110">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <span v-if="row.hold && row.settle_time">等待纠纷结束</span>
                        <span v-if="!row.hold && row.settle_time !== 0">{{ row.settle_time }}</span>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="交易状态">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <el-tag v-if="row.request_settle" type="success">已放款</el-tag>

                        <el-tag size="mini"
                                v-if="!row.request_settle && !row.hold && !row.buyer_mediate && !row.seller_mediate &&
                  !row.buyer_complaint && !row.seller_complaint">进行中
                        </el-tag>

                        <el-tag size="mini" v-if="row.hold && !row.buyer_mediate && !row.buyer_complaint &&
            !row.seller_mediate && !row.seller_complaint" type="danger">挂起
                        </el-tag>

                        <el-tag v-if="row.buyer_complaint && !row.seller_complaint && !row.buyer_mediate"
                                type="warning">买家申诉中
                        </el-tag>

                        <el-tag v-if="row.seller_complaint && !row.buyer_complaint" type="warning">卖家申诉中</el-tag>

                        <el-tag v-if="row.buyer_mediate && !row.seller_mediate" type="danger">买家调解中</el-tag>

                        <el-tag v-if="row.seller_mediate && !row.buyer_mediate" type="danger">卖家调解中</el-tag>

                        <el-tag v-if="row.buyer_complaint && row.seller_complaint" type="warning">双方申诉中</el-tag>

                        <el-tag v-if="row.seller_mediate && row.buyer_mediate" type="danger">双方调解中</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="订单状态">
                <template v-slot="{row}">
                    <el-tag size="mini" v-if="row.status === 0">交易中</el-tag>
                    <el-tag size="mini" v-if="row.status === 1" type="info">已退款</el-tag>
                    <el-tag size="mini" v-if="row.status === 2" type="success">已完成</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="最后回复时间 [次数]" width="140">
                <template v-slot="{row}">
                    <span v-if="row.reply_count">{{ row.reply_time }} [ {{ row.reply_count }} ]</span>
                </template>
            </el-table-column>
            <el-table-column label="商品详情" width="70">
                <template v-slot="{row}">
                    <el-button v-if="row.goods.post_id !== row.post_id"
                               type="primary" size="mini" @click="changeWord(row)">有变更
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template v-slot="{row}">
                    <el-button type="primary" size="mini" @click="getCurrentDeal(row)">打开</el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="dealTotal>0"
                :total="dealTotal"
                layout="total, prev, pager, next"
                :page.sync="dealListQuery.page"
                :limit.sync="dealListQuery.limit"
                @pagination="getDealList"
                :page-size="dealListQuery.limit"
        />

        <div style="background: #fff;padding: 4px">
            <el-row :gutter="10" class="order-details">
                <el-col :span="16">
                    <div class="order-details-left">
                        <div class="textarea">
                            <ubb-textarea v-model="replyText" path="comment" ref="textarea" :minRows="3"
                                          title="回复咨询" :partner="clickRow.buyer"
                                          :idList="idList" :fileList="fileList" :attachList="attachList">
                            </ubb-textarea>
                            <el-button type="primary" id="custom-submit-button" class="submit-button"
                                       :loading="buttonLoading" @click="handleReply">提交回复
                            </el-button>
                        </div>
                        <div class="reply-list" v-if="consultingList.length">
                            <div v-for="item in consultingList" :key="item.id" class="every-list">
                                <div class="top">
                                    <div class="left">
                                        <span style="margin-right: 30px" :style="{ color: fontColor(item) }">发布者：{{ item.sender }}</span>
                                        <span>时间：{{ item.post.ctime }}</span>
                                        <span v-if="item.post.del" style="margin-left: 30px;color: #FA6969">此消息于{{ item.post.deltime }}被{{ item.post.deler }}删除</span>
                                        <span v-if="item.post.hidden"
                                              style="margin-left: 30px;color: #FA6969">此消息已被隐藏</span>
                                    </div>
                                    <div class="right">
                                        <el-button v-if="isAdm && !item.post.del && !item.post.hidden" size="mini"
                                                   type="text" @click="handleOP(item,'hidden')">隐藏
                                        </el-button>
                                        <el-button v-if="(item.sender === uid || isAdm) && !item.post.del" size="mini"
                                                   type="text" @click="handleOP(item,'del')">删除
                                        </el-button>
                                    </div>
                                </div>
                                <div class="bottom" v-viewer><span v-html="item.post.contents"></span></div>
                            </div>
                        </div>
                        <div class="no-replay-list" v-else>暂无内容</div>
                        <page-nation
                                v-show="conTotal>0"
                                :total="conTotal"
                                layout="total, prev, pager, next"
                                :page.sync="conListQuery.page"
                                :limit.sync="conListQuery.limit"
                                @pagination="getConsultingList(clickRow)"
                                :page-size="conListQuery.limit"
                        />
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="order-details-right">
                        <div v-if="clickRow.status === 0" class="row-button">
                            <el-select size="mini" style="width: 100%;margin-bottom: 4px" @focus="getSoldSelect(1)"
                                       v-model="admReason" placeholder="操作理由(必选)" :popper-append-to-body="false">
                                <el-option
                                        v-for="item in admSelect"
                                        :key="item.id"
                                        :label="item.text"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                            <div>
                                <el-button size="mini" type="danger" v-if="clickRow.status === 0"
                                           @click="handleOperation(clickRow,1)">强制退款
                                </el-button>

                                <el-button size="mini" type="danger" @click="handleOperation(clickRow,2)"
                                           v-if="clickRow.status === 0 && clickRow.hold && !clickRow.buyer_mediate &&!clickRow.buyer_complaint
                                           && !clickRow.seller_mediate && !clickRow.seller_complaint">撤销挂起
                                </el-button>

                                <el-button size="mini" type="danger" @click="handleOperation(clickRow,6, 0)"
                                           v-if="clickRow.status === 0 && clickRow.hold && !clickRow.buyer_mediate && !clickRow.buyer_complaint">
                                    撤销申诉、挂起并禁止挂起
                                </el-button>

                                <el-button size="mini" type="danger"
                                           v-if="clickRow.buyer_complaint === 1 && !clickRow.buyer_mediate"
                                           @click="handleOperation(clickRow,4,0)">取消买家申诉
                                </el-button>

                                <el-button size="mini" type="danger"
                                           v-if="clickRow.seller_complaint === 1 && !clickRow.seller_mediate"
                                           @click="handleOperation(clickRow,4,1)">取消卖家申诉
                                </el-button>

                                <el-button size="mini" type="danger" v-if="clickRow.buyer_mediate === 1"
                                           @click="applyConciliation(clickRow,5,0)">取消买家调解
                                </el-button>

                                <el-button size="mini" type="danger" v-if="clickRow.seller_mediate === 1"
                                           @click="applyConciliation(clickRow,5,1)">取消卖家调解
                                </el-button>
                            </div>
                            <div class="setting">
                                <div class="input-button">
                                    <el-input style="width: 70px" v-model="clickRow.observer"
                                              placeholder="观察者"></el-input>
                                    <el-button type="primary" @click="setting('observer')">设置观察者</el-button>
                                </div>
                                <div class="input-button">
                                    <el-input style="width: 80px" v-model="clickRow.reduced" placeholder="折算">
                                        <template slot="append">%</template>
                                    </el-input>
                                    <el-button type="primary" @click="setting('reduced')">设置折算</el-button>
                                </div>
                            </div>
                        </div>
                        <el-row class="info">
                            <el-col :span="12"><span>商品单价：</span>{{ clickRow.usdprice }}</el-col>
                            <el-col :span="12"><span>购买数量</span>{{ clickRow.volume }}</el-col>
                            <el-col :span="12"><span>购买时间：</span>{{ clickRow.cretime }}</el-col>
                            <el-col :span="12"><span>比特币实时汇率：</span>{{ clickRow.btcprice }}</el-col>
                            <el-col :span="12"><span>结算金额：</span>{{ clickRow.amount }}</el-col>
                            <el-col :span="12"><span>交易保护期：</span>{{ clickRow.protect_time }}</el-col>
                            <el-col :span="12"><span>交易结算期：</span>{{ clickRow.settle_time }}</el-col>
                            <el-col :span="12" v-if="observer"><span style="color: #97431d">存在观察者：</span>{{ observer }}
                            </el-col>
                            <el-col :span="12" v-if="reduced !== 100"><span style="color: #97431d">存在交易折算：</span>{{
                                reduced }}
                            </el-col>
                            <el-col :span="24" v-if="clickRow.buyer_last_online"><span>买家最后在线：</span>{{
                                clickRow.buyer_last_online }}
                            </el-col>
                            <el-col :span="24" v-if="clickRow.seller_last_online"><span>卖家最后在线：</span>{{
                                clickRow.seller_last_online }}
                            </el-col>
                        </el-row>
                        <el-timeline>
                            <el-timeline-item
                                    size="normal"
                                    v-for="item in timeLine"
                                    :key="item.id"
                                    :timestamp="item.stamp">
                                {{ item.codeTitle.text }}
                            </el-timeline-item>
                        </el-timeline>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions";

    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "admin",
        components: {ubbTextarea},
        data() {
            return {
                oId: this.$route.query.oId,  //商品订单id
                id: this.$route.query.id,    //商品名称id
                // 交易订单相关
                dealTableData: [],
                dealLoading: false,
                dealTotal: 0,
                dealListQuery: {
                    page: 1,
                    limit: 15
                },
                admSelect: [],
                timeLine: [],
                admReason: '',
                clickRow: {
                    observer: '',
                    reduced: ''
                },
                replyText: '',
                attachList: [],
                idList: [],
                fileList: [],
                buttonLoading: false,
                conListQuery: {page: 1, limit: 15},
                consultingList: [],
                conTotal: 0,
                observer: '',
                reduced: '',
            }
        },
        computed: {
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                uid: state => state.user.userInfo.id,
                goodsInfo: state => state.goods.goodsInfo,
                refresh: state => state.goods.refreshValue,
            }),
        },
        watch: {
            refresh() {
                this.getDealList()
            },
            // oId: {
            //     handler(val) {
            //         if (val) {
            //             setTimeout(() => {
            //                 this.getCurrentDeal(this.dealTableData[0])
            //             }, 1000)
            //         }
            //     },
            //     deep: true,
            //     immediate: true
            // },
        },
        created() {
            this.getDealList()
        },
        mounted(){
            console.log(this.dealTableData)
        },
        methods: {
            // 交易清单
            async getDealList() {
                    this.dealLoading = true
                    let params = {
                        limit: this.dealListQuery.limit,
                        page: this.dealListQuery.page,
                        tid: this.id,
                        rid: this.oId ? this.oId : '',
                    }
                  let res =await  myFunctions.get('/AdmTrade', {...params})
                        if (res) {
                            this.dealTableData = res.data
                            this.dealTotal = res.total
                            for(let prop of this.dealTableData) {
                                if(prop.id === this.oId) this.clickRow = prop
                            }
                        }
                        this.dealLoading = false
            },

            // 获取咨询消息
            getConsultingList(row) {
                const params = {
                    id: this.goodsInfo.tid,
                    page: this.conListQuery.page,
                    limit: this.conListQuery.limit,
                    partner: row.buyer,
                }
                this.$http.get('/WebReply/getConsult', {params}).then(res => {
                    if (res) {
                        this.conTotal = res.total
                        this.consultingList = res.data
                    }
                })
            },

            //评论-发布评论
            handleReply() {
                if (!this.replyText) return this.$message.warning('内容为空');
                this.buttonLoading = true
                let to_uid = this.clickRow.buyer
                const params = {
                    id: this.goodsInfo.tid,
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
                        this.getConsultingList(this.clickRow)
                    }
                    this.buttonLoading = false
                })
            },

            // 点击行打开
            getCurrentDeal(row) {
                this.clickRow = {...row}
                this.observer = JSON.parse(JSON.stringify(row)).observer
                this.reduced = JSON.parse(JSON.stringify(row)).reduced
                this.getConsultingList(row)
                this.getLine(row)
            },

            //操作按钮
            handleOperation(row, opt, op) {
                const params = {
                    opt, op,
                    id: row.id,
                    msg_id: this.admReason
                }
                this.$http('/AdmTrade/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.admReason = ''
                        this.getDealList().then((res) => {
                            for (let item of res) {
                                if (this.clickRow.id === item.id) {
                                    this.clickRow = item
                                }
                            }
                            this.getCurrentDeal(this.clickRow)
                        })
                    }
                })
            },

            // 取消调解
            applyConciliation(row, opt, op) {
                this.$http('/AdmTrade/update', {method: 'post', params:{id: row.id, opt, op, msg_id: this.admReason}}).then(res => {
                    if (res) {
                        this.admReason = ''
                        this.$message.success('操作成功')
                        this.getDealList().then((res) => {
                            for (let item of res) if (this.clickRow.id === item.id) this.clickRow = item
                            this.getCurrentDeal(this.clickRow)
                        })
                    }
                })
            },

            // 获取下架/封号理由
            getSoldSelect(type) {
                this.$http('/AdmMsg/all', {method: 'post', params: {type}}).then(res => {
                    if (res) this.admSelect = res
                })
            },

            // 时间线记录
            getLine(row) {
                console.log(row)
                this.$http.get('/WebTransactionLog', {params: {rid: row.id,tid: row.tid}}).then(res => {
                    if (res) this.timeLine = res.data
                })
            },

            // 隐藏/删除
            handleOP(item, type) {
                const params = {id: item.pid}
                if (type === 'hidden') params.hidden = 1
                if (type === 'del') params.del = 1
                const url = this.isAdm ? '/AdmReply/update' : '/WebMyReplys/update'
                this.$http.get(url, {params}).then(res => {
                    if (res) this.$message.success('操作成功')
                    this.getConsultingList(this.clickRow)
                })
            },

            changeWord(row) {
                this.$store.commit('goods/changeTab', 'goodsInfo')
                this.$store.commit('goods/refreshInfo', row.post_id)
            },

            //设置观察者 折算
            setting(type) {
                let params = { id: this.clickRow.id }
                if (type === 'observer') params.observer = this.clickRow.observer
                else params.reduced = this.clickRow.reduced
                this.$http('AdmTrade/update', {method: 'post', params}).then(res => {
                    if (res) {
                        // this.getDealList().then(res => {
                        //     for (let item of res) if (this.clickRow.id === item.id) this.clickRow = item
                        this.getCurrentDeal(this.clickRow)
                        // })
                        console.log(res)
                    }
                })
            },

            fontColor(item) {
                if (item.is_adm) return 'red'
                else if (item.sender === this.uid) return '#409cef'
                else return '#67c23a'
            },

            tableRowClass({row}) {
                if (this.oId === row.id) return 'current-row'
            },

            handleOidChange() {
                this.oId = ''
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-table {
            .el-table__body tr.current-row > td {
                background: #96afcc;
                color: #fff;
            }
        }
    }

    .order-details {
        display: flex;

        &-left {
            background: #ecf5ff;
            padding: 10px;
            height: 100%;

            .textarea {
                border-bottom: 1px solid #908E8E;
                padding-bottom: 6px;

                .submit-button {
                    border-radius: 0;
                }
            }

            .reply-list {
                background: #f4f4f4;
                margin-top: 10px;
                max-height: 500px;
                overflow-y: auto;

                .every-list {
                    border-bottom: 1px solid #908E8E;

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
        }

        &-right {
            height: 100%;
            background: #ecf5ff;
            padding: 10px;

            .row-button {
                padding-bottom: 10px;
                border-bottom: 1px solid #908E8E;

                .setting {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 4px;

                    .input-button {
                        display: flex;

                        ::v-deep {
                            .el-input__inner {
                                border-radius: 4px 0 0 4px;
                            }

                            .el-button {
                                border-radius: 0 4px 4px 0;
                            }

                            .el-input-group__append {
                                padding: 0 4px;
                                border-radius: 0;
                            }
                        }
                    }
                }
            }

            ::v-deep {
                .el-timeline {
                    margin-top: 10px;
                }

                .el-timeline-item {
                    padding-bottom: 10px;
                }

                .el-timeline-item__wrapper {
                    display: flex;
                    align-items: center;
                }

                .el-timeline-item__timestamp {
                    margin: 0 0 0 10px;
                }
            }

            .info {
                padding: 10px 0;
                border-bottom: 1px solid #908E8E;

                .el-col:not(:last-child) {
                    margin-bottom: 4px;
                }

                span {
                    opacity: .6;
                }
            }
        }
    }
</style>
