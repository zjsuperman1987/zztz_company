<template>
    <div class="container">
        <div class="order-header">
            <div class="order-header-status">
        <span class="notDbClick"
            v-for="(item,index) of orderStatus"
            :key="index"
            :class="{active:index===isActive}"
            @click="selectOrder(index)"
        >{{item}}</span>
            </div>
        </div>
        <div class="order-table">
            <div class="deal_btn">
                <el-radio-group v-model="radio" size="mini" @change="btnClick">
                    <el-radio-button label="BTC"></el-radio-button>
                    <el-radio-button label="USDT"></el-radio-button>
                </el-radio-group>
            </div>
            <el-table size="small" :data="orderList" v-loading="isLoading" highlight-current-row>
                <el-table-column :label="$t('currency.orderNumber')" width="160">
                    <template slot-scope="{row}">
                        <span style="color: #ef5656" v-show="row.s_type === 0 && row.release_id === id">出售</span>
                        <span style="color: #67c23a" v-show="row.s_type === 0 && row.subscribe_id === id">购买</span>
                        <span style="color: #67c23a" v-show="row.s_type === 1 && row.release_id === id">购买</span>
                        <span style="color: #ef5656" v-show="row.s_type === 1 && row.subscribe_id === id">出售</span>
                        <span>&nbsp;{{ row.sn}}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('currency.state')" width="100">
                    <template slot-scope="{row}">
                        <span v-if="row.status === 1 && row.s_type === 1 && row.release_id === id">
                            <span class="iconjinhangzhong"> 等待对方放币</span>
                        </span>
                        <span v-if="row.appeal === 1">
                            <span style="color: red" class=" iconshensuzhong">买方申诉中</span>
                        </span>
                        <span v-if="row.appeal === 2">
                            <span style="color: red" class=" iconshensuzhong">卖方申诉中</span>
                        </span>
                        <span v-if="row.status === 0 && row.s_type === 1 && row.subscribe_id === id && row.appeal === 0">
                            <span class=" iconjinhangzhong"> 待对方付款</span>
                        </span>
                        <span v-if="row.status === 0 && row.s_type === 1 && row.release_id === id && row.appeal === 0">
                            <span class="iconjinhangzhong" style="color: red"> 待付款</span>
                        </span>
                        <span v-if="row.status === 1 && row.s_type === 1 && row.subscribe_id === id && row.appeal === 0">
                            <span class="iconjinhangzhong" style="color: red"> 去放币</span>
                        </span>
                        <span v-if="row.status === 0 && row.s_type === 0 && row.subscribe_id === id && row.appeal === 0">
                            <span class="iconjinhangzhong" style="color: red"> 待付款</span>
                        </span>
                        <span v-if="row.status === 0 && row.s_type === 0 && row.release_id === id && row.appeal === 0">
                            <span class="iconjinhangzhong"> 待对方付款</span>
                        </span>
                        <span v-if="row.status === 1 && row.s_type === 0 && row.subscribe_id === id && row.appeal === 0">
                            <span class="iconjinhangzhong"> 待卖家放币</span>
                        </span>
                        <span v-if="row.status === 1 && row.s_type === 0 && row.release_id === id && row.appeal === 0">
                            <span class="iconjinhangzhong" style="color: red"> 去放币</span>
                        </span>
                        <span v-if="row.status === 2 || row.status === 8 || row.status === 5">
                            <span class="icontrues"> 已完成</span>
                        </span>
                        <span v-if="row.status === 7 || row.status === 3 || row.status === 4">
                            <span class="iconyiquxiao"> 已取消</span>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('currency.totalPrice')" width="120">
                    <template slot-scope="{row}">
                        <span class="font-green">{{ row.total_price | cutPoint(2) }} CNY</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('currency.unitPrice')" show-overflow-tooltip width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.unit_price | cutPoint(2) }} CNY</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('currency.amount')" show-overflow-tooltip width="120">
                    <template slot-scope="{row}">
                        <div>{{ row.number | cutPoint(row.currency.amt_precision) }} {{ row.currency.ift_name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="交易对象" show-overflow-tooltip width="80">
                    <template slot-scope="{row}">
                        <span class="font-green">{{ row.release_id === $store.getters.id ? row.subscribe_id : row.relUserInfo.id }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('currency.create_time')" width="120">
                    <template slot-scope="{row}">
                        <span>{{ row.create_time|parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('currency.operation')" align="center" width="100">
                    <template slot-scope="{row}">
                        <!--            已完成操作-->
                        <el-button size="mini" v-show="row.status !== 0 && row.status !== 1"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">
                            {{$t('chat.view')}}
                        </el-button>
                        <router-link v-show="row.status === 6" class="nav-user-center-left"
                                        :to="{ name: 'representation', query: { timestamp: new Date().getTime(),id: row.id}, 
                                        params: {tag: 'representation'}}" >
                            <el-button size="mini" type="primary">查看进度</el-button>
                        </router-link>
                        <!--            操作中-->
                        <!--            我买购买单-->
                        <el-button size="small" v-show="row.status === 0 && row.s_type === 0 && row.subscribe_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})"> {{row.appeal !==0 ? view : '待付款'}}
                        </el-button>
                        <!--         我买购买单 :  对方显示-->
                        <el-button size="small" v-show="row.status === 0 && row.s_type === 0 && row.release_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">{{row.appeal !==0 ? view : '待对方付款'}}
                        </el-button>
                        <el-button size="small" v-show="row.status === 0 && row.s_type === 1 && row.release_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">{{row.appeal !==0 ? view : '待付款'}}
                        </el-button>
                        <el-button size="small" v-show="row.status === 0 && row.s_type === 1 && row.subscribe_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">{{row.appeal !==0 ? view : '待对方付款'}}
                        </el-button>
                        <!--            放币操作-->
                        <el-button size="small" v-show="row.status === 1 && row.s_type === 1 && row.subscribe_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">{{row.appeal !==0 ? view : '待放币'}}
                        </el-button>
                        <el-button size="small" v-show="row.status === 1 && row.s_type === 1 && row.release_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">{{row.appeal !==0 ? view : '待对方放币'}}
                        </el-button>
                        <el-button size="small" v-show="row.status === 1 && row.s_type === 0 && row.subscribe_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">{{row.appeal !==0 ? view : '待对方放币'}}
                        </el-button>
                        <el-button size="small" v-show="row.status === 1 && row.s_type === 0 && row.release_id === id"
                                    @click="$router.push({name:'orderInfo', query: {id: row.id}})">{{row.appeal !==0 ? view : '去放币'}}
                        </el-button>
                        <el-button size="small"  v-show="row.status === 0 && row.s_type === 0 && row.subscribe_id === id"
                                    @click="cancelOrder(row.id)" >{{row.appeal !==0 ? view : '取消'}}
                        </el-button>
                        <el-button size="small" v-show="row.status === 0 && row.s_type === 1 && row.release_id === id" 
                                    @click="cancelOrder(row.id)">{{row.appeal !==0 ? view : '取消'}}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="text-align: center" v-if="count > 0">
                <el-pagination @current-change="order" :current-page.sync="listQuery.page"
                                :page-size="listQuery.limit" layout="total, prev, pager, next" :total="count">
                </el-pagination>
            </div>
            <template v-if="!isLoading">
                <div v-if="count===0" class="no-more-tips">{{$t('currency.nothing')}}</div>
            </template>
        </div>
    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions"
    import {mapState} from 'vuex'

    export default {
        name: "dealOrder",
        data() {
            return {
                count: 0,
                view: '查看进度',
                radio: 'BTC',
                listQuery: {
                    status: '',
                    page: 1,
                    limit: 10
                },
                isLoading: true,
                orderStatus: ["进行中", "已完成", "其他", "全部"],
                isActive: 3,
                orderList: [],
                row: {},
                currency_id: '',
            };
        },
        created() {
            this.order(1);
        },
        computed: {
            ...mapState({
                id: state => state.user.userInfo.id
            })
        },
        watch: {
            '$i18n.locale': { //检测中英文切换
                handler: function () {
                    if (this.$i18n.locale === 'zh') {
                        this.orderStatus = ["进行中", "已完成", "其他", "全部"]
                    } else if (this.$i18n.locale === 'en') {
                        this.orderStatus = ["Underway", "Completed", "Other", "All"]
                    }
                },
                immediate: true
            }
        },
        methods: {
            // 取消订单
            async cancelOrder(id) {
                let res = await myFunctions.post('Webc2cOrder/cancel', {id: id});
                if (res) {
                    this.$message.success("取消成功");
                    this.order().catch();
                }
            },
            // 订单状态切换
            selectOrder(index) {
                this.isActive = index;
                this.listQuery.page = 1;
                if (index === 0) { //正在交易中的订单
                    this.listQuery.status = 0;
                    this.order(1);
                }
                if (index === 1) { //已完成的订单
                    this.listQuery.status = 1;
                    this.order(1);
                }
                if (index === 2) { //取消的订单
                    this.listQuery.status = 2;
                    this.order(1);
                }
                if (index === 3) { //全部订单
                    this.listQuery.status = null;
                    this.order(1);
                }
            },
            // 订单列表
            async order() {
                this.isLoading = true;
                let params = {
                    status: this.listQuery.status,
                    page: this.listQuery.page,
                    limit: this.listQuery.limit,
                    currency_id: this.currency_id
                };
                let res = await myFunctions.get('Webc2cOrder/getList', params);
                if (res) {
                    this.isLoading = false;
                    this.count = res.count;
                    this.orderList = res.list;
                    console.log(this.orderList)
                }
            },

            // BTC按钮点击事件
            getBTCList() {
                if (this.isActive === 0) this.listQuery.status = 0;
                if (this.isActive === 1) this.listQuery.status = 1;
                if (this.isActive === 2) this.listQuery.status = 2;
                if (this.isActive === 3) this.listQuery.status = 3;
                this.currency_id = 1
                this.order()
            },

            //USTD按钮点击事件
            getUSDTList() {
                if (this.isActive === 0) this.listQuery.status = 0;
                if (this.isActive === 1) this.listQuery.status = 1;
                if (this.isActive === 2) this.listQuery.status = 2;
                if (this.isActive === 3) this.listQuery.status = 3;
                this.currency_id = 2
                this.listQuery = {status: '', page: 1, limit: 10}
                this.order()
            },

            //币种选择切换按钮
            btnClick() {
                if(this.radio === 'BTC') this.getBTCList()
                else this.getUSDTList()
            }

        }
    };
</script>

<style scoped lang="less">
    @import "../../../styles/common";
    .container{
        display: inline-block;
        margin-top: 30px;
        background: #FFF;
        border: 1px solid #DCDFE6;
        box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%);
        .order-header {
            margin: 15px 0 15px 20px;
            max-width: 1200px;
            display: flex;
            justify-content: space-between;

            &-status {
                flex-wrap: wrap;
                display: flex;
                align-items: center;
                font-size: 16px;

                span {
                    border-bottom: 2px solid transparent;
                    margin-right: 30px;
                    font-weight: 500;
                    display: inline-block;
                    cursor: pointer;
                    padding-bottom: 2px;

                    &.active {
                        color: #357ce1;
                        border-bottom: 2px solid #357ce1;
                    }
                }
            }
        }

        .order-table {
            min-width: 800px;
            max-width: 1200px;
            margin: 0 20px 10px;

            .deal_btn{
                margin-bottom: 10px;
            }
            ::v-deep {
                .el-table {
                    .el-button {
                        margin: 0;
                    }
                    .el-table__empty-block{
                        display: none;
                    }
                }
            }
            .no-more-tips {
                text-align: center;
                margin: 20px 0;
                color: #9aa5b5;
            }
        }
    }
</style>
