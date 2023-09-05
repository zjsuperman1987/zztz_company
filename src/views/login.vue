<template>
    <div class="main">
        <div>
            <el-button size="small" type="primary" @click="$router.push({ name: 'home' })" round>
                {{ $t('login.backHome') }}
            </el-button>
        </div>
        <div class="top">
            <div class="main-login">
                <div class="img-logo">
                    <router-link :to="{ path: '/' }">
                        <img src="~@/assets/image/logo-lo-re.png" alt="">
                    </router-link>
                </div>
                <div style="background: #fefef2;padding: 10px;">
                    <div class="login-form">
                        <h1>{{ $t('login.signIn') }}</h1>
                        <el-form :model="loginForm" ref="loginForm" :rules="rules" size="small" :show-message="false">
                            <el-form-item prop="uid">
                                <el-input v-model.trim="loginForm.uid" placeholder="UID" type="username"
                                          :validate-event="false" clearable ref="username"
                                          prefix-icon="iconfont icondenglu" size="small"
                                          @keyup.enter.native="handleLogin('loginForm')"></el-input>
                            </el-form-item>
                            <el-form-item prop="passWord">
                                <el-input v-model.trim="loginForm.passWord" :placeholder="$t('login.desPwd')"
                                          type="password" 
                                          :validate-event="false" clearable ref="password"
                                          prefix-icon="iconfont iconmima" size="small"
                                          @keyup.enter.native="handleLogin('loginForm')"></el-input>
                            </el-form-item>
                            <p class="tips">{{ $t('login.agree') }}
                                <router-link :to="{ name: 'notice-details', query: { id: 5, type: 'info' } }"
                                             target="_blank">{{$t('login.agreement')}}
                                </router-link>
                                {{ $t('login.and') }}
                                <router-link :to="{ name: 'notice-details', query: { id: 6, type: 'info' } }"
                                             target="_blank">{{$t('login.privacy')}}
                                </router-link>
                            </p>
                            <el-form-item>
                                <el-button @click="handleLogin('loginForm')"
                                           class="login-button" type="primary" size="small"
                                           :loading="loginLoading" round>{{ $t('login.signIn') }}
                                </el-button>
                            </el-form-item>
                            <router-link :to="{ name: 'forgetPassword' }" class="forget">{{ $t('login.forgot') }}
                            </router-link>
                        </el-form>
                    </div>
                    <el-divider content-position="center">{{ $t('home.newAccount') }}</el-divider>
                    <router-link :to="{ name: 'register' }">
                        <el-button class="login-button register" size="small">{{ $t('home.createAccount') }}</el-button>
                    </router-link>
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

        <el-dialog title="注册成功" :visible.sync="centerDialogVisible" width="30%" center>
            <div class="text">您的登录UID为 {{ loginForm.uid }},请牢记此ID</div>
            <div class="text">请用您注册的账户和密码登录</div>
        </el-dialog>
    </div>
</template>

<script>
    import {MD5} from 'crypto-js'
    export default {
        name: "login",
        data() {
            return {
                loginLoading: false,  //loading
                centerDialogVisible: Boolean(this.$route.query.centerDialogVisible) ? Boolean(this.$route.query.centerDialogVisible) : false,
                loginForm: {  //登录表单
                    uid: this.$route.query.uid ? this.$route.query.uid : '',
                    passWord: '',
                },
                rules: {  //表单规则
                    uid: [{required: true, message: '请输入UID'},],
                    passWord: [{required: true, message: '请输入密码'},],
                },
                redirect: undefined,
                otherQuery: {}
            }
        },
        watch: {
            $route: {
                handler: function (route) {
                    const query = route.query
                    console.log(query)
                    if (query) {
                        this.redirect = query.redirect
                        this.otherQuery = this.getOtherQuery(query)
                    }
                },
                immediate: true
            }
        },
        mounted() {
            if (JSON.stringify(this.loginForm.uid) === '""') this.$refs.username.focus()
            // if (this.loginForm.passWord === '') this.$refs.password.focus()
        },
        methods: {

            //登录
            handleLogin: function (formName) {
                this.$refs[formName].validate(async (valid, object) => {
                    if (!valid) this.$validateNotify(object)
                    if (valid) {
                        this.$store.commit('home/gloading', true)
                        this.loginLoading = true
                        let params = {
                            pwd: MD5(this.loginForm.passWord).toString(),
                            uid: this.loginForm.uid
                        }
                        console.log('login', params)
                        this.$store.dispatch('user/login', params)
                        this.$store.commit('home/gloading', false)
                        localStorage.setItem('uid', this.loginForm.uid)
                        this.$router.push({path: this.redirect || '/', query: this.otherQuery})
                        this.loginLoading = false
                    }
                })
            },
            getOtherQuery(query) {
                return Object.keys(query).reduce((acc, cur) => {
                    if (cur !== 'redirect') acc[cur] = query[cur]
                    return acc
                }, {})
            }
        }
    }
</script>

<style scoped lang="less">
    @import "../styles/login";
</style>
