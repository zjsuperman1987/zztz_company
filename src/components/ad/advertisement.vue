<template>
  <!-- 广告 -->
  <div class="main-content" :style="{ background: theme.adBgC }">
    <div class="block">
      <div :height=min_height :interval=interval indicator-position="none" arrow="never">
        <template  v-if="adList.total < maxNum">
            <div class="ad_box">
                <span class="small" :style="{color: colorList[Math.floor(Math.random() * colorList.length)],
                }" @click="adClick(item)" v-for="(item, index) in list" :key="index">{{ item.title }}</span>
            </div>
        </template>
        <template  v-if="adList.total > minNum">
            <div class="ad_box">
                <span :style="{color: colorList[Math.floor(Math.random() * colorList.length)],}"
                 @click="adClick(item)" class="small"  v-for="(item, index) in num" :key="index">
                 {{ item.title }}
                </span>
            </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "advertisement",
  props: {
    adList: {
      type: Object,
    },
    interval: {
      type: Number,
      default: 5000
    },
    maxNum: {
        type: Number,
        default: 3
    },
    minNum: {
        type: Number,
        default: 3
    },
    min_height: {
        type: String,
        default: '20px'
    }
  },
  data() {
    return {
      list: [],
      num: [],
      colorList: [
        "#22daa7",
        "#5cb851",
        "#E2687A",
        "#46d13d",
        "#159fac",
        "#310C52",
        "#27C92F",
        "#2F4DD6",
        "#A74AD0",
      ],
    };
  },
  watch: {
    adList: {
      handler() {
        this.getAdList();
      },
    },
  },
  computed: {
    ...mapState({
      theme: (state) => state.settings.theme,
    }),
  },
  methods: {
    //获取公告数据
    getAdList() {
      if (this.adList.total < this.maxNum) {
        let array = []
        let temp = []
        this.list = this.adList.data
        if(this.adList.total % 3 === 0) this.list = this.adList.data
        if(this.adList.total % 3 === 1) {
          
          this.list.push(array,temp)
        }
        if(this.adList.total % 3 === 2) this.list.push(array)
      }
      else {
        let array = this.division(this.adList.data, this.maxNum);
        const length = array.length
        let i = 0
        const timer = setInterval(() => {
          this.num = array[i]
          i++
          if(i === length) i = 0
        },5000)
      }
    },

    division(arr, N) {
      //分割数组函数
      let result = [];
      for (let i = 0; i < arr.length; i += N) result.push(arr.slice(i, i + N));
      return result;
    },

    //广告点击跳转
    adClick(it) {
      if(it.tid) this.$router.push({ name: 'ad-details', query: { id: it.tid, type: 'ad' }})
    }
  },
};
</script>

<style scoped lang="less">
.main-content {
    padding: 2px 0 2px 4px;
    .block {
        border-radius: 4px;
        .ad_box{
            display: flex;
            flex-wrap: wrap;
            flex-direction: row;
            justify-content:first baseline;

        }
        .small {
            width: 33%;
            box-shadow: 0 0 8px #c8a8a8 inset;
            display: inline-block;
            background: #caf5f1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
            padding: 0 5px;
            border-radius: 4px;
            min-height: 20px;
            line-height: 20px;
            margin: 0 2px 2px 0;
        }
        .small:hover{
          cursor: pointer;
        }
    }
}
</style>
