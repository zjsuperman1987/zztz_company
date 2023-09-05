<template>
    <div>
        <div id="router-title">
            <span id="title">{{ generateTitle($route.meta.title) }}</span>
        </div>
        <div>
            <el-button @click="changeTabs(item)" :type="$route.name === item.name ? 'primary' : ''"
                       v-for="item in tabsList" :key="item.id">{{ item.label }}
            </el-button>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>
    import {generateTitle} from '@/utils/i18n'

    export default {
        name: "index",
        data() {
            return {}
        },
        computed: {
            tabsList() {
                return [
                    {id: 1, label: this.$t('notify.label2'), name: 'note', router: 'note'},
                    {id: 2, label: this.$t('notify.label1'), name: 'notification', router: 'notification'},
                ]
            }
        },
        methods: {
            generateTitle,
            changeTabs(item) {
                if (this.$route.name !== item.router) this.$router.push({name: item.router})
            },
        },
    }
</script>

<style scoped lang="less">
    .tabs {
        border: 1px solid;
        margin-right: 20px;
        border-radius: 18px;
        color: #409EFF;
        display: inline-block;
        padding: 6px 20px;
        cursor: pointer;
    }
</style>
