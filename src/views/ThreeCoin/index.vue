<template>
    <div class="main-container">
        <h3 class="head_title">法币交易</h3>
        <div class="demo">
            <button  v-for="(tab,index) in tabs" :key="index" :class="['tab-button', { active: currentTab === index }]"
                    @click="currentTab = index">{{ tab }}</button>
            <transition name="slide-fade" mode="out-in">
                <component :is="currentTabComponent" :tabIndex="currentTab" class="tab"></component>
            </transition>
            <div class="nav-foot">
                <div class="text">
                    {{ $t('home.footer') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions";
    const publish = () => import('@/views/ThreeCoin/components/publish')
    const mall = () => import('@/views/ThreeCoin/components/mall')
    const myPublish = () => import('@/views/ThreeCoin/components/myPublish.vue')
    const dealOrder = () => import('@/views/ThreeCoin/components/dealOrder.vue')
    const representation = () => import('@/views/ThreeCoin/components/represent.vue')
    export default {
        name: 'coin',
        components: {publish, mall, myPublish, dealOrder, representation},
        data() {
            return {
                currentTab: 1,
                tabs: ['发布', '购买', '出售', '承兑单', '交易单', '申诉'],
                tables: ['publish', 'mall', 'mall', 'myPublish', 'dealOrder', 'representation'],
                orderList: '',
            };
        },
        created() {
            this.order()
        },
        watch: {
            orderList: {
                handler(val) {
                    this.$store.commit('order/SET_cornOrderList', val)
                },
                deep: true
            },
            '$i18n.locale': {  //监听中英文切换
                handler: function () {
                    if (this.$i18n.locale === 'zh') this.tabs = ['发布', '购买', '出售', '承兑单', '交易单', '申诉']
                    if (this.$i18n.locale === 'en') this.tabs = ['Publish', 'Buy', 'Sell', 'MyPublish', 'DealOrder', 'Appeal']
                },
                immediate: true
            }
        },
        computed: {
            currentTabComponent() {  
                return '' + this.tables[this.currentTab]
            }
        },
        methods: {
            async order() { // 获取个人全部订单列表
                let res = await myFunctions.get('Webc2cOrder/getList', {status: '', page: 1, limit: 999});
                if (res) this.orderList = res.list;
            },
        }
    }
</script>

<style scoped lang="less">
    .main-container {
        .head_title{
            font-size: 16px;
            margin-bottom: 10px;
            padding: 10px 10px 10px 30px;
            background: #C7E4EA;
            color: #0DA88B;
        }
        .demo {
            font-family: sans-serif;
            border-radius: 2px;
            padding: 0 30px;
            margin-top: 1em;
            margin-bottom: 40px;
            user-select: none;
            overflow-x: auto;

            .nav-foot {
                max-width: 1200px;
                min-width: 800px;
                width: 100%;
                padding: 20px 40px;
    
                .text {
                    text-indent: 30px;
                    font-size: 14px;
                }
    
            }

            .tab-button {
                width: 60px;
                height: 24px;
                padding: 3px 10px ;
                color: #fff;
                background-color: #6496c8;
                font-size: 12px;
                border: none;
                border-radius: 15px;
                box-shadow: 0 10px #27496d;
                margin-bottom: -1px;
                margin-right: 10px;
                cursor:pointer;
            }
            .tab-button:hover {
                background: #e0e0e0;
                color: #0A0A0A;
            }
            .tab-button.active {
                background: #e0e0e0;
                color: #0A0A0A;
            }
        }
    }

</style>
