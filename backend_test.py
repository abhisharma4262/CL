import requests
import sys
import json
from datetime import datetime

class CommercialLendingAPITester:
    def __init__(self, base_url="https://commercial-validator.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test-session-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root Endpoint",
            "GET", 
            "",
            200
        )

    def test_seed_database(self):
        """Test seeding the database"""
        return self.run_test(
            "Seed Database",
            "POST",
            "seed", 
            200
        )

    def test_get_applications(self):
        """Test getting all applications with stats"""
        success, response = self.run_test(
            "Get Applications List",
            "GET",
            "applications",
            200
        )
        if success:
            # Validate response structure
            if 'applications' in response and 'stats' in response:
                apps = response['applications']
                stats = response['stats']
                print(f"   Found {len(apps)} applications")
                print(f"   Stats: Pending({stats.get('pending', {}).get('count', 0)}) Awaiting({stats.get('awaiting', {}).get('count', 0)}) Completed({stats.get('completed', {}).get('count', 0)})")
                
                # Verify we have 8 applications as expected
                if len(apps) == 8:
                    print("   ✅ Correct number of applications (8)")
                else:
                    print(f"   ⚠️  Expected 8 applications, got {len(apps)}")
                
                # Check stats match expected counts (4 Pending, 2 Awaiting, 2 Completed)
                pending_count = stats.get('pending', {}).get('count', 0)
                awaiting_count = stats.get('awaiting', {}).get('count', 0) 
                completed_count = stats.get('completed', {}).get('count', 0)
                
                expected_counts = {'pending': 4, 'awaiting': 2, 'completed': 2}
                for status, expected in expected_counts.items():
                    actual = stats.get(status, {}).get('count', 0)
                    if actual == expected:
                        print(f"   ✅ {status.title()} count correct ({actual})")
                    else:
                        print(f"   ⚠️  {status.title()} count mismatch - expected {expected}, got {actual}")
                
                return True, apps[0]['id'] if apps else None  # Return first app ID for detail test
            else:
                print("   ❌ Invalid response structure - missing applications or stats")
        
        return success, None

    def test_search_applications(self):
        """Test search functionality"""
        # Test search by company name
        success1, _ = self.run_test(
            "Search Applications by Name",
            "GET",
            "applications",
            200,
            params={'search': 'Tesla'}
        )
        
        # Test search by industry
        success2, _ = self.run_test(
            "Search Applications by Industry", 
            "GET",
            "applications",
            200,
            params={'search': 'Technology'}
        )
        
        # Test search by application number
        success3, _ = self.run_test(
            "Search Applications by App No",
            "GET", 
            "applications",
            200,
            params={'search': 'CL-3310'}
        )
        
        return success1 and success2 and success3, None

    def test_get_application_detail(self, app_id):
        """Test getting a specific application detail"""
        if not app_id:
            print("❌ No application ID provided for detail test")
            return False, None
            
        success, response = self.run_test(
            "Get Application Detail",
            "GET",
            f"applications/{app_id}",
            200
        )
        
        if success and isinstance(response, dict):
            # Validate key fields are present
            required_fields = ['id', 'application_no', 'applicant_name', 'ai_recommendation', 
                             'company_insights', 'key_ratios', 'covenant_recommendations']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"   ⚠️  Missing fields: {missing_fields}")
            else:
                print("   ✅ All required fields present")
        
        return success, app_id

    def test_update_review_status(self, app_id):
        """Test updating application review status"""
        if not app_id:
            print("❌ No application ID provided for status update test")
            return False, None
            
        return self.run_test(
            "Update Review Status",
            "PUT",
            f"applications/{app_id}/review-status", 
            200,
            data={'review_status': 'Approved'}
        )

    def test_chat_functionality(self):
        """Test chat with AI (Gemini 2.0 Flash)"""
        success, response = self.run_test(
            "Send Chat Message",
            "POST",
            "chat",
            200,
            data={
                'session_id': self.session_id,
                'message': 'What are the key factors in commercial lending analysis?'
            }
        )
        
        if success and isinstance(response, dict):
            if 'response' in response and 'message_id' in response:
                print("   ✅ Valid chat response structure")
                print(f"   Response length: {len(response['response'])} chars")
                return True, response['message_id']
            else:
                print("   ❌ Invalid chat response structure")
        
        return success, None

    def test_chat_with_application_context(self, app_id):
        """Test chat with application context"""
        if not app_id:
            print("❌ No application ID provided for context chat test")
            return False, None
            
        return self.run_test(
            "Send Chat with App Context",
            "POST", 
            "chat",
            200,
            data={
                'session_id': f"{self.session_id}-context",
                'message': 'What is your analysis of this application?',
                'application_id': app_id
            }
        )

    def test_chat_history(self):
        """Test getting chat history"""
        return self.run_test(
            "Get Chat History",
            "GET",
            f"chat/{self.session_id}/history",
            200
        )

def main():
    print("🚀 Starting Commercial Lending AI Workbench API Tests")
    print("=" * 60)
    
    tester = CommercialLendingAPITester()
    app_id = None
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Seed Database", tester.test_seed_database),
        ("Get Applications", tester.test_get_applications),
        ("Search Applications", tester.test_search_applications),
        ("Chat Functionality", tester.test_chat_functionality),
        ("Chat History", tester.test_chat_history)
    ]
    
    # Run initial tests
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if test_name == "Get Applications":
                success, app_id = test_func()
            else:
                success, _ = test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    # Run tests that need app_id
    if app_id:
        dependent_tests = [
            ("Get Application Detail", lambda: tester.test_get_application_detail(app_id)),
            ("Update Review Status", lambda: tester.test_update_review_status(app_id)),
            ("Chat with App Context", lambda: tester.test_chat_with_application_context(app_id))
        ]
        
        for test_name, test_func in dependent_tests:
            print(f"\n{'='*20} {test_name} {'='*20}")
            try:
                test_func()
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
    
    # Print final results
    print(f"\n{'='*60}")
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())