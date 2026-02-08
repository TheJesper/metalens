# Image Upload - Tasks

## Implementation Tasks

### TASK-1: Extract UploadZone Component
- **Status:** pending
- **Description:** Extract upload logic from App.tsx into dedicated UploadZone component
- **Files:** `src/components/UploadZone.tsx`
- **Outcome:** Reusable upload component with props interface

### TASK-2: Add ZIP Handler
- **Status:** pending
- **Description:** Implement ZIP extraction using JSZip library
- **Files:** `src/lib/zip-handler.ts`
- **Dependencies:** Install jszip package
- **Outcome:** Function that extracts images from ZIP and returns File[]

### TASK-3: Add File Validation
- **Status:** done
- **Description:** Validate file types before processing
- **Files:** `src/App.tsx`
- **Outcome:** Only valid images/zips accepted

### TASK-4: Add Upload Tests
- **Status:** pending
- **Description:** Unit tests for upload functionality
- **Files:** `src/__tests__/upload.test.ts`
- **Outcome:** Tests for drag/drop, file picker, validation

### TASK-5: Responsive Upload Zone
- **Status:** done
- **Description:** Upload zone works on mobile and desktop
- **Files:** `src/App.tsx`
- **Outcome:** Responsive at 375px-1920px
