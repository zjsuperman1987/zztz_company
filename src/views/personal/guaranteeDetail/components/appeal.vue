<template>
    <!-- 申诉提醒弹窗 -->
    <el-dialog :title="$t('currency.orderInfo.question')" :visible.sync="dialogAppeal" v-dialog-drag
                :close-on-click-modal="false" custom-class="width500">
        <appeal-text></appeal-text>
        <div class="appeal-btn">
            <el-button size="small" type="primary" @click="appeal">{{$t('currency.orderInfo.appeal')}}</el-button>
        </div>
    </el-dialog>   
</template>    

<script>
const appealText = () => import('@/views/ThreeCoin/order/components/appealText')
// import appealText from "@/views/ThreeCoin/order/components/appealText";
export default {
    name: 'appealItem',
    props: {
        open: {
            type: Boolean,
            default: false
        }
    },
    components: { appealText },
    data() {
        return {
            dialogAppeal: this.open,
        }
    },
    methods: {
        // 申诉
        appeal() {
            this.dialogAppeal = false
        },
    },
}
</script>