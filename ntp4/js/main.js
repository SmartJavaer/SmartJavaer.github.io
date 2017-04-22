/**
 * Created by Mr.zhao on 2016/11/25.
 * Edited by Kzidaitou on 2017/03/03
 */
In.ready(function () {
    try{
        //通知客户端
        chrome.send("webSiteIsCompleted");
    }catch(e){}
    $('#manWrap').css('transform', 'translateY(0px)');
    init();
    //屏蔽右键菜单
    $(window).on('mousedown', function (e) {
        if(e.which==3 && e.target.id!="gNewSearch"){
            //关闭
            $("body").attr("oncontextmenu","return false");
        }else{
            //开启
            $("body").removeAttr("oncontextmenu");
        }
    });

    if(!isLogin){
        $('#js_userLogin').click(function () {
            //todo:调用登录接口
            try {
                cef.utility.ExecuteCppFunc("WebShowLoginUI", "", "");
            } catch (e) {
            }
        });
    }
    //显示大首页
    $('#js_setHome,#js_setWall,#js_setSearch').click(function () {
        var cur_type=$(this).data('type');
        if(cur_type=='home'){
            QYNewTabConfig.mainHome = 'home';
            //设置长按提示
            if (!this.longTapTxt) {
                $('#js_qNavBox').addClass('no_tips')
            }
            setTimeout(function(){reload_conPos();},500);
        }else if(cur_type=='wall'){
            QYNewTabConfig.mainHome = 'wall';
        }else{
            QYNewTabConfig.mainHome = 'search';
        }
        $('body').attr('class','Main_'+QYNewTabConfig.mainHome);
        $(this).addClass('active').siblings().removeClass('active');
        //储存默认配置
        store.set('local_QYNewTabConfig',QYNewTabConfig);
        //页面缓存
        pageCatchImg();
        //统计
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=run');
        catcheHtmlResouce();
    });

    //隐藏壁纸设置
    $('.top_barR .ico_set').click(function (event) {
        event.stopPropagation();
        if (!$('#js_bzWrap').hasClass('bz_wrapShow')) {
            newTabClickPV('op=other&p1=click&p2=设置');
            $('#js_bzWrap').addClass('bz_wrapShow').click(function (event) {
                event.stopPropagation();
            });
            $('#js_btnBzHide').click(function () {
                $('#js_bzWrap').removeClass('bz_wrapShow')
            })
            $(document).click(function (event) {
                if($('#js_bzWrap').hasClass('bz_wrapShow')){
                    $("#js_bzWrap").removeClass('bz_wrapShow');
                    //页面缓存
                    pageCatchImg();
                    catcheHtmlResouce();
                }
            });
        } else {
            $('#js_bzWrap').removeClass('bz_wrapShow');
        }
    });

    //壁纸推送
    $('#js_tsBZ').click(function () {
        var cloud = $(this).find('i');
        if (cloud.hasClass('active')) {
            QYNewTabConfig.cloud_bz = false;
            cloud.removeClass('active');
            $('#cloud_link_l').remove();
            $('#backgroundIMG').attr('src',QYNewTabConfig.backgroundImg);
            imgLoad(backgroundIMG, function () {
                //更改页面风格
                changeTheme();
                changeBg(QYNewTabConfig.backgroundImg);
            });
        } else {
            QYNewTabConfig.cloud_bz = true;
            cloud.addClass('active');
            cloud_setBZ();
        }
        //储存默认配置
        store.set('local_QYNewTabConfig',QYNewTabConfig);
    });
    //风车换壁纸
    $('#js_windMill').click(function () {
        var _this=$(this);
        if(_this.attr('data-s')=='open'){
            _this.attr('data-s','close');
            var j=GetRandomNum(0,MainSiteData.bz_data.length-1);
            var k=GetRandomNum(0,MainSiteData.bz_data[j].items.length-1);

            //随机更换壁纸
            var c_bzObj=MainSiteData.bz_data[j].items[k];
            var c_bg = c_bzObj.b_img;

            if(QYNewTabConfig.cloud_bz){
                $('#js_tsBZ').find('i').removeClass('active');
                $('#cloud_link_l').remove();
            }
            //更改默认参数
            QYNewTabConfig.cloud_bz=false;
            QYNewTabConfig.themeData = c_bzObj.themeData;
            QYNewTabConfig.weather_theme = c_bzObj.weather_theme;
            QYNewTabConfig.backgroundImg = c_bzObj.b_img;

            //设置壁纸
            $('#backgroundIMG').attr('src', c_bg);
            $('#js_windMill').addClass('windMill_rotate');
            imgLoad(backgroundIMG, function () {
                //更改页面风格
                changeTheme();
                changeBg(c_bg);
            });
            //统计
            newTabClickPV('op=other&p1=click&p2=一键换壁纸&p3='+c_bg);
        }else{return false}
    });
    $(document).on("webkitAnimationEnd", ".bg-change", function () {
        var e = $(".bg-change"), t = e.css("backgroundImage");
        $('#mainBg img').attr("src",(QYNewTabConfig.cloud_bz ? QYNewTabConfig.cloud_backgroundImg :QYNewTabConfig.backgroundImg)), e.remove();
    });
    $(document).on("webkitAnimationEnd", "#js_windMill", function () {
        $(this).attr('data-s','open').removeClass('windMill_rotate');
        //页面缓存
        pageCatchImg();
        catcheHtmlResouce();
    });
    //搜索类型选择
    show_serType(QYNewTabConfig.searchType, $('.serDownList'), $(".sgIco"));
    serTab($(".search_tabs"), $('.serDownList'), $(".sgIco"));

    //设置默认搜索状态
    //$("#serType_"+QYNewTabConfig.searchType).addClass('active');

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
    if (QYNewTabConfig.searchType == 'html') {
        $('.search').removeClass('t_radius');
    }
    $(document).on('click', '.eightBox .tabEdit', function (e) {
        e.stopPropagation();
        var s = $('#wall_' + $(this).attr('data-id'));
        $('#js_eightBoxList a').removeClass('edit');
        s.addClass('edit');
        curSiteObj = {
            id: $(this).attr('data-id'),
            name: s.find('.tabTitle').html(),
            site: s.attr('href'),
            image: s.attr('data-image')||'images/site/qySite.png',
            bigImage: s.find('img').attr('src') || ''
        };
        $('#js_editIcon img').attr('src', curSiteObj.image);
        $('#js_editTitle').val(curSiteObj.name);
        $('#js_editUrl').val(curSiteObj.site);
        show_editPanel();
        return false
    });

    //常用网址tab切换
    $('.tab_tit a').click(function () {
        var cur_i = $(this).index();
        var parObj = $(this).parents('.site_tab');
        $(this).addClass('cur').siblings().removeClass('cur');
        parObj.find('.tab_con .item').hide().eq(cur_i).show();
    });

    //常用网址右键菜单
    $(document).on('mousedown', '#js_siteTab .tab_con a', function (e) {
        var x = $(this).offset().left + 30;
        var y = $(this).offset().top + 30;
        var contextMenuObj = $('#js_contextMenu2');
        if (e.which === 3) {
            if (!$(this).hasClass('add')) {
                curSiteObj = {
                    id: $(this).attr('data-id'),
                    name: $(this).find('span').html(),
                    site: $(this).attr('href'),
                    image: $(this).find('img').attr('src')||''
                };
            }
            if ($(this).parent('.item').attr('id') == 'js_mySite') {
                contextMenuObj = $('#js_contextMenu1');
                if ($(this).hasClass('add')) {
                    contextMenuObj = $('#js_contextMenu3');
                }
            }
            if ($(this).parent('.item').attr('id') == 'js_collectSite') {
                $('.history-del').show();
            }else{
                $('.history-del').hide();
            }
            if (!$(this).hasClass('selected')) {
                $('.add-to-my-tab').removeClass('disable');
            } else {
                $('.add-to-my-tab').addClass('disable');
            }
            if($('#js_mySite a').length>=17){
                $('.add-to-my-tab').hide();
            }else{
                $('.add-to-my-tab').show();
            }
            $(".context_menu").hide();
            contextMenuObj.css({left: x, top: y}).show().click(function (event) {
                event.stopPropagation();
            });
            $(document).click(function () {
                $('.context_menu').hide();
                $('#js_mySite a').removeClass('edit');
            });
        }
    });
    $(document).on('click', '#js_addSite', function (e) {
        e.stopPropagation();
        show_editPanel();
        siteEditType = 'add';
        //$(this).addClass('edit').siblings().removeClass('edit');
        $('#js_editIcon img').attr('src', 'images/site/qySite.png');
        $('#js_editTitle').val('');
        $('#js_editUrl').val('');
        $('#js_editSave').addClass('disabled')
    });
    //关键字搜索
    $(document).on('click','.serChangeBarCon ul li a',function(){
        var kws=$(this).text(),kw_url=$(this).attr('href');
        if(kw_url!='' || kw_url.indexOf('http')==-1){
            subSerFrm(kws);
            return false;
        }
    });
    //绑定右键事件
    setContextMenu();
    //表单验证
    $('#js_editTitle').keyup(function(){
        var siteTit = $('#js_editTitle').val();
            if(siteTit!=''&&siteTit!=curSiteObj.name){
                $('#js_editSave').removeClass('disabled')
            }
    });
    $('#js_editUrl').keyup(function (event) {
        var isOld = false;
        var curSite = $(this).val();
        var last = event.timeStamp;
        setTimeout(function () {
            if (last - event.timeStamp == 0) {
                if (QYNewTabConfig.mainHome == 'wall') {
                    var Urlreg=/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
                    if(!Urlreg.test(curSite)){
                        $('.edit_tips').html('网址格式错误(网址必须以http://或https://开头)').show();
                        $('#js_editSave').addClass('disabled');
                    }else{
                        $('.edit_tips').html('').show();
                        if(curSite.indexOf(curSiteObj.site||curSiteObj.url) == -1){
                            $('#js_editIcon img').attr('src', 'images/site/qySite.png');
                        }else{
                            $('#js_editIcon img').attr('src', curSiteObj.pic||curSiteObj.image||'images/site/qySite.png');
                        }
                        $('#js_editSave').removeClass('disabled')
                    }
                }else{
                    //if (isOld) {
                        //$('.edit_tips').html('网址已存在').show();
                        $('#js_editSave').removeClass('disabled')
                    //}else{
                        var Urlreg=/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
                        if(!Urlreg.test(curSite)){
                            $('.edit_tips').html('网址格式错误(网址必须以http://或https://开头)').show();
                            $('#js_editSave').addClass('disabled');
                        }else{
                            $('.edit_tips').html('').show();
                            //if(curSite.indexOf(curSiteObj.site||curSiteObj.url) == -1){
                            //    $('#js_editIcon img').attr('src', 'images/site/qySite.png');
                            //}else{
                            //    $('#js_editIcon img').attr('src', curSiteObj.pic||curSiteObj.image||'images/site/qySite.png');
                            //}
                            $('#js_editSave').removeClass('disabled')
                        }
                    //}
                }
            }
        }, 500);
    });
    $('#js_editSave').click(function () {
        if($(this).hasClass('disabled'))return false;
        var isOld = false;
        var siteTit = $('#js_editTitle').val();
        var siteUrl = $('#js_editUrl').val();
        var Urlreg=/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
        if (siteTit == '') {
            $('.edit_tips').html('标题不能为空').show();
            return false;
        } else if (siteUrl == '') {
            $('.edit_tips').html('网址不能为空').show();
            return false;
        }else if(!Urlreg.test(siteUrl)){
            $('.edit_tips').html('网址格式错误(网址必须以http://或https://开头)').show();
            return false;
        }else{}
        try{oldSiteID = curSiteObj.id;}catch (e){}
        if (QYNewTabConfig.mainHome == 'wall') {
            $.each(eightBoxSiteData, function (i, o) {
                if (o.site!='' && siteUrl.indexOf(o.site) > -1) {
                    isOld = true;
                    return false;
                }
            });
            //新增网址
            var newSite = {
                name: siteTit,
                site: siteUrl,
                image: "",
                bigImage: ""
            };
            if(isOld){
                newSite.image=curSiteObj.image;
                newSite.bigImage=curSiteObj.bigImage;
            }
            var editCurSite = $('#js_eightBoxList .edit');
            if (newSite.bigImage == '') {
                editCurSite.find('.default').remove();
                var pNumber = Math.round(Math.random() * 5);
                editCurSite.html('<span class="default Logo' + pNumber + '">' + newSite.name + '</span><div class="itemTab"><span class="tabTitle">' + newSite.name + '</span><span class="tabEdit" data-id="' + oldSiteID + '" title="编辑网址"></span></div>')
            } else {
                editCurSite.find('img').attr('src', newSite.bigImage);
                editCurSite.find('.tabTitle').text(newSite.name);
            }
            editCurSite.attr('data-image', newSite.image);
            editCurSite.attr('href', newSite.site);

            $('#js_editIcon img').attr('src', newSite.image);
            $('#js_editTitle').val(newSite.name);
            $('#js_editUrl').val(newSite.site);
            changeEightBoxData(oldSiteID,newSite);
        } else {
            //新增网址
            var newSite = {
                id: GetRandomNum(200,2000),
                name: siteTit,
                url: siteUrl,
                pic: '',
                b_pic: ''
            };
            if (siteEditType=='edit') {
                newSite.id=curSiteObj.id;
                newSite.pic=curSiteObj.pic||curSiteObj.image;
            }
            var editCurSite = $('#js_mySite .edit');
            if (newSite.pic == '') {
                editCurSite.html('<i>' + newSite.name.charAt(0) + '</i><span>' + newSite.name + '</span>')
            }
            editCurSite.attr('href', newSite.url);
            if (siteEditType=='edit') {
                changeMySite(oldSiteID,newSite);
            }else{
                MainSiteMap.my.data.push(newSite);
                if(isLogin){
                    onChangeUserData();
                }else{
                    store.set('local_MainSiteMap',MainSiteMap);
                }
            }
            reload_mySite();
        }
        $('#js_editPanel .ico_close').click();
    });

    //表单提交回车绑定
    $(document).keypress(function(e) {
        // 回车键事件
        if(e.which == 13) {
            var myInput = document.getElementById('gNewSearch');
            var myInput2 = document.getElementById('js_editUrl');
            if (myInput == document.activeElement) {
                subSerFrm($('#gNewSearch').val())
            }
            if (myInput2 == document.activeElement) {
                $('#js_editSave').click()
            }
        }
    });
    $(document).keydown(function(event){
        if(QYNewTabConfig.mainHome=='home'){
            if(event.keyCode == 38){
                if(QYNewTabConfig.curConNum!=0){
                    QYNewTabConfig.curConNum--;
                    $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
                }
            }else if (event.keyCode == 40){
                if(QYNewTabConfig.curConNum==contentTypeSort.length-1){
                    QYNewTabConfig.curConNum=contentTypeSort.length-1
                }else{
                    QYNewTabConfig.curConNum++;
                    $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();

                }
            }
        }
    });
    $(document).on('click','.con_titT span',function(){
        if(QYNewTabConfig.curConNum!=0){
            QYNewTabConfig.curConNum--;
            $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
        }
    });
    $(document).on('click','.con_titB span',function(){
        QYNewTabConfig.curConNum++;
        $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
    });

    //段子悬停滚动
    var dz_timer,dz_mT= 0,dz_mH= 0,dz_up=true;
    $(document).on('mouseover','#js_conDz',function(){
        var c_parent_h=$('#js_conDz').height();
        var c_h=$('#js_conDzInfo').height();
        if(c_h>c_parent_h){
            dz_mH=c_h-c_parent_h;
            dz_timer=setInterval(function(){
                if(dz_mT>=dz_mH && dz_up){
                    dz_up=false;
                    return false;
                }
                if(dz_mT<=0 && !dz_up){
                    dz_up=true;
                    return false;
                }
                if(dz_mT==0){
                    dz_up=true;
                }
                if(dz_up){
                    $('#js_conDzInfo').css('top',-(dz_mT++));
                }else{
                    $('#js_conDzInfo').css('top',-(dz_mT--));
                }
            },100)
        }
    });
    $(document).on('mouseout','#js_conDz',function(){
        clearTimeout(dz_timer);
        if(dz_mT==dz_mH){
            dz_up=false;
        }
    });

    console.log('页面加载完成');

    setTimeout(function(){
        reload_conPos();
        //监听鼠标滚轮
        $('body').mousewheel(function(event, delta) {
            if(QYNewTabConfig.mainHome!='home'){return false}
            //锁定滚动
            if(lockScroll){
                $('#manWrap').css('transform', 'translateY(-'+conPos[1]+'px)');
            }else{
                //第一屏内容高度
                var first_h=$('#js_conMainWrap').offset().top+20;
                var scorll_t=$(window).scrollTop();
                if(scorll_t>(first_h-w_h)){
                    var $this = $(this),
                        timeoutId = $this.data('timeoutId');
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        runing=false;
                    }
                    $this.data('timeoutId', setTimeout(function() {
                        $this.removeData('timeoutId');
                        $this = null;
                        runing=true;
                    }, 200));
                    if(runing){
                        if(delta==-1){
                            if(QYNewTabConfig.curConNum==(contentTypeSort.length-1)){
                                return false;
                            }
                            //向下翻页
                            QYNewTabConfig.curConNum++;
                            $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
                        }else{
                            if(QYNewTabConfig.curConNum==0){
                                return false;
                            }
                            //向上翻页
                            QYNewTabConfig.curConNum--;
                            $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
                        }
                    }
                }else{
                    if(scorll_t<(conPos[1]-50)){
                        QYNewTabConfig.curConNum=0;
                        $('#js_quickNav li').eq(0).addClass('active').siblings().removeClass('active');
                    }else{
                        QYNewTabConfig.curConNum=1;
                        $('#js_quickNav li').eq(1).addClass('active').siblings().removeClass('active');
                    }
                }
            }
            if($(event.target).attr('id')=='js_touTiao' && QYNewTabConfig.curConNum==1){
                console.log($(event.target).attr('id'))
                lockScroll=true;
                //新闻滚动监听
                $('#newsScroll').scroll(function() {
                    var scrollTop = $(this)[0].scrollTop;
                    var scrollHeight = $(this)[0].scrollHeight;
                    var windowHeight = $('#newsScroll').height();
                    if(scrollTop>500){$('#js_goTop').show();}
                    if(scrollTop==0){$('#js_goTop').hide();}
                    if (scrollTop + windowHeight >= scrollHeight-5) {
                        var $this = $(this),
                            timeoutId = $this.data('timeoutId');
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        $this.data('timeoutId', setTimeout(function() {
                            $this.removeData('timeoutId');
                            $this = null;
                            //加载更多新闻
                            var maxID=$("#js_nlist li:last-child").attr('data-id');
                            load_newsMore('getmore',maxID)
                        }, 200));
                    }
                });
                $('body').unmousewheel();
            }
        });
    },500);
    newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=run');

    //统计事件绑定
    newTabReport();

    //加载统计代码
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= 'http://s11.cnzz.com/z_stat.php?id=1261190421&web_id=1261190421';
    head.appendChild(script);

    //try{
    //    //通知客户端
    //    chrome.send("webSiteIsCompleted");
    //}catch(e){}
    pageCatchImg();
});
function init(){
    //step1:获取最新用户配置数据
    if(store.get('local_contentTypeSort')){
        contentTypeSort=store.get('local_contentTypeSort');
    }
    if(store.get('local_eightBoxSortData')){
        eightBoxSortData=store.get('local_eightBoxSortData');
    }else{
        store.set('local_eightBoxSortData',eightBoxSortData);
    }
    if(store.get('local_eightBoxSiteData')){
        eightBoxSiteData=store.get('local_eightBoxSiteData');
        //计费链接更新-九宫格
        if(store.get('local_linkVersion1')){
            if(store.get('local_linkVersion1')!=LinkVersion1){
                store.set('local_linkVersion1',LinkVersion1);
                updateLink(linkData,eightBoxSiteData);
                store.set('local_eightBoxSiteData',eightBoxSiteData);
            }
        }else{
            store.set('local_linkVersion1',LinkVersion1);
            updateLink(linkData,eightBoxSiteData);
            store.set('local_eightBoxSiteData',eightBoxSiteData);
        }
    }else{
        store.set('local_eightBoxSiteData',eightBoxSiteData);
    }

    //step2:设置主页
    var ctrl_menu = $('.top_barR li');
    ctrl_menu.removeClass('active');
    QYNewTabConfig.curConNum=0;
    $('body').attr('class','Main_'+QYNewTabConfig.mainHome);
    if(QYNewTabConfig.mainHome=='home'){
        $('#js_setHome').addClass('active');
    }else if(QYNewTabConfig.mainHome=='wall'){
        $('#js_setWall').addClass('active');
    }else{
        $('#js_setSearch').addClass('active');
    }

    //step3:设置皮肤、背景
    try{
        chrome.send("IsFristRun",["isFirstRun"]);
    }catch(e){
        $('#mainBg img').attr("src", QYNewTabConfig.backgroundImg);
    }
    //加载天气
    if(QYNewTabConfig.cloud_bz){
        showWeather(QYNewTabConfig.cloud_weather_theme)
    }else{
        showWeather(QYNewTabConfig.weather_theme)
    }


    //设置长按提示
    if (!QYNewTabConfig.longTapTxt) {
        $('#js_qNavBox').addClass('no_tips')
    }


    //$('#backgroundIMG').attr('src', QYNewTabConfig.backgroundImg);
    //imgLoad(backgroundIMG, function (){
    //    setTimeout(function(){
    //        try{
    //            //缓存页面
    //            chrome.send("recordWebsite");
    //        }catch(e){}
    //    },500)
    //});

    //step4:加载数据
    //加载快捷导航
    load_QuickNav();
    bind_QuickNav();
    //获取版块数据
    loadingData();
    //自适应
    enableAutoResize();
}
function loadingData() {
    registerUserInfoChange(); //注册当前用户变化
    getPageData('qyuserinfo'); //获取用户登录信息和活动消息
    if(store.get('local_MainSiteMap')){
        MainSiteMap=store.get('local_MainSiteMap');
        //计费链接更新-个人收藏（未登录）
        if(store.get('local_linkVersion4')){
            if(store.get('local_linkVersion4')!=LinkVersion4){
                store.set('local_linkVersion4',LinkVersion4);
                updateLink2(linkData,MainSiteMap.my.data);
                store.set('local_MainSiteMap',MainSiteMap);
            }
        }else{
            store.set('local_linkVersion4',LinkVersion4);
            updateLink2(linkData,MainSiteMap.my.data);
            store.set('local_MainSiteMap',MainSiteMap);
        }
        //调用常用网址
        try{
            chrome.send("getMostVisitedItems",["callback_historyData"]);
        }catch(e){
            load_siteData();
            load_editPanel();
        }
    }else{
        loadMainSiteMap();
    }
    if(store.get('local_MainSiteData')){
        MainSiteData=store.get('local_MainSiteData');
        var curTimes=curTime(0);
        if(curTimes>store.get('mainSiteDataCatchTime')){
            loadMainSiteData();
        }else{
            load_bgcolors();
            load_bzType();
            load_eigthBoxData();
            load_advData();
        }
    }else{
        loadMainSiteData();
    }
    if(store.get('local_MainConDataArry')){
        MainConDataArry=store.get('local_MainConDataArry');
        //检查内容是否更
        var curTimes=curTime(0);
        //推荐关键字
        if(curTimes>store.get('serScrollDataCatchTime')){
            loadKeyWords();
        }else{
            //热门链接滚动
            $.each(MainConDataArry.serScrollData, function (i, o) {
                if (o.name == (QYNewTabConfig.searchType||'html')) {rollList_Txt(o.list)}
            });
            searchwdChange('js_serChange', 'js_rollTxt');
        }
        //游戏模块
        if(curTimes>store.get('gameCatchTime')){
            loadGameData();
        }else{
            load_hotGame();
            load_bestGame();
        }
        //资讯模块-热门标签
        if(curTimes>store.get('hotNewsCatchTime')){
            loadHotNews();
        }else{
            load_hotNewsData();
        }
        //资讯模块-小图列表
        if(curTimes>store.get('recomImgHotNewsCatchTime')){
            loadRecomImgHotNews();
        }else{
            load_recomImgHotNewsData();
        }
        //资讯模块-图文列表
        if(curTimes>store.get('listNewsCatchTime')){
            loadListNews();
        }else{
            load_listNewsData();
        }
        //资讯模块-热点排行
        if(curTimes>store.get('recomHotNewsCatchTime')){
            loadRecomHotNews();
        }else{
            load_recomHotNewsData();
        }
        //影视模块
        if(curTimes>store.get('videoCatchTime')){
            loadVideo();
        }else{
            load_videoData();
        }
        //影迷圈模块
        if(curTimes>store.get('ymqCatchTime')){
            loadYmq();
        }else{
            load_ymqData();
        }
        //美女图库模块
        if(curTimes>store.get('listGirlsCatchTime')){
            loadListGirls();
        }else{
            load_girlsData();
        }
        //热门活动模块
        if(curTimes>store.get('activityCatchTime')){
            loadActivity();
        }else{
            load_activityData();
        }
        //千影扩展模块
        if(curTimes>store.get('extCatchTime')){
            loadExt();
        }else{
            load_extData();
        }
        //搞笑模块
        if(curTimes>store.get('jokeCatchTime')){
            loadJoke();
        }else{
            load_jokeData();
        }
        //搞笑推荐模块
        if(curTimes>store.get('jokeRecomCatchTime')){
            loadJokeRecom();
        }else{
            load_jokeRecomData();
        }
    }else{
        loadKeyWords();
        //填充版块数据
        loadGameData();

        loadHotNews();
        loadRecomHotNews();
        loadRecomImgHotNews();
        loadListNews();
        load_advData();

        loadListGirls();
        loadActivity();
        loadExt();

        loadVideo();
        loadYmq();

        loadJoke();
        loadJokeRecom();
    }
}

function updateLink(D1,D2){
    $.each(D1,function(i,o){
        for(var j=0;j< o.old_link.length;j++){
            $.each(D2,function(k,l){
                if(l.site==o.old_link[j]){
                    D2[k].site= o.new_link;
                }
            })
        }
    });
}
function updateLink2(D1,D2){
    $.each(D1,function(i,o){
        for(var j=0;j< o.old_link.length;j++){
            $.each(D2,function(k,l){
                if(l.url==o.old_link[j]){
                    D2[k].url= o.new_link;
                }
            })
        }
    });
}
function changeBg(c_bg) {
    var t = c_bg, n = 'url("' + t + '")', i = $(".bg-change"), o = $("#mainBg"), r = $("<div>");
    i.length && (i.remove()), r.css("backgroundImage", n).addClass("bg-change").appendTo(o);
}

function serTab(tab, b, d) {
    tab.find('a').click(function () {
        var i = $(this).index();
        var cur_serType = $(this).attr('data-type');
        QYNewTabConfig.searchType=cur_serType;
        //储存默认配置
        store.set('local_QYNewTabConfig',QYNewTabConfig);
        //地图跳转
        if (cur_serType == 'map') {
            newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=search&p2=map');
            window.open('http://map.baidu.com');
            return false;
        }else{
            newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=search&p2=tab&p3='+$(this).text());
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
            catcheHtmlResouce();
        }
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
    //设置用户默认搜索数据
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
        updateSearchArry(classVal,cur_serType);
        //newTabClickPV({type:'SearchEngine',mainTag:QYNewTabConfig.mainHome,tag:cur_serType,name:$(this).text()})
    });
}
//设置用户默认搜索数据
function setDefalutSearchArry(){
    $.each(QYNewTabConfig.searchArry,function(i,o){
        if(o.name==QYNewTabConfig.searchType){
            $('.sgIco').find('span').attr('class', o.ico);
            $("#serList_"+ o.engine).addClass('cur');
            QYNewTabConfig.searchEngine=o.engine;
        }
    })
}
//更新默认搜索引擎对应数据
function updateSearchArry(c,t){
    QYNewTabConfig.searchIcon=c;
    QYNewTabConfig.searchEngine = t;
    $.each(QYNewTabConfig.searchArry,function(i,o){
        if(o.name==QYNewTabConfig.searchType){
            o.ico=c;
            o.engine=t;
            //储存默认配置
            store.set('local_QYNewTabConfig',QYNewTabConfig);
        }
    })
}
//提交搜索表单
function subSerFrm(kws) {
    var p6= 1,searchStr='';
    if(!kws){
        kws = $('#gNewSearch').val();
        p6=2;
    }
    var serKwUrl='';
    if (kws != '') {
        //ajax 搜索表单提交
        switch (QYNewTabConfig.searchEngine) {
            case 'baidu':serKwUrl=searchEngines.baidu.url+kws;searchStr='&p4=网页&p5=百度';break;
            case 'so':serKwUrl=searchEngines.so.url+kws;searchStr='&p4=网页&p5=360';break;
            case 'sogo':serKwUrl=searchEngines.sogo.url+kws;searchStr='&p4=网页&p5=搜狗';break;
            case 'bing':serKwUrl=searchEngines.bing.url+kws;searchStr='&p4=网页&p5=必应';break;
            case 'video_qy':serKwUrl=searchEngines.video_qy.url+kws;searchStr='&p4=视频&p5=千影';break;
            case 'video_qq':serKwUrl=searchEngines.video_qq.url+kws;searchStr='&p4=视频&p5=qq';break;
            case 'video_iqiyi':serKwUrl=searchEngines.video_iqiyi.url+kws;searchStr='&p4=视频&p5=爱奇艺';break;
            case 'video_youku':serKwUrl=searchEngines.video_youku.url+kws;searchStr='&p4=视频&p5=优酷';break;
            case 'video_tudou':serKwUrl=searchEngines.video_tudou.url+kws;searchStr='&p4=视频&p5=土豆';break;
            case 'shop_taobao':serKwUrl=searchEngines.shop_taobao.url+kws;searchStr='&p4=购物&p5=淘宝';break;
            case 'shop_tmall':serKwUrl=searchEngines.shop_tmall.url+kws;searchStr='&p4=购物&p5=天猫';break;
            case 'shop_jd':serKwUrl=searchEngines.shop_jd.url+kws;searchStr='&p4=购物&p5=京东';break;
            case 'shop_dangdang':serKwUrl=searchEngines.shop_dangdang.url+kws;searchStr='&p4=购物&p5=当当';break;
            case 'image_baidu':serKwUrl=searchEngines.image_baidu.url+kws;searchStr='&p4=图片&p5=百度';break;
            case 'image_so':serKwUrl=searchEngines.image_so.url+kws;searchStr='&p4=图片&p5=360';break;
            case 'image_sogo':serKwUrl=searchEngines.image_sogo.url+kws;searchStr='&p4=图片&p5=搜狗';break;
            case 'image_bing':serKwUrl=searchEngines.image_bing.url+kws;searchStr='&p4=图片&p5=必应';break;
            case 'com_weibo':serKwUrl=searchEngines.com_weibo.url+kws+'?c=spr_sinamkt_buy_srwj1_weibo_t160';searchStr='&p4=社区&p5=微博';break;
            case 'com_zhihu':serKwUrl=searchEngines.com_zhihu.url+kws;searchStr='&p4=社区&p5=知乎';break;
            case 'com_douban':serKwUrl=searchEngines.com_douban.url+kws;searchStr='&p4=社区&p5=豆瓣';break;
            case 'com_tieba':serKwUrl=searchEngines.com_tieba.url+kws;searchStr='&p4=社区&p5=贴吧';break;
        }
        window.open(serKwUrl,'_blank');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=search&p2=click&p3='+kws+searchStr+'&p6='+p6);
    }
    return false;
}

//背景颜色
function load_bgcolors() {
    var str = '';
    $.each(MainSiteData.color_data[0].items, function (i, obj) {
        str += '<li><span style="background-image:url(' + obj.s_img + ')" data-src="' + obj.b_img + '" data-themeName="'+obj.weather_theme+'" data-themeData="' + obj.themeData + '"></span></li>';
    })
    $('#colorList').html(str);
    $('#colorList li').click(function () {
        var _themeData = $(this).find('span').attr('data-themeData');
        var _weather_theme = $(this).find('span').attr('data-themeName');
        //获取背景图片
        var _bg = $(this).find('span').attr('data-src');

        $(this).addClass("act").siblings().removeClass('act');
        $('#js_bz_con a').removeClass('act');
        if(QYNewTabConfig.cloud_bz){
            $('#js_tsBZ').find('i').removeClass('active');
            $('#cloud_link_l').remove();
        }
        //更改默认参数
        QYNewTabConfig.cloud_bz=false;
        QYNewTabConfig.weather_theme=_weather_theme;
        QYNewTabConfig.themeData = _themeData;
        QYNewTabConfig.backgroundImg = _bg;

        $('#backgroundIMG').attr('src', _bg);
        imgLoad(backgroundIMG, function () {
            //更改页面风格
            changeTheme();
            changeBg(_bg);
        });
        //统计
        //newTabClickPV('op=other&p1=click&p2=换背景颜色&p3='+bgColor.split(',')[0]);
    });
}
function load_bzType() {
    var str = '',f_n=0;
    $.each(MainSiteData.bz_data, function (i, obj) {
        if(i==0){f_n=obj.type}
        str += '<a href="javascript:;" id="bz_Tab' + obj.type + '" onclick="show_bzPic(' + obj.type + ','+i+')">' + obj.name + '</a>';
    });
    $('#js_bz_tab').html(str);
    $('#js_bz_tab a').eq(0).addClass('act');
    show_bzPic(f_n,0);
}
function show_bzPic(t,n) {
    $('#js_bz_tab a').removeClass('act');
    $('#bz_Tab' + t).addClass('act');
    var str = '';
    $.each(MainSiteData.bz_data[n].items, function (i, obj) {
        str += '<a href="javascript:;" data-src="' + obj.b_img + '" data-themeName="'+obj.weather_theme+'" data-themeData="' + obj.themeData + '"><img onerror="this.src=\'images/error.png\'" src="' + obj.s_img + '" alt=""></a>';
        if(i>4){return false}
    });
    $('#js_bz_con').html(str);

    //更换壁纸
    $('#js_bz_con a').click(function () {
        //获取皮肤类型
        var _themeData = $(this).attr('data-themeData');
        var _weather_theme = $(this).attr('data-themeName');
        //获取背景图片
        var _bg = $(this).attr('data-src');

        if(QYNewTabConfig.cloud_bz){
            $('#js_tsBZ').find('i').removeClass('active');
            $('#cloud_link_l').remove();
        }
        //更改默认参数
        QYNewTabConfig.cloud_bz=false;
        QYNewTabConfig.weather_theme=_weather_theme;
        QYNewTabConfig.themeData = _themeData;
        QYNewTabConfig.backgroundImg = _bg;

        $('#js_bz_con a').removeClass('act');
        $(this).find('label').remove();
        $(this).append('<label>加载中...</label>');
        $(this).addClass('act load');
        var _this = $(this);
        $('#backgroundIMG').attr('src', _bg);
        imgLoad(backgroundIMG, function () {
            //更改页面风格
            changeTheme();
            _this.removeClass('load');
            changeBg(_bg);
        });
        $("#colorList").find("li").removeClass("act act1");
        $("#colorList").find("li").find("span").html("");
        //统计
        //newTabClickPV('op=other&p1=click&p2=换背景颜色&p3='+_bg);
        return false;
    })
}
function imgLoad(img, callback) {
    var timer = setInterval(function () {
        if (img.complete) {
            callback(img);
            clearInterval(timer)
        }
    }, 50)
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
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=search&p2=click&p3=换一换&p4='+QYNewTabConfig.searchEngine);
    });
}

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
    if(type=='cloud'){
        //更改天气皮肤
        showWeather(QYNewTabConfig.cloud_weather_theme);
    }else{
        //更改天气皮肤
        showWeather(QYNewTabConfig.weather_theme);
        //储存默认配置
        store.set('local_QYNewTabConfig',QYNewTabConfig);
    }
}

//设置云壁纸
function cloud_setBZ() {
    QYNewTabConfig.cloud_weather_theme=MainSiteData.yun_data.weather_theme;
    QYNewTabConfig.cloud_themeData = MainSiteData.yun_data.themeData;
    QYNewTabConfig.cloud_backgroundImg = MainSiteData.yun_data.image_url;

    $('#js_bz_con a').removeClass('act');
    //设置云壁纸
    $('#backgroundIMG').attr('src', MainSiteData.yun_data.image_url);
    imgLoad(backgroundIMG, function () {
        //更改页面风格
        changeTheme('cloud');
        changeBg(MainSiteData.yun_data.image_url);
    });
    //增加云链接
    $('body').append('<a id="cloud_link_l" href="' + MainSiteData.yun_data.link_url + '" target="_blank"></a>');
    cloud_link();
    $(window).resize(function () {
        cloud_link();
    })
}
function cloud_link() {
    var w = $('body').width();
    var a = $('#cloud_link_l');
    var l_w = Math.abs((w - 1020) / 2);
    l_w < 300 ? a.width(l_w) : a.width(300);
}

//加载九宫格数据
function load_eigthBoxData() {
    var site_str = '';
    for (var j = 0; j < eightBoxSortData.length; j++) {
        $.each(eightBoxSiteData, function (k, o) {
            if (o.id == eightBoxSortData[j]) {
                site_str += '<a id="wall_' + o.id + '" class="item" href="' + o.site + '" data-image="' + o.image + '" target="_self">';
                if (o.bigImage == '') {
                    var pNumber = Math.round(Math.random() * 5);
                    site_str += '<span class="default Logo' + pNumber + '">' + o.name + '</span>';
                } else {
                    site_str += '<img src="' + o.bigImage + '">';
                }
                site_str += '<div class="itemTab"><span class="tabTitle">' + o.name + '</span><span class="tabEdit" data-id="' + o.id + '" title="编辑网址"></span></div></a>';
            }
        });
    }
    $('#js_eightBoxList').html(site_str);
    //九宫格排序
    $('#js_eightBoxList').sortable({
        revert: true, items: '.item', /*handle:'.itemTab',*/deactivate: function () {
            //获取最新的九宫格排序
            var newSortWall = $('#js_eightBoxList').sortable('toArray');
            eightBoxSortData = [];
            for (var i = 0; i < newSortWall.length; i++) {
                eightBoxSortData[i] = newSortWall[i].split('_')[1];
            }
            if(isLogin){
                onChangeUserData();
            }else{
                store.set('local_eightBoxSortData',eightBoxSortData);
            }
            //页面缓存
            pageCatchImg();
            catcheHtmlResouce();
        }
    });
}
//快捷导航
function load_QuickNav() {
    var qNav_str = '', qNavObj = $("#js_quickNav");
    //排序（num）
    //var newContentTypeNames = contentTypeNames.sort(
    //    function(a, b){return (a.num - b.num);}
    //);
    for (var j = 0; j < contentTypeSort.length; j++) {
        $.each(contentTypeNames, function (i, o) {
            if (contentTypeSort[j] == o.id) {
                qNav_str += '<li id="qNav_' + o.id + '"><div class="item q_' + o.type + '"><label>' + o.name + '</label><i onclick="del_QuickNav(' + o.id + ')"></i></div></li>';
            }
        });
    }
    qNavObj.html(qNav_str);
    if (contentTypeSort.length < 6) {
        $('#js_addNav').show();
    } else {
        $('#js_addNav').hide();
    }
    $('#qNav_1').addClass('active');
}
function bind_QuickNav() {
    var timeout, qNavObj = $("#js_quickNav");

    qNavObj.click(function (event) {
        event.stopPropagation();
    });
    qNavObj.sortable({
        revert: true, items: 'li:not(#qNav_1)', deactivate: function () {
            //获取最新的排序
            var newSort = qNavObj.sortable('toArray');
            contentTypeSort = [];
            for (var i = 0; i < newSort.length; i++) {
                contentTypeSort[i] = parseInt(newSort[i].split('_')[1]);
            }
            contentTypeSort.unshift(1);
            //重置内容版块
            reSet_conData();
        }
    }).sortable('disable');
    qNavObj.bind("mousedown", function () {
        var _this = $(this);
        timeout = setTimeout(function () {
            _this.addClass('shake');
            qNavObj.sortable('enable');
            QYNewTabConfig.longTapTxt = false;
            //储存默认配置
            store.set('local_QYNewTabConfig',QYNewTabConfig);
        }, 1000);
    });
    qNavObj.bind("mouseup", function () {
        clearTimeout(timeout);
    });
    bind_QuitNavClick();
    $(document).click(function () {
        $('#js_setNavBox').hide();
        if(qNavObj.hasClass('shake')){
            //页面缓存
            pageCatchImg();
            catcheHtmlResouce();
        }
        qNavObj.removeClass('shake').sortable('disable');
    });
    $('#js_setNavBox').click(function (e) {
        e.stopPropagation();
    });
    //显示快捷导航设置弹窗
    load_QuitNavBox();
    $('#js_addNav').click(function (e) {
        e.stopPropagation();
        qNavObj.removeClass('shake');
        $('#js_setNavBox').show()
    });
    //关闭快捷导航设置弹窗
    $('.quick_navBox .ico_close,.quick_navBox .btn_esc').click(function () {
        $('#js_setNavBox').hide();
        catcheHtmlResouce();
    })
}
function bind_QuitNavClick() {
    $("#js_quickNav").find('li').click(function (event) {
        event.stopPropagation();
        if ($("#js_quickNav").hasClass('shake')) {
            return false;
        }
        var curNum = $(this).index();
        QYNewTabConfig.curConNum = curNum;
        $(this).addClass('active').siblings().removeClass('active');
        $('#js_conMainWrap .com_box').removeClass('txtShow');
        $('#newsScroll').css('overflow-y','auto');
        if (QYNewTabConfig.curConNum == 0) {
            $('#newsScroll').css('overflow-y','hidden');
            $('#js_searchBox').addClass('pt-page-rotatePushTop ');
            if(isFirstPageLoad){
                $('#js_conMainWrap').css('margin-top', +f_mt);
                isFirstPageLoad=false;
            }else{
                $('#js_conMainWrap').stop().animate({marginTop:f_mt},700);
            }
            $('#manWrap').css('transform', 'translateY(-' + conPos[QYNewTabConfig.curConNum] + 'px)');
            setTimeout(function () {
                $('#js_searchBox').removeClass('pt-page-rotatePushTop ').css({
                    'transform': 'perspective(800px) rotateX(0deg)',
                    'opacity': 1
                });
            }, 800)
        } else if (QYNewTabConfig.curConNum == 1) {
            $('#js_conMainWrap').stop().animate({marginTop:0},0);
            $('#js_searchBox').addClass('pt-page-rotatePushBottom ');
            $('#manWrap').css('transform', 'translateY(-' + conPos[QYNewTabConfig.curConNum] + 'px)');
            setTimeout(function () {
                $('#js_conMainWrap .com_box').eq(QYNewTabConfig.curConNum - 1).addClass('txtShow')
            }, 500);
            setTimeout(function () {
                $('#js_searchBox').removeClass('pt-page-rotatePushBottom ').css({
                    'transform': 'perspective(800px) rotateX(90deg)',
                    'opacity': 0
                });
            }, 800)
        } else {
            $('#js_conMainWrap').stop().animate({marginTop:0},0);
            setTimeout(function () {
                $('#js_conMainWrap .com_box').eq(QYNewTabConfig.curConNum - 1).addClass('txtShow')
            }, 500);
            $('#manWrap').css('transform', 'translateY(-' + conPos[QYNewTabConfig.curConNum] + 'px)');
        }
    });
}
function load_QuitNavBox() {
    var ico_str = '', className = '';
    $.each(contentTypeNames, function (i, o) {
        if (contentTypeSort.indexOf(o.id) > -1) {
            className = 'q_' + o.type + ' active'
        } else {
            className = 'q_' + o.type;
        }
        ico_str += '<label id="icon_' + o.id + '" onclick="add_QuitNav($(this),' + o.id + ',\'' + o.name + '\',\'' + o.type + '\')" class="' + className + '" title="' + o.name + '"></label>';
    });
    $('#js_qNavIcons').html(ico_str);
    //重置内容版块
    reSet_conData();
    isFirstLoad=false;
}
function add_QuitNav(obj, id, tit, type) {
    if (obj.hasClass('active')) {
        return false
    }
    $(obj).addClass('active');
    $('#js_quickNav').append('<li id="qNav_' + id + '"><div class="item q_' + type + '"><label>' + tit + '</label><i onclick="del_QuickNav(' + id + ')"></i></div></li>');
    contentTypeSort.push(id);
    if (contentTypeSort.length >= 6) {
        $('#js_addNav').hide();
    }

    bind_QuitNavClick();
    //重置内容版块
    reSet_conData();
}
function del_QuickNav(id) {
    var cur_i = parseInt($('#qNav_' + id).index());
    $('#qNav_' + id).remove();
    $('#js_addNav').show();
    var index = contentTypeSort.indexOf(parseInt(id));
    contentTypeSort.splice(index, 1);
    load_QuitNavBox();
    if(QYNewTabConfig.curConNum==cur_i && cur_i==1){$('#js_topBar').click()}
    if (QYNewTabConfig.curConNum >= cur_i) {
        QYNewTabConfig.curConNum--;
    }
    $('#manWrap').css('transform', 'translateY(-' + conPos[QYNewTabConfig.curConNum] + 'px)');
}

//加载网址数据
function load_siteData() {
    var mySite_str = '', historySite_str = '',site_str = '', mySiteArry = [];
    try{
        $.each(MainSiteMap.my.data,function(i,o){
            mySiteArry[i]= o.url;
        });
        //我的搜藏
        mySite_str += '<div class="item" id="js_mySite">';
        $.each(MainSiteMap.my.data, function (k, s) {
            if (s.pic == '') {
                mySite_str += '<a href="' + s.url + '" id="mySite_' + s.id + '" data-id="' + s.id + '" data-isMy=" " target="_self" title="'+ s.name.substr(0,15)+'"><i>' + s.name.charAt(0) + '</i><span>' + s.name + '</span></a>';
            } else {
                mySite_str += '<a href="' + s.url + '" id="mySite_' + s.id + '" data-id="' + s.id + '" data-isMy=" " target="_self" title="'+ s.name.substr(0,15)+'"><img onerror="this.src=\'images/error.png\'" src="' + s.pic + '"><span>' + s.name + '</span></a>';
            }
            if(k>=15){return false}
        });
        mySite_str += '<a id="js_addSite" href="javascript:;" class="add"></a></div>';
        //常用网址
        historySite_str += '<div class="item" id="js_collectSite">';
        $.each(MainSiteMap.collect.data, function (k,s){
            var f = 'selected';
            if (mySiteArry.indexOf(s.url) == -1) {
                f = '';
            }
            if(s.pic=='' || s.pic=='undefined'){
                historySite_str+='<a href="' + s.url + '" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" class="' + f + '" target="_self" title="'+ s.name.substr(0,15)+'"><i style="background: '+randromBgColro[fRandomBy(0,15)]+'">' + s.name.charAt(0) + '</i><span>' + s.name + '</span></a>';
            }else{
                historySite_str += '<a href="' + s.url + '" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" class="' + f + '" target="_self" title="'+ s.name.substr(0,15)+'"><img onerror="this.src=\'images/error.png\'" src="' + s.pic + '"><span>' + s.name + '</span></a>';
            }
            if(k>=15){return false}
        });
        historySite_str += '</div>';
        //分类网址
        $.each(MainSiteMap.other, function (i, o) {
            site_str += '<div class="item">';
            $.each(o.data, function (k, s) {
                var f = 'selected';
                if (mySiteArry.indexOf(s.url) == -1) {
                    f = ''
                }
                site_str += '<a href="' + s.url + '" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" class="' + f + '" target="_self" title="'+ s.name.substr(0,15)+'"><img onerror="this.src=\'images/error.png\'" src="' + s.pic + '"><span>' + s.name + '</span></a>';
                if(k>=15){return false}
            });
            site_str += '</div>';
        });
    }catch (e){}
    $('#js_siteList').html(mySite_str + historySite_str  + site_str);
    if (!siteAddBtn) {
        $('#js_addSite').hide();
        $('.show-add-btn').show();
    } else {
        $('.show-add-btn').hide();
        if(MainSiteMap.my.data.length>=16){$('#js_addSite').hide();return false}
    }
}
//随机数处理
function fRandomBy(under, over){
    switch(arguments.length){
        case 1: return parseInt(Math.random()*under+1);
        case 2: return parseInt(Math.random()*(over-under+1) + under);
        default: return 0;
    }
}
function reload_mySite() {
    var mySite_str = '';
    $.each(MainSiteMap.my.data, function (k, s) {
        if (s.pic == '') {
            mySite_str += '<a href="' + s.url + '" id="mySite_' + s.id + '" data-id="' + s.id + '" data-isMy=" " target="_self" title="'+ s.name.substr(0,15)+'"><i>' + s.name.charAt(0) + '</i><span>' + s.name + '</span></a>';
        } else {
            mySite_str += '<a href="' + s.url + '" id="mySite_' + s.id + '" data-id="' + s.id + '" data-isMy=" " target="_self" title="'+ s.name.substr(0,15)+'"><img onerror="this.src=\'images/error.png\'" src="' + s.pic + '"><span>' + s.name + '</span></a>';
        }
        if(k>=15){return false}
    });
    $('#js_mySite').html(mySite_str).append('<a id="js_addSite" href="javascript:;" class="add"></a>');
    if (!siteAddBtn) {
        $('#js_addSite').hide();
        $('.show-add-btn').show();
    } else {
        $('.show-add-btn').hide();
        if(MainSiteMap.my.data.length>=16){$('#js_addSite').hide();return false}
    }
}
function reload_collectSite() {
    var historySite_str = '';
    $.each(MainSiteMap.collect.data, function (k, s) {
        if(s.pic=='' || s.pic=='undefined'){
            historySite_str+='<a href="' + s.url + '" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" target="_self" title="'+ s.name.substr(0,15)+'"><i>' + s.name.charAt(0) + '</i><span>' + s.name + '</span></a>';
        }else{
            historySite_str += '<a href="' + s.url + '" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" target="_self" title="'+ s.name.substr(0,15)+'"><img onerror="this.src=\'images/error.png\'" src="' + s.pic + '"><span>' + s.name + '</span></a>';
        }
        if(k>=15){return false}
    });

    $('#js_collectSite').html(historySite_str);
}
//重置编辑版本数据
function reload_editSiteData() {
    var site_str = '',historySite_str = '', mySiteArry=[];
    if (QYNewTabConfig.mainHome == 'wall') {
        //九宫格网址编辑
        $.each(eightBoxSiteData,function(i,o){
            mySiteArry[i]= o.site;
        });
    } else {
        $.each(MainSiteMap.my.data,function(i,o){
            mySiteArry[i]= o.url;
        });
    }
    //常用网址
    try{
        historySite_str += '<div class="item" id="js_collectSitePanel">';
        $.each(MainSiteMap.collect.data, function (k, s) {
            var f = 'selected';
            if (mySiteArry.indexOf(s.url) == -1) {
                f = '';
            }
            if(s.pic=='' || s.pic=='undefined'){
                historySite_str+='<a href="' + s.url + '" target="_blank" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" class="' + f + '" title="'+ s.name.substr(0,15)+'"><i style="background: '+randromBgColro[fRandomBy(0,5)]+'">' + s.name.charAt(0) + '</i><span>' + s.name + '</span></a>';
            }else{
                historySite_str += '<a href="' + s.url + '" target="_blank" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" class="' + f + '" title="'+ s.name.substr(0,15)+'"><img onerror="this.src=\'images/error.png\'" src="' + s.pic + '"><span>' + s.name + '</span></a>';
            }
            if(k>=15){return false}
        });
        historySite_str += '</div>';
        //分类网址
        $.each(MainSiteMap.other, function (i, o) {
            site_str += '<div class="item">';
            $.each(o.data, function (k, s) {
                var f = 'selected';
                if (mySiteArry.indexOf(s.url) == -1) {
                    f = ''
                }
                site_str += '<a href="' + s.url + '" target="_blank" id="editSite_' + s.id + '" data-id="' + s.id + '" data-big="' + s.b_pic + '" class="' + f + '" title="'+ s.name.substr(0,15)+'"><img onerror="this.src=\'images/error.png\'" src="' + s.pic + '"><span>' + s.name + '</span></a>';
                if(k>=15){return false}
            });
            site_str += '</div>';
        });
    }catch (e){}

    $('#js_editSiteList').html(historySite_str+site_str);
    $('.edit_list .tab_tit a').eq(0).addClass('cur').siblings().removeClass('cur');
}

//设置右键菜单事件
function setContextMenu() {
    //编辑
    $('.context_menu .edit').click(function () {
        event.stopPropagation();
        $(".context_menu").hide();
        $('#js_mySite a').removeClass('edit');
        $('#mySite_' + curSiteObj.id).addClass('edit');
        show_editPanel();
        $('#js_editIcon img').attr('src', curSiteObj.image||'images/site/qySite.png');
        $('#js_editTitle').val(curSiteObj.name);
        $('#js_editUrl').val(curSiteObj.site);
        //表单类型
        siteEditType = 'edit';
        oldSiteID = curSiteObj.id;
        //$('#js_editSave').removeClass('disabled')
    });
    //删除
    $('.context_menu .del').click(function () {
        event.stopPropagation();
        oldSiteID = curSiteObj.id;
        //重新加载我的收藏数据
        $.each(MainSiteMap.my.data,function(i,o){
            if(o.id==oldSiteID){
                MainSiteMap.my.data.splice(i, 1);
                return false
            }
        });
        $('#site_' + curSiteObj.id).attr('class', '');
        $('#editSite_' + curSiteObj.id).attr('class', '');
        $(".context_menu").hide();

        if(isLogin){
            onChangeUserData();
        }else{
            store.set('local_MainSiteMap',MainSiteMap);
        }
        //重新加载我的收藏数据
        reload_mySite();
        //页面缓存
        pageCatchImg();
    });
    //删除历史记录
    $('.context_menu .history-del').click(function () {
        event.stopPropagation();
        oldSiteID = curSiteObj.id;
        //重新加载我的收藏数据
        $.each(MainSiteMap.collect.data,function(i,o){
            if(o.id==oldSiteID){
                MainSiteMap.collect.data.splice(i, 1);
                return false
            }
        });
        $('#editSite_' + curSiteObj.id).attr('class', '');
        $(".context_menu").hide();
        if(isLogin){
            onChangeUserData();
        }else{
            store.set('local_MainSiteMap',MainSiteMap);
        }
        onChangeUserData();
        //重新加载我的历史记录
        reload_collectSite();
    });
    //打开网页
    $('.context_menu .open-in-new-tab').click(function () {
        event.stopPropagation();
        $(".context_menu").hide();
        window.open(curSiteObj.site);
    });
    //添加到个人收藏
    $('.context_menu .add-to-my-tab').click(function () {
        event.stopPropagation();
        if (!$(this).hasClass('disable')) {
            $('#editSite_' + curSiteObj.id).attr('class', 'selected');
            var newItem={
                id: curSiteObj.id,
                name: curSiteObj.name,
                url: curSiteObj.site,
                pic: curSiteObj.image || '',
                b_pic: ''
            };
            MainSiteMap.my.data.push(newItem);
            if(isLogin){
                onChangeUserData();
            }else{
                store.set('local_MainSiteMap',MainSiteMap);
            }
            //重新加载我的收藏数据
            reload_mySite();
        }
        $(".context_menu").hide();
    });
    //显示添加按钮
    $('.context_menu .show-add-btn').click(function () {
        event.stopPropagation();
        siteAddBtn = true;
        $(".context_menu").hide();
        $('#js_addSite').show();
        $('.show-add-btn').hide()
    });
    //隐藏添加按钮
    $('.context_menu .hide-add-btn').click(function () {
        event.stopPropagation();
        siteAddBtn = false;
        $(".context_menu").hide();
        $('#js_addSite').hide();
        $('.show-add-btn').show()
    });
}
function show_editPanel() {
    var mySiteArry=[];
    if (QYNewTabConfig.mainHome == 'wall') {
        //九宫格网址编辑
        $.each(eightBoxSiteData,function(i,o){
            mySiteArry[i]= o.site;
        });
    } else {
        $.each(MainSiteMap.my.data,function(i,o){
            mySiteArry[i]= o.url;
        });
    }
    $('#js_editSiteList a').removeClass('selected');

    for (var j = 0; j < mySiteArry.length; j++) {
        $('#js_editSiteList a').each(function(){
            if (mySiteArry.indexOf($(this).attr('href')) > -1) {
                $(this).addClass('selected');
            }
        });
    }
    $('.edit_tips').html('');
    $('#js_editPanel').addClass('show_editPanel');
    $('#js_editSave').addClass('disabled');
}
function hide_editPanel(){
    if($('#js_editPanel').hasClass('show_editPanel')){
        $('#js_mySite a,#js_eightBoxList a').removeClass('edit');
        $('#js_editPanel').removeClass('show_editPanel');
        //页面缓存
        pageCatchImg();
        catcheHtmlResouce();
    }
}
//网址编辑面板
function load_editPanel() {
    reload_editSiteData();
    $('#js_editPanel').click(function (event) {
        event.stopPropagation();
    });
    $(document).click(function () {
        $('#js_editPanel .ico_close').click();
    });
    $('#js_editPanel .ico_close').click(function () {
        hide_editPanel();
    });
    $('.edit_list .item a').click(function () {
        event.stopPropagation();
        if ($(this).hasClass('selected')) {
            return false;
        }
        if (siteEditType != 'add') {oldSiteID = curSiteObj.id;}
        //九宫格网址编辑
        if (QYNewTabConfig.mainHome == 'wall') {
            $('.edit_list .item a').removeClass('active');
            $(this).addClass('active');
            oldSiteID = curSiteObj.id;
            curSiteObj = {
                id:oldSiteID,
                name: $(this).find('span').html(),
                site: $(this).attr('href'),
                image: $(this).find('img').attr('src')||'',
                bigImage: $(this).attr('data-big')||''
            };
            var editCurSite = $('#js_eightBoxList .edit');
            if (curSiteObj.bigImage == '') {
                editCurSite.find('.default').remove();
                var pNumber = Math.round(Math.random() * 5);
                editCurSite.html('<span class="default Logo' + pNumber + '">' + curSiteObj.name + '</span><div class="itemTab"><span class="tabTitle">' + curSiteObj.name + '</span><span class="tabEdit" data-id="' + oldSiteID + '" title="编辑网址"></span></div>')
            } else {
                if(editCurSite.find('img').length>0){
                    editCurSite.find('img').attr('src', curSiteObj.bigImage);
                    editCurSite.find('.tabTitle').text(curSiteObj.name);
                }else{
                    editCurSite.html('<img src="'+curSiteObj.bigImage+'"><div class="itemTab"><span class="tabTitle">' + curSiteObj.name + '</span><span class="tabEdit" data-id="' + oldSiteID + '" title="编辑网址"></span></div>')
                }
            }
            editCurSite.attr('data-image', curSiteObj.image);
            editCurSite.attr('href', curSiteObj.site);

            $('#js_editIcon img').attr('src', curSiteObj.image||'images/site/qySite.png');
            $('#js_editTitle').val(curSiteObj.name);
            $('#js_editUrl').val(curSiteObj.site);

            changeEightBoxData(oldSiteID,curSiteObj);
            return false;
        }
        if (siteEditType == 'add') {
            var newItem={
                id: $(this).attr('data-id'),
                name: $(this).find('span').html(),
                url: $(this).attr('href'),
                pic: $(this).find('img').attr('src')||'',
                b_pic: $(this).attr('data-big')||''
            };
            if(MainSiteMap.my.data.length>=16){$('#js_addSite').hide();return false}
            MainSiteMap.my.data.push(newItem);
            $(this).addClass('selected');
            if(isLogin){
                onChangeUserData();
            }else{
                store.set('local_MainSiteMap',MainSiteMap);
            }
            //重新加载我的收藏数据
            reload_mySite();
        } else {
            $('.edit_list .item a').removeClass('active');
            $(this).addClass('active');
            curSiteObj = {
                id: $(this).attr('data-id'),
                name: $(this).find('span').html(),
                url: $(this).attr('href'),
                pic: $(this).find('img').attr('src')||'',
                b_pic: $(this).attr('data-big')||''
            };
            console.log(curSiteObj)
            var editCurSite = $('#js_mySite .edit');
            if(editCurSite.find('img').length>0 && curSiteObj.pic!=''){
                editCurSite.find('img').attr('src', curSiteObj.pic);
                editCurSite.find('span').text(curSiteObj.name);
            }else if(curSiteObj.pic==''){
                editCurSite.html('<i>' + curSiteObj.name.charAt(0) + '</i><span>' + curSiteObj.name + '</span>');
            }else{
                editCurSite.html('<img src="'+curSiteObj.pic+'"><span>'+curSiteObj.name+'</span>')
            }
            editCurSite.attr('href', curSiteObj.url);
            editCurSite.attr('id', 'mySite_' + curSiteObj.id);
            editCurSite.attr('data-id', curSiteObj.id);

            $('#js_editIcon img').attr('src', curSiteObj.pic||'images/site/qySite.png');
            $('#js_editTitle').val(curSiteObj.name);
            $('#js_editUrl').val(curSiteObj.url);

            changeMySite(oldSiteID,curSiteObj)
        }
        return false;
    });
}
//更新我的收藏数据
function changeMySite(oldID,obj){
    $.each(MainSiteMap.my.data,function(i,o){
        if(o.id==oldID){
            o.id=obj.id,
                o.name=obj.name,
                o.url=obj.url,
                o.pic=obj.pic,
                o.b_pic=obj.b_pic
        }
    });
    if(isLogin){
        onChangeUserData();
    }else{
        store.set('local_MainSiteMap',MainSiteMap);
    }
}
//获取最新八宫格数据
function changeEightBoxData(id,obj){
    $.each(eightBoxSiteData,function(i,o){
        if(o.id==id){
            o.name=obj.name;
            o.site=obj.site;
            o.image=obj.image;
            o.bigImage=obj.bigImage;
            return false;
        }
    });
    if(isLogin){
        onChangeUserData();
    }else{
        store.set('local_eightBoxSiteData',eightBoxSiteData);
    }
}

//加载内容版块
function load_conTemp() {
    var con_str = '';
    for (var i = 0; i < contentTypeSort.length; i++) {
        if (i != 0) {
            con_str += '<div class="com_box cf" style="height:' + w_h + 'px">';
            con_str += '<div class="com_infoCon">';
            con_str += '<div class="con_titT"><span>' + getConTit(contentTypeSort[i - 1]) + '<i>&lt</i></span></div>';
            // con_str += '<div id="js_con'+contentTypeSort[i]+'"></div>';
            con_str += get_conData(contentTypeSort[i]);
            if (i < contentTypeSort.length - 1) {
                con_str += '<div class="con_titB"><span>' + getConTit(contentTypeSort[i + 1]) + '<i>&lt</i></span></div>';
            }
            con_str += '</div>';
            con_str += '</div>';
        }
    }
    $('#js_conMainWrap').html(con_str);

    f_tit = $('#js_conMainWrap .com_box').eq(0).find('.com_infoCon').height() + 40;
    f_mt = -((w_h - f_tit) / 2);
    $('#js_conMainWrap').css('margin-top', +f_mt);

    $('#newsScroll').hover(function(){
        if(QYNewTabConfig.curConNum==0){return false;}
        lockScroll=true;
        //新闻滚动监听
        $('#newsScroll').scroll(function() {
            var scrollTop = $(this)[0].scrollTop;
            var scrollHeight = $(this)[0].scrollHeight;
            var windowHeight = $('#newsScroll').height();
            if(scrollTop>500){$('#js_goTop').show();}
            if(scrollTop==0){$('#js_goTop').hide();}
            if (scrollTop + windowHeight >= scrollHeight-5) {
                var $this = $(this),
                    timeoutId = $this.data('timeoutId');
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                $this.data('timeoutId', setTimeout(function() {
                    $this.removeData('timeoutId');
                    $this = null;
                    //加载更多新闻
                    var maxID=$("#js_nlist li:last-child").attr('data-id');
                    load_newsMore('getmore',maxID)
                }, 200));
            }
        });
        $('body').unmousewheel();
    },function(){
        lockScroll=false;
        $('body').mousewheel(function(event, delta) {
            if(QYNewTabConfig.mainHome!='home'){return false}
            //锁定滚动
            if(lockScroll){
                $('#manWrap').css('transform', 'translateY(-'+conPos[1]+'px)');
            }else{
                //第一屏内容高度
                var first_h=$('#js_conMainWrap').offset().top+20;
                var scorll_t=$(window).scrollTop();
                if(scorll_t>(first_h-w_h)){
                    var $this = $(this),
                        timeoutId = $this.data('timeoutId');
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        runing=false;
                    }
                    $this.data('timeoutId', setTimeout(function() {
                        $this.removeData('timeoutId');
                        $this = null;
                        runing=true;
                    }, 200));
                    if(runing){
                        if(delta==-1){
                            if(QYNewTabConfig.curConNum==(contentTypeSort.length-1)){
                                return false;
                            }
                            //向下翻页
                            QYNewTabConfig.curConNum++;
                            $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
                        }else{
                            if(QYNewTabConfig.curConNum==0){
                                return false;
                            }
                            //向上翻页
                            QYNewTabConfig.curConNum--;
                            $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
                        }
                    }
                }else{
                    if(scorll_t<(conPos[1]-50)){
                        QYNewTabConfig.curConNum=0;
                        $('#js_quickNav li').eq(0).addClass('active').siblings().removeClass('active');
                    }else{
                        QYNewTabConfig.curConNum=1;
                        $('#js_quickNav li').eq(1).addClass('active').siblings().removeClass('active');
                    }
                }
            }
        });
    });
}
//获取版块标题
function getConTit(id) {
    var conName = '';
    $.each(contentTypeNames, function (i, o) {
        if (o.id == id) {
            conName = o.name;
            return false
        }
    });
    return conName;
}
//获取版块内容(html)
function get_conData(id) {
    var str = '';
    $.each(contentTypeNames, function (i, o) {
        if (o.id == id) {
            switch (o.type) {
                case 'news':
                    str = load_newsTemp();
                    break;
                case 'video':
                    str = load_videoTemp();
                    break;
                case 'image':
                    str = load_girlsTemp();
                    break;
                case 'game':
                    str = load_gameTemp();
                    break;
                case 'ext':
                    str = load_moreTemp();
                    break;
                case 'joke':
                    str = load_jokeTemp();
                    break;
            }
            return false
        }
    });
    return str;
}
//重置内容版块
function reSet_conData() {
    load_conTemp();
    if(!isFirstLoad){
        //游戏模块
        load_hotGame();
        load_bestGame();
        //资讯模块-热门标签
        load_hotNewsData();
        //资讯模块-小图列表
        load_recomImgHotNewsData();
        //资讯模块-图文列表
        load_listNewsData();
        //资讯模块-热点排行
        load_recomHotNewsData();
        load_advData();
        //影视模块
        load_videoData();
        //影迷圈模块
        load_ymqData();
        //美女图库模块
        load_girlsData();
        //热门活动模块
        load_activityData();
        //千影扩展模块
        load_extData();
        //千影搞笑模块
        load_jokeData();
        //千影搞笑推荐模块
        load_jokeRecomData();
    }

    if (QYNewTabConfig.curConNum != 0) {
        $('#js_conMainWrap').css('margin-top', 0);
        $('#js_conMainWrap .com_box').eq(0).addClass('txtShow')
    }else{
        if($('.com_box').length==0){
            $('#js_conMainWrap').css('margin-top', 0);
        }
        $("#js_quickNav li").eq(0).click();
    }
    store.set('local_contentTypeSort',contentTypeSort);

    catcheHtmlResouce();

    if(w_w>=1280 && w_w!=1366){f_h=540;}else{f_h=505;}
    //获取内容版块坐标
    conPos = [0];
    for (var i = 0; i < (contentTypeSort.length - 1); i++) {
        conPos[i + 1] = (i * w_h) + f_h;
    }
}
//初始化内容版块坐标
function reload_conPos() {
    f_tit = $('#js_conMainWrap .com_box').eq(0).find('.com_infoCon').height() + 40;
    f_mt = -((w_h - f_tit) / 2);
    $('#js_conMainWrap').css('margin-top', +f_mt);
    if(w_w>=1280 && w_w!=1366){f_h=540;}else{f_h=505;}
    //获取内容版块坐标
    conPos = [0];
    for (var i = 0; i < (contentTypeSort.length - 1); i++) {
        conPos[i + 1] = (i * w_h) + f_h;
    }
}
//浏览器缩放自适应
var old_w=w_w;
function enableAutoResize() {
    var resize = function () {
        //快捷导航位置重置
        //var w_w=$(window).width();
        //var w_h=$(window).height();
        //$('body').height(w_h);
        //try{
        //    var c_w=$('.com_infoCon').width();
        //    var q_w=$('#js_qNavBox').width()+70;
        //    if((w_w-c_w)/2>q_w){
        //        $('#js_qNavBox').css('right',((w_w-c_w)/2-q_w)/2)
        //    }
        //}catch (e){}
        //$("#manWrap").width($(window).width());
        f_tit = $('#js_conMainWrap .com_box').eq(0).find('.com_infoCon').height() + 40;
        f_mt = -((w_h - f_tit) / 2);
        $('#js_conMainWrap').css('margin-top', +f_mt);
    };
    window.onresize = function () {
        resize();
    };
    resize();
    $(window).resizeEnd({
        delay : 300
    }, function(){
        w_w = $(window).width();w_h = $(window).height();
        if(old_w!=w_w){
            f_tit = $('#js_conMainWrap .com_box').eq(0).find('.com_infoCon').height() + 40;
            f_mt = -((w_h - f_tit) / 2);
            $('#js_conMainWrap').css('margin-top', +f_mt);
            old_w=w_w;
            if(w_w>=1280 && w_w!=1366){f_h=520;}else{f_h=485;}
        }else{
            f_tit = $('#js_conMainWrap .com_box').eq(0).find('.com_infoCon').height() + 40;
            f_mt = -((w_h - f_tit) / 2);
            $('#js_conMainWrap').css('margin-top', +f_mt);
        }
        $('#js_conMainWrap .com_box').height(w_h);
        //获取内容版块坐标
        conPos = [0];
        for (var i = 0; i < (contentTypeSort.length - 1); i++) {
            conPos[i + 1] = (i * w_h) + f_h;
        }
        $("#js_quickNav li").eq(QYNewTabConfig.curConNum).click();
        if(QYNewTabConfig.mainHome=='home' && QYNewTabConfig.curConNum==0){
            //页面缓存
            pageCatchImg();
        }else if(QYNewTabConfig.mainHome=='wall' || QYNewTabConfig.mainHome=='search'){
            //页面缓存
            pageCatchImg();
        }
    });
    $(window).resizeEnd();
}

//用户数据改变同步数据
function onChangeUserData(){
    //serLocalData={siteImgObj:{}}
    userLocalData={siteImgObj:{eightBoxSort:eightBoxSortData,eightBoxSite:eightBoxSiteData,historySite:MainSiteMap.my.data}};
    try {
        cef.utility.ExecuteCppFunc("WebSetUserData", "{'key':'newtabuserdata', 'value':'" + JSON.stringify(userLocalData) + "'}", "");
    } catch (e) {
    }
}

function getPageData(key) {
    if (key == "searchwd") {
        try {
            cef.utility.ExecuteCppFunc("WebGetData", key, "Getsearchwd");
        } catch (e) {

        }
    }
    if (key == "newtabconfig") {
        try {
            cef.utility.ExecuteCppFunc("WebGetData", key, "OnGetNewTabConfig");
        } catch (e) {

        }
    }
    if (key == "vodhtml_v12") {
        try {
            cef.utility.ExecuteCppFunc("WebGetData", "vodhtml_v12", "Getvodhtml");
        } catch (e) {
        }
    }
    if (key == "newtabcheck") {
        try {
            cef.utility.ExecuteCppFunc("WebGetData", key, "OnGetNewCheck");
        } catch (e) {

        }
    }
    if (key == "qyuserinfo") {
        try {
            cef.utility.ExecuteCppFunc("QYWebGetSomeData", 'qyuserinfo', "getQyUserInfo");
        } catch (e) {

        }
    }
    if (key == "newtabcheck") {
        try {
            cef.utility.ExecuteCppFunc("WebGetData", key, "OnGetNewCheck");
        } catch (e) {

        }
    }
    if (key == "newtabuserdata") {
        try {
            cef.utility.ExecuteCppFunc("WebGetUserData", key, "GetUserData");
        } catch (e) {
        }
    }
}
function GetUserData(data){
    var QYuserData=JSON.parse(data);
    if(QYuserData.siteImgObj.historySite.length != undefined){
        MainSiteMap.my.data=QYuserData.siteImgObj.historySite;
        //计费链接更新-个人收藏
        if(store.get('local_linkVersion2')){
            if(store.get('local_linkVersion2')!=LinkVersion2){
                store.set('local_linkVersion2',LinkVersion2);
                updateLink2(linkData,MainSiteMap.my.data);
                onChangeUserData();
            }
        }else{
            store.set('local_linkVersion2',LinkVersion2);
            updateLink2(linkData,MainSiteMap.my.data);
        }
        load_siteData();
    }
    if(QYuserData.siteImgObj.eightBoxSort.length!= undefined && QYuserData.siteImgObj.eightBoxSite.length!= undefined){
        if(isLogin){
            eightBoxSortData=QYuserData.siteImgObj.eightBoxSort;
            eightBoxSiteData=QYuserData.siteImgObj.eightBoxSite;
            //计费链接更新-九宫格（用户登录）
            if(store.get('local_linkVersion3')){
                if(store.get('local_linkVersion3')!=LinkVersion3){
                    store.set('local_linkVersion3',LinkVersion3);
                    updateLink(linkData,eightBoxSiteData);
                    onChangeUserData();
                }
            }else{
                store.set('local_linkVersion3',LinkVersion3);
                updateLink(linkData,eightBoxSiteData);
                onChangeUserData();
            }
            load_eigthBoxData();
        }
    }
}
//注册当前页面
function registerUserInfoChange() {
    var url = window.location.href;
    var webJson = "{weburl:'" + url + "', needuserdata:true, regtypes:'1'|'2'}";
    try {
        cef.utility.ExecuteCppFunc("WebRegCallbackForInfoChange", webJson, "NewTabInfoChange");
    } catch (e) {

    }
}

//回调常用网址
function callback_historyData(data){
    var collectData=[];
    if(data.items){
        $.each(data.items,function(i,o){
            if(o.title!=''&& o.url.indexOf('http')>-1){
                collectData.push({
                    id: i,
                    name: stripScript(o.title),
                    url: o.url,
                    pic: '',
                    b_pic: ''
                })
            }
        });
        MainSiteMap.collect.data=collectData;
        load_editPanel();
        load_siteData();
    }else{
        load_editPanel();
        load_siteData();
    }
}
function stripScript(s) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
    var rs = "";
    for (var i = 0; i < s.length; i++) {
        rs = rs+s.substr(i, 1).replace(pattern, '');
    }
    return rs;
}
function getQyUserInfo(val){
    try {
        var infos = JSON.parse(val);
        if (typeof infos.islogined != 'undefined') {
            if (infos.islogined) {
                //显示用户菜单
                isLogin = true;
                //显示用户菜单
                $('#js_userLogin').addClass('onLine').hover(function () {
                    $('#js_userMenu').fadeIn();
                }, function () {
                    $('#js_userMenu').hide();
                });
                $('#js_userLogin').unbind('click');
                shownews();
                getPageData('newtabuserdata');
            } else {
                isLogin = false;
                $('#js_userLogin').click(function () {
                    //todo:调用登录接口
                    try {
                        cef.utility.ExecuteCppFunc("WebShowLoginUI", "", "");
                    } catch (e) {
                    }
                });
                $('#js_userLogin').removeClass('onLine').hover(function () {
                    $('#js_userMenu').hide();
                }, function () {
                    $('#js_userMenu').hide();
                });
                $('#js_userBox').remove();
                //加载九宫格数据
                if(store.get('local_eightBoxSortData')){
                    eightBoxSortData=store.get('local_eightBoxSortData');
                }
                if(store.get('local_eightBoxSiteData')){
                    eightBoxSiteData=store.get('local_eightBoxSiteData');
                }
                if(store.get('local_MainSiteMap')){
                    MainSiteMap=store.get('local_MainSiteMap');
                }
                load_eigthBoxData();
                reload_mySite();
            }
        }
    } catch (e) {
    }
}

function NewTabInfoChange(pdata) {
    var changes = JSON.parse(pdata);
    if (changes.type == 1) {  //监听登录变化
        getPageData('qyuserinfo'); //刷新登录信息
    }
    if (changes.type == 2) {  //标签页信息发生变化
        //getPageData('newtabuserdata');//同步用户数据刷新本地
    }
}

function showWeather(theme){
    try {
        $.ajax({
            url: 'http://yrapi.iqying.com/api/newTab/getweather?version='+(new Date()/36e5),
            dataType: "jsonp",
            data:{VAR_JSONP_HANDLER:"weather_json_callback"},
            jsonpCallback: 'weather_json_callback',
            success: function (data) {
                if (data.code == 1) {
                    //window.localStorage.weather = JSON.stringify(data);
                    //var data = JSON.parse(window.localStorage.weather);
                    var html = '<a href="' + data.info.link + '" target="_blank">' + data.info.city + '， ' + data.info.tianqi + '  <img align="top" src="' + data.info.img.white + '" style="height:28px;"> ' + data.info.wendu + ' ℃   ' + data.info.wendu_txt + '</a>';
                    var html1 = '<a href="' + data.info.link + '" target="_blank">' + data.info.city + '， ' + data.info.tianqi + '  <img align="top" src="' + data.info.img.grey + '" style="height:28px;"> ' + data.info.wendu + ' ℃   ' + data.info.wendu_txt + '</a>';
                    if (theme == "themeW") {
                        $('#weather_info').html(html).attr('class','themeW');
                    } else {
                        $('#weather_info').html(html1).attr('class','themeB');
                    }
                }
            }
        });
    } catch (e) {}
}

//获取站点数据：壁纸、网址、广告、云壁纸
function loadMainSiteData(){
    $.ajax({
        url: 'http://yrapi.iqying.com/api/newTab/getSiteData',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"mainSiteData_json_callback"},
        jsonpCallback: 'mainSiteData_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainSiteData=data;
            store.set('local_MainSiteData',MainSiteData);
            store.set('mainSiteDataCatchTime',curTime(20));
            //默认加载背景渐变颜色
            load_bgcolors();
            //默认加载壁纸数据
            load_bzType();
            //加载九宫格数据
            load_eigthBoxData();
            //加载广告位
            load_advData();
        },error:function(){
            //默认加载背景渐变颜色
            load_bgcolors();
            //默认加载壁纸数据
            load_bzType();
            //加载九宫格数据
            load_eigthBoxData();
            //加载广告位
            load_advData();
        }
    })
}
//获取搜索引擎关键字
function loadKeyWords(){
    $.ajax({
        url: 'http://yrapi.iqying.com/api/newTab/GetKeywords',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"KeyWords_json_callback"},
        jsonpCallback: 'KeyWords_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.serScrollData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('serScrollDataCatchTime',curTime(5));
            //热门链接滚动
            $.each(MainConDataArry.serScrollData, function (i, o) {
                if (o.name == (QYNewTabConfig.searchType||'html')) {
                    rollList_Txt(o.list)
                }
            });
            searchwdChange('js_serChange', 'js_rollTxt');
        },error:function(){
            //热门链接滚动
            $.each(MainConDataArry.serScrollData, function (i, o) {
                if (o.name == (QYNewTabConfig.searchType||'html')) {rollList_Txt(o.list)}
            });
            searchwdChange('js_serChange', 'js_rollTxt');
        }
    })
}
//获取游戏版块数据
function loadGameData(){
    $.ajax({
        url: 'http://yrapi.iqying.com/api/newTab/getGame',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"game_json_callback"},
        jsonpCallback: 'game_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.gameData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('gameCatchTime',curTime(5));
            load_hotGame();
            load_bestGame();
        },error:function(){
            load_hotGame();
            load_bestGame();
        }
    })
}
//获取热门新闻版块数据
function loadHotNews() {
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_position_lists&posid=18&limit=10',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"hotNews_json_callback"},
        jsonpCallback: 'hotNews_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.hotNewsData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('hotNewsCatchTime',curTime(5));
            load_hotNewsData();
        },error:function(){
            load_hotNewsData();
        }
    })
}
//获取热门推荐新闻版块数据
function loadRecomHotNews() {
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_position_lists&posid=19&limit=10',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"RecomHotNews_json_callback"},
        jsonpCallback: 'RecomHotNews_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.recomHotNewsData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('recomHotNewsCatchTime',curTime(10));
            load_recomHotNewsData();
        },error:function(){
            load_recomHotNewsData();
        }
    })
}
//获取推荐图文版块数据
function loadRecomImgHotNews() {
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_position_lists&posid=21&limit=4',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"RecomImgHotNews_json_callback"},
        jsonpCallback: 'RecomImgHotNews_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.recomImgHotNewsData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('recomImgHotNewsCatchTime',curTime(5));
            load_recomImgHotNewsData();
        },error:function(){
            load_recomImgHotNewsData();
        }
    })
}
//获取新闻列表版块数据
function loadListNews() {
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_content_lists&limit=10&mode=getmore&maxid=0',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"listNews_json_callback"},
        jsonpCallback: 'listNews_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.listNewsData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('listNewsCatchTime',curTime(5));
            load_listNewsData();
        },error:function(){
            load_listNewsData();
        }
    })
}
//获取美女图库版块数据
function loadListGirls() {
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_girl_position_lists',
        //url: 'http://www.meinvb2.com:83/api.php?op=tab_api&action=get_position_lists&posid=21',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"listGirls_json_callback"},
        jsonpCallback: 'listGirls_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.girlsData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('listGirlsCatchTime',curTime(5));
            load_girlsData();
        },error:function(){
            load_girlsData();
        }
    })
}
//获取活动版块数据
function loadActivity() {
    var url='http://yrapi.iqying.com/api/newTab/getAct';
    if(QYNewTab_NewDataAPI){
        url='http://yrapi.iqying.com/api/newTab/getAct?size=4';
    }
    $.ajax({
        url: url,
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"act_json_callback"},
        jsonpCallback: 'act_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.activityData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('activityCatchTime',curTime(5));
            load_activityData();
        },error:function(){
            load_activityData();
        }
    })
}
//获取插件版块数据
function loadExt(){
    $.ajax({
        url: 'http://yrapi.iqying.com/api/newTab/getExt',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"ext_json_callback"},
        jsonpCallback: 'ext_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.appData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('extCatchTime',curTime(5));
            load_extData();
        },error:function(){
            load_extData();
        }
    })
}
//获取版块版块数据
function loadVideo(){
    var url='http://so.iqying.com/newtab/video_v2.0.js';
    if(QYNewTab_NewDataAPI){
        url='http://so.iqying.com/newtab/video_v2.1.js';
    }
    $.ajax({
        url: url,
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"videocallback"},
        jsonpCallback: 'videocallback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.videoData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('videoCatchTime',curTime(5));
            load_videoData();
        },error:function(){
            load_videoData();
        }
    })
}
//获取影迷圈版块数据
function loadYmq(){
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_position_lists&posid=22',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"ymq_json_callback"},
        jsonpCallback: 'ymq_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.ymqData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('ymqCatchTime',curTime(5));
            load_ymqData();
        },error:function(){
            load_ymqData();
        }
    })
}
//获取搞笑版块数据
function loadJoke(){
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_fun_pics_list',
        //url: 'http://www.huluan.com/api.php?op=tab_api&action=get_pics_list',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"jokecallback"},
        jsonpCallback: 'jokecallback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.jokeData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('jokeCatchTime',curTime(5));
            load_jokeData();
        },error:function(){
            load_jokeData();
        }
    })
}
//获取搞笑版块推荐数据
function loadJokeRecom(){
    $.ajax({
        url: 'http://news.iqying.com/api.php?op=tab_api&action=get_fun_recomm_list',
        //url: 'http://www.huluan.com/api.php?op=tab_api&action=get_recomm_list',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"jokeRecomcallback"},
        jsonpCallback: 'jokeRecomcallback',
        timeout: 8e3,
        success: function (data) {
            MainConDataArry.jokeRecomData=data;
            store.set('local_MainConDataArry',MainConDataArry);
            store.set('jokeRecomCatchTime',curTime(5));
            load_jokeRecomData();
        },error:function(){
            load_jokeRecomData();
        }
    })
}

//获取站点网址数据
function loadMainSiteMap(){
    $.ajax({
        url: 'http://yrapi.iqying.com/api/newTab/getUrlAdr',
        dataType: "jsonp",
        data:{VAR_JSONP_HANDLER:"mainSiteMap_json_callback"},
        jsonpCallback: 'mainSiteMap_json_callback',
        timeout: 8e3,
        success: function (data) {
            MainSiteMap=data;
            store.set('local_MainSiteMap',MainSiteMap);
            //调用常用网址
            try{
                chrome.send("getMostVisitedItems",["callback_historyData"]);
            }catch(e){
                load_siteData();
                load_editPanel();
            }
        },error:function(){
            //调用常用网址
            try{
                chrome.send("getMostVisitedItems",["callback_historyData"]);
            }catch(e){
                load_siteData();
                load_editPanel();
            }
        }
    })
}

function curTime(n){
    var timer=Date.parse(new Date())+n*60*1000;
    return timer;
}
//获取用户消息
function shownews() {
    try {
        $.ajax({
            url: 'http://yrapi.iqying.com/api/browser/getmessage',
            dataType: "jsonp",
            jsonpCallback: 'jsoncallback',
            success: function (data) {
                if($('#js_userBox').length==0){
                    $('#js_userMsg').append('<div id="js_userBox" class="box"></div>');
                }
                if (data.display == 1) {
                    $('#js_userBox').removeClass('no_msg');
                    $('#js_userBox').html('<span class="user_photo"><a href="javascript:openusercenter(\'' + data.data.redirect_url + '\');" data-href="' + data.data.redirect_url + '"><img src="' + data.data.attach_file + '" alt=""></a></span> <p><a href="javascript:openusercenter(\'' + data.data.redirect_url + '\')" data-href="' + data.data.redirect_url + '" class="t">' + data.data.title + '</a></p><p><a href="javascript:openusercenter(\'' + data.data.redirect_url + '\');" data-href="' + data.data.redirect_url + '">' + data.data.title_second + '</a></p> ');
                } else {
                    $('#js_userBox').addClass('no_msg');
                    $('#js_userBox').html('<span class="user_photo"><a href="javascript:;" onclick="openusercenter(\'\')"><img src="images/photo.jpg" alt=""></a></span> <p><a href="javascript:;" onclick="openusercenter(\'\')" class="t">您目前没有新消息</a></p> <p><a href="javascript:;" onclick="openusercenter(\'\')">进入用户中心查看</a></p>');
                }
                //显示用户消息
                $('#js_userMsg').hover(function () {
                    $('#js_userMenu').hide();
                    $('#js_userBox').fadeIn();
                }, function () {
                    $('#js_userBox').hide();
                });
            }
        })
    }catch (e){}
}
function openusercenter(url) {
    var json = {"jumpurl": url};
    try {
        cef.utility.ExecuteCppFunc("WebOpenUserCenter", JSON.stringify(json), "");
    } catch (e) {
    }
}

var catchImg;
function pageCatchImg(){
    //clearTimeout(catchImg)
    //catchImg=setTimeout(function(){
    //    try{
    //        //alert(1)
    //        //清空当前缓存
    //        chrome.send("webSiteIsCompleted");
    //        //缓存页面
    //        chrome.send("recordWebsite");
    //    }catch(e){}
    //},200)
}
//新标签页统计
function newTabClickPV(data){
    var browserinfo='';
    try{
        browserinfo=JSON.parse(cef.utility.getbrowserinfo());
    }catch(e){}
    var tjUrl='http://count.iqying.org/browser/tagv3.php?&mac='+browserinfo.qy_gid+'&'+data;
    var t_curTime=Date.parse(new Date());
    var t_jsonName="moreNews_jsonCallback"+t_curTime;
    $.ajax({
        url: tjUrl,
        dataType: "jsonp",
        jsonpCallback: t_jsonName,
        success: function(){
            console.log(tjUrl);
        }
    });
}
//新装用户第一次打开客户端
function isFirstRun(a) {
    if(a=='true'){
        QYNewTabConfig.cloud_bz = true;
        $('#js_tsBZ').find('i').addClass('active');
        //储存默认配置
        store.set('local_QYNewTabConfig', QYNewTabConfig);
        $('#mainBg img').attr("src", QYNewTabConfig.backgroundImg);
    }else{
        if(QYNewTabConfig.cloud_bz){
            QYNewTabConfig.cloud_weather_theme=MainSiteData.yun_data.weather_theme;
            QYNewTabConfig.cloud_themeData = MainSiteData.yun_data.themeData;
            QYNewTabConfig.cloud_backgroundImg = MainSiteData.yun_data.image_url;

            $('#js_tsBZ').find('i').addClass('active');
            $('#js_bz_con a').removeClass('act');
            //设置云壁纸
            $('#backgroundIMG').attr('src', MainSiteData.yun_data.image_url);
            imgLoad(backgroundIMG, function () {
                //更改页面风格
                changeTheme('cloud');
                $('#mainBg img').attr("src", QYNewTabConfig.cloud_backgroundImg);
            });
            //增加云链接
            $('body').append('<a id="cloud_link_l" href="' + MainSiteData.yun_data.link_url + '" target="_blank"></a>');
            cloud_link();
            $(window).resize(function () {cloud_link();})
        }else{
            $('#mainBg img').attr("src", QYNewTabConfig.backgroundImg);
        }
    }
}

//新闻模块
function load_newsTemp(){
    var _main ='';
    _main +='<div class="hotNews cf"><div class="fl" id="newsScroll"><div class="toutiao" id="js_touTiao">';
    _main +='</div><div class="toutiaoPic cf"><ul id="js_ttpic"></ul></div><div class="newlist cf"><ul id="js_nlist" class="cf"></ul><div onclick="goTop()" id="js_goTop" title="返回顶部"></div>';
    _main +='</div><div class="loadmore">鼠标滚动加载更多</div></div><div class="fr"><div class="hotnew"><h4>热点新闻</h4><ul id="js_hotnew"></ul>';
    _main +='</div><div class="ad_list" id="js_newTabAD"><a href="javascript:;"><img src="images/qyadv.png"/></a><a href="javascript:;"><img src="images/qyadv.png"/></a></div>';
    _main +='</div></div>';
    console.log('新闻模块加载成功');
    return _main;
}
function load_hotNewsData(){
    var temp='';
    $.each(MainConDataArry.hotNewsData, function(i,o) {
        temp +='<a class="color'+GetRandomNum(1,6)+'" href="'+ o.url +'">'+ o.title +'</a>';
        if(i>=5){return false}
    });
    temp +='<a class="color'+GetRandomNum(1,6)+'" href="http://news.iqying.com/?newtabkey">更多</a>';
    $('#js_touTiao').html(temp);
}
function GetRandomNum(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}
function load_recomHotNewsData(){
    var _hotList='';
    $.each(MainConDataArry.recomHotNewsData, function(i,o) {
        _hotList +='<li><span>'+ (i+1) +'</span><a href="'+ o.url +'">'+ o.title +'</a></li>';
    });
    $('#js_hotnew').html(_hotList);
}
function load_recomImgHotNewsData() {
    var _hotListImg='';
    $.each(MainConDataArry.recomImgHotNewsData, function(i,o) {
        _hotListImg +='<li><a href="'+ o.url +'" style="background-image: url('+ o.thumb +');"><p>'+ o.title +'</p></a></li>';
    });
    $('#js_ttpic').html(_hotListImg);
    load_advData_newsTop();
}
function load_listNewsData() {
    var _list='';
    $.each(MainConDataArry.listNewsData, function(i,o) {
        _list +='<li data-id="'+ o.id +'">';
        _list +='<a href="'+ o.url +'" class="pic" style="background-image: url('+ o.thumb +');"></a><div class="news_info">';
        if(o.media_type==3){
            _list +='<span class="tit v_tit"><a href="'+ o.url +'">'+ o.title +'</a></span>';
        }else{
            _list +='<span class="tit"><a href="'+ o.url +'">'+ o.title +'</a></span>';
        }
        _list +='<span>'+ o.copyfrom +'&nbsp;'+ o.inputtime +'</span></div></li>';
    });
    $('#js_nlist').html(_list);
    //定时更新
    upadteNews();
}
function load_advData(){
    var _adv='';
    $.each(MainSiteData.adv_data.data, function(i,o) {
        _adv +='<a href="'+ o.link +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.img +'"/></a>';
    });
    $('#js_newTabAD').html(_adv)
}
function load_advData_newsTop(){
    var _adv_newsTop='';
    $.each(MainSiteData.news_top.data, function(i,o) {
        if(o.is_video==1){
            _adv_newsTop +='<li><a href="'+ o.link +'" style="background-image: url('+ o.img +');"><p>'+ o.name +'</p><i></i></a></li>';
        }else{
            _adv_newsTop +='<li><a href="'+ o.link +'" style="background-image: url('+ o.img +');"><p>'+ o.name +'</p></a></li>';
        }
    });
    $('#js_ttpic').prepend(_adv_newsTop);
}

//影视模块
function load_videoTemp(){
    var _main='';
    _main+='<div class="video"><div class="v_nav"><div id="js_videoNav"></div>';
    _main+='<div class="fr"><a class="more_a" href="http://so.iqying.com/?newtabmore" id="js_moreVideo">更多</a>';
    _main+='<a id="moreVideo" href="javascript:load_moreVideo();">换一批</a></div></div><div class="videoList cf">';
    _main+='<ul id="js_videoList"></ul></div><div class="ymq"><b>影迷圈</b><ul id="js_ymq"></ul></div></div>';
    console.log('视频模块加载成功');
    return _main
}
function load_videoData(){
    var _list='',_str='<b>热播视频</b>';
    //加载影片分类
    $.each(MainConDataArry.videoData.bar, function(i,o) {
        _str +='<a href="'+ o.link +'">'+ o.title +'</a>';
    });
    //加载影片数据
    $.each(MainConDataArry.videoData.video, function(i,o) {
        if(i==0){
            _list +='<li class="bigPic"><a href="'+ o.url +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.pic +'" /><p><span>'+ o.title +'</span><i>'+ o.score +'</i></p></a></li>';
            return true;
        }
        _list +='<li><a href="'+ o.url +'" class="pic"><img onerror="this.src=\'images/error.png\'" src="'+ o.pic +'"/></a><p><a href="'+ o.url +'">'+ o.title +'</a><i>'+ o.score +'</i></p></li>';
        if(i>=12){
            return false;
        }
    });
    $('#js_videoNav').html(_str);
    $('#js_videoList').html(_list);
    $('#js_moreVideo').attr('href',MainConDataArry.videoData.moreUrl);
}
function load_ymqData(){
    var _str='';
    $.each(MainConDataArry.ymqData, function(i,o) {
        _str +='<li><a href="'+ o.url +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.thumb +'"/><p>'+ o.title +'</p></a></li>';
        if(i>=3){
            return false;
        }
    });
    $('#js_ymq').html(_str);
}

//美女模块
function load_girlsTemp(){
    var _main='';
    _main +='<div class="girls"><div class="v_nav"><b>美图欣赏</b><div class="fr"><a class="more_a" href="http://news.iqying.com/girls?newtab">更多</a><a href="javascript:load_moreGirls();" id="moreGirls">换一批</a>';
    _main +='</div></div><div class="girlsList"><ul id="js_girls"></ul></div></div>';
    console.log('图片模块数据加载成功');
    return _main;
}
function load_girlsData(){
    var str='';
    try{
        var bigData=MainConDataArry.girlsData.bfgirl;
        var smallData=MainConDataArry.girlsData.baidu;
        var bPic=my_ran(5,0,bigData.length-1);
        var sPic=my_ran(10,0,smallData.length-1);
        str +='<li><a data-type="girl" href="'+ bigData[bPic[0]].url +'" style="background: url('+ bigData[bPic[0]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[0]].url +'" style="background: url('+ smallData[sPic[0]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[1]].url +'" style="background: url('+ smallData[sPic[1]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[2]].url +'" style="background: url('+ smallData[sPic[2]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[3]].url +'" style="background: url('+ smallData[sPic[3]].thumb +') 0/cover;"></a></li>';
        str +='<li><a data-type="girl" href="'+ bigData[bPic[1]].url +'" style="background: url('+ bigData[bPic[1]].thumb +') 0/cover;"></a></li>';
        str +='<li><a data-type="girl" href="'+ bigData[bPic[2]].url +'" style="background: url('+ bigData[bPic[2]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[4]].url +'" style="background: url('+ smallData[sPic[4]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[5]].url +'" style="background: url('+ smallData[sPic[5]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[6]].url +'" style="background: url('+ smallData[sPic[6]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[7]].url +'" style="background: url('+ smallData[sPic[7]].thumb +') 0/cover;"></a></li>';
        str +='<li><a data-type="girl" href="'+ bigData[bPic[3]].url +'" style="background: url('+ bigData[bPic[3]].thumb +') 0/cover;"></a></li>';
        str +='<li><a data-type="girl" href="'+ bigData[bPic[4]].url +'" style="background: url('+ bigData[bPic[4]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[8]].url +'" style="background: url('+ smallData[sPic[8]].thumb +') 0/cover;"></a></li>';
        str +='<li><a href="'+ smallData[sPic[9]].url +'" style="background: url('+ smallData[sPic[9]].thumb +') 0/cover;"></a></li>';
        $('#js_girls').html(str);
    }catch (e){}
}
function my_ran(n,min,max){
    var arr=[];
    for(i=0;i<n;i++){
        arr[i]=parseInt(Math.random()*(max-min+1)+min);
        for(j=0;j<i;j++){
            if(arr[i]==arr[j]){
                i=i-1;
                break;
            }
        }
    }
    return arr;
}

//游戏模块
function load_gameTemp(){
    var _main='';
    _main +='<div class="game"><div class="v_nav"><b>热门新品</b><div class="fr"><a class="more_a" href="http://www.uquq.com/?qynewtab">更多</a><a href="javascript:load_moreGame();" id="moreGame">换一批</a></div></div><div class="gamesList cf"><ul id="js_game"></ul>';
    _main +='</div><div class="v_nav"><b>精品页游</b></div><div class="webGame"><ul id="js_webgame"></ul></div></div>';
    console.log('游戏模块数据加载成功')
    return _main;
}
function load_hotGame(){
    var hot_game='';
    $.each(MainConDataArry.gameData.hot_game, function(i,o) {
        hot_game +='<li><a href="'+ o.href +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.img +'"/><p>'+ o.name +'</p></a></li>';
        if(i>=23){
            return false;
        }
    });
    $('#js_game').html(hot_game)
}
function load_bestGame(){
    var best_game='';
    $.each(MainConDataArry.gameData.best_game, function(i,o) {
        best_game +='<li><a href="'+ o.href +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.img +'"/><span>'+ o.name +'</span></a></li>';
        if(i>=4){
            return false;
        }
    });
    $('#js_webgame').html(best_game)
}

//扩展模块
function load_moreTemp(){
    var _main = '';
    _main +='<div class="More"><div class="v_nav activity_tit"><b>千影活动</b><div class="fr"><a class="more_a" href="http://bbs.iqying.com/forum.php?qynewtab" id="moreActivity">更多</a></div></div>';
    _main +='<div class="activity cf"><ul id="js_activity"></ul></div><div class="v_nav"><b>推荐应用 </b>';
    _main +='<div class="fr"><a class="more_a" id="refApp" href="http://ext.iqying.com/?newtabmore">更多</a><a href="javascript:load_moreExt();" id="moreApp">换一批</a></div></div>';
    _main +='<div class="app"><ul id="js_app"></ul></div></div>';
    console.log('更多模块数据加载成功');
    return _main;
}
function load_activityData(){
    var str='';
    $.each(MainConDataArry.activityData, function(i,o) {
        str +='<li><a href="'+ o.link +'" style="background: url('+ o.img +') 0/cover"><span>'+ o.name +'</span></a></li>';
        if(i>=3){
            return false;
        }
    });
    $('#js_activity').html(str)
}
function load_extData(){
    var str='';
    $.each(MainConDataArry.appData, function(i,o) {
        str +='<li><a href="http://ext.iqying.com/?extkey='+ o.key +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.icon +'" /><span>'+ o.name +'</span></a></li>';
        if(i==19){return false}
    });
    $('#js_app').html(str)
}

//搞笑模块
function load_jokeTemp(){
    var _main='';
    _main+='<div class="joke"><div class="v_nav"><div id="js_jokeNav"></div>';
    _main+='<div class="fr"><a class="more_a" href="http://news.iqying.com/funny?newtabmore" id="js_moreJoke">更多</a>';
    _main+='<a id="moreJoke" href="javascript:load_moreJoke();">换一批</a></div></div><div class="jokeList cf">';
    _main+='<ul id="js_jokeList"></ul></div>';
    _main+='<div class="joke_pic" id="js_jokeBigPic"></div>';
    _main+='<div class="joke_kws" id="js_jokeKws_qw"></div>';
    _main+='<div class="joke_pic joke_spic" id="js_jokeSmallPic"><div class="bigPic"><a href="#" style="background: url(http://vimg.iqying.com/upload/slide/2016-12-26/201612261482721101.png) 0/cover"><p>摆渡人</p></a></div></div>';
    _main+='<div class="joke_kws" id="js_jokeKws_gs"><a href="#">爆逗老师和二货学</a><a href="#">爆逗老师和二货学</a><a href="#">爆逗老师和二货学</a><a href="#">爆逗老师和二货学</a><a href="#">爆逗老师和二货学</a><a href="#">爆逗老师和二货学</a></div>';
    _main+='<div class="joke_dz" id="js_jokeDz"></div>';
    _main+='</div>';
    console.log('搞笑模块加载成功');
    return _main
}
function load_jokeData(){
    var _list='',_str='<b>轻松一刻</b>';
    //加搞笑分类
    $.each(MainConDataArry.jokeData.bar, function(i,o) {
        _str +='<a href="'+ o.link +'">'+ o.title +'</a>';
    });
    //加载搞笑数据
    $.each(MainConDataArry.jokeData.joke, function(i,o) {
        _list +='<li><a href="'+ o.url +'" class="pic" style="background: url('+ o.pic +') 0/cover"></a><p><a href="'+ o.url +'">'+ o.title +'</a></p></li>';
        if(i>=9){
            return false;
        }
    });
    $('#js_jokeNav').html(_str);
    $('#js_jokeList').html(_list);
}
function load_jokeRecomData(){
    var _str='',_str1='',_str2='',_str3='',_str4='';
    //加载推荐奇闻图文数据
    $.each(MainConDataArry.jokeRecomData.big_qiwen, function(i,o) {
        _str +='<div class="bigPic"><a href="'+o.url+'" style="background: url('+o.thumb+') 0/cover"><p>'+o.title+'</p></a></div>';
    });
    //加载推荐奇闻标题数据
    $.each(MainConDataArry.jokeRecomData.title_qiwen, function(i,o) {
        _str1 +='<a href="'+o.url+'">'+ o.title +'</a>';
        if(i>=5){
            return false;
        }
    });
    //加载推荐奇闻图文数据
    $.each(MainConDataArry.jokeRecomData.big_story, function(i,o) {
        _str2 +='<div class="bigPic"><a href="'+o.url+'" style="background: url('+o.thumb+') 0/cover"><p>'+o.title+'</p></a></div>';
    });
    //加载推荐奇闻标题数据
    $.each(MainConDataArry.jokeRecomData.title_story, function(i,o) {
        _str3 +='<a href="'+o.url+'">'+ o.title +'</a>';
        if(i>=5){
            return false;
        }
    });
    //加载推段子数据
    $.each(MainConDataArry.jokeRecomData.joke_data, function(i,o) {
        _str4 +='<a href="'+ o.url +'" class="tit">'+ o.title +'</a><div class="des" id="js_conDz"><p id="js_conDzInfo">'+ o.content +'</p></div>';
        _str4 +='<a href="javascript:load_moreDZ();" id="js_nextDz">再来一个</a>';
        if(i==0){
            return false;
        }
    });

    $('#js_jokeBigPic').html(_str);
    $('#js_jokeKws_qw').html(_str1);
    $('#js_jokeSmallPic').html(_str2);
    $('#js_jokeKws_gs').html(_str3);
    $('#js_jokeDz').html(_str4);
}

function load_newsMore(t,id){
    var _list='',updateNewStr='',t_curTime=Date.parse(new Date());
    var t_jsonName="moreNews_jsonCallback"+t_curTime;
    try{
        $.ajax({
            url: 'http://news.iqying.com/api.php?op=tab_api&action=get_content_lists&mode='+t+'&maxid='+id,
            dataType: "jsonp",
            data:{VAR_JSONP_HANDLER:t_jsonName},
            jsonpCallback: t_jsonName,
            timeout: 8e3,
            beforeSend:function(){
                if(t=='getmore'){
                    if($('.load_tips').length==0){
                        $('.hotNews').append('<div class="load_tips">数据加载中...</div>');
                        $('.load_tips').animate({opacity:1},300)
                    }
                }
            },
            success: function (data) {
                if(data.length==0){
                    if(t=='getmore'){
                        $('.load_tips').animate({opacity:0},500,function(){
                            $(this).remove()
                        });
                    }
                    return false
                }
                if(t=='getmore'){
                    //todo: ajax加载更多新闻
                    $.each(data, function(i,o) {
                        _list +='<li data-id="'+ o.id +'">';
                        _list +='<a href="'+ o.url +'" class="pic" style="background-image: url('+ o.thumb +');"></a><div class="news_info">';
                        if(o.media_type==3){
                            _list +='<span class="tit v_tit"><a href="'+ o.url +'">'+ o.title +'</a></span>';
                        }else{
                            _list +='<span class="tit"><a href="'+ o.url +'">'+ o.title +'</a></span>';
                        }
                        _list +='<span>'+ o.copyfrom +'&nbsp;'+ o.inputtime +'</span></div></li>';
                    });
                    $('#js_nlist').append(_list);
                    $('.load_tips').html('为您成功加载10条新闻');
                    setTimeout(function(){
                        $('.load_tips').animate({opacity:0},500,function(){
                            $(this).remove()
                        })
                    },1000)
                }else{
                    var updateNewStr='';
                    //todo: ajax加载更多新闻
                    $.each(data, function(i,o) {
                        updateNewStr +='<li data-id="'+ o.id +'">';
                        updateNewStr +='<a href="'+ o.url +'" class="pic" style="background-image: url('+ o.thumb +');"></a><div class="news_info">';
                        if(o.media_type==3){
                            updateNewStr +='<span class="tit v_tit"><a href="'+ o.url +'">'+ o.title +'</a></span>';
                        }else{
                            updateNewStr +='<span class="tit"><a href="'+ o.url +'">'+ o.title +'</a></span>';
                        }
                        updateNewStr +='<span>'+ o.copyfrom +'&nbsp;'+ o.inputtime +'</span></div></li>';
                    });
                    if(data.length>9){
                        $('#js_loadNewsData').html(updateNewStr);
                        $('.hotNews').append('<div class="update_tips"><b onclick="goToNewsTop()">您有'+ data.length +'条更新未读，点击查看</b><label onclick="closeNewsTips()" class="tips_close"></label></div>');
                        $('.update_tips').animate({opacity:1},300);
                    }else{
                        $('#js_nlist').prepend(updateNewStr);
                    }
                }
            },error:function(){
                $('.load_tips').html('加载失败！');
            }
        })
    }catch (e){}
}
var updataNewsTimer;
function upadteNews(){
    updataNewsTimer=setInterval(function(){
        clearInterval(updataNewsTimer);
        if($('.update_tips').length>0 || $('#newsScroll').length==0){return false}
        var minID=$("#js_nlist li:first-child").attr('data-id');
        load_newsMore('getnew',minID);
    },60e3)
}
function goToNewsTop(){
    $('#newsScroll').animate({scrollTop:0},300);
    $('#js_nlist').prepend($('#js_loadNewsData').html());
    setTimeout(function(){
        $('#js_loadNewsData').html('');
        $('.update_tips').animate({opacity:0},500,function(){
            $(this).remove()
        })
    },1000);
}
function goTop(){
    $('#newsScroll').animate({scrollTop:0},300);
    $('#js_goTop').fadeOut();
}
function closeNewsTips(){
    $('.update_tips').animate({opacity:0},500,function(){
        $(this).remove()
    })
}

//影视 换一批
function load_moreVideo(){
    var _list='',pagerArry=[0,12];
    videoPager>2 ? videoPager=1 : videoPager+=1;
    if(videoPager==1){
        pagerArry=[0,12];
    }else if(videoPager==2){
        pagerArry=[13,25];
    }else{
        pagerArry=[26,38];
    }
    //加载影片数据
    $.each(MainConDataArry.videoData.video, function(i,o) {
        if(i<pagerArry[0]){return true}
        if(i==pagerArry[0]){
            _list +='<li class="bigPic"><a href="'+ o.url +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.pic +'" /><p><span>'+ o.title +'</span><i>'+ o.score +'</i></p></a></li>';
        }else{
            _list +='<li><a href="'+ o.url +'" class="pic"><img onerror="this.src=\'images/error.png\'" src="'+ o.pic +'"/></a><p><a href="'+ o.url +'">'+ o.title +'</a><i>'+ o.score +'</i></p></li>';
        }
        if(i>=pagerArry[1]){
            return false;
        }
    });
    $('#js_videoList').html(_list);
}

//美女 换一批
function load_moreGirls(){
    load_girlsData()
}

//游戏 换一批
function load_moreGame(){
    var _list='',_list2='',pagerArry=[0,23],pagerArry2=[0,4];
    gamePager>2 ? gamePager=1 : gamePager+=1;
    if(gamePager==1){
        pagerArry=[0,23];
        pagerArry2=[0,4];
    }else if(gamePager==2){
        pagerArry=[24,47];
        pagerArry2=[5,9];
    }else{
        pagerArry=[47,70];
        pagerArry2=[10,15];
    }

    $.each(MainConDataArry.gameData.hot_game, function(i,o) {
        if(i<pagerArry[0]){return true}
        _list +='<li><a href="'+ o.href +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.img +'"/><p>'+ o.name +'</p></a></li>';
        if(i>=pagerArry[1]){
            return false;
        }
    });
    $.each(MainConDataArry.gameData.best_game, function(i,o) {
        if(i<pagerArry2[0]){return true}
        _list2 +='<li><a href="'+ o.href +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.img +'"/><span>'+ o.name +'</span></a></li>';
        if(i>=pagerArry2[1]){
            return false;
        }
    });
    $('#js_game').html(_list);
    $('#js_webgame').html(_list2)
}

//App 换一批
function load_moreExt(){
    //todo ajax数据读取
    var _list='',pagerArry=[0,19];
    extPager>2 ? extPager=1 : extPager+=1;
    if(extPager==1){
        pagerArry=[0,19];
    }else if(extPager==2){
        pagerArry=[20,39];
    }else{
        pagerArry=[40,59];
    }
    //加载扩展数据
    $.each(MainConDataArry.appData, function(i,o) {
        if(i<pagerArry[0]){return true}
        _list +='<li><a href="http://ext.iqying.com/?extkey='+ o.key +'"><img onerror="this.src=\'images/error.png\'" src="'+ o.icon +'" /><span>'+ o.name +'</span></a></li>';
        if(i>=pagerArry[1]){
            return false;
        }
    });
    $('#js_app').html(_list)
}

//搞笑 换一批
function load_moreJoke(){
    var _list='',pagerArry=[0,10];
    jokePager>4 ? jokePager=1 : jokePager+=1;
    if(jokePager==1){
        pagerArry=[0,9];
    }else if(jokePager==2){
        pagerArry=[10,19];
    }else if(jokePager==3){
        pagerArry=[20,29];
    }else if(jokePager==4){
        pagerArry=[30,39];
    }else{
        pagerArry=[40,49];
    }
    //加载搞笑数据
    $.each(MainConDataArry.jokeData.joke, function(i,o) {
        if(i<pagerArry[0]){return true}
        _list +='<li><a href="'+ o.url +'" class="pic" style="background: url('+ o.pic +') 0/cover"></a><p><a href="'+ o.url +'">'+ o.title +'</a></p></li>';
        if(i>=pagerArry[1]){
            return false;
        }
    });
    $('#js_jokeList').html(_list);
}

//段子 换一批
function load_moreDZ(){
    var _str='';
    DZPager>MainConDataArry.jokeRecomData.joke_data.length-2 ? DZPager=0 : DZPager+=1;
    _str +='<a href="'+ MainConDataArry.jokeRecomData.joke_data[DZPager].url +'" class="tit">'+ MainConDataArry.jokeRecomData.joke_data[DZPager].title +'</a>' +
        '<div class="des" id="js_conDz"><p id="js_conDzInfo">'+ MainConDataArry.jokeRecomData.joke_data[DZPager].content +'</p></div>' +
        '<a href="javascript:load_moreDZ();" id="js_nextDz">再来一个</a>';
    $('#js_jokeDz').html(_str);
}

//页面统计
function newTabReport(){
    $('#js_userMenu a').click(function(){
        var c_name=$(this).text();
        var c_link=$(this).attr('data-href');
        newTabClickPV('op=other&p1=click&p2='+c_name+'&p3='+c_link);
    });
    $(document).on('click','#js_userBox a',function(){
        var c_link=$(this).attr('data-href');
        newTabClickPV('op=other&p1=click&p2=用户消息&p3='+c_link);
    });
    $(document).on('click','#js_siteList a:not(.add)',function(){
        var c_name=$(this).attr('title');
        var c_link=$(this).attr('href');
        var c_type=$('#js_siteTab .tab_tit .cur').text();
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=search&p2=site&p3='+c_type+'&p4='+c_name+'&p5='+c_link);
    });
    //九宫格点击
    $(document).on('click','#js_eightBoxList a',function(){
        var c_name=$(this).find('.tabTitle').text() || $(this).find('.default').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=site&p2='+c_name+'&p3='+c_link);
    });
    //新闻版块
    $(document).on('click','#js_touTiao a',function(){
        var c_name=$(this).text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=zixun&p2=24小时热搜&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_hotnew a',function(){
        var c_name=$(this).text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=zixun&p2=热点新闻&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_ttpic a',function(){
        var c_name=$(this).find('p').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=zixun&p2=图文推荐&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_nlist a',function(){
        var c_name=$(this).parents('li').find('.tit a').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=zixun&p2=资讯流&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_newTabAD a',function(){
        var c_link=$(this).attr('href');
        var c_num=$(this).index()+1;
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=zixun&p2=广告位'+c_num+'&p3='+c_link);
    });
    //影视版块
    $(document).on('click','#js_videoNav a',function(){
        var c_name=$(this).text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=video&p2=关键词&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_moreVideo',function(){
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=video&p2=更多&p3='+c_link);
    });
    $(document).on('click','#moreVideo',function(){
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=video&p2=换一批');
    });
    $(document).on('click','#js_videoList a',function(){
        var c_name=$(this).find('p span').text() || $(this).parents('li').find('p a').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=video&p2=视频推荐&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_ymq a',function(){
        var c_name=$(this).find('p').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=video&p2=影迷圈&p3='+c_name+'&p4='+c_link);
    });
    //美图版块
    $(document).on('click','#moreGirls',function(){
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=meitu&p2=换一批');
    });
    $(document).on('click','.girls .more_a',function(){
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=meitu&p2=更多');
    });
    $(document).on('click','#js_girls a',function(){
        var c_num=$(this).attr('data-type');
        var c_link=$(this).attr('href');
        var c_name='壁纸图片';
        if(c_num){c_name='美女图片';}
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=meitu&p2='+c_name+'&p3='+c_link);
    });
    //游戏版块
    $(document).on('click','#moreGame',function(){
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=game&p2=换一批');
    });
    $(document).on('click','.game .more_a',function(){
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=game&p2=更多&p3='+c_link);
    });
    $(document).on('click','#js_game a',function(){
        var c_name=$(this).find('p').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=game&p2=小图标&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_webgame a',function(){
        var c_name=$(this).find('span').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=game&p2=大图标&p3='+c_name+'&p4='+c_link);
    });

    //更多版块
    $(document).on('click','#refApp',function(){
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=jingcai&p2=换一批');
    });
    $(document).on('click','#moreApp',function(){
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=jingcai&p2=更多&p3='+c_link);
    });
    $(document).on('click','#moreActivity',function(){
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=jingcai&p2=更多活动&p3='+c_link);
    });
    $(document).on('click','#js_activity a',function(){
        var c_name=$(this).find('span').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=jingcai&p2=千影活动&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_app a',function(){
        var c_name=$(this).find('span').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=jingcai&p2=推荐应用&p3='+c_name+'&p4='+c_link);
    });

    //搞笑版块
    $(document).on('click','#js_jokeNav a',function(){
        var c_name=$(this).text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=关键词&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#moreJoke',function(){
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=换一批');
    });
    $(document).on('click','.joke .more_a',function(){
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=更多&p3='+c_link);
    });
    $(document).on('click','#js_jokeList a',function(){
        var c_name=$(this).parents('li').find('a:not(.pic)').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=小图&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_jokeBigPic a',function(){
        var c_name=$(this).find('p').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=奇闻大图&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_jokeSmallPic a',function(){
        var c_name=$(this).find('p').text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=奇闻小图&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_jokeKws_qw a,#js_jokeKws_gs a',function(){
        var c_name=$(this).text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=短标题&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_jokeDz .tit',function(){
        var c_name=$(this).text();
        var c_link=$(this).attr('href');
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=长标题&p3='+c_name+'&p4='+c_link);
    });
    $(document).on('click','#js_nextDz',function(){
        newTabClickPV('op='+QYNewTabConfig.mainHome+'&p1=fun&p2=再来一个');
    });
}

//缓存页面html资源
function catcheHtmlResouce(){
    newTabHtml_resouce.body_class=QYNewTabConfig.mainHome;
    newTabHtml_resouce.body_html=$('#main_bodyCon').html();
    //newTabHtml_resouce.siteList_html=$('#js_siteList').html();
    //newTabHtml_resouce.conMainWrap_html=$('#js_conMainWrap').html();
    //newTabHtml_resouce.eightBox_html=$('#js_eightBox').html();
    store.set('newTabHtml_resouce',newTabHtml_resouce);
}