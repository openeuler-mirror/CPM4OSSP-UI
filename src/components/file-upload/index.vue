<template>
  <div class="">
    <a-input-group compact>
      <a-input style="width: 85%" class="upload-input" placeholder="请选择文件" disabled />
      <a-upload
        style="width: 15%"
        :custom-request="customRequest"
      >
        <a-button><a-icon type="upload" />选择文件</a-button>
      </a-upload>
    </a-input-group>
  </div>
</template>

<script>

export default {
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      upLoadUrl: '',
      headers: {
        authorization: 'authorization-text'
      }
    }
  },
  methods: {
    customRequest(option) {
      const { onError, onSuccess, file } = option
      const formData = new FormData()
      formData.append('file', file)
    }
  }
}
</script>

