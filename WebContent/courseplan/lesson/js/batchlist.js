/**
 * 批量调停课
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var helper = require("basePath/utils/tmpl.helper");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var pagination = require("basePath/utils/pagination");
	var URL = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	
	//变量名跟文件夹名称一致
	var list = {
			// 初始化
			init : function() {
				this.semester = simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
				//调停课新增弹窗
				this.initPagination();
				
				//批量调停课
				$("button[name='addmulty']").on('click',function(){
					list.addBatch();
				});
				$(".queryBtn").click(function(){
					list.list();
				});
			},					
		//调停课新增弹窗
		addBatch : function() {
			popup.setData("lessonList", this);
			var me = this;
			this.addFrame = popup.open('./courseplan/lesson/html/batchadd.html', {
				id : 'addBatch',// 唯一标识
				title : '批量调停课新增',// 这是标题
				width : 830,// 这是弹窗宽度。其实可以不写
				height : 320,// 弹窗高度*/
				okVal : '保存',
				fixed: true,
				ok : function() {
					var batchadd = popup.getData("batchadd");
					var flag =  batchadd.save();
					if(flag){
						list.list();
					}
					return flag;
				},
				cancelVal:"关闭",
				cancel:function(){
					
				}
			});
		},
		list : function(){
			var me = this;
			var param = me.getParam();
			ajaxData.setContentType("application/x-www-form-urlencoded");
			this.pagination.setParam(param);
		},
		initPagination:function(){
			this.pagination = new pagination({
				id: "pagination", 
				url: URL_COURSEPLAN.LESSON_GETPAGEDLISTFORBATCH, 
				param: this.getParam()
			},function(data){
				if(data && data.length > 0){
					$("#tbodycontent").html($("#tableTmpl").tmpl(data, helper)).setNoDataHtml($("#pagination"));
				}else{
					$("#tbodycontent").html("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();
		},
		getParam:function(){
			var param = utils.getQueryParamsByFormObject($("#queryForm"));
			if(param.semester){
				var semster = param.semester.split("_");
				param.acadmemicYear = semster[0];
				param.semesterCode = semster[1];
			}
			return param;
		} 
	}
	
	module.exports = list; //根文件夹名称一致
});