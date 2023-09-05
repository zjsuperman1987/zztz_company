<template>
  <div>
    <div class="top">
      <span style="font-size: 14px;font-weight: 600">{{ title }} <span v-if="partner">{{ $t('textarea.partner') }}{{ partner }}</span></span>
      <div class="options">
        <el-button class="upload" size="mini" type="primary" @click="uploadP"
                   icon="el-icon-picture">{{ $t('textarea.upload') }}</el-button>
        <span style="margin-left: 10px">{{ $t('textarea.color') }}</span>
        <el-color-picker size="small" @change="changeColor" color-format="hex"
                         :predefine="['#409EFF', '#1890ff', '#304156','#212121','#11a983', '#13c2c2', '#6959CD', '#f5222d', ]"
                         v-model="color"></el-color-picker>
        <span style="margin-left: 10px">{{ $t('textarea.fontSize') }}</span>
        <el-select v-model="fontSize" :popper-append-to-body="false" placeholder="设置字体大小" style="width: 75px" size="mini" @change="changeSize">
          <el-option label="12px" value="12"></el-option>
          <el-option label="14px" value="14"></el-option>
          <el-option label="16px" value="16"></el-option>
          <el-option label="18px" value="18"></el-option>
        </el-select>
      </div>
    </div>
    <div class="textarea">
      <el-input size="small" type="textarea" maxlength="3000" show-word-limit ref="textarea"
                @blur="changeBlur" :autosize="{ minRows, maxRows}" v-model="content"></el-input>
      <el-upload ref="upload" action="#"
                 :before-upload="imgChange"
                 :http-request="submitPicture"
                 :on-success="handle_success"
                 :file-list="fileList" :on-remove="handleRemove" v-show="showAttach && idList.length"
                 class="item-upload" accept=".jpeg,.jpg,.gif,.png" list-type="picture-card">
        <i ref="uploadIcon" class="el-icon-plus"></i>
      </el-upload>
      <ul v-if="showAttachId && attachList.length" class="name">
        <li class="id" v-for="item of attachList" :key="item.name">
          <el-button size="mini" type="primary" @click="addToTextarea(item.name)">{{ $t('textarea.insert') }}</el-button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: "index",
    props: {
      showAttach: {
        type: Boolean,
        default: true
      },
      showAttachId: {
        type: Boolean,
        default: true
      },
      path: String,
      value: {
        type: String,
        default: ''
      },
      minRows: {
        type: Number,
        default: 8
      },
      maxRows: {
        type: Number,
        default: 20
      },
      title: {
        type: String,
        default: ''
      },
      partner: Number/String,

      type: Number, // 发布资讯时需要传类型
      uid: Number, // 修改资讯时需要传uid

      fileList: Array,  // 文件合集:主要用来回显
      attachList: Array,  // 文件合集 用来存放[aid]id[/aid]
      idList: Array,  // id合集 存放单独的id数组
    },
    data() {
      return {
        color: '#409EFF',
        fontSize: '12',
        content: '',

        selectionStart: '',
        selectionEnd: '',

        // 图片
        fileRaw: {},

        // 存储图片信息
        attachInfoList: []
      }
    },
    watch: {
      value(val) {
        this.content = val
      }
    },
    methods: {
      changeBlur() {
        let el = this.$refs.textarea.$el.firstElementChild
        this.selectionStart = el.selectionStart
        this.selectionEnd = el.selectionEnd
        this.$emit('input', this.content)
      },
      uploadP() {
        this.$refs.uploadIcon.click()
      },
      submitPicture(file) {
        let formData = new FormData();
        if (this.fileRaw) {
          formData.append('image', file.file);
          this.$http('/WebAttach/upload',{
            headers: { 'Content-Type': 'multipart/form-data' },
            method: 'post',
            params: { path: this.path, type: this.type, uid: this.uid },
            data: formData
          }).then(res => {
            if (res) {
              this.attachList.push({ name: '[aid]' + res.id + '[/aid]' })
              this.idList.push(res.id)
              file.onSuccess(res)
            }
          }).catch(err => {
            file.onError(err)
            this.attachList = []
            this.idList = []
            this.$refs.upload.clearFiles()
          })
        }
      },
      // 上传之前
      imgChange(file){
        const sizeLimit = file.size < 1024*1024*2
        if (!sizeLimit) {
          this.$message.warning('上传图片大小不能超过 2MB!')
          return false
        }else {
          this.fileRaw = file
          return sizeLimit
        }
      },
      // 上传成功
      handle_success(response, file, fileList) {
        let copyList = JSON.parse(JSON.stringify(this.fileList))
        if (copyList.length) this.fileList.push(file)
        else this.attachInfoList.push(file.uid)
      },
      // 图片移除时将id一起删除
      handleRemove(file, fileList) {
        if (this.showAttachId) {
          let fileList = JSON.parse(JSON.stringify(this.fileList))
          if (fileList.length) {   // 原本有图片数据
            fileList.filter((item,index) => {
              if (item.uid === file.uid) {
                this.idList.splice(index,1)
                this.attachList.splice(index,1)
                this.fileList.splice(index,1)
              }
            })
          }else {  //原本没有图片数据
            this.attachInfoList.filter((item,index) => {
              if (item === file.uid) {
                this.idList.splice(index,1)
                this.attachList.splice(index,1)
                this.attachInfoList.splice(index,1)
              }
            })
          }
        }
      },
      async changeSize(val) {
        let el = this.$refs.textarea.$el.firstElementChild
        if ((this.selectionStart || this.selectionStart === 0) && this.selectionEnd) {
          let choose = el.value.substring(this.selectionStart, this.selectionEnd)
          this.content = el.value.substring(0, this.selectionStart) +
              '[size=' + val + ']' + choose + '[/size]' + el.value.substring(this.selectionEnd, el.value.length)
          await this.$nextTick()
          this.$emit('input', this.content)
          el.focus()
        }
      },
      async addToTextarea(insertValue) {
        let el = this.$refs.textarea.$el.firstElementChild
        if (el.selectionStart || el.selectionStart === 0) {
          let startPos = el.selectionStart
          let endPos = el.selectionEnd
          this.content = el.value.substring(0, startPos) + insertValue
              + el.value.substring(endPos, el.value.length)
          await this.$nextTick()
          this.$emit('input', this.content)
          el.focus()
          el.setSelectionRange(endPos + insertValue.length, endPos + insertValue.length)
        } else this.content += insertValue
      },
      async changeColor(val) {
        let el = this.$refs.textarea.$el.firstElementChild
        if ((this.selectionStart || this.selectionStart === 0) && this.selectionEnd) {
          let choose = el.value.substring(this.selectionStart, this.selectionEnd)
          this.content = el.value.substring(0, this.selectionStart) +
              '[color=' + val + ']' + choose + '[/color]' + el.value.substring(this.selectionEnd, el.value.length)
          await this.$nextTick()
          this.$emit('input', this.content)
          el.focus()
        }
      },
      clearFiles() {
        this.$refs.upload.clearFiles()
      }
    }
  }
</script>

<style scoped lang="less">
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .options {
      display: flex;
      align-items: center;
      .upload {
        border-radius: 0;
        height: 24px;
      }
      ::v-deep {
        .el-color-picker {
          height: 24px;
          .el-color-picker__trigger {
            height: 24px;
            width: 24px;
            padding: 2px;
            border-color: #9CA8AA;
            border-radius: 0;
            .el-color-picker__color {
              border-radius: 0;
            }
          }
        }
        .el-select {
          .el-input__inner {
            height: 24px;
            line-height: 24px;
            padding: 0 6px;
            border-radius: 0;
            border-color: #9CA8AA;
          }
        }
      }
    }
  }
  ::v-deep {
    .el-textarea__inner {
      border-radius: 0;
    }
    .name {
      background: #fff;
      border: 1px solid #dcdfe6;
      border-top: 0;
      .id {
        padding: 4px 0;
        display: inline-block;
        width: 84px;
        text-align: center;
      }
    }
    .item-upload {
      border: 1px solid #DCDFE6;
      border-top: 0;
      background: #fff;
      .el-upload-list--picture-card .el-upload-list__item {
        margin: 4px 0 4px 4px;
        height: 80px;
        width: 80px;
      }
      .el-upload--picture-card {
        margin: 4px 0 4px 4px;
        height: 80px;
        width: 80px;
        line-height: 80px;
      }
    }
    .label {
      display: flex;
      justify-content: space-between;
      &-title {
        line-height: 24px;
        font-size: 14px;
        color: #606266;
      }
    }
  }
</style>
