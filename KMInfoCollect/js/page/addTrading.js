// 贸易采集逻辑
$(function(){
    var userName = store.get('userName'),
        nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $iosDialog = $('.js_dialog'),
        $getStandard = '';
    $(".getUserName").text(store.get('userName'));
    $(".getNow").text(nowTime);

    init();
    // 初始化
    function init(){
      store.remove('seatempTrading');
      store.remove('market');
      store.remove('medicine');
      store.remove('base');
      store.remove('standard');
      initSearch('.sText-market','.sVal-market','关键字/市场名称');
      initSearch('.sText-medicine','.sVal-medicine','关键字/中药材名称');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
      $("select[name='Scale'],select[name='MedicineType'],select[name='PriceTendency'],select[name='MarketStatus'],select[name='Standard']").find('option').removeAttr('selected');
      $("select[name='Standard']").empty();
      $("input[name='priceRange']").prop("disabled",true).val("");
      $(".getChooseTemp").text('默认模板').removeClass('c-3dbaff').addClass('c-c7c7c7');
    }

    // 选择模板后加载对应数据
    function loadTemp(tid){
        var data = {};
        $.each(JSON.parse(store.get('tempTrading')).data,function(index,item){
            if(item.tid == tid) data = item;
        });

        $("select[name='Scale'],select[name='MedicineType']").find('option').removeAttr('selected');
        $("select[name='Scale']").find('option[value="'+data.Scale+'"]').prop('selected',true);
        $("select[name='MedicineType']").find('option[value="'+data.MedicineType+'"]').prop('selected',true);
        $("input[name='MerchantName']").val(data.MerchantName);
        // 获取药材规格
        if(data.StandardStr!=''){
            var standard = data.StandardStr,
                arr = [],
                strs = '';
            arr = standard.split(",");
            $.each(arr,function(index,item){
                strs+='<option value="'+item+'">'+item+'</option>';
            });
            $(".innerType").find("select[name='Standard']").each(function(){
                $(this).empty();
                $(this).html(strs);
            });
        }else{
            $(".innerType").find("select[name='Standard']").each(function(){
                $(this).empty();
            });
        }
        changeSearch('.sText-market','.sVal-market',data.Market);
        changeSearch('.sText-medicine','.sVal-medicine',data.Medicine);
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        $(".weui-textarea").val(data.Addition);
        clearSearch('.sVal-market');
        clearSearch('.sVal-medicine');
        clearSearch('.sVal-base');
    }
    // 验证所需
    var regexp = {
        regexp: {
            IDNUM: /(?:^\d{15}$)|(?:^\d{18}$)|^\d{17}[\dXx]$/,
            VCODE: /^.{4}$/
        }
    };
    weui.form.checkIfBlur('#form-trading', regexp);
    // 上传按钮
    $('#form-trading-submit').on('click',function () {
        weui.form.validate('#form-trading', function (error){
            if (!error) {
                // 组织数据
                var jsonData = {},
                    formData = $("#form-trading").serializeArray(),
                    $form = $(".innerType form");
                jsonData.UserName = store.get('loginName');
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Addition = $("textarea[name='Addition']").val();

                if($form.length>1){
                    // 价格校验
                    var verrArr = [];
                    $form.each(function(index){
                        weui.form.validate($(this), function (error){
                            if(error) verrArr.push(error);
                        });
                    });
                    if(verrArr.length>0){
                        return false;
                    }
                    // 多种规格
                    var cache = [],
                        errorArr = [];
                    $form.each(function(index){
                        var data = $(this).serializeArray(),
                            values = {};
                        for (var item in data) {
                            values[data[item].name] = data[item].value;
                        }
                        cache.push(values);
                    });
                    jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");
                    var loading = weui.loading('上传中...');
                    $.each(cache,function(index,item){
                        var _jsonData = cloneObj(jsonData);
                        $.extend(_jsonData,item);
                        $.extend(_jsonData,{hid:'',cUserName:''});
                        // console.log(_jsonData);
                        $.ajax({
                            url: $kmurl+'/saveTradeJSONP',
                            type:"GET",
                            contentType: 'application/json; charset=utf-8',
                            dataType:"jsonp",
                            jsonp:"jsoncallback",
                            data:{"parms":JSON.stringify(_jsonData)},
                            success:function(response){
                                _jsonData.hid = new Date().getTime();
                                _jsonData.cUserName = store.get('userName');
                                //增加历史记录
                                if(store.get('histTrading') && store.get('histTrading')!=''){
                                    // 更新
                                    var history = JSON.parse(store.get('histTrading'));
                                    history.data.unshift(_jsonData);
                                    store.remove('histTrading');
                                    store.set('histTrading',JSON.stringify(history));
                                }else{
                                    // 新建
                                    var historyData = {data : []};
                                    historyData.data.unshift(_jsonData);
                                    store.set('histTrading',JSON.stringify(historyData));
                                }
                                _jsonData = null;
                            },
                            error: function(jqXHR, textStatus, errorThrown){
                                errorArr.push(errorThrown);
                                _jsonData = null;
                            }
                        });

                    });
                    if(errorArr.length>0){
                        loading.hide();
                        weui.toast('上传失败', 2000);
                        console.log(errorArr);
                    }else{
                        loading.hide();
                        weui.toast('上传成功', 2000);
                    }
                    init();
                }else{
                    weui.form.validate('#innerType1', function (error){
                        if(!error){
                            // 单种规格
                            var typeData = $("#innerType1").serializeArray();
                            $.each(typeData,function(key,value){
                                jsonData[value.name] = value.value;
                            });
                            jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");
                            var loading = weui.loading('上传中...');
                            uploader(jsonData,'/saveTradeJSONP',function(){
                                jsonData.hid = new Date().getTime();
                                jsonData.cUserName = store.get('userName');
                                //增加历史记录
                                if(store.get('histTrading') && store.get('histTrading')!=''){
                                    // 更新
                                    var history = JSON.parse(store.get('histTrading'));
                                    history.data.unshift(jsonData);
                                    store.remove('histTrading');
                                    store.set('histTrading',JSON.stringify(history));
                                }else{
                                    // 新建
                                    var historyData = {data : []};
                                    historyData.data.unshift(jsonData);
                                    store.set('histTrading',JSON.stringify(historyData));
                                }
                                // console.log(jsonData);
                                init();
                                document.formTrading.reset();
                                document.innerType1.reset();
                            });
                        }
                    });
                }

            }
        }, regexp);
    });
    function validateTemp(){
        var args = arguments,
            cache = [];
        $.each(args,function(index,item){
            var dom = $("input[name='"+item+"']");
            if($.trim(dom.val())==''){
                weui.topTips(dom.attr("emptyTips"));
                return false;
            }else{
                cache.push(item);
            }
        });
        if(cache.length === args.length){
            return true;
        }else{
            return false;
        }

    }
    // 存为模板按钮
    $('#open-temp-dialog').on('click',function () {
        // 判断用户是否选择模板
        var tempId = $(".getChooseTemp").data("tid");
        if(validateTemp('Market','Medicine','BaseName')){
            if(tempId&&tempId!=''){
                // 存为模板更新操作
                var oldData = {
                    Market: $("input[name='Market']").val(),
                    MerchantName: $("input[name='MerchantName']").val(),
                    Scale: $("select[name='Scale']").val(),
                    Medicine: $("input[name='Medicine']").val(),
                    BaseName: $("input[name='BaseName']").val(),
                    MedicineType: $("select[name='MedicineType']").val(),
                    StandardStr: store.get('StandardStr'),
                    Addition: $.trim($("textarea[name='Addition']").val()),
                };
                var json = JSON.parse(store.get('tempTrading')),
                    eindex = 0,
                    jsonData = {};
                $.each(json.data,function(index,item){
                    if(item.tid == tempId){
                        eindex = index;
                        jsonData = item;
                    }
                });
                $.extend(jsonData, oldData);
                json.data.splice(eindex,1,jsonData);
                var loading = weui.loading('保存中...');
                store.remove('tempTrading');
                store.set('tempTrading',JSON.stringify(json));
                loading.hide();
                weui.toast('模板保存成功', 500);
            }else{
                $iosDialog.fadeIn(200);
            }
        }
    });
    // 取消关闭弹出框
    $('.js_dialog').on('click', '.weui-dialog__btn_default', function(){
        $(this).parents('.js_dialog').fadeOut(200);
    });

    // 存为模板新建操作
    $("#save-for-temp").on('click',function () {
        if(validateTemp('tempName')){
            $(this).parents('.js_dialog').fadeOut(200);
            var jsonData = {
                IsDefault: '0',
                tempTitle: $("input[name='tempName']").val(),
                Market: $("input[name='Market']").val(),
                MerchantName: $("input[name='MerchantName']").val(),
                Scale: $("select[name='Scale']").val(),
                Medicine: $("input[name='Medicine']").val(),
                BaseName: $("input[name='BaseName']").val(),
                MedicineType: $("select[name='MedicineType']").val(),
                StandardStr: store.get('StandardStr'),
                Addition: $.trim($("textarea[name='Addition']").val()),
                Time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                tid: new Date().getTime()
            };
            var loading = weui.loading('保存中...');
            var $temp = store.get('tempTrading') ? store.get('tempTrading') : '';
            //增加历史记录
            if($temp!='' && !isEmpty(JSON.parse($temp).data)){
                // 更新
                var temp = JSON.parse($temp);
                // 若当前设为默认，clear为0
                temp.data.unshift(jsonData);
                store.remove('tempTrading');
                store.set('tempTrading',JSON.stringify(temp));
            }else{
                // 新建
                var historyData = {
                    data : []
                };
                historyData.data.unshift(jsonData);
                store.set('tempTrading',JSON.stringify(historyData));
            }
            loading.hide();
            weui.toast('模板保存成功', 500);
        }

    });

    // 页面切换数据返回
    $(window).on('hashchange', function(e){
        e.preventDefault();
        var tc = /#tempChoose$/,
            at = /#addTrading$/,
            is = /#itemSearch$/;

        if(tc.test(e.oldURL)&&at.test(e.newURL)){
            // 选择模板返回响应
            var $key = store.get('seatempTrading') ? store.get('seatempTrading') : '';
            if($key!=''){
                if(!isEmpty(JSON.parse($key))){
                    $(".getChooseTemp").text(JSON.parse($key).name).data("tid",JSON.parse($key).id).removeClass('c-c7c7c7').addClass('c-3dbaff');
                    loadTemp(JSON.parse($key).id);
                    store.remove('seatempTrading');
                }
            }
        }else if(is.test(e.oldURL)&&at.test(e.newURL)){
            // 搜索结果返回响应
            var $base = store.get('base') ? store.get('base') : '';
            if($base!=''){
                if(!isEmpty(JSON.parse($base))){
                    changeSearch('.sText-base','.sVal-base',JSON.parse($base).name);
                    clearSearch('.sVal-base');
                    store.remove('base');
                }
            }
            var $market = store.get('market') ? store.get('market') : '';
            if($market!=''){
                if(!isEmpty(JSON.parse($market))){
                    changeSearch('.sText-market','.sVal-market',JSON.parse($market).name);
                    clearSearch('.sVal-market');
                    store.remove('market');
                }
            }
            var $medicine = store.get('medicine') ? store.get('medicine') : '';
            var $Standard = $("select[name='Standard']");
            if($medicine!=''){
                if(!isEmpty(JSON.parse($medicine))){
                    changeSearch('.sText-medicine','.sVal-medicine',JSON.parse($medicine).name);
                    // 获取药材规格
                    var standard = JSON.parse($medicine).standard,
                        arr = [],
                        strs = '';
                    arr = standard.split(",");
                    if(arr.length>0){
                        $Standard.empty();
                        $.each(arr,function(index,item){
                            strs+='<option value="'+item+'">'+item+'</option>';
                        });
                        $Standard.html(strs);
                    }else{
                        $Standard.empty();
                    }
                    store.set('StandardStr',standard);
                    clearSearch('.sVal-medicine');
                    store.remove('medicine');
                }
            }
        }
    });


    $(".innerType").on('change','select[name="PriceTendency"]',function(){
        var $val = $(this).val(),
            $text = $(this).parents(".weui-cell").find("input[name='PriceRange']");
        if($val=='' || $val=='持平'){
            $text.prop("disabled",true).val("");
        }else{
            $text.prop("disabled",false);
        }
    });

    $(".innerType").on('input propertychange','input[name="Price"]',function(){
        clearInput($(this));
    });

    // 增加规格
    $("#btnAddStandard").on('click',function(){
        var $contains = $(".innerType"),
            len = $contains.find("form").length + 1;
        if(len < 11){
            var $str = '<form id="innerType'+len+'" name="innerType'+len+'"><div class="weui-cells weui-cells_form"><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label adLet">规 格 '+len+'</label></div><div class="weui-cell__bd"><select class="weui-select"name="Standard"></select></div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label ">交易数量<br/>(日平均)</label></div><div class="weui-cell__bd"><input class="weui-input"type="number"placeholder=""name="TradeProduction"/></div><div class="weui-cell__dw c-c7c7c7">公斤</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label ">交易价格<br/>(日平均)</label></div><div class="weui-cell__bd"><input class="weui-input"type="number"required placeholder=""name="Price"emptyTips="请输入交易价格"/></div><div class="weui-cell__dw c-c7c7c7">元/公斤</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label">价格趋势</label></div><div class="weui-cell__bd"><select class="weui-select"name="PriceTendency"><option value="">请选择</option><option value="持平">持平</option><option value="上升">上升</option><option value="下降">下降</option></select></div><div class="weui-cell__bd"><input class="weui-input"type="number"disabled="disabled"placeholder="0"name="PriceRange"/></div><div class="weui-cell__dw flex-20 c-c7c7c7">%</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label">市场表现</label></div><div class="weui-cell__bd"><select class="weui-select"name="MarketStatus"><option value="">请选择</option><option value="正常">正常</option><option value="活跃">活跃</option><option value="不活跃">不活跃</option></select></div></div></div></form>';
            $contains.append($str);
            // 判断有无缓存规格
            var $dom = $("#innerType"+len).find("select[name='Standard']"),
                standard = store.get('StandardStr'),
                arr = [],
                strs = '';
                arr = standard.split(",");
                if(arr.length>0){
                    $dom.empty();
                    $.each(arr,function(index,item){
                        strs+='<option value="'+item+'">'+item+'</option>';
                    });
                    $dom.html(strs);
                }else{
                    $dom.empty();
                }
        }else{
            weui.alert('最多可添加10个规格');
        }
    });

});
