require 'rails_helper'

RSpec.describe EditorContentController, type: :controller do
#  let!(:user) { create(:admin_user) }
#  let(:sess) { { user_id: user.id } }
#
#  describe "#create" do
#    let(:key) { "some-key" }
#    let(:value) { "Some text" }
#    let(:locale) { "es" }
#
#    context "when a request is made" do
#      context "when the request is valid" do
#          let(:habitat) { create(:habitat) }
#          let(:content_key) { create(:editor_content_key, name: key, content_model: habitat) }
#          let(:request_body) {{ format: :json, key: key, value: value, locale: locale, content_model_id: habitat.id, content_model_type: habitat.class.name }}
#
#          before(:each) do 
#            post :create, request_body, sess
#          end
#
#          it_behaves_like :valid_request
#
#          it "sends a 200 response" do
#            expect(response.status).to eq(200)
#          end
#
#          it "creates an EditorContent from the request parameter values" do
#            expect(EditorContent.find_by(key: key, locale: locale, editor_content_owner: habitat)).not_to be_nil
#          end
#      end
#
#      context "when the request is missing a parameter" do
#        shared_examples_for :missing_parameter do
#          it "sets the HTTP status to 400" do
#            expect(response.status).to eq(400)
#          end
#        end
#
#        context "when the request is missing the key" do
#          let(:request_body) { { format: :json, value: value, locale: locale } }
#
#          before(:each) do
#            post :create, request_body, sess
#          end
#
#          it_behaves_like :missing_parameter
#        end
#
#        context "when the request is missing the value" do
#          let(:request_body) { { format: :json, key: key, locale: locale } }
#
#          before(:each) do
#            post :create, request_body, sess
#          end
#
#          it_behaves_like :missing_parameter
#        end
#
#        context "when the request is missing the locale" do
#          let(:request_body) { { format: :json, key: key, value: value } }
#
#          before(:each) do
#            post :create, request_body, sess
#          end
#
#          it_behaves_like :missing_parameter
#        end
#      end
#    end
#  end
end
