(function($){
    var Loading;
    Loading = (function(){
        function Loading(element,options){
            this.settings = $.extend({},$.fn.loading.defaults,options);
            this.$element = $(element);
            this.init();
        }

        Loading.prototype = {
            init: function(){
                var toastDom = '<div id="loadingToast" style="display:none;"><div class="weui-mask_transparent"></div><div class="weui-toast"><i class="weui-loading weui-icon_toast"></i><p class="weui-toast__content">'+this.settings.title+'</p></div></div>';
                this.$element.append(toastDom);
                var $loadingToast = $('#loadingToast');
                $loadingToast.fadeIn(100);
                setTimeout(function () {
                    $loadingToast.fadeOut(100);
                }, 500);
            }
        };

        /**
         * 插件的默认值
         */


        return Loading;
    })();

    $.fn.loading = function(opts){
        return new Loading("body",opts);
    }

    $.fn.loading.defaults = {
        title: '数据加载中'
    };
})(Zepto);

