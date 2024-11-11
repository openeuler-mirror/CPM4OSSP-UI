<template>
  <div>

    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      label-align="right"
      layout="horizontal"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <a-form-model-item ref="script" :label="type === 'script' ? '脚本名称' : '执行命令'" prop="script">
        <a-input v-model="form.script" disabled />
      </a-form-model-item>

      <a-form-model-item ref="nodes" label="下发节点/分组" prop="nodesOrgroups">
        <a-select
          v-model="form.nodesOrgroups"
          mode="multiple"
          style="width: 100%"
          placeholder="请选择下发节点"
          @change="handleNodeOrGroupChange"
        >
          <a-select-opt-group>
            <span slot="label"><a-icon type="block" />节点</span>
            <a-select-option v-for="i in nodes" :key="i.id">
              {{ i.name }}
            </a-select-option>
          </a-select-opt-group>

          <a-select-opt-group>
            <span slot="label"><a-icon type="user" />分组</span>
            <a-select-option v-for="i in nodegroups" :key="i.id">
              {{ i.name }}
            </a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-model-item>

      <a-form-model-item v-if="type === 'script'" label="脚本路径" prop="nodePath">
        <a-input v-model="form.nodePath" />
      </a-form-model-item>
    </a-form-model>

  </div>
</template>

<script>
import { getNodeList } from '@/api/node'
import { listGroup } from '@/api/node_group'
import { executeScriptApi, executeCommandApi } from '@/api/script'

export default {
  props: {
    scriptItem: {
      type: Object,
      default: () => {
        return {}
      }
    },
    type: {
      type: String,
      default: 'script'
    }
  },
  data() {
    return {
      form: {
        script: '',
        nodes: [],
        nodePath: '',
        groups: [],
        nodesOrgroups: []
      },
      nodes: [],
      nodegroups: [],
      rules: {
        nodes: [{ required: true, message: '请选择下发节点', trigger: 'blur' }],
        nodePath: [{ required: true, message: '请输入脚本路径', trigger: 'blur' }],
        groups: [{ required: true, message: '请选择节点分组', trigger: 'blur' }],
        // nodesOrgroups
        nodesOrgroups: [{ required: true, message: '请选择节点/分组', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getNodeGroups()
    this.getNodes()
    if (this.type === 'script') {
      this.form.script = this.scriptItem.name
      this.form.nodePath = this.scriptItem.path
    }

    if (this.type === 'command') {
      this.form.script = this.scriptItem.path
    }
  },
  methods: {
    getNodes() {
      getNodeList()
        .then((res) => {
          if (res.code === 200) {
            this.nodes = res.data?.filter(item => item.openStatus === true) || []
          }
        })
        .catch(() => {})
    },

    // 获取节点分组
    getNodeGroups() {
      listGroup({
        pageNum: 1,
        pageSize: 99999
      })
        .then(res => {
          if (res.code === 200) {
            this.nodegroups = res.data?.list || []
          }
        })
    },

    // 下发节点/分组-选择器
    handleNodeOrGroupChange(val, opt) {
      this.form.nodes = []
      this.form.groups = []
      for (const id of val) {
        for (const node of this.nodes) {
          if (node.id === id && !this.form.nodes.includes(id)) {
            this.form.nodes.push(id)
          }
        }

        for (const nodegroup of this.nodegroups) {
          if (nodegroup.id === id && !this.form.groups.includes(id)) {
            this.form.groups.push(id)
          }
        }
      }
    },

    // 下发脚本
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate(valid => {
          if (!valid) {
            reject()
            return false
          }
          executeScriptApi({
            scriptId: this.scriptItem.id,
            nodeIdList: this.form.nodes,
            groupIds: this.form.groups,
            nodePath: this.form.nodePath
          })
            .then((res) => {
              if (res.code === 200) {
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

    // 下发命令
    execCommand() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate(valid => {
          if (!valid) {
            reject()
            return false
          }
          executeCommandApi({
            manageCommandPreId: this.scriptItem.id,
            nodeIdList: this.form.nodes,
            groupIds: this.form.groups
          })
            .then((res) => {
              if (res.code === 200) {
                resolve(res)
              }
              reject(res)
            })
            .catch(err => {
              reject(err)
            })
        })
      })
    }
  }
}
</script>

<style>

</style>
