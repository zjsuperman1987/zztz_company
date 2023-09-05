<template>
    <div>
        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
        </div>

        <div class="table">
            <el-button @click="changeTabs(item)"
                        :class="$route.name === item.name ? 'elClick' : 'noClick' "
                        v-for="item in tabsList" :key="item.id">{{ item.label }}
            </el-button>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>
    import {generateTitle} from '@/utils/i18n'
    import {mapState} from "vuex";

    export default {
        name: "index",
        data() {
            return {
            }
        },
        activated() {
            this.$store.dispatch('user/getPayStatus')
        },
        computed: {
            tabsList() {
                return [
                    {id: 1, label: this.$t('route.recharge'), name: 'recharge', router: 'recharge'},
                    {id: 2, label: this.$t('route.withdraw'), name: 'withdraw', router: 'withdraw'},
                    {id: 3, label: this.$t('route.transfer'), name: 'transfer', router: 'transfer'},
                ]
            },
            ...mapState({
                balance: state => state.user.userInfo.balance,
                payStatus: state => state.user.payStatus,
            })
        },
        methods: {
            generateTitle,
            changeTabs(item) {
                if (this.$route.name !== item.router) this.$router.push({name: item.router})
            },
        }
    }
</script>

<style scoped lang="less">
    .noClick {
        opacity: 0.7;
    }

    .elClick {
        background: #409EFF;
        color: #fff !important;
        border: 1px solid #409EFF !important;
    }

    .table {
        background: #DEE5E6;
        margin: 6px 0;
        padding: 3px 6px;

        ::v-deep {
            .el-form-item {
                margin-bottom: 0;
            }
        }
    }

</style>
