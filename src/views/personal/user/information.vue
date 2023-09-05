<template>
  <div class="more-information">

    <div id="router-title">
      <span id="title">{{ generateTitle($route.meta.title) }}</span>
      <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getTableData(tag)">{{ $t('button.refresh') }}</el-button>
    </div>

    <el-radio-group v-model="tag" @change="changeTag" size="mini">
      <el-radio-button v-for="item of messageTypeList" :key="item.id" :label="item.id">{{ item.title }}</el-radio-button>
    </el-radio-group>

    <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
              highlight-current-row size="small" :data="tableList" v-loading="listLoading">
      <el-table-column label="ID" width="80">
        <template v-slot="{$index,row}">
          {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.title')" show-overflow-tooltip>
        <template v-slot="{row}">
          <router-link :to="{ name: 'notice-details', query: { id: row.id, type: 'info' } }">{{ row.title }}</router-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.time')" prop="update_time" width="150"></el-table-column>
      <el-table-column :label="$t('table.actions')" width="150" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="primary"
                     @click="$router.push({ name: 'notice-details', query: { id: row.id, type: 'info' } })">{{ $t('table.view') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <page-nation
        v-show="total>0"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getTableData(tag)"
        :page-size="listQuery.limit"
        :page-sizes="[10, 40, 60]"
    />

  </div>
</template>

<script>
  import { generateTitle } from '@/utils/i18n'
  import {mapState} from "vuex";
  import {parseTime} from "@/utils";
  export default {
    name: "information",
    data() {
      return {
        options: [],
        tag: 1,

        tableList: [],
        listQuery: {
          page: 1,
          limit: 10
        },
        total: 0,
        listLoading: false,
      }
    },
    computed: {
      ...mapState({
        messageTypeList: state => state.message.messageType.data
      }),
    },
    created() {
      this.getType()
      this.getTableData(this.tag)
    },
    methods: {
      generateTitle,
      //获取资讯类别
      getType() {
        this.$http.get('/AdmArticle/all').then(res=> {
          if (res) this.options = res
        })
      },
      //获取资讯类别列表
      getTableData(val) {
        this.listLoading = true
        let params = this.listQuery
        params.type = val
        this.$http.get('/WebArticle', { params }).then(res=> {
          for(let prop of res.data) prop.update_time = parseTime(prop.update_time, '{y}-{m}-{d} {h}:{i}:{s}')
          if (res) {
            this.tableList = res.data
            this.total = res.total
          }
          this.listLoading = false
        })
      },
      //不同按钮获取不同的资讯信息列表
      changeTag(val) {
        this.getTableData(val)
      }
    }
  }
</script>

<style scoped lang="less">
  .more-information {
    ::v-deep {
      .el-table {
        margin-top: 10px;
      }
    }
  }
</style>
