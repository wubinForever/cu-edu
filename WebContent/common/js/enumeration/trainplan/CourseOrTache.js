define(function (require, exports, module) {
	/**
	 * 标识是课程信息还是环节信息
	 */
	var courseOrTache = {
		Course:{ value:1, name:"理论课程" }, 
		Tache: { value:2, name:"实践环节" }
	}
    module.exports = courseOrTache;
});
