<template>
  <div>
    <span @click="openDialog('formPassword')">{{!payPwd ? $t('account.set') : $t('account.edit')}}</span>
    <el-dialog :title="payPwd ? $t('account.editPayPwd') : $t('account.setPayPwd')"
               :visible.sync="dialogVisible" v-dialogDrag custom-class="width400" :close-on-click-modal="false">
      <el-form size="small" :model="form" ref="formPassword"
               :show-message="false" :rules="rules">
        <el-form-item :label="$t('account.pwdKey')" prop="passwordKey" v-if="payPwd">
          <el-input @keyup.enter.native="submitForm('formPassword')" type="password"
                    show-password v-model.trim="form.passwordKey" clearable size="small"
                    :placeholder="$t('account.desPwdKey')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('account.newDealPsw')" prop="newPassword">
          <el-input @keyup.enter.native="submitForm('formPassword')" type="password"
                    show-password v-model.trim="form.newPassword" clearable size="small"
                    :placeholder="$t('account.validPwd')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('account.isDealPsw')" prop="newPasswordConfirm">
          <el-input @keyup.enter.native="submitForm('formPassword')" type="password"
                    show-password v-model.trim="form.newPasswordConfirm" clearable size="small"
                    :placeholder="$t('account.validPwd')"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small"
                   @click="submitForm('formPassword')">{{ $t('button.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {mapState} from "vuex";
  import {MD5} from "crypto-js";
  export default {
    name: "DealPwd",
    data() {
      let validatePwd = (rule, value, callback) => {
        if (this.form.newPasswordConfirm !== this.form.newPassword) callback(new Error(this.$t('account.notSame')));
        callback();
      };
      return {
        dialogVisible: false,
        centerDialogVisible: false,
        pinkey: '',
        //  交易密码表单
        form: {
          passwordKey: '',
          newPassword: "",
          newPasswordConfirm: "",
          // helpKey: ""
        },
        rules: {
          newPassword: [
            { required: true, message: this.$t('account.desNewPwd'), trigger: 'blur' },
            { pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/,
              message: this.$t('account.errorPwd'), trigger: 'blur' }
          ],
          passwordKey: [
            { required: true, message: this.$t('account.desPwdKey'), trigger: 'blur' },
          ],
          newPasswordConfirm: [
            { required: true, message: this.$t('account.desConfirmPwd'), trigger: 'blur' },
            { validator: validatePwd, trigger: "blur" },
          ],
        }
      }
    },
    computed: {
      ...mapState({
        payPwd: state => state.user.userInfo.paypwd
      })
    },
    methods: {
      openDialog(form) {
        this.dialogVisible = true
        this.$nextTick(()=>{
          this.$refs[form].resetFields()
        })
      },
      // 交易密码提交表单
      submitForm(form) {
        this.$refs[form].validate((valid, object) => {
          if (valid) {
            let params
            if (this.payPwd) {  // 修改
              params = {
                opt: 2,
                pinkey: this.payPwd ? MD5(this.form.passwordKey).toString() : '',  // 交易
                pinpass: MD5(this.form.newPasswordConfirm).toString(),
              }
            }else {  // 第一次设置
              params = {
                opt: 2,
                pinpass: MD5(this.form.newPassword).toString(),
              }
            }
            this.$http('/WebUser/update',{method: 'post',params}).then(res=> {
              if (res) {
                this.$emit('listenChild', res.pinkey)
                this.payPwd ? this.$message.success(this.$t('account.msgDealPwd')) : 
                this.centerDialogVisible = true
                this.$emit(('handler'), this.centerDialogVisible)
                this.dialogVisible = false
                this.$store.dispatch('user/getInfo')
              }
            })
          }else this.$validateNotify(object)
        })
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~@/styles/personal/userInfo.less";
</style>
