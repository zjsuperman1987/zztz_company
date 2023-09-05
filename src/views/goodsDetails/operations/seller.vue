<template>
    <div class="container">
        <ul class="right_btn">
            <li class="title">
                <span class="info_title head_title">商品操作</span>
            </li>
            <li><span class="info_title">{{ $t('goodsDetails.ranking') }}</span>
                <span class="info_data">
                    <el-button type="text" :loading="pullLoading" @click="handleClick(goodsInfo,1,'pull')">
                        {{ $t('goodsDetails.sell.push') }}
                    </el-button>
                </span>
            </li>
            <li><span class="info_title">{{ $t('goodsDetails.info') }}</span>
                <span class="info_data">
                        <el-button type="text" @click="$router.push({ name: 'editDetails', query: { id: goodsInfo.tid } })">
                            {{$t('goodsDetails.sell.details') }}
                </el-button>
                </span>
            </li>
            <li><span class="info_title">{{ $t('goodsDetails.adm.service') }}</span>
                <span class="info_data">
                        <el-button type="text" @click="$router.push({ name: 'editAfterSale', query: { id: goodsInfo.tid } })">
                            {{$t('goodsDetails.sell.modify') }}
                </el-button>
                </span>
            </li>
            <li><span class="info_title">{{ $t('goodsDetails.sell.show') }}</span>
                <span class="info_data">
                        <el-button type="text" @click.native.stop="handleClick(goodsInfo,goodsInfo.down ? 0 : 1,'upSale')">
                            {{goodsInfo.down ? $t('goodsDetails.sell.online') : $t('goodsDetails.sell.offline')}}
                    </el-button>
                </span>
            </li>
            <li>
                <span class="info_title">
                    <el-input class="input" v-model="copyData.usdprice" style="width: 70px"@input="limitPrice">
                    </el-input>
                </span>
                <span class="info_data">
                    <el-button class="button" type="text" :loading="priceLoading"
                                @click="handleClick(copyData,'','price')">{{ $t('goodsDetails.sell.price') }}
                    </el-button>
                </span>
            </li>
            <li>
                <span class="info_title">
                    待填
                </span>
                <span class="info_data">
                    <el-button class="button" type="text">
                    </el-button>
                </span>
            </li>
        </ul>
        <div class="right_text">
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "seller",
        data() {
            return {
                copyData: {},

                pullLoading: false,
                priceLoading: false,
                downLoading: false,
            }
        },
        computed: {
            ...mapState({
                goodsInfo: state => state.goods.goodsInfo,
            })
        },
        watch: {
            goodsInfo: {
                handler(val) {
                    this.copyData = JSON.parse(JSON.stringify(val))
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            // 单价限制
            limitPrice(val) {
                this.copyData.usdprice = this.$myFunctions.cutPoint(val, 2)
            },

            // 上架/下架/推送
            handleClick(row, sign, type) {
                let params
                switch (type) {
                    case 'pull':    // 推送
                        this.pullLoading = true
                        params = {id: row.tid, uptime: sign}
                        break;
                    case 'upSale':  // 上架/下架
                        this.downLoading = true
                        params = {down: sign, id: row.tid}
                        break;
                }
                if (type === 'price') {  // 修改价格字段一样
                    this.priceLoading = true
                    params = {usdprice: row.usdprice, id: row.tid, opt: 0}
                }
                this.$http('/WebMyGoods/update', {method: 'post', params}).then(res => {
                    if (res) this.$message.success('操作成功');
                    this.pullLoading = false
                    this.downLoading = false
                    this.priceLoading = false
                    if (type !== 'pull') this.$emit('change');
                })
            },
        }
    }
</script>

<style scoped lang="less">
.container{
    display: flex;
    flex-direction: row;

    .right_btn {
        width: 68%;
        background: #B6C4C7;
        padding: 5px 5px 5px 8px;
        margin: 5px;
        border: 1px solid #999;
        .title{
            display: block;
            width: 100%;
            padding-right: 4px;
            .head_title{
                width: 100%;
                background: rgb(157, 156, 219);
            }
        }
        li{ 
            ::v-deep{
                .el-button{
                    padding: 1px 6px;
                    color: #1421DB;
                }
                .el-input__inner{
                    margin: 0;
                    padding: 0; 
                    border-radius: 0;
                    height: 18px;
                    line-height: 18px;
                }
            }
            list-style: none;
            display: inline-block;
            line-height: 18px;
            width: 160px;
            margin-right: 3px;
            .info_title {
                width: 80px;
                border: 1px solid #FFF;
                background: #ADC8DE;
                padding: 1px;
                padding-left: 5px;
            }
            .info_data {
                text-align: left;
                border: 1px solid #fff;
                width: 80px;
                background: #77A5B1;
                padding: 1px;
            }
            .width {
                width: 80px;
            }
            .textBtn{
                color: #fff;
            }
            span {
                display: inline-block;
                box-sizing: border-box;
            }
        }
    }
    .right_text{
        width: 32%;
        border: 1px solid #77A5B1;
    }
}
</style>
