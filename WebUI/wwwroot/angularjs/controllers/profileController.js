app.controller('profileController', ['$scope', '$routeParams', '$rootScope', '$http', 'profileService', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, profileService, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;
        self.showSubmenu = false;
        self.initializeController = function () {
            self.getProfile();
            clearInterval(ajaxService.getCookie('timerId')); 
        };
        self.getProfile = function () {
            self.UserFullName = ajaxService.getCookie('UserFullName');
            self.UserPhoneNumber = ajaxService.getCookie('UserPhoneNumber');
            self.UserImagePath = ajaxService.getCookie('UserImagePath');
            self.UserRole = ajaxService.getCookie('UserRole');
        };
        self.goTo = function (path) {
            $location.path(path);
        };
    }]);
