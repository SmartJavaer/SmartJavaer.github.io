/**
 * Created by Mr.zhao on 2016/11/25.
 */
var w_h = $(window).height(), w_w = $(window).width();
var QYNewTabInvisibleVersion='2017.01.04';
var QYConfig = {
    searchType:'html',
    searchIcon:'bdIco',
    searchEngine: 'baidu',
    searchArry:[{name:'html',ico:'bdIco',engine:'baidu'},{name:'video',ico:'qyIco',engine:'video_qy'},{name:'image',ico:'bdIco',engine:'image_baidu'},{name:'shop',ico:'tbIco',engine:'shop_taobao'},{name:'com',ico:'wbIco',engine:'com_weibo'}]
};

var serScrollData=[];
$(function () {
    //新标签页版本验证
    if(store.get('local_QYNewTabInvisibleVersion')){
        if(store.get('local_QYNewTabInvisibleVersion')!=QYNewTabInvisibleVersion){
            store.set('local_QYNewTabInvisibleVersion',QYNewTabInvisibleVersion);
            store.remove('local_QYConfig');
        }
    }else{
        store.set('local_QYNewTabInvisibleVersion',QYNewTabInvisibleVersion);
        store.remove('local_QYConfig');
    }
    //step1:获取最新用户配置数据
    if(store.get('local_QYConfig')){
        QYConfig=store.get('local_QYConfig');
    }
    //屏蔽右键菜单
    $('body').bind('contextmenu', function () {
        return false;
    });
    //自适应
    enableAutoResize();
    loadKeyWords();

    //显示搜索框
    $('#js_setSearch').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('#js_searchBox').removeClass('w_bg').addClass('sear_c');
        $('#js_siteTab,#js_qNavBox,#js_eightBox,#js_conMainWrap,#js_conBoxFir').hide();
    });

    //关键字搜索
    $(document).on('click','.serChangeBarCon ul li a',function(){
        var kws=$(this).text(),kw_url=$(this).attr('href');
        if(kw_url!='' || kw_url.indexOf('http')==-1){
            subSerFrm(kws);
            return false;
        }
    });
    //搜索类型选择
    show_serType(QYConfig.searchType, $('.serDownList'), $(".sgIco"));
    serTab($(".search_tabs"), $('.serDownList'), $(".sgIco"));

    //设置默认搜索状态
    $("#serType_"+QYConfig.searchType).addClass('active');

    //切换搜索方式
    $(".sgIco").click(function (e) {
        e.stopPropagation();
        $('.serDownList').show();
        $(document).click(function () {
            $('#serDownList').hide();
        });
        $('#serDownList').click(function (e) {
            e.stopPropagation()
        })
    });
    //表单提交回车绑定
    $(document).keypress(function(e) {
        // 回车键事件
        if(e.which == 13) {
            var myInput = document.getElementById('gNewSearch');
            if (myInput == document.activeElement) {
                subSerFrm($('#gNewSearch').val())
            }
        }
    });
});
function serTab(tab, b, d) {
    tab.find('a').click(function () {
        var i = $(this).index();
        var cur_serType = $(this).attr('data-type');
        QYConfig.searchType=cur_serType;
        //储存默认配置
        store.set('local_QYConfig',QYConfig);
        //地图跳转
        if (cur_serType == 'map') {
            window.open('http://map.baidu.com');
            return false;
        }
        $(".search_tabs a").removeClass('active');
        $("#serType_"+cur_serType).addClass('active');
        $("#js_serTabs a").eq(i).addClass('active');
        //更新滚动信息
        $.each(MainConDataArry.serScrollData, function (i, o) {
            if (o.name == cur_serType) {
                $('.serChangeBarCon').html('<div class="hots"><ul id="js_rollTxt"></ul></div><div class="ref"><a id="js_serChange" href="javascript:;">换一换</a></div>');
                rollList_Txt(o.list);
                searchwdChange('js_serChange', 'js_rollTxt');
            }
        });
        show_serType(cur_serType, b, d);
        $('.serDownList').hide();
    });
}

//滚动列表
function rollList_Txt(datas) {
    var list_str = '', cur_list = datas;
    $.each(cur_list, function (j, obj) {
        if (j % 5 == 0 && j == 0) {
            list_str += '<li>';
        } else if (j % 5 == 0) {
            list_str += '</li><li>';
        }
        list_str += '<a href="' + obj.href + '">' + obj.title + '</a>';
        if (j == cur_list.length) {
            str += '</li>';
        }
    });
    $('#js_rollTxt').html(list_str);
}

//填充搜索类型
function show_serType(t, b, d) {
    var str = '';
    if (t == 'html') {
        $('.search').removeClass('t_radius');
    } else {
        $('.search').addClass('t_radius');
    }
    $.each(serFrmTypes, function (i, o) {
        if (o.name == t) {
            $.each(o.types, function (j, f) {
                str += '<li class="' + f.name + '" id="serList_'+ f.engine +'" data-src="' + f.engine + '" data="' + f.name + 'Ico">' + f.txt + '</li>';
            })
        }
    });
    b.html(str);
    serTypeChange(b, d);
    setDefalutSearchArry();
}
function serTypeChange(list, sgIco) {
    list.find("li").click(function (e) {
        e.stopPropagation();
        var index = $(this).index();
        var classVal = $(this).attr("data");
        //获取搜索引擎类型
        var cur_serType = $(this).attr('data-src');
        list.find("li").removeClass('cur');
        $('#serDownList li').eq(index).addClass('cur');
        sgIco.find('span').attr("class", classVal);
        list.hide();
        updateSearchArry(classVal,cur_serType)
    });
}
//提交搜索表单
function subSerFrm(kws) {
    if(!kws){
        kws = $('#gNewSearch').val();
    }
    var serKwUrl='';
    if (kws != '') {
        //ajax 搜索表单提交
        switch (QYConfig.searchEngine) {
            case 'baidu':serKwUrl=searchEngines.baidu.url+kws;break;
            case 'so':serKwUrl=searchEngines.so.url+kws;break;
            case 'sogo':serKwUrl=searchEngines.sogo.url+kws;break;
            case 'bing':serKwUrl=searchEngines.bing.url+kws;break;
            case 'video_qy':serKwUrl=searchEngines.video_qy.url+kws;break;
            case 'video_qq':serKwUrl=searchEngines.video_qq.url+kws;break;
            case 'video_iqiyi':serKwUrl=searchEngines.video_iqiyi.url+kws;break;
            case 'video_youku':serKwUrl=searchEngines.video_youku.url+kws;break;
            case 'video_tudou':serKwUrl=searchEngines.video_tudou.url+kws;break;
            case 'shop_taobao':serKwUrl=searchEngines.shop_taobao.url+kws;break;
            case 'shop_tmall':serKwUrl=searchEngines.shop_tmall.url+kws;break;
            case 'shop_jd':serKwUrl=searchEngines.shop_jd.url+kws;break;
            case 'shop_dangdang':serKwUrl=searchEngines.shop_dangdang.url+kws;break;
            case 'image_baidu':serKwUrl=searchEngines.image_baidu.url+kws;break;
            case 'image_so':serKwUrl=searchEngines.image_so.url+kws;break;
            case 'image_sogo':serKwUrl=searchEngines.image_sogo.url+kws;break;
            case 'image_bing':serKwUrl=searchEngines.image_bing.url+kws;break;
            case 'com_weibo':serKwUrl=searchEngines.com_weibo.url+kws+'?c=spr_sinamkt_buy_srwj1_weibo_t113';break;
            case 'com_zhihu':serKwUrl=searchEngines.com_zhihu.url+kws;break;
            case 'com_douban':serKwUrl=searchEngines.com_douban.url+kws;break;
            case 'com_tieba':serKwUrl=searchEngines.com_tieba.url+kws;break;
        }
        window.open(serKwUrl,'_blank');
    }
    return false;
}

//设置用户默认搜索数据
function setDefalutSearchArry(){
    $.each(QYConfig.searchArry,function(i,o){
        if(o.name==QYConfig.searchType){
            $('.sgIco').find('span').attr('class', o.ico);
            $("#serList_"+ o.engine).addClass('cur');
            QYConfig.searchEngine=o.engine;
        }
    })
}
//更新默认搜索引擎对应数据
function updateSearchArry(c,t){
    QYConfig.searchIcon=c;
    QYConfig.searchEngine = t;
    $.each(QYConfig.searchArry,function(i,o){
        if(o.name==QYConfig.searchType){
            o.ico=c;
            o.engine=t;
            console.log(QYConfig.searchArry)
            //储存默认配置
            store.set('local_QYConfig',QYConfig);
        }
    })
}

//热门标签滚动刷新
function searchwdChange(btn, list) {
    function extractNodes(pNode) {
        if (pNode.nodeType == 3) return null;
        var node, nodes = new Array();
        for (var i = 0; node = pNode.childNodes[i]; i++) {
            if (node.nodeType == 1) nodes.push(node);
        }
        return nodes;
    }

    var obj = document.getElementById(list);
    for (var i = 0; i < 4; i++) {
        obj.appendChild(extractNodes(obj)[i].cloneNode(true));
    }
    var settime1 = 0;
    var t1 = setInterval(rolltxt1, 10);

    function rolltxt1() {
        if (obj.scrollTop % (obj.clientHeight) == 0) {
            settime1 += 1;
            if (settime1 == 650) {
                obj.scrollTop += 1;
                settime1 = 0;
            }
        } else {
            obj.scrollTop += 1;
            if (obj.scrollTop == (obj.scrollHeight - obj.clientHeight)) {
                obj.scrollTop = 0;
            }
        }
        obj.onmouseover = function () {
            clearInterval(t1)
        };
        obj.onmouseout = function () {
            t1 = setInterval(rolltxt1, 10)
        }
    }

    $('#' + btn).click(function (event) {
        event.preventDefault();
        settime1 = 649;
    });
}

//浏览器缩放自适应
function enableAutoResize() {
    var resize = function () {
        var winWidth = window.innerWidth,
            winHeight = window.innerHeight;
        $("#manWrap").width(winWidth);
    };
    window.onresize = function () {
        resize();
    };
    resize();
}

//获取搜索引擎关键字
function loadKeyWords(){
    $.ajax({
        url: 'http://yrapi.iqying.com/api/newTab/GetKeywords',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"KeyWords_json_callback"},
        jsonpCallback: 'KeyWords_json_callback',
        success: function (data) {
            MainConDataArry.serScrollData=data;
            //热门链接滚动
            $.each(MainConDataArry.serScrollData, function (i, o) {
                if (o.name == (QYConfig.searchType||'html')) {
                    rollList_Txt(o.list)
                }
            });
            searchwdChange('js_serChange', 'js_rollTxt');
        }
    })
}
function callback_historyData (data){}
