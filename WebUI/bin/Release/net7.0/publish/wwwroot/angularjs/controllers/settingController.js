app.controller('settingController', ['$rootScope', '$scope', '$routeParams', '$location', 'NgTableParams', 'ajaxService', function ($rootScope, $scope, $routeParams, $location, NgTableParams, ajaxService) {
    "use strict";
    var self = this;
    self.item = {
        MinInstalmentAmount: '',
        MaxInstalmentAmount: '',
        MinPrePayment: '',
        MaxPrePayment: '',
        MonthlyProfit: '',
        MinMonth: '',
        MaxMonth: '',
        LateFee: '',
        MinPartnershipAmount: '',
        MaxPartnershipAmount: '',
        MinPartnershipMonth: '',
        MaxPartnershipMonth: '',
    };
    this.initializeController = function () {
        ajaxService.WhoseMenu();
        clearInterval(ajaxService.getCookie('timerId')); 

        self.getSetting();
    };

    self.addOrUpdate = function () {
        if (!$scope.form.$valid) {
            return;
        }
        const model = {
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
        return ajaxService.ajaxPost($rootScope.domain + "/api/Setting/AddOrUpdate", model).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.getSetting = function () {
        return ajaxService.ajaxGet($rootScope.domain + "/api/Setting/GetSetting").then(function (data) {
            if (data.status != 200)
                return;
            self.item = {
                ...data.data
            };
        });
    };
}]);


