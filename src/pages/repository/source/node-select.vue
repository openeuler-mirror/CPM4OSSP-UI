<template>
  <div>
    <a-form-model :wrapper-col="{ span: 20 }" :label-col="{ span: 4 }">
      <a-form-model-item label="软件源模板名">
        <a-input :value="planInfo.planName" disabled />
      </a-form-model-item>
      <a-form-model-item label="选择配置节点">
        <a-select
          v-model="selecPlanName"
          mode="multiple"
        >
          <a-select-option v-for="item in nodeList" :key="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { getNodeList, getNodeStatus } from '@/api/node'
import { batchProcessing } from '@/api/repository'
export default {
  props: {
    planInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      selecPlanName: [],
      nodeList: []
    }
  },
  created() {
    this.getNodeList()
  },
  methods: {
    getNodeList() {
      getNodeList().then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            getNodeStatus(item.id).then(statusRes => {
              if (statusRes.code === 200) {
                this.nodeList.push(item)
              }
            })
          })
        }
      })
    },
    handleSubmit() {
      return new Promise((resolve, reject) => {
        if (this.selecPlanName.length === 0) {
          this.$notification.error({ message: '请选择配置节点' })
          reject('validate')
          return
        }
        let fileStr = ''
        this.planInfo.sourceList.forEach((item, index) => {
          if (index > 0) {
            fileStr += '\n' + item.type + ' ' + item.url + ' ' + item.codename + ' ' + item.remarks
          } else {
            fileStr += item.type + ' ' + item.url + ' ' + item.codename + ' ' + item.remarks
          }
        })
        let pramars = {
          nodeIds: this.selecPlanName,
          interface: 'SetSourceList',
          data: {
            mode: 'cover',
            file: fileStr
          }
        }
        batchProcessing(pramars).then(res => {
          let flag = res.some(item => {
            return item.code !== 200
          })
          flag && reject(res)
          !flag && resolve(res)
        }).catch(() => {
          reject('validate')
        })
      })
    }
  }
}
</script>