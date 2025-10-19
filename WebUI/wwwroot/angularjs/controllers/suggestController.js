app.controller('suggestController', ['$scope', '$routeParams', '$rootScope', '$http', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        self.item = {
            ResponseText: '',
            SuggestId: '',
        };
        self.resetItem = function () {
            self.item = {
                ResponseText: '',
                SuggestId: '',
            };
        };
        self.initializeController = function () {
            ajaxService.WhoseMenu();

            self.getAllSuggestByUserId();
        };

        self.addResponse = function () {
            const model = {
                ResponseText: self.item.ResponseText,
                SuggestId: self.item.SuggestId,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Suggest/AddResponse", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        }
        self.getRow = function (row) {
            self.item.SuggestId = row.Id;
            self.Responses = row.Responses;
        };
        self.getAllSuggestByUserId = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Suggest/GetAllSuggestByUserId").then(function (data) {
                if (data.status != 200)
                    return;
                self.suggests = data.data;
            });
        };
    }]);
