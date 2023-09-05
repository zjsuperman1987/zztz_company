<template>
    <el-row :gutter="10" class="row">
        <el-col :span="8" v-for="(item,index) in currentList" :key="index">
            <div class="card">
                <!--商品栏标题 和 查看更多-->
                <div class="header" :style="{ background: bkColor(index) }">
                    <span class="title">{{item.title}}</span>
                    <router-link v-if="item.children>= 15"
                                 :to="{ name: 'guaranteeSearch',query: { sort: item.sort } }">{{ $t('home.showMoreGoods') }}
                    </router-link>
                </div>
                <!-- 商品详情 ID 名字 -->
                <div class="ul-title" v-if="item.children">
                    <div class="ul-title-line" v-for="(it,i) in item.children" :key="it.tid"
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
                <div class="ul-title" v-else>
                    <div style="text-align: center;opacity: .5;font-size: 14px">{{ $t('home.noMoreGoods') }}</div>
                </div>
            </div>
        </el-col>
    </el-row>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "Guarantee",
        data() {
            return {
                currentList: [{title: '商品交易'},{title: '担保市场'},{title: '法币交易'}],
            }
        },
        created() {
            this.getCurrent()
        },
        computed: {
            ...mapState({
                theme: state => state.settings.theme,
            })
        },
        methods: {
            getCurrent() {
                this.$http.get('/WebHome/getHome').then(res => {

                    if (res) this.currentList = res
                    console.log(res)
                })
            },
            bkColor(i) {
                switch (i) {
                    case 0:
                        return this.theme.newBgC || 'rgb(249,205,173)'
                    case 1:
                        return this.theme.hotBgC || 'rgb(200,200,169)'
                    case 2:
                        return this.theme.reBgC || 'rgb(131,175,155)'
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .row {
        display: flex;
        flex-wrap: wrap;
    }

    .card {
        border-radius: 0;
        border: 1px solid #888;
        box-shadow: 2px 2px 2px -1px black;
        height: 100%;
        background: #fff;

        .header {
            padding: 5px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            a {
                color: blue;
            }

            .title {
                color: #000;
                font-weight: 600;
            }
        }

        .ul-title {
            border: 1px solid #bbb;
            padding: 0;
            margin: 5px;
            height: calc(100% - 36px);

            &-line {
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

                &:nth-child(odd) {
                    background: rgba(178, 200, 187, .7);
                }
            }

            .title {
                line-height: 0;
                cursor: pointer;

                &:hover {
                    color: yellow;
                }
            }
        }
    }
</style>