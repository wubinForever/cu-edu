/**
 * 预计毕业学生列表
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var mapUtil = require("basePath/utils/mapUtil");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");

	//url
	var URL = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_GRADUATION = require("basePath/config/url.graduation");
	var CONSTANT = require("basePath/config/data.constant");
	var urlData = require("basePath/config/url.data");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URLDATA = require("basePath/config/url.data");
	
	var authority = require("basePath/utils/authority");
	var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选

	// 下拉框
	var select = require("basePath/module/select");//模糊搜索
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框
	var shuffling = require("basePath/utils/shuffling");
	var pagination = require("basePath/utils/pagination");
		
	var addGraduateAdvance = {
		// 初始化
		init : function() {
			this.loadAcademicYearAndRelation();
			 
			//$("#query").click(function(){
			//	addGraduateAdvance.shuff.loadData(addGraduateAdvance.getParam());
			//});

		},
		/*
		 * 加载学年、院系、专业、班级		 
		 */
		loadAcademicYearAndRelation : function(){
			var graduateYear = popup.getData('graduateYear');
			var param = {graduateYear:graduateYear};
			// 年级（从数据库获取数据）
			//simpleSelect.loadSelect("grade", URL_GRADUATION.GRAD_STUDENT_GETADVANCEDGRADELIST,
			//	param, {
			//		firstText : CONSTANT.SELECT_ALL,
			//		firstValue : ""
			//	});
			// 院系（从数据库获取数据）
			//simpleSelect
			//		.loadSelect(
			//				"departmentId",
			//				URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,
			//				{
			//					departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : false
			//				}, {
			//					firstText : CONSTANT.SELECT_ALL,
			//					firstValue : ""
			//				});
			
			//专业
			//simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			
			// 年级联动专业
			//$("#grade").change(
			//		function() {
			//			var reqData = {};
			//			reqData.grade = $(this).val();
			//			reqData.departmentId = $("#departmentId").val();
			//			if (utils.isNotEmpty($(this).val())
			//					&& $(this).val() == '-1'
			//					&& utils.isEmpty($("#departmentId").val())) {
			//				$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
			//				return false;
			//			}
			//			simpleSelect.loadSelect("majorId",
			//					URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
			//						firstText : CONSTANT.SELECT_ALL,
			//						firstValue : "",
			//						async: false
			//				});
			//			addGraduateAdvance.majorChange("")
			//		});
			// 院系联动专业
			//$("#departmentId").change(
			//	function() {
			//		var reqData = {};
			//		reqData.departmentId = $(this).val();
			//		reqData.grade = $("#grade").val();
			//		if (utils.isEmpty($(this).val())
			//				&& utils.isNotEmpty($("#grade").val())
			//				&& $("#grade").val() == '-1') {
			//			$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
			//			return false;
			//		}
			//		simpleSelect.loadSelect("majorId",
			//			URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
			//				firstText : CONSTANT.SELECT_ALL,
			//				firstValue : "",
			//				async: false
			//			});
			//		addGraduateAdvance.majorChange("")
			//});
			
			//专业联动班级
			//$("#majorId").change(function(){
			//	addGraduateAdvance.majorChange($(this).val())
			//});
			
			//初始化左右移表格
			addGraduateAdvance.initShuffing();
			
			// 查询
			$("#query").on("click", function() {
				addGraduateAdvance.pagination.setParam(addGraduateAdvance.getParam());
			});
			// 分页
			addGraduateAdvance.pagination = new pagination({
				url : URL_GRADUATION.GRAD_STUDENT_GETGRADUATEADVANCESTUDENTLIST
			}, function(data,total) {
				if (data.length>0) {
					for (var i=0;i<data.length;i++){
						data[i].index = i+1;
						if(data[i].graduateType && data[i].graduateType > 0){
							for(var j = 0; j < addGraduateAdvance.GRADUATE_TYPE.length; j++){
								if(addGraduateAdvance.GRADUATE_TYPE[j].value == data[i].graduateType){
									data[i].graduateTypeName = addGraduateAdvance.GRADUATE_TYPE[j].name;
									break;
								}
							}
						}
					}
					addGraduateAdvance.shuff.setSelectData(data);
					addGraduateAdvance.setLeftHeader(total,addGraduateAdvance.shuff);
					$("#pagination").show();
				} else {
					addGraduateAdvance.shuff.setSelectData(data);
					$("#pagination").hide();
				}
			});
		},
		
		/**
		 * 专业Change触发动作
		 * @returns {Boolean}
		 */
		majorChange : function(value){
			//if(!value){
	    	//   $("#classId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
	    	//   return;
			//}
			//simpleSelect.loadSelect("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,{majorId:value,grade : $("#grade").val()},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
		},
		/**
		 * 初始化左右切换
		 */
		initShuffing : function(){
			var param = addGraduateAdvance.getParam();
			var shuff = new shuffling({
				id:"shufflingId",
				left:[{name:"年级", field:"classGrade",
					  widthStyle:"width55" },
				      {name:"院系", field:"departmentName",rigthLeftStyle:"text-l"},
				      {name:"专业", field:"majorName",rigthLeftStyle:"text-l"},
				      {name:"班级", field:"className",rigthLeftStyle:"text-l"},
				      {name:"学生", field:"studentName",rigthLeftStyle:"text-l"},
				      { field:"userId",unique:true,show:false}],
				//url:URL_GRADUATION.GRAD_STUDENT_GETGRADUATEADVANCESTUDENTLIST,
				selectedCanRemove:true,
				param:param,
				json:false
			}).init();
			
			addGraduateAdvance.shuff = shuff;
			
			addGraduateAdvance.shuff.setLeftHeader = function(){};
			addGraduateAdvance.shuff.moveToRight = function(){
				//获取左侧选中的值
				var me = this;
				this.pullLeftTbody.find("input:not([disabled]):checkbox:checked").each(function(i, item){
					var key = $(item).val();
					var value = me.selectMap.get(key);
					if(!me.selectedMap.get(key)){
						me.appendTo(value);
						me.selectedMap.put(key, value);
					}
				});
				this.initLeftData();
				this.initRightSequence();
				this.setLeftHeader();
				this.setRightHeader();
				this.checkNoData();
			},
			addGraduateAdvance.shuff.setLeftData = function(){
				var me = this;
				var selectMap = new mapUtil();
				if(me.option.selectData){
					$.each(me.option.selectData, function(i, bean){
					 
						var key;
						$.each(me.option.left, function(j, item){
							if(item.unique){
								me.unique = item.field;
								key = bean[item.field];
								if(item.show == false){
									return true;
								}
							}
						});
						if(key){
							selectMap.put(key, bean);
						}
					});
					
				}
				me.selectMap = selectMap;
				me.initLeftData();
				 
			},
			addGraduateAdvance.shuff.initLeftData = function(){
				var me = this;
				me.pullLeftTbody.empty();
				me.pullLeftThead.find("input").prop("checked", false).parent().removeClass("on-check");
				$.each(me.selectMap.values(), function(i, bean){
					var tr = $("<tr class='tr-checkbox'></tr>");
					var firstTh = $("<td></td>");
					firstTh.append(me.createCheckBox());
					firstTh.addClass(me.option.checkBoxClass);
					tr.append(firstTh);
					var  sequenceTd = $("<td>"+(i+1)+"</td>");
					sequenceTd.addClass(me.option.checkBoxClass);
					tr.append(sequenceTd);
					var key;
					$.each(me.option.left, function(j, item){
						if(item.unique){
							me.unique = item.field;
							key = bean[item.field];
							firstTh.find("input:checkbox").val(key);
							if(item.show == false){
								return true;
							}
						}
						var td = $("<td></td>");
						td.html(bean[item.field]);
						td.attr("title", bean[item.field]);
						td.addClass(item.rigthLeftStyle);
						td.addClass(item.widthStyle);
						tr.append(td);
					});
					if(key){
						me.pullLeftTbody.append(tr);
					}
				});
				this.setLeftHeader();
				this.checkNoData();
			}
			
		},
		getEnumName : function(value, arr) {
			for(var j = 0; j < arr.length; j++){
				if(arr[j].value == value){
					return arr[j].name;
				}
			}
			return '';
		},
		setLeftHeader:function(total,obj){
			var span = $("<i></i>");
			span.append(total);
			span.addClass(obj.option.pullHeaderClass);
			obj.pullLeftHeader.empty()
				.append(obj.option.pullLeftHeaderText)
				.append(span);
		},
		/**
		 * 获取参数
		 */
		getParam : function(){
			var param = {};
			param.graduateGrade = popup.getData('graduateYear');
			//param.grade = $("#grade").val();
			//param.departmentId = $("#departmentId").val();
			//param.classId = $("#classId").val();
			//param.majorId = $("#majorId").val();
			param.studentNoOrName = $("#studentNoOrName").val();
			return param;
		}
	}
	
	module.exports = addGraduateAdvance; // 根据文件名称一致
	window.addGraduateAdvance = addGraduateAdvance; // 根据文件名称一致
});