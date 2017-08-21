;$(function(){
	//初始化Idea上下文
	initIdeaContext();
	
	function initIdeaContext(){
		var hash = (location.hash || '').slice(2);
		if(hash){
			Idea.Page.forward(hash);
		}
		
		//1.获取基础信息，用户、权限、菜单
		_initWorkspaceVO();
	};
	
	function _initWorkspaceVO(){
		Idea.Core.ajax({
			url  : "idea/buildEnvironment",
			type : 'GET',
			success : function(response){
				_initIdeaEnvironment(response);
			}
		});
	};
	
	function _initIdeaEnvironment(response){
		_initLogo();
		
		_initMenues(response.menueNodes);
	};
	
	function _initLogo(){
		$('#idea_nav').append('<div class="idea_logo"><img src="idea/images/logo.png"/></div>');
	};
	
	function _initMenues(menueNodes){
		var node = null,
			$menuedDoms = $('<div class="nva_container"></div>');
		
		for(var i = 0; i < menueNodes.length; i++){
			node = menueNodes[i];
			addMenue(node,$menuedDoms);
		}
		
		$('#idea_nav').append($menuedDoms);
		
		_bindMenueEvent($menuedDoms);
	};
	
	function addMenue(node,$menuedDoms){
		var nodeDom = [];
		nodeDom.push('<div class="nav_item"><span class="nav_name" data_hash="'+node.url+'">'+node.name);
		nodeDom.push('</span>');
		var children = node.children || [],
		subNode = null;
		nodeDom.push('<div class="sub_menue_container">');
		for(var i = 0; i < children.length; i++){
			subNode = children[i];
			nodeDom.push('<div class="sub_item"><span class="nav_name" data_hash="'+subNode.url+'">'+subNode.name+'</span></div>');
		}
		nodeDom.push('</div>');
		
		nodeDom.push('</div>');
		
		var $node = $(nodeDom.join(''));
		$node.data('value',node).appendTo($menuedDoms);
	};
	
	function _bindMenueEvent($menuedDoms){
		$menuedDoms.on('click','.nav_name',function(e){
			var $this = $(this);
			var url = $this.attr('data_hash');
			if(url){
				Idea.Page.forward(url);
			}
		});
		
		$menuedDoms.on('mouseenter','.nav_item',function(e){
			var $this = $(this);
			var data = $this.data('value');
			//展示子菜单
			_showSunMenues($this,data);
		});
	};
	
	function _showSunMenues($menue,node){
		var $target = $menue.find('.sub_menue_container');
		if(node.children && node.children.length > 0){
			var width = $target.outerWidth();
			$target.css({left:-(width/2) + $menue.outerWidth()/2})
		}else{
			$target.remove();
		}
	};
});