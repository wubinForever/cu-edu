/**
 * 个人桌面
 */
define(function (require, exports, module) {
	require("basePath/utils/common");
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.udf");
    var URL_DATA = require("basePath/config/url.data");
    var sideBar = require("basePath/utils/sideBar");
	var desktop = {
		/**
		 * 初始化
		 */
		init : function(){
			//初始化校历
		    this.initSchoolCalendar();
		    //加载桌面
            desktop.loadDeskTop();
           //桌面菜单项点击
           $(document).on("click", "#desktop li", function(e){
           	   var _this = $(this);
           	   var index = _this.index();
           	   var parentId = $(this).find("a").attr("parent-id");
           	   var menuId = $(this).find("a").attr("menu-id");
               var menuType = $(this).find("a").attr("menu-type"); //节点类型
           	   if(parentId=='0'){ //是有多个系统权限的
                   window.top.index.loadLeftMenuCopy(menuId)
           	   }else{
           	   	  window.top.sideBar.menuToggleDown(index,menuType);
	    		  e.stopPropagation();
           	   }
		  });
		},
		/**
		 * 初始化菜单
		 */
		loadDeskTop : function(){
			ajaxData.request(URL.MENU_MENU_MENULIST,null,function(menuRes){
				 var count = menuRes.data.length;
				 var menuId = menuRes.data[0].menuId;
				 if(count>1){
				 	$("#ulListImpl").tmpl(menuRes.data).appendTo('#list');
				 }else{
                    ajaxData.request(URL.MENU_MENU_MENUTREE,{menuId:menuId},function(data){
                       var menulist = data.data.list;
					   $("#ulListImpl").tmpl(menulist).appendTo('#list');
				   });
				 }
			});
		},
		/**
		 * 初始化校历
		 */
		initSchoolCalendar:function(){
            ajaxData.request(URL_DATA.SCHOOLCALENDAR_GET_PERSONALDESKTOP,null,function(data){
            	if (data.code === config.RSP_SUCCESS) {
            	 var resData = data.data;
                 if(utils.isNotEmpty(resData.weekName)){
                    $(".desktop .time").html(resData.currentDate.replace(/-/g, "/")+"<span>("+resData.weekName+" "+resData.dayOfWeek+")</span>");
                 }
                 if(utils.isNotEmpty(resData.academicYearSemester) && utils.isNotEmpty(resData.semesterCodeName)){
                    $(".desktop .academic").html(resData.academicYearSemester+"<span>("+resData.semesterCodeName+")</span>");
                 }
				}
			});
		}
	}
    module.exports = desktop;
});
