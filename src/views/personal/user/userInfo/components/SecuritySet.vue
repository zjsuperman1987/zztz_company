<template>
    <div>
        <el-row class="item-nav">
            <el-col :span="17">
                <div class="nick-name common">
                    <i class="iconfont icon-anquanyanzheng"></i>
                    <div class="description">
                        <p class="subtitle">二次安全验证设置</p>
                        <p class="tip" v-if="telegramAccount && payPwd">紧急挂失账号，找回账号，有绑定电报者可通过电报操作，未绑定者请使用安全密钥操作</p>
                        <p class="tip" v-else>紧急挂失账号，找回账号，有绑定电报者可通过电报操作，未绑定者请使用安全密钥操作，<span style="color: red">需先绑定电报号和设置交易密码</span>
                        </p>
                    </div>
                </div>
            </el-col>
            <el-col :span="5">
                <span>当前验证类型：{{ auth === 1 ? '电报验证' : '交易密码验证' }}</span>
            </el-col>
            <el-col :span="2">
                <el-button type="text" v-if="telegramAccount && payPwd" @click="openDialog">设 置</el-button>
            </el-col>
        </el-row>

        <el-dialog title="二次安全验证设置" :visible.sync="dialogVisible" v-dialogDrag
                   custom-class="width350" :close-on-click-modal="false">
            <el-select size="small" v-model="chooseSet" placeholder="请选择">
                <el-option label="交易密码验证" value="0"></el-option>
                <el-option label="电报验证" value="1"></el-option>
            </el-select>
            <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="submitSecuritySetForm">确定</el-button>
      </span>
        </el-dialog>

    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "SecuritySet",
        data() {
            return {
                dialogVisible: false,
                chooseSet: ''
            }
        },
        computed: {
            ...mapState({
                payPwd: state => state.user.userInfo.paypwd,
                telegramAccount: state => state.user.userInfo.telegram_account,
                auth: state => state.user.userInfo.auth,
            })
        },
        methods: {
            openDialog() {
                this.chooseSet = this.auth + ''
                this.dialogVisible = true
            },
            // 提交
            submitSecuritySetForm() {
                this.$http('WebUser/update', {method: 'post', params : {auth: this.chooseSet, opt: 0}}).then(res => {
                    if (res) {
                        this.dialogVisible = false
                        this.$store.dispatch('user/getInfo')
                        this.$message.success('设置成功')
                    }
                })
            },
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/personal/userInfo.less";
</style>
