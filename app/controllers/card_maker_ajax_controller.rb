# Card service pass-through endpoints
require "card_service_caller"
require "eol_api_caller"

class CardMakerAjaxController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :ensure_user
  before_action :set_cache_headers

  wrap_parameters :post_json, :format => :json

  # POST /card_maker_ajax/cards
  def create_card
    json_response(
      CardServiceCaller.create_card(logged_in_user.id, request.raw_post)
    )
  end

  # POST /card_maker_ajax/decks/:deck_id/cards
  def create_deck_card
    json_response(
      CardServiceCaller.create_card_in_deck(logged_in_user.id,
        params[:deck_id], request.raw_post)
    )
  end

  def create_deck
    json_response(
      CardServiceCaller.create_deck(logged_in_user.id, request.raw_post)
    )
  end

  # PUT /card_maker_ajax/cards/:card_id/data
  def save_card
    json_response(
      CardServiceCaller.save_card(
        logged_in_user.id,
        params[:card_id],
        request.raw_post
      )
    )
  end

  # GET /card_maker_ajax/cards/:card_id/svg
  def render_svg
    svc_res = CardServiceCaller.svg(logged_in_user.id, params[:card_id])
    content_type = svc_res.headers["content-type"]
    opts = {
      :status => svc_res.code,
      :type => svc_res.headers["content-type"]
    }

    opts[:disposition] = :inline unless svc_res.code != 200

    send_data svc_res.body, opts
  end

  # GET /card_maker_ajax/cards/:card_id/png
  #def render_png
  #  data = CardServiceCaller.png(logged_in_user.id, params[:card_id])
  #  send_data data, :type => "image/png", :disposition => "inline"
  #end

  # POST /card_maker_ajax/images
  def upload_image
    json_response(
      CardServiceCaller.upload_image(
        logged_in_user.id,
        request.body.read
      )
    )
  end

  # GET /card_maker_ajax/templates/:template_name
  def template
    json_response(CardServiceCaller.get_template(params[:template_name]))
  end

  # GET /card_maker_ajax/card_ids
  def card_ids
    json_response(CardServiceCaller.card_ids(logged_in_user.id))
  end

  # GET /card_maker_ajax/card_summaries
  def card_summaries
    json_response(CardServiceCaller.card_summaries(logged_in_user.id))
  end

  # GET /card_maker_ajax/decks/:deck_id/card_ids
  def deck_card_ids
    json_response(CardServiceCaller.card_ids_for_deck(
      logged_in_user.id,
      params[:deck_id])
    )
  end

  def decks
    json_response(CardServiceCaller.get_decks(logged_in_user.id))
  end

  # GET /card_maker_ajax/cards/:card_id/json
  def card_json
    json_response(CardServiceCaller.json(logged_in_user.id, params[:card_id]))
  end

  # DELETE /card_maker_ajax/cards/:card_id
  def delete_card
    json_response(CardServiceCaller.delete_card(
      logged_in_user.id,
      params[:card_id]
    ))
  end

  # DELETE /card_maker_ajax/decks/:deck_id
  def delete_deck
    json_response(CardServiceCaller.delete_deck(
      logged_in_user.id,
      params[:deck_id]
    ))
  end

  # GET /card_maker_ajax/decks/:deck_id
  def get_deck
    json_response(CardServiceCaller.get_deck(
      logged_in_user.id,
      params[:deck_id]
    ))
  end

  # PUT /card_maker_ajax/cards/:card_id/deck_id
  def set_card_deck
    json_response(CardServiceCaller.set_card_deck(
      logged_in_user.id,
      params[:card_id],
      request.raw_post
    ))
  end

  # DELETE /card_maker_ajax/cards/:card_id/deck_id
  def remove_card_deck
    json_response(CardServiceCaller.remove_card_deck(
      logged_in_user.id,
      params[:card_id]
    ))
  end

  # GET /card_maker_ajax/taxon_search/:query
  def taxon_search
    eol_res = EolApiCaller.search(params[:query])
    parsed_body = JSON.parse(eol_res.body)
    results = parsed_body["results"] # String keys are not the same as symbols!

    # EOL returns duplicate pages
    if results
      results.uniq! { |r| r["id"] }
    end

    json_response_helper(parsed_body, eol_res.code)
  end

  # GET /card_maker_ajax/taxon_details/:id
  def taxon_details
    json_response(CardServiceCaller.taxon_summary(params[:id]))
  end

  private
    def json_response(httpartyResponse)
      json_response_helper(httpartyResponse.body, httpartyResponse.code)
    end

    def json_response_helper(body, code)
      respond_to do |format|
        format.json do
          render(
            :json => body,
            :status => code
          )
        end
      end
    end

    def set_cache_headers
      response.headers["Cache-Control"] = "no-cache, no-store"
      response.headers["Pragma"] = "no-cache"
      response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
    end
end
