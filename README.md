# fehelper-json-diff-vue

基于Fehelper里的jsondiff功能封装的vue组件。

推荐浏览器插件：FeHelper--Web前端助手(https://github.com/zxlie/FeHelper)

## Usage

安装vue-fehelper-json-diff包，依赖vue

```
npm install fehelper-json-diff-vue
or
yarn add fehelper-json-diff-vue
```

vue调用
```
<template>
  <div id="app">
    <json-diff :jsonSourceLeft="leftData" :jsonSourceRight="rightData" :ref-left="'tLeft'" :ref-right="'tRight'" @diffChange="diffChange" />
  </div>
</template>

<script>
import JsonDiff from 'fehelper-json-diff-vue'
export default {
  components: {
    JsonDiff
  },
  data() {
    return {
      leftData: {
        "data": {
            "needQueryPosition": 0,
            "orderStatus": "已取消",
            "orderTrace": {
                "timeLine": [
                    {
                        "date": "10/13",
                        "time": "18:26",
                        "status": "订单已取消"
                    },
                    {
                        "date": "10/13",
                        "time": "18:11",
                        "status": "订单提交成功"
                    }
                ],
                "lastStatusDesc": "订单未支付，已自动取消"
            }
          
        },
        "code": 0,
        "msg": "",
        "success": true
      },
      rightData: {
          "data": {
              "needQueryPosition1": 0,
              "orderStatus": "已取消",
              "orderTrace1": {
                  "timeLine": [
                      {
                          "date": "10/13",
                          "time": "18:26",
                          "status": "订单已取消"
                      },
                      {
                          "date": "10/13",
                          "time": "18:11",
                          "status": "订单提交成功"
                      }
                  ],
                  "lastStatusDesc": "订单未支付，已自动取消"
              }
            
          },
          "code": 1,
          "msg": "2222",
          "success": true
      }
    }
  }
}
</script>
```

## props


属性 | 类型 | 描述
---|---|---
jsonSourceLeft | Object/String | 左侧区域展示数据
jsonSourceRight | Object/String | 右侧区域展示数据
showHeading | Boolean | 是否显示顶部对比结果
errorHandler | Function | 错误处理回调方法
diffHandler | Function | 对比结果回调方法
diffChange | Function | 对比结果result
refLeft | String | 左侧textarea的ID
refRight | String | 右侧textarea的ID
