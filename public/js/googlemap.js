var map;

var markers = [];
var path;// = new google.maps.MVCArray;
var polygon;
var lastpoint;

var linepath;
var polyline;
var linemarkers = [];
var lastlinepoint;

var image;

//temporary variable to save markeritem and markerlabel
var mapitem;
var markerlabel;
var lowerlabel;
var markertype;

//temporary item to enable selection of marker that is already made
var selected = false;

//marker id to associated array
var markerdic = {};

//marker id to load post data
var markerpost = {};

//marker dictionary to keep loaded
var markertomarkerid = {};

var markerloaded = {};

var autoclickmarker = '';
var markerfocused = false;

var loaded = false;

//title items for sidebar
var markertotitle = {};

var justmarker;

var Post = Parse.Object.extend("Post");
var Marker = Parse.Object.extend("Marker");
var Route = Parse.Object.extend("Route");
var Polygon = Parse.Object.extend("Polygon");
var Polyline = Parse.Object.extend("Polyline");
var gonPoint = Parse.Object.extend("gonPoint");
var linePoint = Parse.Object.extend("linePoint");

//objects in current scope ready to be added
var objects = [];

//flag to check if a mapitem is set
var itemset = false;

var settingmarker = false;

var positionmarker;

//buffer for labeler text
var textbuf = '';
var lastbufquery = 1000;

var red = 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png';
var blue = 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1';

var selectedmarkerimage = {
  url: 'pictures/selectedmarker.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
};

var foodselectedimage = {
  url: 'pictures/foodselected.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
};

var hotelselectedimage = {
  url: 'pictures/hotelselected.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
};

var entertainmentselectedimage = {
  url: 'pictures/entertainmentselected.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
};

var touristselectedimage = {
  url: 'pictures/touristselected.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
};

var transportationselectedimage = {
  url: 'pictures/transportationselected.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
};

var markerimage= {
  url: 'pictures/cleanmarker.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
};

var foodimage = {
  url: 'pictures/foodframed.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
}

var hotelimage = {
  url: 'pictures/hotelframed.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
}

var entertainmentimage = {
  url: 'pictures/amusementframed.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
}

var touristimage = {
  url: 'pictures/touristframed.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
}

var transportationimage = {
  url: 'pictures/transportationframed.png',
  size: new google.maps.Size(32,50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12,40),
  scaledSize: new google.maps.Size(24, 40)
}

var positionmarkerimage = {
  url: 'pictures/memarker.png',
  size: new google.maps.Size(32, 50),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(12, 40),
  scaledSize: new google.maps.Size(24, 40)
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
 infoWindow.setPosition(pos);
 infoWindow.setContent(browserHasGeolocation ?
											 'Error: The Geolocation service failed.' :
											 'Error: Your browser doesn\'t support geolocation.');
}

$(window).resize(function() {
  if($('.bottomliner').length) {
      $('#map').css("height", $('#light').height() - $('.bottomliner').height() + 'px');
  }

  if (!mobile) {
    $('#map').css("width", $('#map').parent().width() - $('#sidebarholder').outerWidth());
  } else {
    $('#map').css("height", $('#map').parent().height() - $('#sidebarholder').outerHeight());
  }

  $('#markerlabeling').css('left', $(window).width() / 2 - $('#markerlabeling').width() / 2 + 'px');
});

$(document).ready( function() {

  if (!mobile) {
    $('#map').css("width", $('#map').parent().width() - $('#sidebarholder').outerWidth());
  } else {
    $('#map').css("height", $('#map').parent().height() - $('#sidebarholder').outerHeight());
  }

  var customevent = jQuery.Event();

  $('#done').on('click', function() {
    if(itemset) {
      $('.post').append('<div  class="mapelement"><button type="button" class="close mapcloser" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '<div id="' + elemnum + '" class="mapblock">' +
      '</div></div>');

/*
      //closer animate?
      $('#' + elemnum).on('mouseover', function() {
        $(this).prev().css('visibility', 'visible');
        console.log("closer showing");
      });

      //closer hide
      $('#' + elemnum).on('mouseout', function() {
        $(this).prev().css('visibility', 'hidden');
      });
      */

      $('#' + elemnum).prev().on('click', function() {
        $(this).parent().css('display', 'none');
        undolist.push($(this).next().attr('id'));
        if($(this).parent().next().hasClass('elem')) {
          $(this).parent().next().css('display', 'none');
          undolist.push($(this).parent().next().children('textarea').attr('id'));
        }
      });


      $('#light').fadeOut("slow");
      $('#fade').fadeOut('slow');
      var blockmap = new google.maps.Map(document.getElementById(elemnum), {
          center: map.getCenter(),
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          zoomControl: false,
          zoom: map.getZoom() -1,
      });

      var newitem = new google.maps.Marker({
        map: mapitem.getMap(),
        position: mapitem.getPosition(),
        title: mapitem.getTitle(),
        icon: mapitem.getIcon()
      });
      newitem.setMap(blockmap);


    //  newitem.setIcon(red);

      itemset = false;
      settingmarker = false;
      mapitem = null;

      var marker = new Marker();
      var point = new Parse.GeoPoint({latitude: newitem.getPosition().lat(), longitude: newitem.getPosition().lng()});
      marker.set("location", point);
      marker.set("elemnum", elemnum);
      marker.set("zoomlevel", blockmap.getZoom());
      marker.set("title", markerlabel);
      marker.set("type", markertype);
      marker.set("lowertitle", lowerlabel);
      marker.set('center', blockmap.getCenter().lat().toString() + ' ' + blockmap.getCenter().lng().toString());
      marker.set('Author', Parse.User.current());
      console.log(blockmap.getCenter().lat().toString() + ' ' + blockmap.getCenter().lng().toString());

      elemnum++;

      $('#addtext').click();
      //checking if it is a marker already on the database
      if(selected) {
        marker.set("title", newitem.getTitle());
        marker.set("checked", "yes");
        selected = false;
        var query = new Parse.Query(Marker);
        query.equalTo("objectId", newitem.getTitle());
        query.first({
          success: function(results) {
            marker = results;
            console.log("found");
          }, error: function(err) {

          }
        }).then(function() {

          //      objects.push(marker);
          postlist.push(marker);
        }, function(err) {

        });
      } else {

          var bounds = new google.maps.LatLngBounds();

          bounds.extend(newitem.getPosition());

          google.maps.event.addListener(blockmap, 'zoom_changed', function() {
            marker.set("zoomlevel", blockmap.getZoom());

            console.log("zoom reset");
          });

          google.maps.event.addListener(blockmap, 'center_changed', function() {
            marker.set('center', blockmap.getCenter().lat().toString() + ' ' + blockmap.getCenter().lng().toString());

          });

          google.maps.event.addListener(newitem, 'position_changed', function() {
            var point = new Parse.GeoPoint({latitude: newitem.getPosition().lat(), longitude: newitem.getPosition().lng()});
            marker.set("location", point);
            console.log("point reset");
          });


        //      objects.push(marker);
        if($('#post').length == 1) {
          postlist.push(marker);
        }
        justmarker = marker;
      }


    } else {
      $('#light').fadeOut("slow");
      $('#fade').fadeOut('slow');
    }

  });

  $('#label').on('click', function() {
    $('#markerlabeling').fadeIn('fast');
    $('#labelingbackground').fadeIn('fast');
    $('#labeler').focus();
  });

    $('#addmarker').on('customevent', function(e){
      console.log("clicked");
//      $(this).css('background-color', '#a0b7da');
      $(this).css('background-color', '#d6ddde');
/*      $(this).animate({
        opacity: 0
      }, 500);*/
    //  $(this).hide(300);
      $(this).fadeOut(500);
    //  $(this).css('display', 'none');
    });
    $('#addshape').on('customevent', function(e){
//      $(this).css('background-color', '#a0b7da');
      $(this).css('background-color', '#d6ddde');
/*      $(this).animate({
        width: 0

        }, {duration: 500, complete: function() {
          $(this).css('display', 'none');
        }
      });*/
      //$(this).hide(300);
    //  $(this).fadeOut(500);
      //  css('display', 'none');
    });
    $('#addroute').on('customevent', function(e){
//      $(this).css('background-color', '#a0b7da');
      $(this).css('background-color', '#d6ddde');
/*      $(this).animate({
        opacity: 0
      }, 500);*/
      //$(this).hide(300);
    //  $(this).fadeOut(500);
      //$(this).css('display', 'none');
    });



    var shapeclicked = false;

    $('#addshape').on('click', function() {
      if(!shapeclicked) {

        //setting the mapitem to the polygon on screen
        mapitem = polygon;

        //set itemset flag to true
        itemset = true;
        $(this).css('background-color', '#12199d');
        google.maps.event.clearListeners(map, 'mouseout');
        google.maps.event.clearListeners(map, 'click');
        google.maps.event.clearListeners(map, 'mousemove');
        google.maps.event.addListener(map, 'click', addPoint);
        polygon.setMap(map);
        //user friendly follow of mouse
        google.maps.event.addListener(map, 'mousemove', function(event) {
          if(lastpoint == (path.length - 1)) {
            path.insertAt(path.length, event.latLng);

  //				    markers.push(marker);
  //				    marker.setTitle("#" + path.length);
          } else if (lastpoint < (path.length - 1)) {
            path.setAt(path.length - 1, event.latLng);
  //	  			markers[path.length - 1].setPosition(event.latLng);
          }
        });

        google.maps.event.addListener(map, 'mouseout', function(event) {
          if(lastpoint < (path.length - 1)) {
            path.removeAt(path.length - 1);
          }
        });
        shapeclicked = true;
      } else {
        $(this).css('background-color', '#a0b7da');
      google.maps.event.clearListeners(map, 'mouseout');
        google.maps.event.clearListeners(map, 'click');
        google.maps.event.clearListeners(map, 'mousemove');
        shapeclicked = false;
      }
    });


  $('#addmarker').on('click', function() {
  //  $("span").trigger('customevent');
  //  $(this).stop();
  //  $(this).css('display', 'inline-block');
    var tempmarker = new google.maps.Marker({
      map: map
    });

    settingmarker = true;

  	google.maps.event.clearListeners(map, 'mouseout');
  //	google.maps.event.clearListeners(map, 'click');
  	google.maps.event.clearListeners(map, 'mousemove');
  //	$(this).css('background-color', '#12199d');

    google.maps.event.addListener(tempmarker, 'click', function(event) {
      console.log("CLICKED");
      google.maps.event.clearListeners(map, 'mouseout');
    	google.maps.event.clearListeners(map, 'mousemove');
        //making a Parse object not on the map

      addMarker(event.latLng, map, "", elemnum);
      google.maps.event.clearListeners(map, 'click');
      tempmarker.setMap(null);
//      $('#done').css('display', 'inline-block');
      $('#instructions').css('display', 'none');
    });

    google.maps.event.addListener(map, 'mouseout', function(event) {
      tempmarker.setVisible(false);
    });

    google.maps.event.addListener(map, 'click', function(event) {
      console.log("CLICKED");
      google.maps.event.clearListeners(map, 'mouseout');
    	google.maps.event.clearListeners(map, 'mousemove');
        //making a Parse object not on the map

      addMarker(event.latLng, map, "", elemnum);
      google.maps.event.clearListeners(map, 'click');
      tempmarker.setMap(null);
//      $('#done').css('display', 'inline-block');
      $('#instructions').css('display', 'none');
    });

  });

  $('#addarea').on('click', function() {
    $("span").trigger('customevent');
    $(this).stop();
    $(this).css('display', 'inline-block');
  	$(this).css('background-color', '#12199d');

    google.maps.event.clearListeners(map, 'click');
    google.maps.event.addListener(map, 'click', function(event) {
      addArea(event.latLng, map);
    });
  });

  var routeclicked = false;

  $('#addroute').on('click', function() {
    $("span").trigger('customevent');
    $(this).stop();
  	if(!routeclicked) {

      //setting mapitem to polyline
      mapitem = polyline;

      //setting itemset flag to true;
      itemset = true;
      $(this).css('display', 'inline-block');
  		$(this).css('background-color', '#12199d');
  		google.maps.event.clearListeners(map, 'mouseout');
	  	google.maps.event.clearListeners(map, 'click');
	  	google.maps.event.clearListeners(map, 'mousemove');
	  	google.maps.event.addListener(map, 'click', addLinePoint);
      polyline.setMap(map);
	  	//user friendly follow of mouse
	  	google.maps.event.addListener(map, 'mousemove', function(event) {
	  		if(lastlinepoint == (linepath.length - 1)) {
	  			linepath.insertAt(linepath.length, event.latLng);


//				    linemarkers.push(marker);
//				    marker.setTitle("#" + linepath.length);

	  		} else if (lastlinepoint < (linepath.length - 1)) {
	  			linepath.setAt(linepath.length - 1, event.latLng);
//	  			console.log(linemarkers.length);
//	  			linemarkers[linemarkers.length - 1].setPosition(event.latLng);
	  		}
	  	});

	  	google.maps.event.addListener(map, 'mouseout', function(event) {
	  		if(lastlinepoint < (linepath.length - 1)) {
	  			linepath.removeAt(linepath.length - 1);
//	  			markers.pop();
	  		}
	  	});
	  	routeclicked = true;
  	} else {
  		$(this).css('background-color', '#a0b7da');
  		google.maps.event.clearListeners(map, 'mouseout');
	  	google.maps.event.clearListeners(map, 'click');
	  	google.maps.event.clearListeners(map, 'mousemove');
	  	routeclicked = false;
  	}

  });


});


function initMap() {

  var original = $('#map').height();
  if($('#light').length) {
    $('#map').height($('#light').height() - $('.bottomliner').height() + 'px');
  }

  console.log("Mobile", mobile);

  if($(window).width() <= 600) {
    mobile = true;
  }

//  $('#map').css("height", (original - 60) + 'px');
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 35.824791, lng: 128.561378},
      zoom: 13,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      disableDefaultUI: mobile
	});

  google.maps.event.addListener(map, 'click', function() {
    google.maps.event.trigger(map, 'focusoutevent');
  });

  if (Parse.User.current().get('lastlocation') != undefined) {
    console.log("Retrieving the last location");
    var usercenterpoint = Parse.User.current().get('lastlocation');
    map.setCenter({lat: usercenterpoint.latitude, lng: usercenterpoint.longitude});
  }

  var curelem = null;

  var btn = $('<div id="getposition"><img src="pictures/getposition3.png" /></div>');
  var markersearchbox = $('<div id="markersearchbox">' +
  '<input id="markersearch" placeholder="Find in page" autocomplete="off"/></div>');
  $('body').append(markersearchbox[0]);
  $('body').append(btn[0]);

  if($('#post').length == 0) {
    var addmarker = $('<div id="addjustmarker" class="floatbutton" title="Add marker"><img src="pictures/map3.png" /></div>')
    $('body').append(addmarker[0]);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(addmarker[0]);

    var savemarker = $('<div id="savemarker" class="floatbutton">Save</div>')
    $('body').append(savemarker[0]);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(savemarker[0]);

    $('#addjustmarker').on('click', function() {
      $('#addjustmarker').addClass('addingmarker');
      google.maps.event.addListener(map, 'click', function(event) {
        console.log("CLICKED");
        google.maps.event.clearListeners(map, 'mouseout');
        google.maps.event.clearListeners(map, 'mousemove');
          //making a Parse object not on the map

        addMarker(event.latLng, map, "", -1);
        google.maps.event.clearListeners(map, 'click');
  //      $('#done').css('display', 'inline-block');
        $('#instructions').css('display', 'none');
      });
    });

    $('#labelingbackground').on('click', function(evt) {
      evt.preventDefault();
      $('#markerlabeling').fadeOut('fast');
      $('#labelingbackground').fadeOut('fast');
      $('#markertype').fadeOut('fast');

      justmarker = null;
      mapitem.setMap(null);

      $('#addjustmarker').removeClass('addingmarker');
    });

    $('#savemarker').on('click', function() {
      justmarker = new Marker();
      var point = new Parse.GeoPoint({latitude: mapitem.getPosition().lat(), longitude: mapitem.getPosition().lng()});
      justmarker.set('location', point);
      justmarker.set('elemnum', -1);
      justmarker.set('zoomlevel', map.getZoom());
      justmarker.set('title', markerlabel);
      justmarker.set("type", markertype);
      justmarker.set("lowertitle", lowerlabel);
      justmarker.set('center', mapitem.getPosition().lat().toString() + ' ' + mapitem.getPosition().lng().toString());
      justmarker.set('froms', []);
      justmarker.set("Author", Parse.User.current());
      justmarker.save().then(function() {
        $('#savemarker').css('display', 'none');
        $('#addjustmarker').removeClass('addingmarker');
        google.maps.event.trigger(map, 'dragend');
        justmarker = null;
        mapitem.setMap(null);
        mapitem = null;
      });
    });
  }

  $('#markersearch').keyup(function(event) {
    if(event.keyCode == 38) { //up
      if(curelem == null || curelem.length == 0) {
        curelem = $('.searchresult').last();
      } else {
        curelem = curelem.prev();
      }
      $('.searchresult').removeClass('hoveredresult');
      curelem.addClass('hoveredresult');
      return;
    } else if (event.keyCode == 40) { //down
      if(curelem == null || curelem.length == 0) {
        curelem = $('.searchresult').first();
      } else {
        curelem = curelem.next();
      }
      $('.searchresult').removeClass('hoveredresult');
      curelem.addClass('hoveredresult');
      return;
    } else if(event.keyCode == 13) {
      if($('.hoveredresult').length) {
        $('#markersearch').val($('.hoveredresult').children('.markername').html());
        $('.hoveredresult').click();
      }
    }

    $('.searchresult').each(function() {
      $(this).remove();
    });
    if($('#markersearch').val().length > 1) {
      console.log("Querying", $('#markersearch').val());
      var query = new Parse.Query("Marker");
      query.contains("lowertitle", $('#markersearch').val().toLowerCase());
      query.find({
        success: function(results) {
          var curcenter = positionmarker.getPosition();
          console.log(results.length);
          if(positionmarker.getMap() != null) {
            results.sort(function(a, b){
              return getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude)-getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), b.get("location").latitude, b.get("location").longitude)
            });
          } else {
            curcenter = map.getCenter();
          }
          for(var i = 0; i < results.length; ++i) {
            var a = results[i];
            var markerdistance;
            console.log(results[i].get('lowertitle'));
            if($('#marker' + a.id).length == 0 && (results[i].get('lowertitle').indexOf($('#markersearch').val().toLowerCase()) >= 0)) {
              $('#markersearchbox').append('<div class="searchresult" id="marker' + a.id + '">' +
              '<img class="markertype" src=""/>' +
              '<span class="markername">' + results[i].get('title') + '</span>' +
              '<span class="markerdistance">' +
              getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude) + ' km</span></div>');
              if (a.get('type') == 'food') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/foodtype.png');
              } else if (a.get('type') == 'hotel') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/hotel.png');
              } else if(a.get('type') == 'util') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              } else if(a.get('type') == 'tourist') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/tourist.png');
              } else if(a.get('type') == 'transportation') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/transportation.png');
              } else {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              }
            }

            loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);

          }

          if(positionmarker.getMap() != null) {
            $('.markerdistance').css('display', 'inline');
          }

          $('.searchresult').on('mouseover', function() {
            $('.searchresult').removeClass('hoveredresult');
          });

          $('.searchresult').on('click', function() {
            console.log($(this).attr('id'));

            if($(this).attr('id') in markertomarkerid) {
              map.panTo(markertomarkerid[$(this).attr('id')].getPosition());
              map.setZoom(16);
            } else {
              map.setZoom(map.getZoom() - 2);
              google.maps.event.trigger(map, 'dragend');
              setTimeout(function() {
                $(this).click();
              }, 500);
            }

            google.maps.event.trigger(markertomarkerid[$(this).attr('id')], 'click' );
          });

        }, error: function(err) {

        }
      });
    } else {
      $('.searchresult').each(function() {
        $(this).remove();
      });
    }
  });

  $('#markersearchbox').on('click', function(e) {
    e.stopPropagation();
  });

  $(document).on('click', function() {
    $('.searchresult').each(function() {
      $(this).remove();
    });
  });


  $('#markersearch').focusin(function() {
    if($('#markersearch').val().length > 1) {
      console.log("Querying", $('#markersearch').val());
      var query = new Parse.Query("Marker");
      query.contains("lowertitle", $('#markersearch').val());
      query.find({
        success: function(results) {
          var curcenter = positionmarker.getPosition();
          console.log(results.length);
          if(positionmarker.getMap() != null) {
            results.sort(function(a, b){
              return getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude)-getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), b.get("location").latitude, b.get("location").longitude)
            });
          } else {
            curcenter = map.getCenter();
          }
          for(var i = 0; i < results.length; ++i) {
            var a = results[i];
            if($('#marker' + a.id).length == 0 && (results[i].get('lowertitle').indexOf($('#markersearch').val().toLowerCase()) >= 0)) {
              $('#markersearchbox').append('<div class="searchresult" id="marker' + a.id + '">' +
              '<img class="markertype" src=""/>' +
              '<span class="markername">' + results[i].get('title') + '</span>' +
              '<span class="markerdistance">' +
              getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude) + ' km</span></div>');
              if (a.get('type') == 'food') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/foodtype.png');
              } else if (a.get('type') == 'hotel') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/hotel.png');
              } else if(a.get('type') == 'util') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              } else if(a.get('type') == 'tourist') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/tourist.png');
              } else if(a.get('type') == 'transportation') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/transportation.png');
              } else {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              }
            }

            loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);

          }

          if(positionmarker.getMap() != null) {
            $('.markerdistance').css('display', 'inline');
          }

          $('.searchresult').on('mouseover', function() {
            $('.searchresult').removeClass('hoveredresult');
          });

          $('.searchresult').on('click', function() {
            console.log($(this).attr('id'));

            if($(this).attr('id') in markertomarkerid) {
              map.panTo(markertomarkerid[$(this).attr('id')].getPosition());
              map.setZoom(16);
            } else {
              map.setZoom(map.getZoom() - 2);
              google.maps.event.trigger(map, 'dragend');
              setTimeout(function() {
                $(this).click();
              }, 500);
            }

            google.maps.event.trigger(markertomarkerid[$(this).attr('id')], 'click' );
          });

        }, error: function(err) {

        }
      });
    } else {
      $('.searchresult').each(function() {
        $(this).remove();
      });
    }
  });

  map.controls[google.maps.ControlPosition.LEFT_TOP].push(btn[0]);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(markersearchbox[0]);

  positionmarker = new google.maps.Marker({

    icon: positionmarkerimage,
    draggable: true
  });

  google.maps.event.addListener(positionmarker, 'dragend', function() {
    if(positionmarker.getMap() != null) {
      console.log("Saving last location");
      var positionpoint = new Parse.GeoPoint({latitude: positionmarker.getPosition().lat(), longitude: positionmarker.getPosition().lng()});
      Parse.User.current().set('lastlocation', positionpoint);
      Parse.User.current().save();
    }
  });

  $('#getposition').on('click', function() {
    $(this).css('background-color', '#cecfcf');
    console.log('querying current location');
    if (navigator.geolocation) {
      console.log("SOMETHING");
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        positionmarker.setMap(map);
        map.setCenter(pos);
        positionmarker.setPosition(pos);

        if(positionmarker.getMap() != null) {
          $('.markerdistance').css('display', 'inline');
        }

        var positionpoint = new Parse.GeoPoint({latitude: positionmarker.getPosition().lat(), longitude: positionmarker.getPosition().lng()});
        Parse.User.current().set('lastlocation', positionpoint);
        Parse.User.current().save();

        $('#getposition').css('background-color', 'white');
        console.log("Adding Marker");
      });

      setTimeout(function() {
        if(positionmarker.getMap() == null) {
          console.log("Prompting user for location");

          positionmarker.setMap(map);
          positionmarker.setPosition(map.getCenter());

          if(positionmarker.getMap() != null) {
            $('.markerdistance').css('display', 'inline');
          }

          $('#getposition').css('background-color', 'white');
          $('body').append('<div class="promptbox">' +
                '<button type="button" class="close promptcloser" aria-label="Close">' +
                  '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '<div class="Question">We were unable to get your location.' +
                ' We will assume your position as the center of the map.</div>' +
                '<div class="answerholder">' +
                  '<span class="answer oneanswer">OK</span>' +
                '</div>' +
              '</div>' +
              '<div class="promptoverlay"></div>');
          $('.promptbox').css('left', $(window).width() / 2 - $('.promptbox').width() / 2);
          $('.promptbox').css('top', $(window).height() / 2 - $('.promptbox').height() / 2);
          $(window).resize(function() {
            $('.promptbox').css('left', $(window).width() / 2 - $('.promptbox').width() / 2);
            $('.promptbox').css('top', $(window).height() / 2 - $('.promptbox').height() / 2);
          });

          $('.promptoverlay').on('click', function() {
            $('.promptbox').remove();
            $('.promptoverlay').remove();
          });

          $('.promptcloser').on('click', function() {
            $('.promptbox').remove();
            $('.promptoverlay').remove();
          });

          $('.oneanswer').on('click', function() {
            $('.promptbox').remove();
            $('.promptoverlay').remove();
          });
        }
      }, 3000)

    } else {

    }

  });

	var input = document.getElementById('pac-input');
  input.style.marginRight='35px';
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

	var extramarkers = [];
	// [START region_getplaces]
	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		// Clear out the old markers.
		extramarkers.forEach(function(marker) {
			marker.setMap(null);
		});
		extramarkers = [];

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			var icon = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			extramarkers.push(new google.maps.Marker({
				map: map,
				icon: icon,
				title: place.name,
				position: place.geometry.location
			}));

			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
	});

	image = {
		url: 'pictures/route-axis.png',
		size: new google.maps.Size(8,8),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(4,4)
	};

	path = new google.maps.MVCArray;
	polygon = new google.maps.Polygon({
    strokeWeight: 3,
    fillColor: '#5555FF',
    clickable: false
  });
//  polygon.setMap(map);
  polygon.setPaths(new google.maps.MVCArray([path]));

  linepath = new google.maps.MVCArray;
  polyline = new google.maps.Polyline({
		geodesic: true,
		strokeColor: '#332244',
		strokeOpacity: 1.0,
		strokeWeight: 3,
		clickable: false,
		path: linepath,
		map: map
  });
//  polyline.setMap(map);
//    polyline.setPath(new google.maps.MVCArray(linepath));

  // This event listener calls addMarker() when the map is clicked.
  // Add a marker at the center of the map.

    //map objects that are already loaded into the map
	var found = [];

	google.maps.event.addListener(map, 'dragend', function() {
    var bounds = map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var southwestmap = new Parse.GeoPoint(sw.lat(), sw.lng());
		var northeastmap = new Parse.GeoPoint(ne.lat(), ne.lng());
		var query = new Parse.Query(Marker);
		query.withinGeoBox("location", southwestmap, northeastmap);
		query.notContainedIn("objectId", found);
		query.find({
		  success: function(results) {

			var i = 0;
			console.log(results.length);
			for(i = 0; i < results.length; i++) {
			//	console.log(parseFloat(results[i].get("location").latitude));
        markerdic[results[i].id] = [];
        var fromslist = results[i].get("froms");
        for(var x = 0; x < fromslist.length; ++x) {
          markerdic[results[i].id].push(fromslist[x]);
        }
        loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);
				found.push(results[i].id);
			//	console.log(found);
			}
		  },
		  error: function(results, error) {
		  	console.log("failed to add object to map");
		  }
		});


		var gonquery = new Parse.Query(gonPoint);
		gonquery.withinGeoBox("location", southwestmap, northeastmap);
		gonquery.notContainedIn("objectId", found);
    gonquery.include("of");
    gonquery.include("of.points");
		gonquery.find({
			success: function(results) {

				var i = 0;
				console.log("GonPoints:", results.length);
				for(i = 0; i < results.length; i++) {
					var gonid = results[i].get("of");
					if($.inArray(gonid.id, found) != -1) {
            console.log("Passing on");
            console.log(found);
            console.log(gonid.id);
						continue;
					}
          console.log("Gon ID", gonid.id);
          console.log("Retrieved", gonid.get("points").length);

          var object = gonid;

              console.log(object.className);
              found.push(object.id);
              var route2 = [];//new google.maps.MVCArray;
              var x = 0;
              var newpolygon = new google.maps.Polygon({
                strokeWeight: 3,
                  fillColor: '#5555FF',
                  clickable: false,
                  paths: route2,
              });
              var points = object.get("points");
              for(var c = 0; c < points.length; ++c) {
                route2.push(null);
              }
              console.log("Points found", points.length);
              for(var c = 0; c < points.length; ++c) {
                    var obj = points[c];
                    console.log("gonPoint FOUND:", parseFloat(obj.get("location").latitude), parseFloat(obj.get("location").longitude));

                    //order has the order id of the point, thus justifying the way the polygon lis loaded
                    route2[obj.get("order")] =  { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) };
                    console.log("ROUTE2 length:", route2.length);
                    x++;
      //              console.log(route2[0].lat);
                    found.push(obj.id);

              }
              console.log("ROUTE2 length:", route2.length);
              newpolygon.setPaths([route2]);
                //newpolygon.setPaths(new google.maps.MVCArray([route]));
              newpolygon.setMap(map);

              console.log("Polygon set to map");
             //   newpolygon.setPaths(new google.maps.MVCArray([route]));


				}
			},
			error: function(error) {

			}
		});

    var linequery = new Parse.Query(linePoint);
		linequery.withinGeoBox("location", southwestmap, northeastmap);
		linequery.notContainedIn("objectId", found);
    linequery.include("of");
    linequery.include("of.points");
		linequery.find({
			success: function(results) {

				var i = 0;
				console.log("linePoints:", results.length);
				for(i = 0; i < results.length; i++) {
					var lineid = results[i].get("of");
					if($.inArray(lineid.id, found) != -1) {
            console.log("Passing on");
            console.log(found);
            console.log(lineid.id);
						continue;
					}
          console.log("line ID", lineid.id);
          console.log("Retrieved", lineid.get("points").length);

          var object = lineid;

              console.log(object.className);
              found.push(object.id);
              var lineroute2 = [];//new google.maps.MVCArray;
              var x = 0;
              var newpolyline = new google.maps.Polyline({
                strokeWeight: 3,
                  clickable: false,
                  path: lineroute2,
              });
              var points = object.get("points");

              for(var c = 0; c < points.length; ++c) {
                lineroute2.push(null);
              }
              console.log("Points found", points.length);
              for(var c = 0; c < points.length; ++c) {
                    var obj = points[c];
                    console.log("linePoint FOUND:", parseFloat(obj.get("location").latitude), parseFloat(obj.get("location").longitude));

                    //lineroute2.push( { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) } );
                    lineroute2[obj.get("order")] = { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) };
                    console.log("lineroute2 length:", lineroute2.length);
                    x++;
              //      console.log(lineroute2[0].lat);
                    found.push(obj.id);

              }
              console.log("lineroute2 length:", lineroute2.length);

              newpolyline.setPath(lineroute2);
                //newpolyline.setPaths(new google.maps.MVCArray([route]));
              newpolyline.setMap(map);


              console.log("Polyline set to map");
             //   newpolygon.setPaths(new google.maps.MVCArray([route]));


				}
			},
			error: function(error) {

			}
		});

  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
    google.maps.event.trigger(map, 'dragend');
  });

  google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
    console.log("Bounds changed called only once");
    var bounds = map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var southwestmap = new Parse.GeoPoint(sw.lat(), sw.lng());
		var northeastmap = new Parse.GeoPoint(ne.lat(), ne.lng());
		var query = new Parse.Query('Marker');
		query.withinGeoBox("location", southwestmap, northeastmap);
		query.notContainedIn("objectId", found);
		query.find({
		  success: function(results) {
  			var i = 0;
  			console.log(results.length);
  			for(i = 0; i < results.length; i++) {
  			//	console.log(parseFloat(results[i].get("location").latitude));
          markerdic[results[i].id] = [];
          var fromslist = results[i].get("froms");
          for(var x = 0; x < fromslist.length; ++x) {
            markerdic[results[i].id].push(fromslist[x]);
          }
          loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);
  				found.push(results[i].id);
  			//	console.log(found);
  			}
		  },
		  error: function(results, error) {
		  	console.log("failed to add object to map");
		  }
		});

  });

}

function initMapblock(mapid, mapcenter, mapblockitem) {

  var original = $('#map').height();
  if($('#light').length) {
    $('#map').height($('#light').height() - $('.bottomliner').height() + 'px');
  }

  if($(window).width() <= 600) {
    mobile = true;
  }

  var bufferitem = mapblockitem;
//  $('#map').css("height", (original - 60) + 'px');
  map = new google.maps.Map(document.getElementById(mapid), {
      center: mapcenter,
      zoom: 13,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      disableDefaultUI: mobile
	});

  google.maps.event.addListener(map, 'click', function() {
    google.maps.event.trigger(map, 'focusoutevent');
  });

  var curelem;

//  bufferitem.setMap(map);

  var btn = $('<div id="getposition"><img src="pictures/getposition3.png" /></div>');
  var markersearchbox = $('<div id="markersearchbox">' +
  '<input id="markersearch" placeholder="Find in page" autocomplete="off"/></div>');
  $('body').append(markersearchbox[0]);
  $('body').append(btn[0]);

  $('#markersearch').keyup(function(event) {
    if(event.keyCode == 38) { //up
      if(curelem == null || curelem.length == 0) {
        curelem = $('.searchresult').last();
      } else {
        curelem = curelem.prev();
      }
      $('.searchresult').removeClass('hoveredresult');
      curelem.addClass('hoveredresult');
      return;
    } else if (event.keyCode == 40) { //down
      if(curelem == null || curelem.length == 0) {
        curelem = $('.searchresult').first();
      } else {
        curelem = curelem.next();
      }
      $('.searchresult').removeClass('hoveredresult');
      curelem.addClass('hoveredresult');
      return;
    } else if(event.keyCode == 13) {
      if($('.hoveredresult').length) {
        $('#markersearch').val($('.hoveredresult').children('.markername').html());
        $('.hoveredresult').click();
      }
    }

    $('.searchresult').each(function() {
      $(this).remove();
    });
    if($('#markersearch').val().length > 1) {
      console.log("Querying", $('#markersearch').val());
      var query = new Parse.Query("Marker");
      query.contains("lowertitle", $('#markersearch').val().toLowerCase());
      query.find({
        success: function(results) {
          var curcenter = map.getCenter();
          console.log(results.length);
          if(positionmarker.getMap() != null) {
            results.sort(function(a, b){
              return getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude)-getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), b.get("location").latitude, b.get("location").longitude)
            });
          } else {
            curcenter = map.getCenter();
          }
          for(var i = 0; i < results.length; ++i) {
            var a = results[i];
            if($('#marker' + a.id).length == 0 && (results[i].get('lowertitle').indexOf($('#markersearch').val().toLowerCase()) >= 0)) {
              $('#markersearchbox').append('<div class="searchresult" id="marker' + a.id + '">' +
              '<img class="markertype" src=""/>' +
              '<span class="markername">' + results[i].get('title') + '</span>' +
              '<span class="markerdistance">' +
              getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude) + ' km</span></div>');
              if (a.get('type') == 'food') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/foodtype.png');
              } else if (a.get('type') == 'hotel') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/hotel.png');
              } else if(a.get('type') == 'util') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              } else if(a.get('type') == 'tourist') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/tourist.png');
              } else if(a.get('type') == 'transportation') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/transportation.png');
              } else {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              }
            }

            loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);

          }

          if(positionmarker.getMap() != null) {
            $('.markerdistance').css('display', 'inline');
          }

          $('.searchresult').on('mouseover', function() {
            $('.searchresult').removeClass('hoveredresult');
          });

          $('.searchresult').on('click', function() {
            console.log($(this).attr('id'));

            if($(this).attr('id') in markertomarkerid) {
              map.panTo(markertomarkerid[$(this).attr('id')].getPosition());
              map.setZoom(16);
            } else {
              map.setZoom(map.getZoom() - 2);
              google.maps.event.trigger(map, 'dragend');
              setTimeout(function() {
                $(this).click();
              }, 500);
            }

            google.maps.event.trigger(markertomarkerid[$(this).attr('id')], 'click' );
          });

        }, error: function(err) {

        }
      });
    } else {
      $('.searchresult').each(function() {
        $(this).remove();
      });
    }
  });

  $('#markersearchbox').on('click', function(e) {
    e.stopPropagation();
  });

  $(document).on('click', function() {
    $('.searchresult').each(function() {
      $(this).remove();
    });
  });


  $('#markersearch').focusin(function() {
    if($('#markersearch').val().length > 1) {
      console.log("Querying", $('#markersearch').val());
      var query = new Parse.Query("Marker");
      query.contains("lowertitle", $('#markersearch').val().toLowerCase());
      query.find({
        success: function(results) {
          var curcenter = map.getCenter();
          console.log(results.length);
          if(positionmarker.getMap() != null) {
            results.sort(function(a, b){
              return getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude)-getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), b.get("location").latitude, b.get("location").longitude)
            });
          } else {
            curcenter = map.getCenter();
          }
          for(var i = 0; i < results.length; ++i) {
            var a = results[i];
            if($('#marker' + a.id).length == 0 && (results[i].get('lowertitle').indexOf($('#markersearch').val().toLowerCase()) >= 0)) {
              $('#markersearchbox').append('<div class="searchresult" id="marker' + a.id + '">' +
              '<img class="markertype" src=""/>' +
              '<span class="markername">' + results[i].get('title') + '</span>' +
              '<span class="markerdistance">' +
              getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude) + ' km</span></div>');
              if (a.get('type') == 'food') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/foodtype.png');
              } else if (a.get('type') == 'hotel') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/hotel.png');
              } else if(a.get('type') == 'util') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              } else if(a.get('type') == 'tourist') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/tourist.png');
              } else if(a.get('type') == 'transportation') {
                $('#marker' + a.id).children('img').attr('src', 'pictures/transportation.png');
              } else {
                $('#marker' + a.id).children('img').attr('src', 'pictures/marker.png');
              }
            }

            loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);

          }

          if(positionmarker.getMap() != null) {
            $('.markerdistance').css('display', 'inline');
          }

          $('.searchresult').on('mouseover', function() {
            $('.searchresult').removeClass('hoveredresult');
          });

          $('.searchresult').on('click', function() {
            console.log($(this).attr('id'));

            if($(this).attr('id') in markertomarkerid) {
              map.panTo(markertomarkerid[$(this).attr('id')].getPosition());
              map.setZoom(16);
            } else {
              map.setZoom(map.getZoom() - 2);
              google.maps.event.trigger(map, 'dragend');
              setTimeout(function() {
                $(this).click();
              }, 500);
            }

            google.maps.event.trigger(markertomarkerid[$(this).attr('id')], 'click' );
          });

        }, error: function(err) {

        }
      });
    } else {
      $('.searchresult').each(function() {
        $(this).remove();
      });
    }
  });

  map.controls[google.maps.ControlPosition.LEFT_TOP].push(btn[0]);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(markersearchbox[0]);

  positionmarker = new google.maps.Marker({
    icon: positionmarkerimage,
    draggable: true
  });

  google.maps.event.addListener(positionmarker, 'dragend', function() {
    if(positionmarker.getMap() != null) {
      console.log("Saving last location");
      var positionpoint = new Parse.GeoPoint({latitude: positionmarker.getPosition().lat(), longitude: positionmarker.getPosition().lng()});
      Parse.User.current().set('lastlocation', positionpoint);
      Parse.User.current().save();
    }
  });

  $('#getposition').on('click', function() {
    $(this).css('background-color', '#cecfcf');
    console.log('querying current location');
    if (navigator.geolocation) {
      console.log("SOMETHING");
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        positionmarker.setMap(map);
        map.setCenter(pos);
        positionmarker.setPosition(pos);

        if(positionmarker.getMap() != null) {
          $('.markerdistance').css('display', 'inline');
        }

        var positionpoint = new Parse.GeoPoint({latitude: positionmarker.getPosition().lat(), longitude: positionmarker.getPosition().lng()});
        Parse.User.current().set('lastlocation', positionpoint);
        Parse.User.current().save();

        $('#getposition').css('background-color', 'white');
        console.log("Adding Marker");
      });

      setTimeout(function() {
        if(positionmarker.getMap() == null) {
          console.log("Prompting user for location");

          positionmarker.setMap(map);
          positionmarker.setPosition(map.getCenter());

          if(positionmarker.getMap() != null) {
            $('.markerdistance').css('display', 'inline');
          }

          $('#getposition').css('background-color', 'white');
          $('body').append('<div class="promptbox">' +
                '<button type="button" class="close promptcloser" aria-label="Close">' +
                  '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '<div class="Question">We were unable to get your location.' +
                ' We will assume your position as the center of the map.</div>' +
                '<div class="answerholder">' +
                  '<span class="answer oneanswer">OK</span>' +
                '</div>' +
              '</div>' +
              '<div class="promptoverlay"></div>');
          $('.promptbox').css('left', $(window).width() / 2 - $('.promptbox').width() / 2);
          $('.promptbox').css('top', $(window).height() / 2 - $('.promptbox').height() / 2);
          $(window).resize(function() {
            $('.promptbox').css('left', $(window).width() / 2 - $('.promptbox').width() / 2);
            $('.promptbox').css('top', $(window).height() / 2 - $('.promptbox').height() / 2);
          });

          $('.promptoverlay').on('click', function() {
            $('.promptbox').remove();
            $('.promptoverlay').remove();
          });

          $('.promptcloser').on('click', function() {
            $('.promptbox').remove();
            $('.promptoverlay').remove();
          });

          $('.oneanswer').on('click', function() {
            $('.promptbox').remove();
            $('.promptoverlay').remove();
          });
        }
      }, 3000)

    } else {

    }

  });

  var input = document.getElementById('pac-input');
  input.style.marginRight='35px';
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

	var extramarkers = [];
	// [START region_getplaces]
	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		// Clear out the old markers.
		extramarkers.forEach(function(marker) {
			marker.setMap(null);
		});
		extramarkers = [];

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			var icon = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			extramarkers.push(new google.maps.Marker({
				map: map,
				icon: icon,
				title: place.name,
				position: place.geometry.location
			}));

			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
	});

	image = {
		url: 'pictures/route-axis.png',
		size: new google.maps.Size(8,8),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(4,4)
	};

	path = new google.maps.MVCArray;
	polygon = new google.maps.Polygon({
    strokeWeight: 3,
    fillColor: '#5555FF',
    clickable: false
  });
//  polygon.setMap(map);
  polygon.setPaths(new google.maps.MVCArray([path]));

  linepath = new google.maps.MVCArray;
  polyline = new google.maps.Polyline({
		geodesic: true,
		strokeColor: '#332244',
		strokeOpacity: 1.0,
		strokeWeight: 3,
		clickable: false,
		path: linepath,
		map: map
  });
//  polyline.setMap(map);
//    polyline.setPath(new google.maps.MVCArray(linepath));

  // This event listener calls addMarker() when the map is clicked.
  // Add a marker at the center of the map.

    //map objects that are already loaded into the map
	var found = [];

	google.maps.event.addListener(map, 'dragend', function() {
    var bounds = map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var southwestmap = new Parse.GeoPoint(sw.lat(), sw.lng());
		var northeastmap = new Parse.GeoPoint(ne.lat(), ne.lng());
		var query = new Parse.Query('Marker');
		query.withinGeoBox("location", southwestmap, northeastmap);
		query.notContainedIn("objectId", found);
		query.find({
		  success: function(results) {

			var i = 0;
			console.log(results.length);
			for(i = 0; i < results.length; i++) {
			//	console.log(parseFloat(results[i].get("location").latitude));
        markerdic[results[i].id] = [];
        var fromslist = results[i].get("froms");
        for(var x = 0; x < fromslist.length; ++x) {
          markerdic[results[i].id].push(fromslist[x]);
        }
        loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);
				found.push(results[i].id);
			//	console.log(found);
			}
		  },
		  error: function(results, error) {
		  	console.log("failed to add object to map");
		  }
		});


		var gonquery = new Parse.Query('gonPoint');
		gonquery.withinGeoBox("location", southwestmap, northeastmap);
		gonquery.notContainedIn("objectId", found);
    gonquery.include("of");
    gonquery.include("of.points");
		gonquery.find({
			success: function(results) {

				var i = 0;
				console.log("GonPoints:", results.length);
				for(i = 0; i < results.length; i++) {
					var gonid = results[i].get("of");
					if($.inArray(gonid.id, found) != -1) {
            console.log("Passing on");
            console.log(found);
            console.log(gonid.id);
						continue;
					}
          console.log("Gon ID", gonid.id);
          console.log("Retrieved", gonid.get("points").length);

          var object = gonid;

              console.log(object.className);
              found.push(object.id);
              var route2 = [];//new google.maps.MVCArray;
              var x = 0;
              var newpolygon = new google.maps.Polygon({
                strokeWeight: 3,
                  fillColor: '#5555FF',
                  clickable: false,
                  paths: route2,
              });
              var points = object.get("points");
              for(var c = 0; c < points.length; ++c) {
                route2.push(null);
              }
              console.log("Points found", points.length);
              for(var c = 0; c < points.length; ++c) {
                    var obj = points[c];
                    console.log("gonPoint FOUND:", parseFloat(obj.get("location").latitude), parseFloat(obj.get("location").longitude));

                    //order has the order id of the point, thus justifying the way the polygon lis loaded
                    route2[obj.get("order")] =  { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) };
                    console.log("ROUTE2 length:", route2.length);
                    x++;
      //              console.log(route2[0].lat);
                    found.push(obj.id);

              }
              console.log("ROUTE2 length:", route2.length);
              newpolygon.setPaths([route2]);
                //newpolygon.setPaths(new google.maps.MVCArray([route]));
              newpolygon.setMap(map);

              console.log("Polygon set to map");
             //   newpolygon.setPaths(new google.maps.MVCArray([route]));


				}
			},
			error: function(error) {

			}
		});

    var linequery = new Parse.Query('linePoint');
		linequery.withinGeoBox("location", southwestmap, northeastmap);
		linequery.notContainedIn("objectId", found);
    linequery.include("of");
    linequery.include("of.points");
		linequery.find({
			success: function(results) {

				var i = 0;
				console.log("linePoints:", results.length);
				for(i = 0; i < results.length; i++) {
					var lineid = results[i].get("of");
					if($.inArray(lineid.id, found) != -1) {
            console.log("Passing on");
            console.log(found);
            console.log(lineid.id);
						continue;
					}
          console.log("line ID", lineid.id);
          console.log("Retrieved", lineid.get("points").length);

          var object = lineid;

              console.log(object.className);
              found.push(object.id);
              var lineroute2 = [];//new google.maps.MVCArray;
              var x = 0;
              var newpolyline = new google.maps.Polyline({
                strokeWeight: 3,
                  clickable: false,
                  path: lineroute2,
              });
              var points = object.get("points");

              for(var c = 0; c < points.length; ++c) {
                lineroute2.push(null);
              }
              console.log("Points found", points.length);
              for(var c = 0; c < points.length; ++c) {
                    var obj = points[c];
                    console.log("linePoint FOUND:", parseFloat(obj.get("location").latitude), parseFloat(obj.get("location").longitude));

                    //lineroute2.push( { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) } );
                    lineroute2[obj.get("order")] = { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) };
                    console.log("lineroute2 length:", lineroute2.length);
                    x++;
              //      console.log(lineroute2[0].lat);
                    found.push(obj.id);

              }
              console.log("lineroute2 length:", lineroute2.length);

              newpolyline.setPath(lineroute2);
                //newpolyline.setPaths(new google.maps.MVCArray([route]));
              newpolyline.setMap(map);


              console.log("Polyline set to map");
             //   newpolygon.setPaths(new google.maps.MVCArray([route]));

				}
			},
			error: function(error) {

			}
		});

  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
    google.maps.event.trigger(map, 'dragend');
  });

  google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
    console.log("Bounds changed called only once");
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var southwestmap = new Parse.GeoPoint(sw.lat(), sw.lng());
    var northeastmap = new Parse.GeoPoint(ne.lat(), ne.lng());
    var query = new Parse.Query('Marker');
    query.withinGeoBox("location", southwestmap, northeastmap);
    query.notContainedIn("objectId", found);
    query.find({
      success: function(results) {

      var i = 0;
      console.log(results.length);
      for(i = 0; i < results.length; i++) {
      //	console.log(parseFloat(results[i].get("location").latitude));
        markerdic[results[i].id] = [];
        var fromslist = results[i].get("froms");
        for(var x = 0; x < fromslist.length; ++x) {
          markerdic[results[i].id].push(fromslist[x]);
        }
        loadMarker({ lat: parseFloat(results[i].get("location").latitude), lng: parseFloat(results[i].get("location").longitude) }, map, results[i].get("title"), results[i].id, results[i].get("type"), results[i].createdAt);
        found.push(results[i].id);
      //	console.log(found);
      }
      },
      error: function(results, error) {
        console.log("failed to add object to map");
      }
    });


    var gonquery = new Parse.Query('gonPoint');
    gonquery.withinGeoBox("location", southwestmap, northeastmap);
    gonquery.notContainedIn("objectId", found);
    gonquery.include("of");
    gonquery.include("of.points");
    gonquery.find({
      success: function(results) {

        var i = 0;
        console.log("GonPoints:", results.length);
        for(i = 0; i < results.length; i++) {
          var gonid = results[i].get("of");
          if($.inArray(gonid.id, found) != -1) {
            console.log("Passing on");
            console.log(found);
            console.log(gonid.id);
            continue;
          }
          console.log("Gon ID", gonid.id);
          console.log("Retrieved", gonid.get("points").length);

          var object = gonid;

              console.log(object.className);
              found.push(object.id);
              var route2 = [];//new google.maps.MVCArray;
              var x = 0;
              var newpolygon = new google.maps.Polygon({
                strokeWeight: 3,
                  fillColor: '#5555FF',
                  clickable: false,
                  paths: route2,
              });
              var points = object.get("points");
              for(var c = 0; c < points.length; ++c) {
                route2.push(null);
              }
              console.log("Points found", points.length);
              for(var c = 0; c < points.length; ++c) {
                    var obj = points[c];
                    console.log("gonPoint FOUND:", parseFloat(obj.get("location").latitude), parseFloat(obj.get("location").longitude));

                    //order has the order id of the point, thus justifying the way the polygon lis loaded
                    route2[obj.get("order")] =  { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) };
                    console.log("ROUTE2 length:", route2.length);
                    x++;
      //              console.log(route2[0].lat);
                    found.push(obj.id);

              }
              console.log("ROUTE2 length:", route2.length);
              newpolygon.setPaths([route2]);
                //newpolygon.setPaths(new google.maps.MVCArray([route]));
              newpolygon.setMap(map);

              console.log("Polygon set to map");
             //   newpolygon.setPaths(new google.maps.MVCArray([route]));


        }
      },
      error: function(error) {

      }
    });

    var linequery = new Parse.Query('linePoint');
    linequery.withinGeoBox("location", southwestmap, northeastmap);
    linequery.notContainedIn("objectId", found);
    linequery.include("of");
    linequery.include("of.points");
    linequery.find({
      success: function(results) {

        var i = 0;
        console.log("linePoints:", results.length);
        for(i = 0; i < results.length; i++) {
          var lineid = results[i].get("of");
          if($.inArray(lineid.id, found) != -1) {
            console.log("Passing on");
            console.log(found);
            console.log(lineid.id);
            continue;
          }
          console.log("line ID", lineid.id);
          console.log("Retrieved", lineid.get("points").length);

          var object = lineid;

              console.log(object.className);
              found.push(object.id);
              var lineroute2 = [];//new google.maps.MVCArray;
              var x = 0;
              var newpolyline = new google.maps.Polyline({
                strokeWeight: 3,
                  clickable: false,
                  path: lineroute2,
              });
              var points = object.get("points");

              for(var c = 0; c < points.length; ++c) {
                lineroute2.push(null);
              }
              console.log("Points found", points.length);
              for(var c = 0; c < points.length; ++c) {
                    var obj = points[c];
                    console.log("linePoint FOUND:", parseFloat(obj.get("location").latitude), parseFloat(obj.get("location").longitude));

                    //lineroute2.push( { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) } );
                    lineroute2[obj.get("order")] = { lat: parseFloat(obj.get("location").latitude), lng: parseFloat(obj.get("location").longitude) };
                    console.log("lineroute2 length:", lineroute2.length);
                    x++;
              //      console.log(lineroute2[0].lat);
                    found.push(obj.id);

              }
              console.log("lineroute2 length:", lineroute2.length);

              newpolyline.setPath(lineroute2);
                //newpolyline.setPaths(new google.maps.MVCArray([route]));
              newpolyline.setMap(map);


              console.log("Polyline set to map");
             //   newpolygon.setPaths(new google.maps.MVCArray([route]));


        }
      },
      error: function(error) {

      }
    });

  });
  return map;

}




// Adds a marker to the map.
function addMarker(location, map, title, markerid) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  console.log("Marker added");

  google.maps.event.trigger(map, 'selectedevent');
  google.maps.event.trigger(map, 'infoboxevent');
  var marker = new google.maps.Marker({
    position: location,
    draggable: true,
    map: map,
    title: markerid,
    icon: markerimage
  });

  google.maps.event.addListener(map, 'selectedevent', function() {
    marker.setMap(null);
    mapitem = null;
    itemset = false;
    $('#label').css('display', 'none');
    $('#addmarker').click();
  });

  marker.setIcon(selectedmarkerimage);

  google.maps.event.addListener(marker, 'click', function() {
    this.setMap(null);
    mapitem = null;
    itemset = false;
    justmarker = null;
    $('#label').css('display', 'none');
    $('#instructions').css('display', 'inline-block');
    $('#addmarker').click();
    $('#savemarker').css('display', 'none');
    $('#addjustmarker').removeClass('addingmarker');
  });

  mapitem = marker;
  markerlabel = "";
  lowerlabel = "";
  itemset = true;
  $('#instructions').css('display', 'none');
  $('#label').css('display', 'inline-block');
  $('#done').css('display', 'none');

  $('#markerlabeling').fadeIn('fast');

  $('#labeler').focus();

  $('#markerlabeling').css('left', $(window).width() / 2 - $('#markerlabeling').width() / 2 + 'px');

  $('#labelingbackground').fadeIn('fast');
  $('#labeler').val("");
  $('#labeler').keydown(function(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      console.log("Enter pressed");
      console.log($('#labeler').val());
      markerlabel = $('#labeler').val();
      lowerlabel = $('#labeler').val().toLowerCase();
      $('#markerlabeling').fadeOut('fast');
      if($('#labeler').val() != "" ) {
        $('#label').css('display', 'none');
        $('#labelingbackground').fadeIn('fast');
        $('#markertype').css('display', 'block');
        console.log("Markertype", $(window).width(), $('#markertype').outerWidth());
        $('#markertype').css('left', $(window).width() / 2 - $('#markertype').outerWidth() / 2 + 'px');
        $('#markertype').css('top', $(window).height() / 2 - $('#markertype').height() / 2 + 'px');
        $(window).resize(function() {
          $('#markertype').css('left', $(window).width() / 2 - $('#markertype').outerWidth() / 2 + 'px');
          $('#markertype').css('top', $(window).height() / 2 - $('#markertype').height() / 2 + 'px');
        });
        markertype = '';
        $('.typebutton').on('click', function() {
          if($(this).attr('id') == 'foodtype') {
            mapitem.setIcon(foodselectedimage);
            markertype = 'food';
          } else if ($(this).attr('id') == 'entertainmenttype') {
            mapitem.setIcon(entertainmentselectedimage)
            markertype = 'entertainment';
          } else if ($(this).attr('id') == 'hoteltype') {
            markertype = 'hotel';
            mapitem.setIcon(hotelselectedimage);
          } else if ($(this).attr('id') == 'transportationtype') {
            markertype = 'transportation';
            mapitem.setIcon(transportationselectedimage);
          } else if ($(this).attr('id') == 'touristtype') {
            markertype = 'tourist';
            mapitem.setIcon(touristselectedimage);
          } else if ($(this).attr('id') == 'utiltype') {
            markertype = 'util';
            mapitem.setIcon(selectedmarkerimage);
          } else {
            mapitem.setIcon(selectedmarkerimage);
          }
          $('#markertype').fadeOut('fast');
          $('#labelingbackground').fadeOut('fast');

          //showing the save marker button on the add just marker function
          $('#savemarker').css('display', 'block');
        });

        $('#done').css('display', 'inline-block');
      } else {
        $('#labelingbackground').click();
      }
    } else if(event.keyCode == 27) {
      $('#markerlabeling').fadeOut('fast');
      $('#labelingbackground').fadeOut('fast');
      if($('#post').length == 0) {
          justmarker = null;
          mapitem.setMap(null);
      }
    }
  });


  //labeler query function!!!
  $('#labeler').keydown(function(event) {

    if(event.keyCode != 13) {
      $('#displayarea').html('');

      if((textbuf.length < $('#labeler').val().length) && (lastbufquery == 0)) {
        return;
      }

      if($('#labeler').val().length > 0) {
        console.log("Querying",$('#labeler').val());
        textbuf = $('#labeler').val();
        var query = new Parse.Query(Marker);
        query.contains("lowertitle", $('#labeler').val().toLowerCase());
  /*      query.find({
          success:function(results) {
            console.log(results.length);
            lastbufquery = results.length;
            results.sort(function(a, b){
              var curcenter = mapitem.getPosition();
              return getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude)-getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), b.get("location").latitude, b.get("location").longitude)
            });
            for(var x = 0; x < results.length; ++x) {
              console.log(results[x].get("title"));

              if($('#mtitle' + results[x].id).length == 0) {
                $('#displayarea').append('<div class="autoquery" id="mtitle' + results[x].id + '"><div class="titleholder">' + results[x].get("title") + '</div>' +
                '<span class="querydistance">' + getDistanceFromLatLonInKm(mapitem.getPosition().lat(), mapitem.getPosition().lng(), results[x].get('location').latitude, results[x].get('location').longitude) + ' km' + '</span>'+ '</div>');
              }
            }
            $('.autoquery').on('click', function() {
              $('#labeler').val($(this).html());
              var e = jQuery.Event("keydown");
              e.which = 13; // some value (backspace = 8)
              e.keyCode = 13;
              $("#labeler").trigger(e);
            });
          }, error: function(err) {

          }

        });*/
      }
    }
  });

  $(document).on('click', function() {
    $('.autoquery').each(function() {
      $(this).remove();
    });
  });

  $('#markerlabeling').on('click', function(e) {
    e.stopPropagation();
  });

  $('#labeler').focusin(function() {
    $('#displayarea').html('');

    if((textbuf.length < $('#labeler').val().length) && (lastbufquery == 0)) {
      return;
    }

    if($('#labeler').val().length > 0) {
      console.log("Querying",$('#labeler').val());
      textbuf = $('#labeler').val();
      var query = new Parse.Query(Marker);
      query.contains("lowertitle", $('#labeler').val().toLowerCase());
  /*    query.find({
        success:function(results) {
          console.log(results.length);
          lastbufquery = results.length;
          results.sort(function(a, b){
            var curcenter = mapitem.getPosition();
            return getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), a.get("location").latitude, a.get("location").longitude)-getDistanceFromLatLonInKm(curcenter.lat(), curcenter.lng(), b.get("location").latitude, b.get("location").longitude)
          });
          for(var x = 0; x < results.length; ++x) {
            console.log(results[x].get("title"));
            if($('#mtitle' + results[x].id).length == 0) {
              $('#displayarea').append('<div class="autoquery" id="mtitle' + results[x].id + '"><div class="titleholder">' + results[x].get("title") + '</div>' +
              '<span class="querydistance">' + getDistanceFromLatLonInKm(mapitem.getPosition().lat(), mapitem.getPosition().lng(), results[x].get('location').latitude, results[x].get('location').longitude) + ' km' + '</span>'+ '</div>');
            }
          }
          $('.autoquery').on('click', function() {
            $('#labeler').val($(this).html());
            var e = jQuery.Event("keydown");
            e.which = 13; // some value (backspace = 8)
            e.keyCode = 13;
            $("#labeler").trigger(e);
          });
        }, error: function(err) {

        }

      });*/
    }
  });
}

//title is the text saved onto the marker
function loadMarker(location, map, title, markerid, type, createdAt) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.

  if(markerid in markerloaded) {
    return;
  } else {
    markerloaded[markerid] = true;
  }

  markerloaded[markerid]

  var marker = new google.maps.Marker({
    position: location,
    map: map,
    title: markerid,
    icon: markerimage
  });

  if(type == 'food') {
    marker.setIcon(foodimage);
  } else if (type == 'hotel') {
    marker.setIcon(hotelimage);
  } else if (type == 'tourist') {
    marker.setIcon(touristimage);
  } else if (type == 'transportation') {
    marker.setIcon(transportationimage);
  } else if(type == 'entertainment') {
    marker.setIcon(entertainmentimage)
  }

  //adding marker to markerreference dictionary
  markertomarkerid['marker' + markerid] = marker;

//marker.getTitle is the id of the Marker item
  var infobox;

  var titleobject = {title: title, type: type, markerid: markerid, createdAt: createdAt, author: undefined};
  markertotitle[markerid] = titleobject;

  Parse.Cloud.run('getMarkerAuthorName', {markerid: markerid}).then(
    function(response) {
      markertotitle[response.markerid].author = response;
      if (markerfocused && (markerid == autoclickmarker)) {
        console.log(autoclickmarker, markerfocused);
        google.maps.event.trigger(markertomarkerid['marker' + autoclickmarker], 'click');
        markerfocused = false;
      }
    }
  );

  //adding infobox only when element doesn't exist
  if($('#' + marker.getTitle()).length == 0) {

    $('#map').append('<div class="infobox-wrapper"><div class="infobox" id="' + marker.getTitle() + '">' +
    '<button type="button" class="close markercloser" arial-label="Close">' +
    '<span aria-hidden="true">&times;</span></button></div></div>');

  }

  var markeroffset = -250;
  var markerwidth = 500;

  if(mobile) {
    markerwidth = $(window).width() * 9 / 10;
    markeroffset = -markerwidth / 2;

  }


  infobox = new InfoBox({
    content: document.getElementById(marker.getTitle()),
      alignBottom: true,
       disableAutoPan: false,
       maxWidth: markerwidth,
       pixelOffset: new google.maps.Size(markeroffset, -40),
       zIndex: null,
       boxStyle: {
          opacity: 1.0,
          width: markerwidth + "px"
      },
      closeBoxMargin: "12px 4px 2px 2px",
      closeBoxURL: "",
      infoBoxClearance: new google.maps.Size(1, 1)
  });

  //add only if element is nonexistant
  if($('#' + marker.getTitle()).length == 0) {

    $('#mapviewer').append('<div class="infobox-wrapper"><div class="infobox" id="' + marker.getTitle() + '">' +
    '<button type="button" class="close markercloser" arial-label="Close">' +
    '<span aria-hidden="true">&times;</span></button></div></div>');

  }

  infobox = new InfoBox({
    content: document.getElementById(marker.getTitle()),
      alignBottom: true,
       disableAutoPan: false,
       maxWidth: markerwidth,
       pixelOffset: new google.maps.Size(markeroffset, -40),
       zIndex: null,
       boxStyle: {
          opacity: 1.0,
          width: markerwidth + "px"
      },
      closeBoxMargin: "12px 4px 2px 2px",
      closeBoxURL: "",
      infoBoxClearance: new google.maps.Size(1, 1)
  });

  console.log("Offset", markeroffset);

  $('.markercloser').on('click', function() {
    google.maps.event.trigger(map, 'infoboxevent');
    console.log('closer clicked');
  });

  $('.infobox').on('click', function() {
    console.log($(this).attr('id'));
  });

  if($('#' + marker.getTitle()).children('.bubbleheader').children('.infotitle').length == 0) {
    $('#' + marker.getTitle()).append('<div class="bubbleheader"><img class="bubbleicon" src="" /><span class="distance"></span></div>')
    $('#' + marker.getTitle()).children('.bubbleheader').append('<span class="infotitle" title="' + title + '">' + title + '</span>');
    if(type == 'food') {
      $('#' + marker.getTitle() + ' .bubbleicon').attr('src', 'pictures/foodtype.png');
    } else if (type == 'entertainment') {
      $('#' + marker.getTitle() + ' .bubbleicon').attr('src', 'pictures/entertainment.png');
    } else if (type == 'hotel') {
      $('#' + marker.getTitle() + ' .bubbleicon').attr('src', 'pictures/hotel.png');
    } else if (type == 'transportation') {
      $('#' + marker.getTitle() + ' .bubbleicon').attr('src', 'pictures/transportation.png');
    } else if (type == 'tourist') {
      $('#' + marker.getTitle() + ' .bubbleicon').attr('src', 'pictures/tourist.png');
    } else if (type == 'util') {
      $('#' + marker.getTitle() + ' .bubbleicon').attr('src', 'pictures/marker.png');
    } else {
      $('#' + marker.getTitle() + ' .bubbleicon').attr('src', 'pictures/marker.png');
    }
  }


  google.maps.event.addListener(marker, 'click', function() {
    console.log("HERE " + $('#' + this.getTitle()).text());
    console.log(this.getTitle());
    console.log(this.instanceof);

    google.maps.event.trigger(map, 'infoboxevent');

    $('.posttitle').remove();
  //  infobox.open(map, this);
    var curmapcenter = map.getCenter();
    console.log(curmapcenter.lat());
    $('#sidebar').children('.markerheader').children('.markertitle').html(markertotitle[this.getTitle()].title);
    $('.markerdate').html(getCurrentTime(markertotitle[this.getTitle()].createdAt));
    $('.markerauthor').html(markertotitle[this.getTitle()].author.name);
    $('#sidepic').attr('src', markertotitle[this.getTitle()].author.url);
    $('#sidepic').load(function() {
      if ($(this).height() > $(this).width()) {
        $(this).addClass('heightlong');
      }
    });
    console.log(markertotitle[this.getTitle()].author.url);

    if(!mobile) {
      if($('#sidebarholder').width() == 0) {
        var center = map.getCenter();
        $('#sidebarholder').animate({
          width: originalwidth
        }, 250, function() {
          $('#map').animate({
            width: $('#map').parent().width() - $('#sidebarholder').width()
          }, 0, function() {
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });
          $('#mapviewer').animate({
            width: $('#mapviewer').parent().width() - $('#sidebarholder').width()
          }, 0, function() {
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });
        });
      }

    } else {
      if($('#sidebarholder').height() == 0) {
        var center = map.getCenter();
        $('#sidebarholder').animate({
          height: originalheight
        }, 250, function() {
          $('#map').animate({
            height: $('#map').parent().height() - $('#sidebarholder').height()
          }, 0, function() {
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });
          $('#mapviewer').animate({
            height: $('#mapviewer').parent().height() - $('#sidebarholder').height()
          }, 0, function() {
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });
        });
      }

    }



    var type = markertotitle[this.getTitle()].type;
    if(type == 'food') {
      $('#sidebar').children('.markerheader').children('img').attr('src', 'pictures/foodtype.png');
    } else if (type == 'entertainment') {
      $('#sidebar').children('.markerheader').children('img').attr('src', 'pictures/entertainment.png');
    } else if (type == 'hotel') {
      $('#sidebar').children('.markerheader').children('img').attr('src', 'pictures/hotel.png');
    } else if (type == 'transportation') {
      $('#sidebar').children('.markerheader').children('img').attr('src', 'pictures/transportation.png');
    } else if (type == 'tourist') {
      $('#sidebar').children('.markerheader').children('img').attr('src', 'pictures/tourist.png');
    } else if (type == 'util') {
      $('#sidebar').children('.markerheader').children('img').attr('src', 'pictures/marker.png');
    } else {
      $('#sidebar').children('.markerheader').children('img').attr('src', 'pictures/marker.png');
    }
    var thismap = marker.getMap().getCenter();

    if(positionmarker.getMap() != null) {
        console.log("Positionmarker on Map");
        console.log(this.getTitle());
        console.log($('#' + this.getTitle()).html());
        $('.distance').css('display', 'block');
        $('#' + this.getTitle()).children('.bubbleheader').children('.distance').html(getDistanceFromLatLonInKm(positionmarker.getPosition().lat(), positionmarker.getPosition().lng(), marker.getPosition().lat(), marker.getPosition().lng()) + ' km');
        console.log($('#' + this.getTitle()).children('.bubbleheader').children('.distance').html());
        $('#' + this.getTitle()).children('.bubbleheader').children('.distance').css('display', 'block');

        $('.markerheader').children('.markerdistance').html(getDistanceFromLatLonInKm(positionmarker.getPosition().lat(), positionmarker.getPosition().lng(), marker.getPosition().lat(), marker.getPosition().lng()) + ' km');
    }

    google.maps.event.addListener(positionmarker, 'drag', function() {
      var thismap = marker.getMap().getCenter();
      if(positionmarker.getMap() != null) {
          $('#' + this.getTitle()).children('.bubbleheader').children('.distance').html(getDistanceFromLatLonInKm(positionmarker.getPosition().lat(), positionmarker.getPosition().lng(), marker.getPosition().lat(), marker.getPosition().lng()) + ' km');
      }
    });


    var curmarker = this;

    if(basename(this.getIcon().url) == 'foodframed.png') {
      this.setIcon(foodselectedimage);
    } else if(basename(this.getIcon().url) == 'hotelframed.png') {
      this.setIcon(hotelselectedimage);
    } else if(basename(this.getIcon().url) == 'amusementframed.png') {
      this.setIcon(entertainmentselectedimage);
    } else if(basename(this.getIcon().url) == 'touristframed.png') {
      this.setIcon(touristselectedimage);
    } else if(basename(this.getIcon().url) == 'transportationframed.png') {
      this.setIcon(transportationselectedimage);
    } else if(basename(this.getIcon().url) == 'cleanmarker.png') {
      this.setIcon(selectedmarkerimage);
    } else {

    }

    google.maps.event.addListener(map, 'infoboxevent', function() {
      if(basename(curmarker.getIcon().url) == 'foodselected.png') {
        curmarker.setIcon(foodimage);
      } else if(basename(curmarker.getIcon().url) == 'hotelselected.png') {
        curmarker.setIcon(hotelimage);
      } else if(basename(curmarker.getIcon().url) == 'entertainmentselected.png') {
        curmarker.setIcon(entertainmentimage);
      } else if(basename(curmarker.getIcon().url) == 'touristselected.png') {
        curmarker.setIcon(touristimage);
      } else if(basename(curmarker.getIcon().url) == 'transportationselected.png') {
        curmarker.setIcon(transportationimage);
      } else if(basename(curmarker.getIcon().url) == 'selectedmarker.png') {
        curmarker.setIcon(markerimage);
      } else {

      }

      if(positionmarker.getMap() != null) {
        $('.markerdistance').css('display', 'inline');
      }


    });

    google.maps.event.addListener(map, 'focusoutevent', function() {
      var curmapcenter = map.getCenter();

      console.log("Focused out of map");

      if(!mobile) {
        var center = map.getCenter();
        $('#map').animate({
          width: $('#map').parent().width()
        }, 250, function() {
          $('#sidebarholder').animate({
            width: 0
          }, 0, function() {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });
      //    $('#markersearchbox').animate({
      //      "padding-left": "0px"
      //    });
        });
        $('#mapviewer').animate({
          width: $('#mapviewer').parent().width()
        }, 250, function() {
          $('#sidebarholder').animate({
            width: 0
          }, 250, function() {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });
      //    $('#markersearchbox').animate({
      //      "padding-left": "0px"
      //    });
        });
      } else {
        var center = map.getCenter();
        $('#map').animate({
          height: $('#map').parent().height()
        }, 250, function() {
          $('#sidebarholder').animate({
            height: 0
          }, 0, function() {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });

        });
        $('#mapviewer').animate({
          height: $('#mapviewer').parent().height()
        }, 250, function() {
          $('#sidebarholder').animate({
            height: 0
          }, 0, function() {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          //  map.setCenter(new google.maps.LatLng(curmapcenter.lat(), curmapcenter.lng()));
          });

        });
      }

      if(basename(curmarker.getIcon().url) == 'foodselected.png') {
        curmarker.setIcon(foodimage);
      } else if(basename(curmarker.getIcon().url) == 'hotelselected.png') {
        curmarker.setIcon(hotelimage);
      } else if(basename(curmarker.getIcon().url) == 'entertainmentselected.png') {
        curmarker.setIcon(entertainmentimage);
      } else if(basename(curmarker.getIcon().url) == 'touristselected.png') {
        curmarker.setIcon(touristimage);
      } else if(basename(curmarker.getIcon().url) == 'transportationselected.png') {
        curmarker.setIcon(transportationimage);
      } else if(basename(curmarker.getIcon().url) == 'selectedmarker.png') {
        curmarker.setIcon(markerimage);
      } else {

      }

    });

    if(!(this.getTitle() in markerpost)) {
      console.log("Adding to markerpost", this.getTitle());
      markerpost[this.getTitle()] = [];
      console.log(markerdic[this.getTitle()]);
      for(var i = 0; i < markerdic[this.getTitle()].length; ++i) {
        var mapid = this.getTitle();
        var postquery = new Parse.Query(Post);
        postquery.equalTo("objectId", markerdic[this.getTitle()][i]);
        console.log(markerdic[this.getTitle()][i]);
        postquery.first({
          success: function(result) {
            console.log(result.id);
            console.log(result.get("contents").length);
            result.get("contents")[0].fetch({
              success: function(object) {
                markerpost[mapid].push(object.get("title"));

                if($('#info' + result.id).length == 0) {
              //    $('#' + mapid).children('.posttitle').css('margin-bottom', '10px');
                  $('#sidebar').append('<div class="posttitle" id="info' + result.id + '">' + object.get("title") + '</div>');
                  $('#info' + result.id).append('<div class="postdetail">' +
                  '<span class="detailsmileys"></span><img class="infoicon infosmiley" src="pictures/smileygray.png" /><span class="detailcomments"></span><img class="infoicon" src="pictures/comment.png" />' +
                  '<div class="authoriconholder"><img src="" class="authoricon" />' +
                  '</div><span class="postauthor"></span></div>');
                  $('#info' + result.id).children('.postdetail').append('<span class="postdate">' + getCurrentTime(result.createdAt) + '</span>');

                  Parse.Cloud.run('getPostInfo', {postid: result.id}).then(function(response) {
                    $('#info' + response.postid).children('.postdetail').children('.postauthor').append(response.name);
                    $('#info' + response.postid).children('.postdetail').children('.authoriconholder').children('.authoricon').attr('src', response.url);
                    $('#info' + response.postid).children('.postdetail').children('.authoriconholder').children('.authoricon').load(function() {
                      console.log("IMAGE LOADED");
                      if ($(this).height() > $(this).width()) {
                        $(this).addClass('heightlong');
                      }
                    });
                  });

                  Parse.Cloud.run('commentnumber', {Post: result.id}).then(function(response) {
                    $('#info' + response.postid).children('.postdetail').children('.detailcomments').html(response.number);

                  });

                  Parse.Cloud.run('SmilesId', {Post: result.id}).then(function(response) {
                    console.log(response);
                    $('#info' + response.postid).children('.postdetail').children('.detailsmileys').html(response.smiles);
                  });

                  Parse.Cloud.run('hasSmiledId', {Post: result.id, User: Parse.User.current().id}).then(function(response) {
                    if(response.smiled) {
                      $('#info' + response.postid).children('.postdetail').children('.infosmiley').attr('src', 'pictures/brightsmile.png');
                    }
                  });

                }
                //load post on click of title
                $('.posttitle').on('click', function() {
                  if($('#map').length == 1 || $('.post').length <= 1) {
                    console.log($(this).attr('id').substring(4));
                    $('#postviewer').remove();
                    $('body').append('<div id="postviewer"><button type="button" class="close postcloser" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
                    $('#mapcloser').click();
                    $('html, body').animate({
                      scrollTop: 0
                    }, 100);

                    $('#postviewer').on('click', function() {
                      $('.postcloser').css('visibility', 'visible');
                      setTimeout(function() {
                        $('.postcloser').css('visibility', 'none');
                      },2000);
                    });

                    $('.postcloser').on('click', function() {
                      $('#overlayfull').click();
                    });

                    $('#overlayfull').css('display', 'block');

                    $('#overlayfull').on('click', function() {
                      $('#postviewer').remove();
                      $('#overlayfull').fadeOut('fast');
                    });

                    getPost($(this).attr('id').substring(4), $('#postviewer'));
                    $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
                    $(window).resize(function() {
                        $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
                        if( $(window).width() / 2 - 300 < $('#postsby').width()) {
                        //	$('.main-container').css('position', 'fixed');
                        //	$('.main-container').css('top', $('#postsby').height() + $('#postsby').css('top') + 'px');
                        } else {

                        }
                    });
                  } else {
                    console.log($(this).attr('id').substring(4));
                    $('#overlay').click();
                    if($('#post' + $(this).attr('id').substring(4)).length == 0) {
                      scrollingTo = true;
                      getPost($(this).attr('id').substring(4), $('.main-container'));

                    } else {
                      $('html, body').animate({
                        scrollTop: $('#post' + $(this).attr('id').substring(4)).position().top - 55
                      }, 100);
                      console.log($(this).attr('id').substring(4));
                    }
                  }
                });
                console.log(object.get("title"));
              }, error: function(err) {

              }
            });

            console.log(result.id);
          }, error: function(err) {

          }
        });
      }



      console.log(markerpost[this.getTitle()]);
    } else {
      for(var i = 0; i < markerdic[this.getTitle()].length; ++i) {
        var mapid = this.getTitle();
        var postquery = new Parse.Query(Post);
        postquery.equalTo("objectId", markerdic[this.getTitle()][i]);
        console.log(markerdic[this.getTitle()][i]);
        postquery.first({
          success: function(result) {
            console.log(result.id);
            console.log(result.get("contents").length);
            result.get("contents")[0].fetch({
              success: function(object) {
                markerpost[mapid].push(object.get("title"));

                if($('#info' + result.id).length == 0) {
                  //    $('#' + mapid).children('.posttitle').css('margin-bottom', '10px');
                      $('#sidebar').append('<div class="posttitle" id="info' + result.id + '">' + object.get("title") + '</div>');
                      $('#info' + result.id).append('<div class="postdetail">' +
                      '<span class="detailsmileys"></span><img class="infoicon infosmiley" src="pictures/smileygray.png" /><span class="detailcomments"></span><img class="infoicon" src="pictures/comment.png" />' +
                      '<div class="authoriconholder"><img src="" class="authoricon" />' +
                      '</div><span class="postauthor"></span></div>');
                      $('#info' + result.id).children('.postdetail').append('<span class="postdate">' + getCurrentTime(result.createdAt) + '</span>');

                      Parse.Cloud.run('getPostInfo', {postid: result.id}).then(function(response) {
                        $('#info' + response.postid).children('.postdetail').children('.postauthor').append(response.name);
                        $('#info' + response.postid).children('.postdetail').children('.authoriconholder').children('.authoricon').attr('src', response.url);
                        $('#info' + response.postid).children('.postdetail').children('.authoriconholder').children('.authoricon').load(function() {
                          console.log("IMAGE LOADED");
                          if ($(this).height() > $(this).width()) {
                            $(this).addClass('heightlong');
                          }
                        });
                      });

                      Parse.Cloud.run('commentnumber', {Post: result.id}).then(function(response) {
                        $('#info' + response.postid).children('.postdetail').children('.detailcomments').html(response.number);

                      });

                      Parse.Cloud.run('SmilesId', {Post: result.id}).then(function(response) {
                        console.log(response);
                        $('#info' + response.postid).children('.postdetail').children('.detailsmileys').html(response.smiles);
                      });

                      Parse.Cloud.run('hasSmiledId', {Post: result.id, User: Parse.User.current().id}).then(function(response) {
                        if(response.smiled) {
                          $('#info' + response.postid).children('.postdetail').children('.infosmiley').attr('src', 'pictures/brightsmile.png');
                        }
                      });
                }
                //load post on click of title
                $('.posttitle').on('click', function() {
                  if($('#map').length == 1 || $('.post').length <= 1) {
                    console.log($(this).attr('id').substring(4));
                    $('#postviewer').remove();
                    $('body').append('<div id="postviewer"><button type="button" class="close postcloser" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
                    $('#mapcloser').click();
                    $('html, body').animate({
                      scrollTop: 0
                    }, 100);

                    $('#postviewer').on('click', function() {
                      $('.postcloser').css('visibility', 'visible');
                      setTimeout(function() {
                        $('.postcloser').css('visibility', 'none');
                      },2000);
                    });

                    $('.postcloser').on('click', function() {
                      $('#overlayfull').click();
                    });

                    $('#overlayfull').css('display', 'block');

                    $('#overlayfull').on('click', function() {
                      $('#postviewer').remove();
                      $('#overlayfull').fadeOut('fast');
                    });

                    getPost($(this).attr('id').substring(4), $('#postviewer'));
                    $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
                    $(window).resize(function() {
                        $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
                        if( $(window).width() / 2 - 300 < $('#postsby').width()) {
                        //	$('.main-container').css('position', 'fixed');
                        //	$('.main-container').css('top', $('#postsby').height() + $('#postsby').css('top') + 'px');
                        } else {

                        }
                    });
                  } else {
                    console.log($(this).attr('id').substring(4));
                    $('#overlay').click();
                    if($('#post' + $(this).attr('id').substring(4)).length == 0) {
                      scrollingTo = true;
                      getPost($(this).attr('id').substring(4), $('.main-container'));
                      $('html, body').animate({
                        scrollTop: $('#post' + $(this).attr('id').substring(4)).position().top - 55
                      }, 300);

                    } else {
                      $('html, body').animate({
                        scrollTop: $('#post' + $(this).attr('id').substring(4)).position().top - 55
                      }, 100);
                      console.log($(this).attr('id').substring(4));
                    }

                  }
                });
                console.log(object.get("title"));
              }, error: function(err) {

              }
            });

            console.log(result.id);
          }, error: function(err) {

          }
        });
      }
      console.log(markerpost[this.getTitle()]);
    }

  });

  google.maps.event.addListener(marker, 'mouseout', function() {
    //infobox.close();
  });

  google.maps.event.addListener(marker, 'click', function() {

    if(settingmarker) {
      console.log("ITEM SET");
      itemset = true;
      if($('#post').length) {
        selected = true;
      }
      mapitem = this;/* new google.maps.Marker({
        position: this.getPosition(),
        map: null,
        title: this.getTitle(),

      });*/
      $('#instructions').css('display', 'none');
      $('#done').css('display', 'inline-block');
    }

    google.maps.event.trigger(map, 'selectedevent');
//    infobox.open(map, this);
//    this.setIcon(markerimage);
    console.log("Clicked");
    console.log(markerdic[this.getTitle()]);
  });

//on other selected event for marker
  google.maps.event.addListener(map, 'selectedevent', function() {
    console.log("Event caught");
    //marker.setIcon(markerimage);

  });

  google.maps.event.addListener(map, 'infoboxevent', function() {
    console.log("infobox dealt with");
  //  $('.distance').css('display','none');
    infobox.close();
  });

  if (markerfocused && (markerid == autoclickmarker)) {
    console.log(autoclickmarker, markerfocused);
    google.maps.event.trigger(markertomarkerid['marker' + autoclickmarker], 'click');
    markerfocused = false;

  }

}

function addAxis(location, map, label) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.

  var image= {
  	url: 'pictures/route-axis.png',
  	size: new google.maps.Size(8,8),
  	origin: new google.maps.Point(0, 0),
  	anchor: new google.maps.Point(4,4)
  };

  var marker = new google.maps.Marker({
  	label: label,
    position: location,
    icon: image,
    map: map,
    draggable: true
  });
}

function addLinePoint(event) {
	linepath.removeAt(linepath.length - 1);
	linepath.insertAt(linepath.length, event.latLng);
	lastlinepoint = linepath.length - 1;
	console.log('Path length:', linepath.length);


  var marker = new google.maps.Marker({
    position: event.latLng,
    map: map,
    draggable: true,
    icon: image
  });

  linemarkers.push(marker);
  marker.setTitle("#" + linepath.length);

  google.maps.event.addListener(marker, 'click', function() {
    marker.setMap(null);
    for (var i = 0, I = linemarkers.length; i < I && linemarkers[i] != marker; ++i);
    linemarkers.splice(i, 1);
    linepath.removeAt(i);
    lastlinepoint = linepath.length - 1;
    }
  );

  google.maps.event.addListener(marker, 'dragend', function() {
    for (var i = 0, I = linemarkers.length; i < I && linemarkers[i] != marker; ++i);
	  linepath.setAt(i, marker.getPosition());
    }
  );
}

 function addPoint(event) {
   console.log(" length", markers.length);
 	path.removeAt(path.length - 1);
  path.insertAt(path.length, event.latLng);
	lastpoint = path.length - 1;
	console.log('Path length:', path.length);
	 var image= {
	  	url: 'pictures/route-axis.png',
	  	size: new google.maps.Size(8,8),
	  	origin: new google.maps.Point(0, 0),
	  	anchor: new google.maps.Point(4,4)
	  };

    var marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      draggable: true,
      icon: image
    });
    markers.push(marker);
    marker.setTitle("#" + path.length);

    google.maps.event.addListener(marker, 'click', function() {
      marker.setMap(null);
      for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
      markers.splice(i, 1);
      path.removeAt(i);
      lastpoint = path.length - 1;
      }
    );

    google.maps.event.addListener(marker, 'dragend', function() {
      for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
      path.setAt(i, marker.getPosition());
      }
    );
  }

function addArea(location, map) {
  var area = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 0,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: location,
      radius: 2400
  });
}
