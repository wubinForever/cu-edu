/**
 * 菜单管理 js
 */
define(function (require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils");
	var ajaxData = require("basePath/ajaxData");
	var config = require("basePath/config");
	var URL = require("configPath/url.udf");
	var page = require("basePath/page");
	var popup = require("basePath/popup");
	var treeTable = require("basePath/treeTable");
	var common = require("basePath/common");
	var base  =config.base;
	var data =[];//数据	
	//var base="";
	//树目录控件初始化单选框------------------------------------
    var setting = {
	   view: {
			showLine: false,
			nameIsHTML: true
		},
		data: {
			simpleData: {
				enable:true,
				idKey: "id",
				pIdKey: "pId",
				rootPId: "0"
			},
			key:{
				title: "name"
			}
		},
		callback: {
			onDblClick: function(event, treeId, treeNode) {
			},
			onClick:function(event, treeId, treeNode){
			   $("#treeCode").hide();
			   $("#permissionName").val(treeNode.name);
			   $("#permissionCode").val(treeNode.id);
			   $("#permissionCode").next().remove();
		   }
		}
	};
	
	/**
	 * 菜单管理
	 */
	
	//模块化
	var menu={
		init:function(){
			
			//初始化列表
			menu.getTreeTableList();
			//新增事件
			$("button[name='addMenu']").on("click",function(){
				var lenth = $("input[name='checNormal']:checked").length;
       		    if(lenth>1){
       		    	popup.warPop("新增只允许勾选一条数据");
       		    	return false;
       		    }
       		    var ids = "";
       		    if(lenth==1){
	       		    $("input[name='checNormal']:checked").each(function(){
	       		    	id =$(this).parents("tr").attr("data-tt-id")
	       		    	// id.push($(this).parents("tr").attr("data-tt-id"));
	       		    })
	       		    menu.addMenu(id);
       		    }
       		    else if(lenth==0){
       		    	menu.addMenu("");
       		    }
		    });
		    
		    //修改事件
			$(document).on("click", "[name='editMenu']",function(){		
				menu.updateMenu(this);
		    });
			
			//删除事件
		   $("#delete").on("click",function(){
			   var menuIdArr = [];
			   $("input[name='checNormal']:checked").each(function(){
				   menuIdArr.push($(this).parents("tr").attr("data-tt-id"));
			   })
			   if(utils.isEmpty(menuIdArr)){
				   popup.warPop("请勾选要删除的菜单");
				   return false;
			   }
			   menu.delte(menuIdArr);
		   });
		   
		   //上移事件
       	   $(document).on("click", "[name='up']",function(){
       		    menu.treeTab.up(this, function(tr, tr2){
    	    	 var currentid = tr2.tr.attr("data-tt-id");
    	    	 var upId= tr.tr.attr("data-tt-id");
    	    	 var param ={upId:upId,downId:currentid};
    	    	 ajaxData.contructor(false);
    	    	 ajaxData.request(URL.MENU_MOVEUPANDDOWN,param,function(data){});
       			 return true;
       		 });
	       });
       	   
       	   //下移事件 
       	   $(document).on("click", "[name='down']",function(){		
       		 menu.treeTab.down(this, function(tr, tr2){
    	    	 var currentid = tr.tr.attr("data-tt-id");
    	    	 var upId= tr2.tr.attr("data-tt-id");
    	    	 var param ={upId:upId,downId:currentid};
    	    	 ajaxData.contructor(false);
    	    	 ajaxData.request(URL.MENU_MOVEUPANDDOWN,param,function(data){});
       			 return true;
       		 });
	       });
		},
		
		//新增默认加载事件
		initAdd:function(){
			
			//增/改弹框内   图标选择
			$("div[name='ico-selpop']").on("click",function(){
				menu.menuIcopop();
			});
			
			//点击任何地方隐藏权限码
			$(document).click(function(){
				$('#treeCode').hide();
			});
			
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			$('#permissionName').click(function(event){
				event.stopPropagation();
			});
			
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			$('#treeCode').click(function(event){
				event.stopPropagation();
			});
			
			//加载权限码树结构
			ajaxData.request(URL.MENU_GETAUTHCODE,[],function(data){
				$.fn.zTree.init($("#treeCode"), setting, data.data);
			});
			
			//权限码输入框点击事件
			$("#permissionName").on("click",function(){
				$("#treeCode").show().addClass("toggle-ul");
			});
			
			//根据菜单id获取菜单详情
			var menuId =utils.getUrlParam('menuId');
			var reqData ={menuId:menuId};
			menu.getMenuItem(URL.MENU_GETITEM,reqData);
			
			//加载所属管理员下拉框
			ajaxData.request(URL.USER_GETSYSADMIN,[],function(data){
				for (var i=0; i<data.data.length; i++) {  
                    var jsonObj =data.data[i];  
                    $("#ownerUserId").append("<option value=\"" + jsonObj.userId + "\" >" + jsonObj.userName + "</option>");  
                }  
			});
			
			//控制菜单地址是否可以输入
			$(":radio[name='menuType']").change(function(){
		        if($(this).attr("value")==2){
		        	$("#url").removeAttr("disabled");
		        	
		        }
		        else{
		        	$("#url").attr("disabled","disabled");
		        	$("#url").next().remove();
		        	$("#url").val("");
		        }
		    });
			
			//数据验证
			$("#addDataMenu").validate(
			{
				rules : {
					menuName : {
						required : true,
						maxlength: 30
					},
					url:{
						required : true,
						maxlength: 200
					},
					permissionName:{
						required : true
					}
				},
				messages : {
					menuName : {
						required : '菜单名称不能为空',
						 maxlength: '菜单名称不超过30个字符'
					},
					url : {
						required : '菜单地址不能为空',
						 maxlength: '菜单地址不超过200个字符'
					},
					permissionName:{
						required : '权限码不能为空'
					}
				},

				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					var parent = $(element).parent("div.tips-text").append(error);
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
			
			$(document).on("change", "#menuName",function(){
				var menuName =$("#menuName").val();
				var parentId =$("#parentId").val();
				
				//发送请求之前判断菜单名称唯一性
				var param={menuName:menuName,parentId:parentId,addOrUpdate:"add",menuId:""};
				ajaxData.contructor(false);
				ajaxData.request(URL.MENU_DATANAME,param,function(data){
					if(data.data==true){//菜单名称唯一性标记
						$("#datad").show();
					}else{
						$("#datad").hide();
					}
				});
			});
		},
		
		//修改默认加载事件
		initUpdate:function(){
			//控制菜单地址是否可以输入
			$(":radio[name='menuType']").change(function(){
		        if($(this).attr("value")==2){
		        	$("#url").removeAttr("disabled");
		        }
		        else{
		        	$("#url").attr("disabled","disabled"); 
		        	$("#url").next().remove();
		        	$("#url").val("");
		        }
		    });
			
			//增/改弹框内   图标选择
			$("div[name='ico-selpop']").on("click",function(){
				menu.menuIcopop();
			});
			
			//点击任何地方隐藏权限码
			$(document).click(function(){
				$('#treeCode').hide();
			});
			
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			$('#permissionName').click(function(event){
				event.stopPropagation();
			});
			
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			$('#treeCode').click(function(event){
				event.stopPropagation();
			});
			
			//加载权限码树结构
			ajaxData.request(URL.MENU_GETAUTHCODE,[],function(data){
				$.fn.zTree.init($("#treeCode"), setting, data.data);
			});
			
			//权限码输入框点击事件
			$("#permissionName").on("click",function(){
				$("#treeCode").show().addClass("toggle-ul");
			});
			
			//加载所属管理员下拉框
			ajaxData.request(URL.USER_GETSYSADMIN,[],function(data){
				for (var i=0; i<data.data.length; i++) {  
                    var jsonObj =data.data[i];  
                    $("#ownerUserId").append("<option value=\"" + jsonObj.userId + "\" >" + jsonObj.userName + "</option>");  
                }  
			});
			
			//根据菜单id获取菜单详情
			var menuId =utils.getUrlParam('menuId');
			var reqData ={menuId:menuId};
			menu.getMenuItemUpdate(URL.MENU_ITEMUPDATE,reqData);
			
			//数据验证
			$("#updateDataMenu").validate(
			{
				rules : {
					menuName : {
						required : true,
						maxlength: 30
					},
					url:{
						required : true,
						maxlength: 200
					},
					permissionName:{
						required : true
					}
				},
				messages : {
					menuName : {
						required : '菜单名称不能为空',
						 maxlength: '菜单名称不超过30个字符'
					},
					url : {
						required : '菜单地址不能为空',
						maxlength: '菜单地址不超过200个字符'
					},
					permissionName:{
						required : '权限码不能为空'
					}
				},

				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					var parent = $(element).parent("div.tips-text").append(error);
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
			
			$(document).on("change", "#menuName",function(){
				var menuName =$("#menuName").val();
				var parentId =$("#parentId").val();
				
				//发送请求之前判断菜单名称唯一性
				var param={menuName:menuName,parentId:parentId,addOrUpdate:"update",menuId:menuId};
				ajaxData.contructor(false);
				ajaxData.request(URL.MENU_DATANAME,param,function(data){
					if(data.data==true){//菜单名称唯一性标记
						$("#datad").show();
					}else{
						$("#datad").hide();
					}
				});
			});
		},
		
		//删除
	    delte:function(menuIdArr){	    	
			   var param={ menuIdArr:menuIdArr};
			   popup.askPop("确认删除当前菜单及其子项吗？",function(){
					ajaxData.contructor(false);
				    ajaxData.request(URL.MENU_DELETE,param,function(data){
				    	if(data.code==0){
							popup.okPop("删除成功",function(){
								
							});
							$.each(param.menuIdArr, function(i, id){
								menu.treeTab.deleteRow(id);
							})
						}
						else{
							popup.errPop("删除失败");
						}
					});
			   });
	     },
		
		//初始化图标
		initIco : function(){
			var tpl = require("../../../common/css/font-awesome.tpl");
			var iconArr = new Array();
			$.each(tpl.split("."),function(i,item){
				if(item.indexOf(":before{") != -1){
					var s = item.substring(0, item.indexOf(":before{")); 
					iconArr.set({'icon':s});
				}
			});
			$("#iconImpl").tmpl(iconArr).appendTo('#icoEdit ul');
			
			//图标弹框内   点击触发
			$("#icoEdit a").on("click",function(e){
				var o=this;
				menu.menuIcofocus(e,o);
			});
		},
		
		//弹窗 新增
		addMenu:function(id){
	      
			popup.open('./udf/menu/html/add.html?menuId='+id, //这里是页面的路径地址
			{
				id:'addMenu',
				title:'新增',
				width: 800,
				height: 600,
				okVal:'保存',
				cancelVal : '关闭',
				ok : function() {
					var obj = this.iframe.contentWindow;
					
					var menuName =obj.$("#menuName").val();
					var parentId =obj.$("#parentId").val();
					var flag =true;
					
					//发送请求之前判断菜单名称唯一性
					flag = obj.$("#datad").is(':hidden');
					
					var v = obj.$("#addDataMenu").valid();// 验证表单
					
					if (v && flag) {
						var reqData= utils.getQueryParamsByFormObject(obj.$("#addDataMenu"));
						var tag = false;
						
						ajaxData.contructor(false);
						ajaxData.request(URL.MENU_ADD, reqData,function(data){
						   if(data.code==config.RSP_SUCCESS){
								popup.okPop("新增成功",function(){
									
								});
								menu.treeTab.addRow(id,data.data);;
								tag = true;
						   }
						   else if(data.code==config.RSP_WARN){
							   popup.errPop(data.msg);
						   }
						   else{
								popup.errPop("新增失败");
						   }
						});
						return tag;
					}
					else {
						// 表单验证不通过
						return false;
					}
				},
				cancel:function(){
				},
				button: [
					        {
					            name: '保存',
					            focus:true,//按钮高亮
					            callback: function () {
					                this.content('你确定了').time(2);
					                return false;
					            },
					            focus: true
					        },
					        {
					            name: '保存并新增',
					            focus:true,//按钮高亮
					            callback: function () {
					            	var obj = this.iframe.contentWindow;
									
									var menuName =obj.$("#menuName").val();
									var parentId =obj.$("#parentId").val();
									var flag =true;
									
									//发送请求之前判断菜单名称唯一性
									flag = obj.$("#datad").is(':hidden');
									
									var v = obj.$("#addDataMenu").valid();// 验证表单
									
									if (v && flag) {
										var reqData= utils.getQueryParamsByFormObject(obj.$("#addDataMenu"));
										
										ajaxData.request(URL.MENU_ADD,reqData,function(data){
										   if(data.code==config.RSP_SUCCESS){
												popup.okPop("新增成功",function(){
													
												});
												menu.treeTab.addRow(id,data.data);;
												// treeTable.updateRow($("#treetableUpdateTmpl").tmpl(data.data));
												
												obj.$("#menuName").val("");
												obj.$("#url").val("");
												
												obj.$("input:radio[name='isEnabled']:checked").parent().parent().removeClass("on-radio");
												obj.$("input:radio[name='isEnabled'][value='1']").prop("checked","checked");
												obj.$("input:radio[name='isEnabled'][value='1']").parent().parent().addClass("on-radio");
												
												obj.$("input:radio[name='target']:checked").parent().parent().removeClass("on-radio");
												obj.$("input:radio[name='target'][value='1']").prop("checked","checked");
												obj.$("input:radio[name='target'][value='1']").parent().parent().addClass("on-radio");
												
												obj.$("input:radio[name='isExpand']:checked").parent().parent().removeClass("on-radio");
												obj.$("input:radio[name='isExpand'][value='2']").prop("checked","checked");
												obj.$("input:radio[name='isExpand'][value='2']").parent().parent().addClass("on-radio");
												
												obj.$("#imageClass").val("fa fa-th");
												obj.$("#className").attr("class","fontspan fa fa-th fa-2x");
												obj.$("#ownerUserId").val("");
												obj.$("#permissionCode").val("");
												obj.$("#permissionName").val("");
												obj.$("#description").val("");
										   }
										   else if(data.code==config.RSP_WARN){
											   popup.errPop(data.msg);
										   }
										   else{
												popup.errPop("新增失败");
										   }
										});
									}
									else {
										// 表单验证不通过
										return false;
									}
					            	return false;
					            }
					        }
					    ]
           });
	   	},
        
		//弹窗 修改 
		updateMenu:function(obj){
			var menuId=$(obj).parents("tr").attr("data-tt-id");
			popup.open('./udf/menu/html/edit.html?menuId='+menuId, //这里是页面的路径地址
			{
				id:'editMenu', 
				title:"修改", 
				width: 800,
				height: 600,
				okVal:'保存',
				cancelVal : '关闭',
				ok : function() {
					var fram = this.iframe.contentWindow;
					
					var menuName =fram.$("#menuName").val();
					var parentId =fram.$("#parentId").val();
					var menuId =fram.$("#menuId").val();
					var flag =true;
					
					//发送请求之前判断菜单名称唯一性
					flag = fram.$("#datad").is(':hidden');
					
					var v = fram.$("#updateDataMenu").valid();// 验证表单
					
					if (v && flag) {
						var reqData= utils.getQueryParamsByFormObject(fram.$("#updateDataMenu"));
						var tag = false;
						
						ajaxData.contructor(false);
						ajaxData.request(URL.MENU_UPDATE,reqData,function(data){
						   if(data.code==config.RSP_SUCCESS){
								popup.okPop("修改成功",function(){
									
								});
								// menu.treeTab.updateRow($("#treetableUpdateTmpl").tmpl(data.data));
								menu.treeTab.modifyRow(menuId,data.data);
								tag = true;
						   }
						   else if(data.code==config.RSP_WARN){
							   popup.errPop(data.msg);
						   }
						   else{
								popup.errPop("修改失败");
						   }
						});
						return tag;
					}
					else {
						// 表单验证不通过
						return false;
					}
				},
				cancel:function(){
					//取消逻辑
				}	
			});	
		},
		
		//详情
		getMenuItem:function(url,reqData){
			ajaxData.request(url,reqData,function(data){
				if(data.data!=null){
					$("#parentMenuName").text(data.data.menuName);
					$("#parentMenuName").attr("title",data.data.menuName);
					$("#parentId").val(data.data.menuId);
				}
				else{
					$("#parentMenuName").text("");
					$("#parentId").val("0");
				}
			});
		},
		//详情
		getMenuItemUpdate:function(url,reqData){
			ajaxData.request(url,reqData,function(data){
				$("#parentMenuName").text(data.data.parentName);
				$("#parentMenuName").attr("title",data.data.parentName);
				$("#parentId").val(data.data.parentId);
				
				$("#menuName").val(data.data.menuName);
				$("#menuId").val(data.data.menuId);
	    	    
	    	    $("input[name='menuType'][value="+data.data.menuType+"]").attr("checked",true);
	    	    $("input[name='menuType'][value="+data.data.menuType+"]").parent().parent().addClass("on-radio");
	    	    if(data.data.menuType==2){
	    	    	$("#url").val(data.data.url);
	    	    }
	    	    else{
	    	    	$("#url").attr("disabled","disabled"); 
	    	    }
	    	    
	    	    $("input[name='isEnabled'][value="+data.data.isEnabled+"]").attr("checked",true);
	    	    $("input[name='isEnabled'][value="+data.data.isEnabled+"]").parent().parent().addClass("on-radio");
	    	    
	    	    $("input[name='target'][value="+data.data.target+"]").attr("checked",true);
	    	    $("input[name='target'][value="+data.data.target+"]").parent().parent().addClass("on-radio");
	    	    
	    	    $("input[name='isExpand'][value="+data.data.isExpand+"]").attr("checked",true);
	    	    $("input[name='isExpand'][value="+data.data.isExpand+"]").parent().parent().addClass("on-radio");
	    	    
	    	    $("#imageClass").val(data.data.imageClass);
	    	    $("#className").attr("class","fontspan fa "+data.data.imageClass+" fa-2x");
	    	    $("#ownerUserId").val(data.data.ownerUserId);
	    	    $("#permissionCode").val(data.data.permissionCode);
	    	    $("#permissionName").val(data.data.permissionName);
				$("#description").val(data.data.description);
			});
		},
		
		//列表数据绑定
		getTreeTableList:function(){
			 menu.treeTab = new treeTable({
			 	id : "treeTable",		//容器编号
				url:URL.MENU_GETLISTBYPARENTID, //请求地址
				param:{parentId:0},	
				owerId:'menuId',
			    parentId:'parentId',
				columns:[
				       {
				       	columnName:"",   //列名
				        className:"width03", //列的类
				        keyName:'checkbox', //列所对应的键
				        checkbox:[  //checkbox的属性对,name为属性名，value是取值的键
				             {name:'data-tt-id',value:'dataDictionaryId'},
				             {name:'dictionaryname',value:'dataDictionaryName'},
				             {name:'issystem',value:'isSystem'}
				          ]
				       },
				       {
				       	columnName:"菜单名称",
				       	className:"width20",
				       	keyName:'menuName',
				       	isopen:true       //决定展开按钮在列的位置
				       },
				       {
				       	columnName:"类型",
				       	className:"width05",
				       	keyName:'menuType',
				       	enum:[               //枚举类型，value对应键值，name对应枚举名字
				       	  {name:"空节点",value:"1"},
				       	  {name:"菜单",value:"2"},
				       	  {name:"按钮",value:"3"}]
				       },
				       {columnName:"菜单地址",className:"text-l width15",keyName:"url" },
				       {columnName:"权限码",className:"text-l width15",keyName:"permissionCode"},
				       {columnName:"状态",className:"width45",keyName:"isEnabledName"},
				       {columnName:"目标窗体位置",keyName:"targetName"},
				       {columnName:"默认展开子菜单",className:"minwidth45",keyName:"isExpandName"},
				       {columnName:"所属管理员",className:"width85",keyName:"ownerUserName"},
				       {
				       	columnName:"操作",
				       	className:"width120",
				       	keyName:'button',
				       	button:[   //按钮对应的name和值
				       	 {name:"editMenu",value:"修改"},
				       	 {name:"up",value:"上移"},
				       	 {name:"down",value:"下移"}
				       	]}
				      ]
			 });
			 menu.treeTab.init();
		},
		
		//弹窗 图标选择 
		menuIcopop:function(){
			popup.open('./udf/menu/html/icoEdit.html', //这里是页面的路径地址
			{
				id:'icoEdit', 
				title:"选择图标", 
				width: 1098,
				height: 550,
				ok : function() {
					//确定逻辑
					var obj = this.iframe.contentWindow;//弹窗窗体
					
					$("#imageClass").val(obj.$("#imageClass").val());
					$("#className").attr("class",obj.$("#className").val());
					
					$("#className").addClass("fontspan");
				},
				cancel:function(){
					//取消逻辑
				}	
			});	
		},
		
		// 图标 点击
		menuIcofocus:function(e,o){
			$("#imageClass").val($(o).children().attr("name"));
			$("#className").val($(o).children().attr("class"));
			
			var obj = e.currentTarget;
			objPar = $(obj).parent();
			
			$(obj).attr("src","javascript:void(0);"); //取消默认跳转
			objPar.siblings().removeClass("active-ico");
			objPar.addClass("active-ico");
		}
	}
    module.exports = menu;
	window.menu = menu;
});
