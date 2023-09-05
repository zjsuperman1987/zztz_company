<template>
    <div class="container">
        <ubb-textarea v-model="textarea" path="adv" ref="textarea" :idList="idList"  :title="$t('guarantee.chat.areaTitle')"
        :fileList="fileList" placeholder="请输入您遇到的问题" :attachList="attachList" :minRows="minRows">
        </ubb-textarea>
        <div class="btn_box">
            <el-button type="primary" :loading="submitLoading" class="submit-button" @click="submit">提交</el-button>
        </div>
        <div>
            <div class="reply-list">
                <div v-for="item in chatList" :key="item.id" class="every-list">
                    <div class="top">
                        <div class="left">
                            <span>发布者：{{ item.uid }}</span>
                            <span class="pub_time">时间：{{ item.create_time }}</span>
                        </div>
                        <div class="right">
                        </div>
                    </div>
                    <div class="bottom" v-viewer><span v-html="item.contents"></span></div>
                </div>
            </div>
            <page-nation
                    v-show="total>0"
                    :total="total"
                    layout="total, prev, pager, next"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getChatList"
                    :page-size="listQuery.limit"
            />
        </div>
    </div>  
</template>

<script>
import myFunctions from '@/utils/myFunctions'
const ubbTextarea = () => import('@/components/textarea/index.vue')
import {mapState} from "vuex";
export default {
    name: 'chat',
    components: { ubbTextarea },
    data() {
        return {
            idList: [],
            fileList: [],
            attachList: [],
            textarea: '',
            chatList: [], //聊天列表
            total: 0,
            listQuery: {
                limit: 20,
                page: 1
            },
            submitLoading: false,
            receiver: '',
            minRows: 5,
        }
    },
    computed: {
        ...mapState({
            list: (state) => state.order.guarantee_list,
            userID: (state) => state.user.userInfo.id,
            isAdm: state => state.user.userInfo.is_adm,
        }),
    },
    watch: {
        list : {
            handler() {
                this.getChatList()
            },
            deep: true,
        }
    },
    created() {
        EventBus.$on('guarantee_chat', () => {
            this.getChatList()
        })
    },
    methods: {  
        //发送聊天信息
        async submit() {
            console.log(this.list.id)
            if(this.userID !== this.list.uid_a && this.userID !== this.list.uid_b && this.userID !== this.list.observer && this.isAdm !== 1) return this.$message.error('你为加入,暂无权限发言')
            if(this.userID === this.list.uid_a) this.receiver = this.list.uid_b
            if(this.userID === this.list.uid_b) this.receiver = this.list.uid_a
            if(this.userID === this.isAdm) this.receiver = [this.list.uid_a, this.list.uid_b]
            let res = await myFunctions.post('/WebGuarantee/chatSend',{
                id: this.list.id,content: this.textarea,attach: this.idList.length ? this.idList.toString() : 0
            })
            if(res) {
                this.textarea = ''
                this.getChatList()
                myFunctions.noticeOpposite(7,this.receiver)
            }
        },

        //获取聊天信息
        async getChatList() {
            let res = await myFunctions.get('/WebGuarantee/chatList', {
                id: this.list.id,limit: this.listQuery.limit, page: this.listQuery.page
            })
            if(res) {
                this.total = res.total
                for(let prop of res.data) {
                    prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                }
                this.chatList = res.data
            }
        },
    }
}
</script>

<style lang="less" scoped>
    .container{
        width: 100%;
        padding: 10px;

        .btn_box{
            text-align: right;
            margin-top: 5px;
        }

        .reply-list {
        background: #f4f4f4;
        margin-top: 10px;
        max-height: 500px;
        overflow-y: auto;

        .every-list {
            border: 1px solid #000;

            &:not(:last-child) {
                margin-bottom: 6px;
            }
        }

        .top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #DDDADA;
            padding: 0 6px;
            min-height: 28px;
            line-height: 28px;

            .left{
                display: flex;
                flex-direction: row;
                justify-content: space-between;

                .pub_time{
                    margin-left: 20px;
                }
            }
        }

        .bottom {
            padding: 4px;
            min-height: 40px;
        }
        }
    }
</style>