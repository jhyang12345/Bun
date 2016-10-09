Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");

//custom event for constant jquery event update
var recurseupdateevent = jQuery.Event();

function timerUpdate() {
	$('span').trigger('recurseupdateevent');
	console.log("Event fired");
	setTimeout(timerUpdate, 10000);
}

console.log("Extended");
var Post = Parse.Object.extend("Post");
var Title = Parse.Object.extend("Title");
var Comment = Parse.Object.extend("Comment");

var loaded = false;

var mainpagemap;

var loadedlist = [];

//last time the post was loaded
var latest;
var earliest;


$(document).ready(function() {

	timerUpdate();

	bottomDetect($(window));

	topDetect($(window));

	$(window).on('bottomevent', function() {
		var query = new Parse.Query(Post);
		query.descending("updatedAt");
		query.lessThan('updatedAt', latest);
		query.limit(3);
		query.find({
			success:function(results) {
				for(var i = 0; i < results.length; ++i) {
					console.log("adding post");
					if(!(results[i].id in loadedlist)) {
						loadedlist.push(results[i].id);
						latest = results[i].updatedAt;
						getPost(results[i].id, $('.main-container'));
						console.log("Updated At", results[i].updatedAt);
					}
				}
			}, error: function(err) {

			}
		});
	});

//not completed
	$(window).on('topevent', function() {
		var query = new Parse.Query(Post);
		query.greaterThan('updatedAt', earliest);
		query.descending("updatedAt");
		query.limit(3);
		query.find({
			success:function(results) {
				results.reverse();
				for(var i = 0; i < results.length; ++i) {
					console.log("adding post");
					if(!(results[i].id in loadedlist)) {
						loadedlist.push(results[i].id);
						earliest = results[i].updatedAt;
						getPosttoFront(results[i].id, $('.main-container'));
						console.log("Updated At", results[i].updatedAt);
					}
				}
			}
		});
	});

	console.log($.now());

	$.ajax({
		type: 'GET',
		headers: {'X-Parse-Application-Id':'R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq','X-Parse-REST-API-Key':'ZbinpsHbvBA1gQASyVCMau9ztv5u4aUSw3DSjNDF'},
		url: "https://api.parse.com/1/classes/Comment",
		contentType: "application/json"
	}).done(function(e, status) {
		console.log(e);
	});

//	alert('Width ' +  $('document').width() +  ' Height ' +  $('document').height());
	//scroll to top on load!!
	$('html, body').animate({
		scrollTop: 0
	}, 1);

	$('#overlay').on('click', function() {
		$('#overlay').fadeOut('fast');
		$('#mapholder').fadeOut('fast');
	});

	$('#mapcloser').on('click', function() {
		$('#overlay').fadeOut('fast');
		$('#mapholder').fadeOut('fast');
	});


	$(function() {
		$('#floatingnavigator').draggable({
//			cancel: '#floatingnavigator'
		});
	});

	//makepost2 on the mainpage refers to this one
	$('#makepost').on('click', function() {
		window.location.href = "./post.html";
	});

	$('#gototop').on('click', function() {
		$('html, body').animate({
			scrollTop: 0
		}, 350);
	});

	$('#gotobottom').on('click', function() {
		$('html, body').animate({
			scrollTop: document.body.scrollHeight
		}, 350);
	});


	//commentscroll
	function commentScroll(commentelement) {

	}

	$('#post').on('click', function() {
		console.log("Make post clicked");
		window.location.href = "./post.html";
	});

	$('span.timestamp').on('recurseupdateevent', function() {
		$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
	});

	$('span.comment-time').on('recurseupdateevent', function() {
		$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
	});

	//query to find posts
	var query = new Parse.Query(Post);
	query.include("contents");
	query.include("Author");
	query.limit(5);
	query.descending("updatedAt");
	query.find({
		success: function(results) {
			earliest = results[0].updatedAt;
			for(var x = 0; x < results.length; x++) {
				latest = results[x].updatedAt;
				if(!(results[x].id in loadedlist)) {
					getPost(results[x].id, $('.main-container'));
					loadedlist.push(results[x].id);
				}

			}
		}, error: function(err) {

		}
	});

	$('html, body').scrollTop(0);
	$('#gototop').click();
});
