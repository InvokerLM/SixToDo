;
define(["jquery", "mustache"], function ($, mus) {
    var DropDownList = function (ele, opts) {
        this.element = $(ele);
        this.options = $.extend({}, DropDownList.DEFAULTS, opts);
        this.searchResultListId = "dropDownResult" + new Date().getTime();
        this.listWraper = mus.render(this.options.listWraperTemp, {id: this.searchResultListId});
        this.liContent = "";
        this.selectItems = [];
    };

    DropDownList.prototype.initDropDownList = function () {
        $("body").append(this.listWraper);
        var $self = this;
        var $inputElement = this.element;
        var $listElement = $("#" + this.searchResultListId);
        var liTemp = this.options.liTemp;
        var defaultValue = this.options.defaultValue;
        var selectItems = this.selectItems;
        var dataSource = this.options.dataSource;
        var ajaxLoad = this.options.ajaxLoad;
        var valueSeted = this.options.valueSeted;
        var searchTimer = undefined;
        var selectFunc = this.options.onSelect;
        $inputElement.data('role', "stdDropDownList");

        function delaySearch(callBack) {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(callBack, 500);
        }

        //input元素输入响应
        if (ajaxLoad) {
            //异步数据加载模式
            $inputElement.bind('keyup', function () {
                delaySearch(function () {
                    var $val = $inputElement.val();
                    $.ajax({
                        url: dataSource,
                        type: "post",
                        dataType: "json",
                        contextType: "application/json",
                        beforeSend: window.app.beforeSend,
                        data: {
                            "act": "getTeamMates",
                            "str": JSON.stringify({text: $val}),
                        },
                        success: function (response) {
                            $listElement.find('ul').html('');
                            if (response.Success) {
                                $.each(response.Data.Items, function (index, ele) {
                                    var liEle = mus.render(liTemp, {value: ele.Value, text: ele.Text});
                                    $listElement.find('ul').append(liEle);
                                });
                                if (response.Data.More) {
                                    var liEle = mus.render(liMoreTemp, {value: -1, text: "加载更多..."});
                                    $listElement.find('ul').append(liEle);
                                }
                                $listElement.css({
                                    "top": $inputElement.offset().top + $inputElement[0].offsetHeight,
                                    "left": $inputElement.offset().left,
                                    "position": "absolute",
                                    "width": 'auto',
                                    'min-width': $inputElement[0].offsetWidth,
                                }).show();
                                $listElement.find('li').click(function (e) {
                                    var selectItem = {value: $(this).data('val'), text: $(this).text()};
                                    selectItems.splice(0,selectItems.length);
                                    selectItems.push(selectItem);
                                    $inputElement.val(selectItem.text).data('value',selectItem.value);
                                    e.item = selectItem;
                                    if (!$listElement.is(":hidden")) {
                                        $listElement.hide();
                                    }
                                    selectFunc(e);
                                })
                            }else{
                                $listElement.hide();
                            }
                        },
                        error: function () {

                        }
                    })
                })
            });
        }

        $(document).click(function (e) {
            if ($(e.target).closest("div.std-dropdownListContainer").length == 0) {
                if (!$listElement.is(":hidden")) {
                    $listElement.hide();
                }
            }
        });
    };

    //获取选中项
    DropDownList.prototype.Item = function () {
        return this.selectItems[0];
    };

    DropDownList.prototype.setItem=function(item){
        this.selectItems.splice(0,this.selectItems.length);
        this.selectItems.push(item);
        this.element.val(item.text).data('value',item.value);
        var e={
            item:{
                text:item.text,
                value:item.value,
            }
        }
        this.options.onSelect(e);
    }


    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("std.DropDownList");
            var options = typeof option === 'object' && option;
            if (!data) {
                $this.data('std.DropDownList', (data = new DropDownList(this, options)));
                data.initDropDownList();
            }
        });
    }

    var old = $.fn.stdDropDownList;
    $.fn.stdDropDownList = Plugin;
    $.fn.stdDropDownList.Constructor = DropDownList;
    $.fn.stdDropDownList.noConflict = function () {
        $.fn.stdDropDownList = old;
        return this;
    };

    DropDownList.DEFAULTS = {
        ajaxLoad: true,
        dataSource: {},
        listWraperTemp: "<div class='std-dropdownListContainer' style='display: none' id='{{id}}'><ul>{{liContent}}</ul></div>",
        liTemp: "<li data-val='{{value}}'>{{text}}</li>",
        liMoreTemp:"<li class='std-dropdownMoreItem' data-val='{{value}}'>{{text}}</li>",
        onSelect: function (element) {

        }
    };
    return true;
});