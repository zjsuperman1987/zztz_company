<template>
    <div>
        <el-row class="row" :gutter="10">
            <el-col :span="18" class="left">
                <div style="background: #B8C8D8;height: 100%">
                    <el-form size="small" label-width="70px" class="goods-form" :model="goodsDetails">
                        <div class="goods-form-content">
                            <div class="nav">
                                <span>{{ $t('pubGoods.sort') }}</span>
                                <el-button type="primary" icon="el-icon-plus" @click="dialogSort = true">{{
                                    $t('pubGoods.new') }}
                                </el-button>
                            </div>
                            <el-form-item class="tags" prop="ea" label-width="0">
                                <el-radio-group v-model="goodsDetails.ea" size="mini">
                                    <el-radio v-for="item in options" :key="item.value" :label="item.value" border>{{
                                        item.label }}
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <page-nation
                                    :total="total"
                                    layout="prev, pager, next, jumper"
                                    :page.sync="listQuery.page"
                                    :limit.sync="listQuery.limit"
                                    @pagination="getSortTag"
                                    :page-size="listQuery.limit"
                            />
                        </div>
                    </el-form>
                    <div style="text-align: center" v-if="(release && !trade_end_time && !isAdm) || !token " class="no-pass">
                        您未激活交易权限或权限已过期, 请点此<span @click="visible = true"> 激活 </span>交易权限
                    </div>
                </div>
                
            </el-col>
            <el-col :span="6" class="right">
                <div class="intro">
                    <p style="margin-bottom: 20px">{{ $t('pubGoods.tips1-1') }}</p>
                    <p>{{ $t('pubGoods.tips1-2') }}</p>
                    <p>{{ $t('pubGoods.tips1-3') }}</p>
                    <p>{{ $t('pubGoods.tips1-4') }}</p>
                    <p style="margin-bottom: 20px">{{ $t('pubGoods.tips1-5') }}</p>
                    <p>{{ $t('pubGoods.tips1-6') }}</p>
                    <p>{{ $t('pubGoods.tips1-7') }}</p>
                    <p>{{ $t('pubGoods.tips1-8') }}</p>
                    <p>{{ $t('pubGoods.tips1-9') }}</p>
                    <p>{{ $t('pubGoods.tips1-10') }}</p>
                    <p style="margin-bottom: 20px">{{ $t('pubGoods.tips1-11') }}</p>
                    <p>{{ $t('pubGoods.tips1-12') }}</p>
                    <p>{{ $t('pubGoods.tips1-13') }}</p>
                    <p>{{ $t('pubGoods.tips1-14') }}</p>
                    <p>{{ $t('pubGoods.tips1-15') }}</p>
                    <p>{{ $t('pubGoods.tips1-16') }}</p>
                </div>
            </el-col>
        </el-row>

        <el-dialog :title="$t('pubGoods.newSort')" :visible.sync="dialogSort"
                   :close-on-click-modal="false" v-dialog-drag custom-class="width400">
            <el-input :placeholder="$t('pubGoods.desInput')" v-model="newSortName"></el-input>
            <el-alert title="无" type="success" :closable="false" style="text-align: left;margin-top: 10px">
                <template slot='title'>
                    <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}</div>
                    <div>{{ $t('pubGoods.tips1-17') }}</div>
                    <div>{{ $t('pubGoods.tips1-18') }}</div>
                    <div>{{ $t('pubGoods.tips1-19') }}</div>
                </template>
            </el-alert>
            <span slot="footer">
        <el-button @click="dialogSort = false">{{ $t('button.cancel') }}</el-button>
        <el-button type="primary" @click="submitSort">{{ $t('button.confirm') }}</el-button>
      </span>
        </el-dialog>

        <vip-dialog :tabIndex="tabIndex" :show.sync="visible"></vip-dialog>
    </div>
</template>

<script>
import {mapState} from "vuex";
const vipDialog = () => import('@/components/vip')

    export default {
        name: "First",
        components: { vipDialog },
        props: {
            title: {type: String, default: ''},
            ea: {type: Number}
        },
        data() {
            return {
                tabIndex: 0,
                visible: false,
                goodsDetails: {
                    title: '',
                    ea: '',
                },
                listQuery: {
                    limit: 35,
                    page: 1
                },
                total: 0,
                options: [],

                dialogSort: false,
                newSortName: ''
            }
        },
        computed: {
            ...mapState({
                uid: state => state.user.userInfo.id,
                token: state => state.user.token,
                trade_end_time: state => state.user.userInfo.trade_end_time,
                release: state => state.site.siteSetting.goods_release_chars*1,
                post_end_time: state => state.user.userInfo.post_end_time,
                reply: state => state.site.siteSetting.goods_reply_chars*1,
                isAdm: state => state.user.userInfo.is_adm,
            })
        },
        watch: {
            title(val) {
                this.goodsDetails.title = val
            },
            ea(val) {
                this.goodsDetails.ea = val
            },
        },
        created() {
            this.getSortTag()
        },
        methods: {
            nextStep() {
                this.$emit('changeStep', 1)
            },

            // 获取分类标签
            getSortTag() {
                let params = this.listQuery
                params.level = 1
                this.$http.get('/WebCategory/all', {params}).then(res => {
                    this.options = res.data
                    this.total = res.total
                })
            },

            submitSort() {
                let params = {
                    title: this.newSortName,
                    rate: '0',
                    tfee: '0'
                }
                this.$http('/WebCategory/save', {method: 'post', params}).then(res => {
                    if (res) {
                        this.dialogSort = false
                        this.getSortTag()
                    }
                })
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
                margin-bottom: 0;
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
                    height: 276px;
                    background: #9DC9F0;
                    padding: 10px;
                    margin-bottom: 0;

                    .el-radio {
                        width: 80px;
                        margin-bottom: 10px;
                        background: #fff;
                        margin-right: 10px;

                        &:hover {
                            background: #E4F0FA;
                        }

                        ::v-deep {
                            .el-radio__input {
                                display: none;
                            }

                            .el-radio__label {
                                padding-left: 0;
                            }
                        }

                        &.is-checked {
                            background: #3c648c;
                        }

                    }

                    .el-radio.is-bordered + .el-radio.is-bordered {
                        margin-left: 0;
                    }

                    ::v-deep .el-radio__input.is-checked + .el-radio__label {
                        color: #fff;
                    }
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
    .no-pass {
        padding: 10px;

        span {
            color: #409EFF;
            cursor: pointer;
        }
    }
</style>
