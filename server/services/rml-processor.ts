/**
 * RML Processor Service
 * ======================
 * Main service that processes OpenAI content through the RML system.
 * Extracts visual declarations, renders components, and replaces placeholders.
 */

import { rmlParser } from './rml-parser.js';
import { rmlRenderer } from './rml-renderer.js';

export class RMLProcessor {
  /**
   * Process OpenAI content: extract RML, render visuals, replace placeholders
   * @param rawContent - The raw markdown content from OpenAI
   * @param options - Optional processing options (sectionId, userId, attributes, futureSelfImages for auto-injections)
   */
  processContent(rawContent: string, options?: { sectionId?: number; userId?: number; attributes?: any[]; futureSelfImages?: any[] }): string {
    try {
      console.log('🎨 Starting RML processing...');

      // Step 0: Clean OpenAI citation markers (【4:0†source】 format)
      let cleanedContent = this.stripCitationMarkers(rawContent);

      // Note: StarCard is now rendered in report header only (html-template-service.ts)
      // No auto-injection needed in Section 1

      // Step 0.5: Auto-inject flow attributes row at beginning of Section 2 (Flow State Analysis)
      if (options?.sectionId === 2 && options?.attributes && Array.isArray(options.attributes) && options.attributes.length > 0) {
        console.log('🎯 Auto-injecting flow attributes row at beginning of Section 2');
        const flowAttrsDecl = {
          type: 'flow_attributes_row',
          id: 'auto_flow_attrs',
          attributes: options.attributes
        };
        const flowAttrsHTML = rmlRenderer.render(flowAttrsDecl);
        // Insert at the very beginning of the content
        cleanedContent = flowAttrsHTML + '\n\n' + cleanedContent;
      }

      // Step 1: Extract visual declarations from <RML> block
      const declarations = rmlParser.extractVisualDeclarations(cleanedContent);

      if (declarations.length === 0) {
        console.log('ℹ️ No visual declarations found, returning cleaned content');
        return cleanedContent;
      }

      // Step 2: Remove <RML> block from content (keep only markdown body)
      let processedContent = rmlParser.removeRMLBlock(cleanedContent);

      // Step 2.5: Strip first heading if present (template adds section title)
      processedContent = this.stripFirstHeading(processedContent);

      // Step 3: Create a lookup using PLAIN OBJECT (Map was corrupted)
      const visualLookup: Record<string, string> = {};
      declarations.forEach(decl => {
        // Auto-inject photo_id for vision tags from user data
        // Supports both type="vision" with id="vision1" OR legacy type="vision1"
        const isVisionTag = decl.type === 'vision' || decl.type === 'vision1' || decl.type === 'vision2' || decl.type === 'vision3' || decl.type === 'vision4';

        if (isVisionTag && options?.futureSelfImages) {
          // Extract image number from ID (e.g., "vision1" -> 1) or from type (legacy)
          const imageNumberMatch = decl.id?.match(/vision(\d+)/) || decl.type?.match(/vision(\d+)/);
          const imageNumber = imageNumberMatch ? parseInt(imageNumberMatch[1]) : null;

          if (imageNumber && imageNumber >= 1 && imageNumber <= options.futureSelfImages.length) {
            const imageData = options.futureSelfImages[imageNumber - 1];

            // Support both database photos (photoId) and external URLs (url)
            if (imageData.photoId) {
              decl.photo_id = imageData.photoId;
              console.log(`🎯 Auto-injected photo_id for ${decl.id} (image ${imageNumber}): ${decl.photo_id}`);
            } else if (imageData.url) {
              decl.image_url = imageData.url;
              console.log(`🎯 Auto-injected image_url for ${decl.id} (image ${imageNumber}): ${imageData.url.substring(0, 50)}...`);
            }
          }
        } else if (decl.type === 'starcard' && options?.userId) {
          decl.user_id = options.userId;
          console.log(`🎯 Auto-injected user_id for starcard: ${decl.user_id}`);
        }

        const html = rmlRenderer.render(decl);
        // Store with defensive multiple keys
        visualLookup[decl.id] = html;
        visualLookup[decl.id.trim()] = html;
        visualLookup[decl.id.toLowerCase()] = html;

        // DEBUG: Analyze visual ID characteristics
        console.log(`📊 Debug visual ID: "${decl.id}"`);
        console.log(`   Length: ${decl.id.length}`);
        console.log(`   Char codes: [${Array.from(decl.id).map(c => c.charCodeAt(0)).join(', ')}]`);
        console.log(`   Escaped: ${JSON.stringify(decl.id)}`);
        console.log(`   Type: ${typeof decl.id}`);

        console.log(`✅ Rendered visual: ${decl.id} (${decl.type})`);
      });

      // Step 4: Group consecutive vision image placeholders for horizontal display
      processedContent = this.groupConsecutiveVisionImages(processedContent, visualLookup);

      // Step 5: Replace all remaining [[visual:id]] placeholders with rendered HTML
      const placeholders = rmlParser.findVisualPlaceholders(processedContent);
      
      console.log('🔍 Debug placeholder matching (FIXED - Plain Object):');
      console.log('Rendered visual keys:', Object.keys(visualLookup));
      console.log('Found placeholders:', placeholders);

      placeholders.forEach(visualId => {
        // DEBUG: Analyze placeholder ID characteristics
        console.log(`📊 Debug placeholder ID: "${visualId}"`);
        console.log(`   Length: ${visualId.length}`);
        console.log(`   Char codes: [${Array.from(visualId).map(c => c.charCodeAt(0)).join(', ')}]`);
        console.log(`   Escaped: ${JSON.stringify(visualId)}`);
        console.log(`   Type: ${typeof visualId}`);
        
        // ENHANCED DEBUG: Deep object inspection
        console.log(`   🔬 DEEP DEBUG for "${visualId}":`);
        console.log(`   visualLookup["${visualId}"] === undefined: ${visualLookup[visualId] === undefined}`);
        console.log(`   visualLookup.hasOwnProperty("${visualId}"): ${visualLookup.hasOwnProperty(visualId)}`);
        console.log(`   "${visualId}" in visualLookup: ${visualId in visualLookup}`);
        console.log(`   Object.keys(visualLookup).includes("${visualId}"): ${Object.keys(visualLookup).includes(visualId)}`);
        
        // Test each available key
        Object.keys(visualLookup).forEach((key, index) => {
          const matches = key === visualId;
          const keyCharCodes = Array.from(key).map(c => c.charCodeAt(0));
          const visualIdCharCodes = Array.from(visualId).map(c => c.charCodeAt(0));
          const charCodesMatch = JSON.stringify(keyCharCodes) === JSON.stringify(visualIdCharCodes);
          
          console.log(`   Key ${index}: "${key}" (${key.length})`);
          console.log(`     === comparison: ${matches}`);
          console.log(`     char codes: [${keyCharCodes.join(', ')}]`);
          console.log(`     codes match: ${charCodesMatch}`);
          console.log(`     value exists: ${!!visualLookup[key]}`);
        });
        
        // FIXED: Use plain object lookup with multiple strategies
        let html = visualLookup[visualId];                    // Direct
        if (!html) html = visualLookup[visualId.trim()];      // Trimmed  
        if (!html) html = visualLookup[visualId.toLowerCase()]; // Lowercase
        
        console.log(`   Direct lookup ("${visualId}"): ${visualLookup[visualId] ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   Trimmed lookup ("${visualId.trim()}"): ${visualLookup[visualId.trim()] ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   Lowercase lookup ("${visualId.toLowerCase()}"): ${visualLookup[visualId.toLowerCase()] ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   Final result: ${html ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`   Available keys: [${Object.keys(visualLookup).join(', ')}]`);
        
        // Escape special regex characters in the visualId
        const escapedId = visualId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        if (html) {
          // Replace both [[visual:id]] and [[id]] formats
          const longFormRegex = new RegExp(`\\[\\[visual:${escapedId}\\]\\]`, 'g');
          const shortFormRegex = new RegExp(`\\[\\[${escapedId}\\]\\]`, 'g');

          processedContent = processedContent.replace(longFormRegex, html);
          processedContent = processedContent.replace(shortFormRegex, html);

          console.log(`✅ Replaced placeholder: [[visual:${visualId}]] and [[${visualId}]]`);
        } else {
          // FALLBACK: Replace with graceful degradation text
          console.warn(`⚠️ No visual found for placeholder: ${visualId}, using fallback`);

          const fallback = this.generateFallbackForMissingVisual(visualId, declarations);
          const longFormRegex = new RegExp(`\\[\\[visual:${escapedId}\\]\\]`, 'g');
          const shortFormRegex = new RegExp(`\\[\\[${escapedId}\\]\\]`, 'g');

          processedContent = processedContent.replace(longFormRegex, fallback);
          processedContent = processedContent.replace(shortFormRegex, fallback);

          console.log(`✅ Used fallback for: ${visualId}`);
        }
      });

      console.log('✅ RML processing complete (FIXED VERSION)');
      return processedContent;

    } catch (error) {
      console.error('❌ Error processing RML content:', error);
      // Return original content if processing fails
      return rawContent;
    }
  }

  /**
   * Generate graceful fallback for missing visual
   * Returns styled text instead of raw placeholder
   */
  private generateFallbackForMissingVisual(visualId: string, declarations: any[]): string {
    // Find the declaration for this visual ID
    const decl = declarations.find((d: any) => d.id === visualId);

    if (!decl) {
      // No declaration found - hide the placeholder completely
      return '';
    }

    // For flow attributes, show styled text with appropriate color
    if (decl.type === 'flow_attribute' && decl.value) {
      const value = String(decl.value).toUpperCase();
      const strengthType = this.getFlowAttributeColor(value);
      const colors: Record<string, string> = {
        thinking: '#f59e0b',
        acting: '#ef4444',
        feeling: '#3b82f6',
        planning: '#10b981'
      };
      const color = colors[strengthType as keyof typeof colors] || '#6b7280';

      return `<strong style="color: ${color}; font-weight: 700;">${value}</strong>`;
    }

    // For other visual types, return empty string (hide placeholder)
    return '';
  }

  /**
   * Get strength type color for flow attribute
   */
  private getFlowAttributeColor(attributeName: string): string {
    const thinkingWords = ['analytical', 'logical', 'strategic', 'curious', 'focused', 'methodical', 'precise'];
    const actingWords = ['dynamic', 'energetic', 'proactive', 'bold', 'adventurous', 'spontaneous', 'decisive'];
    const feelingWords = ['empathetic', 'compassionate', 'collaborative', 'supportive', 'warm', 'intuitive', 'positive', 'expressive'];
    const planningWords = ['organized', 'structured', 'systematic', 'thorough', 'diligent', 'reliable', 'sensible'];

    const lowerName = attributeName.toLowerCase();

    if (thinkingWords.some(w => lowerName.includes(w))) return 'thinking';
    if (actingWords.some(w => lowerName.includes(w))) return 'acting';
    if (feelingWords.some(w => lowerName.includes(w))) return 'feeling';
    if (planningWords.some(w => lowerName.includes(w))) return 'planning';

    return 'thinking'; // Default
  }

  /**
   * Strip OpenAI citation markers from content
   * Removes patterns like 【4:0†source】
   */
  private stripCitationMarkers(content: string): string {
    // Remove OpenAI citation markers: 【number:number†text】
    return content.replace(/【[^】]*】/g, '');
  }

  /**
   * Strip first heading (H1, H2, or H3) from content
   * Template already adds section title, so remove duplicate from OpenAI content
   */
  private stripFirstHeading(content: string): string {
    // Remove first heading if it appears at the start (after optional whitespace)
    // Matches: # Title, ## Title, or ### Title
    return content.replace(/^\s*#{1,3}\s+[^\n]+\n/, '');
  }

  /**
   * Group consecutive vision image placeholders into horizontal rows
   * Detects sequences like [[visual:vision1]]\n[[visual:vision2]] and wraps them in a centered container
   */
  private groupConsecutiveVisionImages(content: string, visualLookup: Record<string, string>): string {
    // Pattern: consecutive vision image placeholders separated by whitespace/newlines
    // Matches: [[visual:vision1]]\n[[visual:vision2]]\n[[visual:vision3]]
    const consecutivePattern = /(\[\[visual:vision\d+\]\](?:\s*\n\s*\[\[visual:vision\d+\]\])+)/g;

    return content.replace(consecutivePattern, (match) => {
      console.log('🖼️ Found consecutive vision images:', match);

      // Extract all vision IDs from this group
      const visionIds: string[] = [];
      const placeholderPattern = /\[\[visual:(vision\d+)\]\]/g;
      let placeholderMatch;

      while ((placeholderMatch = placeholderPattern.exec(match)) !== null) {
        visionIds.push(placeholderMatch[1]);
      }

      console.log(`🖼️ Grouping ${visionIds.length} vision images:`, visionIds);

      // Render each image
      const images = visionIds
        .map(id => {
          const html = visualLookup[id] || visualLookup[id.trim()] || visualLookup[id.toLowerCase()];
          return html || `<div class="rml-error">Missing visual: ${id}</div>`;
        })
        .join('\n');

      // Wrap in centered horizontal container
      return `
<div class="rml-vision-group">
  ${images}
</div>`;
    });
  }

  /**
   * Get CSS for RML components (to be included in HTML head)
   */
  getCSS(): string {
    return rmlRenderer.generateCSS();
  }

  /**
   * Process multiple sections at once (for complete reports)
   */
  processSections(sections: Array<{ title: string; content: string }>): Array<{ title: string; content: string }> {
    return sections.map(section => ({
      title: section.title,
      content: this.processContent(section.content)
    }));
  }
}

// Export singleton
export const rmlProcessor = new RMLProcessor();
