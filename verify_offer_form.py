from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:5173/#/trade/offer/new")
            page.goto("http://localhost:5173/#/trade/offer/new")

            print("Waiting for 'Limits' label...")
            page.wait_for_selector("text=Limits", timeout=30000)

            print("Checking for Min/Max placeholders...")
            min_input = page.get_by_placeholder("Min")
            max_input = page.get_by_placeholder("Max")

            if min_input.is_visible() and max_input.is_visible():
                print("SUCCESS: Min and Max inputs are visible with correct placeholders.")
            else:
                print("FAILURE: Min/Max inputs not found.")

            print("Taking screenshot...")
            page.screenshot(path="/home/jules/verification/offer_form.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
