# Workshop Data Persistence System

## Overview

The Heliotrope Imaginal platform implements a robust data persistence system for both AST (AllStarTeams) and IA (Imaginal Agility) workshops. This system ensures that user input is automatically saved as they work through workshop steps and persists between page refreshes and sessions.

## Architecture

### Core Components

1. **`useWorkshopStepData` Hook** - Client-side React hook for automatic data persistence
2. **Workshop Step Data API** - Server-side endpoints for storing/retrieving step data
3. **Database Table** - `workshop_step_data` table for structured storage
4. **Export Integration** - Inclusion of workshop data in user data exports

### Data Flow

```
User Input → useWorkshopStepData Hook → Debounced Auto-Save → API Endpoint → Database
                    ↑                                                            ↓
            Component Re-render ←── State Update ←── Load on Mount ←── Database Query
```

## Database Schema

### `workshop_step_data` Table

```sql
CREATE TABLE workshop_step_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_type VARCHAR(10) NOT NULL,  -- 'ast' or 'ia'
  step_id VARCHAR(20) NOT NULL,        -- e.g., 'ia-3-4', '2-1'
  data JSONB NOT NULL,                 -- Flexible JSON storage
  version INTEGER DEFAULT 1 NOT NULL,  -- For future versioning
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Unique constraint ensures one record per user/workshop/step
  UNIQUE(user_id, workshop_type, step_id)
);

-- Performance indexes
CREATE INDEX idx_workshop_step_data_user_workshop ON workshop_step_data(user_id, workshop_type);
CREATE INDEX idx_workshop_step_data_step ON workshop_step_data(step_id);
```

## API Endpoints

### Save Workshop Step Data
```http
POST /api/workshop-data/step
```

**Request Body:**
```json
{
  "workshopType": "ia",
  "stepId": "ia-3-4",
  "data": {
    "whyReflection": "User's reflection text...",
    "howReflection": "User's implementation plan...",
    "whatReflection": "User's vision...",
    "nextStep": "User's next action..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 456,
    "workshopType": "ia",
    "stepId": "ia-3-4",
    "data": { /* saved data */ },
    "version": 1,
    "createdAt": "2025-07-26T...",
    "updatedAt": "2025-07-26T..."
  }
}
```

### Load Workshop Step Data
```http
GET /api/workshop-data/step/:workshopType/:stepId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whyReflection": "Previously saved text...",
    "howReflection": "Previously saved plan...",
    "whatReflection": "Previously saved vision...",
    "nextStep": "Previously saved action..."
  }
}
```

### Load All Workshop Data
```http
GET /api/workshop-data/steps/:workshopType
```

Returns all step data for a workshop type, useful for reports and exports.

## Client-Side Implementation

### `useWorkshopStepData` Hook

Located at: `client/src/hooks/useWorkshopStepData.ts`

**Features:**
- Automatic loading of persisted data on component mount
- Debounced auto-save (default: 1 second after user stops typing)
- Optimistic UI updates (immediate local state changes)
- Error handling and retry logic
- Loading and saving state indicators

**Usage Pattern:**

```typescript
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

// Define your step's data structure
interface MyStepData {
  reflection: string;
  selectedOption: string;
  completedTasks: string[];
}

const MyWorkshopStep: React.FC = () => {
  // Initialize with default data structure
  const initialData: MyStepData = {
    reflection: '',
    selectedOption: '',
    completedTasks: []
  };
  
  // Hook provides data persistence
  const {
    data,           // Current data (auto-loaded from database)
    updateData,     // Function to update specific fields
    setData,        // Function to replace entire data object
    saving,         // Boolean: currently saving to server
    loaded,         // Boolean: initial load completed
    error,          // String | null: any error messages
    saveNow,        // Function: force immediate save
    reload          // Function: reload from server
  } = useWorkshopStepData('ia', 'ia-3-4', initialData);
  
  // Use data in your component
  return (
    <div>
      <textarea
        value={data.reflection}
        onChange={e => updateData({ reflection: e.target.value })}
        placeholder="Enter your reflection..."
      />
      {saving && <span>Saving...</span>}
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

### Hook Configuration Options

```typescript
const options = {
  debounceMs: 1000,        // Auto-save delay (default: 1000ms)
  enableAutoSave: true,    // Enable/disable auto-save (default: true)
  onSaveSuccess: () => {}, // Callback on successful save
  onSaveError: (error) => {} // Callback on save error
};

const { data, updateData } = useWorkshopStepData(
  'ia', 
  'ia-3-4', 
  initialData, 
  options
);
```

## Workshop Separation

### Critical Rule: Never Mix Workshop Types

The system maintains strict separation between AST and IA workshops:

- **AST Workshop**: `workshopType: 'ast'`, step IDs like `'2-1'`, `'3-2'`
- **IA Workshop**: `workshopType: 'ia'`, step IDs like `'ia-3-4'`, `'ia-4-2'`

### Step ID Conventions

**AST Step IDs:**
- Format: `{section}-{step}` (e.g., `2-1`, `3-2`, `4-5`)
- Sections: 1 (intro), 2 (assess), 3 (reflect), 4 (plan)

**IA Step IDs:**
- Format: `ia-{section}-{step}` (e.g., `ia-1-1`, `ia-3-4`, `ia-4-6`)
- Sections: 1 (intro), 2 (assess), 3 (imagine), 4 (integrate)

## Implementation Examples

### Simple Text Input Step

```typescript
// IA_3_4_Content.tsx - Reflection step
interface IA34StepData {
  whyReflection: string;
  howReflection: string;
  whatReflection: string;
  nextStep: string;
}

const IA_3_4_Content: React.FC<IA34ContentProps> = ({ onNext }) => {
  const initialData: IA34StepData = {
    whyReflection: '',
    howReflection: '',
    whatReflection: '',
    nextStep: ''
  };
  
  const { data, updateData, saving, loaded, error } = useWorkshopStepData(
    'ia', 
    'ia-3-4', 
    initialData
  );
  
  return (
    <div>
      <h2>Reflection Questions</h2>
      
      <label>Why is this important to you?</label>
      <textarea
        value={data.whyReflection}
        onChange={e => updateData({ whyReflection: e.target.value })}
        placeholder="Reflect on your motivation..."
      />
      
      <label>How will you approach this?</label>
      <textarea
        value={data.howReflection}
        onChange={e => updateData({ howReflection: e.target.value })}
        placeholder="Describe your approach..."
      />
      
      <label>What do you envision?</label>
      <textarea
        value={data.whatReflection}
        onChange={e => updateData({ whatReflection: e.target.value })}
        placeholder="Paint your vision..."
      />
      
      <label>What's your next step?</label>
      <input
        value={data.nextStep}
        onChange={e => updateData({ nextStep: e.target.value })}
        placeholder="Your immediate next action..."
      />
      
      {saving && <div className="saving-indicator">Saving...</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
```

### Complex Data Structure Step

```typescript
// IA_3_2_Content.tsx - Moments collection step
interface IA32StepData {
  savedMoments: Array<{text: string, tag: string}>;
  currentMomentText: string;
  currentSelectedTag: string;
}

const IA_3_2_Content: React.FC<IA32ContentProps> = ({ onNext }) => {
  const initialData: IA32StepData = {
    savedMoments: [],
    currentMomentText: '',
    currentSelectedTag: ''
  };
  
  const { data, updateData } = useWorkshopStepData('ia', 'ia-3-2', initialData);
  
  // Local state for current input (not persisted until saved)
  const [momentText, setMomentText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  const saveMoment = () => {
    if (momentText.trim() && selectedTag) {
      const newMoments = [...data.savedMoments, { 
        text: momentText.trim(), 
        tag: selectedTag 
      }];
      updateData({ savedMoments: newMoments });
      setMomentText('');
      setSelectedTag('');
    }
  };
  
  return (
    <div>
      <h2>Capture Your Moments</h2>
      
      {/* Current input form */}
      <textarea
        value={momentText}
        onChange={e => setMomentText(e.target.value)}
        placeholder="Describe a moment..."
      />
      
      <select 
        value={selectedTag} 
        onChange={e => setSelectedTag(e.target.value)}
      >
        <option value="">Select a tag...</option>
        <option value="Surprise">Surprise</option>
        <option value="Memory">Memory</option>
        <option value="Curiosity">Curiosity</option>
      </select>
      
      <button onClick={saveMoment}>Save Moment</button>
      
      {/* Display saved moments */}
      <div className="saved-moments">
        <h3>Your Saved Moments ({data.savedMoments.length})</h3>
        {data.savedMoments.map((moment, index) => (
          <div key={index} className="moment-card">
            <span className="tag">{moment.tag}</span>
            <p>{moment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Image Upload and Selection Step

```typescript
// IA_3_3_Content.tsx - Visualization step
interface IA33StepData {
  selectedImage: string | null;
  uploadedImage: string | null;
  reflection: string;
  imageTitle: string;
}

const IA_3_3_Content: React.FC<IA33ContentProps> = ({ onNext }) => {
  const initialData: IA33StepData = {
    selectedImage: null,
    uploadedImage: null,
    reflection: '',
    imageTitle: ''
  };
  
  const { data, updateData, saving } = useWorkshopStepData('ia', 'ia-3-3', initialData);
  const { selectedImage, uploadedImage, reflection, imageTitle } = data;
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateData({
          uploadedImage: ev.target?.result as string,
          selectedImage: null // Clear gallery selection
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSelectImage = (url: string) => {
    updateData({
      selectedImage: url,
      uploadedImage: null // Clear uploaded image
    });
  };
  
  return (
    <div>
      <h2>Choose Your Vision Image</h2>
      
      {/* Image selection */}
      <div className="image-options">
        <div className="image-gallery">
          {IMAGE_BANK.map((img, index) => (
            <img
              key={index}
              src={img.url}
              alt={img.label}
              className={selectedImage === img.url ? 'selected' : ''}
              onClick={() => handleSelectImage(img.url)}
            />
          ))}
        </div>
        
        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </div>
      
      {/* Display selected/uploaded image */}
      {(selectedImage || uploadedImage) && (
        <div className="selected-image">
          <img 
            src={uploadedImage || selectedImage} 
            alt="Selected visualization" 
          />
          <button onClick={() => updateData({ 
            selectedImage: null, 
            uploadedImage: null 
          })}>
            Remove
          </button>
        </div>
      )}
      
      {/* Reflection inputs */}
      <div className="reflection-section">
        <label>Image Title</label>
        <input
          value={imageTitle}
          onChange={e => updateData({ imageTitle: e.target.value })}
          placeholder="e.g. Breakthrough, Aspire, Rebirth"
        />
        
        <label>Your Reflection</label>
        <textarea
          value={reflection}
          onChange={e => updateData({ reflection: e.target.value })}
          placeholder="Write your reflection here..."
          rows={4}
        />
      </div>
      
      {saving && <div>Saving your vision...</div>}
    </div>
  );
};
```

## Data Export Integration

### Export Service Enhancement

The `ExportService` automatically includes workshop step data in user exports:

```typescript
// server/services/export-service.ts
export interface ExportData {
  userInfo: { /* user details */ };
  navigationProgress: { /* navigation state */ };
  assessments: { /* assessment results */ };
  workshopStepData: {
    ast: Record<string, any>;  // AST step data by step ID
    ia: Record<string, any>;   // IA step data by step ID
  };
  workshopParticipation: Array<any>;
  exportMetadata: {
    exportedAt: string;
    exportedBy: string;
    dataVersion: string;
    totalWorkshopSteps: number;
    workshopSteps: string;
  };
}
```

### Export Data Structure

```json
{
  "userInfo": { /* user profile */ },
  "workshopStepData": {
    "ast": {
      "2-1": {
        "data": { "starPower": "Thinking", "reflection": "..." },
        "version": 1,
        "createdAt": "2025-07-26T...",
        "updatedAt": "2025-07-26T..."
      },
      "3-2": {
        "data": { "goals": ["Goal 1", "Goal 2"], "timeline": "Q3 2025" },
        "version": 1,
        "createdAt": "2025-07-26T...",
        "updatedAt": "2025-07-26T..."
      }
    },
    "ia": {
      "ia-3-4": {
        "data": {
          "whyReflection": "User's deep reflection...",
          "howReflection": "User's methodology...",
          "whatReflection": "User's vision...",
          "nextStep": "User's commitment..."
        },
        "version": 1,
        "createdAt": "2025-07-26T...",
        "updatedAt": "2025-07-26T..."
      },
      "ia-3-2": {
        "data": {
          "savedMoments": [
            {"text": "A childhood memory...", "tag": "Memory"},
            {"text": "An unexpected insight...", "tag": "Surprise"}
          ]
        },
        "version": 1,
        "createdAt": "2025-07-26T...",
        "updatedAt": "2025-07-26T..."
      }
    }
  },
  "exportMetadata": {
    "exportedAt": "2025-07-26T12:34:56.789Z",
    "exportedBy": "admin",
    "dataVersion": "2.1",
    "totalWorkshopSteps": 12,
    "workshopSteps": "AST: 2-1 through 4-5, IA: ia-1-1 through ia-4-6"
  }
}
```

## Troubleshooting

### Common Issues

**Data Not Persisting:**
1. Check that `useWorkshopStepData` is properly imported and implemented
2. Verify workshop type ('ast' or 'ia') and step ID format
3. Check browser network tab for API call failures
4. Ensure `workshop_step_data` table exists in database

**Load Errors:**
1. Verify API endpoints are accessible (`/api/workshop-data/step/...`)
2. Check user authentication (hook requires authenticated session)
3. Validate step ID format matches expected pattern

**Save Errors:**
1. Check data structure matches initial data schema
2. Verify no circular references in data object
3. Ensure JSON serialization compatibility
4. Check for workshop lock status (completed workshops can't be edited)

### Debug Mode

Enable detailed logging in development:

```typescript
const { data, updateData, saving, loaded, error } = useWorkshopStepData(
  'ia', 
  'ia-3-4', 
  initialData,
  {
    onSaveSuccess: () => console.log('Save successful!'),
    onSaveError: (error) => console.error('Save failed:', error)
  }
);

// Check hook state
console.log('Workshop Data Debug:', {
  loaded,
  saving,
  error,
  dataKeys: Object.keys(data),
  hasContent: Object.values(data).some(v => v && v !== '')
});
```

### Database Queries for Debugging

```sql
-- Check if workshop_step_data table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'workshop_step_data';

-- View all workshop data for a user
SELECT workshop_type, step_id, data, created_at, updated_at 
FROM workshop_step_data 
WHERE user_id = 123
ORDER BY workshop_type, step_id;

-- Count step data by workshop type
SELECT workshop_type, COUNT(*) as step_count
FROM workshop_step_data
GROUP BY workshop_type;

-- Check recent saves
SELECT user_id, workshop_type, step_id, updated_at
FROM workshop_step_data
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

## Best Practices

### Component Design

1. **Always define data interface** - Create TypeScript interfaces for step data
2. **Use meaningful initial data** - Provide sensible defaults for all fields
3. **Handle loading states** - Show loading indicators while data loads
4. **Implement error handling** - Display error messages to users
5. **Optimize re-renders** - Use React.memo for expensive components

### Data Structure Design

1. **Keep it flat when possible** - Avoid deep nesting for better performance
2. **Use consistent naming** - Follow camelCase convention
3. **Include metadata when needed** - timestamps, versions, user selections
4. **Validate data types** - Ensure data matches expected schema
5. **Plan for evolution** - Design data structures that can grow

### Performance Considerations

1. **Debounce auto-save** - Default 1 second prevents excessive API calls
2. **Use selective updates** - `updateData({ field: value })` vs `setData(entireObject)`
3. **Implement loading states** - Prevent user interaction during saves
4. **Handle offline scenarios** - Graceful degradation when API unavailable
5. **Monitor bundle size** - Workshop components can grow large

### Security Notes

1. **Server-side validation** - Always validate data on the server
2. **Authentication required** - All workshop data endpoints require auth
3. **User isolation** - Users can only access their own workshop data
4. **Input sanitization** - Clean user input before storage
5. **Workshop locking** - Completed workshops cannot be modified

## Migration Guide

### Adding New Workshop Steps

When adding a new workshop step with data persistence:

1. **Create data interface:**
```typescript
interface MyNewStepData {
  field1: string;
  field2: number;
  field3: boolean;
}
```

2. **Implement hook in component:**
```typescript
const { data, updateData, saving, loaded, error } = useWorkshopStepData(
  'ia', // or 'ast'
  'ia-5-1', // new step ID
  {
    field1: '',
    field2: 0,
    field3: false
  }
);
```

3. **Update navigation data** if adding a new section
4. **Test data persistence** by entering data and refreshing page
5. **Add demo data function** for test users if applicable

### Migrating Existing Components

To migrate a component from local state to persistence:

1. **Identify current state variables**
2. **Create data interface** combining all state
3. **Replace `useState` with `useWorkshopStepData`**
4. **Update all `setState` calls to `updateData`**
5. **Test thoroughly** - ensure no data loss during transition

---

## Summary

The Workshop Data Persistence System provides automatic, reliable data storage for both AST and IA workshops. By following the patterns documented here, you can ensure that user data is preserved throughout their workshop journey and available for export and analysis.

Key benefits:
- ✅ Automatic persistence without explicit save buttons
- ✅ Consistent patterns across both workshop types
- ✅ Robust error handling and retry logic
- ✅ Integration with user data exports
- ✅ Performance optimization through debouncing
- ✅ Type-safe implementation with TypeScript