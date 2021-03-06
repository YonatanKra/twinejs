const Vue = require('vue');
const without = require('lodash.without');
const { setTagColorInStory } = require('../../../../data/actions/story');
const { updatePassage } = require('../../../../data/actions/passage');

require('./index.less');

module.exports = Vue.extend({
	props: {
		assets: {
			type: Array,
			required: true
		},
		passage: {
			type: Object,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},

	template: require('./index.html'),

	methods: {
		// remove() {
		// 	this.updatePassage(
		// 		this.storyId,
		// 		this.passage.id,
		// 		{ tags: without(this.passage.tags, this.tag) }
		// 	);
		// },
		// addAsset(color) {
		// 	this.setTagColorInStory(this.storyId, this.tag, color);
		// },
		addAsset(asset) {
			this.passage.text = this.passage.text + " " + asset.link;
		}
	},

	vuex: {
		actions: { setTagColorInStory, updatePassage }
	},

	components: {
		'drop-down': require('../../../../ui/drop-down')
	}
});