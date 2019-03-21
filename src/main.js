import Vue from 'vue'
import calendar from "./components/Calendar.vue"
import grid from "./components/LoadGrid.vue"
import reg from "./components/registration.vue"

import store from './components/store.vue'
import $ from "jquery"

Vue.component("calendar", calendar)
Vue.component("grid", grid)
Vue.component("registration", reg)

window.$ = $
window.jQuery = $
window.isAppMounted = false

document.addEventListener("DOMContentLoaded", function(){
	window.app = new Vue({
	  el: '#reg-app',
	  store: store,
	  mounted(){
	  	window.isAppMounted = true
	  }
	})
})