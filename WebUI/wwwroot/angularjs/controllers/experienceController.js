app.controller('experienceController', ['$scope', '$routeParams', '$rootScope', '$http', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        self.item = {
            Project: '',
            Company: '',
            Role: '',
            Activity: '',
            Benefit: '',
        };
        self.resetItem = function () {
            self.Id = undefined;
            self.item = {
                Project: '',
                Company: '',
                Role: '',
                Activity: '',
                Benefit: '',
            };
        };
        self.initializeController = function () {
            ajaxService.WhoseMenu();
        };

        self.tableParams = new NgTableParams($rootScope.tableParams["experienceController_tableParams"] ||
        {
            page: 1,
            count: 15,
        },
            {
                filterDelay: 300,
                getData: function (params) {
                    $rootScope.tableParams["experienceController_tableParams"] = params._params;

                    let url = $rootScope.domain + "/api/Experience/GetAllByUserId";

                    return ajaxService.ajaxPaged(url, params._params).then(function (data) {
                        if (data.status != 200)
                            return;
                        params.total(data.data.count);
                        return data.data.items;
                    });
                }
            });

        self.addOrUpdate = function () {
            const model = {
                Id: self.Id ? self.Id : emptyGuid,
                Project: self.item.Project,
                Company: self.item.Company,
                Role: self.item.Role,
                Activity: self.item.Activity,
                Benefit: self.item.Benefit,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Experience/AddOrUpdate", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        }
        self.getRow = function (row) {
            self.Id = row.Id;
            self.item.Project = row.Project;
            self.item.Company = row.Company;
            self.item.Role = row.Role;
            self.item.Activity = row.Activity;
            self.item.Benefit = row.Benefit;
        };
        self.delete = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Experience/Delete/" + self.Id).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
    }]);
