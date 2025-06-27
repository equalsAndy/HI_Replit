# Generic Development Workflow - Claude + Tools

## 🛠️ Claude Development Setup & Capabilities

### **Multi-Access Development Environment**

**✅ Confirmed Working Capabilities:**
- **Filesystem Access** via Claude Desktop extensions
- **Git Analysis** via filesystem-based repository reading
- **Chrome Navigation** via AppleScript integration
- **Direct File Reading/Writing** to project files

### **Enhanced Development Approach**

#### **Method A: Claude Direct File Changes**
- Claude directly reads, analyzes, and modifies local files
- User reviews changes and handles Git operations manually
- **Best for**: Configuration updates, analysis, targeted modifications

#### **Method B: Precision Prompts for External Agents**
- Claude creates detailed prompts for external development agents
- User copies prompts to agent tools (Replit Agent, etc.) for execution
- **Best for**: Complex builds, new features, environment-specific changes

#### **Method C: Git-Informed Development**
- Claude analyzes Git repository state and history for context
- Make changes with full repository awareness and conflict detection
- Manual Git operations guided by Claude's repository analysis
- **Best for**: Context-aware development with version control safety

### **Access Capabilities Matrix**

#### **✅ Filesystem Access (Extensions-Based)**
- **Read/Write**: All project files directly
- **Performance**: Immediate, no server dependency
- **Reliability**: No external server connection issues
- **Scope**: Full project directory access

#### **✅ Chrome Navigation (AppleScript Integration)**
- **Tab Management**: List, switch, open, close tabs (confirmed working)
- **Basic Navigation**: Go back/forward, reload pages (confirmed working)  
- **URL Control**: Open specific URLs in Chrome (confirmed working)
- **Limited Access**: Cannot read page content or execute JavaScript (AppleScript limitations)

#### **✅ Git Integration (Read-Only Analysis)**
- **Repository Analysis**: Read commit history, branches, status via filesystem
- **State Monitoring**: Track Git activity through file timestamps
- **Context Awareness**: Understand repository health and recent changes
- **Manual Operations**: User executes Git commands, Claude provides guidance

### **Decision Framework: Three Hats Analysis**

**For each new task, analyze using enhanced capabilities:**

#### 🖤 **BLACK HAT - Risk Assessment**
- What could go wrong with direct filesystem changes?
- How reliable is the Chrome navigation for this task?
- What Git conflicts might arise?
- What are the failure modes for each approach?

#### 💛 **YELLOW HAT - Benefits Analysis**  
- How does filesystem access improve development speed?
- What advantages does real-time navigation provide?
- How does Git integration enhance version control?
- Which combination of tools gives optimal results?

#### 💚 **GREEN HAT - Creative Alternatives**
- How can we combine filesystem + Chrome + Git for maximum efficiency?
- What new workflows become possible with these capabilities?
- How can we optimize the development feedback loop?
- What innovative approaches are now possible?

### **Enhanced Change Type Guidelines**

#### **✅ Claude Direct + Navigation (Optimal for):**
- Simple configuration updates with immediate browser verification
- Navigation data modifications with live app testing
- Small component edits with quick navigation to test environments
- Git-tracked changes with repository awareness

#### **✅ Precision Prompts + Navigation (Optimal for):**
- Complex component creation with efficient tool switching
- Database schema changes with immediate testing capability
- Multi-file coordinated changes with live verification workflows
- Build process modifications with development environment navigation

#### **✅ Git-Informed Development (Optimal for):**
- Repository-aware changes with historical context
- Conflict-conscious development based on recent activity
- Version-controlled experimentation with safety analysis
- Team coordination with repository state awareness

### **Enhanced Workflow Patterns**

#### **Pattern 1: Direct Change with Navigation Verification**
1. **Claude analyzes** current state via filesystem access
2. **Claude makes changes** to local files
3. **Chrome navigation** opens relevant testing URLs
4. **Manual verification** confirms changes work
5. **Git operations** track changes with repository awareness

#### **Pattern 2: File Development with Browser Navigation**
1. **Claude analyzes and modifies** local files directly
2. **Chrome navigation** opens relevant URLs (development environment, live app) 
3. **Manual verification** in browser environments
4. **Git integration tracks** changes with repository awareness
5. **Efficient workflow** between local development and web testing

#### **Pattern 3: Git-Informed Development**
1. **Claude analyzes** Git repository state and recent activity
2. **Claude makes informed decisions** based on repository history and health
3. **Changes made with repository awareness** and conflict consciousness
4. **Manual Git operations** guided by Claude's repository analysis
5. **Repository state monitoring** through filesystem-based Git tracking

### **Git Integration Capabilities (Tested & Verified)**

**Git integration in Claude provides filesystem-based repository analysis:**

#### **📊 Repository Analysis**
- **Read commit history** from `.git/logs/` files
- **Analyze branch structure** from `.git/refs/` directories  
- **Review recent changes** through log analysis and file timestamps
- **Identify repository state** (current branch, remote URLs, latest commits)
- **Monitor Git activity** through filesystem timestamps

#### **🔍 Git Information Access**
- **Current branch detection** (from `.git/HEAD`)
- **Remote repository information** (from `.git/config`)
- **Commit hash tracking** (from `.git/refs/heads/`)
- **Activity timeline analysis** (from `.git/logs/`)
- **Repository health monitoring** (index updates, recent pulls)

#### **⚠️ Git Integration Limitations**
- **Cannot execute Git commands** (add, commit, push, pull)
- **No direct Git operations** - requires manual terminal commands
- **Read-only access** to Git repository information
- **Informational support only** for version control decisions

#### **🔧 Practical Git Workflow Integration**
- **Claude analyzes** Git state before suggesting changes
- **User executes** actual Git commands manually:
  ```bash
  git status
  git add .
  git commit -m "descriptive message"
  git push origin main
  ```
- **Claude monitors** Git state changes through filesystem
- **Git-aware guidance** for safer development decisions

### **Session Workflow Template for Direct Changes**

**For any Claude Direct change session, embed Git reminders at these points:**

#### **Session Step 1: Discovery & Analysis**
- Claude analyzes current state and Git repository health
- Ask external assistants for clarification if needed
- **🔄 GIT REMINDER**: Pull latest changes before making modifications

#### **Session Step 2: Implementation**  
- Claude makes direct file changes with repository awareness
- Focus on specific, targeted modifications
- **🔄 GIT REMINDER**: Review, test, commit, and push changes

#### **Session Step 3: Verification**
- Test changes locally and in deployment environment
- Use Chrome navigation to access testing environments
- **🔄 GIT REMINDER**: Sync to deployment and verify live application

#### **Session Step 4: Documentation**
- Document what worked or didn't work
- Update approach for future sessions
- Note any refinements needed for the workflow

---

**Last Updated**: June 27, 2025  
**Applies To**: Any development project using Claude Desktop with filesystem access