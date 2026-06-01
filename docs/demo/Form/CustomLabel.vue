<template>
  <div class="demo-form">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="联系邮箱" prop="email" :show-message="false">
          <template #label="{ label }">
            <span class="demo-label">
              <span class="demo-label__text">{{ label }}</span>
              <el-icon
                icon="circle-info"
                class="demo-label__icon demo-label__icon--danger"
                title="当前项隐藏错误文案，仅保留错误态样式"
              />
            </span>
          </template>
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          show-clear
          validate-event
        />
      </el-form-item>

      <el-form-item label="项目名称" prop="projectName">
        <template #label="{ label }">
          <span class="demo-label">
            <span class="demo-label__text">{{ label }}</span>
            <el-icon
              icon="pen-to-square"
              class="demo-label__icon demo-label__icon--primary"
              title="当前项使用了 label 插槽来自定义标签内容"
            />
          </span>
        </template>
        <el-input
          v-model="form.projectName"
          placeholder="请输入项目名称"
          show-clear
          validate-event
        />
      </el-form-item>

      <div class="demo-actions">
        <el-button type="primary" @click="validateForm">触发校验</el-button>
        <el-button type="info" @click="clearFormValidate">清空校验</el-button>
      </div>
    </el-form>

    <p class="demo-tip">
      第一项通过 <code>show-message="false"</code> 隐藏了错误文案，但校验失败时仍然会保留错误态样式。
    </p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import ElForm from '@/components/Form/Form.vue'
import ElFormItem from '@/components/Form/FormItem.vue'
import ElInput from '@/components/Input/Input.vue'
import ElButton from '@/components/Button/Button.vue'
import ElIcon from '@/components/Icon/Icon.vue'

const formRef = ref<any>(null)

const form = reactive({
  email: '',
  projectName: ''
})

const rules = {
  email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' }
  ],
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ]
}

const validateForm = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    // Keep the demo quiet and let the UI show the result.
  }
}

const clearFormValidate = () => {
  formRef.value?.clearValidate()
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

.demo-label {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.demo-label__text {
  line-height: 32px;
}

.demo-label__icon {
  font-size: 13px;
  opacity: 0.9;
}

.demo-label__icon--danger {
  color: #e11d48;
}

.demo-label__icon--primary {
  color: #4f46e5;
}

.demo-tip {
  margin: 0 0 0 150px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 13px;
  line-height: 1.6;
}

.demo-tip code {
  padding: 2px 6px;
  border-radius: 6px;
  background: #e2e8f0;
}

@media (max-width: 720px) {
  .demo-actions,
  .demo-tip {
    margin-left: 0;
    padding-left: 0;
  }
}
</style>
