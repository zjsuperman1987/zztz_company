<template>
    <div style="margin-bottom: 15px">
        <div class="dialog-text-item">{{$t('currency.orderInfo.tip1')}}</div>
        <div class="dialog-text-item">{{$t('currency.orderInfo.tip2')}}</div>
        <ul class="dialog-text">
            <li class="dialog-text-item">{{$t('currency.orderInfo.tip3')}}</li>
            <li class="dialog-text-item">{{$t('currency.orderInfo.tip4')}}</li>
            <li class="dialog-text-item">{{$t('currency.orderInfo.tip5')}}</li>
            <li class="dialog-text-item">{{$t('currency.orderInfo.tip6')}}</li>
            <li class="dialog-text-item dialog-text-con">{{$t('currency.orderInfo.tip7')}}</li>
            <li class="dialog-text-item dialog-text-con">{{$t('currency.orderInfo.tip8')}}</li>
            <li class="dialog-text-item dialog-text-con">{{$t('currency.orderInfo.tip9')}}</li>
            <li class="dialog-text-item dialog-text-con">{{$t('currency.orderInfo.tip10')}}</li>
            <li class="dialog-text-item dialog-text-con">{{$t('currency.orderInfo.tip11')}}</li>
            <li class="dialog-text-item">{{$t('currency.orderInfo.tip12')}}</li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "appealText"
    }
</script>

<style scoped lang="less">
    .dialog-text-item {
        text-indent: 20px;
        margin-bottom: 5px;
    }
</style>