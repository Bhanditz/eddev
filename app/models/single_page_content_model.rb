class SinglePageContentModel < ActiveRecord::Base
  validates :page_name, :presence => true, :uniqueness => true
  has_many :editor_content_keys, :as => :content_model
end
