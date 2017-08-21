;
$(function(){
	return;
	_initAppIndex();
	
	function _initAppIndex(){
		//初始化上下文
		_initContext();
		
		_initPage();
		
		//页面跳转
		_handlePageForward();
	};
	
	function _initContext(){
		App.Core.ajax({
			url    : 'services/bi/system/initContext',
			data   : {},
			async : false,
			success : function(response){
				window['AppVO'] = response.data;
			}
		});
	};
	
	function _initPage(){
		var $container = $('#AppMainPanel');
		$container.css({'min-height' : $(window).height() - $('.app-nav').height() -$('.app-foot').height()});
		
		//菜单
		_initMenues();
		
		//ui层
		_initUI();
	};
	
	function _initMenues(){
		App.Core.ajax({
			url    : 'services/bi/system/queryMenues',
			data   : {},
			success : function(response){
				_bindMenue(response.data);
				
				_bindMenueEvent();
				
				//用户登录模块
				App.UI.initLogin();
			}
		});
	};
	
	function _initUI(){
		var $body = $(document.body);
		var $layer = $('<div id="app-layer" class="app-layer app-hiden"></div>');
		
		$layer.appendTo($body);
		
	};
	
	function _bindMenue(data){
		var htmlArray = [];
		htmlArray.push('<div class="menue-zoom">');
		var item = null;
		var childs = null;
		var childItem = null;
		data = data || [];
		for(var i = 0; i < data.length; i++){
			item = data[i];
			if(i === 0){
				htmlArray.push('<li class="menue-level1" data-uri="home">'+item.menue.name);
			}else{
				htmlArray.push('<li class="menue-level1">'+item.menue.name);
			}
			
			childs = item.childs || [];
			if(childs.length > 0){
				htmlArray.push('<ul class="menue-level2-container">');
				for(var j = 0; j < childs.length; j++){
					childItem = childs[j];
					htmlArray.push('<li class="menue-level2" data-uri="'+childItem.uri+'">'+childItem.name+'</li>');
				}
				htmlArray.push('</ul>');
			}
			
			htmlArray.push('</li>');
		}
		htmlArray.push('</div>');
//		htmlArray.push('<div class="login-zoom">');
//		htmlArray.push('</div>');
		
		var $nav = $('.app-nav');
		$nav.html(htmlArray.join(''));
	};
	
	function _bindMenueEvent(){
		$('.app-nav').delegate('.menue-level1','click',function(){
			var $this = $(this);
			if($this.attr('data-uri') === 'home'){
				App.Page.forward('home/page/home.html');
				return;
			}
			$this.find('.menue-level2-container').show();
			$this.siblings().find('.menue-level2-container').hide();
		});
		
		$('.app-nav').delegate('.menue-level1','mouseenter',function(){
			var $this = $(this);
			$this.find('.menue-level2-container').show();
			$this.siblings().find('.menue-level2-container').hide();
		});
		
		$('.app-nav').delegate('.menue-level1','mouseleave',function(){
			var $this = $(this);
			$this.find('.menue-level2-container').hide();
		});
		
		$('.app-nav').delegate('.menue-level2','click',function(e){
			var $this = $(this);
			var uri = $this.attr('data-uri');
			$this.parent().hide();
			$level1 = $this.parent().parent();
			$level1.addClass('level1-active').siblings().removeClass('level1-active');
			e.stopPropagation();
			App.Page.forward(uri);
		});
	};
	
	function _handlePageForward(){
		var hash = window.location.hash;
		var uri = hash.slice(2);
		if(!uri){
			uri = 'home/page/home.html';
		}
		App.Page.forward(uri);
	};
});