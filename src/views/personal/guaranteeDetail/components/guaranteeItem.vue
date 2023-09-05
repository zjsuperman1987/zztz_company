<template>
    <div class="container">
        <!--担保子单子列表-->
        <div class="deal_box">
            <h3 style="margin-bottom: 5px; color: #777">担保子单子列表:</h3>
            <el-table :data="itemList" border highlight-current-row>
                <el-table-column label="ID" prop="id" width="40" align="center"></el-table-column>
                <el-table-column label="名称" prop="title" width="80" align="center"></el-table-column>
                <el-table-column label="状态" prop="status" width="50" align="center"></el-table-column>
                <el-table-column label="创建人" prop="uid" width="50" align="center"></el-table-column>
                <el-table-column label="创建时间" prop="create_time" width="110" align="center"></el-table-column>
                <el-table-column label="发起方押金" prop="amount_a" width="80" align="center"></el-table-column>
                <el-table-column label="参与方押金" prop="amount_b" width="80" align="center"></el-table-column>
                <el-table-column label="操作" prop="num" align="center" width="180">
                    <template slot-scope="{ row }">
                        <el-button type="primary" @click="joinOrder(row, 'join')" v-if="!isAdm">加入</el-button>
                        <!-- <el-button type="primary" @click="joinOrder( row,'reject')" v-if="row.uid !== userID && !isAdm && (row.confirm_b === 1 || 
                        row.confirm_a === 1)">拒绝</el-button> -->
                        <el-button type="primary" @click="complete(row)" v-if="!isAdm && (row.confirm_a === 2 && row.confirm_b === 2) || 
                        (row.confirm_a === 2 && row.confirm_b === 4 ) || (row.confirm_b === 2 && row.confirm_a === 4 )">完成</el-button> 

                        <!-- 管理员操作按钮 取消是在发起方创建了单子,另一方没有参与进来, 发起方申诉后管理员取消单子 
                        完成实在双方都参与的情况下,一方未选择完成或忘记, 另一方申诉此单子已完成, 管理员确认后强制完成
                        理赔是在单子中双方出现违约情况, 申诉后需管理员按例处理赔偿.-->
                        <template v-if="row.status !== '已退款'">
                            <el-button type="primary" @click="admCancel(row)" v-if="isAdm">取消</el-button>
                            <el-button type="primary" @click="admCompete(row)" v-if="isAdm">完成</el-button>
                            <el-button type="primary" @click="payDialog = true" v-if="isAdm">理赔</el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!--管理员理赔弹窗-->
        <el-dialog title="理赔" :visible.sync="payDialog" :close-on-click-modal="false" v-dialog-drag custom-class="width400">
            <el-form :model="formPay" ref="formPay" :rules="rules" @submit.native.prevent :show-message="false">
                <el-form-item prop="payer">
                    <div>请选择需要赔付的一方: (违约方)</div>
                    <el-radio-group v-model="radio" size="mini">
                        <el-radio label="1" border>{{ uid_a }}</el-radio>
                        <el-radio label="2" border>{{ uid_b }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="amount">
                    <div>请输入赔付金额: </div>
                <el-input @keyup.enter.native="paySubmit('formPay')" placeholder="请输入金额" type="text" size="small" v-model="formPay.amount">
                </el-input>
                </el-form-item>
            </el-form>
            <el-button size="small" type="primary" :loading="loading" @click="paySubmit('formPay')">确 定</el-button>
        </el-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import myFunctions from "@/utils/myFunctions";
export default {
    name: 'guaranteeItem',
    data() {
        return{
            itemList: [], // 担保流水列表
            itemTotal: 0,
            uid_a: '',
            uid_b: '',  
            type: '',
            formPay: {
                payer: '',  
                amount: ''  //赔付金额
            },
            radio: 1,  
            payDialog: false,
            loading: false,
            dealListQuery: {
                limit: 20,
                page: 1,
            },
            rules: {
                payPwd: [
                { required: true, message: "【请输入密码】", trigger: "blur" },
                {
                    pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/,
                    message: "【格式错误，字母数字特殊三选二，最少6位】",
                    trigger: "blur",
                },
                ],
            },
        }
    },
    computed: {
        ...mapState({
            userID: (state) => state.user.userInfo.id,
            payPwd: (state) => state.user.userInfo.paypwd,
            list: (state) => state.order.guarantee_list,
            isAdm: state => state.user.userInfo.is_adm,
        })
    },
    watch: {
        list: {
            handler() {
                this.getDealOrder();
            },
            deep: true,
        },
    },
    methods: {
        //获取子单列表
        async getDealOrder() {
            let params = { limit: this.dealListQuery.limit, page: this.dealListQuery.page, id: this.list.id}
            let res = await myFunctions.get("/WebGuarantee/DetailOrders", params);
            if (res) {
                console.log(res.data)
                for (let prop of res.data) {
                    prop.amount = parseFloat(prop.amount);
                    if(prop.status === 1) prop.status = '已创建'
                    if(prop.status === 2) prop.status = '进行中'
                    if(prop.status === 3) prop.status = '已结束'
                    if(prop.status === 4) prop.status = '已退款'
                    prop.amount_a = parseFloat(prop.amount_a)
                    prop.amount_b = parseFloat(prop.amount_b)
                    prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                }
                this.itemList = res.data.reverse();
                this.itemTotal = res.total;
            }
        },

        // 加入子交易单
        async joinOrder(row, val) {
            if(this.userID === row.uid) return this.$message.warning('您已加入, 不用再加入了!!')
            if(this.userID === this.list.uid && row.confirm_b === 2) return this.$message.warning('您已加入, 不用再加入了!!')
            if(this.userID !== this.list.uid_b && row.confirm_b === 1) return this.$message.warning('您暂无权限加入!!') 
            let params = { oid: row.oid, opt: val };
            let res = await myFunctions.post("/WebGuarantee/joinOrder", params);
            if(res) this.getDealOrder();
        },

        //完成子单子交易
        async complete( row ) {
            let res = await myFunctions.post('/WebGuarantee/completeOrder',{oid: row.oid})
            if(res) this.getDealOrder()
            this.$message.success('你已完成交易')
        },

        // 管理员强制取消或者完成 子单子
        async admHandler(row) {
            console.log(row)
            if(row.status === '已创建') this.type = 'cancel'
            if(row.status === '进行中') this.type = 'complete'
            let res = await myFunctions.post('/WebGuarantee/admDealOrder', {oid: row.id, opt: this.type})
            if(res) this.getDealOrder()
        },

        admCancel(row) {
            if(row.status === '进行中') return this.$message.warning('该单已进行, 不能取消!!')
            this.admHandler(row)
        },
        admCompete(row) {
            if(row.status === '已创建') return this.$message.warning('该单未进行, 不能完成!!')
            this.admHandler(row)
        },

        //管理员理赔提交
        async paySubmit() {
            if(this.radio === '1') this.payer = this.uid_a
            if(this.radio === '2') this.payer = this.uid_b
            let params = { oid:this.oid,payer: this.payer, amount: this.formPay.amount }
            let res = await myFunctions.post('/WebGuarantee/admCompensate',params)
            if(res) {
                this.getDealOrder()
                this.payDialog = false
                this.$message.success('理赔成功!')
            } 
        },
    },
}
</script>

<style lang="less" scoped>
::v-deep {
    .el-dialog {
        .radio_box{
            margin-bottom: 15px;
        }
        .el-box {
            padding: 5px 0;
        }

        .el-input--small {
            display: inline-block;
            width: 100%;
            padding: 10px 0;
        }

        .radio{
            margin-right: 20px;
        }
    }
}
</style>