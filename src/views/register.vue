<template>
    <div class="main">
        <div>
            <el-button @click="$router.push('/')" size="small" type="primary" round>{{ $t('login.backHome') }}
            </el-button>
        </div>
        <div class="top">
            <div class="main-register">
                <div class="re-img">
                    <router-link :to="{ path: '/' }">
                        <img src="~@/assets/image/logo-lo-re.png" alt="">
                    </router-link>
                </div>
                <div class="register-form">
                    <h1>{{ $t('register.create') }}</h1>
                    <p style="font-weight: 600;margin-bottom: 10px">{{ $t('register.des') }}</p>
                    <el-form :model="registerForm" ref="registerForm" :rules="rules" size="small" :show-message="false">

                        <el-form-item prop="passWord">
                            <el-tooltip placement="right" :content="$t('register.desPwd')">
                                <el-input @keyup.enter.native="handleRegister" :validate-event="false"
                                          clearable ref="passWord" v-model.trim="registerForm.passWord" :placeholder="$t('register.pwd')"
                                          type="password" size="small" prefix-icon="iconfont iconmima"></el-input>
                            </el-tooltip>
                        </el-form-item>
                        <el-form-item prop="checkPassword">
                            <el-tooltip placement="right" :content="$t('register.desPwd1')">
                                <el-input @keyup.enter.native="handleRegister" v-model.trim="registerForm.checkPassword"
                                          ref="checkPassword" clearable
                                          :placeholder="$t('register.desPwd2')" size="small" :validate-event="false"
                                          type="password" prefix-icon="iconfont iconmima"></el-input>
                            </el-tooltip>
                        </el-form-item>
                        <el-form-item prop="introducer">
                            <el-tooltip placement="right" :content="$t('register.desIntro')">
                                <el-input @keyup.enter.native="handleRegister" :validate-event="false"
                                          clearable ref="introducer"
                                          v-model.trim="registerForm.introducer" :placeholder="$t('register.introducer')"
                                          type="text" size="small" prefix-icon="el-icon-share"></el-input>
                            </el-tooltip>
                        </el-form-item>
                        <p class="tips">{{ $t('login.register') }}
                            <router-link :to="{ name: 'notice-details', query: { id: 5, type: 'info' } }"
                                         target="_blank">{{$t('login.agreement')}}
                            </router-link>
                            {{ $t('login.and') }}
                            <router-link :to="{ name: 'notice-details', query: { id: 6, type: 'info' } }"
                                         target="_blank">{{$t('login.privacy')}}
                            </router-link>
                        </p>
                        <el-form-item>
                            <el-button size="small" @click="handleRegister('registerForm')"
                                       class="login-button" type="primary"
                                       :loading="registerLoading" round>{{ $t('register.reg') }}
                            </el-button>
                        </el-form-item>
                    </el-form>
                    <el-divider></el-divider>
                    <p class="has-account">
                        <span>{{ $t('register.have') }}</span>
                        <router-link :to="{ name: 'login' }" class="login">{{ $t('register.signIn') }}</router-link>
                    </p>
                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="line"></div>
            <div class="bottom-link">
                <router-link :to="{ name: 'notice-details', query: { id: 5, type: 'info' } }">
                    {{$t('login.agreement')}}
                </router-link>
                <router-link :to="{ name: 'notice-details', query: { id: 6, type: 'info' } }">{{$t('login.privacy')}}
                </router-link>
            </div>
            <p class="copy-right">{{$t('login.copyright')}}</p>
        </div>
    </div>
</template>

<script>
    import {MD5} from 'crypto-js'

    export default {
        name: "register",
        data() {
            //  表单校验
            let validatePass = (rule, value, callback) => {
                if (this.registerForm.checkPassword !== this.registerForm.passWord) callback(new Error(this.$t('account.notSame')));
                callback();
            };
            return {
                registerLoading: false,
                centerDialogVisible: false,
                //注册表单
                registerForm: {
                    passWord: '',
                    checkPassword: '',
                    introducer: '',
                },
                rules: {      //表单规则
                    passWord: [
                        {required: true, message: this.$t('register.noPwd')},
                        {
                            pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/,
                            message: this.$t('account.errorPwd'), trigger: 'blur'
                        }
                    ],
                    checkPassword: [
                        {required: true, message: this.$t('register.confirmPwd')},
                        {validator: validatePass},
                    ]
                }
            }
        },
        mounted() {
            if (this.registerForm.passWord === '') this.$refs.passWord.focus()
            // if (this.registerForm.checkPassword === '') this.$refs.checkPassword.focus()
            // if (this.registerForm.introducer === '') this.$refs.introducer.focus()
        },
        methods: {
            handleRegister() {
                this.registerLoading = true
                this.$refs.registerForm.validate((valid, object) => {
                    if (!valid) this.$validateNotify(object)
                    if (valid) {
                        let params = {pwd: MD5(this.registerForm.passWord).toString(),introducer: this.registerForm.introducer}
                        this.$http('/WebUser/save', {method: 'post', params}).then(res => {
                            if (res) this.$router.push({name: 'login', query: {uid: res.uid, centerDialogVisible: true}})
                        })
                    }
                })
                this.registerLoading = false
            },
        },
    }
</script>

<style scoped lang="less">
    @import "~@/styles/register.less";
</style>
