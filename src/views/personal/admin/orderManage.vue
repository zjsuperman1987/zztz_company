<template>
  <div style="width: 100%">
    <div id="router-title">
      <span id="title">{{ $route.meta.title }}</span>
      <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getOrderList">{{ $t('button.refresh') }}</el-button>
    </div>

    <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
              highlight-current-row size="mini" :data="orderList" v-loading="loading">
      <el-table-column label="ID" prop="id" width="60"></el-table-column>
      <el-table-column label="商品编号" prop="tid" width="60"></el-table-column>
      <el-table-column label="所属分类" width="100">
        <template v-slot="{row}">
          <router-link @click.native="$router.push({ name: 'search',query: { id: row.ea, name: row.ea_title } })"
                       to="">{{ row.ea_title }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" show-overflow-tooltip>
        <template v-slot="{row}">
          <router-link @click.native="inTo(row)" to="">{{ row.goods.title }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="卖家" width="60">
        <template v-slot="{row}">
          <router-link :to="{ name: 'userDetails', query: { id: row.seller } }">{{ row.seller }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="买家" width="60">
        <template v-slot="{row}">
          <router-link :to="{ name: 'userDetails', query: { id: row.buyer } }">{{ row.buyer }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="成交金额(BTC)" prop="amount" width="90"></el-table-column>
      <el-table-column label="计价美金($)" prop="usdprice" width="70"></el-table-column>
      <el-table-column label="订单状态" align="center" width="70">
        <template v-slot="{row}">
          <el-tag size="mini" v-if="row.status === 0">交易中</el-tag>
          <el-tag size="mini" v-if="row.status === 1" type="info">已退款</el-tag>
          <el-tag size="mini" v-if="row.status === 2" type="success">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="付款时间" prop="cretime" width="110"></el-table-column>
      <el-table-column label="操作" width="80" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="primary" @click="inTo(row)">打开</el-button>
        </template>
      </el-table-column>
    </el-table>
    <page-nation
        v-show="total>0"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getOrderList()"
        :page-size="listQuery.limit"
        :page-sizes="[20, 40, 60]"
    />
  </div>
</template>

<script>
  export default {
    name: "order",
    data() {
      return {
        orderList: [],
        total: 0,
        loading: false,
        listQuery: {
          limit: 20,
          page: 1
        },
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      getOrderList() {
        this.loading = true
        let params = this.listQuery
        this.$http.get('/AdmTrade',{ params }).then(res=> {
          if (res) {
            this.orderList = res.data
            console.log(this.orderList)
            this.total = res.total
          }
          this.loading = false
        })
      },

      inTo(row) {
        this.$store.commit('goods/changeTab', 'orderList')
        this.$router.push({ name: 'goods-details', query: { id: row.tid, oId: row.id } })
      }
    }
  }
</script>

<style scoped lang="less">
  ::v-deep {
    .el-table {
      p {
        line-height: 1.3;
      }
    }
  }
</style>
