 define(function (require, exports, module) {

/**
 * 学分要求类别(0-专业必修，1-专业任选，2-专业限选， 3-公共必修， 4-公共任选， 5-公共限选， 6-实践环节)
 * @author 崔家骝
 *
 */
var CreditType = {
		a : {
			 value : 0,
			 name : "专业必修"
		},
		b : {
			 value : 1,
			 name : "专业任选"
		},
		c : {
			 value : 2,
			 name : "专业限选"
		},
		d : {
			 value : 3,
			 name : "公共必修"
		},
		e : {
			 value : 4,
			 name : "公共任选"
		},
		f : {
			 value : 5,
			 name : "公共限选"
		},
		g : {
			 value : 6,
			 name : "实践环节"
		}
}
module.exports = CreditType;
});