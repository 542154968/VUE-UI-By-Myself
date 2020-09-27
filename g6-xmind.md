index.vue
```vue
<template>
  <div class="page-line-chart">
    <ul class="btn-group">
      <li>
        <el-button @click="handleCancel" :disabled="preBtnDisabled"
          >上一步</el-button
        >
      </li>
      <li>
        <el-button @click="handleDeCancel" :disabled="nextBtnDisabled"
          >下一步</el-button
        >
      </li>
      <li>
        <el-button @click="insertBrother">插入同级</el-button>
      </li>
      <li>
        <el-button @click="insertChild">插入下级</el-button>
      </li>
      <li>
        <el-button @click="insertBefore">插入上级</el-button>
      </li>
      <li>
        <el-button @click="clearAll(true)">清空</el-button>
      </li>
    </ul>
    <div class="line-chart">
      <div
        id="mountNode"
        ref="contain"
        tabindex="1"
        @keydown="handlekeyDown"
        style="width: 100%; height: 100%"
        @click="handleClick"
        @dblclick="handleDblClick"
        @contextmenu.prevent="handleContextmenu"
        @input="handleInput"
        @keyup="handleKeyUp"
      ></div>
    </div>
    <transition name="el-fade-in">
      <Contextmenu
        v-show="contextmenuVisible"
        :left="contextmenuLeft"
        :top="contextmenuTop"
        @menuSelected="handleMenuSelected"
      ></Contextmenu>
    </transition>
    <transition name="el-fade-in">
      <List
        v-loading="diseaseListLoadingStatus"
        :dataList="diseaseList"
        v-show="listVisible"
        :left="listLeft"
        :top="listTop"
        @loadMore="handleDiseaseLoadMore"
        @selected="handleSelectDisease"
      ></List>
    </transition>
  </div>
</template>

<script>
import G6 from '@antv/g6';
import { onMounted, watch } from '@vue/composition-api';
import Contextmenu from './Contextmenu';
import useContextmenu from './useContextmenu';
import useList from './useList';
import List from './List';
import useCacheStack from './useCacheStack';
import { debounce, getUuid } from '@libs/utils';
import { getDetail } from '@services/diseaseUpperLower';
import { Message } from 'element-ui';
import useCopyData from './useCopyData';

export default {
  props: {
    id: {
      default() {
        return null;
      },
      type: String
    },
    eventType: {
      type: String,
      default: ''
    },
    typeId: {
      default: '',
      type: String
    }
  },
  components: {
    Contextmenu,
    List
  },
  setup(props, { refs, emit, root }) {
    let graph = null;
    // 当前点击的node节点
    let activeId = null;
    let isEdit = false;
    let data = {
      id: getUuid(),
      label: '',
      diseaseId: '',
      parentId: '0',
      children: [],
      isRoot: true
    };
    const { copyData, pasteData } = useCopyData();
    const {
      handleShowList,
      listLeft,
      listTop,
      listVisible,
      diseaseList,
      diseaseListLoadingStatus,
      handleDiseaseLoadMore,
      handleLoadData
    } = useList(props, {
      refs
    });
    const {
      handleContextmenu,
      contextmenuLeft,
      contextmenuTop,
      contextmenuVisible
    } = useContextmenu(setActiveId, { listVisible });
    const {
      cacheData,
      handleCancel,
      handleDeCancel,
      preBtnDisabled,
      nextBtnDisabled,
      formatData,
      clearStack
    } = useCacheStack(
      () => {
        return graph;
      },
      () => {
        activeId = null;
      }
    );

    // 键盘快捷操作
    const key2Event = {
      Backspace: deleteNode,
      Enter: insertBrother,
      Tab: insertChild,
      'ctrl-z': handleCancel,
      'ctrl-y': handleDeCancel,
      'ctrl-c': handleCopyNode,
      'ctrl-v': handlePasteNode
    };

    watch(
      () => props.id,
      next => {
        emit('idChanged');
        // emit('changeSaveBtnDisabled', true);
        clearStack();
        root.$nextTick(() => {
          !graph && initTree();
          resetData();
          next && loadDetail(next);
        });
      },
      {
        immediate: true
      }
    );

    /**
     * 编辑复制加载数据
     */
    function loadDetail(id) {
      getDetail(id).then(res => {
        data = props.eventType === 'copy' ? formatCopyData(res) : res;
        data.isRoot = true;
        graph.changeData(data);
        graph.render();
        graph.fitCenter();
      });
    }

    /**
     * 格式化复制的data 重设里面的id数据
     */
    function formatCopyData(res) {
      const cloneData = Object.assign({}, res);
      deepCopyData(cloneData, '0');
      return cloneData;
    }

    /**
     * 格式化复制功能的数据
     */
    function deepCopyData(data, parentId) {
      if (Array.isArray(data)) {
        data.forEach(v => {
          const uuid = getUuid();
          v.id = uuid;
          v.parentId = parentId;
          Array.isArray(v.children) && deepCopyData(v.children, uuid);
        });
      } else {
        const uuid = getUuid();
        data.id = uuid;
        data.parentId = parentId;
        Array.isArray(data.children) && deepCopyData(data.children, uuid);
      }
    }

    /**
     * 初始化自定义node
     */
    G6.registerNode('dom-node', {
      setState(name, value, item) {
        const group = item.getContainer();
        const shape = group.get('children')[0]; // 顺序根据 draw 时确定
        shape.attrs[name] = value;
      },
      draw: (cfg, group) => {
        // 数据的id 是diseaseId
        // 位置id是id 位置id不需要变 只变数据id
        return group.addShape('dom', {
          attrs: {
            x: 0,
            y: 0,
            width: 80,
            height: 40,
            active: cfg.active || false,
            disabled: cfg.disabled || true,
            diseaseId: cfg.diseaseId || null,
            // dataParentId: cfg.parentId || null,
            html() {
              return `<input type='text' class="${
                this.attrs.active ? 'active' : ''
              } ${cfg.isRoot ? 'root' : ''}" ${
                this.attrs.disabled ? 'disabled' : ''
              } data-id=${cfg.id} value='${cfg.label}' title="${cfg.label}" />`;
            },
            name: 'input-shape'
          }
        });
      }
    });

    /**
     * 初始化tree
     */
    function initTree() {
      const $contain = refs.contain;
      graph = new G6.TreeGraph({
        container: 'mountNode', // String | HTMLElement，必须，在 Step 1 中创建的容器 id 或容器本身
        width: $contain.scrollWidth, // Number，必须，图的宽度
        height: $contain.scrollHeight, // Number，必须，图的高度
        renderer: 'svg',
        modes: {
          default: [
            {
              type: 'collapse-expand',
              onChange: function onChange(item, collapsed) {
                const data = item.get('model').data;
                data.collapsed = collapsed;
                return true;
              }
            },
            'drag-canvas',
            'zoom-canvas'
          ]
        },
        // 定义布局
        layout: {
          type: 'compactBox',
          direction: 'LR',
          getHeight: () => {
            return 40;
          },
          getWidth: () => {
            return 80;
          }
        },
        defaultNode: {
          type: 'dom-node',
          // size: [120, 40],
          anchorPoints: [
            [0, 0.3],
            [1, 0.3]
          ],
          style: {
            fill: '#cee3fc',
            stroke: '#C6E5FF'
          }
        },
        defaultEdge: {
          type: 'cubic-horizontal',
          style: {
            stroke: '#5c94f7'
          }
        }
      });
      // graph.data(data); // 读取 Step 2 中的数据源到图上
      // graph.render(); // 渲染图
      // graph.fitView();
      // graph.zoomTo(0.5);
      // cacheData(data);
      // graph.focusItem(data.id);
      // 保证在drag和缩放的过程中 active显示的一直保持高亮
      graph.off('wheelzoom', onChartdragAndZoom);
      // graph.off("canvas:drag", onChartdragAndZoom);
      graph.off('canvas:drag', onChartdragAndZoom);
      graph.on('wheelzoom', onChartdragAndZoom);
      // graph.on("canvas:drag", onChartdragAndZoom);
      graph.on('canvas:drag', onChartdragAndZoom);
    }

    /**
     * 当重新发生渲染的时候 初始化这些状态值
     */
    function onChartdragAndZoom() {
      isEdit = false;
      contextmenuVisible.value = false;
      listVisible.value = false;
      disabledAllNode();
    }

    /**
     * 设置所有的节点disabled状态
     */
    function disabledAllNode() {
      graph.findAll('node', node => {
        const nodeId = node._cfg.id;
        graph.setItemState(nodeId, 'disabled', true);
      });
    }

    /**
     * 双击编辑
     */
    function handleDblClick(event) {
      const $input = event.target;
      if ($input.nodeName === 'INPUT') {
        const id = $input.dataset.id;
        setActiveId(id);
        // 先全部设为true  再将目标设为false
        // 不然会都是true  很怪异
        disabledAllNode();
        graph.setItemState(id, 'disabled', false);
        // 等待渲染之后聚焦
        setTimeout(() => {
          const $el = refs.contain.querySelector(`input[data-id="${id}"]`);
          // 聚焦
          moveEnd($el);
          // 修改状态为编辑状态
          isEdit = true;
          // 打开搜索列表
          handleShowList(id);
        }, 20);
      }
    }

    /**
     * 点击tree的时候高亮
     */
    function handleClick(event) {
      contextmenuVisible.value = false;
      const $input = event.target;
      if ($input.nodeName === 'INPUT') {
        const id = $input.dataset.id;
        if (id !== activeId) {
          disabledAllNode();
          listVisible.value = false;
        }
        setActiveId(id);
      } else {
        resetEditStatus();
        listVisible.value = false;
      }
    }

    /**
     * 更新active状态
     */
    function setActiveId(id) {
      graph.findAll('node', node => {
        const nodeId = node._cfg.id;
        graph.setItemState(nodeId, 'active', nodeId === id);
      });
      activeId = id;
    }

    /**
     * 插入同级
     */
    function insertBrother() {
      const item = getActiveNode();
      if (item) {
        const parent = graph.findDataById(item.parentId);
        if (parent) {
          cacheData(graph.save());
          const newItem = insertNode(parent, item.parentId);
          graph.changeData();
          // 遵循xmind 下一个规则
          setActiveId(newItem.id);
          graph.focusItem(newItem.id);
          focusContain();

          // onNodeAnimated().then(() => {
          //   setActiveId(item.id);
          // });
        }
      }
    }

    /**
     * 插入子集 下级
     */
    function insertChild() {
      const item = getActiveNode();
      if (item) {
        cacheData(graph.save());
        const newItem = insertNode(item, item.id);
        graph.changeData();
        setActiveId(newItem.id);
        graph.focusItem(newItem.id);
        focusContain();
      }
    }

    /**
     * 插入上级
     */
    function insertBefore() {
      const item = getActiveNode();
      if (item) {
        const parent = graph.findDataById(item.parentId);
        if (parent) {
          const grandParentId = parent.parentId;
          const grandParent = graph.findDataById(grandParentId);
          if (grandParent) {
            cacheData(graph.save());
            const newItem = insertNode(grandParent, grandParentId);
            graph.changeData();
            setActiveId(newItem.id);
            graph.focusItem(newItem.id);
            focusContain();
          }
        } else {
          // 暂不考虑给第一级加
        }
        // onNodeAnimated().then(() => {
        //   setActiveId(item.id);
        // });
      }
    }

    /**
     * 删除节点
     */
    function deleteNode() {
      const item = getActiveNode();
      if (item) {
        const parent = graph.findDataById(item.parentId);
        if (parent) {
          const index = parent.children.findIndex(v => v.id === item.id);
          if (index > -1) {
            cacheData(graph.save());
            parent.children.splice(index, 1);
            graph.changeData();
            setActiveId(parent.id);
            graph.focusItem(parent.id);
          }
        } else {
          // cacheData(graph.save());
          // activeId = null;
          // graph.clear();
        }
      }
    }

    /**
     * 节点增加的公共逻辑
     */
    function insertNode(item, parentId) {
      const itemData = {
        label: '',
        id: getUuid(),
        diseaseId: null,
        parentId,
        children: []
      };
      if (Array.isArray(item.children)) {
        item.children.push(itemData);
      } else {
        item.children = [itemData];
      }
      return itemData;
    }

    /**
     * 获取当前选中的id的值
     */
    function getActiveNode() {
      return graph.findDataById(activeId);
    }

    let ctrolActiveStatus = false;
    /**
     * 触发键盘事件快捷操作
     */
    function handlekeyDown(event) {
      // event.preventDefault();
      let key = event.key;
      // 阻止tab（避免切换点击区域）、 ctrl+z、 ctrl+y、ctrl+c、ctrl+v默认事件  重写了这几个行为
      if (
        key === 'Tab' ||
        (ctrolActiveStatus && ['z', 'y', 'c', 'v'].includes(key))
      ) {
        event.preventDefault();
      }

      // 是否点击了ctrl 或common键
      ['Meta', 'Ctrl'].includes(key) && (ctrolActiveStatus = true);
      if (isEdit) {
        return;
      }
      key = `${ctrolActiveStatus ? 'ctrl-' : ''}${key}`;
      const fn = key2Event[key];
      typeof fn === 'function' && fn();
    }

    function handleKeyUp(event) {
      const key = event.key;
      ['Meta', 'Ctrl'].includes(key) && (ctrolActiveStatus = false);
    }

    /**
     * 右键菜单
     */
    function handleMenuSelected(data) {
      contextmenuVisible.value = false;
      // vue3 中是没有this的 这里取巧了
      const fn = this[data.eventName];
      typeof fn === 'function' && fn();
    }

    /**
     * 展示知识卡片
     */
    function showKnowledgeCard() {
      const item = getActiveNode();
      item && item.diseaseId && emit('showKnowledgeCard', item.diseaseId);
    }

    /**
     * 点击选中疾病的时候
     */
    function handleSelectDisease(item) {
      const { abilityId, diseaseName } = item;
      listVisible.value = false;
      const activeItem = getActiveNode();
      const { id, parentId, label, diseaseId } = activeItem;
      const parent = graph.findDataById(parentId);
      // 相同的时候直接跳过
      if (diseaseId === abilityId) {
        resetEditStatus();
        return;
      }
      // 根节点没有parent 就取当前的
      const deepData = parent ? parent : activeItem;
      // 校验规则
      if (
        validatorBrother(deepData, abilityId) ||
        validatorAllNode(deepData, abilityId)
      ) {
        const $input = document.querySelector(`input[data-id="${id}"]`);
        $input && ($input.value = label);
        resetEditStatus();
        return;
      }
      activeItem.label = diseaseName;
      activeItem.diseaseId = abilityId;
      // 更新drawer的title
      parentId === '0' &&
        emit('rootNodeChange', { id, abilityName: activeItem.label });
      graph.changeData();
      resetEditStatus();
    }

    // 同级不能加相同的
    function validatorBrother(parent, abilityId) {
      const hasSameId = (parent.children || []).some(
        v => v.diseaseId === abilityId
      );
      if (hasSameId) {
        Message.warning('同级中不能添加相同的疾病');
      }
      return hasSameId;
    }
    // a->b->c->? 不能再添加 c、b、a
    function validatorAllNode(parent, abilityId) {
      let hasSameId = false;
      function deepParent(treeData) {
        if (treeData.diseaseId === abilityId) {
          hasSameId = true;
          return;
        }
        treeData.parentId &&
          treeData.parentId !== '0' &&
          deepParent(graph.findDataById(treeData.parentId));
      }

      function deepChildren(arr) {
        if (Array.isArray(arr)) {
          arr.forEach(v => {
            if (hasSameId) {
              return;
            }
            if (v.diseaseId === abilityId) {
              hasSameId = true;
              return;
            }
            Array.isArray(v.children) && deepChildren(v.children);
          });
        }
      }

      deepParent(parent);
      !hasSameId &&
        Array.isArray(parent.children) &&
        deepChildren(parent.children);
      if (hasSameId) {
        Message.warning('当前所选疾病在当前树分支中已选择');
      }
      return hasSameId;
    }

    /**
     * 重设状态
     */
    function resetEditStatus() {
      disabledAllNode();
      isEdit = false;
      focusContain();
    }

    function focusContain() {
      refs.contain.focus();
    }

    /**
     * 重设数据
     */
    function resetData(id = getUuid(), label = '', diseaseId = '') {
      // cache && cacheData(graph.save());
      graph.clear();
      activeId = null;
      isEdit = false;
      contextmenuVisible.value = false;
      listVisible.value = false;
      data = {
        id: id,
        label,
        diseaseId,
        parentId: '0',
        children: [],
        isRoot: true
      };
      graph.data(data);
      graph.render();
      graph.fitCenter(data.id);
    }

    /**
     * 清空 清空的时候要保留根ID 不然会变成新增
     */
    function clearAll() {
      const { id, label, diseaseId } = data;
      cacheData(graph.save());
      resetData(id, label, diseaseId);
    }

    /**
     * 输入的时候
     */
    function handleInput(event) {
      const $input = event.target;
      if ($input.nodeName === 'INPUT') {
        $input.dataset.id === activeId && handleLoadData($input.value.trim());
      }
    }

    /**
     * 聚焦到最后一位
     * @param {HTMLElement} input实例
     */
    function moveEnd(el) {
      el.focus();
      const len = el.value.length;
      if (document.selection) {
        const sel = el.createTextRange();
        sel.moveStart('character', len); //设置开头的位置
        sel.collapse();
        sel.select();
      } else if (
        typeof el.selectionStart == 'number' &&
        typeof el.selectionEnd == 'number'
      ) {
        el.selectionStart = el.selectionEnd = len;
      }
    }

    /**
     * 获取树形结构数据供父级使用
     */
    function getTreeData() {
      const filterData = formatData(graph.save());
      return filterData;
    }

    /**
     * 当有激活的node 点击ctrl-c
     */
    function handleCopyNode() {
      const item = getActiveNode();
      if (item) {
        copyData(formatData(item));
        Message.warning({ message: '节点复制成功' });
      } else {
        Message.warning({ message: '请先选择要复制的节点' });
      }
    }

    /**
     * 粘贴的功能 ctrl-v
     */
    function handlePasteNode() {
      const itemData = pasteData();
      if (activeId) {
        const activeNodeData = getActiveNode();
        const { id } = activeNodeData;
        // 校验同级
        if (
          validatorBrother(activeNodeData, itemData.diseaseId) ||
          validatorPasterData(itemData, activeNodeData)
        ) {
          resetEditStatus();
          return;
        }
        // 校验子节点中是否含有复制数据中的节点
        cacheData(graph.save());
        deepCopyData(itemData, id);
        Array.isArray(activeNodeData.children)
          ? activeNodeData.children.push(itemData)
          : (activeNodeData.children = [itemData]);
        graph.changeData();
      }
    }

    /**
     * 粘贴时的数据校验
     */
    function validatorPasterData(copyData, itemData) {
      let hasSameId = false;
      let stringCopyData = JSON.stringify(copyData);
      function deepParent(treeData) {
        if (treeData.diseaseId && stringCopyData.includes(treeData.diseaseId)) {
          hasSameId = true;
          return;
        }
        treeData.parentId &&
          treeData.parentId !== '0' &&
          deepParent(graph.findDataById(treeData.parentId));
      }

      function deepChildren(arr) {
        if (Array.isArray(arr)) {
          arr.forEach(v => {
            if (hasSameId) {
              return;
            }
            if (v.diseaseId && stringCopyData.includes(v.diseaseId)) {
              hasSameId = true;
              return;
            }
            Array.isArray(v.children) && deepChildren(v.children);
          });
        }
      }

      deepParent(itemData);
      !hasSameId &&
        Array.isArray(itemData.children) &&
        deepChildren(itemData.children);
      if (hasSameId) {
        Message.warning('当前所选疾病在当前树分支中已选择');
      }
      return hasSameId;
    }

    /**
     * 初始化
     */
    onMounted(() => {
      initTree();
    });
    return {
      loadDetail,
      handleClick,
      insertBrother,
      insertChild,
      insertBefore,
      deleteNode,
      handleContextmenu,
      contextmenuLeft,
      contextmenuTop,
      contextmenuVisible,
      handleMenuSelected,
      handleDblClick,
      handlekeyDown,
      listLeft,
      listTop,
      listVisible,
      handleDiseaseLoadMore,
      diseaseList,
      diseaseListLoadingStatus,
      handleSelectDisease,
      handleInput: debounce(handleInput),
      handleCancel,
      handleDeCancel,
      preBtnDisabled,
      nextBtnDisabled,
      showKnowledgeCard,
      getTreeData,
      resetData,
      clearAll,
      handleKeyUp
    };
  }
};
</script>

<style lang="scss">
.page-line-chart {
  ul.btn-group {
    padding: 8px 20px;
    list-style: none;
    overflow: hidden;
    border-bottom: 1px solid #ccc;
    li {
      float: left;
      margin-right: 10px;
    }
  }
  #mountNode {
    outline: none;
  }
  .line-chart {
    width: 100%;
    height: calc(100vh - 138px);
    input {
      width: 80px;
      text-align: center;
      box-sizing: border-box;
      border-radius: 4px;
      border: 2px solid #5c94f7;
      outline: none;
      transition: color 0.3s, background 0.3s;
      user-select: none;
      &.active {
        background: #c6e5ff;
      }
      // &.root {
      //   background: #5c94f7;
      //   color: #fff;
      // }
    }
  }
}
</style>

```


useCacheStack.js
```javascript
import { computed, ref } from '@vue/composition-api';

function formatData(data) {
  let obj = JSON.parse(JSON.stringify(data));
  deepData(obj);
  return obj;
}

function deepData(data) {
  if (Array.isArray(data)) {
    data.forEach(v => {
      filterData(v);
      Array.isArray(v.children) && deepData(v.children);
    });
  } else {
    filterData(data);
    Array.isArray(data.children) && deepData(data.children);
  }
}

function filterData(obj) {
  delete obj.anchorPoints;
  delete obj.depth;
  delete obj.style;
  delete obj.type;
  delete obj.x;
  delete obj.y;
  delete obj.isRoot;
}

export default function useCacheStack(getGraph, onSuccess) {
  const oldDataStack = ref([]);
  const newDataStack = ref([]);
  // 数据更改 新栈里增加一个缓存 老栈里存下上一次的更改项
  // 点击撤回 选择老栈里第一个 显示出来
  // 点击反撤回  选择新栈里第一个

  function clearStack() {
    oldDataStack.value = [];
    newDataStack.value = [];
  }

  function cacheData(data) {
    const obj = formatData(data);
    newDataStack.value.push(obj);
  }

  function handleCancel() {
    const graph = getGraph();
    const curData = newDataStack.value.pop();
    if (curData) {
      const oldData = formatData(graph.save());
      oldDataStack.value.push(oldData);
      rerender(graph, curData);
    }
  }

  function handleDeCancel() {
    const graph = getGraph();
    const curData = oldDataStack.value.pop();
    if (curData) {
      const oldData = formatData(graph.save());
      newDataStack.value.push(oldData);
      rerender(graph, curData);
    }
  }

  function rerender(graph, data) {
    graph.data(data);
    graph.render();
    graph.fitCenter();
    onSuccess();
  }

  const preBtnDisabled = computed(() => {
    return newDataStack.value.length <= 0;
  });
  const nextBtnDisabled = computed(() => {
    return oldDataStack.value.length <= 0;
  });
  return {
    formatData,
    cacheData,
    deepData,
    newDataStack,
    oldDataStack,
    handleCancel,
    handleDeCancel,
    preBtnDisabled,
    nextBtnDisabled,
    clearStack
  };
}

```

