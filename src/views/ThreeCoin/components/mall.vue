<template>
    <div class="container">
        <div class="currency_btn">
            <el-radio-group v-model="radio" size="mini" @change="btnClick">
                <el-radio-button label="BTC"></el-radio-button>
                <el-radio-button label="USDT"></el-radio-button>
            </el-radio-group>
        </div>
        <el-table :data="tableList" style="width: 100%" ref="tableList">
            <!--    展开部分-->
            <el-table-column type="expand" width="1">
                <template slot-scope="{ row }">
                    <div class="expand">
                        <span class="title-expand">{{$t('currency.business')}}: {{ row.userInfo.id }}</span>
                        <span class="title-expand">{{$t('currency.remainder')}}:{{ parseFloat(row.re_amount) }}</span>
                        <span class="title-expand">{{$t('currency.unitPrice')}}:{{ parseFloat(row.unit_price) }} CNY</span>

                        <!-- btc输入框 -->
                        <span style="display:inline-block">
                             <el-input size="mini" type="number" debounce="500" @input="btcInput(row)" v-model.trim="BTC">
                                <template slot="append">{{ row.currency.ift_name }}</template>
                             </el-input>
                        </span>
                        <span class="trans iconfont icon-shujuzhuanhuan"></span>

                        <!-- cny输入框 -->
                        <span style="display:inline-block">
                            <el-input size="mini" type="number" debounce="500" @input="cnyInput(row)" v-model.trim="CNY">
                                <template slot="append">CNY</template>
                            </el-input>
                        </span>
                        <span class="order">
                            <el-button size="mini" @click="order(row)" type="primary" :loading="takeOrderLoading">{{$t('currency.placeOrder')}}</el-button>
                            <el-button class="cancel-button" size="mini" type="primary" @click="cancelExpand(row)"
                           :disabled="cancelButton">{{$t('currency.cancel')}}</el-button>
                        </span>
                    </div>
                    <p>{{$t('currency.remarks')}}：{{row.remarks}}</p>
                </template>
            </el-table-column>

            <!-- 表格部分 -->
            <el-table-column :label="$t('currency.completeRate')" width="200" show-overflow-tooltip>
                <template slot-scope="{row}">
                    <div style="display: flex;align-items: center">
                        <el-avatar size="small">{{ (row.userInfo.nick_name).substring(0,1) }}</el-avatar>
                        <!-- <span style="margin-left: 6px">{{row.userInfo.nick_name}}&emsp;</span> -->
                        <span style="margin-right: 10px">{{ row.userInfo.id }}</span>
                        <span class="userInfo">{{row.sub_total}} |
        {{parseInt(row.sub_count) > 0 ? Math.round(row.sub_count / row.sub_total * 100) + "%" : "0%"}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('currency.remainder')" width="180" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <div>{{ row.re_amount | cutPoint(row.currency.amt_precision) }} {{row.currency.ift_name}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('currency.limit')" width="280">
                <template slot-scope="{ row }">
                    {{row.range_start | cutPoint(row.currency.price_precision) | toThousandFilter }} -
                    {{row.range_end |
                    cutPoint(row.currency.price_precision) | toThousandFilter }} CNY
                </template>
            </el-table-column>
            <el-table-column :label="$t('currency.unitPrice')" min-width="180">
                <template slot-scope="{ row }">
                <span class="unit-price">
                    {{row.unit_price | cutPoint(row.currency.price_precision) | toThousandFilter }} CNY
                </span>
                </template>
            </el-table-column>
            <el-table-column prop="deal" width="220" align="center">
                <template slot="header">
                    <span>{{$t('currency.deal')}}</span>&nbsp;
                    <el-tag type="success" size="mini">{{$t('currency.Charge')}}</el-tag>
                </template>
                <template slot-scope="{ row }">
                    <el-button size="mini" type="primary" @click="handleRowClick(row)">
                        {{ buttonValue }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div style="text-align: center">
            <el-pagination @current-change="getData()" :current-page.sync="listQuery.page"
                           :page-size="listQuery.limit" layout="total, prev, pager, next" :total="total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions"   //引入myFunctions js文件
    export default {
        name: "mall",
        props: {
            tabIndex: {
                type: Number,
                default: () => {
                    return 1
                }
            },
        },
        data() {
            return {
                //分页
                total: 0,
                radio: 'BTC',
                tableList: [],
                listQuery: {
                    page: 1,
                    limit: 10,
                },
                type: 0,    // 出售
                CNY: '',
                BTC: '',
                active: false,
                takeOrderLoading: false,     //下单按钮loading
                cancelButton: false,    // 下单取消按钮
                buttonValue: '购买',
                trading: '',
            }
        },
        watch: {
            tabIndex: {   //监听点击购买和出售显示相应的按钮和类型
                handler() {
                    if (this.tabIndex === 2) {
                        if (this.$i18n.locale === 'zh') this.buttonValue = '出售'
                        if (this.$i18n.locale === 'en') this.buttonValue = 'Sell'
                        this.type = 1
                        this.getData(0,1)
                        this.radio = 'BTC'
                    } else if (this.tabIndex === 1) {
                        if (this.$i18n.locale === 'en') this.buttonValue = 'Buy'
                        if (this.$i18n.locale === 'zh') this.buttonValue = '购买'
                        this.type = 0
                        this.getData(1,1)
                        this.radio = 'BTC'
                    }
                },
                immediate: true
            },
            '$i18n.locale': {  //监听中英文按钮的切换
                handler: function () {
                    if (this.$i18n.locale === 'zh') {
                        if (this.buttonValue === 'Buy') this.buttonValue = '购买'
                        if (this.buttonValue === 'Sell') this.buttonValue = '出售'
                    } else {
                        if (this.buttonValue === '购买') this.buttonValue = 'Buy'
                        if (this.buttonValue === '出售') this.buttonValue = 'Sell'
                    }
                },
                immediate: true
            },
            orderList: {
                handler: function(){
                    for(let prop of this.orderList){
                        if(prop.s_type === 0) { this.trading = prop }
                    }
                },
                immediate: true
            }
        },
        computed: {
            ...mapState({
                id: state => state.user.userInfo.id * 1,
                orderList: state => state.order.cornOrderList,
                payPassword: state => state.user.userInfo.paypwd
            }),
        },
        methods: {
            // 展开下单函数
            handleRowClick(row) {
                this.BTC = ''
                this.CNY = ''
                let table = this.$refs.tableList;
                this.tableList.map((item) => {
                    if (row.id !== item.id) table.toggleRowExpansion(item, false)
                })
                table.toggleRowExpansion(row)
            },
            //关闭弹出
            cancelExpand(row) {
                let table = this.$refs.tableList
                table.toggleRowExpansion(row)
                this.BTC = ''
                this.CNY = ''
            },
            // cny 监听input输入框
            cnyInput(row) {
                const reg = new RegExp("^[0-9]+(\.[0-9]{1," + row.currency.price_precision + "})?$")
                setTimeout(() => {
                    if (reg.test(this.CNY)) {
                        let rg = this.getRange(row), cny = this.CNY

                        if (cny > rg.max) {
                            this.CNY = rg.max
                            this.BTC = myFunctions.cutPoint(this.CNY / row.unit_price, row.currency.amt_precision)
                        } else if (cny < rg.min) {
                            this.CNY = rg.min
                            this.BTC = myFunctions.cutPoint(this.CNY / row.unit_price, row.currency.amt_precision)
                        } else {
                            this.CNY = cny
                            this.BTC = myFunctions.cutPoint(this.CNY / row.unit_price, row.currency.amt_precision)
                        }
                        this.CNY = myFunctions.cutPoint(this.CNY, row.currency.amt_precision)
                    } else {
                        this.CNY = myFunctions.cutPoint(this.CNY, row.currency.price_precision)
                    }
                }, 2500)
            },
            getRange(row) {
                let res = {min: Number(row.range_start), max: Number(row.range_end)}
                //剩余数量价值的人民币
                let recny = row.re_amount * row.unit_price
                if (recny < res.max) res.max = recny
                if (res.max < res.min) return this.$message.warning('剩余数量不足,无法下单')
                return res
            },
            // btc 监听input输入框
            btcInput(row) {
                const reg = new RegExp("^[0-9]+(\.[0-9]{1," + row.currency.amt_precision + "})?$")
                setTimeout(() => {
                    if (reg.test(this.BTC)) {
                        let rg = this.getRange(row), cny = this.BTC * row.unit_price

                        if (cny > rg.max) {
                            this.BTC = rg.max / row.unit_price
                            this.BTC = myFunctions.cutPoint(this.BTC, row.currency.amt_precision)
                        } else if (cny < rg.min) {
                            this.BTC = rg.min / row.unit_price
                            this.BTC = myFunctions.cutPoint(this.BTC, row.currency.amt_precision)
                        }
                        this.CNY = parseFloat(this.BTC * row.unit_price + '').toFixed(row.currency.price_precision)
                    } else this.BTC = myFunctions.cutPoint(this.BTC, row.currency.amt_precision)
                }, 1000)
            },
            // 下单点击事件
            order(row) {
                if (!parseFloat(this.BTC)) return this.$message.warning('购买数量不能为空')
                if (row.userInfo.id === this.id) return this.$message.warning('不能购买自己的商品')
                if (this.trading.status === 0) return this.$message.warning('请您先完成正在交易的订单,再来够买!!')
                if (!this.payPassword) {
                    this.$router.push({name: 'userInfo', id: this.id})
                    return this.$message.warning('请设置您的交易密码!')
                }
                this.takeOrderLoading = true
                this.cancelButton = true
                this.getOrder(row)
            },
            // 请求订单列表
            async getOrder(row) {
                console.log(row)
                let res = await myFunctions.post('Webc2cOrder/create', {id: row.id, type: this.type, amount: this.BTC});
                if (res) {
                    this.$router.push({name: 'orderInfo', query: {id: res.id}}).catch();
                    myFunctions.noticeOpposite(2, row.userInfo.id);
                    this.takeOrderLoading = false
                    this.cancelButton = false
                }
            },
            //通知对方的订单即时更新
            // noticeOpposite(val, res) {
            //     let msg = {
            //         recv_uid: val.userInfo.id,//接收者
            //         send_uid: this.id, //发送消息者
            //         type: 1,//消息类型
            //         content: JSON.stringify({
            //             systemMsg: '新订单[' + res.sn + ']已创建', type: 0, o_type: 1, oid: res.id
            //         }) //type:0->购买
            //     }
            //     this.$myFunctions.WsSend(msg, () => {})
            //     EventBus.$emit('websocketMsg', msg)
            // },

            // 获取商品购买列表
            async getData(type, val) {
                if (this.currentTab === 1) this.buttonValue = '购买'
                if (this.currentTab === 2) this.buttonValue = '出售'
                this.loading = true;
                let params = {type: type, page: this.listQuery.page, limit: this.listQuery.limit, currency_id: val}
                let res = await myFunctions.get('WebHome/getList', params);
                if (res) {
                    this.total = res.count
                    this.tableList = res.list
                }
            },
            // 按钮切换事件
            btnClick() {
                if(this.radio === 'BTC') this.btcBtnClick()
                else this.usdtBtnClick()
            },

            //法币展示管理按钮
            btcBtnClick() {
                if(this.tabIndex === 2) this.getData(0,1)
                if(this.tabIndex === 1) this.getData(1,1) 
            },
            usdtBtnClick() {
                if(this.tabIndex === 2) this.getData(0,2)
                if(this.tabIndex === 1) this.getData(1,2)
            },
        }
    }
</script>

<style lang="less" scoped>
    .container{
        background: #FFF;
        border: 1px solid #DCDFE6;
        margin-top: 30px;
        box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%);

        .currency_btn{
            margin: 10px 0 0 15px;
            .active{
                color: #fff;
                background: #409EFF;
            }
            // .activeUSDT{
            //     color: #fff;
            //     background: #409EFF;
            // }
        }
        .el-table {
            padding: 10px;

            .expand {
                height: 30px;
                line-height: 30px;

                .title-expand {
                    display: inline-block;
                    width: 130px;
                }

                .title-expand:nth-child(2) {
                    display: inline-block;
                    width: 160px;
                }

                .title-expand:nth-child(3) {
                    display: inline-block;
                    width: 160px;
                }

                .title-expand:nth-child(4) {
                    display: inline-block;
                    width: 100px;
                    text-align: center;
                }

                .trans {
                    display: inline-block;
                    width: 40px;
                    box-sizing: border-box;
                    padding-left: 10px;
                }

                .order {
                    margin-left: 30px;
                }

                .icon-shujuzhuanhuan:before {
                    content: "\e613";
                }
            }
        }
    }
    /deep/.el-icon{
        margin: 0;
        padding: 0;
    }
    /deep/.el-table__expanded-cell{
        padding: 10px 0 10px 20px;
    }
</style>
