
// NProgress.js 
$(document).ready(function(){
  NProgress.start();   
})

$(window).load(function(){
  NProgress.done();
})

// blog list lazy load
$(document).ready(function(){	
	var loading = $(".loading");	
	var next_url = $.trim($(".next-url").text());
	var is_loading = false;

	$(window).scroll(function(){
		if( $(window).scrollTop() >= ($(document).height() - $(window).height()) ){			
			if (next_url != "" && !is_loading) {				
				is_loading = true;
				get_more_posts(next_url);	
				is_loading = false;			
			}
			else
				$(".lazy-load").hide();
		}		
	});

	function get_more_posts(url){
		$.get(url, function(data, status){
			var new_post_list = $(data).find(".post-block").children();
			var new_url = $.trim($(data).find(".next-url").text());

			next_url = new_url;			
			$(".post-block").append(new_post_list);
			$(".next-url").empty().append(new_url);			

		});
	};
	
})