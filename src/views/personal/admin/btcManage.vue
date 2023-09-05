<template>
  <div style="width: 100%">

    <div id="router-title">
      <span id="title">{{ $route.meta.title }}</span>
      <el-button size="mini" type="primary" icon="el-icon-refresh" @click="refresh">{{ $t('button.refresh') }}</el-button>
    </div>

    <div>
      <p class="table-title">待提币清单</p>
      <el-table :data="btcList" highlight-current-row border
                :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                size="mini" v-loading="loading">
        <el-table-column label="ID" width="40">
          <template v-slot="{$index,row}">
            {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="提币人" width="60">
          <template v-slot="{row}">
            <el-button type="text" @click="userClick(row)">{{ row.uid }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="提币地址" width="300" show-overflow-tooltip>
          <template v-slot="{row}">
            <span v-copy="row.address">{{ row.address }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" prop="amount" width="60"></el-table-column>
        <el-table-column label="tx/拒绝理由" show-overflow-tooltip>
          <template v-slot="{row}">
            <el-input v-model="row.tx"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="时间" prop="cretime" width="110"></el-table-column>
        <el-table-column label="状态" align="center" width="80">
          <!--        [0待审核|1已审核|2已打币|3暂缓提币|4拒绝提币|5审核未通过]-->
          <template v-slot="{row}">
            <el-tag size="mini" effect="dark" v-if="row.status === 0">待审核</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 1">已审核</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 2">已打币</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 3">暂缓提币</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 4" type="danger">拒绝提币</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 5">审核未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template v-slot="{row}">
            <el-button-group>
              <el-button size="small" type="primary" v-if="row.status === 0"
                         :disabled="!row.tx" @click="handleClick(row,2)">提交</el-button>

              <el-button size="small" type="danger" v-if="row.status === 0"
                         @click="handleClick(row,4)">拒绝</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <page-nation
          v-show="total>0"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="getBtcList()"
          :page-size="listQuery.limit"
          :page-sizes="[20, 40, 60]"
      />
    </div>

    <div style="margin-top: 10px">
      <p class="table-title">已提币清单</p>
      <el-table :data="btcListed" highlight-current-row border
                :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                size="mini" v-loading="loadingEd">
        <el-table-column label="ID" width="40">
          <template v-slot="{$index,row}">
            {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="提币人" width="60">
          <template v-slot="{row}">
            <el-button type="text" @click="userClick(row)">{{ row.uid }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="提币地址" width="300" show-overflow-tooltip>
          <template v-slot="{row}">
            <span v-copy="row.address">{{ row.address }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" prop="amount" width="60"></el-table-column>
        <el-table-column label="tx/拒绝理由" show-overflow-tooltip>
          <template v-slot="{row}">
            <a :href="row.tx?'https://www.btc.com/'+ row.tx:''" target="_blank">{{ row.tx }}{{ row.rmk }}</a>
          </template>
        </el-table-column>
        <el-table-column label="时间" prop="cretime" width="110"></el-table-column>
        <el-table-column label="状态" align="center" width="80">
          <!--        [0待审核|1已审核|2已打币|3暂缓提币|4拒绝提币|5审核未通过]-->
          <template v-slot="{row}">
            <el-tag size="mini" effect="dark" v-if="row.status === 0">待审核</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 1">已审核</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 2">已打币</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 3">暂缓提币</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 4" type="danger">拒绝提币</el-tag>
            <el-tag size="mini" effect="dark" v-if="row.status === 5">审核未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template v-slot="{row}">
            <el-button-group v-if="row.status === 0">
              <el-button size="small" type="primary"
                         @click="handleClick(row,2)">完成</el-button>
              <el-button size="small" type="danger"
                         @click="handleClick(row,4)">拒绝</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <page-nation
          v-show="totaled>0"
          :total="totaled"
          layout="total, sizes, prev, pager, next, jumper"
          :page.sync="listQueryEd.page"
          :limit.sync="listQueryEd.limit"
          @pagination="getBtcListEd"
          :page-size="listQueryEd.limit"
          :page-sizes="[20, 40, 60]"
      />
    </div>
  </div>
</template>

<script>
  export default {
    name: "btcManage",
    data() {
      return {
        btcList: [],
        total: 0,
        loading: false,
        listQuery: {
          limit: 20,
          page: 1
        },

        btcListed: [],
        totaled: 0,
        loadingEd: false,
        listQueryEd: {
          limit: 20,
          page: 1
        },

        dialogVisible: false,
        dialogData: {},
        reason: {
          admReason: '',
          tx: ''
        },
        options: [],
        rules: {
          admReason: [
            { required: true, message: '【请选择理由】', trigger: ['blur','change'] },
          ],
          tx: [
            { required: true, message: '【请填入TX】', trigger: 'blur' },
          ]
        }
      }
    },
    created() {
      this.getBtcList()
      this.getBtcListEd()
    },
    methods: {
      refresh() {
        this.getBtcList()
        this.getBtcListEd()
      },
      getBtcList() {
        this.loading = true
        let params = this.listQuery
        this.$http.get('/AdmWithdrawal', { params }).then(res=> {
          if (res) {
            this.btcList = res.data
            this.total = res.total
          }
          this.loading = false
        })
      },

      getBtcListEd() {
        this.loadingEd = true
        let params = this.listQueryEd
        params.type = 2
        this.$http.get('/AdmWithdrawal', { params }).then(res=> {
          if (res) {
            this.btcListed = res.data
            this.totaled = res.total
          }
          this.loadingEd = false
        })
      },

      handleClick(row,opt) {
        let params = {
          id: row.id,
          opt,
        }
        if (opt === 2) params.tx = row.tx;
        else params.rmk = row.tx;
        this.$http('/AdmWithdrawal/update',{ method: 'post', params }).then(res=> {
          if (res) {
            this.$message.success('操作成功')
            this.getBtcList()
            this.getBtcListEd()
          }
        })
      },
      submitReason(form) {
        this.$refs[form].validate((valid,object)=> {
          if (valid) {
            const params = {
              id: this.dialogData.id,
              opt: this.dialogData.opt,
              msg_id: this.reason.admReason,
              tx: this.reason.tx
            }
            this.$http('/AdmWithdrawal/update',{ method: 'post', params }).then(res=> {
              if (res) {
                this.dialogVisible = false
                this.$message.success('操作成功')
                this.getBtcList()
              }
            })
          }else {
            this.$validateNotify(object)
          }
        })
      },
      // 获取下架/封号理由
      getSoldSelect(type) {
        this.$http('/AdmMsg/getList', { method: 'post', params: {type} }).then(res=> {
          if (res) this.options = res
        })
      },

      //用户点击事件
      userClick(row) {
          sessionStorage.setItem('userManage',row.uid)
          this.$emit('openByName','userDetails')
      }
    }
  }
</script>

<style scoped lang="less">
  .table-title {
    padding: 3px 6px;
    background: #9bf0d6;
  }
  ::v-deep {
    .el-table {
      p {
        line-height: 1.3;
      }
    }
  }
</style>
