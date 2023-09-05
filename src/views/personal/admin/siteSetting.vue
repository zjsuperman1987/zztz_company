<template>
    <div style="width: 100%">

        <div id="router-title">
            <span id="title">
                <span class="head_title">{{ $route.meta.title }} :</span>
                <el-button size="mini" :type="tabindex!=1?'primary':''" @click="getSiteSetting(1)">基本参数</el-button>
                <el-button size="mini" :type="tabindex!=2?'primary':''" @click="getSiteSetting(2)">商品参数</el-button>
                <el-button size="mini" :type="tabindex!=3?'primary':''" @click="getSiteSetting(3)">法币与担保</el-button>
            </span>
            <span>
                <el-button size="mini" type="primary" @click="clear(0)">清除站点和首页缓存</el-button>
                <el-button size="mini" type="primary" @click="clear(1)">清除全部缓存</el-button>
                <el-button size="mini" type="primary" icon="el-icon-refresh"
                   @click="getSiteSetting">{{ $t('button.refresh') }}</el-button>
            </span>
        </div>

        <el-table :data="siteForm" size="small" border v-loading="noContentLoading"
                  highlight-current-row :header-cell-style="{background:'#eef1f6',color:'#606266'}">
            <el-table-column label="参数名称" prop="title" width="300"></el-table-column>
            <el-table-column label="参数值">
                <template v-slot="{row}">
                    <template v-if="row.name === 'release_power'">
                        <el-switch v-model="row.chars" @change="changeSwitch($event,row)"
                                   active-color="#13ce66" inactive-color="#ff4949"
                                   active-text="是" inactive-text="否"
                                   active-value="1" inactive-value="0">
                        </el-switch>
                    </template>
                    <template v-else-if="row.name === 'reply_power'">
                        <el-switch v-model="row.chars" @change="changeSwitch($event,row)"
                                   active-color="#13ce66" inactive-color="#ff4949"
                                   active-text="是" inactive-text="否"
                                   active-value="1" inactive-value="0">
                        </el-switch>
                    </template>
                    <template v-else-if="row.name === 'adv_review'">
                        <el-switch v-model="row.chars" @change="changeSwitch($event,row)"
                                   active-color="#13ce66" inactive-color="#ff4949"
                                   active-text="是" inactive-text="否"
                                   active-value="1" inactive-value="0">
                        </el-switch>
                    </template>
                    <template v-else-if="row.name === 'service_bot'">
                        <span>{{ row.chars }}</span>
                    </template>
                    <template v-else-if="row.name === 'service_bot_token'">
                        <div style="display: flex;align-items: center">
                            <el-input :class="row.edit ? 'back' : ''" v-model="row.chars" size="small"
                                      :readonly="row.edit"></el-input>
                            <!--              0待运行1启动中2运行中3已暂停-->
                            <el-tag v-if="row.ints === 0">待运行</el-tag>
                            <el-tag v-if="row.ints === 1">启动中</el-tag>
                            <el-tag v-if="row.ints === 2" type="success">运行中</el-tag>
                            <el-tag v-if="row.ints === 3" type="info">已暂停</el-tag>
                        </div>
                    </template>
                    <template v-else>
                        <el-input :class="row.edit ? 'back' : ''" v-model="row.chars" size="small"
                                  :readonly="row.edit"></el-input>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
                <template slot-scope="scope">
                    <template  v-if="scope.row.name !== 'release_power' && scope.row.name !== 'reply_power' && scope.row.name !== 'adv_review' 
                                && scope.row.name !== 'service_bot'">
                        <el-button size="mini" :type="scope.row.edit ? 'primary' : 'success'"
                                   @click="scope.row.edit ? editRow(scope.row) : save(scope.row)">{{ scope.row.edit ? '修改' : '保存' }}
                        </el-button>
                        <el-button size="mini" type="primary" @click="cancel(scope.row)" v-if="!scope.row.edit">取消</el-button>
                        <el-button size="mini" type="primary" @click="botToken(scope.row)"
                                   v-if="scope.row.name === 'service_bot_token' && scope.row.ints === 3" :loading="botLoading">启动
                        </el-button>
                        <el-button size="mini" type="warning" @click="botToken(scope.row)"
                                   v-if="scope.row.name === 'service_bot_token' && scope.row.ints !== 3" :loading="botLoading">停止
                        </el-button>

                        <el-button size="mini" type="primary" @click="moveUp(scope.$index, scope.row)">上移
                        </el-button>
                        <el-button size="mini" type="primary" @click="moveDown(scope.$index, scope.row)">下移
                        </el-button>

                    </template>
                </template>
            </el-table-column>
        </el-table>

    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions";
import { param } from '@/utils';

    export default {
        name: "siteSetting",
        data() {
            return {
                siteForm: [],
                tempValue: '',
                noContentLoading: false,
                botLoading: false,
                tabindex:'',
            }
        },
        created() {
            this.getSiteSetting(1)
        },
        methods: {
            getSiteSetting(val) {
                this.tabindex=val
                this.noContentLoading = true
                this.$http.get('/AdmSite/all',{params: {type: val}}).then(res => {
                    if (res) {
                        for (let item of res) {
                            item.edit = true
                            if (item.title == '上次结算时间') item.chars = myFunctions.parseTime(item.chars, '{y}-{m}-{d} {h}:{i}')
                        }
                        this.siteForm = res
                    }
                    this.noContentLoading = false
                })
            },

            clear(opt) {
                this.$http('/AdmSite/clear', {method: 'post', params: {opt}}).then(res => {
                    if (res) {
                        this.$message.success('操作成功');
                        this.$router.go(0);
                    }
                })
            },

            changeSwitch($event, item) {
                console.log(item)
                let tp = Object.assign('', item.chars)
                let value = $event === '1' ? '1' : '0'
                let params = {id: item.id, value, sort: item.sort}
                this.$http('/AdmSite/update', {method: 'post', params}).then(res => {
                    if (res) this.$message.success('保存成功')
                    else item.chars = tp
                })
            },

            botToken() {
                this.botLoading = true
                this.$http('/AdmSite/pauseOrStart', {method: 'post'}).then(res => {
                    if (res) {
                        this.$message.success('操作成功')
                        this.getSiteSetting()
                    }
                    this.botLoading = false
                })
            },

            editRow(item) {
                for (let i of this.siteForm) if (!i.edit) return this.$message.warning('存在未保存的编辑项')
                this.tempValue = item.chars
                item.edit = false
            },

            save(item) {
                let params = {id: item.id, value: item.chars,sort: item.sort}
                this.$http('/AdmSite/update', {method: 'post', params}).then(res => {
                    if (res) {
                        this.$message.success('保存成功')
                        item.edit = true
                    }
                })
            },

            cancel(item) {
                item.chars = this.tempValue
                item.edit = true
            },

            //上移一行
            async moveUp(index,item) {
                console.log(item.id)
                if (index <= 0) {
                this.$message.error('不能继续向上移动')
                } else {
                    const upData = this.siteForm[index - 1]
                    this.siteForm.splice(index - 1, 1)
                    this.siteForm.splice(index, 0, upData)
                }
                let params = {
                    id: item.id,
                    type: item.type,
                    value: item.chars,
                    sort: item.sort,
                    mode:0
                }
                await myFunctions.post('/AdmSite/changeSort', params )
            },
            //下移一行
            async moveDown(index, item) {
                let params = {
                    id: item.id,
                    type: item.type,
                    value: item.chars,
                    sort: item.sort,
                    mode: 1
                }
                if (index === (this.siteForm.length - 1)) {
                    this.$message.error('不能继续向下移动')
                } else {
                    const downData = this.siteForm[index + 1]
                    this.siteForm.splice(index + 1, 1)
                    this.siteForm.splice(index, 0, downData)
                }
                await myFunctions.post('/AdmSite/changeSort', params)
            }
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-table {
            .back {
                .el-input__inner {
                    background: #f5f7fa;
                }
            }
        }

        .el-input__inner {
            color: #606266 !important;
        }
    }

    .bind {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
    }
    .head_title{
        margin-right: 15px;
    }
</style>
