'use strict';

angular.module('checkedUpApp')
    .controller('DashboardCtrl', function ($scope, $stateParams, $sce, $window, $state, ModuleService, PatientService, $http, $timeout) {


        var videoPlayer = document.getElementById('video_player');
        var nextVideoPlayer = document.getElementById('video_player_next');
        var posterImage = 'images/video-placeholder.png';
        var poster= document.getElementById('poster');
        poster.src = posterImage;
        var autoPlayVideo = true;
        var autoPlay = true;
        var video = document.getElementById('video');
        var canvas = document.getElementById('canvas');
        var audio = document.getElementById('audio');
        var canPlayAudio = false;
        var framesPerSecond;
        var canPlay = false;
        var lastTime;
        var tryPlay = false;
        var videoBackgroundImage = document.getElementById('video_bg');
        var dashboardInnerContent = document.getElementById('dashboard_inner_content');
        var footer = document.getElementById("footer_steps");

        window.addEventListener("resize",function(){
            $scope.resizeDashboardElements();
        },false);

        if (audio) {
            paintPosterFrame();
            video.oncanplay = function() {
                canPlay = true;
            };
            audio.oncanplay = function() {
                canPlayAudio = true;
            };
            audio.addEventListener("click",function(){
                if(audio.paused){
                    $scope.playAudio();
                }
            });
            var ctx = canvas.getContext('2d');
            window.addEventListener("orientationchange",function(){
                if(tryPlay&&canPlay){
                    $scope.resizeDashboardElements(video);
                }else if(!tryPlay){
                    paintPosterFrame();
                }
            },false);
        }

        function loop() {
            var width = document.getElementById('content_dashboard').offsetWidth;
            var height = document.getElementById('content_dashboard').offsetHeight;
            setTimeout(function() {
                if(!$scope.isPaused){
                    // Whatever you want to do after the wait
                    var time = Date.now();
                    var elapsed = (time - lastTime) / 1000;


                    // render
                    if(elapsed >= ((1000/framesPerSecond)/1000)) {

                        video.currentTime = video.currentTime + elapsed;
                        $scope.resizeDashboardElements(video);
                        lastTime = time;
                    }

                    // if we are at the end of the video stop
                    var currentTime = (Math.round(parseFloat(video.currentTime)*10000)/10000);
                    var duration = (Math.round(parseFloat(video.duration)*10000)/10000);
                    if(currentTime >= duration) {
                        video.currentTime = 0;
                        if(autoPlayVideo){
                            $scope.setLoading(true);
                            $scope.$apply();
                        }
                        $scope.videoPlay();
                        $scope.nextVideo();
                        return;
                    }
                    window.requestAnimationFrame(loop);
                }else{
                    $scope.resizeDashboardElements(video);
                    return;
                }
            }, 30);
        };

        function loadNextVideo(){
            angular.forEach($scope.currentModule.slides, function(slide, key){
                if(slide.ordinality == $scope.currentVideo.ordinality+1){
                    nextVideoPlayer.src =  slide.primaryMedia;
                }
            });
        };

        function paintPosterFrame(){
            setTimeout(function(){
                $scope.resizeDashboardElements(poster);
            },30);
        };

        $scope.showPlay = function(){
            return false;
        };

        $scope.showVideo = true;
        $scope.video_player_icon = "play_arrow";
        $scope.videoUrl ='';
        $scope.mp3 = '';
        $scope.loadingVideo = false; //iphone
        $scope.isPaused = true;
        $scope.isInIphone = false;
        $scope.videoLoaded = false; //html5

        videoPlayer.oncanplay = function () {
            $scope.videoLoaded = true;
        };

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.runNext = function(){
            video.currentTime = 0;
            var uri = $scope.currentVideo.primaryMedia;
            if(audio){
                if(uri){
                    video.src = uri;
                    audio.src = uri.split('.mp4')[0] + '.mp3';
                }
            }
            canPlay = false;
            canPlayAudio = false;
            tryPlay = false;
            $scope.videoPresent();
            if (document.getElementById('icon').getAttribute('icon') == "pause") {
                $scope.videoPlay();
            }else{
                $scope.setLoading(true);
                canPlay = false;
                canPlayAudio = false;
                $scope.isPaused = true;
                poster.src = posterImage;
                paintPosterFrame();
                $scope.$apply();
            };
            video.oncanplay = function() {
                canPlay = true;
            };
            audio.oncanplay = function() {
                canPlayAudio = true;
            };
            $rootScope.getAudioReady();
        };

        $scope.runPrev = function(){
            video.currentTime = 0;
            var uri = $scope.currentVideo.primaryMedia;
            if(audio){
                if(uri){
                    video.src =  uri;
                    audio.src =  uri.split('.mp4')[0] + '.mp3';
                }
            }
            canPlay = false;
            canPlayAudio = false;
            tryPlay = false;
            $scope.videoPresent();
            if (document.getElementById('icon').getAttribute('icon') == "pause") {
                $scope.videoPlay();
            }else{
                $scope.setLoading(true);
                canPlay = false;
            canPlayAudio = false;
                $scope.isPaused = true;
                poster.src = posterImage;
                paintPosterFrame();
                $scope.$apply();
            };
            video.oncanplay = function() {
                canPlay = true;
            };
            audio.oncanplay = function() {
                canPlayAudio = true;
            };
            $rootScope.getAudioReady();
        };

        $scope.videoPresent = function(){
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            audio = document.getElementById('audio');
            videoPlayer = document.getElementById('video_player');
            ctx = canvas.getContext('2d');
            framesPerSecond = 24;
        };

        //video stuff
        $scope.videoPlay = function(){
            if($scope.isInIphone){
                if($scope.isPaused){
                    poster.src = '';
                    $scope.video_player_icon = "pause";
                    setTimeout(function(){
                        $scope.resizeDashboardElements(video);
                    },30);
                    setTimeout(function() {
                        if(!tryPlay){
                            //begin loading
                            video.load();
                            video.currentTime-=10;
                            tryPlay = true;
                            $scope.loadAudio();
                        }
                    }, 30);
                    $scope.setLoading(true);
                    setTimeout(function() {
                        if(!canPlay || !canPlayAudio){
                            $scope.setLoading(true);
                            $scope.videoPlay();
                            audio = document.getElementById('audio');
                            if(!audio.isPaused){
                                audio.pause();
                            }
                            return;
                        }else{
                            $scope.setLoading(false);
                            $scope.$apply();
                            lastTime = Date.now();
                            loop();
                            audio.click();
                            $scope.isPaused = false;
                            $scope.video_player_icon = "pause";
                        }
                    }, 800);
                }else{
                    audio.pause();
                    $scope.isPaused = true;
                    $scope.video_player_icon = "play_arrow";
                }
            }else{
                $scope.toogleVideoPlayer();
            }
        };

        $scope.setLoading = function(loadingBoolean){
            $scope.loadingVideo = loadingBoolean;
        };

        $scope.playAudio = function(){
            if(audio){
                if(audio.paused){
                    audio.play();
                }
                setTimeout(function() {
                    if(audio.paused){
                        $scope.playAudio();
                        return;
                    }
                }, 200);
            }
        };



        $scope.init = function () {
            $scope.videoLoaded = false;
            $scope.resizeDashboardElements();
            var userAgent = window.navigator.userAgent;
            if (userAgent.match(/iPhone/i)) {
                $scope.isInIphone = true;
            }
            if ($stateParams.id) {
                $scope.currentModule = ModuleService.getModule($stateParams.id);
                if($scope.currentModule.currentVideo == $scope.currentModule.slides.length){
                    $state.go('questions',{
                        id:$stateParams.id
                    });
                }
                ModuleService.setCurrentModule($scope.currentModule);
                $scope.currentVideo = ModuleService.getCurrentVideo();
            }
            try{
                var uri = $scope.currentVideo.primaryMedia;
                if(uri){
                    videoPlayer.src = uri;
                    if (audio) {
                        video.src =  uri;
                        audio.src =  uri.split('.mp4')[0] + '.mp3';
                        $scope.loadAudio();
                    }
                    videoPlayer.load();
                    $scope.videoLoaded = false;
                }
                videoPlayer.addEventListener('ended', $scope.nextVideo, false);
                loadNextVideo();
                if(autoPlay){
                    $scope.videoPlay();
                }
            }catch(error){
                $state.go('questions',{
                    id:$stateParams.id
                });
            }

        };

        $scope.loadAudio = function(){
            audio.load();
            audio.play();
            audio.pause();
        }

        $scope.nextVideoIphone = function(){
            setTimeout(function() {
                if(autoPlay){
                    $scope.setLoading(true);
                    $scope.$apply();
                    $scope.videoPlay();
                }else{
                    if(!$scope.isPaused){
                        $scope.setLoading(true);
                        $scope.$apply();
                        $scope.videoPlay();
                    }
                }
                $scope.runNext();
            }, 30);

        };

        $scope.prevVideoIphone = function(){
            setTimeout(function() {
                if(autoPlay){
                    $scope.setLoading(true);
                    $scope.$apply();
                    $scope.videoPlay();

                }else{
                    if(!$scope.isPaused){
                        $scope.setLoading(true);
                        $scope.$apply();
                        $scope.videoPlay();
                    }
                }
                $scope.runPrev();
            }, 30);
        };

        $scope.nextVideo = function(){
            var mod = ModuleService.nextVideo();
            if (mod) {
                var isThereAnswers = ModuleService.hasAnswers(mod.id);
                if($scope.isInIphone && !$scope.isPaused){
                    $scope.videoPlay();
                }
                if(isThereAnswers){
                   $state.go('questions', {
                        id:mod.id
                    });
                }else{
                    //COMPLETE THE MODULE AND GO TO THE NEXT ONE.
                    PatientService.completeModule(mod).then(
                        function(response){

                        }, function(error){

                        });
                    $scope.goNextModule();
                }
                return;
            };
            $scope.currentVideo = ModuleService.getCurrentVideo();
            if($scope.isInIphone){
                $scope.nextVideoIphone();
            }else{
                var uri = $scope.currentVideo.primaryMedia;
                if(uri){
                    videoPlayer.src = uri;
                    videoPlayer.load();
                }
                tryPlay = false;
                if(autoPlay){
                    $scope.clickOnVideo();
                }else{
                    if(!$scope.isPaused){
                        $scope.clickOnVideo();
                    }
                }
                videoPlayer.oncanplay = function () {
                    $scope.videoLoaded = true;
                };
            }

            $scope.currentModule = ModuleService.getCurrentModule();
            angular.forEach($scope.currentModule.slides, function(slide, key){
                if(slide.ordinality == $scope.currentVideo.ordinality+1){
                    nextVideoPlayer.src = slide.primaryMedia;
                }
            });

        };

        $scope.goNextModule = function(){
            var modules = ModuleService.getModules();
            var moreModules = false;
            var stateToGo;
            angular.forEach(modules, function(module, key){
                if(module.id == $stateParams.id){
                    if(key + 1 < modules.length){
                        stateToGo = modules[key+1].id;
                        moreModules = true;
                    }
                }
            });
            if(moreModules){
                $state.go('module', {
                    id:stateToGo
                });
            }else{
                ModuleService.init();
                $state.go('summary');
            }
            $scope.$emit(
                'toastBottom',
                'Module '+ModuleService.getModule($stateParams.id).ordinality+' Completed!',
                document.getElementById("dashboard_section")
            );
        };

        $scope.clickOnVideo = function () {
            $timeout(function() {
                if($scope.isInIphone){
                    videoPlayer.click();
                }else{
                    $scope.toogleVideoPlayer();
                }
            }, 100);
        };

        $scope.prevVideo = function(){
            $scope.currentVideo = ModuleService.getCurrentVideo();
            if($scope.currentVideo.ordinality == 1){
                if($scope.isInIphone && !$scope.isPaused){
                    $scope.videoPlay();
                }
                $scope.goPrevModule();
            }else{
                ModuleService.prevVideo();
                $scope.currentVideo = ModuleService.getCurrentVideo();
                if($scope.isInIphone){
                    $scope.prevVideoIphone();
                }else{
                    var uri = $scope.currentVideo.primaryMedia;
                    if(uri){
                        videoPlayer.src = uri;
                        videoPlayer.load();
                    }
                    tryPlay = false;
                    if(autoPlay){
                        $scope.clickOnVideo();
                    }else{
                        if(!$scope.isPaused){
                            $scope.clickOnVideo();
                        }
                    }
                    videoPlayer.oncanplay = function () {
                        $scope.videoLoaded = true;
                    };
                }
            }
        };

        $scope.toogleVideoPlayer = function() {
            var videoPlayer = document.getElementById('video_player');
            $scope.resizeDashboardElements();
            if (videoPlayer.paused){
                setTimeout(function() {
                    if(!tryPlay&&!$scope.videoLoaded){
                        tryPlay = true;
                        $scope.videoLoaded = false;
                        videoPlayer.currentTime-=10;
                        $scope.video_player_icon = "pause";
                        $scope.$apply();
                        $scope.toogleVideoPlayer();
                        return;
                    }else{
                        $scope.$apply();
                    }
                },100);
                $scope.video_player_icon = "pause";
                setTimeout(function(){
                    if(!$scope.videoLoaded){
                        $scope.$apply();
                        $scope.toogleVideoPlayer();
                        return;
                    }else{
                        $scope.video_player_icon = "pause";
                        $scope.isPaused = false;
                        videoPlayer.play();
                        $scope.$apply();
                    }

                },100);
            }else{
                $scope.video_player_icon = "play_arrow";
                $scope.isPaused = true;
                videoPlayer.pause();
            }
        };

        $scope.showLoading = function(){
            if($scope.isInIphone){
                return $scope.loadingVideo;
            }else{
                return (!$scope.videoLoaded && tryPlay);
            }
        };

        $scope.resizeDashboardElements = function(picture) {
            var margin = 15;
            var ratio = 1.4545;
            var backgroundRatio = 2.4;
            var expandRatio = 1.5;

            var contentDashboard = document.getElementById('content_dashboard');
            var dashboardSection = document.getElementById('dashboard_section');

            if (contentDashboard && dashboardSection) {

                var headerFooterHeight = document.getElementById('footer_steps').offsetParent === null ? 71 : 142;

                var parentWidth = contentDashboard.clientWidth - (margin * 2);
                var parentHeight = dashboardSection.clientHeight - headerFooterHeight - margin;


                if (parentWidth > parentHeight) {

                    var videoWidth = Math.min(Math.round(parentHeight * 1.4545), parentWidth);
                    var videoHeight = Math.round((videoWidth / ratio ));

                    dashboardInnerContent.style.width = videoWidth + "px";
                    dashboardInnerContent.style.height = videoHeight + "px";
                    dashboardInnerContent.style.left = "50%";
                    dashboardInnerContent.style.marginLeft = -Math.round(videoWidth / 2) + "px";

                    var imageWidth = Math.round((videoHeight + margin) * backgroundRatio);
                    videoBackgroundImage.style.height = (videoHeight + margin) + "px";
                    videoBackgroundImage.style.width = imageWidth + "px";
                    videoBackgroundImage.style.left = "50%";
                    videoBackgroundImage.style.marginLeft = -Math.round(imageWidth / 2) + "px";

                    if (parentHeight > videoHeight) {
                        footer.style.paddingBottom = (parentHeight - videoHeight) + "px";
                    } else {
                        footer.style.paddingBottom = 0 + "px";
                    }

                    if (canvas) {
                        canvas.width = videoWidth * expandRatio;
                        canvas.height = videoHeight * expandRatio;
                        if (picture) {
                            ctx.drawImage(picture, 0, 0, videoWidth* expandRatio, videoHeight* expandRatio);
                        }
                    }

                } else {

                    var videoWidth = parentWidth;
                    var videoHeight = Math.round((videoWidth / ratio ));

                    dashboardInnerContent.style.width = videoWidth + "px";
                    dashboardInnerContent.style.height = videoHeight + "px";
                    dashboardInnerContent.style.left = "50%";
                    dashboardInnerContent.style.marginLeft = -Math.round((parentWidth) / 2) + "px";

                    var imageWidth = Math.round((videoHeight + margin) * backgroundRatio);
                    videoBackgroundImage.style.height = (videoHeight + margin) + "px";
                    videoBackgroundImage.style.width = imageWidth + "px";
                    videoBackgroundImage.style.left = "50%";
                    videoBackgroundImage.style.marginLeft = -Math.round(imageWidth / 2) + "px";


                    if (parentHeight > videoHeight) {
                        footer.style.paddingBottom = (parentHeight - videoHeight) + "px";
                    } else {
                        footer.style.paddingBottom = 0 + "px";
                    }

                    if (canvas) {
                        canvas.width = videoWidth * expandRatio;
                        canvas.height = videoHeight * expandRatio;

                        if (picture) {
                            ctx.drawImage(picture, 0, 0, videoWidth* expandRatio, videoHeight* expandRatio);
                        }
                    }
                }


                return true;
            }
        };

        $scope.goPrevModule = function () {
            var modules = ModuleService.getModules();
            var moreModulesBefore = false;
            var stateToGo;
            angular.forEach(modules, function (module, key) {
                if (module.id == $stateParams.id) {
                    if (key > 0) {
                        stateToGo = modules[key - 1].id;
                        moreModulesBefore = true;
                    }
                }
            });
            if (moreModulesBefore) {
                var moduleToGo = ModuleService.getModule(stateToGo);
                var isThereAnswers = ModuleService.hasAnswers(stateToGo);
                if(!isThereAnswers){
                    ModuleService.setCurrentModule(moduleToGo);
                    ModuleService.prevVideo();
                }
                $state.go('module', {
                    id: stateToGo
                });

            } else {
                $scope.$emit(
                    'toastBottom',
                    'There isn\'t previous module.'
                );
            }
        };
    });
