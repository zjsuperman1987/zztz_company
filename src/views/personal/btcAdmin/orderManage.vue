<template>
    <div class="app-container">
        <div class="filter-container">
            <el-form :inline="true" :model="listQuery" class="header-form-inline">
                <el-form-item label="类型">
                    <el-select
                            size="medium"
                            v-model="listQuery.type"
                            style="width: 80px"
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
                            class="filter-item">
                        <el-option
                                v-for="item in OrderStatusOptions"
                                :key="item.value"
                                :label="item.key"
                                :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="时间">
                    <el-date-picker size="mini"
                                    v-model="listQuery.timerange"
                                    type="daterange"
                                    unlink-panels
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="timestamp"
                                    :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="检索">
                    <el-input size="medium" v-model.trim="listQuery.search" placeholder="姓名\订单号，二选一"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="medium" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
                    <el-button size="medium" type="primary" @click="resetFilter">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                  size="small" :key="tableKey" v-loading="listLoading"
                  :data="list" highlight-current-row style="width: 100%;"
                  @sort-change="sortChange">
            <el-table-column width="50" center label="类型">
                <template slot-scope="{row}">
                    <span v-show="row.s_type === 1" style="color: red">出售</span>
                    <span v-show="row.s_type === 0" style="color: #67C23A">购买</span>
                </template>
            </el-table-column>
            <el-table-column width="120" label="订单号">
                <template slot-scope="{row}">
                    <span>{{ row.sn}}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户" width="100">
                <template v-slot="{row}">
                    <el-button type="text" @click="userClick(row.subscribe_id)">{{ row.subscribe_id }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="发布方" width="100">
                <template v-slot="{row}">
                    <el-button type="text" @click="userClick(row.release_id)">{{ row.release_id }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="交易量(btc)" prop="number"></el-table-column>
            <el-table-column label="单价(cny)" prop="unit_price"></el-table-column>
            <el-table-column label="总价(btc)" prop="total_price"></el-table-column>
            <el-table-column label="手续费(btc)" prop="fee"></el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip width="110">
                <template slot-scope="{row}">
                    <span>{{ row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="完成/取消时间" show-overflow-tooltip width="110">
                <template slot-scope="{row}">
                    <span v-show="row.status !== 0 && row.status !== 1">{{ row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
                <template slot-scope="{row}">
                    <el-tag size="mini" :type="OrderStatusOptions[row.status+1].type">
                        {{ OrderStatusOptions[row.status+1].key }}
                    </el-tag>
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

        <el-alert title="无" type="success" :closable="false" style="margin-top: 15px">
            <template slot='title'>
                <div style="font:bold 14px/28px arial,sans-serif">温馨提示:</div>
                <div> - 此订单代指广告交易订单</div>
                <div> - 广告: 即承兑单,货币出售/收购商户所发布需求信息</div>
                <div> - 订单: 即交易订单,货币出售/收购时,双方发生的交易行为所产生的订单</div>
                <div> - 检索: 系统根据订单的状态,订单编号,类型,时间范围,交易发起者名称进行数据搜索</div>
                <div> - 操作: 订单处于申诉状态时,可以操作完成或者取消</div>
            </template>
        </el-alert>

    </div>
</template>

<script>
    import waves from '@/directive/waves' // waves directive
    import Pagination from '@/components/Pagination/index'
    import myFunctions from "@/utils/myFunctions"; // secondary package based on el-pagination

    export default {
        name: 'order',
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
                OrderStatusOptions: [
                    {key: '全部', value: null},
                    {key: '待付款', value: '0', type: 'danger'},
                    {key: '待放币', value: '1', type: 'danger'},
                    {key: '已完成', value: '2', type: 'success'},
                    {key: '已取消', value: '3', type: 'info'},
                    {key: '被动取消', value: '4', type: 'info'},
                    {key: '被动完成', value: '5', type: 'success'},
                    {key: '申述中', value: '6', type: 'danger'},
                    {key: '申诉取消', value: '7', type: 'warning'},
                    {key: '申诉完成', value: '8', type: 'success'}
                ],
                tableKey: 0,
                list: null, // 列表
                total: 0, // 总数
                listLoading: true, // 渲染
                listQuery: {
                    page: 1,
                    limit: 15,
                    status: null,
                    type: null,
                    timerange: null,
                    search: '',
                },
                importanceOptions: [1, 2, 3],
                statusOptions: ['published', 'draft', 'deleted'],
                temp: {
                    // add表单
                    nick_name: '',
                    login_password: '',
                    login_name: '',
                    status: 0
                },
                dialogFormVisible: false,
                currentOrder: {},
                appealReason: {},
                dialogStatus: '',
                textMap: {
                    // 表单头名
                    update: '编辑管理员',
                    create: '添加管理员'
                },
                dialogAppealVisible: false,
                pvData: [],
                rules: {
                    login_name: [
                        {required: true, message: '账号必须', trigger: 'blur'},
                        {min: 3, max: 15, message: '账号在3到15个字符', trigger: 'blur'}
                    ],
                    login_password: [
                        {required: true, message: '密码必须', trigger: 'blur'},
                        {min: 6, message: '密码不能小于6字符', trigger: 'blur'}
                    ],
                    nick_name: [
                        {required: true, message: '管理员名必须', trigger: 'blur'},
                        {min: 4, max: 15, message: '管理员名不能小于4个字符', trigger: 'blur'}
                    ]
                },
                downloadLoading: false
            }
        },
        created() {
            this.getList()
        },
        methods: {
            // 获取列表
            async getList() {
                this.listLoading = true
                if (this.listQuery.timerange && this.listQuery.timerange[0].toString().length === 13) {
                    this.listQuery.timerange[0] /= 1000
                    this.listQuery.timerange[1] /= 1000
                    this.listQuery.timerange[1] += 86399
                }
                const params = {
                    page: this.listQuery.page,
                    limit: this.listQuery.limit,
                    status: this.listQuery.status,
                    type: this.listQuery.type,
                    timerange: JSON.stringify(this.listQuery.timerange),
                    search: this.listQuery.search,
                }
                let res = await myFunctions.get('Admc2cOrder/getList', params)
                this.list = res.list
                this.total = res.count
                this.listLoading = false
            },
            //搜索查询
            handleFilter() {
                this.listQuery.page = 1
                this.getList()
            },
            resetFilter() {
                this.listQuery = {
                    page: 1,
                    limit: 15,
                    status: null,
                    type: null,
                    timerange: null,
                    nick_name: '',
                    sn: ''
                }
                this.getList();
            },
            sortChange(data) {
                const {prop, order} = data
                if (prop === 'id') this.sortByID(order)
            },
            sortByID(order) {
                if (order === 'ascending') this.listQuery.sort = '+id'
                else this.listQuery.sort = '-id'
                this.handleFilter()
            },

            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row)
                this.$emit('openByName','userDetails')
            }
        }
    }
</script>
<style scoped lang="less">
    .app-container {
        background-color: #fff;
        padding: 10px;

        .filter-container {
            background: #e5e5e5;
            padding: 3px 0 3px 3px;

            .el-range-separator {
                padding: 0;
            }
        }
    }

    /deep/ .el-form-item {
        .el-form-item__content {
            height: 24px;

            .el-range-editor--mini.el-input__inner {
                height: 24px;
                padding: 0 10px 0 20px;

                .el-input__icon {
                    padding: 1px;
                    margin: 0;
                }

                .el-range-separator {
                    padding: 2px 0 0 0;
                }
            }
        }
    }

    /deep/ .el-input {
    }

    /deep/ .el-date-editor {
        /*line-height: 24px;*/
        /*height: 24px;*/
    }

    .el-table {
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

    .header-form-inline .el-form-item {
        margin-bottom: 0;
    }
</style>
