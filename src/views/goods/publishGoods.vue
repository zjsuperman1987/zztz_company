<template>
    <div class="main-container">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}{{isAdm}}</span>
        </div>

        <el-steps :active="stepActive" simple finish-status="success">
            <el-step @click.native="changeStep(0)" :class="{ active: stepActive === 0 }"
                     :title="$t('pubGoods.first')" icon="el-icon-edit"></el-step>
            <el-step @click.native="changeStep(1)" :class="{ active: stepActive === 1 }"
                     :title="$t('pubGoods.second')" icon="el-icon-document"></el-step>
            <el-step @click.native="changeStep(2)" :class="{ active: stepActive === 2 }"
                     :title="$t('pubGoods.third')" icon="el-icon-document"></el-step>
        </el-steps>

        <div v-show="stepActive === 0">
            <first-step ref="first" :ea="goodsDetails.selectValue"></first-step>
        </div>

        <div v-show="stepActive === 1">
            <second-step ref="second" :info="goodsDetails.content" :title_p="goodsDetails.title"
                         :pri="goodsDetails.usdprice"
                         :attachLists="attachList1" :idLists="idList1" :fileLists="fileList1"></second-step>
        </div>

        <div v-show="stepActive === 2">
            <third-step ref="third" :info="goodsDetails.afterSales"
                        :attachLists="attachList" :idLists="idList" :fileLists="fileList"></third-step>
        </div>

        <div class="steps-button">
            <el-row>
                <el-col :span="16">
                    <div style="display: flex;justify-content: center;" v-if="token && ((release && trade_end_time) || (!release)) ||isAdm">
                        <el-button type="primary" icon="el-icon-back" v-if="stepActive !== 0"
                                   @click="backStep">{{ $t('pubGoods.back') }}
                        </el-button>
                        <el-button type="primary" icon="el-icon-right" v-if="stepActive !== 2"
                                   @click="nextStep(stepActive)">
                                   {{ $t('pubGoods.next') }}
                        </el-button>
                        <el-button type="primary" icon="el-icon-document-checked" :loading="subLoading"
                                   v-else @click="submitGoods">{{ id ? $t('pubGoods.modify') : $t('pubGoods.pub')}}
                        </el-button>
                    </div>
                </el-col>
            </el-row>
        </div>

    </div>
</template>

<script>
    import {mapState} from "vuex";

    const firstStep = () => import('./First')
    const secondStep = () => import('./Second')
    const thirdStep = () => import('./Third')
    const fourthStep = () => import('./Fourth')
    export default {
        name: "publishGoods",
        components: {firstStep, secondStep, thirdStep, fourthStep},
        data() {
            return {
                id: this.$route.query.id,
                stepActive: 0,
                goodsDetails: {
                    selectValue: 0,  // 选择的类型ID
                    title: '',
                    content: '',
                    usdprice: '',   //价格
                    afterSales: '', //售后
                },
                subLoading: false,
                rules: {
                    selectValue: [
                        {required: true, message: '请选择分类', trigger: ['blur', 'change']},
                    ],
                    newSelectValue: [
                        {required: true, message: '请选择分类', trigger: ['blur', 'change']}
                    ],
                    name: [
                        {required: true, message: '请填入标题', trigger: 'blur'},
                    ],
                    usdprice: [
                        {required: true, message: '请填入价格', trigger: 'blur'},
                    ],
                    title: [
                        {required: true, message: '请填入标题', trigger: 'blur'},
                        {min: 8, message: '标题最少8个字', trigger: 'blur'},
                    ],
                    content: [
                        {required: true, message: '请填入商品详情', trigger: 'blur'},
                        {min: 10, message: '商品详情最少10个字', trigger: 'blur'},
                    ],
                    afterSales: [
                        {required: true, message: '请填入售后信息', trigger: 'blur'},
                        {min: 10, message: '售后信息最少10个字', trigger: 'blur'},
                    ]
                },
                //内容
                attachList1: [],
                idList1: [],
                fileList1: [],
                // 售后
                attachList: [],
                idList: [],
                fileList: [],
            }
        },
        computed: {
            ...mapState({
                uid: state => state.user.userInfo.id,
                token: state => state.user.token,
                trade_end_time: state => state.user.userInfo.trade_end_time,
                release: state => state.site.siteSetting.goods_release_chars*1,
                post_end_time: state => state.user.userInfo.post_end_time,
                reply: state => state.site.siteSetting.goods_reply_chars*1,
                isAdm: state => state.user.userInfo.is_adm,
            })
        },
        created() {
            if (this.id) {
                this.$http.get('/WebMyGoods/read', {params: {id: this.id}}).then(res => {
                    if (res) {
                        res.attach.forEach(el => {
                            let obj = {}
                            obj.url = el.url
                            this.fileList1.push(obj)
                            this.idList1.push(el.id)
                            this.attachList1.push({name: '[aid]' + el.id + '[/aid]'})
                        })
                        res.attach_sales.forEach(el => {
                            let obj = {}
                            obj.url = el.url
                            this.fileList.push(obj)
                            this.idList.push(el.id)
                            this.attachList.push({name: '[aid]' + el.id + '[/aid]'})
                        })
                        this.goodsDetails = res
                        this.goodsDetails.selectValue = res.ea
                        this.goodsDetails.afterSales = res.after_sales ? res.after_sales.contents : ''
                        this.goodsDetails.content = res.post.contents
                    }
                })
            }
        },
        methods: {
            changeStep(val) {
                if (val === this.stepActive) return;
                if (val < this.stepActive) {
                    this.stepActive = val
                } else this.nextStep(val - 1)
            },

            backStep() {
                this.stepActive--
            },

            nextStep(step) {
                switch (step) {
                    case 0:
                        let {ea} = {...this.$refs.first.goodsDetails}
                        if (!ea) return this.$message.warning('请选择商品分类')
                        this.goodsDetails.selectValue = ea
                        this.stepActive++
                        break;
                    case 1:
                        let title = this.$refs.second.title
                        let price = this.$refs.second.price
                        let content = this.$refs.second.content
                        let idList = this.$refs.second.idList
                        if (!title) return this.$message.warning('请输入商品标题')
                        if (title.length < 2) return this.$message.warning('标题字数至少2位数')
                        if (!price) return this.$message.warning('请设置商品价格')
                        if (!content) return this.$message.warning('请输入商品描述')
                        this.goodsDetails.usdprice = price
                        this.goodsDetails.title = title
                        this.goodsDetails.content = content
                        this.idList1 = idList
                        this.stepActive++
                        break;
                }
            },

            // 提交商品
            submitGoods() {
                this.subLoading = true
                let afterSales = this.$refs.third.content
                let idLists = this.$refs.third.idList
                if (!afterSales) return this.$message.warning('请输入商品售后信息')
                this.goodsDetails.afterSales = afterSales
                this.idList = idLists
                const params = {
                    id: this.id ? this.id : '',
                    title: this.goodsDetails.title,
                    ea: this.goodsDetails.selectValue,
                    usdprice: this.goodsDetails.usdprice,
                    contents: this.goodsDetails.content,
                    goods_services: this.goodsDetails.afterSales,
                    opt: this.isAdm ? 1 : '',
                    attach: this.idList1.length ? this.idList1.toString() : 0,
                    attach_sales: this.idList.length ? this.idList.toString() : 0
                }
                const url = this.isAdm
                    ? (this.id ? '/AdmGoods/update' : '/WebMyGoods/save')
                    : (this.id ? '/WebMyGoods/update' : '/WebMyGoods/save')
                this.$http(url, {method: 'post', params}).then(res => {
                    if (res) {
                        this.id ? this.$message.success('修改成功') : this.$message.success('发布成功')
                        if (this.isAdm) {
                            setTimeout(() => {
                                this.$router.go(-1)
                            }, 500)
                        } else {
                            setTimeout(() => {
                                this.$router.push({name: 'myGoods'})
                            }, 500)
                        }
                    }
                    this.subLoading = false
                }).catch(() => this.subLoading = false)
            },

        },
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common.less";

    ::v-deep {
        .el-steps {
            padding: 10px;

            .active {
                background: #d8d8d8;
            }

            .el-step {
                padding: 6px;
                border: 1px solid #000;
                cursor: pointer;
            }

            .el-step__title {
                font-size: 14px;
                white-space: nowrap;
            }

            .el-step__arrow {
                display: none;
            }
        }
    }

    .main-container {
        height: 100%;
        min-width: @minWidth;
        max-width: @maxWidth;
        margin: auto;
        padding: 20px;

        .steps-button {
            background: #B8e8e3;
            padding: 10px;

            .el-button {
                padding: 6px 30px;
            }
        }
    }
</style>
