<template>
    <div>
        <div class="title-info">
            <span>{{ $t('notify.msgList') }}</span>
            <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getNote">{{ $t('button.refresh') }}
            </el-button>
        </div>
        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  highlight-current-row size="small" :data="noteList" v-loading="noteListLoading">
            <el-table-column label="ID" width="60">
                <template v-slot="{$index,row}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.sender')" prop="last_replay_uid" width="60"></el-table-column>
            <el-table-column :label="$t('table.content')">
                <template v-slot="{row}">
                    <span v-html="row.last_replay_contents"></span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.time')" prop="last_replay_time" width="150"></el-table-column>
            <el-table-column :label="$t('table.actions')" width="150" align="center">
                <template v-slot="{row}">
                    <el-button type="text" @click="checkRead(row)" size="mini"
                               v-if="!row.rd" :style="{ color: row.rd ? '#C0C4CC' : '' }">
                        {{ $t('notify.unread') }}
                    </el-button>
                    <el-button type="primary" size="mini" @click="into(row)">{{ $t('table.view') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getNote()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />
    </div>
</template>

<script>
    import {mapState} from 'vuex'

    export default {
        name: "Note",
        data() {
            return {
                noteList: [],
                contentList: [],
                total: 0,
                noteListLoading: false,
                listQuery: {
                    limit: 20,
                    page: 1
                },
            }
        },
        computed: {
            ...mapState({
                uid: state => state.user.userInfo.id
            })

        },
        created() {
            this.getNote()
        },
        methods: {
            //获取留言列表
            getNote() {
                this.noteListLoading = true
                const params = this.listQuery
                params.replay = this.uid
                this.$http.get('/WebMyReplys/getMyList', {params}).then(res => {
                    if (res) {
                        this.noteList = res.data
                        for (let prop of this.noteList) this.contentList.push(prop.last_replay_contents)
                        this.total = res.total
                    }
                    this.noteListLoading = false
                })
            },
            //查看留言
            into(row) {
                if (row.is_buy) this.$store.commit('goods/changeTab', 'orderList')
                else {
                    if (row.partner === this.uid) this.$store.commit('goods/changeTab', 'buyer')
                    else this.$store.commit('goods/changeTab', 'consultList')
                }
                this.$router.push({name: 'goods-details', query: {id: row.tid, isBuy: row.is_buy}})
            },
            //查看未读消息
            checkRead(item) {
                if (!item.rd) {
                    this.$http('WebMyReplys/read', {
                        method: 'get',
                        params: {tid: item.tid, partner: item.partner}
                    }).then(res => {
                        if (res) {
                            this.getNote()
                            this.$store.dispatch('unread/getUnreadWords')
                        }
                    })
                }
            },

        }
    }
</script>

<style scoped lang="less">
    .title-info {
        background: #9CA8AA;
        padding: 2px;
        margin: 2px auto;
        display: flex;
        justify-content: space-between;

        span {
            margin-left: 10px;
        }
    }
</style>
