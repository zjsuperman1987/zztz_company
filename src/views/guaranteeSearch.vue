<template>
    <div class="search">
        <div style="background: #E5E3E3;padding: 10px">
            <div id="router-title">
                <span id="title">{{ $t('guaranteeSearch.title') }}</span>
            </div>

            <el-form inline class="filter">
                <el-form-item :label="$t('guarantee.ID')">
                    <el-input @keyup.enter.native="getList" :placeholder="$t('search.desUid')"
                              oninput="value=value.replace(/[^\d]/g,'')"
                              v-model="goodsDetails.uid" style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item :label="$t('guaranteeSearch.number')">
                    <el-input size="mini" @keyup.enter.native="getList" v-model.trim="goodsDetails.number"
                              :placeholder="$t('search.number')"></el-input>
                </el-form-item>
                <el-form-item :label="$t('guaranteeSearch.keyword')">
                    <el-input size="mini" @keyup.enter.native="getList" v-model.trim="goodsDetails.search"
                              :placeholder="$t('search.desKeyword')"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="mini" type="primary" @click="getList" icon="el-icon-search">{{ $t('button.search')}}
                    </el-button>
                </el-form-item>
            </el-form>

            <el-table size="small" :data="sectionList" highlight-current-row border
                      :header-cell-style="{background:'#eef1f6',color:'#606266'}"
                      v-loading="sectionListLoading" @row-click="rowClick">
                <el-table-column label="ID" width="40" align="center">
                    <template v-slot="{$index}">
                        {{ $index + (listQuery.page - 1) * listQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('search.goodsID')" prop="id" width="60" align="center"></el-table-column>
                <el-table-column :label="$t('guaranteeSearch.uid')" prop="uid_a" width="50" align="center"></el-table-column>
                <el-table-column :label="$t('guaranteeSearch.name')" show-overflow-tooltip> 
                    <template v-slot="{row}">
                        <router-link class="title" :to="{ name: 'guaranteeDetail', query: { id: row.id } }">{{ row.title }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('guaranteeSearch.status')" align="center" prop="status" width="50"></el-table-column>
                <el-table-column :label="$t('guaranteeSearch.secrecy')" align="center" prop="secrecy" width="50"></el-table-column>
                <el-table-column :label="$t('table.pubTime')" prop="create_time" width="130" align="center"></el-table-column>
                <el-table-column :label="$t('table.actions')" align="center">
                    <template v-slot="{row}">
                        <div class="btn_join">
                            <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="applyJoin(1)">申请加入
                            </el-button>
                        </div>
                        <el-button size="mini" plain type="primary" @click="infoView">{{ $t('table.view') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="sectionListTotal>0"
                    :total="sectionListTotal"
                    :page.sync="listQuery.page"
                    :limit.sync="listQuery.limit"
                    @pagination="getList"
                    :page-size="listQuery.limit"
            />

            <el-alert title="无" type="info" :closable="false" style="text-align: left;margin-top: 10px">
                <template slot='title'>
                    <div style="font-size: 14px; line-height: 24px; font-weight: 600;">{{ $t('button.tips') }}</div>
                    <div>{{ $t('search.tips1') }}</div>
                    <div>{{ $t('search.tips2') }}</div>
                </template>
            </el-alert>
        </div>

        <el-dialog title="选择分类" :visible.sync="dialogSort" v-dialog-drag
                   custom-class="width600" :close-on-click-modal="false">
            <div class="tags">
                <el-radio-group v-model="ea" size="mini" @change="submitSort">
                    <el-radio v-for="item in options" :key="item.value" :label="item.value" border>{{ item.label }}
                    </el-radio>
                </el-radio-group>
            </div>
            <page-nation
                    :total="sortTotal"
                    layout="prev, pager, next, jumper"
                    :page.sync="sortListQuery.page"
                    :limit.sync="sortListQuery.limit"
                    @pagination="getSortTags"
                    :page-size="sortListQuery.limit"
            />
        </el-dialog>
    </div>
</template>

<script>
import myFunctions from '@/utils/myFunctions'
import { parseTime } from '@/utils'
import { mapState } from 'vuex'
    export default {
        name: "guaranteeSearch",
        data() {
            return {
                // 搜索选择
                goodsDetails: {
                    search: this.$route.params.search || '',
                    uid: '',
                    number: ''
                },
                id: '',
                sectionList: [],
                sectionListTotal: 0,
                active: this.$route.query.sort || '0',
                orderBy: 'DESC',
                listQuery: {
                    limit: 20,
                    page: 1
                },
                sortListQuery: {
                    limit: 35,
                    page: 1
                },
                options: [],
                sortTotal: 0,
                dialogSort: false,
                ea: '',
                rules: {},
                sectionListLoading: false,
                uid_a: '',  //担保发起人
                uid_b: '',  //担保参与人
                secrecy: '',//是否公开
            }
        },
        created() {
            this.getList()
        },
        computed: {
            ...mapState({
                userID: state => state.user.userInfo.id,   // 用户的id
                isAdm: state => state.user.userInfo.is_adm,
            })
        },
        methods: {
            //获取担保列表
            getList() {
                this.sectionListLoading = true
                let params = {
                    limit:this.listQuery.limit,
                    page:this.listQuery.page,
                    title:this.goodsDetails.search,
                    uid:this.goodsDetails.uid,
                    number: this.goodsDetails.number
                }
                this.$http.get('/WebHome/getGuarantee', {params}).then(res => {
                    if (res) {
                        for(let prop of res.data){
                            if(prop.status === 2) prop.status = '有争议'
                            else prop.status = '正常'
                            prop.create_time = parseTime(prop.create_time)
                            prop.update_time = parseTime(prop.update_time)
                            prop.security_deposit = parseFloat(prop.security_deposit)
                            if(prop.secrecy === 1) prop.secrecy = '公开' 
                            else prop.secrecy = '私密' 
                        }
                        this.sectionList = res.data
                        this.sectionListTotal = res.total
                    }
                    this.sectionListLoading = false
                })
            },

            changeSort(val) {
                this.goodsDetails.sort = val
                this.active = val.toString()
                this.getList()
            },
            //申请加入担保
            applyJoin(val) {
                setTimeout(async() => {
                    if(this.userID === this.uid_a || this.userID === this.uid_b || this.userID === this.observer) return this.$message.warning('您已经加入了, 不用重复加入!!')
                    let res =await myFunctions.post('/WebGuarantee/applyJoin', {id: this.id})
                    if(res) {
                        this.$message.success('申请成功,请等待通过')
                        myFunctions.noticeOpposite(9,this.receiver)
                    }
                },300)
            },

            //列表行点击事件
            rowClick(val) {
                this.uid_a = val.uid_a
                this.uid_b = val.uid_b
                this.observer = val.observer
                this.id = val.id
                this.secrecy = val.secrecy
            },

            // 获取分类标签
            getSortTags() {
                return new Promise((resolve) => {
                    let params = this.sortListQuery
                    params.level = 1
                    this.$http.get('/WebCategory/all', {params}).then(res => {
                        if (res) {
                            this.options = res.data
                            this.total = res.total
                            this.dialogSort = true
                            resolve()
                        }
                    })
                })
            },

            // 提交分类
            submitSort(val) {
                for (let item of this.options) {
                    if (val === item.value) {
                        this.goodsDetails.sortName = item.label
                        this.goodsDetails.selectValue = val
                        this.dialogSort = false
                        this.getList()
                    }
                }

            },

            //访问详情
            infoView() {
                setTimeout(() => {
                    if(this.secrecy === '私密' && this.userID !== this.uid_a && this.userID !== this.uid_b && this.userID !== this.observer) return this.$message.warning('发起人设置为私密, 您暂无权限访问!!')
                    this.$router.push({ name: 'guaranteeDetail', query: { id: this.id } })
                },300)
            }
        },
    }
</script>

<style scoped lang="less">
    @import "~@/styles/common.less";

    ::v-deep {
        .el-form-item {
            margin-bottom: 0;
        }
    }
    .btn_join{
        display: inline-block;
        width: 100px;
        text-align: center;
    }

    .search {
        max-width: @maxWidth;
        min-width: @minWidth;
        margin: auto;
        padding: 20px;
        background: #f9f9f9;
        height: 100%;

        .filter {
            display: flex;
            align-items: center;
            margin-bottom: 6px;

            li {
                &:not(:last-child) {
                    margin-right: 10px;
                }

                .range {
                    display: flex;
                    align-items: center;
                }
            }
        }
    }

    .tags {
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
</style>
