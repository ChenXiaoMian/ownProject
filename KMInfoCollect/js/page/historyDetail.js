// 历史记录详情逻辑
$(function(){
    innerInit();
    // 禁止滑动
    $(".historyDetail").on('touchmove',function(event){
        event.preventDefault();
    });
    $('#histCollCon').on('touchmove',function(event){
        event.stopPropagation();
    });


    var $histColl = $("#histColl"),
        $histCollCon = $("#histCollCon");
    //获取历史采集id及类型
    var $histDetail = pageManager.pageOther ? pageManager.pageOther : '',
        $histarr = $histDetail.split('_');

    loadHistDetailStore($histarr[0],$histarr[1]);

    function loadHistDetailStore(type,hid){
        var str = '',
            con = '',
            json = JSON.parse(store.get(type));

        $.each(json.data,function(index,item){
            if(item.hid == $histarr[1]){
                item.Address = item.Address ? item.Address : '暂无位置';
                $histColl.html('<p>信息员：'+item.cUserName+'</p><p>采集时间：'+item.Time+'</p><p>采集地点：'+item.Address+'</p>');

                switch($histarr[0]){
                    case 'histStock':
                        $histCollCon.html('<p>交易市场：'+item.Market+'</p><p>药材名称：'+item.Medicine+'</p><p>商户名称：'+item.MerchantName+'</p><p>商户地址：'+item.MerchantAddress+'</p><p>联系人：'+item.ContactPerson+'</p><p>联系方式：'+item.Phone+'</p><p>年消耗量：'+item.Consume+'公斤</p><p>库存数量：'+item.Inventory+'公斤</p><p>存量进价：'+item.InventoryCost+'元/公斤</p><p>库存地址：'+item.InventoryAddress+'</p><p>备注：'+item.Addition+'</p>');
                        break;
                    case 'histOrigin':
                        $histCollCon.html('<p>产地名称：'+item.BaseName+'</p><p>种植户：'+item.GrowerName+'</p><p>药材名称：'+item.Medicine+'</p><p>种植面积：'+item.Area+'亩</p><p>人工成本：'+item.PersonCost+'元/亩</p><p>物料成本：'+item.MaterialCost+'元/亩</p><p>种子成本：'+item.SeedCost+'元/亩</p><p>预估产量：'+item.EstimateProduction+'公斤/亩</p><p>备注说明：'+item.Addition+'</p>');
                        break;
                    case 'histOutput':
                        item.Price = item.hasOwnProperty('Price') ? item.Price : '0';
                        $histCollCon.html('<p>产地名称：'+item.BaseName+'</p><p>种植户：'+item.GrowerName+'</p><p>药材名称：'+item.Medicine+'</p><p>种植面积：'+item.Area+'亩</p><p>单位产量：'+item.UnitProduction+'公斤/亩</p><p>产量趋势：'+item.ProdcutionTendency+'，'+item.ProductionRange+'%</p><p>采收价格：'+item.Price+'元/公斤</p><p>价格趋势：'+item.PriceTendency+'，'+item.PriceRange+'%</p><p>种植意愿：'+item.Wish+'</p><p>计划面积：'+item.PlanArea+'亩</p><p>是否转产：'+item.ChangeMode+'</p><p>转产药材：'+item.ChangeMedicine+'</p><p>转产面积：'+item.ChangeArea+'</p><p>备注说明：'+item.Addition+'</p>');
                        break;
                    case 'histEnvi':
                        $histCollCon.html('<p>产地名称：'+item.BaseName+'</p><p>天气状况：'+item.Weather+'</p><p>灾害描述：'+item.Disaster+'</p><p>当地政策：'+item.Policy+'</p><p>产量趋势：'+item.Tendency+'，'+item.Range+'%</p><p>备注说明：'+item.Addition+'</p>');
                        break;
                    case 'histPieces':
                        $histCollCon.html('<p>生产商：'+item.Manufacturer+'</p><p>药材名称：'+item.Medicine+'</p><p>产地名称：'+item.BaseName+'</p><p>产量规模：'+item.Scale+'</p><p>饮片规格：'+item.Standard+'</p><p>供应商：'+item.Supplier+'</p><p>市场表现：'+item.MarketStatus+'</p><p>市场需求：'+item.MarketTendency+'</p><p>备注说明：'+item.Addition+'</p>');
                        break;
                    case 'histPro':
                        $histCollCon.html('<p>产品类型：'+item.Product+'</p><p>产品名称：'+item.ProductName+'</p><p>产品规格：'+item.Standard+'</p><p>生产商：'+item.ManufacturerName+'</p><p>原药材：'+item.MedicineName+'</p><p>产地名称：'+item.BaseName+'</p><p>原药比重：'+item.Ratio+'%</p><p>药材规格：'+item.MedicineStandard+'</p><p>供应商：'+item.Supplier+'</p><p>质量要求：'+item.QualityRequire+'</p><p>年销售额：'+item.Sale+'元</p><p>需求趋势：'+item.ProductTendency+'</p><p>备注说明：'+item.Addition+'</p>');
                        break;
                    case 'histTrading':
                        if(item.hasOwnProperty('PriceRange')&&item.PriceRange!=''){
                            item.PriceRange = '，'+item.PriceRange + '%';
                        }else{
                            item.PriceRange = '';
                        }
                        $histCollCon.html('<p>交易市场：'+item.Market+'</p><p>商户名称：'+item.MerchantName+'</p><p>经营规模：'+item.Scale+'</p><p>药材名称：'+item.Medicine+'</p><p>产地名称：'+item.BaseName+'</p><p>交易类型：'+item.MedicineType+'</p><p>规格：'+item.Standard+'</p><p>交易数量：'+item.TradeProduction+'公斤</p><p>交易价格：'+item.Price+'元/公斤</p><p>价格趋势：'+item.PriceTendency+item.PriceRange+'</p><p>市场表现：'+item.MarketStatus+'元</p><p>备注说明：'+item.Addition+'</p>');
                        break;
                }
            }
        });
    }
});