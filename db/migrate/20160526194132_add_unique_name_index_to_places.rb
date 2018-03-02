class AddUniqueNameIndexToPlaces < ActiveRecord::Migration[4.2]
  def change
    add_index :places, :name, :unique => true
  end
end
