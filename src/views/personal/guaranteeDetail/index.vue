<template>
    <div class="container">
        <header class="header_title">
            <span>{{info.title}}</span>       
            <span>担保id:{{info.id}}</span>       
        </header>
        <section class="section">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <left @call="getDetail"></left>
                    </el-col>
                    <el-col :span="12">
                        <right @call="getDetail"></right>
                    </el-col>
                </el-row>
        </section>

        <div class="admin">
        </div>
    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions";
    const left = () => import('./left')
    const right = () => import('./right')

    export default {
        name: "index",
        components: { left, right },
        data() {
            return {
                id: this.$route.query.id,
                info: {}
            }
        },
        mounted() {
            this.getDetail()
        },
        methods: {
            //获取担保详情
            async getDetail() {
                let res = await myFunctions.get('/WebGuarantee/Detail', {id: this.id})
                if (res) {
                    if (res.currency_id === 1) res.currency_id = 'BTC'
                    if (res.currency_id === 2) res.currency_id = 'USDT'
                    if(res.status === 1) res.status = '进行中'
                    if(res.status === 2) res.status = '申诉中'
                    if(res.status === 3) res.status = '已完成'
                    res.amount_a = parseFloat(res.amount_a)
                    res.amount_b = parseFloat(res.amount_b)
                    res.frozen_a = parseFloat(res.frozen_a)
                    res.frozen_b = parseFloat(res.frozen_b)
                    this.$store.commit('order/guarantee_list', res)
                    this.info = res
                    console.log(this.info)
                }
            },
        }
    }
</script>

<style scoped lang="less">
    .container {
        background: #BDD7EE;
        .header_title{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            height: 40px;
            line-height: 40px;
            font-size: 14px;
            padding: 0 20px;
            background: #20B2AA;
            color: #fff;
            .title {
                margin-left: 20px;            
            }
        }
        .section {
            ::v-deep {
                .el-col,.el-col-12{
                    padding-right: 0;
                }
            }
        }
    }
</style>