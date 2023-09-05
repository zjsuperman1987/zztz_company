<template>
    <div>
        <div class="main">

            <div id="router-title">
                <span id="title">{{ generateTitle($route.meta.title) }}</span>
            </div>

            <el-table size="small" border highlight-current-row
                      :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                      :data="favoritesList" v-loading="favoritesListLoading">
                <el-table-column label="ID" prop="id" width="60">
                    <template v-slot="{$index,row}">
                        {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('table.seller')" prop="uid" width="80"></el-table-column>
                <el-table-column :label="$t('table.title')" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link v-if="row.status !== 2" :to="{ name: 'goods-details', query: { id: row.tid } }">
                            {{ row.title }}
                        </router-link>
                        <span v-else>{{ row.title }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('table.unitPrice')" prop="usdprice" width="80"></el-table-column>
                <el-table-column :label="$t('favorite.hot')" prop="read_num" width="80"></el-table-column>
                <el-table-column :label="$t('table.payStatus')" width="80">
                    <template v-slot="{row}">
                        <el-tag type="info" v-if="row.status === 2">关闭</el-tag>
                        <el-tag :type="row.down ? 'info' : ''" v-else>{{ row.down ? '下线' : '正常' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('table.goodsStatus')" width="80">
                    <template v-slot="{row}">
                        <el-tag v-if="row.status === 1">正常</el-tag>
                        <el-tag v-if="row.status === 2" type="info">关闭</el-tag>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('table.pubTime')" prop="cretime" width="120"></el-table-column>
                <el-table-column :label="$t('table.actions')" width="120">
                    <template v-slot="{row}">
                        <el-button v-if="row.status !== 2" type="primary" size="mini"
                                   @click="$router.push({ name: 'goods-details', query: { id: row.tid } })">{{
                            $t('table.view') }}
                        </el-button>
                        <el-button size="mini" type="warning" @click="cancelF(row)">取消收藏</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
    import {generateTitle} from "@/utils/i18n";

    export default {
        name: "favorites",
        data() {
            return {
                favoritesList: [],
                favoritesListLoading: false,
                count: 0,
                listQuery: {
                    limit: 10,
                    page: 1
                }
            }
        },
        created() {
            this.getFavorites()
        },
        methods: {
            generateTitle,
            getFavorites() {
                this.favoritesListLoading = true
                this.$http.get('/WebMyFavorite').then(res => {
                    if (res) {
                        this.favoritesList = res.list
                        this.count = res.count
                    }
                    this.favoritesListLoading = false
                })
            },
            cancelF(row) {
                this.$http('WebMyFavorite/delete', {method: 'post', params: {id: row.tid}}).then(res => {
                    if (res) this.$message.success('操作成功')
                    this.getFavorites()
                    this.$store.dispatch('user/getInfo')
                })
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common.less";

    .title {
        padding: 20px 120px;
        background: #9AA4AF;

        span {
            color: #fff;
            font-weight: 600;
        }
    }

    .main {
        padding: 20px;
        margin: 0 auto;
        max-width: @maxWidth;
    }
</style>
