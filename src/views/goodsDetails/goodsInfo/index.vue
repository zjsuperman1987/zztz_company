<template>
    <div v-loading="fullLoading">
        <div class="goods-info">
            <p class="intro" :style="{ background: theme.infoNavBgC }">
                <span class="left">{{ $t('goodsDetails.info1') }}</span>
                <span style="margin-left: 20px" :style="{ color: refresh ? '#BE4831' : '' }">
          {{ refresh ? $t('goodsDetails.desInfo1-2') : $t('goodsDetails.desInfo1-1') }}</span>
            </p>
            <div class="info" v-viewer :style="{ background: theme.introBgC }">
                <span v-if="detail.post" v-html="detail.post.contents"></span>
            </div>
        </div>

        <div v-if="goodsInfo.is_sell" class="goods-after">

            <p class="intro" :style="{ background: theme.infoNavBgC }">
                <span class="left">{{ $t('goodsDetails.info2') }}</span>
                <span style="margin-left: 20px" :style="{ color: refresh ? '#BE4831' : '' }">
          {{ refresh ? $t('goodsDetails.desInfo2-1') : $t('goodsDetails.desInfo2-2') }}</span>
            </p>

            <div class="info" v-viewer :style="{ background: theme.afterSalesBgC }">
                <div v-for="item of detail.after_sales" :key="item.pid" class="eve">
                    <div class="left-af" :style="{ background: theme.afterTimeBgC }">{{ item.ctime }}</div>
                    <div class="right-af" v-html="item.contents" :style="{ background: theme.afterContentBgC }"></div>
                </div>
            </div>
        </div>

        <div class="tips">
            <div class="tips-details" :style="{ background: theme.serviceBgC }">
                <p>{{ $t('goodsDetails.service') }}</p>
                <p>{{ $t('goodsDetails.service1') }}</p>
                <p>{{ $t('goodsDetails.service2') }}</p>
                <p>{{ $t('goodsDetails.service3') }}</p>
            </div>
        </div>

    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "GoodsInfo",
        data() {
            return {
                id: this.$route.query.id,
                fullLoading: false,
            }
        },
        computed: {
            ...mapState({
                goodsInfo: state => state.goods.goodsInfo,
                detail: state => state.goods.details,
                refresh: state => state.goods.refreshInfo,
                theme: state => state.settings.theme,
                refreshValue: state => state.goods.refreshValue,
            })
        },
        created() {
            this.getInformation()
        },
        watch: {
            refreshValue() {
                this.getInformation()
            }
        },
        methods: {
            getInformation() {
                this.fullLoading = true
                this.$http.get('/WebGoods/detail', {params: {id: this.id}}).then(res => {
                    if (res) this.$store.commit('goods/SET_DETAILS', res)
                    this.fullLoading = false
                }).catch(() => {this.fullLoading = false})
            },
        }
    }
</script>

<style scoped lang="less">
    .intro {
        padding: 4px;
        background: #9bf0d6;

        .left {
            font-weight: 600;
            font-size: 14px;
        }
    }

    .goods-info {
        .info {
            padding: 4px;
            min-height: 300px;
            background: #C0DEF6;
        }
    }

    .goods-after {
        .info {
            min-height: 200px;
            padding: 4px;
            background: #a6c0d4;
        }

        .eve {
            display: flex;
            /*justify-content: space-between;*/
            /*align-items: center;*/
            flex-wrap: nowrap;

            .left-af {
                background: #c6d7e5;
                padding: 4px;
                min-width: 110px;
            }

            .right-af {
                background: #9dc8ea;
                padding: 4px;
                width: 100%;
                max-height: 200px;
                overflow: auto;
            }

            &:not(:last-child) {
                margin-bottom: 4px;
            }
        }
    }

    .tips {
        padding: 4px;
        background: #0086b3;

        &-details {
            padding: 4px;
            background: #F4F5F6;
        }
    }
</style>
