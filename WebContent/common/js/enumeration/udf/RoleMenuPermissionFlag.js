define(function(require, exports, module) {
	/**
	 * 角色授权标志
	 * 
	 * @version 2018.01.22
	 * @author zhang.qionglin
	 */
	var roleMenuPermissionFlag = {
		CONSTANT : {
			value : 0,
			name : "不变"
		},
		ADD : {
			value : 1,
			name : "增加"
		},
		DELETE : {
			value : 2,
			name : "删除"
		},
		UPDATE : {
			value : 3,
			name : "修改"
		}
	}
	module.exports = roleMenuPermissionFlag;
});

