/**
 * 楼层信息列表
 */
define(function(require, exports, module) {
	// 引入js
	var utils = require("basePath/utils");
	var ajaxData = require("basePath/ajaxData");
	var config = require("basePath/config");
	var URL_DATA = require("configPath/url.data");
	var URL = require("configPath/url.udf");
	var common = require("basePath/common");
	var popup = require("basePath/popup");
	var page = require("basePath/page");
	var dateUtil = require("basePath/dateUtil");
	var base  =config.base;
	var data = [];// 数据
	/**
	 * 校历信息列表
	 */
	var scalendar = {
		/**
		 * 页面初始化，绑定事件
		 */
		init : function() {
			// 查询
			scalendar.getSchoolCalendarList();
			// 新增
			$("button[name='addScalendar']").bind("click", function() {
				scalendar.popAddScalendarHtml();
			});
			// 修改
			$(document).on("click", "button[name='update']", function() {
				scalendar.popUpdateScalendarHtml(this);
			});
			// 修改状态
			$(document).on("click", "button[name='setStatusSchoolCalendar']", function() {
				scalendar.setStatusSchoolCalendar(this);
			});
			// 教学周
			$(document).on("click", "button[name='teachweek']", function() {
				scalendar.teachweek(this);
			});
		},
		/**
		 * 修改校历状态
		 */
		setStatusSchoolCalendar : function(obj){
			var schoolCalendarId = $(obj).attr("schoolCalendarId");
			var isCurrentSemester = $(obj).attr("isCurrentSemester");
			if(isCurrentSemester == "0"){
				var param = {
						schoolCalendarId : schoolCalendarId
					};// 修改校历状态
				var rvData = null;// 定义返回对象
				// post请求提交数据
				ajaxData.contructor(false);// 同步
				ajaxData.request(URL_DATA.SCHOOLCALENDAR_SETISCURRENTSEMESTER, param,
					function(data) {
						rvData = data;
					});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("修改成功", function() {});
					// 刷新列表
					scalendar.getSchoolCalendarList();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
					return false;
				}
			}else{
				// 刷新列表
				scalendar.getSchoolCalendarList();
			}
		},
		/**
		 * 教学周跳转
		 */
		teachweek: function(obj){
			var academicYear = $(obj).attr("academicYear");
			var semesterCodeName = $(obj).attr("semesterCodeName");
			var classStartDate = $(obj).attr("classStartDate");
			var classStopDate = $(obj).attr("classStopDate");
			var schoolCalendarId = $(obj).attr("schoolCalendarId");
			var weekStartDay = $(obj).attr("weekStartDay");
			var remark = $(obj).attr("remark");
			
			popup.open('./udf/schoolCalendar/html/teachweek.html?academicYear='+academicYear+"&semesterCodeName="+escape(semesterCodeName)+"&remark="+escape(remark)
					+"&classStartDate="+classStartDate+"&classStopDate="+classStopDate+"&schoolCalendarId="+schoolCalendarId+"&weekStartDay="+weekStartDay, // 这里是页面的路径地址
				{
					id : 'Teachweek',// 唯一标识
					title : '教学周',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 600,// 弹窗高度
				});
		},
		
		initTeachWeek : function(){
			var schoolCalendarId = utils.getUrlParam('schoolCalendarId');
			
			var param = {
					schoolCalendarId : schoolCalendarId
				};// 修改校历状态
			ajaxData.request(URL_DATA.SCHOOLCALENDAR_GETITEM, param,
				function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var item = data.data;
					var academicYear = item.academicYear;
					var semesterCodeName = item.semesterCodeName;
					var classStartDate = item.classStartDate;
					var classStopDate = item.classStopDate;
					var weekStartDay = item.weekStartDay;
					var remark = item.remark;

					$("#schoolCalendarId").val(schoolCalendarId);
					$("#academicYear").text(academicYear);
					$("#semesterCodeName").text(semesterCodeName);
					
					var classStartDateTime = (classStartDate+" 00:00:00").toDateString();
					var classStopDateTime = (classStopDate+" 00:00:00").toDateString();
					//周开始星期0-周日，1-周一
					if(weekStartDay=="0"){
						var weekListStr = scalendar.getTableBeginSundayTable(classStartDateTime, classStopDateTime);
						$("#content").append(weekListStr);
					}else{
						var weekListStr = scalendar.getTableBeginMondayTable(classStartDateTime, classStopDateTime);
						$("#content").append(weekListStr);
					}
					$("#remark").val(remark);
					$("#remarkPrint").html(remark);
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}
			});
			
			
			// 教学周(保存)
			$(document).on("click", "button[name='updateRemarkScalendar']", function() {
				scalendar.updateRemarkScalendar();
			});
			// 教学周(打印)
			$(document).on("click", "button[name='printScalendar']", function() {
				scalendar.printScalendar();
			});
		},
		
		// 教学周(打印)
		printScalendar : function(){
			window.print();
		},
		
		/**
		 * 教学周(保存)
		 */
		updateRemarkScalendar : function(){
			var schoolCalendarId = $("#schoolCalendarId").val();
			var remark = $("#remark").val();
			var param = {
					schoolCalendarId : schoolCalendarId,
					remark : remark
				};// 修改校历状态
			var rvData = null;// 定义返回对象
			// post请求提交数据
			ajaxData.contructor(false);// 同步
			ajaxData.request(URL_DATA.SCHOOLCALENDAR_UPDATEREMARKS, param,
				function(data) {
					rvData = data;
				});
			if (rvData == null)
				return false;
			if (rvData.code == config.RSP_SUCCESS) {
				$("#remarkPrint").html($("#remark").val());
				// 提示成功
				popup.okPop("保存成功", function() {
				});
			} else {
				// 提示失败
				popup.errPop(rvData.msg);
				return false;
			}
		}, 
		
		//将2个日期之间转成字符数组
		getDateArr : function(beginTimeStr, endTimeStr){
			var beginTime = new Date(beginTimeStr);
			var endTimeStr = new Date(endTimeStr);
		    
		    var unixDb=beginTime.getTime();
		    var unixDe=endTimeStr.getTime();
		    var dateArr = [];
		    for(var k=unixDb;k<=unixDe;){
		    	var datetime = (new Date(parseInt(k))).format('yyyy-MM-dd');
		    	var timearr = datetime.split("-");
		    	if(timearr[2]=="1"||timearr[2]=="01"){
		    		dateArr.push((timearr[1]).replace(/^0/, '')+"月");
		    	}else{
		    		dateArr.push(timearr[2].replace(/^0/, ''));
		    	} 
		   	 	k=k+24*60*60*1000;
		    }
		    return dateArr;
		},
		//周日排首位生成的表格
		getTableBeginSundayTable : function(beginTime, endTime){
			var weekHead = "<thead><tr>";
			weekHead += "<th width=\"120\" style=\"background: url(../../../common/images/talbe-line.png) 0 0 no-repeat;\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期<br>教学周&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>";
			weekHead += "<th style=\"background-color:#dae5ef;\">星期日</th>";
			weekHead += "<th>星期一</th>";
			weekHead += "<th>星期二</th>";
			weekHead += "<th>星期三</th>";
			weekHead += "<th>星期四</th>";
			weekHead += "<th>星期五</th>";
			weekHead += "<th>星期六</th>";
			weekHead += "<th style='width:140px;' class='width140'>备注</th>";
			weekHead += "</tr></thead>";
			
			var dataarr = scalendar.getDateArr(beginTime,endTime);
			var days = dataarr.length;
			var n1str=new Date(beginTime.toDateString());
			var firstday=n1str.getDay(); //获取第一天是星期几
			var tr_str=Math.ceil((days + firstday)/7); //表格所需要行数
			
			var strhtml = "<tbody>"; 
			for(i=0;i<tr_str;i++) { //表格的行
				strhtml += "<tr><td width=\"120\">第"+(i+1)+"周</td>";
				for(k=0;k<7;k++) { //表格每行的单元格
					idx=i*7+k; //单元格自然序列号
					date_str=idx-firstday+1; //计算日期
					(date_str<=0||date_str>days) ? date_str="&nbsp;" : date_str=dataarr[idx-firstday]; //过滤无效日期（小于等于零的、大于月总天数的）
					if(k==0||k==6){
						strhtml += "<td class=\"text-danger\">" + date_str + "</td>";
					}else{
						strhtml += "<td align='center'>" + date_str + "</td>";
					}
				}
				if(i==0){
					strhtml += "<td rowspan=\""+tr_str+"\" class=\"width140\" style=\"white-space:normal; \"><pre class=\"y-adaptive y-hide print-hidden\" id=\"pre\"></pre><textarea rows=\""+tr_str+"\" class=\"y-adaptive print-hidden\" id=\"remark\" name=\"remark\" maxlength=\"500\"></textarea><span id=\"remarkPrint\" name=\"remarkPrint\" class=\"print-show hidden\" style=\"word-wrap: break-word; word-break: break-all;\"></span></td>";
				}
				strhtml += "</tr>"; //表格的行结束
			}
			strhtml += "</tbody>";
			return weekHead + strhtml;
		},
		
		//周一排首位生成的表格
		getTableBeginMondayTable : function (beginTime, endTime){
			var weekHead = "<thead><tr>";
			weekHead += "<th width=\"120\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期<br>教学周&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>";
			weekHead += "<th>星期一</th>";
			weekHead += "<th>星期二</th>";
			weekHead += "<th>星期三</th>";
			weekHead += "<th>星期四</th>";
			weekHead += "<th>星期五</th>";
			weekHead += "<th>星期六</th>";
			weekHead += "<th>星期日</th>";
			weekHead += "<th style='width:140px;' class='width140'>备注</th>";
			weekHead += "</tr></thead>";
			
			var dataarr = scalendar.getDateArr(beginTime,endTime);
			var days = dataarr.length;
			var n1str=new Date(beginTime.toDateString());
			var firstday=n1str.getDay(); //获取第一天是星期几
			var tr_str="0"
			if(firstday==0){
				tr_str = Math.ceil(1+ (days-1)/7); //表格所需要行数
			}else{
				tr_str = Math.ceil(1+ (days-(8-firstday))/7); //表格所需要行数
			}
		
			var strhtml = "<tbody>"; 
			for(i=0;i<tr_str;i++) { //表格的行
				strhtml += "<tr><td width=\"120\">第"+(i+1)+"周</td>";
				for(k=0;k<7;k++) { //表格每行的单元格
					idx=i*7+k; //单元格自然序列号
					if(firstday==0){
						date_str = idx-6;
					}else{
						date_str = idx-(firstday-1);
					}
					(date_str<0||date_str>=days) ? date_str="&nbsp;" : date_str=dataarr[date_str]; //过滤无效日期（小于等于零的、大于月总天数的）
					
					if(k==5||k==6){
						strhtml += "<td class=\"text-danger\">" + date_str + "</td>";
					}else{
						strhtml += "<td align='center'>" + date_str + "</td>";
					}
				}
				if(i==0){
					strhtml += "<td rowspan=\""+tr_str+"\" class=\"width140\" style=\"white-space:normal; \"><pre class=\"y-adaptive y-hide print-hidden\" id=\"pre\"></pre><textarea rows=\""+tr_str+"\" class=\"y-adaptive print-hidden\" id=\"remark\" name=\"remark\" maxlength=\"500\"></textarea><span id=\"remarkPrint\" name=\"remarkPrint\" class=\"print-show hidden\" style=\"word-wrap: break-word; word-break: break-all;\"></span></td>";
				}
				strhtml += "</tr>"; //表格的行结束
			}
			strhtml += "</tbody>";
			return weekHead + strhtml;
		},
		
		/**
		 * 校历查询
		 */
		getSchoolCalendarList : function() {
			 //静态数据，字段根据需要定义
			var param = {};
			//实现ajax请求数据
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.SCHOOLCALENDAR_GETALL,param,function(data){
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				$("#pagination").show();
				
				if (data.data && data.data.length !=0 && data.code == config.RSP_SUCCESS) {
					$("#tbodycontent").empty().append($("#schoolCalendarTmpl").tmpl(data.data));
				} else {
					$("#tbodycontent").append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			});
		},
		/**
		 * 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			var now = new Date();  
			var initYear = now.getFullYear();
			$("#academicYear").val(initYear);
			$("#academicYearCreate").val(initYear+1);
			
			//绑定学年
			$(".spinner").find(".btn:last-of-type").click(function(){
				$("#academicYearCreate").val(parseInt($("#academicYear").val())+1);
			});
			$(".spinner").find(".btn:first-of-type").click(function(){
				$("#academicYearCreate").val(parseInt($("#academicYear").val())+1);
			});
			
			$(document).on("change", "#academicYear", function (event) {
				$("#academicYearCreate").val(parseInt($("#academicYear").val()) + 1);
            });
			
			var param = {
				isNoData : "1"
			};// 新增一条数据
			ajaxData.contructor(false);// 同步
			ajaxData.request(URL_DATA.SCHOOLCALENDAR_GET, param, function(data) {
				$("#tbody").html("");
				$("#tbody").removeClass("no-data-html");
				$("#pagination").show();
				if (data == null){
					return false;
				}
				if (data.data && data.data.length !=0 && data.code == config.RSP_SUCCESS) {
					$("#schoolCalendarTableTmpl").tmpl(data.data).appendTo('#tbody');
					
				} else {
					// 提示失败
					$("#tbody").append("<tr><td colspan='4'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			});
			//绑定上课开始日期事件，自动填充假期结束日期
			$("#classStartDate0").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStopDate, dateFmt:'yyyy-MM-dd', maxDate:'#F{$dp.$D(\'classStopDate0\',{d:-1})}' });
			});
			$("#classStartDate1").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStopDate, dateFmt:'yyyy-MM-dd', maxDate:'#F{$dp.$D(\'classStopDate1\',{d:-1})}', minDate:'#F{$dp.$D(\'classStopDate0\',{d:2})}' });
			});
			//绑定上课结束日期事件，自动填充假期起止日期
			$("#classStopDate0").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStartDate, dateFmt:'yyyy-MM-dd', minDate:'#F{$dp.$D(\'classStartDate0\',{d:1})}', maxDate:'#F{$dp.$D(\'classStartDate1\',{d:-2})}'});
			});
			$("#classStopDate1").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStartDate, dateFmt:'yyyy-MM-dd', minDate:'#F{$dp.$D(\'classStartDate1\',{d:1})}', maxDate:'#F{$dp.$D(\'lastVacationStopDate\',{d:-1})}' });
			});
			$("#lastVacationStopDate").on("focus",function() {
				WdatePicker({dateFmt:'yyyy-MM-dd', minDate:'#F{$dp.$D(\'classStopDate1\',{d:1})}' });
			});
			//绑定当前学年学期，选中后设为1，其余设为0
			$("input[name='isCurrentSemester']").bind("click",function() {
				scalendar.setIsCurrentSemesterChange();
			});
		},
		setIsCurrentSemesterChange : function(){
			$("#tbody input[type='radio']").val(0);
			$("#tbody input[type='radio']:checked").val(1);
		},
		setVacationStopDate : function(){
			// 找到对应id=div的元素，然后执行此块代码 
			if ($(this).parent().parent('tr').prev('tr').find("input[name='vacationStopDate']")){ 
				var outvalidityTime = $(this).val();
				var setVacationStartDate = scalendar.addDate(scalendar.stringToDate(outvalidityTime),-1);
				$(this).parent().parent('tr').prev('tr').find("input[name='vacationStopDate']").val(setVacationStartDate);
			}
		},
		setVacationStartDate : function(){
			var outvalidityTime = $(this).val();
			var setVacationStartDate = scalendar.addDate(scalendar.stringToDate(outvalidityTime),1);
			$(this).parent().parent().find("input[name='vacationStartDate']").val(setVacationStartDate);
		},
		/** 
		* 字符串转时间（yyyy-MM-dd HH:mm:ss） 
		* result （分钟） 
		*/ 
		stringToDate : function(fDate){  
			var fullDate = fDate.split("-");  
			return new Date(fullDate[0], fullDate[1]-1, fullDate[2], 0, 0, 0);  
		}, 
		/**
		 * 日期加减
		 */
		addDate : function(date,days) {
			var time=new Date(date); 
			time.setDate(time.getDate()+days); 
			var y = time.getFullYear();
			var m=time.getMonth()+1; 
			m = m < 10 ? '0' + m : m;
			var d = time.getDate();  
		    d = d < 10 ? ('0' + d) : d; 
			return y+'-'+m+'-'+d;
		}, 
		/**
		 * 页面初始化，绑定事件，更新初始化
		 */
		initUpdate : function() {
			var academicYear = utils.getUrlParam('academicYear');
			var weekStartDay = utils.getUrlParam('weekStartDay');
			$("#academicYear").val(academicYear);
			$("#academicYearCreate").val(parseInt(academicYear)+parseInt(1));
			
			//绑定学年
			$(".spinner").find(".btn:last-of-type").click(function(){
				$("#academicYearCreate").val(parseInt($("#academicYear").val())+1);
			});
			$(".spinner").find(".btn:first-of-type").click(function(){
				$("#academicYearCreate").val(parseInt($("#academicYear").val())+1);
			});
			
			$(document).on("change", "#academicYear", function (event) {
				$("#academicYearCreate").val(parseInt($("#academicYear").val()) + 1);
            });
			
			$("input[name='weekStartDay'][value="+weekStartDay+"]").attr("checked",true);
    	    $("input[name='weekStartDay'][value="+weekStartDay+"]").parent().parent().addClass("on-radio");
    	    
			var param = {
				academicYear : academicYear
			};// 新增一条数据
			ajaxData.contructor(false);// 同步
			ajaxData.request(URL_DATA.SCHOOLCALENDAR_GET, param, function(data) {
				if (data == null){
					return false;
				}
				if (data.code == config.RSP_SUCCESS) {
					$("#schoolCalendarTableTmpl").tmpl(data.data).appendTo(
							'#tbody');
				} else {
					// 提示失败
					
				}
			});
			//绑定上课开始日期事件，自动填充假期结束日期
			$("#classStartDate0").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStopDate, dateFmt:'yyyy-MM-dd', maxDate:'#F{$dp.$D(\'classStopDate0\',{d:-1})}' });
			});
			$("#classStartDate1").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStopDate, dateFmt:'yyyy-MM-dd', maxDate:'#F{$dp.$D(\'classStopDate1\',{d:-1})}', minDate:'#F{$dp.$D(\'classStopDate0\',{d:2})}' });
			});
			//绑定上课结束日期事件，自动填充假期起止日期
			$("#classStopDate0").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStartDate, dateFmt:'yyyy-MM-dd', minDate:'#F{$dp.$D(\'classStartDate0\',{d:1})}', maxDate:'#F{$dp.$D(\'classStartDate1\',{d:-2})}'});
			});
			$("#classStopDate1").on("focus",function() {
				WdatePicker({onpicked:scalendar.setVacationStartDate, dateFmt:'yyyy-MM-dd', minDate:'#F{$dp.$D(\'classStartDate1\',{d:1})}', maxDate:'#F{$dp.$D(\'lastVacationStopDate\',{d:-1})}' });
			});
			$("#lastVacationStopDate").on("focus",function() {
				WdatePicker({dateFmt:'yyyy-MM-dd', minDate:'#F{$dp.$D(\'classStopDate1\',{d:1})}' });
			});
			$("input[name='isCurrentSemester']").bind("click",function() {
				scalendar.setIsCurrentSemesterChange();
			});
		},
		/**
		 * 弹窗新增
		 */
		popAddScalendarHtml : function() {
			popup.open('./udf/schoolCalendar/html/add.html', // 这里是页面的路径地址
			{
				id : 'addScalendar',// 唯一标识
				title : '校历新增',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 425,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					var flag = true;
					var errormsg ={};
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					iframe.$("#tbody").find("tr").each(function(){
						var classStartDate = $(this).find("input[name='classStartDate']").val();
						var classStopDate = $(this).find("input[name='classStopDate']").val();
						var vacationStartDate = $(this).find("input[name='vacationStartDate']").val();
						var vacationStopDate = $(this).find("input[name='vacationStopDate']").val();
						if(classStartDate.length==0){
							errormsg.content="上课开始日期不能为空"
							flag = false;
							return false;
						}
						if(classStopDate.length==0){
							errormsg.content="上课结束日期不能为空";
							flag = false;
							return false;
						}
					});
					if(flag){
						var lastVacationStopDate = iframe.$("#lastVacationStopDate").val();
						if(lastVacationStopDate.length==0){
							errormsg.content="假期结束日期不能为空";
							flag = false;
						}
					}; 
					if(flag){
						iframe.$("#tbody").find("tr").each(function(){
							var classStartDate = $(this).find("input[name='classStartDate']").val();
							var classStopDate = $(this).find("input[name='classStopDate']").val();
							var vacationStartDate = $(this).find("input[name='vacationStartDate']").val();
							var vacationStopDate = $(this).find("input[name='vacationStopDate']").val();
							if(!scalendar.commpareDate(classStartDate,classStopDate)){
								errormsg.content="上课结束日期需大于等于上课开始日期";
								flag = false;
								return false;
							}
							if(!scalendar.commpareDate(classStopDate,vacationStartDate)){
								errormsg.content="假期开始日期需大于等于上课结束日期";
								flag = false;
								return false;
							}
							if(!scalendar.commpareDate(vacationStartDate,vacationStopDate)){
								errormsg.content="假期结束日期需大于等于假期开始日期";
								flag = false;
								return false;
							}
						});
					};
					if (flag) {
						var schoolCalendarList = [];
						
						iframe.$("#tbody").find("tr").each(function(){
							var semesterCode = $(this).find("td[name='semesterCode']").html();
							var classStartDate = $(this).find("input[name='classStartDate']").val();
							var classStopDate = $(this).find("input[name='classStopDate']").val();
							var vacationStartDate = $(this).find("input[name='vacationStartDate']").val();
							var vacationStopDate = $(this).find("input[name='vacationStopDate']").val();
							var isCurrentSemester = $(this).find("input[type='radio']").val();
							var schoolCalendar = {};
							schoolCalendar.academicYear = iframe.$("#academicYear").val();
							schoolCalendar.semesterCode=semesterCode;
							schoolCalendar.classStartDate=classStartDate;
							schoolCalendar.classStopDate=classStopDate;
							schoolCalendar.vacationStartDate=vacationStartDate;
							schoolCalendar.vacationStopDate=vacationStopDate;
							schoolCalendar.isCurrentSemester=isCurrentSemester;		//是否当前学年学期
							schoolCalendar.remark="";
							schoolCalendar.weekStartDay=iframe.$("input[name='weekStartDay']:checked").val();
							
							schoolCalendarList.push(schoolCalendar);
						});
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						// 处理已选菜单					 
						var josn=JSON.stringify(schoolCalendarList);
						var param = {
								schoolCalendarListJson : josn
						};
						ajaxData.request(URL_DATA.SCHOOLCALENDAR_ADD, {schoolCalendarListJson : josn},
							function(data) {
								rvData = data;
							});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("新增成功", function() {});
							scalendar.getSchoolCalendarList();
						} else {
							// 提示失败
							popup.errPop(rvData.msg);
							return false;
						}
					} else {
						// 表单验证不通过
						popup.errPop(errormsg.content);
						return false;
					}
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
		 * 日期比较,endtime日期大，返回true
		 */
		commpareDate : function (starttime,endtime){
			var start = new Date(starttime.toDateString());  
			var end = new Date(endtime.toDateString());
			if(start <= end){    
			    return true;    
			}else{
				return false;
			}
		},

		/**
		 * 弹窗修改
		 */
		popUpdateScalendarHtml : function(obj) {
			var academicYear = $(obj).attr("academicYear");
			var weekStartDay = $(obj).attr("weekStartDay");
			popup.open('./udf/schoolCalendar/html/update.html?academicYear='
					+ academicYear+'&weekStartDay='+weekStartDay, // 这里是页面的路径地址
			{
				id : 'updateSchoolCalendar',// 唯一标识
				title : '修改校历',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 425,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					var flag = true;
					var errormsg ={};
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					iframe.$("#tbody").find("tr").each(function(){
						var classStartDate = $(this).find("input[name='classStartDate']").val();
						var classStopDate = $(this).find("input[name='classStopDate']").val();
						var vacationStartDate = $(this).find("input[name='vacationStartDate']").val();
						var vacationStopDate = $(this).find("input[name='vacationStopDate']").val();
						if(classStartDate.length==0){
							errormsg.content="上课开始日期不能为空"
							flag = false;
							return false;
						}
						if(classStopDate.length==0){
							errormsg.content="上课结束日期不能为空";
							flag = false;
							return false;
						}
					});
					if(flag){
						var lastVacationStopDate = iframe.$("#lastVacationStopDate").val();
						if(lastVacationStopDate.length==0){
							errormsg.content="假期结束日期不能为空";
							flag = false;
						}
					};
					if(flag){
						iframe.$("#tbody").find("tr").each(function(){
							var classStartDate = $(this).find("input[name='classStartDate']").val();
							var classStopDate = $(this).find("input[name='classStopDate']").val();
							var vacationStartDate = $(this).find("input[name='vacationStartDate']").val();
							var vacationStopDate = $(this).find("input[name='vacationStopDate']").val();
							if(!scalendar.commpareDate(classStartDate,classStopDate)){
								errormsg.content="上课结束日期需大于等于上课开始日期";
								flag = false;
								return false;
							}
							if(!scalendar.commpareDate(classStopDate,vacationStartDate)){
								errormsg.content="假期开始日期需大于等于上课结束日期";
								flag = false;
								return false;
							}
							if(!scalendar.commpareDate(vacationStartDate,vacationStopDate)){
								errormsg.content="假期结束日期需大于等于假期开始日期";
								flag = false;
								return false;
							}
						});
					};
					if (flag) {
						var schoolCalendarList = [];
						
						iframe.$("#tbody").find("tr").each(function(){
							var schoolCalendarId = $(this).find("td[name='schoolCalendarId']").html();
							var semesterCode = $(this).find("td[name='semesterCode']").html();
							var classStartDate = $(this).find("input[name='classStartDate']").val();
							var classStopDate = $(this).find("input[name='classStopDate']").val();
							var vacationStartDate = $(this).find("input[name='vacationStartDate']").val();
							var vacationStopDate = $(this).find("input[name='vacationStopDate']").val();
							var isCurrentSemester = $(this).find("input[type='radio']").val();
							
							var schoolCalendar = {};
							schoolCalendar.schoolCalendarId=schoolCalendarId;
							schoolCalendar.academicYear = iframe.$("#academicYear").val();
							schoolCalendar.semesterCode=semesterCode;
							schoolCalendar.classStartDate=classStartDate;
							schoolCalendar.classStopDate=classStopDate;
							schoolCalendar.vacationStartDate=vacationStartDate;
							schoolCalendar.vacationStopDate=vacationStopDate;
							schoolCalendar.isCurrentSemester=isCurrentSemester;		//是否当前学年学期
							schoolCalendar.remark="";
							schoolCalendar.weekStartDay=iframe.$("input[name='weekStartDay']:checked").val();
							
							schoolCalendarList.push(schoolCalendar);
						});
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						// 处理已选菜单					 
						var josn=JSON.stringify(schoolCalendarList);
						var param = {
								schoolCalendarListJson : josn
						};
						ajaxData.request(URL_DATA.SCHOOLCALENDAR_UPDATE, {schoolCalendarListJson : josn},
							function(data) {
								rvData = data;
							});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {});
							scalendar.getSchoolCalendarList();
						} else {
							// 提示失败
							popup.errPop(rvData.msg);
							return false;
						}
					} else {
						// 表单验证不通过
						popup.errPop(errormsg.content);
						return false;
					}
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		/**
		 * 单个删除  
		 */
		deleteBuilding : function(obj) {
			var buildingId = $(obj).attr("data-tt-id");
			var arrayBuildingId=[];
			arrayBuildingId.push(buildingId);
			var param = {
				arrayBuildingId : arrayBuildingId
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.BUILDING_DELETE, param,
						function(data) {
							rvData = data;
						});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {});
					scalendar.getSchoolCalendarList();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
				// 刷新列表
				var win = art.dialog.open.origin;
				win.location.reload();
			});
		},
		/**
		 * 批量删除
		 */
		batchDeleteBuilding : function() {
			// 批量
			var buildingIds = "";// 楼房Id
			var arrayBuildingId = [];
			$("input[name='checNormal']:checked").each(function(){
				arrayBuildingId.push($(this).attr("buildingId"));
     		     })
			if (arrayBuildingId.length == 0) {
				popup.warPop("请勾选要删除的楼房");
				return false;
			}
			// 参数
			var param = {
				arrayBuildingId : arrayBuildingId
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.BUILDING_DELETE, param,
						function(data) {
							rvData = data;
						});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {
						// 刷新列表
						var win = art.dialog.open.origin;
						win.location.reload();
					});
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
				// 刷新列表
				var win = art.dialog.open.origin;
				win.location.reload();
			});
		}
	}
	module.exports = scalendar;
	window.scalendar = scalendar;
});