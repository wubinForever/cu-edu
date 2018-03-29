/**
 * 按时间区段查看
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("../../../common/js/utils/utils");
	var config = require("../../../common/js/utils/config");
	var ajaxData = require("../../../common/js/utils/ajaxData");
	
	//下拉框
	var simpleSelect = require("../../../common/js/module/select.simple");
	var treeSelect = require("../../../common/js/module/select.tree");
	
	var URL = require("../../../common/js/config/url.udf");
	var popup = require("../../../common/js/utils/popup");
	require("../../../common/js/utils/common");
	var URL_DATA = require("../../../common/js/config/url.data");
	var URL_COURSEPLAN = require("../../../common/js/config/url.courseplan");
	var dictionary = require("../../../common/js/config/data.dictionary");
	var shuffling = require("../../../common/js/utils/shuffling");
	var dataDictionary = require("../../../common/js/config/data.dictionary");
	//变量名跟文件夹名称一致
	var teacher = {
		init : function(){
			var data = popup.getData("teacherinfoData");
			var param = popup.getData("teacherinfoParam");
			var shuff = new shuffling({
				left:[{name:"所属单位", field:"departmentName",rigthLeftStyle:"text-l" },
				      {name:"教师工号", field:"teacherNo",
					widthStyle:"width85",rigthLeftStyle:"text-l"},
				      {name:"教师姓名", field:"teacherName",
							widthStyle:"width85",rigthLeftStyle:"text-l"},
				      {name:"性别", field:"sexName",
							widthStyle:"width48"},
				      {name:"教师类型", field:"teacherTypeName",
								widthStyle:"width48"},
				      { field:"id",unique:true,show:false}],
				url:URL_COURSEPLAN.COMMON_TEACHERINFO_GETLIST,
				selectedData:data,
				param:param,
				selectedCanRemove:true,
				json:true
			}).init();
			teacher.shuff = shuff;
			popup.setData("shuff", shuff);
			simpleSelect.loadDataDictionary("teacherTypeCode",dataDictionary.ID_FOR_TEACHER_TYPE_CODE,"","全部","");
			//教学单位
			treeSelect.loadTree({
				idTree : "teachingUnitTree", // 树Id
				id : "teachingUnitId", // 下拉数据隐藏Id
				name : "teachingUnitName", // 下拉数据显示name值
				url : URL_DATA.DEPARTMENT_ZTREE, // 下拉数据获取路径
				onclick : function() {
				} // 选择之后的事件
			});
			$("#searchBtn").click(function(){
				teacher.shuff.loadData(teacher.getParam());
			});
		},
		getSelectedTeacher : function(){
			//保存
			teacher.shuff.getData();
		},
		chooseTeacher : function(data, callback, param){
			popup.setData("teacherinfoData", data);
			popup.setData("teacherinfoParam", param);
			var teacherPopup = popup.open('./courseplan/common/html/teacher.html', {
				id : 'addteacher',// 唯一标识
				title : '教师选择',// 这是标题
				width : 1300,// 这是弹窗宽度。其实可以不写
				height : 735,// 弹窗高度*/
				okVal : '确定',
				cancelVal : '取消',
				ok : function() {
					var shuffing = popup.getData("shuff");
					return callback(shuffing.getData(), teacherPopup);
				},
				cancel:function(){return true;}
			});
		},
		/**
		 * 获取参数
		 */
		getParam : function(){
			var param = {};
			param.teacherTypeCode = $("#teacherTypeCode").val();
			param.teacherNoAndName = $("#teacherName").val();
			param.departmentId = $("#teachingUnitId").val();
			
			!param.teacherTypeCode && delete param.teacherTypeCode;
			!param.teacherNoAndName && delete param.teacherNoAndName;
			!param.departmentId && delete param.departmentId;
			return param;
		}
	}
	module.exports = teacher; //根文件夹名称一致
});