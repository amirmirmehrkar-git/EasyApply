app.controller('userController', ['$scope', '$routeParams', '$rootScope', '$http', 'profileService', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, profileService, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        self.item = {
            FirstName: '',
            LastName: '',
            PhoneNumber: '',
            Password: '',
            NeededJob: '',
        };
        self.resetItem = function () {
            self.Id = undefined;
            self.item = {
                FirstName: '',
                LastName: '',
                PhoneNumber: '',
                Password: '',
                NeededJob: '',
            };
        };
        self.initializeController = function () {
            ajaxService.WhoseMenu();

            if ($location.path().includes("/user/setting")) {
                self.getProfile();
            }
        };
        self.tableParams = new NgTableParams($rootScope.tableParams["userController_tableParams"] ||
        {
            page: 1,
            count: 15,
        },
            {
                filterDelay: 300,
                getData: function (params) {
                    $rootScope.tableParams["userController_tableParams"] = params._params;

                    let url = "";
                    if ($location.path().includes("/admin/admins"))
                        url = $rootScope.domain + "/api/User/GetAllAdmins";
                    else if ($location.path().includes("/admin/users"))
                        url = $rootScope.domain + "/api/User/GetAllUsers";

                    return ajaxService.ajaxPaged(url, params._params).then(function (data) {
                        if (data.status != 200)
                            return;
                        params.total(data.data.count);
                        return data.data.items;
                    });
                }
            });

        self.addOrUpdateUser = function () {
            if (!$scope.formAddOrUpdateUser.$valid) {
                return;
            }
            const model = {
                Id: self.Id ? self.Id : emptyGuid,
                FirstName: self.item.FirstName,
                LastName: self.item.LastName,
                PhoneNumber: self.item.PhoneNumber,
                Password: self.item.Password,
                Shba: self.item.Shba,
                BankAccount: self.item.BankAccount,
                CardNumber: self.item.CardNumber,
                Active: chkActive.checked == true ? true : false,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/User/AddOrUpdateUser", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };

        self.getRow = function (row) {
            self.Id = row.Id;
            self.item.FirstName = row.FirstName;
            self.item.LastName = row.LastName;
            self.item.PhoneNumber = row.PhoneNumber;
            self.item.Password = row.Password;
        };
        self.delete = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/User/Delete/" + self.Id).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
        self.loginWithToken = function (user) {
            $rootScope.spinnerActive = true;
            $http.get($rootScope.domain + "/api/account/loginWithToken/" + user.Id).then(function (result) {
                const data = result.data;
                if (data && data.success) {

                    document.cookie = "TokenId=" + data.TokenId;
                    document.cookie = "Token=" + data.Token;
                    document.cookie = "UserRole=" + data.role;

                    profileService.refreshProfile();

                    if (data.role == 'Admin') {
                        window.location.replace('#!/admin/dashboard');
                    }
                    else if (data.role == 'User') {
                        window.location.replace('#!/user/dashboard');
                    }
                }
                else {
                    self.modelState = data.errors;
                    $rootScope.spinnerActive = false;
                }
            }, function (response, failed) {
                $rootScope.spinnerActive = false;
                if (response.status == 400) {
                    self.modelState = response.data.ModelState.Messages;
                    return;
                }
                if (response.status != 200)
                    return;
            });
        };
        self.updateProfile = function () {
            const model = {
                FirstName: self.item.FirstName,
                LastName: self.item.LastName,
                NeededJob: self.item.NeededJob,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/User/UpdateProfile", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
        self.getProfile = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Account/GetProfile/").then(function (data) {
                if (data.status != 200)
                    return;
                self.item = {
                    ...data.data
                };
            });
        };
    }]);
