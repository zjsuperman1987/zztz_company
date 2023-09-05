<template>
    <!-- 普通商品展示栏 -->
    <el-row :gutter="10" class="goods-info">
        <el-col :span="8" v-for="item in goodsInfo" :key="item.id" class="eve">
            <el-card shadow="never">
                <!-- 商品的种类和查看更多 -->
                <div slot="header" class="header" :style="{ background: theme.infoBgC }">
                    <span class="title">{{item.title}}</span>
                    <router-link v-if="item.goods.length > 15"
                                 :to="{ name: 'search',query: { id: item.id, name: item.title } }">{{
                        $t('home.showMoreGoods') }}
                    </router-link>
                </div>

                <!-- 商品的 ID 名字 -->
                <div class="ul-title" v-if="item.goods.length">
                    <div class="ul-title-line" v-for="(it,i) in item.goods" :key="it.tid"
                         :style="{ background: (i+1)%2===1 ? theme.oddBgC : theme.dualBgC }">
                        <el-row>
                            <el-col :span="2" class="left">
                                <span>{{ i+1 }}.</span>
                            </el-col>
                            <el-col :span="22" class="right">
                                <router-link class="title" :to="{ name: 'goods-details',query: { id: it.tid } }">{{
                                    it.title }}
                                </router-link>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <span v-else class="no-more">{{ $t('home.noMoreGoods') }}</span>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "GoodsInfo",
        data() {
            return {
                goodsInfo: [],
            }
        },
        created() {
            this.getGoodsInfo()
        },
        computed: {
            ...mapState({
                theme: state => state.settings.theme,
            })
        },
        methods: {
            getGoodsInfo() {
                this.$http.get('/WebHome/getData').then(res => {
                    if (res) for (let prop of res) {
                        if(prop.goods.length != 0) this.goodsInfo.push(prop)
                    }
                })
            },
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common";

    .goods-info {
        display: flex;
        flex-wrap: wrap;

        .eve {
            margin-bottom: 6px;
        }

        ::v-deep .el-card {
            border-radius: 0;
            border: 1px solid #888;
            box-shadow: 2px 2px 2px -1px black;
            height: 100%;

            .header {
                padding: 5px 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;

                a {
                    color: #2E86C1;
                }

                .title {
                    color: #000;
                    font-weight: 600;
                }
            }

            .ul-title-line {
                .el-row {
                    display: flex;
                    flex-wrap: wrap;

                    .left {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-right: 1px solid;
                    }

                    .right {
                        padding: 4px 0 4px 10px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                .title {
                    line-height: 0;
                }

                &:nth-child(odd) {
                    background: rgba(195, 195, 195, 0.25);
                }
            }

            .el-card__header {
                background: #C6D3AF;
                padding: 0;
            }

            .el-card__body {
                border: 1px solid #bbb;
                padding: 0;
                margin: 5px;

                .no-more {
                    padding: 4px;
                    display: inline-block;
                    opacity: .6;
                }
            }
        }
    }
</style>
