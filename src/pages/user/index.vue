<template>
  <div class="user">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button>
    </div>
    <a-table
      :data-source="list"
      :loading="loading"
      :columns="columns"
      :style="{'max-height': tableHeight + 'px' }"
      :scroll="{x: 1000, y: tableHeight - 60}"
      :pagination="false"
      bordered
      :row-key="(record, index) => index"
    >
      <a-tooltip slot="id" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="编辑">
          <a-button type="link" @click="handleEdit(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
        <a-tooltip title="删除">
          <a-button type="link" @click="handleDelete(record)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
        <a-tooltip title="解锁">
          <a-button type="link" :disabled="record.pwdErrorCount === 0" @click="handleUnlock(record)"><a-icon type="unlock" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
  </div>
</template>