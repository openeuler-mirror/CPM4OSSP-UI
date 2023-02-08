<template>
  <div>
    <!-- 头部 -->
    <div class="btn-box">
      <a-button type="primary" icon="setting" @click="setSource">软件源设置</a-button>
      <lock-status :node-id="node.id" />
    </div>
    <!-- 软件源表格数据 -->
    <a-table
      :data-source="sourceList"
      bordered
      :columns="columns"
      :pagination="false"
      :row-key="(record, index) => index "
      :scroll="{x:600}"
    >
      <a-tooltip slot="type" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="url" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="codename" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="remarks" slot-scope="text" placement="topLeft" :overlay-style="{'max-width':'200px'}">
        <template slot="title"><span v-html="text.replaceAll(' ','<br/>')" /></template>
        <template v-if="text">
          <a-tag v-for="item in text.split(' ')" :key="item" color="#108ee9">{{ item }}</a-tag>
        </template>
      </a-tooltip>
    </a-table>
    <a-modal v-model="sourceSettingVisible" width="70%" title="软件源设置" :destroy-on-close="true" @ok="sourceSettingOk">
      <source-setting ref="sourceSetting" :node-id="node.id" />
    </a-modal>
    <a-modal v-model="scanSourceListVisible" title="设置检测周期" @ok="scanSourceOk">
      <a-form-model :label-col="{span: 5}" :wrapper-col="{span: 19}" label-align="right">
        <a-form-model-item label="检测周期">
          <a-switch v-model="openCycle" checked-children="开启" un-checked-children="停用" />
        </a-form-model-item>
        <a-form-model-item v-show="openCycle" label="周期间隔">
          <a-input v-model="cycle" type="number" class="input" placeholder="请输入周期时间">
            <a-select slot="addonAfter" v-model="cycleType" style="width: 70px" @select="selectTimeType">
              <a-select-option value="ss">秒</a-select-option>
              <a-select-option value="mm">分</a-select-option>
              <a-select-option value="hh">时</a-select-option>
              <a-select-option value="dd">天</a-select-option>
            </a-select>
          </a-input>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { getSource, scanSourceListOnce, scanSourceListCycle, getScanSource, setSource, rollbackSourceList } from '@/api/node_source'
import { getPlanSourceList } from '@/api/repository'
import SourceSetting from './source_setting.vue'
import lockStatus from '../components/lock-status.vue'
export default {
  components: {
    lockStatus，
    SourceSetting
  },
  props: {
    node: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      sourceList: [],
      sourceListMap: {
        '0': 'type',
        '1': 'url',
        '2': 'codename',
        '3': 'remarks'
      },
      columns: [
        { title: '软件源类型', dataIndex: 'type', width: 150, ellipsis: true, scopedSlots: { customRender: 'type' }},
        { title: '软件源地址', dataIndex: 'url', ellipsis: true, scopedSlots: { customRender: 'url' }},
        { title: '版本代码', dataIndex: 'codename', ellipsis: true, width: 150, scopedSlots: { customRender: 'codename' }},
        { title: '其它信息', dataIndex: 'remarks', ellipsis: true, scopedSlots: { customRender: 'remarks' }}
      ],
      sourceSettingVisible: false,
      cycle: 0,
      cycleType: 'ss',
      openCycle: true,
      scanSourceListVisible: false,
      dbSourceSetVisible: false,
      sourcePlanVisible: false,
      planList: [],
      planForm: {},
      confirmLoading: false,
      rollbackLoading: false
    }
  },
  computed: {
    nodeCheck() {
      return this.$store.state.nodeSource.nodeCheckSetting.find(item => item.nodeId === this.node.id)
    }
  },
  created() {
    this.getSource()
    this.getPlanSourceList()
  },
  methods: {
    getSource() {
      const param = {
        nodeId: this.node.id
      }
      this.sourceList = []
      getSource(param).then(res => {
        const sourceStr = res.data
        if (res.code === 200 && sourceStr !== 'null') {
          this.sourceList = sourceStr.split('\n').map(item => {
            let obj = {}
            let urlPre = true // 该标记是否循环到http://或ssh://或ftp://或cdrom:
            const reg = /^((http|ssh|ftp):\/\/)|cdrom:/
            item.split(' ').forEach((item, index) => {
              if (item) {
                if (reg.test(item)) {
                  obj[this.sourceListMap[1]] = item
                  urlPre = false
                } else {
                  if (urlPre) {
                    obj[this.sourceListMap[0]] = obj[this.sourceListMap[0]] ? obj[this.sourceListMap[0]] + ' ' + item : item
                  } else {
                    if (!obj[this.sourceListMap[2]]) {
                      obj[this.sourceListMap[2]] = item
                    } else {
                      obj[this.sourceListMap[3]] = obj[this.sourceListMap[3]] ? obj[this.sourceListMap[3]] + ' ' + item : item
                    }
                  }
                }
              }
            })
            return obj
          })
        }
      })
    },
    setSource() {
      this.sourcePlanVisible = true
    },
    sourceSettingOk() {
      this.$refs['sourceSetting'].handleSet().then((res) => {
        if (res.code === 200) {
          this.$notification.success({ message: '节点软件源设置成功' })
          this.sourceSettingVisible = false
          this.getSource()
        }
      })
    },
  }
}
</script>

<style scoped>
.btn-box {
  margin-bottom: 15px;
}
.ant-btn {
  margin-right: 10px;
}
.input{
  width: 100%;
}
.filter-item{
  width: 100%;
}
</style>
