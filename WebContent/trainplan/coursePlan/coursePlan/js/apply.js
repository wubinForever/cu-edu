/**
 * 申请开课变更
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
	var commonSpaner = require("basePath/utils/commonSpaner");
	var dataDic = require("configPath/data.dictionary");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var ModuleFlag=require("basePath/enumeration/trainplan/ModuleFlag");
	var base  =config.base;
	
	/**
	 * 申请开课变更
	 */
	var apply = {
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
					    simpleSelect.loadCommon("grade", URL.GENERATE_GETGENERATEGRADELIST,{queryType:2},"","全部","-1",null);
						//加载院系
					    simpleSelect.loadCommon("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","",null);
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
						//查询分页
						apply.getapplyPagedList();
						//点击查询
						$("#query").on("click",function(){
							
							var param = utils.getQueryParamsByFormId("queryForm");
							param.queryType = 2;
							param.auditResult = $("#auditResult").val();
							apply.pagination.setParam(param);
						})
						// 增开课程
						$(document).on("click", "button[name='addCourse']", function() {
							apply.addcourse(this);
						});
						// 增开环节
						$(document).on("click", "button[name='addTache']", function() {
							apply.addtache(this);
						});
						// 修改课程
						$(document).on("click", "[name='editAuditCourse']", function() {
							apply.editCourse(this);
						});
						// 修改环节
						$(document).on("click", "[name='editAuditTache']", function() {
								apply.editTache(this);
						});
						// 停开
						$(document).on("click", "button[name='stop']", function() {
							apply.stop(this);
						});
						//导出
						$(document).on("click", "button[name='export']", function(){
							ajaxData.exportFile(URL.APPLY_EXPORTAPPLYFILE,apply.pagination.option.param);
						});
						//取消增开
						$(document).on("click", "button[name='cancelbutton']", function(){
							var id = $(this).attr("id");
							var changeType = parseInt($(this).attr('changeType'));
							apply.deleteStartClassPlan(id,changeType);
						});
						//停开
						$(document).on("click", "button[name='stopbutton']", function(){
							var id = $(this).attr("id");
							apply.Stop(id);
						});
						//取消修改
						$(document).on("click", "button[name='cancelUpdate']", function(){
							apply.cancelUpdate(this);
						});
						//取消停开
						$(document).on("click", "button[name='cancelstopbutton']", function(){
							var id = $(this).attr("id");
							apply.cancelStop(id);
						});
					}
				}
			});
			
		},
		
		//取消停开
		cancelStop:function(id){
			var reqData = {};
			reqData.id = id;
			popup.askPop('确认取消停开吗？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.APPLY_CANCELSTOP,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		apply.pagination.loadData();
					}
					else
					{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							popup.errPop("取消停开失败");
						}
					}
				});
		   });
		},
		
		//停开
		Stop:function(id){
			var reqData = {};
			reqData.id = id;
			popup.askPop('确认停开吗？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.APPLY_STOP,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		apply.pagination.loadData();
					}
					else
					{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							popup.errPop("停开失败");
						}
					}
				});
		   });
		},
		
		//删除
		deleteStartClassPlan:function(id,changeType){
			var reqData = {};
			reqData.id = id;
			reqData.changeType =changeType;
			popup.askPop('确认取消增开吗？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.APPLY_DELETESTARTCLASSPLAN,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		apply.pagination.loadData();
					}
					else
					{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							popup.errPop("取消增开失败");
						}
					}
				});
		   });
		},
		//增开课程
		initAddCourse:function(){
			
			//加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			//加载年级列表
		    simpleSelect.loadSelect("grade", URL.GRADEMAJOR_GRADELIST,null,{defaultValue:new Date().getFullYear(),firstText:"全部",firstValue:"-1",async:false});
			//加载院系
		    simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},{firstText:"全部",firstValue:"",async:false,length:12});
		    //初始化专业
		    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{async:false});
		    //绑定开课单位下拉框
		    simpleSelect.loadSelect("startUnit", URLDATA.DEPARTMENT_STARTCLASS_FOR_SELECT,{isAuthority:false},{length:9,async:false});		
			//年级联动专业
			$("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{async:false});
			    apply.getWaitCourseList();
			});
			//院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{async:false});
				apply.getWaitCourseList();
			});	
			//专业选择,课程或者环节切换数据源,学期
			$("#majorId,#semester,#trainPlanType").change(function(){
				apply.getWaitCourseList();
			})
			//查询待选择的课程
			apply.getWaitCourseList();
			//查询
			$("#query").on("click",function(){
				apply.getWaitCourseList();
			})
			//给Text绑定onBlur事件 
			$(document).on("blur", "input[myattr='period']", function() {
				apply.setEffectiveDigit($(this));
			});
		},
		/**
		 * 设置成有效的数据，去掉数字前面多余的0
		 * @param id
		 */
		setEffectiveDigit:function(obj){ 
			var val=obj.val(); 
			var reg=/^\d{1,2}(\.\d{1,2})?$/;
			if(reg.test(val)){
				reg = /^(0[0-9])/;
				if(reg.test(val)){
					obj.val(val.replace("0",""));
				}	
			}			 				
		},
		//增开环节
		initAddTache:function(){
			
			//加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			//加载年级列表
		    simpleSelect.loadSelect("grade", URL.GRADEMAJOR_GRADELIST,null,{defaultValue:new Date().getFullYear(),firstText:"全部",firstValue:"-1",async:false});
			//加载院系
		    simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},{firstText:"全部",firstValue:"",async:false,length:12});
		    //初始化专业
		    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{async:false});
		    //绑定开课单位下拉框
		    simpleSelect.loadSelect("startUnit", URLDATA.DEPARTMENT_STARTCLASS_FOR_SELECT,{isAuthority:false},{length:9,async:false});		
			//年级联动专业
			$("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{async:false});
			    apply.getWaitTacheList();
			});
			//院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{async:false});
				apply.getWaitTacheList();
			});	
			//专业选择,课程或者环节切换数据源,学期
			$("#majorId,#semester,#trainPlanType").change(function(){
				apply.getWaitTacheList();
			})
			//专业选择,课程或者环节切换数据源,学期
			$("#majorId,#semester,#trainPlanType").change(function(){
				apply.getWaitTacheList();
			})
			//查询待选择的课程
			apply.getWaitTacheList();
			//查询
			$("#query").on("click",function(){
				apply.getWaitTacheList();
			})
			//给Text绑定onBlur事件 
			$(document).on("blur", "input[myattr='period']", function() {
				apply.setEffectiveDigit($(this));
			});
		},
		
		//修改页面初始化
		innitUpdate:function(){
			// 获取url参数
			var startclassPlanId = utils.getUrlParam('startclassPlanId');
			//加载修改详情
			apply.loadItem(startclassPlanId);
			 //计算总学时
			 $("input[type='text']").on('blur',function(){
				 var totalPeriod=0;
				 $("input[myattr='period']").each(function(){
					var val=$(this).val();
					if(val){
						totalPeriod+=(parseInt(val));
					}		
				})
				$("#totalPeriod2").val(totalPeriod);
			 });
		},

		//查询选择理论课程
		getWaitCourseList:function(){
			
			var reqData = utils.getQueryParamsByFormId("addForm");
			reqData.courseOrTache = 1;//课程
			reqData.startUnit = $("#startUnit").val();
			ajaxData.request(URL.APPLY_GETWAITCOURSEORTACHE_LIST,reqData,function(data){
				if(data && data.data.length != 0){
					 $("#addtbodycontent").removeClass("no-data-html").empty().append($("#addbodyContentImpl").tmpl(data.data));
					 //考核方式
					 $("select[name='checkWayCode']").each(function(index,item){
							var defaultVal=$(this).attr("value");
							simpleSelect.loadDictionarySelect($(this).attr("id"),dataDic.CHECK_WAY_CODE,{defaultValue:defaultVal}); // 绑定考核方式下拉框
							
					  });
					 //课程类别
					 $("select[name='courseTypeCode']").each(function(index,item){
						    var defaultVal=$(this).attr("value");
							simpleSelect.loadDictionarySelect($(this).attr("id"),dataDic.COURSE_TYPE_CODE,{defaultValue:defaultVal}); // 绑定课程类别下拉框			 
					  });
					 //课程属性
					 $("select[name='courseAttributeCode']").each(function(index,item){
							var defaultVal=$(this).attr("value");
							simpleSelect.loadDictionarySelect($(this).attr("id"),dataDic.COURSE_ATTRIBUTE_CODE,{defaultValue:defaultVal}); // 绑定课程属性下拉框				 
						});
		             //计算总学时
					 $("#addtbodycontent input[type='text']").on('blur',function(){
						 var totalPeriod=0;
						 $(this).parent().parent().parent().find("input[type=text]:lt(4)").each(function(){
							var val=$(this).val();
							if(val){
								totalPeriod+=(parseInt(val));
							}		
						});
						$(this).parent().parent().parent().find("td[name=totalPeriod]").html(totalPeriod);
					});
					commonSpaner.spinnerNumber();//加载数字控件
				 }else{
					 $("#addtbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			},true);
		},
		
		//查询环节信息
		getWaitTacheList:function(){
			var reqData = utils.getQueryParamsByFormId("addForm");
			reqData.courseOrTache = 2;//环节
			reqData.startUnit = $("#startUnit").val();
			ajaxData.request(URL.APPLY_GETWAITCOURSEORTACHE_LIST,reqData,function(data){
				if(data && data.data.length != 0){
					 $("#addtbodycontent").removeClass("no-data-html").empty().append($("#addbodyContentImpl").tmpl(data.data));
					 //考核方式
					 $("select[name='checkWayCode']").each(function(index,item){
							var defaultVal=$(this).attr("value");
							simpleSelect.loadDictionarySelect($(this).attr("id"),dataDic.CHECK_WAY_CODE,{defaultValue:defaultVal}); // 绑定考核方式下拉框
					  });
					 
					 common.spinnerNumber();
					 
				 }else{
					 $("#addtbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
				     $('#check-all').removeAttr("checked").parent().removeClass("on-check");
			},true);
		},
		
		//查询生成分页函数
		getapplyPagedList:function(){
			apply.pagination = new pagination({
				id: "pagination", 
				url: URL.GENERATE_getCoursePlanList, 
				param: {semester:$("#semester").val(),queryType:2,auditResult:$("#auditResult").val()}//申请开课变更
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

		/**
		 * 增开课程 弹窗
		 */
		addcourse: function(){
			//var mydialog =art.dialog.open(base+'/trainplan/coursePlan/coursePlan/html/addCourse.html', // 这里是页面的路径地址
			//修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var mydialog =popup.open('./trainplan/coursePlan/coursePlan/html/addCourse.html', // 这里是页面的路径地址
				{
					id : 'addCourse',// 唯一标识
					title : '增开开课课程',// 这是标题
					width : 1300,// 这是弹窗宽度。其实可以不写
					height : 700,// 弹窗高度
					okVal : '保 存',
					ok : function(obj) {
						var obj = this.iframe.contentWindow;
						var majorId = obj.$("#majorId").val();//专业id
						var semester = obj.$("#semester").val();//学年学期
						var grade = obj.$("#grade").val();
						if(utils.isEmpty(majorId)){
							popup.warPop("专业不能为空");
							return false;
						}
						if(utils.isEmpty(semester)){
							popup.warPop("学年学期不能为空");
							return false;
						}
						var length = obj.$("#addtbodycontent input[type=checkbox]:checked").length;
						if(length==0){
							popup.warPop("至少需要选择一条增开的课程");
							return false;
						}
						
						var j="";
						var h="";
						obj.$("#addtbodycontent input[type=checkbox]").parent().parent().parent().find("td[name='totalPeriod']").each(function(i,item){
							var totaoperiod=parseInt($(item).html());
							if($(this).parent().find("input[type=checkbox]:checked").length>0){
								i=i+1;
								if(totaoperiod == 0){
									j=j+i+",";
									return false;
								}	
							}
						})
						if(j.length>0){
							popup.warPop("第"+j.substring(0,j.length-1)+"行，理论学时、实验学时、实践学时、其他学时至少有一个学时大于0");
							return false;
						}
						
						obj.$("#addtbodycontent input[type=checkbox]").parent().parent().parent().find("input[name='weekPeriod']").each(function(i,item){
							var add=$(item).val();
							if($(this).parent().parent().parent().find("input[type=checkbox]:checked").length>0){
								i=i+1;
							if(utils.isEmpty(add)){
								h=h+i+",";
								return false;
							}	
							}
						})
						if(h.length>0){
							popup.warPop("第"+h.substring(0,h.length-1)+"行，请填写周学时");
							return false;
						}
						
						
						var backData = [];
						//获取列表需要的数据数组形式
						obj.$("#addtbodycontent input[type=checkbox]:checked").parent().parent().parent().each(function(i,item){
							
							var credit=parseInt($(item).find("td[name='credit']").html());//学分
							var totalperiod = parseInt($(item).find("td[name='totalPeriod']").html());//总学时
							var theoryPeriod = parseInt($(item).find("input[name='theoryPeriod']").val());//理论学时
							var experiPeriod = parseInt($(item).find("input[name='experiPeriod']").val());//实验学时
							var practicePeriod = parseInt($(item).find("input[name='practicePeriod']").val());//实践学时
							var otherPeriod = parseInt($(item).find("input[name='otherPeriod']").val());//其他学时
							var weekPeriod = parseInt($(item).find("input[name='weekPeriod']").val());//周学时
							var checkWayCode = $(item).find("select[name='checkWayCode']").val();//考核方式
							var courseTypeCode = parseInt($(item).find("select[name='courseTypeCode']").val());//课程类别
							var courseAttributeCode = parseInt($(item).find("select[name='courseAttributeCode']").val());//课程属性
							var courseId = $(item).find("td[name='courseId']").html();//课程Id
							var gradeMajorId = $(item).find("td[name='gradeMajorId']").html();//年级专业Id
							var majorTheoryId = $(item).find("td[name='majorTheoryId']").html();//理论id
							var reqData = {};
							reqData.credit =credit;
							reqData.totalperiod =totalperiod;
							reqData.theoryPeriod =theoryPeriod;
							reqData.experiPeriod =experiPeriod;
							reqData.practicePeriod =practicePeriod;
							reqData.otherPeriod =otherPeriod;
							reqData.weekPeriod =weekPeriod;
							reqData.checkWayCode =checkWayCode;
							reqData.courseTypeCode =courseTypeCode;
							reqData.courseAttributeCode =courseAttributeCode;
							reqData.courseId =courseId;
							reqData.gradeMajorId =gradeMajorId;
							reqData.semester = semester;
							reqData.majorId = majorId;
							reqData.grade = grade;
							reqData.classType = 1;
							reqData.majorTheoryId = majorTheoryId;
							backData.push(reqData);
						})
						var reqre={};
						reqre.startClassPlanDto=backData;
						var josn=JSON.stringify(reqre);
						var reqData = {
								courseListJson : josn
						};
						//请求到后台
						ajaxData.contructor(false);
					    ajaxData.request(URL.APPLY_ADDSTARTCLASSPLAN,reqData,function(data){
					    	if(data.code==config.RSP_SUCCESS)
					    	{
					    		popup.okPop("增开课程成功",function(){});
					    		var grade  = $("#grade").val();
					    		apply.pagination.loadData();//局部刷新列表
					    		simpleSelect.loadSelect("grade",  URL.GENERATE_GETGENERATEGRADELIST,{queryType:2},{defaultValue:grade,firstText:"全部",firstValue:"-1",async:false});
					    		mydialog.close();
							}
							else
							{
								if(data.code==config.RSP_WARN){
									 popup.warPop(data.msg);//后台验证
								}else{
									popup.warPop("增开开课计划失败");
								}
							}
						});
					    return false;
					},
					button: [
					{
						name: '保 存',
						focus:true,//按钮高亮
						callback: function () {
						},
						focus: true
					},
					{name: '保存并新增', callback: function () {
						
						var obj = this.iframe.contentWindow;
						var majorId = obj.$("#majorId").val();//专业id
						var semester = obj.$("#semester").val();//学年学期
						var grade = obj.$("#grade").val();
						if(utils.isEmpty(majorId)){
							popup.warPop("专业不能为空");
							return false;
						}
						if(utils.isEmpty(semester)){
							popup.warPop("学年学期不能为空");
							return false;
						}
						var length = obj.$("#addtbodycontent input[type=checkbox]:checked").length;
						if(length==0){
							popup.warPop("至少需要选择一条增开的课程");
							return false;
						}
						var j="";
						var h="";
						obj.$("#addtbodycontent input[type=checkbox]").parent().parent().parent().find("td[name='totalPeriod']").each(function(i,item){
							var totaoperiod=parseInt($(item).html());
							if($(this).parent().find("input[type=checkbox]:checked").length>0){
								i=i+1;
								if(totaoperiod == 0){
									j=j+i+",";
									return false;
								}	
							}
						})
						if(j.length>0){
							popup.warPop("第"+j.substring(0,j.length-1)+"行，理论学时、实验学时、实践学时、其他学时至少有一个学时大于0");
							return false;
						}
						
						obj.$("#addtbodycontent input[type=checkbox]").parent().parent().parent().find("input[name='weekPeriod']").each(function(i,item){
							var add=$(item).val();
							if($(this).parent().parent().parent().find("input[type=checkbox]:checked").length>0){
								i=i+1;
							if(utils.isEmpty(add)){
								h=h+i+",";
								return false;
							}	
							}
						})
						if(h.length>0){
							popup.warPop("第"+h.substring(0,h.length-1)+"行，请填写周学时");
							return false;
						}
						apply.saveCourse(obj);
						return false;
					}},
					{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							mydialog.close();
						});
						return false;
					}}]				
				});
		},
		
		//保存课程
		saveCourse:function(obj){
			var majorId = obj.$("#majorId").val();//专业id
			var semester = obj.$("#semester").val();//学年学期
			var grade = obj.$("#grade").val();
			var backData = [];
			//获取列表需要的数据数组形式
			obj.$("#addtbodycontent input[type=checkbox]:checked").parent().parent().parent().each(function(i,item){
				
				var credit=parseInt($(item).find("td[name='credit']").html());//学分
				var totalperiod = parseInt($(item).find("td[name='totalPeriod']").html());//总学时
				var theoryPeriod = parseInt($(item).find("input[name='theoryPeriod']").val());//理论学时
				var experiPeriod = parseInt($(item).find("input[name='experiPeriod']").val());//实验学时
				var practicePeriod = parseInt($(item).find("input[name='practicePeriod']").val());//实践学时
				var otherPeriod = parseInt($(item).find("input[name='otherPeriod']").val());//其他学时
				var weekPeriod = parseInt($(item).find("input[name='weekPeriod']").val());//周学时
				var checkWayCode = $(item).find("select[name='checkWayCode']").val();//考核方式
				var courseTypeCode = parseInt($(item).find("select[name='courseTypeCode']").val());//课程类别
				var courseAttributeCode = parseInt($(item).find("select[name='courseAttributeCode']").val());//课程属性
				var courseId = $(item).find("td[name='courseId']").html();//课程Id
				var gradeMajorId = $(item).find("td[name='gradeMajorId']").html();//年级专业Id
				var majorTheoryId = $(item).find("td[name='majorTheoryId']").html();//理论id
				var reqData = {};
				reqData.credit =credit;
				reqData.totalperiod =totalperiod;
				reqData.theoryPeriod =theoryPeriod;
				reqData.experiPeriod =experiPeriod;
				reqData.practicePeriod =practicePeriod;
				reqData.otherPeriod =otherPeriod;
				reqData.weekPeriod =weekPeriod;
				reqData.checkWayCode =checkWayCode;
				reqData.courseTypeCode =courseTypeCode;
				reqData.courseAttributeCode =courseAttributeCode;
				reqData.courseId =courseId;
				reqData.gradeMajorId =gradeMajorId;
				reqData.semester = semester;
				reqData.majorId = majorId;
				reqData.grade = grade;
				reqData.classType = "1";
				reqData.majorTheoryId = majorTheoryId;
				backData.push(reqData);
			})
			var reqre={};
			reqre.startClassPlanDto=backData;
			var josn=JSON.stringify(reqre);
			var reqData = {
					courseListJson : josn
			};
			//请求到后台
			ajaxData.contructor(false);
		    ajaxData.request(URL.APPLY_ADDSTARTCLASSPLAN,reqData,function(data){
		    	if(data.code==config.RSP_SUCCESS)
		    	{
		    		popup.okPop("增开课程成功",function(){});
		    		obj.location.reload();
				}
				else
				{
					if(data.code==config.RSP_WARN){
						 popup.warPop(data.msg);//后台验证
						 return false;
					}else{
						popup.errPop("增开开课计划失败");
					}
				}
			});
		},
		
		//增开环节
		saveTache:function(obj){
			var backData = [];
			var majorId = obj.$("#majorId").val();//专业id
			var semester = obj.$("#semester").val();//学年学期
			var grade = obj.$("#grade").val();
			if(utils.isEmpty(majorId)){
				popup.warPop("专业不能为空");
				return false;
			}
			if(utils.isEmpty(semester)){
				popup.warPop("学年学期不能为空");
				return false;
			}
			var length = obj.$("#addtbodycontent input[type=checkbox]:checked").length;
			if(length==0){
				popup.warPop("至少需要选择一条增开的环节");
				return false;
			}
			//获取列表需要的数据数组形式
			obj.$("#addtbodycontent input[type=checkbox]:checked").parent().parent().parent().each(function(i,item){
				var credit=parseInt($(item).find("input[name='credit']").val());//学分
				var weekNum=parseInt($(item).find("input[name='weekNum']").val());//周数
				var courseId = $(item).find("td[name='courseId']").html();//课程Id
				var gradeMajorId = $(item).find("td[name='gradeMajorId']").html();//年级专业Id
				var majorTheoryId = $(item).find("td[name='majorTheoryId']").html();//理论id
				var checkWayCode = $(item).find("select[name='checkWayCode']").val();//考核方式
				var reqData = {};
				reqData.credit = credit;
				reqData.weekNum = weekNum;
				reqData.courseId = courseId;
				reqData.gradeMajorId = gradeMajorId;
				reqData.semester =semester;
				reqData.grade=grade;
				reqData.majorId = majorId;
				reqData.checkWayCode = checkWayCode;
				reqData.classType = "2";
				reqData.majorTheoryId = majorTheoryId;
				backData.push(reqData);
			})
			var reqre ={};
			reqre.startClassPlanDto=backData;
			var josn=JSON.stringify(reqre);
			var reqData = {
					courseListJson : josn
			};
			//请求到后台
			ajaxData.contructor(false);
		    ajaxData.request(URL.APPLY_ADDSTARTCLASSPLAN,reqData,function(data){
		    	if(data.code==config.RSP_SUCCESS)
		    	{
		    		popup.okPop("增开环节成功",function(){});
		    		obj.location.reload();
				}
				else
				{
					if(data.code==config.RSP_WARN){
						 popup.warPop(data.msg);//后台验证
						
					}else{
						 popup.warPop("增开环节失败");
					}
				}
			});
		},
		
		/**
		 * 增开环节 弹窗
		 */
		addtache: function(){
		//修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
		var mydialog=popup.open('./trainplan/coursePlan/coursePlan/html/addTache.html', // 这里是页面的路径地址
				{
					id : 'addTache',// 唯一标识
					title : '增开开课环节',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 700,// 弹窗高度
					okVal : '保 存',
					ok : function(obj) {
						var backData = [];
						var majorId = obj.$("#majorId").val();//专业id
						var semester = obj.$("#semester").val();//学年学期
						var grade = obj.$("#grade").val();
						if(utils.isEmpty(majorId)){
							popup.warPop("专业不能为空");
							return false;
						}
						if(utils.isEmpty(semester)){
							popup.warPop("学年学期不能为空");
							return false;
						}
						var length = obj.$("#addtbodycontent input[type=checkbox]:checked").length;
						if(length==0){
							popup.warPop("至少需要选择一条增开的环节");
							return false;
						}
						//获取列表需要的数据数组形式
						obj.$("#addtbodycontent input[type=checkbox]:checked").parent().parent().parent().each(function(i,item){
							var credit=parseInt($(item).find("input[name='credit']").val());//学分
							var weekNum=parseInt($(item).find("input[name='weekNum']").val());//周数
							var courseId = $(item).find("td[name='courseId']").html();//课程Id
							var gradeMajorId = $(item).find("td[name='gradeMajorId']").html();//年级专业Id
							var majorTheoryId = $(item).find("td[name='majorTheoryId']").html();//理论id
							var checkWayCode = $(item).find("select[name='checkWayCode']").val();//考核方式
							var reqData = {};
							reqData.credit = credit;
							reqData.weekNum = weekNum;
							reqData.courseId = courseId;
							reqData.gradeMajorId = gradeMajorId;
							reqData.semester =semester;
							reqData.grade=grade;
							reqData.classType = "2";
							reqData.majorId = majorId;
							reqData.majorTheoryId = majorTheoryId;
							reqData.checkWayCode =checkWayCode;
							backData.push(reqData);
						})
						var reqre ={};
						reqre.startClassPlanDto=backData;
						var josn=JSON.stringify(reqre);
						var reqData = {
								courseListJson : josn
						};
						//请求到后台
						ajaxData.contructor(false);
					    ajaxData.request(URL.APPLY_ADDSTARTCLASSPLAN,reqData,function(data){
					    	if(data.code==config.RSP_SUCCESS)
					    	{
					    		popup.okPop("增开环节成功",function(){});
					    		var grade  = $("#grade").val();
					    		apply.pagination.loadData();//局部刷新列表
					    		simpleSelect.loadSelect("grade",  URL.GENERATE_GETGENERATEGRADELIST,{queryType:2},{defaultValue:grade,firstText:"全部",firstValue:"-1",async:false});
					    		mydialog.close();
					    	}
							else
							{
								if(data.code==config.RSP_WARN){
									 popup.warPop(data.msg);//后台验证
								}else{
									 popup.warPop("增开环节失败");
								}
							}
						});
					    return false;
					},
					button: [
						{
							name: '保 存',
							focus:true,//按钮高亮
							callback: function () {
							},
							focus: true
						},
						{
							name: '保存并新增',
							focus: true,//按钮高亮
							callback: function () {
								var obj = this.iframe.contentWindow;
								var majorId = obj.$("#majorId").val();//专业id
								var semester = obj.$("#semester").val();//学年学期
								var grade = obj.$("#grade").val();
								if(utils.isEmpty(majorId)){
									popup.warPop("专业不能为空");
									return false;
								}
								if(utils.isEmpty(semester)){
									popup.warPop("学年学期不能为空");
									return false;
								}
								var length = obj.$("#addtbodycontent input[type=checkbox]:checked").length;
								if(length==0){
									popup.warPop("至少需要选择一条增开的课程");
									return false;
								}
								apply.saveTache(obj);
								obj.location.reload();
								return false;
							}
						},
						{
							name: '取 消',
							focus:true,//按钮高亮
							callback: function () {
								popup.askPop("确认取消吗？",function(){
									mydialog.close();
								});
								return false;
							},
							focus: true
						}
					]
				});
		},
		
		/**
		 * 修改课程
		 */
		editCourse: function(obj){
			var startclassPlanId = $(obj).attr("id");// 获取this对象的属性
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var mydialog = popup.open('./trainplan/coursePlan/coursePlan/html/editCourse.html?startclassPlanId='+startclassPlanId, // 这里是页面的路径地址
				{
					id : 'editCourse',// 唯一标识
					title : '开课计划修改申请',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 600,// 弹窗高度
					okVal : '保存',
					cancelVal : '取消',
					button:[
 					        {
									name : '保存',
									focus : true,
									callback : function() {
										var iframe = this.iframe.contentWindow;
										var reqData ={};
										var totalPeriod = iframe.$("#totalPeriod2").val();
										var theoryPeriod = iframe.$("#theoryPeriod2").val();
										var experiPeriod = iframe.$("#experiPeriod2").val();
										var practicePeriod = iframe.$("#practicePeriod2").val();
										var otherPeriod = iframe.$("#otherPeriod2").val();
										var weekPeriod = iframe.$("#weekPeriod2").val();
										var checkWayCode = iframe.$("#checkWayCode2").val();
										var courseTypeCode = iframe.$("#courseTypeCode2").val();
										var courseAttributeCode = iframe.$("#courseAttributeCode2").val();
										reqData.totalPeriod = totalPeriod;
										reqData.theoryPeriod = theoryPeriod;
										reqData.experiPeriod=experiPeriod;
										reqData.practicePeriod=practicePeriod;
										reqData.otherPeriod=otherPeriod;
										reqData.weekPeriod=weekPeriod;
										reqData.checkWayCode=checkWayCode;
										reqData.courseTypeCode=courseTypeCode;
										reqData.courseAttributeCode=courseAttributeCode;
										reqData.startclassPlanId=startclassPlanId;
										reqData.courseOrTache = 1;//课程
										if(utils.isEmpty(iframe.$("#totalPeriod2").val())){
											popup.warPop("周学时不能为空");
											return false;
										}
										//请求到后台
										ajaxData.contructor(false);
									    ajaxData.request(URL.APPLY_SAVE,reqData,function(data){
									    	if(data.code==config.RSP_SUCCESS)
									    	{
									    		popup.okPop("修改课程成功",function(){});
									    		apply.pagination.loadData();
											}
											else
											{
												if(data.code==config.RSP_WARN){
													 popup.warPop(data.msg);
												}else{
													popup.errPop("修改课程失败");
												}
											}
										});
									}
								},
								{
									name: '取 消',
									focus:false,
									callback: function (){
										popup.askPop("确认取消吗？",function(){
											mydialog.close();
										});
										return false;
									}
								},
								
					        ],
					
				});
		},
		/**
		 * 修改环节
		 */
		editTache: function(obj){
			var startclassPlanId = $(obj).attr("id");// 获取this对象的属性
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			popup.open('./trainplan/coursePlan/coursePlan/html/editTache.html?startclassPlanId='+startclassPlanId, // 这里是页面的路径地址
				{
					id : 'editTache',// 唯一标识
					title : '开课计划修改申请',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 600,// 弹窗高度
					okVal : '保存',
					cancelVal : '取消',
					ok : function(iframeobj) {
						
						var reqData ={};
						var weekNum = iframeobj.$("#weekNum2").val();//周数
						var checkWayCode = iframeobj.$("#checkWayCode2").val();//考核方式
						reqData.weekNum = weekNum;
						reqData.checkWayCode = checkWayCode;
						reqData.startclassPlanId=startclassPlanId;
						reqData.courseOrTache = 2;//环节
						//请求到后台
						ajaxData.contructor(false);
					    ajaxData.request(URL.APPLY_SAVE,reqData,function(data){
					    	if(data.code==config.RSP_SUCCESS)
					    	{
					    		popup.okPop("修改环节成功",function(){});
					    		apply.pagination.loadData();
							}
							else
							{
								if(data.code==config.RSP_WARN){
									 popup.warPop(data.msg);
								}else{
									popup.errPop("修改环节失败");
								}
							}
						});
						
						
						return true;
					},
					cancel : function() {
						// 取消逻辑
					}
				});
		},
		
		/**
		 * 根据主键加载课程和环节信息
		 */
		loadItem:function(startclassPlanId){
			// 加载属性
			ajaxData.request(URL.APPLY_GETITEM, {startclassPlanId:startclassPlanId}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS){
					var rvData = data.data;	
					utils.setForm($("#addForm"),rvData); //表单自动绑定
					simpleSelect.loadGenerelSelect("grade",{firstText:rvData.grade,firstValue:rvData.grade}); //绑定年级
					simpleSelect.loadGenerelSelect("departmentId",{firstText:rvData.departmentName,firstValue:rvData.departmentId}); //绑定院系
					simpleSelect.loadGenerelSelect("majorId",{firstText:rvData.majorName,firstValue:rvData.majorId}); //绑定专业
					simpleSelect.loadGenerelSelect("startUnit",{firstText:rvData.startUnit,firstValue:rvData.startUnit}); //绑定开课单位
					simpleSelect.loadGenerelSelect("semester",{firstText:rvData.academicYear+"-"+(rvData.academicYear+1)+rvData.semesterName,firstValue:rvData.academicYear+"_"+rvData.semesterCode}); //绑定学年学期
					simpleSelect.loadDictionarySelect("checkWayCode",dataDic.CHECK_WAY_CODE,{defaultValue:rvData.checkWayCode}); //绑定考核方式下拉框					
					simpleSelect.loadDictionarySelect("courseTypeCode",dataDic.COURSE_TYPE_CODE,{defaultValue:rvData.courseTypeCode}); //绑定课程类别下拉框					
					simpleSelect.loadDictionarySelect("courseAttributeCode",dataDic.COURSE_ATTRIBUTE_CODE,{defaultValue:rvData.courseAttributeCode}); //绑定课程属性下拉框
					simpleSelect.loadDictionarySelect("checkWayCode2",dataDic.CHECK_WAY_CODE); //绑定考核方式下拉框					
					simpleSelect.loadDictionarySelect("courseTypeCode2",dataDic.COURSE_TYPE_CODE); //绑定课程类别下拉框					
					simpleSelect.loadDictionarySelect("courseAttributeCode2",dataDic.COURSE_ATTRIBUTE_CODE); //绑定课程属性下拉框
					simpleSelect.loadDictionarySelect("courseType",dataDic.TACHE_TYPE_CODE,{defaultValue:rvData.courseTypeCode}); //绑定环节类别
					//给数字控件绑定click事件 
					$(".mybutton").click(function(){
						var totalPeriod=0;
						$("input[myattr='period']").each(function(index,item){
							var val=$(this).val();
							if(val){
								totalPeriod+=(parseInt(val));
							}			 
						});
						$("#totalPeriod2").val(totalPeriod);
					});
				}
			},true);
		},
		
		/**
		 * 取消修改
		 */
		cancelUpdate:function(obj){
			var startclassPlanId = $(obj).attr("id");// 获取this对象的属性
			var reqData = {};
			reqData.startclassPlanId = startclassPlanId;
			//请求到后台
			ajaxData.contructor(false);
		    ajaxData.request(URL.APPLY_CANCELUPDATE,reqData,function(data){
		    	if(data.code==config.RSP_SUCCESS)
		    	{
		    		popup.okPop("取消修改成功",function(){});
		    		apply.pagination.loadData();
				}
				else
				{
					if(data.code==config.RSP_WARN){
						 popup.warPop(data.msg);
					}else{
						popup.errPop("取消修改失败");
					}
				}
			});
		    
		}
		
	}
	module.exports = apply;
	window.apply = apply;
});
