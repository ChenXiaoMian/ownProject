// 历史记录列表逻辑
$(function(){
    var $historyList = $("#historyList"),
        $historyListEmpty = $("#historyListEmpty"),
        $histKey = store.get('chooseHistory') ? store.get('chooseHistory') : '';  //获取类型

    histListInit($histKey);

    $(".historyList").on('touchmove',function(event){
        event.preventDefault();
    });

    // 历史记录列表初始化
    function histListInit(key){
        if(store.get(key) && !isEmpty(JSON.parse(store.get(key)).data)){
            clearHistoryStore(key);
            loadHistoryStore(key);
            $historyListEmpty.hide();
            $historyList.show();
            // 判断高度是否大于页面高度
            var contHeight = parseInt($(".historyList").height()),
                eleHeight = parseInt($('#historyList').height())+45;
            if(eleHeight>=contHeight){
                $('#historyList').on('touchmove',function(event){
                    event.stopPropagation();
                });
            }
        }else{
            $historyListEmpty.show();
            $historyList.hide();
        }
    }

    // 删除多余历史记录
    function clearHistoryStore(key){
        var json = JSON.parse(store.get(key));
        if(json.data.length>$historyNum){
            json.data.splice($historyNum,json.data.length-$historyNum);
            store.set(key,JSON.stringify(json));
        }
    }

    // 历史记录列表加载
    function loadHistoryStore(key){
        var str = '',
            json = JSON.parse(store.get(key));
        // //console.log(json);
        $.each(json.data,function(index,item){
            switch(key){
                case 'histStock':
                    str+='<div class="weui-cells"><a href="javascript:window.pageManager.go(\'historyDetail\',\'histStock_'+item.hid+'\');" class="c-222222"><div class="weui-cell fz-15">交易市场：'+item.Market+'</div><div class="weui-cell c-666666 align-items-left direction-column lh-24" style="display:block;"><p>药材名称：'+item.Medicine+'</p><p>商户名称：'+item.MerchantName+'</p><p>联 系 人：'+item.ContactPerson+'</p><p>年消耗量：'+item.Consume+'公斤</p><p>库存数量：'+item.Inventory+'公斤</p><p>存量进价：'+item.InventoryCost+'元/公斤</p><p>备　　注：'+item.Addition+'</p><p>采集时间：'+item.Time+'</p></div></a></div>';
                    break;
                case 'histOrigin':
                    str+='<div class="weui-cells"><a href="javascript:window.pageManager.go(\'historyDetail\',\'histOrigin_'+item.hid+'\');" class="c-222222"><div class="weui-cell fz-15">产地名称：'+item.BaseName+'</div><div class="weui-cell c-666666 align-items-left direction-column lh-24" style="display:block;"><p>药材名称：'+item.Medicine+'</p><p>种植户：'+item.GrowerName+'</p><p>种植面积：'+item.Area+'亩</p><p>人工成本：'+item.PersonCost+'元/亩</p><p>物流成本：'+item.MaterialCost+'元/亩</p><p>种子成本：'+item.SeedCost+'元/亩</p><p>预估产量：'+item.EstimateProduction+'公斤/亩</p><p>备　　注：'+item.Addition+'</p><p>采集时间：'+item.Time+'</p></div></a></div>';
                    break;
                case 'histOutput':
                    item.Price = item.hasOwnProperty('Price') ? item.Price : '0';
                    str+='<div class="weui-cells"><a href="javascript:window.pageManager.go(\'historyDetail\',\'histOutput_'+item.hid+'\');" class="c-222222"><div class="weui-cell fz-15">产地名称：'+item.BaseName+'</div><div class="weui-cell c-666666 align-items-left direction-column lh-24" style="display:block;"><p>药材名称：'+item.Medicine+'</p><p>种植户：'+item.GrowerName+'</p><p>种植面积：'+item.Area+'亩</p><p>单位产量：'+item.UnitProduction+'公斤/亩</p><p>产量趋势：'+item.ProdcutionTendency+'</p><p>采收价格：'+item.Price+'元/公斤</p><p>价格趋势：'+item.PriceTendency+'</p><p>种植意愿：'+item.Wish+'</p><p>备　　注：'+item.Addition+'</p><p>采集时间：'+item.Time+'</p></div></a></div>';
                    break;
                case 'histEnvi':
                    str+='<div class="weui-cells"><a href="javascript:window.pageManager.go(\'historyDetail\',\'histEnvi_'+item.hid+'\');" class="c-222222"><div class="weui-cell fz-15">产地名称：'+item.BaseName+'</div><div class="weui-cell c-666666 align-items-left direction-column lh-24" style="display:block;"><p>天气状况：'+item.Weather+'</p><p>灾害描述：'+item.Disaster+'</p><p>当地政策：'+item.Policy+'</p><p>产量趋势：'+item.Tendency+'</p><p>趋势范围：'+item.Range+'</p><p>备　　注：'+item.Addition+'</p><p>采集时间：'+item.Time+'</p></div></a></div>';
                    break;
                case 'histPieces':
                    str+='<div class="weui-cells"><a href="javascript:window.pageManager.go(\'historyDetail\',\'histPieces_'+item.hid+'\');" class="c-222222"><div class="weui-cell fz-15">生产商：'+item.Manufacturer+'</div><div class="weui-cell c-666666 align-items-left direction-column lh-24" style="display:block;"><p>药材名称：'+item.Medicine+'</p><p>产地名称：'+item.BaseName+'</p><p>产量规模：'+item.Scale+'</p><p>饮片规格：'+item.Standard+'</p><p>市场表现：'+item.MarketStatus+'</p><p>市场需求：'+item.MarketTendency+'</p><p>备　　注：'+item.Addition+'</p><p>采集时间：'+item.Time+'</p></div></a></div>';
                    break;
                case 'histPro':
                    str+='<div class="weui-cells"><a href="javascript:window.pageManager.go(\'historyDetail\',\'histPro_'+item.hid+'\');" class="c-222222"><div class="weui-cell fz-15">产品名称：'+item.ProductName+'</div><div class="weui-cell c-666666 align-items-left direction-column lh-24" style="display:block;"><p>生产商：'+item.ManufacturerName+'</p><p>原药材：'+item.MedicineName+'</p><p>供应商：'+item.Supplier+'</p><p>年销售额：'+item.Sale+'</p><p>需求趋势：'+item.ProductTendency+'</p><p>备　　注：'+item.Addition+'</p><p>采集时间：'+item.Time+'</p></div></a></div>';
                    break;
                case 'histTrading':
                    str+='<div class="weui-cells"><a href="javascript:window.pageManager.go(\'historyDetail\',\'histTrading_'+item.hid+'\');" class="c-222222"><div class="weui-cell fz-15">交易市场：'+item.Market+'</div><div class="weui-cell c-666666 align-items-left direction-column lh-24" style="display:block;"><p>商户名称：'+item.MerchantName+'</p><p>经营规模：'+item.Scale+'</p><p>药材名称：'+item.Medicine+'</p><p>产地名称：'+item.BaseName+'</p><p>交易类型：'+item.MedicineType+'</p><p>备　　注：'+item.Addition+'</p><p>采集时间：'+item.Time+'</p></div></a></div>';
                    break;
            }
        });
        $historyList.html(str);
    }
});