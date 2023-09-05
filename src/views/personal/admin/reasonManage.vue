<template>
    <div style="width: 100%">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <div>
                <el-button type="primary" icon="el-icon-plus" @click="add">新增</el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getReasonList">{{
                    $t('button.refresh') }}
                </el-button>
            </div>
        </div>

        <el-radio-group v-model="tag" @change="changeTag" size="mini">
            <el-radio-button v-for="item of reasonType" :key="item.value" :label="item.value">{{ item.label }}
            </el-radio-button>
        </el-radio-group>

        <div class="table">
            <el-table size="small" :data="tableList" border v-loading="listLoading" highlight-current-row
                      :header-cell-style="{background:'#eef1f6',color:'#606266'}">
                <el-table-column label="ID" prop="id" width="50"></el-table-column>
                <el-table-column label="理由">
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.text }}</span>
                        <el-input v-else v-model="row.text"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="排序" width="150">
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.rate }}</span>
                        <el-input v-else v-model="row.rate" oninput="value=value.replace(/[^\d]/g,'')"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="150">
                    <template v-slot="{row}">
                        <el-tag :type="row.status ? 'warning' : ''">{{ row.status ? '停用' : '启用' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template v-slot="{row}">
                        <el-button-group>
                            <el-button size="mini" :type="row.edit ? 'primary' : 'success'"
                                       @click="row.edit ? edit(row) : save(row)">{{ row.edit ? '修改' : '保存' }}
                            </el-button>
                            <el-button size="mini" type="primary" v-if="!row.edit" @click="cancel(row)">取消</el-button>
                            <el-button size="mini" :type="row.status ? 'primary' : 'warning'" v-if="row.edit"
                                       @click="handleClick(row)">{{ row.status ? '启用' : '停用' }}
                            </el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="total>0"
                    :total="total"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getReasonList()"
                    :page-size="listQuery.limit"
                    :page-sizes="[10, 40, 60]"
            />
        </div>
    </div>
</template>

<script>
    export default {
        name: "reasonManage",
        data() {
            return {
                reasonType: [],
                tag: 0,

                listQuery: {
                    limit: 10,
                    page: 1
                },
                tableList: [],
                listLoading: false,
                total: 0,
            }
        },
        created() {
            this.getType()
            this.getReasonList()
        },
        methods: {
            getType() {
                this.$http.get('/AdmMsg/type').then(res => {
                    if (res) this.reasonType = res
                })
            },

            getReasonList() {
                this.listLoading = true
                let params = this.listQuery
                params.type = this.tag
                this.$http.get('/AdmMsg', {params}).then(res => {
                    if (res) {
                        for (let item of res.data) item.edit = true
                        this.tableList = res.data
                        this.total = res.total
                    }
                    this.listLoading = false
                })
            },

            changeTag() {
                this.getReasonList()
            },

            add() {
                let data = {text: '', rate: '', edit: false}
                this.tableList.push(data)
            },

            edit(row) {
                for (let item of this.tableList) if (!item.edit) return this.$message.warning('请先保存或者取消其他编辑项')
                row.edit = false
            },

            save(row) {
                let params
                if (row.id) {
                    params = {text: row.text, rate: row.rate, id: row.id}
                } else {
                    params = {text: row.text, rate: row.rate,}
                }
                let url = row.id ? '/AdmMsg/update' : '/AdmMsg/save'
                this.$http(url, {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.getReasonList()
                    }
                })
            },

            cancel(row) {
                if (row.id) row.edit = true
                else this.tableList.pop()
            },

            handleClick(row) {
                this.$http('/AdmMsg/update', {method: 'post', params : {id: row.id, status: row.status ? 0 : 1}}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.getReasonList()
                    }
                })
            },
        }
    }
</script>

<style scoped lang="less">
    .table {
        margin-top: 10px;
    }
</style>
