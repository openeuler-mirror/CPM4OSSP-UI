<script>
export default {
  name: 'DraggabledTable',
  render() {
    const { $slots, $scopedSlots, $attrs, $props, $listeners } = this
    const props = { ...$attrs, ...$props }
    const resizeableTitle = {
      header: {
        cell(h, props, children) {
          const { key, ...restProps } = props
          const col = $attrs.columns.find((col) => {
            const k = col.dataIndex || col.key
            return k === key
          })
          if (!col?.width) {
            return <th {...restProps}>{children}</th>
          }
          const onDrag = (x) => {
            col.width = Math.max(x, 50)
          }
          return (
            <th {...restProps} width={col.width} class='resize-table-th'>
              {children}
              <vue-draggable-resizable
                style={{ transform: `translate(${col.width}px, 0px)` }}
                key={col.key}
                class='table-draggable-handle'
                w={10}
                x={col.width}
                z={1}
                axis='x'
                draggable={true}
                resizable={false}
                onDragging={onDrag}
              />
            </th>
          )
        }
      }
    }
    return <a-table
      props={props}
      scopedSlots={ $scopedSlots }
      on={$listeners}
      components={resizeableTitle}
    >
      {Object.keys($slots).map(slot => <template slot={slot}>{ $slots[slot] }</template>)}
    </a-table>
  }
}
</script>

<style lang="scss" scoped>
::v-deep .resize-table-th {
  position: relative;
  .table-draggable-handle {
    height: 100% !important;
    bottom: 0;
    left: -10px !important;
    cursor: col-resize;
    touch-action: none;
    position: absolute;
    border: 1px solid red;
  }
}
</style>