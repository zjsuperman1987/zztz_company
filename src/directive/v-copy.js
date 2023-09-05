/**
 * @author penny 2698324951@qq.com
 * @date 2020/12/12 14:14
 * @Description: 自定义指令实现点击复制
 * bind，将自定义指令绑定到dom元素上,只调用一次，用这个钩子函数可以定义一个绑定时执行一次的初始化动作。
 * inserted，将虚拟的dom元素和指令添加到要绑定的元素上,被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)
 * update，在所在组件的 VNode 更新时调用
 * componentUpdated，数据更新后执行,指令所在组件的 VNode 及其子 VNode 全部更新后调用。
 * unbind，解绑自定义指令，会销毁vue实例
*/

import { Message } from 'element-ui'
import Vue from "vue"
import i18n from '@/lang'

Vue.directive('copy', {
  bind(el, binding) {
    el.binding = binding
    el.addEventListener('click', el.handler = ()=>{
      let binding = el.binding
      if (binding.value) {
        let input = document.createElement("input");
        input.value = binding.value;
        document.body.appendChild(input);
        input.select(); // 选择对象
        document.execCommand("Copy"); // 执行浏览器复制命令
        Message.success(i18n.t('$message.copy'))
        input.remove()
      }else {
        Message.warning(i18n.t('$message.noCopy'))
      }
    })
  },
  update(el,binding) {
    el.binding = binding
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener("click", el.handlel);
  }
})
