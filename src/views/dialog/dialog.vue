<template>
  <div class="dialog-view">
    <el-button type="primary" @click="showDialog">Show Dialog</el-button>

    <DraggableDialog
      v-model="dialogVisible"
      title="Workspace Dialog"
      draggable
      width="480px"
      @confirm="confirmDialog"
    >
      <div class="dialog-view__body">
        <p>This is the content of the dialog.</p>
        <p>You can drag the header area to reposition it.</p>
      </div>

      <template #footer="{ close, confirm }">
        <el-button type="info" @click="close()">Cancel</el-button>
        <el-button type="primary" @click="confirm()">Confirm</el-button>
      </template>
    </DraggableDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElButton from '../../components/Button/Button.vue'
import DraggableDialog from '../../components/Dialog/Dialog.vue'

defineOptions({
  name: 'DialogView'
})

const dialogVisible = ref(false)

const showDialog = () => {
  dialogVisible.value = true
}

const confirmDialog = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.dialog-view__body {
  display: grid;
  gap: 12px;
}

.dialog-view__body p {
  margin: 0;
  line-height: 1.7;
}
</style>
