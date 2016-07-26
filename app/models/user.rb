require "unix_crypt"

class User < ActiveRecord::Base
  ##########################################################
  # DO NOT ALTER MAPPINGS - ONLY ADD NEW ONES AS NECESSARY #
  ##########################################################
  enum :role => { 
    :basic => 0, 
    :admin => 1,
  }

  has_secure_password :validations => false

  # Constants used in view for HTML5 pattern validation
  PASSWORD_MIN_LENGTH = 6
  validates :password, :length => { minimum: PASSWORD_MIN_LENGTH },
                       :confirmation => true,
                       :if => :validate_password?

  validates :password_confirmation, :presence => true,
                                    :unless => :password_blank?

  USER_NAME_PATTERN = "[a-zA-Z0-9\.@_]+"
  validates :user_name, :presence => true, 
                        :uniqueness => true,
                        :format => { :with =>/\A#{USER_NAME_PATTERN}\z/ }

  validates :email, :presence => true
  validates :full_name, :presence => true
  validates :confirm_token, :uniqueness => true

  has_many :galleries, :dependent => :destroy
  has_many :place_permissions, :dependent => :destroy
  has_many :password_reset_tokens

  before_create :set_confirm_token
  before_create :set_default_role

  before_save :cleanup_legacy_pwd_digest

  attr_accessor :force_password_validation

  NUM_EXTRA_SALT_CHARS = 4 

  ###########################################################################
  # WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING #
  #                                                                         #
  # DO NOT CHANGE THIS VALUE. IT IS USED TO CALCULATE A LEGACY USER ID THAT # 
  # MAY BE REFERENCED IN THE PHP APP DATABASES. CHANGING THIS VALUE WILL    #
  # RESULT IN RESOURCES REFERRING TO THE WRONG USER!!!                      #
  #                                                                         #
  # WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING #
  ###########################################################################
  LEGACY_ID_OFFSET = 2000

  def legacy_id
    read_attribute(:legacy_id) || id + LEGACY_ID_OFFSET
  end

  DEFAULT_LEGACY_SALT = Rails.application.config.x.legacy_password_salt
  attr_writer :legacy_salt # For tests

  def legacy_salt
    @legacy_salt || DEFAULT_LEGACY_SALT
  end

  def locale
    saved_locale = read_attribute(:locale)
    if saved_locale
      saved_locale
    else
      I18n.default_locale
    end
  end

  def authenticate(password)
    # A user should either have a password_digest or a legacy_password_digest 
    # (enforced by validations). If neither are present, return false and log an error.
    if password_digest
      super(password) # defined in bcrypt
    elsif legacy_password_digest
      digest = UnixCrypt::MD5.build(password, legacy_salt)[digest_start_index..-1]

      if digest == legacy_password_digest # auth success
        if self.update(:password => password, 
                       :password_confirmation => password)
          Rails.logger.info("Successfully migrated password for user #{id}/#{user_name}")
        else
          Rails.logger.error("Failed to migrate password for user #{id}/#{user_name}")
        end
        
        self
      else # auth failure
        false
      end
    else
      Rails.logger.error("User #{self.id} does not have a password_digest or legacy_password_digest")
      false
    end
  end

  # Set confirmed_at to the current time and save
  def confirm!
    if confirmed_at
      raise "User already confirmed"
    end

    self.confirmed_at = DateTime.now
    save!
  end

  def confirmed?
    confirmed_at.present?
  end

  private
  def validate_password?
    force_password_validation || (legacy_password_digest.blank? && !persisted?) || !password.blank?
  end

  def password_blank?
    password.blank?
  end

  def digest_start_index
    # UnixCrypt::MD5 digests are of the form '$1$<legacy_salt>$<digest>'
    legacy_salt.length + NUM_EXTRA_SALT_CHARS
  end

  def set_confirm_token
    self.confirm_token = SecureRandom.base64
  end

  def set_default_role
    self.role ||= :basic
  end

  def cleanup_legacy_pwd_digest
    self.legacy_password_digest = nil if password_digest
  end
end
