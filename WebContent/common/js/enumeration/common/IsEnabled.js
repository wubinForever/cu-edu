define(function (require, exports, module) {
	/**
	 * 是否启用（1启用，0禁用）
	 * @author jing.zhang
	 *
	 */
	 var IsEnabled = {
			 Enable : {
				 value : 1,
				 name : "启用"
			 },
			 Disable : {
				 value : 0,
				 name : "禁用"
			 } 
	 }
	 
	 module.exports = IsEnabled;
});