$(function() {
  var card = null;
  var data = null;
  var cardId = null; // Card service id for card - populated after first save
  var serviceUrl = "http://localhost:8080";
  var dragState = false;
  var $inputs = $('#GeneratorControls');
  var $canvas = null;

  // http://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas/15666143#15666143
  var pixelRatio = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
  })();

  // Handlebars templates for building UI inputs
  var labelTemplate = Handlebars.compile($('#LabelTemplate').html());
  var textInputTemplate = Handlebars.compile($('#TextInputTemplate').html());
  var textareaTemplate = Handlebars.compile($('#TextareaTemplate').html());
  var imageInputTemplate = Handlebars.compile($('#ImageInputTemplate').html());
  var colorInputTemplate = Handlebars.compile($('#ColorInputTemplate').html());
  var labeledImageInputTemplate =
    Handlebars.compile($('#LabeledImageInputTemplate').html());
  var keyValListInputTemplate =
    Handlebars.compile($('#KeyValListInputTemplate').html());
  var multiImageTemplate = Handlebars.compile($('#MultiImageTemplate').html());

  var templateSupplier = {
    supply: function(templateName, cb) {
      $.getJSON(serviceUrl + '/templates/trait', function(data) {
        cb(null, data);
      })
        .fail(function() {
          cb(new Error("Failed to retrieve template"));
        });
    }
  };

  var canvasSupplier = {
    supply: function(width, height) {
      var $canvas = $('#Canvas'),
          canvas  = $canvas[0];

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;

      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      canvas.getContext("2d").setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      return canvas;
    }
  }

  var imageFetcher = {
    fetch: function(url, cb) {
      var img = new Image()
        , $img = $(img);

      $img.on('load', function() {
        cb(null, img)
      });
      $img.on('error', function() {
        cb(new Error("Failed to load image for url " + url));
      });
      $img.attr({
        src: url
      });
    }
  }

  TemplateRenderer.setTemplateSupplier(templateSupplier);
  TemplateRenderer.setCanvasSupplier(canvasSupplier);
  TemplateRenderer.setImageFetcher(imageFetcher);

  function imageId(fieldId, i) {
    return fieldId + '-' + i;
  }

  // Construct UI inputs
  function buildInputs() {
    var fields = TemplateRenderer.editableFields();

    $inputs.empty();

    $.each(fields, function(i, field) {
      $inputs.append(labelTemplate({
        label: field.label
      }));

      buildFieldInput(field);
    });
  }

  function buildFieldInput(field) {
    // TODO: remove field.value hack
    var fieldDefault = field.value != null ? field : card.defaultData[field.id]
      , choices = card.choices[field.id] || []
      , choiceIndex = fieldDefault != null ? fieldDefault.choiceIndex : null
      , defaultVal = null
      ;

    if (fieldDefault) {
      defaultVal = fieldDefault.value != null ?
                   fieldDefault.value :
                   choices[choiceIndex];
    }

    if (field.type === 'text') {
      buildTextInput(field, defaultVal);
    } else if (field.type === 'image') {
      buildImageInput(field, choices, choiceIndex);
    } else if (field.type === 'labeled-choice-image') {
      buildLabeledImageInput(field, choices);
    } else if (field.type === 'color') {
      buildColorInput(field, choices, choiceIndex);
    } else if (field.type === 'color-scheme') {
      buildColorSchemeInput(field, choices, choiceIndex);
    } else if (field.type === 'key-val-list') {
      buildKeyValListInput(field, defaultVal);
    } else if (field.type === 'multi-image') {
      buildMultiImageInput(field, choices, choiceIndex);
    } else {
      console.log('unable to construct field: ' + JSON.stringify(field));
    }
  }

  function buildKeyValListInput(field, defaults) {
    var templateData = new Array(field.max)
      , $partial = null
      , $keyValInputs = null
      , curData = null
      ;

    for (var i = 0; i < field.max; i++) {
      curData = {
        index: i,
        key: '',
        val: ''
      };

      if (i < defaults.length) {
        curData.key = defaults[i].key.text;
        curData.val = defaults[i].val.text;
      }

      templateData[i] = curData;
    }

    $partial = $(keyValListInputTemplate({
      data: templateData
    }));

    $partial.find('input').keyup(function() {
      var keyValData = [];

      $partial.find('.key-val-wrap').each(function(i, elmt) {
        var $elmt = $(elmt)
          , $keyInput = $elmt.find('.key-input')
          , $valInput = $elmt.find('.val-input')
          , keyVal = $keyInput.val()
          , valVal = $valInput.val()
          ;

        if ((keyVal != null && keyVal.length > 0) ||
            (valVal != null && valVal.length > 0)) {
          keyValData.push({
            key: { text: keyVal },
            val: { text: valVal }
          });
        }
      });

      data[field.id] = {
        value: keyValData
      };

      console.log(data[field.id]);
      redraw();
    });

    $inputs.append($partial);
  }

  function buildColorInput(field, choices, choiceIndex) {
    var $partial = $(colorInputTemplate({
          id: field.id,
          label: field.label,
          colors: choices
        }))
      , $colors = $partial.find('.color')
      ;

    $colors.each(function(i, color) {
      var $color = $(color);
      $color.css('background-color', $color.data('color'));
    });

    var clickHelper = function(elmt) {
      $colors.removeClass('selected');
      $(elmt).addClass('selected');
      data[field.id] = {
        choiceIndex: $(elmt).data('index')
      }
    };

    if (choiceIndex != null) {
      clickHelper($colors[choiceIndex]);
    }

    $colors.click(function() {
      clickHelper(this);
      redraw();
    });

    $inputs.append($partial);
  }

  function buildColorSchemeInput(field, choices, choiceIndex) {
    var templateChoices = new Array(choices.length);


    for (var i = 0; i < choices.length; i++) {
      templateChoices[i] = choices[i][field.uiColor];
    }

    buildColorInput(field, templateChoices, choiceIndex);
  }

  function buildTextInput(field, defaultVal) {
    var $partial = null
      , $input = null
      , template = field.wrapAt != null ? textareaTemplate : textInputTemplate
      , templateData = {
          id: field.id,
          defaultVal: defaultVal == null ? '' : defaultVal.text
        }
      ;

    $partial = $(template(templateData));
    $input = $partial.find('.text-field');

    var setDataValue = function() {
      data[field.id] = {
        value: {
          text: $input.val()
        }
      };
    };

    $input.keyup(function() {
      setDataValue();
      redraw();
    });

    $inputs.append($partial);
  }

  function updateImageSDimension(fieldId, propName, incr) {
    var oldVal = data[fieldId].value[propName];
    oldVal = oldVal != null ? oldVal : 0;

    data[fieldId].value.sWidth -= 20;
  }

  function updateZoomLevel(fieldId, incr) {
    var oldVal = 0;

    data[fieldId].value = data[fieldId].value || {};

    if (data[fieldId].value.zoomLevel != null) {
      oldVal = data[fieldId].value.zoomLevel;
    }

    data[fieldId].value.zoomLevel = oldVal + incr;
  }

  function buildImageInput(field, choices, choiceIndex) {
    var images = new Array(choices.length)
      , $partial = null
      , $creditInput = null
      , $partial = null
      , $selector = null
      , $field = null
      , $fileInput = null
      , $previewContainer = null
      , $zoomControls = null
      , $zoomPlus = null
      , $zoomMinus = null
      ;

    $.each(choices, function(i, choice) {
      images[i] = {
        src: choice.url,
        credit: choice.credit.text,
        index: i
      };
    });

    $partial = $(imageInputTemplate({
      id: field.id,
      label: field.label,
      images: images
    }));

    $selector = $partial.find('.img-selector');
    $field = $partial.find('.image-input');
    $fileInput = $partial.find('.image-upload-input');
    $previewContainer = $partial.find('.upload-preview');
    $creditInput = $partial.find('.image-credit');

    $creditInput.keyup(function() {
      data[field.id].value.credit = { text: $(this).val() }
      redraw();
    });

    var thumbClickedHelper = function(elmt) {
      var $elmt = $(elmt)
        , choiceIndex = $elmt.data('index');

      data[field.id] = {
        value: {
          panX: 0,
          panY: 0,
          zoomLevel: 0
        }
      }

      $partial.find('.thumb').removeClass('selected');
      $(elmt).addClass('selected');

      $creditInput.val($elmt.data('credit'));

      if (choiceIndex != null) {
        data[field.id].choiceIndex = choiceIndex;
      } else {
        data[field.id].value.image = elmt;
      }
    };

    var thumbClicked = function() {
      thumbClickedHelper(this);
      redraw();
    };

    $fileInput.change(function() {
      var fileReader = null
        , $thumb = null;

      $previewContainer.empty();

      if (this.files.length) {
        console.log('file exists');
        fileReader = new FileReader();
        fileReader.readAsDataURL(this.files[0]);

        fileReader.onload = function(e) {
          $thumb = $('<img class="thumb" src="' + e.target.result + '">');
          $thumb.click(thumbClicked);
          $previewContainer.append($thumb);

          $thumb.one('load', function() {
              $thumb.click();
            })

          if ($thumb.complete) {
            $thumb.load();
          }
        }
      }
    });

    $selector.find('.thumb').click(thumbClicked);

    $zoomControls = $partial.find('.zoom-controls');
    $zoomPlus     = $zoomControls.find('.fa-plus-circle');
    $zoomMinus    = $zoomControls.find('.fa-minus-circle');

    $zoomPlus.click(function(){
      updateZoomLevel(field.id, 1);
      redraw();
    });

    $zoomMinus.click(function() {
      updateZoomLevel(field.id, -1);
      redraw();
    })

    $inputs.append($partial);

    if (choiceIndex != null) {
      thumbClickedHelper($partial.find('.thumb')[choiceIndex]);
    }
  }

  function buildMultiImageInput(field, choices, choiceIndices) {
    var templateData = Object.assign({}, choices)
      , $partial = null
      , $imgWraps = null
      ;

    $partial = $(multiImageTemplate({
      images: templateData
    }));

    $imgWraps = $partial.find('.img-wrap');

    choiceIndices.forEach(function(choiceIndex) {
      $($imgWraps[choiceIndex]).addClass('selected');
    });

    $imgWraps.click(function()  {
      var choiceIndices = [];

      $(this).toggleClass('selected');

      $imgWraps.filter('.selected').each(function(i, imgWrap) {
        choiceIndices.push(parseInt($(imgWrap).data('index')));
      });

      console.log(choiceIndices);

      data[field.id] = {
        choiceIndex: choiceIndices
      };

      redraw();
    });

    $inputs.append($partial);
  }

  function buildLabeledImageInput(field, choices) {
    var $partial = null
      , $select = null
      , images = new Array(choices.length)
      ;

    $.each(choices, function(i, choice) {
      images[i] = {
        src: choice.url,
        label: choice.label,
        index: i
      };
    });

    $partial = $(labeledImageInputTemplate({
      id: field.id,
      label: field.label,
      images: images
    }));

    $inputs.append($partial);

    var changeHelper = function($elmt) {
      data[field.id] = {
        choiceIndex: parseInt($elmt.val())
      };
    }

    $select = $partial.find('select');
    $select.change(function() {
      changeHelper($(this));
      redraw();
    });

    changeHelper($select);
  }

  function redraw() {
    var data = card.data;
    TemplateRenderer.draw(function(err, canvas) {
      if (err) {
        console.log(err);
      }
    });
  }

  function save() {
    var requestData = $.extend(true, {}, data);

    var imageFields = TemplateRenderer.imageFields();

    dereferenceImages(imageFields, requestData, function() {
      $.ajax({
        url: serviceUrl + '/cards/' + cardId + '/data',
        method: 'PUT',
        data: JSON.stringify(requestData),
        contentType: 'application/json',
        success: function(data) {
          window.open(serviceUrl + '/cards/' + cardId + '/render');
        }
      });
    });
  }

  function dereferenceImages(imageFields, requestData, callback) {
    if (imageFields.length === 0) {
      return callback();
    }

    var field = imageFields.pop()
      , fieldData = requestData[field['id']]
      , fieldValue = fieldData ? fieldData.value : null
      , image = fieldValue ? fieldValue.image : null
      , imgSrc = image ? image.src : null
      ;

    if (imgSrc && imgSrc.startsWith('data')) {
      var origFile = $('#' + field['id'] + ' .image-upload-input')[0].files[0];
      var formData = new FormData();
      formData.append('image', origFile);

      $.ajax({
        url: serviceUrl + '/images',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
          delete fieldValue.image;
          fieldValue.url = data.url;
          console.log(fieldData);
          return dereferenceImages(imageFields, requestData, callback);
        }
      });
    } else {
      return dereferenceImages(imageFields, requestData, callback);
    }
  }

  function updateDrag(e) {
    if (!dragState) {
      return;
    }

    var offset =$(this).offset()
      , mouseX = e.pageX - offset.left
      , mouseY = e.pageY - offset.top
      , dx = mouseX - dragState['x']
      , dy = mouseY - dragState['y'];

    data[dragState['item']].value.panX -= dx;
    data[dragState['item']].value.panY -= dy;

    dragState['x'] = mouseX;
    dragState['y'] = mouseY;

    redraw();
  }

  function imageContains(imageField, e) {
    var minX = imageField.x
      , minY = imageField.y
      , maxX = minX + imageField.width
      , maxY = minY + imageField.height
      , canvasOffset = $canvas.offset()
      ;

    var mouseX = e.pageX - canvasOffset.left;
    var mouseY = e.pageY - canvasOffset.top;
    var contains = false;

    contains =  mouseX >= minX &&
                mouseX <= maxX &&
                mouseY >= minY &&
                mouseY <= maxY;

    return {
      x: mouseX,
      y: mouseY,
      contains: contains
    };
  }

  function setupCardInterface() {
    var $canvasWrap = $('#CanvasWrap');

    buildInputs();
    $('#SaveBtn').removeClass('hidden');
    $('#SaveBtn').off('click', save);
    $('#SaveBtn').click(save);

    // TODO: Fix!!! Problem arises when fixed position applied.
    // Image panning
    $canvas.mousedown(function(e) {
      $.each(TemplateRenderer.imageFields(), function(i, imageField) {
        var containsResult = imageContains(imageField, e);

        if (containsResult.contains) {
          dragState = {
            'x': containsResult.x,
            'y': containsResult.y,
            'item': imageField['id']
          };

          return false;
        }
      });
    });

    $canvas.on('mousemove', updateDrag);

    $canvas.mouseup(function(e) {
      dragState = false;
    });


    var canvasRelDocTop = 0;

    $(document).scroll(function(e) {
      var scrollTop = $(document).scrollTop()
        , viewPosn = $canvasWrap.offset().top - scrollTop
        ;

      if (!$canvasWrap.hasClass('fixed')) {
        if (viewPosn <= 35) {
          canvasRelDocTop = scrollTop;
          $canvasWrap.addClass('fixed');
        }
      } else {
        if (scrollTop <= canvasRelDocTop) {
          $canvasWrap.removeClass('fixed');
        }
      }
    });

    var $allImages = $('#GeneratorControls img')
      , imageCount = $allImages.length
      , loadedCount = 0;
    // Wait until images load
    $allImages
      .one('load', function() {
        loadedCount++;
        if (loadedCount === imageCount) {
          redraw();
        }
      })
      .each(function() {
        if (this.complete) $(this).trigger('load');
      });
  }

  $('#TemplateParams').submit(function() {
    var taxonId = $(this).find('.taxon-id').val();

    // TODO: basic format validation ([0-9]+, etc)

    $.ajax({
      url: serviceUrl + '/cards',
      data: JSON.stringify({
        templateName: 'trait',
        templateParams: {
          speciesId: taxonId
        }
      }),
      contentType: 'application/json',
      method: 'POST',
      success: function(resp) {
        card = resp;

        if (card.data == null) {
          card.data = {}
        }

        data = card.data;

        cardId = card.id;
        TemplateRenderer.setCard(card, function(err) {
          if (err) throw err;
          $canvas = $(TemplateRenderer.getCanvas());
          setupCardInterface();
        });
      }
    })
    return false;
  });
});
