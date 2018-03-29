/**
 * 设置学分及门数上限js
 */
define(function (require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.trainplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	var base = config.base;
	/**
	 * 设置学分及门数上限
	 */
	//模块化
	var creditandnumlimit = {
		courseTypeData : null,
		queryObjectParam :{},
		init:function(){
			$('#numLimitValue').hide();
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			// 加载年级列表
		    simpleSelect.loadCommon("grade", URL.GRADEMAJOR_GRADELIST,null,"","","",null);
		    // 加载院系
		    simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
				departmentClassCode : "1",
				isAuthority : true
			}, {
				firstText : "全部",
				firstValue : "",
				async : false
			});
		    // 绑定课程类型
		    creditandnumlimit.bindCourseType();
			// 表格文字点击切换输入框
			$(document).on("click", ".edit-td", function(e){
				if(!creditandnumlimit.isFocus){
					creditandnumlimit.editTdShow(e);
				}
			});
			// input绑定onBlur事件 
			$(document).on("blur", "input[myattr='limit']", function(obj) {
				var limitType = obj.currentTarget.id.split("|")[6];
				var reg = limitType== 1 ? /^[0-9][0-9]?(\.\d)?$/ : /^[0-9][0-9]?$/;
				
				obj.currentTarget.value=obj.currentTarget.value.replace(/(\s*$)/g, "");
				
				if(obj.currentTarget.value.replace(/(\s*$)/g, "") == ""){
					creditandnumlimit.isFocus = false;
				}
				else{
					if(!reg.test(obj.currentTarget.value.replace(/(\s*$)/g, "")) || (limitType == 1 && obj.currentTarget.value > 99.99) ||(limitType == 2 && obj.currentTarget.value >= 100)){
						var errorMsg = limitType == 1 ? "学分上限只能输入空值、0和小于100的正数，可以有1位小数" : "门数上限只能输入空值、0和小于100的正整数";
						popup.warPop(errorMsg);
						creditandnumlimit.isFocus = true;
						$(obj.currentTarget).focus();
					}
					else{
						creditandnumlimit.isFocus = false;
					}
				}
				if(!creditandnumlimit.isFocus){
					creditandnumlimit.save(obj);
				}
			});
			// 动态创建表格元素
			creditandnumlimit.createTableColumn();
			// 全局参数初始化
			creditandnumlimit.queryObjectParam = creditandnumlimit.queryObject();
			// 初始化加载列表数据
			creditandnumlimit.getDataList();
			// 查询按钮
			$("#query").on("click",function(){
				creditandnumlimit.queryObjectParam = creditandnumlimit.queryObject();
				creditandnumlimit.getDataList('0');
			});
			//学分门数上限下拉改变事件
			creditandnumlimit.limitTypeChange();
			// 批量设置按钮
			$("#batchSave").on("click",function(){
				creditandnumlimit.batchSave();
			});
			// 权限
			authority.init();
		},
		
		/**
		 * 获取查询条件
		 */
		queryObject : function() {
			var param = utils.getQueryParamsByFormId("queryForm");
			if (param.semester) {
				param.academicYear = param.semester.split("_")[0];
				param.semesterCode = param.semester.split("_")[1];
			}		
			delete param.semester;
			return param;
		},
		
		/*
		 * 点击单元格显示输入框
		*/ 
		editTdShow : function(obj){
			var _this = $(obj.currentTarget);
			_this.parents("#tbodycontent").find("input.td-edit-inp").hide().prev("span").show();
			_this.children("span").hide().next("input.td-edit-inp").show().focus();
		},
		/*
		 * 绑定学分门数下拉改变事件
		*/
		limitTypeChange : function() {
			$(document).on("change", "#limitType",function(){
				 if($(this).val() == "1"){
					 $("#creditLimitValue").show();
					 $("#creditLimitValue").val("");
					 $('#numLimitValue').hide();
				 }
				 else{
					 $('#creditLimitValue').hide();
					 $('#numLimitValue').show();
					 $("#numLimitValue").val("");
				 }
			 });
		},
		/*
		 * 绑定课程类型下拉
		*/ 
		bindCourseType : function() {
			ajaxData.request(URL_CHOICECOURSE.CREDITANDNUMLIMIT_GETCOURSETYPELIST, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var optionString = "";  
					for(var i = 0 ;i < data.data.length; i++){
						var name = data.data[i].dataDictionaryName;
						if(name.length > 8){
							name = name.substring(0,8) + '...'; 
						}
						optionString += "<option title=\"" + data.data[i].dataDictionaryName + "\" value=\"" + data.data[i].code + "\" >" + name + "</option>"; 
					}
					 $("#courseType").html(optionString);  
				}
			});
		},
		/*
		 * 动态创建表格元素
		*/
		createTableColumn : function() {
			ajaxData.request(URL_CHOICECOURSE.CREDITANDNUMLIMIT_GETCOURSETYPELIST, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					for(var i = 0 ;i < data.data.length; i++){
						creditandnumlimit.courseTypeData = data;
						//动态创建表格元素
						$("#topLimit").before('<th width="70" colspan="2">' + data.data[i].dataDictionaryName + '</th>');
						$("#numLimit0").before('<th width="35" id=' + data.data[i].code + "^_^credit" + '>学分<br>上限</th>');
						$("#numLimit0").before('<th width="35" id=' + data.data[i].code + "^_^num" + '>门数<br>上限</th>');
					}
				}
			});
		},
		/*
		 * 查询开课计划的年级专业对应的学分门数上限列表
		*/
		getDataList : function() {
			var reqData = creditandnumlimit.queryObjectParam;//获取查询参数
			ajaxData.request(URL_CHOICECOURSE.CREDITANDNUMLIMIT_GETLIST, reqData, function(data) {
			$("#tbodycontent").html("");
			$("#tbodycontent").removeClass("no-data-html");
			$("#list").val("");
			if (data.code == config.RSP_SUCCESS) {
				if(data.data.length > 0){
					$("#list").val(data.data[0].gradeMajorIdList);
					// 循环绑定<tr>
					for(var i = 0 ;i < data.data.length; i++){
						var html;
						html+="<tr data-tt-id='"+data.data[i].gradeMajorId+"'>"; 
	                    html+="<td class='width45'>"+data.data[i].indexNum+"</td>"; 
	                    html+="<td class='width20 text-l' title='"+data.data[i].departmentName+"'>"+data.data[i].departmentName+"</td>"; 
	                    html+="<td class='width20 text-l' title='"+data.data[i].majorName+"'>"+data.data[i].majorName+"</td> "; 
	                    // 根据课程类型、课程属性、通识课动态生成<td>
	                	for(var j = 0 ;j < creditandnumlimit.courseTypeData.data.length; j++){
	                		var creditLimit="";
                			var numLimit ="";
	                		// 判断年级专业是否存在学分及门数上限数据
	                		if(data.data[i].list != null && data.data[i].list.length > 0){
	                			var hasData = false;
	                			var x = 0;
	                			// 循环判断学分及门数上限的课程类型是否与当前课程类型一致
	                			for(var m = 0 ; m < data.data[i].list.length; m++){
	                				x = m;
	                    			if(data.data[i].list[m].code == creditandnumlimit.courseTypeData.data[j].code ){
	                				   hasData = true;
	                    			   break;
	                        		}
	                    		}	                			
	                		    // 绑定该课程类型的学分及门数上限值
	            			    if(hasData){
	            			    	 creditLimit = data.data[i].list[x].creditLimit == null ? "" : data.data[i].list[x].creditLimit;
	            			    	 numLimit = data.data[i].list[x].numLimit == null ? "" : data.data[i].list[x].numLimit;	            				    
	            			    }	           			   
	            		    }
	                		// 没有设置当前专业的学分及门数数据，则创建空的<td>元素
	                		html+="<td class='text-r edit-td'><span>"+creditLimit+"</span>"; 
 				            html+="<input onKeypress=\"javascript:if(event.keyCode == 32)event.returnValue = false;\" id="+data.data[i].gradeMajorId+"|"+data.data[i].academicYear+"|"+data.data[i].semesterCode+"|"+data.data[i].grade+"|"+data.data[i].majorId+"|"+data.data[i].departmentId+"|1|"+ creditandnumlimit.courseTypeData.data[j].code+" type='text' myattr='limit' class='td-edit-inp per100' value='"+creditLimit+"'/>"; 
 	                        html+="</td>"; 
 	                        html+="<td class='text-r edit-td'><span>"+numLimit +"</span>"; 
 				            html+="<input onKeypress=\"javascript:if(event.keyCode == 32)event.returnValue = false;\" id="+data.data[i].gradeMajorId+"|"+data.data[i].academicYear+"|"+data.data[i].semesterCode+"|"+data.data[i].grade+"|"+data.data[i].majorId+"|"+data.data[i].departmentId+"|2|"+ creditandnumlimit.courseTypeData.data[j].code+" type='text' myattr='limit' class='td-edit-inp per100' value='"+numLimit+"'/>"; 
 	                        html+="</td>"; 
	            	     }
	                     html+="</tr>"; 
					     $("#tbodycontent").html(html);
				     }
				}
				else{
					 $("#tbodycontent").append("<tr><td colspan=" + creditandnumlimit.courseTypeData.data.length * 2+3 +"></td></tr>").addClass("no-data-html");
				}
			 } 
		  },true);
	  },
	  /*
	   * 批量设置
	  */
	  batchSave : function() {
		  // 参数
		  var reqData = creditandnumlimit.queryObjectParam;//获取查询参数
		  if(reqData.academicYear == null || reqData.academicYear == ""){
			  popup.warPop("请选择学年学期");
			  return false;
		  }
		  if($("#list").val() == "" || $("#list").val() == null){
			  popup.warPop("无数据可设置");
			  return false;
		  }
		  var params = {};
		  params.gradeMajorIdList = $("#list").val();
		  params.courseTypeCode = $("#courseType").val().split("|")[0];
		  params.courseAttributeCode = $("#courseType").val().split("|")[1];
		  params.limitType = $("#limitType").val();
		  params.limitValue = params.limitType == "1" ? $("#creditLimitValue").val().replace(/(\s*$)/g, "") : $("#numLimitValue").val().replace(/(\s*$)/g, "");
		  params.isBatchSetup = 1;
		  ajaxData.request(URL_CHOICECOURSE.CREDITANDNUMLIMIT_ADD,params, function(data) {
			 if (data.code == config.RSP_SUCCESS) {
				  // 提示成功
				  popup.okPop("保存成功", function() {
				  });
				  // 刷新列表
				  creditandnumlimit.getDataList();
			 } 
			 else if (data.code == config.RSP_FAIL) {
				  // 提示失败信息
				  popup.errPop(data.msg);
				  return false;
			      } 
			 else {
				  // 提示失败
				   popup.errPop("保存失败");
				   return false;
			 }
		  });
	  },
	  /*
	   * 保存
	  */
	  save : function(obj) {
		  // 参数
		  var reqData = creditandnumlimit.queryObjectParam;//获取查询参数
		  var params = {};
		  var value =  obj.currentTarget.value == "" ? obj.currentTarget.placeholder : obj.currentTarget.value
		  params.gradeMajorIdList = obj.currentTarget.id;
		  params.limitType = obj.currentTarget.id.split("|")[6];
		  params.courseTypeCode = obj.currentTarget.id.split("|")[7];
		  params.courseAttributeCode = obj.currentTarget.id.split("|")[8];
		  params.limitValue = value.replace(/(\s*$)/g, "");
		  params.isBatchSetup = 0;
		  ajaxData.request(URL_CHOICECOURSE.CREDITANDNUMLIMIT_UPDATE,params, function(data) {
			 if (data.code == config.RSP_SUCCESS) {
				  // 刷新列表		   
				  var cmdata = $(obj.currentTarget).val();
				  $(obj.currentTarget).hide();
			      $(obj.currentTarget).siblings('span').text(cmdata).show();
			 } 
			 else if (data.code == config.RSP_FAIL) {
				  // 提示失败信息
				  popup.errPop(data.msg);
				  return false;
			      } 
			 else {
				  // 提示失败
				   popup.errPop("保存失败");
				   return false;
			 }
		  });
	  },
		/** ********************* end ******************************* */
	}
	module.exports = creditandnumlimit;
	window.creditandnumlimit = creditandnumlimit;
});	