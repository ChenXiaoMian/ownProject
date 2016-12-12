<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------

namespace Admin\Controller;

/**
 * 后台抽奖控制器
 * @author 麦当苗儿 <zuojiazi@vip.qq.com>
 */
class LotteryController extends AdminController {

    public function index(){
    		$Lottery = M('lottery');
			$list = $Lottery->limit(10)->select();
			
			$this->assign('_list',$list);
            $this->meta_title = '抽奖参数';
            $this->display();
    }
    
    public function edit(){
    	$Lottery = M('lottery');
    	if(IS_POST){
    		$data['id'] = I('id');
    		$data['prizeId'] = I('prizeId');
    		$data['prizeMin'] = I('prizeMin');
    		$data['prizeMax'] = I('prizeMax');
    		$data['prizeGrade'] = I('prizeGrade');
    		$data['prizeName'] = I('prizeName');
    		$data['prizeSku'] = I('prizeSku');
    		$data['prizePro'] = I('prizePro');
    		if($Lottery->save($data)){
    			$this->success('更新成功',U('Lottery/index'));
    		}else{
    			$this->error('更新失败',U('Lottery/index'));
    		}
    	} else {
	    	$id     =   I('get.id','');
	    	if(empty($id)){
	    		$this->error('参数不能为空！');
	    	}
	    	/*获取一条记录的详细数据*/
	    	$gdata = $Lottery->find($id);
	    	if(!$gdata){
	    		$this->error($Document->getError());
	    	}
	    	$this->assign('data', $gdata);
	    	$this->meta_title   =   '编辑参数';
	    	$this->display();
    	}
    }
    
    public function prizelog(){
            
            $LotteryLog =  M('lotterylog');
            $list   =   $this->lists($LotteryLog);
            int_to_string($list);
            
            $this->assign('_list', $list);
            $this->meta_title = '获奖日志';
            $this->display();
    }
}
