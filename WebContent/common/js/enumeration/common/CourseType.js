 define(function (require, exports, module) {

/**
 * 课程类别
 * @author jing.zhang
 *
 */
	
	 var CourseType = {
			 PublicCourse : {
				 value : "01",
				 describe : "公共课"
			 },
			 SpecializedCourse : {
				 value : "02",
				 describe : "专业课"
			 },
			 PublicBasicCourse : {
				 value : "03",
				 describe : "公共基础课"
			 },
			 ProfessionalBasicCourses : {
				 value : "04",
				 describe : "专业基础课"
			 } 
	 }
	 module.exports = CourseType;
});
