$(document).ready(function() {
  var query = new Parse.Query('Tag');
  query.descending('updatedAt');
  query.find({
    success: function(results) {
      $('.tagviewer').append('<span class="tagline"></span>');
      for(var x = 0; x < results.length; ++x) {
        var tagname = results[x].get('tag');
        if(tagname == '') {
          $('.tagline').last().append('<span class="taglisttag">' + 'etc.' + '</span>');
        } else {
          $('.tagline').last().append('<span class="taglisttag">' + tagname + '</span>');
        }
        console.log('tagline width', $('.tagline').last().width());
        console.log('Current taglisttag length', $('.taglisttag').last().width());
        if($('.tagline').last().width() > $('.tagviewer').width()) {

          console.log($('.tagline').last().width() + $('.taglisttag').last().width() , $('.tagviewer').width());
          $('.tagviewer').append('<span class="tagline"></span>');
          $('.taglisttag').last().appendTo($('.tagline').last());
          $('.taglisttag').last().css('visibility', 'visible');
          $('.taglisttag').last().on('click', function() {
            window.location.href="./tag.html?tag=" + $(this).html();
          });
          console.log($('.tagline').last().width(), $('.tagviewer').width());
        } else {
          $('.taglisttag').last().css('visibility', 'visible');
          $('.taglisttag').last().on('click', function() {
            if($(this).html() == 'etc.') {
              window.location.href="./tag.html?tag=";
            } else {
              window.location.href="./tag.html?tag=" + $(this).html();
            }

          });
        }

      }
    }, error: function(err) {

    }
  });
});
