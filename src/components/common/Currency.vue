<template>
    <el-select v-model="value" :placeholder="$t('assets.currency_id')">
        <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
        </el-option>
    </el-select>
</template>

<script>
    export default {
        name: "Currency",
        data(){
            return{
                options: [{
                    value: '1',
                    label: 'BTC'
                }, {
                    value: '2',
                    label: 'USDT'
                }],
                value: '2',
            }
        }
    }
</script>

<style scoped>

</style>