<script>
export default {
  name: 'CustomTable',
  props: {
    dataSource: {
      type: Array,
      default() {
        return []
      }
    },
    scrollX: {
      type: Number,
      default: 500
    },
    pagination: {
      type: [Boolean, Object],
      default() {
        return {
          current: 1,
          size: 10,
          total: 0
        }
      }
    }
  },
  data() {
    return {
      tableHeight: 0,
      toTimer: null,
      ivTimer: null
    }
  },
  watch: {
    dataSource: {
      handler(val) {
        // 表格数据改变滚动条过渡回到顶部
        if (this.ivTimer != null) {
          clearInterval(this.ivTimer)
          this.ivTimer == null
        }
        const tbody = document.querySelector('.ant-table-body')
        let top = tbody.scrollTop || 0
        this.ivTimer = setInterval(() => {
          top -= 30
          if (top < 0) {
            top = 0
            clearInterval(this.ivTimer)
            this.ivTimer = null
          }
          tbody.scrollTo(0, top)
        }, 10)
      },
      deep: true
    }
  },
  mounted() {
    // 初次获取表格高度
    this.getTableHeight()
    // 窗口改变获取表格高度
    window.addEventListener('resize', this.getTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getTableHeight)
  },
  methods: {
    getTableHeight() {
      // 节流
      if (this.toTimer != null) return
      this.toTimer = setTimeout(() => {
        const { filter, tableWrap, pagination } = this.$refs
        this.tableHeight = tableWrap.clientHeight - (filter?.clientHeight + 11 || 0) - (pagination?.clientHeight || 0)
        this.toTimer = null
      }, 100)
    },
    // 页码及每页条数改变
    pageChange(current, size) {
      const pagination = { ...this.pagination, current, size }
      // 修改父组件分页对象
      this.$emit('on-pagination', pagination)
    }
  },
  render() {
    const { $slots, $scopedSlots, $attrs, $props, $listeners } = this
    const props = { ...$attrs, ...$props }
    delete props.pagination
    return (
      <div ref='tableWrap' class='table-wrap'>
        {/* 搜索 */}
        {$slots.filter && <div ref='filter' class='filter'>{this.$slots.filter}</div>}
        {/* 表格 */}
        <div class='table'>
          <a-table
            ref='table'
            bordered
            rowKey={(record, index) => index}
            props={props}
            pagination={false}
            style={{ height: this.tableHeight + 'px' }}
            scroll={{ x: this.scrollX, y: this.tableHeight - 55 }}
            scopedSlots={$scopedSlots}
            on={$listeners}
          />
        </div>
        {/* 分页 */}
        {
          this.pagination && <div ref='pagination' class='pagination'>
            <a-pagination
              current={this.pagination.current}
              pageSize={this.pagination.size}
              pageSizeOptions={['10', '20', '30', '50']}
              total={this.pagination.total}
              showTotal={(total) => `共${total}条`}
              showSizeChanger={true}
              onChange={this.pageChange}
              onShowSizeChange={this.pageChange}
            />
          </div>
        }
      </div>
    )
  }
}
</script>

<style lang="scss" scoped>
.table-wrap{
    width: 100%;
    height: 100%;
    .filter{
        > span{
            display: inline-block;
        }
    }
    .pagination{
        padding-top: 10px;
        .ant-pagination{
            display: flex;
            justify-content: flex-end;
        }
    }
}
</style>
