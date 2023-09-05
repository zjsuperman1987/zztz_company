<template>
    <div class="app-container">
        <div class="filter-container">
            <el-form :inline="true" :model="listQuery" class="header-form-inline">
                <el-form-item label="类型">
                    <el-select
                            size="medium"
                            v-model="listQuery.type"
                            style="width: 60px"
                            class="filter-item">
                        <el-option :key="0" label="全部" :value="null"/>
                        <el-option :key="1" label="购买" :value="0"/>
                        <el-option :key="2" label="出售" :value="1"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select
                            size="medium"
                            v-model="listQuery.status"
                            style="width: 80px"
                            class="filter-item"
                    >
                        <el-option
                                v-for="item in acceptanceStatusOptions"
                                :key="item.value"
                                :label="item.key"
                                :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="时间">
                    <template>
                        <div class="block">
                            <el-date-picker
                                    size="mini"
                                    v-model="listQuery.timerange"
                                    type="daterange"
                                    unlink-panels
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="timestamp"
                                    :picker-options="pickerOptions">
                            </el-date-picker>
                        </div>
                    </template>
                </el-form-item>
                <el-form-item label="用户名">
                    <el-input size="medium" v-model.trim="listQuery.nick_name"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="medium" type="primary" @click="handleFilter">搜索</el-button>
                    <el-button size="medium" type="primary" @click="resetFilter">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-table size="small" v-loading="listLoading" :key="tableKey"
                  :data="list" highlight-current-row>
            <el-table-column label="类型" width="60">
                <template slot-scope="{row}">
                    <span v-show="row.o_type === 1" style="color: red">出售</span>
                    <span v-show="row.o_type === 0" style="color: #67C23A">购买</span>
                </template>
            </el-table-column>
            <el-table-column label="用户名" width="100" show-overflow-tooltip>
                <template slot-scope="{row}">
                    <el-button type="text" @click="userClick(row.user_id)">{{ row.user_id }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="总量" width="60" prop="total_amount" show-overflow-tooltip></el-table-column>
            <el-table-column label="单价" width="100" prop="unit_price" show-overflow-tooltip></el-table-column>
            <el-table-column label="成交" width="40" prop="use_number"></el-table-column>
            <el-table-column label="成交量" width="100" prop="use_amount"></el-table-column>
            <el-table-column label="余量" width="80" prop="re_amount"></el-table-column>
            <el-table-column label="限定金额" width="130">
                <template slot-scope="{row}">
                    <span>{{ row.range_start }} - </span>
                    <span>{{row.range_end}}</span>
                </template>
            </el-table-column>
            <el-table-column label="发布时间" width="110">
                <template slot-scope="{row}">
                    <span>{{ row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="完成/取消时间" width="110">
                <template slot-scope="{row}">
                    <span v-if="row.status !== 0">{{ row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="60">
                <template slot-scope="{row}">
                    <el-tag size="mini" v-if="row.status === 0" type="success">正常</el-tag>
                    <el-tag size="mini" v-if="row.status === 1">完成</el-tag>
                    <el-tag size="mini" v-if="row.status === 2" type="warning">用户取消</el-tag>
                    <el-tag size="mini" v-if="row.status === 3" type="danger">后台取消</el-tag>
                    <el-tag size="mini" v-if="row.status === 4" type="info">用户下架</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="60" class-name="small-padding fixed-width">
                <template slot-scope="{row}">
                    <el-button
                            v-show="row.status === 0"
                            size="mini"
                            type="primary"
                            @click="handleModifyStatus(row)"
                    >取消
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <pagination
                v-show="total>0"
                :total="total"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getList"
                :page-size="listQuery.limit"
                :page-sizes="[15, 35, 50]"
        />

        <el-alert
                title="无"
                type="success"
                :closable="false"
                style="margin-top: 15px">
            <template slot='title'>
                <div style="font:bold 14px/28px arial,sans-serif">温馨提示:</div>
                <div> - 此承兑代指广告</div>
                <div> - 广告方: 即承兑商,货币出售/收购商户</div>
                <div> - 广告: 即承兑单,货币出售/收购商户所发布需求信息</div>
                <div> - 检索: 系统根据广告的状态,类型,时间范围,发布者名称进行数据搜索</div>
                <div> - 取消: 可以根据需求取消广告方的广告</div>
                <div><span style="color: #c03639"> * 广告尚有未完成交易订单的情况下无法取消</span></div>
            </template>
        </el-alert>

        <!-- 弹窗-->
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form
                    ref="dataForm"
                    :rules="rules"
                    :model="temp"
                    label-position="left"
                    label-width="80px"
                    style="width: 400px; margin-left:50px;"
            >
                <el-form-item v-if="dialogStatus==='create'" label="账号名" prop="login_name">
                    <el-input v-model="temp.login_name"/>
                </el-form-item>
                <el-form-item label="管理员名" prop="nick_name">
                    <el-input v-model="temp.nick_name"/>
                </el-form-item>
                <el-form-item label="密码" prop="login_password">
                    <el-input type="password" v-model="temp.login_password"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import waves from "@/directive/waves"; // waves directive
    import Pagination from "@/components/Pagination/index";
    import myFunctions from "@/utils/myFunctions"; // secondary package based on el-pagination

    export default {
        name: "acceptance",
        components: {Pagination},
        directives: {waves},
        data() {
            return {
                pickerOptions: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                tableKey: 0,
                list: null, // 列表
                total: 0, // 总数
                listLoading: true, // 渲染
                listQuery: {
                    // 分页
                    page: 1,
                    limit: 10,
                    status: null,
                    type: null,
                    timerange: null,
                },
                acceptanceStatusOptions: [
                    {key: '全部', value: null},
                    {key: '正常', value: '0', type: 'success'},
                    {key: '已完成', value: '1'},
                    {key: '用户取消', value: '2', type: 'success'},
                    {key: '后台取消', value: '3'},
                    {key: '取消', value: '4'}
                ],

                temp: {
                    // add表单
                    nick_name: "",
                    login_password: "",
                    login_name: "",
                    status: 0
                },
                dialogFormVisible: false,
                dialogStatus: "",

                textMap: {
                    // 表单头名
                    update: "编辑管理员",
                    create: "添加管理员"
                },
                dialogPvVisible: false,
                pvData: [],
                rules: {
                    login_name: [
                        {required: true, message: "账号必须", trigger: "blur"},
                        {min: 3, max: 15, message: "账号在3到15个字符", trigger: "blur"}
                    ],
                    login_password: [
                        {required: true, message: "密码必须", trigger: "blur"},
                        {min: 6, message: "密码不能小于6字符", trigger: "blur"}
                    ],
                    nick_name: [
                        {required: true, message: "管理员名必须", trigger: "blur"},
                        {min: 4, max: 15, message: "管理员名不能小于4个字符", trigger: "blur"}
                    ]
                },
                downloadLoading: false
            };
        },
        created() {
            this.getList();
        },
        methods: {
            // 获取列表
            async getList() {
                this.listLoading = true;
                if (this.listQuery.timerange && this.listQuery.timerange[0].toString().length === 13) {
                    this.listQuery.timerange[0] /= 1000
                    this.listQuery.timerange[1] /= 1000
                    this.listQuery.timerange[1] += 86399
                }
                let params = {
                    page: this.listQuery.page,
                    type: this.listQuery.type,
                    timerange: JSON.stringify(this.listQuery.timerange),
                    status: this.listQuery.status,
                    limit: this.listQuery.limit
                }
                let res = await myFunctions.get('AdmAccept/getList', params)
                for (let prop of res.list) {
                    prop.unit_price = myFunctions.cutRadixPoint(prop.unit_price, 2)
                    prop.range_start = myFunctions.cutRadixPoint(prop.range_start, 2)
                    prop.range_end = myFunctions.cutRadixPoint(prop.range_end, 2)
                }
                this.list = res.list;
                this.total = res.count;
                this.listLoading = false;
            },
            handleFilter() {
                this.listQuery.page = 1;
                this.getList();
            },
            resetFilter() {
                this.listQuery = {
                    page: 1,
                    limit: 15,
                    status: null,
                    type: null,
                    timerange: null,
                    nick_name: ''
                }
                this.getList();
            },
            // 取消单子
            handleModifyStatus(row) {
                this.$confirm('此操作将取消该承兑单, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async() => {
                    let res = await myFunctions.post('AdmAccept/cancel', {id: row.id})
                    if (res) {
                            this.getList();
                            this.$notify({
                                title: "成功",
                                message: "取消承兑单成功",
                                type: "success",
                                duration: 2000
                            });
                        }
                }).catch(() => {})
            },
            // 添加管理员
            createData() {
                this.$refs["dataForm"].validate(valid => {
                    if (valid) {
                        let params = {
                            symbol: "otc.adm_user.createAdmInfo",
                            nick_name: this.temp.nick_name,
                            login_name: this.temp.login_name,
                            login_password: this.$md5(this.temp.login_password).toString()
                        };
                        createAdmin(params).then(res => {
                            console.log(res);
                            this.list.unshift(this.temp);
                            this.dialogFormVisible = false;
                            this.$notify({
                                title: "成功",
                                message: "创建管理员成功",
                                type: "success",
                                duration: 2000
                            });
                        });
                    }
                });
            },
            // 更新
            updateData() {
                this.$refs["dataForm"].validate(valid => {
                    if (valid) {
                        let params = {
                            nick_name: this.temp.nick_name,
                            login_password: this.$md5(this.temp.login_password).toString(),
                            symbol: "otc.adm_user.editAdmInfo",
                            id: this.temp.id
                        };
                        updateAdmin(params).then(() => {
                            const index = this.list.findIndex(v => v.id === this.temp.id);
                            this.list.splice(index, 1, this.temp);
                            this.dialogFormVisible = false;
                            this.$notify({
                                title: "成功",
                                message: "更新用户成功",
                                type: "success",
                                duration: 2000
                            });
                        });
                    }
                });
            },

            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row)
                this.$emit('openByName','userDetails')
            }
        }
    };
</script>
<style scoped lang="less">
    .app-container {
        background-color: #fff;
        padding: 10px;
        .filter-container{
            background:#e5e5e5;
            padding: 3px 0 2px 3px
        }
    }
    /deep/ .el-form {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .el-form-item {
            margin-bottom: 0;

            .el-form-item__content {
                .el-range-editor--mini.el-input__inner{
                    height: 24px;
                    padding: 0 10px 0 20px;
                }
                .el-date-editor .el-range-separator{
                    padding: 2px 0 0 0;
                }
                .el-input__icon{
                    padding-top: 1px;
                }
            }
        }
    }

    /deep/ .el-table {
        a {
            color: #409EFF;
        }

        p {
            margin: 0;
            line-height: 1.5;
        }

        th, td {
            padding: 2px 0;
        }

        .cell {
            padding: 0 2px !important;
        }
    }
</style>
