<template>
    <div style="width: 100%">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <div style="display: flex">
                <el-button size="small" type="primary" icon="el-icon-plus"
                           @click="detail">发布资讯
                </el-button>
                <div style="display: flex;margin: 0 10px">
                    <el-input v-show="typeShow" v-model="addArticleType"></el-input>
                    <el-button size="small" :loading="buttonLoading" type="primary" icon="el-icon-plus"
                               @click="openMessageType">新增/修改类型
                    </el-button>
                </div>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getTableData(tag)">{{
                    $t('button.refresh') }}
                </el-button>
            </div>
        </div>

        <el-dialog title="新增/修改类型" :visible.sync="dialogTypeVisible" width="30%" v-if="showPage">
            <el-table :data="messageTypeList">
                <el-table-column label="类型" prop="title">
                    <template slot-scope="{row}">
                        <el-input v-model="row.title" :disabled="row.disabled"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="{row}">
                        <el-button v-if="!row.disabled" type="success" size="mini" @click="saveEdit(row)">保存</el-button>
                        <div v-else>
                            <el-button size="mini" type="primary" @click="needEdit(row)">编辑</el-button>
                            <el-button size="mini" type="primary" @click="deleteEdit(row)">删除</el-button>
                        </div>
                        <el-button v-if="!row.disabled" size="mini" @click="editCancel(row)">取消</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="text-align: center;margin-top: 12px">
                <el-button @click="handleCreate" type="primary">新增类型</el-button>
            </div>
            <span slot="footer" class="dialog-footer">
    <el-button @click="dialogTypeVisible = false">关 闭</el-button>
  </span>
        </el-dialog>

        <el-radio-group v-model="tag" @change="changeTag" size="mini" v-if="showPage">
            <el-radio-button v-for="item of messageTypeList" :key="item.id" :label="item.id">{{ item.title }}</el-radio-button>
        </el-radio-group>

        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  highlight-current-row size="small" :data="tableList" v-loading="listLoading">
            <el-table-column label="ID" width="80">
                <template v-slot="{$index,row}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="标题" show-overflow-tooltip>
                <template v-slot="{row}">
                    <router-link :to="{ name: 'notice-details', query: { id: row.id, type: 'info' } }">{{ row.title }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="150">
                <template v-slot="{row}">
                    <el-tag :type="row.status ? 'info' : ''">{{ row.status ? "已关闭" : '正常' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="时间" prop="update_time" width="150"></el-table-column>
            <el-table-column label="操作" width="150">
                <template v-slot="{row}">
                    <el-button-group>
                        <el-button size="mini" type="primary" @click="$router.push({ name: 'publishInformation',
                        query: { id: row.id, type: 'information'} })">
                            修改
                        </el-button>
                        <el-button size="mini" :type="row.status ? 'primary' : 'warning'" @click="handleClick(row)">{{ row.status ? "开启" : '关闭' }}
                        </el-button>
                        <el-button size="mini" type="primary" @click="$router.push({ name: 'notice-details', query: { id: row.id, type: 'info' } })">
                            查看
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
                @pagination="getTableData(tag)"
                :page-size="listQuery.limit"
                :page-sizes="[10, 40, 60]"
        />
    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions";
    import {parseTime} from "@/utils";
    import {mapState} from "vuex";

    export default {
        name: "information",
        data() {
            return {
                showPage: false, //控制渲染顺序
                tableList: [],
                listQuery: {
                    page: 1,
                    limit: 10
                },
                total: 0,
                listLoading: false,
                tag: 1 ,
                typeShow: false,
                addArticleType: '',
                buttonLoading: false,
                dialogTypeVisible: false,
                messageTypeList: [],
            }
        },
        computed: {
            ...mapState({
                messageType: state => state.message.messageType
            }),
        },
        created() {
            this.getTableData(this.tag)
            this.initData()
        },
        watch: {
            $route(to, from) {
                if (from.path === '/admin/publishInformation') this.getTableData(this.tag)
            }
        },
        methods: {
            //初始化获取数据 控制渲染顺序
            initData(){
              if(this.messageType){
                  this.showPage = true
                  this.messageTypeList = this.messageType.data
                  console.log(this.messageTypeList)
              }
            },

            async getTableData(val) {
                let params = {
                    page: this.listQuery.page,
                    limit: this.listQuery.limit,
                    type: val
                }
                let res = await myFunctions.get('AdmArticle', params)
                for(let prop of res.data) prop.update_time = parseTime(prop.update_time, '{y}-{m}-{d} {h}:{i}:{s}')
                if (res) {
                    this.tableList = res.data
                    console.log(this.tableList)
                    this.total = res.total
                }
                this.listLoading = false
            },

            changeTag(val) {
                this.getTableData(val)
            },

            //资讯开启和关闭
            handleClick(row) {
                let params = {
                    id: row.id,
                    status: row.status ? 0 : 1
                }
                this.$http('/AdmArticle/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.getTableData(this.tag)
                    }
                })
            },
            //新增资讯类型
            openMessageType(){
                this.dialogTypeVisible = true
            },
            // 保存资讯分类
            async saveEdit(row) {
                let params = {
                    id: (row.id ? this.messageTypeList.length : null),
                    title: row.title,
                    ord: 99,
                    status: 1
                }
                let res = await myFunctions.post('AdmArticle/MallArticleTypeSave', params).catch(() => {
                })
                if (res) {
                    this.$store.commit('message/setMessageType')
                    this.$message.success('成功')
                    row.disabled = true;
                    this.dialogTypeVisible = false
                } else this.$message.error('请填写类型')
            },
            //编辑分类
            needEdit(row) {
                for (let i of this.messageTypeList) if (!i.disabled) return this.$message.warning('请先保存当前编辑项')
                row.disabled = false
            },
            //删除分类
            async deleteEdit(row) {
                let res = await myFunctions.get('AdmArticle/MallArticleTypeDel', {id: row.id})
                if (res) {
                    this.$message.success('成功')
                    this.$store.commit('message/setMessageType')
                }
            },
            // 取消
            editCancel(row) {
                if (row.id) row.disabled = true
                else this.messageTypeList.splice(row, 1)
            },
            // 添加
            handleCreate() {
                this.messageTypeList.push({title: '', disabled: false})
            },

            //发布跳转
            detail() {
                sessionStorage.setItem('publishInformation','information')
                this.$emit('openByName','publishInformation')
            },

            //打开修改资讯界面
            Modify() {
                
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-radio-group {
            margin-bottom: 6px;

            .el-radio-button:focus {
                box-shadow: 0 0 !important;
            }

            .el-radio-button__inner {
                padding: 6px 8px;
            }
        }
    }
</style>
