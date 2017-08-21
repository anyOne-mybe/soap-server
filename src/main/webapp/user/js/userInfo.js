(function(){
	$(function(){
		initUserPage();
	});
	
	function initUserPage(){
		$.ajax({
			url : '/demo/services/action/user/userInfo/123',
			data:{},
			success : function(response){
				paintUser(response.data);
			}
		});
	};
	
	function paintUser(user){
		$('.user').html('<span class="user-name">'+user.name+'</span>' + '<span class="user-age">'+user.age+'</span>' + '<span class="user-id">'+user.id+'</span>');
	};
	
	
})();