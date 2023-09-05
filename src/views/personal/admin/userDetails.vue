<template>
    <div>
        <div id="router-title">
            <span id="title">{{ $route.meta.title }}</span>
            <span>
        <el-button size="mini" type="primary" icon="el-icon-back"
                   @click="$router.push({ name: 'userManage' })">返回</el-button>
        <el-button size="mini" type="primary" @click="transform('transform', 'minus')">扣费</el-button>
        <el-button size="mini" type="primary" @click="transform('transform', 'add')">充值</el-button>
        <el-button size="mini" type="primary" icon="el-icon-refresh" @click="refreshAll">刷新</el-button>
      </span>
        </div>

        <!--    基本信息-->
        <el-card shadow="none">
            <p>基本信息</p>
            <el-row class="row">
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">用户编号</div>
                        <div class="right">{{ userInfo.id }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">BTC余额</div>
                        <div class="right">{{ balanceBTC }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">BTC冻结</div>
                        <div class="right">{{ frozenBTC }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">USDT余额</div>
                        <div class="right">{{ balanceUSDT }}</div>
                    </div>
                </el-col>
                <el-col :lg="4" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">USDT冻结</div>
                        <div class="right">{{ frozenUSDT }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">注册日期</div>
                        <div class="right">{{ userInfo.cretime }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">注册IP</div>
                        <div class="right">{{ userInfo.reg_ip }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">登录IP</div>
                        <div class="right">{{ userInfo.last_ip }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">用户身份</div>
                        <div class="right">{{ userInfo.is_adm ? '特殊用户' : '普通用户' }}</div>
                    </div>
                </el-col>
                <el-col :lg="4" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">用户组</div>
                        <div class="right">{{ userInfo.group_name ? userInfo.group_name : '普通组' }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">最后在线</div>
                        <div class="right">{{ userInfo.lastonline }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">发布权限</div>
                        <div class="right">{{ userInfo.trade_end_time ? userInfo.trade_end_time : '无' }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">回复权限</div>
                        <div class="right">{{ userInfo.post_end_time ? userInfo.post_end_time : '无' }}</div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">信息屏蔽</div>
                        <div class="right">
                            <el-button type="text" :style="{ color: userInfo.block_message ? 'red' : '' }"
                                       @click="handleClick(userInfo,0, userInfo.block_message, 'block_message')">
                                {{ userInfo.block_message ? '已屏蔽 | 更改' : '未屏蔽 | 更改' }}
                            </el-button>
                        </div>
                    </div>
                </el-col>
                <el-col :lg="4" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">公开冻结</div>
                        <div class="right">
                            <el-button size="mini" type="text" :style="{ color: userInfo.access_freeze ? 'red' : '' }"
                                       @click="handleClick(userInfo,0, userInfo.access_freeze, 'access_freeze')">
                                {{ userInfo.access_freeze ? '已冻结 | 更改' : '未冻结 | 更改' }}
                            </el-button>
                        </div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">内部冻结</div>
                        <div class="right">
                            <el-button size="mini" type="text" :style="{ color: userInfo.hidden_freeze ? 'red' : '' }"
                                       @click="handleClick(userInfo,0, userInfo.hidden_freeze, 'hidden_freeze')">
                                {{ userInfo.hidden_freeze ? '已冻结 | 更改' : '未冻结 | 更改' }}
                            </el-button>
                        </div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">资金冻结</div>
                        <div class="right">
                            <el-button size="mini" type="text" :style="{ color: userInfo.finance_freeze ? 'red' : '' }"
                                       @click="handleClick(userInfo,0, userInfo.finance_freeze, 'finance_freeze')">
                                {{ userInfo.finance_freeze ? '已冻结 | 更改' : '未冻结 | 更改' }}
                            </el-button>
                        </div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">提币冻结</div>
                        <div class="right">
                            <el-button size="mini" type="text"
                                       :style="{ color: userInfo.disable_withdrawal ? 'red' : '' }"
                                       @click="handleClick(userInfo,0, userInfo.disable_withdrawal, 'disable_withdrawal')">
                                {{ userInfo.disable_withdrawal ? '已冻结 | 更改' : '未冻结 | 更改' }}
                            </el-button>
                        </div>
                    </div>
                </el-col>
                <el-col :lg="5" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">其他</div>
                        <div class="right">
                            <el-button type="text"
                                       @click="$router.push({ name: 'replyManage', query: { uid: userInfo.id } })">
                                查看所有回复
                            </el-button>
                        </div>
                    </div>
                </el-col>
                <el-col :lg="4" :md="6" :sm="8" :xs="8" class="col">
                    <div class="eve">
                        <div class="left">
                            <span class="button-login" @click="resetPassword('login')">重置登录</span>
                        </div>
                        <div class="right">
                            <span class="button-deal" @click="resetPassword('deal')">重置交易</span>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!--    比特币地址列表-->
        <el-card shadow="none">
            <el-button @click="getBTCAddress">比特币地址列表</el-button>
            <el-button @click="getUSDTAddress">泰达币地址列表</el-button>
            <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="BTCAddressList" v-loading="BTCAddressLoading" size="small">
                <el-table-column label="ID" width="60">
                    <template v-slot="{$index,row}">
                        {{ $index + (BTCAddressQuery.page - 1) * BTCAddressQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="地址" prop="address"></el-table-column>
                <el-table-column label="总计充值" prop="received" width="150" align="center"></el-table-column>
                <el-table-column label="刷新时间" prop="usetime" width="150"></el-table-column>
            </el-table>
            <page-nation
                    v-show="BTCAddressTotal>0"
                    :total="BTCAddressTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="BTCAddressQuery.page"
                    :limit.sync="BTCAddressQuery.limit"
                    @pagination="getFinanceList()"
                    :page-size="BTCAddressQuery.limit"
                    :page-sizes="[10, 30, 60]"
            />
        </el-card>

        <!--    充值记录列表-->
        <el-card shadow="none">
            <el-button @click="getBTCRecord">比特币充值记录</el-button>
            <el-button @click="getUSDTRecord">泰达币充值记录</el-button>
            <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="rechargeList" v-loading="rechargeLoading" size="small">
                <el-table-column label="ID" prop="id" width="40"></el-table-column>
                <el-table-column label="地址" prop="addr"></el-table-column>
                <el-table-column label="确认数" prop="ensure" width="80"></el-table-column>
                <el-table-column label="金额" prop="amount" width="80"></el-table-column>
                <el-table-column label="状态" width="80">
                    <template v-slot="{row}">
                        <el-tag>{{ row.status ? '已入账' : '未入账' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="create_time" width="120"></el-table-column>
                <el-table-column label="刷新时间" prop="update_time" width="120"></el-table-column>
            </el-table>
            <page-nation
                    v-show="rechargeTotal>0"
                    :total="rechargeTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="rechargeQuery.page"
                    :limit.sync="rechargeQuery.limit"
                    @pagination="getRechargeList()"
                    :page-size="rechargeQuery.limit"
                    :page-sizes="[10, 30, 60]"
            />
        </el-card>

        <!--    财务信息-->
        <el-card shadow="none">
            <el-button @click="getBTCFinance">比特币财务信息</el-button>
            <el-button @click="getUSDTFinance">泰达币财务信息</el-button>
            <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="financeList" v-loading="financeLoading" size="small">
                <el-table-column label="ID" width="40">
                    <template v-slot="{$index,row}">
                        {{ $index + (financeQuery.page - 1) * financeQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="时间" prop="create_time" width="120"></el-table-column>
                <el-table-column label="金额" prop="amount" width="120"></el-table-column>
                <el-table-column label="账户资金前" prop="befor_balance" width="120"></el-table-column>
                <el-table-column label="账户资金后" prop="after_balance" width="120"></el-table-column>
                <el-table-column label="结算资金前" prop="befor_freeze" width="120"></el-table-column>
                <el-table-column label="结算资金后" prop="after_freeze" width="120"></el-table-column>
                <el-table-column label="备注" prop="rmk" show-overflow-tooltip></el-table-column>
            </el-table>
            <page-nation
                    v-show="financeTotal>0"
                    :total="financeTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="financeQuery.page"
                    :limit.sync="financeQuery.limit"
                    @pagination="getFinanceList()"
                    :page-size="financeQuery.limit"
                    :page-sizes="[10, 30, 60]"
            />
        </el-card>

        <!--    买单列表-->
        <el-card shadow="none">
            <p>买单列表</p>
            <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="orderList" v-loading="orderLoading" size="small">
                <el-table-column label="ID" width="40">
                    <template v-slot="{$index,row}">
                        {{ $index + (orderQuery.page - 1) * orderQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="类别" prop="goods.ea_title" width="100" show-overflow-tooltip></el-table-column>
                <el-table-column label="商品名" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link
                                :to="{ name: 'goods-details', query: { id: row.tid, partner: row.buyer, oId: row.id } }">
                            {{ row.goods.title }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column label="数量" prop="volume" align="center" width="100"></el-table-column>
                <el-table-column label="币种" prop="currency_id" align="center" width="150"></el-table-column>
                <el-table-column label="金额" prop="amount" align="center" width="150"></el-table-column>
                <el-table-column label="保护期" prop="protect_time" align="center" width="120"></el-table-column>
                <el-table-column label="状态" align="center" width="100">
                    <template v-slot="{row}">
                        <el-tag effect="dark" size="mini" v-if="row.status === 0">正常</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 1">已撤销</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 2">已完成</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 3" type="danger">挂起</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 4" type="danger">申诉</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 5">已结算</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="时间" prop="cretime" width="110"></el-table-column>
                <el-table-column label="操作" prop="cretime" width="110">
                    <template slot-scope="{ row }">
                        <el-button type="text" @click="$router.push({ name: 'goods-details', query: { id: row.tid, oId: row.id } })">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="orderTotal>0"
                    :total="orderTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="orderQuery.page"
                    :limit.sync="orderQuery.limit"
                    @pagination="getOrderList()"
                    :page-size="orderQuery.limit"
                    :page-sizes="[10, 30, 60]"
            />
        </el-card>

        <!--    卖单列表-->
        <el-card shadow="none">
            <p>卖单列表</p>
            <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="sellOrderList" v-loading="sellOrderLoading" size="small">
                <el-table-column label="ID" width="30">
                    <template v-slot="{$index,row}">
                        {{ $index + (sellOrderQuery.page - 1) * sellOrderQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="类别" prop="goods.ea_title" width="100" show-overflow-tooltip></el-table-column>
                <el-table-column label="商品名" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link
                                :to="{ name: 'goods-details', query: { id: row.tid, partner: row.buyer, oId: row.id } }">
                            {{ row.goods.title }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column label="数量" prop="volume" align="center" width="100"></el-table-column>
                <el-table-column label="币种" prop="currency_id" align="center" width="100"></el-table-column>
                <el-table-column label="金额" prop="amount" align="center" width="150"></el-table-column>
                <el-table-column label="保护期" prop="protect_time" align="center" width="120"></el-table-column>
                <el-table-column label="状态" align="center" width="100">
                    <template v-slot="{row}">
                        <el-tag effect="dark" size="mini" v-if="row.status === 0">正常</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 1">已撤销</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 2">已完成</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 3" type="danger">挂起</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 4" type="danger">申诉</el-tag>
                        <el-tag effect="dark" size="mini" v-if="row.status === 5">已结算</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="时间" prop="cretime" width="110"></el-table-column>
                <el-table-column label="操作" prop="cretime" width="110">
                    <template slot-scope="{ row }">
                        <el-button type="text" @click="$router.push({ name: 'goods-details', query: { id: row.tid, oId: row.id } })">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <page-nation
                    v-show="sellOrderTotal>0"
                    :total="sellOrderTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="sellOrderQuery.page"
                    :limit.sync="sellOrderQuery.limit"
                    @pagination="getSellOrderList()"
                    :page-size="sellOrderQuery.limit"
                    :page-sizes="[10, 30, 60]"
            />
        </el-card>

        <!--    商品列表-->
        <el-card shadow="none">
            <p>商品列表</p>
            <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="goodsList" v-loading="goodsLoading" size="small">
                <el-table-column label="ID" width="30">
                    <template v-slot="{$index,row}">
                        {{ $index + (goodsQuery.page - 1) * goodsQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="类别" prop="ea_title" width="150"></el-table-column>
                <el-table-column label="商品名" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link :to="{ name: 'goods-details',query: { id: row.tid } }">{{ row.title }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column label="单价" prop="usdprice" width="100"></el-table-column>
                <el-table-column label="销售量" prop="sells_volume" width="100"></el-table-column>
                <el-table-column label="销售金额" prop="sells_amount" width="100" align="center"></el-table-column>
                <el-table-column label="状态" width="70" align="center">
                    <template v-slot="{row}">
                        <el-tag size="small" type="success" v-if="row.down === 0">在售</el-tag>
                        <el-tag size="small" type="danger" v-if="row.down === 1">停售</el-tag>
                        <el-tag size="small" type="info" v-if="row.down === 2">下线</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="时间" prop="cretime" align="center" width="150"></el-table-column>
            </el-table>
            <page-nation
                    v-show="goodsTotal>0"
                    :total="goodsTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="goodsQuery.page"
                    :limit.sync="goodsQuery.limit"
                    @pagination="getGoodsList()"
                    :page-size="goodsQuery.limit"
                    :page-sizes="[10, 30, 60]"
            />
        </el-card>

        <!--    广告列表-->
        <el-card shadow="none">
            <p>广告列表</p>
            <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}" border
                      highlight-current-row :data="adList" v-loading="adLoading" size="small">
                <el-table-column label="ID" width="30">
                    <template v-slot="{$index,row}">
                        {{ $index + (adQuery.page - 1) * adQuery.limit + 1 }}
                    </template>
                </el-table-column>
                <el-table-column label="标题" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <router-link :to="{ name: 'ad-details', query: { id: row.tid, type: 'ad' } }">{{ row.title }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column label="类型" align="center" width="120">
                    <template v-slot="{row}">
                        <template v-if="row.adv !== null">
                            <el-tag size="mini" effect="dark" v-if="row.adv.type === 0">首页广告</el-tag>
                            <el-tag size="mini" effect="dark" v-if="row.adv.type === 1">置顶横幅广告</el-tag>
                            <el-tag size="mini" effect="dark" v-if="row.adv.type === 2">两者</el-tag>
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="状态" align="center" width="100">
                    <template v-slot="{row}">
                        <template v-if="row.adv !== null">
                            <el-tag size="mini" effect="dark" v-if="row.adv.status === 0">正常</el-tag>
                            <el-tag size="mini" effect="dark" v-if="row.adv.status === 1" type="success">停展</el-tag>
                            <el-tag size="mini" effect="dark" v-if="row.adv.status === 2" type="info">关闭</el-tag>
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="购买时间" prop="adv.start" align="center" width="150"></el-table-column>
                <el-table-column label="到期时间" prop="adv.end" align="center" width="150"></el-table-column>
            </el-table>
            <page-nation
                    v-show="adTotal>0"
                    :total="adTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page.sync="adQuery.page"
                    :limit.sync="adQuery.limit"
                    @pagination="getAdList()"
                    :page-size="adQuery.limit"
                    :page-sizes="[10, 30, 60]"
            />
        </el-card>

        <!-- 扣费和增加资产弹框 -->
        <el-dialog :title="transformType==='add' ? '增加资产' : '减少资产'" v-dialogDrag
                   :visible.sync="dialogTransform" custom-class="width350" :close-on-click-modal="false">
            <el-form size="small" :model="transformForm" ref="transform"
                     label-width="60px" :rules="rules" :show-message="false">
                <template>
                    <div class="currency_select">
                        <el-radio v-model="radio" label="1" border size="mini">BTC</el-radio>
                        <el-radio v-model="radio" label="2" border size="mini">USDT</el-radio>
                    </div>
                </template>
                <el-form-item label="理由:" prop="rmk">
                    <el-input size="small" v-model="transformForm.rmk"></el-input>
                </el-form-item>
                <el-form-item label="金额:" prop="amount">
                    <el-input size="small" @input="limitPrice" v-model="transformForm.amount"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
        <el-button size="small" type="primary" @click="submitTransform('transform')">确定</el-button>
      </span>
        </el-dialog>

    </div>
</template>

<script>
    import myFunctions from "@/utils/myFunctions";
    import {parseTime} from "@/utils";

    export default {
        name: "userDetails",
        data() {
            return {
                uid: this.$route.query.id,
                id: 0,
                userInfo: {},
                balanceUSDT: 0, // usdt账户余额
                frozenUSDT: 0,  // usdt冻结金额
                balanceBTC: 0,  // btc 余额
                frozenBTC: 0,   // btc冻结金额
                currency_id: 1,
                radio: '1', // 币种选择
                dialogTransform: false,
                transformTitle: '',
                transformForm: {
                    rmk: '',
                    amount: ''
                },
                transformType: '',


                // 比特币地址列表
                BTCAddressList: [],
                BTCAddressTotal: 0,
                BTCAddressLoading: false,
                BTCAddressQuery: {
                    limit: 10,
                    page: 1
                },
                // 充值记录列表
                rechargeList: [],
                rechargeTotal: 0,
                rechargeLoading: false,
                rechargeQuery: {
                    limit: 10,
                    page: 1
                },
                // 买单信息
                orderList: [],
                orderTotal: 0,
                orderLoading: false,
                orderQuery: {
                    limit: 10,
                    page: 1
                },
                // 卖单信息
                sellOrderList: [],
                sellOrderTotal: 0,
                sellOrderLoading: false,
                sellOrderQuery: {
                    limit: 10,
                    page: 1
                },
                // 商品信息
                goodsList: [],
                goodsTotal: 0,
                goodsLoading: false,
                goodsQuery: {
                    limit: 10,
                    page: 1
                },
                // 广告信息
                adList: [],
                adTotal: 0,
                adLoading: false,
                adQuery: {
                    limit: 10,
                    page: 1
                },
                // 财务信息
                financeList: [],
                financeTotal: 0,
                financeLoading: false,
                financeQuery: {
                    limit: 10,
                    page: 1
                },

                rules: {
                    msg_id: [
                        {required: true, message: '请选择操作理由', trigger: ['blur', 'change']},
                    ],
                    rmk: [
                        {required: true, message: '请填写备注信息', trigger: 'blur'},
                    ],
                    amount: [
                        {required: true, message: '请填写金额', trigger: 'blur'},
                    ]
                },
            }
        },
        created() {
            this.id=sessionStorage.getItem('userManage')
            this.getUserInfo()
            this.getBtcAddressList()
            this.getRechargeList()
            this.getOrderList()
            this.getSellOrderList()
            this.getGoodsList()
            this.getAdList()
            this.getFinanceList()
            this.getUserMoney()
        },
        methods: {
            refreshAll() {
                this.getUserInfo()
                this.getBtcAddressList()
                this.getRechargeList()
                this.getOrderList()
                this.getSellOrderList()
                this.getGoodsList()
                this.getAdList()
                this.getFinanceList()
                this.getUserMoney()
            },
            // 获取个人信息
            getUserInfo() {
                this.$http.get('/AdmMember/read', {params: {id: this.uid ? this.uid : this.id}}).then(res => {
                    if (res) this.userInfo = res;
                }).catch(() => {
                    this.$message.warning('获取用户信息失败')
                })
            },

            // 比特币地址列表
            getBtcAddressList() {
                this.BTCAddressLoading = true
                const params = {
                    page: this.BTCAddressQuery.page,
                    limit: this.BTCAddressQuery.limit,
                    user_id: this.uid ? this.uid : this.id ,
                    currency_id: this.currency_id
                }
                this.$http.get('AdmMember/addrList', {params}).then(res => {
                    if (res) {
                        for (let prop of res.data) {
                            prop.received = parseFloat(prop.received + '')
                            prop.usetime = parseTime(prop.usetime, '{y}-{m}-{d} {h}:{i}')
                        }
                        this.BTCAddressList = res.data
                        this.BTCAddressTotal = res.total
                    }
                    this.BTCAddressLoading = false
                })
            },

            // 充值记录列表
            getRechargeList() {
                this.rechargeLoading = true
                const params = {
                    page: this.rechargeQuery.page,
                    limit: this.rechargeQuery.limit,
                    user_id: this.uid ? this.uid : this.id ,
                    currency_id: this.currency_id
                }
                this.$http.get('AdmMember/rechargeRecord', {params}).then(res => {
                    if (res) {
                        for (let prop of res.data) {
                            prop.create_time = myFunctions.parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                            prop.update_time = myFunctions.parseTime(prop.update_time, '{y}-{m}-{d} {h}:{i}')
                        }
                        this.rechargeList = res.data
                        this.rechargeTotal = res.total
                    }
                    this.rechargeLoading = false
                })
            },

            // 获取订单信息
            getOrderList() {
                this.orderLoading = true
                const params = this.orderQuery
                params.type = 0
                params.id = this.uid ? this.uid : this.id 
                this.$http.get('/AdmMember/order', {params}).then(res => {
                    if (res) {
                        this.orderList = res.data
                        this.orderTotal = res.total
                        for(let prop of this.orderList) {
                            if(prop.currency_id ===1) prop.currency_id = "BTC"
                            else prop.currency_id = "USDT"
                        }
                    }
                    this.orderLoading = false
                })
            },

            getSellOrderList() {
                this.sellOrderLoading = true
                const params = this.sellOrderQuery
                params.type = 1
                params.id = this.uid ? this.uid : this.id 
                this.$http.get('/AdmMember/order', {params}).then(res => {
                    if (res) {
                        this.sellOrderList = res.data
                        this.sellOrderTotal = res.total
                        for(let prop of this.sellOrderList) {
                            if(prop.currency_id ===1) prop.currency_id = "BTC"
                            else prop.currency_id = "USDT"
                        }
                    }
                    this.sellOrderLoading = false
                })
            },

            // 获取商品信息
            getGoodsList() {
                this.goodsLoading = true
                const params = this.goodsQuery
                params.id = this.uid ? this.uid : this.id 
                this.$http.get('/AdmMember/goods', {params}).then(res => {
                    if (res) {
                        for (let prop of res.data) {
                            prop.sells_amount = parseFloat(prop.sells_amount + '')
                        }
                        this.goodsList = res.data
                        this.goodsTotal = res.total
                        console.log(this.goodsList)
                    }
                    this.goodsLoading = false
                })
            },

            // 获取广告信息
            getAdList() {
                this.adLoading = true
                const params = this.adQuery
                params.id = this.uid ? this.uid : this.id
                this.$http.get('/AdmMember/ad', {params}).then(res => {
                    if (res) {
                        this.adList = res.data
                        this.adTotal = res.total
                    }
                    this.adLoading = false
                })
            },

            // 获取财务信息
            async getFinanceList() {
                this.financeLoading = true
                const params = {
                    page: this.financeQuery.page,
                    limit: this.financeQuery.limit,
                    user_id: this.uid ? this.uid : this.id,
                    currency_id: this.currency_id
                }
                let res = await myFunctions.get('AdmMember/finance', params)
                if (res) {
                    for (let prop of res.data) {
                        prop.create_time = parseTime(prop.create_time, '{y}-{m}-{d} {h}:{i}')
                    }
                    this.financeList = res.data
                    this.financeTotal = res.total
                }
                this.financeLoading = false
            },

            // 操作
            handleClick(data, opt, op, sign) {
                if (sign === 'access_freeze') op ? op = 0 : op = 2
                else op ? op = 0 : op = 1
                let params = {id: data.id, opt}
                if (sign === 'access_freeze' || sign === 'hidden_freeze') params.status = op
                else params[sign] = op
                this.$http('/AdmMember/update', {method: 'post', params}).then(res => {
                    if (res) this.$message.success('操作成功');
                    this.getUserInfo()
                })
            },

            // 重置密码
            resetPassword(type) {
                let params = {}
                if (type === 'login') params.password = 1
                else params.pinpass = 1
                this.$http('/AdmMember/update', {method: 'post', params : {opt: 1, id: this.uid ? this.uid : this.id }}).then(res => {
                    if (res) this.$message.success('重置成功')
                })
            },

            // 资金划账
            transform(form, type) {
                this.transformType = type
                this.dialogTransform = true
                this.$nextTick(() => {
                    this.$refs[form].resetFields()
                })
            },

            // 提交资产划转
            submitTransform(form) {
                this.$refs[form].validate((valid, object) => {
                    if (valid) {
                        let params = {
                            rmk: this.transformForm.rmk,
                            amount: this.transformForm.amount,
                            mode: this.transformType === 'add' ? 0 : 1,
                            uid: this.uid ? this.uid : this.id ,
                            currency_id: this.radio * 1
                        }
                        this.$http('/WebMyWithdrawal/transfer', {method: 'post', params}).then(res => {
                            if (res) {
                                this.$message.success('操作成功')
                                this.getUserInfo()
                                this.getFinanceList()
                                this.dialogTransform = false
                            }
                        })
                    } else this.$validateNotify(object)
                })
            },

            // 金额输入限制
            limitPrice(val) {
                this.transformForm.amount = this.$myFunctions.cutPoint(val, 5)
            },

            //获取用户账号余额
            async getUserMoney() {
                let res = await myFunctions.get('AdmMember/currencyBalance', {user_id: this.uid ? this.uid : this.id})
                if (res.total === 1) {
                    this.balanceBTC = parseFloat(res.data[0].balance)
                    this.frozenBTC = parseFloat(res.data[0].frozen)
                }
                else {
                    this.balanceUSDT = parseFloat(res.data[0].balance)
                    this.balanceBTC = parseFloat(res.data[1].balance)
                    this.frozenBTC = parseFloat(res.data[1].frozen)
                    this.frozenUSDT = parseFloat(res.data[0].frozen)
                }
            },

            //获取USDT地址
            getUSDTAddress() {
                this.currency_id = 2
                this.getBtcAddressList()
            },
            //获取BTC地址
            getBTCAddress() {
                this.currency_id = 1
                this.getBtcAddressList()
            },
            //获取USDT充值记录
            getUSDTRecord() {
                this.currency_id = 2
                this.getRechargeList()
            },
            //获取BTC地址
            getBTCRecord() {
                this.currency_id = 1
                this.getRechargeList()
            },
            //获取USDT财务信息
            getUSDTFinance() {
                this.currency_id = 2
                this.getFinanceList()
            },
            //获取BTC财务信息
            getBTCFinance() {
                this.currency_id = 1
                this.getFinanceList()
            },
        }
    }
</script>

<style scoped lang="less">
    ::v-deep {
        .el-card {
            margin-bottom: 10px;
            background: #d2c7c7;

            .el-card__body {
                padding: 10px;

                p {
                    margin-bottom: 5px;
                    font-weight: 600;
                }

                .el-button {
                    border-radius: 8px;
                    font-weight: normal;
                }

                .el-table {
                    margin-top: 10px;
                }
            }

            .row {
                .col {
                    flex-wrap: nowrap;
                    margin-bottom: 6px;

                    .eve {
                        display: flex;
                        align-items: center;

                        .el-button--text {
                            color: darkblue;
                            padding: 0;
                        }

                        .left {
                            width: 80px;
                            background: #F3BF8C;
                            padding: 2px 4px;
                            text-align-last: justify;
                            word-break: break-all; // 兼容火狐text-align-last: justify;
                            text-justify: distribute; // 兼容火狐text-align-last: justify;
                            .button-login:hover {
                                color: #409EFF;
                                cursor: pointer;
                            }
                        }

                        .right {
                            display: flex;
                            align-items: center;
                            width: 110px;
                            background: #e1e1e1;
                            padding: 2px 4px;
                            min-height: 20px;

                            .button-deal:hover {
                                color: #409EFF;
                                cursor: pointer;
                            }
                        }
                    }
                }
            }
        }
    }

    .currency_select {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
    }
</style>
