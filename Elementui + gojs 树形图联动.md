# index 
```vue
<template>
  <div class="organization">
    <Tree @update="treeDataChange"></Tree>
    <div class="contain">
      <TreeView
        :treeData="tree.data"
        :dataChangeStatus="tree.status"
      ></TreeView>
    </div>
  </div>
</template>

<script>
import Tree from "./Tree";
import TreeView from "./TreeView";
export default {
  components: {
    Tree,
    TreeView
  },
  data() {
    return {
      tree: {
        data: [],
        status: false
      }
    };
  },
  methods: {
    treeDataChange(data) {
      if (Array.isArray(data)) {
        this.tree.data = data;
        this.tree.status = !this.tree.status;
      }
    }
  }
};
</script>

<style lang="scss">
.organization {
  width: 1900px;
  height: 100%;

  & > .contain,
  & > .tree {
    float: left;
  }
  & > .contain {
    width: 1404px;
  }
}
</style>

```

# Modal.vue
```javascript
<template>
  <div>
    <transition name="el-zoom-in-top">
      <ul
        class="mouse-menu fixed"
        v-show="showStatus"
        :style="{ left: `${left}px`, top: `${top}px` }"
      >
        <li
          v-for="(item, index) in list"
          :key="item.id"
          @mouseenter="handleEnter($event, index)"
          @mouseleave="handleLeave($event, index)"
          @click="handleClick(item.event)"
        >
          {{ item.name }}
          <i
            class="el-icon-caret-right"
            v-if="Array.isArray(item.children) && item.children.length > 0"
          ></i>
          <transition name="el-zoom-in-top">
            <ul class="mouse-menu" v-show="item.showChild">
              <li
                :class="[{ disabled: child.disabled }]"
                v-for="child in item.children"
                :key="child.id"
                @click="handleClick(child.event)"
              >
                {{ child.name }}
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    showStatus: {
      default: false,
      type: Boolean
    },
    left: {
      default: 0,
      type: Number
    },
    top: {
      default: 0,
      type: Number
    },
    curLevel: {
      default: 0,
      type: Number
    },
    moveUpDisabled: {
      default: false,
      type: Boolean
    },
    moveDownDisabled: {
      default: false,
      type: Boolean
    },
    levelUpDisabled: {
      default: false,
      type: Boolean
    },
    levelDownDisabled: {
      default: false,
      type: Boolean
    }
  },
  watch: {},
  data() {
    return {
      list: [
        {
          name: "添加",
          id: 1,
          show: true,
          disabled: false,
          showChild: false,
          event: null,
          children: [
            {
              name: "上添加",
              id: 2,
              show: true,
              disabled: false,
              event: "insertBefore",
              children: []
            },
            {
              name: "下添加",
              id: 3,
              show: true,
              disabled: false,
              event: "insertAfter",
              children: []
            },
            {
              name: "子级",
              id: 4,
              show: true,
              disabled: false,
              event: "append",
              children: []
            }
          ]
        },
        {
          name: "移动",
          id: 5,
          show: true,
          disabled: false,
          showChild: false,
          children: [
            {
              name: "上移",
              id: 6,
              show: true,
              disabled: false,
              event: "moveUp",
              children: []
            },
            {
              name: "下移",
              id: 7,
              show: true,
              disabled: false,
              event: "moveDown",
              children: []
            },
            {
              name: "升级",
              id: 8,
              show: true,
              disabled: false,
              event: "levelUp",
              children: []
            },
            {
              name: "降级",
              id: 9,
              show: true,
              event: "levelDown",
              disabled: false,
              children: []
            }
          ]
        },
        {
          name: "删除",
          id: 9,
          show: true,
          event: "delete",
          showChild: false,
          disabled: false,
          children: []
        },
        {
          name: "重命名",
          id: 10,
          show: true,
          event: "rename",
          showChild: false,
          disabled: false,
          children: []
        }
      ]
    };
  },
  computed: {
    menuStatus() {
      return {
        // 上添加
        insertBefore: this.list[0].children[0],
        // 下添加
        insertAfter: this.list[0].children[1],
        // 添加子级
        append: this.list[0].children[2],
        // 上移
        moveUp: this.list[1].children[0],
        // 下移
        moveDown: this.list[1].children[1],
        // 升级
        levelUp: this.list[1].children[2],
        // 降级
        levelDown: this.list[1].children[3]
      };
    }
    // 上添加
  },
  mounted() {
    this.addEvent();
  },
  beforeDestroy() {
    this.removeEvent();
  },
  methods: {
    init() {
      this.resetMenuStatus();
      this.$nextTick().then(() => {
        this.menuStatus.moveUp.disabled = this.moveUpDisabled;
        this.menuStatus.moveDown.disabled = this.moveDownDisabled;
        this.menuStatus.levelUp.disabled = this.levelUpDisabled;
        this.menuStatus.levelDown.disabled = this.levelDownDisabled;
      });
    },
    // 每次点开初始化菜单状态
    resetMenuStatus() {
      for (let i in this.menuStatus) {
        this.menuStatus.hasOwnProperty(i) &&
          (this.menuStatus[i].disabled = false);
      }
    },
    handleEnter(event, index) {
      const item = this.list[index];
      Array.isArray(item.children) &&
        item.children.length > 0 &&
        (item.showChild = true);
    },
    handleLeave(event, index) {
      this.list[index].showChild = false;
    },
    handleClick(eventType) {
      eventType && this.$emit("handleChange", { type: eventType });

      this.$emit("update:showStatus", false);
    },
    addEvent() {
      document.addEventListener("click", this.handleDocumentClick);
    },
    removeEvent() {
      document.removeEventListener("click", this.handleDocumentClick);
    },
    handleDocumentClick(event) {
      event.stopPropagation();
      const $el = event.target;
      const $parent = $el.parentNode;
      if (
        ($el.nodeName === "LI" &&
          Array.prototype.includes.call($parent.classList, "mouse-menu")) ||
        ($el.nodeName === "UL" &&
          Array.prototype.includes.call($el.classList, "mouse-menu"))
      ) {
        return;
      }
      this.$emit("update:showStatus", false);
    }
  }
};
</script>

<style lang="scss">
@import "@style/mixin.scss";
.mouse-menu {
  min-width: 180px;
  padding: 9px 0;
  border-radius: 4px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.36);
  background: #f0f0f0;
  transition: all 0.25s;
  &.fixed {
    position: fixed;
    z-index: 600;
  }
  .mouse-menu {
    position: absolute;
    right: -100%;
    top: -9px;
  }
  li {
    position: relative;
    height: 32px;
    line-height: 32px;
    padding: 0 20px 0 32px;
    cursor: pointer;
    transition: background $hoverTime, color $hoverTime;
    i.el-icon-caret-right {
      float: right;
      margin-top: 9px;
      transition: transform $hoverTime;
      transform: rotate(180deg);
    }
    &.move-menu {
      .mouse-menu {
        top: 0;
      }
    }
    &.disabled,
    &.disabled:hover {
      color: #9c9ea2;
      background: none;
      cursor: default;
    }
    &:hover {
      background: $blue;
      color: $fff;
      i.el-icon-caret-right {
        transform: rotate(0);
      }
      .mouse-menu {
        li {
          color: #4a4a4a;
          transition: background $hoverTime, color $hoverTime;
          &:hover {
            background: $blue;
            color: $fff;
          }
          &.disabled,
          &.disabled:hover {
            color: #9c9ea2;
            background: none;
            cursor: default;
          }
        }
      }
    }
  }
}
</style>

```

# Tree.vue
```vue
<template>
  <div class="tree" @scroll="handleScroll">
    <div class="title-contain">
      <transition-group name="ht-slide">
        <div
          class="title"
          key="hasData"
          v-if="Array.isArray(treeData) && treeData.length <= 0"
        >
          <h2>组织树形图</h2>
          <button class="create" @click="createOrgan">创建组织</button>
        </div>
        <div class="title danger" key="noData" v-else>
          <h2>编辑组织架构</h2>
          <button class="pull-right" @click="handleClose">
            <i class="fa fa-rotate-left" aria-hidden="true"></i>
          </button>
          <button class="pull-right">
            <i class="fa fa-save" aria-hidden="true"></i>
          </button>
        </div>
      </transition-group>
    </div>

    <div class="contain">
      <transition name="fade">
        <input
          v-show="Array.isArray(treeData) && treeData.length > 0"
          type="text"
          v-model="filterText"
          placeholder="组织检索"
          class="input"
        />
      </transition>

      <el-tree
        class="filter-tree"
        :data="treeData"
        node-key="id"
        :props="defaultProps"
        default-expand-all
        :filter-node-method="filterNode"
        @node-click="handleClick"
        @node-drag-start="handleDragStart"
        @node-drop="handleDropOver"
        draggable
        ref="tree"
        @node-contextmenu="mouseEvent"
      >
        <span class="custom-tree-node" slot-scope="{ node }">
          <span :class="[{ label: node.level < 4 }]">{{ node.label }}</span>
          <span class="count" v-if="node.level === maxLevel">
            0 人
          </span>
          <span class="count" v-else>
            0 / 16 人
          </span>
        </span>
      </el-tree>
    </div>
    <Modal
      ref="modal"
      :showStatus.sync="modal.status"
      :left="modal.left"
      :top="modal.top"
      :curLevel="modal.level"
      :move-up-disabled="modal.moveUpDisabled"
      :move-down-disabled="modal.moveDownDisabled"
      :level-up-disabled="modal.levelUpDisabled"
      :level-down-disabled="modal.levelDownDisabled"
      @handleChange="menuChange"
    ></Modal>
  </div>
</template>

<script>
import Modal from "./Modal";
import { ht_confirm } from "@common/utils";
// 最高6级

export default {
  data() {
    return {
      modal: {
        status: false,
        left: 0,
        top: 0,
        level: 0,
        moveUpDisabled: false,
        moveDownDisabled: false,
        levelUpDisabled: false,
        levelDownDisabled: false
      },
      maxLevel: 0,
      maxId: 0,
      filterText: "",
      curNode: {
        data: null,
        node: null,
        el: null
      },
      treeData: [
        {
          id: 1,
          label: "一级 1",
          parentId: 0,
          children: [
            {
              id: 4,
              label: "二级 1-1",
              parentId: 1
            }
          ]
        },
        {
          id: 2,
          label: "一级 2",
          parentId: 0,
          children: [
            {
              id: 5,
              parentId: 2,
              label: "二级 2-1"
            },
            {
              id: 6,
              parentId: 2,
              label: "二级 2-2"
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  components: {
    Modal
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getStartValue();
  },

  methods: {
    sendChangeToFather(data = this.$refs.tree.data) {
      // console.log(this.$refs.tree.data);
      this.$emit("update", data);
    },
    handleDropOver(node, targetNode, positon) {
      if (positon === "inner") {
        node.data.parentId = targetNode ? targetNode.data.id : 0;
      } else {
        node.data.parentId =
          targetNode && targetNode.parent ? targetNode.parent.data.id : 0;
      }

      this.sendChangeToFather();
    },
    // 开始的时候计算当前最大层级 和 最大id
    getStartValue() {
      const { max, idArr } = this.getMaxFloor(this.treeData);
      this.maxLevel = max;
      this.maxId = Math.max(...idArr);
    },
    prompt(type = "edit") {
      return this.$prompt("请输入名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[^\s].{0,12}$/,
        inputValue: type === "add" ? null : this.curNode.data.label,
        inputErrorMessage: "名称在1 至 12个字符之间"
      });
    },
    menuChange(data) {
      const type = data.type;
      type && this[type] && this[type]();
    },
    // 删除
    delete(type = "self") {
      this.curNode.node && this.$refs.tree.remove(this.curNode.node);
      if (type === "self") {
        this.getStartValue();
        this.sendChangeToFather();
      }
    },
    // 重命名
    rename() {
      this.prompt()
        .then(({ value }) => {
          this.curNode.data.label = value;
          this.$refs.tree.updateKeyChildren(
            this.curNode.key,
            this.curNode.data
          );
          this.sendChangeToFather();
        })
        .catch(() => {});
    },
    // 添加
    insertBefore() {
      this.update("insertBefore");
    },
    insertAfter() {
      this.update("insertAfter");
    },
    append() {
      this.update("append");
    },
    // 向前、向后、往子集添加`
    update(type) {
      this.prompt("add")
        .then(({ value }) => {
          this.handleUpdate(value, type);
        })
        .catch(() => {});
    },

    handleUpdate(value, type, key) {
      const node = this.curNode.node;
      this.$refs.tree[type](
        {
          id: ++this.maxId,
          parentId: type === "append" ? node.data.id : node.data.parentId,
          label: value
        },
        key ? key : node.key
      );
      type === "append" && this.getStartValue();
      this.sendChangeToFather();
    },
    // 上移
    moveUp() {
      this.handleMove("previousSibling", "insertBefore");
    },
    moveDown() {
      this.handleMove("nextSibling", "insertAfter");
    },
    handleMove(type, actionType) {
      const node = this.curNode.node;
      if (node[type]) {
        const key = node[type].key;
        this.delete("other");
        this.$refs.tree[actionType](this.curNode.data, key);
        this.sendChangeToFather();
      }
    },
    // 升级   父级的兄弟  parentId就是父级的parentId
    levelUp() {
      const node = this.curNode.node;
      const parent = node.parent;
      if (parent) {
        let data = this.curNode.data;
        const key = parent.key;
        const parentId = parent.data.parentId;
        data.parentId = parentId || 0;
        this.delete("other");
        this.$refs.tree.insertAfter(data, key);
        this.getStartValue();
        this.sendChangeToFather();
      }
    },
    // 降级
    // 降级就是必须要有同级的兄弟节点 是前面一个节点 然后当前节点作为前一个兄弟节点的子节点
    levelDown() {
      const node = this.curNode.node;
      const brother = node.previousSibling;
      if (brother) {
        this.curNode.data.parentId = brother.data.id;
        this.delete("other");
        this.$refs.tree.append(this.curNode.data, brother.key);
        this.getStartValue();
        this.sendChangeToFather();
      }
    },
    getMaxFloor(treeData) {
      let max = 0;
      let idArr = [];
      function each(data, floor) {
        data.forEach(e => {
          idArr.push(e.id);
          e.floor = floor;
          if (floor > max) {
            max = floor;
          }
          if (Array.isArray(e.children) && e.children.length > 0) {
            each(e.children, floor + 1);
          }
        });
      }
      each(treeData, 1);
      return {
        max,
        idArr
      };
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    mouseEvent(event, data, node, el) {
      event.preventDefault();
      // 盒子高度 146  第二个子菜单展开后高34px左右
      const elHeight = 180;
      this.modal = {
        left: event.clientX + 15,
        top:
          event.clientY + elHeight > window.innerHeight
            ? event.clientY - elHeight
            : event.clientY + 15,
        level: node.level,
        status: true,
        moveUpDisabled: !node.previousSibling,
        moveDownDisabled: !node.nextSibling,
        levelUpDisabled: node.level === 1,
        levelDownDisabled: !node.previousSibling
      };
      this.curNode = {
        data,
        node,
        el
      };
      this.$refs.modal.init();
      // node level 当前层级 从1 开始算
      // console.log(data, node, el, this.$refs.tree);
    },
    handleDragStart() {
      this.hideModal();
    },
    handleClick() {
      this.hideModal();
    },
    handleScroll() {
      this.hideModal();
    },
    hideModal() {
      if (!this.modal.status) {
        return;
      }
      const { left, top } = this.modal;
      this.modal = {
        status: false,
        left,
        top
      };
    },
    createOrgan() {
      this.prompt("add")
        .then(res => {
          this.treeData.push({
            id: 1,
            parentId: 0,
            label: res.value,
            children: []
          });
          this.maxId = 1;
          this.maxLevel = 1;
          this.sendChangeToFather();
        })
        .catch(err => {
          console.log(err);
        });
    },
    handleClose() {
      ht_confirm({
        $this: this,
        msg: "当前内容尚未保存，是否确定关闭？",
        suc: () => {
          this.maxId = 0;
          this.treeData = [];
          this.maxLevel = 0;
          this.sendChangeToFather([]);
        }
      });
    }
  }
};
</script>

<style lang="scss">
@import "@style/mixin.scss";
.organization {
  .tree {
    height: 100%;
    width: 320px;
    margin-right: 15px;
    background: $fff;
    overflow: auto;
    .title-contain {
      position: relative;
      @include title(22px);
      overflow: hidden;
    }

    .title {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      @include title(22px);
      &.danger {
        background: #ff4f4f;
        h2,
        button {
          color: $fff;
        }
        button {
          padding: 0;
          margin-left: 24px;
          font-size: 16px;
          padding-bottom: 2px;
          position: relative;
          overflow: hidden;

          &::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background: $fff;
            transition: transform $hoverTime;
            transform: translate3d(-100%, 0, 0);
          }
          &:hover {
            &:after {
              transform: translate3d(0, 0, 0);
            }
          }
        }
      }
      button {
        float: right;
        margin-top: 14px;
        font-size: 14px;
        border: none;
        background: none;
        cursor: pointer;
      }
      button.create {
        font-weight: bold;
        color: $blue;
        transition: transform $hoverTime;
        &:hover {
          transform: translate3d(0, -2px, 0);
        }
      }
    }

    .contain {
      padding: 10px;
      .input {
        width: 100%;
        height: 32px;
        line-height: 32px;
        margin-bottom: 20px;
        padding: 0 20px;
        font-size: 14px;
        font-weight: 400;
        color: #757575;
        border: 1px solid $titleC;
        transition: border $hoverTime;
        &:hover,
        &:focus {
          border-color: $hoverC;
        }
      }
      .el-tree-node:focus > .el-tree-node__content {
        background-color: #cdebf7;
      }
      // .el-tree-node__children {
      //   .el-tree-node__content .label {
      //     font-weight: normal;
      //   }
      // }
      .el-tree-node__content {
        margin-bottom: 0;
        height: 32px;
        line-height: 32px;
        transition: all $hoverTime;
        &:hover {
          background-color: #cdebf7;
        }

        .el-tree-node__expand-icon {
          color: #000;
          &.is-leaf {
            color: transparent;
          }
        }
        .custom-tree-node {
          width: 100%;
          .count {
            float: right;
            color: $titleC;
          }
        }
        .label {
          font-size: 16px;
          font-weight: bold;
          color: #000;
        }
      }
    }
  }
}
</style>

```

# Treeview.vue

```vue
<template>
  <div class="tree-view">
    <div class="title">
      <h2>组织架构一览</h2>
      <button class="zoom" @click="zoom2zero">
        <i class="fa fa-refresh "></i>
      </button>
    </div>
    <div class="contain">
      <div id="myDiagramDiv" style=" width: 100%; height: 550px"></div>
    </div>
  </div>
</template>

<script>
import go from "gojs";
const $ = go.GraphObject.make; // 后面很多用到该变量来初始化diagram

export default {
  data() {
    return {
      myDiagram: null,
      tooltiptemplate: null,
      dataArr: [],
      goJsInit: false
    };
  },
  props: {
    treeData: {
      default() {
        return [];
      },
      type: Array
    },
    dataChangeStatus: {
      default: false,
      type: Boolean
    }
  },
  watch: {
    dataChangeStatus() {
      this.dataArr = [];
      this.flatData(this.treeData);
      if (this.goJsInit) {
        this.myDiagram.model = new go.TreeModel(this.dataArr);
      } else {
        this.init();
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    flatData(arr) {
      arr.forEach(v => {
        if (Array.isArray(v.children) && v.children.length > 0) {
          this.flatData(v.children);
        }
        this.dataArr.push({
          key: v.id,
          parent: v.parentId,
          label: v.label
        });
      });
    },
    init() {
      this.myDiagram = $(
        go.Diagram,
        "myDiagramDiv", // must be the ID or reference to div
        {
          "toolManager.hoverDelay": 100, // 100 milliseconds instead of the default 850
          allowCopy: false,
          // create a TreeLayout for the family tree
          layout: $(go.TreeLayout, {
            angle: 90,
            nodeSpacing: 10,
            layerSpacing: 40,
            layerStyle: go.TreeLayout.LayerUniform
          })
        }
      );
      this.initToolTip();
      this.initSquare();
      this.initLinkLine();
      this.myDiagram.model = new go.TreeModel(this.dataArr);
      this.goJsInit = true;
    },
    // 连线
    initLinkLine() {
      this.myDiagram.linkTemplate = $(
        go.Link, // the whole link panel
        {
          routing: go.Link.Orthogonal,
          corner: 5,
          selectable: false
        },
        $(go.Shape, { strokeWidth: 2, stroke: "#4497FA" })
      );
    },
    // 初始化每个块
    initSquare() {
      this.myDiagram.nodeTemplate = $(
        go.Node,
        "Auto",
        { deletable: false, toolTip: this.tooltiptemplate },
        new go.Binding("text", "name"),
        $(
          go.Shape,
          "RoundedRectangle",
          {
            fill: "#3A454E",
            stroke: null,
            height: "44px",
            strokeWidth: 0,
            stretch: go.GraphObject.Fill,
            alignment: go.Spot.Center
          },
          new go.Binding("fill", "gender", "#3A454E")
        ),

        $(
          go.TextBlock,
          {
            font: "400 15px NotoSansHans-Regular, NotoSansHans-Regular",
            textAlign: "center",
            margin: 14,
            stroke: "#fff",
            maxSize: new go.Size(80, NaN)
          },
          new go.Binding("text", "label")
        )
      );
    },
    initToolTip() {
      this.tooltiptemplate = $(
        "ToolTip",
        { "Border.fill": "whitesmoke", "Border.stroke": "black" },
        $(
          go.TextBlock,
          {
            font: "bold 8pt Helvetica, bold Arial, sans-serif",
            wrap: go.TextBlock.WrapFit,
            margin: 5
          },
          new go.Binding("text", "", this.tooltipTextConverter)
        )
      );
    },
    tooltipTextConverter() {
      let str = "";
      // str += "Born: " + person.birthYear;
      // if (person.deathYear !== undefined) str += "\nDied: " + person.deathYear;
      // if (person.reign !== undefined) str += "\nReign: " + person.reign;
      return str;
    },
    // 还原位置
    zoom2zero() {
      this.myDiagram.model = new go.TreeModel(this.dataArr);
      this.myDiagram.zoomToFit();
    }
  }
};
</script>

<style lang="scss">
@import "@style/mixin.scss";
.organization {
  .tree-view {
    width: 100%;
    float: left;
    .title {
      @include title(22px);
    }
    .contain {
      background: $fff;
    }
  }
}
</style>

```
