<template>
    <el-row class="row" :gutter="10">
        <el-col :span="18">
            <div style="background: #C0DEF6;padding: 6px">
                <ubb-textarea v-model="content" path="goods" ref="textarea" :title="$t('pubGoods.tips3-1')"
                              :idList="idList" :fileList="fileList" :attachList="attachList">
                </ubb-textarea>
                <el-alert title="无" type="success" :closable="false" style="text-align: left;margin-top: 10px">
                    <template slot='title'>
                        <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}</div>
                        <div>{{ $t('pubGoods.tips3-2') }}</div>
                        <div>{{ $t('pubGoods.tips3-3') }}</div>
                        <div>{{ $t('pubGoods.tips3-4') }}</div>
                    </template>
                </el-alert>
            </div>
        </el-col>
        <el-col :span="6" class="right">
            <div class="intro">
                <p style="margin-bottom: 20px">{{ $t('pubGoods.tips1-1') }}</p>
                <p>{{ $t('pubGoods.tips3-5') }}</p>
                <p>{{ $t('pubGoods.tips3-6') }}</p>
                <p>{{ $t('pubGoods.tips3-7') }}</p>
                <p>{{ $t('pubGoods.tips3-8') }}</p>
            </div>
        </el-col>
    </el-row>
</template>

<script>
    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "Third",
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
            attachLists: Array,
            idLists: Array,
            fileLists: Array,
        },
        data() {
            return {
                price: '',
                content: '',
                attachList: [],
                idList: [],
                fileList: [],
                rate: {},
            }
        },
        watch: {
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

        .goods-form {
            &-title {
                padding: 6px 10px;
                background: #d0e0e3;
            }

            &-content {
                background: #B8C8D8;
                padding: 10px 10px 0 10px;

                .nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .tags {
                    min-height: 500px;
                    background: #9DC9F0;
                    padding: 10px;
                    border: 1px solid #000;
                    margin-bottom: 0
                }
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
