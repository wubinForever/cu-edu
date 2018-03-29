/**
 * 专业理论课程
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
	var CurrentTimeDataFlag=require("basePath/enumeration/trainplan/CurrentTimeDataFlag");
	var ModuleFlag=require("basePath/enumeration/trainplan/ModuleFlag");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
	//var commonSpaner = require("basePath/utils/commonSpaner");
	var base  =config.base;	
	var waitChosenData=[];//存放待选择数据
	var allCourseData=[];//存放所有的课程信息
	
	/**
	 * 专业理论课程
	 */
	var majortheory = {			
		
		/** ******************* list初始化 开始 ******************* */			
		init : function() {
			//判断当前时间是否能进入
			ajaxData.contructor(false);
			ajaxData.request(url.SETTIME_CAN_ENTER_INTO, {}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data==false){
						location.href= utils.getRootPathName() + "/trainplan/setTrainPlan/majorTheory/html/forbade.html?ModuleFlag="+ModuleFlag.SetTrainPlan.value;
					}else{
						//加载年级列表
					    simpleSelect.loadSelect("grade", url.GRADEMAJOR_GRADELIST,null,{firstText:"全部",firstValue:-1});
						//加载院系
					    simpleSelect.loadSelect("departmentId", url.MAJORTHEORY_GET_DEPARTMENT_LIST_BY_CLASS,{departmentClassCode:departmentClassEnum.TEACHINGDEPARTMENT.value,currentTimeDataFlag:CurrentTimeDataFlag.CurrentTimeData.value},{firstText:"全部",firstValue:"",length:12});
					    //初始化专业
					    simpleSelect.loadSelect("majorId", url.MAJORTHEORY_GET_MAJOR_LIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{firstText:"全部",firstValue:""});
					    // 绑定开课单位下拉框
						simpleSelect.loadSelect("kkDepartmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:false},{firstText:"全部",firstValue:"",length:12});
						// 绑定课程大类下拉框
						simpleSelect.loadDictionarySelect("bigCourseCode",dataDictionary.COURSE_BIG_CATEGORY, {firstText:"全部",firstValue:""});
						//年级联动专业
						$("#grade").change(function(){
							var reqData={};
							reqData.grade =$(this).val();
						    reqData.departmentId=$("#departmentId").val();
						    simpleSelect.loadSelect("majorId", url.MAJORTHEORY_GET_MAJOR_LIST,reqData,{firstText:"全部",firstValue:""});
						});
						//院系联动专业
						$("#departmentId").change(function(){
							var reqData={};
							reqData.departmentId = $(this).val();
							reqData.grade = $("#grade").val();
							simpleSelect.loadSelect("majorId", url.MAJORTHEORY_GET_MAJOR_LIST,reqData,{firstText:"全部",firstValue:""});
						});
						
						var params=utils.getQueryParamsByFormId("queryForm");
						params["currentTimeDataFlag"]=CurrentTimeDataFlag.CurrentTimeData.value;
						//初始化列表分页数据
						majortheory.pagination = new pagination({
							id: "pagination", 
							url: url.MAJORTHEORY_GET_PAGED_LIST, 
							param: params
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
						
						// 新增
						$('#add').click(function() {
							majortheory.add();
						});
						
						// 删除
						$(document).on("click", "[name='delete']", function() {
							majortheory.singleDelete(this);
						});
						// 批量删除
						$('#batchDelete').click(function() {
							majortheory.batchDelete();
						});	
						
						// 修改
						$(document).on("click", "[name='edit']", function() {
							majortheory.edit(this);
						});
						// 查询
						$('#query').click(function() {
							var params=utils.getQueryParamsByFormId("queryForm");
							params["currentTimeDataFlag"]=CurrentTimeDataFlag.CurrentTimeData.value;
							majortheory.pagination.setParam(params);
						});	
										
						// 导出
						$('#export').click(function() {
							ajaxData.exportFile(url.MAJORTHEORY_EXPORT, majortheory.pagination.option.param);
						});	
					}
				}
			});						
		},
		/** ******************* list初始化 结束 ******************* */

		/** ******************* add初始化 开始 ******************* */
		addInit : function() {			
			var isOut=true;//开课学期 鼠标移出标识
			var hasChosenData= [];//存放已经选中的数据				
			
			//加载年级列表
		    simpleSelect.loadSelect("grade", url.GRADEMAJOR_GRADELIST,null,{defaultValue:new Date().getFullYear(),firstText:"全部",firstValue:"-1",async:false});
			//加载院系
		    simpleSelect.loadSelect("departmentId", url.MAJORTHEORY_GET_DEPARTMENT_LIST_BY_CLASS,{departmentClassCode:departmentClassEnum.TEACHINGDEPARTMENT.value,currentTimeDataFlag:CurrentTimeDataFlag.CurrentTimeData.value},{firstText:"全部",firstValue:"",async:false,length:12});
		    //初始化专业
		    simpleSelect.loadSelect("majorId", url.MAJORTHEORY_GET_MAJOR_LIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{async:false});
			//年级联动专业
			$("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    simpleSelect.loadSelect("majorId", url.MAJORTHEORY_GET_MAJOR_LIST,reqData,{async:false});
			    majortheory.loadHasChosenList();
			});
			//院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				simpleSelect.loadSelect("majorId", url.MAJORTHEORY_GET_MAJOR_LIST,reqData,{async:false});
				majortheory.loadHasChosenList();
			});			
			//专业改变时列表数据变动
			$("#majorId").change(function(){
				majortheory.loadHasChosenList();
			});
			// 加载开课单位下拉框
			simpleSelect.loadSelect("kkDepartmentId", urlData.DEPARTMENT_STARTCLASS_FOR_SELECT,{isAuthority:false},{firstText:"全部",firstValue:"",length:9});			
			//加载已选择列表
			majortheory.loadHasChosenList();
			$("#kkDepartmentId").change(function(){
				majortheory.loadWaitChosenList();
			});		
			// 待选择查询
			$('#btnSearch').click(function() {
				majortheory.loadWaitChosenList();
			});	
			// 添加
			$('#btnAdd').click(function() {				
				 majortheory.downAdd();				 
			});
			// 移除
			$('#btnRemove').click(function() {
				majortheory.upRemove();
			});				
			//给Text绑定onBlur事件 
			$(document).on("change keyup blur", "#tbodycontentHasChosen input[type='text']", function() {
				majortheory.setEffectiveDigit($(this));
				majortheory.setValue($(this));
			});
			//给select绑定change事件		
			$(document).on("change", "#tbodycontentHasChosen select", function() {
				majortheory.setValue($(this));
			});
		},
		/** ******************* add初始化 结束 ******************* */
		
		/** ******************* modify初始化 开始 ******************* */
		modifyInit : function() {
			var isOutForModify=true;//开课学期 鼠标移出标识
			// 获取url参数
			var majorTheoryId = utils.getUrlParam('majorTheoryId');
			//加载专业理论课程信息
			majortheory.loadItem(majorTheoryId);			
			//初始化表单校验
			majortheory.initFormDataValidate($("#editForm"));	
			//给Text绑定onBlur事件 
			$(document).on("blur", "input[myattr='period']", function() {
				majortheory.setEffectiveDigit($(this));
			});
		},
		/** ******************* modify初始化 结束 ******************* */	
		
		/**
		 * 专业理论课程新增页面的 添加（下移）按钮
		 */
		downAdd:function(){
			var majorId=$("#majorId").val();
			if(majorId==""){
				popup.warPop("请先选择专业");
				return false;
			}
			//获取待选择复选框的index
			var indexs=[];
			$("input[name='waitChosen']:checked").each(function(i,value){
				 indexs.push($(this).val());
			});
			if(indexs.length<=0){					
				popup.warPop("请选择数据");
				return false;
			}
			//遍历将选中的待选择记录插入到已选择记录数组中
			for(var i=0;i<indexs.length;i++){
				var newHasChosenData= $.extend({}, waitChosenData[indexs[i]]);
				newHasChosenData["index"]=hasChosenData.length; // 序号
				newHasChosenData["kkDepartmentName"]=waitChosenData[indexs[i]]["departmentName"]; // 开课单位
				newHasChosenData["weekPeriod"]=null; // 周学时
				newHasChosenData["startclassSemester"]=null; // 开课学期
				hasChosenData.push(newHasChosenData);//在数组最后位置插入					 
			 }
			//遍历将选中的待选择记录移出待选择数组
			for(var i=indexs.length-1;i>=0;i--){
				waitChosenData.splice(indexs[i],1);//从后往前移除
			}
			//重新绑定待选择
			 majortheory.bindHasChosenList(hasChosenData);	
			//重新绑定已选择
			 majortheory.bindWaitChosenList(waitChosenData);
		},
		
		/**
		 * 专业理论课程新增页面的 移除（上移）按钮
		 */
		upRemove:function(){
			var majorId=$("#majorId").val();
			if(majorId==""){
				popup.warPop("请先选择专业");
				return false;
			}
			//获取已选择记录中勾选的课程号
			var indexs=[];
			var courseNos=[];
			$("input[name='hasChosen']:checked").each(function(i,value){
				indexs.push($(this).val());
				courseNos.push($(this).attr("courseno"));				
			});
			if(indexs.length<=0){					
				popup.warPop("请选择数据");
				return false;
			}
			//从hasChosenDate数组中删除勾选的记录
			for(var i=indexs.length-1;i>=0;i--){
				hasChosenData.splice(indexs[i],1);//从后往前移除
			}
			//往waitChosenData数组中添加勾选的记录
			for(var i=0;i<courseNos.length;i++){
				var index=majortheory.getIndexFromDbWaitChosenData(courseNos[i]);
				if(index>-1){
					var newWaitChosenData=allCourseData.slice(index, index+1)[0];
					waitChosenData.push(newWaitChosenData);
				}
//				else{
//					popup.errPop("数据出错");
//				}
			}
			//重新绑定待选择
			 majortheory.bindHasChosenList(hasChosenData);	
			//重新绑定已选择
			 majortheory.bindWaitChosenList(waitChosenData);
		},
		
		/**
		 * 获取课程号在DbWaitChosenData中的位置
		 */
		getIndexFromDbWaitChosenData:function(courseNo){
			if(allCourseData!=null && allCourseData.length>0 ){
				for(var i=0;i<allCourseData.length;i++){
					if(allCourseData[i]["courseNo"]==courseNo){
						return i;
					}
				}
			}
			return -1;
		},
		
		/**
		 * 加载已选择列表
		 */
		loadHasChosenList:function(){
			var params=utils.getQueryParamsByFormId("queryForm");
			params["currentTimeDataFlag"]=CurrentTimeDataFlag.CurrentTimeData.value;
			ajaxData.contructor(false);
			ajaxData.request(url.MAJORTHEORY_GET_LIST,params, function(data) {
				if (data.code == config.RSP_SUCCESS) {					
					hasChosenData=data.data;
					majortheory.bindHasChosenList(hasChosenData);
					majortheory.loadWaitChosenList();//加载待选择课程列表
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}				
			},true);	
		},	
		
		/**
		 * 绑定已选择列表
		 */
		bindHasChosenList:function(data){
			$("#hasChosenCount").html(data.length+"门");
			if(data && data.length>0) {
				for(var i=0;i<data.length;i++){
					data[i]["index"]=i;
				}
				 $("#tbodycontentHasChosen").removeClass("no-data-html").empty().append($("#bodycontentHasChosenImpl").tmpl(data));
				 utils.checkAllCheckboxes("check-all-haschosen","hasChosen");
				
				 //只允许输入数字
				 $("#tbodycontentHasChosen input[type='text']").on('keydown',function(e){
	                if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8){
	                	
		            }else{
	                    return false;
	                }
		         });
				 
				 //数字控件
				 commonSpaner.spinnerNumber();
				//给数字控件绑定click事件 
				$(".mybutton").click(function(){
					majortheory.setValue($(this).parent().parent().children("input:first"));
					
				});
		            
				 //绑定考核方式下拉框
				 $("select[name='checkWayCode']").each(function(index,item){
					var defaultVal=$(this).attr("value");
					simpleSelect.loadDictionarySelect($(this).attr("id"),dataDictionary.CHECK_WAY_CODE,{defaultValue:defaultVal}); // 绑定考核方式下拉框
				});
				//绑定课程类别下拉框
				 $("select[name='courseTypeCode']").each(function(index,item){
					var defaultVal=$(this).attr("value");
					simpleSelect.loadDictionarySelect($(this).attr("id"),dataDictionary.COURSE_TYPE_CODE,{defaultValue:defaultVal}); // 绑定课程类别下拉框				 
				});
				//绑定课程属性下拉框
				 $("select[name='courseAttributeCode']").each(function(index,item){
					var defaultVal=$(this).attr("value");
					simpleSelect.loadDictionarySelect($(this).attr("id"),dataDictionary.COURSE_ATTRIBUTE_CODE,{defaultValue:defaultVal}); // 绑定课程属性下拉框				 
				});
				 //绑定开课学期click事件
				 $("input[name='startclassSemester']").click(function() {					 
					 var index=$(this).attr("index"); //序号	
					 //在click的时候初始化复选框是否选中
					 for(var i=1;i<=14;i++){//遍历14个复选框，先让全不选
						 $("#scsCheckBox"+i+index).prop("checked", false);//先全部不选中
						 $("[for='scsCheckBox"+i+index+"']").attr("class", "checkbox-con");								 
					 }
					 var vals=$.trim($(this).val()); //开课学期“,”分隔字符串
					 if(vals!=null && vals!=""){
						 $.each(vals.split(','), function(i,val){
							 if(val!=null && val!=""){
								 $("#scsCheckBox"+val+index).prop("checked", true); //初始化选中的复选框
								 $("[for='scsCheckBox" + val+index + "']").attr("class", "checkbox-con on-check");
							 }							 
					      });  
					 }							 
					 //加载弹出下拉复选框效果
					 event.cancelBubble=true;						 
					 $("#checkboxlist"+index).toggle();
					 //鼠标按下事件
					 document.onmousedown = function () {
						if ($("#checkboxlist"+index).css("display") == "block" && isOut) {
							$("#checkboxlist"+index).hide();
						}
					};		
				});	
				 
				//绑定开课学期下拉框中复选框的click事件
				 $("input[name='scsCheckBox']").on("click", function() {
					 var index=$(this).attr("index");
					 var vals=[];
					 $("#checkboxlist"+index+" input[name='scsCheckBox']:checked").each(function(i,value){
						vals.push($(this).val());
					 });
					 $("#startclassSemester"+index).val(vals.join(','));
					 hasChosenData[index]["startclassSemester"]=vals.join(',');
				 });
			 }else {
				$("#tbodycontentHasChosen").empty().append("<tr><td colspan='15'></td></tr>").addClass("no-data-html");
			 }			
			$('#check-all-haschosen').removeAttr("checked").parent().removeClass("on-check");//取消全选
		},	
		
		/**
		 * 加载待选择列表
		 */
		loadWaitChosenList:function(){
			var courseNos=[]; // 存放已选择的课程号
			if(hasChosenData!=undefined && hasChosenData!=null && hasChosenData.length>0){
				for(var i=0;i<hasChosenData.length;i++){
					courseNos.push(hasChosenData[i]["courseNo"]);
				}				
			}
			var queryParams={
					departmentId:$("#kkDepartmentId option:selected").val(),
					courseNo:$("#courseNo").val(),
					courseOrTache:vCourseOrTache.Course.value //只查询课程信息
				}			
			ajaxData.contructor(false);
			ajaxData.request(url.COURSE_GET_LIST, queryParams, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					allCourseData.length=0;
					allCourseData=data.data;//所有的课程信息
					waitChosenData.length=0;
					if(allCourseData){
						for(var i=0;i<allCourseData.length;i++){
							if($.inArray(allCourseData[i]["courseNo"], courseNos)==-1){
								var newWaitChosenData=allCourseData.slice(i,i+1)[0];
								waitChosenData.push(newWaitChosenData);
							}
						}
					}
					majortheory.bindWaitChosenList(waitChosenData);//绑定待选择列表
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}				
			},true);	
		},	
		
		/**
		 * 绑定待选择列表
		 */
		bindWaitChosenList:function(data){
			$("#waitChosenCount").html(data.length+"门");
			if(data && data.length>0) {	
				for(var i=0;i<data.length;i++){
					data[i]["index"]=i;
				}
				 $("#tbodycontentWaitChosen").removeClass("no-data-html").empty().append($("#bodycontentWaitChosenImpl").tmpl(data));
				 utils.checkAllCheckboxes("check-all-waitchosen","waitChosen");				 
			 }else {
				$("#tbodycontentWaitChosen").empty().append("<tr><td colspan='13'></td></tr>").addClass("no-data-html");
			 }
			$('#check-all-waitchosen').removeAttr("checked").parent().removeClass("on-check");//取消全选
		},		
		
		/**
		 * 新增
		 */
		add: function(){
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var mydialog =popup.open('./trainplan/setTrainPlan/majorTheory/html/add.html', // 这里是页面的路径地址
				{
					id : 'addMajorTheory',// 唯一标识
					title : '专业理论课程新增',// 这是标题
					width : 1400,// 这是弹窗宽度。其实可以不写
					height : 780,// 弹窗高度
//					okVal : '保存',
					///cancelVal : '取消',
//					ok : function(iframeObj) { //保存
//						var v= majortheory.validate(iframeObj);//数据校验										
//						if (v) { // 表单验证通过
//							majortheory.save(iframeObj);
//						} else { // 表单验证不通过				
//							return false;
//						}						
//					},	
					button: [{name: '保存', callback: function () {
						var iframeObj = this.iframe.contentWindow;
						iframeObj.$(".s-mult").hide(); // 下拉复选框隐藏
						var v= majortheory.validate(iframeObj);//数据校验										
						if (v) { // 表单验证通过
							majortheory.save(iframeObj);
						} else { // 表单验证不通过				
							return false;
						}
					},focus:true},
					{name: '保存并新增', callback: function () {
						var iframeObj = this.iframe.contentWindow;
						iframeObj.$(".s-mult").hide(); // 下拉复选框隐藏
						var v= majortheory.validate(iframeObj);//数据校验										
						if (v) { // 表单验证通过
							majortheory.save(iframeObj);
							iframeObj.location.reload();
							return false;
						} else { // 表单验证不通过				
							return false;
						}	
					}},
					{name:'取 消',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						iframeObj.$(".s-mult").hide(); // 下拉复选框隐藏
						popup.askPop("确认取消吗？",function(){
							mydialog.close();
						});
						return false;
					}}]					
				});
		},
		
		/**
		 * 专业理论课程新增 页面校验
		 */
		validate:function(iframeObj){
			var grade=iframeObj.$("#grade").val();
			if(grade==-1){
				popup.warPop("请选择年级");
				return false;
			}
			var majorId=iframeObj.$("#majorId").val();
			if(majorId==undefined || majorId==null || majorId==""){
				popup.warPop("请选择专业");
				return false;
			}
			if(iframeObj.hasChosenData.length<=0){
				popup.warPop("请选择至少选择一门理论课程");
				return false;
			}
			//遍历再次设置值
			iframeObj.$("#tbodycontentHasChosen input[type='text']").each(function () {				
                iframeObj.hasChosenData[$(this).attr("index")][$(this).attr("name")]=$(this).val();
            });
			
			var data=iframeObj.hasChosenData;
			var msgArr=[];
			for(var i=0;i<data.length;i++){
				var k=i+1;
				var msgArrTemp=[];
				
				if(data[i]["totalPeriod"]===null || data[i]["totalPeriod"]===""||data[i]["totalPeriod"]===0){
					msgArrTemp.push("理论学时、实验学时、实践学时、其他学时至少有一个学时大于0");
				}
				if(data[i]["weekPeriod"]===null || data[i]["weekPeriod"]===""||data[i]["weekPeriod"]<0){
					//iframeObj.$("#weekPeriod"+k).focus();
					//if(iframeObj.$("#weekPeriod"+k).val()===null || iframeObj.$("#weekPeriod"+k).val()==="" || iframeObj.$("#weekPeriod"+k).val()<0){
						msgArrTemp.push("周学时必须大于等于0");
					//}else{
						//iframeObj.hasChosenData[i]["weekPeriod"]=iframeObj.$("#weekPeriod"+k).val();
					//}					
				}	
				if(data[i]["startclassSemester"]==null || data[i]["startclassSemester"]==""){
					msgArrTemp.push("开课学期不能为空");
				}
				if(msgArrTemp.length>0){
					msgArr.push("第"+k+"行，"+msgArrTemp.join('，'));
					msgArrTemp.length=0;
					break;
				}
			}
			if(msgArr.length>0){
				popup.warPop(msgArr.join('<br/>'));
				return false;
			}
			return true;
		},

		/**
		 * 专业理论课程修改表单校验
		 * formJQueryObj 表单jquery对象
		 */
		initFormDataValidate:function(formJQueryObj){
			ve.validateEx();
			formJQueryObj.validate({
				rules : {					
					totalPeriod:{ //理论学时、实验学时、实践学时、其他学时必选填写一个
						"required" : true,
						digits:true,
						min:1
					},
					weekPeriod : {
						"required" : true
					},
					startclassSemester : {
						"required" : true
					},
					checkWayCode:{
						"required" : true,
					},
					courseTypeCode:{
						"required" : true,
					},
					courseAttributeCode:{
						"required" : true,
					}
				},
				messages : {					
					totalPeriod:{ //理论学时、实验学时、实践学时、其他学时必选填写一个
						"required" : '总学时不能为空',
						digits:'总学时只能为正整数',
						min:'总学时只能为正整数'
					},
					weekPeriod : {
						"required" : '周学时不能为空'
					},
					startclassSemester : {
						"required" : '开课学期不能为空'
					},
					checkWayCode:{
						"required" : '考核方式不能为空',
					},
					courseTypeCode:{
						"required" : '课程类别不能为空',
					},
					courseAttributeCode:{
						"required" : '课程属性不能为空',
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});		
		},
		
		/**
		 * 将页面文本框或者下拉框的值保存到数组中
		 */
		setValue:function(obj){
			var index=obj.attr("index");
			var name=obj.attr("name");			
			if(name.indexOf("Period")>-1){//学时
				hasChosenData[index][name]=obj.val(); //保存
				majortheory.calculationTotalPeriodForTr(obj);//计算并保存总学时
			}
			else{//不是学时，直接保存
				hasChosenData[index][name]=obj.val();
			}					
		},
		
		//计算总学时
		calculationTotalPeriodForTr:function(obj){
			var index=obj.attr("index");
			var totalPeriod=0;
			$("#tr"+index+" input[myattr='period']").each(function(index,item){
				var val=$(this).val();
				if(val){
					totalPeriod+=(parseInt(val));
				}			 
			});
			$("#totalPeriod"+index).val(totalPeriod);
			hasChosenData[index]["totalPeriod"]=totalPeriod;
		},
		
		//计算总学时
		calculationTotalPeriod:function(){
			var totalPeriod=0;
			$("input[myattr='period']").each(function(index,item){
				var val=$(this).val();
				if(val){
					totalPeriod+=(parseInt(val));
				}			 
			});
			$("#totalPeriod").val(totalPeriod);
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
		
		/**
		 * 保存
		 */
		save:function(iframeObj){
			var MajorTheoryDtos={
					majorTheoryDtoList:iframeObj.hasChosenData
			}
			var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#queryForm"));//获取要保存的参数
			saveParams["courseOrTache"]=vCourseOrTache.Course.value;
			saveParams["majorTheoryDtoListJsonStr"]=JSON.stringify(MajorTheoryDtos);			
			ajaxData.request(url.MAJORTHEORY_ADD, saveParams, function(data) {				
				if (data.code == config.RSP_SUCCESS) {					
					// 提示成功
					popup.okPop("保存成功", function() {});
					// 刷新列表
					majortheory.pagination.loadData();
														
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}				
			});		
		},
		
		/**
		 * 修改保存
		 */
		saveForModify:function(iframeObj){			
			var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#editForm"));//获取要保存的参数
			saveParams["courseOrTache"]=vCourseOrTache.Course.value; // 课程信息
			ajaxData.request(url.MAJORTHEORY_UPDATE, saveParams, function(data) {				
				if (data.code == config.RSP_SUCCESS) {					
					// 提示成功
					popup.okPop("保存成功", function() {});	
					// 刷新列表
					majortheory.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}				
			});		
		},
		
		/**
		 * 单个删除专业理论课程
		 */
		singleDelete : function(obj) {
			var id = $(obj).attr("data-tt-id");// 获取this对象的属性
			var ids=[];
			ids.push(id);
			majortheory.deleteMajorTheory(ids);
		},
		
		/**
		 * 批量删除专业理论课程
		 */
		batchDelete : function() {
			var hasRelated=false; //是否有关联记录标识
			var ids=[];
			$("tbody input[type='checkbox']:checked").each(function(){
				var obj=$(this).parent().find("input[name='checNormal']");
				ids.push(obj.val());
				var relatedNum=obj.attr("relatedNum"); //关联记录数
				if(parseInt(relatedNum)>0){
					hasRelated=true;
				}				
			});
			if(hasRelated){
				popup.warPop("勾选的记录中有关联数据，不能删除，请重新勾选");
				return false;
			}
			if (ids.length==0){
				popup.warPop("请勾选要删除的专业理论课程信息");
				return false;
			}
			majortheory.deleteMajorTheory(ids);
		},
		
		/**
		 * 删除专业理论课程信息
		 */
		deleteMajorTheory : function(ids) {
			// 参数
			var param = {"ids" : ids};
			popup.askDeletePop("专业理论课程", function() {
				ajaxData.request(url.MAJORTHEORY_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {					
						// 提示成功
						popup.okPop("删除成功", function() {});	
						// 刷新列表
						majortheory.pagination.loadData();
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}					
				});
				
			});
		},
		
		/**
		 * 根据主键加载课程信息
		 */
		loadItem:function(majorTheoryId){
			// 加载属性
			ajaxData.request(url.MAJORTHEORY_GET_ITEM, {majorTheoryId:majorTheoryId}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS){
					var rvData = data.data;	
					utils.setForm($("#editForm"),rvData); // 表单自动绑定					
					//加载年级列表
				    simpleSelect.loadSelect("grade", url.GRADEMAJOR_GRADELIST,null,{defaultValue:rvData.grade,firstText:"请选择",firstValue:-1,async:false});
					//加载院系
				    simpleSelect.loadSelect("departmentId", urlData.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:departmentClassEnum.TEACHINGDEPARTMENT.value},{defaultValue:rvData.departmentId,firstText:"请选择",firstValue:"",async:false,length:12});
				    //初始化专业
				    simpleSelect.loadSelect("majorId", url.MAJORTHEORY_GET_MAJOR_LIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{defaultValue:rvData.majorId,firstText:"请选择",firstValue:""});
				    // 绑定开课单位下拉框
					simpleSelect.loadSelect("kkDepartmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT,null, {defaultValue:rvData.kkDepartmentId,firstText:"请选择",firstValue:""});								
					simpleSelect.loadDictionarySelect("checkWayCode",dataDictionary.CHECK_WAY_CODE,{defaultValue:rvData.checkWayCode}); // 绑定考核方式下拉框					
					simpleSelect.loadDictionarySelect("courseTypeCode",dataDictionary.COURSE_TYPE_CODE,{defaultValue:rvData.courseTypeCode}); // 绑定课程类别下拉框					
					simpleSelect.loadDictionarySelect("courseAttributeCode",dataDictionary.COURSE_ATTRIBUTE_CODE,{defaultValue:rvData.courseAttributeCode}); // 绑定课程属性下拉框
					
					//只允许输入数字
					 $("input[type='text']").on('keydown',function(e){
		               if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8){
		               	
			            }else{
		                   return false;
		               }
			         });
					 $("input[type='text']").on('blur',function(){
						 majortheory.setEffectiveDigit($(this));
				     });
					 
					//给Text绑定onBlur事件 
					 $("input[myattr='period']").on("blur", function() {						 
						majortheory.calculationTotalPeriod();
					});
					 
					//给数字控件绑定click事件 
					$(".mybutton").click(function(){
						majortheory.calculationTotalPeriod();
					});
					 
					 
					
					//绑定开课学期click事件
					 $("input[name='startclassSemester']").click(function() {					 
						 //在click的时候初始化复选框是否选中
						 for(var i=1;i<=14;i++){//遍历14个复选框，先让全不选
							 $("#scsCheckBox"+i).prop("checked", false);//先全部不选中
							 $("[for='scsCheckBox"+i+"']").attr("class", "checkbox-con");								 
						 }
						 var vals=$.trim($(this).val()); //开课学期“,”分隔字符串
						 if(vals!=null && vals!=""){
							 $.each(vals.split(','), function(i,val){
								 if(val!=null && val!=""){
									 $("#scsCheckBox"+val).prop("checked", true); //初始化选中的复选框
									 $("[for='scsCheckBox" + val + "']").attr("class", "checkbox-con on-check");
								 }							 
						      });  
						 }							 
						 //加载弹出下拉复选框效果
						 event.cancelBubble=true;						 
						 $("#checkboxlist").toggle();
						 
						//鼠标按下事件
						 document.onmousedown = function () {
							if ($("#checkboxlist").css("display") == "block" && isOutForModify) {
								$("#checkboxlist").hide();
							}
						};							 
					});						 
					//绑定开课学期下拉框中复选框的click事件
					 $("input[name='scsCheckBox']").on("click",  function() {
						 var vals=[];
						 $("#checkboxlist input[name='scsCheckBox']:checked").each(function(i,value){
							vals.push($(this).val());
						 });
						 $("#startclassSemester").val(vals.join(','));
					 });
				}
			});
		},
		
		/**
		 * 修改
		 */
		edit: function(obj){	
			var id = $(obj).attr("data-tt-id");// 获取this对象的属性
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var myDialog= popup.open('./trainplan/setTrainPlan/majorTheory/html/modify.html?majorTheoryId=' + id,
				{
					id : 'edit',// 唯一标识
					title : '专业理论课程修改',// 这是标题
					width :900,// 这是弹窗宽度。其实可以不写
					height : 780,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						iframeObj.$("#checkboxlist").hide();
						var v = iframeObj.$("#editForm").valid(); // 验证表单						
						if (v) { // 表单验证通过
							majortheory.saveForModify(iframeObj);
						} else { // 表单验证不通过				
							return false;
						}
					},focus:true},
					{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							myDialog.close();
						});
						return false;
					}}]					
				});
		}
	}
	module.exports = majortheory;
	window.majortheory = majortheory;
});
