class LocalesController < ApplicationController
  def set_locale
    locale = params[:set_locale]

    if logged_in_user
      if !logged_in_user.update(:locale => locale)
        logger.error("Failed to set locale for user #{logged_in_user.id}")
      end
    end

    url_options = Rails.application.routes.recognize_path(request.referrer)

    redirect_path = if (url_options) 
                      url_options[:locale] = locale.to_sym == I18n.default_locale ?
                        nil :
                        locale

                      url_options[:only_path] = true
                      url_for(url_options)
                    else
                      root_path :locale => locale
                    end

    redirect_to redirect_path
  end
end
