module EditorContentHelper
  def can_edit(key)
    logged_in_user && logged_in_user.admin?
  end 

  def editable_tag(name, key, options = {})
    required_options = 
      can_edit(key) ? { "data-content-key": key, "data-locale": I18n.locale, "data-editable": true } : {}

    stored_content = EditorContent.order(id: :desc).find_by(key: key, locale: I18n.locale)
    content = key

    if stored_content
      content = stored_content.value
    end

    content_tag(name, content.html_safe, options.merge(required_options))
  end
end
