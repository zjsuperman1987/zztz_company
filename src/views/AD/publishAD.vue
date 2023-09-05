<template>
    <div class="editor" :class="type === 'ad' ? 'ad-editor' : 'information-editor'">

        <div id="router-title">
            <span id="title">{{ text }}</span>
        </div>

        <el-row :gutter="10" style="display: flex">
            <el-col :span="type === 'ad' ? 18 : 24">
                <div class="form">
                    <el-form :model="publishForm" size="small" ref="publishForm"
                             :show-message="false" :rules="rules" label-width="70px">
                        <el-form-item label="资讯类型" prop="type" v-if="type !== 'ad'">
                            <el-radio-group v-model="publishForm.type" size="mini">
                                <el-radio-button v-for="item of messageTypeList" :key="item.id" :label="item.id">{{
                                    item.title }}
                                </el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item :label="$t('pubAD.title')" prop="title">
                            <el-input size="small" v-model="publishForm.title" style="width: 600px"></el-input>
                        </el-form-item>
                        <el-form-item :label="$t('pubAD.content')" prop="content">
                            <ubb-textarea v-model="publishForm.content" path="adv" ref="textarea"
                                          :idList="idList" :fileList="fileList" :attachList="attachList"></ubb-textarea>
                        </el-form-item>
                        <el-form-item>
                            <el-button id="custom-submit-button" size="small" type="primary"
                                       :loading="submitLoading" @click="publish('publishForm')">{{ text }}
                            </el-button>
                        </el-form-item>
                    </el-form>

                    <el-alert v-if="type === 'ad'" title="无" type="warning" :closable="false"
                              style="text-align: left;margin-top: 10px">
                        <template slot='title'>
                            <div>{{ $t('pubAD.tips1') }}</div>
                            <div>{{ $t('pubAD.tips2') }}</div>
                            <div>{{ $t('pubAD.tips3') }}</div>
                        </template>
                    </el-alert>
                </div>
            </el-col>
            <el-col :span="6" v-if="type === 'ad'">
                <div style="background: #BADCFA;padding: 4px">
                    <p style="margin-bottom: 20px">{{ $t('pubGoods.tips1-1') }}</p>
                    <p>{{ $t('pubAD.tips4') }}</p>
                    <p>{{ $t('pubAD.tips5') }}</p>
                    <p>{{ $t('pubAD.tips6') }}</p>
                    <p style="margin-bottom: 20px">{{ $t('pubAD.tips7') }}</p>
                    <p>{{ $t('pubAD.tips8') }}</p>
                    <p>{{ $t('pubAD.tips9') }}</p>
                    <p>{{ $t('pubAD.tips10') }}</p>
                    <p>{{ $t('pubAD.tips11') }}</p>
                    <p style="margin-bottom: 20px">{{ $t('pubAD.tips12') }}</p>
                    <p>{{ $t('pubAD.tips13') }}</p>
                    <p style="margin-bottom: 20px">{{ $t('pubAD.tips14') }}</p>
                    <p>{{ $t('pubAD.tips15') }}</p>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "publishAD",
        components: {ubbTextarea},
        data() {
            return {
                id: this.$route.query.id,
                type: this.$route.query.type ? this.$route.query.type : sessionStorage.getItem('publishInformation'),
                loading: false,
                publishForm: {
                    type: 1,
                    title: '',
                    content: '',
                },
                options: [],
                attachList: [],
                idList: [],
                fileList: [],

                submitLoading: false,
                rules: {
                    title: [{required: true, message: this.$t('pubAD.desTitle'), trigger: 'blur'}],
                    content: [{required: true, message: this.$t('pubAD.desContent'), trigger: 'blur'}]
                }
            }
        },
        computed: {
            text() {
                if (this.type === 'information') {
                    if (this.id) return this.$t('pubAD.modifyInfo')
                    else return this.$t('pubAD.publishInfo')
                } else {
                    if (this.id) return this.$t('pubAD.modifyAD')
                    else return this.$t('pubAD.publishAD')
                }
            },
            ...mapState({
                isAdm: state => state.user.userInfo.is_adm,
                messageTypeList: state => state.message.messageType.data
            })
        },
        created() {
            this.getInfo(this.type, this.id)
            if (this.type !== 'ad') this.$http.get('/AdmArticle/all').then(res => {if (res) this.options = res})

        },
        methods: {
            getInfo(type, id) {
                if (id) {
                    this.loading = true
                    let url, params
                    if (type === 'information') {
                        url = `/AdmArticle/read`
                        params = {id}
                    } else url = `/WebMyAdv/${id}`
                    this.$http.get(url, {params}).then(res => {
                        if (res) {
                            this.publishForm = res
                            res.attach && res.attach.forEach(el => {
                                let obj = {}
                                obj.url = el.url
                                this.fileList.push(obj)
                                this.idList.push(el.id)
                                this.attachList.push({name: '[aid]' + el.id + '[/aid]'})
                            })
                            if (type === 'information') this.publishForm.content = res.content.contents;
                            else this.publishForm.content = res.post.contents
                        }
                        this.loading = false
                    })
                }
            },
            publish(form) {
                console.log(this.type)
                this.$refs[form].validate((valid, object) => {
                    if (valid) {
                        this.submitLoading = true
                        let params, url, method
                        console.log(this.id)
                        if (this.type === 'information') {  // 资讯
                            if (this.id) {
                                url = `/AdmArticle/update`
                                method = 'put'
                            } else {
                                url = '/AdmArticle/save'
                                method = 'post'
                            }
                            params = {
                                id: this.id,
                                title: this.publishForm.title,
                                content: this.publishForm.content,
                                type: this.publishForm.type,
                                attach: this.idList.length ? this.idList.toString() : 0
                            }
                        } else {  // 广告
                            if (this.isAdm && false) {//原来的有问题
                                url = `/AdmAdv/` + (this.id ? this.id : '')
                                method = 'put'
                            } else {
                                if (this.id) {
                                    url = `/WebMyAdv/` + (this.id ? this.id : '')
                                    method = 'put'
                                } else {
                                    url = '/WebMyAdv'
                                    method = 'post'
                                }
                            }
                            params = {
                                title: this.publishForm.title,
                                contents: this.publishForm.content,
                                attach: this.idList.length ? this.idList.toString() : 0
                            }
                        }
                        this.$http(url, {method, params}).then(res => {
                            console.log(res)
                            if (res) {
                                this.$message.success(this.$t('$message.success'))
                                if(this.type === 'ad') this.$router.push({name: 'myAD', query: {type: 'ad'}})
                                if(this.type === 'information') this.$emit('openByName','information')
                            }
                            this.submitLoading = false
                        })
                    } else this.$validateNotify(object)
                })
            },
        }
    }
</script>

<style scoped lang="less">
    @import "../../styles/common";

    .editor {
        min-width: @minWidth;
        max-width: @maxWidth;
        width: ;
    }

    .ad-editor {
        height: 100%;
        padding: 20px;
        background: #f9f9f9;

        .form {
            background: #D4EAFD;
            padding: 4px;
            height: 100%;
        }
    }

    .information-editor {
        padding: 0;
    }
</style>
