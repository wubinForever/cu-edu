package com.gtafe.metadata.enumeration.trainplan;

/**
 * 开课计划变更类型（1.增开2.修改3.停开4,空白，默认4空白）
 * @author jing.zhang
 *
 */
public enum StartClassChangeType {
	
	Add(1, "增开"),Modify(1, "修改"),Stop(3, "停开"),Blank(4, "空白");
	
	private final Integer value;
	private final String describe;

	private StartClassChangeType(Integer value, String describe) {
		this.value = value;
		this.describe = describe;
	}
	
	public Integer getValue() {
		return value;
	}
	public String getDescribe() {
		return describe;
	}	
}
