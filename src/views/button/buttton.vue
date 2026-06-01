<!-- 前端展示 -->
<script setup lang="ts">
  // 导入 TinyButton 组件
  import TinyButton from '@/components/Button/Button.vue'
  defineOptions({
    name: 'ButtonView'
  })
</script>
<style scoped>
.button-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.group h3 {
  width: 100%;
  margin: 0;
  font-size: 16px;
  color: #303133;
}
</style>
<template>
  <div class="button-page">
    <section class="group">
      <h3>基础按钮</h3>
      <tiny-button type="primary">Primary</tiny-button>
      <tiny-button type="success">Success</tiny-button>
      <tiny-button type="info">Info</tiny-button>
      <tiny-button type="warning">Warning</tiny-button>
      <tiny-button type="danger">Danger</tiny-button>
    </section>

    <section class="group">
      <h3>朴素按钮</h3>
      <tiny-button plain type="primary">Primary</tiny-button>
      <tiny-button plain type="success">Success</tiny-button>
      <tiny-button plain type="info">Info</tiny-button>
      <tiny-button plain type="warning">Warning</tiny-button>
      <tiny-button plain type="danger">Danger</tiny-button>
    </section>

    <section class="group">
      <h3>禁用状态</h3>
      <tiny-button disabled type="primary">Primary</tiny-button>
      <tiny-button disabled plain type="danger">Danger</tiny-button>
    </section>

    <section class="group">
      <h3>圆角和圆形</h3>
      <tiny-button round type="primary">Round</tiny-button>
      <tiny-button circle icon="search" type="success"></tiny-button>
    </section>

    <section class="group">
      <h3>加载状态</h3>
      <tiny-button loading type="primary">Loading</tiny-button>
      <tiny-button loading type="danger"></tiny-button>
    </section>

    <section class="group">
      <h3>按钮尺寸</h3>
      <tiny-button size="large" type="primary">Large</tiny-button>
      <tiny-button size="medium" type="primary">Medium</tiny-button>
      <tiny-button size="small" type="primary">Small</tiny-button>
    </section>
  </div>
</template>
