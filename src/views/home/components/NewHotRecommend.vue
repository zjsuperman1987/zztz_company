<template>
    <div class="content">
        <!--商品栏-->
        <div class="hot-box">

            <good-item :list="hotList" search="search" :path="goodsPath" title="最新成交商品" index="2"></good-item>
            <good-item :list="newList" search="search" :path="goodsPath" title="最新发布商品" index="0"></good-item>
            <good-item :list="recommendList" search="search"  :path="goodsPath" title="推荐商品" index="2"></good-item>
        </div>
        <!--分割线标签-->
        <el-divider></el-divider>
        <!--其它栏-->
        <div class="hot-box">
            <good-item v-if="guaranteeList" :list="guaranteeList" search="guaranteeSearch" :path="guaranteePath" title="担保市场" index="0"></good-item>
            <currency :getList="currency" title="法币交易" index="1"></currency>
            <good-item :list="notice" search="more-information" :path="noticePath" title="网站公告" index="1"></good-item>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import myFunctions from '@/utils/myFunctions';
    const goodItem = () => import('./goodItem')
    const currency = () => import('./currency')
    export default {
        name: "NewHotRecommend",
        components: { goodItem, currency},
        data() {
            return {
                currentList: [],
                newList: {},
                hotList: {},
                recommendList: {},
                notice: {},
                currency: [],  //法币数据
                goodsPath: 'goods-details',  //商品详情path
                noticePath: 'notice-details', //咨询详情path
                guaranteePath: 'personal/join-guarantee', //担保详情path
                guaranteeList: {},  //担保
            }
        },
        created() {
            this.getCurrent()
            this.getNotice()
            this.getGuarantee()
        },
        computed: {
            ...mapState({
                theme: state => state.settings.theme,
            })
        },
        methods: {
            getCurrent() {
                this.$http.get('/WebHome/getHome').then(res => {
                    this.newList = res[0]
                    this.hotList = res[1]
                    this.recommendList = res[2]
                    res[0].title = this.$t('newHot.new')
                    res[1].title = this.$t('newHot.hot')
                    res[2].title = this.$t('newHot.recommend')
                    if (res) this.currentList = res
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
            },
            //获取公告
            async getNotice() {
                let res =await myFunctions.get('/WebArticle', {limit:20,page:1})
                    if (res)  this.notice = res
            },

            //获取首页担保列表
            async getGuarantee() {
                let params = {limit: 20, page: 1,status: 1}
                let res =await myFunctions.get('/WebHome/getGuarantee', params)
                this.guaranteeList = res
            },
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common.less";

    /deep/.el-divider--horizontal{
        margin: 5px 0;
        background-color: #1b2945;
    }
    .hot-box{
        display: flex;
        justify-content: space-between;
    }
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
                color: @blue;
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
                    color: @aHover;
                }
            }
        }
    }
</style>
