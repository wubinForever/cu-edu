/**
 * 主界面
 */
define(function(require, exports, module) {

	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.udf");
	var sideBar = require("basePath/utils/sideBar");
	var cookieUtils = require("basePath/utils/cookieUtils");
	var login = require("../../user/js/login");
	var autoHeight = require("basePath/utils/autoHeight");
	var AuditResult = require("../../../common/js/enumeration/common/AuditResult");
	var user = require("../../user/js/user");
	var title = require("basePath/config/title.config");
	var skins = require("./skins");
	var MenuEnum = {
		inside : 1,
		newPage : 2
	}

	var UserInfo = {};
	var menuFlag = new Date().getTime(); // 个人桌面标识
	var index = {
		/**
		 * 初始化
		 */
		count : 100,
		init : function() {
			// 皮肤控制
			skins.init();

			// 窗口化时调整标签导航的折叠
			$(window).resize(function() {
				var maxLength = index.autoLength() - 1; // 能容纳的数目
				var totalLength = $(".tabbable li").length; // 总LI的数目
				var node = $('.tabbable li');
				for (var c = 0; c < node.length; c++) {
					node.eq(c).find('a').attr('data-toggle', 'tab');
				}

				// $('#myTab,#tabMore').html("");
				if (totalLength > maxLength) {
					$('.tabs-more').show();
					for (var i = 0; i < maxLength; i++) {
						$('#myTab').append(node.eq(i));
					}
					for (var j = maxLength; j < totalLength; j++) {
						$('#tabMore').append(node.eq(j));
					}
				} else {
					$('#myTab').append(node)
					$('.tabs-more').hide();
					// $('#myTab>li:last').appendTo($('#tabMore'));
					$(".tabs-more").mouseenter(function() {
						$(this).children("ul").slideDown();
					});
					$(".moretab-list, .tabs-more").mouseleave(function() {
						$(".moretab-list").stop();
						$(".moretab-list").slideUp();
					});
				}

				$('#myTab li').css('border-right', '0px');
				$('#myTab li:last').css('border-right', '1px solid #c5d0dc');
				// 标签过长省略时，鼠标经过显示title
				for (var d = 0; d < $('#myTab li').length; d++) {
					var titTxt = '';
					titTxt = $('#myTab li').eq(d).find('span').text();
					if (titTxt.length > 6) {
						$('#myTab li').eq(d).find('span').attr('title', titTxt);
					}
				}
			});
			/* 初始化左侧的菜单 */
			sideBar.init();
			/* 加载菜单内容 */			
			index.loadMenu();	
			/* 加载登录的用户信息 */
			index.loadLoginUser();
			
			// 修改密码
			index.updatePWD();
			$("#updatePassword").click(function() {
				user.popUpdatePasswordHtml(this);
			});
			// 登出
			$("#loginOutId").click(function() {
				login.loginOut();
			});
			// 切换系统，隐藏清空tab折叠按钮
			$(document).on("click", ".systemic-nav li", function() {
				$(".systemic-nav li").removeClass("active");
				$(this).addClass("active");
				// $('#tabMore li').remove();
				// $('#tabMore').hide();
				// $(".tabs-more").hide();
				// $(".tabs-more").css("height","34px");
			});

			// 顶部菜单收缩
			$(document).on("mouseenter", ".mini-tab>a", function() {
				index.topMenuToggle(this);
			});
			// 左侧点击
			$(document).on("click", "#sidebar a[url]", function() {
				index.loadMenuUrl(this);
				$('#myTab li').css('border-right', '0px');
				$('#myTab li:last').css('border-right', '1px solid #c5d0dc');
			});
			// 点击系统，菜单
			$(document).on("click", "a[menu-bar]", function() {
				var _ = $(this);
				var menuId = _.attr("menu-id");
				index.loadLeftMenuCopy(menuId);
			});
			// tab折叠 点击切换
			$(document).on("click", "#tabMore li", function(e) {
				var obj = $(e.currentTarget), currentId = obj.children("a").attr("href");
				// obj.siblings().removeClass("active");
				$(".tabbable li").removeClass("active");
				obj.addClass("active");
				$("div.tab-pane").removeClass("active");
				$("div" + currentId).addClass("active");

			});
			$(document).on("click", "#myTab li", function(e) {
				$(".tabbable li").removeClass("active");
				$(this).addClass("active");
			});
			// tab右侧点击删除
			$(document).on(
					"click",
					".tabbable .fa-times",
					function() {
						var _ = $(this), li = _.parents("li"), id = _.parents("ul").attr("id"), lisNum = $("#tabMore li").length - 1, ul = li.parent(), a = _.parent(), activeLi = "", menuId = a
								.attr("href"), menuId = menuId.substring(1, menuId.length);

						// 定义下一个将触发tab
						if (li.hasClass("active")) {
							if (li.prev("li").length > 0) {
								activeLi = li.prev("li");
							} else if (li.next("li").length > 0) {
								activeLi = li.next("li");
							}

							// 展开的tab
							if (id == "myTab") {
								if (activeLi.length == 0) {
									return false;
								}
								activeLi.find("a").click();
							}

							// 折叠的tab
							if (id == "tabMore") {
								if (li.siblings().length > 0) {
									var activeId = activeLi.children("a").attr("href");
									activeLi.find("a").click().parent("li").addClass("active");
									$("div" + activeId).addClass("active");
								}
							}
						}

						// 展开的tab
						if (id == "myTab") {
							// 如果只有一个，不能删除
							if (li.siblings("li").length == 0) {
							}

							// 如果删除后，相邻li个数小于6，“#tabMore”隐藏
							var maxLencm = index.autoLength() - 1;
							if (li.siblings("li").length < maxLencm && $(".tabs-more:visible").length == 1) {
								var firstOne = "";
								$("#tabMore li").each(function(i, obj) {
									if (i == 0) {
										firstOne = $(obj).find("a").attr("data-toggle", "tab");
										firstOne = $(obj).prop("outerHTML");
									}
								});

								// 折叠tab的第一个添加到展开的tab
								li.parent().append(firstOne);
								$("#tabMore>li:first-child").remove();
							}

						}

						li.remove();
						$("#" + menuId).remove();
						index.hideTabMore(lisNum);
						$('#myTab li').css('border-right', '0px');
						$('#myTab li:last').css('border-right', '1px solid #c5d0dc');

						// 标签过长省略时，鼠标经过显示title
						for (var d = 0; d < $('#myTab li').length; d++) {
							var titTxt = '';
							titTxt = $('#myTab li').eq(d).find('span').text();
							if (titTxt.length > 6) {
								$('#myTab li').eq(d).find('span').attr('title', titTxt);
							}
						}						
						return false;

					});

			// $(".aui_state_focus").remove();

			// 菜单 收缩
			$(document).on("click", "#sidebar-collapse", function() {
				$("#sidebar").toggleClass("menu-min");
			});

			// 打开个人桌面
			$(document).on("click", ".desktop", function() {
				var deskWord = $(".nav-tabs a[href='#" + menuFlag + "']").html();
				if (deskWord) {
					$(".nav-tabs a[href='#" + menuFlag + "']").parent().addClass("active").siblings().removeClass("active");
					$("div.tab-pane").removeClass("active");
					$("#" + menuFlag).addClass("active");
				} else {
					index.loadMenu();
				}
			});

		},
		/**
		 * 加载菜单
		 */
		loadMenu : function() {
			ajaxData.request(URL.MENU_MENU_MENULIST, null, function(data) {
				var menuList = data.data;
				if (menuList === undefined)
					return;
				if (menuList.length > 0) {
					var menuId = menuList[0].menuId;
					index.menuCount = menuList.length
					if (menuList.length == 1) {
						/* 直接放在左侧 */
						$("#navbarDropdownId").remove();
						$("#navbarId").remove();
						$(".side-bar .nav-list li.menuli").eq(0).addClass("active");
					} else if (menuList.length <= 3) {
						/* 顶部直接显示 */
						$("#navbarDropdownId .larger-tab ul").html("");
						$("#navbarTmpl").tmpl(menuList).appendTo('#navbarDropdownId .larger-tab ul');
						$(".mini-tab").remove();
					} else {
						/* 放到下拉框中 */
						$("#navbarDropdownId .mini-tab ul").html("");
						$("#navbarDropdownTmpl").tmpl(menuList).appendTo('#navbarDropdownId .mini-tab ul');
						$(".larger-tab").remove();
					}

					// index.loadLeftMenu(menuId);//初始化时默认加载第一个系统级菜单下的菜单树
					var menuIds = utils.getUrlParam('menuId');
					if (utils.isNotEmpty(menuIds)) {
						index.loadLeftMenuByChildMenuId(menuIds);// 初始化时默认加载指定系统级菜单下的菜单树
					} else {
						index.loadLeftMenuOnly(menuId);
					}
					var menu = {};
					menu.url = 'udf/index/html/desktop.html';
					menu.name = '个人桌面';
					menu.code = menuFlag
					$("#iframeTmpl").tmpl(menu).appendTo('#myIframe');
					$("#tabTmpl").tmpl(menu).appendTo('#myTab');
					$("a[href*=" + menu.code + "]").click();
					$('#myTab li').css('border-right', '0px');
					$('#myTab li:last').css('border-right', '1px solid #c5d0dc');
				}
			});
		},
		/**
		 * 仅仅加载左侧菜单
		 */
		loadLeftMenuOnly : function(menuId) {
			ajaxData.request(URL.MENU_MENU_MENUTREE, {
				menuId : menuId
			}, function(data) {
				$("#sidebar").html("");
				$("#menuTmpl").tmpl(data.data).appendTo('#sidebar');
			});
		},
		/**
		 * 加载左侧菜单
		 */
		loadLeftMenu : function(menuId) {
			ajaxData.request(URL.MENU_MENU_MENUTREE, {
				menuId : menuId
			}, function(data) {
				$("#sidebar").html("");
				$("#menuTmpl").tmpl(data.data).appendTo('#sidebar');
				index.openWellcome();
			});
		},
		loadLeftMenuCopy : function(menuId) {
			ajaxData.request(URL.MENU_MENU_MENUTREE, {
				menuId : menuId
			}, function(data) {
				$("#sidebar").html("");
				$("#menuTmpl").tmpl(data.data).appendTo('#sidebar');
			});
		},
		/**
		 * 根据指定menuId加载菜单 --zl
		 * 
		 * @param menuId
		 *            指定menuId
		 */
		loadLeftMenuByChildMenuId : function(menuId) {
			ajaxData.request(URL.MENU_GETITEMBYAUTH, {
				menuId : menuId
			}, function(data) {
				if (data.data != undefined && data.data != null) {
					var parentMenuId = data.data.parentIdList;
					var arr = parentMenuId.split(",");
					newmenuId = arr[1];
					ajaxData.request(URL.MENU_MENU_MENUTREE, {
						menuId : newmenuId
					}, function(data) {
						$("#sidebar").html("");
						$("#menuTmpl").tmpl(data.data).appendTo('#sidebar');
						index.openWellcomeByMenuId(menuId);
					});
				} else {
					window.top.location.href = utils.getRootPathName() + "/login.html";
				}
			});
		},
		/**
		 * 折叠按钮隐藏
		 */
		hideTabMore : function(lisNum) {
			if (lisNum == 0) {
				$('#tabMore li').remove();
				$('#tabMore').hide();
				$(".tabs-more").hide();
				// $(".tabs-more").css("height","34px");
				$("#myTab li:last-child").find("a").click();
			}
		},
		/**
		 * 加载菜单中的连接
		 */
		loadMenuUrl : function(obj, option) {
			var menu = {};
			if (obj) {
				var _ = $(obj);
				/* 获取menu对象 */
				menu.url = _.attr("url");
				menu.code = _.attr("menu-id");
				menu.name = _.attr("menu-name");
			} else {
				menu = option;
			}
			index.initTabs(menu);
		},
		/**
		 * 加载tab菜单
		 */
		initTabs : function(menu) {
			/* 判断是否要添加 */
			var tab = $("a[href*=" + menu.code + "]"), tablength = "";
			/* 获取tabs 长度 */
			$("#myTab li").each(function(a, b) {
				tablength = a + 1;
			});
			if (tab.length == 0) {
				// 如果已经添加，则将当前点击的active
				$("#iframeTmpl").tmpl(menu).appendTo('#myIframe');
				var MaxLen = index.autoLength();
				if (tablength < MaxLen - 1) {

					$("#tabTmpl").tmpl(menu).appendTo('#myTab');
					$("a[href*=" + menu.code + "]").click();
				} else {
					/* tab数量多于6，折叠下拉 */
					$("#tabMoreTmpl").tmpl(menu).appendTo('#tabMore');
					$(".tabs-more").show();
					$(".tabs-more").mouseenter(function() {
						$(this).css("max-height", "120px");
						$(this).children("ul").slideDown();
					});
					$(".moretab-list, .tabs-more").mouseleave(function() {
						$(".moretab-list").stop();
						$(".moretab-list").slideUp();

						// $(".tabs-more").css("height","34px");
					});
					$("#myTab li").removeClass("active");
					$("#tabMore a[href*=" + menu.code + "]").parent("li").siblings().removeClass("active");
					$("#tabMore a[href*=" + menu.code + "]").click().parent("li").addClass("active");

				}
			}

			$("a[href*=" + menu.code + "]").click();
			// 标签过长省略时，鼠标经过显示title
			for (var i = 0; i < $('#myTab li').length; i++) {
				var titTxt = '';
				titTxt = $('#myTab li').eq(i).find('span').text();
				if (titTxt.length > 6) {
					$('#myTab li').eq(i).find('span').attr('title', titTxt);
				}
				;
			}
			;
		},
		// 计算自适应的导航应该加载的个数
		autoLength : function() {
			var wrapcm = $('.tabbable').width();
			var maxLen = Math.floor(wrapcm / 135);
			return maxLen;
		},
		/**
		 * 页面欢迎页面，默认展开第一个
		 */
		openWellcome : function() {
			var header = $("div.side-bar-header div");
			var url = header.attr("url");
			if (url) {
				var param = {}
				param.url = url;
				param.code = header.attr("menu-id");
				param.name = header.attr("menu-name");
				index.loadMenuUrl(null, param);
				return;
			}

			var a = $("#sidebar a:eq(1)");
			a.trigger("click");
			a.parent().addClass("active");

			var b = $("#sidebar a[url]:first()");
			b.trigger("click");
			b.parent().addClass("active");
		},
		/**
		 * 页面欢迎页面，默认展开指定的页面-zl
		 */
		openWellcomeByMenuId : function(menuId) {
			var header = $("a[menu-id='" + menuId + "']");
			var url = header.attr("url");

			var a = header.parents(".menuli").find("a:eq(0)");
			a.trigger("click");
			a.parent().addClass("active");

			if (url) {
				var b = header;
				b.trigger("click");
				b.parent().addClass("active");
			}
		},
		/**
		 * 获取登录的用户信息
		 */
		loadLoginUser : function() {
			ajaxData.request(URL.USER_LOGIN_USER, null, function(data) {

				if (data.data === undefined)
					return;
				$("#userName").text(data.data.userName);
				$("#updatePassword").val(data.data.userId);
				window.USER = data.data;
			});
		},

		/*
		 * 顶部菜单折叠
		 */
		topMenuToggle : function(obj) {
			var _this = $(obj);
			_this.parent().addClass("open");

			if (_this.parent().hasClass("open")) {
				$(document).on("mouseleave", ".mini-tab>.dropdown-navbar", function(e) {
					var _this = $(e.currentTarget);
					_this.parent().removeClass("open");
				});
			}
		},
		/**
		 * 单点登录时 业务系统修改密码功能隐藏
		 */
		updatePWD : function() {
			ajaxData.request(URL.USER_GETSSOLOGININFO, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if (data.data.openSSO) {
						// 是单点登录
						$(".ssoHide").hide();
					} else {
						// 不是单点登录

					}
				}
			});
		},
		
		//消息弹窗
		mailPop : function(){
			popup.open('./udf/index/html/mail.html', 
			{
				id:'mailPop',
				title:'消息查看',
				width: 800,
				height: 350,
				okVal:'保存',
				cancelVal : '关闭',
				ok : function() {
				},
				cancel:function(){
				}
			})
		},
		//在线人数
		onlineCount:function(){
			ajaxData.request(URL.USER_ONLINE_COUNT,null,function(data){
				if(data.code == config.RSP_SUCCESS){
					$("#onlineCount").html(data.data);
				}else{
					$("#onlineCount").html(0);
				}
			});
		}
		
		
	}
	self.setInterval("index.onlineCount()",60000);
	index.onlineCount();
	
	module.exports = index;
	window.index = index;
});
