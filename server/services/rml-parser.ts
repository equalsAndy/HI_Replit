/**
 * RML Parser
 * ===========
 * Parses Report Markup Language (RML) declarations from OpenAI-generated content.
 * Handles both JSON attribute format and individual attributes.
 *
 * Example RML:
 * <RML>
 * <visual id="starcard_img" type="starcard_img" strengths='{"thinking":23,"acting":29}' participant="John"/>
 * </RML>
 */

export interface RMLVisualDeclaration {
  id: string;
  type: string;
  strengths?: { thinking: number; acting: number; feeling: number; planning: number };
  participant?: string;
  value?: string | number;
  values?: Record<string, any>;
  current_level?: number;
  future_level?: number;
  user_id?: number;
  pattern_number?: number;
  quote?: string;         // For reflection blockquotes
  author?: string;        // Optional attribution for quotes
  photo_id?: number;      // Database photo ID (for stored images)
  image_url?: string;     // External image URL (for Unsplash, etc.)
  attribution?: string;   // Image attribution (photographer name, etc.)
  source_url?: string;    // Source URL for attribution link
}

export class RMLParser {
  /**
   * Extract visual declarations from <RML> block
   */
  extractVisualDeclarations(content: string): RMLVisualDeclaration[] {
    const declarations: RMLVisualDeclaration[] = [];

    // Find <RML> ... </RML> block
    const rmlMatch = content.match(/<RML>([\s\S]*?)<\/RML>/i);
    if (!rmlMatch) {
      console.log('⚠️ No <RML> block found in content');
      return declarations;
    }

    const rmlContent = rmlMatch[1];

    // Match <visual ... /> tags
    const visualPattern = /<visual\s+([^>]+)\/>/gi;
    let match;

    while ((match = visualPattern.exec(rmlContent)) !== null) {
      const attributesString = match[1];
      const declaration = this.parseVisualAttributes(attributesString);
      if (declaration) {
        declarations.push(declaration);
      }
    }

    console.log(`✅ Extracted ${declarations.length} visual declarations`);
    return declarations;
  }

  /**
   * Parse visual tag attributes (handles both JSON and individual attributes)
   */
  private parseVisualAttributes(attributesString: string): RMLVisualDeclaration | null {
    try {
      const declaration: Partial<RMLVisualDeclaration> = {};

      // Extract id (required)
      const idMatch = attributesString.match(/id="([^"]+)"/);
      if (!idMatch) return null;
      declaration.id = idMatch[1];

      // Extract type (required)
      const typeMatch = attributesString.match(/type="([^"]+)"/);
      if (!typeMatch) return null;
      declaration.type = typeMatch[1];

      // Extract strengths (JSON format)
      const strengthsMatch = attributesString.match(/strengths='({[^']+})'/);
      if (strengthsMatch) {
        try {
          declaration.strengths = JSON.parse(strengthsMatch[1]);
        } catch (e) {
          console.error('❌ Failed to parse strengths JSON:', strengthsMatch[1]);
        }
      }

      // Extract participant name
      const participantMatch = attributesString.match(/participant="([^"]+)"/);
      if (participantMatch) {
        declaration.participant = participantMatch[1];
      }

      // Extract simple value attribute
      const valueMatch = attributesString.match(/value="([^"]+)"/);
      if (valueMatch) {
        declaration.value = valueMatch[1];
      }

      // Extract values (JSON format)
      const valuesMatch = attributesString.match(/values='({[^']+})'/);
      if (valuesMatch) {
        try {
          declaration.values = JSON.parse(valuesMatch[1]);
        } catch (e) {
          console.error('❌ Failed to parse values JSON:', valuesMatch[1]);
        }
      }

      // Extract ladder levels
      const currentLevelMatch = attributesString.match(/current_level="(\d+)"/);
      if (currentLevelMatch) {
        declaration.current_level = parseInt(currentLevelMatch[1]);
      }

      const futureLevelMatch = attributesString.match(/future_level="(\d+)"/);
      if (futureLevelMatch) {
        declaration.future_level = parseInt(futureLevelMatch[1]);
      }

      // Extract quote text (for reflection blockquotes)
      const quoteMatch = attributesString.match(/quote="([^"]+)"/);
      if (quoteMatch) {
        declaration.quote = quoteMatch[1];
      }

      // Extract author/attribution (optional for quotes)
      const authorMatch = attributesString.match(/author="([^"]+)"/);
      if (authorMatch) {
        declaration.author = authorMatch[1];
      }

      // Extract image attribution (for Unsplash images, etc.)
      const attributionMatch = attributesString.match(/attribution="([^"]+)"/);
      if (attributionMatch) {
        declaration.attribution = attributionMatch[1];
      }

      // Extract source URL (for attribution links)
      const sourceUrlMatch = attributesString.match(/source_url="([^"]+)"/);
      if (sourceUrlMatch) {
        declaration.source_url = sourceUrlMatch[1];
      }

      return declaration as RMLVisualDeclaration;
    } catch (error) {
      console.error('❌ Error parsing visual attributes:', error);
      return null;
    }
  }

  /**
   * Find all [[visual:id]] or [[id]] placeholders in content
   * Supports both formats:
   * - [[visual:attr1]] (long form)
   * - [[attr1]] (short form)
   */
  findVisualPlaceholders(content: string): string[] {
    const placeholders: string[] = [];

    // Pattern 1: [[visual:id]] format
    const longFormPattern = /\[\[visual:([^\]]+)\]\]/g;
    let match;
    while ((match = longFormPattern.exec(content)) !== null) {
      placeholders.push(match[1]);
    }

    // Pattern 2: [[id]] format (short form without "visual:" prefix)
    const shortFormPattern = /\[\[([a-zA-Z0-9_-]+)\]\]/g;
    while ((match = shortFormPattern.exec(content)) !== null) {
      const id = match[1];
      // Avoid duplicates if same ID appears in both formats
      if (!placeholders.includes(id)) {
        placeholders.push(id);
      }
    }

    return placeholders;
  }

  /**
   * Remove <RML> block from content (keep only the markdown body)
   */
  removeRMLBlock(content: string): string {
    return content.replace(/<RML>[\s\S]*?<\/RML>\s*/i, '').trim();
  }
}

// Export singleton
export const rmlParser = new RMLParser();
