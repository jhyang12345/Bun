var i = 0;
//var posts = $('post');
$('.elem').each(function(index, obj) {
  i++;
  $(obj).css('z-index', -i.toString());
});
