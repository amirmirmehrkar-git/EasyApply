app.controller('transactionController', ['$rootScope', '$scope', '$routeParams', '$location', 'NgTableParams', 'ajaxService', function ($rootScope, $scope, $routeParams, $location, NgTableParams, ajaxService) {
    "use strict";
    var self = this;
    self.warranties = [];
    self.totalWarrantyAmount = 0;
    this.initializeController = function () {
        ajaxService.WhoseMenu();
        clearInterval(ajaxService.getCookie('timerId')); 

        self.paymentStatuses = paymentStatus.Labels;
        self.paymentTypes = paymentType.Labels;
        self.paymentStates = paymentState.Labels;
        self.allWarrantyTypes = warrantyType.Labels;

        var report = ajaxService.getCookie('report');
        if (report != "null") {
            $('#reportModal').modal('show');
            document.cookie = "report=" + null;
        }
    };
    self.closeModal = function () {
        $('#reportModal').modal('hide');
    };
    self.tableParams = new NgTableParams($rootScope.tableParams["transactionController_tableParams"] ||
    {
        page: 1,
        count: 15,
    },
        {
            filterDelay: 300,
            getData: function (params) {
                $rootScope.tableParams["transactionController_tableParams"] = params._params;

                let url = "";
                if ($location.path().includes("/admin/transactions"))
                    url = $rootScope.domain + "/api/Transaction/GetAll";
                else if ($location.path().includes("/user/transactions"))
                    url = $rootScope.domain + "/api/Transaction/GetAllByUserId";

                return ajaxService.ajaxPaged(url, params._params).then(function (data) {
                    if (data.status != 200)
                        return;
                    params.total(data.data.count);
                    return data.data.items;
                });
            }
        });

    self.updateStatus = function (id, status) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/Transaction/UpdateStatus/" + id + "/" + status).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.getPayLink = function (id, status) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/Transaction/GetPayLink/" + id + "/" + status).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.cashToWallet = function () {
        if (!$scope.formCashToWallet.$valid) {
            return;
        }

        return ajaxService.ajaxGet($rootScope.domain + "/api/Transaction/CashToWallet/" + self.ToWalletAmount).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.getRow = function (row) {
        self.warranties = row.Warranties;

        self.totalWarrantyAmount = self.warranties.reduce((acc, val) => acc + val.Amount, 0);
    };
}]);


