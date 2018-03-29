/**
 * 学生报到
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var url = require("configPath/url.teacherservice");// 教师服务url
	var urlData = require("configPath/url.data");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var reportStatus = require("basePath/enumeration/studentarchives/ReportStatus");//状态枚举
	/**
	 * 
	 */
	var reportList = {	
	   /**
		 * 查询条件
		 */		
		queryObject : {},		
	
		/**
		 * 学生报到
		 */
		init : function() {
			 //判断是否在报到时间内
			 
			var power=reportList.loadPower();
			if(power){//院系老师
				var isReporting =reportList.checkReportTime();
                if(!isReporting){
				  return;
			    }
			}
			
			 // 学年学期 默认生效学年学期
			 simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "");
			 reportList.queryObject.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期 

			 if (utils.isEmpty($("#academicYearSemesterSelect").val())){
					return true;
			 }
            
			 var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
			 var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
			 // 班级
			 simpleSelect.loadSelect("classSelect",url.TEACHER_GETCLASSINFOINSCHOOL,{academicYear:academicYear,semesterCode:semesterCode}, {firstText : "全部",firstValue : "",async:false});
	         //加载报到学生名单
	         reportList.loadReportList();
	        
	        //导出
			$("#export").click(function() {
				var param = {
					academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
					semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
					classId:$("#classSelect").val()
			   }
			   ajaxData.exportFile(url.TEACHER_EXPORTREPORTROLL,param);
			});

			// 查询
			$("#query").click(function() {
				reportList.loadReportList();
			});

			//办理报到
			$("#transact").click(function(){
                reportList.transact();
			});

			//撤销报到
			$("#cancel").click(function(){
				reportList.cancel();
			});
			
		},
		/**
		 * 获取权限
		 */
		loadPower : function() {
			var powerData = null;
			ajaxData.contructor(false);
			ajaxData.request(URL_STUDENTARCHIVES.REPORT_GETPOWER, null,
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							// $("#academicYearSemesterSelect").attr("disabled", data.data);
							powerData=data.data;
						}
					});
			return powerData;
		},
		/**
		 * 加载报到学生名单
		 */
		loadReportList : function(){
			if (utils.isEmpty($("#academicYearSemesterSelect").val())){
				return true;
			}
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
				classId:$("#classSelect").val()
			}
		    //初始化列表数据
			ajaxData.request(url.TEACHER_GETLIST,param, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					var resData = data.data.list;
					if(resData && resData.length>0) {
					    $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(resData)).removeClass("no-data-html");
					 }else {
						$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					 }
				}
		 },true)
	   },
	   /**
	   * 撤销报到
	   */
	   cancel: function(){
	      var arraUserIds=[];
          var result= reportList.getCheck(arraUserIds,reportStatus.notHandled.value,'未办理报到的学生不能撤销报到');
		  if(!result){
				return;
		  }	
	  	  popup.askPop("确认撤销报到吗？", function() {
			var reqData={};
			reqData.userIds=arraUserIds;
			reqData.academicYear=$("#academicYearSemesterSelect").val().split("_")[0];
			reqData.semesterCode=$("#academicYearSemesterSelect").val().split("_")[1];

			ajaxData.setContentType("application/json;charset=UTF-8");	
			ajaxData.request(url.TEACHER_REVOKE,JSON.stringify(reqData), function(rvData) {
				if (rvData == null)
					return false;
				if (rvData.code ==  config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("撤销成功", function() {
					});
					// 刷新列表
					reportList.loadReportList();
					//取消全选
					$('#check-all').removeAttr("checked").parent().removeClass("on-check");
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			},true);
		  });
	  },
  	  /**
	  * 办理报到 弹窗
	  */
	  transact: function(){
			var arraUserIds=[];	
			var result= reportList.getCheck(arraUserIds,reportStatus.reported.value,'已报到的学生不能重复办理报到');
			if(!result){
				return;
			}		
			popup.data("arraUserIds",arraUserIds);
			var academicYearSemesterSelect = reportList.queryObject.academicYearSemesterSelect;
			// 主页面参数
			popup.data("param", {academicYearSemester : academicYearSemesterSelect});
			var me = this;
			this.addFrame = popup.open('./teacherservice/counsellor/html/transact.html', {
				id : 'transact',// 唯一标识
				title : '办理报到',// 这是标题
				width : 440,// 这是弹窗宽度。
				height :300,// 弹窗高度
				okVal : '保存',
				cancelVal : '取消',
				ok : function() {
					var transact = popup.data("transact");
					var flag = transact.transactSave();
					if(flag){
						reportList.loadReportList();
						$('#check-all').removeAttr("checked").parent().removeClass("on-check");
					}
					return flag;
				},
				cancelVal:"关闭",
				cancel:function(){
					
				}
			});
		},
	  /**
	  * 报到弹窗初始化
	  */
	  transactInit:function(){
			var reqData = popup.data("param");// 获取主页面的参数
			if (reqData == null || utils.isEmpty(reqData.academicYearSemester)){
				// 提示失败
				popup.errPop("学年学期不能为空");
				return false;
			}
		 	var academicYearSemester = reqData.academicYearSemester;
			// 学年学期 默认生效学年学期
			 simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			$("#academicYearSemester").val(academicYearSemester);	
			
			var newreportStatus=reportStatus;
			delete newreportStatus.notHandled;
			//报到状态
			simpleSelect.loadEnumSelect("reportStatus",newreportStatus,{firstText:"",firstValue:newreportStatus.reported.value});
			$("#academicYearSemesterSelect").prop("disabled","disabled");	
	  },
	  /**
		 * 验证勾选数据是否有效
		 * @param arraUserIds
		 * @param rstatus
		 * @param message
		 * @returns {Boolean}
	 */
	  getCheck:function(arraUserIds,rstatus,message){
			var isCancel=true;
			$("input[name='checNormal']:checked").each(function() {
				arraUserIds.push($(this).attr("userId"));
				var status=$(this).attr("reportStatus");
				if(rstatus==''){
					if(status==null||status==''){
						isCancel=false;
						return false;
					}
			    }else if(status==rstatus){
					isCancel=false;
					return false;
				}
			});
			if(arraUserIds.length==0){
				popup.warPop("请勾选要处理的数据");
				return false;
			}
			if(!isCancel){
				popup.warPop(message);
				return false;
			}
			return true;
		},
	 /**
	 * 判断是否在办理时间内
	 */
	checkReportTime:function(){
			// 获取报到注册设置
			ajaxData.contructor(false);
			ajaxData.request(URL_STUDENTARCHIVES.REGISTERSETTING_GETITEM, null,function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var reportData = data.data;
					var reportBeginDate = null;
					var reportEndDate = null;
					if (utils.isNotEmpty(reportData)){
							if (reportData.reportBeginDate == null || reportData.reportEndDate == null || reportData.registerBeginDate == null || reportData.registerEndDate == null) {
		                         $("#reportlist").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
								 return false;
							}

							if (reportData != null ){
								if (reportData.reportBeginDate != null) {
									reportBeginDate = new Date(reportData.reportBeginDate)
									.format("yyyy-MM-dd hh:mm");							
								}
								if (reportData.reportEndDate != null) {
									reportEndDate = new Date(reportData.reportEndDate)
									.format("yyyy-MM-dd hh:mm");							
								}
							}
							var nowDate = reportList.getNowDate();
							if (reportData != null ){
								if (reportData.reportBeginDate != null) {
									if (reportBeginDate > nowDate) {
										$("#reportlist").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
								        return false;
									}
								}
								if (reportData.reportEndDate != null) {
									if (reportEndDate < nowDate) {
										$("#reportlist").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
								        return false;
									}
								}
								if (reportData.reportBeginDate != null && reportData.reportEndDate != null) {
									if (reportBeginDate > nowDate || reportEndDate < nowDate) {
										$("#reportlist").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
								        return false;
									}
								}						
							}
					}else{
						 $("#reportlist").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
						 return false;
					}
					


				}
			});
			return true;
		},
		/**
			 * 
		 * 获取当前时间
		 */
		p:function(s) {
		    return s < 10 ? '0' + s: s;
		},
		getNowDate:function(){
			var myDate = new Date();
			//获取当前年
			var year=myDate.getFullYear();
			//获取当前月
			var month=myDate.getMonth()+1;
			//获取当前日
			var date=myDate.getDate(); 
			var h=myDate.getHours();       //获取当前小时数(0-23)
			var m=myDate.getMinutes();     //获取当前分钟数(0-59)
			var s=myDate.getSeconds();  

			var now=year+'-'+reportList.p(month)+"-"+reportList.p(date)+" "+reportList.p(h)+':'+reportList.p(m);
			return now;
		}
    }
	module.exports = reportList;
	window.reportList = reportList;
});
