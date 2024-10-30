<template>
  <div class="list-wrap">
    <a-list :data-source="list" :locale="{ emptyText: '配置源暂无该软件包' }">
      <a-list-item slot="renderItem" slot-scope="item" class="list-item" @click.stop="handleClick(item.Package)">
        <div class="top">
          <span class="Package"><span class="title">软件包名：</span>{{ item.Package }}</span>
        </div>
        <div class="bottom">
          <span class="Version"><span class="title">版本：</span>{{ item.Version }}</span>
          <span class="Architecture"><span class="title">架构:</span>{{ item.Architecture }}</span>
        </div>
        <div v-show="item.dependency" class="more">
          <span class="Version">
            <span class="title">关联软件包：</span>
            <span><a-tag v-for="dep in item.dependency" :key="dep" color="#108ee9">{{ dep }}</a-tag></span>
          </span>
        </div>
        <span v-show="!item.dependency&&!item.loading" @click.stop="loadMore(item)">点击查看关联软件包 <a-icon style="transform:rotate(90deg);" type="double-right" /></span>
        <span v-show="!item.dependency&&item.loading"><a-icon type="loading" /></span>
      </a-list-item>
      <p v-if="list.length" class="none">已经到底了</p>
    </a-list>
  </div>
</template>

<script>
import { queryDependency } from '@/api/node_package'
export default {
  props: {
    inputvalue: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: function() {
        return []
      }
    },
    nodeId: {
      type: String,
      default: ''
    }
  },
  watch: {
    inputvalue(val) {
      if (val) {
        // 回到顶部
        this.$nextTick(() => {
          document.querySelector('.list-wrap').scrollTop = 0
        })
      }
    }
  },
  methods: {
    handleClick(packageName) {
      this.$emit('handleInputValue', packageName)
    },
    loadMore(data) {
      this.$set(data, 'loading', true)
      queryDependency({ packageName: data.Package, nodeId: this.nodeId }).then(res => {
        if (res.code === 200) {
          if (res.data) {
            const result = []
            const dependency = res.data[data.Package]
            for (let dep of dependency) {
              for (let key in dep) {
                const value = dep[key]
                if (typeof value === 'object') {
                  for (let key1 in value) {
                    for (let item of value[key1]) {
                      result.push(key.replace('|', '') + '：' + item)
                    }
                  }
                } else {
                  result.push(key.replace('|', '') + '：' + value)
                }
              }
            }
            this.$set(data, 'dependency', result)
          } else {
            this.$set(data, 'dependency', {})
          }
        } else {
          this.$notification.error({ message: res.msg || '获取关联软件包失败' })
        }
      }).finally(() => {
        this.$delete(data, 'loading')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .list-wrap{
    position: absolute;
    width: 583px;
    min-height: 100px;
    max-height: 360px;
    overflow-y: auto;
    background: #fff;
    left:0px;
    // transform: translateX(-45%);
    z-index: 999;
    top: 28px;
    border-radius: 5px;
    border: 1px solid #c0c0c0;
    border-top: none;
    transition: all 2s;
    .none{
      color: rgba(0, 0, 0, 0.25);
      text-align: center;
      font-size: 14px;
      margin: 5px 0;
    }
    .list-item{
      font-family: 'Poppins,sans-serif';
      padding: 5px 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover{
        background: #E6F7FF;
        cursor: pointer;
      }
    }
    .ant-list-item{
      display: flex;
      flex-direction: column;
      &:last-child{
        border-bottom: 1px solid #e8e8e8;
      }
      .title{
        color: #000;
      }
      .top{
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .bottom{
        padding: 10px 0;
        width: 100%;
        height: 50%;
      }
      .more{
        width: 100%;
        display: flex;
        justify-content: space-between;
        > span{
          display: flex;
          > span:last-child{
            display: flex;
            flex-wrap: wrap;
            > span{
              display: inline-block;
              margin-bottom: 5px;
            }
          }
        }
      }
      > span{
        display: inline-block;
        width: 100%;
        text-align: center;
        font-size: 12px;
      }
    .Version{
      font-size: 12px;
    }
    .Architecture{
      font-size: 13px;
      float: right;
    }
    }
  }
</style>