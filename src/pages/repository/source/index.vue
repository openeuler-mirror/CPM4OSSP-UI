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
  </div>
</template>