<template>
  <div>
    <a-table
      :row-selection="{ onChange: onSelectChange, selectedRowKeys: rowKeys }"
      :data-source="list"
      :columns="columns"
      :row-key="record => record.name"
      :loading="loading"
      ok-text="升级"
      :style="{ 'max-height': '600px', 'min-height': '250px' }"
      :scroll="{ y: 480 }"
      bordered
    />
  </div>
</template>