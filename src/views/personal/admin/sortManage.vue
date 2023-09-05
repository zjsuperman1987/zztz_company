<template>
    <div style="width: 100%">

        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <div>
                <el-button icon="el-icon-plus" type="primary" size="small" @click="addNew">新增</el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getSortList">{{
                    $t('button.refresh') }}
                </el-button>
            </div>
        </div>

        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                  highlight-current-row :data="sortList" size="mini" v-loading="loading">
            <el-table-column label="ID" width="60">
                <template v-slot="{$index,row}">
                    {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="编号" prop="id" width="50"></el-table-column>
            <el-table-column label="名称" show-overflow-tooltip>
                <template v-slot="{row}">
                    <span v-if="row.parent_title">{{ row.parent_title }} - </span>
                    <span>{{ row.title}}</span>
                </template>
            </el-table-column>
            <el-table-column label="费率 ‰" prop="rate" width="80"></el-table-column>
            <el-table-column label="发布费用" prop="tfee" width="80"></el-table-column>
            <el-table-column label="私密交易" align="center" width="80">
                <template v-slot="{row}">
                    <span :style="{ color: row.private_transaction ? '' : '#BF3F76' }">{{ row.private_transaction ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="禁止列表" align="center" width="80">
                <template v-slot="{row}">
                    <span :style="{ color: row.forbidden_list ? '' : '#BF3F76' }">{{ row.forbidden_list ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="公开评论" align="center" width="80">
                <template v-slot="{row}">
                    <span :style="{ color: row.public_comments ? '' : '#BF3F76' }">{{ row.public_comments ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="禁止回复" align="center" width="80">
                <template v-slot="{row}">
                    <span :style="{ color: row.forbidden_reply ? '' : '#BF3F76' }">{{ row.forbidden_reply ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="禁止发布" align="center" width="80">
                <template v-slot="{row}">
                    <span :style="{ color: row.forbidden_post ? '' : '#BF3F76' }">{{ row.forbidden_post ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="禁止他人阅读" align="center" width="100">
                <template v-slot="{row}">
                    <span :style="{ color: row.forbidden_read ? '' : '#BF3F76' }">{{ row.forbidden_read ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150">
                <template v-slot="{$index,row}">
                    <el-button-group>
                        <el-button size="mini" type="primary" @click="handleEdit(row)">修改</el-button>
                        <el-button size="mini" type="primary" @click="openDialogSort(row)">合并</el-button>
                        <el-button size="mini" type="warning" @click="handleDelete($index,row)">删除</el-button>
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
                @pagination="getSortList()"
                :page-size="listQuery.limit"
                :page-sizes="[20, 40, 60]"
        />

        <el-dialog :title="dialogType === 'edit' ? '修改类别' : '新增类别' " :visible.sync="dialogSort"
                   v-dialogDrag custom-class="width400" :close-on-click-modal="false">
            <el-form :model="tempValue" size="small" label-width="80px"
                     :rules="rules" ref="tempValue" :show-message="false">
                <el-form-item label="标题" prop="title">
                    <el-input size="small" v-model="tempValue.title"></el-input>
                </el-form-item>
                <el-form-item label="交易费率" prop="rate">
                    <el-input size="small" v-model="tempValue.rate">
                        <template slot="append">‰</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="发布费用" prop="tfee">
                    <el-input size="small" v-model="tempValue.tfee"></el-input>
                </el-form-item>
                <el-form-item label="私密交易" prop="private_transaction">
                    <el-switch v-model="tempValue.private_transaction"
                               :active-value="1" :inactive-value="0"
                               active-color="#13ce66" inactive-color="#ff4949"
                               active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
                <el-form-item label="禁止列表">
                    <el-switch v-model="tempValue.forbidden_list"
                               :active-value="1" :inactive-value="0"
                               active-color="#13ce66" inactive-color="#ff4949"
                               active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
                <el-form-item label="公开评论">
                    <el-switch v-model="tempValue.public_comments"
                               :active-value="1" :inactive-value="0"
                               active-color="#13ce66" inactive-color="#ff4949"
                               active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
                <el-form-item label="禁止回复">
                    <el-switch v-model="tempValue.forbidden_reply"
                               :active-value="1" :inactive-value="0"
                               active-color="#13ce66" inactive-color="#ff4949"
                               active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
                <el-form-item label="禁止发布">
                    <el-switch v-model="tempValue.forbidden_post"
                               :active-value="1" :inactive-value="0"
                               active-color="#13ce66" inactive-color="#ff4949"
                               active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
                <el-form-item label="禁止他人">
                    <el-switch v-model="tempValue.forbidden_read"
                               :active-value='1' :inactive-value='0'
                               active-color="#13ce66" inactive-color="#ff4949"
                               active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
            </el-form>
            <span slot="footer">
        <el-button size="mini" @click="dialogSort = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="submitLoading"
                   @click="dialogType === 'edit' ? submitValue('tempValue') : createValue('tempValue')">确定</el-button>
      </span>
        </el-dialog>

        <el-dialog title="合并分类" :visible.sync="dialogMergeSort" v-dialogDrag custom-class="width600"
                   :close-on-click-modal="false">
            <p style="margin-bottom: 10px">将当前分类
                <span style="color: #0C7A64;font-weight: 600">{{ chooseSort.title }}</span> 合并到
            </p>
            <div class="tags">
                <el-radio-group v-model="mergeSortValue" size="mini">
                    <el-radio v-for="item of options" :key="item.value" :label="item.value" border>{{ item.label }}
                    </el-radio>
                </el-radio-group>
            </div>
            <span slot="footer">
                <el-button size="small" :loading="subLoading" type="primary" @click="submitSortValue">确定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "sortManage",
        data() {
            return {
                sortList: [],
                chooseSort: '',
                subLoading: false,
                total: 0,
                listQuery: {
                    page: 1,
                    limit: 20
                },
                loading: false,
                dialogSort: false,
                dialogMergeSort: false,
                mergeSortValue: '',
                dialogType: 'add',
                options: [],    // 下拉的选择
                // 新增时存放
                tempValue: {
                    title: '',
                    rate: '',
                    tfee: '',
                    private_transaction: 1,
                    forbidden_list: '',
                    public_comments: '',
                    forbidden_reply: '',
                    forbidden_post: '',
                    forbidden_read: '',
                },
                submitLoading: false,

                rules: {
                    title: [
                        {required: true, message: '请输入分类的标题', trigger: 'blur'},
                    ],
                    rate: [
                        {required: true, message: '请输入交易费率', trigger: 'blur'},
                        {pattern: /^[0-9]*[1-9][0-9]*$/, message: '费率格式错误，只能是数字且整数', trigger: 'blur'}
                    ],
                    tfee: [{required: true, message: '请输入发布费用', trigger: 'blur'}]
                }
            }
        },
        created() {
            this.getSortList()
            this.getSelect()
        },
        computed: {
            ...mapState({
                default_rate_category_chars: state => state.site.siteSetting.default_rate_category_chars,
                default_release_goods_chars: state => state.site.siteSetting.default_release_goods_chars,
            }),
        },
        methods: {
            getSortList() {
                this.loading = true
                let params = this.listQuery
                this.$http.get('/AdmGoodsCategory', {params}).then(res => {
                    if (res) {
                        this.sortList = res.data
                        this.total = res.total
                    }
                    this.loading = false
                })
            },
            // 行编辑按钮
            handleEdit(row) {
                this.dialogType = 'edit'
                this.tempValue = JSON.parse(JSON.stringify(row))
                this.dialogSort = true
            },
            // 行删除
            handleDelete(index, row) {
                this.$confirm('此操作将永久删除该类别, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.delete(`/AdmGoodsCategory/${row.id}`).then(res => {
                        if (res) {
                            if (res.hasOwnProperty('error')) {
                                this.$confirm(`${res.error}, 是否继续?`, '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    this.$http.delete(`/AdmGoodsCategory/${row.id}`, {params: {whole: 1}}).then(res => {
                                        if (res) {
                                            this.$message.success('删除成功')
                                            this.getSortList()
                                        }
                                    })
                                }).catch(() => {
                                    this.$message.info('已取消删除')
                                })
                            } else {
                                this.$message.success('删除成功')
                                this.getSortList()
                            }
                        }
                    })
                }).catch(() => {
                    this.$message.info('已取消删除')
                });
            },
            openDialogSort(row) {
                this.chooseSort = row
                this.dialogMergeSort = true
            },
            // 合并分类
            submitSortValue() {
                if (!this.mergeSortValue) return this.$message.warning('请选择分类')
                this.subLoading = true
                let params = {
                    merge: 1,
                    ea: this.mergeSortValue
                }
                this.$http(`/AdmGoodsCategory/${this.chooseSort.id}`, {method: 'put', params}).then(res => {
                    if (res) {
                        this.dialogMergeSort = false
                        this.$message.success('操作成功')
                        this.getSortList()
                        this.mergeSortValue = ''
                    }
                    this.subLoading = false
                })
            },
            // 添加按钮
            addNew() {
                this.dialogType = 'add'
                Object.keys(this.tempValue).forEach(key => {
                    this.tempValue[key] = ''
                })
                this.tempValue.rate = this.default_rate_category_chars
                this.tempValue.tfee = this.default_release_goods_chars
                this.tempValue.private_transaction = 1
                this.dialogSort = true
            },
            // 修改类别提交
            submitValue(form) {
                this.$refs[form].validate((valid, object) => {
                    if (valid) {
                        this.submitLoading = true
                        let params = {
                            title: this.tempValue.title,
                            rate: this.tempValue.rate,
                            tfee: this.tempValue.tfee,
                            private_transaction: this.tempValue.private_transaction,
                            forbidden_list: this.tempValue.forbidden_list,
                            forbidden_post: this.tempValue.forbidden_post,
                            forbidden_read: this.tempValue.forbidden_read,
                            forbidden_reply: this.tempValue.forbidden_reply,
                            public_comments: this.tempValue.public_comments,
                        }
                        this.$http(`/AdmGoodsCategory/${this.tempValue.id}`, {method: 'put', params}).then(res => {
                            if (res) {
                                this.getSortList()
                                this.tempValue = {}
                                this.$message.success('修改成功')
                                this.dialogSort = false
                            }
                            this.submitLoading = false
                        })
                    } else this.$validateNotify(object)
                })
            },
            // 新建类别
            createValue(form) {
                this.$refs[form].validate((valid, object) => {
                    if (valid) {
                        this.submitLoading = true
                        this.$http('/AdmGoodsCategory', {method: 'post', params: this.tempValue}).then(res => {
                            if (res) {
                                this.getSortList()
                                this.tempValue = {}
                                this.$message.success('添加成功')
                                this.dialogSort = false
                                this.getSelect()
                                this.$store.dispatch('site/getSelect')
                            }
                            this.submitLoading = false
                        })
                    } else this.$validateNotify(object)
                })
            },
            // 获取下拉
            getSelect() {
                this.$http.get('/WebCategory/all', {params: {level: 1}}).then(res => {
                    this.options = res.data
                })
            },
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
</style>
