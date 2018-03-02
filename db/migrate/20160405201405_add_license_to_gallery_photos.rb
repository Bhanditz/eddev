class AddLicenseToGalleryPhotos < ActiveRecord::Migration[4.2]
  def change
    add_reference :gallery_photos, :license, index: true, foreign_key: true
  end
end
