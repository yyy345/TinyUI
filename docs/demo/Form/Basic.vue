<template>
  <div class="demo-form">
    <el-form :model="form">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          show-clear
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          show-clear
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <div class="demo-actions">
        <el-button type="primary" @click="fillMockData">填充示例数据</el-button>
        <el-button type="info" @click="clearFormData">清空当前数据</el-button>
      </div>
    </el-form>

    <div class="demo-preview">
      <p class="demo-preview__title">当前表单数据</p>
      <pre>{{ JSON.stringify(form, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import ElForm from '@/components/Form/Form.vue'
import ElFormItem from '@/components/Form/FormItem.vue'
import ElInput from '@/components/Input/Input.vue'
import ElButton from '@/components/Button/Button.vue'

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const fillMockData = () => {
  form.username = 'tiny-element'
  form.email = 'tiny-element@example.com'
  form.password = '123456'
}

const clearFormData = () => {
  form.username = ''
  form.email = ''
  form.password = ''
}
</script>

<style scoped>
.demo-form {
  display: grid;
  gap: 16px;
}

.demo-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-left: 150px;
}

.demo-preview {
  margin-left: 150px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f7f8fa;
  border: 1px solid #e5e7eb;
}

.demo-preview__title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #6b7280;
}

.demo-preview pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 720px) {
  .demo-actions,
  .demo-preview {
    margin-left: 0;
    padding-left: 0;
  }
}
</style>
