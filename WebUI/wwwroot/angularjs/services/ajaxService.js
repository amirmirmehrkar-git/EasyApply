var ajaxServiceCancellers = {};
app.service('ajaxService', ['$rootScope', '$http', '$routeParams', '$location', '$q',
    function ($rootScope, $http, $routeParams, $location, $q) {
        "use strict";
        Object.keys(ajaxServiceCancellers).map(function (canceller) {
            canceller.resolve("user cancelled");
        })
        this.$routeParams = $routeParams;
        this.$location = $location;
        $http.defaults.headers.common['lang'] = 'fa';
        this.getCookie = function (cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        };
        this.generateGUID = function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };
        this.ToRial = function (str) {
            //str = str.replace(/\,/g, '');
            var objRegex = new RegExp('(-?[0-9]+)([0-9]{3})');
            while (objRegex.test(str)) {
                str = str.replace(objRegex, '$1,$2');
            }
            return str;
        };
        this.ajaxPost = function (route, data, successFunction, errorFunction) {
            $http.defaults.headers.common['Token'] = this.getCookie('Token');
            $http.defaults.headers.common['TokenId'] = this.getCookie('TokenId');
            return $http.post(route, data).then(function (data) {
                return data;
            }, function (response, failed) {
                console.log(response)
                if (response.status == 400 && response.data && response.data.Messages) {
                    response.data.Messages.forEach(function (msg) {
                        WarningMsg(msg);
                    });
                } else if (response.status == 401) {
                    ErrorMsg("اعتبار این نشست منقضی شده است، لطفا دوباره وارد شوید!");
                    self.authorize(self.$location.$path);
                }
                else if (response.status == 403) {
                    WarningMsg("شما مجوز انجام این درخواست را ندارید");
                } else if (response.status == 406)
                    WarningMsg("دو درخواست یکسان دریافت شد!");
                else
                    ErrorMsg("خطایی در اجرای درخواست شما رخ داده است.");
                return response;
            });
        }
        this.ajaxGet = function (route, successFunction, errorFunction) {
            $http.defaults.headers.common['Token'] = this.getCookie('Token');
            $http.defaults.headers.common['TokenId'] = this.getCookie('TokenId');
            self = this;
            return $http.get(route).then(function (data) {
                return data;
            }, function (response) {
                console.log(response)
                if (response.status == 400 && response.data && response.data.Messages) {
                    response.data.Messages.forEach(function (msg) {
                        WarningMsg(msg);
                    });
                }
                else if (response.status == 401) {
                    ErrorMsg("اعتبار این نشست منقضی شده است، لطفا دوباره وارد شوید!");
                    self.authorize(self.$location.$path);
                } else if (response.status == 403) {
                    WarningMsg("شما مجوز انجام این درخواست را ندارید");
                } else if (response.status == 406) {
                    WarningMsg("دو درخواست یکسان دریافت شد!");
                }
                else
                    ErrorMsg("خطایی در اجرای درخواست شما رخ داده است.");
                return response;
            });
        }
        this.ajaxPaged = function (route, params, successFunction, errorFunction) {
            $http.defaults.headers.common['Token'] = this.getCookie('Token');
            $http.defaults.headers.common['TokenId'] = this.getCookie('TokenId');
            let mapParams = params ? {
                pageSize: params.count,
                pageCount: params.page,
                sorting: params.sorting,
                filter: {}
            } : {
                pageSize: 100,
                pageCount: 1,
                sorting: {},
                filter: {}
            }
            if (mapParams && params)
                Object.keys(params.filter).forEach((val) => {
                    mapParams.filter[val] = [];
                    if (Array.isArray(params.filter[val]))
                        mapParams.filter[val] = params.filter[val];
                    else
                        mapParams.filter[val].push(params.filter[val]);
                });

            self = this;
            if (ajaxServiceCancellers[route]) {
                ajaxServiceCancellers[route].resolve("user cancelled");
            }
            ajaxServiceCancellers[route] = $q.defer();
            return $http.post(route, mapParams, { timeout: ajaxServiceCancellers[route].promise }).then(function (data) {
                return data;
            }, function (response) {
                console.log(response)
                if (response.status == 400 && response.data && response.data.Messages) {
                    response.data.Messages.forEach(function (msg) {
                        WarningMsg(msg);
                    });
                }
                else if (response.status == 401) {
                    ErrorMsg("اعتبار این نشست منقضی شده است، لطفا دوباره وارد شوید!");
                    self.authorize(self.$location.$path);
                } else if (response.status == 403) {
                    WarningMsg("شما مجوز انجام این درخواست را ندارید");
                }
                else if (response.status == 406) {
                    WarningMsg("دو درخواست یکسان دریافت شد!");
                } else if (response.status != -1)
                    ErrorMsg("خطایی در اجرای درخواست شما رخ داده است.");
                return response;
            });
        }
        this.authorize = function () {
            location.href = '/account?ReturnUrl=' + location.pathname;
        };
        this.showHideElement = function (id, displayName) {
            var elem = document.getElementById(id);
            if (elem != null) {
                elem.style.display = displayName;
            }
        };
        this.showAdminPage = function () {
            this.showHideElement("btnMenu", 'block');
        };
        this.showUserPage = function () {
            this.showHideElement("btnMenu", 'block');
        };
        this.showPublicPages = function () {
            this.showHideElement("btnMenu", 'none');
        };
        this.WhoseMenu = function () {
            if ($location.path().includes("/admin")) {
                this.showAdminPage();
            }
            else if ($location.path().includes("/user")) {
                this.showUserPage();
            }
            else {
                this.showPublicPages();
            }

            try {
                if (document.getElementById("sidebar").classList.contains("active")) {
                    document.getElementById("sidebar").classList.toggle("active");
                }
            } catch { }
        };
    }]);

