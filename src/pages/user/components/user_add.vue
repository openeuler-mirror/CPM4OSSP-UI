<template>
  <div>
    <a-form-model ref="editUserForm" :rules="rules" :model="temp" :label-col="{ span: 4}" :wrapper-col="{ span: 20 }">
      <a-form-model-item label="用户名称" prop="id">
        <a-input v-model="temp.id" placeholder="创建之后不能修改" :disabled="createOption == false" />
      </a-form-model-item>
      <a-form-model-item label="登录密码" prop="password">
        <a-input-password v-model="temp.password" placeholder="请输入登录密码" />
      </a-form-model-item>
      <a-form-model-item label="确认密码" prop="confirmPassword" class="mb0">
        <a-input-password v-model="temp.confirmPassword" placeholder="请输入确认密码" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>