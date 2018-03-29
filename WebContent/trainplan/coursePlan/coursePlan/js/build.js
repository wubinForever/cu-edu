/**
 * 生成课开课计划
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
	 * 生成课开课计划
	 */
	var build = {
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
						//加载年级列表
					    simpleSelect.loadCommon("grade", URL.GENERATE_GETGENERATEGRADELIST,{queryType:1},"","全部","-1",null);
						//加载院系
					    simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},{firstText:"全部",firstValue:"",length:12});
						//加载当前学年学期
					    simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
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
						//点击查询
						$("#query").on("click",function(){
							var param = utils.getQueryParamsByFormId("queryForm");
							param.queryType = 1;
							build.pagination.setParam(param);
						})
						//导出
						$(document).on("click", "button[name='export']", function() {
							ajaxData.exportFile(URL.GENERATE_exportFile,build.pagination.option.param);
						});
						//删除
						$(document).on("click", "button[name='batchdel']", function(){
							  var length = $("input[name='checNormal']:checked").length;
							  var ids = [];
			       		      if(length==0){
			       			    popup.warPop("至少选择一条数据");
			       			    return false;
			       		      }
			       		      $("input[name='checNormal']:checked").each(function(){
			       		          ids.push($(this).attr("id"));
			       		      })
							  build.del(ids);
						});
						//查询分页
						build.getbuildPagedList();
						//生成
						$(document).on("click", "button[name='add']", function(){
							build.add();
						});
					}
				}
			});
		},
		
		//新增
		initAdd:function(){
			
			//加载学年学期
			var objSemester = simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");	
			if($("#semester").val()==null){
				popup.warPop("暂无学年学期无法生成");
				return false;
			}
			
			/**
			 * 生成开课计划优化如下：1.加载年级 ，院系 ，专业 全部采用异步加载
			 *                2.查询培养方案采用视图方式
			 */
			//加载年级列表
		    simpleSelect.loadSelect("grade", URL.GENERATE_grade,{semester:objSemester.getValue()},{firstText:"全部",firstValue:"-1",async:false});
			//加载院系
		    simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},{firstText:"全部",firstValue:"",length:12,async:false});
		    //加载专业
		    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,null,{firstText:"全部",firstValue:"",async:false});
		    //学年学期联动
		    $("#semester").change(function(){
		    	var semester =$(this).val();
		    	//加载年级
		    	var gr = simpleSelect.loadSelect("grade", URL.GENERATE_grade,{semester:semester},{firstText:"全部",firstValue:"-1",async:false});
		    	var reqData = {};
		    	reqData.departmentId=$("#departmentId").val();
		    	reqData.grade= $("#grade").val();
		    	//加载专业
		    	simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{async:false,firstText:"全部",firstValue:""});
		    	//查询待追加的数目
				build.getCoursePlanNumber();
			});
		    //加载年级联动
		    $("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{async:false,firstText:"全部",firstValue:""});
			    //查询待追加的数目
			    build.getCoursePlanNumber();
			});
			//院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{async:false,firstText:"全部",firstValue:""});
				//查询待追加的数目
			    build.getCoursePlanNumber();
			});		
            //查询待追加的数目		
			//必须采用同步，不能采用异步
			build.getCoursePlanNumber();
			//专业 ，学年学期联动
			$("#majorId").on("change",function(){
				build.getCoursePlanNumber();
			})
		},
		//删除
		del:function(ids){
			var reqData={ids:ids};
	    	popup.askPop('确定删除选中的开课计划吗？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.GENERATE_del,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		popup.okPop('删除成功',function(){});
			    		build.pagination.loadData();
					}
					else
					{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							popup.errPop("删除生成开课计划失败");
						}
					}
				});
		   });
		},
		
		//查询分页函数
		getbuildPagedList:function(){
			build.pagination = new pagination({
				id: "pagination", 
				url: URL.GENERATE_getCoursePlanList, 
				param: {semester:$("#semester").val(),queryType:1}
			},function(data){
				 $("#pagination").show();
				 if(data && data.length != 0){
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else{
					 $("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 $("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
		},
		
		//查询待追加的课程数据
		getCoursePlanNumber:function(){
			var reqData = utils.getQueryParamsByFormId("addForm");
			ajaxData.request(URL.GENERATE_getCoursePlanNumber,reqData,function(data){
			            $("#coursePlanNumber").text(data.data+"门")
			},true);
		},
		//新增弹窗
		add: function(){
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var mydialog = popup.open('./trainplan/coursePlan/coursePlan/html/make.html', // 这里是页面的路径地址
					{
						id : 'make',// 唯一标识
						title : '生成开课计划',// 这是标题
						width : 510,// 这是弹窗宽度。其实可以不写
						height : 320,// 弹窗高度
						okVal : '生成',
						cancelVal : '关闭',
						ok:function(iframeObj) {
							if(iframeObj.$("#semester").val()==null){
								popup.warPop("暂无学年学期无法生成");
								return false;
							}
							if(iframeObj.$("#coursePlanNumber").text() =="0门"){
							   popup.warPop("没有可以追加的课程");
							   return false;	
							}
							// ajax提示错误前会自动关闭弹框
							iframeObj.$("body").append("<div class='loading'></div>");// 缓冲提示
							iframeObj.$("body").append("<div class='loading-back'></div>");		
							this.button({name: '生成', disabled: true});
			          		this.button({name: '关闭', disabled: true});
							var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数
							ajaxData.contructor(true);
							ajaxData.request(URL.GENERATE_add,saveParams,function(data){
						    	if(data.code==config.RSP_SUCCESS)
						    	{
						    		iframeObj.$(".loading,.loading-back").remove();
						    		popup.okPop('生成开课计划成功',function(){});
						    		var grade = $("#grade").val();
						    		mydialog.close();
						    		build.pagination.loadData();
						    		simpleSelect.loadSelect("grade", URL.GENERATE_GETGENERATEGRADELIST,{queryType:1},{defaultValue:grade,firstText:"全部",firstValue:"-1",async:false});
								}
								else
								{
									iframeObj.$(".loading,.loading-back").remove();
									popup.errPop("生成开课计划失败");
								}
							});
							return false;// 阻止窗体关闭
						},
						cancel:function(){// 取消逻辑
							mydialog.close();
						}
					});
		}
	}
	module.exports = build;
	window.build = build;
});
