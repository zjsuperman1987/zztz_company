<template>
    <div>
        <div class="title-info">
            <span>{{ $t('notify.msgList') }}</span>
            <div>
                <el-button type="text" size="small" v-if="messageCount" @click="allRead">{{ $t('notify.allRead') }}
                </el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getMessage">{{ $t('button.refresh')
                    }}
                </el-button>
            </div>
        </div>
        <el-table :data="messageList" :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  v-loading="loading" :row-class-name="tableRowClass">
            <el-table-column label="ID" prop="id" width="60"></el-table-column>
            <el-table-column :label="$t('table.handler')" width="80">
                <template v-slot="{row}">
                    <span v-if="row.type=== 1">{{ row.send_uid }}</span>
                    <span v-else>{{ row.operator }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.content')">
                <template v-slot="{ row }">
                    <span v-if="row.type=== 1">{{ row.codeTitle.text}}</span>
                    <span v-else>{{ row.codeTitle.text}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.time')" width="120">
                <template v-slot="{ row }">
                    <span v-if="row.type=== 1">{{ row.create_time }}</span>
                    <span v-else>{{ row.cretime }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" width="110" align="center">
                <template v-slot="{row}">
                    <el-button type="text" @click="checkRead(row)" size="mini"
                               v-if="!row.rd" :style="{ color: row.rd ? '#C0C4CC' : '' }">
                        {{ $t('notify.unread') }}
                    </el-button>
                    <el-button v-if="row.tid" type="text" @click="into(row)">{{ $t('table.view') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <page-nation
                v-show="messageCount>0"
                :total="messageCount"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getMessage()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />
    </div>
</template>

<script>
    export default {
        name: "MyNotice",
        data() {
            return {
                messageList: [],
                messageCount: 0,
                listQuery: {
                    limit: 20,
                    page: 1
                },
                loading: false,
            }
        },
        created() {
            this.getMessage()
        },
        methods: {
            getMessage() { //获取消息
                this.loading = true
                const params = this.listQuery
                this.$http.get('/WebMessage', {params}).then(res => {
                    if (res) {
                        this.messageList = res.data
                        this.messageCount = res.total
                    }
                    this.loading = false
                })
            },
            allRead() {  //所有消息为已读
                this.$http('/WebMessage/update', {method: 'post', params: {id: 'all'}}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.getMessage()
                    }
                })
            },
            checkRead(item) {  //查看未读消息
                if (!item.rd) {
                    this.$http('/WebMessage/update', {method: 'post', params: {id: item.id}}).then(res => {
                        if (res) {
                            this.getMessage()
                            this.$store.dispatch('unread/getUnreadMessage')
                        }
                    })
                }
            },
            into(item) {  //查看消息
                this.$store.commit('goods/changeTab', 'orderList')
                if (item.operator + '' == 0) return this.$message.success("此订单因超时已取消!!");
                let values = ['30001', '30002', '30003', '30004', '30005', '30007']
                if (values.indexOf(item.codeTitle.action + '') != -1) this.$router.push({
                    name: 'orderInfo',
                    query: {id: item.rid}
                })
                else this.$router.push({name: 'goods-details', query: {id: item.tid, oId: item.rid}})
                this.checkRead(item)
            },
            tableRowClass({row, rowIndex}) {
                if (row.rd) return 'read'
                else return 'not-read'
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .not-read {
            background: -webkit-linear-gradient(left, #78cdce 0%, #fff 6%, #fff 0%);
        }

        .read {
            background: #F4F5F6;
        }

        .el-row {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            border-radius: 4px;

            &:hover {
                opacity: 0.8;
            }

            .info {
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .time {
                text-align: right;
                color: #999;
                font-size: 12px;
            }
        }
    }

    .title-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #9CA8AA;
        padding: 2px;
        margin: 2px auto;

        span {
            margin-left: 10px;
        }
    }
</style>
