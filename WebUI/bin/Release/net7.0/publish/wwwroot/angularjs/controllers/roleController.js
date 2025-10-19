app.controller('roleController', ['$scope', '$routeParams', '$rootScope', '$http', 'profileService', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, profileService, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        self.resetItem = function () {
            $rootScope.RoleId = undefined;
            $rootScope.Title = '';
            $rootScope.Roles = [];

            self.uncheckedAll();
        };

        var chkPermissions = document.getElementById('chkPermissions');
        var chkUsers = document.getElementById('chkUsers');
        var chkRequests = document.getElementById('chkRequests');
        var chkTransactions = document.getElementById('chkTransactions');
        var chkInstalments = document.getElementById('chkInstalments');
        var chkPartnerships = document.getElementById('chkPartnerships');
        var chkProfits = document.getElementById('chkProfits');
        var chkSetting = document.getElementById('chkSetting');
        var chkTickets = document.getElementById('chkTickets');
        var chkDashboards = document.getElementById('chkDashboards');

        self.initializeController = function () {
            ajaxService.WhoseMenu();
            clearInterval(ajaxService.getCookie('timerId'));
        };
        self.uncheckedAll = function () {
            chkPermissions.checked = false;
            chkUsers.checked = false;
            chkRequests.checked = false;
            chkTransactions.checked = false;
            chkInstalments.checked = false;
            chkPartnerships.checked = false;
            chkProfits.checked = false;
            chkSetting.checked = false;
            chkTickets.checked = false;
            chkDashboards.checked = false;
        };
        self.tableParams = new NgTableParams($rootScope.tableParams["roleController_tableParams"] ||
        {
            page: 1,
            count: 15,
        },
            {
                filterDelay: 300,
                getData: function (params) {
                    $rootScope.tableParams["roleController_tableParams"] = params._params;

                    let url = "";
                    if ($location.path().includes("/admin/admins"))
                        url = $rootScope.domain + "/api/Role/GetAll";

                    return ajaxService.ajaxPaged(url, params._params).then(function (data) {
                        if (data.status != 200)
                            return;
                        params.total(data.data.count);
                        return data.data.items;
                    });
                }
            });

        self.addOrUpdate = function () {
            if (!$scope.form.$valid) {
                return;
            }

            $rootScope.Roles = [];

            if (chkPermissions.checked) $rootScope.Roles.push('READ_PERMISSIOM');
            if (chkUsers.checked) $rootScope.Roles.push('READ_USERS');
            if (chkRequests.checked) $rootScope.Roles.push('READ_REQUESTS');
            if (chkTransactions.checked) $rootScope.Roles.push('READ_TRANSACTIONS');
            if (chkInstalments.checked) $rootScope.Roles.push('READ_INSTALMENTS');
            if (chkPartnerships.checked) $rootScope.Roles.push('READ_PARTNERSHIP');
            if (chkProfits.checked) $rootScope.Roles.push('READ_PROFITS');
            if (chkSetting.checked) $rootScope.Roles.push('READ_SETTING');
            if (chkTickets.checked) $rootScope.Roles.push('READ_TICKETS');
            if (chkDashboards.checked) $rootScope.Roles.push('READ_DASHBOARDS');

            const model = {
                Id: $rootScope.RoleId ? $rootScope.RoleId : emptyGuid,
                Title: $rootScope.Title,
                Roles: $rootScope.Roles,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Role/AddOrUpdate", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
        self.getRow = function (row) {
            $rootScope.RoleId = row.Id;
            $rootScope.Title = row.Title;
            $rootScope.Roles = row.Roles;

            self.uncheckedAll();

            if ($rootScope.Roles.some(m => m == 'READ_PERMISSIOM')) chkPermissions.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_USERS')) chkUsers.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_REQUESTS')) chkRequests.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_TRANSACTIONS')) chkTransactions.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_INSTALMENTS')) chkInstalments.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_PARTNERSHIP')) chkPartnerships.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_PROFITS')) chkProfits.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_SETTING')) chkSetting.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_TICKETS')) chkTickets.checked = true;
            if ($rootScope.Roles.some(m => m == 'READ_DASHBOARDS')) chkDashboards.checked = true;
        };
    }]);
