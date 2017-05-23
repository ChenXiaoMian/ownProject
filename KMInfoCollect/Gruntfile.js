 module.exports = function(grunt) {
  //配置参数
  grunt.initConfig({
     pkg: grunt.file.readJSON('package.json'),
     concat: {
         options: {
             separator: ';',
             stripBanners: true
         },
         dist: {
             src: [
                 "src/js/js.cookie.js",
                 "src/js/json2.js",
                 "src/js/md5.js",
                 "src/js/common.js"
             ],
             dest: "src/js/tools.js"
         }
     },
     uglify: {
         options: {
         },
         dist: {
             files: {
                 'dist/js/tools.min.js': 'src/js/tools.js',
                 'dist/js/weui.min.js': 'src/js/weui.add.js',
                 'dist/js/pageManager.min.js': 'src/js/pageManager.js',
                 'dist/js/page/addEnvi.min.js': 'src/js/page/addEnvi.js',
                 'dist/js/page/addOrigin.min.js': 'src/js/page/addOrigin.js',
                 'dist/js/page/addOutput.min.js': 'src/js/page/addOutput.js',
                 'dist/js/page/addPieces.min.js': 'src/js/page/addPieces.js',
                 'dist/js/page/addPro.min.js': 'src/js/page/addPro.js',
                 'dist/js/page/addStock.min.js': 'src/js/page/addStock.js',
                 'dist/js/page/addTrading.min.js': 'src/js/page/addTrading.js',
                 'dist/js/page/historyData.min.js': 'src/js/page/historyData.js',
                 'dist/js/page/historyDetail.min.js': 'src/js/page/historyDetail.js',
                 'dist/js/page/historyList.min.js': 'src/js/page/historyList.js',
                 'dist/js/page/itemSearch.min.js': 'src/js/page/itemSearch.js',
                 'dist/js/page/tempChoose.min.js': 'src/js/page/tempChoose.js',
                 'dist/js/page/tempData.min.js': 'src/js/page/tempData.js',
                 'dist/js/page/tempEnvi.min.js': 'src/js/page/tempEnvi.js',
                 'dist/js/page/tempList.min.js': 'src/js/page/tempList.js',
                 'dist/js/page/tempOrigin.min.js': 'src/js/page/tempOrigin.js',
                 'dist/js/page/tempOutput.min.js': 'src/js/page/tempOutput.js',
                 'dist/js/page/tempPieces.min.js': 'src/js/page/tempPieces.js',
                 'dist/js/page/tempPro.min.js': 'src/js/page/tempPro.js',
                 'dist/js/page/tempStock.min.js': 'src/js/page/tempStock.js',
                 'dist/js/page/tempTrading.min.js': 'src/js/page/tempTrading.js'
             }
         }
     },
     cssmin: {
         options: {
             keepSpecialComments: 0
         },
         compress: {
             files: {
                 'dist/css/app.min.css': [
                     "src/css/weui.min.css",
                     "src/css/iconfont.css",
                     "src/css/main.css"
                 ]
             }
         }
     }
  });

  //载入concat和uglify插件，分别对于合并和压缩
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  //注册任务
  grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
}