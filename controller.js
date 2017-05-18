/**
 * This file is part of Linking OIS project
 * controller.js - Define controllers.
 *
 * Author: Ryan H Zhang
 * Date:2016-03-21
 *
 * Copyright © 2016 Linking Medical Techonology Co., Ltd. All rights reserved.
 */
'use strict';
/**
 * MainCtrl - controller
 * Contains severals global data used in diferent view
 *
 */
function MainCtrl($rootScope) {
    this.userName = 'Example user';
    this.helloText = 'Welcome in INSPINIA Gulp SeedProject';
    this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects.';
    //develop
    //$rootScope.servers = 'http://chenzhijun:8888/imagecloud';

    //publish
    // $rootScope.servers = 'http://123.56.201.253:8888/imagecloud';
    // $rootScope.imageUrl = 'http://123.56.201.253:80/public/';


    /*
     *2016-7-27 David.Wu
     * 使用新的全局变量
     * */
    $rootScope.servers = lm.environment().imageCloudUrl;
    $rootScope.imageUrl = lm.environment().hostUrl + "/public/";
    console.log("controller.js $rootScope.servers:" + $rootScope.servers);
    console.log("controller.js $rootScope.imageUrl:" + $rootScope.imageUrl);


    $rootScope.templateUrl = function () {
        return 'views/common/navigation' + window.localStorage.getItem('usertype') + '.html';
    }
};
/**
 * translateCtrl - Controller for translate
 */
function translateCtrl($translate, $scope) {
    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
        $scope.language = langKey;
    };
}
/*
 用户登录
 */
function Login($scope, $http, toaster, $rootScope, $cookieStore, myToaster,$state) {
    var localStorage = window.localStorage;
    if ($cookieStore.get("rmbUser") == "true") {
        $scope.remember = true;
        $scope.username = $cookieStore.get('username');
        $scope.password = $cookieStore.get('password');
    }
    $scope.login = function (username, password, type) {
        $http.post($rootScope.servers + "/service/user/login", {
                'username': $scope.username,
                'password': $scope.password
            })
            .success(function (data) {

                var result = data.result;
                if (result == 0) {
                    var user = JSON.parse(data.message)[0];
                    localStorage.setItem("userid", user.userid);
                    localStorage.setItem("password", password);
                    localStorage.setItem("usertype", user.usertype);
                    localStorage.setItem("user", JSON.stringify(user));
                    $cookieStore.put('username2', $scope.username, {expires: 30});
                    $cookieStore.put("password2", $scope.password, {expires: 30});
                    if (user.status == 5) {
                        myToaster("error", "登录失败", "您已被拉黑，请联系管理员。");
                    }
                    else if(user.status==1||user.status==3||user.status==2){
                        myToaster("success","登陆成功","欢迎来到三健医疗");
                        if(user.usertype==3){
                            window.location.href = "/#/instituteUpdateNopass";
                        }else if(user.usertype==2){
                            $state.go("navigationDoctorNopass");
                        }

                    }
                    else {
                        toaster.pop({
                            type: 'success',
                            title: '登陆成功',
                            body: '欢迎来到三健医疗',
                            showCloseButton: true,
                            timeout: 2000
                        });
                        if (data.message) {
                            if ($scope.remember == true) {
                                $cookieStore.put('username', $scope.username, {expires: 7});
                                $cookieStore.put("rmbUser", 'true', {expires: 7}); // 存储一个带7天期限的 cookie
                                $cookieStore.put("password", $scope.password, {expires: 7}); // 存储一个带7天期限的 cookie
                            }
                            else {
                                $cookieStore.remove('username');
                                $cookieStore.remove('password');
                                $cookieStore.remove('rmbUser');
                            }
                            var usertype = user.usertype;
                            console.log("usertype:" + usertype);
                            if (usertype == 1) {
                                window.location.href = "/#/customerServiceMain";
                            } else if (usertype == 2) {
                                window.location.href = "/#/doctor_main";
                            } else if (usertype == 3) {
                                window.location.href = "/#/homePage";
                            } else if (usertype == 0) {
                                window.location.href = "/#/adminPage"
                            }
                        }
                    }
                }
                else if (result == 1) {
                    toaster.pop({
                        type: 'warning',
                        title: '登录失败',
                        body: '用户名不存在',
                        showCloseButton: true,
                        timeout: 1000
                    });
                }
                else if (result == 2) {
                    toaster.pop({
                        type: 'error',
                        title: '登录失败',
                        body: '密码错误',
                        showCloseButton: true,
                        timeout: 1000
                    });
                }
                else if (result == undefined) {
                    toaster.pop({
                        type: 'warning',
                        title: '登录失败',
                        body: '该浏览器不支持本系统，请更新浏览器',
                        showCloseButton: true,
                        timeout: 1000
                    });
                }
                else {
                    toaster.pop({
                        type: 'error',
                        title: '登录失败',
                        body: '服务器异常',
                        showCloseButton: true,
                        timeout: 1000
                    });
                }
            }).error(function (data) {
            toaster.pop({
                type: 'error',
                title: '登录失败',
                body: '服务器异常',
                showCloseButton: true,
                timeout: 1000
            });
        })
    };
}
/*
 用户注册
 */
/*蒙版插件*//////
function ModalInstanceCtrl($scope, $modalInstance) {

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

};
//注册
function Register($scope, $http, toaster, $modal, $rootScope, transform) {
    $scope.sendMobile = function () {
        if ($scope.username == '') {
            toaster.pop({
                type: 'error',
                title: '请输入用户名',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else if (!(/1\d{10}$/.test($scope.username))) {
            toaster.pop({
                type: 'error',
                title: '请输入正确的手机号码',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else {
            $http.get($rootScope.servers + '/service/user/checkcode?username=' + $scope.username)
                .success(function (data) {
                    var result = data.result;
                    var num_t2;
                    if (result == 0) {
                        var num2 = 60;
                        num_t2 = setInterval(function () {
                            num2--;
                            if (num2 > 0) {
                                $(".code_btn2").html(num2 + "秒后重新发送");
                                $(".code_btn2").attr("disabled", "disabled");
                            } else {
                                clearTimeout(num_t2);
                                $(".code_btn2").html("发送验证码");
                                $(".code_btn2").removeAttr("disabled");
                            }
                        }, 1000);
                    }
                    else if (result == -1) {
                        var num2 = 60;
                        num_t2 = setInterval(function () {
                            num2--;
                            if (num2 > 0) {
                                $(".code_btn2").html(num2 + "秒后重新发送");
                                $(".code_btn2").attr("disabled", "disabled");
                            } else {
                                clearTimeout(num_t2);
                                $(".code_btn2").html("发送验证码");
                                $(".code_btn2").removeAttr("disabled");
                            }
                        }, 1000);

                        toaster.pop({
                            type: 'error',
                            title: '发送失败',
                            showCloseButton: true,
                            timeout: 2000
                        });
                    }
                    else {
                        toaster.pop({
                            type: 'error',
                            title: '服务器连接异常',
                            showCloseButton: true,
                            timeout: 2000
                        });
                    }
                })
        }
    }
    $scope.resetPassword = function () {
        $http.post($rootScope.servers + '/service/user/findpassword', {
                'username': $scope.username,
                'checkcode': $scope.checkcode
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    toaster.pop({
                        type: 'success',
                        title: '重置成功',
                        body: '密码重置成功，初始密码为:123456。请点击“返回”，然后登录。',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
                else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        title: '密码重置失败',
                        showCloseButton: true,
                        timeout: 600
                    });
                }
                else if (result == 1) {
                    toaster.pop({
                        type: 'error',
                        title: '密码重置失败',
                        body: '用户不存在',
                        showCloseButton: true,
                        timeout: 600
                    });
                }
                else {
                    toaster.pop({
                        type: 'error',
                        title: '密码重置失败',
                        body: '服务器异常',
                        showCloseButton: true,
                        timeout: 600
                    });
                }
            })
    }

    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/main/Viewer/userServicePolicy.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    };

    $scope.usertype = 2;
    $scope.changeUserType = function (type) {
        $scope.usertype = type;
        if (type == 1) {
            $(".doctor").removeClass('btn-success').addClass('btn-white');
            $(".person").removeClass('btn-white').addClass('btn-success');
        }
        else {
            $(".doctor").removeClass('btn-white').addClass('btn-success');
            $(".person").removeClass('btn-success').addClass('btn-white');
        }
    }

    $scope.register = function () {
        if ($scope.password != $scope.password2) {
            toaster.pop({
                type: 'error',
                title: '登录失败',
                body: '两次密码输入不同',
                showCloseButton: true,
                timeout: 1600
            });
        }

        else {

            var registerData = {
                usertype: $scope.usertype,
                username: $scope.username,
                password: $scope.password,
                email: $scope.email,
                checkcode: $scope.checkcode
            };

            $http.post($rootScope.servers + '/service/user/register', registerData)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        toaster.pop({
                            type: 'success',
                            title: '注册成功',
                            body: '恭喜你注册成功',
                            showCloseButton: true,
                            timeout: 600
                        })
                        window.location.href = '/#/login';
                    }
                    else if (result == 1) {
                        toaster.pop({
                            type: 'error',
                            title: '注册失败',
                            body: '用户名已经注册',
                            showCloseButton: true,
                            timeout: 600
                        })
                    }
                    else if (result == 2) {
                        toaster.pop({
                            type: 'error',
                            title: '注册失败',
                            body: '短信校验码错误',
                            showCloseButton: true,
                            timeout: 600
                        })
                    }
                    else if (result == 3) {
                        toaster.pop({
                            type: 'error',
                            title: '注册失败',
                            body: '短信校验码过期',
                            showCloseButton: true,
                            timeout: 600
                        })
                    }
                    else if (result == -1) {
                        toaster.pop({
                            type: 'error',
                            title: '注册失败',
                            // body: '短信校验码错误',
                            showCloseButton: true,
                            timeout: 600
                        })
                    }
                    else {
                        toaster.pop({
                            type: 'error',
                            title: '注册失败',
                            body: '服务器异常',
                            showCloseButton: true,
                            timeout: 600
                        })
                    }
                })
        }
    }
}
/*
 忘记密码
 */
function forgetPassword($scope, $http, toaster, $rootScope) {
    $scope.sendMobile1 = function () {
        if ($scope.username == '') {
            toaster.pop({
                type: 'error',
                title: '请输入用户名',
                showCloseButton: true,
                timeout: 1200
            });
        }
        else if (!(/1\d{10}$/.test($scope.username))) {
            toaster.pop({
                type: 'error',
                title: '请输入正确的手机号码',
                showCloseButton: true,
                timeout: 1200
            });
        }
        else {
            $http.get($rootScope.servers + '/service/user/checkcode?username=' + $scope.username)
                .success(function (data) {
                    var result = data.result;
                    var num_t1;
                    if (result == 0) {
                        var num = 60;
                        num_t1 = setInterval(function () {
                            num--;
                            if (num > 0) {
                                $(".code_btn1").html(num + "秒后重新发送");
                                $(".code_btn1").attr("disabled", "disabled");
                            } else {
                                clearTimeout(num_t1);
                                $(".code_btn1").html("发送验证码");
                                $(".code_btn1").removeAttr("disabled");
                            }
                        }, 1000);
                    }
                    else if (result == -1) {
                        var num = 60;
                        num_t1 = setInterval(function () {
                            num--;
                            if (num > 0) {
                                $(".code_btn1").html(num + "秒后重新发送");
                                $(".code_btn1").attr("disabled", "disabled");
                            } else {
                                clearTimeout(num_t1);
                                $(".code_btn1").html("发送验证码");
                                $(".code_btn1").removeAttr("disabled");
                            }
                        }, 1000);

                        toaster.pop({
                            type: 'error',
                            title: '发送失败',
                            showCloseButton: true,
                            timeout: 600
                        });
                    }
                    else {
                        toaster.pop({
                            type: 'error',
                            title: '服务器连接异常',
                            showCloseButton: true,
                            timeout: 600
                        });
                    }
                })
        }
    }
    $scope.resetPassword = function () {
        $http.post($rootScope.servers + '/service/user/findpassword', {
                'username': $scope.username,
                'checkcode': $scope.checkcode
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    toaster.pop({
                        type: 'success',
                        title: '重置成功',
                        body: '密码重置成功，初始密码为:123456。请点击“返回”，然后登录。',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
                else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        title: '密码重置失败',
                        // body: '服务器异常',
                        showCloseButton: true,
                        timeout: 600
                    });
                }
                else if (result == 1) {
                    toaster.pop({
                        type: 'error',
                        title: '密码重置失败',
                        body: '用户不存在',
                        showCloseButton: true,
                        timeout: 600
                    });
                }
                else {
                    toaster.pop({
                        type: 'error',
                        title: '密码重置失败',
                        body: '服务器异常',
                        showCloseButton: true,
                        timeout: 600
                    });
                }
            })
    }
}
/*
 侧边栏
 */
function Navigation($scope, loginServer) {
    var storage = window.localStorage;
    var user = storage.getItem("user");
    user = JSON.parse(user)
    var username = user.username;
    $scope.username = username;
    var usertype = user.usertype;
    if (usertype == 3) {
        $scope.userIdentity = '机构';
    }
    else if (usertype == 2) {
        $scope.userIdentity = '医生';
    } else if (usertype == 1) {
        $scope.userIdentity = '个人用户';
    } else if (usertype == 0) {
        $scope.userIdentity = '管理员';
    }
    $scope.mininav = function () {
        setTimeout(function () {
            $('body').removeClass('mini-navbar');
        }, 400);
    }
    $scope.removeMininav = function () {
        setTimeout(function () {
            $('body').addClass('mini-navbar');
        }, 400);
    }
}
function Topnavbar($scope,$cookieStore,$http,myToaster,$rootScope) {
    var storage = window.localStorage;
    var user = storage.getItem("user");
    user = JSON.parse(user)
    var username = user.username;
    $scope.username = username;
    var usertype = user.usertype;

    init();
    function init() {
        $scope.username = $cookieStore.get('username2');
        $scope.password = $cookieStore.get('password2');

        if(usertype == 1) {
            $('.dropdown').css('display','none');
        }
        $http.post($rootScope.servers + "/service/user/login", {
                'username': $scope.username,
                'password': $scope.password
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var user = JSON.parse(data.message)[0];
                    if (user.status == 5) {
                        myToaster("error", "登录失败", "您已被拉黑，请联系管理员。");
                        setTimeout(function () {
                            window.location.href = "/#/login";
                        },300)
                    }
                }
            })
    }

    if (window.localStorage.getItem('userid') == undefined || window.localStorage.getItem('userid') == '') {
        window.location.href = "/#/login";
    }
    $scope.removeUser = function () {
        window.localStorage.removeItem('userid');
    }
    $scope.toSettingPage = function () {
        if(usertype == 3) {
            window.location.href = "/#/instituteSetting";
        }else if(usertype == 2) {
            window.location.href = "/#/doctorSetting";
        }else if(usertype == 0) {
            window.location.href = "/#/adminSetting";
        }

    }

}
/*
 机构
 */
function Institution($scope, $http, $rootScope, $modal,SweetAlert, loginServer, toaster, handleTime,$state) {
    console.log("Institution ctl is coming");
    $scope.asks = [];
    $scope.search = {
        studydate_start_locked:false,
        studydate_end_locked:false,
        upload_start_locked:false,
        unload_end_locked:false,
    };
    $scope.imageState ={
        notSend : false,
        send:false,
        refused : false,
        cancle:false,
        reading : false,
        isDone : false
    };
    $scope.checkState =0;   // 未查看

    //test
    $scope.getfocus =function () {
        console.log("aaa");
        //angular.element('#studydate_start').focus();
        //angular.element('#studydate_start').triggerHandler("focus");
        angular.element('#studydate_start').trigger("focus");
        //angular.element('#studydate_start').click();
    }

    $scope.mFilter_noImage = function (e) {
        return e.modality != "noImage";
    }

    $scope.unlock =function (flag) {
        switch (flag){
            case "studydate_start":
                $scope.search.studydate_start_locked=true;
                console.log("studydate_start is locked");
                break;

            case "studydate_end":
                $scope.search.studydate_end_locked=true;
                console.log("studydate_end is locked");
                break;

            case "upload_start":
                $scope.search.upload_start_locked=true;
                console.log("unload_start is locked");
                break;

            case "upload_end":
                $scope.search.unload_end_locked=true;
                console.log("unload_end is locked");
                break;


        }
    }

    $scope.locked =function (flag) {
        switch (flag){
            case "studydate_start":
                $scope.search.studydate_start_locked=false;
                console.log("studydate_start is unlock");
                break;

            case "studydate_end":
                $scope.search.studydate_end_locked=false;
                console.log("studydate_end is unlock");
                break;

            case "upload_start":
                $scope.search.upload_start_locked=false;
                console.log("unload_start is unlock");
                break;

            case "upload_end":
                $scope.search.unload_end_locked=false;
                console.log("unload_end is unlock");
                break;



        }
    }

    $scope.studydateStartFilter = function (image) {
        console.log("$scope.studydateStartFilter");

        if ($scope.search.studydate_start_locked) {
            var studydate_start = $("#studydate_start").val().replace(/\-/g,"");
            console.log("#studydate_begin:"+studydate_start);
            console.log("image.studydate:"+image.studydate);
            return studydate_start <= image.studydate?true:false;
        }
        return true;
    }

    $scope.studydateEndFilter = function (image) {

        if ($scope.search.studydate_end_locked) {
            var studydate_end = $("#studydate_end").val().replace(/\-/g,"");
            console.log("#studydate_begin:"+studydate_end);
            console.log("image.studydate:"+image.studydate);

            return studydate_end >= image.studydate?true:false;

        }

        return true;
    }

    $scope.uploadStartFilter = function (image) {


        if ($scope.search.upload_start_locked) {
            var upload_start = $("#upload_start").val()
            var uploadtime = image.uploadtime.substr(0,10);
            console.log("#upload_begin:"+upload_start);
            console.log("image.uploadtime:"+image.uploadtime);
            return upload_start <= uploadtime?true:false;
        }
        return true;
    }

    $scope.uploadEndFilter = function (image) {
        if ($scope.search.unload_end_locked) {
            var upload_end = $("#upload_end").val()
            var uploadtime = image.uploadtime.substr(0,10);
            //console.log("#upload_begin:"+upload_end);
            //console.log("image.uploadtime:"+image.uploadtime);
            console.log("#upload_begin:"+upload_end);
            console.log("image.uploadtime:"+image.uploadtime);
            // setTimeout(function () {
            //     $('#tblOrders').trigger('footable_redraw');
            // }, 100);
            return upload_end >= uploadtime?true:false;
        }
        return true;
    }

    function parseMessageData(data) {
        try {
            var message = JSON.parse(data);
            return message;
        } catch (e) {
            return false;
        }
    }

    var storage = window.localStorage;
    var userid = storage.getItem("userid");

    var listData = {
        userid: userid,
        curpage: 1,
        pagesize: 1000,
        havereport: -1,
        haveask: -1
    }
    var userid = window.localStorage.getItem("userid");
    var transform = function (data) {
        return $.param(data);
    }

    function parseMessageData(data) {
        try {
            var message = JSON.parse(data);
            return message;
        } catch (e) {
            return false;
        }
    }
    $scope.search = {
        studydate_begin:new Date(),
        studydate_end:new Date()
    };

    var data = {
        userid: userid,
        havereport: -1,
        haveask: -1,
        curpage: 1,
        pagesize: 1000,
        userType:2
    };
    initList();
    function initList() {
        $scope.visible3 = true;
        $scope.visible2 = true;
        $http.post($rootScope.servers + '/service/image/list', data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseMessageData(data.message);
                    $scope.asks1 = message;
                    $scope.asks2 = [];
                    angular.forEach($scope.asks1, function (data, index, array) {
                            $scope.asks2.push(data);
                    })
                    $scope.asks = angular.copy($scope.asks2);
                }
            }).error(function (data) {
                toaster.pop({
                    type: 'error',
                    body: '列表更新出错',
                    showCloseButton: true,
                    timeout: 1200
                });
            })
    }

    $scope.searchForInput1 = function () {


        if ($scope.search.patientname != undefined) {
            $scope.searchname1 = $scope.search.patientname.toLowerCase();
            //$scope.searchname1 = $scope.searchname1.replace(/\s+/g, '');
            $scope.searchname1 = $scope.searchname1.replace(/(\s+)|(\_)/g, '');
        }

        if ($scope.visible3 == false) {
            $scope.startTime = handleTime($("#addstartime").val());
        }
        if ($scope.visible2 == false) {
            $scope.endTime = handleTime($("#addendtime").val());
        }

        //$scope.searchStartTime = $scope.visible1 == false ? handleTime($("#studydate_start").val()) : -1;
        //$scope.searchEndTime = $scope.visible2 == false ? handleTime($("#studydate_end").val()) : 99999999;
        //$scope.searchStartTime1 = $scope.visible3 == false ? handleTime($("#upload_start").val()) : -1;
        //$scope.searchEndTime1 = $scope.visible4 == false ? handleTime($("#upload_end").val()) : 99999999;

        $scope.searchStartTime = $scope.search.studydate_start_locked? handleTime($("#studydate_start").val()) : -1;
        $scope.searchEndTime = $scope.search.studydate_end_locked ? handleTime($("#studydate_end").val()) : 99999999;

        $scope.searchStartTime1 = $scope.search.upload_start_locked ? handleTime($("#upload_start").val()) : -1;
        $scope.searchEndTime1 = $scope.search.unload_end_locked ? handleTime($("#upload_end").val()) : 99999999;
        console.log("拍摄时间：searchStartTime:"+$scope.searchStartTime+"| searchEndTime:"+$scope.searchEndTime);
        console.log("上传时间：searchStartTime1:"+$scope.searchStartTime1+"| searchEndTime1:"+$scope.searchEndTime1);
        $scope.asks =[];



        //console.log("notSend:"+$scope.imageState.notSend +"refused:"+$scope.imageState.refused +"reading:"+$scope.imageState.reading +"isDone:"+$scope.imageState.isDone);

        angular.forEach($scope.asks2, function (data) {
            var checkName = false;
            var idcheck = false;
            var timecheck1 = false;
            var timecheck2 = false;
            var imageStateCheck1 = false;           //影像状态
            var recordStateCheck1 = false;          //报告状态
            var result = true;
            //var title = data.patientname.toLowerCase();
            var title = data.patientname.toLowerCase().replace(/(\s+)|(\_)/g, '');

            if ($scope.searchname1 == undefined || $scope.searchname1 == '' || title.indexOf($scope.searchname1) != -1) {
                checkName = true;
            }

            if (data.modality == $scope.search.modality || $scope.search.modality == undefined ||$scope.search.modality == '') {
                idcheck = true;
            }


            var studydate = handleTime(data.studydate);
            var uploaddate = handleTime(data.uploaddate);
            console.log("studydate:"+studydate+"uploaddate:"+uploaddate);
            if ($scope.searchStartTime <= handleTime(data.studydate) && $scope.searchEndTime >= handleTime(data.studydate)) {
                timecheck2 = true;
            }
            if ($scope.searchStartTime1 <= parseInt(data.uploaddate) && $scope.searchEndTime1 >= parseInt(data.uploaddate)) {
                timecheck1 = true;
            }

            // 影像状态
            //console.log("status:"+data.status);
            if ($scope.imageState.notSend && data.status == 0) {
                imageStateCheck1 = true;
            } if ($scope.imageState.send && data.status == 1) {
                imageStateCheck1 = true;
            }else if ($scope.imageState.refused && data.status == 6) {
                imageStateCheck1 = true;
            }else if ($scope.imageState.cancle && data.status == 5) {
                imageStateCheck1 = true;
            }else if ($scope.imageState.reading && data.status == 3) {
                imageStateCheck1 = true;
            } else if ($scope.imageState.isDone && data.status == 7) {
                imageStateCheck1 = true;
            }

            // 报告状态
            recordStateCheck1 = $scope.checkState ?( data.status == 8):( data.status == 7);

            result = result && idcheck && checkName&&timecheck1&&timecheck2 && imageStateCheck1  && recordStateCheck1;
            console.log("title:"+title+"|result:"+result+"|idcheck:"+idcheck+"|checkName:"+ checkName +"|timecheck1:"+timecheck1+"|timecheck2:"+timecheck2);
            if (result == true) {
                $scope.asks.push(data);
            }
            if ($scope.asks.length == 0) {
                setTimeout(function () {
                    $('#tblOrders').trigger('footable_redraw');
                }, 100);
            }
        })
        console.log($scope.asks);
        setTimeout(function () {
            $('#tblOrders').trigger('footable_redraw');
        }, 100);
    }
    $scope.reset = function () {
        window.location.reload();
    }
    //点击打开蒙版
    $scope.editor = function (name, age, sex, institutionName, studyDate, modality, imageId, birthday) {
        var modalInstance = $modal.open({
            templateUrl: 'app/main/Viewer/editorPage.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
        loginServer.patient = {
            name: name,
            age: age,
            sex: sex,
            institutionName: institutionName,
            studyDate: studyDate,
            modality: modality,
            imageId: imageId,
            birthday: birthday
        }
    };
    //点击打开电子单
    $scope.openForm = function (imageid) {
        var formdata = new FormData();
        formdata.append('imageId', imageid);
        formdata.append('userid', userid);
        $.ajax({
                type: 'post', url: $rootScope.servers + '/service/imageReport/printElectronImage', data: formdata,
                processData: false, contentType: false
            }
            )
            .success(function (data) {
                if (data.result == 0) {
                    var url = data.message
                    window.open($rootScope.servers + url, '_blank');
                } else {
                    toaster.pop({
                        type: 'error',
                        body: '打开电子表单失败出错',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
            }).error(function (data) {
            toaster.pop({
                type: 'error',
                body: '打开电子表单失败出错',
                showCloseButton: true,
                timeout: 1200
            });
        })
    }
    ////分享
    //$scope.shareImage = function (imageid) {
    //    loginServer.shareImageid = imageid;
    //    var modalInstance1 = $modal.open({
    //        templateUrl: 'app/main/myshare/shareImage.html',
    //        controller: ModalInstanceCtrl,
    //        windowClass: "animated fadeIn"
    //    });
    //}
    //大病咨询
    $scope.askMessage = function (person) {
        window.localStorage.setItem('askMessages', JSON.stringify(person));
    }
    //常规咨询
    $scope.startNormalAsk = function (imageid) {
        loginServer.normalAskMessageImageid = imageid;
        var modalInstance = $modal.open({
            templateUrl: 'app/main/ask/startNormalAsk.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    }
    //viewer
    $scope.viewer = function (imageid, patientid, studyid) {
        $('body').addClass('mini-navbar');
        $http.get($rootScope.servers + "/service/user/" + userid + "/privacy")
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseMessageData(data.message);
                    $scope.isDicomOrJpg = message[0].isDicomOrJpg;
                    var url = '';
                    //当用户设置里面为dicom时，访问dicom类型，否则为jpg类型
                    if ($scope.isDicomOrJpg != null && $scope.isDicomOrJpg == 1) {
                        url = '?imageid=' + imageid + '&patientID='
                            + patientid + '&' + 'studyUID=' + studyid
                            + '&reportFlag=0' + '&type=dicom';
                    } else {
                        url = '?imageid=' + imageid + '&patientID='
                            + patientid + '&' + 'studyUID=' + studyid
                            + '&reportFlag=0' + '&type=jpg'
                    }

                    window.location.href = '/app/imageview/viewer.html' + url
                }
            })
    }
    $scope.cancleConsulti = function (imageid,askid){//机构取消咨询弹窗
        window.localStorage.setItem('askid', askid);

        var data = {
            imageid: imageid,
            curpage: 1,
            pagesize: 100,
            asktype: 1,
            adduser: userid
        };

        var transform = function (data) {
            return $.param(data);
        }
        function parseMessageData(data) {
            try {
                var message = JSON.parse(data);
                return message;
            } catch (e) {
                return false;
            }
        }
        $http.post($rootScope.servers + '/service/ask/getAskByImageId', data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var returnmessage = parseMessageData(data.message);
                    for (var i = 0; i < returnmessage.length; i++) {
                        var askStatus = returnmessage[i];
                        if(askStatus.status !=1){
                            swal({
                                title: "取消失败",
                                text: "您已经发起咨询，不能取消",
                                type: "warning",
                                showCancelButton: false,
                                confirmButtonText: "ok",
                                closeOnConfirm: true,
                                closeOnCancel: true
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    $state.reload();
                                }
                            })
                        }else{
                            swal({
                                    title: "确定要取消咨询吗？",
                                    showCancelButton: true,
                                    confirmButtonText: "确定",
                                    cancelButtonText: "取消",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                },
                                function (isConfirm) {
                                    if (isConfirm) {
                                        var askid = window.localStorage.getItem('askid', askid);
                                        $http.get($rootScope.servers + '/service/ask/cancleask?askid=' + askid+'&cancelReason='+$scope.cancelReason+'&userType=3')
                                            .success(function (data) {
                                                if (data.result != -1) {
                                                    window.location.href = "/#/homePage"
                                                    $state.reload();
                                                }
                                            })
                                    }
                                });
                        }
                    }

                }
            })

    }

    var transform = function (data) {
        return $.param(data);
    }
    $scope.applyForAsk = function(imageid,askid){
        loginServer.imageId = imageid;
        loginServer.askId = askid;
        loginServer.userid = window.localStorage.getItem('userid');;


    }

    //$scope.instituteSettingForm = function () { 暂时停止
    //    var modalInstance = $modal.open({
    //        templateUrl: 'app/main/instituteSetting.html',
    //        controller: ModalInstanceCtrl,
    //        windowClass: "animated fadeIn"
    //    });
    //}
} // 机构控制器结束
//ask message

function askMessage($scope, $http, parseData, $rootScope, toaster, $modal, loginServer, myToaster, _undefined, handleTime) {
    var userid = window.localStorage.getItem('userid');
    var institutionname = parseData(window.localStorage.getItem('user')).username;
    var askMessage = parseData(window.localStorage.getItem('askMessages'));
    $scope.imageMessage = {};
    $scope.imageConsult = true;
    var transform = function (data) {
        return $.param(data);
    }
    if (askMessage) {
        $scope.experts = $.makeArray(askMessage);
        $scope.consult = {
            title: askMessage.patientid + '.' + askMessage.patientname + '.' + gender(askMessage.gender) + getAge(askMessage.birthday) + '.' + '专家咨询',
            age: getAge(askMessage.birthday)
        }
        $scope.askOne = true;
    } else {
        $scope.askOne = false;
        $('input[name="imagecheck"]:checked').checked = false;
        var askdata = {
            userid: userid,
            curpage: 1,
            pagesize: 1000,
            havereport: -1,
            haveask: -1,
        }
        initlist();
        $scope.showTitle = function (imageid) {
            function getDaysLater(DaysToAdd) {
                var newdate = new Date();
                var year = newdate.getFullYear();
                var month = newdate.getMonth() + 1;
                var strDate = newdate.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }

                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }

                var hours = newdate.getHours();
                if (hours >= 0 && hours <= 9) {
                    hours = "0" + hours;
                }

                var minutes = newdate.getMinutes();
                if (minutes >= 0 && minutes <= 9) {
                    minutes = "0" + minutes;
                }

                var seconds = newdate.getSeconds();
                if (seconds >= 0 && seconds <= 9) {
                    seconds = "0" + seconds;
                }

                var currentdate = year + '-' + month + '-' + strDate + " "
                    + hours + ':' + minutes + ':' + seconds;
                return currentdate;
            }

            var later = getDaysLater();
            $scope.consult = {title: '专家咨询' + '_' + later};
        }
    }

    function initlist() {
        $http.post($rootScope.servers + '/service/image/list', askdata, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                if (data.result == 0) {
                    var message = parseData(data.message);
                    $scope.experts1 = message;
                    $scope.experts = [];
                    angular.forEach($scope.experts1, function (obj, index, array) {
                        if (obj.modality != "noImage") {
                            $scope.experts.push(obj);
                        }
                        getCount(obj.imageid);
                    });
                }

            })
    }

    //定义map装载大病咨询数目
    var Map = function () {
        this._entrys = new Array();
        this.put = function (key, value) {
            if (key == null || key == undefined) {
                return;
            }
            var index = this._getIndex(key);
            if (index == -1) {
                var entry = new Object();
                entry.key = key;
                entry.value = value;
                this._entrys[this._entrys.length] = entry;
            } else {
                this._entrys[index].value = value;
            }
        };
        this.get = function (key) {
            var index = this._getIndex(key);
            return (index != -1) ? this._entrys[index].value : null;
        };
        this._getIndex = function (key) {
            if (key == null || key == undefined) {
                return -1;
            }
            var _length = this._entrys.length;
            for (var i = 0; i < _length; i++) {
                var entry = this._entrys[i];
                if (entry == null || entry == undefined) {
                    continue;
                }
                if (entry.key === key) {//equal
                    return i;
                }
            }
            return -1;
        };
    }
    $scope.map = new Map();
    function getCount(imageid) {
        var data = {
            imageid: parseInt(imageid),
            curpage: 1,
            pagesize: 100,
            asktype: 0,
            adduser: userid
        };
        var length = 0;
        $http.post($rootScope.servers + '/service/ask/getAskByImageId', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        length = message.length;
                        // $scope.map.push(length);
                        $scope.map.put(imageid, length);
                    }
                }
            });
    }

    var askDoctorid = 0;
    $scope.isHide = true;
    function getAge(birth) {
        var age;
        if (birth == '' || birth.indexOf("NaN") > -1 || birth == null) {
            age = '';
        } else {

            var aDate = new Date();
            var thisYear = aDate.getFullYear();
            var thisMonth = aDate.getMonth() + 1;
            var thisDay = aDate.getDate();
            var brithy = birth.substr(0, 4);
            var brithm = birth.substr(4, 2);
            var brithd = birth.substr(6, 2);
            if (thisMonth - brithm < 0) {
                age = thisYear - brithy - 1;
            } else {
                if (thisDay - brithd >= 0) {
                    age = thisYear - brithy;
                } else {
                    age = thisYear - brithy - 1;
                }
            }
        }
        return age;
    }

    function gender(gender) {
        if (gender == 1) {
            return '男';
        } else if (gender == 2) {
            return '女';
        } else {
            return '';
        }
    }


    var askFlag = false;
    var expertLevel = 0;
    //省市联动
    var citySelector;
    $(function () {
        citySelector = function () {
            var province = $("#ask-province");
            var city = $("#ask-city");
            var district = $("#ask-area");
            var preProvince = $("#pre_province");
            var preCity = $("#pre_city");
            var preDistrict = $("#pre_district");
            var jsonProvince = "../js/content/json-array-of-province.js";
            var jsonCity = "../js/content/json-array-of-city.js";
            var jsonDistrict = "../js/content/json-array-of-district.js";
            var hasDistrict = true;
            var initProvince = "<option value='0'>省份</option>";
            var initCity = "<option value='0'>城市</option>";
            var initDistrict = "<option value='0'>区县</option>";
            return {
                Init: function () {
                    var that = this;
                    that._LoadOptions(jsonProvince, preProvince, province, null, 0, initProvince);
                    province.change(function () {
                        that._LoadOptions(jsonCity, preCity, city, province, 2, initCity);
                    });
                    if (hasDistrict) {
                        city.change(function () {
                            that._LoadOptions(jsonDistrict, preDistrict, district, city, 4, initDistrict);
                        });
                        province.change(function () {
                            city.change();
                        });
                    }
                    province.change();
                },
                _LoadOptions: function (datapath, preobj, targetobj, parentobj, comparelen, initoption) {
                    $.get(datapath,
                        function (r) {
                            var t = ''; // t: html容器
                            var s; // s: 选中标识
                            var pre; // pre: 初始值
                            if (preobj == undefined) {
                                pre = 0;
                            } else {
                                pre = preobj.val();
                            }
                            for (var i = 0; i < r.length; i++) {
                                s = '';
                                if (comparelen === 0) {
                                    if (pre !== "" && pre !== 0 && r[i].code === pre) {
                                        s = ' selected=\"selected\" ';
                                        pre = '';
                                    }
                                    t += '<option value=' + r[i].code + s + '>' + r[i].name + '</option>';
                                } else {
                                    var p = parentobj.val();
                                    if (p.substring(0, comparelen) === r[i].code.substring(0, comparelen)) {
                                        if (pre !== "" && pre !== 0 && r[i].code === pre) {
                                            s = ' selected=\"selected\" ';
                                            pre = '';
                                        }
                                        t += '<option value=' + r[i].code + s + '>' + r[i].name + '</option>';
                                    }
                                }
                            }
                            if (initoption !== '') {
                                targetobj.html(initoption + t);
                            } else {
                                targetobj.html(t);
                            }
                            targetobj.selectpicker('refresh');
                        }, "json");
                }
            };
        }();
        citySelector.Init();
    });

    initDoctor();
    function initDoctor() {
        var data = {
            instid: userid,
            userlevel: expertLevel,
            curpage: 1,
            pagesize: 1000
        }
        if (askFlag) {
            data = $scope.research;
        }
        $http.post($rootScope.servers + '/service/user/getDoctorByLevel', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.persons1 = message;
                        $scope.persons = $scope.persons1;

                    }
                }
            })
    }

    //local search

    $scope.advanceSearchExpert = function () {
        $scope.persons = [];
        if ($scope.doctorname != undefined) {
            $scope.doctorname1 = $scope.doctorname.toLowerCase();
            $scope.doctorname1 = $scope.doctorname1.replace(/\s+/g, '');
        }
        if ($scope.hospital != undefined) {
            $scope.hospital = $scope.hospital1.toLowerCase();
            $scope.hospital1 = $scope.hospital1.replace(/\s+/g, '');
        }
        angular.forEach($scope.persons1, function (data, index, array) {
                var areaCheck = false;
                var titleCheck = false;
                var hosipitalCheck = false;
                var doctorname = data.truename.toLowerCase();
                var hospital = data.hospital.toLowerCase();
                if (($("#ask-province").val() == 0 || data.province == $("#ask-province").val()) &&
                    ($("#ask-city").val() == 0 || data.city == $("#ask-city").val()) &&
                    ($("#ask-area").val() == 0 || data.area == $("#ask-area").val())) {
                    areaCheck = true;
                }
                if (($("#ask-title").val() == '' || data.title == $("#ask-title").val()) && (data.department == $("#ask-department").val() || $("#ask-department").val() == '')) {
                    titleCheck = true;
                }
                if (($scope.doctorname == '' || $scope.doctorname == undefined || doctorname.indexOf($scope.doctorname1) != -1)
                    && ($scope.hospital == '' || $scope.hospital == undefined || hospital.indexOf($scope.hospital1) != -1)) {
                    hosipitalCheck = true;
                }
                if (areaCheck && titleCheck && hosipitalCheck == true) {
                    $scope.persons.push(data);
                }
            }
        )
    }
    $scope.searchExpert = function (level) {
        $scope.persons = [];
        angular.forEach($scope.persons1, function (data, index, array) {
            if (level == data.userlevel || level == 0) {
                $scope.persons.push(data);
            }
        })
    }
    $scope.isSelect = function (doctorid) {
        askDoctorid = doctorid;
    }

    $scope.openFile = function () {
        angular.element("#fileupload").click();
    }
    $scope.uploaditems = function () {
        var file = document.getElementById('fileupload').files;
        $scope.files = file;
        $scope.isHide = false;
    }
    $scope.clearFile = function () {
        $scope.files = '';
        $scope.isHide = true;
    }
    $scope.uploadCardAttachment = function () {
        $scope.fileSize = 0;
        $scope.fileNameLength = 0;
        var flag = true;
        var array = ["txt", "pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "dcm", "zip","rar","bmp","7zip","jpeg"];
        $scope.fileNum = 0;
        $.each($scope.files, function (i, data) {
            $scope.fileSize = $scope.fileSize + parseInt(data.size);
            $scope.fileNameLength = $scope.fileNameLength + data.name.length;
            $scope.fileNum++;
            var strs = data.name.split(".");
            var fileType = strs[strs.length - 1];
            fileType = fileType.toLowerCase();
            if ($.inArray(fileType, array) == -1) {
                flag = false;
                return false;
            }
        })

        if ($scope.fileSize > 10240000) {
            toaster.pop({
                type: 'warning',
                body: '上传文件大于10M',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($scope.fileSize <= 0) {
            toaster.pop({
                type: 'warning',
                body: '上传文件为空',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($scope.fileNameLength > 250) {
            myToaster('warning', '上传失败', '文件上传名过长');
        }
        else if ($scope.fileNum > 5) {
            myToaster('warning', '上传失败', '文件一次上传数量不能超过5个');
        }
        else if (flag == false) {
            myToaster('warning', "上传文件格式错误", "请重新选择文件");
        }
        else {
            var formData = new FormData();
            angular.forEach($scope.files, function (data) {
                formData.append("file", data);
            })
            formData.append("userid", userid);
            $.ajax({
                url: $rootScope.servers + "/service/ask/uploadAttachment",
                type: "POST",
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                dataType: "JSON",
                success: function (data) {
                    var result = data.result;
                    if (result == 0) {
                        var message = parseData(data.message);
                        if (message) {
                            /*toaster.pop({
                                type: 'success',
                                body: '上传文件成功',
                                showCloseButton: true,
                                timeout: 2200
                            });
                            $scope.consult.cardid = message;*/
                            alert("上传文件成功！")
                        }
                    }
                }

            })
        }
    }
    $scope.startConsult = function () {
        var imagestr = '';
        // var reg = /^[1-9][0-9]{0,2}$/;
        $('input[name="imagecheck"]:checked').each(function () {
            imagestr += $(this).val() + ";";
        });
        if (imagestr == '' || imagestr == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请选择咨询影像',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else if (askDoctorid == 0) {
            toaster.pop({
                type: 'warning',
                title: '请选择咨询医生',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($scope.consult.title == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请填写标题！',
                showCloseButton: true,
                timeout: 2200
            });
            return;
        } else if ($scope.consult.age == undefined || parseInt($scope.consult.age) > 150 || parseInt($scope.consult.age) <= 0) {

            toaster.pop({
                type: 'warning',
                title: '请填写正确年龄！',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else if ($scope.consult.degree == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请选择紧急程度！',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else if ($scope.consult.memo == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请填写基本病史！',
                showCloseButton: true,
                timeout: 2200
            });
        } else {
            $scope.consult.imagestr = imagestr;
            $http.get($rootScope.servers + '/service/user/' + askDoctorid)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        loginServer.userDoctor = parseData(data.message)[0];
                        loginServer.consultMessage = $scope.consult;
                        var modalInstance = $modal.open({
                            templateUrl: 'app/main/ask/consultConfirm1.html',
                            controller: ModalInstanceCtrl,
                            windowClass: "animated fadeIn"
                        });
                    }
                })

        }

    }
    //noImage consult
    $scope.redrawTable = function (type) {
        $scope.imageConsult = type == 1 ? true : false;
        $scope.consult = {};
        $scope.fileNum = 0;
        $scope.files = '';
        $scope.isHide = true;
    }
    $scope.imageMessage.institutionname = institutionname;
    $scope.startConsultNoImage = function () {
        if ($scope.fileNum == 0) {
            myToaster('warning', '', '请上传附件');
        }
        else if (_undefined($scope.imageMessage.patientname)) {
            myToaster('warning', '', '请填写姓名');
        } else if (_undefined($scope.imageMessage.birthday)) {
            myToaster('warning', '', '请选择正确生日');
        }
        else if (_undefined($scope.imageMessage.sex)) {
            myToaster('warning', '', '请选择性别');
        }
        else if (askDoctorid == 0) {
            toaster.pop({
                type: 'warning',
                title: '请选择咨询医生',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($scope.consult.title == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请填写标题！',
                showCloseButton: true,
                timeout: 2200
            });
            return;
        } else if ($scope.consult.age == undefined || $scope.consult.age > 150 || $scope.consult.age < 0) {
            toaster.pop({
                type: 'warning',
                title: '请填写正确年龄！',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else if ($scope.consult.degree == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请选择紧急程度！',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else if ($scope.consult.memo == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请填写基本病史！',
                showCloseButton: true,
                timeout: 2200
            });
        } else {
            $http.get($rootScope.servers + '/service/user/' + askDoctorid)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        $scope.imageMessage.birthday = handleTime($("#askTimeInput").val()) + '';
                        $scope.imageMessage.patientid = moment().format('X');
                        $scope.imageMessage.imagetype = 'jpg';
                        $scope.imageMessage.filmcount = $scope.fileNum + '';
                        $scope.imageMessage.studyid = moment().format('X') + '';
                        $scope.imageMessage.seriesid = moment().format('X') + ".1";
                        $scope.imageMessage.sopinstanceuid = moment().format('X') + ".1.1";
                        $scope.imageMessage.studydate = moment().format("YYYYMMDD") + '';
                        $scope.imageMessage.uploaddate = moment().format("YYYYMMDD") + '';
                        // $scope.imageMessage.thumb='linkingMed';
                        $scope.imageMessage.modality = 'noImage';
                        loginServer.imageData = $scope.imageMessage;
                        loginServer.userDoctor = parseData(data.message)[0];
                        loginServer.consultMessage = $scope.consult;
                        var modalInstance = $modal.open({
                            templateUrl: 'app/main/ask/consultConfirm.html',
                            controller: ModalInstanceCtrl,
                            windowClass: "animated fadeIn"
                        });
                    }
                })
        }
    }
}
//normal ask message
function normalAskMessage($scope, $rootScope, $http, parseData, transform, toaster, getThisWeek,
                          _undefined, getPreWeek, getThisMonth, getPreMonth, handleTime, myToaster) {

    var userid = window.localStorage.getItem('userid');
    $scope.mFilter_noImage = function (e) {
        return e.modality != "noImage";
    }
    function getDaysLater(DaysToAdd) {
        var newdate = new Date();
        var newtimems = newdate.getTime() + (DaysToAdd * 24 * 60 * 60 * 1000);
        newdate.setTime(newtimems);

        var year = newdate.getFullYear();
        var month = newdate.getMonth() + 1;
        var strDate = newdate.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }

        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }

        var hours = newdate.getHours();
        if (hours >= 0 && hours <= 9) {
            hours = "0" + hours;
        }

        var minutes = newdate.getMinutes();
        if (minutes >= 0 && minutes <= 9) {
            minutes = "0" + minutes;
        }

        var seconds = newdate.getSeconds();
        if (seconds >= 0 && seconds <= 9) {
            seconds = "0" + seconds;
        }

        var currentdate = year + '-' + month + '-' + strDate + " "
            + hours + ':' + minutes + ':' + seconds;
        return currentdate;
    }

    var later = getDaysLater(parseInt(2, 10));
    $scope.title = '常规咨询' + '_' + later;
    init();
    function init() {
        $scope.doctorstr = [];
        $scope.imagestr = [];
        $scope.visible = true;
        $scope.inputName = '患者姓名';
        $scope.inputPlace = '请输入查询姓名';
        $scope.starttime1 = '上传起始日期';
        $scope.endtime1 = '上传截止日期';
        $scope.inputName1 = '患者ID';
        $scope.starttime = '拍摄起始日期';
        $scope.endtime = '拍摄截止日期';
        $scope.asktype = 3;
        $scope.consultEndtime = moment().add('days', 2).format('YYYY-MM-DD HH:mm');
        var data = {
            userid: userid,
            curpage: 1,
            pagesize: 1000,
            havereport: -1,
            haveask: -1,
        }
        $http.post($rootScope.servers + '/service/image/list', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                if (data.result == 0) {
                    var message = parseData(data.message)
                    $scope.images1 = message;
                    $scope.images = $scope.images1;
                    angular.forEach($scope.images1, function (obj, index, array) {
                        getCount(obj.imageid);
                    });
                }
            })

    }

    var Map = function () {
        this._entrys = new Array();
        this.put = function (key, value) {
            if (key == null || key == undefined) {
                return;
            }
            var index = this._getIndex(key);
            if (index == -1) {
                var entry = new Object();
                entry.key = key;
                entry.value = value;
                this._entrys[this._entrys.length] = entry;
            } else {
                this._entrys[index].value = value;
            }
        };
        this.get = function (key) {
            var index = this._getIndex(key);
            return (index != -1) ? this._entrys[index].value : null;
        };
        this._getIndex = function (key) {
            if (key == null || key == undefined) {
                return -1;
            }
            var _length = this._entrys.length;
            for (var i = 0; i < _length; i++) {
                var entry = this._entrys[i];
                if (entry == null || entry == undefined) {
                    continue;
                }
                if (entry.key === key) {//equal
                    return i;
                }
            }
            return -1;
        };
    }
    $scope.map = new Map();
    $scope.map2 = new Map();
    function getCount(imageid) {
        var data = {
            imageid: parseInt(imageid),
            curpage: 1,
            pagesize: 100,
            asktype: 0,
            adduser: userid
        };
        var reportData = {
            imageid: imageid
        }
        var length = 0;
        $http.post($rootScope.servers + '/service/ask/getAskByImageId', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        length = message.length;
                        // $scope.map.push(length);
                        $scope.map.put(imageid, length);
                    }
                }
            });
        $http.post($rootScope.servers + '/service/imageReport/getReportCountByImageId', reportData, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                if (data.result == 0) {
                    $scope.map2.put(imageid, data.message);
                }
            })

    }


    $scope.checkSelect = function (imageid, $event) {
        var index = $scope.doctorstr.indexOf($event.target.defaultValue);
        if ($event.target.checked == true) {
            if (index < 0) {
                $scope.doctorstr.push($event.target.defaultValue);
            }
        }
        else {
            if (index >= 0) {
                $scope.doctorstr.splice(index, 1);
            }
        }
    }
    $scope.checkSelect1 = function (userid, $event) {
        var index = $scope.imagestr.indexOf($event.target.defaultValue);
        if ($event.target.checked == true) {
            if (index < 0) {
                $scope.imagestr.push($event.target.defaultValue);
            }
        }
        else {
            if (index >= 0) {
                $scope.imagestr.splice(index, 1);
            }
        }
    }
    $scope.addAsk = function () {
        var imagestr = '';
        var data = {};
        angular.forEach($scope.imagestr, function (data) {
            imagestr += data + ';';
        })
        data.imagestr = imagestr;
        var asktype = $('input[name="asktype"]:checked').val();
        var hasupload = $('input[name="hasupload"]:checked').val();
        var title = $.trim($("#asktitle").val());
        var endtime = $("#askTimeInput").val();
        if (asktype == 3) {
            var targetuserstr = '';
            angular.forEach($scope.doctorstr, function (data) {
                targetuserstr += data + ';';
            })
            if (targetuserstr == '' || targetuserstr == undefined) {
                toaster.pop({
                    type: 'warning',
                    title: '请选择医生',
                    showCloseButton: true,
                    timeout: 2200
                });
                return;
            }
            data.targetuserstr = targetuserstr;
        }
        if (imagestr == "" || imagestr == 'undefined') {
            toaster.pop({
                type: 'error',
                body: '请选择影像',
                showCloseButton: true,
                timeout: 2200
            });
            return;
        } else if (title == '') {
            toaster.pop({
                type: 'error',
                body: '请输入标题',
                showCloseButton: true,
                timeout: 2200
            });
        } else if (endtime == '') {
            toaster.pop({
                type: 'error',
                body: '请选择时间',
                showCloseButton: true,
                timeout: 2200
            });
        } else {
            data.title = title;
            data.imagestr = imagestr;
            data.endtime = endtime;
            data.adduser = userid;
            data.hasupload = hasupload;
            data.asktype = asktype;
            data.status = 1;
            data.memo = $.trim($("#normalHistory").val());
            $http.post($rootScope.servers + '/service/ask/new', data)
                .success(function (data) {
                    if (data.result == 0) {
                        toaster.pop({
                            type: 'success',
                            body: '咨询成功',
                            showCloseButton: true,
                            timeout: 2200
                        });
                        window.location.href = "/#/normalConsult";
                    } else if (data.result == -1) {
                        toaster.pop({
                            type: 'danger',
                            body: '咨询失败',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    } else {
                        toaster.pop({
                            type: 'danger',
                            body: '咨询失败',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    }
                })
                .error(function () {
                    toaster.pop({
                        type: 'danger',
                        body: '服务器异常',
                        showCloseButton: true,
                        timeout: 2200
                    });
                })
        }

    }
    //search
    var datali = {
        instid: userid,
        curpage: 1,
        pagesize: 1000
    }
    $http.post($rootScope.servers + '/service/user/doctorlist', datali, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        }
        )
        .success(function (data) {
            if (data.result == 0) {
                var message = parseData(data.message);
                $scope.doctors1 = message;
                $scope.doctors = $scope.doctors1;
            }
        })
    $scope.searchImage = function () {
        var flag1 = false;
        var flag2 = false;
        if (($scope.searchTerm == undefined || $scope.searchTerm == '') && ($scope.searchTerm1 == undefined || $scope.searchTerm1 == '')) {
            flag1 = true;
        }
        if ($scope.visible1 == true && $scope.visible2 == true && $scope.visible3 == true && $scope.visible4 == true) {
            flag2 = true;
        }
        if (flag1 && flag2 == true) {
            $scope.images=$scope.images1;
            return;
        } else {
            $scope.searchStartTime = $scope.visible1 == false ? handleTime($("#studystartdate").val()) : -1;
            $scope.searchEndTime = $scope.visible2 == false ? handleTime($("#studyenddate").val()) : 99999999;
            $scope.searchStartTime1 = $scope.visible3 == false ? handleTime($("#studystartdate1").val()) : -1;
            $scope.searchEndTime1 = $scope.visible4 == false ? handleTime($("#studyenddate1").val()) : 99999999;
            $scope.images = [];
            angular.forEach($scope.images1, function (data, index, array) {
                var namecheck = false;
                var idcheck = false;
                var timecheck1 = false;
                var timecheck2 = false;
                var patientname = data.patientname.toLowerCase();
                var patientid = data.patientid.toLowerCase();
                var imagetype = data.modality.toLowerCase();
                if (patientname.indexOf($scope.handleTerm) != -1 || $scope.handleTerm == imagetype || $scope.handleTerm == undefined) {
                    namecheck = true;
                }
                if (patientid.indexOf($scope.handleTerm1) != -1 || $scope.handleTerm1 == undefined) {
                    idcheck = true;
                }
                if ($scope.searchStartTime1 <= parseInt(data.uploaddate) && $scope.searchEndTime1 >= parseInt(data.uploaddate)) {
                    timecheck1 = true;
                }
                if ($scope.searchStartTime <= handleTime(data.studydate) && $scope.searchEndTime >= handleTime(data.studydate)) {
                    timecheck2 = true;
                }
                if (namecheck && timecheck1 && timecheck2 && idcheck) {
                    $scope.images.push(data);
                }
            })
        }

    }
    $scope.quickSearchImage = function (type) {

        var checkTime = '';
        switch (type) {
            case 1:
                checkTime = getPreWeek;
                break;
            case 2:
                checkTime = getPreMonth;
                break;
            case 3:
                checkTime = getThisWeek;
                break;
            case 4:
                checkTime = getThisMonth;
                break;
            default:
                break;
        }
        $scope.images = [];

        angular.forEach($scope.images1, function (data, index, array) {
            var uploadtime = parseInt(data.uploaddate);
            if (uploadtime >= checkTime) {
                $scope.images.push(data);
            }
        })
    }
    $scope.updateasktype = function (type) {
        if (type == 3) {
            $scope.visible = true;
        } else {
            $scope.visible = false;
        }
        if (type == 2) {
            $http.get($rootScope.servers + '/service/inst/mydoctorgrouplist?instid=' + userid)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        var message = parseData(data.message);
                        $scope.doctorNum = [];
                        if (_undefined(message)) {
                            myToaster('warning', '选择邀请列表失败', '我的医生中没有医生分组');
                            // $("#asktype1").checked=true;
                            $scope.asktype = 3;
                        } else {
                            var dataFriend = {};
                            dataFriend.instid = userid;
                            $.each(message, function (i, val) {
                                dataFriend.groupid = val.groupid;
                                $.ajax({
                                        url: $rootScope.servers + '/service/inst/mydoctorlist?curpage=1&pagesize=1000',
                                        data: dataFriend,
                                        type: 'post',
                                        dataType: 'json',
                                        async: false
                                    })
                                    .success(function (data) {
                                        var result = data.result;
                                        if (result == 0) {
                                            var message = parseData(data.message);
                                            $scope.doctorNum.push(message);
                                        }
                                    })
                                if (!_undefined($scope.doctorNum)) {
                                    return false;
                                }
                            })
                            if (_undefined($scope.doctorNum)) {
                                myToaster('warning', '发起咨询失败', '我的医生中没有医生好友');
                                $scope.asktype = 3;
                            }
                        }
                    }
                })
        }
    }
    $scope.askSearch = function () {
        $scope.nameValue = $("#ask-term").val();
        $scope.nameValue1 = $scope.nameValue.toLowerCase();
        $scope.nameValue1 = $scope.nameValue1.replace(/\s+/g, '');
        $scope.doctors = [];
        angular.forEach($scope.doctors1, function (data) {
            var name = data.truename.toLowerCase();
            if ($scope.nameValue == '' || name.indexOf($scope.nameValue1) != -1) {
                $scope.doctors.push(data);
            }
        })
    }
    //search my doctor
    $scope.quickAskSearch = function () {
        var doctorData = {};
        doctorData.instid = userid;
        $http.post($rootScope.servers + '/service/inst/mydoctorlist?curpage=1&pagesize=1000', doctorData, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                if (data.result == 0) {
                    var message = parseData(data.message);
                    $scope.doctors = message;
                }
            })
    }

}
//consult confirm with image
function consultConfirm1(loginServer, $scope, $http, $rootScope, toaster, transform, _undefined) {
    $scope.userDoctor = loginServer.userDoctor;
    $scope.consult = loginServer.consultMessage;

    var userid = window.localStorage.getItem('userid');
    var data = {
        asknumber: loginServer.userDoctor.asknumber,
        title: loginServer.consultMessage.title,
        targetuser: loginServer.userDoctor.userid,
        imagestr: loginServer.consultMessage.imagestr,
        cardid: loginServer.consultMessage.cardid,
        memo: loginServer.consultMessage.memo,
        adduser: userid,
        askid: 0,
        recommend: loginServer.consultMessage.recommend,
        askquestion: loginServer.consultMessage.askquestion,
        degree: loginServer.consultMessage.degree,
        status: 1
    };


    $scope.consultConfirm = function () {
        $http.post($rootScope.servers + '/service/ask/new', data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    // window.location.href = '/#/homePage';
                    toaster.pop({
                        type: 'success',
                        title: '发起咨询成功',
                        showCloseButton: true,
                        timeout: 3200
                    });
                    window.location.href = '/#/expertConsult';
                }
            })
    }
}
//no image consult confirm
function consultConfirm(loginServer, $scope, $http, $rootScope, toaster, transform, _undefined) {
    $scope.userDoctor = loginServer.userDoctor;
    $scope.consult = loginServer.consultMessage;
    var imageid = '';
    var userid = window.localStorage.getItem('userid');
    var data = {
        asknumber: loginServer.userDoctor.asknumber,
        title: loginServer.consultMessage.title,
        targetuser: loginServer.userDoctor.userid,
        imagestr: loginServer.consultMessage.imagestr,
        cardid: loginServer.consultMessage.cardid,
        memo: loginServer.consultMessage.memo,
        adduser: userid,
        askid: 0,
        recommend: loginServer.consultMessage.recommend,
        askquestion: loginServer.consultMessage.askquestion,
        degree: loginServer.consultMessage.degree,
        status: 1
    };
    var imageData = {};
    imageData = loginServer.imageData;
    imageData.userid = userid;

    $http.post($rootScope.servers + '/service/image/uploadDcmImageInfo', imageData, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
        .success(function (data) {
            if (data.result == 0) {
                imageid = data.imageid;
            }
        })
    $scope.consultConfirm1 = function () {
        if (!_undefined(imageid)) {
            data.imagestr = imageid;
        }
        $http.post($rootScope.servers + '/service/ask/new', data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    // window.location.href = '/#/homePage';
                    toaster.pop({
                        type: 'success',
                        title: '发起咨询成功',
                        showCloseButton: true,
                        timeout: 3200
                    });
                    window.location.href = '/#/expertConsult';
                }
            })
    }
}
//normal ask message
/*
 编辑页面
 */
function editor($scope, loginServer, $rootScope, $http, toaster) {
    $scope.patient = loginServer.patient;
    $scope.patient.age = parseInt($scope.patient.age);
    //用于日期补位
    function p(s) {
        return s < 10 ? '0' + s : s;
    }

    $scope.editorSubmit = function () {
        var myDate = new Date();
        var curYear = myDate.getFullYear();//获取完整的年份(4位,1970-????)
        var curMonth = myDate.getMonth() + 1;//获取当前月份(0-11,0代表1月)
        var curDate = myDate.getDate();    //获取当前月份(0-11,0代表1月)
        var age = $scope.patient.age;
        var reg = /^[1-9][0-9]{0,2}$/;
        if (curMonth < 10) {
            curMonth = '0' + curMonth;
        }
        var curBirthday = (curYear - age).toString() + curMonth + curDate;
        var photoDate = $("#studyDate").val();
        photoDate = photoDate.substring(0, 4) + photoDate.substring(5, 7) + photoDate.substring(8, 10);
        var data = {
            imageid: $scope.patient.imageId,
            patientname: $scope.patient.name,
            birthday: curBirthday,
            studydate: photoDate,
            institutionname: $scope.patient.institutionName,
            modality: $scope.patient.modality
        };
        if ($scope.patient.sex) {
            data.sex = $scope.patient.sex;
        }
        if (parseInt($scope.patient.age) <= 0 || parseInt($scope.patient.age) > 150 || $scope.patient.age == '' || $scope.patient.age == undefined || !reg.test($scope.patient.age)) {
            toaster.pop({
                type: 'warning',
                body: '请填写合适年龄',
                showCloseButton: true,
                timeout: 2200
            });
            return;
        }
        else {
            $http.post($rootScope.servers + '/service/image/update', data)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        $scope.ok();
                        window.location.reload();
                        toaster.pop({
                            type: 'success',
                            body: '编辑资料成功',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    }
                }).error(function () {
                toaster.pop({
                    type: 'error',
                    body: '编辑资料出错',
                    showCloseButton: true,
                    timeout: 1200
                });
            });
        }

    }
}
/*
 表单
 */
function datatablesCtrl($scope, DTOptionsBuilder) {

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM('<"html5buttons"B>lTfgitp')
        .withOption({
            // aoColumnDefs: [ { "bSortable": false, "aTargets": [ 3 ] }]
            //         "order": [[ 6, "desc" ]]
        })
        .withButtons([
            {

                customize: function (win) {
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ])
        .withPaginationType('full_numbers')
        .withDisplayLength(5)
        .withLanguage({
            "sEmptyTable": "无数据",
            // "sInfo": "显示START到END列,总共TOTAL个",
            "sInfo": "显示 _START_ 到 _END_ 共 _TOTAL_ 条",
            "sInfoEmpty": "显示 0 到 0 共 0 条",

            "sInfoFiltered": "(filtered from MAX total entries)",
            "sInfoPostFix": "",
            "sInfoThousands": ",",
            "sLengthMenu": "每页显示5条",
            "sLoadingRecords": "Loading...",
            "sProcessing": "Processing...",
            "sSearch": "查找:",
            "sZeroRecords": "No matching records found",
            "oPaginate": {
                "sFirst": "首页",
                "sLast": "最后一页",
                "sNext": "下一页",
                "sPrevious": "上一页"
            },
            "oAria": {
                "sSortAscending": ": activate to sort column ascending",
                "sSortDescending": ": activate to sort column descending"
            }
        })

    /**
     * persons - Data used in Tables view for Data Tables plugin
     */


}
/*
 doctorHome
 */
function doctorHome($scope, $modal, $rootScope, $http, SweetAlert, loginServer, toaster, parseData) {
    var userid = window.localStorage.getItem("userid");
    initGroup();
    function initGroup() {
        $http.get($rootScope.servers + '/service/inst/mydoctorgrouplist?instid=' + userid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.gname = message[0].gname;
                        $scope.items = message;
                        var data = {};
                        data.instid = parseInt(userid);
                        data.groupid = message[0].groupid;

                        $http.post($rootScope.servers + "/service/inst/mydoctorlist?curpage=1"
                                + "&pagesize=1000", data, {
                                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                                transformRequest: transform
                            })
                            .success(function (data) {
                                var result = data.result;
                                if (result == 0) {
                                    var message = parseData(data.message);
                                    if (message) {
                                        $scope.doctors = message;
                                    }
                                }
                            })
                    }
                } else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        body: '获取分组信息失败',
                        showCloseButton: true,
                        timeout: 2200
                    });
                } else {

                }
            })
    }

    $scope.newGroup = function () {
        var modalInstance1 = $modal.open({
            templateUrl: 'app/main/friend/divideGroup.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    }
    $scope.openSeniorSearch = function () {
        var modalInstance1 = $modal.open({
            templateUrl: 'app/main/Viewer/seniorSearch.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
        $scope.gname = "所有分组";

    }
    $scope.openEditorGroup = function (groupid) {
        var modalInstance1 = $modal.open({
            templateUrl: 'app/main/friend/editorGroup.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
        loginServer.groupid = groupid;
    }
    $scope.deleteGroup = function (groupid) {

        SweetAlert.swal({
                title: "温馨提示",
                text: "好友分组删除后不可恢复",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        groupid: groupid,
                        instid: userid
                    }
                    $http.post($rootScope.servers + "/service/inst/deletedoctorgroup", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                initGroup();
                                SweetAlert.swal("已删除", "好友分组已删除", "success");
                            } else if (result == -1) {
                                SweetAlert.swal("删除失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        })

                } else {
                    SweetAlert.swal("取消删除", "", "error");
                }
            });
    }
    $scope.removeDoctor = function (userid, groupid, gname, username) {
        SweetAlert.swal({
                title: "温馨提示",
                text: "确定要删除医生朋友(" + username + ")吗？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        groupid: groupid,
                        doctorid: userid
                    }
                    $http.post($rootScope.servers + "/service/inst/unbinddoctor", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                initGroup();
                                SweetAlert.swal("已删除", "医生朋友已删除", "success");
                            } else if (result == -1) {
                                SweetAlert.swal("删除失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        }).error(function (data) {
                        SweetAlert.swal("服务器异常", "", "error");
                    })

                } else {
                    SweetAlert.swal("取消删除", "", "error");
                }
            });
    }
    $scope.searchForInput = function () {
        var data = {
            term: $scope.doctorName1,
            instid: userid,
        };
        $http.post($rootScope.servers + "/service/inst/mydoctorlist?curpage=1"
                + "&pagesize=1000", data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                $scope.gname = "所有分组";
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.doctors = message;
                    }
                }
            })
    }
    //page init
    var transform = function (data) {
        return $.param(data);
    }

    $scope.doctorList = function (groupid, gname) {
        var data = {
            instid: userid,
            groupid: groupid
        }
        $http.post($rootScope.servers + "/service/inst/mydoctorlist?curpage=1"
                + "&pagesize=1000", data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.doctors = message;
                        $scope.gname = gname;
                    }
                }
            })
    }

}
//doctor friend list
function doctorFriend($scope, $rootScope, $http, $modal,parseData) {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");

    var transform = function (data) {
        return $.param(data);
    }
    var datali = {
        instid: userid,
        curpage: 1,
        pagesize: 1000
    }
    $scope.searchDoctor = function () {
        datali.truename = $scope.docterFriend;
        doctorlist();
    }

    doctorlist();
    function doctorlist() {
        $http.post($rootScope.servers + '/service/user/doctorlist', datali, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            }
            )
            .success(function (data) {
                if (data.result == 0) {
                    var message = parseData(data.message);
                    $scope.doctors = message;
                    setTimeout(function () {
                        $('#tblOrders').trigger('footable_redraw');
                    }, 200);
                }
            })
        // $http.post($rootScope.servers + "/service/user/getDoctorByLevel", data, {
        //         headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        //         transformRequest: transform
        //     })
        //     .success(function (data) {
        //         if (data.result == 0) {
        //             var message = parseMessageData(data.message);
        //             if (message) {
        //                 $scope.doctors = message;
        //                 console.log(message);
        //                 setTimeout(function () {
        //                     $('#tblOrders').trigger('footable_redraw');
        //                 }, 500);
        //             }
        //         }
        //     })
        $scope.addDoctor = function (userid) {
            window.localStorage.setItem('doctorid', userid);
            var modalInstance1 = $modal.open({
                templateUrl: 'app/main/doctor/chooseGroup.html',
                controller: ModalInstanceCtrl,
                windowClass: "animated fadeIn"
            });
        }
    }

}
//add doctor group
function newGroup($scope, $rootScope, $http, toaster, loginServer) {
    var userid = window.localStorage.getItem("userid");
    var usertype = window.localStorage.getItem("usertype");
    if (usertype == 1 || loginServer.type == 2) {
        var gurl = "/service/friend/newfriendgroup";
        var data = {
            userid: parseInt(userid)
        }
    } else if (usertype == 3 || loginServer.type == 1) {
        var gurl = "/service/inst/newdoctorgroup"
        var data = {
            instid: parseInt(userid)
        }
    }

    $scope.addGroups = function () {
        data.gname = $scope.newgroups;
        if (!$.trim(data.gname)) {
            toaster.pop({
                type: 'error',
                title: '分组名称不能为空',
                showCloseButton: true,
                timeout: 1200
            });
            return;
        }
        var transform = function (data) {
            return $.param(data);
        }
        $http.post($rootScope.servers + gurl, data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    toaster.pop({
                        type: 'success',
                        title: '添加分组成功',
                        showCloseButton: true,
                        timeout: 1200
                    });
                    window.location.reload();
                    // if(loginServer.type==2){
                    //     loginServer.friendFlag=true;
                    // }
                } else if (result == 1) {
                    toaster.pop({
                        type: 'error',
                        title: '分组已经存在',
                        showCloseButton: true,
                        timeout: 1200
                    });
                } else {
                    toaster.pop({
                        type: 'error',
                        title: '添加分组失败',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
            })
    }
}
//add case group
function newGroup1(toaster, $http, $scope, $rootScope) {
    var userid = window.localStorage.getItem("userid");
    $scope.addGroups = function () {
        var data = {
            gname: $scope.newgroups,
            doctorid: userid
        }
        $http.post($rootScope.servers + "/service/card/newcardgroup", data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    toaster.pop({
                        type: 'success',
                        title: '添加分组成功',
                        showCloseButton: true,
                        timeout: 1200
                    });
                    window.location.reload();
                } else if (result == 1) {
                    toaster.pop({
                        type: 'error',
                        title: '分组已经存在',
                        showCloseButton: true,
                        timeout: 1200
                    });
                } else {
                    toaster.pop({
                        type: 'error',
                        title: '添加分组失败',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
            })
            .error(function () {
                toaster.pop({
                    type: 'error',
                    title: '添加分组失败',
                    showCloseButton: true,
                    timeout: 1200
                });
            })
    }
}
//editor group
function editorGroup($scope, $http, loginServer, $rootScope, toaster) {
    var userid = window.localStorage.getItem("userid");
    var usertype = window.localStorage.getItem("usertype");
    if (usertype == 1 || loginServer.type == 2) {
        var data = {
            userid: userid,
            groupid: loginServer.groupid
        }
        var gurl = "/service/friend/updatefriendgroup";
    } else if (usertype == 3 || loginServer.type == 1) {
        var data = {
            instid: userid,
            groupid: loginServer.groupid
        }
        var gurl = "/service/inst/updatedoctorgroup"
    }
    $scope.editorGroups = function () {
        data.gname = $scope.newgname;
        $http.post($rootScope.servers + gurl, data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    window.location.reload();
                    toaster.pop({
                        type: 'success',
                        title: '编辑成功',
                        showCloseButton: true,
                        timeout: 1200
                    });
                } else if (result == 1) {
                    toaster.pop({
                        type: 'error',
                        title: '分组名已存在',
                        showCloseButton: true,
                        timeout: 1200
                    });
                } else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        title: '编辑分组失败',
                        showCloseButton: true,
                        timeout: 1200
                    });
                } else {
                    toaster.pop({
                        type: 'error',
                        title: '编辑分组失败',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
            })
    }

}
//senior search
function seniorSearch($scope, $http, $rootScope, loginServer) {
    var userid = window.localStorage.getItem("userid");
    var transform = function (data) {
        return $.param(data);
    }

    function parseMessageData(data) {
        try {
            var message = JSON.parse(data);
            return message;
        } catch (e) {
            return false;
        }
    }

    $scope.seniorSearch1 = function () {

        $http.get($rootScope.servers + '/service/inst/mydoctorgrouplist?instid=' + userid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseMessageData(data.message);
                    if (message) {
                        $scope.gname = message[0].gname;
                        $scope.items = message;
                        var data = {};
                        data.instid = parseInt(userid);
                        data.groupid = message[0].groupid;
                        // if($scope.doctorName){
                        //   data.term=$scope.doctorName;
                        // }
                        var data = {
                            instid: userid,
                            term: $scope.friendName,
                            gender: $scope.doctorSex
                        }
                        $http.post($rootScope.servers + "/service/inst/mydoctorlist?curpage=1"
                                + "&pagesize=1000", data, {
                                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                                transformRequest: transform
                            })
                            .success(function (data) {
                                var result = data.result;
                                if (result == 0) {
                                    var message = parseMessageData(data.message);
                                    if (message) {
                                        loginServer.search = message;
                                    }
                                }
                            })
                    }
                } else if (result == -1) {

                } else {

                }
            })

    }
}
//expert ask
function expertAsk($scope, $http, $rootScope, parseData, handleTime) {
    var userid = window.localStorage.getItem("userid");
    var type = 0;
    var transform = function (data) {
        return $.param(data);
    }
    searchInit();
    function searchInit() {
        $scope.inputName = '患者姓名';
        $scope.inputPlace = '请输入查询姓名';
        $scope.starttime = '上传起始日期';
        $scope.starttime2 = '会诊发起日期';
    }

    $scope.searchForInput = function () {
        var flag1 = false;
        var flag2 = false;
        if (($scope.searchTerm == undefined || $scope.searchTerm == '')) {
            flag1 = true;
        }
        if ($scope.visible1 == true && $scope.visible2 == true) {
            flag2 = true;
        }
        if (flag1 && flag2 == true) {
            $scope.persons = $scope.persons1;
            return;
        } else {
            $scope.searchStartTime = $scope.visible1 == false ? handleTime($("#studystartdate").val()) : -1;
            $scope.searchStartTime2 = $scope.visible2 == false ? handleTime($("#studystartdate2").val()) : -1;
            $scope.persons = [];
            angular.forEach($scope.persons1, function (data, index, array) {
                var namecheck = false;
                var timecheck1 = false;
                var timecheck2 = false;
                var patientname = data.patientname.toLowerCase();
                if (patientname.indexOf($scope.handleTerm) != -1 || $scope.handleTerm == undefined) {
                    namecheck = true;
                }
                if ($scope.searchStartTime <= handleTime(data.uploadtime)) {
                    timecheck1 = true;
                }
                if ($scope.searchStartTime2 <= handleTime(data.addtime)) {
                    timecheck2 = true;
                }
                if (namecheck && timecheck1 && timecheck2) {
                    $scope.persons.push(data);
                }
            })
            setTimeout(function () {
                $('#tblOrders').trigger('footable_redraw');
            }, 100);
            if ($scope.persons.length == 0) {
                $("#page1").hide();
                setTimeout(function () {
                    $('#tblOrders').trigger('footable_redraw');
                }, 100);
            }
        }
    }
    var data = {
        userid: userid,
        asktype: 0,
        pagesize: 1000,
        curpage: 1,
        status: type
    }
    $http.post($rootScope.servers + "/service/ask/completeaskcount", data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                if (message) {
                    $scope.count = message.askCount;
                    $scope.complete = message.completedAskCount;
                    $scope.unfinish = message.unfinishedAskCount;
                }
            }
        })
    initList();
    function initList() {
        $http.post($rootScope.servers + "/service/ask/list", data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = data.message;
                    if (message) {
                        $scope.persons1 = parseData(message);
                        $scope.persons = $scope.persons1;
                        setTimeout(function () {
                            $('#tblOrders').trigger('footable_redraw');
                        }, 100);
                    }
                }
            })
    }
    $scope.consultCplt = function (status, imageid, askid,cardid,targetuser) {
        var targetuser = window.localStorage.getItem('targetUser');
        if(status==4){
            window.localStorage.setItem("askid",askid);
            openReportForm($rootScope.servers);
        }else{
            detailConsultImp(askid,cardid,targetuser,imageid,status);
        }
    }
    //
    $scope.clearMessage = function () {
        window.localStorage.removeItem('askMessages');
    }
    $scope.countConsult = function () {
        angular.element("#count").addClass('border-bottom-green');
        angular.element("#complete").removeClass('border-bottom-green');
        angular.element("#unfinish").removeClass('border-bottom-green');
        $scope.persons = [];
        $scope.persons = $scope.persons1;
        setTimeout(function () {
            $('#tblOrders').trigger('footable_redraw');
        }, 100);
    }
    $scope.completeConsult = function () {
        angular.element("#count").removeClass('border-bottom-green');
        angular.element("#complete").addClass('border-bottom-green');
        angular.element("#unfinish").removeClass('border-bottom-green');

        function statusComplete(person) {
            return !(parseInt(person.status) != 4);
        }

        $scope.persons = [];
        $scope.persons = $scope.persons1.filter(statusComplete);
        setTimeout(function () {
            $('#tblOrders').trigger('footable_redraw');
        }, 100);
    }
    $scope.unfinishConsult = function () {
        angular.element("#count").removeClass('border-bottom-green');
        angular.element("#complete").removeClass('border-bottom-green');
        angular.element("#unfinish").addClass('border-bottom-green');

        function statusComplete1(person1) {
            return parseInt(person1.status) != 4;
        }

        $scope.persons = [];
        $scope.persons = $scope.persons1.filter(statusComplete1);
        setTimeout(function () {
            $('#tblOrders').trigger('footable_redraw');
        }, 100);
    }
    //detail message
    $scope.detailConsult = function (askid, cardid, targetuser, imageid, status) {
        detailConsultImp(askid, cardid, targetuser, imageid, status);
    }
    function detailConsultImp(askid, cardid, targetuser, imageid, status){
        window.localStorage.setItem('askid', askid);
        window.localStorage.setItem('cardid', cardid);
        window.localStorage.setItem('targetUser', targetuser);
        if (status != 4) {
            window.location.href = "/#/expertConsult/detailMessage";
        } else {

        }
    }
}
//start normal ask
function startNormalAsk($scope, $rootScope, $http, parseData, toaster, loginServer, _undefined, myToaster) {
    var userid = window.localStorage.getItem('userid');
    var imageid = loginServer.normalAskMessageImageid;
    var transform = function (data) {
        return $.param(data);
    }
    $scope.asktype = 3;
    $scope.visible = true;
    $http.get($rootScope.servers + '/service/image/' + imageid)
        .success(function (data) {
            if (data.result == 0) {
                var message = parseData(data.message);
                init(message);
            }
        })
    var datali = {
        instid: userid,
        curpage: 1,
        pagesize: 1000
    }
    $http.post($rootScope.servers + '/service/user/doctorlist', datali, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
        .success(function (data) {
            if (data.result == 0) {
                $scope.doctorstr = [];
                var message = parseData(data.message);
                $scope.doctors1 = message;
                $scope.doctors = $scope.doctors1;
            }
        })
    $scope.checkSelect = function (imageid, $event) {
        var index = $scope.doctorstr.indexOf($event.target.defaultValue);
        if ($event.target.checked == true) {
            if (index < 0) {
                $scope.doctorstr.push($event.target.defaultValue);
            }
        }
        else {
            if (index >= 0) {
                $scope.doctorstr.splice(index, 1);
            }
        }
    }
    function getAge(birth) {
        if (birth == '') {
            return birth;
        }
        var age;
        var aDate = new Date();
        var thisYear = aDate.getFullYear();
        var thisMonth = aDate.getMonth() + 1;
        var thisDay = aDate.getDate();

        var birthy = birth.substr(0, 4);
        var birthm = birth.substr(4, 2);
        var birthd = birth.substr(6, 2);

        if (thisMonth - birthm < 0) {
            age = thisYear - birthy - 1;
        } else {
            if (thisDay - birthd >= 0) {
                age = thisYear - birthy;
            } else {
                age = thisYear - birthy - 1;
            }
        }

        if (isNaN(age)) {
            return '';
        }
        return age + '岁';
    }

    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate + " "
            + date.getHours() + seperator2 + date.getMinutes() + seperator2
            + date.getSeconds();
        return currentdate;
    }

    function getNowIntDate() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        var millisecond = date.getMilliseconds();
        var hours = date.getHours();
        var min = date.getMinutes();
        var second = date.getSeconds();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }

        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }

        if (hours >= 0 && hours <= 9) {
            hours = "0" + hours;
        }

        if (min >= 0 && min <= 9) {
            min = "0" + min;
        }
        if (second >= 0 && second <= 9) {
            second = "0" + second;
        }
        if (millisecond >= 0 && millisecond <= 9) {
            millisecond = "00" + millisecond;
        }
        if (millisecond >= 10 && millisecond <= 99) {
            millisecond = "0" + millisecond;
        }

        var currentdate = "" + year + month + strDate + hours + min + second + millisecond;
        return currentdate;
    }

    function init(message) {
        //ask number
        $("#askTimeInput").val(moment().add('days', 2).format('YYYY-MM-DD HH:mm'));
        var gender = '';
        var data = {};
        data.date = getNowIntDate();
        $.ajax({
            url: $rootScope.servers + "/service/ask/asknumber",
            type: 'get',
            data: data,
            dataType: 'json',
            async: false,
            success: function (data) {
                var result = data.result;
                if (result == 0) {
                    var asknumber = data.message;
                    $scope.asknumber = asknumber;

                } else if (result == 1) {
                    toaster.pop({
                        type: 'warning',
                        title: '获取编号失败',
                        showCloseButton: true,
                        timeout: 2200
                    });
                } else {
                    toaster.pop({
                        type: 'warning',
                        title: '未知错误',
                        showCloseButton: true,
                        timeout: 2200
                    });
                }
            },
            error: function (data) {
                toaster.pop({
                    type: 'danger',
                    title: '服务器异常',
                    showCloseButton: true,
                    timeout: 2200
                });
            }
        });
        if (message != null) {
            if (message.sex == 0) {
                gender = '男';
            } else {
                gender = '女'
            }
            $scope.title = getNowFormatDate() + ' ' + message.patientname
                + ' ' + gender + ' ' + getAge(message.birthday);
        }
    }

    $scope.updateasktype = function (type) {
        if (type == 3) {
            $scope.visible = true;
        } else {
            $scope.visible = false;
        }
        if (type == 2) {
            $http.get($rootScope.servers + '/service/inst/mydoctorgrouplist?instid=' + userid)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        var message = parseData(data.message);
                        $scope.doctorNum = [];
                        if (_undefined(message)) {
                            myToaster('warning', '选择邀请列表失败', '我的医生中没有医生分组');
                            // $("#asktype1").checked=true;
                            $scope.asktype = 3;
                        } else {
                            var dataFriend = {};
                            dataFriend.instid = userid;
                            $.each(message, function (i, val) {
                                dataFriend.groupid = val.groupid;
                                $.ajax({
                                        url: $rootScope.servers + '/service/inst/mydoctorlist?curpage=1&pagesize=1000',
                                        data: dataFriend,
                                        type: 'post',
                                        dataType: 'json',
                                        async: false
                                    })
                                    .success(function (data) {
                                        var result = data.result;
                                        if (result == 0) {
                                            var message = parseData(data.message);
                                            $scope.doctorNum.push(message);
                                        }
                                    })
                                if (!_undefined($scope.doctorNum)) {
                                    return false;
                                }
                            })
                            if (_undefined($scope.doctorNum)) {
                                myToaster('warning', '发起咨询失败', '我的医生中没有医生好友');
                                $scope.asktype = 3;
                            }
                        }
                    }
                })
        }
    }
    $scope.addAsk = function () {
        var imagestr = '';
        var data = {};
        data.imagestr = imageid + ';';
        var asktype = $('input[name="asktype"]:checked').val();
        var hasupload = '1';
        var endtime = $("#askTimeInput").val();
        if (asktype == 3) {
            var targetuserstr = '';

            angular.forEach($scope.doctorstr, function (data) {
                targetuserstr += data + ';';
            })
            data.targetuserstr = targetuserstr;
            if (targetuserstr == '') {
                toaster.pop({
                    type: 'warning',
                    title: '请选择医生',
                    showCloseButton: true,
                    timeout: 2200
                });
                return;
            }
        }
        if ($scope.title == '' || $scope.title == undefined) {
            toaster.pop({
                type: 'error',
                body: '请输入标题',
                showCloseButton: true,
                timeout: 2200
            });
            return;
        } else if (endtime == '') {
            toaster.pop({
                type: 'error',
                body: '请选择时间',
                showCloseButton: true,
                timeout: 2200
            });
            return;
        } else if ($("#normalHistory").val() == '' || $("#normalHistory").val() == undefined) {
            toaster.pop({
                type: 'error',
                body: '请填写基本病史',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else {
            data.title = $scope.title;
            data.endtime = endtime;
            data.adduser = userid;
            data.hasupload = hasupload;
            data.asktype = asktype;
            data.status = 1;
            data.asknumber = $scope.asknumber;
            data.memo = $.trim($("#normalHistory").val());
            $http.post($rootScope.servers + '/service/ask/new', data)
                .success(function (data) {
                    if (data.result == 0) {
                        toaster.pop({
                            type: 'success',
                            body: '咨询成功',
                            showCloseButton: true,
                            timeout: 2200
                        });
                        $scope.ok();
                        window.location.reload();
                    } else if (data.result == -1) {
                        toaster.pop({
                            type: 'danger',
                            body: '咨询失败',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    } else {
                        toaster.pop({
                            type: 'danger',
                            body: '咨询失败',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    }
                })
                .error(function () {
                    toaster.pop({
                        type: 'danger',
                        body: '服务器异常',
                        showCloseButton: true,
                        timeout: 2200
                    });
                })
        }

    }
    $scope.askSearch = function () {
        $scope.nameValue = $("#ask-term").val();
        $scope.nameValue1 = $scope.nameValue.toLowerCase();
        $scope.nameValue1 = $scope.nameValue1.replace(/\s+/g, '');
        $scope.doctors = [];
        angular.forEach($scope.doctors1, function (data) {
            var name = data.truename.toLowerCase();
            if ($scope.nameValue == '' || name.indexOf($scope.nameValue1) != -1) {
                $scope.doctors.push(data);
            }
        })
    }

}
//detail msg
function detailMessage($scope, $rootScope, $http, parseData, toaster) {
    var askid = window.localStorage.getItem('askid');
    var cardid = window.localStorage.getItem('cardid');
    var userid = window.localStorage.getItem('userid');

    var transform = function (data) {
        return $.param(data);
    }
    initConsult();
    function initConsult() {
        $http.get($rootScope.servers + '/service/ask/' + askid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.consult = message;
                    }
                }
            })
    }


    $http.get($rootScope.servers + '/service/ask/imagelist?askid=' + askid + '&curpage=1&pagesize=1000')
        .success(function (data) {

            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
            }
            if (message) {
                $scope.consult1 = message[0];
            }
        })
    $http.get($rootScope.servers + '/service/card/getCardAttachmentInfo?cardid=' + cardid)
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                if (message) {
                    if (message[0].attachment) {
                        $scope.attach = message[0].attachment;
                    }
                    $scope.files = $scope.attach.split(';');
                    $scope.downloadCardAttachment = function () {
                        if ($scope.files.length > 0) {
                            for (var i = 0; i < $scope.files.length; i++) {
                                window.open($rootScope.imageUrl + 'attach/' + cardid + '/' + $scope.files[i])
                            }
                        }
                    }
                }
            } else if (result == -1) {
                toaster.pop({
                    type: 'error',
                    title: '获取病例附件失败',
                    showCloseButton: true,
                    timeout: 1200
                });
            } else {
                toaster.pop({
                    type: 'error',
                    title: '获取病例附件失败',
                    showCloseButton: true,
                    timeout: 1200
                });
            }
        })
    $scope.consultCplt = function (status, imageid, askid, image2askid) {
        initConsult();
        var targetuser = window.localStorage.getItem('targetUser');
        switch ($scope.consult.status) {
            case 4:
            {
                //window.location.href = "/#/doctorMain/chooseReport";
                window.localStorage.setItem("askid",askid);
                openReportForm($rootScope.servers);
                break;
            }
            case 0:
            case 1:
            {
                swal({
                        title: "确定要取消咨询吗",
                        text: "如果取消钱就打水漂了~",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "确定取消",
                        cancelButtonText: "不，我再想想",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var data2 = {
                                status: 6,
                                askid: askid,
                                asktype: 0,
                                doctorid: targetuser
                            }

                            $http.post($rootScope.servers + "/service/ask/change", data2)
                                .success(function (data) {
                                    var result = data.result;
                                    if (result == 0) {
                                        swal("已取消", "取消咨询成功", "success");
                                        window.location.href = "/#/expertConsult"
                                    } else if (result == -1) {
                                        swal("取消失败失败", "", "error");
                                    } else {
                                        swal("未知错误", "", "error");
                                    }
                                })

                        } else {
                            swal("取消", "", "error");
                        }
                    });
                break;
            }
            case 2:
            {
                swal({
                    title: "取消失败",
                    text: "您所取消的咨询已经开始阅片",
                    type: "warning",
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "ok",
                    cancelButtonText: "不，我再想想",
                    closeOnConfirm: false,
                    closeOnCancel: false
                })
                break;
            }
        }
    }

    //viewer
    $scope.viewer = function (imageid, patientid, studyid) {
        $http.get($rootScope.servers + "/service/user/" + userid + "/privacy")
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    $scope.set = message[0];
                    $scope.isDicomOrJpg = message[0].isDicomOrJpg;
                    var url = '';
                    //当用户设置里面为dicom时，访问dicom类型，否则为jpg类型
                    if ($scope.isDicomOrJpg != null && $scope.isDicomOrJpg == 1) {
                        url = '?imageid=' + imageid + '&patientID='
                            + patientid + '&' + 'studyUID=' + studyid
                            + '&reportFlag=0' + '&type=dicom';
                    } else {
                        url = '?imageid=' + imageid + '&patientID='
                            + patientid + '&' + 'studyUID=' + studyid
                            + '&reportFlag=0' + '&type=jpg'
                    }
                   // window.location.href = '#/viewer' + url
                   window.location.href='/app/imageview/viewer.html'+url; 
                }
            })
    }
}
//share list
function myShare($scope, $http, $rootScope, toaster, $modal, loginServer, handleTime) {

    var userid = window.localStorage.getItem("userid");
    var transform = function (data) {
        return $.param(data);
    }


    function parseMessageData(data) {
        try {
            var message = JSON.parse(data);
            return message;
        } catch (e) {
            return false;
        }
    }


    searchInit();
    function searchInit() {
        $scope.inputName = '分享标题';
        $scope.inputPlace = '请输入分享标题';
        $scope.starttime = '分享开始时间';
        $scope.endtime = '分享截止时间';
    }

    initShareList();
    function initShareList() {
        var data = {
            userid: userid,
            pagesize: 1000,
            curpage: 1,
        }
        $http.post($rootScope.servers + "/service/share2image/list", data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseMessageData(data.message);

                    $scope.shares1 = message;
                    $scope.shares = $scope.shares1;
                } else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        title: '获取列表失败',
                        showCloseButton: true,
                        timeout: 2200
                    });
                } else {
                    toaster.pop({
                        type: 'error',
                        title: '未知错误',
                        showCloseButton: true,
                        timeout: 2200
                    });
                }
            })
            .error(function () {
                toaster.pop({
                    type: 'error',
                    title: '服务器异常',
                    showCloseButton: true,
                    timeout: 2200
                });
            })
    }


    $scope.searchForInput = function () {
        var flag1 = false;
        var flag2 = false;
        if (($scope.searchTerm == undefined || $scope.searchTerm == '')) {
            flag1 = true;
        }
        if ($scope.visible1 == true && $scope.visible2 == true ) {
            flag2 = true;
        }
        if (flag1 && flag2 == true) {
            $scope.shares = $scope.shares1;
            return;
        } else {
            $scope.searchStartTime = $scope.visible1 == false ? handleTime($("#studystartdate").val()) : -1;
            $scope.searchEndTime = $scope.visible2 == false ? handleTime($("#studyenddate").val()) : 99999999;;
            $scope.shares = [];
            angular.forEach($scope.shares1, function (data, index, array) {
                var namecheck = false;
                var timecheck = false;
                var sharename = data.sharename.toLowerCase();
                if (sharename.indexOf($scope.handleTerm) != -1 || $scope.handleTerm == undefined) {
                    namecheck = true;
                }
                if ($scope.searchStartTime <= handleTime(data.sharetime) && $scope.searchEndTime >= handleTime(data.sharetime)) {
                    timecheck = true;
                }
                if (namecheck && timecheck) {
                    $scope.shares.push(data);
                }
            })
            setTimeout(function () {
                $('#tblOrders').trigger('footable_redraw');
            }, 100);
            if ($scope.shares1.length == 0) {
                $("#page1").hide();
                setTimeout(function () {
                    $('#tblOrders').trigger('footable_redraw');
                }, 100);
            }
        }
    }

    $scope.keyUpSearch=function (e) {
        var keycode = window.event?e.keyCode:e.which;
        if(keycode==13){
           $scope.searchShareList();
        }
    }
    //open detailed
    $scope.openDetailed = function (sharename, imageid, qrfile, url, patientname, endtime, shareid, privacy, checkcode, anonymous, caseid, share, thumb) {
        loginServer.shareObj = share;
        $http.get($rootScope.servers + "/service/image/" + imageid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseMessageData(data.message);
                    loginServer.shares = {
                        shareid: shareid,
                        sharesname: sharename,
                        url: url,
                        qrfile: qrfile,
                        patientname: message.patientname,
                        studydate: message.studydate,
                        endtime: endtime,
                        imageid: message.imageid,
                        institutionname: message.institutionname,
                        uploaduser: message.uploaduser,
                        privacy: privacy,
                        checkcode: checkcode,
                        anonymous: anonymous,
                        caseid: caseid,
                        thumb: thumb
                    }
                    var modalInstance1 = $modal.open({
                        templateUrl: 'app/main/myshare/shareDetailed.html',
                        controller: ModalInstanceCtrl,
                        windowClass: "animated fadeIn"
                    });
                }
            })
    }
    $scope.verifyShare = function (shareid) {
       // window.location.href = '/#/imageshare?shareid=' + shareid;
        $http.get($rootScope.servers + "/service/share2image/" + shareid + "?shareid=" + shareid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = eval('('+data.message+')') ;
                    $scope.checkcode = message.checkcode
                    $scope.endtime = message.endtime
                    if($scope.checkcode == '' || $scope.checkcode == undefined){
                        window.location.href = '/#/imageshare?shareid=' + shareid;
                    }
                    else{
                        var data = {
                            isShareOrImage:'shareid',
                            'id':shareid
                        };
                        window.localStorage.setItem('ShareOrImage',JSON.stringify(data));
                        $('#flagshare').css('display', 'none');
                        var modalInstance1 = $modal.open({
                            templateUrl: 'app/main/myshare/shareImagelist.html',
                            controller: ModalInstanceCtrl,
                            windowClass: "animated fadeIn"
                        });
                    }
                }
            })

    }
}
//share image
function shareImage(loginServer, $http, $rootScope, $scope, parseData, transform) {
    $scope.share = loginServer.share;
    if (!$scope.share) {
        var imageid = loginServer.shareImageid;
        var userid = window.localStorage.getItem('userid');
        var data = {
            imageid: imageid,
            userid: userid
        }
        $http.post($rootScope.servers + '/service/image/quickShare', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                if (data.result == 0) {
                    var message = parseData(data.message);
                    $scope.share = message;
                }
            })
    }
}
//share detail
function shareDetailed($scope, loginServer, $rootScope, $http, SweetAlert, parseData, toaster) {

    var userid = window.localStorage.getItem("userid");
    var transform = function (data) {
        return $.param(data);
    }

    init();
    function init() {
        $scope.shares = loginServer.shares;
        $scope.privacy = loginServer.shares.privacy;
        if ($scope.privacy == 0 || $scope.privacy == 3) {
            $scope.visible = true;
        } else {
            $scope.visible = false;
        }
        if ($scope.shares.caseid == '' || $scope.shares.caseid == undefined) {
            $scope.visible1 = true;
        } else {
            $scope.visible1 = false;
            $http.get($rootScope.servers + '/service/card/' + $scope.shares.caseid)
                .success(function (data) {
                    if (data.result == 0) {
                        var message = parseData(data.message);
                        $scope.case = message[0];
                    }
                })
        }
        $http.get($rootScope.servers + '/service/share2image/tracelist?curpage=1&pagesize=50&shareid=' + loginServer.shares.shareid)
            .success(function (data) {
                if (data.result == 0) {
                    var message = parseData(data.message);
                    if (message == '' || message == undefined) {
                        $scope.visible2 = true;
                    } else {
                        $scope.persons = message;
                    }
                }
            })
    }

    $scope.showShareObj = function (value) {
        if (value == 0 || value == 3) {
            $scope.visible = true;
        } else {
            $scope.visible = false;
            $scope.usertypestr = "";
            $scope.usertype = "";
            if (value == 1) {
                $scope.usertype = '2';
                sharetarget();
            } else if (value == 2) {
                $scope.usertypestr = "1,2,3"
                sharetarget();
            } else {
                return;
            }
        }
        function sharetarget() {
            var data = {
                userid: userid,
                usertype: $scope.usertype,
                usertypestr: $scope.usertypestr,
                curpage: 1,
                pagesize: 1000
            }

            $http.post($rootScope.servers + '/service/user/list', data, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    transformRequest: transform
                })
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        var message = parseData(data.message);
                        if (message) {
                            $scope.users = message;
                        }
                    }
                })
        }
    }
    $scope.delShare = function () {
        SweetAlert.swal({
                title: "温馨提示",
                text: "您确定要删除分享吗",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        shareid: loginServer.shares.shareid
                    }
                    $http.post($rootScope.servers + "/service/share2image/delete", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                SweetAlert.swal("已删除", "删除分享成功", "success");
                                $scope.ok();
                                window.location.href = "/#/myShare";
                            } else if (result == -1) {
                                SweetAlert.swal("删除失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        })

                } else {
                    SweetAlert.swal("取消删除", "", "error");
                }
            });
    }
    $scope.cancelShare = function (targetuser, id) {
        SweetAlert.swal({
                title: "温馨提示",
                text: "您确定要取消分享吗",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定取消",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        shareid: loginServer.shares.shareid,
                        targetuser: targetuser
                    }
                    $http.post($rootScope.servers + "/service/share2image/canceltrace", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                $http.get($rootScope.servers + '/service/share2image/tracelist?curpage=1&pagesize=50&shareid=' + loginServer.shares.shareid)
                                    .success(function (data) {
                                        if (data.result == 0) {
                                            var message = parseData(data.message);
                                            if (message == '' || message == undefined) {
                                                $scope.visible2 = true;
                                            } else {
                                                $scope.persons = message;
                                            }
                                        }
                                    })
                                SweetAlert.swal("已取消", "取消分享成功", "success");
                                $scope.ok();
                            } else if (result == -1) {
                                SweetAlert.swal("取消失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        })

                } else {
                    SweetAlert.swal("未取消", "", "error");
                }
            });
    }
    $scope.openNewShare = function () {
        var href = "#/myShare/shareadd?imageid=" + loginServer.shares.imageid;
        window.location.href = href;
        $scope.ok();
    }
    $scope.forwardShare = function () {
        var p = {
            url: $rootScope.servers + "/s/"
            + loginServer.shares.url,
            showcount: '1', /*是否显示分享总数,显示：'1'，不显示：'0' */
            desc: '', /*默认分享理由(可选)*/
            summary: '', /*分享摘要(可选)*/
            title: '影像分享', /*分享标题(可选)*/
            site: '', /*分享来源 如：腾讯网(可选)*/
            pics: '', /*分享图片的路径(可选)*/
            style: '203',
            width: 98,
            height: 22
        };
        var s = [];
        for (var i in p) {
            s.push(i + '=' + encodeURIComponent(p[i] || ''));
        }
        var qzoneShareUrl = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?"
            + s.join('&');
        window.location.href = qzoneShareUrl;
        $scope.ok();
    }
    $scope.isUpdateShareSet = function () {
        $("#sharelist-privacy").attr("disabled", false);
        $("#sharelist-checkcode").attr("disabled", false);
        $("#sharelist-anonymous").attr("disabled", false);
        $("#sharelist-endtime").attr("disabled", false);
    }
    $scope.updateShareSet = function () {
        $("#sharelist-privacy").attr("disabled", true);
        $("#sharelist-checkcode").attr("disabled", true);
        $("#sharelist-anonymous").attr("disabled", true);
        $("#sharelist-endtime").attr("disabled", true);
        if (($scope.privacy == 1 || $scope.privacy == 2)
            && ($scope.targetuser == undefined || $scope.targetuser == '')) {
            toaster.pop({
                type: 'warning',
                title: '分享对象不能为空',
                showCloseButton: true,
                timeout: 2200
            });
            return false;
        } else if ($scope.shares.checkcode == '' || $scope.shares.checkcode == undefined) {
            toaster.pop({
                type: 'warning',
                title: '验证码不能为空',
                showCloseButton: true,
                timeout: 2200
            });
            return false;
        } else {
            var data = loginServer.shareObj;
            data.privacy = $scope.privacy;
            data.checkcode = $scope.shares.checkcode;
            data.anonymous = $scope.shares.anonymous;
            data.endtime = $("#sharelist-endtime").val();
            var targetuser = '';
            if ($scope.targetuser != undefined && $scope.targetuser != "") {
                angular.forEach($scope.targetuser, function (data) {
                    targetuser += data.userid + ';';
                })
            }
            data.targetuser = targetuser;
            $http.post($rootScope.servers + "/service/share2image/update", data)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        $("#sharelist-privacy").attr("disabled", true);
                        $("#sharelist-checkcode").attr("disabled", true);
                        $("#sharelist-targetuser").attr("disabled", true);
                        $("#sharelist-anonymous").attr("disabled", true);
                        $("#sharelist-endtime").attr("disabled", true);
                        toaster.pop({
                            type: 'success',
                            title: '分享更改成功',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    }
                })
        }


    }
}
//add share
function shareAdd($scope, $rootScope, $http, parseData, toaster, loginServer, $modal, SweetAlert) {
    var userid = window.localStorage.getItem("userid");
    var curShareId = 0;

    var transform = function (data) {
        return $.param(data);
    }
    $scope.visible = true;
    $scope.showShareObj = function (value) {
        if (value == 0 || value == 3) {
            $scope.visible = true;
        } else {
            $scope.visible = false;
            $scope.usertypestr = "";
            $scope.usertype = "";
            if (value == 1) {
                $scope.usertype = '2';

                sharetarget();
            } else if (value == 2) {
                $scope.usertypestr = "1,2,3"

                sharetarget();
            } else {
                return;
            }
        }
        function sharetarget() {
            var data = {
                userid: userid,
                usertype: $scope.usertype,
                usertypestr: $scope.usertypestr,
                curpage: 1,
                pagesize: 1000
            }

            $http.post($rootScope.servers + '/service/user/list', data, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    transformRequest: transform
                })
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        var message = parseData(data.message);
                        if (message) {
                            $scope.users = message;
                            // console.log($scope.users instanceof Array);
                            setTimeout(function () {
                                $('#tblOrders').trigger('footable_redraw');
                            }, 500);
                        }

                    }
                })
        }
    }
    initList();
    function initList() {
        $scope.endtime = moment().add('days', 2).format('YYYY-MM-DD');
        var data = {
            userid: userid,
            pagesize: 1000,
            curpage: 1,
            term: $scope.username,
            havereport: -1,
            haveask: -1
        }
        $http.post($rootScope.servers + "/service/image/list", data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);

                    $scope.shares1 = message;
                    $scope.shares = [];

                    angular.forEach($scope.shares1, function (data, index) {
                        if (data.modality != "noImage") {
                            $scope.shares.push(data);
                            getCount(data.imageid);
                        }
                    })

                } else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        title: '获取列表失败',
                        showCloseButton: true,
                        timeout: 1200
                    });
                } else {
                    toaster.pop({
                        type: 'error',
                        title: '未知错误',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
            })
            .error(function () {
                toaster.pop({
                    type: 'error',
                    title: '服务器异常',
                    showCloseButton: true,
                    timeout: 1200
                });
            })
    }

    //get report num
    var Map = function () {
        this._entrys = new Array();
        this.put = function (key, value) {
            if (key == null || key == undefined) {
                return;
            }
            var index = this._getIndex(key);
            if (index == -1) {
                var entry = new Object();
                entry.key = key;
                entry.value = value;
                this._entrys[this._entrys.length] = entry;
            } else {
                this._entrys[index].value = value;
            }
        };
        this.get = function (key) {
            var index = this._getIndex(key);
            return (index != -1) ? this._entrys[index].value : null;
        };
        this._getIndex = function (key) {
            if (key == null || key == undefined) {
                return -1;
            }
            var _length = this._entrys.length;
            for (var i = 0; i < _length; i++) {
                var entry = this._entrys[i];
                if (entry == null || entry == undefined) {
                    continue;
                }
                if (entry.key === key) {//equal
                    return i;
                }
            }
            return -1;
        };
    }
    $scope.map = new Map();
    function getCount(imageid) {
        var reportData = {
            imageid: imageid
        }
        $http.post($rootScope.servers + '/service/imageReport/getReportCountByImageId', reportData, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                if (data.result == 0) {
                    $scope.map.put(imageid, data.message);
                }
            })
    }

    $scope.searchShareList = function () {
        $scope.searchShareList = function () {
            if ($scope.sharename2 != undefined) {
                $scope.sharename1 = $scope.sharename2.toLowerCase();
                $scope.sharename1 = $scope.sharename1.replace(/\s+/g, "");
            }
            $scope.shares = [];
            angular.forEach($scope.shares1, function (data, index, array) {
                var name = data.patientname.toLowerCase();
                if ($scope.sharename1 == undefined || name.indexOf($scope.sharename1) != -1 || $scope.sharename1 == name) {
                    $scope.shares.push(data);
                }
            })
        }
    }
    //case
    initCard();
    function initCard() {
        var data = {
            userid: userid,
            term: $scope.term,
            curpage: 1,
            pagesize: 1000
        }
        $http.post($rootScope.servers + '/service/card/mycardlist', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.persons = message;
                    }
                }
            })
    }

    //search case
    $scope.searchCard = function () {
        initCard();
    }
    //begin share
    $scope.beginShare = function () {
//judge wether empty
        var targetuser = '';
        if ($scope.imageid == undefined || $scope.imageid <= 0) {
            toaster.pop({
                type: 'warning',
                title: '请选择影像图片',
                showCloseButton: true,
                timeout: 2200
            });
            return false;
        } else if ($scope.sharename == '' || $scope.sharename == undefined) {
            toaster.pop({
                type: 'warning',
                title: '分享名称不能为空',
                showCloseButton: true,
                timeout: 2200
            });
            return false;
        } else if (($scope.privacy == 1 || $scope.privacy == 2)
            && ($scope.targetuser == undefined || $scope.targetuser == '')) {
            toaster.pop({
                type: 'warning',
                title: '分享对象不能为空',
                showCloseButton: true,
                timeout: 2200
            });
            return false;
        } else if ($scope.checkcode == '' || $scope.checkcode == undefined) {
            toaster.pop({
                type: 'warning',
                title: '验证码不能为空',
                showCloseButton: true,
                timeout: 2200
            });
            return false;
        }
        else if ($("#endtime") == '' || $("#endtime") == undefined) {
            toaster.pop({
                type: 'warning',
                title: '截止日期不能为空',
                showCloseButton: true,
                timeout: 2200
            });
            return false;
        }
        else if ($scope.targetuser != '' && $scope.targetuser != undefined) {
            angular.forEach($scope.targetuser, function (data) {
                targetuser += data.userid + ';';
            })
        }

        //share
        var data = {
            shareid: curShareId,
            shareuser: userid,
            imageid: $scope.imageid,
            caseid: $scope.cardid,
            sharename: $scope.sharename,
            privacy: $scope.privacy,
            anonymous: $scope.anonymous,
            checkcode: $scope.checkcode,
            endtime: $("#endtime").val(),
            targetuser: targetuser
        }

        $http.post($rootScope.servers + '/service/share2image/new', data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    toaster.pop({
                        type: 'success',
                        title: '分享成功',
                        showCloseButton: true,
                        timeout: 2200
                    });
                    var message = parseData(data.message);
                    var share = {
                        url: message.url,
                        qrfile: message.qrfile
                    }
                    loginServer.share = share;
                    var modalInstance1 = $modal.open({
                        backdrop: false,
                        templateUrl: 'app/main/myshare/shareImage.html',
                        controller: ModalInstanceCtrl,
                        windowClass: "animated fadeIn"
                    });

                } else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        title: '分享失败',
                        showCloseButton: true,
                        timeout: 2200
                    });
                }
            })
    }
    $scope.isSelect = function (imageid) {
        $scope.imageid = imageid;
    }
    $scope.isSelect1 = function (carid) {
        $scope.cardid = carid;
    }
    $scope.cancelShare = function () {
        SweetAlert.swal({
                title: "温馨提示",
                text: "您确定要取消分享吗",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定取消",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    window.location.href = "/#/myShare";
                }
            });
    }
}
//normal ask
function normalAsk($scope, $http, $rootScope, parseData, nowTime, handleTime) {
    var userid = window.localStorage.getItem("userid");
    var data = {
        userid: userid,
        asktype: 1,
        pagesize: 1000,
        curpage: 1
    }
    $scope.overTimeNum = 0;
    $scope.finishNum=0;
    $scope.unfinishNum=0;
    $scope.mFilter_overTime = function (e) {
        return moment(e.endtime).fromNow()[0] == 'i';
    }
    var transform = function (data) {
        return $.param(data);
    }
    searchInit();
    function searchInit() {
        $scope.inputName = '患者姓名';
        $scope.inputPlace = '请输入查询姓名';
        $scope.starttime = '上传起始日期';
        $scope.starttime2 = '会诊发起日期';
    }

    $scope.searchForInput = function () {
        var flag1 = false;
        var flag2 = false;
        if (($scope.searchTerm == undefined || $scope.searchTerm == '')) {
            flag1 = true;
        }
        if ($scope.visible1 == true && $scope.visible2 == true) {
            flag2 = true;
        }
        if (flag1 && flag2 == true) {
            $scope.persons = $scope.persons1;
            return;
        } else {
            $scope.searchStartTime = $scope.visible1 == false ? handleTime($("#studystartdate").val()) : -1;
            $scope.searchStartTime2 = $scope.visible2 == false ? handleTime($("#studystartdate2").val()) : -1;
            $scope.persons = [];
            angular.forEach($scope.persons1, function (data, index, array) {
                var namecheck = false;
                var timecheck1 = false;
                var timecheck2 = false;
                var patientname = data.patientname.toLowerCase();
                if (patientname.indexOf($scope.handleTerm) != -1 || $scope.handleTerm == undefined) {
                    namecheck = true;
                }
                if ($scope.searchStartTime <= handleTime(data.uploadtime)) {
                    timecheck1 = true;
                }
                if ($scope.searchStartTime2 <= handleTime(data.addtime)) {
                    timecheck2 = true;
                }
                if (namecheck && timecheck1 && timecheck2) {
                    $scope.persons.push(data);
                }
            })
            setTimeout(function () {
                $('#tblOrders').trigger('footable_redraw');
            }, 100);
            if ($scope.persons.length == 0) {
                $("#page1").hide();
                setTimeout(function () {
                    $('#tblOrders').trigger('footable_redraw');
                }, 100);
            }
        }
    }
    $scope.openReport = function (askid,status,cardid) {
        if (status == 4) {
           window.localStorage.setItem('askid',askid);
            $http.post($rootScope.servers + "/service/ask/updateAskStatus?askid="+askid+'&status=8', {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            }).success(function (data) {
                openReportForm($rootScope.servers);
            })
        } else {
            detailConsultImp(askid,cardid);
            return;
        }
    }
    init();
    function init() {
        $http.post($rootScope.servers + "/service/ask/list", data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.persons1 = message;
                        $scope.persons = $scope.persons1;
                        // $scope.overTime=[];
                        // $scope.finish=[];
                        // $scope.unfinish=[];
                        // angular.forEach($scope.persons1, function (data, index) {
                        //     if (moment(data.endtime).fromNow()[0]=='i') {
                        //         $scope.overTimeNum+=1;
                        //         $scope.overTime.push(data);
                        //         if(data.status==4){
                        //             $scope.finishNum+=1;
                        //             $scope.finish.push(data);
                        //         }else {
                        //             $scope.unfinishNum+=1;
                        //             $scope.unfinish.push(data);
                        //         }
                        //     }
                        // })
                        setTimeout(function () {
                            $('#tblOrders').trigger('footable_redraw');
                        }, 200)
                    }
                }
            })
    }

    $http.post($rootScope.servers + "/service/ask/completeaskcount", data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                if (message) {
                    $scope.count = message.askCount;
                    $scope.complete = message.completedAskCount;
                    $scope.unfinish = message.unfinishedAskCount;
                }
            }
        })

    $scope.countConsult = function () {
        angular.element("#count").addClass('border-bottom-green');
        angular.element("#complete").removeClass('border-bottom-green');
        angular.element("#unfinish").removeClass('border-bottom-green');
       $scope.persons=$scope.persons1;
    }
    $scope.completeConsult = function () {
        angular.element("#count").removeClass('border-bottom-green');
        angular.element("#complete").addClass('border-bottom-green');
        angular.element("#unfinish").removeClass('border-bottom-green');
        $scope.persons=[];
        angular.forEach($scope.persons1, function (data, index) {
                if(data.status==4){
                    $scope.persons.push(data);
                }
        })
        setTimeout(function () {
            $('#tblOrders').trigger('footable_redraw');
        }, 200)
    }
    $scope.unfinishConsult = function () {
        angular.element("#count").removeClass('border-bottom-green');
        angular.element("#complete").removeClass('border-bottom-green');
        angular.element("#unfinish").addClass('border-bottom-green');
        // $scope.persons=$scope.unfinish;
        $scope.persons=[];
        angular.forEach($scope.persons1, function (data, index) {
            if(data.status!=4){
                $scope.persons.push(data);
            }
        })
        setTimeout(function () {
            $('#tblOrders').trigger('footable_redraw');
        }, 200)

    }
    $scope.detailConsult = function (askid, cardid, status, imageid) {
        detailConsultImp(askid,cardid,status,imageid);
    }
    function detailConsultImp(askid,cardid,status,imageid){
       window.localStorage.setItem('askid', askid);
        window.localStorage.setItem('cardid', cardid);
        if (status != 4) {
            window.location.href = "/#/normalConsult/normalDetailMessage";
        } 
    }
}
//conmon detail
function normalDetailMessage($scope, $rootScope, $http, parseData, SweetAlert) {
    var askid = window.localStorage.getItem('askid');
    var cardid = window.localStorage.getItem('cardid');
    $http.get($rootScope.servers + '/service/ask/' + askid)
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                $scope.message = message;
                // console.log(message);
                $scope.targetuser = message.targetuser;
                $scope.reviseStatus = message.status == 1 ? false : true;
                if (message.status == 1) {
                    $scope.visible = true;
                } else {
                    $scope.visible = false;
                }
            }
        })
    $http.get($rootScope.servers + '/service/ask/imagelist?curpage=1&pagesize=1000&askid=' + askid)
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                if (message) {
                    $scope.images = message;
                }
            }
        })
    $scope.delelteAsk = function () {
        SweetAlert.swal({
                title: "温馨提示",
                text: "确定要取消咨询吗",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定取消",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                // if (isConfirm) {
                //     var data2 = {
                //         status: 6,
                //         askid: askid,
                //         asktype: 0,
                //         doctorid: targetuser
                //     }
                //
                //     $http.post($rootScope.servers + "/service/ask/change", data2)
                //         .success(function (data) {
                //             var result = data.result;
                //             if (result == 0) {
                //                 swal("已取消", "取消咨询成功", "success");
                //                 window.location.href = "/#/expertConsult"
                //             } else if (result == -1) {
                //                 swal("取消失败失败", "", "error");
                //             } else {
                //                 swal("未知错误", "", "error");
                //             }
                //         })
                //
                // } else {
                //     swal("取消", "", "error");
                // }
                if (isConfirm) {
                    var data = {
                        status: 6,
                        askid: askid,
                        asktype: 1,
                        doctorid: $scope.targetuser
                    }
                    $http.post($rootScope.servers + "/service/ask/change", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                SweetAlert.swal("已删除", "咨询已删除", "success");
                                window.location.href = "/#/normalConsult"
                            } else if (result == -1) {
                                SweetAlert.swal("删除失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        })

                } else {
                    SweetAlert.swal("取消", "", "error");
                }
            });

    }
    $scope.deleteImage = function (id) {
        swal({
                title: "温馨提示",
                text: "确定要取消影像吗",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定取消",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        id: id
                    }
                    $http.post($rootScope.servers + "/service/ask/deleteimage", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {

                                swal("已取消", "影像已取消", "success");
                                window.location.href = "/#/normalConsult"
                            } else if (result == 1) {
                                swal("取消失败", "影像已被接受阅片，不能取消影像！", "error");
                            } else {
                                swal("取消影像失败", "", "error");
                            }
                        })

                } else {
                    swal("放弃取消", "", "error");
                }
            });
    }
    $scope.openReport = function (askid,status,cardid) {
        if (status == 4) {
            window.localStorage.setItem('askid',askid);
            $http.post($rootScope.servers + "/service/ask/updateAskStatus?askid="+askid+'&status=8', {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            }).success(function (data) {
                openReportForm($rootScope.servers);
            })
        } else {
            detailConsultImp(askid,cardid);
            return;
        }
    }

}
//update Normal Ask Message
function updateNormalAskMessage($http, $scope, $rootScope, $modal, parseData, toaster, transform,_undefined,myToaster) {
    var userid = window.localStorage.getItem('userid')
    var askid = window.localStorage.getItem('askid')
    var transform = function (data) {
        return $.param(data);
    }
    $scope.visible = true;
    $scope.asktype = 3;
    $http.get($rootScope.servers + '/service/ask/' + askid)
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                $scope.updateConsult = message;

            }
        })
    $http.get($rootScope.servers + '/service/ask/imagelist?curpage=1&pagesize=1000&askid=' + askid)
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                if (message) {
                    $scope.persons = message;
                }
            }
        })
    //doctor list
    var data = {
        instid: userid,
        curpage: 1,
        pagesize: 1000
    }
    $http.post($rootScope.servers + '/service/user/doctorlist', data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        }
        )
        .success(function (data) {
            if (data.result == 0) {
                var message = parseData(data.message);
                $scope.doctors = message;
            }
        })
    //add invite
    //todo
    // $scope.addInvite=function () {
    //     if($("input[name='doctor']:checked").length==0){
    //         toaster.pop({
    //             type: 'warning',
    //             title: '请选择咨询医生',
    //             showCloseButton: true,
    //             timeout: 2200
    //         });
    //     }
    //     $("input[name='doctor']:checked").each(
    //         function () {
    //             var usercheck=$(this).val();
    //             angular.forEach($scope.doctors,function (data) {
    //                 if(usercheck==data.userid){
    //                     $scope.invites.push(data);
    //                 }
    //             })
    //             }
    //
    //
    //     )
    // }
    //modify consult
    $scope.updateasktype = function (type) {
        if (type == 3) {
            $scope.visible = true;
        } else {
            $scope.visible = false;
        }
        if (type == 2) {
            $http.get($rootScope.servers + '/service/inst/mydoctorgrouplist?instid=' + userid)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        var message = parseData(data.message);
                        $scope.doctorNum = [];
                        if (_undefined(message)) {
                            myToaster('warning', '选择邀请列表失败', '我的医生中没有医生分组');
                            // $("#asktype1").checked=true;
                            $scope.asktype = 3;
                        } else {
                            var dataFriend = {};
                            dataFriend.instid = userid;
                            $.each(message, function (i, val) {
                                dataFriend.groupid = val.groupid;
                                $.ajax({
                                        url: $rootScope.servers + '/service/inst/mydoctorlist?curpage=1&pagesize=1000',
                                        data: dataFriend,
                                        type: 'post',
                                        dataType: 'json',
                                        async: false
                                    })
                                    .success(function (data) {
                                        var result = data.result;
                                        if (result == 0) {
                                            var message = parseData(data.message);
                                            $scope.doctorNum.push(message);
                                        }
                                    })
                                if (!_undefined($scope.doctorNum)) {
                                    return false;
                                }
                            })
                            if (_undefined($scope.doctorNum)) {
                                myToaster('warning', '发起咨询失败', '我的医生中没有医生好友');
                                $scope.asktype = 3;
                            }
                        }
                    }
                })
        }
    }

    $scope.modifyConsult = function () {
        var data = {};
        var imagestr = "";
        var asktype = $('input[name="asktype"]:checked').val();
        $('input[name="imagecheck"]:checked').each(function () {
            imagestr += $(this).val() + ";";
        });
        if (asktype == 3) {
            var targetuserstr = '';
            if ($('input[name="imagecheck"]:checked').val() == '') {
                toaster.pop({
                    type: 'warning',
                    title: '请选择医生',
                    showCloseButton: true,
                    timeout: 2200
                });
                return;
            }
            $('input[name="doctor"]:checked').each(function () {
                targetuserstr += $(this).val() + ";";
            });
            data.targetuserstr = targetuserstr;
        }

        if (imagestr == '') {
            toaster.pop({
                type: 'warning',
                title: '请选择影像',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($("#endtime").val() == '' || $("#endtime").val() == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请选择日期',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($("#asktitle").val() == '') {
            toaster.pop({
                type: 'warning',
                title: '请填写标题',
                showCloseButton: true,
                timeout: 2200
            });
        } else {
            data.askid = askid;
            data.imagestr = imagestr;
            data.endtime = $("#endtime").val();
            data.updateuser = userid;
            data.asktype = asktype;
            data.title = $("#asktitle").val();
            data.hasupload = '1';
            $http.post($rootScope.servers + '/service/ask/update', data)
                .success(function (data) {
                        if (data.result == 0) {
                            toaster.pop({
                                type: 'success',
                                title: '修改成功',
                                showCloseButton: true,
                                timeout: 2200
                            });
                            setTimeout(function () {
                                window.location.href = '/#/normalConsult'
                            }, 400);
                        }
                    }
                )
        }

    }
}
//myImage
function myImage($scope, $http, $rootScope, $modal, loginServer, toaster, SweetAlert, DTColumnDefBuilder, DTOptionsBuilder,handleTime) {

    $scope.mTable = {};
    $scope.mTable.columnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1).notSortable(),
        DTColumnDefBuilder.newColumnDef(4).notSortable(),
        DTColumnDefBuilder.newColumnDef(5).notSortable(),
    ]


    $scope.mFilter_noImage = function (e) {
        return e.modality != "noImage";
    }
    var userid = window.localStorage.getItem("userid");
    var transform = function (data) {
        return $.param(data);
    }

    function parseMessageData(data) {
        try {
            var message = JSON.parse(data);
            return message;
        } catch (e) {
            return false;
        }
    }

    var data = {
        userid: userid,
        havereport: -1,
        haveask: -1,
        curpage: 1,
        pagesize: 1000
    };
    initList();
    function initList() {
        $scope.visible1 = true;
        $scope.visible2 = true;
        $scope.visible3 = true;
        $scope.visible4 = true;
        $scope.inputName = '患者姓名';
        $scope.inputPlace = '请输入查询姓名';
        $scope.starttime1 = '上传起始日期';
        $scope.endtime1 = '上传截止日期';
        $scope.inputName1 = '患者ID';
        $scope.starttime = '拍摄起始日期';
        $scope.endtime = '拍摄截止日期';
        $http.post($rootScope.servers + '/service/image/list', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseMessageData(data.message);
                    $scope.persons1 = message;
                    $scope.persons = [];
                    angular.forEach($scope.persons1, function (data, index) {
                        if (data.modality != "noImage") {
                            $scope.persons.push(data);
                        }
                    })

                }
            }).error(function (data) {
            toaster.pop({
                type: 'error',
                body: '列表更新出错',
                showCloseButton: true,
                timeout: 1200
            });
        })

    }

    //viewer
    $scope.viewer = function (imageid, patientid, studyid) {
        $('body').addClass('mini-navbar');
        $http.get($rootScope.servers + "/service/user/" + userid + "/privacy")
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseMessageData(data.message);
                    // $scope.set = message[0];
                    $scope.isDicomOrJpg = message[0].isDicomOrJpg;
                    var url = '';
                    window.localStorage.setItem('studyUID', studyid);
                    window.localStorage.setItem('patientID', patientid);
                    window.localStorage.setItem('imageid', imageid);
                    //当用户设置里面为dicom时，访问dicom类型，否则为jpg类型
                    if ($scope.isDicomOrJpg != null && $scope.isDicomOrJpg == 1) {
                        url = '?imageid=' + imageid + '&patientID='
                            + patientid + '&' + 'studyUID=' + studyid
                            + '&reportFlag=0' + '&type=dicom';
                    } else {
                        url = '?imageid=' + imageid + '&patientID='
                            + patientid + '&' + 'studyUID=' + studyid
                            + '&reportFlag=0' + '&type=jpg'
                    }

                    //window.location.href = '#/viewer' + url
                    window.location.href='/app/imageview/viewer.html'+url;
                }
            })
    }
    //editor
    $scope.editor = function (name, age, sex, institutionName, studyDate, modality, imageId, birthday) {
        var modalInstance = $modal.open({
            templateUrl: 'app/main/Viewer/editorPage.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
        loginServer.patient = {
            name: name,
            age: age,
            sex: sex,
            institutionName: institutionName,
            studyDate: studyDate,
            modality: modality,
            imageId: imageId,
            birthday: birthday
        }
    };

    $scope.turnInstitutions = function (askid) {
        $http.post($rootScope.servers + '/service/ask/turnInstitutions' + askid)
            .success(function (data) {

            })
    }
    //open electronic list
    $scope.openForm = function (imageid) {
        var formdata = new FormData();
        formdata.append('imageId', imageid);
        formdata.append('userid', userid);
        $.ajax({
                type: 'post', url: $rootScope.servers + '/service/imageReport/printElectronImage', data: formdata,
                processData: false, contentType: false
            }
            )
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var url = data.message;
                    window.open($rootScope.servers + url, '_blank');
                } else {
                    toaster.pop({
                        type: 'error',
                        body: '打开电子表单失败出错',
                        showCloseButton: true,
                        timeout: 1200
                    });
                }
            }).error(function (data) {
            toaster.pop({
                type: 'error',
                body: '打开电子表单失败出错',
                showCloseButton: true,
                timeout: 1200
            });
        })
    }
    //share
    $scope.shareImage = function (imageid) {
        loginServer.shareImageid = imageid;
        var modalInstance1 = $modal.open({
            templateUrl: 'app/main/myshare/shareImage.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    }
    //delete image
    $scope.deleteImage = function (imageid) {
        SweetAlert.swal({
                title: "温馨提示",
                text: "确认要删除图像吗？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        imageid: imageid,
                        userid: userid
                    }
                    $http.post($rootScope.servers + "/service/image/unbinduser", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                initList();
                                SweetAlert.swal("已删除", "图像已删除", "success");
                            } else if (result == -1) {
                                SweetAlert.swal("删除失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        })
                } else {
                    SweetAlert.swal("取消删除", "", "error");
                }
            });
    }
    //search image
    $scope.search = {};
    //搜索
    $scope.searchForInput = function () {
        var flag1 = false;
        var flag2 = false;
        if (($scope.searchTerm == undefined || $scope.searchTerm == '') && ($scope.searchTerm1 == undefined || $scope.searchTerm1 == '')) {
            flag1 = true;
        }
        if ($scope.visible1 == true && $scope.visible2 == true && $scope.visible3 == true && $scope.visible4 == true) {
            flag2 = true;
        }
        if (flag1 && flag2 == true) {
            $scope.persons = $scope.persons1;
            return;
        } else {
            $scope.searchStartTime = $scope.visible1 == false ? handleTime($("#studystartdate").val()) : -1;
            $scope.searchEndTime = $scope.visible2 == false ? handleTime($("#studyenddate").val()) : 99999999;
            $scope.searchStartTime1 = $scope.visible3 == false ? handleTime($("#studystartdate1").val()) : -1;
            $scope.searchEndTime1 = $scope.visible4 == false ? handleTime($("#studyenddate1").val()) : 99999999;
            $scope.persons = [];
            angular.forEach($scope.persons1, function (data, index, array) {
                var namecheck = false;
                var idcheck = false;
                var timecheck1 = false;
                var timecheck2 = false;
                var patientname = data.patientname.toLowerCase();
                var patientid = data.patientid.toLowerCase();
                if (patientname.indexOf($scope.handleTerm) != -1 || $scope.handleTerm == undefined) {
                    namecheck = true;
                }
                if (patientid.indexOf($scope.handleTerm1) != -1 || $scope.handleTerm1 == undefined) {
                    idcheck = true;
                }
                if ($scope.searchStartTime1 <= parseInt(data.uploaddate) && $scope.searchEndTime1 >= parseInt(data.uploaddate)) {
                    timecheck1 = true;
                }
                if ($scope.searchStartTime <= handleTime(data.studydate) && $scope.searchEndTime >= handleTime(data.studydate)) {
                    timecheck2 = true;
                }
                if (namecheck && timecheck1 && timecheck2 && idcheck) {
                    $scope.persons.push(data);
                }
            })
            setTimeout(function () {
                $('#tblOrders').trigger('footable_redraw');
            }, 100);
            if ($scope.persons1.length == 0) {
                $("#page1").hide();
                setTimeout(function () {
                    $('#tblOrders').trigger('footable_redraw');
                }, 100);
            }
        }
    }
    $scope.switchvisible1 = function () {
        $scope.visible1 = !$scope.visible1;
    }
    $scope.switchvisible2 = function () {
        $scope.visible2 = !$scope.visible2;
    }
    $scope.switchvisible3 = function () {
        $scope.visible3 = !$scope.visible3;
    }
    $scope.switchvisible4 = function () {
        $scope.visible4 = !$scope.visible4;
    }
    //upload image
    $scope.addNewImage = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/main/myimage/addNewImage.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    }
}
//myCase
function myCase($scope, $modal, $rootScope, $http, SweetAlert, storgeServer, toaster, parseData, loginServer) {
    var userid = window.localStorage.getItem("userid");
    var transform = function (data) {
        return $.param(data);
    }

    initlist();
    function initlist() {
        $http.get($rootScope.servers + "/service/card/mycardgrouplist?userid=" + userid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        loginServer.nowGname=[];
                        $.each(message,function (i,val) {
                            loginServer.nowGname.push(val.gname);
                        })
                        $scope.gname = message[0].gname;
                        localStorage.setItem("gname", $scope.gname);
                        $scope.items = message;
                        var data = {};
                        data.userid = userid;
                        data.groupid = message[0].groupid;
                        $http.post($rootScope.servers + "/service/card/mycardlist?curpage=1"
                                + "&pagesize=1000", data, {
                                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                                transformRequest: transform
                            })
                            .success(function (data) {
                                var result = data.result;
                                if (result == 0) {
                                    var message = parseData(data.message);
                                    if (message) {
                                        $scope.persons1 = message;
                                        $scope.persons = $scope.persons1;
                                    }
                                }
                            })
                    }
                    else if (result == -1) {
                        toaster.pop({
                            type: 'error',
                            body: '获取分组信息失败',
                            showCloseButton: true,
                            timeout: 2200
                        })
                    } else {
                        toaster.pop({
                            type: 'error',
                            body: '未知错误',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    }
                }
            })
            .error(function () {
                toaster.pop({
                    type: 'error',
                    body: '服务器异常',
                    showCloseButton: true,
                    timeout: 2200
                });
            })
    }

    $scope.newGroup = function () {
        var modalInstance1 = $modal.open({
            templateUrl: 'app/main/mycase/divideGroup1.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    }
    $scope.deleteGroup = function (groupid) {
        SweetAlert.swal({
                title: "温馨提示",
                text: "病例分组删除后不可恢复",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        groupid: groupid,
                        doctorid: userid
                    }
                    $http.post($rootScope.servers + "/service/card/deletecardgroup", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {

                                SweetAlert.swal("已删除", "病例分组已删除", "success");
                                // initlist();
                                angular.forEach($scope.items, function (item, index, array) {
                                    if (item.groupid == groupid && item.doctorid == userid) {
                                        $scope.items.splice(index, 1);
                                    }
                                });
                            } else if (result == -1) {
                                SweetAlert.swal("删除失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        })
                } else {
                    SweetAlert.swal("取消删除", "", "error");
                }
            });
    }
    $scope.deleteCard = function (cardid) {
        SweetAlert.swal({
                title: "温馨提示",
                text: "您确定要删除病例吗",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var data = {
                        cardid: cardid
                    }
                    $http.post($rootScope.servers + "/service/card/delete", data)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                var keepGoing = true;
                                angular.forEach($scope.persons, function (obj, index, array) {
                                    if (keepGoing && cardid == obj.cardid) {
                                        $scope.persons.splice(index, 1);
                                        keepGoing = false;
                                    }
                                });
                                SweetAlert.swal("已删除", "删除病例成功", "success");
                            } else if (result == -1) {
                                SweetAlert.swal("删除失败", "", "error");
                            } else {
                                SweetAlert.swal("未知错误", "", "error");
                            }
                        })
                } else {
                    SweetAlert.swal("取消删除", "", "error");
                }
            });
    }
    $scope.editor = function (caseData) {
        storgeServer.setter(caseData);
    }
    $scope.openDetailCase = function (cardid) {
        window.localStorage.setItem('cardid', cardid);
    }
    $scope.doctorList = function (groupid, gname) {
        var data = {
            userid: userid,
            groupid: groupid
        }
        $http.post($rootScope.servers + "/service/card/mycardlist?curpage=1&pagesize=1000", data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.persons = message;
                    }
                }
            })
    }
    $scope.openEditorGroup = function (groupid) {
        loginServer.groupid = groupid;
        var modalInstance1 = $modal.open({
            templateUrl: 'app/main/friend/editorGroup1.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
        loginServer.groupid = groupid;
    }
    $scope.searchForInput = function () {
        // if($scope.doctorName1!=undefined){
        //     $scope.dcotorName2=$scope.doctorname1.toLowerCase();
        //     $scope.doctorname2=$scope.doctorname2.replace(/\s+/g,'');
        // }
        // $scope.persons=[];
        // angular.forEach($scope.persons1,function (data) {
        //
        // })

        // $scope.persons=searchByName($scope.doctorName1,$scope.persons1);
    }
}
//editor group
function editorGroup1($scope, $http, loginServer, $rootScope, toaster,myToaster) {
    var userid = window.localStorage.getItem("userid");
    var usertype = window.localStorage.getItem("usertype");
    // $scope.nowGname=localStorage.getItem("nowGname");
    $scope.newgname = '';
    if (usertype == 1) {
        var data = {
            userid: userid,
            groupid: loginServer.groupid
        }
        var gurl = "/service/card/updatecardgroup";
    } else if (usertype == 2) {
        var data = {
            groupid: loginServer.groupid
        }
        var gurl = "/service/card/updatecardgroup";
    } else if (usertype == 3) {
        var data = {

            groupid: loginServer.groupid
        }
        var gurl = "/service/card/updatecardgroup"
    }
    $scope.editorGroups = function () {
        data.gname = $scope.newgname;
        // $scope.nowGname=$scope.nowGname.split(',');
        if($.inArray($scope.newgname, loginServer.nowGname)!=-1){
            myToaster('error','','用户名已存在');
            return false;
        }else{
            $http.post($rootScope.servers + gurl, data)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        window.location.reload();
                        toaster.pop({
                            type: 'success',
                            title: '编辑成功',
                            showCloseButton: true,
                            timeout: 1200
                        });
                    } else if (result == 1) {
                        toaster.pop({
                            type: 'error',
                            title: '分组名已存在',
                            showCloseButton: true,
                            timeout: 1200
                        });
                    } else if (result == -1) {
                        toaster.pop({
                            type: 'error',
                            title: '编辑分组失败',
                            showCloseButton: true,
                            timeout: 1200
                        });
                    } else {
                        toaster.pop({
                            type: 'error',
                            title: '编辑分组失败',
                            showCloseButton: true,
                            timeout: 1200
                        });
                    }
                })
        }

    }

}
//editor case
function updateCase($scope, fileReader, $rootScope, $http, parseData, toaster, SweetAlert) {
    var gname = window.localStorage.getItem('gname');
    var cardid = window.localStorage.getItem('cardid');
    var userid = window.localStorage.getItem('userid');
    $scope.visible = true;
    $scope.getFile = function () {
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function (result) {
                $scope.imageSrc = result;
            });
    };
    $scope.openFile = function () {
        angular.element("#myfile").click();
    };
    $scope.imageShow = function () {
        angular.element("#replaceimage").hide();
    };
    initCard();
    function init() {
        $http.get($rootScope.servers + "/service/card/mycardgrouplist?userid=" + userid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.groups = message;
                        for (var i = 0; i < message.length; i++) {
                            if ($scope.groupId == message[i].groupid) {
                                $scope.groupname = message[i].groupid;
                            }
                        }
                    }
                }
            })
    }

    function initCard() {
        $http.get($rootScope.servers + "/service/card/" + cardid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    $scope.card = message[0];
                    $scope.groupId = message[0].groupid;
                    init();
                    if ($scope.card.firsttime == '' || $scope.card.firsttime == undefined) {
                        $scope.visible = true;
                    } else {
                        $scope.visible = false;
                    }
                }
            })
    }

    $scope.confirmChange = function () {
        var reg = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
        if (!reg.test($scope.card.tel)) {//验证电话号码
            toaster.pop({
                type: 'warning',
                title: '电话号码格式不正确',
                showCloseButton: true,
                timeout: 2200
            });
            return;
        }
        var formData = new FormData($("#card-form")[0]);
        formData.append('cardid', cardid);
        formData.append('groupid', $scope.groupname);
        formData.append('updateuser', userid);
        formData.append('userid', userid);
        formData.append("firsttime", $.trim($("#card-firsttime").val())); //首诊时间
        formData.append("reason", $.trim($("#card-reason").val()));   //主诉
        formData.append("medical", $.trim($("#card-medical").val()));   //现病史
        formData.append("medicalhis", $.trim($("#card-medicalhis").val())); //既往史
        formData.append("sign", $.trim($("#card-sign").val()));           //体征
        formData.append("assist", $.trim($("#card-assist").val()));  //辅助检查
        formData.append("diagnose", $.trim($("#card-diagnose").val()));//诊断
        formData.append("handle", $.trim($("#card-handle").val()));  //处理
        $.ajax({
            url: $rootScope.servers + '/service/card/update',
            type: 'POST',
            data: formData,
            async: false,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function (data) {
                var result = data.result;
                if (result == 0) {
                    toaster.pop({
                        type: 'success',
                        title: '更新病例成功',
                        showCloseButton: true,
                        timeout: 2200
                    });
                    // window.history.go(-1);
                } else if (result == -1) {
                    toaster.pop({
                        type: 'success',
                        title: '更新病例失败',
                        showCloseButton: true,
                        timeout: 2200
                    });
                } else {
                    toaster.pop({
                        type: 'success',
                        title: '服务器异常',
                        showCloseButton: true,
                        timeout: 2200
                    });
                }
            }
        })
    }
    $scope.addCourse = function () {

    }
    $scope.cancelUpdate = function () {
        SweetAlert.swal({
                title: "温馨提示",
                text: "是否确定取消",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定取消",
                cancelButtonText: "不，我再想想",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    /*
                     $http.post($rootScope.servers + "/service/inst/deletedoctorgroup", data)
                     .success(function (data) {
                     var result = data.result;
                     console.log(result);
                     if (result == 0) {
                     initGroup();
                     SweetAlert.swal("已删除", "好友分组已删除", "success");
                     } else if (result == -1) {
                     SweetAlert.swal("删除失败", "", "error");
                     } else {
                     SweetAlert.swal("未知错误", "", "error");
                     }
                     })*/
                    SweetAlert.swal("已取消", "", "success");
                    window.location.href = "/#/institute_home/myCase";
                } else {
                    SweetAlert.swal("未取消", "", "error");
                }
            });
    }
}
//add case
function newCase($scope, $http, fileReader, $rootScope, toaster, parseData, _undefined, myToaster) {
    var userid = window.localStorage.getItem('userid');
    init();
    var flag = 0;

    function init() {
        $http.get($rootScope.servers + "/service/card/mycardgrouplist?userid=" + userid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        $scope.groupname = message[0].groupid;
                        $scope.groups = message;
                    }
                }
            })
    }

    $scope.getFile = function () {
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function (result) {
                $scope.imageSrc = result;
            });
    };
    $scope.openFile = function () {
        angular.element("#myfile").click();
    }
    $scope.imageShow = function () {
        angular.element("#replaceimage").hide();
    }

    $scope.createNewCard = function () {

        if ($("#patientname").val() == '' || $("#patientname").val() == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请填写姓名',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($('input:radio[name="gender"]:checked').val() == null) {
            toaster.pop({
                type: 'warning',
                title: '请选择性别',
                showCloseButton: true,
                timeout: 2200
            });
        } else if ($("#age").val() == '' || $("#age").val() == undefined) {
            toaster.pop({
                type: 'warning',
                title: '请填写年龄',
                showCloseButton: true,
                timeout: 2200
            });
        } else if (_undefined($scope.groupname)) {
            myToaster('warning', '', '请先创建病例分组');
        } else {
            var reg = /^\+?[1-9][0-9]{0,2}|127$/;
            if (!reg.test($("#age").val())) {            //判断年龄输入是否合法
                toaster.pop({
                    type: "warning",
                    title: '年龄必须为大于0小于127的数字',
                    showloseButton: true,
                    timeout: 2200
                });
                return;
            }
            $("#createCard").attr('disabled', true);
            var formData = new FormData($("#card-form")[0]);
            formData.append('groupid', $scope.groupname);
            formData.append('adduser', userid);
            formData.append('userid', userid);
            formData.append("firsttime", $.trim($("#card-firsttime").val())); //首诊时间
            formData.append("reason", $.trim($("#card-reason").val()));   //主诉
            formData.append("medical", $.trim($("#card-medical").val()));   //现病史
            formData.append("medicalhis", $.trim($("#card-medicalhis").val())); //既往史
            formData.append("sign", $.trim($("#card-sign").val()));           //体征
            formData.append("assist", $.trim($("#card-assist").val()));  //辅助检查
            formData.append("diagnose", $.trim($("#card-diagnose").val()));//诊断
            formData.append("handle", $.trim($("#card-handle").val()));  //处理
            $.ajax({
                url: $rootScope.servers + '/service/card/new',
                type: 'POST',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data) {
                    data = JSON.parse(data);
                    var result = data.result;
                    if (result == 0) {
                        // $("#createCard").addClass('disabled');
                        toaster.pop({
                            type: 'success',
                            body: '新建病例成功',
                            showCloseButton: true,
                            timeout: 2200
                        })
                        setTimeout(function () {
                            window.location.href = '/#/institute_home/myCase';
                        }, 500);
                    } else if (result == -1) {
                        toaster.pop({
                            type: 'error',
                            body: '新建病例失败',
                            showCloseButton: true,
                            timeout: 2200
                        })
                        $("#createCard").attr('disabled', false);
                    }
                },
                error: function () {
                    toaster.pop({
                        type: 'error',
                        body: '服务器异常',
                        showCloseButton: true,
                        timeout: 2200
                    })
                    $("#createCard").attr('disabled', false);
                }
            })
        }

    }
    $scope.visible = true;
    $scope.showit = function () {
        $scope.visible = false;
        toaster.pop({
            type: 'success',
            title: '创建首诊成功',
            body: '根据患者的情况，创建病人首次诊断信息',
            showCloseButton: true,
            timeout: 3200
        })
    }
}
//detail case
function detailCase($scope, $rootScope, $http, parseData) {
    var gname = window.localStorage.getItem('gname');
    var cardid = window.localStorage.getItem('cardid');
    $scope.card = {};
    $scope.visible = true;
    $http.get($rootScope.servers + '/service/card/' + cardid)
        .success(function (data) {
            if (data.result == 0) {
                var message = parseData(data.message);

                $scope.card = message[0];
                $scope.card.gname = gname;
                if ($scope.card.firsttime != '' || $scope.card.firsttime != undefined) {
                    $scope.visible = false;
                }
            }
        })
}
//instituteUpdate
function instituteUpdate($scope, $rootScope, $http, fileReader, parseData, toaster, loginServer, getUrl) {
    var userid = window.localStorage.getItem('userid');
    var url = window.location.href;
    var args = getUrl('userid', url);
    if (args != '') {
        userid = args;
    }
    $scope.getFile = function () {
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function (result) {
                $scope.imageSrc = result;
            });
    };
    $scope.openFile = function () {
        angular.element("#myfile").click();
    }
    $scope.imageShow = function () {
        angular.element("#replaceimage").hide();
    }
    //init message
    init();
    function init() {
        $http.get($rootScope.servers + "/service/user/" + userid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    console.log(message);

                    if (message) {
                        $("#pre_province").val(message[0].province);
                        $("#pre_city").val(message[0].city);
                        $("#pre_district").val(message[0].area);
                        $scope.userdata = message[0];
                        if (message[0].status == 5) {
                            angular.element("#examine").html('用户帐号被冻结，请联系客服处理。');
                            $("#examine").show();
                        } else {
                            angular.element("#update-data-btn").html('确认更新');
                            $scope.status4 = true;
                        }
                        //
                        var citySelector;
                        $(function () {
                            citySelector = function () {
                                var province = $("#userdetail-province");
                                var city = $("#userdetail-city");
                                var district = $("#userdetail-area");
                                var preProvince = $("#pre_province");
                                var preCity = $("#pre_city");
                                var preDistrict = $("#pre_district");
                                var jsonProvince = "../js/content/json-array-of-province.js";
                                var jsonCity = "../js/content/json-array-of-city.js";
                                var jsonDistrict = "../js/content/json-array-of-district.js";
                                var hasDistrict = true;
                                var initProvince = "<option value='0'>省份</option>";
                                var initCity = "<option value='0'>城市</option>";
                                var initDistrict = "<option value='0'>区县</option>";
                                return {
                                    Init: function () {
                                        var that = this;
                                        that._LoadOptions(jsonProvince, preProvince, province, null, 0, initProvince);
                                        province.change(function () {
                                            that._LoadOptions(jsonCity, preCity, city, province, 2, initCity);
                                        });
                                        if (hasDistrict) {
                                            city.change(function () {
                                                that._LoadOptions(jsonDistrict, preDistrict, district, city, 4, initDistrict);
                                            });
                                            province.change(function () {
                                                city.change();
                                            });
                                        }
                                        province.change();
                                    },
                                    _LoadOptions: function (datapath, preobj, targetobj, parentobj, comparelen, initoption) {
                                        $.get(datapath,
                                            function (r) {
                                                var t = ''; // t: html容器
                                                var s; // s: 选中标识
                                                var pre; // pre: 初始值
                                                if (preobj == undefined) {
                                                    pre = 0;
                                                } else {
                                                    pre = preobj.val();
                                                }
                                                for (var i = 0; i < r.length; i++) {
                                                    s = '';
                                                    if (comparelen === 0) {
                                                        if (pre !== "" && pre !== 0 && r[i].code === pre) {
                                                            s = ' selected=\"selected\" ';
                                                            pre = '';
                                                        }
                                                        t += '<option value=' + r[i].code + s + '>' + r[i].name + '</option>';
                                                    } else {
                                                        var p = parentobj.val();
                                                        if (p.substring(0, comparelen) === r[i].code.substring(0, comparelen)) {
                                                            if (pre !== "" && pre !== 0 && r[i].code === pre) {
                                                                s = ' selected=\"selected\" ';
                                                                pre = '';
                                                            }
                                                            t += '<option value=' + r[i].code + s + '>' + r[i].name + '</option>';
                                                        }
                                                    }
                                                }
                                                if (initoption !== '') {
                                                    targetobj.html(initoption + t);
                                                } else {
                                                    targetobj.html(t);
                                                }
                                                targetobj.selectpicker('refresh');
                                            }, "json");
                                    }
                                };
                            }();
                            citySelector.Init();
                        });
                    }
                }
            })
    }

    //update message
    $scope.updateUser = function () {
        var reg = /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,15}$/;
        if ($scope.userdata.tel.match(reg) == null) {
            toaster.pop({
                type: 'error',
                body: '您输入的联系电话有误',
                showCloseButton: true,
                timeout: 2200
            });
        }else {
            var formData = new FormData($("#userdetail-form")[0]);
            formData.append('userid', userid);
            $.ajax({
                url: $rootScope.servers + '/service/user/update',
                type: 'POST',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,

                success: function (data) {
                    data = JSON.parse(data);

                    //0修改密码成功、1用户不存在、2密码错误、-1修改密码失败
                    var result = data.result;
                    if (result == 0) {
                        toaster.pop({
                            type: 'success',
                            title: '信息更新成功',
                            showCloseButton: true,
                            timeout: 2000
                        })
                        init();
                    } else if (result == -1) {
                        toaster.pop({
                            type: 'error',
                            title: '信息更新失败',
                            showCloseButton: true,
                            timeout: 2000
                        })
                    } else {
                        toaster.pop({
                            type: 'error',
                            title: '服务器异常',
                            showCloseButton: true,
                            timeout: 2000
                        })
                    }
                }
            });
        }
    }

}



//update password
function updatePassword($scope, $rootScope, $http, toaster) {


  /*  $scope.listeningNewPassword = function(){
        alert('Test');
        $scope.password = $("#passwordInput").val();
        $scope.newpass = $("#newpasswordInput").val();
        $scope.rpassword = $("#rnewpasswordInput").val()

    }*/

    $scope.showPassword = function(){
        if($('#passwordLabel').is(':checked')){
            $('#passwordSpan').html("<input  id=\"passwordInput\" required=\"required\" type=\"text\"  class=\"form-control parsley-success\"  name=\"password\" ng-model=\"password\" value="+$("#passwordInput").val()+">");
            $('#newpasswordSpan').html("<input id=\"newpasswordInput\" type=\"text\" required=\"required\"  pattern=\"^[a-zA-Z0-9!@#$%?_+-,./;']{6,20}$\"  class=\"form-control\" ng-model=\"newpass\"  value="+$("#newpasswordInput").val()+" >");
            $('#rnewpasswordSpan').html("<input id=\"rnewpasswordInput\" type=\"text\" required=\"required\"  pattern=\"^[a-zA-Z0-9!@#$%?_+-,./;']{6,20}$\"  class=\"form-control\" ng-model=\"rpassword\" value="+$("#rnewpasswordInput").val()+" >");
            $scope.password = $("#passwordInput").val();
            $scope.newpass = $("#newpasswordInput").val();
            $scope.rpassword = $("#rnewpasswordInput").val()

        }else{
            $('#passwordSpan').html("<input  id=\"passwordInput\" required=\"required\" type=\"password\"  class=\"form-control parsley-success\"  placeholder=\"请输入原密码\" name=\"password\" ng-model=\"password\" value="+$("#passwordInput").val()+">");
            $('#newpasswordSpan').html("<input id=\"newpasswordInput\" type=\"password\" required=\"required\"  pattern=\"^[a-zA-Z0-9!@#$%?_+-,./;']{6,20}$\"  placeholder=\"请输入至少6位密码\" class=\"form-control\" ng-model=\"newpass\" value="+$("#newpasswordInput").val()+">");
            $('#rnewpasswordSpan').html("<input id=\"rnewpasswordInput\" type=\"password\" required=\"required\"  pattern=\"^[a-zA-Z0-9!@#$%?_+-,./;']{6,20}$\"  placeholder=\"确认密码\" class=\"form-control\" ng-model=\"rpassword\" value="+$("#rnewpasswordInput").val()+" >");
            $scope.password = $("#passwordInput").val();
            $scope.newpass = $("#newpasswordInput").val();
            $scope.rpassword = $("#rnewpasswordInput").val()
        }
    }
    var userid = window.localStorage.getItem('userid');

    $scope.confirmNewPass = function () {
        if ($scope.newpass != $scope.rpassword) {
            $("#rnewpwdError").html("输入的两次新密码不相同");
            $("#rnewpwdError").css({"color":"red"});
        }else{
            $("#rnewpwdError").empty();
        }
    }

    $scope.updatePass = function () {
        $scope.password = $("#passwordInput").val();
        $scope.newpass = $("#newpasswordInput").val();
        $scope.rpassword = $("#rnewpasswordInput").val()
        if ($scope.newpass != $scope.rpassword) {
            toaster.pop({
                type: 'error',
                body: '两次密码输入不相同',
                showCloseButton: true,
                timeout: 2200
            });
        } else {

            $http.post($rootScope.servers + "/service/user/updatepassword", {
                    'userid': userid,
                    'password': $scope.password,
                    'newpass': $scope.newpass
                })
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        toaster.pop({
                            type: 'success',
                            body: '修改密码成功',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    } else if (result == 1) {
                        toaster.pop({
                            type: 'error',
                            body: '用户不存在',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    } else if (result == 2) {
                        toaster.pop({
                            type: 'error',
                            body: '原始密码错误',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    } else if (result == -1) {
                        toaster.pop({
                            type: 'error',
                            body: '修改密码失败',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    } else {
                        toaster.pop({
                            type: 'error',
                            body: '未知错误',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    }
                })
                .error(function () {
                    toaster.pop({
                        type: 'error',
                        body: '服务器异常',
                        showCloseButton: true,
                        timeout: 2200
                    });
                })
        }
    }
}
//privacy update
function privacyUpdate($scope, $rootScope, $http, toaster, transform, parseData) {
    var userid = window.localStorage.getItem('userid');




    $scope.returnHomePage = function () {
        window.location.href = "/#/homePage"
    }
    $scope.checkThis = function (type) {
        if (type == 1) {
            angular.element("#private-isDicom").attr("checked", true);
            angular.element("#private-isJpg").attr("checked", false);
        }
        if (type == 2) {
            angular.element("#private-isDicom").attr("checked", false);
            angular.element("#private-isJpg").attr("checked", true);
        }
    }
    $http.get($rootScope.servers + "/service/user/" + userid + "/privacy")
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                $scope.set = message[0];
            }
        })
    var data = {
        userid: userid
    }
    $http.post($rootScope.servers + '/service/user/getCustom', data, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        transformRequest: transform
    })
        .success(function (data) {
            $scope.consultData = data.message[0];
        })
    $scope.updatePrivate = function () {
        var data = {};
        data = $scope.set;
        $http.post($rootScope.servers + "/service/user/updateprivacy", data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    toaster.pop({
                        type: 'success',
                        title: '设置成功',
                        showCloseButton: true,
                        timeout: 2200
                    });
                } else if (result == -1) {
                    toaster.pop({
                        type: 'error',
                        body: '设置失败',
                        showCloseButton: true,
                        timeout: 2200
                    });
                } else {
                    toaster.pop({
                        type: 'error',
                        body: '未知错误',
                        showCloseButton: true,
                        timeout: 2200
                    });
                }
            })
            .error(function () {
                toaster.pop({
                    type: 'error',
                    body: '服务器异常',
                    showCloseButton: true,
                    timeout: 2200
                });
            })
    }
    $scope.defineService = function () {
        var reg = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
        var strRegex = "^((https|http|ftp|rtsp|mms)://)?[a-z0-9A-Z]{3}\.[a-z0-9A-Z][a-z0-9A-Z]{0,61}?[a-z0-9A-Z]\.com|net|cn|cc (:s[0-9]{1-4})?/$";
        var RegUrl = new RegExp(strRegex);

        if ($("#tel").val() == null || $("#cellPhone").val() == null) {
            toaster.pop({
                type: 'error',
                body: '您输入的服务热线不能为空',
                showCloseButton: true,
                timeout: 2200
            });
        }else if ($("#tel").val().match(reg) == null || $("#cellPhone").val().match(reg) == null) {
            toaster.pop({
                type: 'error',
                body: '您输入的联系电话格式不正确',
                showCloseButton: true,
                timeout: 2200
            });
        }
        else {
            var data = {
                tel: $("#tel").val(),
                mobiletel:$("#cellPhone").val(),
                userid: userid
            }
            $http.post($rootScope.servers + '/service/user/updateTel', data, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            })
                .success(function (data) {
                    if (data.result == 0) {
                        toaster.pop({
                            type: 'success',
                            body: '设置服务热线成功',
                            showCloseButton: true,
                            timeout: 2200
                        });
                    }
                })
        }
    }

    $scope.defineReport = function () {
        var data = {
            ask_report_title: $("#title").val(),
            ask_report_subtitle: $("#subtitle").val(),
            userid: userid
        }
        $http.post($rootScope.servers + '/service/user/custom', data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
            .success(function (data) {
                if (data.result == 0) {
                    toaster.pop({
                        type: 'success',
                        body: '自定义成功',
                        showCloseButton: true,
                        timeout: 2200
                    });
                }
            })
    }
}
//chooseDoctorFriend
function chooseDoctorFriend($http, $scope, $rootScope, parseData, SweetAlert) {
    var userid = window.localStorage.getItem('userid');
    var transform = function (data) {
        return $.param(data);
    }
    $http.get($rootScope.servers + "/service/inst/mydoctorgrouplist?instid=" + userid)
        .success(function (data) {
            var result = data.result;
            if (result == 0) {
                var message = parseData(data.message);
                if (message) {
                    $scope.items = message;
                }
            }
        })

    $scope.choosegroups = function () {
        var data = {
            groupid: $scope.addgroups,
            doctorid: window.localStorage.getItem('doctorid')
        };
        if ($scope.addgroups != null) {
            $http.post($rootScope.servers + "/service/inst/binddoctor", data)
                .success(function (data) {
                    var result = data.result;
                    if (result == 0) {
                        SweetAlert.swal("添加医生成功", "", "success");
                        window.location.reload();
                    } else if (result == 1) {
                        SweetAlert.swal("不能重复添加医生", "", "error");
                    } else {
                        SweetAlert.swal("添加医生失败", "", "error");
                    }
                })
        }
    }


}

function shareImageshow($http, $scope, $rootScope, parseData, $modal) {}
function shareImageshow2($http, $scope, $rootScope, parseData, $modal) {
    $('#flagshare').css('display', 'none');
    var modalInstance1 = $modal.open({
        templateUrl: 'app/main/myshare/shareImagelist.html',
        controller: ModalInstanceCtrl,
        windowClass: "animated fadeIn"
    });
}

function shareImagelist($http, $scope, $rootScope, parseData, toaster, $location, $modal) {
    var url = window.location.href;
    var isShareOrImage = url.substring(url.lastIndexOf('?') + 1, url.length);
    var data = {};
    if(isShareOrImage.indexOf("eformid") != 0){
       data = JSON.parse(window.localStorage.getItem('ShareOrImage'));
    }
    if (data.isShareOrImage == 'shareid') {
        var shareid = data.id;
        $http.get($rootScope.servers + "/service/share2image/" + shareid + "?shareid=" + shareid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    $scope.checkcode = message.checkcode
                    $scope.endtime = message.endtime
                }
            })
        $scope.verifycode = function () {
            var endtime = $scope.endtime.substr(0, 4) + $scope.endtime.substr(5, 2) + $scope.endtime.substr(8, 2);
            var now = new Date();
            var str = now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
            var curtime = str.substr(0, 4) + str.substr(5, 2) + str.substr(8, 2);
            if (endtime < curtime) {
                toaster.pop({
                    type: 'error',
                    body: '到达分享截至日期，分享已结束',
                    showCloseButton: true,
                    timeout: 2200
                })
            } else {
                if ($scope.checkcode == $scope.newgroups) {
                    toaster.pop({
                        type: 'sucess',
                        body: '验证码正确',
                        showCloseButton: true,
                        timeout: 2200
                    })
                    window.location.href = '/#/imageshare?shareid=' + shareid
                    // angular.element("#editGroupModal").addClass('close');
                    $scope.ok();
/*                    $('#editGroupModal').css('display', 'none');
                    $('#flagshare').css('display', 'block');
                    window.triggerResize();//重新位置界面，防止界面显示不全问题*/
                }

                else {
                    toaster.pop({
                        type: 'error',
                        body: '请输入正确的验证码',
                        showCloseButton: true,
                        timeout: 2200
                    });
                }
            }
        };
        $scope.cancel = function () {
            $scope.ok();
            window.location.href = '/#/myShare';
        }
    }
    else if (isShareOrImage.indexOf("eformid") == 0) {
        //var eformid =data.id;
        var eformid = $location.search().eformid;
        $http.get($rootScope.servers + "/service/eformimage/" + eformid)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    $scope.imageid = message.imageid;
                    $http.get($rootScope.servers + "/service/image/" + $scope.imageid)
                        .success(function (data) {
                            var result = data.result;
                            if (result == 0) {
                                var message = parseData(data.message);
                                $scope.checkcode = message.checkcode;
                            }
                        })
                }
            })
        $scope.verifycode = function () {
            if ($scope.checkcode == $scope.newgroups) {
                toaster.pop({
                    type: 'sucess',
                    body: '验证码正确',
                    showCloseButton: true,
                    timeout: 2200
                })
                // angular.element("#editGroupModal").addClass('close');
                $scope.ok();
                $('#editGroupModal').css('display', 'none');
                $('#flagshare').css('display', 'block');
                window.triggerResize();//重新位置界面，防止界面显示不全问题
            }
            else {
                toaster.pop({
                    type: 'error',
                    body: '请输入正确的验证码',
                    showCloseButton: true,
                    timeout: 2200
                });
            }
        }
        $scope.cancel = function () {
            $scope.ok();
            window.close();
        }
    }
}
function consultCancel_i($rootScope,$scope,$http,$state) {//弹出页的控制器，作用：提交数据到后台
    var askid = window.localStorage.getItem('askid', askid);
    $scope.cancelConfirm_i = function(){
        $http.get($rootScope.servers + '/service/ask/cancleask?askid=' + askid+'&cancelReason='+$scope.cancelReason+'&userType=3')
            .success(function (data) {
                if (data.result != -1) {
                    $state.reload();
                }
            })
    };
}
function ModalInstanceCtrl($scope, $modalInstance) {//弹窗

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

};
//申请咨询页面controller
function applyForAsk($rootScope,$scope,$http,$state,loginServer,myToaster,toaster,SweetAlert){

    $scope.imageid = loginServer.imageId;
    $scope.askid = loginServer.askId;
    $scope.userid = loginServer.userid;

    var transform = function (data) {
        return $.param(data);
    }
    function parseMessageData(data) {
        try {
            var message = JSON.parse(data);
            return message;
        } catch (e) {
            return false;
        }
    }
    init();
    function init(){
        var data = {
            userid: $scope.userid,
            userType:3,
            imageid: $scope.imageid,
            pagesize: 1000,
            curpage: 1
        }
        $http.post($rootScope.servers + "/service/ask/list", data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        })
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var image2askmessage = parseMessageData(data.message);
                    $scope.imageForPersons = image2askmessage[0];
                    if($scope.imageForPersons){
                        if($scope.imageForPersons.status ==6 || $scope.imageForPersons.status ==5){
                            $('#title').attr("disabled","disabled");
                            $('#memo').attr("disabled","disabled");
                            $('#askquestion').attr("disabled","disabled");
                            $('#canclereason').attr("disabled","disabled");
                            $scope.title = $scope.imageForPersons.title;
                            $scope.memo = $scope.imageForPersons.memo;
                            $scope.askquestion = $scope.imageForPersons.askquestion;
                            $scope.canclereason = $scope.imageForPersons.cancelReason;
                        }

                    }
                }
            })

    }
    function StringBuffer() {
        this.__strings__ = new Array();
    }
    StringBuffer.prototype.append = function (str) {
        this.__strings__.push(str);
        return this;    //方便链式操作
    }
    StringBuffer.prototype.toString = function () {
        return this.__strings__.join("");
    }

    $scope.changeFiles = function(){
        var filesBuffer = new StringBuffer();
        var files = document.getElementById("upload_file").files;
        $scope.files = files;
        $.each(files,function(index,value){
            filesBuffer.append(value.name)
            if(index!=files.length-1) {
                filesBuffer.append(',')
                filesBuffer.append()
            }
        })
        document.getElementById("upload_file_tmp").value = filesBuffer.toString();
        var returnValue = this.uploadAskAttachment();
        if(returnValue == false){
            document.getElementById("upload_file_tmp").value = '';
        }
    }

    $scope.cancleAsk = function(){
        window.location.href = '/#/homePage'
    }
    $scope.isHide = true;

    $scope.openFile = function () {
        angular.element("#fileupload").click();
    }
    $scope.uploaditems = function () {
        var file = document.getElementById('fileupload').files;
        $scope.files = file;
        $scope.isHide = false;
    }
    $scope.clearFile = function () {
        $('#fileupload').val('');
        $scope.isHide = true;
    }
    $scope.uploadAskAttachment = function () {
        $scope.fileSize = 0;
        $scope.fileNameLength = 0;
        var flag = true;
        var array = ["txt", "pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "dcm", "zip","rar","bmp","7zip","jpeg"];
        $scope.fileNum = 0;
        $.each($scope.files, function (i, data) {
            $scope.fileSize = $scope.fileSize + parseInt(data.size);
            $scope.fileNameLength = $scope.fileNameLength + data.name.length;
            $scope.fileNum++;
            var fileType = data.name.split(".")[1].toLowerCase();
            if ($.inArray(fileType, array) == -1) {
                flag = false;
                return false;
            }
        })

        if ($scope.fileSize > 10240000) {
            swal("上传文件不能大于10M")
            return false;
        }
        else if ($scope.fileSize <= 0) {
            swal("上传文件为空")
            return false;
        }
        else if ($scope.fileNameLength > 250) {
            swal("文件上传名过长")
            return false;
        }
        else if ($scope.fileNum > 5) {
            swal("文件一次上传数量不能超过5个")
            return false;
        }
        else if (flag == false) {
            swal("上传文件格式错误,请重新选择文件");
            return false;
        }
        else {
            var askid = loginServer.askId;
            var formData = new FormData();
            angular.forEach($scope.files, function (data) {
                formData.append("file", data);
            })
            formData.append("askid", askid);

            $.ajax({
                url: $rootScope.servers + "/service/ask/uploadAttachment",
                type: "POST",
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                dataType: "JSON",
                success: function (data) {
                    var result = data.result;
                    if (result == 0) {
                        var returnmessage = data.message;
                        if (returnmessage) {
                            $scope.attachmenthasupload = returnmessage;
                            return true
                        }

                    }
                }

            })
        }
    }

    //function initApplyForAsk(){
    //
    //
    //    var data = {
    //        imageid: parseInt(imageid),
    //        curpage: 1,
    //        pagesize: 100,
    //        adduser: userid
    //    };
    //
    //    $http.post($rootScope.servers + '/service/ask/getAskByImageId', data, {
    //        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
    //        transformRequest: transform
    //    })
    //        .success(function (data) {
    //            var result = data.result;
    //            if (result == 0) {
    //                var message = parseData(data.message);
    //                if (message) {
    //                    $scope.asks1 = message;
    //                }
    //            }
    //        });
    //}
    //
    //initApplyForAsk();



    $scope.startAsk = function(){
        var data = {
            askid:$scope.askid,
            imageid: parseInt($scope.imageid),
            title :$scope.title,
            adduser : $scope.userid,
            hasupload : $scope.attachmenthasupload,
            asktype : 3,
            status : 1,
            memo : $scope.memo,
            askquestion:$scope.askquestion,
            supplementComment : $scope.supplementcomments
        };
        $http.post($rootScope.servers + '/service/ask/update', data)
            .success(function (data) {
                var result = data.result;
                if (result == 0) {
                    var message = parseData(data.message);
                    if (message) {
                        toaster.pop({
                            type: 'success',
                            body: '成功发起咨询',
                            showCloseButton: true,
                            timeout: 2200
                        });
                       /* window.location.href = '/#/homePage'*/
                    }
                }

            });
    }







}

function instituteSetting ($scope) {

}


/*
 *
 * Pass all functions into module
 */
angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .controller('translateCtrl', translateCtrl)
    .controller('Login', Login)
    .controller('Register', Register)
    .controller('forgetPassword', forgetPassword)
    .controller('Navigation', Navigation)
    .controller('Topnavbar', Topnavbar)
    .controller('Institution', Institution)
    .controller('datatablesCtrl', datatablesCtrl)
    .controller('editor', editor)
    .controller('doctorHome', doctorHome)
    .controller('doctorFriend', doctorFriend)
    .controller('newGroup', newGroup)
    .controller('newGroup1', newGroup1)
    .controller('editorGroup', editorGroup)
    .controller('seniorSearch', seniorSearch)
    .controller('expertAsk', expertAsk)
    .controller('myShare', myShare)
    .controller('shareAdd', shareAdd)
    .controller('shareDetailed', shareDetailed)
    .controller('normalAsk', normalAsk)
    .controller('myImage', myImage)
    .controller('myCase', myCase)
    .controller('updateCase', updateCase)
    .controller('newCase', newCase)
    .controller('detailCase', detailCase)
    .controller('instituteUpdate', instituteUpdate)
    .controller('updatePassword', updatePassword)
    .controller('privacyUpdate', privacyUpdate)
    .controller('askMessage', askMessage)
    .controller('detailMessage', detailMessage)
    .controller('normalDetailMessage', normalDetailMessage)
    .controller('startNormalAsk', startNormalAsk)
    .controller('consultConfirm', consultConfirm)
    .controller('updateNormalAskMessage', updateNormalAskMessage)
    .controller('chooseDoctorFriend', chooseDoctorFriend)
    .controller('normalAskMessage', normalAskMessage)
    .controller('shareImage', shareImage)
    .controller('editorGroup1', editorGroup1)
    .controller('shareImageshow', shareImageshow)
    .controller('shareImageshow2', shareImageshow2)
    .controller('shareImagelist', shareImagelist)
    .controller('consultConfirm1', consultConfirm1)
    .controller('consultCancel_i', consultCancel_i)
    .controller('applyForAsk', applyForAsk)
    .controller('instituteSetting',instituteSetting)
;
