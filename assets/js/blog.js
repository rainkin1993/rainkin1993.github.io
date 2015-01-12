
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
	
});

// scroll up
$(function () {
    $.scrollUp({
 		animation: 'fade',
      	activeOverlay: 'red',
      	scrollDistance: 100,  
      	scrollText: 'back to top',
      	scrollSpeed: 400
    });
});

// TOC:table of content
$(function () {
	$('#toc').toc({
	     'selectors': 'h1,h2', //elements to use as headings
	     'container': '.post-content', //element to find all selectors in
	     'itemClass': function(i, heading, $heading, prefix) { // custom function for item class
 						 return "item";},
		 'activeClass': "active" 						  						 
	 });
});


// highlight code --> disable the select and copy of lineno
$(function(){
	var linenos = $('.highlight .lineno');
	$.each(linenos, function(index,value){ 
		$(value).attr("data-lineno",$(value).text());
		value.innerHTML = " ";
	})
	$("head").append("<style>.highlight .lineno:before{content: attr(data-lineno);color:#ccc;}</style>");	

})