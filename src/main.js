import Vue from 'vue';
import Mdui from 'mdui';
import App from './App.vue';
import router from './router';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

Vue.config.productionTip = false;

const requireComponent = require.context('./components', false, /_.+\.vue$/);
requireComponent.keys().forEach(fileName => {
	const componentConfig = requireComponent(fileName);
	const componentName = upperFirst(camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, '$1')));
	Vue.component(componentName, componentConfig.default || componentConfig);
});

const $ = Mdui.JQ;

router.afterEach(() => {
	Vue.nextTick(() => {
		$('.router-link-active:not(.router-root)').addClass('mdui-tab-active');
		Mdui.mutation();
	});
});

new Vue({
	router,
	render: h => h(App),
	data: { Mdui, JQ: $, screenWidth: 0 },
	methods: {
		mutation: function() {
			Vue.nextTick(Mdui.mutation);
		}
	},
	mounted() {
		this.screenWidth = $('body').width();
		window.onresize = () => {
			this.screenWidth = $('body').width();
		};
	},
	computed: {
		smallScreen() {
			return this.$root.screenWidth <= 450;
		}
	}
}).$mount('#app');
