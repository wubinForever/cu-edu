/**
 * 开课单位
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils");
	var ajaxData = require("basePath/ajaxData");
	var config = require("basePath/config");
	var URL = require("configPath/url.trainplan");
	var page = require("basePath/page");
	var popup = require("basePath/popup");
	var common = require("basePath/common");
	var base  =config.base;
	
	/**
	 * 开课单位
	 */
	var department = {
		//查询条件
		queryObject:{},	
		// 初始化
		init : function() {
			department.getUnitList();
			//查询按钮
			$("#query").on("click",function(){
				department.queryObject=utils.getQueryParamsByFormId("queryForm");//获取查询参数
				department.getUnitList('0');
			});
			//设置开课单位
			$("#setingUnit").on("click",function(){
				  var lenth = $("input[name='checNormal']:checked").length;
				  var ids = [];
       		      if(lenth==0){
       			  popup.warPop("至少勾选一条数据");
       			  return false;
       		      }
       		    $("input[name='checNormal']:checked").each(function(){
       		          ids.push($(this).attr("id"));
       		    })
				department.setingUnit(ids,1);
			});
			//取消开课单位
			$("#cancelUnit").on("click",function(){
				var lenth = $("input[name='checNormal']:checked").length;
				  var ids = [];
     		      if(lenth==0){
     			  popup.warPop("至少勾选一条数据");
     			  return false;
     		      }
     		    $("input[name='checNormal']:checked").each(function(){
     		    	 ids.push($(this).attr("id"));
     		    })
				department.setingUnit(ids,0);
			});
			
		},
		
		//查询开课单位信息
	    getUnitList:function(){
	    	var reqData=department.queryObject;
	    	ajaxData.request(URL.COMMENCEMENT_UNIT_QUERY,reqData,function(data){
	    		$("#tbodycontent").html("");
			    $("#tbodycontent").removeClass("no-data-html");
	    		if (data != null && data.data.length > 0) 
				{
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
				}else{
					$("#tbodycontent").append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
				}
	    	   $('#check-all').removeAttr("checked").parent().removeClass("on-check");
			},true);
	    },
	    
	   //设置或者取消开课单位
	    setingUnit:function(ids,a){
	    	var reqData={ids:ids,flag:a};
	    	popup.askPop(a == 1 ? '确定设置为开课单位？' : '确定取消开课单位？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.COMMENCEMENT_UNIT_SET,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS){
			    		popup.okPop(a == 1 ? '设置为开课单位成功!' : '取消开课单位成功!',function(){});
						department.getUnitList();
					}
					else{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else
						{
							popup.errPop(a == 1 ? '设置为开课单位失败!' : '取消开课单位失败!');
						}
					}
			    	$('#check-all').removeAttr("checked").parent().removeClass("on-check");
				});
		   });
	    	
	    }
	    
	}
	module.exports = department;
	window.department = department;
});
