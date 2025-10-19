app.controller('instalmentController', ['$rootScope', '$scope', '$routeParams', '$location', 'NgTableParams', 'ajaxService', function ($rootScope, $scope, $routeParams, $location, NgTableParams, ajaxService) {
    "use strict";
    var self = this;
    this.initializeController = function () {
        ajaxService.WhoseMenu();
        clearInterval(ajaxService.getCookie('timerId')); 

        self.paymentStates = paymentState.Labels;
    };
    self.tableParams = new NgTableParams($rootScope.tableParams["instalmentController_tableParams"] ||
    {
        page: 1,
        count: 15,
    },
        {
            filterDelay: 300,
            getData: function (params) {
                $rootScope.tableParams["instalmentController_tableParams"] = params._params;

                let url = "";
                if ($location.path().includes("/admin/instalments"))
                    url = $rootScope.domain + "/api/Instalment/GetAll";
                else if ($location.path().includes("/user/instalments"))
                    url = $rootScope.domain + "/api/Instalment/GetAllByUserId";

                return ajaxService.ajaxPaged(url, params._params).then(function (data) {
                    if (data.status != 200)
                        return;
                    params.total(data.data.count);
                    return data.data.items;
                });
            }
        });

    self.getPayLink = function (id, status) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/Instalment/GetPayLink/" + id + "/" + status).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
    self.getInstalmentPayLink = function (id) {
        return ajaxService.ajaxGet($rootScope.domain + "/api/Instalment/GetInstalmentPayLink/" + id).then(function (data) {
            if (data.status != 200)
                return;
            location.reload();
        });
    };
}]);


