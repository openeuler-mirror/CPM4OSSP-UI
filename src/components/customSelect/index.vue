<template>
  <div @mousedown="setSelectOpen(true)">
    <Select v-model="selected" :open="selectOpen" :placeholder="selectPlaceholder" @blur="setSelectOpen(false)" @focus="setSelectOpen(true)" @change="selectChange">
      <a-icon slot="suffixIcon" type="reload" @click="refreshSelect" />
      <div slot="dropdownRender" slot-scope="menu">
        <div style="padding: 8px 8px; cursor: pointer; display: flex" @mousedown="(e) => e.preventDefault()">
          <a-input-search
            v-model="selectInput"
            enter-button="添加"
            :placeholder="inputPlaceholder"
            size="small"
            @search="onSearch"
            @blur="visibleInput(false)"
            @focus="visibleInput(true)"
            @click="(e) => e.target.focus()"
          >
            <a-tooltip slot="suffix">
              <template slot="title">
                <slot name="inputTips" />
              </template>
              <a-icon type="question-circle" theme="filled" />
            </a-tooltip>
          </a-input-search>
        </div>
        <a-divider style="margin: 4px 0" />
        <v-nodes :vnodes="menu" />
      </div>
      <a-select-option value="">{{ selectPlaceholder }}</a-select-option>
      <a-select-option v-for="item in optionList" :key="item">{{ item }} </a-select-option>
    </Select>
  </div>
</template>

<script>
import { Select } from 'ant-design-vue'
</script>