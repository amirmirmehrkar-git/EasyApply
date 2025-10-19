app.controller('dashboardController', ['$scope', '$routeParams', '$rootScope', '$http', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;
        self.radTitle = 'مقدار طلا به تومان';
        self.item = {
            Value: '',
            IsInstalment: '',
            FromWallet: '',
            MonthCount: '',
            PrePayment: '',
        };
        self.warranty = {
            Id: '',
            Value: '',
            WarrantyType: '',
        };
        self.warranties = [];
        self.totalWarrantyAmount = 0

        var radWallet = document.getElementById('radWallet');
        var radCash = document.getElementById('radCash');
        var lblGoldValue = document.getElementById('lblGoldValue');

        var panelMoneyAndGram = document.getElementById('panelMoneyAndGram');
        var radMoney = document.getElementById('radMoney');
        var radGram = document.getElementById('radGram');

        var form = document.getElementsByName('form');
        var form1 = document.getElementsByName('form1');
        var form2 = document.getElementsByName('form2');

        var modal1 = document.getElementById('modal1');
        var modal2 = document.getElementById('modal2');

        let counter = 10;
        let timerId = null;
        self.initializeController = function () {
            ajaxService.WhoseMenu();

            self.warrantyTypes = warrantyType.Labels;
            self.allWarrantyTypes = warrantyType.Labels;

            getGoldAmount();
            startTimer();

            if ($location.path().includes("/admin/dashboard"))
                self.getAdminDashboard();
            else if ($location.path().includes("/user/dashboard"))
                self.getUserDashboard();
        };
        self.getAdminDashboard = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/User/GetAdminDashboard/").then(function (data) {
                if (data.status != 200)
                    return;
                self.goldValue = data.data.GoldValue;
                self.userCount = data.data.UserCount;
                self.newTicketCount = data.data.NewTicketCount;
                self.todayInstalment = data.data.TodayInstalment;
                self.todayProfits = data.data.TodayProfits;
                self.activeContractCount = data.data.ActiveContractCount;
                self.notPayedInstalmentCount = data.data.NotPayedInstalmentCount;
            });
        };
        self.getUserDashboard = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/User/GetUserDashboard/").then(function (data) {
                if (data.status != 200)
                    return;
                self.goldValue = data.data.GoldValue;

                self.walletCash = data.data.WalletCash;
                self.blockedWalletCash = data.data.BlockedWalletCash;

                self.walletGold = data.data.WalletGold;
                self.blockedWalletGold = data.data.BlockedWalletGold;

                self.partnership = data.data.Partnership;
                self.blockedPartnership = data.data.BlockedPartnership;

                self.todayInstalment = data.data.TodayInstalment;
                self.todayProfits = data.data.TodayProfits;
                self.totalNotPayedInstalment = data.data.TotalNotPayedInstalment;
                self.notPayedInstalmentCount = data.data.NotPayedInstalmentCount;
                self.nextInstalment = data.data.NextInstalment;
            });
        };

        function startTimer() {
            try {
                timerId = setInterval(() => {
                    document.cookie = "timerId=" + timerId;

                    try {
                        document.getElementById("counter").innerText = counter + ' ثانیه تا بروزرسانی قیمت ...';
                        document.getElementById("counter1").innerText = counter + ' ثانیه تا بروزرسانی قیمت ...';
                        document.getElementById("counter2").innerText = counter + ' ثانیه تا بروزرسانی قیمت ...';
                    } catch { }

                    if (counter === 1) {
                        getGoldAmount();

                        try {
                            if (self.item.Value == '' || self.item.Value == undefined) { }
                            else
                                self.calculate();

                        } catch { }
                    }

                    counter--;

                    if (counter < 1) {
                        counter = 10;
                    }
                }, 1000);
            } catch { }
        }
        function getGoldAmount() {
            return ajaxService.ajaxGet($rootScope.domain + "/api/User/GetGoldAmount/").then(function (data) {
                if (data.status != 200)
                    return;
                self.goldValue = data.data;
                lblGoldValue.style.display = 'block';
            });
        }

        self.calculate = function () {
            if (self.item.Value == '' || self.item.Value == undefined) {
                WarningMsg("ابتدا مقدار طلا به گرم را وارد کنید");
                return;
            }

            const model = {
                MonthCount: self.item.MonthCount,
                PrePayment: self.item.PrePayment,
                Value: self.item.Value,
                IsInstalment: self.item.IsInstalment,
                FromWallet: radWallet.checked == true ? true : false,
                IsGram: radGram.checked == true ? true : false,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Transaction/Calculate", model).then(function (data) {
                if (data.status != 200)
                    return;
                self.calculateTotalAmount = data.data.TotalAmount;
                self.calculateTotalGram = data.data.TotalGram;
                self.calculatePrePayment = data.data.PrePayment;
                self.calculateMonthCount = data.data.MonthCount;
                self.calculateEachMonthAmount = data.data.EachMonthAmount;
                self.calculateWarrantyAmount = data.data.WarrantyAmount;
            });
        };
        self.onClickCalculate = function () {
            self.calculate();

            modal1.classList.add("modal-lg");
            modal2.classList.add("modal-lg");
        };
        self.reset = function () {
            form[0].style.display = "block";
            form2[0].style.display = "none";
            form1[0].style.display = "none";
            panelMoneyAndGram.style.display = "none";

            modal1.classList.remove("modal-lg");
            modal2.classList.remove("modal-lg");

            self.warrantyTypes = warrantyType.Labels;
            self.warranties = [];
        }
        self.changeStep = function (step) {
            self.step = step;
            if (step == 2) {
                form[0].style.display = "none";
                panelMoneyAndGram.style.display = "block";

                if (self.item.IsInstalment) {
                    form2[0].style.display = "block";
                }
                else {
                    form1[0].style.display = "block";
                }
            }

            if (step == 3) {
                //نقدی

                const model = {
                    IsInstalment: self.item.IsInstalment,
                    FromWallet: radWallet.checked == true ? true : false,
                    Amount: self.calculateTotalAmount,
                    Value: self.item.Value,
                    IsInstalment: self.item.IsInstalment,
                    FromWallet: radWallet.checked == true ? true : false,
                    IsGram: radGram.checked == true ? true : false,
                }
                return ajaxService.ajaxPost($rootScope.domain + "/api/Transaction/AddTransaction", model).then(function (data) {
                    if (data.status != 200)
                        return;

                    document.cookie = "report=" + model;
                    $location.path('user/transactions');
                });
            }
            else if (step == 4) {
                //اقساط

                var warranties = self.warranties;

                const model = {
                    IsInstalment: self.item.IsInstalment,
                    FromWallet: radWallet.checked == true ? true : false,
                    Amount: self.calculateTotalAmount,
                    Value: self.item.Value,
                    MonthCount: self.calculateMonthCount,
                    PrePayment: self.item.PrePayment,
                    IsGram: radGram.checked == true ? true : false,
                    Warranties: warranties
                }
                return ajaxService.ajaxPost($rootScope.domain + "/api/Transaction/AddTransaction", model).then(function (data) {
                    if (data.status != 200)
                        return;

                    document.cookie = "report=" + model;
                    $location.path('user/transactions');
                });
            }
        };
        self.addWarranty = function () {
            if (self.warranty.WarrantyType == undefined || self.warranty.Value == undefined || self.warranty.Value == '') {
                WarningMsg("ابتدا مقادیر مورد نیاز را وارد کنید");
                return;
            }

            const model = {
                WarrantyType: self.warranty.WarrantyType,
                Value: self.warranty.Value,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Warranty/Calculate", model).then(function (data) {
                if (data.status != 200)
                    return;

                self.warranties.push({
                    Id: ajaxService.generateGUID(),
                    WarrantyType: self.warranty.WarrantyType,
                    Value: self.warranty.Value,
                    Amount: data.data
                });

                self.totalWarrantyAmount += data.data;

                self.warrantyTypes = self.warrantyTypes.filter(m => m.id != self.warranty.WarrantyType);
            });
        };
        self.deleteWarranty = function (id) {
            self.warranties = self.warranties.filter(m => m.Id != id);

            self.totalWarrantyAmount = self.warranties.reduce((acc, val) => acc + val.Amount, 0);
        };
    }]);
