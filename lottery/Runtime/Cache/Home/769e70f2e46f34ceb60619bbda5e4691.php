<?php if (!defined('THINK_PATH')) exit();?><!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title><?php echo C('WEB_SITE_TITLE');?></title>
    <link href="/Public/static/lottery/css/main.css" rel="stylesheet">
    <script type="text/javascript" src="/Public/static/lottery/js/jquery.min.js"></script>
    <script type="text/javascript" src="/Public/static/lottery/js/jQueryRotate.2.2.js"></script>
    <script type="text/javascript" src="/Public/static/lottery/js/jquery.easing.min.js"></script>
    <script>
    $(function(){
        $("#startbtn").click(function(){
            lottery();
        });
    });
    function lottery(){
        $.ajax({
            type: 'POST',
            url: "<?php echo U('Index/doLottery');?>",
            dataType: 'json',
            cache: false,
            error: function(){
                alert('出错了！');
                return false;
            },
            success:function(json){
                $("#startbtn").unbind('click').css("cursor","default");
                var a = json.angle;
                var p = json.prize;
                $("#startbtn").rotate({
                    duration:3000,
                    angle: 0,
                    animateTo:1800+a,
                    easing: $.easing.easeOutSine,
                    callback: function(){
                        var con = confirm('恭喜你，中得'+p+'\n还要再来一次吗？');
                        if(con){
                            lottery();
                        }else{
                            return false;
                        }
                    }
                });
            }
        });

    }
    </script>
</head>
<body>
    <?php echo (dump($_list)); ?>
    
    <div id="main">
       <h2 class="top_title"><a href="javascript:;">幸运大转盘-jQuery+PHP实现的抽奖程序</a></h2>
       <div class="msg"></div>
       <div class="demo">
            <div id="disk"></div>
            <div id="start"><img src="/Public/static/lottery/img/start.png" id="startbtn"></div>
       </div>
    </div>
</body>
</html>