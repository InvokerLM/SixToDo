;
define(["jquery", "mustache"], function ($, mus) {
    function TaskPage() {
        this.hasInit = false;
    }

    TaskPage.prototype = {
        constructor: TaskPage,
        init: function (options) {
            this.hasInit = true;
            this.container = options.container || $("#main-content");
            this.pageUrl = "./temPages/taskPage.html";
            this.inputNewTask = "#input-new-task";
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
            $(context.inputNewTask).bind("keyup", function (e) {

            });
            $def.resolve();
            return $def.promise();

        },
        install: function () {
            this.loadHtml().then(this.bindEvents);
        },
        unstall: function (context) {
            context = context || this;
            $(context.inputNewTask).unbind();
        }
    }
    return new TaskPage();
})