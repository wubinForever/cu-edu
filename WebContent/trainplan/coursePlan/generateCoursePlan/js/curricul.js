/**
 * 通识课开课计划
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
	var commonSpaner = require("basePath/utils/commonSpaner");
	var pagination = require("basePath/utils/pagination");
	var dataDic = require("configPath/data.dictionary");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var ModuleFlag=require("basePath/enumeration/trainplan/ModuleFlag");
	var base  =config.base;
	var waitData=[];//存放待选择数据
	/**
	 * 通识课开课计划
	 */
	var curricul = {
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
					    simpleSelect.loadCommon("grade", URL.CURRICUL_GETGRADELIST,null,"","全部","-1",null);
						//加载院系
					    simpleSelect.loadCommon("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","-1",null);
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
							param.isCoreCurriculum = 1;//查询通识课
							curricul.pagination.setParam(param);
						})
						//导出
						$(document).on("click", "button[name='export']", function() {
							ajaxData.exportFile(URL.CURRICUL_exportCurriculFile,curricul.pagination.option.param);
						});
						//加载当前学年学期
						simpleSelect.loadCommonSmester("semester",URLDATA.COMMON_GETSEMESTERLIST,"","","");
						//查询分页
						curricul.getCurriculPagedList();
						//批量删除
						$(document).on("click", "button[name='batchdel']", function() {
							  var length = $("input[name='checNormal']:checked").length;
							  var ids = [];
			       		      if(length==0){
			       			    popup.warPop("至少选择一条数据");
			       			    return false;
			       		      }
			       		      $("input[name='checNormal']:checked").each(function(){
			       		          ids.push($(this).attr("id"));
			       		      })
							  curricul.del(ids);
						});
						// 新增
						$(document).on("click", "button[name='add']", function() {
							curricul.add(this);
						});
						// 单个删除
						$(document).on("click", "button[name='del']", function() {
							var ids = [];
							ids.push($(this).attr("startclassplanid"));
							curricul.del(ids);
						});
					}
				}
			});			
		},
		//新增初始化
		initAdd:function(){
			//加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			//加载课程列表
			curricul.getCourseTable();
			//查询操作
			$("#query").on("click",function(){
				if($("#coreCurriculum:checked").length>0){
					curricul.getCurriculList();
				}else{
				    //点击查询
					var param ={};
					param.departmentId=$("#departmentId").val();//开课单位
					param.bigCourseCode =$("#bigCourseCode").val();//课程大类
					param.isCoreCurriculum =$("#isCoreCurriculum").val();//是否通识课程
					param.courseNo =$("#courseNo").val();//课程号/名称
					param.courseOrTache =1;//查询课程信息
					param.semester = $("#semester").val();//学年学期
					curricul.pagination.setParam(param);
				}
			});
			//绑定开课单位下拉框
			simpleSelect.loadSelect("departmentId",URLDATA.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:false},{firstText:"全部",firstValue:""});
			// 绑定课程大类下拉框
			var bigClassSelectObj = simpleSelect.loadDataDictionary("bigCourseCode",dataDic.COURSE_BIG_CATEGORY, null,"全部","");
			
			//点击上学期开设课程置灰
			$("#coreCurriculum").on("click",function(){
				if($(this).prop("checked")==true){
					$("#departmentId").attr("disabled",true);
					$("#bigCourseCode").attr("disabled",true);
					$("#courseNo").attr("disabled",true);
					$("#isCoreCurriculum").attr("disabled",true);
					$("#courseNo").val("");//清空
					$("#isCoreCurriculum").val("0");//清空
					$("#bigCourseCode").val("");
					$("#departmentId").val("");
				}else{
					$("#departmentId").attr("disabled",false);
					$("#bigCourseCode").attr("disabled",false);
					$("#isCoreCurriculum").attr("disabled",false);
					$("#courseNo").attr("disabled",false);
				}
			})
			//年级下拉
			 simpleSelect.loadCommon("grade", URL.GRADEMAJOR_GRADELIST,null,(new Date).getFullYear(),"全部","-1",null);
			//校区下拉
			simpleSelect.loadCommon("campusId", URLDATA.CAMPUS_GETALL,{isAuthority:false},"","全部","",null);
			//加载院系
		    simpleSelect.loadCommon("departmentIds", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","",null);
			//校区联动院系
			$("#campusId").change(function(){
			  var reqData = {};
			  reqData.campusId = $(this).val();
			  if(utils.isEmpty($(this).val())){
				  simpleSelect.loadCommon("departmentIds", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","",null);
			  }else{
				  simpleSelect.loadCommon("departmentIds", URL.CURRICUL_getDepartmentSelectList,reqData,"","全部","",null);
			  }
			})
			//加载培养层次
		     simpleSelect.loadDataDictionary("trainingLevelCode", dataDic.ID_FOR_TRAINING_LEVEL,"","全部","");
			//加载左列表
			 curricul.getLeftTableList();
			 //查询左列表
			 $("#leftquery").on("click",function(){
				 curricul.getLeftTableList();
			 });
			 utils.checkAllCheckboxes("check-all-left","checNormals");
			 utils.checkAllCheckboxes("check-all-right","cheNormlri");
			 //年级开设专业新增页面-添加
			 $("button[name='btnAdd']").bind("click", function() {
				 curricul.addGradeMajor(this);
			 });
			 //年级开设专业-移除
			 $("button[name='btnDelete']").bind("click", function() {
				 curricul.deleteGradeMajor(this);
			 });
			 //选择学年学期进行联动下表
			 $("#semester").change(function(){
				 var coreCurriculum =$("#coreCurriculum:checked").length;
				 if(coreCurriculum>0){
					 curricul.getCurriculList(); //课程信息表
				 }else{
					 curricul.getCourseTable(); //课程信息表
				 }
				 curricul.getLeftTableList(); //专业表
				 $("#rightTable").html(""); //同时清空右列表
				 $('#check-all-right').removeAttr("checked").parent().removeClass("on-check"); //同时取消全选
				 $("#rightNumber").text(0);
			 });
				curricul.checkTableTrLenght("rightTable");
		},
		
		/**
		 * 通识课开课计划右移
		 */
		addGradeMajor:function(){
				// 获取勾选项
				var gradeMajorIds=[];
				var html ="";
				var rightTabl=[];
				//获取右边列表数据的数组
				$("#rightTable input[type='checkbox']").each(function(){
					rightTabl.push($(this).val());//专业id
				})
				//拼装右边
				$("#leftTable input[type='checkbox']:checked").each(function(i,item){
					var html="";
					var grademajorId = $(this).val();
					var majorId = $(this).attr("majorId");
					var grade = $(this).parent().parent().parent().find("td[name='grade']").html();//专业号
					var campusName = $(this).parent().parent().parent().find("td[name='campusName']").html();//专业名称
					var departmentName = $(this).parent().parent().parent().find("td[name='departmentName']").html();//院系
					var majorNo=$(this).parent().parent().parent().find("td[name='majorNo']").html();//学制
					var majorName=$(this).parent().parent().parent().find("td[name='majorName']").html();//专业名称
					var educationSys=$(this).parent().parent().parent().find("td[name='educationSys']").html();//学制
					var trainlevelName=$(this).parent().parent().parent().find("td[name='trainLevelName']").html();//培养层次
					gradeMajorIds += $(this).val()+",";
					var result =$.inArray($(this).val(), rightTabl)
					if(result !=-1){
						return ;//右边如果隐藏到时再加
					}
					html+="<tr class='tr-checkbox'>" +
							"<td class='width03'><div class='checkbox-con'>" +
							"<input type='checkbox' class='checNormal' name='cheNormlri' value='"+grademajorId+"' majorId = '"+majorId+"'  ></div></td>" +
							"<td name='grade' class='width48' title="+grade+" >"+grade+"</td>" +
							"<td name='campusName' class='text-l width70' title="+campusName+">"+campusName+"</td>" +
							"<td name='departmentName' class='text-l' title="+departmentName+" >"+departmentName+"</td>" +
							"<td name='majorNo' class='text-l width60' title="+majorNo+" >"+majorNo+"</td>" +
							"<td name='majorName' class='text-l' title="+majorName+" >"+majorName+"</td>" +
							"<td name='educationSys' class='width48'>"+educationSys+"</td>" +
							"<td class='width48' name='trainLevelName'>"+trainlevelName+"</td>" +
							"</tr>";
		             $("#rightTable").append(html);
					//拼完右边并将左边移除
					$(this).parent().parent().parent().remove();
					
				});
				$('#check-all-left').removeAttr("checked").parent().removeClass("on-check");
			    $('#check-all-right').removeAttr("checked").parent().removeClass("on-check");
				$("#leftNumber").text($("#leftTable input[type='checkbox']").length);
				$("#rightNumber").text($("#rightTable input[type='checkbox']").length);
				curricul.checkTableTrLenght("leftTable");
				curricul.checkTableTrLenght("rightTable");
		},
	
		/**
		 * 通识课开课计划左移
		 */
		deleteGradeMajor:function(){
				var gradeMajorIds=[];
				//拼装左边
				$("#rightTable input[type='checkbox']:checked").each(function(i,item){
					//先移除再判断是否往右边拼接
					$(this).parent().parent().parent().remove();
					var html="";
					var grademajorId = $(this).val();
					var majorId = $(this).attr("majorId");
					var grade = $(this).parent().parent().parent().find("td[name='grade']").html();//专业号
					var campusName = $(this).parent().parent().parent().find("td[name='campusName']").html();//专业名称
					var departmentName = $(this).parent().parent().parent().find("td[name='departmentName']").html();//院系
					var majorNo=$(this).parent().parent().parent().find("td[name='majorNo']").html();//学制
					var majorName=$(this).parent().parent().parent().find("td[name='majorName']").html();//专业名称
					var educationSys=$(this).parent().parent().parent().find("td[name='educationSys']").html();//学制
					var trainlevelName=$(this).parent().parent().parent().find("td[name='trainLevelName']").html();//培养层次
					gradeMajorIds += $(this).val()+",";
					var result =$.inArray($(this).val(), waitData)//=-1就说明不存在
					if(result ==-1){
						return ;//右边如果隐藏到时再加
					}
					html+="<tr class='tr-checkbox'>" +
					"<td class='width03'><div class='checkbox-con'>" +
					"<input type='checkbox' class='checNormal' name='checNormals'   value='"+grademajorId+"'  majorId = '"+majorId+"'></div></td>" +
					"<td name='grade' class='width48' title="+grade+" >"+grade+"</td>" +
					"<td name='campusName' class='text-l width70' title="+campusName+" >"+campusName+"</td>" +
					"<td name='departmentName' class='text-l'  title="+departmentName+" >"+departmentName+"</td>" +
					"<td name='majorNo' class='text-l width60' title="+majorNo+" >"+majorNo+"</td>" +
					"<td name='majorName' class='text-l'  title="+majorName+" >"+majorName+"</td>" +
					"<td name='educationSys' class='width48'>"+educationSys+"</td>" +
					"<td class='width48' name='trainLevelName'>"+trainlevelName+"</td>" +
					"</tr>";
                    $("#leftTable").append(html);
				});
				var LeftLength =$("#leftTtable input[type='checkbox']:checked").length;
				var rightLength =$("#leftTtable input[type='checkbox']:checked").length;
				if(LeftLength==0){
					$('#check-all-left').removeAttr("checked").parent().removeClass("on-check");
				}
				if(rightLength==0){
					$('#check-all-right').removeAttr("checked").parent().removeClass("on-check");
				}
				if($("#leftTtable input[type='checkbox']").length != $("#leftTtable input[type='checkbox']:checked").length){
					$('#check-all-left').removeAttr("checked").parent().removeClass("on-check");
				}
				
				if($("#rightTable input[type='checkbox']").length != $("#rightTable input[type='checkbox']:checked").length){
					$('#check-all-right').removeAttr("checked").parent().removeClass("on-check");
				}
				//重新生成已选择
				$("#rightNumber").text($("#rightTable input[type='checkbox']").length);
				$("#leftNumber").text($("#leftTable input[type='checkbox']").length);
				curricul.checkTableTrLenght("rightTable");
				curricul.checkTableTrLenght("leftTable");
			},
		checkTableTrLenght:function(obj){
			//判断右侧是否有数据,没有数据则显示暂无数据
			var trLength=$("#"+obj+" tr").length;
			if(trLength==0){
			 $("#"+obj).empty().addClass("no-data-html");
			}else{
				$("#"+obj).removeClass("no-data-html");
			}
			
		
		},
		//查询左列表
		getLeftTableList:function(){
			var grade = $("#grade").val();
			var campusId = $("#campusId").val();
			var departmentId =$("#departmentIds").val();
			var majorNo = $("#majorNo").val();
			var majorName = $("#majorName").val();
			var trainingLevelCode = $("#trainingLevelCode").val();
			var semester = $("#semester").val();
			var reqData={};
			reqData.grade=grade;
			reqData.campusId=campusId;
			reqData.DepartmentId=departmentId;
			reqData.majorNo=majorNo;
			reqData.majorName=majorName;
			reqData.trainingLevelCode=trainingLevelCode;
			reqData.semester=semester;
			ajaxData.contructor(false);
			ajaxData.request(URL.GRADEMAJOR_getLeftTableList,reqData,function(data){
				 waitData= [];
				 if(data && data.data.length != 0){
					 var datas =data.data;
					 var majorIds =[];
					 var dataList = [];
					 $("#rightTable input[type='checkbox']").each(function(){
						 var MajorId =$(this).val();
						 majorIds.push(MajorId);
					 });
					 var flag =true;
					 for(var i=0;i<datas.length;i++){
						for(var j=0;j<majorIds.length;j++){
							if(datas[i].gradeMajorId==majorIds[j]){
								flag =false;
								break;
							}else{
								flag =true;
							}
						}
						if(flag){
							dataList.push(datas[i]);
						}
					 }
					 $("#leftTable").removeClass("no-data-html").empty().append($("#leftTableImpl").tmpl(dataList));
					 $("#leftNumber").text(dataList.length);
					 for(var i=0;i<datas.length;i++){
						 waitData.push(datas[i].gradeMajorId);
					 }
				 }else{
					 $("#leftTable").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 $("#leftNumber").text(0);
				 }
				 $('#check-all-left').removeAttr("checked").parent().removeClass("on-check");
			},true);
		},
		 //查询通识课分页
		 getCourseTable:function(){
				curricul.pagination = new pagination({
					id: "pagination", 
					url: URL.CURRICUL_getCoursList, 
					param: {courseOrTache:1,isCoreCurriculum:$("#isCoreCurriculum").val()}
				},function(data){
					 $("#pagination").show();
					 if(data){
						 $("#courseTable").removeClass("no-data-html").empty().append($("#courseTableImpl").tmpl(data));
						//绑定考核方式下拉框
						 $("select[name='checkWayCode']").each(function(index,item){
								var defaultVal=$(this).attr("value");
								simpleSelect.loadDictionarySelect($(this).attr("id"),dataDic.CHECK_WAY_CODE,{defaultValue:defaultVal}); // 绑定考核方式下拉框
						  });
						 //计算总学时
						 $("#courseTable input[type='text']").on('blur',function(){
							 var totalPeriod=0;
							 $(this).parent().parent().parent().find("input[type=text]:lt(4)").each(function(){
								var val=$(this).val();
								if(val){
									totalPeriod+=(parseInt(val));
								}		
							})
							$(this).parent().parent().parent().find("td[name=totalPeriod]").html(totalPeriod);
						 });
						 commonSpaner.spinnerNumber();
					 }else{
						 $("#courseTable").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
						 $("#pagination").hide();
					 }
					 $('#check-all').removeAttr("checked").parent().removeClass("on-check");
				}).init();
		},
	    //查询上学期通识课开课计划信息
		getCurriculList:function(){
			var semester = $("#semester").val();//拿到当前学期
			var reqData ={};
			reqData.semester = semester;
			ajaxData.request(URL.CURRICUL_getCuriculList,reqData,function(data){
				 if(data && data.data.length != 0){
					 $("#courseTable").removeClass("no-data-html").empty().append($("#courseTableImpl").tmpl(data.data));
					 //绑定考核方式下拉框
					 $("select[name='checkWayCode']").each(function(index,item){
						var defaultVal=$(this).attr("value");
						simpleSelect.loadDictionarySelect($(this).attr("id"),dataDic.CHECK_WAY_CODE,{defaultValue:defaultVal}); // 绑定考核方式下拉框
					 });
					 //计算总学时
					 $("#courseTable input[type='text']").on('blur',function(){
						 var totalPeriod=0;
						 $(this).parent().parent().parent().find("input[type=text]:lt(4)").each(function(){
							var val=$(this).val();
							if(val){
								totalPeriod+=(parseInt(val));
							}		
						})
						$(this).parent().parent().parent().find("td[name=totalPeriod]").html(totalPeriod);
					 });
					 
				 }else{
					 $("#courseTable").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
				 $("#pagination").hide();
				 commonSpaner.spinnerNumber();
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			},true);
			
		},
		//查询分页函数
		getCurriculPagedList:function(){
			curricul.pagination = new pagination({
				id: "pagination", 
				url: URL.CURRICUL_getCurriculumPagedList, 
				param: {semester:$("#semester").val(),isCoreCurriculum:1}
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
		 * 删除
		 * @param ids
		 */
		del:function(ids){
	    	var reqData={ids:ids};
	    	popup.askPop('确认删除选择的通识课开课计划？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.CURRICUL_deleteCurricul,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		curricul.pagination.loadData();
					}
					else
					{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							popup.errPop("删除选择的通识课开课计划失败");
						}
					}
			    	//取消全选
			    	$('#check-all').removeAttr("checked").parent().removeClass("on-check");
				});
		   });
	    },
		//新增弹窗
		add: function(){
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var mydialog = popup.open('./trainplan/coursePlan/generateCoursePlan/html/add.html', // 这里是页面的路径地址
				{
					id : 'add',// 唯一标识
					title : '通识课开课计划新增',// 这是标题
					width : 1400,// 这是弹窗宽度。其实可以不写
					height : 750,// 弹窗高度
					button: [{name: '保存', callback: function () {
						var obj = this.iframe.contentWindow;
						//定义一个大的数组进行数据绑定到后台
						var courseBack =[];
						var gradeMajorBack=[];
						//进行新增代码叉乘
						var obj = this.iframe.contentWindow;
						var courseLenth = obj.$("#courseTable input[type='checkbox']:checked").length;
						if(courseLenth==0){
							popup.warPop("课程至少选择一条数据");
							return false;
						}
						var majorNameLength = obj.$("#rightTable input[type='checkbox']").length;
						var j="";
						var h="";
						obj.$("#courseTable input[type=checkbox]").parent().parent().parent().find("td[name='totalPeriod']").each(function(i,item){
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
						
						obj.$("#courseTable input[type=checkbox]").parent().parent().parent().find("input[name='weekPeriod']").each(function(i,item){
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
						if(majorNameLength==0){
							popup.warPop("请选择专业");
							return false;
						}
						var academicYear = obj.$("#semester option:selected").val().split("_")[0];
						var semesterCode = obj.$("#semester option:selected").val().split("_")[1];
						//将年级信息绑定到数组中
						obj.$("#rightTable input[type='checkbox']").each(function(i,item){
							var reqData={};
							reqData.gradeMajorId = $(this).val();
							reqData.academicYear = academicYear;
							reqData.semesterCode = semesterCode;
							reqData.majorId = $(this).attr("majorId");
							gradeMajorBack.push(reqData);
						});
						//将课程信息绑定到数组中
						obj.$("#courseTable input[type='checkbox']:checked").each(function(i,item){
							var courseReqData = {};
							courseReqData.courseId = $(this).val();//课程号
							courseReqData.totalPeriod = $(this).parent().parent().parent().find("td[name='totalPeriod']").text();//总学时
							courseReqData.theoryPeriod = $(this).parent().parent().parent().find("input[name='theoryPeriod']").val();//理论学时
							courseReqData.experiPeriod = $(this).parent().parent().parent().find("input[name='experiPeriod']").val();//实验学时
							courseReqData.practicePeriod = $(this).parent().parent().parent().find("input[name='practicePeriod']").val();//实践学时
							courseReqData.otherPeriod = $(this).parent().parent().parent().find("input[name='otherPeriod']").val();//其他学时
							courseReqData.weekPeriod = $(this).parent().parent().parent().find("input[name='weekPeriod']").val();//周学时
							courseReqData.checkWayCode = $(this).parent().parent().parent().find("select[name='checkWayCode']").val();//考核方式
						    courseBack.push(courseReqData);
						});
						//返回到后台的数组
						var backData=[];
						//重新组装两个数组到一个数组中形成一个大的数组（backData）
						for(var i =0;i<courseBack.length;i++){
							for(var j =0 ;j<gradeMajorBack.length;j++){
								backData.push($.extend({}, courseBack[i], gradeMajorBack[j]));
							}
						}
						var reqre={};
						reqre.startClassPlanDto=backData;
						var josn=JSON.stringify(reqre);
						var reqData = {
							courseListJson : josn
						};
						//请求到后台
						ajaxData.contructor(false);
					    ajaxData.request(URL.CURRICUL_addCuricul,reqData,function(data){
					    	if(data.code==config.RSP_SUCCESS)
					    	{
					    		mydialog.close();//关窗
					    		var grade  = $("#grade").val();
					    		curricul.pagination.loadData();//局部刷新列表
					    		simpleSelect.loadSelect("grade",  URL.CURRICUL_GETGRADELIST,null,{defaultValue:grade,firstText:"全部",firstValue:"-1",async:false});
							}
							else
							{
								if(data.code==config.RSP_WARN){
									 popup.warPop(data.msg);//后台验证
								}else{
									popup.warPop("通识课开课计划新增失败");
								}
							}
						});
					    return false;
					},focus:true},
					{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							mydialog.close();
						});
						return false;
					}}]					
				});
		},
		
		
	}
	module.exports = curricul;
	window.curricul = curricul;
});
