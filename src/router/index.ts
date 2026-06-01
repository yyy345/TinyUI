// 路由配置文件

import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    name: 'Index',
    // 路由懒加载
    component: () => import('../views/index.vue'),
    redirect: '/messagebox',
    children: [
      {
        // button组件的路由配置
        path: '/button',
        name: 'ElButton',
        component: () => import('../views/button/buttton.vue')
      },
      {
        path: '/tooltip',
        name: 'ElTooltip',
        component: () => import('../views/tooltip/tooltip.vue')
      },
      // {
      //   path: '/dropdown',
      //   name: 'ElDropdown',
      //   component: () => import('../views//dropdown/dropdown.vue')
      // },
      {
        path: '/rate',
        name: 'ElRate',
        component: () => import('../views/rate/rate.vue')
      },
      {
        path: '/message',
        name: 'ElMessage',
        component: () => import('../views/message/message.vue')
      },
      {
        path: '/input',
        name: 'ElInput',
        component: () => import('../views/input/input.vue')
      },
      // {
      //   path: '/datepicker',
      //   name: 'ElDatePicker',
      //   component: () => import('../views/datepicker/datepicker.vue')
      // },
      // {
      //   path: '/pagination',
      //   name: 'ElPagination',
      //   component: () => import('../views/pagination/pagination.vue')
      // },
      // {
      //   path: '/table',
      //   name: 'ElTable',
      //   component: () => import ('../views/table/table.vue')
      // },
      {
        path: '/switch',
        name: 'ElSwitch',
        component: () => import('../views/switch/switch.vue')
      },
      {
        path: '/dialog',
        name: 'ElDialog',
        component: () => import('../views/dialog/dialog.vue')
      },
      {
        path: '/select',
        name: 'ElSelect',
        component: () => import('../views/select/select.vue')
      },
      {
        path: '/form',
        name: 'ElForm',
        component: () => import('../views/form/form.vue')
      },
      {
        path: '/messagebox',
        name: 'ElMessageBox',
        component: () => import('../views/messagebox/messagebox.vue')
      }
    ]
  }
]

const router = createRouter({
  // 使用历史模式
  history: createWebHashHistory(),
  routes
})

// 默认导出
export default router