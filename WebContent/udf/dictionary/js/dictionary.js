/**
 * 数据字典js
 */
define(function (require, exports, module) {
	var utils = require("basePath/utils");
	var ajaxData = require("basePath/ajaxData");
	var config = require("basePath/config");
	var URL = require("configPath/url.udf");
	var page = require("basePath/page");
	var popup = require("basePath/popup");
	var treeTable = require("basePath/treeTable");
	var common = require("basePath/common");
	var base  =config.base;
	/**
	 * 数据字典管理
	 */
	//模块化
	var dictionary={
		init:function(){
			
			   dictionary.getList();
			   //修改事件
	       	   $(document).on("click", "[name='update']",function(){		
	       		  dictionary.updateDictiony(this); 
		       });
	       	   //新增事件
	       	   $("#addDic").click(function(){
	       		    var lenth = $("input[name='checNormal']:checked").length;
	       		    if(lenth>1){
	       			 popup.warPop("新增只允许勾选一条数据");
	       			 return false;
	       		     }
	       		    var ids = "";
	       		    var dictionaryName="";
	       		    $("input[name='checNormal']:checked").each(function(){
	       		    	 ids =$(this).parents("tr").attr("data-tt-id")
	       		    	 dictionaryName=$(this).attr("dictionaryName");
	       		    })
	       		    dictionary.addDictiony(ids,dictionaryName);
	       	   });
	       	   
	       	   //删除事件
	       	   $("#delete").on("click",function(){
	       		    var dictionaryIdArr = [];
	       		    var system=false;
	       		     $("input[name='checNormal']:checked").each(function(){

	       		    	 if($(this).attr("issystem")==1)
	       		    	 {
	       		    		 system=true;
	       		    	 }
	       		    	dictionaryIdArr.push($(this).attr("data-tt-id"));
	       		     })
	       		     if(system){	       		    	
	       		    	 popup.warPop("系统项不能删除");
	       		    	 return false;
	       		     }	       		     
	       		     if(utils.isEmpty(dictionaryIdArr)){
	       		    	 popup.warPop("请勾选要删除的数据字典");
	       		    	 return false;
	       		     }
	       		    dictionary.deleteDictionary(dictionaryIdArr); 
	       	   });
	       	   
	       	  //上移事件
	       	   $(document).on("click", "[name='up']",function(){		
	       		
	       		 dictionary.treeTab.up(this, function(tr, tr2){
	    	    	 var currentid = tr2.tr.attr("data-tt-id");
	    	    	 var upId= tr.tr.attr("data-tt-id");
	    	    	 var param ={upId:upId,downId:currentid};
	    	    	 ajaxData.contructor(false);
	    	    	 ajaxData.request(URL.DICTIONARY_DOWN,param,function(data){});
	       			 return true;
	       		 });
		       });
	       	   
	       	  //下移事件 
	       	   $(document).on("click", "[name='down']",function(){		
	       		 dictionary.treeTab.down(this, function(tr, tr2){
	    	    	 var currentid = tr.tr.attr("data-tt-id");
	    	    	 var upId= tr2.tr.attr("data-tt-id");
	    	    	 var param ={upId:upId,downId:currentid};
	    	    	 ajaxData.contructor(false);
	    	    	 ajaxData.request(URL.DICTIONARY_DOWN,param,function(data){});
	       			 return true;
	       		 });
		       });
		},
		
		//修改初始化
		initUpdate:function(){
			
			//初始化code重复验证
			dictionary.addCodeRepeatVerify();
			//初始化名称重复验证
			dictionary.addDataDictionaryNameRepeatVerify();
			var dictionaryId =utils.getUrlParam('dictionaryid');
			var parentId = utils.getUrlParam('parentId');
			var reqData ={dictionaryId:dictionaryId,parentId:parentId};
		    dictionary.addMyAjax(URL.DICTIONARY_DETAIL,reqData);
			
			$("#updateDataDiction").validate({
				rules: {
					code:{
						required : true
					},
					dataDictionaryType:{
						required : true
					},
					dataDictionaryName:{
						required : true
					}
				},
				messages: 
				{
					code:{
						required : '编号不能为空'
					},
					dataDictionaryType:{
						required : '类型不能为空',
					},
					dataDictionaryName:{
						required :'名称不能为空'
					}
					
				},
				errorPlacement : function (error,element) {
					$(element).nextAll("#datad").hide();
					var parent = $(element).parent("div.tips-text").append(error);
				},
				onchange:function(ele){
					$(ele).valid();
				},
				onfocusout:function(ele){
					$(ele).valid();
				}
		   });
			
			  //数据字典名称改变事件
			  $(document).on("change", "#dataDictionaryName",function(){
				  var updateName =$("#upname").val();
				  var dataDictionaryName= $(this).val();
				  var param={dataDictionaryName:dataDictionaryName,parentId:parentId,updateName:updateName};
					ajaxData.contructor(false);
					ajaxData.request(URL.DICTIONARY_DATANAME,param,function(data){
						if(utils.isNotEmpty(data.data.dataNameFlag) && data.data.dataNameFlag=='1'){//数据字典名称唯一性标记
							$("#dataDictionaryName").rules("add",{
								"addDataDictionaryNameRepeatVerify":true,
								messages: {  
									"addDataDictionaryNameRepeatVerify":"名称同级不能重复"
								}
							});	
						}else{
							$("#dataDictionaryName").rules("remove","addDataDictionaryNameRepeatVerify");
						}
					});
			  });
		},
		
		//新增初始化
		initAdd:function(){
			
			//初始化code重复验证
			dictionary.addCodeRepeatVerify();
			//初始化名称重复验证
			dictionary.addDataDictionaryNameRepeatVerify();
			var urlinfo = window.location.href
			var dictionaryName =decodeURI(urlinfo.split("?")[1].split("&")[0].split("=")[1]);
			var parentId = utils.getUrlParam('parentId')==""?"0": utils.getUrlParam('parentId');
			//赋值后续判断改制是否重复
			$("#parentId").val(parentId);
			$("#firstName").text(dictionaryName);
			$("#addDataDiction").validate({
				rules: {
					code:{
						required : true
					},
					dataDictionaryType:{
						required : true
					},
					dataDictionaryName:{
						required : true
					}
				},
				messages: 
				{
					code:{
						required : '编号不能为空'
					},
					dataDictionaryType:{
						required : '类型不能为空'
					},
					dataDictionaryName:{
						required :'名称不能为空'
					}
				},
				errorPlacement : function (error,element) {
					$(element).nextAll("#datad").hide();
					$(element).nextAll("#datacode").hide();
					var parent = $(element).parent("div.tips-text").append(error);
				},
				onchange:function(ele){
					$(ele).valid();
				},
				onfocusout:function(ele){
					$(ele).valid();
				}
		   });
			
		   //数据字典改变事件
		   $(document).on("change", "#dataDictionaryName",function(){
			  
			  var dataDictionaryName= $(this).val();
			  var parentId =$("#parentId").val()==""?"0":$("#parentId").val();
			  var param={dataDictionaryName:dataDictionaryName,parentId:parentId};
				ajaxData.contructor(false);
				ajaxData.request(URL.DICTIONARY_DATANAME,param,function(data){
					if(utils.isNotEmpty(data.data.dataNameFlag) && data.data.dataNameFlag=='1'){//数据字典名称唯一性标记
						$("#dataDictionaryName").rules("add",{
							"addDataDictionaryNameRepeatVerify":true,
							messages: {  
								"addDataDictionaryNameRepeatVerify":"名称同级不能重复"
							}
						});	
					}else{
						$("#dataDictionaryName").rules("remove","addDataDictionaryNameRepeatVerify");
					}
				});
			  });
		
			  //code改变事件
			  $(document).on("change", "#code",function(){
				  
				  var code= $(this).val();
				  var parentId =$("#parentId").val()==""?"0":$("#parentId").val();
				  var param={code:code,parentId:parentId};
					ajaxData.contructor(false);
					ajaxData.request(URL.DICTIONARY_DATANAME,param,function(data){
						if(utils.isNotEmpty(data.data.dataCodeFlag) && data.data.dataCodeFlag=='1'){//数据字典编号唯一性标记
							$("#code").rules("add",{
								"addCodeRepeatVerify":true,
								messages: {  
									"addCodeRepeatVerify":"编号同级不能重复"
								}
							});	
						}else{
							$("#code").rules("remove","addCodeRepeatVerify");
						}
					});
			  });
			  
		},
		
		/**
		 * 添加code验证重复
		 */
		addCodeRepeatVerify : function() {
			jQuery.validator.addMethod("addCodeRepeatVerify", function(value,
					element) {
				return false;
			}, "编号同级不能重复");
		},
		/**
		 * 添加名称验证重复
		 */
		addDataDictionaryNameRepeatVerify : function() {
			jQuery.validator.addMethod("addDataDictionaryNameRepeatVerify", function(value,
					element) {
				return false;
			}, "名称同级不能重复");
		},
		
        //详情
		addMyAjax:function(url,reqData){
			ajaxData.request(url,reqData,function(data){
				$("#dataDictionaryName").val(data.data.dataDictionaryName);
				$("#updateName").val(data.data.dataDictionaryName);
				$("#upname").val(data.data.dataDictionaryName);
				$("#description").val(data.data.description);
				$("#code").val(data.data.code);
				$("#dataDictionaryType").val(data.data.dataDictionaryType);
				if(data.data.isEnabled ==1){
					$("#start").attr("checked",true).parent().parent().addClass("on-radio");
				}else{
					$("#forbid").attr("checked",true).parent().parent().addClass("on-radio");
				}
				if(utils.isNotEmpty(data.data.firstName)){
					$("#firstName").text(data.data.firstName);
				}
			});
		},
		
		//获取列表数据
		getList:function(){
			 dictionary.treeTab = new treeTable({
			 	id : "treeTable",		//容器编号
				url:URL.DICTIONARY_GETLISTBYPARENTID, //请求地址
				param:{parentId:0},	
			    owerId:'dataDictionaryId',
			    parentId:'parentId',
				columns:[
				       {columnName:"",className:"width03",keyName:'checkbox',checkbox:[{name:'data-tt-id',value:'dataDictionaryId'},{name:'dictionaryname',value:'dataDictionaryName'},{name:'issystem',value:'isSystem'}]},
				       {columnName:"名称",className:"width25 text-l",keyName:'dataDictionaryName',isopen:true},
				       {columnName:"编号",className:"width25 text-l",keyName:'code'},
				       {columnName:"类型",className:"width10",keyName:"dataDictionaryType",enum:[{name:'国标',value:'1'},{name:'省标',value:'2'},{name:'市标',value:'3'},{name:'校标',value:'4'},{name:'其他',value:'5'}]},
				       {columnName:"是否系统项",className:"width10",keyName:"isSystem",enum:[{name:"系统级别",value:"1"},{name:"用户级别", value:"0"}]},
				       {columnName:"是否启用",className:"width10",keyName:"isEnabled",enum:[{name:"启用",value:"1"},{name:"禁用", value:"2"}]},
				       {columnName:"操作",className:"width120",keyName:'button',button:[{name:"update",value:"修改",elem:'isSystem',enum:[{name:"disabled",value:"1"},{name:"", value:"0"}]},{name:"up",value:"上移"},{name:"down",value:"下移"}]}
				      ]
			 });
			 dictionary.treeTab.init();
		},
		
		//获取树列表
	    commonAjax:function(url,reqData){
	    	ajaxData.contructor(false);
			ajaxData.request(url,reqData,function(data){
				  var result = data.data;
				  var dtype;
				  for(var i=0,len=result.length;i<len;i++){
				  	 dtype = result[i].dataDictionaryType;
                     switch(dtype){
                     	case 1:
                     	     dtype = "国标";
                     	     break;
                     	case 2:
                     	     dtype = "省标";
                     	     break;
                     	case 3:
                     	     dtype = "市标";
                     	     break;
                     	case 4:
                     	     dtype = "校标";
                     	     break;
                         default:
                             dtype = "其他";

                     }
				  	 $("#treeTable").append('<tr>'
				  	 	 +'<td class="width03"><div class="checkbox-con"><input type="checkbox" id="Checkbox" value="" data-tt-id="'+result[i].dataDictionaryId+ '"  issystem='+result[i].issystem+' name="checNormal"  dictionaryName='+result[i].dataDictionaryName
                              +'></div></td><td class="width35">'+result[i].dataDictionaryType+'</td>'
                         +'<td class="width10 text-l">'+result[i].code+'</td>'
                         +'<td class="width10">'+result[i].dataDictionaryType+'</td>'
                         +'<td class="width10">'+result[i].isSystem+'</td>'
                         +'<td class="width10">'+result[i].isEnabled+'</td>'
                         +'<td class="width120">'
                         +'<button type="button"  name="update"class="btn-text disabled" disabled>修改</button>'
                         +'<button type="button" class="btn-text disabled" disabled="disabled"  name="up" >上移</button>'
				         +'<button type="button" class="btn-text disabled" disabled="disabled"  name="down">下移</button>'
                         +'</tr>')
				  }
				 
			});
	    },
	    
	    //修改
	    updateDictiony:function(obj){
	 		  var dictionaryid=$(obj).parents("tr").attr("data-tt-id");
	 		  var parentId =$(obj).parents("tr").attr("data-tt-parent-id");
	 		 popup.open('./udf/dictionary/html/edit.html?dictionaryid='+dictionaryid+"&parentId="+parentId, //这里是页面的路径地址
	 		   {
					id:'updateDiction',
					title:'修改',
					width:800,
					height:380,	
					cancelVal : '关闭',
					okVal: '保存',
					ok : function() {
						var obj = this.iframe.contentWindow;//弹窗窗体
						var v=obj.$("#updateDataDiction").valid();//验证表单
						if(v){
							var reqData=dictionary.updateParam(obj,dictionaryid,parentId);
						    ajaxData.contructor(false);
							ajaxData.request(URL.DICTIONARY_UPDATE,reqData,function(data){
							   if(data.code==0){
									popup.okPop("修改成功",function(){
									});
									dictionary.treeTab.modifyRow(dictionaryid,data.data);
							   }
							   else{
									popup.errPop("修改失败");
							   }		
							});
						}
					    else{
							return false;
						}				
					},	
					cancel:function(){
					}			
	           });
	      },
	    
	    //新增
	    addDictiony:function(id,dictionName){
	    	var id = id==""?"0":id;
	    	popup.open('./udf/dictionary/html/add.html?dictionaryName='+encodeURI(dictionName)+"&parentId="+id, //这里是页面的路径地址
	 					{
	 						id:'addDiction',
	 						title:'新增',
	 						width:800,
	 						height:380,	
	 						cancelVal : '关闭',
	 						okVal: '保存',
	 						ok : function() {
	 							var obj = this.iframe.contentWindow;
	 							var v=obj.$("#addDataDiction").valid();
	 							if(v){
	 								var reqData=dictionary.addParam(obj,id);
 								    ajaxData.contructor(false);
	 								ajaxData.request(URL.DICTIONARY_ADD,reqData,function(data){
	 								   if(data.code==0){
	 										popup.okPop("新增成功",function(){
	 										});
	 										// treeTable.updateRow($("#tableUpdateWrapper").tmpl(data.data));
	 										dictionary.treeTab.addRow(id,data.data);
	 								   }
	 								   else{
	 										popup.errPop("新增失败");
	 								   }		
	 								});
	 							}
	 						    else{
	 								return false;
	 							}				
	 						},	
	 						cancel:function(){
	 						}			
	 		           });
				
	    },
	    
	    //删除
	    deleteDictionary:function(dictionaryIdArr){	    	
			   var param={ dictionaryIdArr:dictionaryIdArr};
			   popup.askPop("确认删除当前数据字典及其子项吗？",function(){
					ajaxData.contructor(false);
				    ajaxData.request(URL.DICTIONARY_DELETE,param,function(data){
				    	if(data.code==0){
							popup.okPop("删除成功",function(){
							});
							$.each(param.dictionaryIdArr, function(i, id){
								dictionary.treeTab.deleteRow(id);
							})
						}
						else{
							popup.errPop("删除失败");
						}
					});
			   });
	     },
	    
	    //修改组装参数
	    updateParam:function(obj,dictionaryid,parentId){
				var reqData=utils.getQueryParamsByFormObject(obj.$("#updateDataDiction"));//获取查询参数
				reqData.dataDictionaryId=dictionaryid;
				reqData.parentId=parentId;
				reqData.code=obj.$("#code").val();//如果是disabled要手动重新给他赋值
				return reqData;
	    },
	    
	    //增加组装参数
	    addParam:function(obj,id){
	    	    var reqData=utils.getQueryParamsByFormObject(obj.$("#addDataDiction"));//获取查询参数
	    	    reqData.parentId=id;
	        return reqData;
	    }
	    
	}
    module.exports = dictionary;
	window.dictionary = dictionary;
});
