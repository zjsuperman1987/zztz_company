/**
 * @author penny 2698324951@qq.com
 * @date 2020/11/19 14:06
 * @Description: v-dialogDrag 实现弹窗的拖拽
*/

import Vue from 'vue'

Vue.directive('dialogDrag', {
  bind(el, binding, vnode, oldVnode) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    dialogHeaderEl.style.cursor = 'move';

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);
    dialogHeaderEl.onmousedown = (e) => {

      // 鼠标按下，获取鼠标在盒子内的坐标
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;

      // 获取到的值带px 正则匹配替换
      let styL,styT;

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100);
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100);
      } else {
        styL = +sty.left.replace(/\px/g, '');
        styT = +sty.top.replace(/\px/g, '');
      }

      // 鼠标移动的时候，把鼠标在页面中的坐标，减去鼠标在盒子内的坐标就是模态框的left和top值
      document.onmousemove = function(e) {

        // 通过事件委托，计算移动的距离 （开始拖拽至结束拖拽的距离）
        const l = e.clientX - disX;
        const t = e.clientY - disY;

        let finallyL = l + styL;
        let finallyT = t + styT;

        // 边界值判定 注意clientWidth scrollWidth区别 要减去之前的top left值
        let limitL = (document.documentElement.clientWidth - dragDom.clientWidth) / 2;
        if (finallyL < -limitL) {
          finallyL = -limitL;
        } else if (finallyL > limitL) {
          finallyL = limitL;
        }
        let limitT = document.documentElement.clientHeight * 15 / 100;
        let limitB = document.documentElement.clientHeight - dragDom.clientHeight - limitT;
        if (finallyT < -limitT) {
          finallyT = -limitT;
        } else if (finallyT > limitB) {
          finallyT = limitB;
        }

        // 移动当前元素
        dragDom.style.left = `${finallyL}px`;
        dragDom.style.top = `${finallyT}px`;
      };

      document.onmouseup = function(e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }
});
