<template>
  <div class="demo-rich-text-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="文章内容" prop="content">
        <el-rich-text-editor
          v-model="form.content"
          placeholder="请输入文章内容"
          :min-height="140"
        />
      </el-form-item>

      <div class="demo-actions">
        <el-button type="primary" @click="submitForm">提交校验</el-button>
        <el-button type="info" @click="resetForm">重置</el-button>
      </div>
    </el-form>

    <p class="demo-tip">{{ statusText }}</p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import ElForm from '@/components/Form/Form.vue'
import ElFormItem from '@/components/Form/FormItem.vue'
import ElRichTextEditor from '@/components/RichTextEditor/RichTextEditor.vue'
import ElButton from '@/components/Button/Button.vue'

const formRef = ref<any>()

const form = reactive({
  content: ''
})

const rules = {
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

const statusText = ref('富文本编辑器会像 Input 一样注入 FormItem，并在失焦时触发表单校验。')

const submitForm = async () => {
  try {
    await formRef.value?.validate()
    statusText.value = '校验通过，可以提交富文本内容。'
  } catch {
    statusText.value = '校验未通过，请先补充文章内容。'
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  statusText.value = '内容已恢复到初始值，并清除了校验状态。'
}
</script>

<style scoped>
.demo-rich-text-form {
  display: grid;
  gap: 16px;
}

.demo-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-left: 90px;
}

.demo-tip {
  margin: 0 0 0 90px;
  padding: 12px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
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
