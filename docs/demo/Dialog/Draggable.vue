<template>
  <div class="dialog-demo">
    <el-button type="success" @click="visible = true">Open Draggable Dialog</el-button>

    <el-dialog
      v-model="visible"
      title="Draggable Workspace"
      width="560px"
      draggable
      top="10vh"
    >
      <div class="dialog-demo__card">
        <h4>Drag the header area</h4>
        <p>这个示例用来展示 draggable 在当前组件中的实现效果。</p>
      </div>

      <template #footer="{ close, confirm }">
        <el-button type="info" @click="close()">Close</el-button>
        <el-button type="primary" @click="handleSave(confirm, close)">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElButton from '@/components/Button/Button.vue'
import ElDialog from '@/components/Dialog/Dialog.vue'

const visible = ref(false)

const handleSave = (confirm: () => void, close: () => void) => {
  confirm()
  close()
}
</script>

<style scoped>
.dialog-demo__card {
  padding: 16px 18px;
  border: 1px solid #ebeef5;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.dialog-demo__card h4 {
  margin: 0 0 10px;
  color: #1f2d3d;
}

.dialog-demo__card p {
  margin: 0;
  line-height: 1.7;
  color: #5c6b77;
}
</style>
