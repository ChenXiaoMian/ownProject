$(function(){
    // console.log($(".containerInner").height());
    $("body").scrollTop(0);
    var $searchBar = $('#searchBar'),
        $searchResult = $('#searchResult'),
        $searchNothing = $('#searchNothing'),
        $searchInput = $('#searchInput'),
        $searchClear = $('#searchClear'),
        $searchCancel = $('#searchCancel'),
        $searchKey = '';
    // console.log(pageManager.pageOther);
    //获取搜索关键字
    console.log($.type(pageManager));
    if($.type(pageManager)=='undefined') window.pageManager.go('home');

    $searchKey = pageManager.pageOther ? pageManager.pageOther : '';
    pageManager.searchAux=null;
    if($searchKey=='') window.pageManager.go('home');
    // 根据关键字获取对应链接
    var getUrl = function(val){
        var url = '';
        switch(val){
            case 'market':
                url = '/likeMarket';
                break;
            case 'medicine':
                url = '/likeMedicine';
                break;
            case 'base':
                url = '/likeBase';
                break;
            case 'grower':
                url = '/likeGrower';
                break;
            case 'manufacturer':
                url = '/likeManufacturer';
                break;
        }
        return url;
    };

    function hideSearchResult(){
        $searchResult.hide();
        $searchBar.removeClass('weui-search-bar_focusing');
        $searchInput.val('');
        $("#keyword").text("");
        $searchNothing.hide();
    }
    function cancelSearch(){
        hideSearchResult();
        $searchBar.removeClass('weui-search-bar_focusing');
    }

    function searchInterface(url,field,val){
        var jsonData = {};
        jsonData.userName = store.get('loginName');
        jsonData.password = store.get('password');
        jsonData[field] = val;
        $.ajax({
            url: $kmurl+url,
            type:"GET",
            contentType: 'application/json;charset=utf-8',
            dataType:"jsonp",
            jsonp:"jsoncallback",
            data:{"parms":JSON.stringify(jsonData)},
            success:function(response){
                if(response.result == 'success' && !isEmpty(JSON.parse(response.message))){
                    var data = JSON.parse(response.message),
                        resultStr = '';
                    $searchResult.html("");
                    $.each(data,function(index,item){
                        switch(field){
                            case 'market':
                                resultStr +='<a class="weui-cell weui-cell_access searchbar-item" data-id="'+item.market_id+'" data-name="'+item.market_name+'"  href="javascript:;"><div class="weui-cell__bd weui-cell_primary"><p>'+item.market_name+'</p></div><div class="weui-cell__ft"></div></a>';
                                break;
                            case 'medicine':
                                resultStr +='<a class="weui-cell weui-cell_access searchbar-item" data-id="'+item.medicine_id+'" data-name="'+item.medicine_name+'"  href="javascript:;"><div class="weui-cell__bd weui-cell_primary"><p>'+item.medicine_name+'</p></div><div class="weui-cell__ft"></div></a>';
                                break;
                            case 'base':
                                resultStr +='<a class="weui-cell weui-cell_access searchbar-item" data-id="'+item.base_id+'" data-name="'+item.base_name+'"  href="javascript:;"><div class="weui-cell__bd weui-cell_primary"><p>'+item.base_name+'</p></div><div class="weui-cell__ft"></div></a>';
                                break;
                            case 'grower':
                                resultStr +='<a class="weui-cell weui-cell_access searchbar-item" data-id="'+item.grower_id+'" data-name="'+item.grower_name+'"  href="javascript:;"><div class="weui-cell__bd weui-cell_primary"><p>'+item.grower_name+'</p></div><div class="weui-cell__ft"></div></a>';
                                break;
                        }
                    });
                    $searchNothing.hide();
                    $searchResult.html(resultStr).show();
                }else{
                    $("#keyword").text($.trim($searchInput.val()));
                    $searchNothing.show();
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log("输入参数错误，请核对！");
                $("#keyword").text($.trim($searchInput.val()));
                $searchNothing.show();
            }
        });
    }
    // 合并请求提交、代理模式
    var proxySearchInterface = (function(){
        var cache = [],
            timer;
        return function(val){
            if(timer) return;
            timer = setTimeout(function(){
                searchInterface(getUrl($searchKey),$searchKey,$.trim($searchInput.val()));
                clearTimeout(timer);
                timer = null;
            },1000);
        }
    })();

    $searchResult.on('click','.searchbar-item',function(e){
        stopBubble(e);e.preventDefault();// 阻止冒泡
        if(window.pageManager){
            var data = {
                id: $(this).data("id"),
                name: $(this).data("name"),
            }
            store.remove($searchKey);
            store.set($searchKey,JSON.stringify(data));
            window.pageManager.back($searchKey);
        }
    });

    $searchInput
        .on('blur', function () {
            if(!this.value.length) cancelSearch();
        })
        .on('input propertychange', function(){
            if(this.value.length) {
                $searchBar.addClass('weui-search-bar_focusing');
                proxySearchInterface();
            }else{
                $searchResult.hide();
            }
        });
    ;
    $searchClear.on('click', function(){
        hideSearchResult();
        $searchInput.focus();
    });
    $searchCancel.on('click', function(){
        cancelSearch();
        $searchInput.blur();
    });
});