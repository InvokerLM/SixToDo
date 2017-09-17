;
define(["jquery", "mustache"], function ($, mus) {

    function LoginPage() {
        this.hasInit = false;
    }

    LoginPage.prototype = {
        constructor: LoginPage,
        init: function (options) {
            this.hasInit = true;
            this.container = options.container || $("#main-content");
            this.pageUrl = "./temPages/loginPage.html";
            this.loginBtn = "#btn-login";
            this.skipBtn = "#btn-skip";
            this.accountInput="#input-account";
            this.passwordInput="#input-password";
            this.loginCallBack=options.loginCallBack||function(){};
            this.skipCallBack=options.skipCallBack||function(){};
        },
        loadHtml: function () {
            var $def = $.Deferred();
            var context=this;
            var container=context.container;
            $.get(context.pageUrl, function (temp) {
                var renderPage = mus.render(temp);
                container.html(renderPage);
                $def.resolve(context);
            })
            return $def.promise();
        },
        bindEvents: function (context) {
            context=context||this;
            var $def = $.Deferred();
            $(context.loginBtn).bind("click",function (e) {
               var account=$(context.accountInput).val();
               var pwd=$(context.passwordInput).val();
              context.unstall();
              window.app.router.toTask();
            });
            $(context.skipBtn).bind("click",function (e) {
                context.unstall();
                window.app.router.toTask();
            });
            $def.resolve();
            return $def.promise();
        },
        install: function () {
            this.loadHtml().then(this.bindEvents);
        },
        unstall:function(context){
            context=context||this;
            $(context.loginBtn).unbind();
            $(context.skipBtn).unbind();
        }

    }

    return new LoginPage();
});