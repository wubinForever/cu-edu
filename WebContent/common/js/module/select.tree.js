/**
 * 原生select下拉框树
 * 
 */
define(function(require, exports, module) {
	var ajaxData = require("../utils/ajaxData");
	var utils = require("../utils/utils");
	/**
	 * 通用下拉框操作
	 */
	var treeSelect = {
		/**
		 * 加载树
		 */
		loadTree : function(option) {			
			var _options = {
					idTree : "", // 树Id
					id : "", // 下拉数据隐藏Id
					name : "", // 下拉数据显示name值
					code : "", // 下拉数据隐藏code值（数据字典）
					url : "", // 下拉数据获取路径
					param : {}, // 数据字典 parentCode
					defaultValue : "", // 默认值（修改时显示值）
					parentSelected : false, // 是否可以选择父节点的值
					onclick : function() {
					} // 选择之后的事件
				}
			
			_options = $.extend({}, _options, option);
			if(utils.isEmpty(_options.idTree) || utils.isEmpty(_options.name) || utils.isEmpty(_options.url)){
				return false;
			}

			var idTreeObj = $("#" + _options.idTree);
			var idObj = $("#" + _options.id);
			var nameObj = $("#" + _options.name);
			var codeObj = $("#" + _options.code);
			var url = _options.url;
			var parentSelected = _options.parentSelected;
			var param = _options.param;
			var defaultValue = _options.defaultValue;
			
			var container = idTreeObj.parent();
			if(container.hasClass('need-clear') && $('.clear', container).length === 0){
				container.append('<i class="fa fa-times clean-up clear"></i>');
				container.on('click', '.clear', function(){ 
					idObj.val('');
					nameObj.val('');
					codeObj.val('');
					$('.curSelectedNode', idTreeObj).removeClass("curSelectedNode");
				})
			}

			// 点击任何地方隐藏权限码
			$(document).click(function() {
				idTreeObj.hide();
			});
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			nameObj.click(function(event) {
				event.stopPropagation();
			});

			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			idTreeObj.click(function(event) {
				event.stopPropagation();
			});
			// 加载权限码树结构
			ajaxData.request(url, param, function(data) {
				// 树控件初始化------------------------------------
				var setting = {
					view : {
						showLine : false,
						nameIsHTML : false
					},
					data : {
						simpleData : {
							enable : true,
							idKey : "id",
							pIdKey : "pId",
							rootPId : "0"
						},
						key : {
							title : "name",
							name : "name"

						}
					},
					callback : {
						onDblClick : function(event, treeId, treeNode) {
						},
						onClick : function(event, treeId, treeNode) {
							if (treeNode.count == 0 || parentSelected) {
								idTreeObj.hide();
								nameObj.val(treeNode.name);
								idObj.val(treeNode.id);
								codeObj.val(treeNode.code);
								idObj.next().remove();
							}
						}
					}
				};
				$.fn.zTree.init(idTreeObj, setting, data.data);

				// 修改的时候显示数据
				if (utils.isNotEmpty(defaultValue)) {
					var treeObj = $.fn.zTree.getZTreeObj(_options.idTree);
					if (utils.isEmpty(_options.id)) {

						var node = treeObj.getNodeByParam("code", defaultValue, null);// 根据节点数据的属性(code)获取条件完全匹配的节点数据
						if (node != null) {
							treeObj.selectNode(node, false);
							codeObj.val(node.code);
							nameObj.val(node.name);
						}
					} else {
						var node = treeObj.getNodeByParam("id", defaultValue, null);// 根据节点数据的属性(id)获取条件完全匹配的节点数据
						if (node != null) {
							treeObj.selectNode(node, false);
							idObj.val(node.id);
							nameObj.val(node.name);
						}
					}
				}

			});
			// 权限码输入框点击事件
			nameObj.on("click", function() {
				idTreeObj.show().addClass("toggle-ul");
			});
		}
	}
	module.exports = treeSelect;
});
