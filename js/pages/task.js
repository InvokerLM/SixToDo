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
            this.inputNewTask = "#new-task";
            this.tabTask = "#func-task";
            this.tabReview = "#func-review";
        },
        loadHtml: function () {
            var $def = $.Deferred();
            var context = this;
            var container = context.container;
            $.get(context.pageUrl, function (temp) {
                var renderPage = mus.render(temp);
                container.html(renderPage);
                $("#nowDate").text(window.showDate());
                $def.resolve(context);
            })
            return $def.promise();
        },
        loadTasks:function(context){
        var context=context||this;
            var $def = $.Deferred();
            var xuanzeClick = function (e) {
                var xuanze = $(this);
                var li = xuanze.closest("li");
                if (xuanze.hasClass("active")) {
                    window.app.asyncTasks.push({
                        key: xuanze.closest("li").data("key"),
                        content: xuanze.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop:xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                    })

                    if (li.find(".icon-zhiding").hasClass("active")) {
                        $("#task-list-high>ul").append(li);
                    } else {
                        $("#task-list-normal>ul").append(li);
                    }
                } else {
                    window.app.asyncTasks.push({
                        key: xuanze.closest("li").data("key"),
                        content: xuanze.closest("li").find(".content").text(),
                        taskStatus: "已完成",
                        isTop:xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                    });
                    $("#task-list-done>ul").append(li);
                }
                xuanze.toggleClass("active");
                context.toggleDoneList();
                context.asyncTasks();
            };

            var zhidingClick=function(e){
                var zhiding=$(this);
                var li=zhiding.closest("li");
                if(zhiding.hasClass("active")){
                    window.app.asyncTasks.push({
                        key:zhiding.closest("li").data("key"),
                        content:zhiding.closest("li").find(".content").text(),
                        taskStatus:"进行中",
                        isTop:false,
                    })
                    $("#task-list-normal>ul").append(li);
                }else{
                    window.app.asyncTasks.push({
                        key: zhiding.closest("li").data("key"),
                        content: zhiding.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop:true,
                    });
                    $("#task-list-high>ul").append(li);
                }
                zhiding.toggleClass("active");
                context.asyncTasks();
            };
            $.ajax({
                url: window.app.apiUrl + "task",
                type: "post",
                dataType: "json",
                contextType: "application/json",
                beforeSend: window.app.beforeSend,
                data: {
                    "act": "getTodayTasks",
                    "str": "",
                },
                success: function (response) {
                    if (response.Success) {

                        if(response.Data.TopTasks&&response.Data.TopTasks.length>0){
                           var highContainer= $("#task-list-high ul");
                           $.each(response.Data.TopTasks,function(index,ele){
                                var parseTemp="<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 20px;'><i title='置顶' class='icon iconfont icon-zhiding active'></i></div></li>";
                                var liHtml=mus.render(parseTemp,{key:ele.key,content:ele.content});
                                highContainer.append(liHtml);
                               $("li[data-key='"+ele.key+"']").find(".icon-xuanze").bind("click", xuanzeClick);
                               $("li[data-key='"+ele.key+"']").find(".icon-zhiding").bind("click", zhidingClick);
                           });
                        }
                        if(response.Data.NormalTasks&&response.Data.NormalTasks.length>0){
                            var normalContainer= $("#task-list-normal ul");
                            $.each(response.Data.NormalTasks,function(index,ele){
                                var parseTemp="<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 20px;'><i title='置顶' class='icon iconfont icon-zhiding'></i></div></li>";
                                var liHtml=mus.render(parseTemp,{key:ele.key,content:ele.content});
                                normalContainer.append(liHtml);
                                $("li[data-key='"+ele.key+"']").find(".icon-xuanze").bind("click", xuanzeClick);
                                $("li[data-key='"+ele.key+"']").find(".icon-zhiding").bind("click", zhidingClick);
                            });
                        }
                        if(response.Data.DoneTasks&&response.Data.DoneTasks.length>0){
                            var doneContainer= $("#task-list-done ul");
                            $.each(response.Data.DoneTasks,function(index,ele){
                                var parseTemp="<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze active'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 20px;'><i title='置顶' class='icon iconfont icon-zhiding {{isTop}}'></i></div></li>";
                                var liHtml=mus.render(parseTemp,{key:ele.key,content:ele.content,isTop:ele.isTop?"active":""});
                                doneContainer.append(liHtml);
                                $("li[data-key='"+ele.key+"']").find(".icon-xuanze").bind("click", xuanzeClick);
                                $("li[data-key='"+ele.key+"']").find(".icon-zhiding").bind("click", zhidingClick);
                            });
                            context.toggleDoneList();
                        }

                        $def.resolve(context);
                    } else {
                        $def.reject();
                        console.log(response.Message);
                        context.doneAsyncAnimation(false,"同步失败！");
                    }
                },
                error: function () {
                    $def.reject();
                    alert("任务获取失败！")
                }
            });
             return $def.promise();


        },
        startAsyncAnimation: function () {
            var asyncContainer = $("#today-task-async");
            var asyncIcon = asyncContainer.find(".icon-tongbu");
            asyncIcon.addClass("asyncAnimation");
        },
        doneAsyncAnimation: function (isAsync,text) {
            var asyncContainer = $("#today-task-async");
            var asyncIcon = asyncContainer.find(".icon-tongbu");
            asyncIcon.removeClass("asyncAnimation");
            asyncContainer.find(".asyncNotify").text(text);
            if(isAsync){
                var holdLength=window.app.holdTasks.length;
                window.app.holdTasks.splice(0,holdLength);
                window.app.asyncTasks.splice(0,holdLength);
            }
            setTimeout(function () {
                $("#today-task-async .asyncNotify").text("");
            }, 3000);
        },
        toggleDoneList:function(){
            $("#task-list-done ul li .icon-zhiding").hide();
            $("#task-list-normal ul li .icon-zhiding").show();
            $("#task-list-high ul li .icon-zhiding").show();
            if($("#task-list-done ul li").length>0){

                $("#task-list-done .line-bar").show();
                if($("#task-list-done .line-bar .icon").hasClass("icon-arrowright")){
                    $("#task-list-done ul").hide();
                }else{
                    $("#task-list-done ul").show();
                }

            }else{
                $("#task-list-done .line-bar").hide();
            }
        },
        asyncTasks: function () {
            var context = this;
            context.startAsyncAnimation();
            if(window.app.holdTasks.length==0){
                window.app.holdTasks=window.app.holdTasks.concat(window.app.asyncTasks);
            }
            $.ajax({
                url: window.app.apiUrl + "task",
                type: "post",
                dataType: "json",
                contextType: "application/json",
                beforeSend: window.app.beforeSend,
                data: {
                    "act": "asyncTasks",
                    "str": JSON.stringify({tasks: window.app.holdTasks}),
                },
                success: function (response) {
                    if (response.Success) {
                        context.doneAsyncAnimation(true,"同步成功！");
                    } else {
                        console.log(response.Message);
                        context.doneAsyncAnimation(false,"同步失败！");
                    }
                },
                error: function () {
                    context.doneAsyncAnimation(false,"同步失败！");
                }
            })
        },
        bindEvents: function (context) {
            context = context || this;
            var $def = $.Deferred();

            var xuanzeClick = function (e) {
                var xuanze = $(this);
                var li = xuanze.closest("li");
                if (xuanze.hasClass("active")) {
                    window.app.asyncTasks.push({
                        key: xuanze.closest("li").data("key"),
                        content: xuanze.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop:xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                    })

                    if (li.find(".icon-zhiding").hasClass("active")) {
                        $("#task-list-high>ul").append(li);
                    } else {
                        $("#task-list-normal>ul").append(li);
                    }
                } else {
                    window.app.asyncTasks.push({
                        key: xuanze.closest("li").data("key"),
                        content: xuanze.closest("li").find(".content").text(),
                        taskStatus: "已完成",
                        isTop:xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                    });
                    $("#task-list-done>ul").append(li);
                }
                xuanze.toggleClass("active");
                context.toggleDoneList();
                context.asyncTasks();
            };

            var zhidingClick=function(e){
                var zhiding=$(this);
                var li=zhiding.closest("li");
                if(zhiding.hasClass("active")){
                    window.app.asyncTasks.push({
                        key:zhiding.closest("li").data("key"),
                        content:zhiding.closest("li").find(".content").text(),
                        taskStatus:"进行中",
                        isTop:false,
                    })
                    $("#task-list-normal>ul").append(li);
                }else{
                    window.app.asyncTasks.push({
                        key: zhiding.closest("li").data("key"),
                        content: zhiding.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop:true,
                    });
                    $("#task-list-high>ul").append(li);
                }
                zhiding.toggleClass("active");
                context.asyncTasks();
            };

            $(context.inputNewTask).bind("keyup", function (e) {
                var thisInput = $(this);
                if (e.keyCode == 13) {
                    if (!thisInput.val()) {
                        return;
                    }
                    var key = window.Guid();
                    var value = thisInput.val();
                    var parseTemp = "<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 20px;'><i title='置顶' class='icon iconfont icon-zhiding'></i></div></li>"
                    var liHtml = mus.render(parseTemp, {key: key, content: value});
                    $("#task-list-normal>ul").append(liHtml);
                    var task = {
                        key: key,
                        content: value,
                        taskStatus: "未开始",
                        isTop:false,
                    };
                    window.app.asyncTasks.push(task);
                    $("li[data-key='"+key+"']").find(".icon-xuanze").bind("click", xuanzeClick);
                    $("li[data-key='"+key+"']").find(".icon-zhiding").bind("click", zhidingClick);
                    context.asyncTasks();
                    thisInput.val("");
                }
            });

            $("#task-done-toggle").bind("click",function(e){
               if($(this).find(".icon").hasClass("icon-arrowright")){
                   $(this).find(".icon").removeClass("icon-arrowright").addClass("icon-right");
                   $("#task-list-done ul").show();
               }else{
                   $(this).find(".icon").removeClass("icon-right").addClass("icon-arrowright");
                   $("#task-list-done ul").hide();
               }
            });

            $(context.tabTask).bind("click", function (e) {
                if ($(this).hasClass("active")) {
                    $(this).addClass("active");
                }
                $("#" + $(this).data('target')).show();
            });

            $(context.tabReview).bind("click", function (e) {
                alert("功能暂未开放O(∩_∩)O");
            });

            $def.resolve();
            return $def.promise();

        },
        install: function () {
            this.loadHtml().then(this.loadTasks).then(this.bindEvents);
        },
        unstall: function (context) {
            context = context || this;
            $(context.inputNewTask).unbind();
        }
    }
    return new TaskPage();
})