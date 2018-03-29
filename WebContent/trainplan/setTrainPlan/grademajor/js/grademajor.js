/**
 * 设置年级开设专业
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.trainplan");
	var UDFURL = require("configPath/url.udf");
	var URLDATA = require("configPath/url.data");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var pagination = require("basePath/utils/pagination");
	var dataDic = require("configPath/data.dictionary");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var base  =config.base;
	var waitData=[];//存放待选择数据
	/**
	 * 设置年级开设专业
	 */
	var grademajor = {
		//查询条件
		queryObject:{},	
		// 初始化
		init:function() {
				//加载培养层次
				simpleSelect.loadDataDictionary("trainingLevelCode", dataDic.ID_FOR_TRAINING_LEVEL,"","全部","");
				//加载分页列表
				grademajor.getGradeMjorList();
				//查询按钮
				$("#query").on("click",function(){
					//保存查询条件
					grademajor.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
				});
				// 取消
				$(document).on("click", "button[name='cancel']", function() {
					  var length = $("input[name='checNormal']:checked").length;
					  var ids = [];
	       		      if(length==0){
	       			    popup.warPop("请选择需要取消的专业");
	       			    return false;
	       		      }
	       		      $("input[name='checNormal']:checked").each(function(){
	       		          ids.push($(this).attr("id"));
	       		      })
					  grademajor.cancel(ids);
				});
				//单个取消
				$(document).on("click", "[name='singlecancel']",function(){	
					  var ids = [];
					  ids.push($(this).attr("grademajorId"));
		       		  grademajor.cancel(ids); 
			    });
				//新增
				$("button[name='add']").bind("click", function() {
					grademajor.popAddHtml();
				});
				//复制
				$(document).on("click", "button[name='copy']", function() {
					grademajor.copy(this);
				});
				//加载年级列表
			    simpleSelect.loadSelect("grade", URL.GRADEMAJOR_GRADELIST,null,{firstText:"全部",firstValue:"-1"});
				//加载院系
			    simpleSelect.loadCommon("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","");
				//年级联动专业
				$("#grade").change(function(){
					var reqData={};
					reqData.grade =$(this).val();
				    reqData.departmentId=$("#departmentId").val();
				    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
				});
				//院系联动专业
				$("#departmentId").change(function(){
					var reqData={};
					reqData.departmentId = $(this).val();
					reqData.grade = $("#grade").val();
					simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
				});
				//初始化专业
			    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{firstText:"全部",firstValue:""});
				//导出
				$(document).on("click", "button[name='export']", function() {
					ajaxData.exportFile(URL.GRADEMAJOR_EXPORT,grademajor.pagination.option.param);
				});
		},
	//新增初始化
	initadd:function(){
		      //初始化右边全选按钮
		      utils.checkAllCheckboxes('left-check-all', 'left-checNormal');
		      //招生季节
			  simpleSelect.loadDictionarySelect("enrollSeason",dataDic.ENROLL_SEASON_CODE,{firstText:"",firstValue:"",defaultValue:"2"});
		      //默认当前年份
		      $('#deafultvalue').val((new Date).getFullYear());
		      //加载院系
		      simpleSelect.loadCommon("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},"","全部","-1",null);
		      //加载培养层次
		      simpleSelect.loadDataDictionary("trainLevel", dataDic.ID_FOR_TRAINING_LEVEL,"","全部","");
		      //左列表
		      grademajor.getLeftTable();
		      //查询左列表
		      $("#query").on("click",function(){
			     grademajor.getLeftTable();
			  });
		      //年级开设专业新增页面-添加
			  $("button[name='btnAdd']").bind("click", function() {
			  grademajor.addGradeMajor(this);
			  });
			  //年级开设专业-移除
			 $("button[name='btnDelete']").bind("click", function() {
				grademajor.deleteGradeMajor(this);
			 });
			 //插件上移
			 $('.spinner .btn:first-of-type').on('click', function() {
				$('.spinner input').val( parseInt($('.spinner input').val(), 10));
				 //刷新左列表
			     grademajor.getLeftTable();
			   //清空右边列表
			     $("#righttable").html("");
			     //取消全选
			     $('#left-check-all').removeAttr("checked").parent().removeClass("on-check");
			     //已选择变为0
			     $("#rightnumber").text(0);
			 });
			 //插件下移
			 $('.spinner .btn:last-of-type').on('click', function() {
				$('.spinner input').val( parseInt($('.spinner input').val(), 10));
				//刷新左列表
			     grademajor.getLeftTable();
			     //清空右边列表
			     $("#righttable").html("");
			     //取消全选
			     $('#left-check-all').removeAttr("checked").parent().removeClass("on-check");
			     //已选择变为0
			     $("#rightnumber").text(0);
			 });
			 //招生季节联动
			 $("#enrollSeason").on("click",function(){
				//刷新左列表
			     grademajor.getLeftTable();
			     //清空右边列表
			     $("#righttable").html("");
			     $("#rightnumber").text(0);
			     //取消全选
			     $('#left-check-all').removeAttr("checked").parent().removeClass("on-check");
			 })
			 grademajor.checkTableTrLenght("righttable");
			 grademajor.checkTableTrLenght("lefttable");
			 
			 
	},
	checkTableTrLenght:function(obj){
		//判断右侧是否有数据,没有数据则显示暂无数据
		var trLength=$("#"+obj+" tr").length;
		if(trLength==0){
		 $("#"+obj).empty().addClass("no-data-html");
		}else{
			$("#"+obj).removeClass("no-data-html");
		}
		
	
	},
		//初始化复制
	initcopy:function(){
			 //插件上移
			 $('.spinner .btn:first-of-type').on('click', function() {
				$('.spinner input').val( parseInt($('.spinner input').val(), 10));
				 var sourceGrade = $("#sourceGrade").val();
				 if(utils.isNotEmpty(sourceGrade)){
					 grademajor.getcopyNum();
				 }else
				 {
					 $('#waitcopyNum').text(0);
				 }
			 });
			 //插件下移
			 $('.spinner .btn:last-of-type').on('click', function() {
				$('.spinner input').val( parseInt($('.spinner input').val(), 10));
				var sourceGrade = $("#sourceGrade").val();
				if(utils.isNotEmpty(sourceGrade)){
					 grademajor.getcopyNum();
				}else{
					 $('#waitcopyNum').text(0);
				}
			 });
			 //初始化所有的院系
			 simpleSelect.loadCommon("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},"","全部","-1",null);
			 //加载源年级
			 grademajor.getSourceGradeList();
			 //加载目标年级
			 $("#goalGrade").val((new Date).getFullYear());
			 //目标年级联动待复制数目
			 $(document).on("click", "#sourceGrade", function() {
				 var goalGrade = $("#goalGrade").val();
				 var sourceGrade = $("#sourceGrade").val();
				 if(utils.isNotEmpty($(this).val())){
					 if(goalGrade != sourceGrade){
						 grademajor.getcopyNum();
					 }else{
					    $('#waitcopyNum').text(0);
					 }
				 }else{
					    $('#waitcopyNum').text(0);
				 }
			 });
			
			 //源年级联动待复制数目
			 $(document).on("click", "#departmentId", function() {
				 var goalGrade = $("#goalGrade").val();
				 var sourceGrade = $("#sourceGrade").val();
				 if(utils.isNotEmpty(sourceGrade)){
					 if(goalGrade != sourceGrade){
						 grademajor.getcopyNum();
					 }else{
					    $('#waitcopyNum').text(0);
					 }
				 }else{
					    $('#waitcopyNum').text(0);
				 }
				});
		},
		
		/**
		 * 查询待复制的数目
		 */
	  getcopyNum:function(){
			var reqData={};
			reqData.departmentId = $("#departmentId").val();
			reqData.goalGrade = $("#goalGrade").val();
			reqData.sourceGrade = $("#sourceGrade").val();
			ajaxData.request(URL.GRADEMAJOR_GERCOPYNUM,reqData,function(data){
				   if(data.code==config.RSP_SUCCESS){
					  $('#waitcopyNum').text(data.data);
				   }
			});
		},
		/**
		 * 查询分页函数
		 */
	  getGradeMjorList:function(){
			grademajor.pagination = new pagination({
				id: "pagination", 
				url: URL.GRADEMAJOR_LIST, 
				param: grademajor.queryObject 
			},function(data){
				 $("#pagination").show();
				 if(data && data.length != 0) {
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
			
		},
		/**
		 * 取消
		 * @param ids
		 */
		cancel:function(ids){
	    	var reqData={ids:ids};
	    	popup.askPop('确认取消选择的专业？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL.GRADEMAJOR_CANCEL,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		grademajor.pagination.loadData();
					}
					else
					{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							popup.errPop("取消选择专业失败");
						}
					}
			    	$('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
				});
		   });
	    },
		
		/**
		 * 查询专业左列表
		 */
	 getLeftTable:function(){
			var reqData ={};
			reqData.grade=parseInt($("#deafultvalue").val());
			reqData.departmentId =$("#departmentId").val();
			reqData.trainingLevelCode =$("#trainLevel").val();
			reqData.majorNo =$("#majorNameNo").val();
			reqData.enrollSeasonCode=$("#enrollSeason").val();
			ajaxData.request(URL.GRADEMAJOR_LEFTABLE_QUERY,reqData,function(data){
				    waitData=[];//每次查询的时候清空数组
				 if(data && data.data.length != 0){
					 var datas =data.data;
					 var majorIds =[];
					 var dataList = [];
					 $("#righttable input[type='checkbox']").each(function(){
						 var MajorId =$(this).val();
						 majorIds.push(MajorId);
					 });
					 var flag =true;
					 for(var i=0;i<datas.length;i++){
						for(var j=0;j<majorIds.length;j++){
							if(datas[i].majorId==majorIds[j]){
								flag =false;
								break;
							}else{
								flag =true;
							}
						}
						if(flag){
							dataList.push(datas[i]);
						}
					 }
					 
					 for(var i=0;i<datas.length;i++){
						 waitData.push(datas[i].majorId);
					 }
					 if(dataList.length>0){
						 $("#lefttable").removeClass("no-data-html").empty().append($("#lefttableImpl").tmpl(dataList));
					 }
					 $("#leftnumber").text(dataList.length);
					 
				 }else{
					 $("#lefttable").empty().addClass("no-data-html");
					 $("#leftnumber").text(0);
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			});
		},
		checkChooseData:function(tableId){
			//检验是否勾选数据
			var checkTr=[];
		$("#"+tableId+" input[type='checkbox']:checked").each(function(i,item){
			checkTr.push($(this).val());
		});
		if(checkTr.length==0){
			popup.warPop("请先选择数据");
			return false;
		}
		return true;
		},
	/**
	 * 年级开设专业-新增页面-添加
	 */
	addGradeMajor:function(){
			// 获取勾选项
			var majorIds=[];
			var html ="";
			var rightTabl=[];
			//获取右边列表数据的数组
			$("#righttable input[type='checkbox']").each(function(){
				rightTabl.push($(this).val());//专业id
			})
			var isCheck=grademajor.checkChooseData("lefttable");
			if(!isCheck){
				return;
			}
			//拼装右边
			$("#lefttable input[type='checkbox']:checked").each(function(i,item){
				var html="";
				var majorId = $(this).val();//专业id
				var majorNo = $(this).parent().parent().parent().find("td[name='majorNo']").html();//专业号
				var majorName = $(this).parent().parent().parent().find("td[name='majorName']").html();//专业名称
				var departmentName = $(this).parent().parent().parent().find("td[name='departmentName']").html();//院系
				var educationSys=$(this).parent().parent().parent().find("td[name='educationSys']").html();//学制
				var trainlevelName=$(this).parent().parent().parent().find("td[name='trainlevelName']").html();//培养层次
				majorIds += $(this).val()+",";
				var result =$.inArray($(this).val(), rightTabl)
				if(result !=-1){
					return ;//右边如果隐藏到时再加
				}
				html+=" <tr class='tr-checkbox'>" +
				"<td class='width03'>" +
				"<div class='checkbox-con'>" +
				"<input type='checkbox' class='checNormal' value='"+majorId+"' name='left-checNormal'></div></td>" +
				"<td name ='majorNo' class='text-l'>"+ majorNo+"</td>" +
				"<td name='majorName' class='text-l' title="+majorName+">" + majorName+"</td>" +
				"<td name='departmentName' class='text-l' title="+departmentName+" >"+ departmentName+"</td>" +
				"<td name='educationSys' class='width48'>"+ educationSys+"</td>" +
				"<td name='trainlevelName' class='width48'>"+ trainlevelName +"</td>" +
				"</tr>"
	             $("#righttable").append(html);
				//拼完右边并将左边移除
				$(this).parent().parent().parent().remove();
				
			});
			//判断全选
			var lenth =$("#lefttable input[type='checkbox']:checked").length;
			if(lenth==0){
				$("#check-all").prop("checked",false)
				$("#check-all").parent().attr("class","checkbox-con");
			}
			
			var LeftLength =$("#lefttable input[type='checkbox']:checked").length;
			var rightLength =$("#righttable input[type='checkbox']:checked").length;
			if(LeftLength==0){
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			if($("#lefttable input[type='checkbox']").length != $("#lefttable input[type='checkbox']:checked").length){
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			if(rightLength==0){
				$('#left-check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			if($("#righttable input[type='checkbox']").length != $("#righttable input[type='checkbox']:checked").length){
				$('#left-check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			
			$("#leftnumber").text($("#lefttable input[type='checkbox']").length);
			$("#rightnumber").text($("#righttable input[type='checkbox']").length);
			 grademajor.checkTableTrLenght("righttable");
			 grademajor.checkTableTrLenght("lefttable");
		},
	/**
	 * 年级开设专业移除
	 */
	deleteGradeMajor:function(){
			var majorIds=[];
			var leftTabl=[];
			//获取左边列表数据的数组
			$("#lefttable input[type='checkbox']").each(function(){
				leftTabl.push($(this).val());//专业id
			})
			var isCheck=grademajor.checkChooseData("righttable");
			if(!isCheck){
				return;
			}
			//拼装左边
			$("#righttable input[type='checkbox']:checked").each(function(i,item){
				//先移除再判断是否往右边拼接
				$(this).parent().parent().parent().remove();
				var html="";
				var majorId = $(this).val();//专业id
				var majorNo = $(this).parent().parent().parent().find("td[name='majorNo']").html();//专业号
				var majorName = $(this).parent().parent().parent().find("td[name='majorName']").html();//专业名称
				var departmentName = $(this).parent().parent().parent().find("td[name='departmentName']").html();//院系
				var educationSys=$(this).parent().parent().parent().find("td[name='educationSys']").html();//学制
				var trainlevelName=$(this).parent().parent().parent().find("td[name='trainlevelName']").html();//培养层次
				var result =$.inArray($(this).val(), waitData)//=-1就说明不存在
				if(result == -1){
					return ;//右边如果隐藏到时再加
				}
				html+=" <tr class='tr-checkbox'>" +
				"<td class='width03'>" +
				"<div class='checkbox-con'>" +
				"<input type='checkbox' class='checNormal' value='"+majorId+"' name='checNormal'></div></td>" +
				"<td name ='majorNo' class='text-l'>"+ majorNo+"</td>" +
				"<td name='majorName' class='text-l' title='"+majorName+"'>"+ majorName+"</td>" +
				"<td name='departmentName' class='text-l' title='"+departmentName+"' >"+ departmentName+"</td>" +
				"<td name='educationSys' class='width48'>"+ educationSys+"</td>" +
				"<td name='trainlevelName' class='width48'>"+trainlevelName+"</td>" +
				"</tr>"
	             $("#lefttable").append(html);
				
			});
			var LeftLength =$("#lefttable input[type='checkbox']:checked").length;
			var rightLength =$("#righttable input[type='checkbox']:checked").length;
			if(LeftLength==0){
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			if($("#lefttable input[type='checkbox']").length != $("#lefttable input[type='checkbox']:checked").length){
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			if(rightLength==0){
				$('#left-check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			if($("#righttable input[type='checkbox']").length != $("#righttable input[type='checkbox']:checked").length){
				$('#left-check-all').removeAttr("checked").parent().removeClass("on-check");
			}
			//重新生成已选择
			$("#rightnumber").text($("#righttable input[type='checkbox']").length);
			$("#leftnumber").text($("#lefttable input[type='checkbox']").length);
			 grademajor.checkTableTrLenght("righttable");
			 grademajor.checkTableTrLenght("lefttable");
		},
		
		/**
		 * 源年级
		 */
		getSourceGradeList:function(){
			ajaxData.request(URL.GRADEMAJOR_GRADELIST,null,function(data){
				 $("#sourceGradeImpl").tmpl(data.data).appendTo('#sourceGrade');
			});
		},
		
		/**
		 * 新增
		 */
		popAddHtml: function(){
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var mydialog = popup.open('./trainplan/setTrainPlan/grademajor/html/add.html', // 这里是页面的路径地址
				{
					id : 'add',// 唯一标识
					title : '年级开设专业添加',// 这是标题
					width :1200,// 这是弹窗宽度。其实可以不写
					height :580,// 弹窗高度
							button: [{name: '保存', callback: function () {
								var obj = this.iframe.contentWindow;
								//验证年级和招生季节不能为空
								var grade =parseInt(obj.$("#deafultvalue").val());
								var enrollSeason =obj.$("#enrollSeason").val();
								if(utils.isEmpty(grade)){
									popup.warPop("年级不能为空");
									return false;
								}
								if(utils.isEmpty(enrollSeason)){
									popup.warPop("招生季节不能为空");
									return false;
								}
								
								var majorIds=[];
								//进行添加保存（拿到右边的数据进行封装）
								obj.$("#righttable input[type='checkbox']").each(function(i){
									majorIds.push($(this).val());
								});
								//如果右边区域没有数据进行提示
								if(majorIds.length==0){
									popup.warPop("请选择需要保存的年级开设专业");
									return false;
								}
								var reqData={};
								reqData.grade =grade;
								reqData.enrollSeasonCode =enrollSeason;
								reqData.majorIds =majorIds;
								if(utils.isNotEmpty(majorIds)){
									ajaxData.request(URL.GRADEMAJOR_ADD,reqData,function(data){
										   if(data.code==config.RSP_SUCCESS){
											    var grade = $("#grade").val();
											    grademajor.pagination.loadData();//局部刷新列表
											    simpleSelect.loadSelect("grade",URL.GRADEMAJOR_GRADELIST,null,{defaultValue:grade,firstText:"全部",firstValue:"-1",async:false});
											    mydialog.close();
										   }
										   else{
												popup.errPop("新增失败");
										   }		
									});
								}
							},focus:true},
							{name:'取 消',callback:function(){
								popup.askPop("确认取消吗？",function(){
									mydialog.close();
								});
								return false;
							}}]	
							                  
					
				});
		},
		
		/**
		 * 复制
		 */
		copy: function(){
		////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
		var mydialog =	popup.open('./trainplan/setTrainPlan/grademajor/html/copy.html', // 这里是页面的路径地址
				{
					id : 'copy',// 唯一标识
					title : '复制年级开设专业',// 这是标题
					width : 500,// 这是弹窗宽度。其实可以不写
					height : 320,// 弹窗高度
					button: [{name: '复 制', callback: function () {
						var obj = this.iframe.contentWindow;
						var sourceGrade = obj.$("#sourceGrade").val();
						var goalGrade = obj.$("#goalGrade").val();
						var departmentId = obj.$("#departmentId").val();
						if(utils.isEmpty(sourceGrade)){
							popup.warPop("请选择源年级");
							return false;
						}
						if(sourceGrade == goalGrade){
							popup.warPop("源年级和目标年级不能相同");
							return false;
						}
						if(sourceGrade>goalGrade){
							popup.warPop("请确保目标年级大于源年级");
							return false;
						}
						var reqData = {};
						reqData.sourceGrade = sourceGrade;
						reqData.goalGrade = goalGrade;
						reqData.departmentId = departmentId;
						ajaxData.request(URL.GRADEMAJOR_COPY, reqData, function(data){
						    if(data.code == config.RSP_SUCCESS){
						    	window.location.reload();
						    }else{
						    	popup.errPop("复制失败");
						    }
			    		}, true);
					},focus:true},
					{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							mydialog.close();
						});
						return false;
					}}]	
		
				});
		},
		
	}
	module.exports = grademajor;
	window.grademajor = grademajor;
});
