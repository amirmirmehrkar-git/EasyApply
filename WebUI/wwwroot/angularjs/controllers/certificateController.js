app.controller('certificateController', ['$scope', '$routeParams', '$rootScope', '$http', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        self.item = {
            Title: '',
            Academy: '',
            Skill: '',
        };
        self.resetItem = function () {
            self.Id = undefined;
            self.item = {
                Title: '',
                Academy: '',
                Skill: '',
            };
        };
        self.initializeController = function () {
            ajaxService.WhoseMenu();
        };

        self.tableParams = new NgTableParams($rootScope.tableParams["certificateController_tableParams"] ||
        {
            page: 1,
            count: 15,
        },
            {
                filterDelay: 300,
                getData: function (params) {
                    $rootScope.tableParams["certificateController_tableParams"] = params._params;

                    let url = $rootScope.domain + "/api/Certificate/GetAllByUserId";

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
                Title: self.item.Title,
                Academy: self.item.Academy,
                Skill: self.item.Skill,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Certificate/AddOrUpdate", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        }
        self.getRow = function (row) {
            self.Id = row.Id;
            self.item.Title = row.Title;
            self.item.Academy = row.Academy;
            self.item.Skill = row.Skill;
        };
        self.delete = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Certificate/Delete/" + self.Id).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
    }]);
