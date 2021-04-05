import Vue from "vue";
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
import "./global.less"
import index from "./index.vue";
import './register-panel';
Vue.use(ElementUI, {size: "mini"});
new Vue({
  el: "#app",
  render: h => h(index)
});
