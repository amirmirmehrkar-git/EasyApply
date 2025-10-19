
app.controller('educationController', ['$scope', '$routeParams', '$rootScope', '$http', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        self.item = {
            Academy: '',
            Degree: '',
            Score: '',
        };
        self.resetItem = function () {
            self.Id = undefined;
            self.item = {
                Academy: '',
                Degree: '',
                Score: '',
            };
        };
        self.initializeController = function () {
            ajaxService.WhoseMenu();
        };

        self.tableParams = new NgTableParams($rootScope.tableParams["educationController_tableParams"] ||
        {
            page: 1,
            count: 15,
        },
            {
                filterDelay: 300,
                getData: function (params) {
                    $rootScope.tableParams["educationController_tableParams"] = params._params;

                    let url = $rootScope.domain + "/api/Education/GetAllByUserId";

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
                Academy: self.item.Academy,
                Degree: self.item.Degree,
                Score: self.item.Score,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Education/AddOrUpdate", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        }
        self.getRow = function (row) {
            self.Id = row.Id;
            self.item.Academy = row.Academy;
            self.item.Degree = row.Degree;
            self.item.Score = row.Score;
        };
        self.delete = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Education/Delete/" + self.Id).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
    }]);
