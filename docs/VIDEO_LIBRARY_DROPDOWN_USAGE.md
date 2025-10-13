# VideoLibraryDropdown Component Usage Guide

## Component Location
`/client/src/components/content/VideoLibraryDropdown.tsx`

## Purpose
A reusable dropdown video selector that can display all or filtered workshop videos from any workshop type.

---

## Basic Usage Examples

### 1. Show ALL AllStarTeams Videos (Current Implementation on Step 5-1)
```tsx
import { VideoLibraryDropdown } from '@/components/content/VideoLibraryDropdown';

<VideoLibraryDropdown workshopType="allstarteams" />
```
**Result:** Shows all 9 AST videos in dropdown

---

### 2. Show ALL Imaginal Agility Videos
```tsx
<VideoLibraryDropdown workshopType="imaginal-agility" />
```
**Result:** Shows all IA videos in dropdown

---

## Filtered Usage Examples (Hardwired Specific Videos)

### 3. Show Only Module 1 Videos (Getting Started)
```tsx
<VideoLibraryDropdown 
  workshopType="allstarteams" 
  filterByStepIds={['1-1', '1-2', '1-3']}
  title="Module 1: Getting Started"
  description="Review the foundational introduction to AllStarTeams"
/>
```
**Result:** Dropdown shows only steps 1-1, 1-2, and 1-3

---

### 4. Show Only Module 2 Videos (Strength & Flow)
```tsx
<VideoLibraryDropdown 
  workshopType="allstarteams" 
  filterByStepIds={['2-1', '2-2', '2-3', '2-4']}
  title="Module 2: Strength and Flow"
  description="Deep dive into understanding your strengths and flow patterns"
/>
```
**Result:** Dropdown shows only Module 2 videos

---

### 5. Show Selected Videos for Team Preparation
```tsx
<VideoLibraryDropdown 
  workshopType="allstarteams" 
  filterByStepIds={['2-3', '3-1', '3-2']}
  title="Team Workshop Preparation"
  description="Review these key concepts before your team session"
/>
```
**Result:** Dropdown shows only the 3 specified videos

---

### 6. Custom Video Collection with Custom Messaging
```tsx
<VideoLibraryDropdown 
  workshopType="allstarteams" 
  filterByStepIds={['1-1', '2-1', '3-1']}
  title="Introduction Videos Collection"
  description="Each module's opening video to refresh key themes"
/>
```
**Result:** Shows only the first video from each module (1-1, 2-1, 3-1)

---

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `workshopType` | `'allstarteams' \| 'imaginal-agility'` | Yes | - | Which workshop's videos to load |
| `filterByStepIds` | `string[]` | No | `undefined` | Array of step IDs to filter (e.g., `['1-1', '2-1']`) |
| `title` | `string` | No | `'Workshop Video Library'` | Custom title for the section |
| `description` | `string` | No | `'Select any video...'` | Custom description text |
| `className` | `string` | No | `''` | Additional CSS classes |

---

## Where to Use on Different Pages

### Example 1: On a "Review" page
```tsx
// Show all videos for comprehensive review
<VideoLibraryDropdown workshopType="allstarteams" />
```

### Example 2: On a "Module Resources" page
```tsx
// Show only videos from specific module
<VideoLibraryDropdown 
  workshopType="allstarteams" 
  filterByStepIds={['2-1', '2-2', '2-3', '2-4']}
  title="Module 2 Resources"
/>
```

### Example 3: On a "Team Prep" page
```tsx
// Show curated videos for team preparation
<VideoLibraryDropdown 
  workshopType="allstarteams" 
  filterByStepIds={['2-3', '3-1', '3-2', '3-3']}
  title="Prepare for Team Workshop"
  description="Watch these videos before your team session"
/>
```

---

## Current Implementation

**Page:** AST Step 5-1 (Workshop Resources - `WorkshopResourcesView.tsx`)  
**Configuration:** All videos, default title/description
```tsx
<VideoLibraryDropdown workshopType="allstarteams" />
```

---

## Video Step IDs Reference

### AllStarTeams (AST) Videos:
- `1-1`: The Self-Awareness Gap
- `1-2`: The Self-Awareness Opportunity  
- `1-3`: About this Course
- `2-1`: Star Strengths Assessment
- `2-2`: Flow Patterns
- `2-3`: Rounding Out
- `2-4`: Module 2 Recap (if exists)
- `3-1`: Well-Being Ladder
- `3-2`: Your Future Self
- `3-3`: One Insight (if exists)
- `5-1`: More about AllStarTeams (if video exists)

### To find more step IDs:
Check the `videos` table in database or use the navigation data structure.
