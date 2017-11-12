;
define(["jquery", "mustache", "std","datetime"], function ($, mus, std,timepicker) {
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
            this.syncStatus={
                待处理:0,
                处理中:1,
                已完成:2
            }
        },
        loadHtml: function () {
            var $def = $.Deferred();
            var context = this;
            var container = context.container;
            nw.Window.get().resizeBy(0,50);
            $.get(context.pageUrl, function (temp) {
                var renderPage = mus.render(temp);
                container.html(renderPage);
                $("#nowDate").text(window.showDate());
                $def.resolve(context);
            })
            return $def.promise();
        },
        loadTasks:function(context){
            var context = context || this;
            var $def = $.Deferred();
            var xuanzeClick = function (e) {
                var xuanze = $(this);
                var li = xuanze.closest("li");
                if (xuanze.hasClass("active")) {
                    window.app.asyncTasks.push({
                        key: xuanze.closest("li").data("key"),
                        content: xuanze.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop: xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                        pushStatus:context.syncStatus.待处理,
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
                        isTop: xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                        pushStatus:context.syncStatus.待处理,
                    });
                    $("#task-list-done>ul").append(li);
                }
                xuanze.toggleClass("active");
                context.toggleDoneList();
                context.asyncTasks();
            };

            var zhidingClick = function (e) {
                var zhiding = $(this);
                var li = zhiding.closest("li");
                if (zhiding.hasClass("active")) {
                    window.app.asyncTasks.push({
                        key: zhiding.closest("li").data("key"),
                        content: zhiding.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop: false,
                        pushStatus:context.syncStatus.待处理,
                    })
                    $("#task-list-normal>ul").append(li);
                } else {
                    window.app.asyncTasks.push({
                        key: zhiding.closest("li").data("key"),
                        content: zhiding.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop: true,
                        pushStatus:context.syncStatus.待处理,
                    });
                    $("#task-list-high>ul").append(li);
                }
                zhiding.toggleClass("active");
                context.asyncTasks();
            };

            var moreClick=function(e){
                var  more= $(this);
                var li=more.closest("li");
                var key = li.data("key");
                $("#morePanel").data("target",key).css({
                    "top": more.offset().top + more[0].offsetHeight,
                    "left": li.offset().left,
                    "position": "absolute",
                    "width": 'auto',
                    'min-width': li[0].offsetWidth,
                }).show();
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
                        if (response.Data.TodaySummary) {
                            $("#summary-text").val(response.Data.TodaySummary);
                        }
                        if (response.Data.TopTasks && response.Data.TopTasks.length > 0) {
                            var highContainer = $("#task-list-high ul");
                            $.each(response.Data.TopTasks, function (index, ele) {
                                var parseTemp = "<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 40px;'><i title='置顶' class='icon iconfont icon-zhiding active'></i><i title='更多' class='icon iconfont icon-gengduo'></i></div></li>";
                                var liHtml = mus.render(parseTemp, {key: ele.key, content: ele.content});
                                highContainer.append(liHtml);
                                $("li[data-key='" + ele.key + "']").find(".icon-xuanze").bind("click", xuanzeClick);
                                $("li[data-key='" + ele.key + "']").find(".icon-zhiding").bind("click", zhidingClick);
                                $("li[data-key='" + ele.key + "']").find(".icon-gengduo").bind("click", moreClick);
                            });
                        }
                        if (response.Data.NormalTasks && response.Data.NormalTasks.length > 0) {
                            var normalContainer = $("#task-list-normal ul");
                            $.each(response.Data.NormalTasks, function (index, ele) {
                                var parseTemp = "<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 40px;'><i title='置顶' class='icon iconfont icon-zhiding'></i><i title='更多' class='icon iconfont icon-gengduo'></i></div></li>";
                                var liHtml = mus.render(parseTemp, {key: ele.key, content: ele.content});
                                normalContainer.append(liHtml);
                                $("li[data-key='" + ele.key + "']").find(".icon-xuanze").bind("click", xuanzeClick);
                                $("li[data-key='" + ele.key + "']").find(".icon-zhiding").bind("click", zhidingClick);
                                $("li[data-key='" + ele.key + "']").find(".icon-gengduo").bind("click", moreClick);
                            });
                        }
                        if (response.Data.DoneTasks && response.Data.DoneTasks.length > 0) {
                            var doneContainer = $("#task-list-done ul");
                            $.each(response.Data.DoneTasks, function (index, ele) {
                                var parseTemp = "<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze active'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 20px;'><i title='置顶' class='icon iconfont icon-zhiding {{isTop}}'></i></div></li>";
                                var liHtml = mus.render(parseTemp, {
                                    key: ele.key,
                                    content: ele.content,
                                    isTop: ele.isTop ? "active" : ""
                                });
                                doneContainer.append(liHtml);
                                $("li[data-key='" + ele.key + "']").find(".icon-xuanze").bind("click", xuanzeClick);
                                $("li[data-key='" + ele.key + "']").find(".icon-zhiding").bind("click", zhidingClick);
                            });
                            context.toggleDoneList();
                        }
                        $def.resolve(context);
                    } else {
                        $def.reject();
                        console.log(response.Message);
                        context.doneAsyncAnimation(false, "同步失败！");
                    }
                },
                error: function () {
                    $def.reject();
                    alert("任务获取失败！")
                }
            });
            return $def.promise();
        },
        loadComponent:function(context){
            var context = context || this;
            var $def = $.Deferred();
            $("#startTime").datetimepicker({
                datepicker:false,
                format:'H:i',
                step:30
            });
            $("#endTime").datetimepicker({
                datepicker:false,
                format:'H:i',
                step:30
            });

            function checkTime(i)
            {
                if (i<10)
                {i="0" + i}
                return i
            }

            var showTime=function(time){
                var h=time.getHours();
                var m=checkTime(time.getMinutes());
                return h+":"+m;
            }

            $("#timeSetBtn").click(function(e){
                var key=$("#morePanel").data('target');
                var time=showTime($("#startTime").data('xdsoft_datetimepicker').getValue())+"-"+showTime($("#endTime").data('xdsoft_datetimepicker').getValue());
                if(key){
                    var li=$("[data-key='"+key+"']");
                    var lastIndex=li.find('.content').text().indexOf("[");
                    var oriContent=li.find('.content').text();
                    var newContent=lastIndex>0?oriContent.substring(0,lastIndex)+" ["+time+"]":oriContent+" ["+time+"]";
                    var isTop=li.find('.icon-zhiding').hasClass("active");
                    li.find(".content").text(newContent);
                    window.app.asyncTasks.push({
                        key: key,
                        content:newContent,
                        taskStatus: "进行中",
                        isTop: isTop,
                        pushStatus:context.syncStatus.待处理,
                    });
                    context.asyncTasks();
                }
                $("#morePanel").hide();
            });

            $(document).click(function (e) {
                if ($(e.target).closest("#morePanel").length == 0) {
                    if (!$("#morePanel").is(":visible")) {
                        $("#morePanel").hide();
                    }
                }
            });
            $def.resolve(context);
            return $def.promise();
        },
        initPage: function (context) {
               return context.loadTasks(context).then(context.loadComponent);
        },
        startAsyncAnimation: function () {
            var asyncContainer = $("#today-task-async");
            var asyncIcon = asyncContainer.find(".icon-tongbu");
            asyncIcon.addClass("asyncAnimation");
        },
        doneAsyncAnimation: function (isAsync, text) {
            var asyncContainer = $("#today-task-async");
            var asyncIcon = asyncContainer.find(".icon-tongbu");
            asyncIcon.removeClass("asyncAnimation");
            asyncContainer.find(".asyncNotify").text(text);
            setTimeout(function () {
                $("#today-task-async .asyncNotify").text("");
            }, 3000);
        },
        toggleDoneList: function () {
            $("#task-list-done ul li .icon-zhiding").hide();
            $("#task-list-normal ul li .icon-zhiding").show();
            $("#task-list-high ul li .icon-zhiding").show();
            $("#task-list-done ul li .icon-gengduo").hide();
            $("#task-list-normal ul li .icon-gengduo").show();
            $("#task-list-high ul li .icon-gengduo").show();
            if ($("#task-list-done ul li").length > 0) {

                $("#task-list-done .line-bar").show();
                if ($("#task-list-done .line-bar .icon").hasClass("icon-arrowright")) {
                    $("#task-list-done ul").hide();
                } else {
                    $("#task-list-done ul").show();
                }
            } else {
                $("#task-list-done .line-bar").hide();
            }
        },
        asyncTasks: function () {
            var context = this;
            context.startAsyncAnimation();
            var pushTime=(new Date()).valueOf();
            var pushTasks=[];
            $.each(window.app.asyncTasks,function(index,ele){
               if(ele.pushStatus==context.syncStatus.待处理){
                   ele.pushStatus=context.syncStatus.处理中;
                   pushTasks.push(ele);
               }
            });
            $.ajax({
                url: window.app.apiUrl + "task",
                type: "post",
                dataType: "json",
                contextType: "application/json",
                beforeSend: window.app.beforeSend,
                data: {
                    "act": "asyncTasks",
                    "str": JSON.stringify({tasks: pushTasks}),
                },
                success: function (response) {
                    if (response.Success) {
                        $.each(pushTasks,function(index,ele){
                                ele.pushStatus=context.syncStatus.已完成;
                            }
                        );
                        context.doneAsyncAnimation(true, "同步成功！");
                    } else {
                        $.each(pushTasks,function(index,ele){
                                ele.pushStatus=context.syncStatus.待处理;
                            }
                        );
                        console.log(response.Message);
                        context.doneAsyncAnimation(false, "同步失败！");
                    }
                },
                error: function () {
                    $.each(pushTasks,function(index,ele){
                            ele.pushStatus=context.syncStatus.待处理;
                        }
                    );
                    context.doneAsyncAnimation(false, "同步失败！");
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
                        isTop: xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                        pushStatus:context.syncStatus.待处理,
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
                        isTop: xuanze.closest("li").find(".icon-zhiding").hasClass("active"),
                        pushStatus:context.syncStatus.待处理,
                    });
                    $("#task-list-done>ul").append(li);
                }
                xuanze.toggleClass("active");
                context.toggleDoneList();
                context.asyncTasks();
            };

            var zhidingClick = function (e) {
                var zhiding = $(this);
                var li = zhiding.closest("li");
                if (zhiding.hasClass("active")) {
                    window.app.asyncTasks.push({
                        key: zhiding.closest("li").data("key"),
                        content: zhiding.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop: false,
                        pushStatus:context.syncStatus.待处理,
                    })
                    $("#task-list-normal>ul").append(li);
                } else {
                    window.app.asyncTasks.push({
                        key: zhiding.closest("li").data("key"),
                        content: zhiding.closest("li").find(".content").text(),
                        taskStatus: "进行中",
                        isTop: true,
                        pushStatus:context.syncStatus.待处理,
                    });
                    $("#task-list-high>ul").append(li);
                }
                zhiding.toggleClass("active");
                context.asyncTasks();
            };

            var moreClick=function(e){
                var  more= $(this);
                var li=more.closest("li");
                var key = li.data("key");
                $("#morePanel").data("target",key).css({
                    "top": more.offset().top + more[0].offsetHeight,
                    "left": li.offset().left,
                    "position": "absolute",
                    "width": 'auto',
                    'min-width': li[0].offsetWidth,
                }).show();
            };

            $(context.inputNewTask).bind("keyup", function (e) {
                var thisInput = $(this);
                var taskAddIcon = $('#task-add-icon');
                if (thisInput.val().length > 0) {
                    taskAddIcon.show();
                } else {
                    taskAddIcon.hide();
                }
                if (e.keyCode == 13) {
                    if (!thisInput.val()) {
                        return;
                    }
                    var key = window.Guid();
                    var value = thisInput.val();
                    var parseTemp = "<li data-key='{{key}}'><div style='width: 20px;'><i title='完成任务' class='icon iconfont icon-xuanze'></i></div><div class='content' style='flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 220px;'>{{content}}</div><div style='width: 40px;'><i title='置顶' class='icon iconfont icon-zhiding'></i><i title='更多' class='icon iconfont icon-gengduo'></i></div></li>"
                    var liHtml = mus.render(parseTemp, {key: key, content: value});
                    $("#task-list-normal>ul").append(liHtml);
                    var task = {
                        key: key,
                        content: value,
                        taskStatus: "未开始",
                        isTop: false,
                        pushStatus:context.syncStatus.待处理,
                    };
                    window.app.asyncTasks.push(task);
                    $("li[data-key='" + key + "']").find(".icon-xuanze").bind("click", xuanzeClick);
                    $("li[data-key='" + key + "']").find(".icon-zhiding").bind("click", zhidingClick);
                    $("li[data-key='" + key + "']").find(".icon-gengduo").bind("click", moreClick);
                    context.asyncTasks();
                    thisInput.val("");
                }
            });

            $("#task-done-toggle").bind("click", function (e) {
                if ($(this).find(".icon").hasClass("icon-arrowright")) {
                    $(this).find(".icon").removeClass("icon-arrowright").addClass("icon-right");
                    $("#task-list-done ul").show();
                } else {
                    $(this).find(".icon").removeClass("icon-right").addClass("icon-arrowright");
                    $("#task-list-done ul").hide();
                }
            });

            $('.tab').bind("click", function (e) {
                $('.tab').removeClass('active');
                $(this).addClass('active');
                $(".tabContent").hide();
                $("#" + $(this).data('target')).show();
            });

            $(context.tabReview).bind("click",function(e){
                function mappingLabel(status){
                    switch (status){
                        case "未开始":
                            return "label-grey";
                        case "进行中":
                            return "label-orange";
                        case "已完成":
                            return "label-green";
                        default:
                            return "label-grey";
                    };



                }
                $("#search-member").stdDropDownList({
                    dataSource: window.app.apiUrl + "Team",
                    onSelect: function (e) {
                        var userId = e.item.value;
                        $('#task-background-content').show();
                        $.ajax({
                            url: window.app.apiUrl + "task",
                            type: "post",
                            dataType: "json",
                            contextType: "application/json",
                            beforeSend: window.app.beforeSend,
                            data: {
                                "act": "viewTodayTask",
                                "str": JSON.stringify({userId: userId}),
                            },
                            success: function (response) {
                                if (response.Success) {
                                    $('#task-background-content').hide();
                                    $("#task-view-summary").html("");
                                    $("#task-view-summary").append("<span>总结：</span><br>");
                                    $("#task-view-summary").append("<span>"+response.Data.SummaryInfo+"</span>");
                                    $('#task-view-items').find('ul').html('');
                                    $.each(response.Data.TaskItems, function (index, ele) {
                                        var liTemp = mus.render("<li><div style='width: 20px;'>{{index}}、</div><div class=\"content\" style=\"flex: 1;text-align: left;word-wrap: break-word;padding: 0 6px;width: 210px;\">{{content}}</div><div style='width: 40px;' class='label {{labelClass}}'>{{status}}</div></li>", {
                                            index: ele.Index,
                                            content: ele.TaskInfo,
                                            status: ele.Status,
                                            labelClass:mappingLabel(ele.Status),
                                        })
                                        $('#task-view-items').find('ul').append(liTemp);
                                    });
                                } else {
                                    console.log(response.Message);
                                    //layer.msg('更新失败', {icon: 2});
                                }
                            },
                            error: function () {
                                //layer.msg('网络或服务器异常', {icon: 2});
                            }
                        })
                    }
                })

                $("#search-member").data("std.DropDownList").setItem({text:window.app.userInfo.name,value:window.app.userInfo.accountId});
            });

            $("#summary-commit").bind("click", function (e) {
                    var sumText = $('#summary-text').val();
                    $.ajax({
                        url: window.app.apiUrl + "task",
                        type: "post",
                        dataType: "json",
                        contextType: "application/json",
                        beforeSend: window.app.beforeSend,
                        data: {
                            "act": "updateTodaySummary",
                            "str": JSON.stringify({summaryText: sumText}),
                        },
                        success: function (response) {
                            if (response.Success) {
                                alert("总结提交成功!");
                            } else {
                                console.log(response.Message);
                                alert("总结提交失败！");
                            }
                        },
                        error: function () {
                            alert("网络或服务器异常！");
                        }
                    });
                }
            );


            $def.resolve();
            return $def.promise();

        },
        install: function () {
            this.loadHtml().then(this.initPage).then(this.bindEvents);
        },
        unstall: function (context) {
            context = context || this;
            $(context.inputNewTask).unbind();
        }
    }
    return new TaskPage();
})