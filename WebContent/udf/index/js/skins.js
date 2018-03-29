/**
 * 皮肤控制
 * 2018-2-6
 * dinxun
 */
define(function (require, exports, module) {
	
	/**
	 * 导入js
	 */
	var utils = require("../../../common/js/utils/utils");
	var config = require("../../../common/js/utils/config");
	var ajaxData = require("../../../common/js/utils/ajaxData");
	var cookieUtils = require("../../../common/js/utils/cookieUtils");
	
	var skins = {
		/**
		 * 初始化
		 */
		init : function(){
			//加载皮肤主题内容
			var skins =[
				{ "skinName":"skin-blue" , "topClass":"bg-light-blue", "leftClass":"bg-blue-active", "skinTxt":"蓝色" },
				{ "skinName":"skin-green" , "topClass":"bg-green", "leftClass":"bg-green-active", "skinTxt":"绿色" },
				{ "skinName":"skin-red" , "topClass":"bg-red", "leftClass":"bg-red-active", "skinTxt":"红色" },
			] 
			
			//遍历加载内容
			$.each(skins, function(i, num){
				var name = num.skinName,
					classTop = num.topClass,
					classLeft = num.leftClass,
					nameTxt = num.skinTxt;
					
				var skinOne = "<li style='float:left; width: 33.33333%; padding:10px 5px;'>"
								  +"<a href='javascript:void(0);' data-skin="+name+" style='display: block; box-shadow: 0 0 3px rgba(0,0,0,0.4)' class='clearfix full-opacity-hover'>"
								  	+"<div><span style='display:block; width: 20%; float: left; height: 7px;' class="+classLeft+"></span>"
					              		+"<span class="+classTop+" style='display:block; width: 80%; float: left; height: 7px;'></span></div>"
					              	+"<div><span style='display:block; width: 20%; float: left; height: 20px; background: #222d32;'></span>"
					              		+"<span style='display:block; width: 80%; float: left; height: 20px; background: #f4f5f7;'></span></div>"
					              +"</a>"
					              +"<p class='text-center no-margin'>"+nameTxt+"</p>"
				              +"</li>"
			                		
			    $("#skin-list").append(skinOne);            			
			                		
			});
			
			//点击显示皮肤下拉框
			$(".skins-setting").click(function(){
				var skinBox = $(this).find("div.setting-dropdown");
				skinBox.toggleClass("control-sidebar-open");
			});
			
			//切换皮肤
			this.onChange();
		},
		
		/*
		 * 皮肤切换
		 */
		
		onChange : function(){
			$("#skin-list>li").click(function(){
				var skinDate = $(this).children("a").attr("data-skin");
				//修改大框架皮肤名称
				$("body").removeClass().addClass(skinDate); 
				//修改框架内iframe皮肤名称
				$("iframe").contents().find("body").removeClass().addClass(skinDate);
				
				//保存到cookie
				cookieUtils.setCookie('skinName', skinDate);
			});
			
		}
	}
    module.exports = skins;
});
