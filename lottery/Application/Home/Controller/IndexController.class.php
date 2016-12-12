<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------

namespace Home\Controller;
use OT\DataDictionary;

/**
 * 前台首页控制器
 * 主要获取首页聚合数据
 */
class IndexController extends HomeController {
	//系统首页
    public function index(){

        $category = D('Category')->getTree();
        $lists    = D('Document')->lists(null);

  //       $Lottery = M('lottery');
  //   	$list = $Lottery->limit(10)->select();
    	
  //   	$prize_arr = array();
  //   	foreach($list as $key => $val){
  //   		if($val['prizeSku']>0){
	 //    		$prize_arr[$key]['id'] = intval($val['id']);
	 //    		$prize_arr[$key]['prize'] = $val['prizeName'];
	 //    		$prize_arr[$key]['grade'] = $val['prizeGrade'];
	 //    		$prize_arr[$key]['v'] = $val['prizePro'];
	 //    		if(strstr($val['prizeMin'],',')){
	 //    			$prize_arr[$key]['min'] =explode(",",$val['prizeMin']);
	 //    		}else{
	 //    			$prize_arr[$key]['min'] =$val['prizeMin'];
	 //    		}
	 //    		if(strstr($val['prizeMax'],',')){
	 //    			$prize_arr[$key]['max'] =explode(",",$val['prizeMax']);
	 //    		}else{
	 //    			$prize_arr[$key]['max'] =$val['prizeMax'];
	 //    		}
  //   		}
		// }

		// $rid = 2;

		// foreach($prize_arr as $key => $val){ 
		// 	if($val['id']==$rid){
		// 		$res = $prize_arr[$key]; 
		// 	}
		// }
		// dump($prize_arr);
		// dump($res);
		// exit();

        // $this->assign('_list',$list);
        // $this->assign('_news',json_decode($min));                 
        $this->display();
    }

    public function doLottery(){
    	$Lottery = M('lottery');
    	
    	$list = $Lottery->limit(10)->select();
    	// $news = array_merge_recursive($list,$range_arr);
    	$prize_arr = array();
    	foreach($list as $key => $val){
    		if($val['prizeSku']>0){
	    		$prize_arr[$key]['id'] = intval($val['id']);
	    		$prize_arr[$key]['prize'] = $val['prizeName'];
	    		$prize_arr[$key]['grade'] = $val['prizeGrade'];
	    		$prize_arr[$key]['v'] = $val['prizePro'];
	    		$prize_arr[$key]['sku'] = $val['prizeSku'];
	    		if(strstr($val['prizeMin'],',')){
	    			$prize_arr[$key]['min'] =explode(",",$val['prizeMin']);
	    		}else{
	    			$prize_arr[$key]['min'] =$val['prizeMin'];
	    		}
	    		if(strstr($val['prizeMax'],',')){
	    			$prize_arr[$key]['max'] =explode(",",$val['prizeMax']);
	    		}else{
	    			$prize_arr[$key]['max'] =$val['prizeMax'];
	    		}
    		}
		}

		function getRand($proArr) { 
		    $result = ''; 
		    //概率数组的总概率精度 
		    $proSum = array_sum($proArr); 

		    //概率数组循环 
		    foreach ($proArr as $key => $proCur) { 
		        $randNum = mt_rand(1, $proSum); 
		        if ($randNum <= $proCur) { 
		            $result = $key; 
		            break; 
		        } else { 
		            $proSum -= $proCur; 
		        } 
		    } 
		    unset ($proArr); 
		    return $result; 
		} 

		foreach($prize_arr as $key => $val){ 
		    $arr[$val['id']] = $val['v']; 
		} 
		 
		$rid = getRand($arr); //根据概率获取奖项id

		$Lottery->where('id='.$rid)->setDec('prizeSku'); //减少库存

		// dump($arr);
		$res = $prize_arr[$rid-1]; //中奖项 

		/**
		 * 增加获奖日志
		 */
		$data = array();
		$data['prizeId'] = $res['id'];
		$data['prizeGrade'] = $res['grade'];
		$data['prizeName'] = $res['prize'];
		$data['prizeSku'] = $res['sku'];
		$data['getTime'] = time();
		$LotteryLog =  M('lotterylog');
		$LotteryLog->add($data);

		$min = $res['min']; 
		$max = $res['max']; 
		if($res['id']==4){ //七等奖 
		    $i = mt_rand(0,1); 
		    $result['angle'] = mt_rand($min[$i],$max[$i]); 
		}else{ 
		    $result['angle'] = mt_rand($min,$max); //随机生成一个角度 
		} 
		$result['prize'] = $res['prize']; 
		$result['grade'] = $res['grade']; 
		$result['id'] = $res['id']; 
		 
		echo json_encode($result); 

    }
}