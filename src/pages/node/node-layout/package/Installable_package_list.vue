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