<template>
  <div>
    <div ref="filter" class="filter">
      <a-button :disabled="planList.length>100" type="primary" icon="plus" @click="addSource">新增</a-button>
    </div>
    <a-table
      :loading="loading"
      :data-source="planList"
      :columns="columns"
      bordered
      :row-key="(record, index) => index"
      :pagination="false"
      :scroll="{x:600}"
    >
      <a-tooltip slot="planName" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="annotation" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="option" slot-scope="record">
        <a-tooltip title="详情">
          <a-button type="link" @click="SourceDetail(record)"><a-icon type="file" /></a-button>
        </a-tooltip>
        <a-tooltip title="配置">
          <a-button type="link" @click="batchSet(record)"><a-icon type="setting" /></a-button>
        </a-tooltip>
        <a-tooltip title="编辑">
          <a-button type="link" @click="editSource(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
        <a-tooltip title="删除">
          <a-button type="link" @click="deleteSource(record.id)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <a-modal v-model="detailVisible" title="软件源模板详情" width="850px" :footer="null">
      <a-form-model
        v-model="selectPlan"
        :label-col="{span: 4}"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-model-item label="模板名">
          <a-input v-model="selectPlan.planName" width="150px" disabled />
        </a-form-model-item>
        <a-form-model-item label="注释">
          <a-input v-model="selectPlan.annotation" width="150px" disabled />
        </a-form-model-item>
        <a-form-model-item label="软件源列表详情">
          <a-table
            :columns="Sourcecolumns"
            :data-source="selectPlan.sourceList"
            bordered
            :row-key="(record, index) => index"
            :pagination="false"
            min-height="400px"
            max-height="400px"
            :scroll="{ y: 480 }"
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
              <span>{{ text }}</span>
            </a-tooltip>
          </a-table>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal
      v-model="editVisible"
      v-waiting="{ value: confirmLoading, text: addTitle }"
      :title="title"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      :destroy-on-close="true"
      width="850px"
      @ok="handleSubmit"
    >
      <a-form-model
        ref="planForm"
        :model="formData"
        :wrapper-col="{ span: 22 }"
        :label-col="{ span: 2 }"
        :rules="rules"
      >
        <a-form-model-item label="模板名" prop="planName">
          <a-input v-model="formData.planName" placeholder="请填写软件源模板名称" />
        </a-form-model-item>
        <a-form-model-item label="注释" prop="annotation">
          <a-input v-model="formData.annotation" placeholder="请填写注释信息" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{span: 22,offset: 2}">
          <source-setting
            ref="sourceSetting"
            :is-show-mode="false"
            :edit-source-list="selectPlan.sourceList"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-modal
      v-model="nodeSelectVisible"
      v-waiting="{ value: confirmLoading, text: '软件源配置下发中...' }"
      width="650px"
      title="节点选择"
      :destroy-on-close="true"
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      @ok="handleSetPlan"
    >
      <a-spin :spinning="loading" tip="配置中...">
        <node-select ref="nodeSelect" :plan-info="selectPlan" />
      </a-spin>
      <template slot="" />
    </a-modal>
  </div>
</template>

<script>
import NodeSelect from './node-select.vue'
export default {
  components: {
    NodeSelect
  },
}
</script>