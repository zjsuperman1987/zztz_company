<template>
    <div class="ad-info" v-loading="fullLoading">
        <div class="title">
            <span class="title-item">{{ data.title }}</span>
            <span class="more" @click="$router.push({ name: 'more-information' })">{{ $t('login.moreMessage') }}</span>
        </div>
        <div class="info">
            <div>
                <span>{{$t('login.publisher')}}: {{ data.uid }}</span>
                <span style="margin-left: 10px">{{$t('login.time')}}：{{ data.cretime || data.create_time }}</span>
            </div>
            <span v-if="type === 'ad'">{{$t('ad.adPromotion')}}</span>
        </div>
        <div class="contents">
            <span class="content" v-if="type === 'ad' && data.post" v-html="data.post.contents"></span>
            <span class="content" v-if="type === 'info' && data.content" v-html="data.content.contents"></span>
        </div>
    </div>
</template>

<script>
    import {parseTime} from "@/utils";

    export default {
        name: "adNotice",
        data() {
            return {
                type: '',
                data: {},
                fullLoading: false
            }
        },
        watch: {
            $route: {
                handler(val) {
                    if (val) this.getDetailsInfo(val.query.id, val.query.type);
                    this.type = val.query.type
                },
                immediate: true
            }
        },
        methods: {
            getDetailsInfo(id, type) {
                let url
                this.fullLoading = true
                switch (type) {
                    case 'ad':
                        url = `/WebAdv/${id}`
                        break;
                    case 'info':
                        url = `/WebArticle/${id}`
                        break;
                }
                this.$http.get(url).then(res => {
                    if (res) {
                        res.create_time = parseTime(res.create_time, '{y}-{m}-{d} {h}:{i}:{s}')
                        this.data = res
                    }
                    this.fullLoading = false
                }).catch(() => {
                    this.fullLoading = false
                })
            }
        }
    }
</script>

<style scoped lang="less">
    .ad-info {
        padding: 20px;
        height: 100%;
        background: #f9f9f9;

        .title {
            background: #9bf0d6;
            padding: 4px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .more {
                cursor: pointer;

                &:hover {
                    color: #409EFF;
                }
            }

            &-item {
                font-size: 14px
            }
        }

        .info {
            background: #d8d8d8;
            padding: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .contents {
            min-height: calc(100% - 55px);
            background: #f1f1f1;
            padding: 15px;
            line-height: 20px;
        }
    }
</style>
