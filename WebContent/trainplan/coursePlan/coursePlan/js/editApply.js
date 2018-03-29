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
	var dataDic = require("configPath/data.dictionary");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var ModuleFlag=require("basePath/enumeration/trainplan/ModuleFlag");
	var base  =config.base;
	/**
	 * 申请开课变更修改
	 */
	var editApply = {
		//修改页面初始化
		innitUpdate:function(){
			
			// 获取url参数
			var startclassPlanId = utils.getUrlParam('startclassPlanId');
			//加载修改详情
			editApply.loadItem(startclassPlanId);
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
									    ajaxData.request(URL.editApply_SAVE,reqData,function(data){
									    	if(data.code==config.RSP_SUCCESS)
									    	{
									    		popup.okPop("修改课程成功",function(){});
									    		editApply.pagination.loadData();
											}
											else
											{
												popup.warPop("修改课程失败");
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
					    ajaxData.request(URL.editApply_SAVE,reqData,function(data){
					    	if(data.code==config.RSP_SUCCESS)
					    	{
					    		popup.okPop("修改环节成功",function(){});
					    		editApply.pagination.loadData();
							}
							else
							{
								popup.warPop("修改课程失败");
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
		}
	}
	module.exports = editApply;
	window.editApply = editApply;
});
