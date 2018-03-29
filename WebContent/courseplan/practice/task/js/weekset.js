/**
 * 弹框  周次设置
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var pagination = require("basePath/utils/pagination");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
    var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var URLDATA = require("basePath/config/url.data");
	var dataDictionary=require("basePath/config/data.dictionary");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var teacher = require("../../../common/js/teacher");
	var base = config.base;
	
	//变量名跟文件夹名称一致
	var weekset = {
			/**
			 * 周次设置 弹框  页面初始化
			 * *
			 * 弹框内页引用此方法
			 * 1.从公共参数获取顶部环节参数
			 * 2.从接口获取列表内容
			 * 3.获取表单的值，
			 * 	1).有值的加载值；
			 * 	2).当没有值时：1.监听文本框触发事件：focus ;2.当文本框失去焦点时：blur, 效验文本框值的格式；格式错误的，文本内容标红，重新focus次文本框；
			 */ 
			 
			init : function(){
				//获取列表页传参并储存到弹框内变量
				var courseDate = popup.getData("data");
				this.courseDate = courseDate;
				
				//储存弹框内对象
				popup.setData("setInitTask", weekset);
			
				//环节参数
				$("#practice").html("["+courseDate.practiceNumber+"]"+courseDate.practiceName).attr("title","["+courseDate.practiceNumber+"]"+courseDate.practiceName);
				$("#practice-style").html(courseDate.practiceStyle);
				$("#score").html(courseDate.score);
				$("#weeks").html(courseDate.weeks);
				
				//列表内容,获取开课计划id集合
				var startclassPlanIds =weekset.courseDate.startclassPlanIds;
				//获取环节id
				var courseId =weekset.courseDate.courseId,
					reqData = weekset.courseDate.reqData,
					isDepartmentfilter = weekset.courseDate.isDepartmentfilter;
				
				//初始加载列表数据，根据学年学期/环节id
				var param = {}; 
				param.startclassPlanIds = startclassPlanIds;
				param.courseId = courseId; 
				param.isDepartmentfilter=isDepartmentfilter;

				ajaxData.request(
					URL_COURSEPLAN.PRACTICE_CLASSLINKWEEKLYSETTING_GETCLASSWEEKLYSETTINGLISTBYSTARTCLASSPLANIDS,
					param,
				function(data){
					if (data.data.length > 0) {
						$("#setWeeksContent").empty().append($("#bodyContentImpl").tmpl(data.data)).removeClass("no-data-html"); 
						
						//添加title
						common.titleInit();
							
					} else {
						$("#setWeeksContent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html"); 
					}
				});
				
				
				//输入周次设置
				$(document).on("click", "input[ name = practiceWeeksSet ]",function(e){
					weekset.weekSetListIn(e);
				});
			},
			
			
			/**
			 *	输入周次：
			 * a.监听文本框触发事件：focus ;
			 * b.当文本框失去焦点时：blur, 效验文本框值的格式；格式错误的，文本内容标红，重新focus次文本框；
			*/ 
			weekSetListIn :function(obj){
				var _this = $(obj.currentTarget),
					className = _this.parents("tr").children("td").eq(4).text();
				
				var resultList = [];
				//点击清空文本框
				//_this.val("").removeClass("text-danger");
				_this.attr('placeholder',"").removeClass("erroInp");
				
				//当失去焦点呢
			 	_this.blur(function(){
			 		var resultArr = [],
					str = _this.val();
					
					if(utils.isEmpty(str)){
						//_this.attr("placeholder","请输入周次");
						
					}else{
						
						if(!utils.isWeek(str)){
							popup.warPop("行政班（"+className+"）：排课周次格式有误");
						}
					}
				});
			 },	
			    
			
			/**
			 * 获取行政班级数据并储存
			 */
			getClassinfoList : function(){
				
				var classDataList = [];
				var setWeeksTr = $(document).find("#setWeeksContent tr");
				//str 输入框内的周次数据；
				//resultArr 解析后的周次数据；
				var str = "";
				
				$.each(setWeeksTr, function(n, tr){
					var inp = $(tr).find("input[name = practiceWeeksSet]");
					var paramClass = {};
					
					//获取所设置的周次
					str = $(inp).val();
					var resultArr = [];
					
					if(utils.isNotEmpty(str)){
						resultArr = utils.getWeekList(str);
						
					}
					
					paramClass.practiceWeeks = resultArr; // 获取每班设置周次
					paramClass.practiceStr = str;
					//获取 环节下课程数据
					paramClass.classId = $(tr).attr("classId"); // 获取班级id
					paramClass.id = $(tr).attr("linkClassWeekId"); // 获取周次id
					paramClass.courseWeeks = $(tr).children('td').eq(5).text();// 获取周数
					paramClass.courseClass = $(tr).children('td').eq(4).text();// 获取班级
					paramClass.courseId = weekset.courseDate.courseId;
					paramClass.academicYear = weekset.courseDate.reqData.academicYear;
					paramClass.semesterCode = weekset.courseDate.reqData.semesterCode;
				
					//储存到weekset:courseData 
					classDataList.push(paramClass);
				});
				weekset.classDataList = classDataList;
				
			},
			
			//保存验证
			validate : function(){
				//获取行政班级所有数据
				weekset.getClassinfoList();
				var classData = weekset.classDataList;
				
				
				//效验已设置的周次
				var flag = true;
				var _ = this;
				var errormsg ={};
				weekset.errormsg = errormsg;
				
				
				 $.each(classData, function(i, item) {
				 	var weeksStr = item.practiceStr, //周次原格式
				 		weeks = item.practiceWeeks,  //周次数据解析
				 		className = item.courseClass; //行政班
				 	var inp =  $("#setWeeksContent tr").eq(i).children("td").last().children("input");
						inp.attr("is-empty","false");
						inp.attr("wrong-week","false");
						inp.attr("error","false");
					
					//验证空值:a.从公共变量取值遍历；b.当有值为空时，弹框提醒；返回
					if(utils.isEmpty(weeks)){
						errormsg.content = "请输入周次！";
						//popup.warPop("请输入周次！");
						$(inp).attr("placeholder","请输入周次").attr("is-empty","true");
						flag = false;
						
					}
					
					if(!utils.isWeek(weeksStr)){
					//验证周次格式	
						errormsg.content1 = "排课周次格式有误！";
						//popup.warPop("行政班（"+className+"）：排课周次格式有误");
						$(inp).attr("wrong-week","true");
						flag = false;
						
					}
					
					
					//限制必须小于等于上课周	
					var maxArr = Math.max.apply(null, weeks),
						 schoolWeek = weekset.courseDate.schoolWeek;
					if(maxArr > schoolWeek){
						errormsg.content2 = "周次不能大于上课周，";
						$(inp).attr("error","true");
						flag = false;
			 		}	
					
					//勾选验证1 :是否允许设置的实践周次数与周数不一致
					//该行政班级下的周数
					if($("input[name = weeks-count]").parent("div.on-check").length == 0){
						var defaultWeeks = _.classDataList[i].courseWeeks,
							lengths = weeks.length;
						
						if( lengths != defaultWeeks ){
							errormsg.content3 = "实践周次数与周数不一致，";
							$(inp).attr("error","true");
							flag = false;
						}
				 	}
 					//遍历某个班级内周次
 					$.each(weeks, function(n, obj){
 						//二次循环数组
 						var obj = obj;
 						
	 					//从第二个周次数组开始循环
						for( var m=i-1; m>=0; m--){
							var item2 = classData[m];
							var weeks2 = item2.practiceWeeks;
							var inp2 =  $("#setWeeksContent tr").eq(m).children("td").last().children("input");
							
							//从第二个周次遍历所有已设置的周次数据
							$.each(weeks2, function(b, obj2){
								 var obj2 = obj2;
								 
								//勾选验证2 :是否允许各班级时间周次重叠:
								//没勾选 不允许同一环节中各班级周次重叠
								if($("input[name = weeks-times]").parent("div.on-check").length == 0){
									if(obj2 == obj){
										errormsg.content4 = "班级周次时间重叠,";
										$(inp).attr("error","true");
										flag = false;
									}	
								}
							});
						}
 					});	
				});	
				
				if(!flag){
					return false;
				}
				
				return flag;
			}, 
			
	}				
       
	
	module.exports = weekset; //根文件夹名称一致
	window.weekset = weekset;    //根据文件夹名称一致
});