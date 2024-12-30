<template>
  <div class="file-upload-container">
    <a-input-group compact>
      <a-input
        style="width: 85%"
        class="upload-input"
        :placeholder="placeholderText"
        v-model="selectedFileName"
        disabled
      />
      <a-upload
        style="width: 15%"
        :custom-request="handleUpload"
        :action="url"
        :headers="headers"
      >
        <a-button type="primary">
          <a-icon type="upload" />选择文件
        </a-button>
      </a-upload>
    </a-input-group>
  </div>
</template>

<script>
import { uploadScriptApi } from '@/api/script'

export default {
  props: {
    url: {
      type: String,
      required: true
    },
    placeholderText: {
      type: String,
      default: '请选择文件'
    }
  },
  data() {
    return {
      selectedFileName: '',
      headers: {
        authorization: 'authorization-text'
      }
    }
  },
  methods: {
    async handleUpload(option) {
      const { onError, onSuccess, file } = option
      this.selectedFileName = file.name

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await uploadScriptApi(formData)
        if (response.code === 200) {
          onSuccess(response)
          this.$emit('on-success', response)
        } else {
          this.handleError(response.data.msg)
        }
      } catch (error) {
        console.error(error)
        this.handleError('上传文件时发生错误')
      }
    },
    handleError(message) {
      // 使用全局错误处理或通知组件展示错误信息
      this.$message.error(message)
    }
  }
}
</script>

<style lang="scss" scoped>
.file-upload-container {
  display: flex;
  align-items: center;

  .upload-input {
    margin-right: 8px;
  }

  .ant-btn {
    width: 100%;
  }
}
</style>