<template>
    <div style="width: 100%">

        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getGoodsList">{{ $t('button.refresh') }}</el-button>
        </div>

        <div class="filter">
            <el-form :model="goodsQuery" size="mini" inline>
                <el-form-item label="排序">
                    <el-button-group>
                        <el-button :type="active === '0' ? 'primary' : ''" @click="changeSort(0)">发布时间</el-button>
                        <el-button :type="active === '2' ? 'primary' : ''" @click="changeSort(2)">最后更新</el-button>
                    </el-button-group>
                </el-form-item>
                <el-form-item label="分类">
                    <el-input readonly v-model="sortName" @click.native="getSortTags" style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item label="账号ID">
                    <el-input size="mini" @keyup.enter.native="getGoodsList" v-model.number="goodsQuery.uid"
                              style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item label="商品关键字">
                    <el-input size="mini" @keyup.enter.native="getGoodsList" v-model.trim="goodsQuery.search"
                              placeholder="搜索内容"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="mini" type="primary" @click="getGoodsList">搜索</el-button>
                    <el-button size="mini" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  highlight-current-row :data="goodsList" v-loading="listLoading" size="mini">
            <el-table-column label="ID" width="45">
                <template v-slot="{$index,row}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="卖家" width="60">
                <template v-slot="{row}">
                    <el-button type="text" @click="userClick(row)">{{ row.uid }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="商品编号" prop="tid" width="60"></el-table-column>
            <el-table-column label="商品名" show-overflow-tooltip>
                <template v-slot="{row}">
                    <router-link :to="{ name: 'goods-details',query: { id: row.tid } }">{{ row.title }}</router-link>
                </template>
            </el-table-column>
            <el-table-column label="价格($)" prop="usdprice" width="60"></el-table-column>
            <el-table-column label="售出" prop="sells" width="50"></el-table-column>
            <el-table-column label="推荐" align="center" width="50">
                <template v-slot="{row}">
          <span :style="{ color: row.recommend ? '#67C23A' : '' }">
            {{ row.recommend ? '是' : '否' }}
          </span>
                </template>
            </el-table-column>
            <el-table-column label="下架" align="center" width="50">
                <template v-slot="{row}">
          <span :style="{ color: row.down ? '#67C23A' : '' }">
            {{ row.down ? '是' : '否' }}
          </span>
                </template>
            </el-table-column>
            <el-table-column label="展示" align="center" width="50">
                <template v-slot="{row}">
          <span :style="{ color: row.hidden ? '#67C23A' : '' }">
            {{ row.hidden ? '否' : '是' }}
          </span>
                </template>
            </el-table-column>
            <el-table-column label="热度" prop="read_num" width="50"></el-table-column>
            <el-table-column label="最后推送时间" prop="uptime" width="110"></el-table-column>
            <el-table-column label="创建时间" prop="cretime" width="110"></el-table-column>
            <el-table-column label="操作" width="100">
                <template v-slot="{row}">
                    <el-button type="primary" size="mini"
                               @click="$router.push({ name: 'goods-details',query: { id: row.tid } })">查看
                    </el-button>
                    <el-button type="warning" size="small" @click="closeGoods(row)" :loading="closeLoading">关闭
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getGoodsList()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />

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
        name: "goodsManage",
        data() {
            return {
                goodsList: [],
                listLoading: false,
                total: 0,
                listQuery: {
                    page: 1,
                    limit: 20
                },
                goodsQuery: {
                    ea: '',
                    uid: '',
                    search: '',
                    sort: '',
                },
                active: '',

                sortListQuery: {
                    limit: 35,
                    page: 1
                },
                sortName: '',
                options: [],
                sortTotal: 0,
                dialogSort: false,
                ea: '',
                closeLoading: false,
            }
        },
        created() {
            this.getGoodsList()
        },
        methods: {
            getGoodsList() {
                this.listLoading = true
                let params = {
                    ea: this.goodsQuery.ea,
                    limit: this.listQuery.limit,
                    page: this.listQuery.page,
                    uid: this.goodsQuery.uid,
                    search: this.goodsQuery.search,
                    sort: this.goodsQuery.sort
                }
                this.$http.get('/AdmGoods', {params}).then(res => {
                    if (res) {
                        this.goodsList = res.data
                        this.total = res.total
                    }
                    this.listLoading = false
                })
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
                        this.sortName = item.label
                        this.goodsQuery.ea = val
                        this.dialogSort = false
                        this.getGoodsList()
                    }
                }
            },

            changeSort(val) {
                this.goodsQuery.sort = val
                this.active = val.toString()
                this.getGoodsList()
            },

            // 关闭当前商品 msg_id: 20-商品不符合网站规则
            closeGoods(row) {
                this.closeLoading = true
                let params = {
                    down: 1, id: row.tid,
                    opt: 0, msg_id: 20
                }
                this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                    if (res) this.getGoodsList()
                    this.closeLoading = false
                })
            },

            // 重置
            reset() {
                Object.keys(this.goodsQuery).forEach(keys => {
                    this.goodsQuery[keys] = ''
                })
                this.sortName = ''
                this.active = ''
                this.getGoodsList()
            },

            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row.uid)
                this.$emit('openByName','userDetails')
            }
        }
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

    .filter {
        padding: 2px 4px;
        background: #e5e5e5;
        margin-bottom: 4px;

        ::v-deep {
            .el-form-item {
                margin-bottom: 0;
                padding-right: 10px;

                &:not(:last-child) {
                    border-right: 2px solid #8A8989;
                }
            }
        }
    }
</style>
