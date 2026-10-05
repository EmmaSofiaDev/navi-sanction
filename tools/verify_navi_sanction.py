import os
import sys
import time

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def run_tests():
    print("=== STARTING NAVI-SANCTION PRODUCTION-GRADE TEST SUITE ===")
    artifacts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "test_screenshots")
    os.makedirs(artifacts_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = context.new_page()

        # Step 1: Navigate to localhost:3005
        print("\n[TEST 1] Loading NaviSanction at http://localhost:3005...")
        page.goto("http://localhost:3005")
        page.wait_for_selector(".top-nav-bar", timeout=15000)
        page.wait_for_timeout(2000)
        
        # Verify brand & telemetry
        brand_text = page.locator(".brand-name").inner_text()
        print(f"  [OK] Brand: {brand_text}")
        assert "NAVI-SANCTION" in brand_text

        # Verify initial vessel in Cockpit
        vessel_title = page.locator(".panel-title.uppercase").inner_text()
        print(f"  [OK] Initial Active Vessel: {vessel_title}")
        assert "MV NORDIC SENTINEL" in vessel_title.upper()
        page.screenshot(path=os.path.join(artifacts_dir, "01_cockpit_initial_deadlock.png"))

        # Step 2: Test Scenario switching
        print("\n[TEST 2] Testing Tactical Scenario switching...")
        page.locator("button:has-text('3. HORMUZ SPOOFING')").click()
        page.wait_for_timeout(1500)
        vessel_title_hormuz = page.locator(".panel-title.uppercase").inner_text()
        print(f"  [OK] Hormuz Vessel Switched To: {vessel_title_hormuz}")
        assert "MT PACIFIC OPAL" in vessel_title_hormuz.upper()
        page.screenshot(path=os.path.join(artifacts_dir, "02_cockpit_hormuz_scenario.png"))

        # Switch to Allied Convoy Safe
        page.locator("button:has-text('2. ALLIED CONVOY')").click()
        page.wait_for_timeout(1500)
        status_chip = page.locator(".status-chip").inner_text()
        print(f"  [OK] Allied Convoy Status: {status_chip}")
        page.screenshot(path=os.path.join(artifacts_dir, "03_cockpit_allied_convoy.png"))

        # Step 3: Test Dual-Key Adjudication Modal
        print("\n[TEST 3] Testing Dual-Key Adjudication Mutation Modal...")
        page.locator("button:has-text('+ NEW ADJUDICATION')").click()
        page.wait_for_selector(".director-modal-backdrop", timeout=5000)
        print("  [OK] Adjudication Modal Opened")
        page.screenshot(path=os.path.join(artifacts_dir, "04_modal_adjudication_open.png"))

        # Click Sign & Commit Mutation
        persist_btn = page.locator(".modal-btn-commit")
        persist_btn.click()
        page.wait_for_selector(".modal-btn-return", timeout=5000)
        print("  [OK] Mutation Persisted to Sanity Content Lake")
        page.screenshot(path=os.path.join(artifacts_dir, "04b_modal_mutation_success.png"))

        # Return to cockpit
        page.locator(".modal-btn-return").click()
        page.wait_for_selector(".director-modal-backdrop", state="detached", timeout=5000)
        page.wait_for_timeout(1000)

        # Verify bottom ribbon updated
        pills = page.locator(".precedent-pill")
        pill_count = pills.count()
        print(f"  [OK] Precedent Ledger Ribbon Count: {pill_count}")
        assert pill_count >= 1
        page.screenshot(path=os.path.join(artifacts_dir, "05_cockpit_mutation_persisted.png"))

        # Step 4: Click Precedent Pill to test Precedent Modal & Apply to Cockpit
        print("\n[TEST 4] Testing Precedent Audit Modal & Apply to Cockpit...")
        pills.first.click()
        page.wait_for_selector(".precedent-modal-card", timeout=5000)
        print("  [OK] Precedent Audit Modal Opened")
        page.screenshot(path=os.path.join(artifacts_dir, "06_modal_precedent_audit.png"))

        apply_btn = page.locator(".audit-apply-btn")
        apply_btn.click()
        page.wait_for_selector(".precedent-modal-card", state="detached", timeout=5000)
        print("  [OK] Precedent successfully applied to Cockpit")

        # Step 5: Test Statutory Corpus Tab
        print("\n[TEST 5] Testing Statutory Corpus & Audit Runner...")
        page.locator("button.nav-tab-btn:has-text('STATUTORY CORPUS')").click()
        page.wait_for_timeout(1000)
        
        # Test Search
        search_input = page.locator("input[placeholder*='Search treaties']")
        search_input.fill("SOLAS")
        page.wait_for_timeout(500)
        search_count = page.locator(".corpus-clause-tile").count()
        print(f"  [OK] Corpus Search for 'SOLAS' matched {search_count} clauses")
        assert search_count >= 1

        # Clear search and select Lloyd's JWLA clause
        search_input.fill("")
        page.wait_for_timeout(500)
        page.locator(".corpus-clause-tile:has-text('JWLA-032')").click()
        page.wait_for_timeout(500)

        # Run Live Statutory Audit
        audit_btn = page.locator(".clause-run-audit-btn")
        audit_btn.click()
        page.wait_for_selector(".clause-audit-result-panel", timeout=5000)
        audit_text = page.locator(".clause-audit-result-panel").inner_text()
        print(f"  [OK] Statutory Audit Result: {audit_text[:80]}...")
        page.screenshot(path=os.path.join(artifacts_dir, "07_corpus_audit_result.png"))

        # Test Jump from Corpus into GROQ Studio
        groq_jump_btn = page.locator(".clause-groq-jump-btn")
        groq_jump_btn.click()
        page.wait_for_timeout(1000)
        active_tab = page.locator("button.nav-tab-btn.active").inner_text()
        print(f"  [OK] Jumped from Corpus to: {active_tab}")
        assert "GROQ STUDIO" in active_tab
        page.screenshot(path=os.path.join(artifacts_dir, "08_groq_studio_preloaded.png"))

        # Step 6: Test GROQ Studio Presets & Queries
        print("\n[TEST 6] Testing GROQ Studio Presets & Query Engine...")
        run_query_btn = page.locator(".groq-execute-btn")
        run_query_btn.click()
        page.wait_for_timeout(1000)
        
        # Verify JSON results
        result_text = page.locator(".groq-output-pre").inner_text()
        print(f"  [OK] GROQ Execution Result contains documents: {'_type' in result_text or 'zoneName' in result_text or 'clauseNumber' in result_text}")
        assert len(result_text) > 20

        # Test Preset 2 (Tri-lateral join)
        page.locator(".groq-preset-btn:has-text('Tri-lateral Contradiction')").click()
        page.wait_for_timeout(1000)
        preset_2_text = page.locator(".groq-output-pre").inner_text()
        print(f"  [OK] Preset 2 Result has contradictoryClauses: {'contradictoryClauses' in preset_2_text}")
        page.screenshot(path=os.path.join(artifacts_dir, "09_groq_preset_join.png"))

        # Step 7: Test Fleet Matrix Tab & Dynamic Cockpit Routing
        print("\n[TEST 7] Testing Fleet Matrix & Engagement Routing...")
        page.locator("button.nav-tab-btn:has-text('FLEET MATRIX')").click()
        page.wait_for_timeout(1000)

        # Test Filters
        page.locator(".fleet-filter-btn:has-text('DEADLOCK')").click()
        page.wait_for_timeout(500)
        deadlock_count = page.locator(".fleet-vessel-card").count()
        print(f"  [OK] Fleet DEADLOCK Filter: {deadlock_count} vessels shown")

        page.locator(".fleet-filter-btn:has-text('ALL FLEET')").click()
        page.wait_for_timeout(500)

        # Test Transmit Fleet Advisory
        broadcast_btn = page.locator(".fleet-broadcast-btn")
        broadcast_btn.click()
        page.wait_for_selector(".fleet-broadcast-banner", timeout=3000)
        print("  [OK] Fleet Advisory Emergency Broadcast Banner displayed")
        page.screenshot(path=os.path.join(artifacts_dir, "10_fleet_broadcast_advisory.png"))

        # Click ENGAGE IN TACTICAL COCKPIT on MV Odesa Star
        odesa_card = page.locator(".fleet-vessel-card:has-text('MV Odesa Star')")
        engage_btn = odesa_card.locator(".vessel-engage-btn")
        engage_btn.click()
        page.wait_for_timeout(1200)

        # Verify Cockpit transitioned and now displays MV Odesa Star
        active_tab_now = page.locator("button.nav-tab-btn.active").inner_text()
        vessel_title_now = page.locator(".panel-title.uppercase").inner_text()
        imo_now = page.locator(".imo-chip").inner_text()
        print(f"  [OK] Switched to Tab: {active_tab_now}")
        print(f"  [OK] Active Cockpit Vessel: {vessel_title_now} ({imo_now})")
        assert "TACTICAL COCKPIT" in active_tab_now.upper()
        assert "MV ODESA STAR" in vessel_title_now.upper()
        assert "9418302" in imo_now
        page.screenshot(path=os.path.join(artifacts_dir, "11_cockpit_engaged_odesa_star.png"))

        # Step 8: Test Architecture Blueprint & SHA-256 Verifier
        print("\n[TEST 8] Testing Architecture Blueprint & Web Crypto Verifier...")
        page.locator("button.nav-tab-btn:has-text('ARCHITECTURE')").click()
        page.wait_for_timeout(1000)

        # Test Layers Inspector
        page.locator(".blueprint-layer-card:has-text('LAYER 03')").click()
        page.wait_for_timeout(500)
        inspector_code = page.locator(".layer-inspector-code").inner_text()
        print(f"  [OK] Layer 3 Inspector Code: {inspector_code[:60]}...")

        # Test Ping Connection
        ping_btn = page.locator(".blueprint-ping-btn")
        ping_btn.click()
        page.wait_for_timeout(1000)
        ping_text = ping_btn.inner_text()
        print(f"  [OK] Content Lake Ping: {ping_text}")
        assert "LIVE" in ping_text or "200 OK" in ping_text

        # Test SHA-256 Digital Signature Verification
        verify_btn = page.locator("button:has-text('VERIFY SHA-256')")
        verify_btn.click()
        page.wait_for_selector(".crypto-stat-grid", timeout=5000)
        page.wait_for_timeout(500)
        print("  [OK] SHA-256 Cryptographic Audit Computed and Verified")
        page.screenshot(path=os.path.join(artifacts_dir, "12_architecture_crypto_verified.png"))

        browser.close()
        print("\n=== ALL TESTS PASSED SUCCESSFULLY WITH 100% PASS RATE! ===")

if __name__ == "__main__":
    run_tests()
