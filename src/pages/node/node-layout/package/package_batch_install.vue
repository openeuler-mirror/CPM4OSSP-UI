<template>
  <div ref="package" class="package">
    <div ref="filter" class="filter">
      <a-input-search
        v-model="keyWord"
        class="width-150 mr-10"
        allow-clear
        placeholder="请输入软件包名"
        @search="filterData"
        @pressEnter="filterData"
      />
      软件包类型：
      <a-select v-model="classification" class="width-100 mr-10" @change="classificationChange">
        <a-select-option v-for="item in classificationList" :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-popover placement="bottom" :overlay-style="{width:'720px'}">
        <template slot="content">
          期望状态：未知(u)/安装(i)/删除(r)/清除(p)/保持(h)<br>
          状态：未安装(n)/已安装(i)/仅存配置(c)/仅解压缩(U)/配置失败(F)/不完全安装(H)/触发器等待(W)/触发器未决(T)<br>
          示例：ii表示软件包期望状态为安装并且安装成功
        </template>
        <a-icon type="exclamation-circle" class="warning help-icon" />
        软件包状态：
      </a-popover>
      <a-select v-model="onlyInstalled" class="width-100 mr-10" @change="loadData">
        <a-select-option v-for="item in packageStatus" :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-button type="primary" icon="tool" @click="batchInstall">软件包安装</a-button>
      <a-badge :count="upgradeNum" :title="'可升级软件数'+upgradeNum">
        <a-button class="task-list-btn" type="primary" icon="rise" @click="updatePackageVisible = true">软件包升级</a-button>
      </a-badge>
      <a-button class="ml-15" type="danger" :disabled="BtnIsDisabled" icon="delete" @click="batchDelete">批量卸载</a-button>
      <a-badge :count="taskNumNot"><a-button class="task-list-btn" type="primary" icon="file-text" @click="showTaskList">任务列表</a-button></a-badge>
      <lock-status class="ml-15" :node-id="node.id" />
      <a-button type="primary" icon="sync" @click="freshenList">刷新</a-button>
    </div>
  </div>
</template>


<style scoped lang="scss">
.package{
  height: 100%;
}
.filter {
  margin-bottom: 15px;
}
.ant-btn {
  margin-right: 10px;
}
.ant-btn.task-list-btn{
  margin-right: 0;
}
</style>