<template>
    <div class="edit-goods">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
        </div>

        <ubb-textarea v-model="content" path="goods" ref="textarea" :title="$t('goodsDetails.desMessage')"
                      :idList="idList" :fileList="fileList" :attachList="attachList">
        </ubb-textarea>

        <el-button id="custom-submit-button" class="submit-button" type="primary" @click="submitContent">
            {{$t('goodsDetails.OK')}}
        </el-button>

        <el-alert title="无" type="success" :closable="false" style="text-align: left;margin-top: 10px">
            <template slot='title'>
                <div> - {{$t('goodsDetails.note1')}}</div>
            </template>
        </el-alert>

        <div class="reply-list">
            <div v-for="item in historyList" :key="item.id" class="every-list">
                <div class="top">
                    <span>{{ item.ctime }}</span>
                </div>
                <div class="bottom"><span v-html="item.contents"></span></div>
            </div>
        </div>

    </div>
</template>

<script>
    import {mapState} from "vuex";

    const ubbTextarea = () => import('@/components/textarea/index')
    export default {
        name: "edit-goods-details",
        components: {ubbTextarea},
        data() {
            return {
                id: this.$route.query.id,
                content: '',
                attachList: [],
                idList: [],
                fileList: [],
                historyList: [],
            }
        },
        computed: {
            ...mapState({
                isAdm: state => state.user.userInfo.is_adm,
            })
        },
        created() {
            this.getInfo()
        },
        methods: {
            getInfo() {
                this.$http.get('/WebMyGoods/read', {params: {id: this.id}}).then(res => {
                    if (res) {
                        res.attach.forEach(el => {
                            let obj = {}
                            obj.url = el.url
                            this.fileList.push(obj)
                            this.idList.push(el.id)
                            this.attachList.push({name: '[aid]' + el.id + '[/aid]'})
                        })
                        this.historyList = res.post_history
                        this.content = res.post.contents
                    }
                })
            },

            submitContent() {
                if (!this.content) return this.$message.warning('内容为空')
                const params = {
                    id: this.id,
                    opt: 1,
                    contents: this.content,
                    attach: this.idList.length ? this.idList.toString() : 0
                }
                const url = this.isAdm ? '/AdmGoods/update' : '/WebMyGoods/update'
                this.$http(url, {method: 'post', params}).then(res => {
                    if (res) this.$router.go(-1)
                })
            }
        }
    }
</script>

<style scoped lang="less">
    .edit-goods {
        padding: 20px;
        background: #fff;
    }

    .submit-button {
        margin-top: 10px;
    }

    .reply-list {
        background: #f4f4f4;
        margin-top: 10px;
        max-height: 500px;
        overflow-y: auto;

        .every-list {
            margin-bottom: 6px;
            border: 1px solid #000;
        }

        .top {
            background: #DDDADA;
            padding: 0 6px;
            min-height: 28px;
            line-height: 28px;
        }

        .bottom {
            padding: 4px;
            min-height: 40px;
        }
    }
</style>
