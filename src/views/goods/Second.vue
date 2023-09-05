<template>
    <el-row class="row" :gutter="10">
        <el-col :span="18" class="left">
            <div style="background: #C0DEF6;padding: 6px;height: 100%">
                <div style="display: flex;align-items: center">
                    <div style="font-weight: 600">{{ $t('pubGoods.title') }}</div>
                    <el-input v-model="title" style="width: 400px"></el-input>
                </div>
                <div style="margin: 10px 0;display: flex;align-items: center">
                    <div style="display: flex;align-items: center">
                        <div style="font-weight: 600">{{ $t('pubGoods.price') }}</div>
                        <el-input v-model="price" style="width: 150px" @input="limitPrice">
                            <template slot="append">USD</template>
                        </el-input>
                    </div>
                    <div style="margin-left: 10px">
                        <span style="margin-right: 20px">{{ $t('pubGoods.bitcoin') }}{{ (rate.BTC?price/(rate.BTC.usd):0) | cutPoint(5) }}</span>
                        <span>{{ $t('pubGoods.rmb') }}{{ rate.USD?price*rate.USD.cny:0 | cutPoint(2) }}</span>
                        <span style="margin-left: 20px;">{{$t('pubGoods.text1')}}</span>
                    </div>
                </div>
                <ubb-textarea v-model="content" path="goods" ref="textarea" :title="$t('pubGoods.tips2-1')"
                              :idList="idList" :fileList="fileList" :attachList="attachList">
                </ubb-textarea>
            </div>
        </el-col>
        <el-col :span="6" class="right">
            <div class="intro">
                <p style="margin-bottom: 20px">{{ $t('pubGoods.tips1-1') }}</p>
                <p>{{ $t('pubGoods.tips2-2') }}</p>
                <p>{{ $t('pubGoods.tips2-3') }}</p>
                <p>{{ $t('pubGoods.tips2-4') }}</p>
                <p>{{ $t('pubGoods.tips2-5') }}</p>
                <p>{{ $t('pubGoods.tips2-6') }}</p>
                <p>{{ $t('pubGoods.tips2-7') }}</p>
                <p>{{ $t('pubGoods.tips2-8') }}</p>
                <p>{{ $t('pubGoods.tips2-9') }}</p>
                <p style="margin-bottom: 20px">{{ $t('pubGoods.tips2-10') }}</p>
                <p>{{ $t('pubGoods.tips2-11') }}</p>

                <p style="margin-top: 20px">{{ $t('pubGoods.tips4-4') }}</p>
                <p>{{ $t('pubGoods.tips4-5') }}</p>
                <p>{{ $t('pubGoods.tips4-6') }}</p>
                <p>{{ $t('pubGoods.tips4-7') }}</p>
            </div>
        </el-col>
    </el-row>
</template>

<script>
    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "Second",
        components: {ubbTextarea},
        props: {
            info: {
                type: String,
                default: ''
            },
            pri: {
                type: String / Number,
                default: ''
            },
            title_p: String,
            attachLists: Array,
            idLists: Array,
            fileLists: Array,
        },
        data() {
            return {
                title: '',
                content: '',
                price: '',
                rate: {},
                attachList: [],
                idList: [],
                fileList: [],
            }
        },
        watch: {
            title_p(val) {
                this.title = val
            },
            pri(val) {
                this.price = val
            },
            info(val) {
                this.content = val
            },
            attachLists(val) {
                this.attachList = val
            },
            idLists(val) {
                this.idList = val
            },
            fileLists(val) {
                this.fileList = val
            },
        },
        created() {
            this.getRate()
        },
        methods: {
            getRate() {
                this.$http.get('/WebHome/getExchangeRate').then(res => {
                    if (res) this.rate = res
                    console.log(this.rate)
                })
            },

            // 单价限制
            limitPrice(val) {
                this.price = this.$myFunctions.cutPoint(val, 2)
            },
        }
    }
</script>

<style scoped lang="less">
    .row {
        display: flex;
        flex-wrap: nowrap;

        .left {
            height: auto;
        }

        ::v-deep.el-textarea {
            .el-textarea__inner {
                min-height: 326px !important;
            }
        }

        .right {
            .intro {
                height: 100%;
                background: #C2DEF4;
                padding: 10px;
                color: #419cc7
            }
        }
    }
</style>
