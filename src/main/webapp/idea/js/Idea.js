;!function(){
	var Idea = {};
	
	//模块化
	Idea.Model = {};
	Idea.Model.define = _define;
	Idea.Model.exists = [];
	
	function _define(modelName,callBack){
		var tempArray = modelName.split('.'),
			root = window;
		for(var i = 0; i < tempArray.length; i++){
			root = root[tempArray[i]] = root[tempArray[i]] || {};
		}
		
		callBack(root);
		Idea.Model.exists.push({model : root,executed : false,name:modelName});
		return root;
	};
	
	//Page
	Idea.Page = {};
	Idea.Page.forward = _forward;
	
	function _forward(uri){
		if($.trim(uri)){
			Idea.UI.loading();
			
			_updateMenueActive(uri);
			
			//清空当前模块
			_cleanUnUseModels();
			var oldChange = window['onhashchange'];
			window['onhashchange'] = null;
			
			window.location.hash = '#!' + uri;
			$('#idea_mainContent').load(uri,function(){
				window['onhashchange'] = oldChange;
				Idea.UI.loadingClose();
				//执行各模块的初始化方法
				_executeModelsReady();
			});
		}
	};
	
	Idea.Page.goHome = function(){
		Idea.Page.forward('home/page/home.html');
	};
	
	function _executeModelsReady(){
		var models = Idea.Model.exists;
		var model = null;
		for(var i = 0; i < models.length; i++){
			model = models[i];
			if(!model.executed && typeof model.model['ready'] === 'function'){
				model.model['ready']();
				model.executed = true;
			}
		}
	};
	
	function _cleanUnUseModels(){
		var models = Idea.Model.exists;
		var model = null;
		for(var i = 0; i < models.length; i++){
			model = models[i];
			if(model.executed){
			    if(typeof model.model['exit'] === 'function'){
			    	model.model['exit']();
			    }
			    
			    Idea.Model.exists.splice(i,1);
			    
			    eval(model.name + ' = null');
			    console.log('remove model ' + model.name);
			}
		}
	};
	
	
	
	//核心模块
	Idea.Core = {};
	Idea.Core.sessionRequest = [];
	Idea.Core.ajax = function(option){
		if(option.loading !== false){
			Idea.UI.loading();
		}
		
		var op = {
			type        : 'GET',
			dataType    : "JSON",
			contentType : "application/json"
		};
		$.extend(true,op,option);
		if(op.type === 'POST'){
			op.data = JSON.stringify(option.data);
		}
		
		op.success = function(response){
			if(response.status == '401'){
				Idea.Core.sessionRequest.push(option);
				//没有登录
				_ajaxPop(response);
			}else if(response.status == '403'){
				//没有权限
				_ajaxPop(response);
			}else{
				option.success(response);
			}
		};
		
		op.complete = function(response){
			Idea.UI.loadingClose();
			if(typeof option.complete === 'function'){
				option.complete(response);
			}
		};
		
		$.ajax(op);
	};
	
	function _ajaxPop(response){
		var option = {
			    text  : response.messageKey
		};
		if(response.status == '401'){
			//session
			option.title = '请登录';
			Idea.UI.loginPop(option);
		}else if(response.status == '403'){
			//没有权限
			option.title = '没有权限';
			Idea.UI.premissionPop(option);
		}else{
			//系统未知异常
			option.title = '系统未知异常';
			Idea.UI.commonPop(option);
		}
		
	};
	
	Idea.UI = {};
	Idea.UI.loginPop = function(userOption){
		var defaultOption = {
			width : 600,
			height: 350
		}
		
		var option = $.extend(true,{},defaultOption,userOption);
		var $body = $(document.body);
		var $pop = $body.find('#app-pop');
		if($pop.length === 0){
			var popHtml = [];
			popHtml.push('<div id="app-pop" class="app-pop">');
			
			popHtml.push('<div class="app-pop-head">');
			popHtml.push('<span class="pop-head-label">'+(option.title || '')+'</span>');
			popHtml.push('<span class="pop-head-close"></span>');
			popHtml.push('</div>');
			
			popHtml.push('<div class="app-pop-body">');
			popHtml.push('<ul>');
			popHtml.push('<li class="app-pop-item"><input class="pop-input pop-name" placeholder="用户名"/><span class="login-in-icon login-icon-name"></span></li>');
			popHtml.push('<li class="app-pop-item"><input class="pop-input pop-pass" type="password" placeholder="密码"/><span class="login-in-icon login-icon-pass"></span></li>');
			popHtml.push('</ul>');
			popHtml.push('</div>');
			
			popHtml.push('<div class="app-pop-foot">');
			popHtml.push('<span class="login-error"></span>');
			popHtml.push('<span class="app-login">登录</span>');
			popHtml.push('<span class="app-regist">立即注册</span>');
			popHtml.push('</div>');
			
			popHtml.push('</div>')
			$pop = $(popHtml.join('')).appendTo($body);
			
			
			$pop.delegate('.pop-head-close','click',function(){
				$pop.addClass('app-hiden');
				$('#app-layer').addClass('app-hiden');
			});
			
			$pop.delegate('.pop-input','focus',function(){
				var $this = $(this);
				var $span = $this.parent().find('.login-in-icon');
				if($span.hasClass('login-icon-name')){
					$span.addClass('login-name-active');
				}else if($span.hasClass('login-icon-pass')){
					$span.addClass('login-pass-active');
				}
			});
			
			$pop.delegate('.pop-input','blur',function(){
				var $this = $(this);
				var $span = $this.parent().find('.login-in-icon');
				if($span.hasClass('login-icon-name')){
					$span.removeClass('login-name-active');
				}else if($span.hasClass('login-icon-pass')){
					$span.removeClass('login-pass-active');
				}
			});
			
			$pop.delegate('.app-login','click',function(){
				var $this = $(this);
				var name = $('#app-pop').find('.pop-name').val();
				var pass = $('#app-pop').find('.pop-pass').val();
				console.log('name : ' + name + ' pass : ' + pass);
				
				App.Core.ajax({
					type   : 'POST',
					url    : 'services/bi/premission/login',
					data   : {account:name,password:pass},
					success : function(response){
						if(response.status != 0){
							$pop.find('.login-error').html(response.messageKey);
						}else{
							Idea.UI.initLogin(response);
							$pop.find('.pop-head-close').click();
						}
						
						var needOptions = Idea.Core.sessionRequest;
						for(var i = 0; i<needOptions.length; i++){
							Idea.Core.ajax(needOptions[i]);
						}
						
						Idea.Core.sessionRequest = [];
						return true;
					}
				});
				
			});
			
			$(document).keyup(function(e){
				if(e.keyCode === 13){
					$('#app-pop').find('.app-login').click();
				}
			});
			
			$pop.delegate('.app-regist','click',function(){
				var $this = $(this);
				$('#app-pop').find('.pop-head-close').click();
				App.Page.forward('user/page/regist.html');
			});
		}
		$pop.hide();
		$pop.css({
			'margin-left' : -option.width / 2,
			'margin-top' : -option.height / 2
		});
		
		
		
		$('#app-layer').removeClass('app-hiden');
		$pop.show().removeClass('app-hiden');
		
		return $pop;
	};
	
	Idea.UI.premissionPop = function(userOption){
		var defaultOption = {
			width : 600,
			height: 350
		}
		
		var option = $.extend(true,{},defaultOption,userOption);
		var $body = $(document.body);
		var $pop = $body.find('#app-pop-premission');
		if($pop.length === 0){
			var popHtml = [];
			popHtml.push('<div id="app-pop-premission" class="app-pop">');
			
			popHtml.push('<div class="app-pop-head">');
			popHtml.push('<span class="pop-head-label">'+(option.title || '')+'</span>');
			popHtml.push('<span class="pop-head-close"></span>');
			popHtml.push('</div>');
			
			popHtml.push('<div class="app-pop-body">');
			popHtml.push('<ul>');
			popHtml.push('</ul>');
			popHtml.push('</div>');
			
			popHtml.push('<div class="app-pop-foot">');
			popHtml.push('<span class="app-login">申请权限</span>');
			popHtml.push('</div>');
			
			popHtml.push('</div>')
			$pop = $(popHtml.join('')).appendTo($body);
			
			
			$pop.delegate('.pop-head-close','click',function(){
				$pop.addClass('app-hiden');
				$('#app-layer').addClass('app-hiden');
			});
			
			
			
		}
		$pop.hide();
		$pop.css({
			'margin-left' : -option.width / 2,
			'margin-top' : -option.height / 2
		});
		
		
		
		$('#app-layer').removeClass('app-hiden');
		$pop.show().removeClass('app-hiden');
		
		return $pop;
	};
	
	Idea.UI.commonPop = function(userOption){
		var defaultOption = {
			width : 600,
			height: 350
		}
		
		var option = $.extend(true,{},defaultOption,userOption);
		var $body = $(document.body);
		var $pop = $body.find('#app-pop-common');
		if($pop.length === 0){
			var popHtml = [];
			popHtml.push('<div id="app-pop-common" class="app-pop">');
			
			popHtml.push('<div class="app-pop-head">');
			popHtml.push('<span class="pop-head-label">'+(option.title || '')+'</span>');
			popHtml.push('<span class="pop-head-close"></span>');
			popHtml.push('</div>');
			
			popHtml.push('<div class="app-pop-body">');
			popHtml.push('<ul>');
			popHtml.push('</ul>');
			popHtml.push('</div>');
			
			popHtml.push('<div class="app-pop-foot">');
			popHtml.push('<span class="app-login">申请权限</span>');
			popHtml.push('</div>');
			
			popHtml.push('</div>')
			$pop = $(popHtml.join('')).appendTo($body);
			
			
			$pop.delegate('.pop-head-close','click',function(){
				$pop.addClass('app-hiden');
				$('#app-layer').addClass('app-hiden');
			});
			
			
			
		}
		$pop.hide();
		$pop.css({
			'margin-left' : -option.width / 2,
			'margin-top' : -option.height / 2
		});
		
		
		
		$('#app-layer').removeClass('app-hiden');
		$pop.show();
		
		return $pop;
	};
	
	Idea.UI.loading = function(){
		var $loading = $(document.body).find('#app-loading');
		if($loading.length === 0){
			$loading = $('<div id="app-loading" class="app-loading"></div>').appendTo($(document.body));
		}
		$loading.removeClass('app-hiden');
	};
	
	Idea.UI.loadingClose = function(){
		setTimeout(function(){
			var $loading = $(document.body).find('#app-loading');
			$loading.addClass('app-hiden');
		},150)
	};
	
	Idea.UI.initLogin = function(response){
		var $nav = $('.app-nav');
		var $user = $nav.find('.user-zoom');
		if($user.length === 0){
			$user = $('<div class="user-zoom"></div>').appendTo($nav);
			$user.hide();
			var userIcon = AppVO.appPath +'/user/images/no_user.png';
			$user.append('<span class="user-icon"><img class="user-img" src="'+userIcon +'"></img></span>');
			$user.append('<span class="user-name">游客</span>');
			$user.append('<span class="user-logout app-off">登录</span>');
			$user.show();
			
			$('.user-zoom').delegate('.user-logout','click',function(){
				var $this = $(this);
				if($this.hasClass('app-off')){
					//登录
					var option = {};
					option.title = '请登录';
					App.UI.loginPop(option);
					$this.removeClass('app-off').addClass('app-on');
				}else{
					//登出
					App.Core.ajax({
						url    : 'services/bi/system/logOut',
						success : function(response){
							$user.empty();
							var userIcon = AppVO.appPath +'/user/images/no_user.png';
							$user.append('<span class="user-icon"><img class="user-img" src="'+userIcon +'"></img></span>');
							$user.append('<span class="user-name">游客</span>');
							$user.append('<span class="user-logout app-off">登录</span>');
							App.Page.goHome();
						}
					});
				}
			});
		}
		
		if(response){
			window['AppVO'] = response.data;
		}
			
		if(AppVO && AppVO.user){
			var user = AppVO.user;
			$user.hide();
			var userIcon = null;
			if(user.icon){
				userIcon = AppVO.appPath +'/user/images/' +  user.icon;
			}else{
				userIcon = AppVO.appPath +'/user/images/no_user.png';
			}
			$user.find('.user-icon').find('.user-img').attr('src' , userIcon);
			$user.find('.user-name').html('您好,' + AppVO.user.account);
			$user.find('.user-logout').html('退出').removeClass('app-off').addClass('app-on');
			$user.show();
		}
	};
	
	function _updateMenueActive(url){
		debugger;
		setTimeout(function(){
			var $menues = $('#idea_nav').find('.nav_item');
			var $item = null,
			nodeData = null;
			for(var i = 0; i < $menues.length; i++){
				$item = $($menues[i]);
				nodeData = $item.data('value');
				if(isInNode(nodeData,url)){
					$item.addClass('active').siblings().removeClass('active');
					return;
				}
			}
		},26);
	};
	
	function isInNode(node,url){
		if(node.url === url){
			return true;
		}
		
		var children = node.children || [];
		for(var i = 0; i < children.length; i++){
			if(isInNode(children[i],url)){
				return true;
			}
		}
		
		return false;
	};
	
	/****   工具 *******/
	window['Idea'] = Idea;
}();

(function(){
	//检测URL的哈希改变
	if('onhashchange' in window){
		window.onhashchange = _onHashChange;
	}else{
		$(document.click(function(e){
		}))
	};
	
	function _onHashChange(){
		var uri = window.location.hash.slice(2);
		Idea.Page.forward(uri);
	};
})();