var BASE_CONFIG={
	hostname:location.hostname,
	protocol:location.protocol,
	port:location.port,
	address:location.pathname
}
// var BASE_URL = "http://127.0.0.1:80";
var pathName=BASE_CONFIG.address;
var projectName =pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
var base = (BASE_CONFIG.hostname=='' || BASE_CONFIG.hostname=='localhost' || BASE_CONFIG.hostname=='127.0.0.1') ? ('http://127.0.0.1:' + BASE_CONFIG.port+ projectName) :(BASE_CONFIG.protocol + '//' + BASE_CONFIG.hostname + ':' + BASE_CONFIG.port + projectName);
//request.setAttribute("ctx",base);
/*function getRootPath() {
    //获取当前网址，如： http://localhost:8088/test/test.jsp
    var curPath = window.document.location.href;
    //获取主机地址之后的目录，如： test/test.jsp
    var pathName = window.document.location.pathname;
    var pos = curPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8088
    var localhostPath = curPath.substring(0, pos);
    //获取带"/"的项目名，如：/test
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    //alert(localhostPath + projectName);
    return (localhostPath + projectName);//发布前用此
}
*/