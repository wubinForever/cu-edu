/*
 * 判断是否在设置时间范围
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("../../../common/js/utils/utils");
	var config = require("../../../common/js/utils/config");
	var ajaxData = require("../../../common/js/utils/ajaxData");
	//URL
	var URL_COURSEPLAN = require("../../../common/js/config/url.courseplan");
	var helper = require("../../../common/js/utils/tmpl.helper");
	
	var timeNotice = {
			// 初始化
			init : function(regData) {
				ajaxData.contructor(false);
	     		ajaxData.request(URL_COURSEPLAN.ARRANGE_COURSE_CANENTERINTO,regData, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data.isHavaCurrentSemester == false){
							//location.href= "../../../common/html/wrongTips.html?isHavaSemester=false";
							$("body").html(
								"<div class='layout-index text-center'"
								+"style='width:500px;position: absolute;top:50%;left: 50%;margin-left:-250px;margin-top:-200px;font-size:16px;'>"
								+"<img src='../../../../common/images/icons/warning.png' />"
								+"<p style='margin:20px 0px 10px;'>对不起，您暂时不能对此功能进行操作！</p>"
								+"<p class='notice-con'>排课学年学期未设置!</p>"
								+"</div>");
						}else{
							if(data.data.canEnterInto==false){
								var startTime = helper.format(data.data.startTime),
									endTime = helper.format(data.data.endTime);
								//location.href= "../../../common/html/wrongTips.html?startTime="+startTime+"&endTime="+endTime;
								$("body").html(
								"<div class='layout-index text-center'"
								+"style='width:500px;position: absolute;top:50%;left: 50%;margin-left:-250px;margin-top:-200px;font-size:16px;'>"
								+"<img src='../../../../common/images/icons/warning.png' />"
								+"<p style='margin:20px 0px 10px;'>对不起，您暂时不能对此功能进行操作！</p>"
								+"<p class='notice-con'>可操作时间范围：<span id='settingsTimeStart'>"+startTime+"</span> 至 <span id='settingsTimeEnd'>"+endTime+"</span></p>"
								+"</div>");
							}else{
								return true;
							}
						}
					}
				});	
				
			},
			
			/*
			 * 设置时间范围，日期加载
			 */
			/*dateInit : function(){
				(function ($) {
	                $.getUrlParam = function (name) {
	                    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	                    var r = window.location.search.substr(1).match(reg);
	                    if (r != null) return unescape(r[2]); return null;
	                }
	            })(jQuery);
	             var isHavaSemester = $.getUrlParam('isHavaSemester'),
	             	 startTime = $.getUrlParam('startTime'),
	             	 endTime = $.getUrlParam('endTime');
	            
	            if(utils.isNotEmpty(isHavaSemester) && isHavaSemester == "false"){
	            	$(".notice-con").html("排课学年学期未设置!");
	            }else{
					$("#settingsTimeStart").html(startTime);
					$("#settingsTimeEnd").html(endTime);
	            }
	            
			},*/
			
		}
	module.exports = timeNotice; // 与文件名称一致
});