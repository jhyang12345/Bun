Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");

var userid;

var loadedlist = [];

$(document).ready( function() {

	timerUpdate();

	bottomDetect($(window));

	topDetect($(window));

	Parse.Cloud.run('nameCount', {user: Parse.User.current().id}).then(function(num) {
		$('.authorpostcount').html(num);
		if(!mobile) {
			$('.authorpostcount').css('display', 'block');
		}
	});

	var user = Parse.User.current();

	var userquery = new Parse.Query(Parse.User);
	userquery.equalTo('objectId', userid);
	userquery.first({
		success: function(object) {

		}, error: function(err) {

		}
	}).then(function(result) {
		$(window).on('bottomevent', function() {
			var query = new Parse.Query('Post');
			query.descending("updatedAt");
			query.lessThan('updatedAt', latest);
			query.limit(3);
			query.equalTo('Author', user);
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

		$(window).on('topevent', function() {
			var query = new Parse.Query('Post');
			query.greaterThan('updatedAt', earliest);
			query.descending("updatedAt");
			query.equalTo('Author', user);
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

		//query to find posts
		var query = new Parse.Query("Post");
		query.include("contents");
		query.include("Author");
		query.equalTo('Author', user);
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

	});

	var Picture = Parse.Object.extend("Picture");

	$("#logout").on("click", function(event) {
		event.preventDefault();
		Parse.User.logOut();
		var currentUser = Parse.User.current();
		console.log("Logged out");
		if (currentUser) {

		} else {
		window.location.href = "./index.html";
		}
	});


	var currentuser = Parse.User.current();

	userid = currentuser.id;

	//query currentuser
	console.log(currentuser.id);
	var query = new Parse.Query(Parse.User);
	query.equalTo('objectId', currentuser.id);
	query.include("ProfilePic");
	query.find({
		success: function(result) {
		//	console.log(result[0].get("ProfilePic").url());
		}, error: function(err) {
			console.log("ERROR");
		}
	});

	console.log(currentuser.get("FirstName"));
	$("#firstName").html(currentuser.get("FirstName"));
	$('#lastName').html(currentuser.get("LastName"));
	$('#username').html(currentuser.get("username"));
	var profilepic = currentuser.get('ProfilePic');
	if(profilepic != undefined) {
		console.log(profilepic.className);
		var imageURL = profilepic.url();
		$('#profilepic').attr('src', imageURL);

		$("#profilepic").load(function(){
		  console.log($('#profilepic').height());
			if ($('#profilepic').height() > $('#profilepic').width()) {
				console.log("CHECKED LONGER");
				$('#profilepic').addClass('heightlong');
			}
		});


		console.log(imageURL);
	} else {
		$('#profilepic').attr('src', 'pictures/profile.png');
	}


	Parse.Cloud.run('nameCount', {user: currentuser.id}).then(function(num) {
		$('#numberofposts').html(num);
	});

	$('#myprofile').css('padding-left', $(window).width() / 2 - $('#myprofile').width() / 2);
	$(window).resize(function() {
		$('#myprofile').css('padding-left', $(window).width() / 2 - $('#myprofile').width() / 2);
	});
	//console.log(currentuser.get("ProfilePic").url());

	var imageinput = document.getElementById("imageinput");
	var images = 0;

	imageinput.addEventListener('change', function(evt) {

		var fileInput = document.getElementById('imageinput');
		var fileDisplayArea = document.getElementById('profilepic');

		var files = evt.target.files;
		var i = 0;
		var f;
		console.log("FILEINPUT: "+fileInput.files.length);
		for(i = 0, f; f = files[i]; i++) {
			if (!f.type.match('image.*')) {
				continue;
			}
				var reader = new FileReader();
				var filename = "";
				reader.onload = function(e) {
						fileDisplayArea.innerHTML = "";

						// Create a new image.
						var img = new Image();
						// Set the img src property using the data URL.
						img.src = reader.result;

						$('#profilepic').attr('src', img.src);
					console.log(img.src);
						// Add the image to the page.

					var fullPath = fileInput.value;
					if (fullPath) {
						var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
						filename = fullPath.substring(startIndex);
						if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
							filename = filename.substring(1);
						}
					}

						fileDisplayArea.appendChild(img);
						console.log(filename);

						var imagefile = new Parse.File(filename, files[0]);
						console.log("Here", filename);

						currentuser.set("ProfilePic", imagefile);
						console.log("image set");
						currentuser.save().then(function() {
							location.reload(true);
						});
					}
					reader.readAsDataURL(f);
			}

		});


	$('#profilepic').on('click', function() {
		$('#imageinput').click();
	});


});
