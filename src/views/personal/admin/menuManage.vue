<template>
    <div style="width: 100%">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <div>
                <el-button type="primary" icon="el-icon-plus" @click="addMenu">新增</el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getMenuList">{{
                    $t('button.refresh') }}
                </el-button>
            </div>
        </div>

        <div>
            <el-table :data="tableData" border :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                      highlight-current-row size="small" v-loading="listLoading">
                <el-table-column label="ID" prop="id" width="50"></el-table-column>
                <el-table-column label="标题" width="100">
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.title }}</span>
                        <el-input v-else v-model="row.title"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="控制器" width="150">
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.controller }}</span>
                        <el-select v-else v-model="row.controller">
                            <el-option v-for="item of options" :label="item" :value="item" :key="item"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="名称(路由名)" width="150">
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.name }}</span>
                        <el-input v-else v-model="row.name"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="组件(文件名)">
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.component }}</span>
                        <el-input v-else v-model="row.component"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="图标" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.icon }}</span>
                        <el-input v-else v-model="row.icon"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="排序" width="50">
                    <template v-slot="{row}">
                        <span v-if="row.edit">{{ row.sort }}</span>
                        <el-input v-else v-model="row.sort"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="80">
                    <template v-slot="{row}">
                        <el-tag :type="row.status ? 'warning' : ''">{{ row.status ? '停用' : '启用' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template v-slot="{row}">
                        <el-button-group>
                            <el-button :type="row.edit ? 'primary' : 'success'" size="mini"
                                       @click="row.edit ? edit(row) : save(row)">{{ row.edit ? '编辑' : '保存' }}
                            </el-button>
                            <el-button type="info" size="mini" v-if="!row.edit" @click="cancel(row)">取消</el-button>
                            <el-button :type="row.status ? 'primary' : 'warning'" size="mini"
                                       v-if="row.id" @click="handleClick(row,'status')">{{ row.status ? '启用' : '停用' }}
                            </el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="total>0"
                    :total="total"
                    layout="total, sizes, prev, pager, next"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getMenuList()"
                    :page-size="listQuery.limit"
                    :page-sizes="[40, 60]"
            />
        </div>
    </div>
</template>

<script>
    export default {
        name: "menuManage",
        data() {
            return {
                tableData: [],
                listQuery: {
                    page: 1,
                    limit: 40
                },
                total: 0,
                listLoading: false,
                options: [],
            }
        },
        created() {
            this.getMenuList()
            this.getController()
        },
        methods: {
            getMenuList() {
                this.listLoading = true
                let params = this.listQuery
                this.$http.get('/AdmMenus', {params}).then(res => {
                    if (res) {
                        for (let item of res.data) item.edit = true
                        this.tableData = res.data
                        this.total = res.total
                    }
                    this.listLoading = false
                })
            },

            getController() {
                this.$http.get('/AdmMenus/ctl', {port: 1}).then(res => {
                    if (res) this.options = res
                })
            },

            addMenu() {
                let newLine = {
                    title: '',
                    controller: '',
                    name: '',
                    component: '',
                    icon: '',
                    sort: '',
                    edit: false,
                }
                this.tableData.unshift(newLine)
            },

            edit(row) {
                for (let item of this.tableData) if (!item.edit) return this.$message.warning('请先保存或者取消其他编辑项')
                row.edit = false
            },

            cancel(row) {
                if (row.id) row.edit = true
                else this.tableData.shift()
            },

            save(row) {
                if (!row.controller || !row.name || !row.title || !row.component) return this.$message.warning('请填写完整');
                let params = {
                    id: row.id,
                    controller: row.controller,
                    name: row.name,
                    title: row.title,
                    icon: row.icon,
                    component: row.component,
                    sort: row.sort
                }
                const url = row.id ? '/AdmMenus/update' : '/AdmMenus/save'
                this.$http(url, {method: 'post', params}).then(res => {
                    if (res) {
                        this.getMenuList()
                        this.dialogVisible = false
                    }
                })
            },

            handleClick(row, type) {
                let params = {}
                if (type === 'hidden') params.hidden = row.hidden ? 0 : 1
                else params.status = row.status ? 0 : 1
                this.$http('/AdmMenus/update', {method: 'post', params: {id: row.id}}).then(res => {
                    console.log(res)
                    if (res) this.getMenuList()
                })
            }
        }
    }
</script>

<style scoped lang="less">

</style>
