<template>
  <a-button type="primary" icon="lock" :loading="loading" @click="getAptStatus">检测apt锁状态</a-button>
</template>

<script>
import { getAptStatus, unLockApt } from '@/api/node'
export default {
  props: {
    nodeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    getAptStatus() {
      this.loading = true
      getAptStatus({ nodeId: this.nodeId }).then(res => {
        if (res.code === 200) {
          if (res.data === 'lock') {
            this.$confirm({
              title: 'apt已被锁定，是否解锁？',
              onOk: () => {
                return new Promise((resolve, reject) => {
                  unLockApt({ nodeId: this.nodeId }).then(res => {
                    if (res.code === 200) {
                      this.$notification.success({ message: 'apt解锁成功' })
                    }
                  }).finally(() => {
                    resolve()
                  })
                })
              }
            })
          } else if (res.data === 'pedding') {
            this.$notification.warning({ message: '存在别的进程正在使用apt，请稍等' })
          } else {
            this.$notification.success({ message: 'apt未被锁定，可正常使用' })
          }
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style>

</style>
