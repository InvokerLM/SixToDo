$import("./js/pages/login.js");

;(function($,win,mus){
    win.appSetting={
        contentContainer:$("#main-content"),
        pageSource:{
            login:"./temPages/loginPage.html",
            taskPage:"./temPages/taskPage.html",
        }
    };
    win.initMain=function(){
        $.get(this.appSetting.pageSource.login,function (template) {
        var renderPage=mus.render(template);
        this.contentContainer.html(renderPage);
        });
    }
    win.initMain();
})(jQuery,window,Mustache);