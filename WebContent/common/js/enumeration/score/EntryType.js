 define(function (require, exports, module) {

/**
 * 录入方式（1导入2录入3补录）
 * @author chen.qiaomei
 *
 */
var EntryType = {
		ImportIn : {
			 value : 1,
			 name : "导入"
		 },
		 Entry : {
			 value : 2,
			 name : "录入"
		 },
		 AdditionalRecording : {
			 value : 3,
			 name : "补录"
		 }
}
module.exports = EntryType;
});