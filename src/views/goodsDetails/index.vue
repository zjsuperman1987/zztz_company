<template>
    <div class="section">
        <div class="title">
            <div class="left" :style="{ background: theme.titleLeftBgC }">
                <span @click="$router.push({ name: 'search',query: { id: data.ea, name: data.ea_title } })">{{ data.ea_title }}</span>
            </div>
            <div class="right" :style="{ background: theme.titleRightBgC }" @click="titleRef">{{ data.title }}</div>
        </div>
        <div class="row">
            <ul class="left" :style="{ background: theme.tableBgC }">
                <li><span class="info_title">{{ $t('goodsDetails.id') }}</span><span class="info_data">{{data.tid}}</span></li>
                <li><span class="info_title">{{ $t('goodsDetails.price') }}</span><span class="info_data priceColor">{{data.usdprice}}</span></li>
                <li><span class="info_title">{{ $t('goodsDetails.btc') }}</span><span class="info_data width">{{ currentBTC * data.usdprice | cutPoint(8)}}</span></li>

                <li><span class="info_title">{{ $t('goodsDetails.seller') }}</span>
                    <span class="info_data width">
                            <router-link v-if="isAdm" style="color: #E3EF71"
                                        :to="{ name: 'userDetails', query: { id: data.uid } }">{{ data.uid }}
                        </router-link>
                        <span v-else>{{ data.uid }}</span>
                    </span>
                </li>
                <li><span class="info_title">{{ $t('goodsDetails.ctime') }}</span><span class="info_data">{{ data.cretime }}</span></li>
                <li><span class="info_title">{{ $t('goodsDetails.usdt') }}</span><span class="info_data width">{{ currentUSDT * data.usdprice | cutPoint(4) }}</span></li>
                <li><span class="info_title">{{ $t('goodsDetails.volume') }}</span><span class="info_data">{{ data.sells_volume }}</span></li>
                <li><span class="info_title">{{ $t('goodsDetails.gmv') }}</span><span class="info_data">{{ data.sells_amount }}</span></li>
                
                <li><span class="info_title">{{ $t('goodsDetails.hot') }}</span><span class="info_data">{{ data.read_num }}</span></li>
                <li><span class="info_title">{{ $t('goodsDetails.lastOnline') }}</span><span class="info_data ">{{ data.last_online }}</span></li>
                <li>
                    <span class="info_title">{{ $t('goodsDetails.goodsStatus') }}</span>
                    <span class="info_data" :style="{ color: data.down ? '#B23535' : '' }">{{ data.down ? '已下架' : '正常' }}</span>
                </li>
                <li>
                    <span class="info_title"> {{ $t('goodsDetails.deposit') }}</span>
                    <span  class="info_data width">
                        <!-- 卖家 -->
                        <el-button v-if="seller" type="text" size="mini" @click="deposit"
                                    style="padding: 1px 6px;color: #1421DB">
                            {{ depositNumber }}
                        </el-button>
                        <!-- 买家和管理员 -->
                        <template v-if="buyer || isAdm">
                            <span>
                                {{ depositBuy }}
                            </span>
                        </template>
                    </span>
                </li>
            </ul>
            <div class="right" :style="{ background: theme.actionsBgC }">
                <!--        购买者-->
                <op-buyer :currentBTC="currentBTC" :currentUSDT="currentUSDT" :data="data"
                          v-if="uid !== data.uid && !isAdm" :isPayStatus="payStatus"
                          @refreshInfo="refreshInfo"></op-buyer>
                <!--        出售者-->
                <op-seller v-if="uid === data.uid && !isAdm" @change="getDetailsInfo()"></op-seller>
                <!--        管理者-->
                <op-admin v-if="isAdm" @change="getDetailsInfo()"></op-admin>
            </div>
        </div>

        <div class="tabs" :style="{ background: theme.tagsBgC }" style="justify-content: space-between">
            <!-- 管理员 -->
            <div v-if="isAdm">
                <template v-for="(item,index) in tabsList">
                    <el-button  :key="index" type="text" class="eve" @click="changeTabs(item)"
                               v-if="item.id !==4 && ( (!data.public_comments && item.id !== 5) || data.public_comments )"
                               :style="{ backgroundColor: activeTab === item.name ? '#687071' : '' }">
                        <span class="tabs-item">{{ item.label }}</span>
                    </el-button>
                </template>
            </div>
            <div v-if="!isAdm && data.uid === uid">
                <template v-for="(item,index) in tabsList" >
                    <!--出售者-->
                    <el-button :key="index" type="text" class="eve" @click="changeTabs(item)"
                                v-if="!isAdm && data.uid === uid && item.id !==4
                                && ( (!data.public_comments && item.id !== 5) || data.public_comments )"
                                :style="{ backgroundColor: activeTab === item.name ? '#687071' : '' }">
                        <span class="tabs-item">{{ item.label }}</span>
                    </el-button>
                </template>
            </div>
            <div v-if="!isAdm && data.uid !== uid">
                <template v-for="(item,index) in tabsList">
                    <!--出售者-->
                    <el-button :key="index" type="text" class="eve" @click="changeTabs(item)"
                               v-if="!isAdm && data.uid !== uid && item.id !==3 &&
                   ( (!data.public_comments && item.id !== 5) || data.public_comments ) &&
                   ((data.is_sell && item.id !== 4) || (!data.is_sell && item.id !== 2))"
                               :style="{ backgroundColor: activeTab === item.name ? '#687071' : '' }">
                        <span class="tabs-item">{{ item.label }}</span>
                    </el-button>
                </template>
            </div>
            <div>
                <el-button size="small" type="primary" @click="refreshPage">{{$t('button.refresh')}}</el-button>
            </div>
        </div>

        <div style="padding: 4px;background: #d8d8d8">
            <component :is="activeTab"></component>
        </div>

        <el-dialog :title="$t('goodsDetails.deposit')" :visible.sync="depositVisible"
                   custom-class="width500" :close-on-click-modal="false" v-dialog-drag>
            <!--      卖家-->
            <div v-if="data.uid === uid && !isAdm" class="seller">
                <div style="margin-bottom: 6px;">
                    <span>{{$t('goodsDetails.BTCBalance')}}: {{ balanceBTC }}</span>
                    <span style="margin-left: 20px;">{{$t('goodsDetails.USDTBalance')}}: {{ balanceUSDT }}</span>
                </div>
                <div class="button item">
                    <span>{{ $t('goodsDetails.desDeposit', { deposit: data.security_deposit }) }} {{ currency_type }}</span>
                    <el-button v-if="parseFloat(data.security_deposit)" size="small"
                               type="primary" @click="confirmDeposit(1)">{{ $t('goodsDetails.recall') }}
                    </el-button>
                </div>
                <p class="item">{{ $t('goodsDetails.showToBuyer') }}</p>
                <div class="item">
                    <span>{{ $t('goodsDetails.inProgress', { num: transferDetail.order_progress }) }}</span>
                    <span class="amount">{{ $t('goodsDetails.total', { num: transferDetail.order_progress_amount }) }}</span>
                </div>
                <div class="item">
                    <span>{{ $t('goodsDetails.complete', { num: transferDetail.order_complete }) }}</span>
                    <span class="amount">{{ $t('goodsDetails.total', { num: transferDetail.order_complete_amount }) }}</span>
                </div>
                <div class="select_box">
                    <span class="title">付款方式:</span>
                    <el-radio-group v-model="radio" size="mini">
                        <el-radio-button class="btn" label="1" border>BTC</el-radio-button>
                        <el-radio-button class="btn" label="2" border>USDT</el-radio-button>
                    </el-radio-group>
                </div>
                <div class="item" style="display: flex">
                    <el-input size="small" style="width: 160px" v-model="depositValue" @input="limitPrice">
                    </el-input>
                    <el-button size="mini" style="margin-left: 10px" type="primary"
                               @click="confirmDeposit(0)">{{ $t('goodsDetails.add') }}
                    </el-button>
                </div>
                <div>
                    折合USD：<span>{{ getUSD | cutPoint(2) }}</span>
                </div>

                <el-alert title="无" type="warning" :closable="false" style="text-align: left;">
                    <template slot='title'>
                        <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}</div>
                        <div>{{ $t('goodsDetails.desDeposit1') }}</div>
                        <div>{{ $t('goodsDetails.desDeposit2') }}</div>
                        <div>{{ $t('goodsDetails.desDeposit3', { num: transferDetail.refund_rate }) }}</div>
                    </template>
                </el-alert>

            </div>
            <!--      买家/管理员-->
            <div v-if="(data.uid !== uid && !isAdm) || isAdm" class="seller">
                <p class="item">{{ $t('goodsDetails.adm.desDeposit', { deposit: data.security_deposit }) }} BTC</p>
                <div class="item">
                    <span>{{ $t('goodsDetails.adm.usd', { num: transferDetail.security_deposit_usd }) }}</span>
                    <span class="amount">{{ $t('goodsDetails.adm.rmb', { num: transferDetail.security_deposit_cny }) }}</span>
                </div>
                <div class="item">
                    <span>{{ $t('goodsDetails.inProgress', { num: transferDetail.order_progress }) }}</span>
                    <span class="amount">{{ $t('goodsDetails.total', { num: transferDetail.order_progress_amount }) }}</span>
                </div>
                <div class="item">
                    <span>{{ $t('goodsDetails.complete', { num: transferDetail.order_complete }) }}</span>
                    <span class="amount">{{ $t('goodsDetails.total', { num: transferDetail.order_complete_amount }) }}</span>
                </div>

                <el-alert title="无" type="warning" :closable="false" style="text-align: left;">
                    <template slot='title'>
                        <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}</div>
                        <div>{{ $t('goodsDetails.adm.des1') }}</div>
                        <div>{{ $t('goodsDetails.adm.des2') }}</div>
                    </template>
                </el-alert>
            </div>
            <span slot="footer">
        <el-button v-if="seller" size="small" @click="depositVisible = false">{{ $t('button.cancelDeposit') }}</el-button>
        <el-button v-else size="small" @click="depositVisible = false">{{ $t('button.close') }}</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from "@/utils/myFunctions";

    import opBuyer from './operations/buyer'
    import opSeller from './operations/seller'
    import opAdmin from './operations/admin'

    import goodsInfo from './goodsInfo/index'
    import orderList from './orderList/index'
    import consultList from './consulting/index'
    import publicComment from './PublicComment'
    import buyer from './consulting/buyer'

    export default {
        name: "goodsDetails",
        components: {
            opBuyer, opAdmin, opSeller,
            goodsInfo, orderList, publicComment, buyer, consultList,
        },
        data() {
            return {
                radio: '1', //货币类型
                id: this.$route.query.id,
                pay: {
                    num: 1,
                    payPassword: '',
                },
                data: {},
                num: 1,
                subLoading: false,
                fullLoading: false,
                depositVisible: false,
                depositValue: '',
                transferDetail: {},
                rate: {},
                currentBTC: '',
                currentUSDT: '',
                currency_type: '',
                balanceBTC: 0,
                balanceUSDT: 0,
                currentRate: 0,
                balanceList: [],
                red: 'blue',
                black: 'black'
            }
        },
        created() {
            this.getDetailsInfo()
            this.getPayStatus()
            this.nowRateDown()
            console.log(this.activeTab)
        },
        beforeDestroy() {
            this.fullLoading = false
            this.$store.commit('goods/changeTab', 'goodsInfo')
        },
        computed: {
            tabsList() {
                return [
                    {id: 1, label: this.$t('goodsDetails.info'), name: 'goodsInfo'},
                    {id: 2, label: this.$t('goodsDetails.order'), name: 'orderList'},
                    {id: 3, label: this.$t('goodsDetails.consult'), name: 'consultList'},
                    {id: 4, label: this.$t('goodsDetails.consulting',), name: 'buyer'},
                    {id: 5, label: this.$t('goodsDetails.publicComment'), name: 'publicComment'},
                ]
            },
            buyer() {
                return this.data.uid !== this.uid
            },
            seller() {
                return this.data.uid === this.uid
            },
            totalPrice() {
                return this.pay.num * this.data.usdprice
            },
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            getUSD() {
                if (this.radio === '1') return myFunctions.cutPoint(this.depositValue * this.currentRate)
                if (this.radio === '2') return myFunctions.cutPoint(this.depositValue * this.currentUSDT)
            },
            depositNumber() {
                if (this.data.security_deposit_currency_id === 0) return '增加'
                else return this.data.security_deposit + ' ' + this.data.security_deposit_currency_name
            },
            depositBuy() {
                if (this.data.security_deposit_currency_id === 0) return 0
                else return this.data.security_deposit + ' ' + this.data.security_deposit_currency_name
            },
            ...mapState({
                uid: state => state.user.userInfo.id,
                activeTab: state => state.goods.activeTab,
                token: state => state.user.token,
                refresh: state => state.goods.refreshInfo,
                theme: state => state.settings.theme,
                balance: state => state.user.userInfo.balance,
                payStatus: state => state.user.payStatus,
                goodsInfo: state => state.goods.goodsInfo,
            }),
        },
        watch: {
            refresh(val) {
                if (val) this.getDetailsInfo(val)
            },
            radio: {
                handler(val) {
                    if (val == 1) {
                        this.currency_type = 'BTC'
                    } else this.currency_type = 'USDT'
                },
                deep: true,
                immediate: true
            },
        },
        methods: {

            // 获取国际BTC货币当前汇率
            async nowRateDown() {
                this.loading = true;
                let res = await myFunctions.get('WebHome/getExchangeRate');
                if (res) {
                    this.currentBTC = (1 / res.BTC.usd)
                    this.currentUSDT = (1 / res.USDT.usd)
                    this.currentRate = res.BTC.usd
                }
            },

            getDetailsInfo(post_id) {
                this.fullLoading = true
                this.$http.get('/WebGoods/read', {params: {id: this.id, post_id}}).then(res => {
                    if (res) {
                        this.data = res
                        console.log(res)
                        this.$store.commit('goods/SET_goodsInfo', res)
                    }
                    this.fullLoading = false
                }).catch(() => {
                    this.fullLoading = false
                })
            },

            // 单价限制
            limitPrice(val) {
                this.depositValue = this.$myFunctions.cutPoint(val, 5)
            },

            titleRef() {
                this.getDetailsInfo()
                this.$store.commit('goods/refreshInfo')
            },

            changeTabs(item) {
                this.$store.commit('goods/changeTab', item.name)
            },

            //增加保证金弹框
            deposit() {
                this.getTransferDetail(this.data.tid)
                this.getBalance()
                this.depositVisible = true
            },
            getTransferDetail(id) {
                this.$http.get('/WebGoods/transfer_detail', {params: {id}}).then(res => {
                    if (res) this.transferDetail = res
                })
            },
            //保证金提交
            confirmDeposit(type) {  //type为1 是撤回保证金, type为0 是提交保证金
                if ((this.data.uid === this.uid) && !this.isAdm) {
                    let params = {
                        id: this.data.tid,
                        type,
                        currency_id: this.radio,
                        amount: this.depositValue
                    }
                    this.$http('/WebMyGoods/securityDeposit', {method: 'post', params}).then(res => {
                        if (res) {
                            this.getDetailsInfo()
                            this.$message.success(this.$t('$message.success'))
                            this.depositVisible = false
                        }
                    })
                }
            },

            getPayStatus() {
                if (!this.token) return;
                if (this.isAdm) return;
                this.$store.dispatch('user/getPayStatus')
            },

            refreshInfo() {
                this.getDetailsInfo()
                this.getPayStatus()
            },

            refreshPage() {
                this.$store.commit('goods/refresh', new Date().getTime())
            },

            //获取币种余额
            async getBalance() {
                let res = await myFunctions.get('WebMyRecharge/currencyBalance', {page: 1, limit: 10})
                if(res){
                    if (res.total === 1) return this.balanceBTC = parseFloat(res.data[0].balance)
                    if (res.total === 2) {
                        this.balanceUSDT = parseFloat(res.data[0].balance)
                        this.balanceBTC = parseFloat(res.data[1].balance)
                    }
                }
            },

            
        },

    }
</script>

<style scoped lang="less">
    @import "../../styles/common";
    // 屏幕小于1010隐藏
    @media screen and (max-width: 1010px) {
        .lg-show {
            display: none;
        }
    }

    @media screen and (min-width: 0px) and (max-width: 1009px) {
        .sm-show {
            display: block !important;
        }
    }

    .section {
        max-width: @maxWidth;
        min-width: @minWidth;
        margin: 0 auto;
        height: 100%;
        padding: 20px;

        .title {
            display: flex;
            align-items: center;

            .left, .right {
                padding: 4px;
                min-height: 29px;
            }

            .left {
                width: 15%;
                background: #d0e0e3;

                span {
                    cursor: pointer;
                    font-size: 16px;

                    &:hover {
                        color: #409EFF;
                    }
                }
            }

            .right {
                display: flex;
                align-items: center;
                width: 90%;
                background: #A5D9E3;
                font-size: 16px;
                cursor: pointer;
            }
        }
        /deep/ 
        .row {
            display: flex;
            background: #3c648c;
            padding: 2px;
            .left {
                width: 55%;
                background: #B6C4C7;
                padding: 5px 2px 5px 8px;
                margin: 5px 3px 5px 5px;
                border: 1px solid #999;
                li{
                    list-style: none;
                    display: inline-block;
                    line-height: 18px;
                    width: 200px;
                    margin-right: 3px;
                    .info_title {
                        width: 80px;
                        border: 1px solid #FFF;
                        background: #ADC8DE;
                        padding: 1px;
                        padding-left: 5px;
                    }
                    .info_data {
                        text-align: left;
                        border: 1px solid #fff;
                        width: 120px;
                        background: #77A5B1;
                        padding: 1px 1px 1px 3px;
                    }
                    .priceColor{
                        color:#b3007d;
                    }
                    .width {
                        width: 120px;
                    }
                    .textBtn{
                        color: #fff;
                    }
                    span {
                        display: inline-block;
                        box-sizing: border-box;
                    }
                }
            }

            .right {
                width: 45%;
                background: #9CA8AA;
                margin-left: 10px;
            }
        }

        .tabs {
            padding: 4px;
            background: #0086b3;
            display: flex;

            .el-button {
                border: 1px solid #fff;
                margin-right: 10px;
            }

            .tabs-item {
                color: #fff;
            }
        }
    }

    ::v-deep {
        .width500 {
            .seller {
                .item {
                    margin-bottom: 6px;

                    .amount {
                        margin-left: 20px;
                    }
                }
                .select_box{
                    margin-bottom: 6px;
                    .title{
                        margin-right: 10px;
                        display: inline-block;
                    }
                    .el-radio-button__inner{
                        padding: 2px 10px;
                    }
                }

                .button {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            }
        }
    }

</style>
