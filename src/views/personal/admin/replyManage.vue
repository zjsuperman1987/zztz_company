<template>
    <div style="width: 100%">
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <div class="filter">
                <el-form inline :model="filterForm" @submit.native.prevent>
                    <el-form-item>
                        <el-input size="mini" @keyup.enter.native="getReplyList"
                                  @input="limitInt" v-model.number="filterForm.uid" placeholder="回复者UID"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="mini" type="primary" @click="getReplyList" icon="el-icon-search">搜索</el-button>
                        <el-button size="mini" @click="reset">重置</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getReplyList">{{
                            $t('button.refresh') }}
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <div v-if="replyList.length">
            <div v-for="item in replyList" :key="item.id" class="every-list">
                <div class="title">
                    <span>时间：{{ item.ctime }}</span>
                    <span>咨询者：
                        <el-button type="text" @click="userClick(item.uid)" :style="{ color: item.uid === item.release_uid ? '#409EFF' : 'red' }">{{ item.uid }}</el-button>
                    </span>
                    <span>商品：<router-link @click.native="inTo(item)" style="color: #409EFF"
                                          to="">{{ item.title }}</router-link></span>
                    <span>卖家：
                        <el-button type="text" @click="userClick(item.release_uid)" :style="{ color: item.uid === item.release_uid ? 'red' : '#409EFF' }">{{ item.release_uid }}</el-button>
                    </span>
                    <span>成交金额：<span :style="{ color: parseFloat(item.translate_amount) ? '#409EFF' : '' }">
            {{ parseFloat(item.translate_amount) ? item.translate_amount : '无交易'}}
          </span>
          </span>
                </div>
                <div v-viewer class="info">
                    <div class="info-content">
                        <div>{{ item.contents }}</div>
                        <img v-if="item.img" :src="site_static + item.img" width="200px" alt="">
                    </div>
                </div>
            </div>
        </div>
        <div v-else v-loading="noContentLoading" style="text-align: center">暂无数据</div>
        <page-nation
                v-show="total>0"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.limit"
                @pagination="getReplyList()"
                :page-size="listQuery.limit"
                :page-sizes="[100, 200, 300]"
        />
        <div v-show="pageYOffset > 500" style="position: fixed;bottom: 70px;right: 36px;">
            <a href="javascript:window.scrollTo({top: 0, left: 0, behavior: 'smooth'})">
                <el-button circle icon="el-icon-caret-top" size="small"></el-button>
            </a>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "replyManage",
        data() {
            return {
                uid: this.$route.query.uid,
                replyList: [],
                total: 0,
                loading: false,
                listQuery: {
                    limit: 100,
                    page: 1
                },
                filterForm: {
                    uid: '',
                },
                pageYOffset: '',
                noContentLoading: false,
            }
        },
        computed: {
            ...mapState({
                site_static: state => state.site.siteSetting.site_static_chars
            })
        },
        created() {
            this.filterForm.uid = this.uid
            this.getReplyList()
        },
        mounted() {
            window.addEventListener('scroll', this.toTop, true)
        },
        methods: {
            getReplyList() {
                this.noContentLoading = true
                let params = this.listQuery
                params.uid = this.filterForm.uid
                this.$http.get('/AdmReply', {params}).then(res => {
                    if (res) {
                        for (let item of res.data) {
                            let imgIndex = item.contents.indexOf('[img]'), _temp = item.contents
                            if (imgIndex !== -1) {
                                if (imgIndex === 0) {
                                    item.contents = ''
                                    item['img'] = _temp.substring(5, _temp.length - 6)
                                } else {
                                    item.contents = _temp.substring(0, imgIndex);
                                    item['img'] = _temp.substring(imgIndex + 5, _temp.length - 6);
                                }
                            }
                        }
                        this.replyList = res.data
                        this.total = res.total
                    }
                    this.noContentLoading = false
                })
            },

            reset() {
                this.filterForm = {}
                this.getReplyList()
            },

            toTop() {
                this.pageYOffset = window.pageYOffset
            },

            limitInt() {
                this.filterForm.uid = String(this.filterForm.uid).replace(/[^\.\d]/g, '').replace('.', '');
            },

            inTo(row) {
                if (row.rid) this.$store.commit('goods/changeTab', 'orderList')
                else this.$store.commit('goods/changeTab', 'goodsInfo')
                this.$router.push({name: 'goods-details', query: {id: row.tid, oId: row.rid}})
            },
            //用户点击事件
            userClick(row) {
                sessionStorage.setItem('userManage',row)
                this.$emit('openByName','userDetails')
            }
        }
    }
</script>

<style scoped lang="less">
    .filter {
        ::v-deep {
            .el-form-item {
                margin-bottom: 0;
            }
        }
    }

    .every-list {
        font-size: 14px;
        padding: 6px;

        &:nth-child(odd) {
            background: #eee;
        }

        &:nth-child(even) {
            background: #ddd;
        }

        &:not(:last-child) {
            margin-bottom: 6px;
        }

        .title {
            padding: 4px;
            background: lightgray;

            span {
                &:not(:last-child) {
                    padding-right: 16px;
                }
            }
        }

        .info {
            background: #d0e0e3;

            &-content {
                padding: 4px;
            }
        }
    }
</style>
