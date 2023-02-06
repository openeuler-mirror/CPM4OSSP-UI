<template>
  <div>
    <a-form-model :wrapper-col="{ span: 20 }" :label-col="{ span: 4 }">
      <a-form-model-item label="服务器IP">
        <a-input v-model="serverIp" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
export default {
  data() {
    return {
      serverIp: ''
    }
  },
  created() {
    this.serverIp = localStorage.getItem('mini_serverIp')
  },
  methods: {
    handleSubmit() {
      return new Promise((resolve, reject) => {
        let reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
        if (reg.test(this.serverIp)) {
          if (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256) {
            localStorage.setItem('mini_serverIp', this.serverIp)
          }
          return resolve()
        }
        return reject()
      })
    }
  }
}
</script>
