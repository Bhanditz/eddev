class LocalesController < ApplicationController
  def set_locale
    locale = params.require(:set_locale)

    if logged_in_user
      if !logged_in_user.update(:locale => locale)
        logger.error("Failed to set locale for user #{logged_in_user.id}")
      end
    end

    referrer = request.referrer
    if referrer
      begin
        url_options = Rails.application.routes.recognize_path(referrer)
      rescue ActionController::RoutingError
        url_options = nil  
      end
    else
      url_options = nil
    end

    redirect_path = if url_options 
                      url_options[:locale] = locale.to_sym == I18n.default_locale ?
                        nil :
                        locale

                      url_options[:only_path] = true
                      url_for(url_options)
                    else
                      home_path :locale => locale
                    end

    if locale.to_sym != I18n.default_locale && !session[:i18n_notice_shown]
      session[:i18n_notice_shown] = true
      flash[:global_notice] = I18n.t('locales.disclaimer', :locale => locale)
    end
    redirect_to redirect_path
  end
end
