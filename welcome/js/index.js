$(function(){
    $('#fullpage').fullpage({
        'verticalCentered': false,
        'css3': true,
        //anchors: ['page1', 'page2', 'page3'],
        'navigation': true,
        'navigationPosition': 'right',
         afterLoad: function (index, nextIndex) {
            if (nextIndex == '2') {
                $('.logo').addClass('logo_1');
            }else{
                $('.logo').removeClass('logo_1');
            }
            if (nextIndex == '1') {
                $(".logo").removeClass("logo_1");
            } else{
                if (nextIndex == "2") {
                    $(".logo").addClass("logo_1");
                } else {
                    $(".logo").removeClass("logo_1");
                }
            }
        }
    });
    enableAutoResize() ;
})
//浏览器缩放自适应
function enableAutoResize() {
    var resize = function () {
        $(".section").height($(window).height());
        var winWidth = window.innerWidth,
            winHeight = window.innerHeight;

        var ratio = (winWidth / 1920 < winHeight / 1080) ? (winWidth / 1920) : (winHeight / 1080);
        if (ratio < 0.4) {
            ratio = 0.5;
        }else if(ratio>1){
            ratio = 1;
        }
        window.pageRatio = ratio;
        document.getElementById("js_page1").style.cssText += ["","zoom:" + ratio + ''].join(";");
        document.getElementById("js_page2").style.cssText += ["","zoom:" + ratio + ''].join(";");
        document.getElementById("js_page3").style.cssText += ["","zoom:" + ratio + ''].join(";");
    };
    window.onresize = function (e) {
        resize();
    };
    resize();
};