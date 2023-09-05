<template>
    <div class="main-container">
        <div class="main-container-content" :style="{ background: theme.contentBgC }">
            <div>
                <!--快捷导航 热门分类-->
                <sort-tag></sort-tag>

                <!--中部广告栏-->
                <ad :adList="middleAdData" :min_height="min_height" :maxNum="maxNum" :minNum="minNum" :interval="time"></ad>

                <!--热销商品展示栏-->
                <hot-new-recommend></hot-new-recommend>

                <!--分割线标签-->
                <!-- <el-divider></el-divider> -->

                <!--普通商品展示栏-->
                <!-- <goods-info></goods-info> -->

                <!-- 服务告知 -->
                <div class="nav-foot">
                    <div class="text" :style="{ background: theme.footerBgC }">
                        {{ $t('home.footer') }}
                    </div>
                </div>
            </div>

        </div>

        <el-dialog :title="$t('home.agreement')" :visible.sync="dialogAgreement"
                   v-dialogDrag width="30%" :close-on-click-modal="false">
            <span>网站提示信息</span>
            <h1>本网站未经过任何的账户保护机制审核, 不通过电话, 邮件等核对用户身份, 也去除了Telegram的账户验证机制. 方便了用户的使用, 同时, 也存在匿名环境下的风险. 请您务必重视, 本环境下, 任何人都可以轻松的注册一个账号,  所以, 您在本站的任何行为, 必须用心防止对方对您实行欺诈! 您点击同意, 则表示您已经阅读本信息, 了解知悉其中的风险.</h1>
            <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleRD">{{ $t('home.yes') }}</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
import myFunctions from '@/utils/myFunctions';
    import {mapState} from "vuex";
    const hotNewRecommend = () => import('./components/NewHotRecommend')
    const ad = () => import('@/components/ad/advertisement')
    const sortTag = () => import('./components/SortTag')
    export default {
        name: 'home',
        components: {hotNewRecommend, sortTag, ad},
        data() {
            return {
                classification: true,     //展示分类与否控制
                dialogAgreement: false,

                topList: [],
                colorList: [
                    '#22DAA7', '#76E96B', '#E2687A',
                    '#46D13D', '#BFDA4E', '#310C52',
                    '#27C92F', '#2F4DD6', '#A74AD0'
                ],  //主题色彩
                middleAdData: {}, //中部广告数据
                min_height: '16px',
                maxNum: 999,
                minNum: 6,
                time: 1000,
            }
        },
        computed: {
            ...mapState({
                agreement: state => state.user.userInfo.rd,  // 是否同意
                token: state => state.user.token,
                isAdm: state => state.user.userInfo.is_adm,
                theme: state => state.settings.theme,
            })
        },
        watch: {
            agreement: {
                handler(v) {
                    if (this.token && v === 0) {
                        setTimeout(() => {
                            this.dialogAgreement = true
                        }, 1500)
                    }
                },
                immediate: true
            }
        },
        mounted() {
            this.getAdList(1)
        },
        methods: {
            handleRD() {
                this.$http('/WebUser/update', {method: 'post', params: {rd: 1}}).then(res => {
                    if (res) {
                        this.$store.dispatch('user/getInfo')
                        this.dialogAgreement = false
                    }
                })
            },

            //获取广告数据
            async getAdList(type) {
                let res = await myFunctions.get('/WebAdv', {type: type})
                if (res) this.middleAdData = res
            },
        },
    };
</script>

<style scoped lang="less">
    @import "~@/styles/home.less";
    @import "~@/styles/common.less";

    .nav-foot {
        font-size: 14px;
        margin: auto;
        padding: 5px 0 0;

        .serve {
            .img-icon {
                text-align: center;

                .icon {
                    padding: 10px 0;

                    a {
                        font-size: 26px;
                        color: @descColor;

                        &:hover {
                            color: @aHover;
                        }
                    }
                }
            }

            .common {
                text-align: center;

                .title {
                    font-size: @fontSize18;
                    padding-bottom: 20px;
                    font-weight: 600;
                }

                a {
                    color: @aColor;
                    line-height: 26px;

                    &:hover {
                        color: @aHover;
                    }
                }
            }
        }
    }
</style>
