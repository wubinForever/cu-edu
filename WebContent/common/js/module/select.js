/**
 * 下拉框公共调用处理类 在界面加入编号，标识是一个需要请求后台的数据即可 操作的节点必须是div
 */
define(function(require, exports, module) {
	var utils=require("../utils/utils");

	function select(option) {
		var opt = {
			defaultValue : "", // 默认值
			param : {}, // 查询参数
			loadData : "", // 加载数据，返回对象数组[{value:"1",name:"1"},{value:"2",name:"2"}]
			dom : "", // div的jquery对象
			disabled : false, // 是否可用
			onclick : function() {
			} // 选择之后的事件
		}
		this.option = $.extend({}, opt, option)
	}
	select.prototype = {
		lis : [],
		data : [],
		init : function() {
			var me = this;
			$(document).click(function(e) {
				if ($(e.target).parents("div.select-text").length == 0) {
					$("div.select-text ul.select-ul").addClass("hide");
					if (me.activeData) {
						me.input.val(me.activeData.html());
					} else {
						if (me.input){
							me.input.val("");
							if (me.option.onclick) {
								me.option.onclick("");
							}
						}
					}
				}
			});
			this.formatHtml(this.option.dom);
			return this;
		},
		/**
		 * 格式化下拉框数据
		 */
		formatHtml : function($dom) {
			// 作用域一定是div上
			if (!$dom.is("div")) {
				return false;
			}
			// 父级元素添加样式
			if (!$dom.hasClass("select-text")) {
				$dom.addClass("select-text");
			}
			// 去除$dom上的编号

			var id = $dom.attr("id"), input = $("<input/>"), span = $("<span></span>"), ul = $("<ul></ul>");

			ul.addClass("select-ul hide");
			input.addClass("form-control inp-com toggle-select");
			span.addClass("pointer");
			$dom.removeAttr("id");
			$dom.empty();

			this.ul = ul;
			this.input = input;
			this.span = span;
			$dom.append(input).append(span).append(ul);

			if (this.option.disabled) {
				input.prop("disabled", true);
			} else {
				this.bindEvent();
			}

			this.loadData();
			this.bindData();
			this.setDefaultValue();
		},
		/**
		 * 设置默认值
		 */
		setDefaultValue : function() {
			var li = this.ul.find("li[tag=\"" + this.option.defaultValue + "\"]");
			li.addClass("active");
			this.activeData = li;
			this.input.val(li.html());
		},
		/**
		 * 绑定事件
		 */
		bindEvent : function() {
			var me = this;
			me.span.click(function() {
				me.ul.toggleClass("hide");
			});

			me.input.focus(function() {
				me.ul.removeClass("hide");
				me.searchByKeyword();
			});

			me.ul.on("click", "li", function() {
				me.choiceLi($(this));
			});

			me.input.keyup(function(e) {
				e = e || window.event;
				me.searchByKeyword(e);
			});

		},
		/**
		 * 加载数据
		 */
		loadData : function() {
			if (this.option.loadData) {
				this.data = this.option.loadData();
			}
		},
		/**
		 * 重新绑定数据
		 * 
		 * @param data
		 */
		reload : function(data, defaultValue) {
			if (data) {
				this.lis = [];
				delete this.activeData;
				this.data = data;
				this.bindData();
				this.option.defaultValue = defaultValue;
				this.setDefaultValue();

			}
		},
		/**
		 * 绑定数据
		 */
		bindData : function() {
			var me = this;
			this.ul.empty();
			$.each(me.data, function(i, item) {
				me.appendOption(item);
			});
		},
		/**
		 * 向select中添加option
		 * 
		 * @param item
		 */
		appendOption : function(item) {
			var li = $("<li></li>");
			li.attr("tag", item.value);
			li.attr("title", item.name);
			li.html(item.name.encodeHTML());//html脚本encode转换
			this.lis.push(li);
			this.ul.append(li);
		},
		/**
		 * 搜索包含输入的字段值
		 * 
		 * @param e
		 */
		searchByKeyword : function(e) {
			var me = this;
			var val = $.trim(me.input.val()).toUpperCase();
			var flag = true;			
			$.each(me.lis, function(i, li) {
				var liHtml = $.trim($(li).html()).toUpperCase();
				if (liHtml.indexOf(val) >= 0) {
					if (liHtml == val) {
						flag = false;
					}
					$(li).show();
				} else {
					$(li).hide();
				}
			});
			if (flag) {
				delete me.activeData;
				$.each(me.lis, function(j, li1) {
					li1.removeClass("active");
				});
			}

		},
		/**
		 * 清空下拉框中的值
		 */
		clearValue : function() {
			delete this.activeData;
			this.input.val("");
			$.each(this.lis, function(i, li) {
				li.show().removeClass("active");
			});
		},
		/**
		 * 点击选中li
		 * 
		 * @param obj
		 */
		choiceLi : function(obj) {
			this.activeData = obj;
			$.each(this.lis, function(i, li) {
				li.removeClass("active");
			});
			obj.addClass("active");			
			this.input.val(obj.html().decodeHTML());//html脚本decode转换
			this.ul.addClass("hide");
			if (this.option.onclick) {
				this.option.onclick(obj.attr("tag"));
			}
		},
		getValue : function() {
			return this.activeData != undefined ? this.activeData.attr("tag") : null;
		}
	}

	module.exports = select;
});
