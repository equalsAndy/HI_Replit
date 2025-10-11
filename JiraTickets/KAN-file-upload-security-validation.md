# KAN - File Upload Security Validation

**Issue Type:** Task  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-08-08

## Summary
Implement comprehensive file upload validation including MIME type checks, file extension allowlists, and enhanced security controls

## Description
Current file upload configuration uses Multer with memory storage and only enforces a 10MB size limit. This lacks essential security validations including file type verification, malicious file detection, and proper file handling controls, creating risks for malware uploads and server exploitation.

### Current Configuration
```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit only
  },
  // Missing: fileFilter, field limits, security checks
});
```

### Security Risks Identified
1. **No File Type Validation**: Any file type can be uploaded
2. **No Extension Checking**: Malicious files can use safe extensions  
3. **No MIME Type Verification**: Bypass possible via header manipulation
4. **No Magic Number Validation**: Files can lie about their actual type
5. **No Malware Scanning**: Potentially dangerous files accepted
6. **No File Name Sanitization**: Path traversal vulnerabilities possible

## Impact Assessment
- **Severity**: Medium
- **Risk**: Malware upload, server compromise, storage abuse
- **Attack Vectors**: File type spoofing, path traversal, DoS via large files
- **Affected**: All file upload endpoints, user data integrity

## Acceptance Criteria

### Must Have
- [ ] Implement strict file type allowlist (MIME + extension)
- [ ] Add file magic number validation for common types
- [ ] Sanitize uploaded file names (remove dangerous characters)
- [ ] Add per-route file size limits beyond global 10MB
- [ ] Validate file content matches declared type

### Should Have
- [ ] Implement file quarantine and scanning workflow
- [ ] Add comprehensive file validation logging
- [ ] Create reusable file validation middleware
- [ ] Add file metadata extraction and validation
- [ ] Implement rate limiting for file uploads

### Could Have
- [ ] Integration with antivirus scanning service
- [ ] Image file dimension and quality validation
- [ ] Document file content analysis
- [ ] Automated suspicious file detection
- [ ] File upload audit trail

## Technical Implementation

### Phase 1: File Type Allowlist
```typescript
// Define allowed file types by use case
const ALLOWED_FILE_TYPES = {
  profileImages: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB for images
    magicNumbers: {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF
    }
  },
  documents: {
    mimeTypes: ['application/pdf', 'text/plain', 'application/msword'],
    extensions: ['.pdf', '.txt', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024, // 10MB for documents
    magicNumbers: {
      'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
      'text/plain': null // No magic number check for text
    }
  },
  spreadsheets: {
    mimeTypes: ['text/csv', 'application/vnd.ms-excel'],
    extensions: ['.csv', '.xls', '.xlsx'],
    maxSize: 20 * 1024 * 1024, // 20MB for data files
    magicNumbers: {
      'text/csv': null // CSV is plain text
    }
  }
};
```

### Phase 2: Enhanced File Validation
```typescript
import path from 'path';
import crypto from 'crypto';

interface FileValidationOptions {
  allowedTypes: string[];
  maxSize: number;
  checkMagicNumbers: boolean;
  sanitizeFileName: boolean;
}

function createFileValidator(options: FileValidationOptions) {
  return (req: Request, file: Express.Multer.File, cb: any) => {
    // 1. File extension validation
    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedExts = ALLOWED_FILE_TYPES[options.allowedTypes]?.extensions || [];
    
    if (!allowedExts.includes(fileExt)) {
      return cb(new Error(`File type ${fileExt} not allowed. Allowed: ${allowedExts.join(', ')}`));
    }
    
    // 2. MIME type validation
    const allowedMimeTypes = ALLOWED_FILE_TYPES[options.allowedTypes]?.mimeTypes || [];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`MIME type ${file.mimetype} not allowed`));
    }
    
    // 3. File name sanitization
    if (options.sanitizeFileName) {
      file.originalname = sanitizeFileName(file.originalname);
    }
    
    cb(null, true);
  };
}

function sanitizeFileName(filename: string): string {
  // Remove dangerous characters and patterns
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // Only allow safe characters
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 100); // Limit length
}
```

### Phase 3: Magic Number Validation
```typescript
function validateFileContent(buffer: Buffer, declaredMimeType: string): boolean {
  const magicNumbers = ALLOWED_FILE_TYPES[declaredMimeType]?.magicNumbers;
  
  if (!magicNumbers) {
    return true; // No magic number check required
  }
  
  // Check if file starts with expected magic numbers
  for (let i = 0; i < magicNumbers.length; i++) {
    if (buffer[i] !== magicNumbers[i]) {
      return false;
    }
  }
  
  return true;
}

// Middleware to validate file content after upload
function validateUploadedFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file) return next();
  
  const isValid = validateFileContent(req.file.buffer, req.file.mimetype);
  
  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'File content does not match declared type'
    });
  }
  
  next();
}
```

### Phase 4: Route-Specific Upload Configuration
```typescript
// Profile image upload with strict validation
const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for profile images
    files: 1 // Only one file
  },
  fileFilter: createFileValidator({
    allowedTypes: 'profileImages',
    maxSize: 5 * 1024 * 1024,
    checkMagicNumbers: true,
    sanitizeFileName: true
  })
});

// Document upload with different limits
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
    files: 5 // Allow multiple documents
  },
  fileFilter: createFileValidator({
    allowedTypes: 'documents',
    maxSize: 10 * 1024 * 1024,
    checkMagicNumbers: true,
    sanitizeFileName: true
  })
});
```

## File Upload Security Middleware

### Phase 5: Comprehensive Security Middleware
```typescript
export const fileUploadSecurity = {
  // Rate limiting for file uploads
  uploadRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 uploads per windowMs
    message: 'Too many file uploads, please try again later'
  }),
  
  // File quarantine before processing
  quarantineFile: (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      // Generate unique quarantine ID
      req.file.quarantineId = crypto.randomUUID();
      
      // Log file upload for audit
      console.log('File quarantined:', {
        id: req.file.quarantineId,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadTime: new Date().toISOString(),
        userIP: req.ip
      });
    }
    next();
  },
  
  // Validate file is safe before processing
  validateSafeFile: (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    
    // Perform comprehensive validation
    const validations = [
      validateFileSize(req.file),
      validateFileType(req.file),
      validateFileContent(req.file.buffer, req.file.mimetype),
      validateFileName(req.file.originalname)
    ];
    
    if (validations.some(validation => !validation.isValid)) {
      const errors = validations
        .filter(v => !v.isValid)
        .map(v => v.error)
        .join(', ');
      
      return res.status(400).json({
        success: false,
        error: `File validation failed: ${errors}`
      });
    }
    
    next();
  }
};
```

## Route Implementation Examples

### Secure Profile Image Upload
```typescript
router.post('/profile/image',
  requireAuth,
  fileUploadSecurity.uploadRateLimit,
  profileImageUpload.single('profileImage'),
  fileUploadSecurity.quarantineFile,
  fileUploadSecurity.validateSafeFile,
  validateUploadedFile,
  async (req, res) => {
    try {
      // File is validated and safe to process
      const imageUrl = await processProfileImage(req.file);
      res.json({ success: true, imageUrl });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process image' 
      });
    }
  }
);
```

### Secure Document Upload
```typescript
router.post('/documents/upload',
  requireAuth,
  requireFacilitator,
  fileUploadSecurity.uploadRateLimit,
  documentUpload.array('documents', 5),
  fileUploadSecurity.quarantineFile,
  fileUploadSecurity.validateSafeFile,
  async (req, res) => {
    try {
      const processedFiles = await processDocuments(req.files);
      res.json({ success: true, files: processedFiles });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process documents' 
      });
    }
  }
);
```

## Testing Strategy

### Unit Tests
```typescript
describe('File Upload Validation', () => {
  it('should reject files with disallowed extensions', () => {
    const file = { originalname: 'malware.exe', mimetype: 'application/exe' };
    expect(validateFileType(file)).toBe(false);
  });
  
  it('should validate magic numbers correctly', () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0x00]);
    expect(validateFileContent(jpegBuffer, 'image/jpeg')).toBe(true);
  });
  
  it('should sanitize dangerous filenames', () => {
    const dangerous = '../../../etc/passwd';
    expect(sanitizeFileName(dangerous)).toBe('etcpasswd');
  });
});
```

### Security Tests
- [ ] Upload files with spoofed MIME types
- [ ] Test path traversal attempts in filenames
- [ ] Verify magic number validation works
- [ ] Test rate limiting functionality
- [ ] Validate file size limits per route

### Integration Tests
- [ ] Test complete upload workflow
- [ ] Verify error handling for invalid files
- [ ] Test multiple file uploads
- [ ] Validate file processing after upload

## Files Requiring Changes

### Core Upload Logic
- `server/index.ts` - Update multer configuration
- Create `server/middleware/file-upload-security.ts` - Centralized validation

### Route Updates
- `server/routes/user-routes.ts` - Profile image uploads
- `server/routes/admin-routes.ts` - Document uploads
- Any other routes handling file uploads

### Configuration
- `server/config/file-types.ts` - File type definitions
- `server/utils/file-validation.ts` - Validation utilities

## Performance Considerations

### File Processing
- Magic number validation is fast (first few bytes only)
- Consider async validation for large files
- Implement file caching for repeated validations

### Memory Usage
- Memory storage suitable for small files
- Consider disk storage for larger files
- Implement cleanup for quarantined files

## Risk Assessment

### High Risk - Missing Implementation
- Malware upload through unvalidated files
- Server compromise via path traversal
- Storage exhaustion through large files

### Medium Risk - Configuration Issues
- Over-restrictive validation blocking legitimate files
- Performance impact from complex validation
- False positives in magic number detection

### Low Risk - Maintenance
- File type list needs updates for new requirements
- Magic number database needs maintenance

## Success Metrics
- [ ] Zero malicious files successfully uploaded
- [ ] All legitimate file uploads work correctly
- [ ] No path traversal vulnerabilities
- [ ] File size and rate limits enforced

## Dependencies
- `express-rate-limit` - For upload rate limiting
- Existing multer infrastructure
- File type detection libraries (optional)

## Timeline Estimate
- **File Type Configuration**: 3 hours
- **Validation Middleware**: 5 hours
- **Route Integration**: 4 hours
- **Testing and Validation**: 4 hours
- **Documentation**: 2 hours
- **Total**: 18 hours (2.5 development days)

---

**Related Issues:**
- File storage security
- Upload functionality improvements
- Server security hardening

**Labels:** security, file-upload, validation, malware-protection, multer