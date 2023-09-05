<template>
    <div>
        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
            <div>
                <el-button size="mini" type="primary" icon="el-icon-edit-outline"
                           @click="publish">{{ $t('home.publishGoods') }}
                </el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh"
                           @click="getGoodsList">{{ $t('button.refresh') }}
                </el-button>
            </div>
        </div>
        <el-row class="actions">
            <el-button :type="buttonValue === this.$t('goods.chooseSort') ? 'primary' : 'success'" size="mini"
                       @click="handleFilter"
                       :icon="buttonValue === this.$t('goods.chooseSort') ? 'el-icon-search' : ''">{{ buttonValue }}
            </el-button>
            <el-button size="mini" @click="resetFilter">{{ $t('goods.reset') }}</el-button>
        </el-row>
        <el-table v-loading="goodsListLoading" :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  highlight-current-row size="small" :data="goodsList" class="table" border>
            <el-table-column label="ID" width="40">
                <template v-slot="{$index,row}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.classification')" prop="ea_title" show-overflow-tooltip
                             width="100"></el-table-column>
            <el-table-column :label="$t('table.title')" show-overflow-tooltip>
                <template v-slot="{row}">
                    <router-link :to="{ name: 'goods-details', query: { id: row.tid } }">
                        <span class="title">{{ row.title }}</span>
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.unitPrice')" prop="usdprice" width="80">
                <template v-slot="{row}">
                    <p>$ {{row.usdprice}}</p>
                </template>
            </el-table-column>
            <el-table-column :label="$t('goods.sales')" prop="sells_volume" width="50" align="center"></el-table-column>
            <el-table-column :label="$t('goods.pushTime')" prop="uptime" width="110"></el-table-column>
            <el-table-column :label="$t('table.pubTime')" prop="cretime" width="110"></el-table-column>
            <el-table-column :label="$t('table.status')" width="70">
                <template v-slot="{row}">
                    <el-tag size="small" type="success" v-if="row.down === 0">{{ $t('goods.onSale') }}</el-tag>
                    <el-tag size="small" type="danger" v-if="row.down === 1">{{ $t('goods.stoppedSelling') }}</el-tag>
                    <el-tag size="small" type="info" v-if="row.down === 2">{{ $t('goods.offlineBack') }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" width="120">
                <template v-slot="{row}">
                    <el-button-group v-if="row.down !== 2">
                        <el-button size="mini" :type="row.down === 1 ? 'primary' : 'danger'"
                                   @click="upSale(row,row.down === 1 ? 0 : 1)">
                            {{row.down === 1 ? $t('goods.online') : $t('goods.offline')}}
                        </el-button>
                        <el-button size="mini" type="primary" v-if="row.down === 0"
                                   @click="pull(row)">{{ $t('goods.push') }}
                        </el-button>
                        <el-button size="mini" type="primary" v-if="row.down === 1"
                                   @click="$router.push({ name: 'publishGoods',query: { id: row.tid.toString() }})">{{
                            $t('table.edit') }}
                        </el-button>
                        <!--            <el-button v-if="row.down === 1" size="mini" type="warning" @click="deleteGoods(row)">删除</el-button>-->
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="goodsListTotal>0"
                :total="goodsListTotal"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getGoodsList"
                :page-size="listQuery.limit"
                :page-sizes="[10, 20, 40]"/>

        <vip-dialog :tabIndex="tabIndex" :show.sync="visible"></vip-dialog>
        <el-dialog :title="$t('goods.chooseSort')" :visible.sync="dialogSort" v-dialog-drag custom-class="width600">
            <div class="tags">
                <el-radio-group v-model="ea" size="mini" @change="getGoodsList">
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
    </div>
</template>

<script>
    import {generateTitle} from '@/utils/i18n'
    import {mapState} from 'vuex'

    const vipDialog = () => import('@/components/vip')
    export default {
        name: "myGoods",
        components: {vipDialog},
        data() {
            return {
                tabIndex: 0,
                visible: false,
                goodsListLoading: false,
                goodsListTotal: 0,
                goodsList: [],
                listQuery: {
                    limit: 10,
                    page: 1,
                },

                buttonValue: this.$t('goods.chooseSort'),
                dialogSort: false,
                ea: '',
                options: [],
                sortListQuery: {
                    limit: 35,
                    page: 1
                },
                total: 0,
            }
        },
        created() {
            this.getGoodsList()
        },
        watch: {
            $route(to, from) {
                if (from.path === '/publishGoods') this.getGoodsList()
            }
        },
        computed: {
            ...mapState({
                trade_end_time: state => state.user.userInfo.trade_end_time,
                release: state => state.site.siteSetting.release_power_chars * 1,
            })
        },
        methods: {
            generateTitle,
            getGoodsList() {
                if (this.ea) {
                    for (let item of this.options) {
                        if (this.ea === item.value) this.buttonValue = item.label
                    }
                }
                this.goodsListLoading = true
                let params = {
                    page: this.listQuery.page,
                    limit: this.listQuery.limit,
                    ea: this.ea,
                }
                this.$http.get('/WebMyGoods', {params}).then(res => {
                    if (res) {
                        this.goodsListTotal = res.total
                        this.goodsList = res.data
                    }
                    this.goodsListLoading = false
                    this.dialogSort = false
                })
            },

            // 获取分类标签
            getSortTag() {
                return new Promise((resolve) => {
                    let params = this.sortListQuery
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

            publish() {
                if (this.release) {
                    if (this.trade_end_time) this.$router.push({name: 'publishGoods'})
                    else {
                        setTimeout(() => {
                            this.visible = true
                        }, 1000)
                    }
                } else this.$router.push({name: 'publishGoods'})
            },
            // 上线/下线
            upSale(row, sign) {
                let params = {
                    down: sign,
                    id: row.tid
                }
                this.$http('/WebMyGoods/update', {method: 'post', params}).then(res => {
                    if (res) {
                        // sign === 1 ? this.$message.success('下线成功') : this.$message.success('上线成功')
                        this.$message.success(this.$t('$message.success'))
                        this.getGoodsList()
                    }
                })
            },
            // 删除
            deleteGoods(row) {
                this.$confirm('是否要删除当前商品', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http('/WebMyGoods/delete', {method: 'post', params: {id: row.tid}}).then(res => {
                        if (res) this.$message({type: 'success', message: '删除成功!'})
                        else this.$message.error('删除失败')
                        this.getGoodsList()
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 推送
            pull(row) {
                this.$http('/WebMyGoods/update', {method: 'post', params : {uptime: 1, id: row.tid}}).then(res => {
                    if (res) {
                        this.$message.success(this.$t('$message.success'))
                        this.getGoodsList()
                    }
                })
            },
            // 搜索 / 重置
            handleFilter() {
                this.getSortTag().then(res => {
                    if (res) this.dialogSort = true
                })
            },
            resetFilter() {
                this.listQuery = {page: 1, limit: 10,}
                this.ea = ''
                this.buttonValue = this.$t('goods.chooseSort')
                this.getGoodsList();
            }
        },
    }
</script>

<style scoped lang="less">
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

    .actions {
        margin-bottom: 6px;
    }

    ::v-deep .table {
        p {
            line-height: 1.3;
        }

        .title {
            color: #1baaec;
            cursor: pointer;
        }
    }
</style>
