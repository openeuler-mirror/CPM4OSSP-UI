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
  }
}
</script>