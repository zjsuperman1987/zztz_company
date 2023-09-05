<template>
    <div>
        <el-row v-if="appealList.length>=1">
            <el-col :span="3">
                <div v-if="appealList.length>1">
                    <div v-for="(item,index) in appealList" :key="index" class="user-left">
                        <div @click="appealDetails(item)" class="user-left-u" :class="{isActive:item.id===s1}">
                            <span>{{ item.snapshot.sn }}</span>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :span="12">
                <div v-if="formRep" class="form-info">
                    <div class="appeal-info">申诉信息</div>
                    <el-form class="form-item">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="申 述 人：">
                                    {{ formRep.userInfoFrom.nick_name }}
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="被申诉人：">
                                    {{ formRep.userInfoTo.nick_name }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="申诉状态：">
                                    <el-tag size="small" v-if="formRep.status === 0">处理中</el-tag>
                                    <el-tag size="small" v-if="formRep.status === 1 || formRep.status === 2"
                                            type="success">已处理
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="申诉时间：">
                                    {{formRep.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col>
                                <el-form-item label="申诉缘由："></el-form-item>
                                <p style="font-size: 14px;text-indent: 28px">{{ formRep.reason_user }}</p>
                            </el-col>
                        </el-row>
                    </el-form>
                    <div class="appeal-info">订单信息</div>
                    <el-form class="form-item">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="订 单 号：">
                                    {{formRep.snapshot.sn}}
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="创建时间：">
                                    {{formRep.snapshot.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="订单单价：">
                                    {{formRep.snapshot.unit_price}} CNY
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="订单总价：">
                                    {{ formRep.snapshot.total_price }} CNY
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="订单数量：">
                                    {{formRep.snapshot.number}} BTC
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="订单状态：">
                                    <el-tag size="small">{{ statusInfo }}</el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item label="支付方式："></el-form-item>
                        <el-row v-if="formRep.snapshot.snapshot.alipay_account">
                            <el-col :span="5" :offset="1">
                                <el-tag size="small" effect="plain">支付宝</el-tag>
                            </el-col>
                            <el-col :span="8" style="text-align: left">{{formRep.snapshot.snapshot.alipay_account}}
                            </el-col>
                            <el-col :span="4" style="text-align: left" v-if="formRep.snapshot.snapshot.alipay_img">
                                <el-popover
                                        width="300"
                                        placement="right"
                                        trigger="click">
                                    <img width="300px" :src="site_static+formRep.snapshot.snapshot.alipay_img" alt="">
                                    <span slot="reference"
                                          class="iconfont icon-erweima"
                                          style="cursor: pointer;font-size: 12px;color: #409eff"
                                    >二维码</span>
                                </el-popover>
                            </el-col>
                        </el-row>
                        <el-row style="padding: 5px 0" v-if="formRep.snapshot.snapshot.wechat_account">
                            <el-col :span="5" :offset="1">
                                <el-tag size="small" type="success" effect="plain">&ensp;微信&ensp;</el-tag>
                            </el-col>
                            <el-col :span="8" style="text-align: left">{{formRep.snapshot.snapshot.wechat_account}}
                            </el-col>
                            <el-col :span="4" style="text-align: left" v-if="formRep.snapshot.snapshot.wechat_img">
                                <el-popover
                                        width="300"
                                        placement="right"
                                        trigger="click">
                                    <img width="300px" :src="site_static+formRep.snapshot.snapshot.alipay_img" alt="">
                                    <span slot="reference"
                                          class="iconfont icon-erweima"
                                          style="cursor: pointer;font-size: 12px;color: #409eff"
                                    >二维码</span>
                                </el-popover>
                            </el-col>
                        </el-row>
                        <el-row v-if="formRep.snapshot.snapshot.bank_name">
                            <el-col :span="5" :offset="1">
                                <el-tag type="warning" size="small" effect="plain">银行卡</el-tag>
                            </el-col>
                            <el-col :span="15" style="text-align: left">{{formRep.snapshot.snapshot.bank_account}}&emsp;{{formRep.snapshot.snapshot.bank_name}}</el-col>
                        </el-row>
                    </el-form>
                </div>
            </el-col>
            <el-col :span="9">
                <div class="chat-room">
                    <div class="messageInfo" v-viewer>
                        <div v-for="(item,index) in messageInfo" :key="index">
                            <div class="user-item common" v-if="uid === item.f_uid">
                                <p>{{item.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
                                <div class="user">
                                    <!--                  <Avatar :username="$store.getters.userName" :size="40" color="#fff" :inline="true"></Avatar>-->
                                    <div class="user-wrap user-admin"
                                         v-html="item.content.replace(/\[img\](.+)\[\/img\]/,'<img style=\'width:120px\' src=$1 />')"></div>
                                </div>
                            </div>
                            <div class="admin-item common" v-else>
                                <p>{{item.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
                                <div class="admin">
                                    <!--                  <Avatar username="客" :size="40" color="#fff" :inline="true"></Avatar>-->
                                    <div class="admin-wrap user-admin"
                                         v-html="item.content.replace(/\[img\](.+)\[\/img\]/,'<img style=\'width:120px\' src=$1 />')"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="upload">
                    <el-upload
                            ref="upload"
                            :multiple="false"
                            :show-file-list="false"
                            action="#"
                            :http-request="uploadFiles"
                            class="avatar-uploader"
                            accept=".jpeg,.jpg,.gif,.png"
                            :limit="1">
                        <i class="el-icon-picture-outline"></i>
                    </el-upload>
                    <el-input v-model="questions.textarea" type="text" @keyup.enter.native="submitAppeal"></el-input>
                    <el-button type="primary" @click="submitAppeal">提 交</el-button>
                </div>
            </el-col>
        </el-row>
        <div v-else style="text-align: center">
            <span>当前暂无申诉信息</span>
        </div>
        <el-dialog v-dialogDrag :visible.sync="dialogVisible" width="50%">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>

<script>
    import {mapState} from 'vuex'

    export default {
        name: "representation",
        data() {
            return {
                timer: null,
                questions: {
                    textarea: '',
                },
                id: this.$route.query.id,
                noneBtnImg: false,
                dialogImageUrl: '',
                limitCountImg: 1,
                dialogVisible: false,
                statusInfo: '',
                s1: '',
                appealList: [],
                messageInfo: [],
                formRep: '',
            }
        },
        computed: {
            ...mapState({
                uid: state => state.user.userInfo.id,
                site_static: state => state.site.siteSetting.site_static_chars
            })
        },
        methods: {
            getRep() {
                this.$http('', {method: 'get'}).then(res => {
                    if (res) {
                        this.appealList = res.list
                        this.appealDetails(this.appealList[0] || '')
                    }
                })
            },
            appealDetails(item) {
                if (item === '') {
                    this.formRep = ''
                    return
                }
                this.s1 = item.id
                this.id = item.id
                this.getMessage()
                this.scrollToBottom()
                if (item.snapshot.s_type === 0) this.statusInfo = (this.uid === item.snapshot.subscribe_id) ? '待转账' : '等待对方转账'
                else this.statusInfo = (this.uid === item.snapshot.subscribe_id) ? '等待对方转账' : '待转账'
                this.formRep = item
            },
            imgChange(file, fileList) {
                const sizeLimit = file.size < 1024 * 1024 * 2
                if (!sizeLimit) {
                    this.$message.error('上传图片大小不能超过 2MB!')
                    fileList.splice(-1, 1);
                }
            },
            getMessage() {
                this.$http({method: 'get', params: {symbol: 'otc.web_message.get_list', id: this.id}}).then(res => {
                    if (res) this.messageInfo = res.list.reverse()
                })
            },
            // 发送文字
            submitAppeal() {
                if (this.questions.textarea) {
                    let params = {
                        symbol: 'otc.web_message.create',
                        content: this.questions.textarea,
                        id: this.id
                    }
                    this.$http({method: 'post', params}).then(res => {
                        if (res) {
                            this.getMessage()
                            this.scrollToBottom()
                            this.questions.textarea = ''
                        }
                    })
                } else this.$message.warning('请输入要提交的问题')
            },
            // 发送图片
            uploadFiles(options) {
                if (options.file) {
                    let formData = new FormData();
                    formData.append('image', options.file);
                    this.$http({
                        headers: {'Content-Type': 'multipart/form-data'},
                        method: 'post',
                        params: {symbol: 'otc.web_attach.upload'},
                        data: formData
                    }).then(res => {
                        if (res) {
                            let params = {
                                symbol: 'otc.web_message.create',
                                content: '[img]' + res.url + '[/img]',
                                id: this.id
                            }
                            this.$http({method: 'post', params}).then(res => {
                                if (res) {
                                    this.getMessage()
                                    this.scrollToBottom()
                                }
                            })
                        }
                        this.$refs.upload.clearFiles();
                    })
                }
            },
            // 滚动条默认底部
            scrollToBottom: function () {
                this.$nextTick(() => {
                    let container = this.$el.querySelector(".chat-room");
                    if (container) container.scrollTop = container.scrollHeight;
                })
            }
        },
        beforeDestroy() {
            this.timer = null
        }
    }
</script>

<style scoped lang="less">
    .user-left {
        max-height: 600px;

        .isActive {
            background-color: #d9d9d9;
        }

        .user-left-u {
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            padding: 6px 0;
            cursor: pointer;

            .time {
                font-size: 12px;
                color: #888888;
            }
        }
    }

    .messageInfo {
        padding: 6px;

        .common {
            display: flex;
            flex-direction: column;
            margin-top: 10px;

            .user-admin {
                background-color: #fff;
                padding: 6px;
                border-radius: 4px;
                max-width: 260px;
                word-break: break-all;
            }

            p {
                text-align: center;
                font-size: 9px;
                color: #838B83;
            }
        }

        .user-item {
            .user {
                flex-direction: row-reverse;
                display: flex;
                align-items: center;

                .user-wrap {
                    margin-right: 10px;
                }
            }
        }

        .admin-item {
            .admin {
                display: flex;
                align-items: center;

                .admin-wrap {
                    margin-left: 10px;
                }
            }
        }
    }

    .form-info {
        margin: 0 10px;
        border: 1px solid #d8d8d8;

        .form-item {
            padding: 10px 10px 20px 10px;

            /deep/ .el-form-item {
                margin-bottom: 0;
            }
        }

        .appeal-info {
            padding-left: 24px;
            font-size: 14px;
            line-height: 48px;
            border-bottom: 1px solid #e6ecf2;
            color: #18232d;
            background-color: #f2f6fa;
        }
    }

    .upload {
        display: flex;
        align-items: center;

        /deep/ .el-input__inner {
            border-radius: 0;
        }

        /deep/ .el-button {
            border-radius: 0;
        }

        .el-icon-picture-outline {
            font-size: 38px;
            border: 1px solid #DCDFE6;
            border-right: none;
        }
    }

    .chat-room {
        background-color: #F5F5F5;
        height: 450px;
        border: 1px solid #DCDFE6;
        border-bottom: none;
        overflow-y: auto;
    }
</style>
