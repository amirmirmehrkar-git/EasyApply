app.controller('partnershipController', ['$rootScope', '$scope', '$routeParams', '$location', 'NgTableParams', 'ajaxService', function ($rootScope, $scope, $routeParams, $location, NgTableParams, ajaxService) {
    "use strict";
    var self = this;
    self.radTitle = 'مقدار به تومان';

    var radMoney = document.getElementById('radMoney');
    var radGold = document.getElementById('radGold');
    var panelPayProfitType = document.getElementById('panelPayProfitType');
    var txtValue = document.getElementById('txtValue');

    this.initializeController = function () {
        ajaxService.WhoseMenu();
        clearInterval(ajaxService.getCookie('timerId'));
        self.partnershipSources = partnershipSource.Labels;
        self.payProfitTypes = payProfitType.Labels;

        self.paymentStatuses = paymentStatus.Labels;
        self.paymentStates = paymentState.Labels;
    };
    self.changeSource = function () {
        txtValue.style.display = 'block';

        if (self.item.Source == 2)
            panelPayProfitType.style.display = 'none';
        else if (self.item.Source == 0) {
            panelPayProfitType.style.display = 'block';
            self.radTitle = 'مقدار به تومان';
        }
        else if (self.item.Source == 1) {
            panelPayProfitType.style.display = 'block';
            self.radTitle = 'مقدار به گرم';
        }
    };
    self.tableParams = new NgTableParams($rootScope.tableParams["partnershipController_tableParams"] ||
    {
        page: 1,
        count: 15,
    },
        {
            filterDelay: 300,
            getData: function (params) {
                $rootScope.tableParams["partnershipController_tableParams"] = params._params;

                let url = "";
                if ($location.path().includes("/admin/partnerships"))
                    url = $rootScope.domain + "/api/PartnerShip/GetAll";
                else if ($location.path().includes("/admin/profits"))
                    url = $rootScope.domain + "/api/PartnerShip/GetAllProfit";
                else if ($location.path().includes("/user/partnerships"))
                    url = $rootScope.domain + "/api/PartnerShip/GetAllByUserId";
                else if ($location.path().includes("/user/profits"))
                    url = $rootScope.domain + "/api/PartnerShip/GetAllProfitsByUserId";

                return ajaxService.ajaxPaged(url, params._params).then(function (data) {
                    if (data.status != 200)
                        return;
                    params.total(data.data.count);
                    return data.data.items;
                });
            }
        });

    self.addPartnership = function () {
        const model = {
            Value: self.item.Value,
            ProfitPercent: self.item.ProfitPercent,
            MonthCount: self.item.MonthCount,
            Source: self.item.Source,
            PayProfitType: radMoney.checked ? 0 : 1,
        }
        return ajaxService.ajaxPost($rootScope.domain + "/api/Partnership/AddPartnership", model).then(function (data) {
            if (data.status != 200)
                return;
            WarningMsg("درخواست شما در صف انتظار مضاربه ها قرار گرفت");
            location.reload();
        });
    };
    self.calculate = function () {
        if (self.item.Value == '' || self.item.Value == undefined) {
            WarningMsg("ابتدا مقدار مبلغ به تومان را وارد کنید");
            return;
        }

        const model = {
            ProfitPercent: self.item.ProfitPercent,
            Value: self.item.Value,
            MonthCount: self.item.MonthCount,
            Source: self.item.Source,
            PayProfitType: radMoney.checked ? 0 : 1,
        }
        return ajaxService.ajaxPost($rootScope.domain + "/api/PartnerShip/Calculate", model).then(function (data) {
            if (data.status != 200)
                return;
            self.calculateAmount = data.data.Amount;
            self.calculateMonthCount = data.data.MonthCount;
            self.calculateEachMonthAmount = data.data.EachMonthAmount;
            self.calculatePayProfitType = data.data.PayProfitType;
        });
    };
    self.updateStatus = function (id, status) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/PartnerShip/UpdateStatus/" + id + "/" + status).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.getPayLink = function (id, status) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/PartnerShip/GetPayLink/" + id + "/" + status).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.getProfitPayLink = function (id) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/PartnerShip/GetProfitPayLink/" + id).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.downloadContract = function (id) {
        window.open($rootScope.domain + "/DownloadContract?Id=" + id, '_blank');
    };
}]);


