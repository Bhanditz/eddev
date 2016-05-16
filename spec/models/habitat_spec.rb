require 'rails_helper'

RSpec.describe Habitat, type: :model do
  describe "valid instance" do
    let(:habitat) { create(:habitat) }

    it "is valid" do
      expect(habitat).to be_valid
    end

    it "has a name" do
      habitat.name = ''
      expect(habitat).to be_invalid
    end

    it "has a unique name" do
      other_habitat = Habitat.new(name: habitat.name)
      expect(other_habitat).to be_invalid
    end
  end
end
