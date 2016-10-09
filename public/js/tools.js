var postsloaded = [];
var poststate = {};

var notificationposts = {};
var oldestnotification = null;

var galleryelem;

var mobile = false;
var orientation = false;

var start;
var dragging = false;
var originalwidth = '30%';
var originalheight = '50%';

var scrollbuffer = 0;

var scrollingTo = false;

$('.mapelement').resize(function() {
	console.log("window resized!");
});

function windowResize() {
	$('.mapelement').resize();
	setTimeout(windowResize, 60000);
}

function recurseUpdateEvent() {
	$(document).trigger('recurseupdatevent');
	setTimeout(recurseUpdateEvent, 10000);
}

windowResize();

function isScrolledIntoView(elem)
{
    var $elem = $(elem);
    var $window = $(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();

    return ((( elemTop >= docViewTop) && (elemTop <= docViewBottom)) || ((elemBottom >= docViewTop) && (elemBottom <= docViewBottom)));
}

function promptBoxSizing() {
	$('.promptbox').css('left', $(window).width() / 2 - $('.promptbox').width() / 2);
	$('.promptbox').css('top', $(window).height() / 2 - $('.promptbox').height() / 2);
	$(window).resize(function() {
		$('.promptbox').css('left', $(window).width() / 2 - $('.promptbox').width() / 2);
		$('.promptbox').css('top', $(window).height() / 2 - $('.promptbox').height() / 2);
	});
}

function notpostviewerSizing() {
	$('#notpostviewer').css('left', $(window).width() / 2 - $('#notpostviewer').width() / 2);
	$(window).resize(function() {
		$('#notpostviewer').css('left', $(window).width() / 2 - $('#notpostviewer').width() / 2);
	});
}

$(window).scroll(function() {
	$('.post').each(function(i) {
		if(isScrolledIntoView($(this)) && poststate[$(this).attr('id')] != true) {
			console.log($(this).attr('id'));
			poststate[$(this).attr('id')] = true;
		} else if (isScrolledIntoView($(this)) == false) {
			poststate[$(this).attr('id')] = false;
		}
	});
});

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
	return Math.round(d*100)/100;
}

function getRotationDegrees(obj) {
    var matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform")    ||
    obj.css("-ms-transform")     ||
    obj.css("-o-transform")      ||
    obj.css("transform");
    if(matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else { var angle = 0; }
    return (angle < 0) ? angle + 360 : angle;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

$(document).ready(function() {

	//checking for number of notifiations
	Parse.Cloud.run('getUncheckedNotifications', {userid: Parse.User.current().id}).then(function(response) {
		console.log("Number of unchecked Notifications", response);
		if(response) {
			$('.notnumber').html(response);
			$('.notnumber').css('display', 'inline-block');
		} else {
			$('.notnumber').css('display', 'none');
		}
	});

	$('.navbar-header').on('click', function() {
		console.log(new Date().getTime());
		console.log(("ABCDE.JPG").split('.'));
	});

	console.log("Device width", $(window).width());

	if($(window).width() <= 600) {
		mobile = true;
	}

	$('#archive').on('click', function() {
		window.location.href = "./archive.html";
	});

	$('#makepost').on('click', function() {
		window.location.href = "./post.html";
	});

	$('#taglist').on('click', function() {
		window.location.href = "./taglist.html";
	});

	$('#mapthearea').on('click', function() {
		window.location.href="./googlemap.html";
	});

	var newheight = $('.navbar').height();

	$('.sideborder').on('touchend', function(e) {
		console.log("Touch ended");
	});
	$('.sideborder').on('touchmove', function(e) {
		console.log("TOUCHING");
	});

	$('.sideborder').on('mousedown touchstart', function(e) {
		if(!mobile) {
			start = e.pageX;
		} else {
			start = e.originalEvent.touches[0].pageY;
		}
		dragging = true;
		originalwidth = $('#sidebarholder').width();
		originalheight = $('#sidebarholder').height();
	});
	$('#sidebarholder').parent().on('mousemove touchmove', function(e) {
		if(dragging) {
			if(!mobile) {
				$('#sidebarholder').width(originalwidth + e.pageX - start);
				$('#map').width($('#map').parent().width() - $('#sidebarholder').width());
			} else {
				console.log(start);
				$('#sidebarholder').height(originalheight - e.originalEvent.touches[0].pageY + start);
				$('#map').height($('#map').parent().height() - $('#sidebarholder').height());
			}
		}
	});
	$('#sidebarholder').parent().on('mouseup touchend', function() {
		if(dragging) {
			if(!mobile) {
				originalwidth = $('#sidebarholder').width();
			} else {
				originalheight = $('#sidebarholder').height();
			}
		}

		dragging = false;
	});
//	$('.main-container').css('margin-top', newheight+'px');
//	$('.main-container').css('margin-left', $('.sidebar').width()+30 + 'px');
//	$('.main-container').css('margin-right', $('.label').width() + 50 + 'px');
	//$('.right-side').css('right', $('label').width() + 'px');
	$('.right-side').css('top', newheight + 'px');
	$('.imageinput').css('width', $('#addtext').width() + 'px');

	if(!mobile) {
		$('#postsby').css('top', newheight + 30 + 'px');
		$('.bigtag').css('top', newheight + 30 + 'px');
	} else {
		$(document).on('click', function() {
			if($('.navbar-toggle').attr('aria-expanded')) {
				$('#navbar').collapse('hide');
			}
		});
	}

	$('.navbar-header').on('click', function() {
		$('#overlay').click();
		$('#galleryoverlay').click();
	});

	$('.navbar-toggle').on('click', function() {
		if($('#headerprofilepic').height() > $('#headerprofilepic').width()) {
			$('#headerprofilepic').addClass('heightlong');
			console.log("Longer");
		}
	});

	$('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
	$(window).resize(function() {
			$('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
			if( $(window).width() / 2 - 300 < $('#postsby').width()) {
			//	$('.main-container').css('position', 'fixed');
			//	$('.main-container').css('top', $('#postsby').height() + $('#postsby').css('top') + 'px');
			} else {

			}
	});

	console.log($('.holder').height());
	$('.holder').css('margin-top', $('#galleryoverlay').height() / 2 - $('#navleft').height() / 2 + 'px');
	$(window).resize(function() {
		$('.holder').css('margin-top', $('#galleryoverlay').height() / 2 - $('#navleft').height() / 2 + 'px');
	});

	$('#actualimage').css('top', $(window).height() / 2 - $('#actualimage').height() / 2  + 25 + 'px');
	$('#actualimage').css('left', $(window).width() / 2 - $('#actualimage').width() / 2 + 'px');
	$('#actualimage').css('max-height', $(window).height() - 50);
	$(window).resize(function() {
		$('#actualimage').css('top', $(window).height() / 2 - $('#actualimage').height() / 2  + 25 + 'px');
		$('#actualimage').css('left', $(window).width() / 2 - $('#actualimage').width() / 2  + 'px');
		$('#actualimage').css('max-height', $(window).height() - 50);
	});

	$('#galleryoverlay').css('height', $(window).height() - 50);
	$(window).resize(function() {
		$('#galleryoverlay').css('height', $(window).height() - 50);
	});

	$('#galleryoverlay').on('click', function() {
		$('#galleryoverlay').css('display', 'none');
		$('#justblackbackground').css('display', 'none');
		$('#actualimage').css('display', 'none');
		galleryelem = null;
	});

	$('#actualimage').on('click', function(e) {
		e.stopPropagation();
		clearTimeout($.data($('#actualimage')[0], 'clicked'));
		$('#navleft').css('opacity', 1);
		$('#navright').css('opacity', 1);
		$('.gallerycloser').css('visibility', 'visible');
		$.data($('#actualimage')[0], 'clicked', setTimeout(function() {
			$('#navleft').css('opacity', 0);
			$('#navright').css('opacity', 0);
			$('.gallerycloser').css('visibility', 'hidden');
		}, 2000));
	});

	$(window).keydown(function(e) {
		if(e.keyCode == 37) {
			$('#navleft').click();
		} else if (e.keyCode == 39) {
			$('#navright').click();
		}
	});

	$('#navleft').on('click', function(e) {
		e.stopPropagation();

		if($('#navleft').css('opacity') == 0) {
			clearTimeout($.data($('#actualimage')[0], 'clicked'));
			$('#navleft').css('opacity', 1);
			$('#navright').css('opacity', 1);
			$.data($('#actualimage')[0], 'clicked', setTimeout(function() {
				$('#navleft').css('opacity', 0);
				$('#navright').css('opacity', 0);
				$('.gallerycloser').css('visibility', 'hidden');
			}, 2000));
				//	return;
		} else {
			clearTimeout($.data($('#actualimage')[0], 'clicked'));
			$.data($('#actualimage')[0], 'clicked', setTimeout(function() {
				$('#navleft').css('opacity', 0);
				$('#navright').css('opacity', 0);
				$('.gallerycloser').css('visibility', 'hidden');
			}, 2000));
		}

		$('#actualimage').removeClass();
		console.log($(galleryelem).children('.imageholder').children('img').attr('src'));
		if($(galleryelem).prevAll('.elemholder').length == 0 || galleryelem == null) {
			galleryelem = $(galleryelem).parent().children('.elemholder').last();

			console.log($('#actualimage').width(), $('#actualimage').get(0).getBoundingClientRect().width);
			console.log("Restarting left");
			console.log($(galleryelem).parent().children('.elemholder').length);
		} else {
			galleryelem = $(galleryelem).prevAll('.elemholder').eq(0);

		}

		$('#actualimage').attr('src', $(galleryelem).children('.imageholder').children('img').attr('src'));
		if($(galleryelem).children('.imageholder').children('img').attr('class').split(' ').length > 2) {
			$('#actualimage').addClass($(galleryelem).children('.imageholder').children('img').attr('class').split(' ')[2]);
			if(getRotationDegrees($('#actualimage')) % 180 != 0) {
				$('#actualimage').css('max-width', $('#galleryoverlay').height());
				$('#actualimage').css('max-height', $('#galleryoverlay').width());
			}
		}
		$(window).resize();
	});

	$('#navright').on('click', function(e) {
		e.stopPropagation();

		if($('#navleft').css('opacity') == 0) {
			clearTimeout($.data($('#actualimage')[0], 'clicked'));
			$('#navleft').css('opacity', 1);
			$('#navright').css('opacity', 1);
			$.data($('#actualimage')[0], 'clicked', setTimeout(function() {
				$('#navleft').css('opacity', 0);
				$('#navright').css('opacity', 0);
				$('.gallerycloser').css('visibility', 'hidden');
			}, 2000));
				//	return;
		} else {
			clearTimeout($.data($('#actualimage')[0], 'clicked'));
			$.data($('#actualimage')[0], 'clicked', setTimeout(function() {
				$('#navleft').css('opacity', 0);
				$('#navright').css('opacity', 0);
				$('.gallerycloser').css('visibility', 'hidden');
			}, 2000));
		}

		$('#actualimage').removeClass();
		console.log($(galleryelem).children('.imageholder').children('img').attr('src'));
		if($(galleryelem).nextAll('.elemholder').length == 0 || galleryelem == null) {
			galleryelem = $(galleryelem).parent().children('.elemholder').first();

			console.log("Restarting right");
			console.log($(galleryelem).parent().children('.elemholder').length);
		} else {
			galleryelem = $(galleryelem).nextAll('.elemholder').eq(0);

		}

		$('#actualimage').attr('src', $(galleryelem).children('.imageholder').children('img').attr('src'));
		if($(galleryelem).children('.imageholder').children('img').attr('class').split(' ').length > 2) {
			$('#actualimage').addClass($(galleryelem).children('.imageholder').children('img').attr('class').split(' ')[2]);
			if(getRotationDegrees($('#actualimage')) % 180 != 0) {
				$('#actualimage').css('max-width', $('#galleryoverlay').height());
				$('#actualimage').css('max-height', $('#galleryoverlay').width());
			}
		}
		$(window).resize();
	});

	$('#navleft').on('mouseover', function() {
		$(this).children('img').attr('src', 'pictures/lightleft.png');
	});

	$('#navright').on('mouseover', function() {
		$(this).children('img').attr('src', 'pictures/lightright.png');
	});

	$('#navleft').on('mouseout', function() {
		$(this).children('img').attr('src', 'pictures/navleft.png');
	});

	$('#navright').on('mouseout', function() {
		$(this).children('img').attr('src', 'pictures/navright.png');
	});

	bottomDetect($('#notificationbox'));
	$('#notificationbox').on('bottomevent', function() {
		if(oldesnotification != null) {
			var notificationquery = new Parse.Query("Notifications");
			notificationquery.equalTo('notificationTo', Parse.User.current().id);
			notificationquery.limit(5);
			notificationquery.lessThan(oldestnotification);
			notificationquery.find({
				success: function(results) {
					for(var i = 0; i < results.length; ++i) {
						if($('#noti' + results[i].id).length < 1) {
							$('#notificationbox').append('<li class="notificationelement" id="noti' + results[i].id + '"></li>');
							Parse.Cloud.run('getNotification', {notificationId: results[i].id}).then(function(response) {
								console.log(response);
								$('#noti' + response.notificationId).append('<span class="notificationmessage">' + response.Name + ' ' + response.message + '</span>');
								$('#noti' + response.notificationId).append('<span class="notificationtime">' + getCurrentTime(response.date) + '</span>');
								$('#noti' + response.notificationId).css('display', 'block');
								if(!response.checked) {
									$('#noti' + response.notificationId).addClass('uncheckednotification');
								}
								if(oldestnotification == null) {
									oldestnotification = response.date;
								} else if (response.date < oldestnotification) {
									oldestnotification = response.date;
								}
								console.log("POSTID", response.postid);
								notificationposts[response.notificationId] = response.postid;
							});
							$('#noti' + results[i].id).on('click', function(e) {
							//	e.stopPropagation();
								console.log(notificationposts[$(this).attr('id').substr(4)]);

								//if(mobile) {
									$('#notificationbox').css('display', 'none');
								//}
							//	$(this).css('background-color', '#fff');

								if ($('#post' + notificationposts[$(this).attr('id').substr(4)]).length) {
									$('body,html').animate({scrollTop: $('#post' + notificationposts[$(this).attr('id').substr(4)]).position().top - 55}, 100);
									$('.post').removeClass('postfocus');
									$('#post' + notificationposts[$(this).attr('id').substr(4)]).addClass('postfocus');

								} else {
									scrollbuffer = $(window).scrollTop();
									$('body').append('<div id="notpostviewer"><button type="button" class="close postcloser" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
									$('body').append('<div id="overlay"></div>');

									$('body,html').animate({scrollTop: 0}, 100);

									$('#notpostviewer').css('display', 'block');
									$('#overlay').css('display', 'block');
									$('#overlay').css('top', 0);
									getPost(notificationposts[$(this).attr('id').substr(4)], $('#notpostviewer'));
									notpostviewerSizing();

									$('#notpostviewer').on('click', function() {
										$('.postcloser').css('visibility', 'visible');
										setTimeout(function() {
											$('.postcloser').css('visibility', 'none');
										},2000);
									});

									$('.postcloser').on('click', function() {
										$('#overlay').click();
									});

									$('#overlay').on('click', function() {
										$('#overlay').remove();
										$('#notpostviewer').remove();
										$('body,html').animate({scrollTop: scrollbuffer}, 100);
									});
								}

							});
						}

					}
				}, error: function(err) {

				}
			});
		} else {
			$('#overlay').click();
			$('#notificationbox').css('display', 'none');
			$('.notificationelement').each(function() {
				$(this).removeClass('uncheckednotification');
			});
			console.log("Passed through");
		}

	});

	$('#notheader').on('click', function() {
		$('#notificationbox').css('display', 'none');
	});

	$('#getnotification').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		console.log("Notification box display", $('#notificationbox').css('display'));

		if(mobile) {
			$('#navbar').collapse('hide');
		}

	//

		console.log($('#getnotification'));
		if($('#notificationbox').css('display') == 'none') {

			$('#notheader').css('line-height', $('#notheader').height());

			if(mobile) {
				$('#notificationbox').remove();
				$('body').append('<div id="notificationbox">' +
				                '<div id="notheader">Notifications<span class="notnumber"></span></div>' +
				              '</div></li>');

				$('#notificationbox').on('click', function(e) {
					e.stopPropagation();
				});

			}

			Parse.Cloud.run('getUncheckedNotifications', {userid: Parse.User.current().id}).then(function(response) {
				console.log("Number of unchecked Notifications", response);
				if(response) {
					$('.notnumber').html(response);
					$('.notnumber').css('display', 'inline-block');
				} else {
					$('.notnumber').css('display', 'none');
				}
			});

			$('#notificationbox').on('click', function(e) {
				e.stopPropagation();
			});

			$(document).on('click', function() {
				$('#notificationbox').css('display', 'none');
				$('.post').removeClass('postfocus');
				$('.notificationelement').each(function() {
					$(this).removeClass('uncheckednotification');
				});
			});

			$('#notificationbox').css('display', 'block');
			var notificationquery = new Parse.Query("Notifications");
			notificationquery.equalTo('notificationTo', Parse.User.current().id);
			notificationquery.limit(10);
			notificationquery.descending("createdAt");
			notificationquery.find({
				success: function(results) {
					for(var i = 0; i < results.length; ++i) {
						if($('#noti' + results[i].id).length < 1) {
							$('#notificationbox').append('<li class="notificationelement" id="noti' + results[i].id + '"></li>');
							Parse.Cloud.run('getNotification', {notificationId: results[i].id}).then(function(response) {
								console.log(response);
								$('#noti' + response.notificationId).append('<span class="notificationmessage">' + response.Name + ' ' + response.message + '</span>');
								$('#noti' + response.notificationId).append('<span class="notificationtime">' + getCurrentTime(response.date) + '</span>');
								$('#noti' + response.notificationId).css('display', 'block');
								if(!response.checked) {
									$('#noti' + response.notificationId).addClass('uncheckednotification');
								}
								if(oldestnotification == null) {
									oldestnotification = response.date;
								} else if (response.date < oldestnotification) {
									oldestnotification = response.date;
								}
								console.log("POSTID", response.postid);
								notificationposts[response.notificationId] = response.postid;
							});
							$('#noti' + results[i].id).on('click', function(e) {
							//	e.stopPropagation();
								console.log(notificationposts[$(this).attr('id').substr(4)]);

								//if(mobile) {
									$('#notificationbox').css('display', 'none');
								//}
							//	$(this).css('background-color', '#fff');

								if ($('#post' + notificationposts[$(this).attr('id').substr(4)]).length) {
									$('body,html').animate({scrollTop: $('#post' + notificationposts[$(this).attr('id').substr(4)]).position().top - 55}, 100);
									$('.post').removeClass('postfocus');
									$('#post' + notificationposts[$(this).attr('id').substr(4)]).addClass('postfocus');

								} else {
									scrollbuffer = $(window).scrollTop();
									$('body').append('<div id="notpostviewer"><button type="button" class="close postcloser" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
									$('body').append('<div id="overlay"></div>');

									$('body,html').animate({scrollTop: 0}, 100);

									$('#notpostviewer').css('display', 'block');
									$('#overlay').css('display', 'block');
									$('#overlay').css('top', 0);
									getPost(notificationposts[$(this).attr('id').substr(4)], $('#notpostviewer'));
									notpostviewerSizing();

									$('#notpostviewer').on('click', function() {
										$('.postcloser').css('visibility', 'visible');
										setTimeout(function() {
											$('.postcloser').css('visibility', 'none');
										},2000);
									});

									$('.postcloser').on('click', function() {
										$('#overlay').click();
									});

									$('#overlay').on('click', function() {
										$('#overlay').remove();
										$('#notpostviewer').remove();
										$('body,html').animate({scrollTop: scrollbuffer}, 100);
									});
								}

							});
						}

					}
				}, error: function(err) {

				}
			});
		} else {
			$('#overlay').click();
			$('#notificationbox').css('display', 'none');
			$('.notificationelement').each(function() {
				$(this).removeClass('uncheckednotification');
			});
			console.log("Passed through");
		}

	});

	$('#header-div').after(Parse.User.current().get('FirstName') + ' ' + Parse.User.current().get('LastName'));

	if(Parse.User.current().get("ProfilePic") != undefined) {
		$('#headerprofilepic').attr('src', Parse.User.current().get("ProfilePic").url());
		$('#headerprofilepic').load(function() {
			if ($(this).height() > $(this).width()) {
				console.log("CHECKED LONGER");
				$(this).addClass('heightlong');
			};
			$('#headerprofile').css('visibility', 'visible');
		});
	} else {
		$('#headerprofile').css('visibility', 'visible');
	}

	$('#headerprofile').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		if($('#profilebox').css('display') == 'none') {
			$('#profilebox').css('display', 'block');
			console.log($('#headerprofilepic').height(), $('#headerprofilepic').width());

		} else {
			$('#profilebox').css('display', 'none');
		}
	});

	$('#profilebox').on('click', function(e) {
		e.stopPropagation();
	});

	$(document).on('click', function() {
		$('#profilebox').css('display', 'none');
	});

	$('#logout').on('click', function(e) {
		e.preventDefault();
		Parse.User.logOut();
		var currentUser = Parse.User.current();
		console.log("Logged out");
		if (currentUser) {

		} else {
		window.location.href = "./index.html";
		}
	});

	$('#logout2').on('click', function(e) {
		e.preventDefault();
		Parse.User.logOut();
		var currentUser = Parse.User.current();
		console.log("Logged out");
		if (currentUser) {

		} else {
		window.location.href = "./index.html";
		}
	});

	//resizing notification box on mobile versions
	if(mobile) {
		$(window).resize(function() {

		});
	}

	if(mobile) {
    $(window).scroll(function() {
			if($('.post').length > 1) {
				$('#scroll-nav').animate({right: '0px'}, 100);
			}
    });

    $(window).scroll(function() {
      clearTimeout($.data(this, 'scrollNavTimer'));
      $.data(this, 'scrollNavTimer', setTimeout(function() {
				$('#scroll-nav').animate({right: '-5em'}, 100);
        console.log("Haven't scrolled in 250ms!");
      }, 1000));
    });

		$('#scrollUp').on('click', function() {
			clearTimeout($.data(window, 'scrollNavTimer'));
			$.data(window, 'scrollNavTimer', setTimeout(function() {
				$('#scroll-nav').animate({right: '-5em'}, 100);
				console.log("Haven't scrolled in 250ms!");
			}, 1000));
		});

		$('#scrollDown').on('click', function() {
			$('.post').each(function() {
				if(isScrolledIntoView($(this))) {
					var curelem = $(this);
					console.log($(this).attr('id'));
					$('body,html').animate({scrollTop: curelem.next().position().top - 55}, 100);
					return false;
				}
				console.log("Passing through");
			});
			clearTimeout($.data(window, 'scrollNavTimer'));
			$.data(window, 'scrollNavTimer', setTimeout(function() {
				$('#scroll-nav').animate({right: '-5em'}, 100);
				console.log("Haven't scrolled in 250ms!");
			}, 1000));
		});
  }
});

var markerimage= {
  url: 'pictures/marker.png',
  size: new google.maps.Size(50,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(20,40),
  scaledSize: new google.maps.Size(40, 40)
};

var foodimage = {
  url: 'pictures/food.png',
  size: new google.maps.Size(50,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(15, 40),
  scaledSize: new google.maps.Size(40, 40)
};

function getCurrentTime(time) {
	var timeago;
	if(($.now() - time) > 24 * 3600000) {
		if(parseInt(($.now() - time) / (24 * 3600000)) > 1) {
			timeago = getDatelabel(time);//parseInt(($.now() - time) / (24 * 3600000)).toString() + ' days';

		} else {
			timeago = getDatelabel(time); //parseInt(($.now() - time) / (24 * 3600000)).toString() + ' day';

		}
	} else if (($.now() - time) > 3600000) {
		if(parseInt(($.now() - time) / 3600000) > 1) {
				timeago = parseInt(($.now() - time) / 3600000).toString() + ' hours';
		} else{
			timeago = parseInt(($.now() - time) / 3600000).toString() + ' hour';
		}

	} else if (($.now() - time) > 60000) {
		if(parseInt(($.now() - time) / 60000) > 1) {
			timeago = parseInt(($.now() - time) / 60000).toString() + ' minutes';
		} else {
			timeago = parseInt(($.now() - time) / 60000).toString() + ' minute';
		}
	} else {
		timeago = 'seconds';
	}
	return timeago;
}


//query to get a single post from id
function getPost(id, element) {

  var Title = Parse.Object.extend("Title");
  var Post = Parse.Object.extend("Post");
  var Comment = Parse.Object.extend("Comment");
	var Notification = Parse.Object.extend('Notifications');

  var query = new Parse.Query(Post);
  query.include("contents")
  query.include("Author");
  query.equalTo("objectId", id);
  query.limit(1);
  query.find({
    success: function(results) {
      console.log(results.length);
      for(var i = 0; i < results.length; ++i) {
				var id = results[i].id;
				if($('#' + id).length) continue;
				if($('#post' + id).length) continue;
				element.append('<div class=\"post\" id=\"post' + id + '\"></div>');
				if (scrollingTo) {
					$('html, body').animate({
						scrollTop: $('#post' + id).position().top - 55
					}, 300);
					scrollingTo = false;
				}
          console.log("Post createdAt", ($.now() - results[i].createdAt) / 3600000);
          var contents = results[i].get("contents");

          var list = [];
          var promises = [];
          for(var x = 0; x < list.length; ++i) {
            list.push('');
          }
              var timeago = getCurrentTime(results[i].createdAt);
							$('#post' + id).append('<div class="extrahidden"><img src="pictures/postoptions.png" /></div>\
							<div class="postextra"><img class="up" src="pictures/up.png"/><img class="down" src="pictures/down.png" /><img class="deletepost" src="pictures/delete.png" /></div>\
							<div class=\"post-header\"><div class="img-divgo"><img class="profilePic" src=\"pictures/testimage.png\" style=\"vertical-align:bottom;\"/>\
              </div><span class="timestamp" id="' +  results[i].createdAt + '">' + timeago + '</span>\
              <span class=\"Name\"></span>\
							<span class="pageName"> > Foreigners in Korea</span>\
              <span class=\"numericals\">\
							<div class="tag"></div>\
              <span class=\"upVotes\"></span>\
              </span></div>');

							if(!mobile) {

								$('.extrahidden').on('click', function(e) {
									e.stopPropagation();
								//	$(this).parent().children('.postextra').css('display', 'block');
									if($(this).parent().children('.postextra').css('right') == '-40px')
									$(this).parent().children('.postextra').animate({ right: "0px" }, 100 );
								});

								$('.postextra').on('click', function(e) {
									e.stopPropagation();
									$(this).parent().children('.postextra').css('display', 'block');
								});

								$('.postextra').on('click', function(e) {
									e.stopPropagation();
	//								$(this).parent().children('.postextra').animate({ right: "-40px" }, 100 );
								});

								$('.up').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').index(curelem) < 5 || curelem.prev() == undefined) {
										$(window).trigger('topevent');
									}
									console.log("Index of post", $('.post').index(curelem));

									setTimeout(function() {
										curelem.prev().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
									$('body,html').animate({scrollTop: curelem.prev().position().top - 55}, 100);
								//	$('body').scrollTop(curelem.prev().position().top - 55);
								});

								$('.down').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').length - $('.post').index(curelem) < 5 || curelem.next() == undefined) {
										$(window).trigger('bottomevent');
									}
									console.log("Index of post", $('.post').index(curelem));
									console.log(curelem.next().attr('class'));
									console.log(curelem.next().position().top);
									$('body,html').animate({scrollTop: curelem.next().position().top - 55}, 100);
									setTimeout(function() {
										curelem.next().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
								//	$('body').scrollTop(curelem.next().position().top - 55);
								});

								$(document).on('click', function() {
								//	$('.postextra').css('display', 'none');
									$('.postextra').animate({ right: "-40px" }, 50 );
								});
							}	else {

								$('.extrahidden').on('click', function(e) {
									e.stopPropagation();
									console.log("Extra hidden clicked");
								//	$(this).parent().children('.postextra').css('display', 'block');
									$(this).parent().children('.postextra').animate({ right: "0px" }, 100 );
								});

								$('.postextra').on('click', function(e) {
									e.stopPropagation();
									$(this).parent().children('.postextra').css('display', 'block');
								});

								$('.up').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').index(curelem) < 5 || curelem.prev() == undefined) {
										$(window).trigger('topevent');
									}
									console.log("Index of post", $('.post').index(curelem));
									setTimeout(function() {
										curelem.prev().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
									$('body,html').animate({scrollTop: curelem.prev().position().top - 55}, 100);
								//	$('body').scrollTop(curelem.prev().position().top - 55);
								});

								$('.down').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').length - $('.post').index(curelem) < 5 || curelem.next() == undefined) {
										$(window).trigger('bottomevent');
									}
									console.log("Index of post", $('.post').index(curelem));
									console.log(curelem.next().attr('class'));
									console.log(curelem.next().position().top);

									$('body,html').animate({scrollTop: curelem.next().position().top - 55}, 100);
									setTimeout(function() {
										curelem.next().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
								//	$('body').scrollTop(curelem.next().position().top - 55);
								});

								$(document).on('click', function() {
								//	$('.postextra').css('display', 'none');
									$('.postextra').animate({ right: "-40px" }, 50 );
								});
							}

              console.log(contents.length);
              var author = results[i].get("Author");

							var tag = results[i].get("tag");

							if(tag == "") {
								$('#post'+id +' .post-header .tag').html("etc.");
							} else {
								$('#post'+id +' .post-header .tag').html(tag);
							}
							$('#post'+id +' .post-header .tag').on('click', function() {
								if($('#post'+id +' .post-header .tag').html() == 'etc.') {
									window.location.href="./tag.html?tag=";
								} else {
									window.location.href="./tag.html?tag=" + $('#post'+id +' .post-header .tag').html();
								}
							});

              $('span.timestamp').on('recurseupdateevent', function() {
                $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
              });

              $('#post'+id +' .post-header .Name').append(author.get("FirstName") + ' ' + author.get("LastName"));
							$('#post'+id +' .post-header .Name').addClass(author.id);

							//enabling delete post
							if(author.id == Parse.User.current().id) {
								$('#post' + id).children('.postextra').children('.deletepost').css('display', 'block');
								$('#post' + id).children('.postextra').children('.deletepost').on('click', function() {
									$('body').append('<div class="promptbox">' +
									 ' <button type="button" class="close promptcloser" aria-label="Close">' +
									 '	 <span aria-hidden="true">&times;</span>' +
									 ' </button>' +
									 ' <div class="Question">Are you sure that you want to delete this post?</div>' +
									 ' <div class="answerholder">' +
									 '	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
									 '</div>' +
									 '</div>' +
									'<div class="promptoverlay"></div>');

									var postid = $(this).parent().parent().attr('id').substr(4);

									promptBoxSizing();
									$('.answerleft').on('click', function() {
										Parse.Cloud.run('deletePost', {Post: postid}).then(function(response) {
											console.log(response);
											if(response.indexOf('Successfully') >= 0) {
												$('#post' + postid).css('display', 'none');
												$('.promptbox').remove();
												$('.promptoverlay').remove();
												$('body').append('<div class="promptbox">' +
												 ' <button type="button" class="close promptcloser" aria-label="Close">' +
												 '	 <span aria-hidden="true">&times;</span>' +
												 ' </button>' +
												 ' <div class="Question">Your post has successfully been deleted</div>' +
												 ' <div class="answerholder">' +
												 '	 <span class="answer oneanswer">OK</span>' +
												 '</div>' +
												 '</div>' +
												'<div class="promptoverlay"></div>');
												$('.promptoverlay').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.oneanswer').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.promptcloser').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												promptBoxSizing();
											} else { //failed to delete post
												$('.promptbox').remove();
												$('.promptoverlay').remove();
												$('body').append('<div class="promptbox">' +
												 ' <button type="button" class="close promptcloser" aria-label="Close">' +
												 '	 <span aria-hidden="true">&times;</span>' +
												 ' </button>' +
												 ' <div class="Question">There was a problem deleting your post. Please try again later.</div>' +
												 ' <div class="answerholder">' +
												 '	 <span class="answer oneanswer">OK</span>' +
												 '</div>' +
												 '</div>' +
												'<div class="promptoverlay"></div>');
												$('.promptoverlay').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.oneanswer').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.promptcloser').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
											}
										});
										$('.promptbox').remove();
										$('.promptoverlay').remove();
										console.log(postid);

									});

									$('.answerright').on('click', function() {
										$('.promptbox').remove();
										$('.promptoverlay').remove();
									});

									$('.promptoverlay').on('click', function() {
										$('.promptbox').remove();
										$('.promptoverlay').remove();
									});

									$('.promptcloser').on('click', function() {
										$('.promptbox').remove();
										$('.promptoverlay').remove();
									});

								});

							}

							$('#post'+id +' .post-header .Name').on('click', function() {
								console.log($(this).attr('class').split(" ")[1]);
								window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
							});

              var newpic = author.get("ProfilePic");
              if(newpic == undefined) {
                  $('#post'+id +' .post-header .img-divgo .profilePic').attr('src', 'pictures/profile.png');
              } else {
                  $('#post'+id +' .post-header .img-divgo .profilePic').attr('src', newpic.url());
									$('#post'+id +' .post-header .img-divgo .profilePic').load(function() {
										if ($(this).height() > $(this).width()) {
											console.log("CHECKED LONGER");
											$(this).addClass('heightlong');
										};
									});
              }

							$('#post'+id +' .post-header .upVotes').append('<span class=\"number\"> ' + results[i].get("Upvotes").toString() +
							 '</span><a class=\"' + id + '\" href=\"\">' +
								'<img src="pictures/smileygray.png" class="smiley" /> </a>');

							$('#post'+id + ' .post-header .upVotes a').on('mouseover', function() {
								$(this).children('img').attr('src', "pictures/brightsmile.png");
							});

							$('#post'+id + ' .post-header .upVotes a').on('mouseout', function() {
								if ($(this).children('img').attr('id') != 'true') {
									$(this).children('img').attr('src', "pictures/smileygray.png");
								}
							});

							Parse.Cloud.run('Smiles', {Post: id}).then(function(smiles) {
								console.log("Smiles", smiles);
								$('#post'+id +' .post-header .upVotes .number').html(smiles);
							});

							Parse.Cloud.run('hasSmiled', {Post: id, User: Parse.User.current().id}).then(function(response) {
								console.log(id, Parse.User.current().id);
								console.log("smiled", response);
								if(response == true) {
									$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/brightsmile.png");
									$('#post'+id +' .post-header .upVotes a img').attr('id', 'true');
								} else {
									$('#post'+id +' .post-header .upVotes a').css('background-color', 'transparent');
									$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/smileygray.png");
									$('#post'+id +' .post-header .upVotes a img').attr('id', 'false');
								}
							});

              $('a.'+id).on('click', function(evt) {
								evt.preventDefault();
                console.log("Upvote Clicked");
								var id = $(this).attr('class');
								Parse.Cloud.run('SmileAt', {Post: id, User: Parse.User.current().id}).then(function(response) {
									console.log(response);
									if(response.smiled == true) {
										$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/brightsmile.png");
										$('#post'+id +' .post-header .upVotes a img').attr('id', 'true');
									} else {
										$('#post'+id +' .post-header .upVotes a').css('background-color', 'transparent');
										$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/smileygray.png");
										$('#post'+id +' .post-header .upVotes a img').attr('id', 'false');
									}
									$('#post'+id +' .post-header .upVotes .number').html(response.smiles);
								});
              });

              for(var x = 0; x < contents.length; ++x) {
                console.log("Going through:", x);
                if(contents[x].className == "Title") {
                  console.log("TITLE");
                  console.log(contents[x].get("title"));
                  $('#post'+contents[x].get("from")).append('<div class=\"title\">' + contents[x].get("title") + '</div>');
                  promises.push(contents[x].fetch({
                    success: function(obj) {
                      console.log(obj.get("from"));
                      list[x] = '<div class=\"title\">' + obj.get("title") + '</div>';
                      //$('#post'+obj.get("from")).append('<div class=\"title\">' + obj.get("title") + '</div>')
                    }, error: function(err) {

                    }
                  }));
                } else if (contents[x].className == 'Textarea') {
                  console.log("TEXTAREA");
                  console.log(contents[x].get("text"));
                  $('#post'+contents[x].get("from")).append('<div class=\"textarea\">' + contents[x].get("text") + '</div>');

									$('iframe').each(function() {
										var width = $(this).width();
										var height = $(this).height();
										var ratio = parseFloat(height) / parseFloat(width);
										$(this).attr('width', $(this).parent().width());
										$(this).attr('height', $(this).parent().width() * ratio);
										console.log('Setting iframe width and height');
									});
                  promises.push(contents[x].fetch({
                    success: function(obj) {
                      list[x] = '<div class=\"textarea\">' + obj.get("text") + '</div>';
    //									$('#'+obj.get("from")).append('<div class=\"textarea\">' + obj.get("text") + '</div>')
                    }, error: function(err) {

                    }
                  }));
                } else if (contents[x].className == 'Picture') {
                  console.log("Picture");
                  $('#post'+contents[x].get("from")).append('<div class=\"elemholder\"><div class=\"imageholder\" id=\"' + contents[x].id + '\"></div></div>');
                  $('#'+contents[x].id).append('<img class=\"img-block ' + contents[x].id + '\" src=\"\"/>');
                  $('.'+contents[x].id).attr('src', contents[x].get("image").url());
									if(contents[x].get('class') != undefined) {
											$('.'+contents[x].id).addClass(contents[x].get('class'))
									}
									$('.'+contents[x].id).load(function() {
										console.log("Image loaded");
										$(this).css('display', 'inline-block');
										console.log("Image rectangle", this.getBoundingClientRect().height);
										$(this).parent().css('height', this.getBoundingClientRect().height);
										$(this).css('margin-top', Math.abs($(this).get(0).getBoundingClientRect().height - $(this).height()) / 2);

									});

									$('.elemholder').on('click', function() {
										$('#justblackbackground').css('display', 'block');
										$('#galleryoverlay').css('display','block');
										$('#actualimage').css('display', 'block');
										$('#actualimage').attr('src', $(this).children('.imageholder').children('img').attr('src'));
										if($(this).children('.imageholder').children('img').attr('class').split(' ').length > 2){
											$('#actualimage').addClass($(this).children('.imageholder').children('img').attr('class').split(' ')[2]);
											if(getRotationDegrees($('#actualimage')) % 180 != 0) {
												$('#actualimage').css('max-width', $('#galleryoverlay').height());
												$('#actualimage').css('max-height', $('#galleryoverlay').width());
											}
										}
										$(window).resize();
										galleryelem = $(this);
									});

                } else if (contents[x].className == 'Marker') {

                  console.log("Marker");
                  //get original post id from  the title or whatever that comes before

									var mapId = 'map' + contents[x].id;
									var postId = contents[0].get("from");
                  $('#post' + postId).append('<div  class="mapelement"><div class="maplabel">'
									+ contents[x].get('title') +
									'</div>' +
                  '<div id="' + mapId + '" class="mapblock">' +
                  '</div></div>');

									$('.mapelement').on('mouseover', function() {

										$(this).children('.maplabel').css('display', 'block');
									});

									$('.mapelement').on('mouseout', function() {

										$(this).children('.maplabel').css('display', 'none');
									});


                  console.log("zoom level", contents[x].get("zoomlevel"));
                  var mapcenter = [0, 0];
                  if(contents[x].get('center') != undefined) {
                      mapcenter = contents[x].get('center').split(' ');
                  } else {
                    mapcenter[0] = parseFloat(contents[x].get("location").latitude);
                    mapcenter[1] = parseFloat(contents[x].get("location").longitude);
                  }


                  console.log("ID for MAPBLOCK", contents[x].id);

                  console.log(mapcenter);

									console.log("The map id", mapId);

									//changing the width after adding to the maincontainer

									console.log($('#postviewer').children().children('.mapelement').width());

                  var blockmap = new google.maps.Map(document.getElementById(mapId), {
                    center: {lat: parseFloat(mapcenter[0]), lng: parseFloat(mapcenter[1])},
                    mapTypeControl: false,
                    scaleControl: false,
                    streetViewControl: false,
                    zoomControl: false,
                    zoom: contents[x].get("zoomlevel") - 2,
                    draggable: false,
                    scrollwheel: false,
										disableDoubleClickZoom: true
                  });

									if(mobile) {
										blockmap.setZoom(Math.max(blockmap.getZoom() - 2, 0));
									}

									blockmap.setCenter({lat: parseFloat(mapcenter[0]), lng: parseFloat(mapcenter[1])});

									var type = contents[x].get("type");

                  var blockmarker = new google.maps.Marker({
                    map: blockmap,
                    position: {lat: parseFloat(contents[x].get("location").latitude),
                              lng: parseFloat(contents[x].get("location").longitude)
                    },
										icon: markerimage,
										title: contents[x].id
                  });

									if(type == 'food') {
								    blockmarker.setIcon(foodimage);
								  } else if (type == 'hotel') {
								    blockmarker.setIcon(hotelimage);
								  } else if (type == 'tourist') {
								    blockmarker.setIcon(touristimage);
								  } else if (type == 'transportation') {
								    blockmarker.setIcon(transportationimage);
								  } else if(type == 'entertainment') {
								    blockmarker.setIcon(entertainmentimage)
								  }

                  blockmap.addListener('click', function() {
                    console.log("Clicked on embedmap");
										console.log(blockmarker.getTitle());
                    $('#mapholder').fadeIn('fast');
                    $('#overlay').fadeIn('fast');

										markerfocused = true;
										autoclickmarker = blockmarker.getTitle();

										if($('#map').length) {
											$('#postviewer').empty();
											$('#overlayfull').fadeOut('fast');
											map.setZoom(this.getZoom() + 1);
											map.setCenter(this.getCenter());
											google.maps.event.trigger(map, 'dragend');
										}
                    else if(!loaded) {
                        mainpagemap = initMapblock('mapviewer', this.getCenter(), new google.maps.Marker({
                          map: null,
                          position: blockmarker.getPosition()
                        }));
                        mainpagemap.setZoom(this.getZoom() + 1);
                        loaded = true;
                    }
										mainpagemap.setCenter(this.getCenter());
                    mainpagemap.setZoom(this.getZoom() + 1);

										google.maps.event.trigger(mainpagemap, 'dragend');
										google.maps.event.trigger(markertomarkerid['marker' + blockmarker.getTitle()], 'click');
                  });


							//		google.maps.event.trigger(blockmap, 'resize');

									console.log("reload attempted");

                }


              }
              for(var x = 0; x < contents.length; ++x) {
                  $('#post'+id).append(list[x]);
                  console.log(list[x]);
              }

              $('#post'+id).css('display', 'block');

              //Adding commentholder section to hold the comments of post
          /*		$('#'+id).append('<div class="textarea commentsholder"><div class="commentelem"><div class="commentheader">' +
              '<img class="commentProfile img-circle" src="pictures/profile.png" style="width: 35px; height: 35px;"/>' +
               '<span class="name"> </span><span class="comment-time"> 3 minutes ago</span></div>' +
               '<div class="actualcomment">Actual comment Actual comment Actual comment' +
               ' Actual comment Actual comment</div></div></div>');
               */
              $('#post'+id).append('<div class="textarea commentsholder"><span class=\"Comments\"></span></div>');
              $('#post'+id).append('<textarea rows="1" class=\"comment ' + id + '\" placeholder=\"Make a comment\" spellcheck=\"false\"></textarea>');

							var commentlength = 0;

							Parse.Cloud.run('commentnumber', {Post: results[i].id}).then(function(response) {
								var number = response.number;
								commentlength = response.number;
								console.log("Comment number", response.number);
								if(number > 0) {
										$('#post' + id + ' .commentsholder .Comments .loadstatus .total').html(response.number);
								} else {
									$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
								}

							});

							//set the id of the .Comments div as the date the post was created
							var commentquery = new Parse.Query("Comment");
							$('#post'+id + ' .commentsholder').attr('id', new Date());
							$('#post'+id + ' .commentsholder .Comments').attr('id', results[i].createdAt);
							commentquery.equalTo("Post", results[i]);
							commentquery.include("Author");
							commentquery.descending("createdAt");
							commentquery.limit(3);
							commentquery.find({
								success: function(obj) {
									console.log(obj.length, "Comments found");
									var currentelem = $('#post'+id + ' .commentsholder .commentlength');
									//display the commentsholder block only when there are comments to load
									if(obj.length > 0) {
										console.log("Making visible");
										console.log(currentelem.parent().parent().parent().children('.commentsholder').attr('class'));
										currentelem.parent().parent().parent().children('.commentsholder').css('display', 'block');
										for(var x = 0; x < obj.length; ++x) {
											//checking if a replica id is present in the DOM
											if($('#' + obj[x].id).length) {
												continue;
											}
											if(obj[x].createdAt < new Date($('#post'+id + ' .commentsholder').attr('id'))) {
												$('#post'+id + ' .commentsholder').attr('id', obj[x].createdAt);
												console.log("Changed");
											}
											if(obj[x].createdAt > new Date($('#post'+id + ' .commentsholder .Comments').attr('id'))) {
												$('#post'+id + ' .commentsholder .Comments').attr('id', obj[x].createdAt);
											}

											var timeago = getCurrentTime(obj[x].createdAt);

											currentelem.parent().parent().parent().children('.commentsholder').children('.Comments').after('<div class="commentelem"><div class="commentheader">' +
											'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
											 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
												+ timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
											 '<div class="actualcomment">' + obj[x].get("comment") +
											 '</div></div>');
											$('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
											$('.commentelem').on('mouseover', function() {
												$(this).children('.commentheader').children('.deletecomment').css('display', 'block');
												console.log('mouse entered comment');
											});
											$('.commentelem').on('mouseout', function() {
												$(this).children('.commentheader').children('.deletecomment').css('display', 'none');
											});
											$('.name').on('click', function() {
												console.log($(this).attr('class').split(" ")[1]);
												window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
											});
											if(Parse.User.current().id == obj[x].get("Author").id) {
												 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
												 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
													 $('body').append('<div class="promptbox">' +
														' <button type="button" class="close promptcloser" aria-label="Close">' +
														'	 <span aria-hidden="true">&times;</span>' +
														' </button>' +
														' <div class="Question">Are you sure that you want to delete the comment?</div>' +
														' <div class="answerholder">' +
														'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
														'</div>' +
														'</div>' +
													 '<div class="promptoverlay"></div>');
													 promptBoxSizing();
													 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
													 $('.answerleft').on('click', function() {
														 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
														 console.log('ERROR DELETING COMMENT', response);
														 if(response.indexOf('destroyed') >= 0) {
															var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
															$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

															commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
															commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
															$('#' + response.substring(10)).parent().parent().parent().remove();
														 }
														 $('.promptbox').remove();
														 $('.promptoverlay').remove();
													 });
													});
													$('.answerright').on('click', function() {
														$('.promptbox').remove();
														$('.promptoverlay').remove();
													});
													$('.promptoverlay').on('click', function() {
														$('.promptbox').remove();
														$('.promptoverlay').remove();
													});
													$('.promptcloser').on('click', function() {
														$('.promptbox').remove();
														$('.promptoverlay').remove();
													});

												});
											}

											$('#' + obj[x].id).load(function() {
												if ($(this).height() > $(this).width()) {
													console.log("CHECKED LONGER");
													$(this).addClass('heightlong');
												};
											});

											$('span.comment-time').on('recurseupdateevent', function() {
												$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
											});
										}

									}
								}
							}).then(function() {
								$('#post' + id + ' .commentsholder .Comments .loadstatus .currentloaded').html($('#post' + id + ' .commentsholder').children().size() - 1);
								console.log($('#post' + id + ' .commentsholder').children().size() - 1 , parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()));
								if($('#post' + id + ' .commentsholder').children().size() - 1 == parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html())) {
									console.log("full");
									$('#post' + id + ' .commentsholder .Comments .commentlength').html("No more comments");
									$('#post' + id + ' .commentsholder .Comments .commentlength').unbind('click');
									if(parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()) == 0) {
										$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
									}
								}
							});


							$('#post'+id +' .commentsholder .Comments').append('\
							 <span class=\"commentlength\">View more comments</span><span class="loadstatus"><span class="currentloaded">' +
							0 + '</span> / <span class="total">' + commentlength + '</span></span>');

							//load all comments on the click of view comments
							$('#post'+id + ' .commentsholder .commentlength').on('click', function() {
								console.log($(this).parent().parent().parent().attr('id'));

								//currentelem buffer to reference the button span
								var currentelem = $(this);
								var commentquery = new Parse.Query("Comment");
								var postquery = new Parse.Query("Post");
								var currentpost;
								postquery.equalTo("objectId", $(this).parent().parent().parent().attr('id').substr(4));
								postquery.find({
									success: function(obj) {
										currentpost = obj[0];
										console.log("Comment post found");
									}, error: function(err) {

									}
								}).then(function() {
									commentquery.equalTo("Post", currentpost);
									commentquery.descending("createdAt");
									commentquery.include("Author");
									commentquery.lessThan('createdAt', new Date(currentelem.parent().parent().attr('id')));
									commentquery.limit(5);
									commentquery.find({
										success: function(obj) {
											console.log(obj.length, "Comments found");

											//display the commentsholder block only when there are comments to load
											if(obj.length > 0) {
												console.log("Making visible");
												console.log(currentelem.parent().parent().parent().children('.commentsholder').attr('class'));
												currentelem.parent().parent().parent().children('.commentsholder').css('display', 'block');
												for(var x = 0; x < obj.length; ++x) {
													//checking if a replica id is present in the DOM
													if($('#' + obj[x].id).length) {
														continue;
													}

													var timeago = getCurrentTime(obj[x].createdAt);

													currentelem.parent().parent().parent().children('.commentsholder').children('.Comments').after('<div class="commentelem"><div class="commentheader">' +
													'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
													 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
													  + timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
													 '<div class="actualcomment">' + obj[x].get("comment") +
													 '</div></div>');
															 $('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
				 											$('.commentelem').on('mouseover', function() {
				 												$(this).children('.commentheader').children('.deletecomment').css('display', 'block');
				 												console.log('mouse entered comment');
				 											});
				 											$('.commentelem').on('mouseout', function() {
				 												$(this).children('.commentheader').children('.deletecomment').css('display', 'none');
				 											});
															$('.name').on('click', function() {
																console.log($(this).attr('class').split(" ")[1]);
																window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
															});
															if(Parse.User.current().id == obj[x].get("Author").id) {
																 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
																 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
																	 $('body').append('<div class="promptbox">' +
																		' <button type="button" class="close promptcloser" aria-label="Close">' +
																		'	 <span aria-hidden="true">&times;</span>' +
																		' </button>' +
																		' <div class="Question">Are you sure that you want to delete the comment?</div>' +
																		' <div class="answerholder">' +
																		'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
																		'</div>' +
																		'</div>' +
																	 '<div class="promptoverlay"></div>');
																	 promptBoxSizing();
																	 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
																	 $('.answerleft').on('click', function() {
																		 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
																		 console.log('ERROR DELETING COMMENT', response);
																		 if(response.indexOf('destroyed') >= 0) {
																			var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
																			$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

																			commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
																			commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
																			$('#' + response.substring(10)).parent().parent().parent().remove();
																		 }
																		 $('.promptbox').remove();
																		 $('.promptoverlay').remove();
																	 });
																	});
																	$('.answerright').on('click', function() {
																		$('.promptbox').remove();
																		$('.promptoverlay').remove();
																	});
																	$('.promptoverlay').on('click', function() {
																		$('.promptbox').remove();
																		$('.promptoverlay').remove();
																	});
																	$('.promptcloser').on('click', function() {
																		$('.promptbox').remove();
																		$('.promptoverlay').remove();
																	});

																});
															}

				 											$('#' + obj[x].id).load(function() {
				 												if ($(this).height() > $(this).width()) {
				 													console.log("CHECKED LONGER");
				 													$(this).addClass('heightlong');
				 												};
				 											});

													//updating the id saved date
													if(obj[x].createdAt < new Date(currentelem.parent().parent().parent().children('.commentsholder').attr('id'))) {
														currentelem.parent().parent().parent().children('.commentsholder').attr('id', obj[x].createdAt);
														console.log("Changed");
													}

													$('span.comment-time').on('recurseupdateevent', function() {
														$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
													});
												}

											}
										}
									}).then(function() {
										$('#post' + id + ' .commentsholder .Comments .loadstatus .currentloaded').html($('#post' + id + ' .commentsholder').children().size() - 1);
										console.log($('#post' + id + ' .commentsholder').children().size() - 1 , parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()));
										if($('#post' + id + ' .commentsholder').children().size() - 1 == parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html())) {
											console.log("full");
											$('#post' + id + ' .commentsholder .Comments .commentlength').html("No more comments");
											$('#post' + id + ' .commentsholder .Comments .commentlength').unbind('click');
											if(parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()) == 0) {
												$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
											}
										}
									});

									currentelem.parent().parent().parent().children('.commentsholder').on('recurseupdateevent', function() {

										commentquery.find({
											success: function(obj) {
												console.log(obj.length, "Comments found");

												//display the commentsholder block only when there are comments to load
												if(obj.length > 0) {
													console.log("Making visible");
													console.log(currentelem.parent().parent().parent().children('.commentsholder').attr('class'));
													currentelem.parent().parent().parent().children('.commentsholder').css('display', 'block');
													for(var x = 0; x < obj.length; ++x) {
														//checking if a replica id is present in the DOM
														if($('#post' + obj[x].id).length) {
															continue;
														}
														var timeago = getCurrentTime(obj[x].createdAt);

														currentelem.parent().parent().parent().children('.commentsholder').append('<div class="commentelem"><div class="commentheader">' +
														'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
														 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
														  + timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
														 '<div class="actualcomment">' + obj[x].get("comment") +
														 '</div></div>');
																 $('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
																 $('.commentelem').on('mouseover', function() {
																	 $(this).children('.commentheader').children('.deletecomment').css('display', 'block');
																	 console.log('mouse entered comment');
																 });
																 $('.commentelem').on('mouseout', function() {
																	 $(this).children('.commentheader').children('.deletecomment').css('display', 'none');
																 });
																 $('.name').on('click', function() {
																	 console.log($(this).attr('class').split(" ")[1]);
																	 window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
																 });
																 if(Parse.User.current().id == obj[x].get("Author").id) {
			 														 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
																	 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
																		 $('body').append('<div class="promptbox">' +
																			' <button type="button" class="close promptcloser" aria-label="Close">' +
																			'	 <span aria-hidden="true">&times;</span>' +
																			' </button>' +
																			' <div class="Question">Are you sure that you want to delete the comment?</div>' +
																			' <div class="answerholder">' +
																			'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
																			'</div>' +
																			'</div>' +
																		 '<div class="promptoverlay"></div>');
																		 promptBoxSizing();
																		 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
																		 $('.answerleft').on('click', function() {
																			 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
																			 console.log('ERROR DELETING COMMENT', response);
																			 if(response.indexOf('destroyed') >= 0) {
																				var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
																				$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

																				commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
																				commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
																				$('#' + response.substring(10)).parent().parent().parent().remove();
																			 }
																			 $('.promptbox').remove();
																			 $('.promptoverlay').remove();
																		 });
																	 	});
																		$('.answerright').on('click', function() {
																			$('.promptbox').remove();
																			$('.promptoverlay').remove();
																		});
																		$('.promptoverlay').on('click', function() {
																			$('.promptbox').remove();
																			$('.promptoverlay').remove();
																		});
																		$('.promptcloser').on('click', function() {
																			$('.promptbox').remove();
																			$('.promptoverlay').remove();
																		});

																	});
																}

																$('#' + obj[x].id).load(function() {
																 if ($(this).height() > $(this).width()) {
																	 console.log("CHECKED LONGER");
																	 $(this).addClass('heightlong');
																 };
																});

														$('span.comment-time').on('recurseupdateevent', function() {
															$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
														});
													}

												}
											}
										});
									});
								});

								console.log("load comment clicked");
							});


              $('textarea.'+id).keydown(function(event) {
                //buffer to reference the current element
                var currentelem = $(this);
                if(event.keyCode == 13 && !event.shiftKey) {
                  event.preventDefault();

									if($(this).val() == '') {
										return;
									}

									$(this).blur();
									//graying out area
									$(this).addClass('posting');

									var id = this.className.split(' ')[1];
                  $(this).val($(this).val().trim());
                  var text = $(this).val();
                  console.log("Actual comment", text);
                  console.log("Enter clicked");
                  var comment = new Comment();
                  var query = new Parse.Query(Post);
                  query.equalTo("objectId", id);
                  query.find({
                    success: function(result) {
                      console.log("length of query", result.length);
                      comment.set("Post", result[0]);
                      console.log(text);
                      comment.set("comment", text);
                      comment.set("Author", Parse.User.current());
                      console.log("Pointer SET");
                      comment.save().then(function() {
												Parse.Cloud.run('commentnumber', {Post: currentelem.parent().attr('id').substr(4)}).then(function(response) {
													commentlength = response.number;
													console.log("Comment number", response.number);
													if(number > 0) {
															$('#post' + currentelem.parent().attr('id').substr(4) + ' .commentsholder .Comments .loadstatus .total').html(response.number);
													} else {
														$('#post' + currentelem.parent().attr('id').substr(4) + ' .commentsholder .Comments .commentlength').html("No comments");
													}

												});
                        var newquery = new Parse.Query("Comment");
                        result[0].set("Comments", result[0].get("Comments") + 1);
                        console.log("Comment number saved");
                        result[0].save().then(function() {
                          console.log("Changing", result[0].get("Comments"));
                          var query = new Parse.Query(Comment);
                          query.equalTo("Post", result[0]);
                          query.find({
                            success: function(obj) {
                              console.log("Number of comments", obj.length);
                              $('#post' + id + ' .post-header .Comments .commentlength').html(' ' + obj.length);
                            }, error: function(err) {

                            }
                          });

                        //	window.location.href = "./mainpage.html";
                        });

												if(Parse.User.current().id != result[0].get("Author").id) {
													//sending a notification
													var notification = new Notification();
													notification.set("notificationFrom", Parse.User.current().id);
													notification.set("notificationTo", result[0].get("Author").id);
													notification.set("type", "comment");
													notification.set("checked", false);
													notification.set("postid", result[0].id);
													notification.save();
												}

                      }).then(function() {
                        var commentquery = new Parse.Query("Comment");
                        var postquery = new Parse.Query("Post");
                        var currentpost;
                        postquery.equalTo("objectId", currentelem.parent().attr('id').substr(4));
                        postquery.find({
                          success: function(obj) {
                            currentpost = obj[0];

                          }, error: function(err) {

                          }
                        }).then(function() {
                          commentquery.equalTo("Post", currentpost);
                          commentquery.ascending("createdAt");
                          commentquery.include("Author");
													commentquery.greaterThan('createdAt', new Date(currentelem.parent().children('.commentsholder').children('.Comments').attr('id')));
                          commentquery.limit(10);
                          commentquery.find({
                            success: function(obj) {
                              console.log(obj.length, "Comments found");

                              if(obj.length > 0) {
                                currentelem.parent().children('.commentsholder').css('display', 'block');
																for(var x = 0; x < obj.length; ++x) {
                                  if($('#' + obj[x].id).length) {
                                    continue;
                                  }
                                  var timeago = getCurrentTime(obj[x].createdAt);

                                  currentelem.parent().children('.commentsholder').append('<div class="commentelem"><div class="commentheader">' +
																	'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
																	 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
																	  + timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
																	 '<div class="actualcomment">' + obj[x].get("comment") +
																	 '</div></div>');

																			 $('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
								 											$('.commentelem').on('mouseover', function() {
								 												$(this).children('.commentheader').children('.deletecomment').css('display', 'block');
								 												console.log('mouse entered comment');
								 											});
								 											$('.commentelem').on('mouseout', function() {
								 												$(this).children('.commentheader').children('.deletecomment').css('display', 'none');
								 											});
																			$('.name').on('click', function() {
																				console.log($(this).attr('class').split(" ")[1]);
																				window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
																			});
																			if(Parse.User.current().id == obj[x].get("Author").id) {
																				 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
																				 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
																					 $('body').append('<div class="promptbox">' +
																						' <button type="button" class="close promptcloser" aria-label="Close">' +
																						'	 <span aria-hidden="true">&times;</span>' +
																						' </button>' +
																						' <div class="Question">Are you sure that you want to delete the comment?</div>' +
																						' <div class="answerholder">' +
																						'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
																						'</div>' +
																						'</div>' +
																					 '<div class="promptoverlay"></div>');
																					 promptBoxSizing();
																					 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
																					 $('.answerleft').on('click', function() {
																						 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
																						 console.log('ERROR DELETING COMMENT', response);
																						 if(response.indexOf('destroyed') >= 0) {
																							var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
																							$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

																							commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
																							commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
																							$('#' + response.substring(10)).parent().parent().parent().remove();
																						 }
																						 $('.promptbox').remove();
																						 $('.promptoverlay').remove();
																					 });
																				 	});
																					$('.answerright').on('click', function() {
																						$('.promptbox').remove();
																						$('.promptoverlay').remove();
																					});
																					$('.promptoverlay').on('click', function() {
																						$('.promptbox').remove();
																						$('.promptoverlay').remove();
																					});
																					$('.promptcloser').on('click', function() {
																						$('.promptbox').remove();
																						$('.promptoverlay').remove();
																					});

																				});
																			}

								 											$('#' + obj[x].id).load(function() {
								 												if ($(this).height() > $(this).width()) {
								 													console.log("CHECKED LONGER");
								 													$(this).addClass('heightlong');
								 												};
								 											});

                                  $('span.comment-time').on('recurseupdateevent', function() {
                                    $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
                                  });
                                }
                              }
                            }
                          }).then(function() {
														var id = currentelem.parent().attr('id').substr(4);
														$('#post' + id + ' .commentsholder .Comments .loadstatus .currentloaded').html($('#post' + id + ' .commentsholder').children().size() - 1);
														console.log($('#post' + id + ' .commentsholder').children().size() - 1 , parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()));
														if($('#post' + id + ' .commentsholder').children().size() - 1 == parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html())) {
															console.log("full");
															$('#post' + id + ' .commentsholder .Comments .commentlength').html("No more comments");
															$('#post' + id + ' .commentsholder .Comments .commentlength').unbind('click');
															if(parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()) == 0) {
																$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
															}
														}
													});
                          currentelem.val("");
                        });

                      });
                    }, error: function(err) {
                        console.log("Unsuccessful Save");
                    }
                  });

									//un graying out
									$(this).removeClass('posting');
                  console.log("Id is", id);
                  console.log("comment saving");


                }
              });

              autosize($('textarea'), {append: false});
    //					console.log(contents[0].fetch().get("title"));
    //					Parse.Object.fetchAll(contents, {
    //					success: function(list) {
    //						console.log(list.length);
                //}, error: function(err) {
    //							console.log("Failed");
    //						}
    //					});
          //		console.log(postlist.length);
              console.log("Fetched");
      }
    }, error: function(error) {

    }
  });

}

//query to get a single post from id
function getPosttoFront(id, element) {

  var Title = Parse.Object.extend("Title");
  var Post = Parse.Object.extend("Post");
  var Comment = Parse.Object.extend("Comment");
	var Notification = Parse.Object.extend('Notifications');

  var query = new Parse.Query(Post);
  query.include("contents")
  query.include("Author");
  query.equalTo("objectId", id);
  query.limit(1);
  query.find({
    success: function(results) {
      console.log(results.length);
      for(var i = 0; i < results.length; ++i) {
				var id = results[i].id;
				if($('#' + id).length) continue;
				if($('#post' + id).length) continue;
				element.prepend('<div class=\"post\" id=\"post' + id + '\"></div>');
          console.log("Post createdAt", ($.now() - results[i].createdAt) / 3600000);
          var contents = results[i].get("contents");

          var list = [];
          var promises = [];
          for(var x = 0; x < list.length; ++i) {
            list.push('');
          }
              var timeago = getCurrentTime(results[i].createdAt);
							$('#post' + id).append('<div class="extrahidden"><img src="pictures/postoptions.png" /></div>\
							<div class="postextra"><img class="up" src="pictures/up.png"/><img class="down" src="pictures/down.png" /><img class="deletepost" src="pictures/delete.png" /></div>\
							<div class=\"post-header\"><div class="img-divgo"><img class="profilePic" src=\"pictures/testimage.png\" style=\"vertical-align:bottom;\"/>\
              </div><span class="timestamp" id="' +  results[i].createdAt + '">' + timeago + '</span>\
              <span class=\"Name\"></span>\
							<span class="pageName"> > Foreigners in Korea</span>\
              <span class=\"numericals\">\
							<div class="tag"></div>\
              <span class=\"upVotes\"></span>\
              </span></div>');

							if(!mobile) {

								$('.extrahidden').on('click', function(e) {
									e.stopPropagation();
								//	$(this).parent().children('.postextra').css('display', 'block');
									if($(this).parent().children('.postextra').css('right') == '-40px')
									$(this).parent().children('.postextra').animate({ right: "0px" }, 100 );
								});

								$('.postextra').on('click', function(e) {
									e.stopPropagation();
									$(this).parent().children('.postextra').css('display', 'block');
								});

								$('.postextra').on('click', function(e) {
									e.stopPropagation();
	//								$(this).parent().children('.postextra').animate({ right: "-40px" }, 100 );
								});

								$('.up').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').index(curelem) < 5 || curelem.prev() == undefined) {
										$(window).trigger('topevent');
									}
									console.log("Index of post", $('.post').index(curelem));

									setTimeout(function() {
										curelem.prev().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
									$('body,html').animate({scrollTop: curelem.prev().position().top - 55}, 100);
								//	$('body').scrollTop(curelem.prev().position().top - 55);
								});

								$('.down').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').length - $('.post').index(curelem) < 5 || curelem.next() == undefined) {
										$(window).trigger('bottomevent');
									}
									console.log("Index of post", $('.post').index(curelem));
									console.log(curelem.next().attr('class'));
									console.log(curelem.next().position().top);
									$('body,html').animate({scrollTop: curelem.next().position().top - 55}, 100);
									setTimeout(function() {
										curelem.next().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
								//	$('body').scrollTop(curelem.next().position().top - 55);
								});

								$(document).on('click', function() {
								//	$('.postextra').css('display', 'none');
									$('.postextra').animate({ right: "-40px" }, 50 );
								});
							}	else {

								$('.extrahidden').on('click', function(e) {
									e.stopPropagation();
									console.log("Extra hidden clicked");
								//	$(this).parent().children('.postextra').css('display', 'block');
									$(this).parent().children('.postextra').animate({ right: "0px" }, 100 );
								});

								$('.postextra').on('click', function(e) {
									e.stopPropagation();
									$(this).parent().children('.postextra').css('display', 'block');
								});

								$('.up').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').index(curelem) < 5 || curelem.prev() == undefined) {
										$(window).trigger('topevent');
									}
									console.log("Index of post", $('.post').index(curelem));

									setTimeout(function() {
										curelem.prev().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
									$('body,html').animate({scrollTop: curelem.prev().position().top - 55}, 100);
								//	$('body').scrollTop(curelem.prev().position().top - 55);
								});

								$('.down').on('click', function() {
									var curelem = $(this).parent().parent();
									if($('.post').length - $('.post').index(curelem) < 5 || curelem.next() == undefined) {
										$(window).trigger('bottomevent');
									}
									console.log("Index of post", $('.post').index(curelem));
									console.log(curelem.next().attr('class'));
									console.log(curelem.next().position().top);

									$('body,html').animate({scrollTop: curelem.next().position().top - 55}, 100);
									setTimeout(function() {
										curelem.next().children('.postextra').css('right', '0px');
										curelem.children('.postextra').css('right', '-40px');
									}, 110);
								//	$('body').scrollTop(curelem.next().position().top - 55);
								});

								$(document).on('click', function() {
								//	$('.postextra').css('display', 'none');
									$('.postextra').animate({ right: "-40px" }, 50 );
								});
							}

              console.log(contents.length);
              var author = results[i].get("Author");

							var tag = results[i].get("tag");

							if(tag == "") {
								$('#post'+id +' .post-header .tag').html("etc.");
							} else {
								$('#post'+id +' .post-header .tag').html(tag);
							}
							$('#post'+id +' .post-header .tag').on('click', function() {
								if($('#post'+id +' .post-header .tag').html() == 'etc.') {
									window.location.href="./tag.html?tag=";
								} else {
									window.location.href="./tag.html?tag=" + $('#post'+id +' .post-header .tag').html();
								}
							});

              $('span.timestamp').on('recurseupdateevent', function() {
                $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
              });

              $('#post'+id +' .post-header .Name').append(author.get("FirstName") + ' ' + author.get("LastName"));
							$('#post'+id +' .post-header .Name').addClass(author.id);

							//enabling delete post
							if(author.id == Parse.User.current().id) {
								$('#post' + id).children('.postextra').children('.deletepost').css('display', 'block');
								$('#post' + id).children('.postextra').children('.deletepost').on('click', function() {
									$('body').append('<div class="promptbox">' +
									 ' <button type="button" class="close promptcloser" aria-label="Close">' +
									 '	 <span aria-hidden="true">&times;</span>' +
									 ' </button>' +
									 ' <div class="Question">Are you sure that you want to delete this post?</div>' +
									 ' <div class="answerholder">' +
									 '	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
									 '</div>' +
									 '</div>' +
									'<div class="promptoverlay"></div>');

									var postid = $(this).parent().parent().attr('id').substr(4);

									promptBoxSizing();
									$('.answerleft').on('click', function() {
										Parse.Cloud.run('deletePost', {Post: postid}).then(function(response) {
											console.log(response);
											if(response.indexOf('Successfully') >= 0) {
												$('#post' + postid).css('display', 'none');
												$('.promptbox').remove();
												$('.promptoverlay').remove();
												$('body').append('<div class="promptbox">' +
												 ' <button type="button" class="close promptcloser" aria-label="Close">' +
												 '	 <span aria-hidden="true">&times;</span>' +
												 ' </button>' +
												 ' <div class="Question">Your post has successfully been deleted</div>' +
												 ' <div class="answerholder">' +
												 '	 <span class="answer oneanswer">OK</span>' +
												 '</div>' +
												 '</div>' +
												'<div class="promptoverlay"></div>');
												$('.promptoverlay').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.oneanswer').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.promptcloser').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
											} else { //failed to delete post
												$('.promptbox').remove();
												$('.promptoverlay').remove();
												$('body').append('<div class="promptbox">' +
												 ' <button type="button" class="close promptcloser" aria-label="Close">' +
												 '	 <span aria-hidden="true">&times;</span>' +
												 ' </button>' +
												 ' <div class="Question">There was a problem deleting your post. Please try again later.</div>' +
												 ' <div class="answerholder">' +
												 '	 <span class="answer oneanswer">OK</span>' +
												 '</div>' +
												 '</div>' +
												'<div class="promptoverlay"></div>');
												$('.promptoverlay').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.oneanswer').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
												$('.promptcloser').on('click', function() {
													$('.promptoverlay').remove();
													$('.promptbox').remove();
												});
											}
										});

										console.log(postid);

									});

									$('.answerright').on('click', function() {
										$('.promptbox').remove();
										$('.promptoverlay').remove();
									});

									$('.promptoverlay').on('click', function() {
										$('.promptbox').remove();
										$('.promptoverlay').remove();
									});

									$('.promptcloser').on('click', function() {
										$('.promptbox').remove();
										$('.promptoverlay').remove();
									});

								});

							}

							$('#post'+id +' .post-header .Name').on('click', function() {
								console.log($(this).attr('class').split(" ")[1]);
								window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
							});

              var newpic = author.get("ProfilePic");
              if(newpic == undefined) {
                  $('#post'+id +' .post-header .img-divgo .profilePic').attr('src', 'pictures/profile.png');
              } else {
                  $('#post'+id +' .post-header .img-divgo .profilePic').attr('src', newpic.url());
									$('#post'+id +' .post-header .img-divgo .profilePic').load(function() {
										if ($(this).height() > $(this).width()) {
											console.log("CHECKED LONGER");
											$(this).addClass('heightlong');
										};
									});
              }

							$('#post'+id +' .post-header .upVotes').append('<span class=\"number\"> ' + results[i].get("Upvotes").toString() +
							 '</span><a class=\"' + id + '\" href=\"\">' +
								'<img src="pictures/smileygray.png" class="smiley" /> </a>');

							$('#post'+id + ' .post-header .upVotes a').on('mouseover', function() {
								$(this).children('img').attr('src', "pictures/brightsmile.png");
							});

							$('#post'+id + ' .post-header .upVotes a').on('mouseout', function() {
								if ($(this).children('img').attr('id') != 'true') {
									$(this).children('img').attr('src', "pictures/smileygray.png");
								}
							});

							Parse.Cloud.run('Smiles', {Post: id}).then(function(smiles) {
								console.log("Smiles", smiles);
								$('#post'+id +' .post-header .upVotes .number').html(smiles);
							});

							Parse.Cloud.run('hasSmiled', {Post: id, User: Parse.User.current().id}).then(function(response) {
								console.log(id, Parse.User.current().id);
								console.log("smiled", response);
								if(response == true) {
									$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/brightsmile.png");
									$('#post'+id +' .post-header .upVotes a img').attr('id', 'true');
								} else {
									$('#post'+id +' .post-header .upVotes a').css('background-color', 'transparent');
									$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/smileygray.png");
									$('#post'+id +' .post-header .upVotes a img').attr('id', 'false');
								}
							});

							$('a.'+id).on('click', function(evt) {
								evt.preventDefault();
                console.log("Upvote Clicked");
								var id = $(this).attr('class');
								Parse.Cloud.run('SmileAt', {Post: id, User: Parse.User.current().id}).then(function(response) {
									console.log(response);
									if(response.smiled == true) {
										$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/brightsmile.png");
										$('#post'+id +' .post-header .upVotes a img').attr('id', 'true');
									} else {
										$('#post'+id +' .post-header .upVotes a').css('background-color', 'transparent');
										$('#post'+id +' .post-header .upVotes a img').attr('src', "pictures/smileygray.png");
										$('#post'+id +' .post-header .upVotes a img').attr('id', 'false');
									}
									$('#post'+id +' .post-header .upVotes .number').html(response.smiles);
								});
              });

              for(var x = 0; x < contents.length; ++x) {
                console.log("Going through:", x);
                if(contents[x].className == "Title") {
                  console.log("TITLE");
                  console.log(contents[x].get("title"));
                  $('#post'+contents[x].get("from")).append('<div class=\"title\">' + contents[x].get("title") + '</div>');
                  promises.push(contents[x].fetch({
                    success: function(obj) {
                      console.log(obj.get("from"));
                      list[x] = '<div class=\"title\">' + obj.get("title") + '</div>';
                      //$('#post'+obj.get("from")).append('<div class=\"title\">' + obj.get("title") + '</div>')
                    }, error: function(err) {

                    }
                  }));
                } else if (contents[x].className == 'Textarea') {
                  console.log("TEXTAREA");
                  console.log(contents[x].get("text"));
                  $('#post'+contents[x].get("from")).append('<div class=\"textarea\">' + contents[x].get("text") + '</div>');

									$('iframe').each(function() {
										var width = $(this).width();
										var height = $(this).height();
										var ratio = parseFloat(height) / parseFloat(width);
										$(this).attr('width', $(this).parent().width());
										$(this).attr('height', $(this).parent().width() * ratio);
										console.log('Setting iframe width and height');
									});
									promises.push(contents[x].fetch({
                    success: function(obj) {
                      list[x] = '<div class=\"textarea\">' + obj.get("text") + '</div>';
    //									$('#'+obj.get("from")).append('<div class=\"textarea\">' + obj.get("text") + '</div>')
                    }, error: function(err) {

                    }
                  }));
                } else if (contents[x].className == 'Picture') {
                  console.log("Picture");
                  $('#post'+contents[x].get("from")).append('<div class=\"elemholder\"><div class=\"imageholder\" id=\"' + contents[x].id + '\"></div></div>');
                  $('#'+contents[x].id).append('<img class=\"img-block ' + contents[x].id + '\" src=\"\"/>');
                  $('.'+contents[x].id).attr('src', contents[x].get("image").url());
									if(contents[x].get('class') != undefined) {
											$('.'+contents[x].id).addClass(contents[x].get('class'))
									}
									$('.'+contents[x].id).load(function() {
										console.log("Image loaded");
										$(this).css('display', 'inline-block');
										console.log("Image rectangle", this.getBoundingClientRect().height);
										$(this).parent().css('height', this.getBoundingClientRect().height);
										$(this).css('margin-top', Math.abs($(this).get(0).getBoundingClientRect().height - $(this).height()) / 2);

									});

									$('.elemholder').on('click', function() {
										$('#justblackbackground').css('display', 'block');
										$('#galleryoverlay').css('display','block');
										$('#actualimage').css('display', 'block');
										$('#actualimage').attr('src', $(this).children('.imageholder').children('img').attr('src'));
										if($(this).children('.imageholder').children('img').attr('class').split(' ').length > 2){
											$('#actualimage').addClass($(this).children('.imageholder').children('img').attr('class').split(' ')[2]);
											if(getRotationDegrees($('#actualimage')) % 180 != 0) {
												$('#actualimage').css('max-width', $('#galleryoverlay').height());
												$('#actualimage').css('max-height', $('#galleryoverlay').width());
											}
										}
										$(window).resize();
										galleryelem = $(this);
									});

                } else if (contents[x].className == 'Marker') {

                  console.log("Marker");
                  //get original post id from  the title or whatever that comes before

									var mapId = 'map' + contents[x].id;
									var postId = contents[0].get("from");
                  $('#post' + postId).append('<div  class="mapelement"><div class="maplabel">'
									+ contents[x].get('title') +
									'</div>' +
                  '<div id="' + mapId + '" class="mapblock">' +
                  '</div></div>');

									$('.mapelement').on('mouseover', function() {

										$(this).children('.maplabel').css('display', 'block');
									});

									$('.mapelement').on('mouseout', function() {

										$(this).children('.maplabel').css('display', 'none');
									});


                  console.log("zoom level", contents[x].get("zoomlevel"));
                  var mapcenter = [0, 0];
                  if(contents[x].get('center') != undefined) {
                      mapcenter = contents[x].get('center').split(' ');
                  } else {
                    mapcenter[0] = parseFloat(contents[x].get("location").latitude);
                    mapcenter[1] = parseFloat(contents[x].get("location").longitude);
                  }


                  console.log("ID for MAPBLOCK", contents[x].id);

                  console.log(mapcenter);

									console.log("The map id", mapId);

									//changing the width after adding to the maincontainer

									console.log($('#postviewer').children().children('.mapelement').width());

                  var blockmap = new google.maps.Map(document.getElementById(mapId), {
                    center: {lat: parseFloat(mapcenter[0]), lng: parseFloat(mapcenter[1])},
                    mapTypeControl: false,
                    scaleControl: false,
                    streetViewControl: false,
                    zoomControl: false,
                    zoom: contents[x].get("zoomlevel") - 2,
                    draggable: false,
                    scrollwheel: false,
										disableDoubleClickZoom: true
                  });

									if(mobile) {
										blockmap.setZoom(Math.max(blockmap.getZoom() - 2, 0));
									}

									blockmap.setCenter({lat: parseFloat(mapcenter[0]), lng: parseFloat(mapcenter[1])});

									var type = contents[x].get("type");

                  var blockmarker = new google.maps.Marker({
                    map: blockmap,
                    position: {lat: parseFloat(contents[x].get("location").latitude),
                              lng: parseFloat(contents[x].get("location").longitude)
                    },
										icon: markerimage,
										title: contents[x].id
                  });

									if(type == 'food') {
								    blockmarker.setIcon(foodimage);
								  } else if (type == 'hotel') {
								    blockmarker.setIcon(hotelimage);
								  } else if (type == 'tourist') {
								    blockmarker.setIcon(touristimage);
								  } else if (type == 'transportation') {
								    blockmarker.setIcon(transportationimage);
								  } else if(type == 'entertainment') {
								    blockmarker.setIcon(entertainmentimage)
								  }

                  blockmap.addListener('click', function() {
                    console.log("Clicked on embedmap");
										console.log(blockmarker.getTitle());
                    $('#mapholder').fadeIn('fast');
                    $('#overlay').fadeIn('fast');

										markerfocused = true;
										autoclickmarker = blockmarker.getTitle();

										if($('#map').length) {
											$('#postviewer').empty();
											$('#overlayfull').fadeOut('fast');
											map.setZoom(this.getZoom() + 1);
											map.setCenter(this.getCenter());
											google.maps.event.trigger(map, 'dragend');
										}
                    else if(!loaded) {
                        mainpagemap = initMapblock('mapviewer', this.getCenter(), new google.maps.Marker({
                          map: null,
                          position: blockmarker.getPosition()
                        }));
                        mainpagemap.setZoom(this.getZoom() + 1);
                        loaded = true;
                    }
										mainpagemap.setCenter(this.getCenter());
										mainpagemap.setZoom(this.getZoom() + 1);

										google.maps.event.trigger(mainpagemap, 'dragend');
										google.maps.event.trigger(markertomarkerid['marker' + blockmarker.getTitle()], 'click');
                  });


							//		google.maps.event.trigger(blockmap, 'resize');

									console.log("reload attempted");

                }


              }
              for(var x = 0; x < contents.length; ++x) {
                  $('#post'+id).append(list[x]);
                  console.log(list[x]);
              }

              $('#post'+id).css('display', 'block');

              //Adding commentholder section to hold the comments of post
          /*		$('#'+id).append('<div class="textarea commentsholder"><div class="commentelem"><div class="commentheader">' +
              '<img class="commentProfile img-circle" src="pictures/profile.png" style="width: 35px; height: 35px;"/>' +
               '<span class="name"> </span><span class="comment-time"> 3 minutes ago</span></div>' +
               '<div class="actualcomment">Actual comment Actual comment Actual comment' +
               ' Actual comment Actual comment</div></div></div>');
               */
              $('#post'+id).append('<div class="textarea commentsholder"><span class=\"Comments\"></span></div>');
              $('#post'+id).append('<textarea rows="1" class=\"comment ' + id + '\" placeholder=\"Make a comment\" spellcheck=\"false\"></textarea>');

							var commentlength = 0;

							Parse.Cloud.run('commentnumber', {Post: results[i].id}).then(function(response) {
								var number = response.number;
								commentlength = number;
								console.log("Comment number", number);
								if(number > 0) {
										$('#post' + id + ' .commentsholder .Comments .loadstatus .total').html(number);
								} else {
									$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
								}

							});

							var commentquery = new Parse.Query("Comment");
							$('#post'+id + ' .commentsholder').attr('id', new Date());
							$('#post'+id + ' .commentsholder .Comments').attr('id', results[i].createdAt);
							commentquery.equalTo("Post", results[i]);
							commentquery.include("Author");
							commentquery.descending("createdAt");
							commentquery.limit(3);
							commentquery.find({
								success: function(obj) {
									console.log(obj.length, "Comments found");
									var currentelem = $('#post'+id + ' .commentsholder .commentlength');
									//display the commentsholder block only when there are comments to load
									if(obj.length > 0) {
										console.log("Making visible");
										console.log(currentelem.parent().parent().parent().children('.commentsholder').attr('class'));
										currentelem.parent().parent().parent().children('.commentsholder').css('display', 'block');
										for(var x = 0; x < obj.length; ++x) {
											//checking if a replica id is present in the DOM
											if($('#' + obj[x].id).length) {
												continue;
											}
											if(obj[x].createdAt < new Date($('#post'+id + ' .commentsholder').attr('id'))) {
												$('#post'+id + ' .commentsholder').attr('id', obj[x].createdAt);
												console.log("Changed");
											}
											if(obj[x].createdAt > new Date($('#post'+id + ' .commentsholder .Comments').attr('id'))) {
												$('#post'+id + ' .commentsholder .Comments').attr('id', obj[x].createdAt);
											}

											var timeago = getCurrentTime(obj[x].createdAt);

											currentelem.parent().parent().parent().children('.commentsholder').children('.Comments').after('<div class="commentelem"><div class="commentheader">' +
											'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
											 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
												+ timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
											 '<div class="actualcomment">' + obj[x].get("comment") +
											 '</div></div>');
											$('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
											$('.commentelem').on('mouseover', function() {
												$(this).children('.commentheader').children('.deletecomment').css('display', 'block');
												console.log('mouse entered comment');
											});
											$('.commentelem').on('mouseout', function() {
												$(this).children('.commentheader').children('.deletecomment').css('display', 'none');
											});
											$('.name').on('click', function() {
												console.log($(this).attr('class').split(" ")[1]);
												window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
											});
											if(Parse.User.current().id == obj[x].get("Author").id) {
												 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
												 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
													 $('body').append('<div class="promptbox">' +
														' <button type="button" class="close promptcloser" aria-label="Close">' +
														'	 <span aria-hidden="true">&times;</span>' +
														' </button>' +
														' <div class="Question">Are you sure that you want to delete the comment?</div>' +
														' <div class="answerholder">' +
														'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
														'</div>' +
														'</div>' +
													 '<div class="promptoverlay"></div>');
													 promptBoxSizing();
													 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
													 $('.answerleft').on('click', function() {
														 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
														 console.log('ERROR DELETING COMMENT', response);
														 if(response.indexOf('destroyed') >= 0) {
															var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
															$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

															commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
															commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
															$('#' + response.substring(10)).parent().parent().parent().remove();
														 }
														 $('.promptbox').remove();
														 $('.promptoverlay').remove();
													 });
													});
													$('.answerright').on('click', function() {
														$('.promptbox').remove();
														$('.promptoverlay').remove();
													});
													$('.promptoverlay').on('click', function() {
														$('.promptbox').remove();
														$('.promptoverlay').remove();
													});
													$('.promptcloser').on('click', function() {
														$('.promptbox').remove();
														$('.promptoverlay').remove();
													});

												});
											}

											$('#' + obj[x].id).load(function() {
												if ($(this).height() > $(this).width()) {
													console.log("CHECKED LONGER");
													$(this).addClass('heightlong');
												};
											});

											$('span.comment-time').on('recurseupdateevent', function() {
												$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
											});
										}

									}
								}
							}).then(function() {
								$('#post' + id + ' .commentsholder .Comments .loadstatus .currentloaded').html($('#post' + id + ' .commentsholder').children().size() - 1);
								console.log($('#post' + id + ' .commentsholder').children().size() - 1 , parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()));
								if($('#post' + id + ' .commentsholder').children().size() - 1 == parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html())) {
									console.log("full");
									$('#post' + id + ' .commentsholder .Comments .commentlength').html("No more comments");
									$('#post' + id + ' .commentsholder .Comments .commentlength').unbind('click');
									if(parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()) == 0) {
										$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
									}
								}
							});


							$('#post'+id +' .commentsholder .Comments').append('\
							 <span class=\"commentlength\">View more comments</span><span class="loadstatus"><span class="currentloaded">' +
							0 + '</span> / <span class="total">' + commentlength + '</span></span>');

							//load all comments on the click of view comments
							$('#post'+id + ' .commentsholder .commentlength').on('click', function() {
								console.log($(this).parent().parent().parent().attr('id'));

								//currentelem buffer to reference the button span
								var currentelem = $(this);
								var commentquery = new Parse.Query("Comment");
								var postquery = new Parse.Query("Post");
								var currentpost;
								postquery.equalTo("objectId", $(this).parent().parent().parent().attr('id').substr(4));
								postquery.find({
									success: function(obj) {
										currentpost = obj[0];
										console.log("Comment post found");
									}, error: function(err) {

									}
								}).then(function() {
									commentquery.equalTo("Post", currentpost);
									commentquery.descending("createdAt");
									commentquery.include("Author");
									commentquery.lessThan('createdAt', new Date(currentelem.parent().parent().attr('id')));
									commentquery.limit(5);
									commentquery.find({
										success: function(obj) {
											console.log(obj.length, "Comments found");

											//display the commentsholder block only when there are comments to load
											if(obj.length > 0) {
												console.log("Making visible");
												console.log(currentelem.parent().parent().parent().children('.commentsholder').attr('class'));
												currentelem.parent().parent().parent().children('.commentsholder').css('display', 'block');
												for(var x = 0; x < obj.length; ++x) {
													//checking if a replica id is present in the DOM
													if($('#' + obj[x].id).length) {
														continue;
													}

													var timeago = getCurrentTime(obj[x].createdAt);

													currentelem.parent().parent().parent().children('.commentsholder').children('.Comments').after('<div class="commentelem"><div class="commentheader">' +
													'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
													 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
													  + timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
													 '<div class="actualcomment">' + obj[x].get("comment") +
													 '</div></div>');
													$('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
													$('.commentelem').on('mouseover', function() {
														$(this).children('.commentheader').children('.deletecomment').css('display', 'block');
													 	console.log('mouse entered comment');
													});
													$('.commentelem').on('mouseout', function() {
														$(this).children('.commentheader').children('.deletecomment').css('display', 'none');
													});
													$('.name').on('click', function() {
														console.log($(this).attr('class').split(" ")[1]);
														window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
													});
													if(Parse.User.current().id == obj[x].get("Author").id) {
														 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
														 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
															 $('body').append('<div class="promptbox">' +
																' <button type="button" class="close promptcloser" aria-label="Close">' +
																'	 <span aria-hidden="true">&times;</span>' +
																' </button>' +
																' <div class="Question">Are you sure that you want to delete the comment?</div>' +
																' <div class="answerholder">' +
																'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
																'</div>' +
																'</div>' +
															 '<div class="promptoverlay"></div>');
															 promptBoxSizing();
															 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
															 $('.answerleft').on('click', function() {
																 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
																 console.log('ERROR DELETING COMMENT', response);
																 if(response.indexOf('destroyed') >= 0) {
																	var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
																	$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

																	commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
																	commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
																	$('#' + response.substring(10)).parent().parent().parent().remove();
																 }
																 $('.promptbox').remove();
																 $('.promptoverlay').remove();
															 });
															});
															$('.answerright').on('click', function() {
																$('.promptbox').remove();
																$('.promptoverlay').remove();
															});
															$('.promptoverlay').on('click', function() {
																$('.promptbox').remove();
																$('.promptoverlay').remove();
															});
															$('.promptcloser').on('click', function() {
																$('.promptbox').remove();
																$('.promptoverlay').remove();
															});

														});
													}

													$('#' + obj[x].id).load(function() {
														if ($(this).height() > $(this).width()) {
															console.log("CHECKED LONGER");
															$(this).addClass('heightlong');
														};
													});

													//updating the id saved date
													if(obj[x].createdAt < new Date(currentelem.parent().parent().parent().children('.commentsholder').attr('id'))) {
														currentelem.parent().parent().parent().children('.commentsholder').attr('id', obj[x].createdAt);
														console.log("Changed");
													}

													$('span.comment-time').on('recurseupdateevent', function() {
														$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
													});
												}

											}
										}
									}).then(function() {
										$('#post' + id + ' .commentsholder .Comments .loadstatus .currentloaded').html($('#post' + id + ' .commentsholder').children().size() - 1);
										console.log($('#post' + id + ' .commentsholder').children().size() - 1 , parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()));
										if($('#post' + id + ' .commentsholder').children().size() - 1 == parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html())) {
											console.log("full");
											$('#post' + id + ' .commentsholder .Comments .commentlength').html("No more comments");
											$('#post' + id + ' .commentsholder .Comments .commentlength').unbind('click');
											if(parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()) == 0) {
												$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
											}
										}
									});

									currentelem.parent().parent().parent().children('.commentsholder').on('recurseupdateevent', function() {

										commentquery.find({
											success: function(obj) {
												console.log(obj.length, "Comments found");

												//display the commentsholder block only when there are comments to load
												if(obj.length > 0) {
													console.log("Making visible");
													console.log(currentelem.parent().parent().parent().children('.commentsholder').attr('class'));
													currentelem.parent().parent().parent().children('.commentsholder').css('display', 'block');
													for(var x = 0; x < obj.length; ++x) {
														//checking if a replica id is present in the DOM
														if($('#post' + obj[x].id).length) {
															continue;
														}
														var timeago = getCurrentTime(obj[x].createdAt);

														currentelem.parent().parent().parent().children('.commentsholder').append('<div class="commentelem"><div class="commentheader">' +
														'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
														 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
														  + timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
														 '<div class="actualcomment">' + obj[x].get("comment") +
														 '</div></div>');
																 $('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
					 											$('.commentelem').on('mouseover', function() {
					 												$(this).children('.commentheader').children('.deletecomment').css('display', 'block');
					 												console.log('mouse entered comment');
					 											});
					 											$('.commentelem').on('mouseout', function() {
					 												$(this).children('.commentheader').children('.deletecomment').css('display', 'none');
					 											});
																$('.name').on('click', function() {
																	console.log($(this).attr('class').split(" ")[1]);
																	window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
																});
																if(Parse.User.current().id == obj[x].get("Author").id) {
																	 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
																	 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
																		 $('body').append('<div class="promptbox">' +
																			' <button type="button" class="close promptcloser" aria-label="Close">' +
																			'	 <span aria-hidden="true">&times;</span>' +
																			' </button>' +
																			' <div class="Question">Are you sure that you want to delete the comment?</div>' +
																			' <div class="answerholder">' +
																			'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
																			'</div>' +
																			'</div>' +
																		 '<div class="promptoverlay"></div>');
																		 promptBoxSizing();
																		 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
																		 $('.answerleft').on('click', function() {
																			 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
																			 console.log('ERROR DELETING COMMENT', response);
																			 if(response.indexOf('destroyed') >= 0) {
																				var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
																				$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

																				commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
																				commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
																				$('#' + response.substring(10)).parent().parent().parent().remove();
																			 }
																			 $('.promptbox').remove();
																			 $('.promptoverlay').remove();
																		 });
																	 	});
																		$('.answerright').on('click', function() {
																			$('.promptbox').remove();
																			$('.promptoverlay').remove();
																		});
																		$('.promptoverlay').on('click', function() {
																			$('.promptbox').remove();
																			$('.promptoverlay').remove();
																		});
																		$('.promptcloser').on('click', function() {
																			$('.promptbox').remove();
																			$('.promptoverlay').remove();
																		});

																	});
																}

					 											$('#' + obj[x].id).load(function() {
					 												if ($(this).height() > $(this).width()) {
					 													console.log("CHECKED LONGER");
					 													$(this).addClass('heightlong');
					 												};
					 											});

														$('span.comment-time').on('recurseupdateevent', function() {
															$(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
														});
													}

												}
											}
										});
									});
								});

								console.log("load comment clicked");
							});


              $('textarea.'+id).keydown(function(event) {
                //buffer to reference the current element
                var currentelem = $(this);
                if(event.keyCode == 13 && !event.shiftKey) {
                  event.preventDefault();

									if($(this).val() == '') {
										return;
									}

									$(this).blur();
									//graying out area
									$(this).addClass('posting');

                  var id = this.className.split(' ')[1];
                  $(this).val($(this).val().trim());
                  var text = $(this).val();
                  console.log("Actual comment", text);
                  console.log("Enter clicked");
                  var comment = new Comment();
                  var query = new Parse.Query(Post);
                  query.equalTo("objectId", id);
                  query.find({
                    success: function(result) {
                      console.log("length of query", result.length);
                      comment.set("Post", result[0]);
                      console.log(text);
                      comment.set("comment", text);
                      comment.set("Author", Parse.User.current());
                      console.log("Pointer SET");
                      comment.save().then(function() {
												Parse.Cloud.run('commentnumber', {Post: currentelem.parent().attr('id').substr(4)}).then(function(response) {
													var number = response.number;
													commentlength = number;
													console.log("Comment number", number);
													if(number > 0) {
															$('#post' + currentelem.parent().attr('id').substr(4) + ' .commentsholder .Comments .loadstatus .total').html(number);
													} else {
														$('#post' + currentelem.parent().attr('id').substr(4) + ' .commentsholder .Comments .commentlength').html("No comments");
													}

												});
                        var newquery = new Parse.Query("Comment");
                        result[0].set("Comments", result[0].get("Comments") + 1);
                        console.log("Comment number saved");
                        result[0].save().then(function() {
                          console.log("Changing", result[0].get("Comments"));
                          var query = new Parse.Query(Comment);
                          query.equalTo("Post", result[0]);
                          query.find({
                            success: function(obj) {
                              console.log("Number of comments", obj.length);
                              $('#post' + id + ' .post-header .Comments .commentlength').html(' ' + obj.length);
                            }, error: function(err) {

                            }
                          });

                        //	window.location.href = "./mainpage.html";
                        });

												if(Parse.User.current().id != result[0].get("Author").id) {
													//sending a notification
													var notification = new Notification();
													notification.set("notificationFrom", Parse.User.current().id);
													notification.set("notificationTo", result[0].get("Author").id);
													notification.set("type", "comment");
													notification.set("checked", false);
													notification.set("postid", result[0].id);
													notification.save();
												}

                      }).then(function() {
                        var commentquery = new Parse.Query("Comment");
                        var postquery = new Parse.Query("Post");
                        var currentpost;
                        postquery.equalTo("objectId", currentelem.parent().attr('id').substr(4));
                        postquery.find({
                          success: function(obj) {
                            currentpost = obj[0];

                          }, error: function(err) {

                          }
                        }).then(function() {
                          commentquery.equalTo("Post", currentpost);
                          commentquery.ascending("createdAt");
                          commentquery.include("Author");
													commentquery.greaterThan('createdAt', new Date(currentelem.parent().children('.commentsholder').children('.Comments').attr('id')));
                          commentquery.limit(10);
                          commentquery.find({
                            success: function(obj) {
                              console.log(obj.length, "Comments found");

                              if(obj.length > 0) {
                                currentelem.parent().children('.commentsholder').css('display', 'block');
                                for(var x = 0; x < obj.length; ++x) {
                                  if($('#' + obj[x].id).length) {
                                    continue;
                                  }
                                  var timeago = getCurrentTime(obj[x].createdAt);

                                  currentelem.parent().children('.commentsholder').append('<div class="commentelem"><div class="commentheader">' +
																	'<div class="commentProfile"><img class="commentimage" src="pictures/profile.png" id="' + obj[x].id + '"/></div>' +
																	 '<span class="name ' + obj[x].get("Author").id + '">'+ obj[x].get("Author").get("FirstName") + " " + obj[x].get("Author").get("LastName") + '</span><span class="comment-time" id="' + obj[x].createdAt + '">'
																	  + timeago + '</span><button type="button" class="close deletecomment" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
																	 '<div class="actualcomment">' + obj[x].get("comment") +
																	 '</div></div>');

																			 $('#' + obj[x].id).attr("src", obj[x].get("Author").get("ProfilePic").url());
								 											$('.commentelem').on('mouseover', function() {
								 												$(this).children('.commentheader').children('.deletecomment').css('display', 'block');
								 												console.log('mouse entered comment');
								 											});
								 											$('.commentelem').on('mouseout', function() {
								 												$(this).children('.commentheader').children('.deletecomment').css('display', 'none');
								 											});
																			$('.name').on('click', function() {
																				console.log($(this).attr('class').split(" ")[1]);
																				window.location.href="./author.html?author=" + $(this).attr('class').split(" ")[1];
																			});
																			if(Parse.User.current().id == obj[x].get("Author").id) {
																				 $('#' + obj[x].id).parent().parent().children('.deletecomment').css('visibility', 'visible');
																				 $('#' + obj[x].id).parent().parent().children('.deletecomment').on('click', function() {
																					 $('body').append('<div class="promptbox">' +
																						' <button type="button" class="close promptcloser" aria-label="Close">' +
																						'	 <span aria-hidden="true">&times;</span>' +
																						' </button>' +
																						' <div class="Question">Are you sure that you want to delete the comment?</div>' +
																						' <div class="answerholder">' +
																						'	 <span class="answer answerleft">YES</span><span class="answer answerright">NO</span>' +
																						'</div>' +
																						'</div>' +
																					 '<div class="promptoverlay"></div>');
																					 promptBoxSizing();
																					 var commentid = $(this).parent().children('.commentProfile').children('img').attr('id');
																					 $('.answerleft').on('click', function() {
																						 Parse.Cloud.run('deleteComment', {commentid: commentid}).then(function(response) {
																						 console.log('ERROR DELETING COMMENT', response);
																						 if(response.indexOf('destroyed') >= 0) {
																							var commentdestroy = $('#' + response.substring(10)).parent().parent().parent();
																							$('#' + response.substring(10)).parent().parent().parent().fadeOut('fast');

																							commentdestroy.parent().children('.Comments').children('.loadstatus').children('.currentloaded').html(commentdestroy.parent().children('.Comments').children('.commentelem').length);
																							commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html(parseInt(commentdestroy.parent().children('.Comments').children('.loadstatus').children('.total').html()) - 1);
																							$('#' + response.substring(10)).parent().parent().parent().remove();
																						 }
																						 $('.promptbox').remove();
																						 $('.promptoverlay').remove();
																					 });
																				 	});
																					$('.answerright').on('click', function() {
																						$('.promptbox').remove();
																						$('.promptoverlay').remove();
																					});
																					$('.promptoverlay').on('click', function() {
																						$('.promptbox').remove();
																						$('.promptoverlay').remove();
																					});
																					$('.promptcloser').on('click', function() {
																						$('.promptbox').remove();
																						$('.promptoverlay').remove();
																					});

																				});
																			}

								 											$('#' + obj[x].id).load(function() {
								 												if ($(this).height() > $(this).width()) {
								 													console.log("CHECKED LONGER");
								 													$(this).addClass('heightlong');
								 												};
								 											});
                                  $('span.comment-time').on('recurseupdateevent', function() {
                                    $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
                                  });
                                }
                              }
                            }
                          }).then(function() {
														var id = currentelem.parent().attr('id').substr(4);
														$('#post' + id + ' .commentsholder .Comments .loadstatus .currentloaded').html($('#post' + id + ' .commentsholder').children().size() - 1);
														console.log($('#post' + id + ' .commentsholder').children().size() - 1 , parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()));
														if($('#post' + id + ' .commentsholder').children().size() - 1 == parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html())) {
															console.log("full");
															$('#post' + id + ' .commentsholder .Comments .commentlength').html("No more comments");
															$('#post' + id + ' .commentsholder .Comments .commentlength').unbind('click');
															if(parseInt($('#post' + id + ' .commentsholder .Comments .loadstatus .total').html()) == 0) {
																$('#post' + id + ' .commentsholder .Comments .commentlength').html("No comments");
															}
														}
													});
                          currentelem.val("");
                        });

                      });
                    }, error: function(err) {
                        console.log("Unsuccessful Save");
                    }
                  });

									//un graying out
									$(this).removeClass('posting');
                  console.log("Id is", id);
                  console.log("comment saving");


                }
              });

              autosize($('textarea'), {append: false});
    //					console.log(contents[0].fetch().get("title"));
    //					Parse.Object.fetchAll(contents, {
    //					success: function(list) {
    //						console.log(list.length);
                //}, error: function(err) {
    //							console.log("Failed");
    //						}
    //					});
          //		console.log(postlist.length);
              console.log("Fetched");
      }
    }, error: function(error) {

    }
  });

}

function bottomDetect(elem) {
	$(elem).scroll(function() {
		if($(document).height() > $(window).height()) {
			if($(elem).scrollTop() + $(elem).height() > $(document).height() - 5) {
					$(elem).trigger('bottomevent');
					console.log("bottom reached");

			}
		}
 	});
}

function topDetect(elem) {
	$(elem).scroll(function() {
		if($(elem).scrollTop() == 0) {
			$(elem).trigger('topevent');
			console.log("top reached");

		}
	});
}

var month = new Array();
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sep";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";

function getDatelabel(d) {
	var datelabel = (month[d.getMonth()]) + ' ' + d.getDate() + ', ' + d.getFullYear();
	return datelabel;
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function timerUpdate() {
	$('span').trigger('recurseupdateevent');
	console.log("Event fired");
	setTimeout(timerUpdate, 10000);
}

function basename(path) {
   return path.split('/').reverse()[0];
}
