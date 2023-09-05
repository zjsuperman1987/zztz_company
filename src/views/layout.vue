<template>
    <div class="container">
        <div class="main-middle">
            <headerMain></headerMain>
            <div class="main">
                <keep-alive :exclude="exclude">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    const headerMain = () => import('@/components/header/index')
    export default {
        name: 'layout',
        components: {headerMain},
        data() {
            return {
                exclude: ['goodsDetails', 'publishGoods', 'adNotice', 'search', 'publishAD',
                    'Feedback', 'edit-goods-details', 'edit-goods-after_sale', 'favorites']
            }
        }
    };
</script>

<style scoped lang="less">

    .container {
        height: 100%;

        .main-middle {
            max-width: 1200px;
            min-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            height: 100%;

            .main {
                background-color: #fefef2;
                flex: 1 0 auto;
            }
        }


    }
</style>
