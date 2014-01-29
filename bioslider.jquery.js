/**
 *  UM-Dearborn Alumni Bio Slider
 *  Version: 0.4
 *  Author: Kyle Smith
 */

(function($) {

  $.fn.bioslider = function(options) {

    var settings = {
      tweenTime      : 200,
      scrollPixels   : 100,
      captionText    : 'Click Image to See More',
      randomOrder    : false,
      compact        : false
    };

    return this.each(function() {

        if(options) {
          $.extend(settings, options);
        }

        var   bioWrapper,
              bioContain = $(this),
              thumbWrapper,
              thumbContain,
              captionContain,
              controlLeft,
              controlRight;

        var   numBios = 0;

        var   curPos  = 0,
              maxPos  = 0,
              nxtPos;

      var fns = {
        addThumbnail : function(index, img, name, url) {
          thumbContain.append("<li><a rel='" + index + "' title='" + name + "' href='" + url + "'><img src='" + img + "'/></a></li>");
        },
        swapBio : function(newIndex) {
          bioContain.find(".active").removeClass("active").fadeOut(settings.tweenTime, function() {
            $(bioContain.children("li")[newIndex]).addClass("active").fadeIn(settings.tweenTime);
          });
        },
        setCaption : function(name) {
          captionContain.html(name);
        },
        scrollRight : function() {
          nxtPos = this.getPosition() - settings.scrollPixels;
          nxtPos = nxtPos <= (0 - maxPos) ? (0 - maxPos) : nxtPos;
          thumbContain.animate({left : nxtPos}, settings.tweenTime*1.5, fns.checkBounds(nxtPos));
        },
        scrollLeft : function () {
          nxtPos = this.getPosition() + settings.scrollPixels;
          nxtPos = nxtPos >= 0 ? 0 : nxtPos;
          thumbContain.animate({left : nxtPos}, settings.tweenTime*1.5, fns.checkBounds(nxtPos));
        },
        getPosition : function() {
          // Find the current position of the thumb container
          currentPos = thumbContain.css("left");
          currentPos = currentPos.split('px')[0];
          return parseInt(currentPos);
        },
        checkBounds : function(nxtPos) {

          // Check if there are enough thumbs to enable the slider controls
          if(maxPos <= 0) {
            controlLeft.hide();
            controlRight.hide();
            return;
          }

          if(nxtPos >= 0) {
            controlLeft.show();
            controlRight.hide();
          } else if(nxtPos <= (0 - maxPos)) {
            controlRight.show();
            controlLeft.hide();
          } else {
            controlRight.show();
            controlLeft.show();
          }
        },
        logPos : function() {
          // console.log("Left:", thumbContain.css("left"));
          // console.log("Right:", thumbContain.css("right"));
          // console.log(" ");
          // setTimeout(function() { fns.logPos(); }, 500);
        },
        init : function() {
          var $this = this;

          // Randomize the bios if enabled
          if(settings.randomOrder) {
            var lis = bioContain.children("li").remove();
            lis.sort(function() {
              return (Math.round(Math.random())-0.5); // Randomize the order  
            });
            for(var i=0; i < lis.length; i++) {
              bioContain.prepend(lis[i]);
            }
          }

          // Parse through the bios
          var lis = bioContain.children("li").each(function(index) { 
            // Hide all the spotlight bios
            $(this).hide().addClass("clickable");

            // Make entire bio clickable
            $(this).click(function() {
              window.location = $(this).children("a").attr("href");
            });

            // Fill the thumbnail container
            $this.addThumbnail(index, $(this).children(".spotlight-thumb-src").val(), $(this).children("h2").text(), $(this).children("a").attr("href"));

            // Increment the numBios counter
            numBios++;

          });

          // Determine some slider settings
          maxPos = numBios * 45;
          thumbContain.css("width", maxPos + "px");
          maxPos -= 281;

          $this.checkBounds($this.getPosition());

          // Set up bio swapping if compact mode is off
          if(!settings.compact) {
            // If compact mode is off, show the first full bio
            lis.first().show().addClass('active');  

            // if compact mode is ON, don't show full bios, and disable swap functions
            thumbContain.find("a").click(function(event) {
              event.preventDefault();
              $this.swapBio( $(this).attr("rel") );
            });
          } 

          thumbContain.find("a").hover(function() {
            $this.setCaption( $(this).attr("title") );
          }, function() {
            $this.setCaption(settings.captionText);
          });

          controlLeft.click(function() {
            $this.scrollRight();
          });

          controlRight.click(function() {
            $this.scrollLeft();
          });
        }
      };

      // Build the thumbnail section
      thumbWrapper = $('<div class="spotlight-thumb-wrapper"></div>');
      thumbContain = $('<ul class="spotlight-thumb-container"></ul>').appendTo(thumbWrapper);
      controlLeft  = $('<span class="spotlight-nav-right">Next</span>').appendTo(thumbWrapper);
      controlRight = $('<span class="spotlight-nav-left">Previous</span>').appendTo(thumbWrapper);
      captionContain = $('<span class="spotlight-thumb-caption">' + settings.captionText + '</span>').appendTo(thumbWrapper);
      $('<div class="clear"></div>').appendTo(thumbWrapper);

      // Add the thumbnail section to the DOM
      bioContain.after(thumbWrapper);

      // Load in the JSON file (if it's set) and create additional bios HTML here
      if(settings.source) {
        $.ajax({
          url: settings.source,
          dataType: "json",
          complete: function(jqXHR, status) {
            if(status != "success") {
              // console.log("AJAX Request FAILED, error type: ", status);
              // Call to error method here...
            }
          },
          success: function(data) {
            var len = data.bios.length, html;
            // Build the additional bios HTML and inject into the DOM
            for(var i=0; i<len; i++) {
              html = [];
              html.push("<li>\n\t<img src=\"", data.bios[i].imageFull, "\" alt=\"", data.bios[i].name,"\" />\n\t<h2>", data.bios[i].name," ", data.bios[i].year,"</h2>\n\t<h3>", data.bios[i].major,"</h3>\n\t<span>", data.bios[i].description,"</span>\n\t<a href=\"", data.bios[i].url,"\">read more ></a>\n\t<input type=\"hidden\" class=\"spotlight-thumb-src\" value=\"", data.bios[i].imageThumb,"\" />\n\t<div class=\"clear\">\n\t</div>\n</li>");
              $(html.join('')).appendTo(bioContain);
            }
            // Call the init method
            fns.init();
          }
        });
      } else {
        // No external file, all bios must be specified inline
        fns.init();
      }

    });
  };
})(jQuery);
