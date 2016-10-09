Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");


var postlist = [];
//List of elements to put back;
var undolist = [];

//image dictionary for Picture element
var imagedic = {};

$('#title').submit(function(e) {
	e.preventDefault();
});


//function to get the EXIC orientation of image from mobile device
function fixExifOrientation($img) {
	console.log('going through?');
	console.log($img);
    $img.load(function() {
				console.log('Checking for rotation');

        EXIF.getData($img[0], function() {
            console.log('Exif=', EXIF.getTag(this, "Orientation"));
            switch(parseInt(EXIF.getTag(this, "Orientation"))) {
                case 2:
                    $img.addClass('flip');
										break;
                case 3:
                    $img.addClass('rotate-180');
										break;
                case 4:
                    $img.addClass('flip-and-rotate-180');
										break;
                case 5:
                    $img.addClass('flip-and-rotate-270');
										$img.parent().css('height', $img.get(0).getBoundingClientRect().height);
										console.log($img.get(0).getBoundingClientRect().height);
										$img.css('margin-top', Math.abs($img.get(0).getBoundingClientRect().height - $img.height()) / 2);
										$img.parent().css('display', 'block');
										break;
                case 6:
                    $img.addClass('rotate-90');
										$img.parent().css('height', $img.get(0).getBoundingClientRect().height);
										console.log($img.get(0).getBoundingClientRect().height);
										$img.css('margin-top', Math.abs($img.get(0).getBoundingClientRect().height - $img.height()) / 2);
										$img.parent().css('display', 'block');
										break;
                case 7:
                    $img.addClass('flip-and-rotate-90');
										$img.parent().css('height', $img.get(0).getBoundingClientRect().height);
										console.log($img.get(0).getBoundingClientRect().height);
										$img.css('margin-top', Math.abs($img.get(0).getBoundingClientRect().height - $img.height()) / 2);
										$img.parent().css('display', 'block');
										break;
                case 8:
                    $img.addClass('rotate-270');
										$img.parent().css('height', $img.get(0).getBoundingClientRect().height);
										console.log($img.get(0).getBoundingClientRect().height);
										$img.css('margin-top', Math.abs($img.get(0).getBoundingClientRect().height - $img.height()) / 2);
										$img.parent().css('display', 'block');
										break;
            }
        });

    });


}

var Title = Parse.Object.extend("Title");
var Post = Parse.Object.extend("Post");
var Textarea = Parse.Object.extend("Textarea");
var Picture = Parse.Object.extend("Picture");

//Saving title with author
var title = new Title();
title.set("title", "title");
title.set("Author", Parse.User.current());
postlist.push(title);

var post = new Post();
post.set("contents", []);

var elemnum = 0;

function lastNone() {
	var found = false;
	console.log($('.post').children().length);
	for(var i = $('.post').children().length - 1; i > 1; --i) {
		var elem = $('.post').children().get(i);
		if($(elem).css('display') == 'none') {
			console.log('passed');
			continue;
		} else {
			if($(elem).children('textarea').length) {
				return true;
			}
			break;
		}
	}
	return false;
}


$(document).ready( function() {

	$('.label').parent().on('click', function() {
		console.log('button clicked');
		if(lastNone()) {
			$('#addtext').addClass('notworkinglabel');
		} else {
			$('#addtext').removeClass('notworkinglabel');
		}
	});

	$('#addimage2').on('click', function() {
		$('#addimage').click();
	});

	$('#addmap2').on('click', function() {
		$('#addmap').click();
	});

	$('#addtext2').on('click', function() {
		$('#addtext').click();
	});

	$('#post2').on('click',function() {
		$('#post').click();
	});

	$('#undo2').on('click', function() {
		$('#undo').click();
	});

	var author = Parse.User.current();
	//make the post in the post.html viewable
	$('.post').css('display', 'block');

	$('.post').append('<div class=\"post-header\"><div class="img-divgo"><img class="profilePic" src=\"pictures/testimage.png\" style=\"vertical-align:bottom;\"/>\
	</div>\
	<span class=\"Name\"></span>\
	<span class=\"numericals\">\
	<span class=\"upVotes\"></span><div id="tagholder">\
	<input type="text" id="tagger" placeholder="#tag" maxlength="20"></input>\
	</div></span></div>');

	var alphas = 'abcdefghijklmnopqrstuvwxyz'
	alphas = alphas.split("");

	var curtag = null;

	$('#tagger').keypress(function(e) {
    e = e || event;
    var s = String.fromCharCode(e.charCode);

		if (e.keyCode == 13) {
			if($('.tagselected').length) {
				$('.tagselected').click();
			}
			return;
		}

		if(event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 39) {
			console.log("backspace");
			return true;
		} else if(!(s.match(/[A-Z]/) || s.match(/[a-z]/))) return false;
	});

	$(document).on('click', function() {
		$('.tagresults').each(function() {
			$(this).remove();
		});
	});

	$('#tagger').on('focusin', function() {
		if($('#tagger').val().length == 0) {
			console.log("None present");
			$('.tagresults').each(function() {
				$(this).remove();
			});
		}
		else if($('#tagger').val().length > 0) {
			var tagquery = new Parse.Query("Tag");
			tagquery.contains("tag", $('#tagger').val());
			tagquery.find({
				success:function(results) {
					$('.tagresults').each(function() {
						$(this).remove();
					});
					console.log(results.length);
					var taglist = [];
					for(var i = 0; i < results.length; ++i) {
						var buf = results[i].get('tag');
						console.log(results[i].get('tag'));
						if(buf != undefined && buf != $('#tagger').val()) {
							taglist.push(buf);
						}
					}
					taglist.sort();
					if(taglist.length > 0) {
						$('#tagger').parent().append('<div class="tagresults">' + taglist[0] + '</div>');
//						$('.tagresults').last().css('top', ($('#tagger').height() + 4) * 3 - 8 + 'px');
//						$('.tagresults').css('width', $('#tagger').width() + 10 + 'px');
						for(var i = 1; i < taglist.length; ++i) {
							if(taglist[i].indexOf($('#tagger').val().toLowerCase()) >= 0) {
								$('.tagresults').last().css('border-bottom', 'none');
								$('#tagger').parent().append('<div class="tagresults">' + taglist[i] + '</div>');

								$('.tagresults').on('mouseover', function() {
									$(this).css('cursor', 'pointer');
									$(this).css('color', '#FFFFFF');
									$(this).css('background-color', '#a0b7da');
								});
								$('.tagresults').on('mouseout', function() {
									$(this).css('background-color', '#FFFFFF');
									$(this).css('color', '#a0b7da');
								});

								$('.tagresults').on('click', function(e) {
									$('#tagger').val($(this).html());
									$('#tagger').trigger('keyup');
									e.stopPropagation();
								});

								$('.tagresults').on('mouseover', function() {
									$('.tagresults').removeClass('tagselected');
								});
							}

						}
					}
				}, error: function(err) {

				}
			});
		}
	});

	$('#tagger').keyup(function(event) {

		if(event.keyCode == 38) {
			if(curtag == null || curtag.length == 0) {
				curtag = $('.tagresults').last();
			} else {
				curtag = curtag.prev();
			}
			$('.tagresults').removeClass('tagselected');
			curtag.addClass('tagselected');
			return;
		} else if(event.keyCode == 40) {
			if(curtag == null || curtag.length == 0) {
				curtag = $('.tagresults').first();
			} else {
				curtag = curtag.next();
			}
			$('.tagresults').removeClass('tagselected');
			curtag.addClass('tagselected');
			return;
		}

		if($('#tagger').val().length == 0) {
			console.log("None present");
			$('.tagresults').each(function() {
				$(this).remove();
			});
		}
		else if($('#tagger').val().length > 0) {
			var tagquery = new Parse.Query("Tag");
			tagquery.contains("tag", $('#tagger').val());
			tagquery.find({
				success:function(results) {
					$('.tagresults').each(function() {
						$(this).remove();
					});
					console.log(results.length);
					var taglist = [];
					for(var i = 0; i < results.length; ++i) {
						var buf = results[i].get('tag');
						console.log(results[i].get('tag'));
						if(buf != undefined && buf != $('#tagger').val()) {
							taglist.push(buf);
						}
					}
					taglist.sort();
					if(taglist.length > 0) {
						$('#tagger').parent().append('<div class="tagresults">' + taglist[0] + '</div>');
//						$('.tagresults').last().css('top', ($('#tagger').height() + 4) * 3 - 8 + 'px');
//						$('.tagresults').css('width', $('#tagger').width() + 10 + 'px');
						for(var i = 1; i < taglist.length; ++i) {
							if(taglist[i].indexOf($('#tagger').val().toLowerCase()) >= 0) {
								$('.tagresults').last().css('border-bottom', 'none');
								$('#tagger').parent().append('<div class="tagresults">' + taglist[i] + '</div>');

								$('.tagresults').on('mouseover', function() {
									$(this).css('cursor', 'pointer');
									$(this).css('color', '#FFFFFF');
									$(this).css('background-color', '#a0b7da');
								});
								$('.tagresults').on('mouseout', function() {
									$(this).css('background-color', '#FFFFFF');
									$(this).css('color', '#a0b7da');
								});

								$('.tagresults').on('click', function(e) {
									$('#tagger').val($(this).html());
									$('#tagger').trigger('keyup');
									e.stopPropagation();
								});

								$('.tagresults').on('mouseover', function() {
									$('.tagresults').removeClass('tagselected');
								});
							}
						}
					}
				}, error: function(err) {

				}
			});
		}
	});





	var newpic = author.get("ProfilePic");
	if(newpic == undefined) {
			$('.post .post-header .img-divgo .profilePic').attr('src', 'pictures/profile.png');
	} else {
			$('.post .post-header .img-divgo .profilePic').attr('src', newpic.url());
			$('.post .post-header .img-divgo .profilePic').load(function() {
				if ($(this).height() > $(this).width()) {
					$(this).addClass('heightlong');
				}
			});
	}

	$('.post .post-header .Name').append(author.get("FirstName") + ' ' + author.get("LastName"));

	$('.post').append('<textarea class="title" rows="1" ' +
	'maxlength="100" id="title" spellcheck="false" placeholder="Title"></textarea>');
	autosize($('#title'));


	var newheight = $('.navbar').height();
	$('.sidebar').css('margin-top', newheight + 'px');
	$('.sidebar').css('height', $(window).height() + 'px');
//	$('.main-container').css('margin-top', newheight+'px');
//	$('.main-container').css('margin-left', $('.sidebar').width()+30 + 'px');
//	$('.main-container').css('margin-right', $('.label').width() + 50 + 'px');
	//$('.right-side').css('right', $('label').width() + 'px');
	$('.right-side').css('top', newheight + 'px');
	$('.imageinput').css('width', $('#addtext').width() + 'px');

	//flag to check if map is loaded already
	var loaded = false;

	$('#addtext').on('click', function() {
		console.log('last is textbox', lastNone());

		if(lastNone()) {
			return false;
		}

	  $('.post').append('<div class=\"elem\">' +
		'<button type="button" class="close textcloser" aria-label="Close">' +
		'<span aria-hidden="true">&times;</span></button>' +
		'<textarea class=\"textbox element\" placeholder=\"Your thoughts\" ' +
		'spellcheck=\"false\" ' + 'id=\"' + elemnum + '\"></textarea></div>');

		$('#' + elemnum).parent().append('<div class="top"></div><div class="bottom">' +
		'</div>');

		$('textarea.textbox').keydown(function() {

		});

		$('textarea.textbox').on('click', function() {
			for(var i = 0; i < $(this).val().length; ++i) {
				if($(this).val()[i] == '\n' || $(this).val()[i] == '\r') {
					console.log('New line');
				}
			}
			console.log($(this).val().replace(/\n/g, "<br>"));
		});


		$('#' + elemnum).on('mouseover', function() {
			console.log('Touching ' + elemnum);
			$(this).prev().css('visibility', 'visible');
		});

		$('#' + elemnum).on('mouseout', function() {
			$(this).prev().css('visibility', 'hidden');
		});

		$('#' + elemnum).prev().on('mouseover', function() {
			$(this).css('visibility', 'visible');
			$(this).css('cursor', 'pointer');
		});

		$('#' + elemnum).prev().on('mouseout', function() {
			$(this).css('visibility', 'hidden');
		});

		$('#' + elemnum).prev().on('click', function() {
			$(this).parent().css('display', 'none');
			undolist.push($(this).next().attr('id'));
			if($(this).parent().next().hasClass('elem')) {
				$(this).parent().next().css('display', 'none');
				undolist.push($(this).parent().next().children('textarea').attr('id'));
			}

			$('.label').parent().click();
		//	$(this).parent().remove();
		});
		autosize($('textarea'));
		var text = new Textarea();
		text.set("text", text);
		text.set("elemnum", elemnum);
		postlist.push(text);
		console.log(postlist);
		$('#'+elemnum).focus();
		elemnum = elemnum + 1;
	//<div class=\"text_box\"><textarea placeholder=\"Enter text\"></textarea></div>');
	});

	$('#addtext').click();
	$('#title').focus();

	$('#addmap').on('click', function(evt) {
		evt.preventDefault();
		$('#done').css('display', 'none');

//		$('.white_content').css('display', 'block');
		//$('.black_overlay').css('display', 'block');
		$('#instructions').css('display', 'inline-block');
		$('.white_content').fadeIn('fast');
		$('.black_overlay').fadeIn('fast');
		$(function(){
			if(!loaded) {
				initMap();
				$('#addmarker').click();
				loaded = true;

//				$('#addmarker').css('display', 'inline-block');
//				$('#addroute').css('display', 'inline-block');
//				$('#addshape').css('display', 'inline-block');

			} else {
				google.maps.event.trigger(map, 'selectedevent');
				$('#addmarker').click();

			}


		//	intialize(elemnum);
		//	elemnum++;
		});
		//launch event
		$('.label').parent().click();
	});


//liteners related to the ovelay map
	$('.white_content').on('mouseover', function() {
		$(this).children('.mapcloser').css('visibility', 'visible');
		console.log("closer showing");
	});

	$('.white_content').on('mouseout', function() {
			$(this).children('.mapcloser').css('visibility', 'hidden');
	});

	$('#')

	$('#light .mapcloser').on('click', function(evt) {
		evt.preventDefault();

		$(this).parent().fadeOut('fast');
		//$('#light').fadeOut('fast');
		$('#fade').fadeOut('fast');

		$('#done').css('display', 'none');
		$('#label').css('display', 'none');
		if(mapitem != null) {
			mapitem.setMap(null);
			itemset = false;
		}

		$('.label').parent().click();
	});

	$('#light .mapcloser').on('mouseover', function() {
		$('.mapcloser').css('cursor', 'pointer');
	});

	$('#fade').on('click', function(evt) {
		evt.preventDefault();
		$('#light').fadeOut('fast');
		$('#fade').fadeOut('fast');
		$('#done').css('display', 'none');
		$('#label').css('display', 'none');
		if(mapitem != null) {
			mapitem.setMap(null);
		}
	});

//listeners related to the markerlabeling

	$('#labelingbackground').on('click', function(evt) {
		evt.preventDefault();
		$('#markerlabeling').fadeOut('fast');
		$('#labelingbackground').fadeOut('fast');
		$('#markertype').fadeOut('fast');
		if($('#addjustmarker').length) {
			justmarker = null;

			mapitem = null;

		}
	});


	function readURL(input, elemnum) {
		if(input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$('#' + elemnum).attr('src', e.target.result);
				console.log($('#' + elemnum).attr('src'));
				console.log(e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

	function readImage() {
		var fileDisplayArea = $('#fileDisplayArea');
		var fileInput = $('#imageinput');
		var file = fileInput.files[0];
		var imageType = /image.*/;
		if (file.type.match(imageType)) {
			var reader = new FileReader();
			reader.onload = function(e) {
				fileDisplayArea.innerHTML = "";
				var img = new Image();
				img.src = reader.result;
				fileDisplayArea.appendChild(img);
			}
			reader.readAsDataURL(file);
		} else {
			fileDisplayArea.innerHTML = "File not supported!";
		}
	}

	var imageinput = document.getElementById("imageinput");
	var images = 0;

	imageinput.addEventListener('change', function(evt) {

		//launch event
		$('.label').parent().click();

		var fileInput = document.getElementById('imageinput');
		console.log(elemnum);


		var files = evt.target.files;
		var i = 0;
		var f;
		console.log("FILEINPUT: "+fileInput.files.length);
		for(i = 0, f; f = files[i]; i++) {

			if (!f.type.match('image.*')) {
				continue;
			}

			var reader = new FileReader();
			reader.x = elemnum;
			reader.i = i;

			$('.post').append('<div class=\"elemholder\">' +
			'<button type="button" class="close closer" aria-label="Close">' +
			'<span aria-hidden="true">&times;</span></button>' +
			'<div class=\"imageholder\" id=\"' + elemnum + '\"></div></div>');

			elemnum = elemnum + 1;

			var picture = new Picture();
			postlist.push(picture);
			imagedic[elemnum - 1] = picture;
			console.log(imagedic[elemnum - 1]);

			$('#addtext').click();

			var filename = "";
			reader.onload = function(e) {
				console.log("FILE ATTRIBUTE SAVED", this.x);

				//readURL(this, elemnum);

				var fileDisplayArea = document.getElementById(this.x.toString());

			  fileDisplayArea.innerHTML = "";
		    // Create a new image.
		    var img = new Image();
				img.elemnum = this.x;
		    // Set the img src property using the data URL.
		    img.src = this.result;

				$('#' + this.x).on('mouseover', function() {
					console.log('Touching ' + this.x);
					$(this).prev().css('visibility', 'visible');
				});
				$('#' + this.x).on('mouseout', function() {
					$(this).prev().css('visibility', 'hidden');
				});
				$('#' + this.x).prev().on('mouseover', function() {
					$(this).css('visibility', 'visible');
					$(this).css('cursor', 'pointer');
				});
				$('#' + this.x).prev().on('mouseout', function() {
					$(this).css('visibility', 'hidden');
				});
				$('#' + this.x).prev().on('click', function() {
					$(this).parent().css('display', 'none');
					undolist.push($(this).next().attr('id'));
					if($(this).parent().next().hasClass('elem')) {
						$(this).parent().next().css('display', 'none');
						undolist.push($(this).parent().next().children('textarea').attr('id'));
					}

					$('.label').parent().click();
				//	$(this).parent().remove();
				});

				//hide image until rotation is figured out
				$('#' + this.x).attr('display', 'none');

		    $('#' + this.x).attr('src', img.src);

				console.log("html here", $('#'+this.x).html());
				fixExifOrientation($(img));
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

				var newfilename = (new Date().getTime()).toString() + '.' + filename.split('.')[1];
				console.log(newfilename);

				var imagefile = new Parse.File(newfilename, files[this.i]);

			  console.log("Here", filename);

				img.filename = filename;

				$(img).load(function() {
					console.log(imagedic);
					var picture = imagedic[this.elemnum];
					console.log(this.elemnum);
					console.log(picture.className);
					picture.set("image", imagefile);
					picture.set("elemnum", this.elemnum);
					picture.set('class', $(img).attr('class'));
					console.log("image set");

				});

				console.log(picture.className);
		  }
		  reader.readAsDataURL(f);

		}

	});

	$('#addimage').on('click', function() {
		var cur = elemnum;
		$('#imageinput').val("");
		$('#imageinput').click();
	});

	$('#post').on('click', function() {
		var i = 0;
		while(i < postlist.length) {
			console.log("The display of the elementholder",postlist[i].get("elemnum"), $('#' + postlist[i].get("elemnum")).parent().css('display'));
			//removing the hidden elements from the savelist!!!
			if($('#' + postlist[i].get("elemnum")).parent().css('display') == 'none') {
				console.log(postlist[i].get("elemnum"))
				console.log("Passed");
				console.log($('#' + postlist[i].get("elemnum")).parent().css('display'));
				postlist.splice(i, 1);
				continue;
			}	else if(postlist[i].className == "Title") {
				if($.trim($('#title').val()) == "") {
					alert("Title is unset");
					return;
				}
				console.log("saving title");
				console.log($('#title').val());
				postlist[i].set("title", $.trim($('#title').val()));
				postlist[i].set('lowertitle', $.trim($('#title').val()).toLowerCase());
				postlist[i].set("Author", Parse.User.current());

			} else if (postlist[i].className == "Textarea") {
				console.log("saving textbox");
				console.log($("#"+ postlist[i].get("elemnum")));
				if($.trim($('#'+postlist[i].get("elemnum")).val()) == "") {
					postlist.splice(i, 1);
					continue;
				}
				$('#'+postlist[i].get("elemnum")).val($.trim($('#'+postlist[i].get("elemnum")).val()));
				var buffer = $('#'+postlist[i].get("elemnum")).val().replace(/\n/g, "<br>");
				buffer = buffer.replace(/\r/g, "<br>");
				postlist[i].set("text", buffer);
			}
			++i;
		}

		$('#loader').fadeIn('fast');
		setTimeout(function() {
			$('#loader').fadeOut('fast');
			alert("There was an error uploading your post");
		}, 10000);

		console.log("Postlist length", postlist.length);
//		postlist.push(post);
		Parse.Object.saveAll(postlist, {
			success: function(obj) {

				post.set("contents", postlist);
				post.set("Author", Parse.User.current());
				post.set("Upvotes", 0);
				post.set("Comments", 0);
				post.set("UpvoteList", []);
				$('#tagger').val($('#tagger').val().replace(/ /g,''));
				post.set("tag", $('#tagger').val());

				//saving tag
				var tagquery = new Parse.Query("Tag");
				tagquery.equalTo("tag", $('#tagger').val());
				tagquery.find({
					success:function(results) {
						if(results == undefined || results.length == 0) {
							var Tag = Parse.Object.extend("Tag");
							var newtag = new Tag();
							newtag.set("tag", $('#tagger').val());
							newtag.save();
						}
					}, error: function(err) {

					}
				});

				post.save().then(function(obj) {
				//	var postlist = postlist;
					console.log("Postlist length", postlist.length);
					for(var i = 0; i < postlist.length; ++i) {
						if (postlist[i].className == 'Marker') {
							postlist[i].add("froms", post.id);
						} else{
							postlist[i].set("from", post.id);
						}
					}
					console.log("Postlist length", postlist.length);
				}, function(err) {
					console.log("FAILED");
				}).then( function(obj) {
					Parse.Object.saveAll(postlist, {
						success: function(obj) {
							window.location.href = "./mainpage.html";
						}, error: function(err) {
							}
					});
				}, function(err) {
			});

		},
		error: function(err) {

		}
	}).then(
		function(object) {
			for(var i = 0; i < postlist.length; ++i) {
				postlist[i].set("from", post.id);
				postlist[i].save();
			}
			console.log("Postlist length", postlist.length);

			}, function(err) {
		}
	).then(
		function(obj) {

			},
			function(err) {

			}
		);

	});

	$('#undo').on('click', function() {
		var check = $('#' + undolist.pop());
		check.parent().css('display', 'block');
		if(!check.hasClass('textarea')) {
			$('#' + undolist.pop()).parent().css('display', 'block');
		}

		console.log('clicked');
	});
	$('#addimage').draggable({
		helper: "clone"
	});
	$('#addmap').draggable({
		helper: "clone"
	});
	$('#addtext').draggable({
		helper: "clone"
	});


});
