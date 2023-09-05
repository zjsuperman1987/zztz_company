<template>
    <div class="main-recharge">
        <div class="main-main">
            <div class="main-header">
                <div class="main-header-select">
                    <span class="currency_type">请选择币种:</span>
                    <el-radio-group v-model="radio" @change="currency_change">
                        <el-radio-button size="mini" label="1" border>BTC</el-radio-button>
                        <el-radio-button size="mini" label="2" border>USDT</el-radio-button>
                    </el-radio-group>
                </div>
                <div class="main-header-input">
                    <el-input class="input" size="small" v-model="inputAddress" readonly
                              :placeholder="$t('assets.desBtcAddr')"></el-input>
                    <span class="copy" v-if="inputAddress" v-copy="inputAddress">{{ $t('button.copy') }}</span>
                    <el-button @click="getAddress" icon="el-icon-refresh" type="primary" :loading="FPAddress">{{
                        inputAddress ? $t('assets.newAddr') : $t('assets.assignAddr')}}
                    </el-button>
                </div>
            </div>

            <div class="main-middle">
                <!--      地址列表-->
                <div class="address-list">
                    <div class="table-title" style="display: flex;justify-content: space-between">
                        <span>{{ $t('assets.addrList') }}</span>
                        <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getAddressList">{{
                            $t('button.refresh') }}
                        </el-button>
                    </div>
                    <div class="address-list-table">
                        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" highlight-current-row
                                  :data="addressList" size="small" ref="addressBox" v-loading="addressLoading" border>
                            <el-table-column :label="$t('assets.reAddress')" prop="address"
                                             width="500"></el-table-column>
                            <el-table-column :label="$t('assets.qrcode')" align="center"
                                             width="100">
                                <template v-slot="{row}">
                                    <el-button size="small" type="primary" @click="showqrcode(row)">{{$t('table.view')}}
                                    </el-button>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('assets.reAmount')" prop="received"
                                             align="center"></el-table-column>
                            <el-table-column :label="$t('assets.time')" prop="crestamp" width="200"
                                             align="center"></el-table-column>
                            <el-table-column :label="$t('table.actions')" width="150" align="center">
                                <template v-slot="{row}">
                                    <el-button size="small" type="primary" @click="refresh(row)"
                                               :loading="row.refreshing">{{ $t('assets.refresh') }}
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <page-nation
                                v-show="addressListTotal>0"
                                :total="addressListTotal"
                                :page.sync="listQuery.page"
                                :limit.sync="listQuery.limit"
                                @pagination="getAddressList()"
                                :page-size="listQuery.limit"
                                :page-sizes="[10, 20, 40]"
                        />
                    </div>
                </div>
                <!--      充值记录-->
                <div class="address-records">
                    <div class="table-title" style="display: flex;justify-content: space-between">
                        <span>{{ $t('assets.rechargeRecord') }}</span>
                    </div>
                    <div class="address-records-table">
                        <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" :data="addressRecords"
                                  border
                                  highlight-current-row size="small" ref="addressRecordsBox"
                                  v-loading="addressRecordsLoading">
                            <el-table-column :label="$t('assets.reAddress')" prop="addr" width="350"></el-table-column>
                            <el-table-column :label="$t('assets.time')">
                                <template v-slot="{row}">
                                    {{row.create_time }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('assets.reAmount')">
                                <template v-slot="{row}">
                                    <span>{{row.amount }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('assets.ensure')" prop="ensure"></el-table-column>
                            <el-table-column :label="$t('table.status')" width="120">
                                <template v-slot="{row}">
                                    <el-button size="small" type="info" plain v-if="row.status === 0">未到账</el-button>
                                    <el-button size="small" type="success" plain v-if="row.status === 1">已到账</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <page-nation
                                v-show="addressRecordsTotal>0"
                                :total="addressRecordsTotal"
                                :page.sync="listQuery.page"
                                :limit.sync="listQuery.limit"
                                @pagination="refresh()"
                                :page-size="listQuery.limit"
                                :page-sizes="[10, 20, 40]"
                        />
                    </div>
                </div>
            </div>
            <div class="main-footer">
                <ul>
                    <li>{{ $t('button.tips') }}</li>
                    <li>{{ $t('assets.tip1') }}</li>
                    <li>{{ $t('assets.tip2') }}</li>
                    <li>{{ $t('assets.tip3') }}</li>
                    <li>{{ $t('assets.tip4') }}</li>
                    <li>{{ $t('assets.tip5') }}</li>
                </ul>
            </div>
        </div>

        <!-- 二维码 -->
        <div v-if="qrcodeText" class="qrcode" @click="qrcodeText=''">
        <vue-qr :size="255"
            :margin="0"
            :auto-color="true"
            :dot-scale="1"
            :text="qrcodeText"/>
        </div>
    </div>
</template>

<script>
    import VueQr from 'vue-qr';
    import myFunctions from "@/utils/myFunctions";

    const currency = () => import('@/components/common/Currency')
    export default {
        name: "Recharge",
        components: {currency,VueQr},
        data() {
            return {
                radio: '1',
                currency_id: this.$route.query.currency_id,
                inputAddress: this.$route.query.address,
                addressLoading: false,
                addressRecordsLoading: false,
                FPAddress: false,
                addressList: [],
                addressRecords: [],
                // 分页
                listQuery: {
                    page: 1,
                    limit: 10,
                },
                addressListTotal: 0,
                addressRecordsTotal: 0,
                qrcodeText:'',//二维码内容
            }
        },
        created() {
            this.getAddressList()
            this.getHistoryList()
        },
        methods: {
            // 没有地址 获取地址
            async getAddress() {
                let res = await myFunctions.post('/WebMyRecharge/save', {currency_id: this.radio})
                if (res) {
                    this.inputAddress = res.address
                    this.$message.success(this.$t('$message.success'))
                    this.getAddressList()
                }
            },
            // 获取充值地址列表
            getAddressList() {
                this.addressLoading = true
                let params = this.listQuery
                params.currency_id = this.radio
                this.$http.get('/WebMyRecharge', {params}).then(res => {
                    if (res) {
                        for(let prop of res.data) prop.received = parseFloat(prop.received + '')
                        this.addressListTotal = res.total
                        this.addressList = res.data
                        if (res.data.length) this.inputAddress = this.addressList[0].address ? this.addressList[0].address : ''
                        if (!res.data.length) this.inputAddress = ''
                    }
                    this.addressLoading = false
                })
            },
            // 获取充币记录
            getHistoryList(address) {
                this.addressRecordsLoading = true
                let params = this.listQuery
                params['addr'] = address
                this.$http.get('/WebMyRecharge/read', {params}).then(res => {
                    if (res) {
                        this.addressRecords = res.data
                        this.addressRecordsTotal = res.total
                    }
                    this.addressRecordsLoading = false
                })
            },
            //  刷新汇款详情
            refresh(row) {
                this.$set(row, 'refreshing', true)
                let params = {address: row.address,currency_id:this.radio}
                myFunctions.post('/WebMyRecharge/update', params).then(res => {
                    if (res) {
                        this.$store.dispatch("user/getInfo")
                        this.$message.success(this.$t('$message.success'))
                        this.getHistoryList(row.address)
                    }
                    this.$set(row, 'refreshing', false)
                })
            },
            currency_change(){
                this.getAddressList()
                this.getHistoryList()
            },
            //显示二维码
            showqrcode(row){
                this.qrcodeText=row.address
            },
        },
    }
</script>

<style scoped lang="less">
    @import "~@/styles/personal/index.less";

    .main-recharge {
        .main-main {
            .main-header {
                /*text-align: center;*/
                padding: 5px 0 10px;

                .main-header-select{
                    margin-left: 20px;

                    .currency_type{
                        margin-right: 10px;
                    }
                }
                .main-header-input {
                    .input {
                        width: 50%;
                        margin: 10px 0 0;
                    }

                    .copy {
                        color: @aColor;
                        font-size: @fontSize12;
                        cursor: pointer;
                        margin: 0 10px;

                        &:hover {
                            color: @aHover;
                        }
                    }
                }
            }

            .main-middle {
                .address-list {
                    margin-bottom: 30px;
                    border-bottom: none;
                }

                .address-records {
                    border-bottom: none;
                }
            }

            .main-footer {
                margin-top: 30px;

                ul li {
                    text-align: left;
                    color: #9aa5b5;
                }
            }
        }
    }
    .qrcode{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.2);
        z-index: 999;
        display:flex;
        justify-content:center;
        align-items:center;
    }
    .qrcode img{
        padding: 20px;
        background-color: #fff;
    }
</style>
