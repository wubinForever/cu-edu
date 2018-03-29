/**
 * treeTable 
 */
define(function (require, exports, module) {
	var ajaxData = require("./ajaxData");
	var config = require("./config");
	var popup = require("./popup");
	var utils = require("./utils");
	/**
	 * 树列表统一操作
	 * 1. 上移
	 * 2. 下移 
	 */
	var treeTable = function(option){
		var opt = {
			id : "treeTable",		//容器id号
			url:'',        //请求地址
			param:{},     //默认请求数据的参数
			columns:[],     //各个列
			owerId:'',    //自身id参数
			parentId:''   //父id名字
		}
	    this.option =  $.extend({}, opt, option);
    }

   treeTable.prototype = {
     	parentIdProp : "data-tt-parent-id",
		idProp:"data-tt-id",
		levelCount:0,
	    init:function(){
	    	this.showList(); //首次加载数据
	    	this.bindExpand();//点击操作
	    	this.createThead(); //创建表头
	    },
	    /*
	      创建表头
	    */
	    createThead:function(){
            var table = $("#"+this.option.id);
            var tr = $("<tr></tr>");
            $.each(this.option.columns, function(i, item){
				th = $("<th></th>");
				if(item.columnName!=""){th.html(item.columnName)};
			    if(item.className){th.addClass(item.className)};
				tr.append(th);	
			});
            table.find("thead").append(tr)
	    },
	    /*
	      首次加载列表
	    */
	    showList:function(param){
	    	var $this = this;
	        $this.loadData();
	    },
       /**
	      点击加载
	   **/
	   clickLoadData:function(param){
 	      var $this = this;
	      var opt = $this.option.param;
	      opt.parentId = $(param).attr('data-tt-id');
		  $this.loadData(param);
       },
       /**
		 * 为左侧按钮绑定展开收缩事件
	  */
	   bindExpand:function(){

	   	 var $this = this;
	   	 $(document).on("click", ".indenter",function(e){	
            e.stopPropagation();
			var _this = $(this),
                parentTr = _this.parents("tr");
			if(!parentTr.attr("load")){
			   $this.clickLoadData(parentTr);
               parentTr.attr("load",'yes').attr("class", "tr-checkbox trDataTT branch expanded").attr("title", "Expand");
			}else{
              if(parentTr.attr("title") == "Expand"){
				//收起需要收起全部
				parentTr.attr("title", "Collapse").attr("class", "tr-checkbox trDataTT branch collapsed");
				var trAll = [];
				$this.getChildRow(parentTr, trAll);
				$(trAll).each(function(i, t){
					$(t).attr("title", "Collapse").attr("class", "tr-checkbox trDataTT branch collapsed").hide();
				});
			  }else{
				parentTr.attr("title", "Expand").attr("class", "tr-checkbox trDataTT branch expanded");
				var trAll = [];
				$this.getChildRow(parentTr, trAll);
				$(trAll).each(function(i, t){
					$(t).attr("title", "Expand").attr("class", "tr-checkbox trDataTT branch expanded").show();
				});
			 }
			}
				
		  });
	   },
	   /**
	      构建数据，生成一个tr
	      data:非必传 点击加载时，传点击tr主键编号
	   **/
	   builtData:function(data){
	   	  var $this = this;
          tr = $("<tr class='tr-checkbox'></tr>");
     	  var isChild ='';
     	  (data.childCount > 0) ? (isChild='collapsed'):(isChild='');
     	  tr.attr('data-tt-id',data[$this.option.owerId]).attr('data-tt-parent-id',data[$this.option.parentId]).addClass(isChild);
     	  $this.levelCount = 0
     	  $this.level(tr);
     	  $.each($this.option.columns, function(j, item){
     	      var keyName = item.keyName;
              if(item.hasOwnProperty("enum")){ //如果是枚举
                 td = $("<td></td>");
                 td.addClass(item.className).attr("name",keyName);
                 $.each(item.enum,function(index,ele){
		              if(ele.value == data[keyName]){
		              	 td.append(ele.name).attr("title",ele.name);
		              }
		          });
     	  	     tr.append(td);
              }else if(item.hasOwnProperty("checkbox")){ //如果是checkbox
                 td = $("<td></td>");
                 td.addClass(item.className)
     	  	     td.append('<div class="checkbox-con"><input type="checkbox" id="Checkbox" name="checNormal"></div>').attr("name",keyName);;
     	  	     $.each(item.checkbox, function(index,ele){
                   td.find("input[type='checkbox']").attr(ele.name,data[ele.value]);
     	  	     })
     	  	     tr.append(td);
              }else if(item.hasOwnProperty("button")){//如果是按钮
              	td = $("<td></td>");
              	td.addClass(item.className).attr("name",keyName);
              	$.each(item.button, function(k, bitem){
              		button = $('<button></button>');
              		if(bitem.elem){
              			var title = bitem.elem,
              		        showcss =(data[title]);
              		    $.each(bitem.enum, function(k, ditem){
                            if(ditem.value == showcss){
				                button.attr("class",ditem.name).prop("disabled",ditem.name);
				            }
              		    })
              		}
              		
 	  	            button.html(bitem.value).attr('name',bitem.name).addClass("btn-text");
 	  	            td.append(button)
              	})
 	  	        tr.append(td);
              }else{
              	 td = $("<td></td>");
                 td.addClass(item.className).attr("name",keyName);
              	 if(item.isopen){      //判断元素中是否有展开按钮
              	 	if((data.childCount > 0)){ //判断构建的元素是否有子节点，控制展开按钮的出现
                       td.append('<span class="indenter"><a href="#">&nbsp;</a></span><span class="name"></span>').find(".name").text(data[keyName]||"");
              	 	}else{
                       td.append('<span class="indenter"></span><span class="name"></span>').find(".name").text(data[keyName]||"");
              	 	}
                    
                    td.attr("title",data[keyName]).find(".indenter").css("padding-left", ($this.levelCount *19) + "px");
              	 }else{
              	 	
                    td.text(data[keyName]||"").attr("title",data[keyName]);
              	 }
     	  	    
     	  	     tr.append(td);
              }
             
 	      })

 	       return tr;
	   },
       /**
	      加载数据
	   **/
       loadData:function(param){
          var $this = this;
	      ajaxData.request($this.option.url, $this.option.param, function(data){
		      if(data.code == config.RSP_SUCCESS){

		      	 var table = $("#"+$this.option.id),
		             result = data.data;
		         for(var i=0,len=result.length;i<len;i++){
		         	 var tr = $this.builtData(result[i]);
	         	    if(param){         //根据param是否存在，判断是第一次还是点击加载
	         	   	  $(param).after(tr);
	         	   	   param = tr;
	         	    }else{
	                   table.find("tbody").append(tr);
	         	   }
		        }
               $this.initUpAndDown();
		    }else{
		    	popup.errPop(data.msg);
		    }
		}, true);

       },
	    /**
	     *修改
	     *id:主键编号
	     *data:返回数据
        */
        modifyRow :function(id,data){
           var $this = this;
           var table = $("#"+this.option.id);
           var tr= $(".treetable tr["+$this.idProp+"='"+id+"']");
           $.each($this.option.columns, function(j, item){
             	var keyName = item.keyName;
	            if(item.hasOwnProperty("enum") && !item.hasOwnProperty("checkbox") && !item.hasOwnProperty("button")){ //如果是枚举
	                 $.each(item.enum,function(index,ele){
			              if(ele.value == data[keyName]){
			              	 tr.find("td[name="+keyName+"]").text(ele.name||"");
			              }
			          });
	             }else{
	             	if(!item.hasOwnProperty("checkbox") && !item.hasOwnProperty("button")){
	             		 if(item.isopen){                   
                            tr.find("td[name="+keyName+"]").find(".name").text(data[keyName]||"");
	                  	 }else{
	                        tr.find("td[name="+keyName+"]").text(data[keyName]||"");
	                  	 }
	             	}
                  	
                 }
             })
            $this.initUpAndDown();

        },
	    /**
		 * 新增
		 * id:主键编号
		 * data:返回数据
		 */
	    addRow :function(id,data){
            var $this = this;
            var table = $("#"+this.option.id);
            var tr = $this.builtData(data); //新增tr构建
    
            //有勾选checkbox
            if(id.length > 1){  //在父节点的增加
            	var afterTr = $(".treetable tr["+$this.idProp+"='"+id+"']"); //选中节点
            	var count = afterTr.find(".indenter a").length;//选中节点是否有子节点
            	if(count<1){ //选中节点没有子节点
            	   afterTr.attr("class", "tr-checkbox trDataTT branch expanded").attr("load",'yes').attr("title", "Expand").find(".indenter").append('<a href="#">&nbsp;</a>');
                   afterTr.after(tr);
                   
            	}else{  //选中节点有子节点
            		if(!afterTr.attr("load")){  //子节点没有展开
            			$this.clickLoadData(afterTr); //先加载展开子节点
            		}else{
            			var afterParentTr = $(".treetable tr["+$this.parentIdProp+"='"+id+"']:last"); //父节点的最后一个子节点
	            	 	afterParentTr.after(tr)
            		}
                   
                   afterTr.attr("class", "tr-checkbox trDataTT branch expanded").attr("load",'yes').attr("title", "Expand");
            	}	 
            }else{
            	//没有勾选checkbox,在表格中增加
                table.append(tr);
            }
            

            $this.initUpAndDown();
	    },
		/**
		 * 删除
		 * 通过主键编号删除本身及子孙元素
		 */
		deleteRow : function(id){
			var $this = this;
			var tr = $(".treetable tr["+$this.idProp+"='"+id+"']:first");
			var len = $(".treetable tr["+$this.parentIdProp+"='"+tr.attr($this.parentIdProp)+"']").size();
			var parentTr = $(".treetable tr["+$this.idProp+"='"+tr.attr($this.parentIdProp)+"']");

			
			var trAll = [];
			trAll.push(tr);
			$this.getChildRow(tr, trAll);
			$(trAll).each(function(i, t){
			   //判断还有没有子项目,移除点击图标
			   if(len<2){
			   	$(".treetable tr["+$this.idProp+"='"+tr.attr($this.parentIdProp)+"']").find(".indenter").html("");
			   }
			   $(t).remove();
	        });

	         $this.initUpAndDown();
	    },
	    /**
		 * 上移下移是否置灰
		 */
	   initUpAndDown : function(){
	   	    var $this = this;
			$(".treetable tr["+$this.parentIdProp+"]").each(function(){
				var tr = $(this);

				var result = $this.checkRow(tr);
				if(result.prevCount == 0){
					//当前级，前面没有元素，不能上移
					tr.find("[name=up]").addClass("disabled").attr("disabled","disabled");
				}else{
					tr.find("[name=up]").removeClass("disabled").removeAttr("disabled");
				}
				if(result.nextCount == 0){
					//当前级，后面没有元素，不能下移
					tr.find("[name=down]").addClass("disabled").attr("disabled","disabled");
				}else{
					tr.find("[name=down]").removeClass("disabled").removeAttr("disabled");
				}
			});
		},

		/**
		 * 判断一行的上下还有没有同级的行
		*/
		checkRow : function(tr){

			var $this = this;
			var parentIdPropName = $this.parentIdProp;
			var parentIdPropValue = tr.attr($this.parentIdProp);

			var result = {};
			    result.prevCount = tr.prevAll('['+parentIdPropName+'="'+parentIdPropValue+'"]').length;
			    result.nextCount = tr.nextAll('['+parentIdPropName+'="'+parentIdPropValue+'"]').length;
			    result.tr = tr;
			return result;
		},
	    /**
		 * 获取当前行是第几层
		 */
		level: function(tr){
			var $this = this;
			var pId = tr.attr($this.parentIdProp);
			var _tr = $(".treetable tr["+$this.idProp+"='"+pId+"']");
			if(_tr.length > 0){
				$this.levelCount ++ ;
				$this.level(_tr);
		   }
	    },
	    /**
	     * 获取子节点
	    */
		getChildRow : function(tr, arr){
			var $this = this;
			$(".treetable tr["+$this.parentIdProp+"='"+tr.attr($this.idProp)+"']").each(function(i, row){
				arr.push(row);
				$this.getChildRow($(row), arr);
			});
		},
		/**
		 * 上移
		 */
		up : function(obj, callback){
			var $this = this;
			var _tr = $(obj).parents("tr"),								//当前行
			_id = _tr.attr($this.idProp),
			_pId = _tr.attr($this.parentIdProp),					
			tr = _tr.prevAll("tr["+$this.parentIdProp+"='"+_pId+"']:first");	//同一级别的前一行
			/*当无法上移时中断操作*/
			if(tr.length == 0)return false;
			
			/*获取当前行及子孙行*/
			var trAll = [];
			$this.getChildRow(_tr, trAll);
			/*先将自己这行插入到上一个同级的行之前*/
			$(_tr).insertBefore(tr);
			/*再将本行的子孙行插入到本行下*/
			$(trAll).insertAfter(_tr);
			if(callback != undefined){
				var result = callback($this.checkRow(_tr), $this.checkRow(tr));
				if(!result){
					$this.down(obj)
				}
				
			}
			$this.initUpAndDown();
		},
		/**
		 * 下移
		 */
		down: function(obj, callback){
			var $this = this;
			var _tr = $(obj).parents("tr"),								//当前行
			_id = _tr.attr($this.idProp),
			_pId = _tr.attr($this.parentIdProp),					
			tr = _tr.nextAll("tr["+$this.parentIdProp+"='"+_pId+"']:first");	//同一级别的下一行
			/*当无法下移时中断操作*/
			if(tr.length == 0)return false;
			
			/*获取下行及子孙行*/
			var trAll = [];
			$this.getChildRow(tr, trAll);
			/*先将下行插入到本行之前*/
			$(tr).insertBefore(_tr);
			/*再将本行的子孙行插入到本行下*/
			$(trAll).insertAfter(tr);
			if(callback != undefined){
				var result = callback($this.checkRow(_tr), $this.checkRow(tr));
				if(!result){
					this.up(obj)
				}	
			}
			$this.initUpAndDown();
			
		}
	};
	module.exports = treeTable;
});
