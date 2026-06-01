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
          placeholder="请输入 6 到 12 位密码"
          show-password
          validate-event
        />
      </el-form-item>
      <div class="demo-actions">
        <el-button type="primary" @click="submitForm">提交校验</el-button>
        <el-button type="info" @click="fillValidData">填入正确数据</el-button>
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
  email: '',
  password: ''
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

const statusText = ref('输入后移出焦点可触发单项校验，点击按钮可触发整表校验。')

const submitForm = async () => {
  try {
    await formRef.value?.validate()
    statusText.value = '校验通过，可以继续提交表单。'
  } catch {
    statusText.value = '校验未通过，请先修正标红字段。'
  }
}

const fillValidData = () => {
  form.email = 'tiny-element@example.com'
  form.password = '123456'
  statusText.value = '已填入一组合法数据，可以继续触发校验。'
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
  background: #fff7ed;
  border: 1px solid #fdba74;
  color: #9a3412;
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
