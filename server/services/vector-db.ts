import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';

// Vector database service for semantic search and AI coaching
export class VectorDBService {
  private client: ChromaClient;
  private embeddingFunction: DefaultEmbeddingFunction;
  
  constructor() {
            // Initialize ChromaDB client with default settings (connects to localhost:8000)
        this.client = new ChromaClient();
    
    // Initialize embedding function
    this.embeddingFunction = new DefaultEmbeddingFunction();
  }

  // Initialize collections for coaching system
  async initializeCollections() {
    try {
      // Create AST methodology knowledge base collection
      await this.client.getOrCreateCollection({
        name: 'ast_knowledge_base',
        metadata: { description: 'AST methodology and coaching content' },
        embeddingFunction: this.embeddingFunction
      });

      // Create team profiles collection for matching
      await this.client.getOrCreateCollection({
        name: 'team_profiles',
        metadata: { description: 'Team member profiles and characteristics' },
        embeddingFunction: this.embeddingFunction
      });

      console.log('Vector database collections initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize vector collections:', error);
      return false;
    }
  }

  // Add knowledge base content
  async addKnowledgeContent(content: string, metadata: any, id: string) {
    try {
      const collection = await this.client.getCollection({ 
        name: 'ast_knowledge_base',
        embeddingFunction: this.embeddingFunction
      });
      
      await collection.add({
        ids: [id],
        documents: [content],
        metadatas: [metadata]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add knowledge content:', error);
      return false;
    }
  }

  // Search knowledge base
  async searchKnowledge(query: string, limit: number = 5) {
    try {
      const collection = await this.client.getCollection({ 
        name: 'ast_knowledge_base',
        embeddingFunction: this.embeddingFunction
      });
      
      const results = await collection.query({
        queryTexts: [query],
        nResults: limit
      });
      
      return results;
    } catch (error) {
      console.error('Failed to search knowledge base:', error);
      // Development fallback
      return {
        documents: [['Sample knowledge base response for development']],
        metadatas: [[{ source: 'development' }]],
        distances: [[0.5]]
      };
    }
  }

  // Add team profile for matching
  async addTeamProfile(profile: any, id: string) {
    try {
      const collection = await this.client.getCollection({ 
        name: 'team_profiles',
        embeddingFunction: this.embeddingFunction
      });
      
      // Create searchable text from profile
      const profileText = this.profileToText(profile);
      
      // Flatten profile to simple metadata (ChromaDB only supports string, number, boolean)
      const flatMetadata = {
        name: profile.name || 'Unknown',
        strengths_count: profile.strengths?.length || 0,
        challenges_count: profile.challenges?.length || 0,
        values_count: profile.values?.length || 0,
        work_style: profile.work_style || 'Unknown',
        communication_style: profile.communication_style || 'Unknown'
      };
      
      await collection.add({
        ids: [id],
        documents: [profileText],
        metadatas: [flatMetadata]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add team profile:', error);
      return false;
    }
  }

  // Find similar team members
  async findSimilarTeams(targetProfile: any, limit: number = 3) {
    try {
      const collection = await this.client.getCollection({ 
        name: 'team_profiles',
        embeddingFunction: this.embeddingFunction
      });
      const profileText = this.profileToText(targetProfile);
      
      const results = await collection.query({
        queryTexts: [profileText],
        nResults: limit
      });
      
      return results;
    } catch (error) {
      console.error('Failed to find similar teams:', error);
      // Development fallback
      return {
        documents: [['Sample team profile match for development']],
        metadatas: [[{ name: 'Development Team', similarity: 0.8 }]],
        distances: [[0.2]]
      };
    }
  }

  // Test connection to ChromaDB
  async testConnection() {
    try {
      const version = await this.client.version();
      console.log('ChromaDB connection successful, version:', version);
      return true;
    } catch (error) {
      console.error('ChromaDB connection failed:', error);
      return false;
    }
  }

  // Convert profile object to searchable text
  private profileToText(profile: any): string {
    const parts = [];
    if (profile.strengths) parts.push(`Strengths: ${profile.strengths.join(', ')}`);
    if (profile.challenges) parts.push(`Challenges: ${profile.challenges.join(', ')}`);
    if (profile.values) parts.push(`Values: ${profile.values.join(', ')}`);
    if (profile.work_style) parts.push(`Work Style: ${profile.work_style}`);
    if (profile.communication_style) parts.push(`Communication: ${profile.communication_style}`);
    return parts.join('. ');
  }
}
