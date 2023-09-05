<template>
    <div class="feed-back">
        <div style="background: #f9f9f9;padding: 4px">
            <div id="router-title">
                <span id="title">{{ $t('feedback.publish') }}</span>
            </div>

            <el-row :gutter="10">
                <el-col :span="18">
                    <el-form size="small" :model="feedBack" ref="feedBack" :rules="rules" :show-message="false"
                             label-width="50px">
                        <el-form-item :label="$t('table.title')" prop="title" class="title-form">
                            <el-input size="small" v-model="feedBack.title"></el-input>
                        </el-form-item>
                        <el-form-item :label="$t('table.content')" prop="content" class="content-form">
                            <ubb-textarea v-model="feedBack.content" path="feedback" :uid="uid" :type="100"
                                          ref="textarea" :idList="idList" :fileList="fileList"
                                          :attachList="attachList"></ubb-textarea>
                        </el-form-item>
                        <el-button type="primary" size="small" id="custom-submit-button"
                                   @click="submitQuestion('feedBack')">{{ $t('feedback.pub') }}
                        </el-button>
                    </el-form>
                </el-col>
                <el-col :span="6">
                    <div class="feed-right">
                        <div style="height: 109px;overflow: hidden">
                            <span class="background"></span>
                        </div>
                        <div class="content">
                            <div class="img">
                                <span class="icon"></span>
                            </div>
                            <p class="title">{{ $t('feedback.tips') }}</p>
                            <div class="tag">
                                {{ $t('feedback.tip1') }}<br>
                                {{ $t('feedback.tip2') }}<br>
                                {{ $t('feedback.tip3') }}<br>
                                {{ $t('feedback.tip4') }}<br>
                                {{ $t('feedback.tip5') }}<br>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

    </div>
</template>

<script>
    import {mapState} from 'vuex'
    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "Feedback",
        components: {ubbTextarea},
        data() {
            return {
                feedBack: {
                    title: '',
                    content: ''
                },
                submitLoading: false,

                attachList: [],
                idList: [],
                fileList: [],

                rules: {
                    title: [
                        {required: true, message: '请填入反馈标题', trigger: 'blur'},
                        {min: 4, max: 25, message: '标题长度在4-25个字符之间'}
                    ],
                    content: [
                        {required: true, message: '请填入反馈内容', trigger: 'blur'},
                    ]
                }
            }
        },
        computed: {
            ...mapState({
                uid: state => state.user.userInfo.id,
            }),
        },
        methods: {
            submitQuestion(form) {
                this.$refs[form].validate((valid, object) => {
                    if (valid) {
                        this.submitLoading = true
                        let params = this.feedBack
                        params.attach = this.idList.length ? this.idList.toString() : 0
                        this.$http('/WebMyFeedback/save', {method: 'post', params}).then(res => {
                            if (res) {
                                this.$message.success('提交成功')
                                this.feedBack = {}
                                this.idList = []
                                this.attachList = []
                                this.$refs.textarea.clearFiles()
                                this.$router.push({name: 'feedback-list'})
                            }
                            this.submitLoading = false
                        })
                    } else this.$validateNotify(object)
                })
            },
        },
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common.less";

    .feed-back {
        max-width: @maxWidth;
        background: #e5e5e5;
        padding: 20px;
        height: 100%;
        margin: auto;

        ::v-deep {
            .el-form {
                .el-form-item {
                    padding: 6px;
                }
            }
        }

        .title-form {
            background: #4B82B9;
            margin-bottom: 0;

            ::v-deep.el-form-item__label {
                color: #fff;
            }
        }

        .content-form {
            background: #9AC3E6;
        }

        .feed-right {
            background-color: #DFF2D2;

            .background {
                background-image: url('../assets/image/feed.png');
                display: inline-block;
                background-position: 50%;
                width: 100%;
                height: 100%;
                background-size: 120%;
                background-repeat: no-repeat;
                -webkit-filter: blur(6.3px);
                filter: blur(6.3px);
                transform: scale(1.1);
            }

            .content {
                position: relative;

                .img {
                    position: absolute;
                    top: -20px;
                    left: 38%;
                    width: 60px;
                    height: 60px;
                    border-radius: 5px;
                    border: 2px solid hsla(0, 0%, 100%, .6);;

                    .icon {
                        background-image: url('../assets/image/feed.png');
                        width: 100%;
                        height: 100%;
                        background-position: 50%;
                        display: inline-block;
                        background-repeat: no-repeat;
                        background-size: cover;
                        border-radius: 3px;
                    }
                }

                .title {
                    padding: 50px 0 20px;
                    text-align: center;
                    font-size: @fontSize14;
                    font-weight: 600;
                }

                .tag {
                    font-size: @fontSize12;
                    padding: 10px;
                    color: #888;
                }
            }
        }
    }
</style>
