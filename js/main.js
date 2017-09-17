;(function ($, win,r) {
    r.config({
       paths:{
           "jquery":"./js/jquery-3.2.1.min",
           "mustache":"./js/mustache",
           "login":"./js/pages/login",
           "task":"./js/pages/task",
       },
    });

})(jQuery, window,require);

$(document).ready(function () {

    require(["login","task"],function(login,task){
        window.app={
            router:{
                toLogin:function(){
                    login.init({container:$("#main-content")});
                    login.install();
                },
                toTask:function(){
                    task.init({container:$("#main-content")});
                    task.install();
                }
            }
        }

        login.init({container:$("#main-content")});
        login.install();
    })

});