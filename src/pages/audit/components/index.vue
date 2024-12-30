<template>
  <a-list item-layout="horizontal" :data-source="detailData">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-list-item-meta :description="item.description">
        <h4 slot="title">{{ item.title }}</h4>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>

<script>
export	default	{
  props: {
    rowData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    detailData() {
      let data = [
        { title: '内容', description: this.rowData.content || '无' },
        { title: '备注', description: this.rowData.extra || '无' }
      ]
      return data
    }
  }
}
</script>

<style scoped>
.ant-list-item-meta {
  width: 100%;
}
.ant-list-item-meta-content {
  width: 100%;
}
.ant-list-item-meta-description {
  max-height: 200px;
  overflow-y: auto;
}
</style>
