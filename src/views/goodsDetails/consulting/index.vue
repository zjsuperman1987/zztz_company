<template>
    <div>
        <consult-admin v-if="isAdm"></consult-admin>
        <consult-seller v-if="goodsInfo.uid === uid && !isAdm"></consult-seller>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    const consultSeller = () => import('./seller')
    const consultAdmin = () => import('./admin')
    export default {
        name: "index",
        components: {consultSeller, consultAdmin},
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

<style scoped>

</style>
