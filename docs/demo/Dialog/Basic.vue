<template>
  <div class="dialog-demo">
    <el-button type="primary" @click="visible = true">Open Dialog</el-button>

    <el-dialog v-model="visible" title="Project Notice" width="520px">
      <div class="dialog-demo__body">
        <p>Dialog 更适合承载复杂内容，比如表单、步骤提示或配置确认。</p>
        <p>它是声明式组件，通常由父组件通过 `v-model` 进行控制。</p>
      </div>

      <template #footer="{ close }">
        <el-button type="info" @click="close()">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm(close)">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElButton from '@/components/Button/Button.vue'
import ElDialog from '@/components/Dialog/Dialog.vue'

const visible = ref(false)

const handleConfirm = (close: () => void) => {
  close()
}
</script>

<style scoped>
.dialog-demo__body {
  display: grid;
  gap: 12px;
  line-height: 1.7;
}

.dialog-demo__body p {
  margin: 0;
}
</style>
