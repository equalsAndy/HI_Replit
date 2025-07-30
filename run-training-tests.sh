#!/bin/bash

# Talia Training System Test Runner
# ================================
# Comprehensive test script for the training system

set -e  # Exit on any error

echo "🎓 Talia Training System Test Suite"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if server is running
check_server() {
    print_status $BLUE "Checking if server is running on port 8080..."
    
    if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
        print_status $GREEN "✅ Server is running"
        return 0
    else
        print_status $RED "❌ Server is not running on port 8080"
        print_status $YELLOW "Please start the server with: npm run dev"
        return 1
    fi
}

# Run storage tests
run_storage_tests() {
    print_status $BLUE "Running storage tests..."
    
    if command -v tsx > /dev/null 2>&1; then
        tsx test-training-storage.ts
    elif command -v ts-node > /dev/null 2>&1; then
        ts-node test-training-storage.ts
    else
        print_status $YELLOW "⚠️  tsx or ts-node not found, skipping TypeScript storage tests"
        print_status $YELLOW "Install tsx with: npm install -g tsx"
        return 1
    fi
}

# Run API tests
run_api_tests() {
    print_status $BLUE "Running API tests..."
    
    if command -v node > /dev/null 2>&1; then
        node test-talia-training-system.js
    else
        print_status $RED "❌ Node.js not found"
        return 1
    fi
}

# Run UI tests
run_ui_tests() {
    print_status $BLUE "Opening UI test page..."
    
    if command -v open > /dev/null 2>&1; then
        # macOS
        open test-admin-training-ui.html
    elif command -v xdg-open > /dev/null 2>&1; then
        # Linux
        xdg-open test-admin-training-ui.html
    elif command -v start > /dev/null 2>&1; then
        # Windows
        start test-admin-training-ui.html
    else
        print_status $YELLOW "⚠️  Cannot auto-open browser. Please manually open: test-admin-training-ui.html"
    fi
    
    print_status $GREEN "✅ UI test page opened (or instructions provided)"
}

# Test persona management endpoints
test_persona_endpoints() {
    print_status $BLUE "Testing persona management endpoints..."
    
    # Test personas endpoint
    if curl -s -X GET "http://localhost:8080/api/admin/ai/personas" \
         -H "Content-Type: application/json" \
         --cookie-jar cookies.txt > /dev/null; then
        print_status $GREEN "✅ Personas endpoint accessible"
    else
        print_status $RED "❌ Personas endpoint failed"
        return 1
    fi
    
    # Test training endpoint structure (without authentication)
    if curl -s -X POST "http://localhost:8080/api/training/add-text" \
         -H "Content-Type: application/json" \
         -d '{"test": "endpoint"}' \
         --cookie-jar cookies.txt | grep -q "error\|authentication"; then
        print_status $GREEN "✅ Training endpoint responds (authentication required as expected)"
    else
        print_status $YELLOW "⚠️  Training endpoint response unexpected"
    fi
}

# Test coaching endpoints
test_coaching_endpoints() {
    print_status $BLUE "Testing coaching endpoints..."
    
    # Test coaching chat endpoint
    if curl -s -X POST "http://localhost:8080/api/coaching/chat" \
         -H "Content-Type: application/json" \
         -d '{"message": "test", "persona": "ast_reflection", "context": {}}' \
         --cookie-jar cookies.txt > /dev/null; then
        print_status $GREEN "✅ Coaching chat endpoint accessible"
    else
        print_status $RED "❌ Coaching chat endpoint failed"
        return 1
    fi
}

# Test file structure
test_file_structure() {
    print_status $BLUE "Testing required file structure..."
    
    # Check server files
    if [ -f "server/services/talia-training-service.ts" ]; then
        print_status $GREEN "✅ Training service exists"
    else
        print_status $RED "❌ Training service missing"
        return 1
    fi
    
    if [ -f "server/routes/training-routes.ts" ]; then
        print_status $GREEN "✅ Training routes exist"
    else
        print_status $RED "❌ Training routes missing"
        return 1
    fi
    
    # Check client files
    if [ -f "client/src/components/admin/PersonaManagement.tsx" ]; then
        print_status $GREEN "✅ Persona management component exists"
    else
        print_status $RED "❌ Persona management component missing"
        return 1
    fi
    
    # Check storage directory
    if [ -d "storage" ]; then
        print_status $GREEN "✅ Storage directory exists"
    else
        print_status $YELLOW "⚠️  Storage directory missing (will be created automatically)"
        mkdir -p storage
    fi
}

# Test training file operations
test_training_file() {
    print_status $BLUE "Testing training file operations..."
    
    local test_file="storage/test-training-temp.json"
    
    # Test write
    echo '{"test": "data"}' > "$test_file"
    if [ -f "$test_file" ]; then
        print_status $GREEN "✅ Training file write successful"
    else
        print_status $RED "❌ Training file write failed"
        return 1
    fi
    
    # Test read
    if grep -q "test" "$test_file"; then
        print_status $GREEN "✅ Training file read successful"
    else
        print_status $RED "❌ Training file read failed"
        return 1
    fi
    
    # Cleanup
    rm -f "$test_file"
    print_status $GREEN "✅ Training file operations complete"
}

# Main test execution
main() {
    local run_storage=false
    local run_api=false
    local run_ui=false
    local run_all=true
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --storage)
                run_storage=true
                run_all=false
                shift
                ;;
            --api)
                run_api=true
                run_all=false
                shift
                ;;
            --ui)
                run_ui=true
                run_all=false
                shift
                ;;
            --help)
                echo "Usage: $0 [--storage] [--api] [--ui] [--help]"
                echo "  --storage  Run only storage tests"
                echo "  --api      Run only API tests"
                echo "  --ui       Run only UI tests"
                echo "  --help     Show this help message"
                echo "  (no args)  Run all tests"
                exit 0
                ;;
            *)
                print_status $RED "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    print_status $BLUE "Starting Talia Training System Tests..."
    echo ""
    
    # Always check file structure
    test_file_structure || exit 1
    
    # Always test basic file operations
    test_training_file || exit 1
    
    # Check if server is running for network tests
    local server_running=false
    if check_server; then
        server_running=true
    fi
    
    # Run selected test suites
    if $run_all || $run_storage; then
        print_status $YELLOW "📁 STORAGE TESTS"
        echo "=================="
        run_storage_tests || print_status $RED "Storage tests failed"
        echo ""
    fi
    
    if $run_all || $run_api; then
        print_status $YELLOW "🔌 API TESTS"
        echo "============="
        if $server_running; then
            test_persona_endpoints || print_status $RED "Persona endpoint tests failed"
            test_coaching_endpoints || print_status $RED "Coaching endpoint tests failed"
            run_api_tests || print_status $RED "API tests failed"
        else
            print_status $RED "Skipping API tests - server not running"
        fi
        echo ""
    fi
    
    if $run_all || $run_ui; then
        print_status $YELLOW "🖥️  UI TESTS"
        echo "============"
        run_ui_tests || print_status $RED "UI tests failed"
        echo ""
    fi
    
    # Summary
    print_status $BLUE "🏆 TEST SUMMARY"
    echo "==============="
    print_status $GREEN "✅ File structure tests completed"
    print_status $GREEN "✅ Basic file operations completed"
    
    if $server_running; then
        print_status $GREEN "✅ Server connectivity confirmed"
        if $run_all || $run_api; then
            print_status $GREEN "✅ API tests executed"
        fi
    else
        print_status $YELLOW "⚠️  Server tests skipped (server not running)"
    fi
    
    if $run_all || $run_storage; then
        print_status $GREEN "✅ Storage tests executed"
    fi
    
    if $run_all || $run_ui; then
        print_status $GREEN "✅ UI test page provided"
    fi
    
    echo ""
    print_status $BLUE "🎯 NEXT STEPS:"
    echo "1. If server tests were skipped, start the server with: npm run dev"
    echo "2. Open test-admin-training-ui.html in your browser for interactive testing"
    echo "3. Review any failed tests and fix issues before deployment"
    echo "4. Test the complete training flow: Admin entry → TRAIN command → Training conversation → Exit"
    
    # Cleanup
    rm -f cookies.txt
}

# Run main function with all arguments
main "$@"