<template>
    <div class="container">
        <div style="padding: 0 20px">
            <div class="order-header">
                <div class="order-header-status">
                        <span v-for="(item,index) of acceptanceStatus" :key="item" :class="{active:index===isActive}"
                          @click="selectAcceptance(index)">{{item}}</span>
                </div>
                <div class="order-header-active" v-show="false">筛选</div>
            </div>
            <div>
                <el-radio-group v-model="radio" size="mini" @change="btnClick">
                    <el-radio-button label="BTC"></el-radio-button>
                    <el-radio-button label="USDT"></el-radio-button>
                </el-radio-group>
            </div>
            <div class="order-table">
                <el-table :data="acceptanceList" style="width: 100% ;" v-loading="isLoading">
                    <el-table-column :label="$t('currency.state')" width="60" align="center">
                        <template slot-scope="{row}">
                        <span v-show="row.status === 0" style="color: #409EFF">
                            <span class="status-icon"><i class="iconfont icon-jinhangzhong"></i></span>
                            <span>{{$t('currency.ongoing')}}</span>
                        </span>
                        <span v-show="row.status === 1" style="color: #67C23A">
                            <span class="status-icon"><i class="iconfont icon-yiwancheng"></i></span>
                            <span>{{$t('currency.Completed')}}</span>
                        </span>
                        <span v-show="row.status === 2 || row.status === 3" style="color: #9aa5b5">
                            <span class="status-icon"><i class="iconfont icon-yiquxiao"></i></span>
                            <span>{{$t('currency.Cancelled')}}</span>
                        </span>
                        <span v-show="row.status === 4" style="color: #9aa5b5">
                            <span class="status-icon"><i class="iconfont icon-yixiajia"></i></span>
                            <span>{{$t('currency.disappeared')}}</span>
                        </span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.type')" width="60" align="center">
                        <template slot-scope="{row}">{{$myFunctions.trimNum(row.o_type)}}</template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.limit')" width="100">
                        <template slot-scope="{row}">
                            {{ parseFloat(row.range_start) }} -- {{ parseFloat(row.range_end) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.amount')" width="100">
                        <template slot-scope="{row}">{{$myFunctions.trimNum(row.total_amount)}}</template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.unitPrice')" prop="unit_price" width="100">
                        <template slot-scope="{row}">{{$myFunctions.trimNum(row.unit_price)}}</template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.number')" prop="ongoing_num" width="60">
                        <template slot-scope="{row}">{{$myFunctions.trimNum(row.ongoing_num)}}</template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.ongoing_sum')" prop="ongoing_sum" width="100">
                        <template slot-scope="{row}">{{$myFunctions.trimNum(row.ongoing_sum)}}</template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.completed_sum')" width="130">
                        <template slot-scope="{row}">{{$myFunctions.trimNum(row.completed_sum)}}
                            {{row.currency.ift_name}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.surplus_sum')" width="140">
                        <template slot-scope="{row}">
                            <div>{{ $myFunctions.trimNum(row.re_amount) }} {{ row.currency.ift_name }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.create_time')">
                        <template slot-scope="{row}">
                            <span>{{ row.create_time|parseTime('{y}-{m}-{d}')}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('currency.operation')" align="center" width="160">
                        <template slot-scope="{row}">
                            <el-button-group>
                                <el-button v-if="row.status===0" size="mini"
                                           type="danger" @click="offShelf(row)">{{$t('currency.off')}}
                                </el-button>
                                <el-button v-if="row.status===4" size="mini"
                                           type="primary" @click="update(row)">{{$t('currency.up')}}
                                </el-button>
                                <el-button v-if="row.status===0 || row.status===4"
                                           size="mini" type="primary" @click="cancelCDD(row)">{{$t('currency.cancel')}}
                                </el-button>
                                <el-button v-if="row.status===4"
                                           size="mini" type="primary" @click="edit(row)">{{$t('currency.edit')}}
                                </el-button>
                            </el-button-group>
                        </template>
                    </el-table-column>
                </el-table>

                <template v-if="!isLoading">
                    <div v-if="count===0" class="no-more-tips">{{$t('currency.noMore')}}</div>
                </template>
                <template v-if="count>0">
                    <div style="text-align: center">
                        <el-pagination @current-change="acceptance" :current-page.sync="listQuery.page"
                                       :page-size="listQuery.limit" layout="total, prev, pager, next" :total="count">
                        </el-pagination>
                    </div>
                </template>

            </div>
        </div>
        <!-- 修改承兑单弹框 -->
        <el-dialog title='修改' :close-on-click-modal="false" :visible.sync="editVisible"
        width="30%">
            <el-form size="mini" label-width="82px">
                <!-- 数量 -->
                <el-form-item :label="$t('currency.amount')" prop="total" label-width="80px">
                    <el-input step="20" type="number"
                                v-model.number="infoOfPublish.total" autocomplete="off"
                                :placeholder="$t('currency.enterAmount')">
                        <!-- <template slot="suffix">{{ currency_s }}</template> -->
                    </el-input>
                </el-form-item>
                <!-- 单价  输入框只能输入数字且首位不能为0 -->
                <el-form-item :label="$t('currency.unitPrice')" prop="unit_price" label-width="80px">
                    <el-input type="number" v-model.number="infoOfPublish.unit_price" autocomplete="off"
                                οninput='this.value=this.value.replace( /^[0] + [0 - 9] * $ / gi, "").replace(/[^d]/g, ")'>
                        <template slot="suffix">CNY</template>
                    </el-input>
                </el-form-item>
                <!-- 限额 -->
                <el-form-item class="limit" :label="$t('currency.limit')" prop="range_start" label-width="80px">
                    <el-input :placeholder="$t('currency.startLimit')" type="number"
                                v-model.number="infoOfPublish.range_start"
                                autocomplete="off">
                        <template slot="suffix"> CNY</template>
                    </el-input>
                    <span class="range"> - </span>
                    <el-input :placeholder="$t('currency.endLimit')" type="number"
                                v-model.number="infoOfPublish.range_end"
                                autocomplete="off">
                        <template slot="suffix"> CNY</template>
                    </el-input>
                </el-form-item>
                

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button size="mini" @click="editVisible = false">取 消</el-button>
                <el-button size="mini" type="primary" @click="submitForm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions"

    export default {
        name: "myPublish",
        data() {
            return {
                acceptanceStatus: ["进行中", "已完成", "已取消", "已下架", "全部"],
                count: 0,
                isActive: 4,
                type: '',
                radio: 'BTC',
                listQuery: {
                    // 分页
                    status: null,
                    page: 1,
                    limit: 10
                },
                isLoading: true,
                editVisible: false,
                acceptanceList: [],
                // 修改表单
                infoOfPublish: {
                    total: "",
                    range_start: '',
                    range_end: '',
                    unit_price: '',
                },
                id: null, //承兑单id
                currency_id: 1, //币种
            };
        },
        created() {
            // 初始化承兑单
            this.acceptance(1);
        },
        watch: {
            '$i18n.locale': {  //监听中英文切换
                handler: function () {
                    if (this.$i18n.locale === 'zh') this.acceptanceStatus = ["进行中", "已完成", "已取消", "已下架", "全部"]
                    if (this.$i18n.locale === 'en') this.acceptanceStatus = ["Underway", "Completed", "Canceled", "Moved", "All"]
                },
                immediate: true
            }
        },
        methods: {
            // 承兑单状态切换
            selectAcceptance(index) {
                this.isActive = index;
                this.listQuery.page = 1;
                if (index === 0) {  //进行中
                    this.listQuery.status = 0;
                    this.currency_id = 1
                    this.acceptance(1);
                }
                if (index === 1) { //已完成
                    this.listQuery.status = 1;
                    this.currency_id = 1
                    this.acceptance(1);
                }
                if (index === 2) { //已取消
                    this.listQuery.status = 2;
                    this.currency_id = 1
                    this.acceptance(1);
                }
                if (index === 3) { //已下架
                    this.listQuery.status = 4;
                    this.currency_id = 1
                    this.acceptance();
                }
                if (index === 4) {  //全部
                    this.listQuery.status = null;
                    this.currency_id = 1
                    this.acceptance(1);
                }
            },
            // 取消承兑单
            cancelCDD(row) {
                this.type = '是否删除该承兑单?'
                this.status = 2
                this.upOrDownGoods(row, this.type,this.status)
            },
            //上架承兑单
            update(row) {
                if(row.re_amount < 0.01) return this.$message.warning('剩余数量小于限额, 不能上架')
                console.log(row)
                this.type = '是否上架该承兑单?'
                this.status = 0
                this.upOrDownGoods(row,this.type,this.status)
            },
            // 下架承兑单
            offShelf(row) {
                console.log(row)
                this.type = '是否下架该承兑单?'
                this.status = 4
                this.upOrDownGoods(row,this.type,this.status)
            },
            // 修改承兑单
            edit(row) {
                this.editVisible = true
                this.id = row.id 
                this.infoOfPublish = {
                    total: parseFloat(row.total_amount),
                    range_start: parseFloat(row.range_start),
                    range_end: parseFloat(row.range_end),
                    unit_price: parseFloat(row.unit_price),
                }
            },
            //操作承兑单
            upOrDownGoods(row,type,status){
                this.$confirm(type, "提示",{
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    confirmButtonClass: 'confirm-class',
                    cancelButtonClass: 'cancel-class',
                    type: "warning"
                }).then(async () => {
                    let res = await myFunctions.post('WebAccept/update', {id: row.id, status: status})
                    if(res) {
                        this.acceptance().catch();
                        this.$message.success("操作成功");
                    }
                })
            },
            // 获取承兑单列表
            async acceptance() {
                this.isLoading = true;
                let params = {
                    status: this.listQuery.status,
                    page: this.listQuery.page,
                    limit: this.listQuery.limit,
                    currency_id: this.currency_id
                };
                console.log(params)
                let res = await myFunctions.get('WebAccept/getList', params);
                if (res) {
                    this.isLoading = false;
                    this.count = res.count;
                    for(let prop of res.list) {
                        if(prop.o_type === 1) prop.o_type = '购买'
                        if(prop.o_type === 0) prop.o_type = '出售'
                    }
                    this.acceptanceList = res.list;
                    console.log(this.acceptanceList)
                }
            },
            //提交修改承兑单
            async submitForm() {
                let params = {
                    range_start : this.infoOfPublish.range_start,
                    range_end : this.infoOfPublish.range_end,
                    id : this.id,
                    amount : this.infoOfPublish.total,
                    price : this.infoOfPublish.unit_price,
                }
                let res = await myFunctions.post('WebAccept/modify', params)
                if(res.status === "SUCCESS") this.$message.success('修改成功')
                this.editVisible = false
                this.infoOfPublish = {
                    total: '',
                    range_start: '',
                    range_end: '',
                    unit_price: '',
                }
                this.acceptance()
            },
            // BTC按钮点击事件
            getBTCList() {
                if (this.isActive === 0) this.listQuery.status = 0;
                if (this.isActive === 1) this.listQuery.status = 1;
                if (this.isActive === 2) this.listQuery.status = 2;
                if (this.isActive === 3) this.listQuery.status = 4;;
                if (this.isActive === 4) this.listQuery.status = null;
                this.currency_id = 1
                this.acceptance()
            },
            //USTD按钮点击事件
            getUSDTList() {
                if (this.isActive === 0) this.listQuery.status = 0;
                if (this.isActive === 1) this.listQuery.status = 1;
                if (this.isActive === 2) this.listQuery.status = 2;
                if (this.isActive === 3) this.listQuery.status = 4;
                if (this.isActive === 4) this.listQuery.status = null;
                this.currency_id = 2
                this.listQuery = {status: this.listQuery.status, page: 1, limit: 10}
                this.acceptance()
            },
            //按钮切换点击事件
            btnClick() {
                if(this.radio === 'BTC') this.getBTCList()
                else this.getUSDTList()
            }
        }
    };
</script>

<style lang="less" scoped>
    @import "../../../styles/common";

    .container{
        margin-top: 30px;
        background: #FFF;
        border: 1px solid #DCDFE6;
    }
    .no-more-tips {
        text-align: center;
        margin: 30px 0 10px 0;
        color: #9aa5b5;
    }

    .header {
        .common-header
    }

    .order-header {
        max-width: 1200px;
        margin: 15px auto;
        display: flex;
        justify-content: space-between;

        &-status {
            flex-wrap: wrap;
            display: flex;
            align-items: center;
            font-size: 16px;

            span {
                border-bottom: 2px solid transparent;
                margin-right: 30px;
                font-weight: 500;
                display: inline-block;
                cursor: pointer;
                padding-bottom: 2px;

                &.active {
                    color: #357ce1;
                    border-bottom: 2px solid #357ce1;
                }
            }
        }
    }

    .order-table {
        min-width: 800px;
        max-width: 1200px;
        margin: 20px auto;
        /deep/.el-table__empty-block{
            display: none;
        }
    }

    .status-icon {
        line-height: 20px;
    }

    .limit {
        display: inline-block;
    }
    ::v-deep {
        .el-input--mini{
            display: inline-block;
            width: 47%;
        }
    }


</style>
