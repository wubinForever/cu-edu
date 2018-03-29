define(function(require, exports, module) {
	var popup = require("basePath/utils/popup");
	var URL_DATA = require("basePath/config/url.data");
	var simpleSelect = require("basePath/module/select.simple");
	var DICTIONARY = require("basePath/config/data.dictionary");
	var CONSTANT = require("basePath/config/data.constant");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	/**
	 * 教室弹窗
	 */
	var teachroom = {
		/**
		 * 绑定数据
		 */
		init : function(){
			this.bindEvent();
			var teachroomData = popup.getData("teachroomData");
			simpleSelect.loadCampus("campus", false, teachroomData.campusId,CONSTANT.PLEASE_SELECT,"-1", false  );
			simpleSelect.loadDictionarySelect("teachroomType", DICTIONARY.ID_FOR_VENUE_TYPE_CODE, {defaultValue:teachroomData.teachroomTypeCode,firstText:CONSTANT.PLEASE_SELECT, firstValue:"-1"});
			this.loadBuilding();
			popup.setData("teachroom", teachroom);
		},
		/**
		 *  绑定事件
		 */
		bindEvent:function(){
			$("#teachroomType").change(function(){
				teachroom.loadTeachroom();
			});
			$("#campus").change(function(){
				teachroom.loadBuilding();	
			});
			$("#building").change(function(){
				teachroom.loadTeachroom();
			});
		},
		/**
		 * 置空
		 */
		clear : function(){
			$("#teachroomType, #campus, #building, #teachroom").val("-1")
		},
		/**
		 * 获取值
		 */
		getData : function(){
			var obj = {};
			obj.teachroomTypeCode = $("#teachroomType").val();
			obj.teachroomTypeName = $("#teachroomType").find("option:selected").attr("title");
			obj.campusId = $("#campus").val();
			obj.campusName = $("#campus").find("option:selected").attr("title");
			obj.buildingId = $("#building").val();
			obj.buildingName = $("#building").find("option:selected").attr("title");
			obj.teachroomId = $("#teachroom").val();
			obj.teachroomName = $("#teachroom").find("option:selected").attr("title");
			
			obj.teachroomTypeCode == '-1'  && delete obj.teachroomTypeCode && delete obj.teachroomTypeName;
			obj.campusId == '-1'  && delete obj.campusId && delete obj.campusName;
			obj.buildingId == '-1'  && delete obj.buildingId && delete obj.buildingName;
			obj.teachroomId== '-1'  && delete obj.teachroomId && delete obj.teachroomName;
			return obj;
		},
		/**
		 * 加载楼房
		 */
		loadBuilding:function(){
			var teachroomData = popup.getData("teachroomData");
			var defaultValue = "-1";
			if(!teachroom.isSetBuilding){
				defaultValue = teachroomData.buildingId;
				teachroom.isSetBuilding = true;
			}
			simpleSelect.loadBuilding("building", $("#campus").val(),{defaultValue:defaultValue}, function(){
				teachroom.loadTeachroom();
			});
		},
		/**
		 * 加载场地（教室）
		 */
		loadTeachroom : function(){
			var teachroomData = popup.getData("teachroomData");
			var obj = $("#teachroom");
			var param = {};
			param.buildingId = $("#building").val();
			param.venueTypeCode = $("#teachroomType").val();
			ajaxData.request(URL_DATA.VENUE_GETLISTBYQUERY, param,function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var arr = [];
					$.each(data.data, function(i, item){
						arr.push({name:item.venueName + "["+item.effectiveSeatAmount+"]", value:item.venueId});
					});
					var defaultValue = "-1";
					if(!teachroom.isSetTeachroom){
						defaultValue = teachroomData.teachroomId;
						teachroom.isSetTeachroom = true;
					}
					simpleSelect.installOption(obj, arr,defaultValue ,CONSTANT.PLEASE_SELECT, "-1");
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});	
		}
	}
	module.exports = teachroom;  
});