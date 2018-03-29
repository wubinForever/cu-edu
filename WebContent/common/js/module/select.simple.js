/**
 * 原生select下拉框处理类
 * 
 */
define(function(require, exports, module) {
	var URL_UDF = require("../config/url.udf");
	var URL_DATA = require("../config/url.data");
	var URL_COURSEPLAN = require("../config/url.courseplan");
	var URL_EXAMPLAN = require("../config/url.examplan");
	var ajaxData = require("../utils/ajaxData");
	var config = require("../utils/config");
	var dataDictionary=require("../config/data.dictionary");
	var cookieUtils=require("../utils/cookieUtils");
	var mapUtil=require("../utils/mapUtil");
	var utils=require("../utils/utils");
	var CONSTANT=require("../config/data.constant");
	var isTeachAffairs=require("../enumeration/common/IsTeachAffairs");
	var isCurrentSemester=require("../enumeration/common/IsCurrentSemester");
	var accountType=require("../enumeration/common/AccountType");
	
	//IE8下不支持Map对象
	var selectMap = top.window.selectMap;
	 if(!selectMap){
		 selectMap = new mapUtil();
		 top.window.selectMap = selectMap;
	 }
	
	/**
	 * 原生的select对象基本操作
	 */
	var nativeSelect = function(obj) {
		this.obj = obj;
	}
	nativeSelect.prototype = {
		/**
		 * 获取选中的值
		 * 
		 * @returns
		 */
		getValue : function() {
			return this.obj.val();
		},
		/**
		 * 获取选中的option中的文本
		 * 
		 * @returns
		 */
		getText : function() {
			return this.obj.find("option:selected").text();
		},
		/**
		 * 获取select对象
		 * 
		 * @returns
		 */
		getObj : function() {
			return this.obj;
		} 
	}
	/**
	 * 学年学期
	 */
	var semesterSelect = function(obj) {
		nativeSelect.call(this, obj);
	}
	semesterSelect.prototype = new nativeSelect();
 
	semesterSelect.prototype.getAcademicYear = function(){
		  var value = this.getValue();
		  if(value){
			  return value.split("_")[0];
		  }
	}
	semesterSelect.prototype.getSemesterCode = function(){
		var value = this.getValue();
		  if(value){
			  return value.split("_")[1];
		  }
	}
	
	/**
	 * 通用下拉框操作
	 */
	var simpleSelect = {			
			
			/**
			 * 加载下拉框
			 * id: 控件ID，必传
			 * url：数据源地址，必传
			 * reqParams：查询数据源的参数，可选
			 * option 
			 * {
			 * 		defaultValue：选中值，可选参数，默认没有选中值
			 * 		firstText：第一项文本，可选参数（“全部”、“请选择”），不传默认没有第一项
			 * 		firstValue：第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），不传默认没有第一项
			 * 		async：标识该下拉框请求是否异步请求，默认异步
			 * }
			 * jing.zhang
			 */
			loadSelect : function(id, url,reqParams,option) {	
				var opt = {
						defaultValue:"", // 选中值，可选参数，默认没有选中值
						firstText:"", // 第一项文本，可选参数（“全部”、“请选择”），默认没有
						firstValue:"",	// 第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），默认没有
						async:true, // true为异步，false为同步 默认为true
						length:15
					}
				this.option =  $.extend({}, opt, option);
				var defaultValue=this.option.defaultValue;
				var firstText=this.option.firstText;
				var firstValue=this.option.firstValue;
				var length=this.option.length;
				
				var reqPar={
					isAuthority:true //是否进行数据权限过滤，true：进行过滤，false：不进行过滤，默认进行权限过滤
				}
				this.reqParams=$.extend({}, reqPar, reqParams);
				
				var obj = $("#" + id);
				//加载后台数据
				var rvData = [];
				ajaxData.contructor(this.option.async);
				ajaxData.request(url,this.reqParams,function(data) {
							if (data.code == config.RSP_SUCCESS) {
								rvData = data.data;
								//将数据通过installOption方法组装到select中
								simpleSelect.installOption(obj, rvData,defaultValue,firstText,firstValue,{length:length});
								//callback(new nativeSelect(obj).getValue())//返回id就可以进行联动
								// 返回通用处理select对象
								return new nativeSelect(obj);
							}
						});	
				
			},
			
			/**
			 * 加载数据字典下拉框
			 * id: 控件ID，必传
			 * parentCode：数据字典父级Code，必传
			 * option 
			 * {
			 * 		defaultValue：选中值，可选参数，默认没有选中值
			 * 		firstText：第一项文本，可选参数（“全部”、“请选择”），不传默认没有第一项
			 * 		firstValue：第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），不传默认没有第一项
			 * 		async：标识该下拉框请求是否异步请求，默认异步
			 * }
			 * jing.zhang
			 */
			loadDictionarySelect : function(id,parentCode,option) {
				var opt = {
						defaultValue:"", // 选中值，可选参数，默认没有选中值
						firstText:"", // 第一项文本，可选参数（“全部”、“请选择”），默认没有
						firstValue:"",	// 第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），默认没有
						async:true, // true为异步，false为同步 默认为true
						length:15
					}
				this.option =  $.extend({}, opt, option);
				var defaultValue=this.option.defaultValue;
				var firstText=this.option.firstText;
				var firstValue=this.option.firstValue;	
				var length=this.option.length;
				
				var obj = $("#" + id);								
				var rvData = [];
			
				if(selectMap.get(parentCode)){
					rvData=selectMap.get(parentCode);
					
					//将数据通过installOption方法组装到select中
					simpleSelect.installOption(obj, rvData,defaultValue,firstText,firstValue,{length:length});
					// 返回通用处理select对象
					return new nativeSelect(obj);
				}
				else{
					//加载后台数据
					selectMap.put(parentCode, {});
					this.option.async = false;
					ajaxData.contructor(this.option.async);
					ajaxData.request(
							URL_UDF.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, // 请求数据字典的路径，调用的统一的方法，该路径不需变							
							{ parentCode : parentCode}, // 参数传入数据字典父code，该code统一定义在data.dictionary.js文件中 
							function(data) {
								
								if (data.code == config.RSP_SUCCESS) {
									rvData = data.data;
									selectMap.put(parentCode, rvData);
									//将数据通过installOption方法组装到select中
									simpleSelect.installOption(obj, rvData,defaultValue,firstText,firstValue,{length:length});
									// 返回通用处理select对象
									return new nativeSelect(obj);
								}
							});		
				}
						
			},
			
			/**
			 * 加载枚举下拉框
			 * id: 控件ID，必传
			 * enumObj：js枚举对象，必传
			 * option 
			 * {
			 * 		defaultValue：选中值，可选参数，默认没有选中值
			 * 		firstText：第一项文本，可选参数（“全部”、“请选择”），不传默认没有第一项
			 * 		firstValue：第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），不传默认没有第一项
			 * }
			 * jing.zhang
			 */
			loadEnumSelect : function(id,enumObj,option) {			
				var opt = {
						defaultValue:"", // 选中值，可选参数，默认没有选中值
						firstText:"", // 第一项文本，可选参数（“全部”、“请选择”），默认没有
						firstValue:"",	// 第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），默认没有
						length:15
					}
				this.option =  $.extend({}, opt, option);
				var defaultValue=this.option.defaultValue;
				var firstText=this.option.firstText;
				var firstValue=this.option.firstValue;
				var length=this.option.length;
				
				var obj = $("#" + id);								
				var rvData = utils.getEnumValues(enumObj);			

				//将数据通过installOption方法组装到select中
				simpleSelect.installOption(obj, rvData,defaultValue,firstText,firstValue,{length:length});
				// 返回通用处理select对象
				return new nativeSelect(obj);			
						
			},	
			
			
			
			/**
			 * 加载修改下拉框
			 * id: 控件ID，必传
			 * url：数据源地址，必传
			 * reqParams：查询数据源的参数，可选
			 * option 
			 * {
			 * 		defaultValue：选中值，可选参数，默认没有选中值
			 * 		firstText：第一项文本，可选参数（“全部”、“请选择”），不传默认没有第一项
			 * 		firstValue：第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），不传默认没有第一项
			 * 		async：标识该下拉框请求是否异步请求，默认异步
			 * }
			 * tjj
			 */
			loadGenerelSelect : function(id,option) {					
				var opt = {
						defaultValue:"", // 选中值，可选参数，默认没有选中值
						firstText:"", // 第一项文本，可选参数（“全部”、“请选择”），默认没有
						firstValue:"",	// 第一项值，与第一项文本firstText对应 ，可选参数（“”、“-1”），默认没有
						async:true // true为异步，false为同步 默认为true
					}
				this.option =  $.extend({}, opt, option);
				var defaultValue=this.option.defaultValue;
				var firstText=this.option.firstText;
				var firstValue=this.option.firstValue;				
				var obj = $("#" + id);
				var rvData = [];
				simpleSelect.installOption(obj, rvData,defaultValue,firstText,firstValue);
				return new nativeSelect(obj);
				
			},
			
			
	    /** ******************* 培养方案******************* */
		/**
		 * 加载数据字典（废弃）
		 * jing.zhang
		 */
		loadDataDictionary : function(id,parentCode,defaultValue,firstText,firstValue) {
			var obj = $("#" + id);
			//加载后台数据
			var rvData = [];
			ajaxData.contructor(false);
			ajaxData.request(
					URL_UDF.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, // 请求数据字典的路径，调用的统一的方法，该路径不需变
					{ parentCode : parentCode}, // 参数传入数据字典父ID，该ID统一定义在data.dictionary.js文件中 
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							rvData = data.data;
						}
					});	
			//将数据通过installOption方法组装到select中
			this.installOption(obj, rvData,defaultValue,firstText,firstValue);
			// 返回通用处理select对象
			return new nativeSelect(obj);
		},	
			
		/**
		 * 公用下拉框绑定（废弃）
		 * tjj
		 */
		loadCommon : function(id, url,reqData,defaultValue,firstText,firstValue) {
			var obj = $("#" + id);
			//加载后台数据
			var rvData = [];
			ajaxData.contructor(false);
			ajaxData.request(url,reqData,function(data) {
						if (data.code == config.RSP_SUCCESS) {
							rvData = data.data;
						}
					});	
			//将数据通过installOption方法组装到select中
			this.installOption(obj, rvData,defaultValue,firstText,firstValue);
			//callback(new nativeSelect(obj).getValue())//返回id就可以进行联动
			// 返回通用处理select对象
			return new nativeSelect(obj);
		},
		
		/**
		 * 省市区三级联动
		 */
		loadProvinces : function(province, city, area){
			//省
			simpleSelect.loadCommon(province, URL_DATA.CANTON_GET, {parentCode : "000000"},"","--请选择--","",null);
			//省市联动，区置空
			$("#"+province).change(function(){
				var reqData={};
				reqData.parentCode =$(this).val();
			    simpleSelect.loadCommon(city, URL_DATA.CANTON_GET, reqData,"","--请选择--","",null);
			    simpleSelect.loadCommon(area, URL_DATA.CANTON_GET, {},"","--请选择--","",null);
			})
			//市区联动
			$("#"+city).change(function(){
				var reqData={};
				reqData.parentCode =$(this).val();
				simpleSelect.loadCommon(area, URL_DATA.CANTON_GET, reqData,"","--请选择--","",null);
			})
		},
		
		/**
		 * 省市区3级联动 赋初始值。3级之间没有联动
		 */
		loadProvincesInitialValue : function(provinceStr, cityStr, areaStr){
			var provinceArr =  provinceStr.split("|");
			var cityArr =  cityStr.split("|");
			var areaArr =  areaStr.split("|");
			var province = provinceArr[0], provinceValue = "";
			var city = cityArr[0], cityValue = "";
			var area = areaArr[0], areaValue = "";
			
			try{	provinceValue = provinceArr[1];}catch(e){}
			try{	cityValue = cityArr[1];}catch(e){}
			try{	areaValue = areaArr[1];}catch(e){}
			
			//省
			simpleSelect.loadCommon(province, URL_DATA.CANTON_GET, {parentCode : "000000"}, provinceValue, "--请选择--", "", null);
			//市
			simpleSelect.loadCommon(city, URL_DATA.CANTON_GET, {parentCode : provinceValue}, cityValue, "--请选择--", "", null);
			//区
			simpleSelect.loadCommon(area, URL_DATA.CANTON_GET, {parentCode : cityValue}, areaValue, "--请选择--", "", null);
		},
		/**
		 * 校区 可区分权限
		 * 
		 * @param id id
		 * @param isAuthority 是否区分权限（true：区分，false：不区分）
		 * @param defaultValue 默认值
		 * @param firstText 第一个显示的内容
		 * @param firstValue 第一个值
		 */
		loadCampus : function(id, isAuthority, defaultValue, firstText, firstValue, async) {
			var reqParams = {};
			reqParams.isAuthority = isAuthority;
			return simpleSelect.loadSelect(id, URL_DATA.CAMPUS_GETALL, reqParams, {
				defaultValue : defaultValue,
				firstText : firstText,
				firstValue : firstValue,
				async:async
			});
		},

		/**
		 * 开课单位 可区分权限
		 * 
		 * @param id id
		 * @param reqParams 查询参数（例如 区分权限、与校区级联）
		 * @param defaultValue 默认值
		 * @param firstText 第一个显示的内容
		 * @param firstValue 第一个值
		 */
		loadAuthStartClass : function(id, reqParams, defaultValue, firstText, firstValue) {
			var opt = {
				isAuthority : false // 是否区分权限（true：区分，false：不区分）
			}
			var params = $.extend({}, opt, reqParams);
			return simpleSelect.loadSelect(id, URL_DATA.DEPARTMENT_STARTCLASS_FOR_SELECT, params, {
				defaultValue : defaultValue,
				firstText : firstText,
				firstValue : firstValue,
			});
		},
		/**
		 * 院系与开课单位 可区分权限
		 * @param id id
		 * @param reqParams 查询参数（例如 区分权限、与校区级联）
		 * @param defaultValue 默认值
		 * @param firstText 第一个显示的内容
		 * @param firstValue 第一个值
		 */
		loadDepartmentStartClass : function(id, reqParams, defaultValue, firstText, firstValue) {
			var opt = {
				isAuthority : false // 是否区分权限（true：区分，false：不区分）
			}
			var params = $.extend({}, opt, reqParams);
			
			var obj = $("#" + id);
			//加载后台数据
			var rvData = [];
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.DEPARTMENT_STARTCLASS_FOR_SELECT, params, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var StartClass = data.data;
					rvData = data.data;
					
					ajaxData.contructor(false);
					ajaxData.request(URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS, params, function(dataDepartment) {
						if (dataDepartment.code == config.RSP_SUCCESS) {
							$.each(dataDepartment.data, function(i, item) {
								var isNotExist = true;
								$.each(StartClass, function(j, jItem) {
									if (item.value === jItem.value) {
										isNotExist = false;
										return false;
									}
								})
								if(isNotExist){
									rvData.push(item);
								}
							})
						}
					});
				}
			});	
			
			
			// 将数据通过installOption方法组装到select中
			simpleSelect.installOption(obj, rvData,defaultValue,firstText,firstValue,{length:15});
			// 返回通用处理select对象
			return new nativeSelect(obj);
		},
		/**
		 * 开课单位（数据源来自单位表）
		 */
		loadStartClass : function(id, defaultValue,firstText,firstValue) {
			var obj = $("#" + id);
			// 加载后台数据
			var rvData = [];
			ajaxData.contructor(false);
			ajaxData.request(
					URL_DATA.DEPARTMENT_STARTCLASS_FOR_SELECT,
					null, 
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							rvData = data.data;
						}
					});	
			// 将数据通过installOption方法组装到select中
			this.installOption(obj, rvData,defaultValue,firstText,firstValue);
			// 返回通用处理select对象
			return new nativeSelect(obj);
		},
		
		/**
		 * 培养方案-启用禁用（数据源来自枚举）
		 * jing.zhang
		 */
		loadEnableStatus : function(id, defaultValue,firstText,firstValue) {
			var obj = $("#" + id);
			//加载后台数据
			var rvData = [];
			ajaxData.contructor(false);
			ajaxData.request(
					URL_UDF.Enumeration_EnableStatus,
					null, 
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							rvData = data.data;
						}
					});	
			//将数据通过installOption方法组装到select中
			this.installOption(obj, rvData,defaultValue,firstText,firstValue);
			// 返回通用处理select对象
			return new nativeSelect(obj);
		},
		
		/**
		 * 获取当前学年学期
		 * 
		 * @param id id
		 * @param url 请求url
		 * @param defaultValue 默认值
		 * @param firstText 第一个显示的内容
		 * @param firstValue 第一个值
		 */
		loadCommonSmester : function(id,url,defaultValue,firstText,firstValue) {
			var obj = $("#" + id);
			//加载后台数据
			var rvData = [];
			//var defaultValue="";
			if(!url){
				url = URL_DATA.COMMON_GETSEMESTERLIST;
			}
			ajaxData.contructor(false);
			ajaxData.request(
					url,
					null, 
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							rvData = data.data;
						}
					});	
			if(defaultValue ==""){
				$.each(rvData, function(i, item) {
					if(item.isCurrentSemester==1){
						defaultValue=item.value;
					}
				});
			}
			  
			//将数据通过installOption方法组装到select中
			this.installOption(obj, rvData,defaultValue,firstText,firstValue,{length:16});
			// 返回通用处理select对象
			return new semesterSelect(obj);
		},
		
		/**
		 * 获取当前排课学年学期
		 * 
		 * @param id id
		 * @param isAuthority 是否进行权限判断
		 * @param defaultValue 默认值
		 * @param firstText 第一个显示的内容
		 * @param firstValue 第一个值
		 */
		loadCourseSmester : function(id, isAuthority, defaultValue, firstText, firstValue) {
			var obj = $("#" + id);
			// 加载后台数据
			var rvData = [];
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.COMMON_GETSEMESTERLIST, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					rvData = data.data;
				}
			});
			if (!defaultValue) {
				var reqData = {
					CurrentSemester : isCurrentSemester.Yes.value
				}
				ajaxData.contructor(false);
				ajaxData.request(URL_COURSEPLAN.PARAMETER_TIME_GETITEMBYCURRENT, reqData, function(data) {
					if (data.code == config.RSP_SUCCESS && data.data) { // 当前排课学年学期存在，设为默认值，不存在则默认值为空
						defaultValue = data.data.academicYear + "_" + data.data.semesterCode;
					} else {
						defaultValue = -1;
					}
				});
			}

			var user = top.window.USER;
			var selectData = [];
			// 非（超级管理员、系统管理员和教务处）人员，只显示设置好的当前排课学年学期，若未设置则显示为空
			if (isAuthority && user.accountType !== accountType.SuperAdmin.value
					&& user.accountType !== accountType.SystemAdmin.value && !user.isEducationAdministration) { 
				if (defaultValue !== -1) {
					$.each(rvData, function(i, obj) {
						if (obj.value === defaultValue) {
							selectData.push(obj);
						}
					});
				}
			} else {
				selectData = rvData;
			}

			// 将数据通过installOption方法组装到select中
			this.installOption(obj, selectData, defaultValue, firstText, firstValue,{length:16});

			// 返回通用处理select对象
			return new semesterSelect(obj);
		},
		
		/**
		 * 获取学籍系统报到注册学年学期
		 * 
		 * @param id id
		 * @param url url地址
		 * @param defaultValue 默认值
		 * @param firstText 第一个显示的内容
		 * @param firstValue 第一个值
		 * @parma hiddenObj 控件 
		 */
		loadCommonSmesterTwo:function(id,url,defaultValue,firstText,firstValue,hiddenObj){
			var obj = $("#" + id);
			//加载后台数据
			var rvData = [];
			//var defaultValue="";
			ajaxData.contructor(false);
			ajaxData.request(
					url,
					null, 
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							rvData = data.data;
						}
					});	
			if(defaultValue ==""){
				$.each(rvData, function(i, item) {
					if(item.isCurrentSemester==1){
						defaultValue=item.value;
						hiddenObj && $(hiddenObj).val(defaultValue);
					}
				});
			}
			  
			//将数据通过installOption方法组装到select中
			this.installOption(obj, rvData,defaultValue,firstText,firstValue,{length:16});
			// 返回通用处理select对象
			return new semesterSelect(obj);
		},
		
	    /** ******************* 考务管理******************* */
		/**
		 * 考务管理--获取考试批次
		 */
		loadBatch : function(id, semesterId) {
			var obj = $("#" + id);

			//加载后台数据
			var rvData = [];
			ajaxData.contructor(false);
			var reqData = {
				"schoolCalendarId" : semesterId
			};
			ajaxData.request(URL_EXAMPLAN.BATCH_GETLIST_BY_SCHOOLCALENDARID,
					reqData, function(data) {
						if (data.code == config.RSP_SUCCESS) {
							rvData = data.data;
						}
					});	
			//将数据通过installOption方法组装到select中
			this.installOption(obj, rvData);
			// 返回通用处理select对象
			return new nativeSelect(obj);
		},
		/**
		 * 通过校区编号获取建筑（楼房）
		 */
		loadBuilding: function(id, campusId, option, callback){
			var opt = {
					defaultValue:"", 
					firstText:CONSTANT.PLEASE_SELECT, 
					firstValue:"-1"	 
				}
			var obj = $("#" + id);
			option =  $.extend({}, opt, option);
			if(utils.isNotEmpty(campusId)){
				ajaxData.request(URL_DATA.BUILDING_GET_LIST_BY_CAMPUS_ID, {campusId:campusId}, function(data) {
						if (data.code == config.RSP_SUCCESS) {
							var arr = [];
							$.each(data.data, function(i, item){
								arr.push({name:item.buildingName , value:item.buildingId});
							});
							simpleSelect.installOption(obj, arr,option.defaultValue, option.firstText, option.firstValue);
							if(callback){
								callback(data.data, obj);
							}
						}
					});	
			}else{
				this.installOption(obj, [],option.defaultValue, option.firstText, option.firstValue);
			}
			return new nativeSelect(obj);
		},
		/**
		 * 获取所有建筑（楼房）
		 */
		loadAllBuilding: function(id, campusId, option, callback){
			var opt = {
					defaultValue:"", 
					firstText:CONSTANT.PLEASE_SELECT, 
					firstValue:""	 
				}
			option = $.extend({}, opt, option);
			var obj = $("#" + id);
			ajaxData.request(URL_DATA.BUILDING_GET_LIST_BY_CAMPUS_ID, {
				campusId : campusId
			}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var arr = [];
					$.each(data.data, function(i, item) {
						arr.push({
							name : item.buildingName,
							value : item.buildingId
						});
					});
					simpleSelect.installOption(obj, arr, option.defaultValue, option.firstText, option.firstValue);
					if (callback) {
						callback(data.data, obj);
					}
				}
			});
			return new nativeSelect(obj);
		},
		/**
		 * 获取学年学期
		 */
		loadSemester : function(id) {
			var obj = $("#" + id);
			// TODO:加载后台数据
			var data = [ {
				value : "2017-1",
				name : "2017年第一学期"
			}, {
				value : "2017-2",
				name : "2017年第二学期"
			}, {
				value : "2018-1",
				name : "2018年第一学期"
			} ];
			// TODO:将数据通过installOption方法组装到select中
			this.installOption(obj, data);
			// 返回通用处理select对象
			return new nativeSelect(obj);
		},
		
		/**
		 * 组装option到select中
		 * defaultValue 选中值
		 * firstText 第一项Text，传“全部”、“请选择”或者不传
		 * firstValue 第一项Value，传firstText对应的值，比如：“”、“-1”、“0”或者不传
		 */
		installOption : function(obj, data, defaultValue,firstText,firstValue,option) {
			var opt = {
					length:19 // 可现实字符，可选参数，默认显示18个字符，超出显示...
				}
			this.option =  $.extend({}, opt, option);
			var len=this.option.length;
			
			obj.empty();
			var option;
			if(firstText){
				option = $("<option></option>");
				option.attr("title", firstText).attr("value", firstValue).text(firstText);
				obj.append(option);
			}else if(defaultValue===-1){ // 默认值为空，增加隐藏的option
				obj.append("<option style='display:none'></option>")
			}
			$.each(data, function(i, item) {
				option = $("<option></option>");
				option.attr("title", item.name);
				if(item.name.length > len){
					item.name = item.name.substring(0,len) + '...'; 
				}
				option.attr("value", item.value).text(item.name);
				if (defaultValue == item.value) {
					option.prop("selected", true);
				}
				obj.append(option);
			});
		}
	}
	module.exports = simpleSelect;
});
