<template>
    <div>
        <el-row class="item-nav">
            <el-col :span="17">
                <div class="nick-name common">
                    <i class="iconfont icon-nicheng"></i>
                    <div class="description">
                        <p class="subtitle">昵称</p>
                        <p class="tip">在首页交易列表中展示您的昵称</p>
                    </div>
                </div>
            </el-col>
            <el-col :span="5">
                <p>{{ nickName }}</p>
                <p class="time">注册时间：{{createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</p>
            </el-col>
            <el-col :span="2" class="operation">
                <el-button type="text" @click="openDialog('formUserName')">修 改</el-button>
            </el-col>
        </el-row>


        <el-dialog title="编辑昵称" :visible.sync="dialogVisible" v-dialog-drag
                   custom-class="width400" :close-on-click-modal="false">
            <el-form size="small" ref="formUserName" :rules="rules"
                     :model="formUserName" @submit.native.prevent :show-message="false">
                <el-form-item label="昵称" prop="userName" label-width="70px">
                    <el-input size="small" @keyup.enter.native="submitUserNameForm('formUserName')"
                              v-model="formUserName.userName"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
          <el-button size="small" type="primary"
                     :loading="subLoading"
                     @click="submitUserNameForm('formUserName')">确定</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    export default {
        name: "NickName",
        data() {
            return {
                dialogVisible: false,
                subLoading: false,
                formUserName: {userName: '',},
                rules: {
                    userName: [{required: true, message: '【请输入昵称】', trigger: 'blur'}],
                }
            }
        },
        computed: {
            ...mapState({
                loginName: state => state.user.userInfo.login_name,
                createTime: state => state.user.userInfo.cretime,
                nickName: state => state.user.userInfo.nick_name
            })
        },
        methods: {

            //修改 重置表单
            openDialog(form) {
                this.dialogVisible = true
                this.$nextTick(() => {
                    this.$refs[form].resetFields()
                })
            },
            // 昵称修改表单提交
            submitUserNameForm(formName) {
                this.$refs[formName].validate((valid, object) => {
                    if (valid) {
                        this.subLoading = true
                        let params = {
                            symbol: "WebUser/update",
                            nick_name: this.formUserName.userName,
                        };
                        this.$request({method: 'post', params}).then(res => {
                            if (res) {
                                this.dialogVisible = false;
                                this.$store.dispatch('user/getInfo')
                                this.$message.success('修改成功')
                            }
                            this.subLoading = false
                        })
                    } else this.myNotify(object)
                });
            },
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/personal/userInfo.less";

    @font-face {
        font-family: 'iconfont';  /* Project id 3283457 */
        src: url('//at.alicdn.com/t/font_3283457_qulc55toux.woff2?t=1648539174189') format('woff2'),
        url('//at.alicdn.com/t/font_3283457_qulc55toux.woff?t=1648539174189') format('woff'),
        url('//at.alicdn.com/t/font_3283457_qulc55toux.ttf?t=1648539174189') format('truetype');
    }

    .iconfont {
        font-family: "iconfont" !important;
        font-size: 16px;
        font-style: normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .icon-nicheng {
        font-size: 30px;
        color: rgba(3, 240, 214);
        margin-right: 10px;
    }

    .icon-nicheng:before {
        content: "\e633";
    }

    .icon-shujuzhuanhuan:before {
        content: "\e613";
    }

    .icon-zhuanhuan-01:before {
        content: "\e648";
    }
</style>
