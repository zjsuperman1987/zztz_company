<template :data="data">
    <div class="left-flex">
        <!--    上面部分-->
        <div class="main-header">
            <div class="main-top">
                <span class="left iconfont icon-btc"></span>
                <span class="right">{{$t('currency.ID')}}{{ data.sn }}</span>
            </div>
            <el-row class="main-bottom">
                <el-col :span="8">
                    <span class="name">{{$t('currency.orderInfo.total')}}</span>
                    <span class="common price">{{ data.total_price }} CNY</span>
                </el-col>
                <el-col :span="8">
                    <span class="name">{{$t('currency.orderInfo.amount')}}</span>
                    <span class="common">{{ parseFloat(data.number) }} {{ data.currency?data.currency.ift_name:'' }}</span>
                </el-col>
                <el-col :span="8">
                    <span class="name">{{$t('currency.orderInfo.unitPrice')}}</span>
                    <span class="common">{{ data.unit_price }} CNY</span>
                </el-col>
            </el-row>
            <el-divider content-position="left">{{$t('currency.orderInfo.payment')}}</el-divider>
        </div>
        <div class="pay-methods">
            <!--        订单取消隐藏-->
            <div class="middle-hidden" v-if="data.status === 3 || data.status === 4 || data.status === 7">
                <span class="text">{{$t('currency.orderInfo.canceled')}}</span>
            </div>
            <!--              订单完成隐藏-->
            <div class="middle-hidden" v-if="data.status === 2 || data.status === 5 || data.status === 8">
                <span class="text">{{$t('currency.orderInfo.completed')}}</span>
            </div>
        </div>
        <template v-if="payRNB">
            <buyer v-if="use" :data="data" :user="use" @refresh="refresh" ref="buyer"></buyer>
        </template>
        <template v-else>
            <seller :data="data" :user="use" @refresh="refresh" ref="seller"></seller>
        </template>
    </div>
</template>

<script>
    const buyer = () => import('./buyer')
    const seller = () => import('./seller')
    import {mapState} from "vuex";

    export default {
        name: "left",
        props: {
            data: Object,
            payRNB: Boolean,
            use: Object,
        },
        components: {buyer, seller},
        data() {
            return {
                id: this.$route.query.id,
            }
        },
        watch: {
            orderInfo: {
                handler(val) {
                    this.$store.commit('order/SET_orderData', val)
                },
                deep: true
            },
        },
        computed: {
            ...mapState({
                fullName: state => state.user.userInfo.full_name,
                site_static: state => state.site.siteSetting.site_static,
                userID: state => state.user.userInfo.id,
            })
        },
        created() {
            EventBus.$on('o2owsmsg', (e) => {
                //console.log('o2owsmsg',e)
                if(this.payRNB)this.$refs.buyer.Appealmsg(e.content.v)
                else this.$refs.seller.Appealmsg(e.content.v)
            })  // 接收的数据
        },
        methods: {
            refresh() {
                this.$emit('refresh')
            },
        },
    }
</script>

<style scoped lang="less">
    @import "../../../../styles/common";

    .left-flex {
        height: 500px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 10px #888888;

        .pay-methods {
            flex: 1;
        }
    }

    ::v-deep {
        .el-divider {
            margin: 10px 0;
        }
    }

    .main-header {
        .main-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            background: #f2f6fa;

            .left {
                font-size: 20px;
            }

            .right {
                color: @descColor;
                font-size: @fontSize12;
            }
        }

        .main-bottom {
            padding: 15px;

            .name {
                color: @descColor;
            }

            .common {
                font-size: @fontSize18;
                font-weight: bold;
                margin-left: 10px;
            }

            .price {
                color: @unit-price;
            }
        }
    }

    .pay-methods {
        height: 400px;
        padding: 0 20px;

        .middle-show {
            display: flex;
            flex-direction: column;
            height: 100%;

            .middle-top {
                text-align: center;
            }

            .middle-middle {
                flex: 1;
                margin-top: 50px;

                .payment-item {
                    display: flex;
                    align-items: center;

                    &:not(:last-child) {
                        margin-bottom: 20px;
                    }
                }
            }

            .middle-bottom {
                text-align: center;
                margin-bottom: @fontSize12;
            }
        }

        .middle-hidden {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;

            .text {
                font-size: 22px;
                color: @descColor;
            }
        }

        .normal {
            .main-left-warning {
                border-radius: @border-radius;
                font-size: @fontSize12;
                text-align: center;
                height: 28px;
                line-height: 28px;
            }

            .warning {
                border: 1px solid #FFD700;
                background-color: #FFFACD;

                .icon-jinggao {
                    color: #FFD700;
                }
            }

            .info {
                border: 1px solid #DCDFE6;
                background-color: #C0C4CC;
            }

            .tip {
                border: 1px solid #FFD700;
                background-color: #FFFACD;
            }
        }
    }

    .icon-btc:before {
        content: "\e8d5";
    }
</style>
