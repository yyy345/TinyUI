<template>
  <div class="demo-form">
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          show-clear
          validate-event
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          validate-event
        />
      </el-form-item>
      <div class="demo-actions">
        <el-button type="primary" @click="validateForm">先触发校验</el-button>
        <el-button type="info" @click="resetForm">重置字段</el-button>
        <el-button type="warning" @click="clearFormValidate">清空校验状态</el-button>
      </div>
    </el-form>

    <p class="demo-tip">{{ statusText }}</p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import ElForm from '@/components/Form/Form.vue'
import ElFormItem from '@/components/Form/FormItem.vue'
import ElInput from '@/components/Input/Input.vue'
import ElButton from '@/components/Button/Button.vue'

const formRef = ref<any>(null)

const form = reactive({
  email: 'demo@example.com',
  password: '123'
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 12, message: '密码长度需在 6 到 12 位之间', trigger: 'blur' }
  ]
}

const statusText = ref('可以先触发校验，再试试重置字段和清空校验状态的区别。')

const validateForm = async () => {
  try {
    await formRef.value?.validate()
    statusText.value = '当前表单已经通过校验。'
  } catch {
    statusText.value = '当前表单存在校验错误，适合继续试试重置和清空校验。'
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  statusText.value = '已恢复到组件挂载时的初始值，并且清除了校验状态。'
}

const clearFormValidate = () => {
  formRef.value?.clearValidate()
  statusText.value = '只清除了校验提示，当前输入值会被保留。'
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

.demo-tip {
  margin: 0 0 0 150px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  color: #1d4ed8;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .demo-actions,
  .demo-tip {
    margin-left: 0;
    padding-left: 0;
  }
}
</style>
