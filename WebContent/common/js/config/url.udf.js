define(function (require, exports, module) {

	/**
	 * ajax请求类型
	 */
	var RequestMethod = {
		PUT:"PUT",
		POST:"POST",
		DELETE:"DELETE",
		GET:"GET"
	}
	/**
	 * 所有请求
	 */
	var config = {
		//在线注册
		ONLINE_REGISTER_GRANT : {
			url : "/onlineregister/grant",
			method : RequestMethod.POST
		},
		//在线注册信息
		ONLINE_REGISTER_ABOUT : {
			url : "/onlineregister/about",
			method : RequestMethod.GET
		},
		//获取单点登录配置信息
		USER_GETSSOLOGININFO:{
			url : "/udf/user/getSSOLoginInfo",
			method : RequestMethod.GET
		},
		//用户登录接口
		USER_LOGIN : {
			url : "/udf/user/login",
			method : RequestMethod.POST
		},
		//用户登出接口
		USER_LOGINOUT : {
			url : "/udf/user/loginOut",
			method : RequestMethod.POST
		},
		//获取登录的用户信息接口
		USER_LOGIN_USER:{
			url : "/udf/user/getLoginUser",
			method : RequestMethod.GET
		},		
		//获取登录错误次数
		USER_LOGINCOUNT:{
			url : "/udf/user/getLoginCount",
			method : RequestMethod.GET
		},
		//获取登录的用户拥有权限的系统列表接口
		MENU_MENU_MENULIST : {
			url : "/udf/menu/getMenuList",
			method : RequestMethod.GET
		},
		//获取验证码
		COMMON_COMMON_VERIFICATIONCODE:{
			url : "/udf/common/verificationCode",
			method : RequestMethod.GET
		},
		//获取登录的用户拥有权限的功能树结构接口
		MENU_MENU_MENUTREE : {
			url : "/udf/menu/getMenuTree",
			method : RequestMethod.GET
		},
		//判断用户按钮权限接口
		USER_JUDGE_AUTHORITY:{
			url:"/udf/user/judgeAuthority",
			method : RequestMethod.POST
		},
		//设置用户权限
		USER_SET_DATAAUTHORITY:{
			url:"/udf/user/setDataAuthority",
			method : RequestMethod.POST
		},
		//获取用户权限
		USER_GET_DATAAUTHORITY:{
			url:"/udf/user/getDataAuthority",
			method : RequestMethod.POST
		},
		
		/**
		 * 菜单管理
		 */		
		//获取菜单列表
	    MUNE_LIST:{
			url:"/udf/menu/getList",
			method:RequestMethod.GET
		},
		//增加菜单接口
		MENU_ADD : {
			url : "/udf/menu/add",
			method : RequestMethod.POST
		} ,
		//修改菜单接口
		MENU_UPDATE : {
			url : "/udf/menu/update",
			method : RequestMethod.POST
		},
		//删除菜单接口
	    MENU_DELETE:{
	    	url:"/udf/menu/delete",
		    method : RequestMethod.POST
	    },
	    
		//获取单个菜单
		MENU_GETITEM : {
			url : "/udf/menu/getItem",
			method : RequestMethod.GET
		},
		//获取单个菜单-指定菜单Id
		MENU_GETITEMBYAUTH : {
			url : "/udf/menu/getItemByAuth",
			method : RequestMethod.GET
		},
		//修改-获取单个菜单
		MENU_ITEMUPDATE : {
			url : "/udf/menu/getItemUpdate",
			method : RequestMethod.GET
		},
		//获取权限代码树列表
		MENU_GETAUTHCODE : {
			url : "/udf/menu/getAuthCodeTree",
			method : RequestMethod.GET
		},
		//上移菜单
		MENU_MOVEUPANDDOWN:{
			url : "/udf/menu/move",
			method : RequestMethod.POST
		},
		//验证菜单名称唯一性
		MENU_DATANAME:{
			url : "/udf/menu/isNameUnique",
			method : RequestMethod.POST
		},
		//根据menuId获取子节点集合
		MENU_GETLISTBYPARENTID:{
			url:"/udf/menu/getListByParentId",
			method:RequestMethod.GET
		},
		
		
		/**
		 * 用户管理
		 */	
		//用户管理
	    USER:{
	    	url : "/udf/user/getPagedList",
		    method : RequestMethod.POST
	    },
	    //用户密码重置接口
	    USER_RESETPWD:{
	    	url : "/udf/user/resetPwd",
		    method : RequestMethod.POST
	    },
	    //修改密码
	    USER_UPDATEPASSWORD:{
	    	url : "/udf/user/updatePassword",
		    method : RequestMethod.POST
	    },
	    //用户分页列表
	    USER_QUERY:{
	    	url:"/udf/user/getPagedList",
		    method : RequestMethod.POST
	    },
	    //用户禁用
	    USER_FORBID:{
	    	url:"/udf/user/updateForbid",
		    method : RequestMethod.POST
	    },
	    //用户启用
	    USER_START:{
	    	url:"/udf/user/updateStart",
		    method : RequestMethod.POST
	    },
	    //获取系统管理员列表
	    USER_GETSYSADMIN:{
			url:"/udf/user/getSysAdmin",
			method : RequestMethod.POST
		},
		//查看用户详情接口
	    USER_VIEW:{
			url:"/udf/user/getItem",
			method : RequestMethod.GET
		},
		// 根据多个参数获取用户分页数据
		USER_GET_USERPAGEDLISTBYPARAMS:{
	    	url : "/udf/user/getUserPagedListByParams",
		    method : RequestMethod.GET
	    },
	    
	    
	    
	    /**
		 * 角色管理
		 */	
		// 角色管理
		ROLE_GET_PAGEDLIST:{
	    	url : "/udf/role/getPagedList",
		    method : RequestMethod.POST
	    },
		// 新增角色
	    ROLE_ADD:{
	    	url : "/udf/role/add",
		    method : RequestMethod.POST
	    },
		// 更新角色
	    ROLE_UPDATE:{
	    	url : "/udf/role/update",
		    method : RequestMethod.POST
	    },	    
	    // 删除角色
	    ROLE_DELETE:{
	    	url : "/udf/role/delete",
		    method : RequestMethod.POST
	    },
	    // 获取角色
	    ROLE_GET_ITEM:{
	    	url : "/udf/role/getItem",
		    method : RequestMethod.POST
	    },	    
	    // 根据角色Id获取用户列表
	    ROLE_GET_USERLISTBYROLEID:{
	    	url : "/udf/role/getUserListByRoleId",
		    method : RequestMethod.GET
	    },	    	    
	    // 根据角色Id获取用户分页列表
	    ROLE_GET_PAGEDUSERLISTBYROLEID:{
	    	url : "/udf/role/getPagedUserListByRoleId",
		    method : RequestMethod.GET
	    },	    
	    
	    // 删除角色包含的用户
	    ROLE_DELETE_USERINROLE:{
	    	url : "/udf/role/deleteUserInRole",
		    method : RequestMethod.POST
	    },
	    // 添加用户到角色
	    ROLE_ADDUSERSTOROLE:{
	    	url : "/udf/role/addUsersToRole",
		    method : RequestMethod.POST
	    },
	    // 保存权限 
	    ROLE_SAVE_PERMISSION:{
	    	url : "/udf/role/savePermission",
		    method : RequestMethod.POST
	    },
	    // 获取角色拥有的权限 
	    ROLE_GET_PERMISSIONBYROLEID:{
	    	url : "/udf/role/getPermissionByRoleId",
		    method : RequestMethod.GET
	    },
	    // 角色验证 
	    ROLE_VALIDATIONROLE:{
	    	url : "/udf/role/validationRole",
		    method : RequestMethod.GET
	    },
	    
	    //数据字典新增接口
	    DICTIONARY_ADD:{
	    	url:"/udf/dictionary/add",
		    method : RequestMethod.POST
	    },
	    //数据字典更新接口
	    DICTIONARY_UPDATE:{
	    	url:"/udf/dictionary/update",
		    method : RequestMethod.POST
	    },	    
	    //数据字典删除接口
	    DICTIONARY_DELETE:{
	    	url:"/udf/dictionary/delete",
		    method : RequestMethod.POST
	    },
	    //数据字典上移接口
	    DICTIONARY_UP:{
	    	url:"/udf/dictionary/up",
		    method : RequestMethod.POST
	    },
	    //数据字典下移接口
	    DICTIONARY_DOWN:{
	    	url:"/udf/dictionary/down",
		    method : RequestMethod.POST
	    },
	    //数据字典详情接口
	    DICTIONARY_DETAIL:{
	    	url:"/udf/dictionary/getDictionryById",
		    method : RequestMethod.POST
	    },
	    //验证数据字典名称和code唯一性
	    DICTIONARY_DATANAME:{
			url : "/udf/dictionary/checkNameOrCode",
			method : RequestMethod.POST
		},
		//根据dictionaryId获取子节点集合
		DICTIONARY_GETLISTBYPARENTID:{
			url:"/udf/dictionary/getListByParentId",
			method:RequestMethod.POST
		},
		//根据dictionaryCode获取子节点集合（用于下拉框数据源）
		DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE:{
			url:"/udf/dictionary/getSelectListByParentCode",
			method:RequestMethod.GET
		},	
		//根据字典项Code获取数据字典字典项集合
		DICTIONARY_GETLISTBYPARENTCODE:{
			url:"/udf/dictionary/getListByParentCode",
			method:RequestMethod.POST
		},
		//根据dictionaryId获取树形结构的子节点集合
		DICTIONARY_GETTREELISTBYPARENTCODE:{
			url:"/udf/dictionary/getTreeListByParentCode",
			method:RequestMethod.POST
		},
		//根据dictionaryId获取子节点集合
		DICTIONARY_GETLISTBYPARENTID:{
			url:"/udf/dictionary/getListByParentId",
			method:RequestMethod.GET
		},
		//根据dictionaryId获取子节点集合
		USER_ONLINE_COUNT:{
			url:"/udf/user/onlineCount",
			method:RequestMethod.GET
		}
	}
    module.exports = config;
});
