<template>
  <div 
  class="el-select"
  :class="{'is-disabled': disabled }"
  @click="toggleDropdownShow"
  @mouseenter="states.mouseHover = true"
  @mouseleave="states.mouseHover = false"
  >
    <el-tooltip
    placement="bottom-start"
    manual
    ref="tooltipRef"
    :popper-options="popperOptions"
    @click-outside="changeDropdownShow(false)"
    > 
      <!-- 筛选框 -->
      <el-input
      ref="inputRef"
      v-model="states.inputValue"
      :disabled="disabled"
      :placeholder="filteredPlaceholder"
      :readonly="!filterable"
      @input="debounceOnFilter"
      >
        <template #suffix>
          <el-icon 
          class="el-input-clear" 
          v-if="showClearIcon" 
          icon="circle-xmark"
          @click.stop="onClear"
          >

          </el-icon>
          <el-icon v-else icon="angle-down" class="el-select-icon"
          :class="{
            'is-active': isDropdownShow
          }"
          ></el-icon>
        </template>
      </el-input>
      <!--  选项 -->
      <template #content>
        <!-- loading -->
        <div class="el-select-loading" v-if="states.loading">

        </div>
        <!-- No Data -->
        <div class="el-select-nodata" v-if="filterable && filterOptions.length === 0">

        </div>
        <ul class="el-select-menu" v-else>
          <template v-for="(option, index) in filterOptions" :key="index">
            <li
            class="el-select-menu-item"
            :class="{'is-disabled': option.disabled, 
            'is-selected': states.selectOption?.value === option.value}"
            :id="`el-select-menu-item-${option.value}`"
            @click.stop="itemSelect(option)"
            > 
              <RenderVnode :vNode="renderLabel ? renderLabel(option) : option.label"/>
            </li> 
          </template>
        </ul>
      </template>
    </el-tooltip>
  </div>
</template>
<script lang="ts" setup>
  import type { SelectProps, SelectEmits, SelectOptions, SelectStates, SelectValue } from './types'
  import ElInput from '../Input/Input.vue'
  import ElTooltip from '../Tooltip/Tooltip.vue'
  import type { TooltipInstance } from '../Tooltip/types'
  import { ref, reactive, computed, watch } from 'vue'
  import type{ Ref } from 'vue'
  // import { offset } from '@popperjs/core'
  import ElIcon from '../Icon/Icon.vue'
  import RenderVnode from '../Common/RenderVnode'
  import { isFunction, debounce } from 'lodash-es'
  defineOptions({
    name: 'ElSelect'
  })
  // 获取props
  const props = withDefaults(defineProps<SelectProps>(), {
    clearable: false,
    // 设置数组默认值
    options: () => []
  })
  const emits = defineEmits<SelectEmits>()

  // 
  const timeout = computed((() => props.remote ? 300 : 0))
  
  // 查找对应的option
  const findOption = (value: SelectValue | '') => {
    const option = props.options.find(option => option.value === value)
    return option ? option : null
  }
  const initialOption = findOption(props.modelValue)
  // const inputValue = ref(initialOption ? initialOption.label : '')

  // 内部状态
  const states = reactive<SelectStates>( {
    inputValue: initialOption ? initialOption.label : '',
    selectOption: initialOption,
    mouseHover: false,
    loading: false
  })
  // 获取tooltip真实元素
  const tooltipRef = ref() as Ref<TooltipInstance>
  // 给 Tooltip 里的 Popper 配置定位规则。
  const popperOptions: any = {
    modifiers: [
      {
        // 下拉面板和输入框之间的间隔
        name: 'offset',
        options: {
          offset: [0, 9],
        },
      },
      {
        // 让下拉面板宽度等于输入框宽度
        name: "sameWidth",
        enabled: true,
        fn: ({ state }: { state: any }) => {
            state.styles.popper.width = `${state.rects.reference.width}px`;
        },
        phase: "beforeWrite",
        requires: ["computeStyles"],
      }
    ],
  }

  // 展示的选项列表
  const filterOptions = ref(props.options)
  // 监视传入的options列表，同步更新
  watch(() => props.options, (newOptions) => {
    filterOptions.value = newOptions
  })

  // 过滤核心
  const generateFilterOptions = async (searchValue: string) => {
    if (!props.filterable) return
    if (props.filterMethod && isFunction(props.filterMethod)) {
      filterOptions.value = props.filterMethod(searchValue)
    } else if(props.remote && props.remoteMethod && isFunction(props.remoteMethod)) {
      states.loading = true
      try {
        // 远程请求支持防抖
        filterOptions.value = await props.remoteMethod(searchValue)
      } catch(e) {
        console.error(e)
        filterOptions.value = []
      } finally {
        states.loading = false
      }
    }
    else { // 默认过滤规则
      filterOptions.value = props.options.filter(option => option.label.includes(searchValue))
    }
  }
  // 获取输入来进行过滤
  const onFilter = () => {
    generateFilterOptions(states.inputValue)
  }
  // 防抖：在连续触发的情况下，只在最后一次触发后的 timeout.value 毫秒内不再有新的触发时，才执行一次 onFilter()
  const debounceOnFilter = debounce(() => {
    onFilter()
  }, timeout.value)

  // 下拉状态显示
  const isDropdownShow = ref(false)
  const inputRef = ref()
  // 打开和关闭核心
  const changeDropdownShow = (show: boolean) => {
    if (show) {
      // 如果是filter并且之前有值
      if (props.filterable && states.selectOption) {
        states.inputValue = ''
      }
      if (props.filterable) {
        // 默认选项的生成
        generateFilterOptions(states.inputValue)
      }
      tooltipRef.value.show()
    } else {
      tooltipRef.value.hide()
      if (props.clearable) {
        states.inputValue = states.selectOption ? states.selectOption.label : ''
      }
    }
    isDropdownShow.value = show
    emits('visible-change', show)
  }
  // 设置禁用
  const toggleDropdownShow = () => {
    if (props.disabled) return
    if (isDropdownShow.value) {
      changeDropdownShow(false)
    } else {
      changeDropdownShow(true)
    }
  }
  // 选择选项
  const itemSelect = (e: SelectOptions) => {
    if (e.disabled) return
    // inputValue.value = e.label
    states.inputValue = e.label
    states.selectOption = e
    emits('change', e.value)
    emits('update:modelValue', e.value)
    changeDropdownShow(false)
    // inputRef.value.ref.focus()
  }

  // 清空图标显示
  const showClearIcon = computed(() => {
    // hover clearable inputValue 
    return props.clearable && states.mouseHover && states.selectOption && states.inputValue.trim() !== ''
  })

  // 如果是可搜索模式，并且有选中项，且下拉打开显示当前选中项 label
  const filteredPlaceholder = computed(() => {
    if (props.filterable && states.selectOption && isDropdownShow.value) {
      return states.selectOption.label
    } else {
      return props.placeholder
    }
  })
  const onClear = () => {
    states.inputValue = ''
    states.selectOption = null
    emits('clear')
    emits('change', '')
    emits('update:modelValue', '')
  }
</script>