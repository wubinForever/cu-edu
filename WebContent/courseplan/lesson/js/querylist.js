/**
 * 调停课查询
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
	var querylist = {
			// 初始化
			init : function() {
				
				
				this.semester = simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
				
				var tag = utils.getUrlParam("tag");
				if(tag){
					//
				}else{
					
				}
				this.loadDepartment();
				//调停课新增弹窗
				this.initPagination();
				
				//批量调停课
				$("button[name='exportBtn']").on('click',function(){
					querylist.exportList();
				});
				$(".queryBtn").click(function(){
					querylist.list();
				});
				$(document).on("click", "button[name=detail]", function(){
					querylist.detail(this);
				});
			},
			// 教室服务
			initMy : function() {
				this.semester = simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
				 var user = window.top.USER;
				 if(user){
					$("#teacherId").val(user.userId);
					//调停课新增弹窗
					this.initPagination();
					//批量调停课
					$("button[name='addBtn']").on('click',function(){
						querylist.addNewclass();
					});
					
					$(".queryBtn").click(function(){
						querylist.list();
					});
					
					$(document).on("click", "button[name=delete]:not(.disabled)", function(){
						querylist.del($(this).parents("tr").attr("code"));
					});
				 }
			},
			/**
			 * 加载年级
			 */
			loadDepartment : function(){
				ajaxData.setContentType("application/x-www-form-urlencoded");
				ajaxData.request(URL_DATA.DEPARTMENT_GETLISTALL, null,function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.departmentName+"", value:item.departmentId});
						});
						simpleSelect.installOption($("#department"), list, "-1", "全部","-1" );
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			},
			//调停课新增弹窗
			exportList : function() {
				ajaxData.exportFile(URL_COURSEPLAN.LESSON_EXPORT, this.pagination.option.param);
			},
			//调停课新增弹窗
			addNewclass : function() {
				popup.setData("lessonList", this);
				var me = this;
				this.addFrame = popup.open('./courseplan/lesson/html/add.html?tag=1', {
					id : 'addNewclass',// 唯一标识
					title : '调停课新增',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 650,// 弹窗高度*/
					okVal : '保存',
					ok : function() {
						var lessonAdd = popup.getData("lessonAdd");
						var flag = lessonAdd.validate() && lessonAdd.save();
						if(flag){
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
				var user = window.top.USER;
				if(data && data.length > 0){
					$.each(data, function(i, item){
						if(user && user.userId == item.createUserId && item.handingStatus == 0){
							item.deleteTag = true;
						}else{
							item.deleteTag = false;
						}
					});
					$("#tbodycontent").html($("#tableTmpl").tmpl(data, helper)).setNoDataHtml($("#pagination"));
				}else{
					$("#tbodycontent").html("<tr><td colspan='16'></td></tr>").addClass("no-data-html");
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
			param.isQuery = 1;
			return param;
		} ,
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
		del :function(id){
			var me = this;
			popup.askDeletePop("调停课", function(){
				ajaxData.setContentType("application/x-www-form-urlencoded");
				ajaxData.request(URL_COURSEPLAN.LESSON_DELETE, {id:id}, function(data){
					 if(data && data.code == config.RSP_SUCCESS){
						 me.pagination.loadData();
					 }else{
						 popup.errPop(data.msg);
					 }
				 });
			});
		}
	}
	
	module.exports = querylist; //根文件夹名称一致
});