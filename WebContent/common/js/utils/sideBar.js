define(function (require, exports, module) {
	/**
 * 主框架左侧菜单 js
 */
	var sideBar = {
	
		init:function(){
			//左侧菜单点击
	    	$(document).on("click",".nav-list li",function(e){
	    			sideBar.toggleDown(e);
	    		 	e.stopPropagation();//不触发父DIV的点击事件
	    	});
	    	
	    	//左侧菜单缩放
	    	sideBar.collapse();
			
		},	
		
		/**
		 * 菜单 点击
		 */
		toggleDown:function(e){
			var obj = e.currentTarget,
				_a = $(obj).children("a"),
				sublist = $(obj).children("ul"),
				sibmenu = $(obj).siblings();
			
			//除点击对象以外的列表去除点击效果，并收起列表
			sibmenu.removeClass("active");
			sibmenu.children("ul").removeClass("menuOpen");
			sibmenu.children("ul").slideUp(600);
			
			//点击菜单列表，判断出子集a有下拉属性，并包含下拉列表的对象；
			if(_a.hasClass("dropdown-toggle") && sublist.length>0){
				$(obj).toggleClass("active");
				sublist.toggleClass("menuOpen");
				
			}	
			
			//如果二级菜单类含有“menuOpen”，下拉列表
			if(sublist.hasClass("menuOpen")){
				sublist.slideDown(400);
			}else{
				sublist.slideUp(400);
			}
			
		},
		menuToggleDown:function(index,menuType){
             var obj = $(".side-bar .nav-list li.menuli").eq(index),
                 sibmenu = obj.siblings();
             if(menuType == 1){  //有子节点，高亮展开就行
                var _a = obj.children("a"),
			       sublist = obj.children("ul");
			       obj.addClass("active").siblings(".menuli").removeClass("active")
			       if(_a.hasClass("dropdown-toggle") && sublist.length>0){
						sublist.toggleClass("menuOpen");
				   }
				   //如果二级菜单类含有“menuOpen”，下拉列表
				   if(sublist.hasClass("menuOpen")){
						sublist.slideDown(400);
				   }else{
					    sublist.slideUp(400);
				   }	

             }else{  //没有子节点，高亮并打开新页面
             	obj.addClass("active");
                var firstLia = obj.find("a");
                var menu = {};
	    		    menu.url = firstLia.attr("url");
	    		    menu.code = firstLia.attr("menu-id");
				    menu.name = firstLia.attr("menu-name");
				window.top.index.initTabs(menu);
				$('#myTab li').css('border-right','0px');
				$('#myTab li:last').css('border-right','1px solid #c5d0dc');
             }

            sibmenu.removeClass("active");
			sibmenu.children("ul").removeClass("menuOpen");
			sibmenu.children("ul").slideUp(600);	
		},
		/**
		 * 菜单 缩放
		 */
		
		collapse:function(){
	    	$("#sidebar-collapse").on("click",function(){
				$(this).children("i[class *='fa']")
					.toggleClass("fa-angle-double-right");
				$("#sideBar").toggleClass("menu-min");
	    	});
		}
	}
	module.exports = sideBar;
	window.sideBar = sideBar;
});
