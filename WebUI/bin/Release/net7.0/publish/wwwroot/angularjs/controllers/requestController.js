app.controller('requestController', ['$rootScope', '$scope', '$routeParams', '$location', 'NgTableParams', 'ajaxService', function ($rootScope, $scope, $routeParams, $location, NgTableParams, ajaxService) {
    "use strict";
    var self = this;

    self.fromWallet = false;

    var radWallet = document.getElementById('radWallet');
    var radGold = document.getElementById('radGold');

    var form = document.getElementsByName('form');
    var form1 = document.getElementsByName('form1');
    var form2 = document.getElementsByName('form2');

    this.initializeController = function () {
        ajaxService.WhoseMenu();
        clearInterval(ajaxService.getCookie('timerId')); 

        self.paymentStatuses = paymentStatus.Labels;
        self.requestTypes = requestType.Labels;
        self.paymentStates = paymentState.Labels;
    };
    self.tableParams = new NgTableParams($rootScope.tableParams["requestController_tableParams"] ||
    {
        page: 1,
        count: 15,
    },
        {
            filterDelay: 300,
            getData: function (params) {
                $rootScope.tableParams["requestController_tableParams"] = params._params;

                let url = "";
                if ($location.path().includes("/admin/requests"))
                    url = $rootScope.domain + "/api/Request/GetAll";
                else if ($location.path().includes("/user/requests"))
                    url = $rootScope.domain + "/api/Request/GetAllByUserId";

                return ajaxService.ajaxPaged(url, params._params).then(function (data) {
                    if (data.status != 200)
                        return;
                    params.total(data.data.count);
                    return data.data.items;
                });
            }
        });

    self.reset = function () {
        form[0].style.display = "block";
        form1[0].style.display = "none";
    };

    self.updateStatus = function (id, status) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/Request/UpdateStatus/" + id + "/" + status).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.getPayLink = function (id, status) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/Request/GetPayLink/" + id + "/" + status).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.calculate = function () {
        if (self.item.Amount == '' || self.item.Amount == undefined) {
            WarningMsg("ابتدا مقدار طلا به گرم را وارد کنید");
            return;
        }

        const model = {
            Amount: self.item.Amount,
            Type: radWallet.checked == true ? 0 : 1,
        }
        return ajaxService.ajaxPost($rootScope.domain + "/api/Request/Calculate", model).then(function (data) {
            if (data.status != 200)
                return;
            self.calculateAmount = data.data;
        });
    }
    self.addRequest = function () {
        if (self.item.Amount == '' || self.item.Amount == undefined) {
            WarningMsg("ابتدا مقدار طلا به گرم را وارد کنید");
            return;
        }

        const model = {
            Amount: self.item.Amount,
            Type: radWallet.checked == true ? 0 : 1,
        }
        return ajaxService.ajaxPost($rootScope.domain + "/api/Request/Add", model).then(function (data) {
            if (data.status != 200)
                return;
            WarningMsg("درخواست شما در صف انتظار تراکنش ها قرار گرفت");
            location.reload();
        });
    };
    self.changeStep = function (step) {

        if (radWallet.checked == true)
            self.fromWallet = true;
        else
            self.fromWallet = false;

        if (step == 2) {
            form[0].style.display = "none";
            form1[0].style.display = "block";
        }

        if (step == 3) {
            self.addRequest();
        }
    };
}]);


