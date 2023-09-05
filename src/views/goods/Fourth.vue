<template>
    <el-row class="row" :gutter="10">
        <el-col :span="18">
            <div style="background: #C0DEF6;padding: 6px">
                <div style="font-weight: 600;font-size: 14px;margin-bottom: 10px">{{ $t('pubGoods.priceInfo') }}</div>
                <el-form label-width="40px">
                    <el-form-item :label="$t('pubGoods.price')">
                        <el-input v-model="price" style="width: 300px" @input="limitPrice">
                            <template slot="append">USD</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-row>
                            <el-col :span="6">
                                <span>{{ $t('pubGoods.bitcoin') }}{{ price/rate.usd | cutPoint(5) }}</span>
                            </el-col>
                            <el-col :span="6">
                                <span>{{ $t('pubGoods.rmb') }}{{ price*rate.cny | cutPoint(2) }}</span>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
                <el-alert title="无" type="success" :closable="false" style="text-align: left;margin-top: 10px">
                    <template slot='title'>
                        <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}</div>
                        <div>{{ $t('pubGoods.tips4-1') }}</div>
                        <div>{{ $t('pubGoods.tips4-2') }}</div>
                        <div>{{ $t('pubGoods.tips4-3') }}</div>
                    </template>
                </el-alert>
            </div>
        </el-col>
        <el-col :span="6" class="right">
            <div class="intro">
                <p style="margin-bottom: 20px">{{ $t('pubGoods.tips1-1') }}</p>
                <p>{{ $t('pubGoods.tips4-4') }}</p>
                <p>{{ $t('pubGoods.tips4-5') }}</p>
                <p>{{ $t('pubGoods.tips4-6') }}</p>
                <p>{{ $t('pubGoods.tips4-7') }}</p>
            </div>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        name: "Fourth",
        props: {
            data: Object,
        },
    }
</script>

<style scoped lang="less">
    .row {
        display: flex;
        flex-wrap: nowrap;

        .goods-form {
            &-title {
                padding: 6px 10px;
                background: #d0e0e3;
            }

            &-content {
                background: #B8C8D8;
                padding: 10px 10px 0 10px;

                .nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .tags {
                    min-height: 500px;
                    background: #9DC9F0;
                    padding: 10px;
                    border: 1px solid #000;
                    margin-bottom: 0
                }
            }
        }

        .right {
            .intro {
                height: 100%;
                background: #C2DEF4;
                padding: 10px;
                color: #419cc7
            }
        }
    }
</style>
