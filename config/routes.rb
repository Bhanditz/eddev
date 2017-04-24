Rails.application.routes.draw do
  root 'welcome#index'
  get  'about'        => 'welcome#about',      :as => :about
  get  'species_cards'        => 'cards#index',        :as => :cards
  get  'lesson_plans' => 'lesson_plans#index', :as => :lesson_plans

  #  scope '(:locale)', locale: /#{I18n.available_locales.join('|')}/ do
#    resources :users
#
#    resources :places do
#      resources :habitats
#      get  'habitats/:id/langs_with_content'   => 'habitats#langs_with_content', as: :habitat_langs_with_content
#      get  'habitats/:id/draft'   => 'habitats#draft'
#
#      resources :place_permissions
#    end
#    get 'places/:id/draft'        => 'places#draft'
#
#    resources :galleries do
#      resources :gallery_photos
#    end
#
#    # The priority is based upon order of creation: first created -> highest priority.
#    # See how all your routes lay out with 'rake routes'.
#
#    # Example of regular route:
#    #   get 'products/:id' => 'catalog#view'
#    get  'login'                            => 'user_sessions#new'
#    post 'login'                            => 'user_sessions#create'
#    get  'logout'                           => 'user_sessions#destroy'
#
#    get  'migrate_user/:invitation_token'   => 'user_migrations#new', as: :migrate_user
#    post 'migrate_user/:invitation_token'   => 'user_migrations#create'
#
#    get 'tinymce_test'                      => 'tinymce_test#index'
#    get 'i18ntest'                          => 'i18n_test#index', as: :i18n_test
#    get 'foodweb_test'                      => 'foodweb_test#index', as: :foodweb_test
#
#    get  ''                                 => 'welcome#index'
#  end
#
#  post 'editor_content/create'              => 'editor_content#create'
#
#  post 'editor_content/publish_draft'       => 'editor_content#publish_draft'
#
  resources :users, :only => [:new, :create]

  get  "users/confirm/:token"         => "users#confirm", :as => :users_confirm
  get  "users/forgot_password"        => "users#forgot_password", :as => :forgot_password
  post "users/forgot_password"        => "users#mail_password_reset_token"
  get  "users/reset_password/:token"  => "users#reset_password_form", :as => :reset_password_form
  patch "users/reset_password/:token" => "users#reset_password"
  get "users/change_password"         => "users#change_password_form"
  patch "users/change_password"       => "users#change_password"
  get  "login"                        => "user_sessions#new"
  post "login"                        => "user_sessions#create"
  get  "logout"                       => "user_sessions#destroy"

  post   "cardgen/cards"                    => "cardgen#create_card"
  post   "cardgen/decks/:deck_id/cards"     => "cardgen#create_deck_card"
  put    "cardgen/cards/:card_id/data"      => "cardgen#update_card"
  get    "cardgen/cards/:card_id/svg"       => "cardgen#render_svg"
  get    "cardgen/cards/:card_id/png"       => "cardgen#render_png"
  get    "cardgen/cards/:card_id/json"      => "cardgen#card_json"
  put    "cardgen/cards/:card_id/deck_id"   => "cardgen#set_card_deck"
  delete "cardgen/cards/:card_id/deck_id"   => "cardgen#remove_card_deck"
  get    "cardgen/card_ids"                 => "cardgen#card_ids"
  get    "cardgen/card_summaries"           => "cardgen#card_summaries"
  get    "cardgen/decks/:deck_id/card_ids"  => "cardgen#deck_card_ids"
  post   "cardgen/decks"                    => "cardgen#create_deck"
  get    "cardgen/decks"                    => "cardgen#decks"
  post   "cardgen/images"                   => "cardgen#upload_image"
  get    "cardgen/templates/:template_name" => "cardgen#template"
  delete "cardgen/cards/:card_id"           => "cardgen#delete_card"
  delete "cardgen/decks/:deck_id"           => "cardgen#delete_deck"

  get  'species_cards/new'           => 'cards#new',          :as => :new_card

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
