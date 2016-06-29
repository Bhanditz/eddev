/* ContentEditor - JS module for editing and saving editable content. Uses tinymce as its frontend. 
 * Any elements of the following types with data-editable=true will be made into editor instances: h1, div.
 *
 * This module gets all of its translations from the I18n.content_editor object.
 *
 * Parameters sent in /editor_content* ajax calls follow the lower_case_with_underscore convention
 * used by Rails to streamline parsing on the server.
 */
if (typeof ContentEditor === 'undefined') {
  ContentEditor = {
    // Have the editor controls been set up yet?
    _controlInitDone: false,

    /* Disable and hide all editor instances
     */
    disableEditors: function() {
      $.each(tinymce.EditorManager.editors, function(index, editor) {
        // Hack: need to save and restore the dirty state because hide() 
        // sets isNotDirty to true
        var wasDirty = editor.isDirty();
        editor.hide(); 
        editor.setDirty(wasDirty);
      });   
    },
    /* Enable all editor instances (does not make any editors active despite the 
     * editor.show() call)
     */
    enableEditors: function() {
      $.each(tinymce.EditorManager.editors, function(index, editor) {
        editor.show(); 
      });
    },
    /* Toggle the page's edit mode. When off, the page appears as it would to a non-editor, and you cannot
     * activate any editors. When on, clicking on an editable element activates its editor.
     */
    toggleEditMode: function() {
      var switchElem = $(this),
          textElem = $('#EDIT_STATE_TEXT');

      if (switchElem.hasClass('fa-toggle-off')) {
        switchElem.removeClass('fa-toggle-off');
        switchElem.addClass('fa-toggle-on');
        textElem.html(I18n.content_editor.edit_mode_on);

        ContentEditor.enableEditors();
      } else {
        switchElem.removeClass('fa-toggle-on');
        switchElem.addClass('fa-toggle-off');
        textElem.html(I18n.content_editor.edit_mode_off)
        
        ContentEditor.disableEditors();
      }
    },
    /* Persist changes from any "dirty" editors to the server. All editors that were dirty become non-dirty.
     */
    saveEditors: function() {
      ContentEditor.disableSave();

      $.each(tinymce.EditorManager.editors, function(index, editor) {
        // isDirty returns true if the editor contents have been modified
        if (editor.isDirty()) {
          editor.save();

          var element = $(editor.getElement()),
              keyName = element.data('key-name'),
              locale = element.data('locale'),
              modelType = element.data('content-model-type'),
              modelId = element.data('content-model-id');
          

          $.ajax('/editor_content/create', {
            method: "POST",
            data: {
              state: {
                locale: locale,
                content_model_type: modelType,
                content_model_id: modelId
              },
              key: keyName,
              value: editor.getContent()
            },
            error: function() {
              editor.setDirty(true);
              ContentEditor.enableSave();
              alert(I18n.content_editor.save_error);
            },
            success: function() {
              ContentEditor.enablePublish(); 
            }
          });
        }
      });
    },
    /**
     * Add the disabled property to an element and remove
     * its click handler.
     */
    disableButton: function(button) {
      button.prop('disabled', true);
      button.off('click'); 
    },
    /**
     * Remove the disabled property from an element and
     * add the specified click handler.
     */
    enableButton: function(button, clickHandler) {
      button.prop('disabled', false);
      button.click(clickHandler);
    },
    /* Disable the save button
     */
    disableSave: function() {
      ContentEditor.disableButton($('#SaveButton'));
    },
    /* Enable the save button
     */
    enableSave: function() {
      ContentEditor.enableButton($('#SaveButton'), ContentEditor.saveEditors);
    },
    /* True if the save button is enabled, false o/w
     */
    isSaveEnabled: function() {
      return !$('#SaveButton').prop('disabled');
    },
    /* Publish content
     */
    disablePublish: function() {
      ContentEditor.disableButton($('#PublishButton'));
    }, 
    enablePublish: function() {
      ContentEditor.enableButton($('#PublishButton'), ContentEditor.publishDraft);
    },
    publishDraft: function() {
        if (!confirm(I18n.content_editor.publish_confirm)) {
          return;
        }

        ContentEditor.disablePublish();

        $.ajax('/editor_content/publish_draft', {
          method: "POST",
          data: {
            state: {
              locale: ContentEditorState.locale,
              content_model_type: ContentEditorState.model_type,
              content_model_id: ContentEditorState.model_id
            }
          },
          error: function() {
            ContentEditor.enablePublish();
            alert(I18n.content_editor.save_error);
          }
        });
    },
    /* Add the content editor controls to the dom. This function only has an effect the first time it is called 
     * on a given page.
     */
    initControls: function() {
      if (!this._controlInitDone) {
        this._controlInitDone = true;

        $('body').append(
          '<div id="EditControl">' + 
            '<div id="EDIT_STATE_TEXT">' + I18n.content_editor.edit_mode_off + '</div>' +
            '<i class="fa fa-toggle-off fa-2x" id="EditSwitch"></i><br />' +
            '<input type="submit" id="SaveButton"     disabled="disabled"' +
                'value="' + I18n.content_editor.save_label    + '" />' +
            '<input type="submit" id="PublishButton" disabled="disabled"' +
                'value="' + I18n.content_editor.publish_label + '" />' +
          '</div>'
        );

        if (ContentEditorState && ContentEditorState.enable_publish) {
          ContentEditor.enablePublish();
        }
        
        $('#EditControl').draggable({ cursor: 'move' });
        $('#EditSwitch').click(ContentEditor.toggleEditMode);

        $(window).on('beforeunload', function() {
          if (ContentEditor.isSaveEnabled()) {
            return I18n.content_editor.unsaved_beforeunload;
          }
        });
      }
    },
    /* For tinymce.init_instance_callback. Set up the editors and the global controls.
     */
    initInstanceCallback: function(editor) {
      // start disabled
      editor.hide();

      editor.on('dirty', function() {
        ContentEditor.enableSave();
      });

      ContentEditor.initControls();
    },
    /* To be called once on a new page before any initialization has occurred.
     */
    resetInitState: function() {
      this._controlInitDone = false;
    }
  };
}

$(function() {  
  ContentEditor.resetInitState();

  tinymce.baseURL = '/v2/';

  tinymce.init({
    selector: 'h1[data-editable="true"]',
    inline: true,
    plugins: 'paste',
    toolbar: 'undo redo',
    menubar: false,
    valid_styles: {
      '*': ''
    },
    valid_elements: '',
    init_instance_callback: ContentEditor.initInstanceCallback
  });

  tinymce.init({
    selector: 'div[data-editable="true"]',
    inline: true,
    plugins: 'paste link',
    toolbar: 'undo redo | bold italic | bullist | link',
    menubar: false,
    valid_styles: {
      '*': ''
    },
    valid_elements: 'a[href|target=_blank],strong/b,p,br,ul,li,em',
    init_instance_callback: ContentEditor.initInstanceCallback
  });
});
