app.controller('userController', ['$scope', '$routeParams', '$rootScope', '$http', 'profileService', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, profileService, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        var chkActive = document.getElementById('chkActive');

        self.item = {
            FirstName: '',
            LastName: '',
            PhoneNumber: '',
            Password: '',
        };
        self.resetItem = function () {
            self.Id = undefined;
            self.item = {
                FirstName: '',
                LastName: '',
                PhoneNumber: '',
                Password: '',
            };
        };
        self.initializeController = function () {
            ajaxService.WhoseMenu();
            clearInterval(ajaxService.getCookie('timerId')); 

            if ($location.path().includes("/user/profile")) {
                self.getProfile();
            }

            if ($location.path().includes("/admin/admins")) {
                self.getPermissions();
            }
        };
        self.getPermissions = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Role/GetAll").then(function (data) {
                if (data.status != 200)
                    return;
                self.permissions = data.data.map((obj) => {
                    return {
                        id: obj.Id,
                        title: obj.Title
                    };
                });
            });
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
        self.addOrUpdateAdmin = function () {
            if (!$scope.formAddAdminModal.$valid) {
                return;
            }
            const model = {
                Id: self.Id ? self.Id : emptyGuid,
                FirstName: self.item.FirstName,
                LastName: self.item.LastName,
                PhoneNumber: self.item.PhoneNumber,
                Password: self.item.Password,
                PermissionId: self.PermissionId,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/User/AddOrUpdateAdmin", model).then(function (data) {
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

            self.PermissionId = row.PermissionId;

            self.item.Shba = row.Shba;
            self.item.BankAccount = row.BankAccount;
            self.item.CardNumber = row.CardNumber;
            self.NationalFileName = row.NationalCardFileName;
            self.SignatureFileName = row.SignatureFileName;

            if (row.Active)
                chkActive.checked = true;
            else
                chkActive.checked = false;
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
        self.addOrUpdateUserSetting = function () {
            if (!$scope.form.$valid) {
                return;
            }
            const model = {
                UserId: self.Id,
                MinInstalmentAmount: self.item.MinInstalmentAmount,
                MaxInstalmentAmount: self.item.MaxInstalmentAmount,
                MinPrePayment: self.item.MinPrePayment,
                MaxPrePayment: self.item.MaxPrePayment,
                MonthlyProfit: self.item.MonthlyProfit,
                MinMonth: self.item.MinMonth,
                MaxMonth: self.item.MaxMonth,
                LateFee: self.item.LateFee,
                MinPartnershipAmount: self.item.MinPartnershipAmount,
                MaxPartnershipAmount: self.item.MaxPartnershipAmount,
                MinPartnershipMonth: self.item.MinPartnershipMonth,
                MaxPartnershipMonth: self.item.MaxPartnershipMonth,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Setting/AddOrUpdateUserSetting", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
        self.getSettingByUserId = function (row) {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Setting/GetByUserId/" + row.Id).then(function (data) {
                if (data.status != 200)
                    return;
                self.item = {
                    ...data.data
                };
            });
        };
        self.updateProfile = function () {
            if (!$scope.form.$valid) {
                return;
            }
            const model = {
                Shba: self.item.Shba,
                BankAccount: self.item.BankAccount,
                CardNumber: self.item.CardNumber,
                NationalCardFileName: self.NationalFileName,
                SignatureFileName: self.SignatureFileName,
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

                self.NationalFileName = self.item.NationalCardFileName;
                self.SignatureFileName = self.item.SignatureFileName;
            });
        };
        $scope.UploadNationalFile = function (files) {
            $scope.SelectedFiles = files;
            if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
                Upload.upload({
                    url: $rootScope.domain + '/File/UploadNationalFile/',
                    data: {
                        files: $scope.SelectedFiles
                    }
                }).then(function (response) {
                    $timeout(function () {
                        $scope.Result = response.data;
                        self.NationalFileName = response.data;
                    });
                }, function (response) {
                    if (response.status > 0) {
                        var errorMsg = response.status + ': ' + response.data;
                        alert(errorMsg);
                    }
                }, function (evt) {
                    var element = angular.element(document.querySelector('#dvProgress1'));
                    $scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    element.html('<div style="width: ' + $scope.Progress + '%">' + $scope.Progress + '%</div>');
                });
            }
        };
        $scope.UploadSignatureFile = function (files) {
            $scope.SelectedFiles = files;
            if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
                Upload.upload({
                    url: $rootScope.domain + '/File/UploadSignatureFile/',
                    data: {
                        files: $scope.SelectedFiles
                    }
                }).then(function (response) {
                    $timeout(function () {
                        $scope.Result = response.data;
                        self.SignatureFileName = response.data;
                    });
                }, function (response) {
                    if (response.status > 0) {
                        var errorMsg = response.status + ': ' + response.data;
                        alert(errorMsg);
                    }
                }, function (evt) {
                    var element = angular.element(document.querySelector('#dvProgress2'));
                    $scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    element.html('<div style="width: ' + $scope.Progress + '%">' + $scope.Progress + '%</div>');
                });
            }
        };
    }]);
