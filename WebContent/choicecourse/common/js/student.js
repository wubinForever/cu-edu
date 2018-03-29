/**
 * 获取学生左右切换
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("../../../common/js/utils/utils");
	var config = require("../../../common/js/utils/config");
	var ajaxData = require("../../../common/js/utils/ajaxData");

	// 下拉框
	var simpleSelect = require("../../../common/js/module/select.simple");	
	
	var popup = require("../../../common/js/utils/popup");
	require("../../../common/js/utils/common");
	var URL_CHOICECOURSE = require("../../../common/js/config/url.choicecourse");
	var URL_STUDENT = require("../../../common/js/config/url.studentarchives");
	var shuffling = require("../../../common/js/utils/shuffling");

	// 变量名跟文件夹名称一致
	var student = {
		init : function() {
			// 数据库中传过来已有的右侧数据
			var rightData = popup.data("data");
			// 从主界面传递过来的参数
			var param = popup.data("param");
			// 左右列表数据加载
			var shuff = new shuffling({
				left : [ {
					name : "班级",
					field : "className",rigthLeftStyle:"text-l"
				}, {
					name : "学号",
					field : "studentNo",rigthLeftStyle:"text-l"
				}, {
					name : "姓名",
					field : "studentName",rigthLeftStyle:"text-l"
				}, {
					name : "性别",
					field : "sexName",
					widthStyle:"width10"
				}, {
					name : "是否注册",
					field : "registerStatusName",
					widthStyle:"width12"
				}, {
					field : "userId",
					unique : true,
					show : false
				} ],
				selectedData : rightData, // 右侧数据填充
				param : {
					pageSize : 100000,
					pageIndex : 0
				},
				selectedCanRemove : true,
				pullLeftHeaderText:"可选学生：",	//左侧顶部文本
				pullRightHeaderText:"已禁选学生："	//右侧顶部文本
			}).init();
			student.shuff = shuff;
			popup.data("shuff", shuff);

			// 班级下拉数据
			var reqData = {};		
			reqData.majorId =param["gradeMajorDto"][0].majorId;
			reqData.grade = param["gradeMajorDto"][0].grade;	
			simpleSelect.loadSelect("classId", URL_STUDENT.CLASS_GET_CLASSSELECTBYQUERY, reqData, {
				firstText : "全部",
				firstValue : ""
			});

			// 绑定左侧自定义数据
			student.getStudentList(param);

			$("#searchBtn").click(function() {				
				// 绑定左侧自定义数据
				student.getStudentList(param);
			});
		},
		getSelectedStudent : function() {
			// 保存
			student.shuff.getData();
		},
		chooseStudent : function(data, param, callback) {
			popup.data("data", data);// 数据库中传过来已有的右侧数据
			popup.data("param", param);// 从主界面传递过来的参数
			// 打开页面弹框
			popup.open('./choicecourse/common/html/student.html', {
				id : 'addstudent',// 唯一标识
				title : '设置禁选学生',// 这是标题
				width : 1300,// 这是弹窗宽度。其实可以不写
				height : 435,// 弹窗高度*/
				okVal : '保存',
				cancelVal : '关闭', 
				//fixed : true,
				ok : function() {
					var shuffing = popup.data("shuff");
					var choiceMajorId = param["gradeMajorDto"][0].choiceMajorId;
					return callback(shuffing.getData(),choiceMajorId);
				},
				cancel : function() { // 取消逻辑 
					
				}
			});
		},
		/**
		 * 获取参数
		 */
		getParam : function(param) {			
			param.classId = $("#classId").val();
			param.studentName = $.trim($("#studentName").val());

			if ($('#registerStatus').is(":checked")) {
				param.registerStatus = -2;// 未注册（null,2,3）
			} else {
				param.registerStatus = null;//查询全部
			}

			!param.classId && delete param.classId;
			!param.studentName && delete param.studentName;
			!param.registerStatus && delete param.registerStatus;
			param.pageSize = 100000;
			param.pageIndex = 0;
			return param;
		},
		/**
		 * 设置禁选学生-所有禁选学生列表（已保存+未保存）
		 * 
		 * @param param 查询条件
		 *            
		 */
		getStudentList : function(param) {			
			param.isSave=null;//表示获取已保存+未保存的禁止学生
			var parmSearch = student.getParam(param);			
			ajaxData.setContentType("application/json;charset=utf-8");				
			ajaxData.request(URL_CHOICECOURSE.CHOICESTUDENT_GETSTUDENTLISST, JSON.stringify(parmSearch), function(data) {
				if (data != null && data.data.length > 0) {
					student.shuff.setSelectData(data.data);
				} else {
					student.shuff.setSelectData([]);
				}
			},true);			
		},
	}
	module.exports = student; // 根文件夹名称一致
});