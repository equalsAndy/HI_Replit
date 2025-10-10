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

      return declaration as RMLVisualDeclaration;
    } catch (error) {
      console.error('❌ Error parsing visual attributes:', error);
      return null;
    }
  }

  /**
   * Find all [[visual:id]] placeholders in content
   */
  findVisualPlaceholders(content: string): string[] {
    const placeholderPattern = /\[\[visual:([^\]]+)\]\]/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderPattern.exec(content)) !== null) {
      placeholders.push(match[1]);
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
