<template>
    <el-table :data="child" @row-click="rowClick" border highlight-current-row ref="logoList">
        <el-table-column label="ID" prop="id" width="60" align="center"></el-table-column>
        <el-table-column label="申请人" prop="uid" width="80" align="center"></el-table-column>
        <el-table-column label="操作" prop="num" align="center">
            <template slot-scope="{ row }" >
                <el-button type="primary" @click="isAgreement(1,1)" v-if="row.status ===1 && (list.uid_a === userID || userID === isAdm)" >为参与人</el-button>
                <el-button type="primary" @click="isAgreement(1,2)" v-if="row.status ===1 && (list.uid_a === userID || userID === isAdm)" >为观察人</el-button>
                <el-button type="primary" @click="isAgreement(1)"  v-if="row.status===2" disabled>已同意</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import myFunctions from '@/utils/myFunctions'
import {mapState} from "vuex"
export default {
    name: 'applyItem',
    props: {
        child: {
            type: Array,
            default: function () { return [] }
        }
    },
    data() {
      return {
        id: this.$route.query.id,
        oid: null,  //单号
        receiver: ''
      }  
    },
    computed: {
        ...mapState({
            userID: (state) => state.user.userInfo.id,
            list: (state) => state.order.guarantee_list,
        }),
        isAdm() {
            return localStorage.getItem('adm') * 1
        },
    },
    methods: {
        //点击行子交易单函数
        rowClick(row) {
            this.oid = row.id
            this.receiver = row.uid
        },

        //处理申请
        isAgreement(val,type) {
            setTimeout(async() => {
                let res =await myFunctions.post('/WebGuarantee/replyJoin',{gmid: this.oid, opt: val, type: type})
                if(res) {
                    this.isShow = false
                    this.$emit("call")
                    this.getDetail()
                    myFunctions.noticeOpposite(8,this.receiver)
                }
            },500)
        },

        //获取担保详情
        async getDetail() {
            let res = await myFunctions.get('/WebGuarantee/Detail', {id: this.id})
            if (res) {
                if (res.currency_id === 1) res.currency_id = 'BTC'
                if (res.currency_id === 2) res.currency_id = 'USDT'
                if(res.status === 1) res.status = '进行中'
                if(res.status === 2) res.status = '申诉中'
                if(res.status === 3) res.status = '已完成'
                this.$store.commit('order/guarantee_list', res)
                this.info = res
            }
        },
    }
}
</script>
