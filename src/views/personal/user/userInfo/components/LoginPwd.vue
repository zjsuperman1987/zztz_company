<template>
    <div>
        <span @click="handelDialogLoginPassword('form')">{{ $t('account.edit') }}</span>

        <el-dialog :title="$t('account.editLogin')" :visible.sync="dialogVisible"
                   v-dialogDrag :close-on-click-modal="false" custom-class="width400">
            <el-form size="small" ref="form" :rules="rules"
                     :model="formPassword" :show-message="false">
                <el-form-item :label="$t('account.newPwd')" prop="newPassword">
                    <el-input @keyup.native.enter="submitPasswordForm('form')"
                              v-model="formPassword.newPassword" type="password"
                              :placeholder="$t('account.validPwd')"
                              clearable show-password></el-input>
                </el-form-item>
                <el-form-item :label="$t('account.confirmPwd')" prop="checkPassword">
                    <el-input @keyup.native.enter="submitPasswordForm('form')"
                              v-model="formPassword.checkPassword" type="password"
                              :placeholder="$t('account.validPwd')"
                              clearable show-password></el-input>
                </el-form-item>
                <el-form-item :label="$t('account.oldPwd')" prop="oldPassword">
                    <el-input @keyup.native.enter="submitPasswordForm('form')"
                              v-model="formPassword.oldPassword" type="password"
                              :placeholder="$t('account.oldPwd')"
                              clearable show-password></el-input>
                </el-form-item>
                <el-form-item :label="$t('account.payPwd')" prop="payPassword">
                    <el-input @keyup.native.enter="submitPasswordForm('form')"
                              v-model="formPassword.payPassword" type="password"
                              :placeholder="$t('account.payPwd')"
                              clearable show-password></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button size="small" type="primary" @click="submitPasswordForm('form')">
                    {{ $t('button.confirm') }}
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import {MD5} from "crypto-js";

    export default {
        name: "LoginPwd",
        data() {
            let validateTelPass = (rule, value, callback) => {
                if (this.formTelPassword.newPasswordConfirm !== this.formTelPassword.newPassword) callback(new Error(this.$t('account.notSame')));
                callback();
            };
            let validatePass = (rule, value, callback) => {
                if (this.formPassword.checkPassword !== this.formPassword.newPassword) callback(new Error(this.$t('account.notSame')));
                callback();
            };
            return {
                dialogVisible: false,
                //  交易密码修改登录密码
                formPassword: {
                    payPassword: '',
                    oldPassword: '',
                    newPassword: "",
                    checkPassword: ""
                },

                rules: {
                    payPassword: [
                        {required: true, message: this.$t('account.desPayPwd'), trigger: 'blur'},
                        {pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/, message: this.$t('account.errorPwd'), trigger: 'blur'}
                    ],
                    oldPassword: [{required: true, message: this.$t('account.desOldPwd'), trigger: 'blur'},],
                    newPassword: [
                        {required: true, message: this.$t('account.desNewPwd'), trigger: 'blur'},
                        {pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/, message: this.$t('account.errorPwd'), trigger: 'blur'}
                    ],
                    checkPassword: [
                        {required: true, message: this.$t('account.desConfirmPwd'), trigger: 'blur'},
                        {validator: validatePass, trigger: "blur"},
                    ],
                    newPasswordConfirm: [
                        {required: true, message: this.$t('account.desConfirmPwd'), trigger: 'blur'},
                        {validator: validateTelPass, trigger: "blur"},
                    ],
                }
            }
        },
        computed: {
            ...mapState({
                payPwd: state => state.user.userInfo.paypwd,
            })
        },
        methods: {
            // 登录密码弹窗
            async handelDialogLoginPassword(form) {
                if (this.payPwd) this.dialogVisible = true;
                else return this.$message.warning(this.$t('account.noPayPwd'));
                this.$nextTick(() => {
                    this.$refs[form].resetFields()
                })
            },
            submitPasswordForm(formName) {
                this.$refs[formName].validate((valid, object) => {
                    if (valid) {
                        let params = {
                            opt: 1,
                            pay_password: MD5(this.formPassword.payPassword).toString(),
                            old_password: MD5(this.formPassword.oldPassword).toString(),
                            new_password: MD5(this.formPassword.newPassword).toString(),
                        }
                        this.$http('/WebUser/update', {method: "post", params}).then(res => {
                            if (res) {
                                this.dialogVisible = false;
                                this.$store.commit('user/CLEAR_STATE')
                                this.$message.success(this.$t('account.reLogin'))
                                setTimeout(() => {
                                    this.$router.push({name: 'home'})
                                }, 1000)
                            }
                        });
                    } else {
                        this.$validateNotify(object)
                    }
                });
            },
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/personal/userInfo.less";
</style>
