<template>
    <div :class="{fullscreen:fullscreen}" class="tinymce-container" :style="{width:containerWidth}">
        <textarea :id="tinymceId" class="tinymce-textarea"/>
        <div class="editor-custom-btn-container" v-if="false">
            <editorImage color="#1890ff" class="editor-upload-btn" @successCBK="imageSuccessCBK"/>
        </div>
    </div>
</template>

<script>
    /**
     * docs:
     * https://panjiachen.github.io/vue-element-admin-site/feature/component/rich-editor.html#tinymce
     */
    import editorImage from './components/EditorImage'
    import plugins from './plugins'
    import toolbar from './toolbar'
    import load from './dynamicLoadScript'

    // why use this cdn, detail see https://github.com/PanJiaChen/tinymce-all-in-one
    const tinymceCDN = 'https://cdn.jsdelivr.net/npm/tinymce-all-in-one@4.9.5/tinymce.min.js'
    import {mapState} from 'vuex'

    export default {
        name: 'Tinymce',
        components: {editorImage},
        props: {
            id: {
                type: String,
                default: function () {
                    return 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
                }
            },
            value: {
                type: String,
                default: ''
            },
            toolbar: {
                type: Array,
                required: false,
                default() {
                    return []
                }
            },
            menubar: {
                type: String,
                // default: 'file edit insert view format'
                default: ''
            },
            height: {
                type: [Number, String],
                required: false,
                default: 200
            },
            width: {
                type: [Number, String],
                required: false,
                default: 'auto'
            }
        },
        data() {
            return {
                hasChange: false,
                hasInit: false,
                tinymceId: this.id,
                fullscreen: false,
            }
        },
        computed: {
            containerWidth() {
                const width = this.width
                if (/^[\d]+(\.[\d]+)?$/.test(width)) return `${width}px`         // matches `100`, `'100'`
                return width
            },
            ...mapState({
                site_static: state => state.site.siteSetting.site_static_chars
            })
        },
        watch: {
            value(val) {
                if (!this.hasChange && this.hasInit) this.$nextTick(() => window.tinymce.get(this.tinymceId).setContent(val || ''))
            },
            language() {
                this.destroyTinymce()
                this.$nextTick(() => this.initTinymce())
            }
        },
        mounted() {
            this.init()
        },
        activated() {
            if (window.tinymce) this.initTinymce()
        },
        deactivated() {
            this.destroyTinymce()
        },
        destroyed() {
            this.destroyTinymce()
        },
        methods: {
            init() {
                // dynamic load tinymce from cdn
                load(tinymceCDN, (err) => {
                    if (err) {
                        this.$message.error(err.message)
                        return
                    }
                    this.initTinymce()
                })
            },
            initTinymce() {
                const _this = this
                window.tinymce.init({
                    language: 'zh_CN',
                    selector: `#${this.tinymceId}`,
                    height: this.height,
                    body_class: 'panel-body',
                    object_resizing: false,
                    toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
                    menubar: this.menubar,
                    plugins: plugins,
                    elementpath: false, // 隐藏元素路径
                    fontsize_formats: '8px 10px 12px 14px 18px 24px 36px',
                    end_container_on_empty_block: true,
                    powerpaste_word_import: 'clean',
                    code_dialog_height: 450,
                    code_dialog_width: 1000,
                    // advlist_bullet_styles: 'square',  // list前面的点 取值："default,circle,disc,square"
                    // advlist_number_styles: 'default',  // 数字样式 取值："default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman"
                    imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
                    default_link_target: '_blank',
                    link_title: false, //
                    branding: false,  // 隐藏右下角技术支持
                    draggable_modal: true, // 可拖动
                    // statusbar: false,  // 隐藏下方状态条
                    // resize: true,  // 可放大缩小 默认true  false:不可变化  'both':可上下左右放大
                    nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
                    init_instance_callback: editor => {
                        if (_this.value) editor.setContent(_this.value)
                        _this.hasInit = true
                        editor.on('NodeChange Change KeyUp SetContent', () => {
                            this.hasChange = true
                            this.$emit('input', editor.getContent())
                        })
                    },
                    setup(editor) {
                        editor.on('FullscreenStateChanged', (e) => {
                            _this.fullscreen = e.state
                        })
                    },
                    // 图片上传
                    images_upload_handler: (blobInfo, success, failure) => {
                        let formData = new FormData();
                        formData.append('image', blobInfo.blob());
                        this.$http('/WebAttach/upload', {
                            headers: {'Content-Type': 'multipart/form-data'},
                            method: 'post',
                            params: {path: 'goods'},
                            data: formData
                        }).then(res => {
                            if (res) success(this.site_static + res.path)
                            else failure('上传失败')
                        }).catch(() => {
                            failure('上传失败')
                        })
                    },
                    convert_urls: false
                })
            },
            destroyTinymce() {
                const tinymce = window.tinymce.get(this.tinymceId)
                if (this.fullscreen) tinymce.execCommand('mceFullScreen')

                if (tinymce) tinymce.destroy()
            },
            setContent(value) {
                window.tinymce.get(this.tinymceId).setContent(value)
            },
            getContent() {
                window.tinymce.get(this.tinymceId).getContent()
            },
            imageSuccessCBK(arr) {
                arr.forEach(v => window.tinymce.get(this.tinymceId).insertContent(`<img class="wscnph" src="${v.url}" >`))
            }
        }
    }
</script>

<style lang="less" scoped>
    .tinymce-container {
        position: relative;
        line-height: normal;
    }

    .tinymce-container {
        ::v-deep {
            .mce-fullscreen {
                z-index: 10000;
            }
        }
    }

    .tinymce-textarea {
        visibility: hidden;
        z-index: -1;
    }

    .editor-custom-btn-container {
        position: absolute;
        right: 4px;
        top: 4px;
        /*z-index: 2005;*/
    }

    .fullscreen .editor-custom-btn-container {
        z-index: 10000;
        position: fixed;
    }

    .editor-upload-btn {
        display: inline-block;
    }

    ::v-deep {
        .mce-menubtn.mce-fixed-width span {
            width: 60px;
        }
    }
</style>
