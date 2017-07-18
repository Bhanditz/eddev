# Card service API interface

require "httparty"

module CardServiceCaller
  SERVICE_HOST = Rails.application.config.x.card_service_host
  SERVICE_PORT = Rails.application.config.x.card_service_port
  SERVICE_KEY  = Rails.application.config.x.card_service_key
  USE_HTTPS    = Rails.application.config.x.card_service_use_https
  PROTOCOL     = USE_HTTPS ? "https" : "http"
  SERVICE_URL = "#{PROTOCOL}://#{SERVICE_HOST}:#{SERVICE_PORT}"

  JSON_HEADERS = { "Content-Type" => "application/json" }

  

  def self.create_card(user_id, json)
    HTTParty.post(
      "#{self.user_prefix(user_id)}/cards",
      :body => json,
      :headers => self.add_api_headers(JSON_HEADERS)
    )
  end

  def self.create_card_in_deck(user_id, deck_id, json)
    HTTParty.post(
      "#{self.user_prefix(user_id)}/decks/#{deck_id}/cards",
      :body => json,
      :headers => self.add_api_headers(JSON_HEADERS)
    )
  end

  def self.create_deck(user_id, json)
    HTTParty.post(
      "#{self.user_prefix(user_id)}/decks",
      :body => json,
      :headers => self.add_api_headers(JSON_HEADERS)
    )
  end

  def self.get_decks(user_id)
    HTTParty.get(
      "#{self.user_prefix(user_id)}/decks",
      :headers => self.add_api_headers({})
    )
  end

  def self.save_card(user_id, card_id, data)
    HTTParty.put(
      "#{self.user_prefix(user_id)}/cards/#{card_id}/save",
      :body => data,
      :headers => self.add_api_headers(JSON_HEADERS)
    )
  end

  def self.svg(user_id, card_id)
    HTTParty.get(
      "#{self.user_prefix(user_id)}/cards/#{card_id}/svg",
      :headers => self.add_api_headers({})
    )
  end

  #def self.png(user_id, card_id)
  #  HTTParty.get("#{self.user_prefix(user_id)}/cards/#{card_id}/png")
  #end

  def self.json(user_id, card_id)
    HTTParty.get(
      "#{self.user_prefix(user_id)}/cards/#{card_id}/json",
      :headers => self.add_api_headers({})
    )
  end

  def self.delete_card(user_id, card_id)
    HTTParty.delete(
      "#{self.user_prefix(user_id)}/cards/#{card_id}",
      :headers => self.add_api_headers({})
    )
  end

  def self.delete_deck(user_id, deck_id)
    HTTParty.delete(
      "#{self.user_prefix(user_id)}/decks/#{deck_id}",
      :headers => self.add_api_headers({})
    )
  end

  def self.get_deck(user_id, deck_id)
    HTTParty.get(
      "#{self.user_prefix(user_id)}/decks/#{deck_id}",
      :headers => self.add_api_headers({})
    )
  end

  def self.upload_image(user_id, data)
    HTTParty.post(
      "#{self.user_prefix(user_id)}/images",
      :body => data,
      :headers => self.add_api_headers({
        "Content-Type" => "application/octet-stream"
      }) # Let the service determine the file type
    )
  end

  def self.get_template(name)
    HTTParty.get(
      "#{SERVICE_URL}/templates/#{name}",
      :headers => self.add_api_headers({})
    )
  end

  def self.card_ids(user_id)
    HTTParty.get(
      "#{self.user_prefix(user_id)}/cardIds",
      :headers => self.add_api_headers({})
    )
  end

  def self.card_summaries(user_id)
    HTTParty.get(
      "#{self.user_prefix(user_id)}/cardSummaries",
      :headers => self.add_api_headers({})
    )
  end

  def self.card_ids_for_deck(user_id, deck_id)
    HTTParty.get(
      "#{self.user_prefix(user_id)}/decks/#{deck_id}/cardIds",
      :headers => self.add_api_headers({})
    )
  end

  def self.set_card_deck(user_id, card_id, deck_id)
    HTTParty.put(
      self.card_deck_path(user_id, card_id),
      :body => deck_id,
      :headers => self.add_api_headers({
        "Content-Type" => "text/plain"
      })
    )
  end

  def self.remove_card_deck(user_id, card_id)
    HTTParty.delete(
      self.card_deck_path(user_id, card_id),
      :headers => self.add_api_headers({})
    )
  end

  def self.taxon_summary(taxon_id)
    HTTParty.get(
      "#{SERVICE_URL}/taxonSummaries/#{taxon_id}",
      :headers => self.add_api_headers({})
    )
  end

  def self.populate_deck_from_collection(user_id, deck_id, post_body)
    HTTParty.post(
      "#{self.user_prefix(user_id)}/decks/#{deck_id}/populateFromCollection",
      :body => post_body,
      :headers => self.add_api_headers(JSON_HEADERS)
    )
  end

  def self.collection_job_status(job_id)
    HTTParty.get(
      "#{SERVICE_URL}/collectionJob/#{job_id}/status",
      :headers => self.add_api_headers({})
    )
  end

  private
    def self.user_prefix(user_id)
      "#{SERVICE_URL}/users/#{user_id}"
    end

    def self.card_deck_path(user_id, card_id)
      "#{self.user_prefix(user_id)}/cards/#{card_id}/deckId"
    end

    def self.add_api_headers(headers)
      { :'x-api-key' => SERVICE_KEY }.merge(headers)
    end

    def self.build_service_url(use_https, host, port)
      prefix = use_https ? "https://" : "http://"
      "#{prefix}#{host}:#{port}"
    end
end
