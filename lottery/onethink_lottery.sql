/*
Navicat MySQL Data Transfer

Source Server         : 本地
Source Server Version : 50540
Source Host           : localhost:3306
Source Database       : simple

Target Server Type    : MYSQL
Target Server Version : 50540
File Encoding         : 65001

Date: 2016-11-26 17:27:28
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for `onethink_lottery`
-- ----------------------------
DROP TABLE IF EXISTS `onethink_lottery`;
CREATE TABLE `onethink_lottery` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `prizeMin` varchar(100) DEFAULT NULL,
  `prizeMax` varchar(100) DEFAULT NULL,
  `prizeId` int(10) DEFAULT NULL,
  `prizeGrade` varchar(20) DEFAULT NULL,
  `prizeName` varchar(20) DEFAULT NULL,
  `prizePro` int(3) DEFAULT NULL,
  `prizeSku` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of onethink_lottery
-- ----------------------------
INSERT INTO onethink_lottery VALUES ('1', '1', '29', '1', '特等奖', '5000元花币', '1', '1');
INSERT INTO onethink_lottery VALUES ('2', '302', '328', '2', '一等奖', '3000元花币', '2', '2');
INSERT INTO onethink_lottery VALUES ('3', '242', '268', '3', '二等奖', '1000元花币', '3', '3');
INSERT INTO onethink_lottery VALUES ('4', '182', '208', '4', '三等奖', '500元花币', '4', '10');
INSERT INTO onethink_lottery VALUES ('5', '32,62,92,122,152,212,272,332', '58,88,118,148,178,238,298,358', '5', '欢乐奖', '50元花币', '90', '1500');
