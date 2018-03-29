/**
 * 按时间区段查看
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
				$("#semester").change(function(){
					list.setUnHanding();
				}).change();
				$("button[name='addnewclass']").on('click',function(){
					list.addNewclass();
				});
				//查询
				$("#queryBtn").on('click',function(){
					list.setUnHanding();
					list.list();
				}).click();
				
				$(document).on("click", "button[name=detail]", function(){
					list.detail(this);
				});
				$(document).on("click", "button[name=handerange]", function(){
					list.handerange(this);
				});
				 
			},					
		//调停课新增弹窗
		addNewclass : function() {
			popup.setData("lessonList", this);
			var me = this;
			this.addFrame = popup.open('./courseplan/lesson/html/add.html', {
				id : 'addNewclass',// 唯一标识
				title : '调停课新增',// 这是标题
				width : 1200,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				okVal : '保存',
				//fixed: true,
				ok : function() {
					var lessonAdd = popup.getData("lessonAdd");
					var flag = lessonAdd.validate() && lessonAdd.save();
					if(flag){
						ajaxData.setContentType("application/x-www-form-urlencoded");
						me.pagination.loadData();
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
				url: URL_COURSEPLAN.LESSON_GETPAGEDLIST, 
				param: this.getParam()
			},function(data){
				if(data && data.length > 0){
					$("#tbodycontent").html($("#tableTmpl").tmpl(data, helper)).setNoDataHtml($("#pagination"));
					//添加title
					common.titleInit();
				}else{
					$("#tbodycontent").html("<tr><td colspan='17'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();
		},
		getParam:function(){
			var param = utils.getQueryParamsByFormObject($("#queryForm"));
			if(param.semester){
				var semster = param.semester.split("_");
				param.academicYear = semster[0];
				param.semesterCode = semster[1];
			}
			param.isBatch = 0;
			return param;
		},
		setUnHanding:function(){
			var param = this.getParam();
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.LESSON_GETUNHANDINGCOUNT, JSON.stringify(param),function(data) {
				if(data.code == config.RSP_SUCCESS){
					 $("#unHanding").html(data.data);
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
			ajaxData.setContentType("application/x-www-form-urlencoded");
		},
		/**
		 * 查看
		 */
		detail:function(obj){
			var _ = $(obj);
			var tr = _.parents("tr");
			var id = tr.attr("code");
			popup.setData("list", this);
			popup.setData("id", id);
			this.detailFrame = popup.open('./courseplan/lesson/html/adjustdetail.html', {
				id : 'addNewclass',// 唯一标识
				title : '调停课查看',// 这是标题
				width : 1200,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				//fixed: true,
				cancelVal:"关闭",
				cancel:function(){
					
				}
			});
		},
		/**
		 * 处理
		 */
		handerange:function(obj){
			var _ = $(obj);
			var tr = _.parents("tr");
			var id = tr.attr("code");
			popup.setData("list", this);
			popup.setData("id", id);
			var me = this;
			this.handerangeFrame = popup.open('./courseplan/lesson/html/adjusthanding.html', {
				id : 'handerangeFrame',// 唯一标识
				title : '调停课处理',// 这是标题
				width : 1200,// 这是弹窗宽度。其实可以不写
				height : 680,// 弹窗高度*/
				okVal : '保存',
				ok : function() {
					var adjustHanding = popup.getData("adjustHanding");
					var flag = adjustHanding.doHanding();
					if(flag){
						ajaxData.setContentType("application/x-www-form-urlencoded");
						me.pagination.loadData();
						me.setUnHanding();
					}
					return flag;
				},
				cancelVal:"关闭",
				cancel:function(){
					ajaxData.setContentType("application/x-www-form-urlencoded");
					me.pagination.loadData();
				},
				close:function(){
					ajaxData.setContentType("application/x-www-form-urlencoded");
					me.pagination.loadData();
					return true;
				}
			});
		}
	}
	
	module.exports = list; //根文件夹名称一致
});