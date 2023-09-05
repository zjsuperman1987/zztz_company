<template>
    <div>
        <seller-list v-if="goodsInfo && goodsInfo.uid === uid && !isAdm"></seller-list>
        <buyer-list v-if="goodsInfo && goodsInfo.uid !== uid && !isAdm"></buyer-list>
        <admin-list v-if="isAdm"></admin-list>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    const adminList = () => import('./admin')
    const buyerList = () => import('./buyer')
    const sellerList = () => import('./seller')
    export default {
        name: "index",
        components: {adminList, buyerList, sellerList},
        computed: {
            isAdm() {
                return localStorage.getItem('adm') * 1
            },
            ...mapState({
                uid: state => state.user.userInfo.id * 1,
                goodsInfo: state => state.goods.goodsInfo,
            })
        },
    }
</script>
