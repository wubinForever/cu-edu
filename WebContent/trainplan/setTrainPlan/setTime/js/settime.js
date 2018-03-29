/**
 * 维护时间
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.trainplan");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var dataDictionary=require("configPath/data.dictionary");
	var helper = require("basePath/utils/tmpl.helper");
	// 下拉框
	var base  =config.base;
	/**
	 * 维护时间
	 */
	var settime = {
		//查询条件
		queryObject:{},	
		// 初始化
		init : function() {
			settime.getUnitList();
			//查询按钮
			$("#query").on("click",function(){
				settime.queryObject=utils.getQueryParamsByFormId("queryForm");//获取查询参数
				settime.getUnitList();
			});
			// 设置
			$(document).on("click", "button[name='set']", function() {
				settime.set(this);
			});
			// 批量设置
			$(document).on("click", "button[name='setall']", function() {
				var lenth = $("input[name='checNormal']:checked").length;
				var ids = [];
       		    if(lenth==0){
       			popup.warPop("至少勾选一条数据");
       			return false;
       		    }
       		    $("input[name='checNormal']:checked").each(function(){
       		          ids.push($(this).attr("id"));
       		    })
				settime.setall(ids,lenth);
			});

			// 复选框
			//utils.checkAllCheckboxes('check-all', 'checNormal');
		},
		/** ******************* add初始化 开始 ******************* */
		setInit : function() {			
			// 获取url参数
			var departmentId = utils.getUrlParam('departmentId');
			//加载维护时间信息
			settime.loadItem(departmentId);
			//初始化表单校验
			settime.initFormDataValidate($("#setForm"));
		},
		/** ******************* add初始化 结束 ******************* */
		/** ******************* add初始化 开始 ******************* */
		setAllInit : function() {			
			// 获取url参数
			var departmentIds = utils.getUrlParam('departmentIds');
			var lenth = utils.getUrlParam('lenth');
			//加载维护时间信息
			settime.loadAllItem(departmentIds,lenth);
			//初始化表单校验
			settime.initFormDataValidate($("#setForm"));
		},
		/** ******************* add初始化 结束 ******************* */
		//查询开课单位信息
	    getUnitList:function(){
	    	var reqData=settime.queryObject;
	    	ajaxData.request(url.SETTIME_LIST,reqData,function(data){
	    		$("#tbodycontent").html("");
			    $("#tbodycontent").removeClass("no-data-html");
	    		if (data != null && data.data.length > 0) 
				{
					$("#tbodycontent").html($("#bodyContentImpl").tmpl(data.data, helper));
				}else{
					$("#tbodycontent").append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
				}
	    		$('#check-all').removeAttr("checked").parent().removeClass("on-check");//取消全选
			},true);
	    },
	    /**
		 * 初始化新增、编辑表单校验
		 * formJQueryObj 表单jquery对象
		 */
		initFormDataValidate:function(formJQueryObj){
			ve.validateEx();
			formJQueryObj.validate({
				rules : {
					beginTime : {
						"required" : true,
						"isDateTimeFormat" : true
					},
					endTime : {
						"required" : true,
						"isDateTimeFormat" : true
					}
				},
				messages : {
					beginTime : {
						"required" : '开始时间不能为空',
						"isDateTimeFormat" : '输入日期格式不正确，如：2017-11-9 10:30'
					},
					endTime : {
						"required" : '结束时间不能为空',
						"isDateTimeFormat" : '输入日期格式不正确，如：2017-11-9 10:30'
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
		 * 根据主键加载维护时间信息
		 */
		loadItem:function(departmentId){
			// 加载属性
			ajaxData.contructor(false);
			ajaxData.request(url.SETTIME_GETITEM, {departmentId:departmentId}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS){
					rvData = data.data;	
					// 绑定数据
					$("#departmentIds").val(rvData.departmentId); //部门ID
					$("#departmentNo").text(rvData.departmentNo) ; //部门号
					// 绑定数据
					if(utils.isNotEmpty(rvData.beginTime))
					{
						$("#beginTime").val( new Date(rvData.beginTime).format("yyyy-MM-dd hh:mm")); // 开始时间
					}
					if(utils.isNotEmpty(rvData.endTime))
					{
						$("#endTime").val( new Date(rvData.endTime).format("yyyy-MM-dd hh:mm")); // 结束时间
					}
					$("#departmentName").text(rvData.departmentName);	//部门名称
					$("#departmentName").attr("title",rvData.departmentName);
				} 
			});
		},
		 /**
		 * 根据主键加载维护时间信息
		 */
		loadAllItem:function(departmentIds,lenth){
			// 加载属性
			$("#departmentIds").val(departmentIds); //部门ID
			$("#departmentCount").text(lenth); //部门数量
		},
		/**
		 * 设置 弹窗
		 */
		set: function(obj){
			var departmentId = $(obj).attr("data-tt-id");// 获取this对象的属性
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var myDialog= popup.open('./trainplan/setTrainPlan/setTime/html/set.html?departmentId=' + departmentId, // 这里是页面的路径地址
				{
					id : 'set',// 唯一标识
					title : '设置培养方案维护时间',// 这是标题
					width : 500,// 这是弹窗宽度。其实可以不写
					height : 380,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						var v = iframeObj.$("#setForm").valid(); // 验证表单						
						if (v) { // 表单验证通过
							var beginTime = $("#beginTime").val();
							var endTime = $("#endTime").val();
							if(endTime<beginTime){
								popup.warPop("结束时间必须大于开始时间");
								return false;
							}
							settime.save(iframeObj,myDialog);
						}
						return false;
					},focus:true},
					{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							myDialog.close();
						});
						return false;
					}}]
				});
		},
		/**
		 * 批量设置 弹窗
		 */
		setall: function(departmentIds,lenth){
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var myDialog= popup.open('./trainplan/setTrainPlan/setTime/html/setall.html?departmentIds=' + departmentIds + '&lenth=' + lenth, // 这里是页面的路径地址，URL传参数：如果部门过多，可能报错
				{
					id : 'setall',// 唯一标识
					title : '批量设置培养方案维护时间',// 这是标题
					width : 500,// 这是弹窗宽度。其实可以不写
					height : 420,// 弹窗高度					
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						var v = iframeObj.$("#setForm").valid(); // 验证表单						
						if (v) { // 表单验证通过
							var beginTime = $("#beginTime").val();
							var endTime = $("#endTime").val();
							if(endTime<beginTime){
								popup.warPop("结束时间必须大于开始时间");
								return false;
							}
							settime.save(iframeObj,myDialog);
						} 
						return false;
					},focus:true},
					        {name:'取 消',callback:function(){
					        	popup.askPop("确认取消吗？",function(){
									myDialog.close();
								});
								return false;
					        }}]
				});
		},
		/**
		 * 保存
		 */
		save:function(iframeObj,myDialog){			
			var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#setForm"));//获取要保存的参数			
			ajaxData.contructor(false);
			ajaxData.request(url.SETTIME_UPDATE, saveParams, function(data) {	
				if (data.code == config.RSP_SUCCESS) {
					myDialog.close();					
					// 刷新列表
					settime.getUnitList();
					// 提示成功
					popup.okPop("保存成功", function() {});	
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}				
			});		
		},
	}
	module.exports = settime;
	window.settime = settime;
});
