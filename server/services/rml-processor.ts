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
   * @param options - Optional processing options (sectionId, userId for auto-injections)
   */
  processContent(rawContent: string, options?: { sectionId?: number; userId?: number }): string {
    try {
      console.log('🎨 Starting RML processing...');

      // Step 0: Clean OpenAI citation markers (【4:0†source】 format)
      let cleanedContent = this.stripCitationMarkers(rawContent);

      // Step 0.5: Auto-inject StarCard at beginning of Section 1
      if (options?.sectionId === 1 && options?.userId) {
        console.log(`📸 Auto-injecting StarCard for Section 1, User ${options.userId}`);
        const starcardHtml = rmlRenderer.render({
          id: 'starcard_auto',
          type: 'starcard_img',
          user_id: options.userId
        } as any);
        cleanedContent = starcardHtml + '\n\n' + cleanedContent;
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

      // Step 4: Replace all [[visual:id]] placeholders with rendered HTML
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
        
        if (html) {
          const placeholder = `[[visual:${visualId}]]`;
          // Escape special regex characters in the visualId
          const escapedId = visualId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\[\\[visual:${escapedId}\\]\\]`, 'g');
          processedContent = processedContent.replace(regex, html);
          console.log(`✅ FIXED: Replaced placeholder: [[visual:${visualId}]]`);
        } else {
          console.warn(`⚠️ STILL FAILED: No visual found for placeholder: [[visual:${visualId}]]`);
          console.warn(`   Available visual keys: ${Object.keys(visualLookup).join(', ')}`);
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
