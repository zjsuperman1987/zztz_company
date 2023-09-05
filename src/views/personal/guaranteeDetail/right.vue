<template>
    <div class="right_box">
        <div class="right_top">
            <div class="rule_box">
                <div class="list">
                    <span>担保规则</span>
                    <ul>
                        <li v-for="item in 3" :key="item">{{item}}</li>
                    </ul>
                </div>
                <div class="member">
                    <div class="member_box">
                        <ul>
                            <li v-if="list.uid_b">
                                <span>参与人:</span>
                               <span class="join">{{ list.uid_b }}</span> 
                            </li>
                            <li v-if="list.observer">
                                <span>观察人:</span>
                               <span class="join">{{ list.observer }}</span>
                            </li>
                            <li v-if="applyList.length" class="li_info">
                                <span class="wait"> 待批准:</span>
                                <span class="member_info">
                                    <span class="btn_box" v-for="(item,index) in applyList" :key="index">
                                        <span class="member_id">{{ item.uid }}</span>
                                        <template v-if="userID === list.uid_a || isAdm">
                                            <el-button type="primary" size="mini" plain @click="agree(1,1)" v-if="(list.uid_a === userID || userID === isAdm)">参与人</el-button>
                                            <el-button type="primary" size="mini" plain @click="agree(1,2)" v-if="(list.uid_a === userID || userID === isAdm)">观察人</el-button>
                                            <!-- <el-button type="primary" @click="isAgreement(1)" disabled>已同意</el-button> -->
                                        </template>
                                    </span>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!--申请加入担保列表-->
            <div class="apply_box" v-if="pass">
                <el-tabs type="border-card">
                    <el-tab-pane label="待批准加入列表" v-if="userID === list.uid_a">
                        <apply-item :child="applyList" @call="getApplyList"></apply-item>
                    </el-tab-pane>
                    <el-tab-pane label="我申请的担保列表" v-else>
                        <apply-item :child="apply" @call="getApplyList"></apply-item>
                    </el-tab-pane>
                </el-tabs>
            </div>
            
            <div class="charge_in">
                <!-- <el-button @click="handler">按钮</el-button> -->
                <!-- 发起方提供担保金 -->
                <template v-if="userID === list.uid_a">
                    <div class="charge_box">
                        <span class="charge_text">当前您提供的担保金: {{ list.amount_a }} {{list.currency_id}}</span>
                        <span class="charge_text">当前您冻结的担保金: {{ list.frozen_a }} {{list.currency_id}}</span>
                    </div>
                    <div class="charge_btn">
                        <el-button type="primary" icon="el-icon-plus" @click="charge(1)" >充值担保金</el-button>
                        <el-button type="primary" icon="el-icon-minus" @click="charge(4)" >撤回担保金</el-button>
                        <el-button type="primary" icon="el-icon-view" @click="check">查看撤资</el-button>
                        <el-button type="primary" icon="el-icon-phone-outline" @click="complaint">投诉</el-button>
                    </div>
                </template>
                <!-- 参与方提供担保金 -->
                <template v-if="userID === list.uid_b">
                    <div class="charge_box">
                        <span class="charge_text" >当前您提供的担保金: {{ list.amount_b }} {{list.currency_id}}</span>
                        <span class="charge_text">当前您冻结的担保金: {{ list.frozen_b }} {{list.currency_id}}</span>
                    </div>
                    <div class="charge_btn">
                        <el-button type="primary" icon="el-icon-plus" @click="charge(1)" >充值担保金</el-button>
                        <el-button type="primary" icon="el-icon-minus" @click="charge(4)" >撤回担保金</el-button>
                        <el-button type="primary" icon="el-icon-view" @click="check">查看撤资</el-button>
                        <el-button type="primary" icon="el-icon-phone-outline" @click="complaint">投诉</el-button>
                    </div>
                </template>
                <!-- 平台方管理 -->
                <template v-if="userID === isAdm">
                    <div class="charge_box">
                        <span class="charge_text" >{{ list.uid_a}}提供的担保金: {{ list.amount_a }} {{list.currency_id}}</span>
                        <span class="charge_text">{{ list.uid_a}}冻结的担保金: {{ list.frozen_a }} {{list.currency_id}}</span>
                    </div>
                    <div class="charge_box" v-if="list.uid_b">    
                        <span class="charge_text">{{ list.uid_b}}提供的担保金: {{ list.amount_b }} {{list.currency_id}}</span>
                        <span class="charge_text">{{ list.uid_b}}冻结的担保金: {{ list.frozen_b }} {{list.currency_id}}</span>
                    </div>
                    <div class="charge_btn">
                        <el-button type="primary" icon="el-icon-plus" @click="charge(1)" v-if="userID !== isAdm">充值担保金</el-button>
                        <el-button type="primary" icon="el-icon-minus" @click="charge(4)" v-if="userID !== isAdm">撤回担保金</el-button>
                        <el-button type="primary" icon="el-icon-view" @click="check">查看撤资</el-button>
                        <el-button type="primary" icon="el-icon-phone-outline" @click="complaint" v-if="!isAdm">投诉</el-button>
                        <el-button type="primary" icon="el-icon-view" @click="viewAppeal" v-if="isAdm">查看投诉</el-button>
                        <el-button type="primary" icon="el-icon-view" @click="handlerAppeal" v-if="isAdm">处理投诉</el-button>
                    </div>
                </template>
            </div>

            <!--撤资列表-->
            <div class="withdraw_box" v-if="open">
                <el-tabs type="border-card" @tab-click="tabClick">
                    <el-tab-pane label="所有撤资">
                        <withdraw-item :child="lists"></withdraw-item>
                    </el-tab-pane>
                    <el-tab-pane label="我的撤资">
                        <withdraw-item :child="lists"></withdraw-item>
                    </el-tab-pane>
                    <el-tab-pane label="对方撤资">
                        <withdraw-item :child="lists"></withdraw-item>
                    </el-tab-pane>
                </el-tabs>
            </div>

            <!--投诉列表-->
            <div class="reply-list" v-if="isView">
                <div v-for="item in appealList" :key="item.id" class="every-list">
                    <div class="top">
                        <span style="margin-right: 30px">发布者：{{ item.uid }}</span>
                        <span>时间：{{ item.create_time }}</span>
                        <span>ID: {{ item.id }}</span>
                    </div>
                    <div class="bottom" v-viewer><span v-html="item.reason"></span></div>
                </div>
            </div>

            <!-- 管理员处理投诉 -->
            <div class="admin" v-if="adminShow">
                <div class="appeal_title">投诉列表</div>
                <el-table :data="appealList" size="mini" border @row-click="row_click">
                    <el-table-column label="ID" prop="id" align="center"></el-table-column>
                    <el-table-column label="操作" align="center">
                        <el-button type="primary" size="mini" @click="handler" v-if="list.status === '申诉中'">处理</el-button>
                        <el-button type="primary" size="mini" disabled @click="handler" v-else>已处理</el-button>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 管理员处理理由弹窗 -->
            <el-dialog :visible.sync="appealDialog" width="30%">
                <div style="margin-bottom: 5px">请填写理由:</div>
                <el-input type="textarea" v-model="content" placeholder="请输入填写理由: "></el-input>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="appealDialog = false">取 消</el-button>
                    <el-button type="primary" @click="submit">确 定</el-button>
                </span>
            </el-dialog>


            <chat></chat>

        </div>

        <!-- 担保金额输入弹框 -->
        <el-dialog :visible.sync="dialogGuarantee" width="30%">
        <span style="margin-right: 10px">请输入金额:</span>
        <el-input
            v-model="guaranteeNum"
            placeholder="请输入金额"
            style="width: 200px"
        ></el-input>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogGuarantee = false">取 消</el-button>
            <el-button type="primary" @click="Submit">确 定</el-button>
        </span>
        </el-dialog>

        <!--    交易密码弹窗-->
        <el-dialog
        title="请输入交易密码"
        :visible.sync="dialogPayPassword"
        :close-on-click-modal="false"
        v-dialog-drag
        custom-class="width400"
        >
        <el-form
            :model="formPayPassword"
            ref="formPayPassword"
            :rules="rules"
            @submit.native.prevent
            :show-message="false"
        >
            <el-form-item prop="payPwd">
            <el-input
                @keyup.enter.native="onSubmit('formPayPassword')"
                type="password"
                size="small"
                v-model="formPayPassword.payPwd"
            >
            </el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button
            size="small"
            type="primary"
            :loading="loading"
            @click="onSubmit('formPayPassword')"
            >
            确 定
            </el-button>
        </span>
        </el-dialog>

        <!-- 申诉提醒弹窗 -->
        <el-dialog :title="$t('currency.orderInfo.question')" :visible.sync="openAppeal" v-dialog-drag
                    :close-on-click-modal="false" custom-class="width500">
            <appeal-text></appeal-text>
            <div class="appeal-btn">
                <el-button size="small" type="primary" @click="appeal">{{$t('currency.orderInfo.appeal')}}</el-button>
            </div>
        </el-dialog>  

        <!--    申诉弹窗-->
        <el-dialog title="申诉" :visible.sync="dialogAppeal" v-dialog-drag
                   :close-on-click-modal="false" custom-class="width500">
            <el-form @submit.native.prevent :show-message="false">
                <el-form-item :label="$t('guarantee.text')">
                    <appeal-textarea v-model="textarea" path="adv" ref="textarea" :idList="idList" :fileList="fileList"
                                        placeholder="请输入您遇到的问题" :attachList="attachList">
                    </appeal-textarea>
                </el-form-item>
                <el-form-item class="appeal-btn">
                    <el-button size="small" type="primary" @click="submitAppeal">提交</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import myFunctions from '@/utils/myFunctions'
import { MD5 } from "crypto-js";
import {mapState} from "vuex";
const withdrawItem = () => import('./components/withdrawItem.vue')
const applyItem = () => import('./components/applyItem.vue')
const chat = () => import('./components/chat.vue')
const appealText = () => import('@/views/ThreeCoin/order/components/appealText')
const appealTextarea = () => import('@/components/textarea/index.vue')
export default {
    name: 'right',
    components: { withdrawItem, applyItem, chat, appealText, appealTextarea },
    data() {
        return {
            id: '',    //担保id
            appealID: null, //投诉ID
            type: '',  //用户类型
            lists: [],  //撤资列表
            apply: [],  //我的申请
            applyList: [], //申请列表
            appealList: [],//投诉列表 
            dialogGuarantee: false,
            dialogPayPassword: false,
            loading: false,
            pass: false,
            open: false,   //控制撤资列表
            openAppeal: false,  //控制投诉提醒弹窗
            dialogAppeal: false,//控制申诉弹框
            isView: false,   //控制投诉列表展示
            adminShow: false,//控制管理员投诉处理列表
            appealDialog: false, //控制管理员理由填写弹窗
            textarea: '',  // 投诉内容
            content: '',// 管理员处理理由
            idList: [],
            fileList: [],
            attachList: [],
            guaranteeNum: '',
            formPayPassword: {
                payPwd: "",
            },
            key: null,
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
            dollarRate: (state) => state.user.rate.BTC.usd,
            payPwd: (state) => state.user.userInfo.paypwd,
            list: (state) => state.order.guarantee_list,
            usdRate: (state) => state.user.rate.BTC.usd,
            isAdm: state => state.user.userInfo.is_adm,
        }),
        isAdm() {
            return localStorage.getItem('adm') * 1
        },
    },
    watch: {
        list: {
            handler() {
                this.getApplyList()
            }
        }
    },
    methods: {
        //同意加入为担保参与人或者观察人
        agree(val,type) {
            setTimeout(async() => {
                let res =await myFunctions.post('/WebGuarantee/replyJoin',{ gmid: this.list.id, opt: val, type: type} )
                if(res) {
                    this.isShow = false
                    this.$emit("call")
                    this.getDetail()
                    myFunctions.noticeOpposite(8,this.receiver)
                }
            },300)
        },

        //申请加入担保
        async applyJoin(val) {
            this.type = val
            if(this.userID === this.list.uid_a) return this.$message.error('这是您创建的担保, 不需要再加入!!!')
            let res =await myFunctions.post('/WebGuarantee/applyJoin', {id: this.list.id, type: this.type})
            if(res) this.$message.success('申请成功,请等待通过')
        },

        //充值担保金
        charge(val) {
            this.dialogGuarantee = true
            this.key =val 
        },

        //撤回担保金
        async withdraw() {
           
            let res =await myFunctions.post('/WebGuarantee/applyRefund', {id: this.list.id,amount:this.guaranteeNum})
            if(res) {
                console.log(res)
                this.dialogPayPassword = false;
                this.$message.success('撤资成功')
                this.$emit("call")
                this.withdrawList(0)
                this.withdrawList(2)
            }
        },

        //撤资列表
        async withdrawList(val) {
            let res =await myFunctions.post('/WebGuarantee/applyRefundList', {id: this.list.id, opt:val})
            if(res) {
                for(let prop of res) {
                    prop.amount = myFunctions.cutPoint(prop.amount,6)
                }
                this.lists = res
            }
        },

        // 是否需要输入密码
        Submit() {
            if (!this.guaranteeNum > 0)
            return this.$message.warning("请输入担保金额");
            this.dialogPayPassword = true;
            this.dialogGuarantee = false;
        },

        //验证交易密码
        onSubmit(formName) {
        if (this.payPwd) {
            this.$refs[formName].validate(async (valid, object) => {
            if (valid) {
                this.loading = true;
                if (this.key === 1) this.upGuarantee();
                if (this.key === 2) this.onDeal();
                if (this.key === 3) this.joinOrder();
                if (this.key === 4) this.withdraw();
                this.loading = false;
            } else this.myNotify(object);
            });
        } else this.$router.push({ name: "userInfo" });
        },

        //提交保证金
        async upGuarantee() {
        let params = {
            id: this.list.id,
            amount: this.guaranteeNum,
            pinpass: MD5(this.formPayPassword.payPwd).toString(),
        };
        let res = await myFunctions.post("/WebGuarantee/recharge", params);
        if (res) {
            this.$message.success("成功");
            this.dialogPayPassword = false;
            this.$emit("call");
            this.guaranteeNum = null;
            this.formPayPassword.payPwd = "";
        }
        },

        //发起交易
        openDeal() {
            this.dialogPayPassword = true;
            this.key = 2;
        },

        // 加入子交易单
        joinOrder() {
            setTimeout(async() => {
                let params = {
                oid: this.oid,
                pinpass: MD5(this.formPayPassword.payPwd).toString(),
                };
                let res = await myFunctions.post("/WebGuarantee/joinOrder", params);
                console.log(res);
            },300)
        },

        //撤资按钮切换
        tabClick(val) {
            if(val.index === '0') this.withdrawList(0)
            if(val.index === '1') this.withdrawList(2)
            if(val.index === '2') this.withdrawList(1)
        },

        //选项卡事件
        tab_Click(targetName) {
            if(targetName.index === '0') this.getApplyList()
            if(targetName.index === '1') this.getApplyList()
        },

        //查看我的申请和通过其他人的申请 列表
        view() {
            this.pass = !this.pass
            if(this.pass) this.getApplyList()
        },

        // 获取申请列表
        async getApplyList() {
            let res =await myFunctions.get('/WebGuarantee/applyJoinList', {id: this.list.id})
            if(res) {
                this.applyList = res
            }
        },

        //查看撤资列表
        check() {
            this.open = !this.open
            if(this.open) this.withdrawList(0)
        },

        //点击投诉事件
        complaint() {
            this.openAppeal = true
        },

        //确定申诉
        appeal() {
            this.openAppeal = false
            this.dialogAppeal = true
        },

        // 申诉确认提交
        async submitAppeal() {
            if (!this.textarea) return this.$message.warning('请输入内容');
            if(this.list.status === '申诉中') return this.$message.warning('当前担保单正在申诉,请耐心等待!!!')
            let params = {
                id: this.list.id,
                reason: this.textarea,
                attach: this.idList.length ? this.idList.toString() : 0
            }
            let res = await myFunctions.post('/WebGuarantee/appeal', params)
            if (res) {
                this.textarea = ''
                this.$message.success('您的信息已提交')
                this.dialogAppeal = false
                this.$emit("call")
                // myFunctions.noticeOpposite('appeal', this.user.toUid,this.data.appeal)//通知对方
            }
        },

        //查看投诉
        viewAppeal() {
            this.isView = !this.isView
            if(this.isView) this.getApply()
        },

        //请求投诉列表
        async getApply() {
            let res =await myFunctions.get('/WebGuarantee/DetailAppeal',{id: this.list.id})
            if(res) {
                for(let prop of res) {
                    if(prop.status === 1) prop.status = '申诉中'
                    if(prop.status === 2) prop.status = '已解决'
                    prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                }
                this.appealList = res
            }
        },

        // 管理员投诉处理列表行点击事件
        row_click(val) {
            this.appealID = val.id
        },

        handlerAppeal() {
            this.adminShow = !this.adminShow
            if(this.adminShow) this.getApply() 
        },

        //打开管理员处理投诉弹窗
        handler() {
            this.appealDialog = true
        },

        // 提交管理员处理理由
        async submit() {
            let res = await myFunctions.post('/WebGuarantee/admDealAppeal',{aid: this.appealID, reason_adm: this.content})
            if(res) {
                this.content = ''
                this.getApply()
                this.$emit("call")
                this.appealDialog = false
            }
        }
    },
}
</script>

<style lang="less" scoped>
    .right_box{
        
        .right_top{
            margin: 0 0 10px 0;
            background: #90AADB;

            .rule_box{
                padding: 5px 10px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;

                .list{
                    background: #999;
                    width: 45%;
                }
                .member{
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    background: #888;
                    width: 50%;
                    padding: 0 10px;
                    font-size: 10px;
                    .join{
                        margin-left: 10px;
                    }
                    .li_info{
                        display: flex;
                        flex-direction: row;
                        justify-content: flex start;
                        align-items: center;
                        color: #fff;
                        .wait{
                            display: inline-block;
                            line-height: 22px;
                        }
                        .member_info{
                            display: inline-block;
                            width: 170px;
                            margin-left: 10px;
                            .btn_box{
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                .member_id{
                                    display: inline-block;
                                    height: 22px;
                                    line-height: 22px;
                                }
                                span{
                                    display: inline-block;
                                    width: 60px;
                                }
                            }
                        }
                    }
                }
            }
            .charge_in{
                padding: 10px 10px 0;

                .charge_box{
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;  

                    .charge_text{
                        font-weight: 700;
                    }
                }
               
                .charge_btn{
                    margin-top: 5px;
                }
            }

            .withdraw_box{
                padding: 10px;
            }

            .appeal_box{
                padding: 10px;
                margin: 10px;
                background: #fff;
                .appeal_title{
                    color: #555;
                    padding-bottom: 5px;
                }
            }
            .apply_box{
                margin: 10px;
                background: #fff;
            }

            .reply-list {
                background: #f4f4f4;
                max-height: 500px;
                overflow-y: auto;
                margin: 10px;

                .every-list {
                    border: 1px solid #000;

                    &:not(:last-child) {
                        margin-bottom: 6px;
                    }
                }

                .top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #DDDADA;
                    padding: 0 6px;
                    min-height: 28px;
                    line-height: 28px;

                    .left{
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                    }
                }

                .bottom {
                    padding: 4px;
                    min-height: 40px;
                }
            }

            .admin{
                padding: 10px;

                .appeal_title {
                    margin-bottom: 5px;
                    font-weight: 500;
                }
            }


        }
    }

    
</style>