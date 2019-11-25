# Generated by Selenium IDE
require 'selenium-webdriver'
require 'json'
require 'eyes_selenium'
describe 'Untitleddddddddddddddddddddddddddddd' do
  before(:each) do
    caps = Selenium::WebDriver::Remote::Capabilities.chrome
    @driver = Selenium::WebDriver.for(:remote, url: 'http://selenium:4444/wd/hub', desired_capabilities: caps)
    @vars = {}
    @visual_grid_runner = Applitools::Selenium::VisualGridRunner.new(10)
    @eyes = Applitools::Selenium::Eyes.new(visual_grid_runner: @visual_grid_runner)
    config = Applitools::Selenium::Configuration.new.tap do |c|
      c.api_key = ENV['APPLITOOLS_API_KEY']
      c.app_name = 'kkkk'
      c.test_name = 'Untitleddddddddddddddddddddddddddddd'
      c.viewport_size = Applitools::RectangleSize.for('1440x998')
      c.accessibility_validation = Applitools::AccessibilityLevel::AA
      c.baseline_env_name = 'asdfasdfjkjkjjasdfjasfjasdfj'
      c.add_browser(2048, 1536, BrowserTypes::CHROME)
      c.add_device_emulation(Devices::IPhone678Plus, Orientations::LANDSCAPE)
    end
    @eyes.config = config
    @eyes.open(driver: @driver)
  end
  after(:each) do
    @driver.quit
    @visual_grid_runner.get_all_test_results
  end
  it 'untitleddddddddddddddddddddddddddddd' do
    @driver.get('https://www.google.com/')
    preRenderHook = 'console.log(\"blah\");'
    @eyes.check(URI.parse(@driver.current_url).path, Applitools::Selenium::Target.window.fully.script_hook(@pre_render_hook))
    @eyes.check(URI.parse(@driver.current_url).path, Applitools::Selenium::Target.region(:name, 'q').script_hook(@pre_render_hook))
    @eyes.close(false)
  end
end
