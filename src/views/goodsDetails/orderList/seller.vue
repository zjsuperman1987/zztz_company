<template>
    <div>
        <el-table size="mini" :data="dealTableData" :row-class-name="tableRowClass"
                  :row-key="getRowKeys" @row-click="getCurrentDeal"
                  :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  v-loading="dealLoading" @current-change="handleOidChange" highlight-current-row>
            <el-table-column label="ID" prop="id" width="40"></el-table-column>
            <el-table-column :label="$t('table.buyer')" prop="buyer" width="50"></el-table-column>
            <el-table-column :label="$t('table.payTime')" prop="cretime" width="110"></el-table-column>
            <el-table-column :label="$t('table.volume')" prop="volume" width="50"></el-table-column>
            <el-table-column :label="$t('table.unitPrice')" prop="usdprice" width="70"></el-table-column>
            <el-table-column :label="$t('currency.totalPrice')" width="70">
                <template v-slot="{row}">
                    {{ row.volume * row.usdprice }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.amount')" prop="amount" width="90"></el-table-column>
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
            <el-table-column :label="$t('table.payStatus')">
                <template v-slot="{row}">
                    <template v-if="row.status === 0">
                        <el-tag v-if="row.request_settle" type="success">已放款</el-tag>
                        <el-tag size="mini"
                                v-if="!row.request_settle && !row.hold && !row.buyer_mediate && !row.seller_mediate &&
                  !row.buyer_complaint && !row.seller_complaint">进行中
                        </el-tag>

                        <el-tag size="mini" v-if="row.hold && !row.buyer_complaint &&
             !row.buyer_mediate && !row.seller_mediate && !row.seller_complaint" type="danger">挂起
                        </el-tag>

                        <el-tag v-if="!row.buyer_mediate && row.buyer_complaint && !row.seller_complaint"
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
            <el-table-column :label="$t('table.orderStatus')" align="center">
                <template v-slot="{row}">
                    <el-tag size="mini" v-if="row.status === 0">交易中</el-tag>
                    <el-tag size="mini" v-if="row.status === 1" type="info">已退款</el-tag>
                    <el-tag size="mini" v-if="row.status === 2" type="success">已完成</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('goodsDetails.orderList.lastTimeCount')" align="center" width="140">
                <template v-slot="{row}">
                    <span v-if="row.reply_count" :style="{ color: row.reply_uid !== uid ? '#bf2323' : '' }">
                        {{ row.reply_time }} [ {{ row.reply_count }} ]
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('goodsDetails.orderList.goodsInfo')" align="center" width="70">
                <template v-slot="{row}">
                    <el-button v-if="row.goods.post_id !== row.post_id"
                               type="primary" size="mini" @click="changeWord(row)">{{$t('table.changed')}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" width="70" align="center">
                <template v-slot="{row}">
                    <el-button type="primary" size="mini" @click="getCurrentDeal(row)">{{ $t('table.view') }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="dealTotal>0"
                :total="dealTotal"
                :pager-count="5"
                layout="total, prev, pager, next"
                :page.sync="dealListQuery.page"
                :limit.sync="dealListQuery.limit"
                @pagination="getDealList"
                :page-size="dealListQuery.limit"
        />

        <div style="background: #fff;padding: 4px">
            <el-row :gutter="10" class="order-details">
                <el-col :span="8">
                    <div class="order-details-right">
                        <div class="row-button">
                            <div style="display: inline-block;margin-right: 20px;"  v-if="clickRow.status === 0">
                                <el-button v-if="clickRow.status === 0"
                                           size="mini" type="primary" @click="handleClick(clickRow,1)">{{
                                    $t('goodsDetails.orderList.refund') }}
                                </el-button>

                                <el-button
                                        v-if="clickRow.hold && !clickRow.seller_complaint && !clickRow.seller_complaint_times && !clickRow.seller_mediate"
                                        size="mini" type="danger" @click="handleClick(clickRow,4, '', 2)">{{
                                    $t('goodsDetails.orderList.complaint') }}
                                </el-button>

                                <el-button v-if="clickRow.seller_complaint"
                                           size="mini" type="danger" @click="handleClick(clickRow,4,1)">{{
                                    $t('goodsDetails.orderList.cancelComplaint') }}
                                </el-button>

                                <el-button size="mini" type="danger"
                                           v-if="clickRow.seller_complaint && !clickRow.seller_mediate"
                                           @click="applyConciliation(clickRow,5, 1)">{{
                                    $t('goodsDetails.orderList.mediate') }}
                                </el-button>

                                <el-button size="mini" type="danger"
                                           v-if="clickRow.seller_mediate"
                                           @click="applyConciliation(clickRow,5, 1)">{{
                                    $t('goodsDetails.orderList.cancelMediate') }}
                                </el-button>
                            </div>
                            <!-- 设置观察者和折算率 -->
                            <div class="setting">
                                <div class="input-button">
                                    <el-input style="width: 70px" v-model="clickRow.observer"
                                            :placeholder="$t('goodsDetails.orderList.ob')"></el-input>
                                    <el-button type="primary" @click="setting('observer')">{{
                                        $t('goodsDetails.orderList.setOb') }}
                                    </el-button>
                                </div>
                                <div class="input-button">
                                    <el-input style="width: 80px" v-model="clickRow.reduced"
                                            :placeholder="$t('goodsDetails.orderList.reduc')">
                                        <template slot="append">%</template>
                                    </el-input>
                                    <el-button type="primary" @click="setting('reduced')">{{
                                        $t('goodsDetails.orderList.setReduce') }}
                                    </el-button>
                                </div>
                            </div>
                        </div>
                        <!-- <el-button @click="getActive(true)" style="position: absolute;left: 280px;top: 5px;z-index: 9;">
                            {{$t('goodsDetails.contactBuyer')}}
                        </el-button> -->
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
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.protection') }}：</span>{{
                                clickRow.protect_time }}
                            </el-col>
                            <el-col :span="12"><span>{{ $t('goodsDetails.orderList.settle') }}：</span>{{
                                clickRow.settle_time }}
                            </el-col>
                            <el-col :span="12" v-if="observer"><span style="color: #97431d">{{ $t('goodsDetails.orderList.observer') }}</span>{{
                                observer }}
                            </el-col>
                            <el-col :span="12" v-if="reduced !== 100"><span style="color: #97431d">{{ $t('goodsDetails.orderList.reduced') }}</span>{{
                                reduced }}
                            </el-col>
                            <el-col :span="24" v-if="clickRow.buyer_last_online"><span>{{ $t('goodsDetails.orderList.buyerOn') }}</span>{{
                                clickRow.buyer_last_online }}
                            </el-col>
                            <el-col :span="24" v-if="clickRow.seller_last_online"><span>{{ $t('goodsDetails.orderList.sellerOn') }}</span>{{
                                clickRow.seller_last_online }}
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-timeline>
                                <el-timeline-item
                                        size="normal"
                                        v-for="item in timeLine"
                                        :key="item.id"
                                        :timestamp="item.stamp">
                                    {{ item.codeTitle.text }}
                                </el-timeline-item>
                            </el-timeline>
                        </el-row>
                    </div>
                </el-col>
                <el-col :span="16">
                    <div class="chat_box">
                        <ubb-textarea v-model="chatText" path="comment" ref="textarea"  :minRows="minRows"
                          :idList="idList" :fileList="fileList" :attachList="attachList" :title="$t('goodsDetails.orderList.chatBuyer')">
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
        name: "seller",
        components: {ubbTextarea},
        data() {
            return {
                oId: this.$route.query.oId,
                id: this.$route.query.id,
                isBuy: this.$route.query.isBuy,
                // 交易订单相关
                dealTableData: [],
                dealLoading: false,
                dealTotal: 0,
                dealListQuery: {
                    page: 1,
                    limit: 15
                },
                listQuery: {
                    limit: 20,
                    page: 1
                },
                clickRow: {
                    observer: '',
                    reduced: ''
                },
                chatText: '',
                attachList: [],
                idList: [],
                fileList: [],
                minRows: 6,
                chatList: [],
                chatTotal: 0,
                buttonLoading: false,
                conListQuery: {page: 1, limit: 15},
                chatList: [],
                conTotal: 0,
                timeLine: [],
                observer: '',
                reduced: '',
                chatName: '',
                current_type: '',  //货币类型
                isActive: false,  // 聊天窗口是否活跃
                text1: '请输入理由',   //中英切换 弹出框
                text2: '提示',
                text3: '确定',
                text4: '取消',
                params: {
                    observer: ''
                }
            }
        },
        watch: {
            refresh() {
                this.getDealList()
            },
            '$i18n.locale': {  //监听中英文切换
                handler() {
                    if (this.$i18n.locale === 'zh') {
                        this.text1 = '请输入理由'  //中英切换 弹出框
                        this.text2 = '提示'
                        this.text3 = '确定'
                        this.text4 = '取消'
                    } else if (this.$i18n.locale === 'en') {
                        this.text1 = 'Please enter reason'
                        this.text2 = 'Prompt'
                        this.text3 = 'OK'
                        this.text4 = 'Cancel'
                    }
                },
                immediate: true
            },
        },
        created() {
            EventBus.$on('mallGetOrderList', () => {
                this.getDealList()
            })
            this.getDealList()
            this.getChatList()
        },
        computed: {
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                userID: state => state.user.userInfo.id,
                uid: state => state.user.id * 1,
                goodsInfo: state => state.goods.goodsInfo,
                refresh: state => state.goods.refreshValue,
                current: state => state.user.currentInfo,
                nowRate: state => state.user.rate,
                cost: state => state.site.siteSetting.mediation_costs_chars,//调解金最低金额
                mediation_rate_chars: state => state.site.siteSetting.mediation_rate_chars,//调解金按当前订单30%
            })
        },
        methods: {
            //获取交易单列表
            getDealList() {
                return new Promise((resolve) => {
                    this.dealLoading = true
                    let params = {
                        limit: this.dealListQuery.limit,
                        page: this.dealListQuery.page,
                        id: this.id,
                        rid: this.oId ? this.oId : '',
                        self: 1
                    }
                    this.$http.get('/WebMyOrder', {params}).then(res => {
                        if (res) {
                            this.dealTableData = res.data
                            this.dealTotal = res.total
                            for(let prop of this.dealTableData) {
                                if(prop.id === this.oId) this.clickRow = prop
                            }
                            resolve(res.data)
                        }
                        this.dealLoading = false
                    })
                })
            },
            //发送聊天信息
            submit() {
                if (!this.chatText) this.$message.warning('内容为空');
                this.buttonLoading = true
                let to_uid = this.clickRow.buyer
                const params = {
                    id: this.goodsInfo.tid,
                    to_uid,
                    contents: this.chatText,
                    partner: this.clickRow.seller,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                this.$http('/WebMyReplys/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.chatText = ''
                        this.idList = []
                        this.attachList = []
                        this.$refs.textarea.clearFiles()
                        this.getChatList()
                        myFunctions.noticeOpposite(11,this.clickRow.buyer)
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
                    partner: this.clickRow.seller
                }
                console.log(2112222222)
                this.$http.get('/WebReply/getConsult', {params}).then(res => {
                    if (res) {
                        this.chatTotal = res.total
                        this.chatList = res.data
                        console.log(res.data)
                    }
                })
            },   

            // 点击行打开
            getCurrentDeal(row) {
                console.log(row)
                if (row.currency_id === 1) this.current_type = 'BTC'
                if (row.currency_id === 2) this.current_type = 'USDT'
                if (row) EventBus.$emit('chatId', row)
                this.chatName = row.buyer
                this.clickRow = {...row}
                this.observer = JSON.parse(JSON.stringify(row)).observer
                this.reduced = JSON.parse(JSON.stringify(row)).reduced
                this.getLine(row)
            },
            //获取订单交易步骤
            getLine(row) {
                this.$http.get('/WebTransactionLog', {params: {rid: row.id, tid: row.tid}}).then(res => {
                    if (res) this.timeLine = res.data
                })
            },
            handleClick(row, opt, op, type) {
                let contents, params
                if (type) { // 2申诉
                    this.$prompt(this.text1, this.text2, {
                        confirmButtonText: this.text3,
                        cancelButtonText: this.text4,
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        inputValidator: (value) => {  //对输入内容校验
                            if (!value) return '内容不能为空！';
                        },
                        beforeClose: (action, instance, done) => {
                            if (action === 'confirm') {
                                instance.confirmButtonLoading = true
                                if (type === 2) contents = '[color=#1890FF][size=16]申诉理由[/size][/color]：\n' + instance.inputValue;
                                params = {
                                    opt, op,
                                    to_uid: row.buyer,
                                    partner: row.buyer,
                                    contents,
                                }
                                this.$http('WebMyOrder/update', {
                                    method: 'post',
                                    params: {...params, id: row.id}
                                }).then(res => {
                                    if (res) {
                                        this.$message.success('操作成功')
                                        this.$http('/WebMyReplys/save', {
                                            method: 'post',
                                            params: {...params, id: row.tid, action: 1}
                                        })
                                        this.getDealList().then(res => {
                                            for (let item of res) if (this.clickRow.id === item.id) this.clickRow = item
                                            this.getCurrentDeal(this.clickRow)
                                        })
                                    }
                                    instance.confirmButtonLoading = false
                                    done()
                                })
                            } else done()
                        }
                    }).catch(() => {})
                } else {
                    params = {opt, op, id: row.id}
                    this.$http('WebMyOrder/update', {method: 'post', params}).then(res => {
                        if (res) {
                            this.$message.success('操作成功')
                            this.getDealList().then(res => {
                                for (let item of res) if (this.clickRow.id === item.id) this.clickRow = item
                                this.getCurrentDeal(this.clickRow)
                                myFunctions.noticeOpposite(6, row.buyer)
                            })
                        }
                    })
                }
            },
            // 调解
            applyConciliation(row, opt, op) {
                let sum = this.clickRow.usdprice * this.clickRow.volume * this.mediation_rate_chars * 0.01
                this.$confirm(row.buyer_mediate ? `是否需要取消调解？`
                    : `申请调解需要支付 ${parseFloat(sum > this.cost ? sum : this.cost) || 0} $, 是否继续?`, '提示', {
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
                                    this.getDealList().then(res => {
                                        for (let item of res) if (this.clickRow.id === item.id) this.clickRow = item
                                        this.getCurrentDeal(this.clickRow)
                                    })
                                    this.$message.success('操作成功')
                                    this.$store.dispatch('user/getInfo')
                                    done()
                                }
                                instance.confirmButtonLoading = false
                            })
                        } else done()
                    }
                }).catch(() => {});
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
                this.$http('WebMyOrder/update', {method: 'post', params}).then(res => {
                    if (res) {
                        console.log(res)
                        this.getDealList().then(res => {
                            for (let item of res) if (this.clickRow.id === item.id) this.clickRow = item

                            this.getCurrentDeal(this.clickRow)
                        })
                    }
                })
            },
            getRowKeys(row) {
                return row.id
            },

            tableRowClass({row}) {
                if (this.oId === row.id) return 'current-row'
            },
            handleOidChange() {
                this.oId = ''
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

</style>
