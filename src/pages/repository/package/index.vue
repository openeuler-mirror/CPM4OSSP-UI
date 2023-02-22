<template>
  <div ref="package" class="package">
    <div ref="filter" class="filter">
      <a-select
        v-model="planName"
        placeholder="请选择软件源模板"
        class="filter-item"
        :disabled="loading"
        @dropdownVisibleChange="getPlanList"
        @change="freshenList"
      >
        <a-select-option v-for="item in planList" :key="item.planName">
          {{ item.planName }}
        </a-select-option>
      </a-select>
      <a-select
        v-model="classification"
        class="filter-item"
        :disabled="loading"
        @change="changeClassification"
      >
        <a-select-option v-for="item in classificationList" :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-input v-model="packageName" class="width-300 mr-10" placeholder="请输入软件包名,按回车(Enter)查找" allow-clear @pressEnter="changeClassification" @change="changePackage" />
      <a-button type="primary" :disabled="selectedRows.length===0" @click="batchEditPakClass">批量修改软件包类别</a-button>
    </div>
    <a-table
      bordered
      :loading="loading"
      :data-source="packageList"
      :columns="columns"
      :row-key="(record, index) => record.id"
      :pagination="pagination"
      :scroll="{x:900,y:tableHeight-50}"
      :row-selection="rowSelection"
      @change="onShowSizeChange"
    >
      <a-tooltip slot="package" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="version" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="architecture" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="classification" slot-scope="text">
        <a-tag v-if="text === 'necessary'" class="danger">必要</a-tag>
        <a-tag v-if="text === 'important'" class="warning">重要</a-tag>
        <a-tag v-if="text === 'normal'" class="info">普通</a-tag>
      </template>
      <template slot="option" slot-scope="text, record">
        <a-tooltip title="编辑">
          <a-button type="link" :disabled="record.classification === 'necessary'" @click="editPakClass(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <a-modal
      v-model="editVisible"
      :title="(isBatchEdit?'批量':'')+'修改软件包类别'"
      :destroy-on-close="true"
      width="700px"
      @ok="handleEditClass"
    >
      <a-form-model :wrapper-col="{ span: 20 }" :label-col="{ span: 4 }">
        <a-form-model-item v-if="!isBatchEdit" label="软件包名">
          <a-input v-model="selectRow.package" :disabled="true" />
        </a-form-model-item>
        <a-form-model-item label="类别">
          <a-select v-model="pkgClass" placeholder="请选择软件包类别">
            <a-select-option
              v-for="item in selectClassList"
              :key="item.value"
              :disabled="!isBatchEdit&&item.value === selectRow.classification"
            >{{ item.label }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableHeight: 0,
      columns: [
        { title: '软件包名', dataIndex: 'package', ellipsis: true, scopedSlots: { customRender: 'package' }},
        { title: '软件包版本', dataIndex: 'version', ellipsis: true, width: 200, scopedSlots: { customRender: 'version' }},
        { title: '体系架构', dataIndex: 'architecture', ellipsis: true, width: 150, scopedSlots: { customRender: 'architecture' }},
        { title: '软件包类别', dataIndex: 'classification', ellipsis: true, width: 150, scopedSlots: { customRender: 'classification' }},
        { title: '操作', width: 100, scopedSlots: { customRender: 'option' }, align: 'center' }
      ],
      planList: [],
      planName: null,
      packageName: '',
      packageList: [],
      listQuery: {
        page: 1,
        limit: 10
      },
      total: 0,
      loading: false,
      rowKeys: [],
      selectList: [],
      editVisible: false,
      classification: 'all',
      classificationList: [
        { label: '全部', value: 'all' },
        { label: '必要', value: 'necessary' },
        { label: '重要', value: 'important' },
        { label: '普通', value: 'normal' }
      ],
      selectClassList: [
        { label: '重要', value: 'important' },
        { label: '普通', value: 'normal' }
      ],
      selectRow: {},
      pkgClass: '',
      selectedRowKeys: [],
      selectedRows: [],
      isBatchEdit: true
    }
  }
}
</script>