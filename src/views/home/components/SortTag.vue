<template>
    <div class="main-content" :style="{ background: theme.navBgC }">
        <div class="top">
            <!--网站信息-->
            <span style="margin-right: 10px">{{ $t('home.quickNavigation') }}</span>

            <div class="btn_box">
                <el-button type="text" @click="$router.push('coin')">法币买卖</el-button>
                <el-button type="text" @click="$router.push('guaranteeSearch')">担保交易</el-button>
            </div>
            <el-button type="text" class="btn-text" v-for="(item,index) in tableList" :key="index" @click="notice_btn(item)">{{ item.title }}
            </el-button>
        </div>

        <div class="sortTag" v-if="options.length">
            <!--热门分类栏-->
            <div style="margin-right: 30px;overflow: hidden;white-space: nowrap">
                <span style="margin-right: 10px">{{ $t('home.classNavigation') }}</span>
                <el-button type="text" v-for="item in options" :key="item.value"
                           @click="$router.push({ name: 'search',query: { id: item.value, name: item.label } })">{{
                    item.label }}
                </el-button>
                <!--查看更多-->
                <el-button v-if="options.length>15" @click="moreTags" type="text">{{ $t('home.showMoreGoods') }}</el-button>
            </div>
            <!--搜索框-->
            <div class="filter">
                <el-input size="mini" @keyup.enter.native="search" clearable v-model="searchValue"
                          :placeholder="$t('home.input')"></el-input>
                <el-button size="mini" type="primary" @click="search">{{ $t('home.search') }}</el-button>
            </div>
        </div>

        <el-dialog :title="$t('home.class')" :visible.sync="dialogSort"
                   v-dialog-drag custom-class="width600" :close-on-click-modal="false">
            <div class="tags">
                <el-radio-group v-model="ea" size="mini" @change="submitSort">
                    <el-radio v-for="item in options" :key="item.value" :label="item.value" border>{{ item.label }}
                    </el-radio>
                </el-radio-group>
            </div>
            <page-nation
                    :total="total"
                    layout="prev, pager, next, jumper"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getSortTag"
                    :page-size="listQuery.limit"
            />
        </el-dialog>

        <vip-dialog :tabIndex="tabIndex" :show.sync="visible"></vip-dialog>

    </div>
</template>

<script>
    import {mapState} from "vuex";
    const vipDialog = () => import('@/components/vip')
    export default {
        name: "SortTag",
        components: {vipDialog},
        data() {
            return {
                searchValue: '',
                tabIndex: 0,
                visible: false,
                tableList: [],
                dialogSort: false,
                options: [],
                ea: '',
                listQuery: {
                    limit: 16,
                    page: 1
                },
                Query: {
                    limit: 16,
                    page: 1
                },
                total: 0,
            }
        },
        computed: {
            ...mapState({
                tend_time: state => state.user.userInfo.tend_time,
                theme: state => state.settings.theme,
                release: state => state.site.siteSetting.release_power_chars * 1,
            }),
            buttonValue() {
                return [
                    {id: 1, label: this.$t('home.pubGoods'), router: 'publishGoods'},
                    {id: 2, label: this.$t('home.pubAD'), router: 'publishAD'},
                    {id: 3, label: this.$t('home.pubFB'), router: 'feedback'},
                    {id: 4, label: this.$t('home.wallet'), router: 'wallet'},
                    {id: 5, label: this.$t('home.order'), router: 'myOrder'},
                    {id: 6, label: this.$t('home.salesOrder'), router: 'sellOrder'},
                    {id: 7, label: this.$t('home.message'), router: 'note'},
                    {id: 8, label: this.$t('home.coin'), router: 'coin'},
                    {id: 9, label: this.$t('home.guarantee'), router: 'guaranteeSearch'},
                ]
            }
        },
        mounted() {
            this.getSortTag()
            this.getTableData(6)
        },
        methods: {
            search() {
                if (!this.searchValue) return this.$message.warning('无搜索关键字')
                this.$router.push({name: 'search', params: {search: this.searchValue}})
            },

            moreTags() {
                this.getSortTag().then(() => {
                    this.dialogSort = true
                })
            },

            // 提交分类
            submitSort(val) {
                let name
                this.options.every(item => {
                    (val === item.value) && (name = item.label)
                })
                this.$router.push({name: 'search', query: {id: val, name}})
                this.dialogSort = false
            },

            // 获取分类标签
            getSortTag() {
                return new Promise((resolve, reject) => {
                    let params = this.Query
                    params.level = 1
                    this.$http.get('/WebCategory/all', {params}).then(res => {
                        if (res) {
                            this.options = res.data
                            this.total = res.total
                            resolve(res)
                        }
                    })
                })
            },

            //获取首页临时资讯列表
            getTableData(val) {
                this.listLoading = true
                let params = this.listQuery
                params.type = val
                this.$http.get('/WebArticle', { params }).then(res=> {
                if (res) {
                    this.tableList = res.data
                    this.total = res.total
                }
                this.listLoading = false
                })
            },

            //公告跳转点击
            notice_btn(item) {
                this.$router.push({ name:'notice-details', query: { id: item.id, type: 'info' }})
            }
        }
    }
</script>

<style scoped lang="less">
    .main-content {
        background: bisque;
        margin-bottom: 5px;

        .top {
            padding: 0 4px;

            .el-button {
                padding: 0;

                &:hover {
                    color: #bf8686;
                }
            }
            .btn-text{
                margin-right: 20px;
            }

            .btn_box{
                display: inline-block;
                margin-right: 20px;
            }
        }
    }

    .sortTag {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 4px;

        ::v-deep {
            .el-button--text {
                padding: 0;

                &:hover {
                    color: #bf8686;
                }
            }
            .el-input.el-input--mini.el-input--suffix{
                width: 110px;
            }
        }

        .filter {
            display: flex;

            ::v-deep {
                .el-input {
                    width: 100px;

                    .el-input__inner {
                        border-radius: 4px 0 0 4px;
                    }
                }

                .el-button {
                    border-radius: 0 4px 4px 0;
                }
            }
        }
    }

    .tags {
        height: 276px;
        background: #9DC9F0;
        padding: 10px;
        margin-bottom: 0;

        .el-radio {
            width: 80px;
            margin-bottom: 10px;
            margin-right: 10px;
            background: #fff;
            padding: 4px 6px;

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

        ::v-deep .el-radio__input.is-checked + .el-radio__label {
            color: #fff;
        }

        .el-radio.is-bordered + .el-radio.is-bordered {
            margin-left: 0;
        }
    }
</style>
