//主屏标示 home:大首页  wall：九宫格
var curSiteObj, siteAddBtn = true, siteEditType = 'add', oldSiteID, lockScroll = false,isFirstPageLoad = true,runing=true, f_h, f_mt,f_tit,videoPager= 1,extPager= 1,gamePager= 1,jokePager= 1,DZPager= 0,siteTabName='个人收藏';
var newTabHtml_resouce={};
var w_h = $(window).height(), w_w = $(window).width();
var isLogin = false,isFirstLoad=true;
//新标签页版本号
var QYNewTabVersion='2017.01.20';
var QYNewTabVersion_resouce='2017.04.08';

//计费链接版本号
var LinkVersion1='2017.04.06';//九宫格
var LinkVersion2='2017.04.06';//个人收藏
var LinkVersion3='2017.04.06';//九宫格-登录
var LinkVersion4='2017.04.06';//个人收藏-登录

var QYNewTab_NewDataAPI=true;
var userLocalData={};
var QYNewTabConfig = {
	mainHome: 'home',// home:大首页   wall：九宫格   search:搜索
	cloud_bz: false,
	cloud_themeData: '',
	cloud_backgroundImg: '',
	cloud_weather_theme:'themeW',
	weather_theme:'themeW',
	//参数说明：透明背景色（顶部工具栏、快捷导航、设置窗口）  快捷导航激活  顶部文字颜色  搜索背景颜色  搜索tab文字颜色  搜索关键字颜色  文字悬停颜色 内容版块主要文字颜色 内容版块次要文字颜色 版块背景色（搜索、内容）搜索关键字区域背景色
	themeData: 'rgba(0,0,0,.3)|rgba(255,255,255,.2)|#fff|#fff|#fff|#fff|#23b4f7|#fff|#ccc|rgba(0,0,0,.3)',
	backgroundImg: 'images/new_bg.jpg',
	startColor: '#c5ced8',
	endColor: '#fff',
	longTapTxt: true,//长按提示
	searchType:'html',
	searchIcon:'bdIco',
	searchEngine: 'baidu',//默认搜索引擎
	searchArry:[{name:'html',ico:'bdIco',engine:'baidu'},{name:'video',ico:'qyIco',engine:'video_qy'},{name:'image',ico:'bdIco',engine:'image_baidu'},{name:'shop',ico:'tbIco',engine:'shop_taobao'},{name:'com',ico:'wbIco',engine:'com_weibo'}],
	curConNum:0//当前内容版块标记
};

function pageLoad(){
	//新标签页版本验证
	if(store.get('local_QYNewTabVersion')){
		if(store.get('local_QYNewTabVersion')!=QYNewTabVersion){
			store.set('local_QYNewTabVersion',QYNewTabVersion);
			clearLocalData();
		}
	}else{
		store.set('local_QYNewTabVersion',QYNewTabVersion);
		clearLocalData();
	}
	if(store.get('local_QYNewTabConfig')){
		QYNewTabConfig=store.get('local_QYNewTabConfig');
	}else{
		store.set('local_QYNewTabConfig',QYNewTabConfig);
	}
	changeTheme();
	setTimeout(function(){
		var style_str='';
		style_str += 'body{transition: all .3s;}';
		style_str += '.searchBox{transition: margin-top .5s ease;}';
		$('#newTab_themeData2').append(style_str);
	},2000);
}
//清空本地数据
function clearLocalData(){
	store.remove('local_QYNewTabConfig');
	store.remove('local_MainConDataArry');
	store.remove('local_MainSiteData');
	store.remove('local_MainSiteMap');
	store.remove('local_contentTypeSort');
	store.remove('local_eightBoxSiteData');
	store.remove('local_eightBoxSortData');
	store.remove('newTabHtml_resouce');
}

pageLoad();
//try{
//	//通知客户端
//	chrome.send("webSiteIsCompleted");
//}catch(e){}

//更改页面风格
function changeTheme(type) {
	if(QYNewTabConfig.themeData==''){
		QYNewTabConfig.themeData='rgba(0,0,0,.3)|rgba(255,255,255,.2)|#fff|#fff|#fff|#fff|#23b4f7|#fff|#ccc|rgba(0,0,0,.3)|rgba(0,0,0,.1)';
	}
	if(type=='cloud'){
		var _themeData = QYNewTabConfig.cloud_themeData.split('|');
	}else{
		var _themeData = QYNewTabConfig.themeData.split('|');
	}

	//参数说明：透明背景色（顶部工具栏、快捷导航、设置窗口）  快捷导航激活  顶部文字颜色  搜索背景颜色  搜索tab文字颜色  搜索关键字颜色  文字悬停颜色 内容版块主要文字颜色 内容版块次要文字颜色 版块背景色（搜索、内容）搜索关键字区域背景色
	var theme_str = '';
	theme_str += '.top_barR ul li.line{border-color: #eee}';
	theme_str += '.site_tab .tab_tit a,.site_tab .tab_tit a.cur{color: ' + _themeData[4] + '}.searchBox a:hover{color:' + _themeData[5] + '}.search{background:' + _themeData[3] + '}.search_tabs a.active,.search_tabs a.active:after{background:' + _themeData[3] + '}';
	theme_str += '.site_tab .tab_tit a.cur{border-color: ' + _themeData[4] + '}';
	theme_str += '.w_bg,.com_infoCon,.Main_home .searchBox{background-color: ' + _themeData[9] + '}';
	theme_str += '.w_bg a,.searchBox a{color: ' + _themeData[5] + '}';
	theme_str += '.bz_wrap,.bz_wrap .btn_bzHide{background-color: ' + _themeData[0] + '}';
	theme_str += '.btn_ts i{border-color: #fff}';
	theme_str += '.top_barR ul li.line{border-color: ' + _themeData[0] +'}';
	theme_str += '.quick_nav .tips{color: ' + _themeData[4] + '}';
	theme_str += '.quick_nav ul li .item{background-color: ' + _themeData[0] + ';color: #fff}';
	theme_str += '.quick_nav ul li:hover .item{background-color: ' + _themeData[0] + '}';
	theme_str += '.quick_nav ul li.active .item{background-color: ' + _themeData[1] + '}';
	theme_str += '.top_barR ul li i{background-color: ' + _themeData[0] + '}';
	theme_str += '.top_barR ul li:hover i,.top_barR ul li.active i{background-color: ' + _themeData[1] + '}';
	theme_str += '.com_infoCon,.com_infoCon a{color: ' + _themeData[7] + '}';
	if(_themeData[10]){
		theme_str += '#js_siteList .item span{color: ' + _themeData[10] + '}';
	}else{
		theme_str += '#js_siteList .item span{color: ' + _themeData[8] + '}';
	}
	theme_str += '.com_infoCon p ,.com_infoCon span,.videoList li p a,.jokeList li p a{color: ' + _themeData[8] + '}';
	theme_str += '.com_infoCon .con_titT span,.com_infoCon .con_titB span{color: ' + _themeData[2] + '}';
	theme_str += '.hotNews .fl .loadmore{color: ' + _themeData[8] + '}';
	theme_str += '.hotNews .fl .loadmore::before, .hotNews .fl .loadmore::after{border-color: ' + _themeData[8] + '}';
	theme_str += '.edit_list .tab_tit a,.edit_list .tab_tit a.cur{color: #333;}';

	$('#newTab_themeData').html(theme_str);
}