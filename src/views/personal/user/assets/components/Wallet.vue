<template>
    <div class="info_box">
        <div class="title">{{ $t('assets.currency') }}</div>
        <ul v-if="balanceList">
            <li v-for="(item,index) in balanceList" :key="index">
                <span class="currency-name">{{ item.currency.ift_name }} {{ $t('assets.balance') }} :</span>
                <span class="currency-name number">{{ parseFloat(item.balance) }}</span>
                <span class="currency-name">{{ $t('assets.currency3') }} :</span>
                <span class="currency-name number">{{ parseFloat(item.frozen) }}</span>
            </li>
        </ul>
        <ul>
            <li><span class="info_title">{{ $t('account.BTC') }}</span><span class="info_data">{{data.tid}}</span></li>
            <li><span class="info_title">{{ $t('account.BTCfrozen') }}</span><span class="info_data">{{data.tid}}</span></li>
            <li><span class="info_title">{{ $t('account.USDT') }}</span><span class="info_data">{{data.usdprice}}</span></li>
            <li><span class="info_title">{{ $t('account.USDTfrozen') }}</span><span class="info_data">{{data.usdprice}}</span></li>
            <li><span class="info_title">{{ $t('goodsDetails.btc') }}</span><span class="info_data width">{{ currentBTC * data.usdprice | cutPoint(8)}}</span></li>
            <li><span class="info_title">{{ $t('goodsDetails.gmv') }}</span><span class="info_data">{{ data.sells_amount }}</span></li>
            <li><span class="info_title">{{ $t('goodsDetails.volume') }}</span><span class="info_data">{{ data.sells_volume }}</span></li>
            <li><span class="info_title">{{ $t('goodsDetails.usdt') }}</span><span class="info_data width">{{ currentUSDT * data.usdprice | cutPoint(4) }}</span></li>
            <li><span class="info_title">{{ $t('goodsDetails.ctime') }}</span><span class="info_data">{{ data.cretime }}</span></li>
            <li><span class="info_title">{{ $t('goodsDetails.hot') }}</span><span class="info_data">{{ data.read_num }}</span></li>
            <li><span class="info_title">{{ $t('goodsDetails.lastOnline') }}</span><span class="info_data ">{{ data.last_online }}</span></li>
        </ul>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import myFunctions from "@/utils/myFunctions";

    export default {
        name: "Wallet",
        data() {
            return {
                balanceList: [], // 余额
                data: []
            }
        },
        created() {
            this.getBalance()
        },
        methods: {
            //获取币种余额
            async getBalance() {
                let res = await myFunctions.get('WebMyRecharge/currencyBalance', {page: 1, limit: 10})
                this.balanceList=res.data
            },
        },
    }
</script>

<style scoped lang="less">
.info_box{
    margin: 5px;
    border: 1px solid #999;
    ul{
        padding: 3px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content:baseline;
        margin-left: 5px;
        li{
            list-style: none;
            display: inline-block;
            line-height: 18px;
            margin: 0 6px;
            width: 240px;
            .info_title {
                width: 90px;
                border: 1px solid #FFF;
                background: #ADC8DE;
                padding: 1px;
                padding-left: 5px;
            }
            .info_data {
                text-align: center;
                border: 1px solid #fff;
                width: 150px;
                background: #77A5B1;
                padding: 1px;
            }
            .width {
                width: 150px;
            }
            span {
                display: inline-block;
                box-sizing: border-box;
            }
        }
    }
}
</style>
