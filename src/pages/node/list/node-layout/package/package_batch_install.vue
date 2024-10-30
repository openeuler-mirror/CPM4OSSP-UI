<template>
  <div>
    <a-alert banner>
      <span slot="message">
        可能会出现安装软件包检索不到或查找到的软件包安装不成功的情况，建议
        <a-icon v-show="refreshLoading" type="loading" />
        <a href="#" style="text-decoration: underline;" :disabled="refreshLoading" @click="getInstallablePackage">更新安装软件包检索库</a>
      </span>
    </a-alert>
    <a-form-model ref="packageForm" :model="packageInfo" :rules="rules">
      <!-- 搜索头 -->
      <a-form-model-item label="软件包名" prop="taskTarget" :label-col="{span:3}" :wrapper-col="{span:21}">
        <a-input-search
          v-model="packageInfo.taskTarget"
          style="width:calc(100% - 75px);margin-right:10px;"
          allow-clear
          @change="handleChange"
          @search="handleSearch"
        >
          <a-select slot="addonAfter" v-model="packageInfo.searchType" class="width-100" @change="handleChange">
            <a-select-option value="0">模糊匹配</a-select-option>
            <a-select-option value="1">单词匹配</a-select-option>
            <a-select-option value="2">精准匹配</a-select-option>
          </a-select>
        </a-input-search>
        <a-button :disabled="isAbleAdd" type="primary" @click="addPackage">添加</a-button>
        <installable-package-list
          v-if="isShowInstallableList"
          :inputvalue="packageInfo.taskTarget"
          :list="installableList"
          :node-id="nodeId"
          @handleInputValue="handleClick"
        />
      </a-form-model-item>
      <a-form-model-item>
        <a-divider>
          待安装软件包列表
          <a-tooltip :overlay-style="{'max-width':'400px'}" title="拖拽软件包可确定安装优先级,此操作可能会影响安装速度！">
            <a-icon type="exclamation-circle" class="warning help-icon" />
          </a-tooltip>
        </a-divider>
        <a-table
          :columns="columns"
          class="drag"
          :data-source="packageList"
          bordered
          :row-key="record=>record.taskTarget"
          style="height:325px;"
          :pagination="false"
          :scroll="{ y: 270 }"
        >
          <a-tooltip slot="taskTarget" slot-scope="text" placement="topLeft" :title="text">
            <span>{{ text }}</span>
          </a-tooltip>
          <a-tooltip slot="version" slot-scope="text" placement="topLeft" :title="text">
            <span>{{ text }}</span>
          </a-tooltip>
          <a-tooltip slot="dependency" slot-scope="text" placement="topLeft" :overlay-style="{'max-width':'500px'}">
            <template slot="title"><span v-html="text" /></template>
            <a-icon v-if="!text" type="loading" />
            <span v-else>{{ text }}</span>
          </a-tooltip>
          <template slot="operation" slot-scope="record">
            <a-tooltip title="移除">
              <a-button type="link" @click="deletePackage(record)"><a-icon type="delete" class="danger" /></a-button>
            </a-tooltip>
          </template>
        </a-table>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import { addPackageTask, getInstallablePackageByKeyword, queryDependency, getInstallablePackage } from '@/api/node_package'
import InstallablePackageList from './Installable_package_list.vue'
export default {
  components: {
    InstallablePackageList
  },
  props: {
    nodeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      refreshLoading: false,
      packageInfo: {
        taskTarget: '',
        searchType: '0'
      },
      rules: {
        taskTarget: [
          { required: true, message: '请输入软件包包名', trigger: 'change' }
        ]
      },
      columns: [
        {
          title: '软件包名',
          key: 'taskTarget',
          dataIndex: 'taskTarget',
          scopedSlots: { customRender: 'taskTarget' },
          ellipsis: true
        },
        {
          title: '版本',
          key: 'version',
          dataIndex: 'version',
          scopedSlots: { customRender: 'version' },
          ellipsis: true
        },
        {
          title: '架构',
          key: 'Architecture',
          dataIndex: 'Architecture',
          width: 100
        },
        {
          title: '安装优先级',
          key: 'taskPriority',
          customRender: (text, record, index) => `${index + 1}`,
          width: 110
        },
        {
          title: '关联软件包',
          key: 'dependency',
          dataIndex: 'dependency',
          scopedSlots: { customRender: 'dependency' },
          ellipsis: true
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'operation' },
          align: 'center',
          width: 80
        }
      ],
      packageList: [],
      installableList: [],
      selectPackages: [],
      isShowInstallableList: false,
      isAbleAdd: true
    }
  },
  mounted() {
    this.drag()
  },
  methods: {
    deletePackage(record) {
      this.packageList = this.packageList.filter(item => {
        return item.taskTarget !== record.taskTarget
      })
    },
    addPackage() {
      this.isAbleAdd = true
      this.$refs.packageForm.validate(valid => {
        if (!valid) {
          return
        }
        const flag = this.packageList.some(item => {
          return item.taskTarget === this.packageInfo.taskTarget
        })
        if (flag) {
          this.$notification.warning({
            message: '软件包已存在'
          })
          return
        }
        const packageInfo = {
          taskAction: 'install',
          taskGroupId: 1,
          nodeId: this.nodeId,
          ...this.packageInfo,
          version: this.selectPackages[0].Version,
          Architecture: this.selectPackages[0].Architecture
        }
        queryDependency({ packageName: packageInfo.taskTarget, nodeId: this.nodeId }).then(res => {
          if (res.code === 200) {
            if (res.data) {
              let result = ''
              const dependency = res.data[packageInfo.taskTarget]
              for (let dep of dependency) {
                for (let key in dep) {
                  const value = dep[key]
                  if (typeof value === 'object') {
                    for (let key1 in value) {
                      for (let item of value[key1]) {
                        result += key.replace('|', '') + '：' + this.replacelgt(item) + '<br/>'
                      }
                    }
                  } else {
                    result += key.replace('|', '') + '：' + this.replacelgt(value) + '<br/>'
                  }
                }
              }
              this.$set(packageInfo, 'dependency', result)
            } else {
              this.$set(packageInfo, 'dependency', '无')
            }
          } else {
            this.$set(packageInfo, 'dependency', '无')
            this.$notification.error({ message: res.msg })
          }
        }).catch(error => {
          this.$set(packageInfo, 'dependency', '无')
          this.$notification.error({ message: error })
        })
        this.packageList.push(packageInfo)
        this.$refs.packageForm.resetFields()
      })
    },
    replacelgt(data) {
      return data.replace('<', '&lt').replace('>', '&gt')
    },
    handleInstall() {
      if (this.packageList.length === 0) {
        this.$notification.warning({
          message: '请添加待安装的软件包'
        })
        return new Promise((resolve, reject) => reject())
      }
      return new Promise((resolve, reject) => {
        this.packageList = this.packageList.map((item, index) => {
          item.taskPriority = index + 1
          item.taskTarget = item.taskTarget + '=' + item.version
          return item
        })
        let params = {
          nodeId: this.nodeId,
          taskList: this.packageList
        }
        addPackageTask(params).then(res => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
      })
    },
    drag() {
      const el = document.querySelectorAll('.drag  tbody')[0]
      Sortable.create(el, {
        disabled: false,
        sort: true,
        onEnd: (e) => {
          this.packageList.splice(e.newIndex, 0, this.packageList.splice(e.oldIndex, 1)[0])
          let newArr = this.packageList.slice(0)
          this.packageList = []
          this.$nextTick(() => {
            this.packageList = newArr
          })
        }
      })
    },
    handleClick(packageName) {
      this.selectPackages = []
      this.packageInfo.taskTarget = packageName
      this.isShowInstallableList = false
      this.isAbleAdd = false
      this.installableList.forEach(item => {
        if (item.Package === packageName) {
          this.selectPackages.push(item)
        }
      })
    },
    handleSearch() {
      if (this.packageInfo.taskTarget === '') {
        this.isShowInstallableList = false
        this.installableList = []
        this.selectPackages = []
        return
      }
      const params = {
        nodeId: this.nodeId,
        search: this.packageInfo.taskTarget,
        searchType: this.packageInfo.searchType
      }
      getInstallablePackageByKeyword(params).then(res => {
        this.installableList = res.data
        this.isShowInstallableList = true
      })
    },
    handleChange() {
      this.isAbleAdd = true
      this.handleSearch()
    },
    getInstallablePackage(e) {
      e.preventDefault()
      this.refreshLoading = true
      getInstallablePackage({ nodeId: this.nodeId }).then(res => {
        if (res.code === 200) {
          this.$notification.success({ message: '更新软件包检索库成功' })
        }
      }).finally(() => {
        this.refreshLoading = false
      })
    }
  }
}
</script>

<style scoped>
.text{
  font-size: 12px;
  font-weight: 500;
}
</style>
