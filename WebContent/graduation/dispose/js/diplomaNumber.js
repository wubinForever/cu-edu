/*
 * 生成毕业证号
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("basePath/config/url.data");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_GRADUATION = require("basePath/config/url.graduation");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var urlUdf = require("basePath/config/url.udf");
	var dataDictionary = require("basePath/config/data.dictionary");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var urlFilesystem = require("basePath/config/url.filesystem");
	var validate = require("basePath/utils/validateExtend");
	var helper = require("basePath/utils/tmpl.helper");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var schollTypeEnum = require("basePath/enumeration/graduation/SchollType");// 学校性质
	
	
	var base  =config.base;
	var importUtils = require("basePath/utils/importUtils");
	var importFileMenu = require("basePath/utils/importFileMenu");
	var importFilePhono = require("basePath/utils/importFilePhoto");
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	var isOnlyChildEnum = require("basePath/enumeration/studentarchives/IsOnlyChild");// 枚举，是否独生子女
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	
	var diplomaNumber = {
			init:function(){
				// 校验
				diplomaNumber.initFormDataValidate($("#queryForm"));
				//毕业年届
				ajaxData.request(
						URL_GRADUATION.GRAD_GRAUATEDATESET_GET,{},
						function(data){
							if(data && data.graduateYear){
								//$("#graduateGrade").val(data.graduateYear);
								var html = [];
								html.push("<option");
								html.push(" value='");
								html.push(data.graduateYear);
								html.push("' ");
								html.push(" >");
								html.push(data.graduateYear);
								html.push("</option>");
								$("#slc_graduateYear").html(html.join(""));
								$("#graduateYear").val(data.graduateYear);
								//毕业年份
								$("#grade").val($("#graduateYear").val());
								$("#spn_grade").html($("#graduateYear").val());
							}
						}
					);
				//绑定学校
//				simpleSelect.loadSelect("schollCode",
//						URL_GRADUATION.GRAD_STUDENT_GRADUATE_GETSCHOOLLIST,
//						{}
//						,
//						{
//							firstText : CONSTANT.PLEASE_SELECT,
//							firstValue : ""
//						});
//				$("#schollCode").bind("click",function(){
//					var val = $(this).val();
//					if(val.length>0){
//						val = "("+val+")";
//					}
//					$("#spn_schoolCode").html(val);
//				});
				ajaxData.request(URL_GRADUATION.GRAD_STUDENT_GRADUATE_GETSCHOOLLIST,{},function(data){
					if(data.code==0 && data.data.length>0){
						var item = data.data[0];
						$("#spn_schoolCode").html("("+item.value+")");
						$("#schollCode").val(item.value);
						$("#lbl_schoolCode").html(item.name);
					}
				});
				
				
				//学校性质
				//simpleSelect.loadDataDictionary("schollType",dataDictionary.SCHOOL_SCHEDULE_CODE,"",CONSTANT.PLEASE_SELECT,"");
				simpleSelect.loadEnumSelect("schollType",schollTypeEnum,{defaultValue:-1,firstText:CONSTANT.PLEASE_SELECT,firstValue:""});
				$("#schollType").bind("change",function(){
					var val = $(this).val();
					if(val.length>0 && val>-1){
						val = val>0?diplomaNumber.removeZero(val):val;
						val = "("+val+")";
						$("#spn_schollType").html(val);
					}else{
						$("#spn_schollType").html("");
					}
					
				})
				
				
				//培养层次
				simpleSelect.loadDataDictionary("trainingLevelCode",dataDictionary.ID_FOR_TRAINING_LEVEL,"",CONSTANT.PLEASE_SELECT,"");
				$("#trainingLevelCode").bind("change",function(){
					var val = $(this).val();
					if(val.length>0){
						val = diplomaNumber.prependZero(val,2);
						val = "("+val+")";
					}
					$("#spn_trainingLevelCode").html(val);
					$("#minNum_error").hide();
					var graduageYear = $("#graduateYear").val();
					ajaxData.request(URL_GRADUATION.GRAD_STUDENT_GRADUATE_GETMINNUM
							,utils.getQueryParamsByFormId("queryForm"),function(data){
								if(data.code==0){
									$("#minNum").val(data.data[0]);
									$("#maxNum").val(data.data[1]);
								}else{
									$("#minNum_error").html(data.msg).show();
									$("#minNum").unbind("blur").blur().val("");
									$("#maxNum").val("");
								}
							});
				})
				//顺序号
				$("#minNum").bind("focus",function(){
//					var flag = diplomaNumber.validate(1,function(){
//						
//						
//					});
					$("#maxNum").val("");
					$("#minNum_error").hide();
					var flag = $("form").valid();
					if(flag){
						$(this).unbind("blur").bind("blur",function(){
							if(diplomaNumber.toInt($(this).val())<1){
								//popup.warPop("顺序号只能为大于0的数字");
								$("#minNum_error").html("顺序号只能为大于0的数字").show();
								return;
							}
							if(diplomaNumber.toInt($("#minNum").val())>999999){
								$("#minNum_error").html("顺序号不能大于6位").show();
								return;
							}
							ajaxData.request(URL_GRADUATION.GRAD_STUDENT_GRADUATE_GETMAXNUM
									,utils.getQueryParamsByFormId("queryForm")
									,function(data){
										if(data.code==0){
											if(data.data>999999){
												$("#minNum_error").html("最大顺序号不能大于6位").show();
												return;
											}
											$("#maxNum").val(data.data);
										}else{
											$("#minNum_error").html(data.msg).show();
											//popup.errPop(data.msg);
											$("#minNum").unbind("blur").blur().val("");
										}
										
							});
						});
					}else{
						$(this).blur();
					}
				})
				
				//清除顺序号
				$("#isNoUsed").bind("change",function(){
					$("#minNum").val("");
					$("#maxNum").val("");
				});
				
				
				//提交
				$(".btn-success").bind("click",function(){
					//var flag = diplomaNumber.validate(0);
					var flag = $("form").valid();
					var data = utils.getQueryParamsByFormId("queryForm");
					data["maxNum"]=$("#maxNum").val();
					if(diplomaNumber.toInt($("#minNum").val())<1){
						$("#minNum_error").html("顺序号只能为大于0的数字").show();
						return;
					}
					if(diplomaNumber.toInt($("#minNum").val())>999999){
						$("#minNum_error").html("顺序号不能大于6位").show();
						return;
					}
					if(diplomaNumber.toInt($("#maxNum").val())<1){
						$("#minNum_error").html("最大顺序号只能为大于0的数字").show();
						return;
					}
					if(diplomaNumber.toInt($("#maxNum").val())>999999){
						$("#minNum_error").html("最大顺序号不能大于6位").show();
						return;
					}
					if(flag){
						ajaxData.request(
								URL_GRADUATION.GRAD_STUDENT_GRADUATE_GENERATEDIPLOMANO
								,data
								,function(data){
									if(data.code==0){
										popup.okPop("生成成功", function() {
											$("#maxNum").val("");
											$("#minNum").val("");
										});
									}else{
										popup.errPop(data.msg);
									}
								},true
							);
						
					}
				});
			}
			,
			validateStr:function(val,obj,msg){
				if(val.length==0){
					popup.errPop(msg);
					obj.focus();
					return false;
				}
				return true;
			}
			,
			validate:function(type,func){
				var flag=true;
				var _schollCode = $("#schollCode").val(); //学校代码
				var _schollType = $("#schollType").val(); //学校性质
				var _trainingLevelCode = $("#trainingLevelCode").val(); //培训层次
				var _graduateGrade = $("#graduateYear").val(); //毕业年份
				var _minNum = diplomaNumber.toInt($("#minNum").val()); //顺序
				if(type==1){
					if(_schollCode.length==0 || _schollType.length==0 || _trainingLevelCode.length==0 || _graduateGrade.length==0){
						popup.errPop("请先选择学校代码、学校性质、培养层次");
						if(func){
							func.apply(this, arguments);
						}
						flag=false;
					}
				}else{
					if(_schollCode.length==0 || _schollType.length==0 
							|| _trainingLevelCode.length==0 || _graduateGrade.length==0
							|| _minNum<1){
						popup.errPop("请先选择学校代码、学校性质、培养层次,起始顺序号");
						if(func){
							func.apply(this, arguments);
						}
						flag=false;
					}
				}
				return flag;
			}
			,
			initFormDataValidate:function(formJQueryObj){
				formJQueryObj.validate({
					rules : {
						schollCode : {
							"required" : true
						},
						schollType : {
							"required" : true
						},
						trainingLevelCode:{
							"required" : true
						}
					},
					messages : {
						schollCode : {
							"required" : '请先选择学校代码',
						},
						schollType : {
							"required" : '请先选择学校性质'
						},
						trainingLevelCode : {
							"required" : '请先选择培养层次'
						}
					},
					onchange : function(ele) {
						$(ele).valid();
					},
					onfocusout : function(ele) {
						$(ele).valid();
					}
				})
			}
			,
			toInt:function(val){
				val = parseInt(val);
				if(isNaN(val)){
					return 0;
				}
				return val;
			}
			,
			removeZero:function(val){
				val = val.replace(/\b(0+)/gi,"");
				return val;
			}
			,
			prependZero:function(val,length){
				return (Array(length).join('0') + val).slice(-length);
			}
	};
	module.exports = diplomaNumber;
	window.diplomaNumber = diplomaNumber;
	
});