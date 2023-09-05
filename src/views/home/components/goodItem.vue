<template>
    <el-row :gutter="10" class="row">
        <el-col>
            <div class="card">
                <!-- 商品种类名称 -->
                <div class="header" :style="{ background: bkColor(index * 1)}">
                    <h3 class="title">{{ title }}</h3>
                    <router-link :to="{ name: search,query: { sort : list.sort } }">
                        {{ $t('home.showMoreGoods') }}
                    </router-link>
                </div>
                <!-- 商品的id 和 名称 -->
                <div class="ul-title" v-if="list.children || list.total ">
                    <div class="ul-title-line" v-for="(it,i) in list.children || list.data" :key="it.tid"
                         :style="{ background: (i+1)%2===1 ? theme.oddBgC : theme.dualBgC }">
                        <el-row>
                            <el-col :span="2" class="left">
                                <span>{{ i+1 }}.</span>
                            </el-col>
                            <el-col :span="22" class="right">
                                <span class="title" @click="linkClick(it)">{{it.title }}</span>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div class="ul-title" v-else>
                    <div style="text-align: center;opacity: .5;font-size: 14px">{{ $t( 'home.noMoreGoods') }}</div>
                </div>
            </div>
        </el-col>
    </el-row>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "goodItem",
        props: {
            list: Object,
            title: String,
            index: String,
            currency: Array,
            path: String,
            search: String,
           
        },
        data(){
            return {
                userID: '', //用户ID
            }
        },
        computed: {
            ...mapState({
                theme: state => state.settings.theme,
            })
        },
        created() {
            this.userID = localStorage.getItem('uid')
        },
        methods: {
            // 背景颜色函数
            bkColor(i) {
                switch (i) {
                    case 0:
                        return this.theme.newBgC || 'rgb(249,205,173)'
                    case 1:
                        return this.theme.hotBgC || 'rgb(200,200,169)'
                    case 2:
                        return this.theme.reBgC || 'rgb(131,175,155)'
                }
            },

            //点击商品事件
            linkClick(it) {
                if(!this.userID) this.$router.push('login')
                if(this.userID) this.$router.push( {path: this.path, query: {id: (it.tid ? it.tid : it.id),type: 'info'}})
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common.less";
    .row{
        display: inline-block;
        width: 395px;
    }
    .card {
        border-radius: 0;
        border: 1px solid #888;
        box-shadow: 2px 2px 2px -1px black;
        height: 100%;
        background: #fff;

        .header {
            padding: 5px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            a {
                color: @blue;
            }

            .title {
                color: #000;
                font-weight: 600;

            }
        }

        .ul-title {
            border: 1px solid #bbb;
            padding: 0;
            margin: 5px;
            height: calc(100% - 36px);

            &-line {
                .el-row {
                    display: flex;
                    flex-wrap: wrap;

                    .left {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-right: 1px solid;
                    }

                    .right {
                        padding: 4px 0 4px 10px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                &:nth-child(odd) {
                    background: rgba(178, 200, 187, .7);
                }
            }

            .title {
                line-height: 0;
                cursor: pointer;

                &:hover {
                    color: @aHover;
                }
            }
        }
    }
</style>