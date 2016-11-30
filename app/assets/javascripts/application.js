// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require jquery-ui/draggable
//= require jquery-ui/tooltip
// require galleria/galleria-1.4.2
// require galleria/themes/classic/galleria.classic
//= require tinymce-jquery
//= require_tree .

(function() {
  function slideMenuOpen() {
    var $bars = $('#BarsIcon'),
        $titleContainer = $('#TitleContainer'),
        $slideMenu = $('#SlideMenu'),
        $topbar = $('#Topbar'),
        topbarWidth = $topbar.outerWidth(),
        slideMenuWidth = $slideMenu.outerWidth(),
        targetWidth = 
          ((topbarWidth - slideMenuWidth) / topbarWidth) * 100 + '%';
    
    $bars.off('click');

    $titleContainer.animate({
      'width': targetWidth
    },
    function() {
      $bars.click(slideMenuClose);
    });
  } 

  function slideMenuClose() {
    var $bars = $('#BarsIcon'),
        $titleContainer = $('#TitleContainer');

    $bars.off('click');

    $titleContainer.animate({
      'width': '100%'
    }, 
    function() {
      $bars.click(slideMenuOpen);
    });
  }

  function closeMenuIfNecessary() {
    var transitionWidth = 525,
        $bars = $('#BarsIcon');

    if ($(window).width() > transitionWidth) {
      $('#TitleContainer').css('width', '100%');
      $bars.off('click');
      $bars.click(slideMenuOpen);
    }
  }

  $(function() {
    $('#BarsIcon').click(slideMenuOpen);
    $(window).resize(closeMenuIfNecessary);

    $('.hoverable').on('touchstart', function(event) {
      var $that = $(this);

      if (!$that.hasClass('hover')) {
        event.preventDefault();

        $that.addClass('hover');

        var removeHoverTouchFn = function(event) {
          console.log('fired for that');
          console.log($that);

          if (!($(event.target).is($that) || $that.has($(event.target)).length)) {
            console.log('doing something!');
            $that.removeClass('hover');
            $( 'body' ).off('touchstart', removeHoverTouchFn);
          }
        }

        $( 'body' ).on('touchstart', removeHoverTouchFn);
      }
    });
  });
})();
