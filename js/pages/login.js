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
            this.regLink = "#link-reg";
            this.accountInput = "#input-account";
            this.passwordInput = "#input-password";
        },
        loadHtml: function () {
            var $def = $.Deferred();
            var context = this;
            var container = context.container;
            $.get(context.pageUrl, function (temp) {
                var renderPage = mus.render(temp);
                container.html(renderPage);
                $def.resolve(context);
            })
            return $def.promise();
        },
        bindEvents: function (context) {
            context = context || this;
            var $def = $.Deferred();
            var loginFunc = function () {
                var thisBtn = $(this);
                thisBtn.text("登录中···");
                thisBtn.unbind();
                var account = $(context.accountInput).val();
                var pwd = $(context.passwordInput).val();
                $.ajax({
                    url: window.app.apiUrl + "account",
                    type: "post",
                    dataType: "json",
                    data: {
                        "act": "login",
                        "str": JSON.stringify({
                            'loginId': account,
                            'pw': pwd
                        })
                    },
                    success: function (response) {
                        if (response.Success) {
                            context.unstall();
                            window.app.userToken = response.Data.token;
                            window.app.userInfo.loginId=response.Data.loginId;
                            window.app.userInfo.name=response.Data.name=="未设置"?response.Data.loginId:response.Data.name;
                            window.app.userInfo.accountId=response.Data.accountid;
                            window.app.router.toTask();
                        } else {
                            alert(response.Message);
                        }
                        thisBtn.text("登录");
                        thisBtn.bind("click", loginFunc);

                    },
                    error: function () {
                        alert("数据访问异常/(ㄒoㄒ)/~~");
                        thisBtn.text("登录");
                        thisBtn.bind("click", loginFunc);
                    }
                })
            }
            $(context.loginBtn).bind("click", loginFunc);
            $(context.regLink).bind("click", function (e) {
                context.unstall();
                window.app.router.toRegister();
            });

            $("#content-toolbar #menu").hide();


            $def.resolve();
            return $def.promise();
        },
        install: function () {
            this.loadHtml().then(this.bindEvents);
        },
        unstall: function (context) {
            context = context || this;
            $(context.loginBtn).unbind();
            $(context.regLink).unbind();
        }
    }

    return new LoginPage();
});