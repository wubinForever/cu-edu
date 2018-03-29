/**
 * 环节成绩分制
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var dataConstant = require("configPath/data.constant");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var pagination = require("basePath/utils/pagination");
	var urlstudent = require("configPath/url.studentarchives");// 学籍url
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var ve = require("basePath/utils/validateExtend");
	var enableChanges = require("basePath/enumeration/score/EnableChanges");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var dataDictionary = require("configPath/data.dictionary");

	/**
	 * 环节成绩录入人分制
	 */
	var tacheScoreSet = {
		/**
		 * 分制名称
		 */
		initAdd:function(){
			
			var param ={};
			var obj = popup.data("obj");
			var semester = obj.semester;
			param.courseId = $(obj).attr("courseId");
        	param.classId = $(obj).attr("classId");
        	param.academicYear = $(obj).attr("semester").split("_")[0];
        	param.semesterCode = $(obj).attr("semester").split("_")[1];
			//进来的时候加载默认分制id
        	ajaxData.contructor(false);
			ajaxData.request(url.GET_TACHE_SCORE_CONSTITUTE_BY_PARAMETERS,param,function(data){
   		    	if(data.code==config.RSP_SUCCESS)
   		    	{
	    			if(data.data && data.data.scoreRegimenId){
   		    			var scoreRegimenId = data.data.scoreRegimenId;
   		    			$("#scoreRegimenId").val(scoreRegimenId);
   		    			simpleSelect.loadSelect("scoreRegimenName",url.GET_SCORE_REGIMEN_LIST,{},{firstText:"--请选择--",firstValue:"",defaultValue:scoreRegimenId});
   		    		}else{
   		    			//进来加载成绩分制
   		    			simpleSelect.loadSelect("scoreRegimenName",url.GET_SCORE_REGIMEN_LIST,{},{firstText:"--请选择--",firstValue:""});
   		    		} 		    		
   				}
   			});
			
			
		},
        //设置分制
        set: function(formFlag){
        	
        	var queryParams=utils.getQueryParamsByFormId("queryForm");
        	popup.data("obj",queryParams);//传值过去
			if(queryParams.courseId==dataConstant.EMPTY){
				popup.warPop("请先选择环节");
				return false;
			}else{				
					// 查询成绩分制
					ajaxData.contructor(false);
					ajaxData.request(url.GET_TACHE_SCORE_CONSTITUTE_BY_PARAMETERS, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.allowModify === 0){
							popup.warPop("成绩分制已被设置成不可修改");
							return false;
						}
						
						
						
						var mydialog = art.dialog.open('./score/score/html/tacheScoreSet.html', // 这里是页面的路径地址
				                {
				                    id : 'set',// 唯一标识
				                    title : '环节成绩分制设置',// 这是标题
				                    width : 500,// 这是弹窗宽度。其实可以不写
				                    height : 100,// 弹窗高度
				                    okVal : '保存',
				                    cancelVal : '关闭',
				                    ok : function(obj) {
				                    	 var paramCopy = [];
				                         var scoreRegimenName =obj.$("#scoreRegimenName").val();
				                         if(utils.isEmpty(scoreRegimenName)){ 
				                         	popup.warPop("请选择分制");
				                         	return false;
				                         }
				                         //获取页面上的值
			             				var reqDataCopy ={};
			             				reqDataCopy.courseId=queryParams.courseId;//班级id
			             				reqDataCopy.classId=queryParams.classId;//班级id
			             				var semester = queryParams.semester;
			             				reqDataCopy.academicYear = semester.split("_")[0];
			             	            reqDataCopy.semesterCode = semester.split("_")[1];
			             				reqDataCopy.scoreRegimenId=scoreRegimenName;
			             				reqDataCopy.scoreEnterFlag = 1;//环节即使原始成绩中有数据也要进行修改
			             				paramCopy.push(reqDataCopy);
				                        var reqre={};
				             		    reqre.scoreSetListDto=paramCopy;
				             		    var scoreRegimenId = obj.$("#scoreRegimenId").val();
				             		    //保存到后台
				            			if(utils.isEmpty(scoreRegimenId)){
				            				ajaxData.contructor(false);
					                        ajaxData.setContentType("application/json;charset=UTF-8");
					                     	ajaxData.request(url.SAVE_TACHE_SCORE_SET,JSON.stringify(reqre),function(data){
					               		    	if(data.code==config.RSP_SUCCESS)
					               		    	{
					               		    		mydialog.close();//关窗
					               		    		popup.okPop("保存成功",function(){
					               					});
					               		    		// 新增时不需要删除原始成绩  tacheScoreEnter.deleteOriginalScore();
					               		    		// 刷新列表						
					        						tacheScoreEnter.getInitData();	
					               				}
					               			});
				            			}else{ // 修改
				            				popup.askPop("保存将会删除当前页面已录入学生成绩，是否要继续？",function(){
				            					ajaxData.contructor(false);
						                        ajaxData.setContentType("application/json;charset=UTF-8");
						                     	ajaxData.request(url.SAVE_TACHE_SCORE_SET,JSON.stringify(reqre),function(data){
						               		    	if(data.code==config.RSP_SUCCESS)
						               		    	{
						               		    		mydialog.close();//关窗
						               		    		popup.okPop("保存成功",function(){
						               					});
						               		    		tacheScoreEnter.deleteOriginalScore();	
						               				}
						               			});
				            				});
				            			}
				             		    
				                     	
				                        return false;
				                    },
				                    cancel : function() {
				                    	if(formFlag==1){ // 1点查询时进来，2 点设置成绩分制链接进来
				                    		tacheScoreEnter.bindNoData();
				                    	}				                    	
				                    }
				               });
						
						
					     
					}
				});
			}            
        }
        
	}
	module.exports = tacheScoreSet;
	window.tacheScoreSet = tacheScoreSet;
});