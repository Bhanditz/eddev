require 'rails_helper'

RSpec.describe Place, type: :model do
  describe "valid instance" do
    let(:place) { create(:place) }

    it "is valid" do
      expect(place).to be_valid
    end

    it "has a name" do
      place.name = ''
      expect(place).to be_invalid 
    end
  end
end