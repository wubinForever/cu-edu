/**
 * 学生照片管理
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var simpleSelect = require("basePath/module/select.simple");
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var urlFilesystem = require("basePath/config/url.filesystem");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var urlFileSystem = require("basePath/config/url.filesystem");// 文件上传下载
	var pagination = require("basePath/utils/pagination");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var urlData = require("configPath/url.data");// 基础数据url
	var dataConstant = require("configPath/data.constant");// 公用常量 
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var photoNameWayEnum = require("basePath/enumeration/studentarchives/PhotoNameWay");// 枚举，照片命名方式
	var base  =config.base;
	/**
	 * 学生照片管理
	 */
	var photo = {
		/**
		 * 导出文件对象
		 */
		exportOjbect : {
			fileInfos : []	
		},
		// 初始化
		init : function() {		
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			// 加载年级，院系，专业，班级
			photo.loadAcademicYearAndRelation();
			// 分页
			photo.getStudentPagedList();
			//导出照片
			$('#export').click(function() {
				if (!$("#tbodycontent").hasClass("no-data-html")){
					photo.exportPhoto();
				}else{
					// 提示失败
					popup.errPop("没有符合条件的照片");
				}
			});
			// 查询
			$('#query').click(function() {
				//保存查询条件
				photo.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});
			
			 //图片上传
			var uploader = new uploaderFile({
		        $id: "importBtn",
		        extensions:"JPG,jpg",
		        callBack: function (data) {
		        	 $("#studentImage").prop("src", config.PROJECT_NAME +  urlFilesystem.EXPORT_FILE.url+"?fileId="+data.data.fileId);
		        	 $("#fileId").val(data.data.fileId);
		        },
				fileSize:1,
				module:businessModule.data
		    }).init();			
			
			// 表格选择
			$("#tbodycontent").on("click","tr[name='trName']", function() {
				// 选中样式处理
				$("#tbodycontent tr[name='trName']").each(function(){
					$(this).removeClass("active-tr");
				});
				$(this).addClass("active-tr");
				// 选中的图片
				var fileId = $(this).find('td').eq(0).attr("fileId");
				if (fileId){
					$("#studentImage").prop("src", config.PROJECT_NAME +  urlFilesystem.EXPORT_FILE.url+"?fileId="+fileId);		        	
				}else{
					// 默认图片
					$("#studentImage").prop("src", "../../../common/images/avatar.png");
				}		
				// 学生Id
	        	$("#userId").val($(this).find('td').eq(0).attr("userId"));
	        	$("#fileId").val("");
			})
			
			// 确认上传
			$('#saveBtn').click(function() {
				//保存照片
				var fileId = $("#fileId").val();
				if (utils.isNotEmpty(fileId)){
					var reqData ={
							fileId : fileId,
							userId : $("#userId").val()
					};
					// 请求数据
					ajaxData.request(URL_STUDENTARCHIVES.STUDENT_UPLOAD_STUDENTPHOTO, reqData,
							function(data) {
								// 返回成功
								if (data.code == config.RSP_SUCCESS) {
									  // 提示成功
									popup.okPop("保存成功", function() {})	
									$("#tbodycontent .active-tr").find('td').eq(8).text("有");
									$("#tbodycontent .active-tr").find('td').eq(8).prop("title","有");	
									$("#tbodycontent .active-tr").find('td').eq(0).attr("fileId",fileId);
									$("#fileId").val("");
								} else {
									// 提示失败
									popup.errPop(data.msg);	
								}
					},true);					
				}else{
					popup.warPop("请选择照片");
					return false;
				}					
			});
		},
		
		/**
		 * 导出学生照片
		 * 1.根据文件Id组合到文件系统获取文件信息，并保存业务错误信息
		 * 2.多次请求文件系统下载小于等于500M的压缩包
		 * 3.导出错误信息
		 */
		exportPhotoInit : function(){	
			photo.exportOjbect.fileInfos.length = 0;
			var param = popup.data("param");// 主页面查询条件	
			// 命名方式（从枚举获取数据）
			simpleSelect.loadEnumSelect("firstSelect",
					photoNameWayEnum, {
						firstText : " ",
						firstValue : " "
					});
			// 命名方式2（从枚举获取数据）
			simpleSelect.loadEnumSelect("thirdSelect",
					photoNameWayEnum, {
						firstText : " ",
						firstValue : " "
					});
			
			// 导出照片
			$('#exportPhoto').click(function() {
				photo.exportFile(param);
			});	
			// 导出失败信息
			$('#exportFailMsg').click(function() {
				photo.exportFailMsg();
			}).removeClass("btn-success").addClass("disabled").prop("disabled",true);
			
			// 定时器：导出错误信息
			setInterval("photo.setExportFailSession()","2000");
		},
		
		/**
		 * 学生分页列表
		 */
		getStudentPagedList : function() {
			//初始化列表数据
			photo.pagination = new pagination({
				id: "pagination", 
				url: URL_STUDENTARCHIVES.STUDENT_GETSTUDENTPHOTOPAGEDLIST, 
				param: utils.getQueryParamsByFormId("queryForm")
			},function(data){
				 // 默认图片
				 $("#studentImage").prop("src", "../../../common/images/avatar.png");
				 $("#fileId").val("");
				 if(data && data.length>0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass(
						"no-data-html");
					 $("#pagination").show();
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
			}).init();
		},		

		/**
		 * 加载年级、院系、专业、班级		 
		 * int类型默认为-1，如年级，String类型默认为空，如院系等
		 */
		loadAcademicYearAndRelation : function(){
			//年级
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,null, { async: false });
			
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
								isAuthority : true
							}, {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			// 专业（从数据库获取数据）
			simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
					        {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : dataConstant.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			// 院系联动专业
			$("#departmentId").change(
					function() {
						var reqData = {};
						reqData.departmentId = $(this).val();
						reqData.grade = $("#grade").val();
						
						$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
						if (utils.isEmpty($(this).val())
								&& utils.isNotEmpty($("#grade").val())
								&& $("#grade").val() == '-1') {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : dataConstant.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			//专业联动班级
			$("#majorId").change(
					function() {
						var reqData = {};
						reqData.majorId = $(this).val();
						reqData.grade = $("#grade").val();
						if (utils.isEmpty($(this).val())){
							$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
							return false;
						}
						simpleSelect.loadSelect("classId",URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
						        });
					});
		},
		
        // 主页面-导出照片按钮
		exportPhoto : function(){
			// 主页面参数
			popup.data("param", utils.getQueryParamsByFormId("queryForm"));
			var exportFileDialog = popup.open('./studentarchives/student/html/exportPhoto.html',{
					id : 'exportFile',// 唯一标识
					title : '导出学生照片',// 这是标题
					width : 800,// 这是弹窗宽度。其实可以不写
					height : 620,// 弹窗高度
					cancelVal : '关闭',
					cancel : function() {
						// 取消逻辑
					}
		           })
		 },
		 
		 /**
		  * 弹窗-导出
		  */
		 exportFile : function(param){
			photo.exportOjbect.fileInfos.length = 0;// 清空
			// 校验空
			if (utils.isEmpty($("#firstSelect").val().trim()) && utils.isEmpty($("#thirdSelect").val().trim())){
				popup.errPop("导出照片命名方式第一个和第三个下拉框必选一个");
				return;
			}			 
			$("#tbodycontent").empty();
			$(".successNum").text("0");
			$(".failNum").text("0");
			var v = true;//$("#addForm").valid(); // 验证表单						
			if (v) { // 表单验证通过
				// 查询导出数据并校验
				param["firstNameWay"] = $("#firstSelect").val().trim();
				param["thirdNameWay"] = $("#thirdSelect").val().trim();
				ajaxData.request(URL_STUDENTARCHIVES.STUDENT_GETEXPORTPHOTOLIST, param, function(data) {							
			        // 提示
					if (data.code == config.RSP_SUCCESS) {
						// 失败集合
						var failData = data.data.failList;
						// 成功集合
						var successData = data.data.successList;
						var nameWay = {first:$("#firstSelect").val().trim(),second:$("#secondSelect").val().trim(),third:$("#thirdSelect").val().trim()};// 命名方式					
						
						// 存储导出对象
						for(var i = 0; i <successData.length ; i++){	
							// 图片必须存在
							if (utils.isNotEmpty(successData[i].fileId)){	
								var fileName = "";
								if (utils.isNotEmpty(nameWay.first)){
									if (nameWay.first == photoNameWayEnum.StudentNo.value){
										fileName += successData[i].studentNo;
									}else if (nameWay.first == photoNameWayEnum.StudentName.value){
										fileName += successData[i].studentName;
									}else if (nameWay.first == photoNameWayEnum.IdCard.value){
										fileName += successData[i].idCard;
									}else if (nameWay.first == photoNameWayEnum.CandidateNo.value){
										fileName += successData[i].candidateNo;
									}
								}
								if (utils.isNotEmpty(nameWay.second)){
									fileName += nameWay.second;
								}
								if (utils.isNotEmpty(nameWay.third)){
									if (nameWay.third == photoNameWayEnum.StudentNo.value){
										fileName += successData[i].studentNo;
									}else if (nameWay.third == photoNameWayEnum.StudentName.value){
										fileName += successData[i].studentName;
									}else if (nameWay.third == photoNameWayEnum.IdCard.value){
										fileName += successData[i].idCard;
									}else if (nameWay.third == photoNameWayEnum.CandidateNo.value){
										fileName += successData[i].candidateNo;
									}
								}
								photo.exportOjbect.fileInfos.push(successData[i].fileId + ":" + fileName);
							}
						}

						$("#exportFailMsg").removeClass("btn-success").addClass("disabled").prop("disabled",true);// 禁用
						// 绑定失败数据
						if(failData && failData.list && failData.list.length > 0 ){
							//$("#exportFailMsg").addClass("btn-success").removeClass("disabled").prop("disabled",false);// 启用
							var displayedMessages = failData.list.slice(0, failData.list.length > 100 ? 100 : failData.list.length);
							$("#tbodycontent").removeClass("no-data-html")
										.empty().append($("#bodyContentImpl").tmpl(displayedMessages));
							$(".successNum").text(failData.successCount);
							$(".failNum").text(failData.failCount);
						}else{
							$("#tbodycontent").empty();
							$(".successNum").text(failData.successCount);
							$(".failNum").text(failData.failCount);
						}
						
						// 导出
						if (photo.exportOjbect.fileInfos.length > 0){
							//var reqParam ={fileName: "学生照片_"+ new Date().format("yyyyMMdd"),ids:photo.exportOjbect.fileInfos};
							var reqParam ={fileName: "学生照片_"+ new Date().format("yyyyMMdd"),nameStr:photo.exportOjbect.fileInfos.join(",")};	
					    	ajaxData.exportFile(urlFileSystem.GET_FILEZIP, reqParam);
						}else{
							// 提示失败
							popup.errPop("没有符合条件的照片");	
						}
							
					} else {
						// 提示失败
						popup.errPop(data.msg);	
					}
				},true);					
			}
		 },
		 
		 /**
		  * 导出失败信息
		  */
		 exportFailMsg : function(){			 
			 if($("#tbodycontent tr").length > 0){
					ajaxData.exportFile(URL_STUDENTARCHIVES.STUDENT_EXPORTPHOTOEXPORTFAILMESSAGE);
				}else{
					$("#exportFailMsg").removeClass("btn-success").addClass("disabled").prop("disabled",true);
				}
		 },
		 
		 /**
		  * 定时器函数：访问session导出错误信息
		  */
		 setExportFailSession : function(){
			 ajaxData.request(urlFileSystem.GET_FILEMESSAGESESSION, null, function(data) {							
			        // 提示
					if (data.code == config.RSP_SUCCESS && !utils.isEmpty(data.data)) {
						if (data.data == "ok" && $("#tbodycontent tr").length > 0){
							$(".loading,.loading-back").remove();// 移除缓冲
							$("#exportFailMsg").addClass("btn-success").removeClass("disabled").prop("disabled",false);// 启用
						}else{								
							// 缓冲
							var divLen = 0;
							$("body div").each(function(){
								if (this.className =="loading-back"){
									divLen = divLen + 1;	
								}
							})
							var successNum = $(".successNum").text();
							var failNum = $(".failNum").text();
							if (divLen == 0 && successNum != 0 && failNum != 0){
								$("body").append("<div class='loading'></div>");// 缓冲提示
								$("body").append("<div class='loading-back'></div>");	
							}
							$("#exportFailMsg").removeClass("btn-success").addClass("disabled").prop("disabled",true);// 禁用
						}
					}
			 })
		 }
	}
	module.exports = photo;
	window.photo = photo;
});
