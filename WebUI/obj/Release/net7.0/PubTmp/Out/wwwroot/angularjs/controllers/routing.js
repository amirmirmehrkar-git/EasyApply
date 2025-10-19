app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "/angularjs/templates/index.html?v=0.0.1"
        })
        .when("/index", {
            templateUrl: "/angularjs/templates/index.html?v=0.0.1"
        })
        .when("/signUp", {
            templateUrl: "/angularjs/templates/signUp.html?v=0.0.1"
        })
        .when("/checkCode", {
            templateUrl: "/angularjs/templates/checkCode.html?v=0.0.1"
        })

        //Start_Admin
        .when("/admin/dashboard", {
            templateUrl: "/angularjs/templates/admin/dashboard.html?v=0.0.1"
        })
        .when("/admin/admins", {
            templateUrl: "/angularjs/templates/admin/admins.html?v=0.0.1"
        })
        .when("/admin/users", {
            templateUrl: "/angularjs/templates/admin/users.html?v=0.0.1"
        })
        .when("/admin/requests", {
            templateUrl: "/angularjs/templates/admin/requests.html?v=0.0.1"
        })
        .when("/admin/instalments", {
            templateUrl: "/angularjs/templates/admin/instalments.html?v=0.0.1"
        })
        .when("/admin/transactions", {
            templateUrl: "/angularjs/templates/admin/transactions.html?v=0.0.1"
        })
        .when("/admin/partnerships", {
            templateUrl: "/angularjs/templates/admin/partnerships.html?v=0.0.1"
        })
        .when("/admin/profits", {
            templateUrl: "/angularjs/templates/admin/profits.html?v=0.0.1"
        })
        .when("/admin/settings", {
            templateUrl: "/angularjs/templates/admin/settings.html?v=0.0.1"
        })
        .when("/admin/tickets", {
            templateUrl: "/angularjs/templates/admin/tickets.html?v=0.0.1"
        })
        ///End_Admin

        //Start_User
        .when("/user/dashboard", {
            templateUrl: "/angularjs/templates/user/dashboard.html?v=0.0.1"
        })
        .when("/user/requests", {
            templateUrl: "/angularjs/templates/user/requests.html?v=0.0.1"
        })
        .when("/user/instalments", {
            templateUrl: "/angularjs/templates/user/instalments.html?v=0.0.1"
        })
        .when("/user/transactions", {
            templateUrl: "/angularjs/templates/user/transactions.html?v=0.0.1"
        })
        .when("/user/partnerships", {
            templateUrl: "/angularjs/templates/user/partnerships.html?v=0.0.1"
        })
        .when("/user/profits", {
            templateUrl: "/angularjs/templates/user/profits.html?v=0.0.1"
        })
        .when("/user/tickets", {
            templateUrl: "/angularjs/templates/user/tickets.html?v=0.0.1"
        })
        .when("/user/profile", {
            templateUrl: "/angularjs/templates/user/profile.html?v=0.0.1"
        })
    ///End_User
}]);