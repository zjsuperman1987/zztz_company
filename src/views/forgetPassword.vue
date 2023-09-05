<template>
    <div class="forgetPassword">
        <div>
            <router-link :to="{ name: 'home' }">
                <el-button size="small" type="primary" round>回首页</el-button>
            </router-link>
        </div>
        <div class="forget-form">
            <div class="title">密 码 重 置</div>
            <el-steps :active="stepActive" simple finish-status="success">
                <el-step @click.native="backStep(0)" title="身份验证"></el-step>
                <el-step title="重置密码"></el-step>
                <el-step title="重置完成"></el-step>
            </el-steps>
            <div v-show="stepActive === 0">
                <el-form :rules="rules" :model="telegram" ref="telegram" :show-message="false">
                    <el-form-item prop="telegram_account">
                        <el-input size="small" v-model="telegram.telegram_account" clearable type="text"
                                  placeholder="请输入电报号：@XXX"></el-input>
                    </el-form-item>
                    <el-form-item prop="code">
                        <el-row>
                            <el-col :span="18">
                                <el-input size="small" v-model="telegram.code" placeholder="请输入6位数验证码"
                                          oninput="if(value.length>6)value=value.slice(0,6)" type="number">
                                </el-input>
                            </el-col>
                            <el-col :span="6" style="text-align: right">
                                <el-button size="small" @click="getVerificationCode('telegram')" :disabled="noClick"
                                           type="primary"
                                >{{getVerification}}
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
                <el-button size="small" round :loading="step1Loading" style="width: 100%"
                           type="primary" @click="nextStep('telegram')">下一步
                </el-button>
            </div>
            <div v-show="stepActive === 1">
                <el-form :rules="rules" :model="passwordConfirm" ref="passwordConfirm" :show-message="false">
                    <el-form-item prop="newPassword">
                        <el-input size="small" type="password" placeholder="新密码"
                                  v-model.trim="passwordConfirm.newPassword"></el-input>
                    </el-form-item>
                    <el-form-item prop="newPasswordConfirm">
                        <el-input size="small" type="password" placeholder="确认密码"
                                  v-model.trim="passwordConfirm.newPasswordConfirm"></el-input>
                    </el-form-item>
                </el-form>
                <el-button size="small" round style="width: 100%;" type="primary"
                           @click="submitNewPassword('passwordConfirm')">确认重置
                </el-button>
            </div>
            <div v-show="stepActive === 2">
                <div class="step-3">
                    <p>(‐＾▽＾‐) 新登录密码重置成功，请重新登录！</p>
                    <router-link :to="{ name: 'login' }">
                        <el-button type="primary">重新登录</el-button>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {MD5} from 'crypto-js'

    export default {
        name: "login",
        data() {
            let validatePass = (rule, value, callback) => {
                if (this.passwordConfirm.newPasswordConfirm !== this.passwordConfirm.newPassword) callback(new Error("两次密码不一致"));
                callback();
            }
            return {
                stepActive: 0, // 步骤条
                step1Loading: false,
                telegram: {
                    telegram_account: '',
                    code: '',
                },
                getVerification: '获取验证码',
                noClick: false,
                passwordConfirm: {
                    newPassword: '',
                    newPasswordConfirm: '',
                },
                rules: {
                    telegram_account: [
                        {required: true, message: '请输入电报账号', trigger: 'blur'},
                        {
                            pattern: /^(https:\/\/t.me\/|@)[\d\w_-]{3,25}/,
                            message: '格式错误，https://t.me/xxx或者@xxx', trigger: 'blur'
                        }
                    ],
                    newPassword: [
                        {required: true, message: '请输入新密码', trigger: 'blur'},
                        {
                            pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/,
                            message: '格式错误，字母数字特殊三选二，最少6位', trigger: 'blur'
                        }
                    ],
                    newPasswordConfirm: [
                        {required: true, message: '请确认新密码', trigger: 'blur'},
                        {validator: validatePass, trigger: "blur"},
                    ],
                    code: [
                        {required: true, message: '请输入验证码', trigger: 'blur'},
                        {pattern: /^\d{6}$/, message: '验证码是6位纯数字', trigger: "blur"}
                    ],
                }
            }
        },
        methods: {
            nextStep(formName) {
                this.$refs[formName].validate((valid, object) => {
                    if (valid) {
                        this.step1Loading = true
                        setTimeout(() => {
                            this.stepActive = 1
                            this.step1Loading = false
                        }, 1000)
                    } else this.$validateNotify(object)
                })
            },
            backStep(val) {
                if (val < this.stepActive) this.stepActive = val
            },
            //  获取验证码
            getVerificationCode(formName) {
                this.$refs[formName].validateField('telegram_account', (valid, err) => {
                    if (!valid) {
                        this.$http.get('/WebLogin/forgetSend', {username: this.telegram.telegram_account}).then(res => {
                            if (res) {
                                this.noClick = true
                                let count = 59;
                                let timer = setInterval(() => {
                                    if (count === 0) {
                                        clearInterval(timer)
                                        this.noClick = false
                                        this.getVerification = this.$options.data().getVerification
                                    } else this.getVerification = `重新发送(${count--})`
                                }, 1000)
                            }
                        })
                    } else this.$validateNotify(err)
                })
            },
            // 提交新密码
            submitNewPassword(formName) {
                this.$refs[formName].validate((valid, object) => {
                    if (valid) {
                        let params = {
                            v_code: this.telegram.code,
                            username: this.telegram.telegram_account,
                            new_password: MD5(this.passwordConfirm.newPassword).toString()
                        }
                        this.$http('/WebLogin/forgetSetPwd', {method: 'post', params}).then(res => {
                            if (res) this.stepActive = 2
                        })
                    } else this.$validateNotify(object)
                })
            },
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/forgetPassword.less";
</style>
