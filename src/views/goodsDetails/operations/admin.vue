<template>
    <div style="padding: 4px">
        <el-row class="container">
            <el-col :span="15">
                <ul class="right_admin">
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
                        <span class="info_title info_input">
                            <el-input class="input" v-model="copyData.usdprice" @input="limitPrice">
                            </el-input>
                        </span>
                        <span class="info_data">
                            <el-button class="button" type="text" :loading="priceLoading" @click="modifyPrice()">
                                {{ $t('goodsDetails.sell.price') }}
                            </el-button>
                        </span>
                    </li>
                    <li>
                        <span class="info_title">
                            管理状态
                        </span>
                        <span class="info_data status">
                            {{ goodsInfo.status }}
                        </span>
                    </li>
                </ul>
            </el-col>
            <el-col :span="9" class="right_admin">
                <ul>
                    <li class="reason_box"><span class="info_title">{{ $t('goodsDetails.adm.account') }}</span>
                        <span class="info_data reason">
                            <el-popover placement="right" width="400" trigger="hover" v-model="visible2" 
                                        @show="getSoldSelect(0)" title="选择关闭商品理由">
                                <div class="elect_btn"  v-if="goodsInfo.status === '正常'">
                                    <el-radio-group v-model="ea" size="mini" @change="chooseReason" class="radio-group">
                                        <el-radio-button v-for="item in admSelect" :key="item.id" :label="item.id" border>{{ item.text }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </div>
                                <el-button type="text" slot="reference" v-if="goodsInfo.status === '正常'">关闭商品</el-button>
                                <el-button type="text" slot="reference" @click="open" v-else>开启商品</el-button>
                            </el-popover>
                        </span>
                    </li>
                    <li class="reason_box"><span class="info_title">{{ $t('goodsDetails.adm.manage') }}</span>
                        <span class="info_data reason">
                            <el-button type="text" :loading="commendLoading" @click="recommend" size="mini">
                                {{goodsInfo.recommend ? '取消推荐' : '推荐商品'}}
                            </el-button>
                        </span>
                    </li>
                    <li class="reason_box"><span class="info_title">{{ $t('goodsDetails.adm.editClass') }}</span>
                        <span class="info_data reason">
                            <el-popover placement="right" width="400" trigger="hover" v-model="visible1" 
                                        @show="getSortTag" title="修改商品分类">
                                <div class="elect_btn">
                                    <el-radio-group v-model="ea" size="mini" @change="submitSort">
                                        <el-radio-button v-for="item in options" :key="item.value" :label="item.value" border>{{ item.label }}
                                        </el-radio-button>
                                    </el-radio-group>
                                    <page-nation
                                        :total="total"
                                        layout="prev, pager, next, jumper"
                                        :page.sync="listQuery.page"
                                        :limit.sync="listQuery.limit"
                                        @pagination="getSortTag"
                                        :page-size="listQuery.limit"
                                    />
                                </div>
                                <el-button type="text" slot="reference">修改分类</el-button>
                            </el-popover>
                        </span>
                    </li>
                    
                    <li class="reason_box"><span class="info_title">{{ $t('goodsDetails.adm.close') }}</span>
                        <span class="info_data reason">
                            <el-popover placement="right" width="400" trigger="hover" v-model="visible3" 
                                        @show="getSoldSelect(2)" title="选择冻结账户理由">
                                <div class="elect_btn">
                                    <el-radio-group v-model="ea" size="mini" @change="chooseReason" class="radio-group">
                                        <el-radio-button v-for="item in admSelect" :key="item.id" :label="item.id" border>{{ item.text }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </div>
                                <el-button type="text" slot="reference">封号理由</el-button>
                            </el-popover>
                        </span>
                    </li>
                </ul>
                <!-- <div>
                    <el-tooltip content="修改分类" placement="top-end">
                        <el-input class="cursor-input" v-model="goodsInfo.ea_title" @click.native="changeSort"
                                    readonly></el-input>
                    </el-tooltip>
                </div>
                <div style="margin: 4px 0">
                    <el-tooltip content="选择关闭理由" placement="top-end" v-if="goodsInfo.status === 1">
                        <el-input class="cursor-input" v-model="closeName"
                                    @click.native="getSoldSelect(0)" readonly
                                    placeholder="选择关闭理由"></el-input>
                    </el-tooltip>
                    <el-button type="primary" v-if="goodsInfo.status === 2" @click="open">当前已关闭 | 打开</el-button>
                </div>
                <div>
                    <el-tooltip content="选择封号理由" placement="top-end">
                        <el-input class="cursor-input" v-model="forbiddenName" readonly
                                    @click.native="getSoldSelect(2)"
                                    v-if="!goodsInfo.access_freeze"
                                    placeholder="选择封号理由"></el-input>
                    </el-tooltip>
                    <div v-if="goodsInfo.access_freeze" style="color: #B23535">该账号已冻结</div>
                </div> -->
            </el-col>
        </el-row>

        <!-- <el-dialog title="修改商品分类" :visible.sync="dialogSort"
                   v-dialog-drag custom-class="width600" :close-on-click-modal="false">
            <div class="tags">
                <el-radio-group v-model="ea" size="mini" @change="submitSort">
                    <el-radio v-for="item in options" :key="item.value" :label="item.value" border>{{ item.label }}
                    </el-radio>
                </el-radio-group>
            </div>
            <page-nation
                    :total="total"
                    layout="prev, pager, next, jumper"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getSortTag"
                    :page-size="listQuery.limit"
            />
        </el-dialog> -->

        <!-- <el-dialog :title="dialogReasonTitle" :visible.sync="dialogReason"
                   v-dialog-drag custom-class="width600" :close-on-click-modal="false">
            <div class="reason-tags">
                <el-radio-group v-model="ea" size="mini" @change="chooseReason" class="radio-group">
                    <el-radio v-for="item in admSelect" :key="item.id" :label="item.id" border>{{ item.text }}
                    </el-radio>
                </el-radio-group>
            </div>
        </el-dialog> -->
    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "admin",
        data() {
            return {
                closeValue: '',
                closeName: '',
                visible1: false,
                visible2: false,
                visible3: false,
                admSelect: [],

                forbiddenName: '',
                forbiddenValue: '',
                forbiddenInputValue: '',

                copyData: {},

                dialogSort: false,
                ea: '',
                options: [],
                listQuery: {
                    limit: 35,
                    page: 1
                },
                total: 0,

                dialogReason: false,
                dialogReasonTitle: '',
                dialogType: '',

                pullLoading: false,
                downLoading: false,
                priceLoading: false,
                openLoading: false,
                commendLoading: false,
                submitSortLoading: false,
            }
        },
        watch: {
            goodsInfo: {
                handler(val) {
                    this.copyData = {...val}
                    this.closeName = this.copyData.msg.goods_closed.text
                    this.closeValue = this.copyData.msg.goods_closed.id
                    this.forbiddenName = this.copyData.msg.access_freeze.text
                    this.forbiddenValue = this.copyData.msg.access_freeze.id
                    if(this.goodsInfo.status === 1) this.goodsInfo.status = '正常'
                    if(this.goodsInfo.status === 2) this.goodsInfo.status = '已关闭'
                    if(this.goodsInfo.status === 0) this.goodsInfo.status = '创建中'
                },
                deep: true
            }
        },
        computed: {
            ...mapState({
                goodsInfo: state => state.goods.goodsInfo,
            })
        },
        methods: {
            // 获取下架/封号理由
            getSoldSelect(type) {
                this.dialogType = type
                this.dialogReasonTitle = type === 0 ? '选择关闭理由' : '选择封号理由'
                this.$http('/AdmMsg/all', {method: 'post', params: {type}}).then(res => {
                    if (res) {
                        this.admSelect = res
                        this.dialogReason = true
                    }
                })
            },

            // 获取分类标签
            getSortTag() {
                return new Promise((resolve, reject) => {
                    let params = this.listQuery
                    params.level = 1
                    this.$http.get('/WebCategory/all', {params}).then(res => {
                        if (res) {
                            this.options = res.data
                            console.log(this.options)
                            this.total = res.total
                            resolve(res)
                        }
                    })
                })
            },

            // 下线和封号 选择理由并提交
            chooseReason(val) {
                if (this.dialogType === 0) {
                    let params = {
                        status: 2, id: this.goodsInfo.tid,
                        opt: 0, msg_id: val
                    }
                    this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                        if (res) {
                            this.$message.success('操作成功')
                            this.$emit('change')
                            this.dialogReason = false
                        }
                    })
                } else {
                    let params = {
                        id: this.goodsInfo.uid, opt: 0, type: 2, status: 2,
                        msg_id: val, rmk: this.forbiddenInputValue
                    }
                    this.$http('/AdmMember/update', {method: 'post', params}).then(res => {
                        if (res) {
                            this.$message.success('操作成功')
                            this.$emit('change')
                            this.dialogReason = false
                        }
                    })
                }
            },

            // 修改分类
            changeSort() {
                this.ea = ''
                this.getSortTag().then(res => {
                    if (res) this.dialogSort = true
                })
            },

            // 提交分类
            submitSort(val) {
                if (!this.ea) return this.$message.warning('请选择分类')
                this.submitSortLoading = true
                let params = {
                    id: this.goodsInfo.tid,
                    opt: 0,
                    ea: val
                }
                this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.$emit('change')
                        this.dialogSort = false
                    }
                    this.submitSortLoading = false
                })
            },

            // 单价限制
            limitPrice(val) {
                this.copyData.usdprice = this.$myFunctions.cutPoint(val, 2)
            },

            // 推送
            pull() {
                this.pullLoading = true
                let params = {id: this.goodsInfo.tid, opt: 0, uptime: 1}
                this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                    if (res) this.$message.success('操作成功')
                    this.pullLoading = false
                })
            },

            // 下线商品
            offSale() {
                this.downLoading = true
                let params = {id: this.goodsInfo.tid, opt: 0, down: this.goodsInfo.down ? 0 : 1}
                this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.$emit('change')
                    }
                    this.downLoading = false
                })
            },

            // 下线后打开
            open() {
                this.openLoading = true
                let params = {status: 1, id: this.goodsInfo.tid, opt: 0}
                this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.$emit('change')
                    }
                    this.openLoading = false
                })
            },

            // 推荐
            recommend() {
                this.commendLoading = true
                let params = {
                    id: this.goodsInfo.tid,
                    opt: 0,
                    recommend: this.goodsInfo.recommend ? 0 : 1
                }
                this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.$emit('change')
                    }
                    this.commendLoading = false
                })
            },

            // 修改价格
            modifyPrice() {
                this.priceLoading = true
                let params = {usdprice: this.copyData.usdprice, id: this.goodsInfo.tid, opt: 0}
                this.$http('/AdmGoods/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.$emit('change')
                    }
                    this.priceLoading = false
                })
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

            //弹出框展示时hook
            handleShow() {
                this.getSortTag()
            }
        }
    }
</script>

<style scoped lang="less">
.container{
    display: flex;
    flex-direction: row;
    .right_admin {
        background: #B6C4C7;
        padding: 5px 2px 5px 8px;
        border: 1px solid #999;
        .title{
            display: block;
            width: 100%;
            .head_title{
                width: 296px;
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
            width: 148px;
            margin-right: 3px;
            .info_title {
                width: 70px;
                border: 1px solid #FFF;
                background: #ADC8DE;
                padding: 1px;
                padding-left: 5px;
            }
            .info_input{
                padding-left: 1px;
            }
            .info_data {
                text-align: left;
                border: 1px solid #fff;
                width: 75px;
                background: #77A5B1;
                padding: 1px;
            }
            .reason{
                width: 100px;
            }
            .width {
                width: 75px;
            }
            .status {
                padding-left: 8px;
            }
            .textBtn{
                color: #fff;
            }
            span {
                display: inline-block;
                box-sizing: border-box;
            }
        }
        .reason_box{
            width: 170px;
        }
    }
    .right-left {
        ::v-deep {
            .el-col {
                margin-bottom: 4px;

                .price-input {
                    display: flex;
                    align-items: center;

                    .input {
                        .el-input__inner {
                            border-radius: 4px 0 0 4px;
                        }
                    }

                    .button {
                        border-radius: 0 4px 4px 0;
                    }
                }
            }
        }
    }

    .admin_right{
        background: #B6C4C7;
        padding: 5px 2px 5px 8px;
        border: 1px solid #999;
    }

    .eve {
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:not(:last-child) {
            margin-bottom: 3px;
        }

        .cursor-input {
            ::v-deep {
                .el-input__inner {
                    cursor: pointer;
                }
            }
        }
    }

    .tags, .reason-tags {
        height: 276px;
        background: #9DC9F0;
        padding: 10px;
        margin-bottom: 0;
        .el-radio {
            width: 80px;
            margin-bottom: 10px;
            margin-right: 10px;
            background: #fff;
            padding: 4px 6px;

            &:hover {
                background: #E4F0FA;
            }

            ::v-deep {
                .el-radio__input {
                    display: none;
                }

                .el-radio__label {
                    padding-left: 0;
                }
            }

            &.is-checked {
                background: #3c648c;
            }
        }

        ::v-deep .el-radio__input.is-checked + .el-radio__label {
            color: #fff;
        }

        .el-radio.is-bordered + .el-radio.is-bordered {
            margin-left: 0;
        }
    }

    .reason-tags {
        .el-radio {
            width: auto;
        }
    }
}
::v-deep{
    .el-popover__title{
        margin-top: 12px;
    }
}
</style>

<style lang="less">
    .el-popover{
        // height: 300px;
        .el-popover__title{
            margin: 0;
            padding: 12px;
            background: #77A5B1;
        }
        .elect_btn{
            background: #9DC9F0;
            padding-bottom: 10px;
            .el-radio-button{
                margin: 6px;
            }
        }
    }
</style>