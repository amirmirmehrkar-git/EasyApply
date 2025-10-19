app.controller('skillController', ['$scope', '$routeParams', '$rootScope', '$http', 'ajaxService', '$location', 'NgTableParams', 'Upload', '$timeout',
    function ($scope, $routeParams, $rootScope, $http, ajaxService, $location, NgTableParams, Upload, $timeout) {
        "use strict";
        var self = this;

        self.recording = false;
        self.status = 'آماده';
        self.blob = null;
        self.blobUrl = null;
        let mediaRecorder = null;
        let chunks = [];

        self.item = {
            Title: '',
            Value: '',
        };
        self.resetItem = function () {
            self.Id = undefined;
            self.item = {
                Title: '',
                Value: '',
            };
        };
        self.initializeController = function () {
            ajaxService.WhoseMenu();

            self.skillValues = skillValue;
        };

        self.tableParams = new NgTableParams($rootScope.tableParams["skillController_tableParams"] ||
        {
            page: 1,
            count: 15,
        },
            {
                filterDelay: 300,
                getData: function (params) {
                    $rootScope.tableParams["skillController_tableParams"] = params._params;

                    let url = $rootScope.domain + "/api/Skill/GetAllByUserId";

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
                Title: self.item.Title,
                Value: self.item.Value,
            }
            return ajaxService.ajaxPost($rootScope.domain + "/api/Skill/AddOrUpdate", model).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        }
        self.getRow = function (row) {
            self.Id = row.Id;
            self.item.Title = row.Title;
            self.item.Value = row.Value;
        };
        self.delete = function () {
            return ajaxService.ajaxGet($rootScope.domain + "/api/Skill/Delete/" + self.Id).then(function (data) {
                if (data.status != 200)
                    return;
                location.reload();
            });
        };
        self.getVoice = function () {

        };

        //
        self.start = async function () {
            self.status = 'در حال گرفتن دسترسی میکروفن...';
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                chunks = [];
                mediaRecorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
                mediaRecorder.onstop = () => {
                    self.blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                    self.blobUrl = URL.createObjectURL(self.blob);
                    self.status = `ضبط آماده — اندازه: ${formatBytes(self.blob.size)}`;
                    $scope.$apply();
                };
                mediaRecorder.start();
                self.recording = true;
                self.status = 'در حال ضبط...';
                $scope.$apply();
            } catch (err) {
                console.error(err);
                self.status = 'خطا در دسترسی به میکروفن';
                $scope.$apply();
            }
        };

        self.stop = function () {
            if (mediaRecorder && self.recording) { mediaRecorder.stop(); self.recording = false; }
        };

        self.send = async function () {
            if (!self.blob) { alert('فایل ضبط‌شده وجود ندارد'); return; }
            self.status = 'در حال ارسال به سرور...';
            const fd = new FormData();
            fd.append('audio', self.blob, `recording_${Date.now()}.webm`);
            try {
                // endpoint بک‌اند: /api/audio/process
                const resp = await $http.post('/api/Skill/process', fd, {
                    headers: { 'Content-Type': undefined }, // angular خودش boundary رو تنظیم میکنه
                    transformRequest: angular.identity
                });
                self.status = 'پاسخ سرور دریافت شد';
                // resp.data انتظار: JSON استخراج‌شده از ChatGPT
                console.log('server result', resp.data);
                alert('نتیجه: ' + JSON.stringify(resp.data));
            } catch (err) {
                console.error(err);
                self.status = 'خطا در ارسال';
                alert('خطا در ارسال: ' + (err.data || err.statusText || err));
            }
        };

        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
        }
        ///
    }]);
