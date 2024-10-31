<template>
  <!-- 新增 或 编辑 -->
  <div>
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >

      <a-form-model-item ref="name" label="命令名称" prop="name">
        <a-input v-model="form.name" />
      </a-form-model-item>

      <a-form-model-item ref="command" label="执行命令" prop="command">
        <a-input v-model="form.command" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { addCommandApi } from '@/api/script'

export default {
  data() {
    return {
      form: {
        command: ''
      },
      rules: {
        name: [{ required: true, message: '请输入命令名称', trigger: 'blur' }],
        command: [{ required: true, message: '请输入执行命令', trigger: 'blur' }]
      }
    }
  },
  methods: {
    addCommand() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate(valid => {
          if (!valid) {
            reject()
            return false
          }
          addCommandApi({
            path: this.form.command,
            param: this.form.name
          })
            .then(res => {
              if (res.code === 200) {
                this.$notification.success({
                  message: `添加命令成功`,
                  duration: 2
                })
                resolve(res)
              }
              reject(res)
            })
            .catch(err => {
              reject(err)
            })
        })
      })
    },

    editCommand() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate(valid => {
          if (!valid) {
            return false
          }
        })
      })
    }
  }
}
</script>

<style>

</style>
