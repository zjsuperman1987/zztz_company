<template>
    <div class="order-table">
        <el-table stripe :data="tableData" size="small" highlight-current-row
                  :row-key="getRowKeys"
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  v-loading="loading" @current-change="handleOidChange"
                  @row-click="getCurrentDeal" :row-class-name="tableRowClass">
            <el-table-column label="ID" prop="id" width="60"></el-table-column>
            <el-table-column :label="$t('table.volume')" prop="volume" width="60"></el-table-column>
            <el-table-column :label="$t('table.unitPrice')" prop="usdprice" width="80"></el-table-column>
            <el-table-column label="总价" width="80">
                <template v-slot="{row}">
                    {{ row.volume * row.usdprice }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('goodsDetails.orderList.aBTC')" prop="amount" width="100"></el-table-column>
            <el-table-column :label="$t('goodsDetails.orderList.protection')" width="120">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <span v-if="row.hold && row.protect_time">等待纠纷结束</span>
                        <span v-if="!row.hold && row.protect_time !== 0">{{ row.protect_time }}</span>
                    </template>
                </template>
            </el-table-column>
            <el-table-column :label="$t('goodsDetails.orderList.settle')" width="110">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <span v-if="row.hold && row.settle_time">等待纠纷结束</span>
                        <span v-if="!row.hold && row.settle_time !== 0">{{ row.settle_time }}</span>
                    </template>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.payStatus')" align="center" width="80">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <el-tag v-if="row.request_settle" type="success">已放款</el-tag>
                        <el-tag size="mini"
                                v-if="!row.request_settle && !row.hold && !row.buyer_mediate && !row.seller_mediate &&
                  !row.buyer_complaint && !row.seller_complaint">进行中
                        </el-tag>
                        <el-tag size="mini" v-if="row.hold && !row.buyer_mediate && !row.buyer_complaint" type="danger">
                            挂起
                        </el-tag>
                        <el-tag v-if="row.buyer_complaint && !row.seller_complaint" type="warning">买家申诉中</el-tag>
                        <el-tag v-if="row.seller_complaint && !row.buyer_complaint" type="warning">卖家申诉中</el-tag>
                        <el-tag v-if="row.buyer_mediate && !row.seller_mediate" type="danger">买家调解中</el-tag>
                        <el-tag v-if="row.seller_mediate && !row.buyer_mediate" type="danger">卖家调解中</el-tag>
                        <el-tag v-if="row.buyer_complaint && row.seller_complaint" type="warning">双方申诉中</el-tag>
                        <el-tag v-if="row.seller_mediate && row.buyer_mediate" type="danger">双方调解中</el-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.orderStatus')" align="center" width="80">
                <template v-slot="{row}">
                    <el-tag size="mini" v-if="row.status === 0">交易中</el-tag>
                    <el-tag size="mini" v-if="row.status === 1" type="info">已退款</el-tag>
                    <el-tag size="mini" v-if="row.status === 2" type="success">已完成</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.payTime')" prop="cretime" width="110"></el-table-column>
            <el-table-column :label="$t('goodsDetails.orderList.goodsInfo')" width="120">
                <template v-slot="{row}">
                    <el-button v-if="row.goods.post_id !== row.post_id"
                               type="primary" size="mini" @click="changeWord(row)">有变更
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" align="center">
                <template v-slot="{row}">
                    <el-button type="primary" size="mini" @click="getCurrentDeal(row)">{{ $t('table.view') }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, prev, pager, next"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getOrderList"
                :page-size="listQuery.limit"
        />

        <div style="background: #fff;padding: 4px">
            <el-row :gutter="10" class="order-details">
                <el-col :span="8">
                    <div class="order-details-right">
                        <div class="row-button" v-if="!clickRow.request_settle && clickRow.status === 0">
                            <el-button size="mini" v-if="clickRow.status === 0 && !clickRow.request_settle"
                                       type="primary"
                                       @click="handleOperation(clickRow,2)">{{ $t('goodsDetails.orderList.pay') }}
                            </el-button>

                            <el-button size="mini" v-if="!clickRow.hold && !clickRow.hold_disable"
                                       type="primary" @click="handleOperation(clickRow,3,'',1)">{{
                                $t('goodsDetails.orderList.hold') }}
                            </el-button>

                            <el-button size="mini" v-if="clickRow.hold && !clickRow.buyer_complaint"
                                       type="warning" @click="handleOperation(clickRow,3,1)">{{
                                $t('goodsDetails.orderList.cancelHold') }}
                            </el-button>

                            <el-button size="mini"
                                       v-if="clickRow.hold && !clickRow.buyer_complaint && !clickRow.buyer_complaint_times && !clickRow.buyer_mediate"
                                       type="danger" @click="handleOperation(clickRow,4, '', 2)">{{
                                $t('goodsDetails.orderList.complaint') }}
                            </el-button>

                            <el-button size="mini" v-if="clickRow.buyer_complaint"
                                       type="danger" @click="handleOperation(clickRow,4,1)">{{
                                $t('goodsDetails.orderList.cancelComplaint') }}
                            </el-button>

                            <el-button size="mini"
                                       v-if="clickRow.hold && clickRow.buyer_complaint_times && !clickRow.buyer_mediate"
                                       type="danger" @click="applyConciliation(clickRow,5, 1)">{{
                                $t('goodsDetails.orderList.mediate') }}
                            </el-button>

                            <el-button size="mini"
                                       v-if="clickRow.hold_disable && !clickRow.buyer_complaint && clickRow.buyer_complaint_times && !clickRow.buyer_mediate"
                                       type="danger" @click="applyConciliation(clickRow,5, 1)">申请调解
                            </el-button>

                            <el-button size="mini" v-if="clickRow.buyer_mediate"
                                       type="danger" @click="applyConciliation(clickRow,5, 1)">{{
                                $t('goodsDetails.orderList.cancelMediate') }}
                            </el-button>
                        </div>
                        <el-row class="info">
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.price') }}</span>{{ clickRow.usdprice
                                }} $
                            </el-col>
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.volume') }}</span>{{ clickRow.volume
                                }}
                            </el-col>
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.buyTime') }}</span>{{
                                clickRow.cretime }}
                            </el-col>
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.btcRate') }}</span>{{ nowRate.BTC.cny
                                }} ￥
                            </el-col>
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.settleAmount') }}</span>{{
                                clickRow.amount }} {{ current_type }}
                            </el-col>
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.usdtRate') }}</span>{{
                                nowRate.USDT.cny }} ￥
                            </el-col>
                            <el-col :span="12" v-if="clickRow.protect_time"><span>{{ $t('goodsDetails.orderList.protection') }}：</span>{{
                                clickRow.protect_time }}
                            </el-col>
                            <el-col :span="12" v-if="clickRow.settle_time"><span>{{ $t('goodsDetails.orderList.settle') }}：</span>{{
                                clickRow.settle_time }}
                            </el-col>
                            <el-col :span="12" v-if="clickRow.observer"><span style="color: #97431d">{{ $t('goodsDetails.orderList.observer') }}</span>{{
                                clickRow.observer }}
                            </el-col>
                            <el-col :span="12" v-if="clickRow.reduced !== 100"><span style="color: #97431d">{{ $t('goodsDetails.orderList.reduced') }}</span>{{
                                clickRow.reduced }}
                            </el-col>
                            <el-col :span="24" v-if="clickRow.seller_last_online"><span>{{ $t('goodsDetails.orderList.sellerOn') }}</span>{{
                                clickRow.seller_last_online }}
                            </el-col>
                        </el-row>
                        <el-timeline>
                            <el-timeline-item size="normal"
                                              v-for="item in timeLine"
                                              :key="item.id"
                                              :timestamp="item.stamp">
                                {{ item.codeTitle.text }}
                            </el-timeline-item>
                        </el-timeline>
                    </div>
                </el-col>
                <el-col :span="16">
                    <div class="chat_box" v-if="isLogin && ((reply && post_end_time) || (!reply))">
                        <ubb-textarea v-model="chatText" path="comment" ref="textarea"  :minRows="minRows"
                          :idList="idList" :fileList="fileList" :attachList="attachList" :title="$t('goodsDetails.orderList.chatSeller')">
                        </ubb-textarea>
                        <div class="btn_box">
                            <el-button type="primary" :loading="buttonLoading" class="submit-button" @click="submit">提交</el-button>
                        </div>
                        <div class="reply-list" v-if="chatList.length">
                            <div v-for="item in chatList" :key="item.id" class="every-list">
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
                                v-show="chatTotal>0"
                                :total="chatTotal"
                                layout="total, prev, pager, next"
                                :page.sync="listQuery.page"
                                :limit.sync="listQuery.limit"
                                @pagination="getChatList"
                                :page-size="listQuery.limit"
                        />
                    </div>
                    <div v-if="(reply&&!post_end_time) || !isLogin " class="no-pass">
                        您未激活交易权限或权限已过期, 请点此<span @click="visible = true"> 激活 </span>交易权限
                    </div>
                </el-col>
            </el-row>
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
        components: {ubbTextarea, vipDialog},
        data() {
            return {
                oId: this.$route.query.oId ? this.$route.query.oId : window.localStorage.getItem('goodsId'),
                id: this.$route.query.id,
                isBuy: this.$route.query.isBuy,
                tabIndex: 1,
                visible: false,
                tableData: [],
                total: 0,
                loading: false,
                listQuery: {
                    page: 1,
                    limit: 15
                },
                clickRow: {},
                chatText: '',
                attachList: [],
                idList: [],
                fileList: [],
                minRows: 8,
                chatTotal: 0,
                buttonLoading: false,
                conListQuery: {page: 1, limit: 15},
                chatList: [],
                conTotal: 0,
                timeLine: [],
                chatName: null, //传入chatName 的id
                current_type: '',
                recv_uid: '',
                isActive: false,  // 聊天窗口是否活跃
            }
        },
        watch: {
            refresh() {
                this.getOrderList()
            },
        },
        computed: {
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                isLogin: state => state.user.token,
                post_end_time: state => state.user.userInfo.post_end_time,
                reply: state => state.site.siteSetting.goods_reply_chars * 1,
                current: state => state.user.currentInfo,
                nowRate: state => state.user.rate,    //汇率
                uid: state => state.user.userInfo.id,
                refresh: state => state.goods.refreshValue,
                goodsInfo: state => state.goods.goodsInfo,
                pend_time: state => {
                    let time = state.user.userInfo.pend_time * 1
                    return time >= Math.round(new Date().getTime() / 1000);
                },
                mediation_costs: state => state.site.siteSetting.mediation_costs_chars,//调解金最低金额
                mediation_rate_chars: state => state.site.siteSetting.mediation_rate_chars,//调解金按当前订单30%
            })
        },
        created() {
            this.getOrderList()
            EventBus.$on('mallRefund', () => {
                this.getOrderList()
            })
        },
        activated() {
            this.getOrderList()
        },
        methods: {
            getOrderList() {
                return new Promise((resolve) => {
                    this.oId = window.localStorage.getItem('goodsId')
                    console.log(this.oId)
                    this.loading = true
                    let params = {
                        id: this.id,  // 商品id
                        partner: this.uid,  // 自身ID
                        limit: this.listQuery.limit,
                        page: this.listQuery.page,
                        rid: this.oId ? this.oId : ''  // 订单ID
                    }
                    this.$http.get('WebMyOrder', {params}).then(res => {
                        if (res) {
                            this.total = res.total
                            this.tableData = res.data
                            for(let prop of this.tableData) {
                                if(prop.id === this.oId) this.clickRow = prop
                                if(window.localStorage.getItem('goodsId') == prop.id) this.clickRow = prop
                            }
                            console.log(this.clickRow)
                            resolve(res.data)
                        }
                        this.loading = false
                    })
                })
            },
            // 点击行打开
            getCurrentDeal(row) {
                console.log(row)
                if (row.currency_id === 1) this.current_type = 'BTC'
                if (row.currency_id === 2) this.current_type = 'USDT'
                this.clickRow = row
                this.getChatList(row)
                this.getLine(row)
                this.chatName = row.seller
            },

            //发送聊天信息
            submit() {
                if (!this.chatText) this.$message.warning('内容为空');
                this.buttonLoading = true
                let to_uid = this.clickRow.seller
                const params = {
                    id: this.goodsInfo.tid,
                    to_uid,
                    contents: this.chatText,
                    partner: this.clickRow.buyer,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                this.$http('/WebMyReplys/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.chatText = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getChatList()
                        myFunctions.noticeOpposite(11,this.clickRow.seller)
                    }
                    this.buttonLoading = false
                })
            },
            //获取聊天信息
            getChatList() {
                // if (!this.token) return
                const params = {
                    id: this.id,
                    page: this.listQuery.page,
                    limit: this.listQuery.limit,
                    partner: this.clickRow.buyer
                }
                this.$http.get('/WebReply/getConsult', {params}).then(res => {
                    if (res) {
                        this.chatTotal = res.total
                        this.chatList = res.data
                    }
                })
            },
            getLine(row) {
                this.$http.get('/WebTransactionLog', {params: {rid: row.id, tid: row.tid}}).then(res => {
                    if (res) this.timeLine = res.data
                })
            },

            handleOperation(row, opt, op, type) {
                this.recv_uid = row.seller
                let contents, params
                if (type) { // 1挂起/2申诉
                    this.$prompt('请输入理由', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        inputValidator: (value) => {  //对输入内容校验
                            if (!value) return '内容不能为空！';
                        },
                        beforeClose: (action, instance, done) => {
                            if (action === 'confirm') {
                                instance.confirmButtonLoading = true
                                if (type === 1) contents = '[color=#1890FF][size=16]挂起理由[/size][/color]：\n' + instance.inputValue;
                                if (type === 2) contents = '[color=#1890FF][size=16]申诉理由[/size][/color]：\n' + instance.inputValue;
                                params = {
                                    opt, op,
                                    to_uid: row.seller,
                                    partner: row.buyer,
                                    contents,
                                }
                                this.$http('WebMyOrder/update', {
                                    method: 'post',
                                    params: {...params, id: row.id}
                                }).then(res => {
                                    if (res) {
                                        this.$http('/WebMyReplys/save', {
                                            method: 'post',
                                            params: {...params, id: row.tid, action: 1}
                                        })
                                        this.getOrderList().then((res) => {
                                            for (let item of res) {
                                                if (this.clickRow.id === item.id) this.clickRow = item
                                            }
                                            this.getCurrentDeal(this.clickRow)
                                            myFunctions.noticeOpposite(4, this.recv_uid)
                                        })
                                    }
                                    done()
                                    instance.confirmButtonLoading = false
                                })
                            } else done()
                        }
                    }).catch(() => {})
                } else {
                    params = {opt, op, id: row.id}
                    if (opt === 2) myFunctions.noticeOpposite(1, this.recv_uid)
                    myFunctions.noticeOpposite(4, this.recv_uid)
                    this.$http('WebMyOrder/update', {method: 'post', params}).then(res => {
                        if (res) {
                            this.getOrderList().then((res) => {
                                for (let item of res) if (this.clickRow.id === item.id) this.clickRow = item
                                this.getCurrentDeal(this.clickRow)
                            })
                        }
                    })
                }
            },

            // 调解
            applyConciliation(row, opt, op) {
                let sum = this.clickRow.usdprice * this.clickRow.volume * this.mediation_rate_chars * 0.01
                this.$confirm(row.buyer_mediate ? `是否需要取消调解？`
                    : `申请调解需要支付 ${parseFloat(sum > this.mediation_costs ? sum : this.mediation_costs) || 0} $, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true
                            op = row.buyer_mediate ? op : ''
                            this.$http('WebMyOrder/update', {
                                method: 'post',
                                params: {opt, id: row.id, op}
                            }).then(res => {
                                if (res) {
                                    this.$store.dispatch('user/getInfo')
                                    this.getOrderList().then((res) => {
                                        for (let item of res) {
                                            if (this.clickRow.id === item.id) this.clickRow = item
                                        }
                                        this.getCurrentDeal(this.clickRow)
                                    })
                                    done()
                                }
                                instance.confirmButtonLoading = false
                            })
                        } else done()
                    }
                }).catch(() => {});
            },

            // 隐藏/删除
            handleOP(item, type) {
                const params = {id: item.pid}
                if (type === 'hidden') params.hidden = 1
                if (type === 'del') params.del = 1
                this.$http.get('/WebMyReplys/update', {params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                    }
                })
            },

            changeWord(row) {
                this.$store.commit('goods/changeTab', 'goodsInfo')
                this.$store.commit('goods/refreshInfo', row.post_id)
            },

            fontColor(item) {
                if (item.is_adm) {
                    return 'red'
                } else if (item.sender === this.uid) {
                    return '#409cef'
                } else return '#67c23a'
            },

            tableRowClass({row}) {
                if (this.oId === row.id) return 'current-row'
                if (row.observer === this.uid) return 'row-observer'
            },

            getRowKeys(row) {
                return row.id
            },

            handleOidChange() {
                this.oId = ''
            },

            //打开聊天窗口方发
            // getActive(is) {  //获取点击活跃状态
            //     this.isActive = !this.isActive
            //     myFunctions.openChat(this.isActive, this.uid, this.chatName, is)
            // },
        },
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-table {
            .row-observer {
                background: #e5e5e5;
            }

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

                .no-pass {
                    padding: 10px;
                    border: 1px solid #999;

                    span {
                        color: #409EFF;
                        cursor: pointer;
                    }
                }
            }

        }

        &-right {
            height: 100%;
            background: #ecf5ff;
            padding: 10px;

            .row-button {
                padding-bottom: 10px;
                border-bottom: 1px solid #908E8E;
                display: inline-block;
                width: 250px;
                margin-right: 15px;
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
                    opacity: 0.6;
                }
            }
        }

        .chat_box{
            .btn_box{
                text-align: right;
                margin: 5px;
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
    }
    .no-pass {
        padding: 10px;
        border: 1px solid #999;

        span {
            color: #409EFF;
            cursor: pointer;
        }
    }
</style>
