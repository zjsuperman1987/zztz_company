<template>
  <div style="width: 100%">
    <div id="router-title">
      <span id="title">{{ $route.meta.title }}</span>
      <div>
        <el-button icon="el-icon-plus" type="primary" @click="newAuth">新增</el-button>
        <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getUserGroupList">{{ $t('button.refresh') }}</el-button>
      </div>
    </div>

    <el-table highlight-current-row :data="tableData" v-loading="loading" border>
      <el-table-column label="id" prop="id" width="50"></el-table-column>
      <el-table-column label="组" prop="title" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column label="权限" show-overflow-tooltip>
        <template v-slot="{row}">
          <span v-if="row.auth_text instanceof Array">{{ row.auth_text.toString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成员" show-overflow-tooltip>
        <template v-slot="{row}">
          <span v-if="row.users instanceof Array">{{ row.users.toString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template v-slot="{row}">
          <el-button type="primary" size="small" @click="clickDialog(row)">编辑权限</el-button>
          <el-button type="primary" size="small" @click="editMember(row)">编辑成员</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogType === 'add' ? '新增组管理' : '编辑组管理'" :visible.sync="dialogAuth" custom-class="width600"
               v-dialog-drag :close-on-click-modal="false">
      <div>
        <el-form :model="authForm" label-width="50px" class="group-form" :show-message="false" ref="authForm" :rules="rules">
          <el-form-item label="组名" prop="title">
            <el-input :validate-event="false" v-model="authForm.title"></el-input>
          </el-form-item>
          <el-form-item label-width="0" prop="authIdList">
            <el-checkbox-group v-model="authForm.authIdList">
              <el-checkbox border v-for="item of authList" :key="item.id" :label="item.id">{{ item.title }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <el-button @click="dialogAuth = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitAuth('authForm')">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="编辑成员" :visible.sync="dialogMember" v-dialog-drag
               custom-class="width400" :close-on-click-modal="false">
      <div>
        <el-input type="textarea" v-model.trim="userList"></el-input>

        <el-alert title="无" type="success" :closable="false" style="text-align: left;margin-top: 10px">
          <template slot='title'>
            <div> - 各个ID之间使用逗号隔开</div>
          </template>
        </el-alert>
      </div>
      <span slot="footer">
        <el-button @click="dialogMember = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitMember">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "userGroup",
    data() {
      return {
        loading: false,
        tableData: [],
        listQuery: {
          limit: 15,
          page: 1
        },
        total: 0,

        dialogAuth: false,
        authForm: {
          title: '',
          authIdList: [],
        },
        authList: [],
        rowID: '',
        dialogType: '',
        submitLoading: false,

        dialogMember: false,
        userList: '',

        rules: {
          title: [
            {required: true, message: '请输入组名', trigger: 'blur'},
          ]
        }
      }
    },
    created() {
      this.getUserGroupList()
      this.getAuthList()
    },
    methods: {
      getUserGroupList() {
        this.loading = true
        let params = this.listQuery
        this.$http.get('/AdmUserGroup', { params }).then(res=> {
          if (res) {
            this.tableData = res.data
            this.total = res.total
          }
          this.loading = false
        })
      },

      getAuthList() {
        return new Promise((resolve) => {
          this.$http.get('/AdmUserGroup/menus').then(res=> {
            if (res) {
              this.authList = res
              resolve()
            }
          })
        })
      },

      clickDialog(row) {
        this.dialogType = 'edit'
        this.rowID = row.id
        this.authForm.title = row.title
        this.authForm.authIdList = row.auth
        this.dialogAuth = true
        this.$nextTick(()=> {
          this.$refs.authForm.clearValidate()
        })
      },

      submitAuth(form) {
        this.$refs[form].validate((valid, object)=> {
          if (valid) {
            this.submitLoading = true
            let params = {
              id: this.rowID,
              auth: this.authForm.authIdList.length ? this.authForm.authIdList.toString() : '0',
              title: this.authForm.title
            }
            let url = this.dialogType === 'add' ? '/AdmUserGroup/save' : '/AdmUserGroup/update'
            this.$http(url, { method: 'post', params }).then(res=> {
              if (res) {
                this.getUserGroupList()
                this.dialogAuth = false
              }
              this.submitLoading = false
            })
          }else this.$validateNotify(object)
        })
      },

      newAuth() {
        this.getAuthList().then(()=> {
          this.dialogType = 'add'
          this.rowID = ''
          this.authForm.title = ''
          this.authForm.authIdList = []
          this.dialogAuth = true
          this.$nextTick(()=> {
            this.$refs.authForm.clearValidate()
          })
        })
      },

      editMember(row) {
        this.rowID = row.id
        this.userList = row.users.toString()
        this.dialogMember = true
      },

      submitMember() {
        this.submitLoading = true
        let params = {
          users: this.userList,
          id: this.rowID
        }
        this.$http('/AdmUserGroup/update', { method: 'post', params }).then(res=> {
          if (res) {
            this.getUserGroupList()
            this.dialogMember = false
          }
          this.submitLoading = false
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .group-form {
    .el-checkbox {
      padding: 4px 6px;
      height: auto;
      margin-right: 10px;
      ::v-deep {
        .el-checkbox__input {
          display: none;
        }
        .el-checkbox__label {
          padding-left: 0;
        }
      }
    }
    .el-checkbox.is-bordered+.el-checkbox.is-bordered {
      margin-left: 0;
    }
  }
</style>
