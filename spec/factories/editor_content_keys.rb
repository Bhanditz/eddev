FactoryGirl.define do
  factory :editor_content_key do
    name "MyString"
    association :content_model, factory: :habitat
    locale "en"
  end
end