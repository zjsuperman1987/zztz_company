<template>
    <div class="search">
        <div style="background: #E5E3E3;padding: 10px">
            <div id="router-title">
                <span id="title">{{ $t('search.title') }}</span>
            </div>

            <el-form inline class="filter">
                <el-form-item :label="$t('search.class')">
                    <el-input readonly :placeholder="$t('search.desClass')" v-model="goodsDetails.sortName"
                              @focus="getSortTags" style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item :label="$t('search.sort')">
                    <el-button-group>
                        <el-button :type="active === '0' ? 'primary' : ''" size="mini"
                                   @click="changeSort(0)">{{ $t('search.ctime') }}<i
                                class="el-icon-caret-bottom el-icon--right"></i></el-button>
                        <el-button :type="active === '2' ? 'primary' : ''" size="mini"
                                   @click="changeSort(2)">{{ $t('search.updateTime') }}<i
                                class="el-icon-caret-bottom el-icon--right"></i></el-button>
                        <el-button :type="active === '1' ? 'primary' : ''" size="mini"
                                   @click="changeSort(1)">{{ $t('search.sale') }}<i
                                class="el-icon-caret-bottom el-icon--right"></i></el-button>
                        <el-button :type="active === '4' ? 'primary' : ''" size="mini"
                                   @click="changeSort(4)">{{ $t('search.hot') }}<i
                                class="el-icon-caret-bottom el-icon--right"></i></el-button>
                        <el-button :type="active === '3' ? 'primary' : ''" size="mini"
                                   @click="changeSort(3)">{{ $t('search.recommend') }}<i
                                class="el-icon-caret-bottom el-icon--right"></i></el-button>
                    </el-button-group>
                </el-form-item>
                <el-form-item :label="$t('search.seller')">
                    <el-input @keyup.enter.native="getList" :placeholder="$t('search.desUid')"
                              oninput="value=value.replace(/[^\d]/g,'')"
                              v-model="goodsDetails.uid" style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item :label="$t('search.keyword')">
                    <el-input size="mini" @keyup.enter.native="getList" v-model.trim="goodsDetails.search"
                              :placeholder="$t('search.desKeyword')"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="mini" type="primary" @click="getList" icon="el-icon-search">{{ $t('button.search')
                        }}
                    </el-button>
                    <el-button size="mini" @click="reset">{{ $t('button.reset') }}</el-button>
                </el-form-item>
            </el-form>

            <el-table size="small" :data="sectionList" highlight-current-row border
                      :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                      v-loading="sectionListLoading">
                <el-table-column label="ID" width="40">
                    <template v-slot="{$index,row}">
                        {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('search.class')" prop="ea_title" width="90"></el-table-column>
                <el-table-column :label="$t('search.goodsID')" prop="tid" width="60"></el-table-column>
                <el-table-column :label="$t('table.seller')" prop="uid" width="50"></el-table-column>
                <el-table-column :label="$t('table.goodsName')" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link class="title" :to="{ name: 'goods-details', query: { id: row.tid } }">{{ row.title
                            }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('table.unitPrice')" prop="usdprice" width="100"></el-table-column>
                <el-table-column :label="$t('search.sale')" prop="sells" width="100"></el-table-column>
                <el-table-column :label="$t('search.hot')" prop="read_num" width="100"></el-table-column>
                <el-table-column :label="$t('table.pubTime')" prop="cretime" width="110"></el-table-column>
                <el-table-column :label="$t('search.updTime')" prop="uptime" width="110"></el-table-column>
                <el-table-column :label="$t('table.actions')" width="50">
                    <template v-slot="{row}">
                        <el-button size="mini" type="primary"
                                   @click="$router.push({ name: 'goods-details', query: { id: row.tid } })">{{
                            $t('table.view') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="sectionListTotal>0"
                    :total="sectionListTotal"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getList()"
                    :page-size="listQuery.limit"
                    :page-sizes="[20, 40, 60]"
            />

            <el-alert title="无" type="info" :closable="false" style="text-align: left;margin-top: 10px">
                <template slot='title'>
                    <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}</div>
                    <div>{{ $t('search.tips1') }}</div>
                    <div>{{ $t('search.tips2') }}</div>
                </template>
            </el-alert>
        </div>

        <el-dialog title="选择分类" :visible.sync="dialogSort" v-dialog-drag
                   custom-class="width600" :close-on-click-modal="false">
            <div class="tags">
                <el-radio-group v-model="ea" size="mini" @change="submitSort">
                    <el-radio v-for="item in options" :key="item.value" :label="item.value" border>{{ item.label }}
                    </el-radio>
                </el-radio-group>
            </div>
            <page-nation
                    :total="sortTotal"
                    layout="prev, pager, next, jumper"
                    :page.sync="sortListQuery.page"
                    :limit.sync="sortListQuery.limit"
                    @pagination="getSortTags"
                    :page-size="sortListQuery.limit"
            />
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "search",
        data() {
            return {
                // 搜索选择
                goodsDetails: {
                    sort: this.$route.query.sort || '',
                    selectValue: this.$route.query.id || '',
                    search: this.$route.params.search || '',
                    uid: '',
                    sortName: this.$route.query.name || '',
                },
                sectionList: [],
                sectionListTotal: 0,
                active: this.$route.query.sort || '0',
                orderBy: 'DESC',
                listQuery: {
                    limit: 20,
                    page: 1
                },
                sortListQuery: {
                    limit: 35,
                    page: 1
                },
                options: [],
                sortTotal: 0,
                dialogSort: false,
                ea: '',
                rules: {},
                sectionListLoading: false
            }
        },
        created() {
            this.getList()
        },
        methods: {
            getList() {
                this.sectionListLoading = true
                let params = {
                    search: this.goodsDetails.search,
                    ea: this.goodsDetails.selectValue,
                    sort: this.goodsDetails.sort,
                    order: this.orderBy,
                    uid: this.goodsDetails.uid,
                }
                params = {...params, ...this.listQuery}
                this.$http.get('/WebGoods', {params}).then(res => {
                    if (res) {
                        this.sectionList = res.data
                        this.sectionListTotal = res.total
                    }
                    this.sectionListLoading = false
                })
            },
            changeSort(val) {
                this.goodsDetails.sort = val
                this.active = val.toString()
                this.getList()
            },
            // 重置
            reset() {
                this.goodsDetails = {
                    sort: '',
                    selectValue: '',
                    search: '',
                }
                this.active = '0'
                this.orderBy = 'DESC'
                this.getList()
            },

            // 获取分类标签
            getSortTags() {
                return new Promise((resolve) => {
                    let params = this.sortListQuery
                    params.level = 1
                    this.$http.get('/WebCategory/all', {params}).then(res => {
                        if (res) {
                            this.options = res.data
                            this.total = res.total
                            this.dialogSort = true
                            resolve()
                        }
                    })
                })
            },

            // 提交分类
            submitSort(val) {
                for (let item of this.options) {
                    if (val === item.value) {
                        this.goodsDetails.sortName = item.label
                        this.goodsDetails.selectValue = val
                        this.dialogSort = false
                        this.getList()
                    }
                }
            },

            // 取消分类
            cancel() {
                this.this.goodsDetails.sort = ''
                this.goodsDetails.selectValue = ''
                this.getList()
            }
        },
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common.less";

    ::v-deep {
        .el-form-item {
            margin-bottom: 0;
        }
    }

    .search {
        max-width: @maxWidth;
        min-width: @minWidth;
        margin: auto;
        padding: 20px;
        background: #f9f9f9;
        height: 100%;

        .filter {
            display: flex;
            align-items: center;
            margin-bottom: 6px;

            li {
                &:not(:last-child) {
                    margin-right: 10px;
                }

                .range {
                    display: flex;
                    align-items: center;
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
