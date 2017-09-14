$import("./js/pages/login.js");

;(function ($, win, mus) {
    win.appSetting = {
        pageSource: {
            login: "./temPages/loginPage.html",
            taskPage: "./temPages/taskPage.html",
        }
    };
    win.initMain = function () {
        var mainContainer = $("#main-content");
        var bindEvents = function () {
            $("#btn-login").click(function () {
                alert("click login btn");
            })
        }
        $.get(this.appSetting.pageSource.login, function (template) {
            var renderPage = mus.render(template);
            mainContainer.html(renderPage);
            bindEvents();
        });


    }
})(jQuery, window, Mustache);

$(document).ready(function () {
    window.initMain();
});