/**
 * 查询培养方案
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.trainplan");
	var urlData = require("configPath/url.data");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var dataDictionary=require("configPath/data.dictionary");	
	var select = require("basePath/module/select"); // 下拉框
	var simpleSelect = require("basePath/module/select.simple");
	var courseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var base  =config.base;	
	
	var printListQueryparams=[]; //全局
	var globalIndex=0; //全局数组下标
	var firstEntry=true; //全局
	
	/**
	 * 专业理论课程
	 */
	var view = {			
		
		/** ******************* list初始化 开始 ******************* */
		init : function() {			
			//加载年级列表
		    simpleSelect.loadSelect("grade", url.GRADEMAJOR_GRADELIST,null,{firstText:"全部",firstValue:-1});
			//加载院系
		    simpleSelect.loadSelect("departmentId", urlData.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:departmentClassEnum.TEACHINGDEPARTMENT.value},{firstText:"全部",firstValue:"",length:12});
		    //初始化专业
		    simpleSelect.loadSelect("majorId", url.GRADEMAJOR_MAJORLIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{firstText:"全部",firstValue:""});
		    // 绑定开课单位下拉框
			simpleSelect.loadSelect("kkDepartmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:false},{firstText:"全部",firstValue:"",length:12});
			// 绑定课程or环节
			simpleSelect.loadEnumSelect("courseOrTache",courseOrTache, {firstText:"全部",firstValue:""});
			//年级联动专业
			$("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    simpleSelect.loadSelect("majorId", url.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
			});
			//院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				simpleSelect.loadSelect("majorId", url.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
			});
			
			//初始化列表分页数据
			view.pagination = new pagination({
				id: "pagination", 
				url: url.MAJORTHEORY_GET_PAGED_LIST, 
				param: utils.getQueryParamsByFormId("queryForm")
			},function(data){				
				$("#pagination").show();
				 if(data && data.length>0) {
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='20'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//取消全选
			}).init();			

			// 查询
			$('#query').click(function() {
				view.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});	
							
			// 导出
			$('#export').click(function() {
				ajaxData.exportFile(url.MAJORTHEORY_EXPORT_COURSE_AND_TACHE, view.pagination.option.param);
			});	
			
			//tab切换------
			$(function(){
				var $tabBox = $(".tab-box"),
					$tabLi = $tabBox.children(".tab-hd").find("li");  //注意children()的用法
				$bdCon = $tabBox.children(".tab-bd").find(".bd-con");
				$tabLi.click(function(){
					var index = $(this).index();
					$(this).addClass("cur").siblings("li").removeClass("cur");
					$bdCon.hide().eq(index).fadeIn(300);
					if(index==1 && firstEntry==true){
						firstEntry=false;
						///** ******************* 打印tab 开始 ******************* */
						//加载年级列表
					    simpleSelect.loadSelect("grade2", url.GRADEMAJOR_GRADELIST,null,{defaultValue:new Date().getFullYear(),async:false});
						//加载院系
					    simpleSelect.loadSelect("departmentId2", urlData.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:departmentClassEnum.TEACHINGDEPARTMENT.value},{firstText:"全部",firstValue:"",async:false,length:12});
					    //初始化专业
					    simpleSelect.loadSelect("majorId2", url.GRADEMAJOR_MAJORLIST,{grade:$("#grade2").val(),departmentId:$("#departmentId2").val()},{firstText:"全部",firstValue:"",async:false,length:12});
					    // 绑定开课单位下拉框
						simpleSelect.loadSelect("kkDepartmentId2",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:false},{firstText:"全部",firstValue:"",length:12});
						// 绑定课程or环节
						simpleSelect.loadEnumSelect("courseOrTache2",courseOrTache);
						// 绑定培养层次
						simpleSelect.loadDictionarySelect("trainingLevelCode2",dataDictionary.ID_FOR_TRAINING_LEVEL,{firstText:"全部",firstValue:"",async:false});
						//年级联动专业
						$("#grade2").change(function(){
							var reqData={};
							reqData.grade =$(this).val();
						    reqData.departmentId=$("#departmentId2").val();
						    simpleSelect.loadSelect("majorId2", url.GRADEMAJOR_MAJORLIST,reqData);
						});
						//院系联动专业
						$("#departmentId2").change(function(){
							var reqData={};
							reqData.departmentId = $(this).val();
							reqData.grade = $("#grade2").val();
							simpleSelect.loadSelect("majorId2", url.GRADEMAJOR_MAJORLIST,reqData);
						});
						//初始化打印列表
						//view.LoadPrintList();
						// 查询
						$('#query2').click(function() {
							$("#btnLoadMore").show();
							view.LoadPrintList();							
						});	
						$("#btnLoadMore").hide();
						// 加载更多
						$("#btnLoadMore").click(function(){
							view.getDataList(true);
						});
						//打印
						$("#btnPrint").click(function(){
							view.getAllDataList();
						});
					}
				});
			});
			
			
		},
		/** ******************* list初始化 结束 ******************* */
		/**
		 * 初始化学校数据
		 */
		initSchoolInfo:function(){
			ajaxData.request(urlData.SCHOOL_GET, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {					
					$("#spanSchoolName").html(data.data.schoolName+"专业");
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}				
			});
		},
		
		
		/**
		 * 加载打印列表
		 */
		LoadPrintList:function(){
			
			// 清空全局变量和界面
			printListQueryparams.length=0;	
			globalIndex=0;
			$("#divBody").empty();
			
			//初始化学校信息
			view.initSchoolInfo();
			$("#spanCourseOrTache").html($("#courseOrTache2").find("option:selected").text()+"安排"); 
			
			//获取所有的下拉框选项
			var grade=$("#grade2").val(); //年级
			var departmentId=$("#departmentId2").val(); //院系
			var majorIds=[]; //专业
			if($("#majorId2").val()!=""){
				majorIds.push($("#majorId2").val());
			}else{
				majorIds=$("#majorId2 option").map(function(){return $(this).val();}).get(); 
			}
			var kkDepartmentId=$("#kkDepartmentId2").val(); //开课单位
			var courseOrTache=$("#courseOrTache2").val(); //理论or环节			
			var trainingLevelCodes=[]; //培养层次
			if($("#trainingLevelCode2").val()!=""){
				trainingLevelCodes.push($("#trainingLevelCode2").val());
			}else{
				trainingLevelCodes=$("#trainingLevelCode2 option").map(function(){return $(this).val();}).get(); 
			}		
			
            // 根据下拉框选项 计算所有的请求参数
			if(majorIds){
				for(var i=0;i<majorIds.length;i++){ //专业
					if(majorIds[i]!=""){
						if(trainingLevelCodes){
							for(var j=0;j<trainingLevelCodes.length;j++){ //培养层次
								if(trainingLevelCodes[j]!=""){
									var params={
											grade:grade,
											departmentId:departmentId,
											majorId:majorIds[i],
											kkDepartmentId:kkDepartmentId,
											courseOrTache:courseOrTache,
											trainingLevelCode:trainingLevelCodes[j]
									}
									printListQueryparams.push(params);
								}						
							}
						}						
					}								
				}
			}
			
			
			//初始化加载一个表格
			view.getDataList(false);	
					
		},
		
		/**
		 * 获取数据
		 */
		getDataList:function(isMore){		
			if(globalIndex<printListQueryparams.length){				
				ajaxData.contructor(false);
				ajaxData.request(url.MAJORTHEORY_GET_PRINT_LIST, printListQueryparams[globalIndex], function(data) {
					if (data.code == config.RSP_SUCCESS) {
						var tempCourseOrTache=printListQueryparams[globalIndex].courseOrTache; // 获取加载的数据是专业理论课程 还是 专业实践环节
						globalIndex=globalIndex+1; //游标下移
						if(data.data){ // 有数据就去绑定
							if(tempCourseOrTache==courseOrTache.Course.value){ // 专业理论课程
								view.bindMajorCourseList(data.data);
							}
							else{ // 专业实践环节
								view.bindMajorTacheList(data.data);
							}
						}else{ //没数据就继续请求，直到有一个数据为止
							view.getDataList(isMore);
						}
						
						
					} else {
						// 提示失败
						popup.errPop(data.msg);
						return false;
					}				
				},true);	
			}
			else{
				// 没有数据了
				if(isMore){
					popup.okPop("没有更多数据了", function() {});
				}
				else{
					$("#divBody").append($('<table class="table"><tbody class="no-data-html"><tr><td colspan="25"></td></tr></tbody></table>')); 
				}
				
				$("#btnLoadMore").hide();
			}						
		},
		
		/**
		 * 获取所有数据
		 */
		getAllDataList:function(){	
			while(globalIndex<printListQueryparams.length){
				if(globalIndex<printListQueryparams.length){				
					ajaxData.contructor(false);
					ajaxData.request(url.MAJORTHEORY_GET_PRINT_LIST, printListQueryparams[globalIndex], function(data) {
						if (data.code == config.RSP_SUCCESS) {
							var tempCourseOrTache=printListQueryparams[globalIndex].courseOrTache; // 获取加载的数据是专业理论课程 还是 专业实践环节
							globalIndex=globalIndex+1; //游标下移
							if(data.data){ // 有数据就去绑定
								if(tempCourseOrTache==courseOrTache.Course.value){ // 专业理论课程
									view.bindMajorCourseList(data.data);
								}
								else{ // 专业实践环节
									view.bindMajorTacheList(data.data);
								}
							}
						} else {
							// 提示失败
							popup.errPop(data.msg);
							return false;
						}				
					});	
				}		
			}
			// 加载完了，开始打印			
			$("#btnLoadMore").hide();
			$("#printBody").jqprint();
		},
		
		/**
		 * 绑定专业理论课程列表
		 */
		bindMajorCourseList:function(data){
			if(data) {
				//有数据就显示出来
				 $("#divBody").append($("#bodyCourseImpl").tmpl(data)); 
			 }	
		},
		
		/**
		 * 绑定专业实践环节列表
		 */
		bindMajorTacheList:function(data){
			if(data) {
				 $("#divBody").append($("#bodyTacheImpl").tmpl(data)); 
			 }			
		}
	}
	module.exports = view;
	window.view = view;
});
