/**
 * 审核开课变更
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.trainplan");
	var UDFURL = require("configPath/url.udf");
	var URLDATA = require("configPath/url.data");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var pagination = require("basePath/utils/pagination");
	var dataDic = require("configPath/data.dictionary");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var ModuleFlag=require("basePath/enumeration/trainplan/ModuleFlag");
	var base  =config.base;
	
	/**
	 * 审核开课变更
	 */
	var audit = {
		    //初始化
			init : function() {
				//判断当前时间是否能进入
				ajaxData.contructor(false);
				ajaxData.request(URL.OPENTIME_CAN_ENTER_INTO, {}, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data==false){
							//location.href= utils.getRootPathName() + "/trainplan/setTrainPlan/majorTheory/html/forbade.html?ModuleFlag="+ModuleFlag.StartClassPlan.value;
							$("body").html(
									"<div class='layout-index text-center'"
									+"style='width:500px;position: absolute;top:50%;left: 50%;margin-left:-250px;margin-top:-200px;font-size:16px;'>"
									+"<img src='../../../../common/images/icons/warning.png' />"
									+"<p style='margin:20px 0px 10px;'>对不起，您暂时不能对此功能进行操作！</p>"
									+"<p class='notice-con'>请在开课计划维护时间内执行操作!</p>"
									+"</div>");
						}else{
							//加载当前学年学期
						    simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");	
							//加载年级
						    simpleSelect.loadCommon("grade", URL.GENERATE_GETGENERATEGRADELIST,{queryType:3},"","全部","-1",null);
							//加载院系
						    simpleSelect.loadCommon("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","",null);
						    //初始化专业
						    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{firstText:"全部",firstValue:""});
						    //年级联动专业
							$("#grade").change(function(){
								var reqData={};
								reqData.grade =$(this).val();
							    reqData.departmentId=$("#departmentId").val();
							    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
							});
							//院系联动专业
							$("#departmentId").change(function(){
								var reqData={};
								reqData.departmentId = $(this).val();
								reqData.grade = $("#grade").val();
								simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
							});
							//查询分页
							audit.getAuditPagedList();
							//点击查询
							$("#query").on("click",function(){
								var param = utils.getQueryParamsByFormId("queryForm");
								param.queryType = 3;
								audit.pagination.setParam(param);
							})
							//导出
							$(document).on("click", "button[name='export']", function(){
								ajaxData.exportFile(URL.AUDIT_EXPORTAUDITFILE,audit.pagination.option.param);
							});
							// 审核
							$(document).on("click", "button[name='audit']", function() {
								  var length = $("input[name='checNormal']:checked").length;
								  var ids = [];
				      		      if(length==0){
				      			    popup.warPop("至少选择一条数据");
				      			    return false;
				      		      }
				      		      $("input[name='checNormal']:checked").each(function(){
				      		          ids.push($(this).attr("id"));
				      		      })
								 audit.cancelAudit(ids,1);
							});
				           // 取消审核
							$(document).on("click", "button[name='cancelAudit']", function() {
								  var length = $("input[name='checNormal']:checked").length;
								  var ids = [];
				     		      if(length==0){
				     			    popup.warPop("至少选择一条数据");
				     			    return false;
				     		      }
				     		      $("input[name='checNormal']:checked").each(function(){
				     		          ids.push($(this).attr("id"));
				     		      })
								audit.cancelAudit(ids,2);
							});
						}
					}
				});			
		},
		
		//审核取消审核
		cancelAudit:function(ids,a){
	    	var reqData={ids:ids,flag:a};
	    	popup.askPop(a == 1 ? '确定审核选中开课变更申请吗？' : '确定取消审核选中开课变更申请吗？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.APPLY_AUDITSTARUS,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS){
			    		popup.okPop(a == 1 ? '审核成功!' : '取消审核成功!',function(){});
			    		audit.pagination.loadData();
					}
					else{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							popup.errPop(a == 1 ? '审核失败!' : '取消审核失败!',function(){
							});
						}
						
					}
				});
		   });
	    },
		
		//查询生成分页函数
		getAuditPagedList:function(){
			audit.pagination = new pagination({
				id: "pagination", 
				url: URL.GENERATE_getCoursePlanList, 
				param: {semester:$("#semester").val(),queryType:3,auditResult:$("#auditResult").val()}//审核开课变更
			},function(data){
				 $("#pagination").show();
				 if(data && data.length != 0){
					 $("#audittbodycontent").removeClass("no-data-html").empty().append($("#auditbodyContentImpl").tmpl(data));
				 }else{
					 $("#audittbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 $("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
		},
		
	}
	module.exports = audit;
	window.audit = audit;
});
