<template>
    <div class="container">
        <header class="header_title">
            {{list.title}}        
        </header>
        <section class="section">
                <el-row :gutter="20" class="left">
                    <el-col :span="12">
                        <left @call="getDetail"></left>
                    </el-col>
                    <el-col :span="12">
                        333
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

    export default {
        name: "index",
        components: { left },
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
                if (res.currency_id === 1) res.currency_id = 'BTC'
                if (res.currency_id === 2) res.currency_id = 'USDT'
                this.$store.commit('order/guarantee_list', res)
                this.info = res
                console.log(res)
            },
        }
    }
</script>

<style scoped lang="less">
    .container {
        .header_title{
            height: 40px;
            line-height: 40px;
            font-size: 14px;
            padding-left: 20px;
            background: #20B2AA;
            color: #fff;
            .title {
                margin-left: 20px;
                
            }
        }
        .name {
            font-size: 20px;
            font-weight: 700;
            color: #fff1df;
            max-width: 1200px;
            min-width: 800px;
            margin: auto;
            width: 100%;
            background-color: #20B2AA;
            padding: 30px 0 30px 20px;
        }

        .sponsor, .response {
            width: 300px;
        }

        .member {
            display: inline-block;
            margin: 10px 0;
        }
    }
</style>