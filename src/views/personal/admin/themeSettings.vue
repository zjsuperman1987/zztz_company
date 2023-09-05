<template>
    <div style="width:100%">

        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <div>
                <el-button icon="el-icon-plus" type="primary" @click="newTheme">新增配置</el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click="getTheme">{{ $t('button.refresh')
                    }}
                </el-button>
            </div>
        </div>

        <el-table size="small" :data="themeData" v-loading="loading">
            <el-table-column label="ID" prop="id" width="50"></el-table-column>
            <el-table-column label="主题名" prop="title"></el-table-column>
            <el-table-column label="创建时间" prop="create_time"></el-table-column>
            <el-table-column label="更新时间" prop="update_time"></el-table-column>
            <el-table-column label="状态">
                <template v-slot="{ row }">
                    <el-tag :type="row.status ? 'success' : 'info'">{{ row.status ? '已启用' : '未启用' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')">
                <template v-slot="{ row }">
                    <el-button size="small" @click="start(row)" type="success" :disabled="!!row.status">启用</el-button>
                    <el-button size="small" @click="edit(row)" type="primary">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-dialog-drag :visible.sync="themeDialog" title="主题配置" custom-class="width700"
                   :close-on-click-modal="false">
            <div style="display: flex;align-items: center;margin-bottom: 6px">
                <span>主题名：</span>
                <el-input size="small" v-model="themeTitle" style="width: 200px"></el-input>
            </div>
            <el-row :gutter="10">
                <el-col :span="8">
                    <el-card header="首页个性化">
                        <ul>
                            <li>
                                <span>整体背景色</span>
                                <div class="color" :style="{ background: theme.bodyBgC }"></div>
                                <el-color-picker v-model="theme.bodyBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>Header背景色</span>
                                <div class="color" :style="{ background: theme.headerBgC }"></div>
                                <el-color-picker v-model="theme.headerBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>Footer背景色</span>
                                <div class="color" :style="{ background: theme.footerBgC }"></div>
                                <el-color-picker v-model="theme.footerBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>广告位背景色</span>
                                <div class="color" :style="{ background: theme.adBgC }"></div>
                                <el-color-picker v-model="theme.adBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>导航条背景色</span>
                                <div class="color" :style="{ background: theme.navBgC }"></div>
                                <el-color-picker v-model="theme.navBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>整体内容背景色</span>
                                <div class="color" :style="{ background: theme.contentBgC }"></div>
                                <el-color-picker v-model="theme.contentBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>分条内容单数背景色</span>
                                <div class="color" :style="{ background: theme.oddBgC }"></div>
                                <el-color-picker v-model="theme.oddBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>分条内容双数背景色</span>
                                <div class="color" :style="{ background: theme.dualBgC }"></div>
                                <el-color-picker v-model="theme.dualBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>最新发布背景色</span>
                                <div class="color" :style="{ background: theme.newBgC }"></div>
                                <el-color-picker v-model="theme.newBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>热门畅销背景色</span>
                                <div class="color" :style="{ background: theme.hotBgC }"></div>
                                <el-color-picker v-model="theme.hotBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>推荐背景色</span>
                                <div class="color" :style="{ background: theme.reBgC }"></div>
                                <el-color-picker v-model="theme.reBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>分类背景色</span>
                                <div class="color" :style="{ background: theme.infoBgC }"></div>
                                <el-color-picker v-model="theme.infoBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                        </ul>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card header="商品详情页个性化">
                        <ul>
                            <li>
                                <span>标题左</span>
                                <div class="color" :style="{ background: theme.titleLeftBgC }"></div>
                                <el-color-picker v-model="theme.titleLeftBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>标题右</span>
                                <div class="color" :style="{ background: theme.titleRightBgC }"></div>
                                <el-color-picker v-model="theme.titleRightBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>表格背景色</span>
                                <div class="color" :style="{ background: theme.tableBgC }"></div>
                                <el-color-picker v-model="theme.tableBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>操作背景色</span>
                                <div class="color" :style="{ background: theme.actionsBgC }"></div>
                                <el-color-picker v-model="theme.actionsBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>标签背景色</span>
                                <div class="color" :style="{ background: theme.tagsBgC }"></div>
                                <el-color-picker v-model="theme.tagsBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>介绍、售后背景色</span>
                                <div class="color" :style="{ background: theme.infoNavBgC }"></div>
                                <el-color-picker v-model="theme.infoNavBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>介绍详情背景色</span>
                                <div class="color" :style="{ background: theme.introBgC }"></div>
                                <el-color-picker v-model="theme.introBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>售后详情背景色</span>
                                <div class="color" :style="{ background: theme.afterSalesBgC }"></div>
                                <el-color-picker v-model="theme.afterSalesBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>售后时间背景色</span>
                                <div class="color" :style="{ background: theme.afterTimeBgC }"></div>
                                <el-color-picker v-model="theme.afterTimeBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>售后内容背景色</span>
                                <div class="color" :style="{ background: theme.afterContentBgC }"></div>
                                <el-color-picker v-model="theme.afterContentBgC" show-alpha
                                                 size="mini"></el-color-picker>
                            </li>
                            <li>
                                <span>Footer背景色</span>
                                <div class="color" :style="{ background: theme.serviceBgC }"></div>
                                <el-color-picker v-model="theme.serviceBgC" show-alpha size="mini"></el-color-picker>
                            </li>
                        </ul>
                    </el-card>
                </el-col>
            </el-row>
            <span slot="footer">
        <el-button size="small" @click="themeDialog = false">取消</el-button>
        <el-button size="small" type="primary" @click="save">保存</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions";

    export default {
        name: "themeSetting",
        data() {
            return {
                themeTitle: '',
                themeID: '',
                theme: {
                    bodyBgC: 'rgba(224,220,176,0.39)',
                    headerBgC: 'rgb(95,93,93)',
                    footerBgC: 'rgb(173,143,131)',
                    adBgC: 'rgb(229,163,125)',
                    navBgC: 'rgb(226,227,170)',
                    contentBgC: 'rgb(179,184,198)',
                    oddBgC: 'rgb(218,201,236)',
                    dualBgC: 'rgb(159,152,165)',
                    newBgC: '#c7e4ea',
                    hotBgC: '#c589c9',
                    reBgC: '#997771',
                    infoBgC: 'rgba(75,121,101,0.57)',

                    titleLeftBgC: 'rgb(238,232,175)',
                    titleRightBgC: 'rgb(193,206,131)',
                    tableBgC: 'rgb(211,227,206)',
                    actionsBgC: 'rgb(177,184,180)',
                    tagsBgC: 'rgb(180,173,164)',
                    infoNavBgC: 'rgb(119,165,177)',
                    introBgC: 'rgb(173,200,222)',
                    afterSalesBgC: 'rgb(236,199,179)',
                    afterTimeBgC: 'rgb(184,179,177)',
                    afterContentBgC: 'rgb(193,125,103)',
                    serviceBgC: 'rgb(234,167,175)',
                },
                themeData: [],
                themeDialog: false,
                loading: false,
            }
        },
        created() {
            this.getTheme()
        },
        methods: {
            getTheme() {
                this.loading = true
                this.$http.get('/AdmSiteTheme').then(res => {
                    if (res) {
                        for (let prop of res.data) {
                            prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                            prop.update_time = myFunctions.parseTime(prop.update_time, '{y}-{m}-{d} {h}:{i}')
                        }
                        this.themeData = res.data
                    }
                    this.loading = false
                })
            },

            newTheme() {
                this.themeID = ''
                this.themeTitle = ''
                this.theme = this.$options.data().theme
                this.themeDialog = true
            },

            save() {
                let params = {
                    id: this.themeID,
                    title: this.themeTitle,
                    theme: JSON.stringify(this.theme)
                }
                let url = this.themeID ? '/AdmSiteTheme/update' : '/AdmSiteTheme/save'
                this.$http(url, {method: 'post', params}).then(res => {
                    if (res) {
                        this.getTheme()
                        this.themeDialog = false
                    }
                })
            },

            edit(row) {
                this.themeID = row.id
                this.themeTitle = row.title
                this.theme = row.theme
                this.themeDialog = true
            },

            start(row) {
                this.$http('/AdmSiteTheme/update', {method: 'post', params : {status: 1, id: row.id}}).then(res => {
                    if (res) this.getTheme()
                })
            },
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-table {
            margin-bottom: 6px;
        }

        .el-card {
            .el-card__header {
                padding: 8px 12px;

                .header {
                    display: flex;
                    justify-content: space-between;
                }
            }

            ul li {
                margin-bottom: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .color {
                    width: 40px;
                    height: 1em;
                }

                .el-color-picker {
                    height: 20px;

                    .el-color-picker__trigger {
                        width: 20px;
                        height: 20px;
                        padding: 0;
                    }
                }
            }
        }
    }
</style>
<style>
    .el-color-dropdown__link-btn {
        display: none;
    }
</style>