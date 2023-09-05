<template>
  <div style="width: 100%">

    <div id="router-title">
      <span id="title">{{ $route.meta.title }}</span>
      <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getUserList">{{ $t('button.refresh') }}</el-button>
    </div>

    <div class="filter">
      <el-form :model="filterForm" size="small" ref="filterForm" inline>
        <el-form-item prop="is_adm">
          <el-checkbox @change="getUserList" v-model="filterForm.is_adm" true-label="1" false-label="0" border size="mini">管理员</el-checkbox>
        </el-form-item>
        <el-form-item prop="currency_id" style="width: 100px">
          <el-select v-model="filterForm.currency_id">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="order">
          <el-radio-group v-model="filterForm.order" size="mini" @change="getUserList">
            <el-radio-button label="b">资金</el-radio-button>
            <el-radio-button label="s">结算</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="uid">
          <el-input v-model="filterForm.uid" @keyup.enter.native="getUserList" size="mini" placeholder="UID" style="width: 100px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="primary" @click="getUserList">搜索</el-button>
          <el-button size="mini" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :header-cell-style="{background:'#F1ECEC',color:'#606266'}" border
              highlight-current-row size="mini" :data="userList" v-loading="loading">
      <el-table-column label="ID" type="index" width="50" align="center"></el-table-column>
      <el-table-column label="UID" prop="uid" width="50" align="center"></el-table-column>
      <el-table-column label="发布权" prop="trade_end_time" width="50" align="center"></el-table-column>
      <el-table-column label="回复权" prop="post_end_time" width="50" align="center"></el-table-column>
      <el-table-column label="BTC余额" prop="btc.balance"></el-table-column>
      <el-table-column label="BTC冻结" prop="btc.frozen"></el-table-column>
      <el-table-column label="USDT余额" prop="usdt.balance"></el-table-column>
      <el-table-column label="USDT冻结" prop="usdt.frozen"></el-table-column>
      <el-table-column label="管理员" width="60" align="center">
        <template v-slot="{row}">
          <el-tag size="mini" effect="dark" type="danger" v-if="row.id === 1">超管</el-tag>
          <el-tag size="mini" effect="dark"
                  :type="row.is_adm ? 'success' : 'info'" v-else>{{ row.is_adm ? '是' : '否'}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="封号" width="60" align="center">
        <template v-slot="{row}">
          <el-tag size="mini" effect="dark" v-if="row.status === 0" type="success">正常</el-tag>
          <el-tag size="mini" effect="dark" v-if="row.status === 1" type="info">隐藏</el-tag>
          <el-tag size="mini" effect="dark" v-if="row.status === 2" type="danger">封号</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="冻结资金" width="60" align="center">
        <template v-slot="{row}">
          <el-tag size="mini" effect="dark" :type="row.finance_freeze ? 'success' : 'info'">{{ row.finance_freeze ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="禁止提币" width="60" align="center">
        <template v-slot="{row}">
          <el-tag size="mini" effect="dark"
                  :type="row.disable_withdrawal ? 'success' : 'info'">{{ row.disable_withdrawal ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="屏蔽信息" width="60" align="center">
        <template v-slot="{row}">
          <el-tag size="mini" effect="dark" :type="row.block_message ? 'success' : 'info'">{{ row.block_message ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="cretime" width="110"></el-table-column>
      <el-table-column label="操作" width="70" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="primary" @click="clickDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <page-nation
        v-show="total>0"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getUserList()"
        :page-size="listQuery.limit"
        :page-sizes="[20, 40, 60]"
    />

    <el-dialog title="权限分配" :visible.sync="dialogAuth" :close-on-click-modal="false" v-dialog-drag
               custom-class="width400">
      <div>
        <el-checkbox-group v-model="authIdList">
          <el-checkbox v-for="item of authList" :key="item" :label="item">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <span slot="footer">
        <el-button size="small" @click="dialogAuth = false">取消</el-button>
        <el-button size="small" type="primary" @click="submitAuth" :loading="submitLoading">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "userManage",
    data() {
      return {
        userList: [],
        total: 0,
        listQuery: {
          limit: 20,
          page: this.$route.params.page * 1 || 1
        },
        filterForm: {
          uid: '',
          is_adm: '',
          order: '',
          tg: '',
          currency_id: '1'
        },
        loading: false,
        dialogAuth: false,
        authList: [],
        authIdList: [],
        rowID: '',
        submitLoading: false,
        options: [{ value: '1', label: 'BTC'}, { value: '2', label: 'USDT'}],
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      getUserList() {
        this.loading = true
        let params = this.filterForm
        params = {...params, ...this.listQuery}
        this.$http.get('/AdmMember', { params}).then(res => {
          if (res) {
            for(let prop of res.data) {
              prop.btc.balance = parseFloat(prop.btc.balance)
              prop.btc.frozen = parseFloat(prop.btc.frozen)
              prop.usdt.balance = parseFloat(prop.usdt.balance)
              prop.usdt.frozen = parseFloat(prop.usdt.frozen)
            }
            this.userList = res.data
            this.total = res.total
          }
          this.loading = false
        })
      },

      changeSwitch(e, row) {
        this.$set(row, 'isLoading', true)
        let params = {id: row.uid, is_adm: e}
        this.$http('/AdmMember/update', {method: 'post', params}).then(res => {
          if (res) this.$message.success('操作成功')
          this.$set(row, 'isLoading', false)
          this.getUserList()
        })
      },

      reset() {
        this.$refs.filterForm.resetFields()
        this.getUserList()
      },

      submitAuth() {
        this.submitLoading = true
        let params = {id: this.rowID, opt: 2, auth: this.authIdList.length ? this.authIdList.toString() : '0'}
        this.$http('/AdmMember/update', {method: 'post', params}).then(res => {
          if (res) {
            this.$message.success('操作成功')
            this.getUserList()
            this.dialogAuth = false
          }
          this.submitLoading = false
        })
      },

      //点击跳转到用户详情页
      clickDetail(row) {
        sessionStorage.setItem('userManage',row.uid)
        this.$emit('openByName','userDetails')
        // this.$router.replace({ name: 'userDetails', query: { id: row.uid } })
        // this.$router.push({name:'userDetails', query: {id: row.uid }});
      }
    }
  }
</script>

<style scoped lang="less">
  ::v-deep {
    .filter {
      margin-bottom: 6px;
      padding: 2px;
      background: #e5e5e5;

      .el-form-item {
        margin-bottom: 0;
        padding-right: 10px;
        &:not(:last-child) {
          border-right: 2px solid #8A8989;
        }

        .el-checkbox {
          height: auto;
          padding: 3px 8px;
          background: #fff;
          &.is-bordered.is-checked {
            background: #409eff;
            .el-checkbox__label {
              color: #fff;
            }
          }
          .el-checkbox__input {
            display: none;
          }
          .el-checkbox__label {
            padding-left: 0;
          }
        }

        .el-radio-button__inner {
          padding: 5px 8px;
        }
      }
    }

    .el-table {
      p {
        line-height: 1.3;
      }

      .tableScope {
        .el-switch__label {
          position: absolute;
          display: none;
          color: #fff;

          span {
            font-size: 12px;
          }
        }

        .el-switch__label--right {
          margin-left: 0;
          z-index: 1;
          right: 24px;
        }

        .el-switch__label--left {
          z-index: 1;
          left: 24px;
        }

        .el-switch__label.is-active {
          display: block;
        }

        .el-switch__core,
        .el-switch .el-switch__label {
          width: 50px !important; /*开关按钮的宽度大小*/
        }
      }
    }
  }
</style>
