# RL Quick Start Guide
## For Hackathon Admins

### Setup Time: ~10 minutes

---

## Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- PostgreSQL database (or Supabase account)
- Git

---

## Step 1: Start the Application (5 minutes)

```bash
# Clone and install
git clone <your-repo>
cd <project-folder>

# Install backend
cd server
npm install
# Configure server/.env with your database credentials
npm start  # Runs on http://localhost:5001

# Install frontend (optional - not needed for RL)
cd ../client
npm install
npm run dev  # Runs on http://localhost:3000
```

---

## Step 2: Install RL Dependencies (2 minutes)

```bash
pip install torch numpy gymnasium requests pandas matplotlib
pip install stable-baselines3  # Optional: for high-level RL algorithms
```

---

## Step 3: Create Test User (1 minute)

```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "RL Agent",
    "email": "rl_agent@test.com",
    "password": "test123"
  }'
```

---

## Step 4: Run Sample RL Agent (2 minutes)

Save this as `test_agent.py`:

```python
import requests
import time

API_BASE = "http://localhost:5001/api"

# Login
response = requests.post(f"{API_BASE}/auth/login", json={
    "email": "rl_agent@test.com",
    "password": "test123"
})
token = response.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# Get initial state
files_response = requests.get(f"{API_BASE}/files", headers=headers)
print("Initial State:", files_response.json())

# Action 1: Create folder
folder_response = requests.post(
    f"{API_BASE}/folders",
    headers=headers,
    json={"name": "RL_Test_Folder", "parentId": None}
)
print("Folder Created:", folder_response.json())

# Action 2: Upload file
import io
file_content = b"Test file from RL agent"
files = {'file': ('test.txt', io.BytesIO(file_content))}
upload_response = requests.post(
    f"{API_BASE}/files/upload",
    headers=headers,
    files=files,
    data={'folderId': None}
)
print("File Uploaded:", upload_response.json())

# Get updated state
final_state = requests.get(f"{API_BASE}/files", headers=headers)
print("Final State:", final_state.json())
```

Run it:
```bash
python test_agent.py
```

---

## Available Actions (22 Total)

| Action | Endpoint | Example |
|--------|----------|---------|
| Create Folder | `POST /api/folders` | `{"name": "Docs", "parentId": null}` |
| Upload File | `POST /api/files/upload` | Multipart form data |
| Move File | `PATCH /api/files/:id/move` | `{"folderId": "target-id"}` |
| Delete File | `DELETE /api/files/:id` | Soft delete to recycle bin |
| Share File | `POST /api/files/:id/share` | `{"shareWithEmail": "user@example.com"}` |
| Create Link | `POST /api/files/:id/share-link` | Public share link |

**See full API reference in [RL_DOCUMENTATION.md](RL_DOCUMENTATION.md) Section 7**

---

## State Observation

```python
# Get complete state
state = {
    "files": requests.get(f"{API_BASE}/files", headers=headers).json(),
    "folders": requests.get(f"{API_BASE}/folders", headers=headers).json(),
    "recycle": requests.get(f"{API_BASE}/files/recycle-bin", headers=headers).json(),
    "shared": requests.get(f"{API_BASE}/files/shared", headers=headers).json()
}
```

---

## Training Scenarios

### Scenario 1: File Organization
**Goal**: Organize 10 random files into folders by type

**Initial State**:
- 10 files in root directory
- 0 folders

**Success Criteria**:
- 0 files in root
- Files grouped logically (images, documents, etc.)

**Max Steps**: 50

### Scenario 2: Storage Optimization
**Goal**: Free up 30% storage space

**Initial State**:
- Storage 85% full
- Mix of large/small files

**Success Criteria**:
- Storage < 60% full
- No important files deleted

**Max Steps**: 30

**See all 5 scenarios in [RL_DOCUMENTATION.md](RL_DOCUMENTATION.md) Section 11**

---

## Reward Function Examples

```python
# Dense rewards (per step)
reward = (
    +1   if action_successful else -1,
    +10  if file_moved_to_folder else 0,
    +5   if folder_created else 0,
    -5   if invalid_action else 0,
    -10  if deleted_important_file else 0
)

# Sparse rewards (episode completion)
reward = (
    +200 if task_completed else -100,
    +50  if efficient_solution else 0
)
```

---

## Key Metrics to Track

1. **Success Rate**: % of episodes where goal achieved
2. **Episode Length**: Average steps to completion
3. **Storage Efficiency**: Files organized / storage used
4. **Action Success Rate**: Valid actions / total actions
5. **Organization Score**: Files in folders / total files

---

## Evaluation Checklist

- [ ] Agent can authenticate and maintain session
- [ ] Agent can observe current state (GET requests)
- [ ] Agent can execute actions (POST/PATCH/DELETE)
- [ ] Agent learns to organize files into folders
- [ ] Agent improves reward over episodes
- [ ] Agent handles errors gracefully
- [ ] Multi-agent scenario (optional): Multiple agents collaborate

---

## Troubleshooting

**Problem**: "Unauthorized" errors
**Solution**: Check JWT token is included in `Authorization: Bearer <token>` header

**Problem**: "File not found"
**Solution**: Verify file ID exists using `GET /api/files`

**Problem**: "Folder not found"
**Solution**: Use `null` for root folder, or valid folder ID

**Problem**: Slow API responses
**Solution**: Use batch requests, cache folder hierarchy

---

## Performance Tips

1. **Parallel API Calls**: Fetch state data concurrently
2. **Action Masking**: Filter invalid actions before selection
3. **Experience Replay**: Use memory buffer for stable learning
4. **Exploration Strategy**: Start with ε=1.0, decay to 0.01
5. **Reward Shaping**: Add intermediate rewards for sub-goals

---

## Sample Training Command (Using Stable Baselines3)

```bash
# Save as train.py, then run: python train.py

from stable_baselines3 import DQN
from rl_environment import OneDriveRLEnvironment  # Your custom env

env = OneDriveRLEnvironment(
    api_base_url="http://localhost:5001/api",
    user_email="rl_agent@test.com",
    user_password="test123"
)

model = DQN("MlpPolicy", env, verbose=1, learning_rate=0.001)
model.learn(total_timesteps=10000)
model.save("onedrive_dqn")

# Evaluate
obs = env.reset()
for i in range(100):
    action, _states = model.predict(obs, deterministic=True)
    obs, reward, done, info = env.step(action)
    env.render()
    if done:
        obs = env.reset()
```

---

## Additional Resources

- **Full Documentation**: [RL_DOCUMENTATION.md](RL_DOCUMENTATION.md)
- **API Reference**: Section 7 of main documentation
- **Training Scenarios**: Section 11 of main documentation
- **Python Environment Code**: Section 12.2 of main documentation

---

## Contact

For technical questions about the RL environment:
- Check [RL_DOCUMENTATION.md](RL_DOCUMENTATION.md) first
- Review API endpoint examples in Section 7
- Test with `test_agent.py` script above

---

## Quick Reference: API Endpoints

```bash
# Authentication
POST   /api/auth/signup        # Create user
POST   /api/auth/login         # Get JWT token

# State Observation
GET    /api/auth/profile       # User info
GET    /api/files              # All files + storage
GET    /api/folders            # All folders
GET    /api/folders/hierarchy  # Folder tree
GET    /api/files/recycle-bin  # Deleted items
GET    /api/files/shared       # Shared files

# Actions: Files
POST   /api/files/upload       # Upload file
PATCH  /api/files/:id/rename   # Rename file
PATCH  /api/files/:id/move     # Move to folder
POST   /api/files/:id/copy     # Duplicate file
DELETE /api/files/:id          # Delete (soft)
POST   /api/files/restore/:id  # Restore from bin
GET    /api/files/:id/download # Download file

# Actions: Folders
POST   /api/folders            # Create folder
PATCH  /api/folders/:id/rename # Rename folder
PATCH  /api/folders/:id/move   # Move folder
POST   /api/folders/:id/copy   # Copy folder
DELETE /api/folders/:id        # Delete folder

# Actions: Sharing
POST   /api/files/:id/share         # Share with email
POST   /api/files/:id/share-link    # Create public link
DELETE /api/files/:id/share         # Remove share
GET    /api/files/:id/shares        # List shares
```

---

**Ready to train!** Start with the test script above, then move to the full Python environment in the main documentation.
