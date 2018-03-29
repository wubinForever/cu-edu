/**
 * 左右移动，将左侧的列表选择后添加到右侧的列表中，
 * 也可将右侧列表中的数据移动到左侧
 */
define(function (require, exports, module) {
	var ajaxData = require("./ajaxData");
	var config = require("./config");
	var popup = require("./popup");
	var utils = require("./utils");
	var mapUtil = require("./mapUtil");
	
	var shuffling = function(option){
		/**
		 * 参数
		 */
		var opt = {
			id : "shufflingId",		//容器编号
			left:[],				//左侧列表数据（表头、字段、是否显示、唯一属性（数组中只允许存在一个））
			right:[],				//右侧列表数据，可空，为空时默认与左侧相同， 数据对应的字段必须与后台传值的字段对应。
			url : "",				//列表数据请求的地址
			json: false,
			param:{},				//默认请求数据的参数
			selectData:[],			//左侧的数据
			selectedData:[],		//右侧的数据
			selectedCanRemove:true,	//右侧数据是否可删除
			boxClass:"clearfix double-table-opra", //容器样式
			pullLeftClass:"list-con pull-left",	//左侧样式
			pullRightClass:"list-con pull-right",	//右侧样式
			pullCenterClass:"btn-team",	//中间样式
			addButtonClass:"btn btn-opre btn-block btn-success fa fa-angle-double-right",	//添加按钮样式	
			addButtonText:"添加",	//添加按钮文本
			removeButtonClass:"btn btn-opre btn-block btn-danger fa fa-angle-double-left",	//移除按钮样式
			removeButtonText:"移除",		//移除按钮文本
			checkBoxClass:"width10",	//复选框样式
			checkBoxTag:"right",	//右侧复选框标记，主要用于与左侧复选框命名做区分
			pullLeftHeaderText:"待选择：",	//左侧顶部文本
			pullRightHeaderText:"已选择：",	//右侧顶部文本
			pullHeaderClass:"text-danger"	//顶部文本后接的数字的样式
		}
		this.option =  $.extend({}, opt, option);
	}
	shuffling.prototype = {
			selectMap : new mapUtil(),
			selectedMap : new mapUtil(),
			/**
			 * 初始化
			 */
			init : function(){
				var box = $("#"+this.option.id);
				box.empty();
				box.prop("class", this.option.boxClass);
				box.append(this.createPullLeft()).append(this.createPullCenter()).append(this.createPullRight());
				this.bindLeftHeadData();
				this.bindRightHeadData();
				this.setRightData();
				this.loadData();
				this.bindEvent();
				return this;
			},
			/**
			 * 绑定事件
			 */
			bindEvent : function(){
				utils.checkAllCheckboxes("check-all","checNormal");
				utils.checkAllCheckboxes("check-all"+this.option.checkBoxTag,"checNormal"+this.option.checkBoxTag);
				//添加
				var me = this;
				this.addButton.click(function(){
					me.moveToRight();
				});
				this.removeButton.click(function(){
					me.moveToLeft();
				});
			},
			/**
			 * 从左侧将选中的行追加到右侧
			 * 1. 
			 */
			moveToRight : function(){
				//获取左侧选中的值
				var me = this;
				this.pullLeftTbody.find("input:not([disabled]):checkbox:checked").each(function(i, item){
					var key = $(item).val();
					var value = me.selectMap.get(key);
					me.selectMap.remove(key);
					me.appendTo(value);
					$(item).parents("tr").remove();
					me.selectedMap.put(key, value);
				});
				this.initLeftData();
				this.initRightSequence();
				this.setLeftHeader();
				this.setRightHeader();
				this.checkNoData();
			},
			moveToLeft : function(){
				var me = this;
				this.pullRightTbody.find("input:not([disabled]):checkbox:checked").each(function(i, item){
					var key = $(item).val();
					var value = me.selectedMap.get(key);
					me.selectedMap.remove(key);
					$(item).parents("tr").remove();
					//排序
					me.addToLeftAndSort(value);
				});
				this.initLeftData();
				this.initRightSequence();
				this.setLeftHeader();
				this.setRightHeader();
				this.clearCheckBox();
				this.checkNoData();
			},
			/**
			 * 添加到左侧，判重并排序
			 */
			addToLeftAndSort : function(value){
				var me = this,
					key = value[me.unique];
				var _selectMap = new mapUtil();
				$.each(me.option.selectData, function(i, bean){
					var _key = bean[me.unique];
					if(me.selectMap.containsKey(_key)){
						_selectMap.put(_key, bean);
					}
					
					if(_key == key){
						_selectMap.put(_key, bean);
					}
				});
				me.selectMap = _selectMap;
			},
			/**
			 * 判断无数据
			 */
			checkNoData : function(){
				if(this.pullLeftTbody.find("tr").length > 0){
					this.pullLeftTbody.removeClass("no-data-html");
				}else{
					this.pullLeftTbody.addClass("no-data-html");
				}
				
				if(this.pullRightTbody.find("tr").length > 0){
					this.pullRightTbody.removeClass("no-data-html");
				}else{
					this.pullRightTbody.addClass("no-data-html");
				}
			},
			/**
			 * 将数据追加到对应的容器中
			 */
			appendTo: function(bean){
				var me = this;
				var tr = $("<tr class='tr-checkbox'></tr>");
				var firstTh = $("<td></td>");
				//右侧追加
				firstTh.append(me.createCheckBox(false, me.option.checkBoxTag));
				firstTh.addClass(me.option.checkBoxClass);
				tr.append(firstTh);
				
				var  sequenceTd = $("<td>"+(i+1)+"</td>");
				sequenceTd.addClass(me.option.checkBoxClass);
				tr.append(sequenceTd);
				
				$.each(me.option.right, function(j, item){
					if(item.unique){
						firstTh.find("input:checkbox").val(bean[item.field]);
						if(!item.show){
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
				me.pullRightTbody.append(tr);
				this.clearCheckBox();
				this.checkNoData();
			},
			/**
			 *  初始化右侧序号
			 */
			initRightSequence : function(){
				this.pullRightTbody.find("tr").each(function(i, tr){
					$(tr).find("td:eq(1)").html(i + 1);
				});
			},
			
			/**
			 * 初始化左侧数据
			 */
			initLeftData : function(){
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
					if(key && !me.selectedMap.get(key)){
						me.pullLeftTbody.append(tr);
					}
				});
				this.setLeftHeader();
				this.checkNoData();
			},
			/**
			 * 绑定左侧数据
			 */
			bindLeftHeadData: function(){
				var me = this;
				if(me.option.left.length > 0){
					var tr = $("<tr></tr>");
					var firstTh = $("<th></th>");
					firstTh.append(me.createCheckBox(true));
					firstTh.addClass(me.option.checkBoxClass);
					tr.append(firstTh);
					tr.append($("<th class='"+me.option.checkBoxClass+"'>序号</th>"));
					$.each(this.option.left, function(i, item){
						if(item.show != false){
							th = $("<th></th>");
							th.html(item.name);
							th.addClass(item.widthStyle);
							tr.append(th);
						}
					});
					me.pullLeftThead.append(tr);
					
				}
			},
			/**
			 * 绑定右侧数据
			 */
			bindRightHeadData: function(){
				var me = this;
				if(me.option.right.length == 0){
					me.option.right = me.option.left;
				} 
				if(me.option.right.length > 0){
					var tr = $("<tr></tr>");
					var firstTh = $("<th></th>");
					firstTh.append(me.createCheckBox(true, me.option.checkBoxTag));
					firstTh.addClass(me.option.checkBoxClass);
					tr.append(firstTh);
					tr.append($("<th class='"+me.option.checkBoxClass+"'>序号</th>"));
					$.each(me.option.right, function(i, item){
						if(item.show != false){
							th = $("<th></th>");
							th.html(item.name);
							th.addClass(item.widthStyle);
							tr.append(th);
						}
						
					});
					me.pullRightThead.append(tr);
				}
			},
			/**
			 * 加载数据
			 * @param param
			 */
			loadData : function(param){
				var me = this;
				if(!me.option.url){
					return false;
				}
				var opt = $.extend({}, me.option.param, param);;
				if(me.option.json){
					opt = JSON.stringify(opt);
					ajaxData.setContentType("application/json;charset=utf-8");
				}
				ajaxData.request(me.option.url, opt, function(data){
				    if(data.code == config.RSP_SUCCESS){
				    	if(me.option.param.pageSize){
				    		me.option.selectData = data.data.list;
				    	}else{
				    		me.option.selectData = data.data;
				    	}
				    	me.setLeftData();
				    }else{
				    	popup.errPop(data.msg);
				    }
	    		}, true);
			},
			/**
			 * 设置左侧的数据
			 * @param data
			 */
			setSelectData : function(data){
				var me = this;
				me.option.selectData = data;
				me.setLeftData();
			},
			/**
			 *	设置左侧的数据 
			 */
			setLeftData : function(){
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
						if(key && !me.selectedMap.get(key)){
							selectMap.put(key, bean);
						}
					});
					
				}
				me.selectMap = selectMap;
				me.initLeftData();
				 
			},
			setRightData : function(){
				var me = this;
				var selectedMap = new mapUtil();
				$.each(me.option.selectedData,function(i, bean){
					var tr = $("<tr class='tr-checkbox'></tr>");
					var firstTh = $("<td></td>");
					var flag = true
					if(bean.selectedCanRemove == false || me.option.selectedCanRemove == false){
						flag = false;
					}
					firstTh.append(me.createCheckBox(false, me.option.checkBoxTag, flag));
					firstTh.addClass(me.option.checkBoxClass);
					tr.append(firstTh);
					
					var  sequenceTd = $("<td>"+(i+1)+"</td>");
					sequenceTd.addClass(me.option.checkBoxClass);
					tr.append(sequenceTd);
					$.each(me.option.right, function(j, item){
						if(item.unique){
							firstTh.find("input:checkbox").val(bean[item.field]);
							selectedMap.put(bean[item.field], bean);
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
					me.pullRightTbody.append(tr);
				});
				me.selectedMap = selectedMap;
				me.setRightHeader();
				this.checkNoData();
			},
			clearCheckBox : function(){
				$("#check-all").prop("checked", false).parent().removeClass("on-check");
				$("#check-all"+this.option.checkBoxTag).prop("checked", false).parent().removeClass("on-check");
			},
			/**
			 * 设置左侧头部数量“待选择：xx”
			 */
			setLeftHeader:function(){
				var span = $("<i></i>");
				span.append(this.selectMap.size());
				span.addClass(this.option.pullHeaderClass);
				this.pullLeftHeader.empty()
					.append(this.option.pullLeftHeaderText)
					.append(span);
			},
			/**
			 * 设置右侧头部数量“已选择：xx”
			 */
			setRightHeader:function(){
				var span = $("<i></i>");
				span.append(this.selectedMap.size());
				span.addClass(this.option.pullHeaderClass);
				this.pullRightHeader.empty()
					.append(this.option.pullRightHeaderText)
					.append(span);
			},
			/**
			 * 加载左侧文本
			 */
			createPullLeft : function(){
				var pullLeftDiv = this.createDiv();
				pullLeftDiv.addClass(this.option.pullLeftClass);
				var box = this.createPullTable();
				this.pullLeftThead = box.find("thead");
				this.pullLeftTbody = box.find("tbody");
				this.pullLeftHeader = box.find(".box-header > span");
				pullLeftDiv.append(box);
				return pullLeftDiv;		
			},
			
			/**
			 * 加载中间
			 */
			createPullCenter : function(){
				var centerDiv = this.createDiv();
				centerDiv.addClass(this.option.pullCenterClass);
				var addButton = $("<button></button>");
				addButton.addClass(this.option.addButtonClass);
				addButton.text(this.option.addButtonText);
				this.addButton = addButton;
				var removeButton = $("<button></button>");
				removeButton.addClass(this.option.removeButtonClass);
				removeButton.text(this.option.removeButtonText);
				this.removeButton = removeButton;
				centerDiv.append(addButton);
				centerDiv.append(removeButton);
				return centerDiv;
			},
			/**
			 * 加载左侧文本
			 */
			createPullRight : function(){
				var pullRightDiv = this.createDiv();
				pullRightDiv.addClass(this.option.pullRightClass);
				var box = this.createPullTable();
				this.pullRightThead = box.find("thead");
				this.pullRightTbody = box.find("tbody");
				this.pullRightHeader = box.find(".box-header > span");
				pullRightDiv.append(box);
				return pullRightDiv;
			},
			/**
			 * 初始化列表
			 */
			createPullTable : function(){
				var box = this.createDiv();
				box.addClass("box");
				var boxHeader = this.createDiv();
				boxHeader.addClass("box-header");
				boxHeader.html("<span></span>");
				var boxBody = this.createDiv();
				boxBody.addClass("box-body");
				var scorllBox = this.createDiv();
				scorllBox.addClass("scorll-box");
				var tableBox = this.createDiv();
				tableBox.addClass("table-box");
				var table = $("<table></table>");
				table.addClass("table table-bordered table-hover");
				var thead = $("<thead></thead>");
				var tbody = $("<tbody></tbody>");
				
				table.append(thead).append(tbody);
				tableBox.append(table);
				scorllBox.append(tableBox);
				boxBody.append(scorllBox);
				box.append(boxHeader).append(boxBody);
				return box;
			},
			createCheckBox : function(isAll, tag, active){
				if(!tag){
					tag = "";
				}
				var checkBox = $('<input type="checkbox"  class="checNormal"/>');
				var box = $('<div class="checkbox-con"></div>');
				if(active == false && tag){
					box.addClass("disabled-check");
					checkBox.prop("disabled", true);
				}
				
				if(isAll){
					checkBox.attr("id", "check-all"+tag);
				}else{
					checkBox.attr("name", "checNormal"+tag);
				}
				return box.append(checkBox);
			},
			/**
			 * 创建div
			 * @returns
			 */
			createDiv : function(){
				return $("<div></div>");
			},
			/**
			 * 获取右侧选中的值
			 * @returns
			 */
			getData : function(){
				return this.selectedMap.values();
			}
	}
	module.exports = shuffling;
});