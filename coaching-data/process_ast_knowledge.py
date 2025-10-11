#!/usr/bin/env python3
"""
AST Knowledge Base Processor
============================

Process the AST Compendium and team profiles for the AI coaching system.
Extracts semantic chunks, creates embeddings, and populates the coaching database.

Requirements:
- ChromaDB running on port 8000
- PostgreSQL coaching tables created
- AWS Bedrock credentials configured
"""

import os
import re
import json
import uuid
import hashlib
import asyncio
import aiohttp
import psycopg2
from psycopg2.extras import Json
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import chromadb
from chromadb.config import Settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ASTKnowledgeProcessor:
    """Main processor for AST knowledge base content."""
    
    def __init__(self):
        self.chroma_client = None
        self.pg_connection = None
        self.ast_collection = None
        self.teams_collection = None
        
    async def initialize(self):
        """Initialize database connections and collections."""
        try:
            # Initialize ChromaDB
            self.chroma_client = chromadb.HttpClient(
                host="localhost",
                port=8000,
                settings=Settings(allow_reset=True)
            )
            
            # Create or get collections
            self.ast_collection = self.chroma_client.get_or_create_collection(
                name="ast_methodology",
                metadata={"description": "AllStarTeams methodology and frameworks"}
            )
            
            self.teams_collection = self.chroma_client.get_or_create_collection(
                name="team_profiles", 
                metadata={"description": "Team profiles and collaboration patterns"}
            )
            
            # Initialize PostgreSQL connection
            self.pg_connection = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'ast_coaching'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', ''),
                port=os.getenv('DB_PORT', '5432')
            )
            
            logger.info("✅ Database connections initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            raise
            
    def parse_ast_compendium(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse AST Compendium into semantic chunks."""
        logger.info("📚 Processing AST Compendium...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        chunks = []
        
        # Split by main sections (## headers)
        sections = re.split(r'\n## ', content)
        
        for i, section in enumerate(sections):
            if not section.strip():
                continue
                
            # Extract section title
            lines = section.split('\n')
            title = lines[0].strip().replace('#', '').strip()
            
            # Get section content
            section_content = '\n'.join(lines[1:]).strip()
            
            # Skip if too short
            if len(section_content) < 100:
                continue
                
            # Create chunk metadata
            chunk_id = str(uuid.uuid4())
            
            chunk = {
                'id': chunk_id,
                'title': title,
                'content': section_content,
                'source': 'AST_Compendium',
                'type': 'methodology',
                'section_number': i,
                'word_count': len(section_content.split()),
                'metadata': {
                    'source_file': 'AST_Compendium.md',
                    'section_title': title,
                    'content_type': self._classify_content_type(title, section_content),
                    'key_concepts': self._extract_key_concepts(section_content),
                    'practical_applications': self._extract_applications(section_content)
                }
            }
            
            chunks.append(chunk)
            
        # Process subsections for detailed content
        subsection_chunks = self._process_subsections(content)
        chunks.extend(subsection_chunks)
        
        logger.info(f"📊 Extracted {len(chunks)} chunks from AST Compendium")
        return chunks
        
    def _classify_content_type(self, title: str, content: str) -> str:
        """Classify the type of content for better retrieval."""
        title_lower = title.lower()
        content_lower = content.lower()
        
        if any(word in title_lower for word in ['foundation', 'theory', 'concept', 'root']):
            return 'theoretical_foundation'
        elif any(word in title_lower for word in ['methodology', 'approach', 'framework']):
            return 'methodology'
        elif any(word in title_lower for word in ['strength', 'five strengths']):
            return 'strengths_framework'
        elif any(word in title_lower for word in ['flow', 'engagement']):
            return 'flow_theory'
        elif any(word in title_lower for word in ['team', 'collaboration', 'constellation']):
            return 'team_dynamics'
        elif any(word in title_lower for word in ['assessment', 'mbti', 'disc', 'taro']):
            return 'assessment_integration'
        elif any(word in title_lower for word in ['application', 'contemporary', 'hybrid']):
            return 'practical_application'
        else:
            return 'general_knowledge'
            
    def _extract_key_concepts(self, content: str) -> List[str]:
        """Extract key concepts from content."""
        # Common AST concepts to look for
        ast_concepts = [
            'imagination', 'thinking', 'planning', 'acting', 'feeling',
            'flow state', 'heliotropic effect', 'strengths profusion',
            'future self-continuity', 'self-awareness', 'telos', 'entelechy',
            'arete', 'eudaimonia', 'quintessence', 'phronesis',
            'visual thinking', 'star card', 'constellation mapping',
            'appreciative inquiry', 'positive psychology'
        ]
        
        found_concepts = []
        content_lower = content.lower()
        
        for concept in ast_concepts:
            if concept in content_lower:
                found_concepts.append(concept)
                
        return found_concepts
        
    def _extract_applications(self, content: str) -> List[str]:
        """Extract practical applications mentioned in content."""
        applications = []
        
        # Look for application indicators
        app_patterns = [
            r'application[s]?\s*include[s]?:\s*([^.]+)',
            r'use[d]?\s+for:\s*([^.]+)',
            r'helps?\s+teams?\s+([^.]+)',
            r'enables?\s+([^.]+)',
            r'specific applications[^:]*:\s*([^.]+)'
        ]
        
        for pattern in app_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                applications.append(match.group(1).strip())
                
        return applications[:5]  # Limit to top 5
        
    def _process_subsections(self, content: str) -> List[Dict[str, Any]]:
        """Process detailed subsections for more granular content."""
        chunks = []
        
        # Look for numbered subsections (1., 2., etc.)
        subsection_pattern = r'\n(\d+\.\s+[^\n]+)\n([^#]+?)(?=\n\d+\.|$)'
        matches = re.finditer(subsection_pattern, content, re.MULTILINE | re.DOTALL)
        
        for match in matches:
            title = match.group(1).strip()
            subsection_content = match.group(2).strip()
            
            if len(subsection_content) < 200:  # Skip short subsections
                continue
                
            chunk_id = str(uuid.uuid4())
            
            chunk = {
                'id': chunk_id,
                'title': title,
                'content': subsection_content,
                'source': 'AST_Compendium',
                'type': 'subsection',
                'metadata': {
                    'source_file': 'AST_Compendium.md',
                    'section_title': title,
                    'content_type': 'detailed_explanation',
                    'key_concepts': self._extract_key_concepts(subsection_content)
                }
            }
            
            chunks.append(chunk)
            
        return chunks
        
    def parse_team_profiles(self, team_files_pattern: str) -> List[Dict[str, Any]]:
        """Parse team profile files into structured data."""
        logger.info("👥 Processing team profiles...")
        
        import glob
        team_files = glob.glob(team_files_pattern)
        all_teams = []
        
        for file_path in team_files:
            try:
                teams = self._parse_single_team_file(file_path)
                all_teams.extend(teams)
            except Exception as e:
                logger.warning(f"⚠️ Failed to parse {file_path}: {e}")
                continue
                
        logger.info(f"👥 Processed {len(all_teams)} team profiles")
        return all_teams
        
    def _parse_single_team_file(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse a single team profile file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        teams = []
        
        # Extract team name from filename or content
        filename = os.path.basename(file_path)
        team_name = self._extract_team_name(filename, content)
        
        # Split by team sections if multiple teams in one file
        team_sections = self._split_team_sections(content)
        
        for i, section in enumerate(team_sections):
            team_data = self._parse_team_section(section, team_name, i)
            if team_data:
                teams.append(team_data)
                
        return teams
        
    def _extract_team_name(self, filename: str, content: str) -> str:
        """Extract team name from filename or content."""
        # Try to get from filename
        name_match = re.search(r'(\d+_)?(.+?)\.md$', filename)
        if name_match:
            name = name_match.group(2).replace('-', ' ').replace('_', ' ')
            return name.title()
            
        # Try to get from content header
        header_match = re.search(r'^#\s+(.+)', content, re.MULTILINE)
        if header_match:
            return header_match.group(1).strip()
            
        return "Unknown Team"
        
    def _split_team_sections(self, content: str) -> List[str]:
        """Split content into individual team sections."""
        # Look for team headers
        team_headers = re.finditer(r'\n##\s+([^#\n]+)', content)
        sections = []
        
        headers = list(team_headers)
        for i, header in enumerate(headers):
            start = header.start()
            end = headers[i + 1].start() if i + 1 < len(headers) else len(content)
            section = content[start:end].strip()
            sections.append(section)
            
        if not sections:
            # No team headers found, treat entire content as one team
            sections = [content]
            
        return sections
        
    def _parse_team_section(self, section: str, base_name: str, index: int) -> Optional[Dict[str, Any]]:
        """Parse individual team section into structured data."""
        try:
            team_id = str(uuid.uuid4())
            
            # Extract team name
            team_name_match = re.search(r'##\s+([^\n]+)', section)
            team_name = team_name_match.group(1).strip() if team_name_match else f"{base_name} {index + 1}"
            
            # Extract team composition
            composition = self._extract_team_composition(section)
            
            # Extract strengths distribution
            strengths_dist = self._extract_strengths_distribution(section)
            
            # Extract flow synergies
            flow_synergies = self._extract_flow_synergies(section)
            
            # Extract key insights
            insights = self._extract_team_insights(section)
            
            # Extract individual profiles if present
            individual_profiles = self._extract_individual_profiles(section)
            
            team_data = {
                'id': team_id,
                'name': team_name,
                'content': section,
                'source': 'team_profiles',
                'type': 'team_profile',
                'metadata': {
                    'team_composition': composition,
                    'strengths_distribution': strengths_dist,
                    'flow_synergies': flow_synergies,
                    'key_insights': insights,
                    'individual_profiles': individual_profiles,
                    'team_size': len(composition) if composition else 0,
                    'department': self._classify_department(team_name, section)
                }
            }
            
            return team_data
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to parse team section: {e}")
            return None
            
    def _extract_team_composition(self, section: str) -> List[Dict[str, str]]:
        """Extract team member composition."""
        composition = []
        
        # Look for member patterns
        member_patterns = [
            r'[*-]\s*\*\*([^*]+)\*\*\s*\(([^)]+)\)\s*[–-]\s*([^\n]+)',
            r'###\s+([A-Z\s]+)\s*\([^)]+\)\n[^#]+?Background:\s*([^\n]+)'
        ]
        
        for pattern in member_patterns:
            matches = re.finditer(pattern, section, re.MULTILINE)
            for match in matches:
                if len(match.groups()) >= 3:
                    member = {
                        'name': match.group(1).strip(),
                        'role': match.group(2).strip(),
                        'background': match.group(3).strip()
                    }
                    composition.append(member)
                    
        return composition
        
    def _extract_strengths_distribution(self, section: str) -> Dict[str, List[str]]:
        """Extract strengths distribution information."""
        distribution = {}
        
        strength_patterns = [
            r'\*\*(\w+)\s+Dominant\*\*:\s*([^\n]+)',
            r'(\w+)\s+Dominant:\s*([^\n]+)'
        ]
        
        for pattern in strength_patterns:
            matches = re.finditer(pattern, section, re.IGNORECASE)
            for match in matches:
                strength = match.group(1).strip().title()
                members = [m.strip() for m in match.group(2).split(',')]
                distribution[strength] = members
                
        return distribution
        
    def _extract_flow_synergies(self, section: str) -> List[str]:
        """Extract flow synergies information."""
        synergies = []
        
        # Look for flow synergies section
        synergies_match = re.search(
            r'### Flow Synergies\s*\n([^#]+?)(?=\n###|$)', 
            section, 
            re.MULTILINE | re.DOTALL
        )
        
        if synergies_match:
            synergies_text = synergies_match.group(1)
            # Extract bullet points
            bullet_matches = re.finditer(r'[*-]\s*\*\*([^*]+)\*\*:\s*([^\n]+)', synergies_text)
            for match in bullet_matches:
                synergy = f"{match.group(1).strip()}: {match.group(2).strip()}"
                synergies.append(synergy)
                
        return synergies
        
    def _extract_team_insights(self, section: str) -> List[str]:
        """Extract key insights about the team."""
        insights = []
        
        insights_patterns = [
            r'### Key Insights\s*\n([^#]+?)(?=\n###|$)',
            r'### Insights\s*\n([^#]+?)(?=\n###|$)'
        ]
        
        for pattern in insights_patterns:
            match = re.search(pattern, section, re.MULTILINE | re.DOTALL)
            if match:
                insights_text = match.group(1).strip()
                # Split into sentences
                sentences = re.split(r'[.!?]+', insights_text)
                insights.extend([s.strip() for s in sentences if len(s.strip()) > 20])
                
        return insights
        
    def _extract_individual_profiles(self, section: str) -> List[Dict[str, Any]]:
        """Extract individual team member profiles."""
        profiles = []
        
        # Look for individual profile sections
        profile_pattern = r'###\s+([A-Z\s]+(?:\([^)]+\))?)(?:\n|\s)([^#]+?)(?=\n###|$)'
        matches = re.finditer(profile_pattern, section, re.MULTILINE | re.DOTALL)
        
        for match in matches:
            name_and_role = match.group(1).strip()
            profile_content = match.group(2).strip()
            
            profile = {
                'name_role': name_and_role,
                'content': profile_content,
                'strengths': self._extract_individual_strengths(profile_content),
                'flow_indicators': self._extract_flow_indicators(profile_content)
            }
            
            profiles.append(profile)
            
        return profiles
        
    def _extract_individual_strengths(self, content: str) -> Dict[str, str]:
        """Extract individual strengths profile."""
        strengths = {}
        
        # Look for strengths profile section
        strengths_match = re.search(
            r'\*\*Strengths Profile:\*\*\s*\n((?:\d+\.\s+[^\n]+\n?)+)', 
            content
        )
        
        if strengths_match:
            strengths_text = strengths_match.group(1)
            strength_lines = re.finditer(r'\d+\.\s+(\w+)\s+\(([^)]+)\)\s*[–-]\s*([^\n]+)', strengths_text)
            
            for match in strength_lines:
                strength_name = match.group(1)
                percentage = match.group(2)
                description = match.group(3)
                strengths[strength_name] = {
                    'percentage': percentage,
                    'description': description
                }
                
        return strengths
        
    def _extract_flow_indicators(self, content: str) -> List[str]:
        """Extract flow state indicators."""
        indicators = []
        
        flow_match = re.search(
            r'\*\*Flow State Indicators:\*\*\s*\n([^*]+?)(?=\n\*\*|$)', 
            content
        )
        
        if flow_match:
            flow_text = flow_match.group(1).strip()
            # Extract bullet points or list items
            indicator_matches = re.finditer(r'[*-]\s*([^\n]+)', flow_text)
            for match in indicator_matches:
                indicators.append(match.group(1).strip())
                
        return indicators
        
    def _classify_department(self, team_name: str, content: str) -> str:
        """Classify team department based on name and content."""
        name_lower = team_name.lower()
        content_lower = content.lower()
        
        dept_keywords = {
            'engineering': ['development', 'engineering', 'technical', 'software', 'backend', 'frontend', 'devops'],
            'sales': ['sales', 'revenue', 'client', 'customer', 'business development'],
            'marketing': ['marketing', 'brand', 'content', 'social media', 'campaign'],
            'hr': ['human resources', 'hr', 'people', 'talent', 'recruitment'],
            'product': ['product', 'design', 'ux', 'ui', 'user experience'],
            'operations': ['operations', 'ops', 'logistics', 'supply chain'],
            'finance': ['finance', 'financial', 'accounting', 'budget'],
            'leadership': ['executive', 'leadership', 'management', 'director', 'ceo', 'cto', 'cfo']
        }
        
        for dept, keywords in dept_keywords.items():
            if any(keyword in name_lower or keyword in content_lower for keyword in keywords):
                return dept
                
        return 'other'
        
    async def store_in_chromadb(self, chunks: List[Dict[str, Any]]):
        """Store processed chunks in ChromaDB."""
        logger.info("🗂️ Storing content in ChromaDB...")
        
        # Separate AST methodology and team profile chunks
        ast_chunks = [c for c in chunks if c['source'] == 'AST_Compendium']
        team_chunks = [c for c in chunks if c['source'] == 'team_profiles']
        
        # Store AST methodology chunks
        if ast_chunks:
            await self._store_chunks_in_collection(ast_chunks, self.ast_collection, "AST methodology")
            
        # Store team profile chunks
        if team_chunks:
            await self._store_chunks_in_collection(team_chunks, self.teams_collection, "team profiles")
            
        logger.info("✅ ChromaDB storage complete")
        
    async def _store_chunks_in_collection(self, chunks: List[Dict[str, Any]], collection, collection_name: str):
        """Store chunks in a specific ChromaDB collection."""
        try:
            # Prepare data for ChromaDB
            ids = [chunk['id'] for chunk in chunks]
            documents = [chunk['content'] for chunk in chunks]
            metadatas = []
            
            for chunk in chunks:
                # Flatten metadata for ChromaDB
                metadata = {
                    'title': chunk['title'],
                    'source': chunk['source'],
                    'type': chunk['type'],
                    **chunk['metadata']
                }
                
                # Convert lists to strings for ChromaDB compatibility
                for key, value in metadata.items():
                    if isinstance(value, list):
                        metadata[key] = json.dumps(value)
                    elif isinstance(value, dict):
                        metadata[key] = json.dumps(value)
                        
                metadatas.append(metadata)
                
            # Add to collection
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            
            logger.info(f"📚 Stored {len(chunks)} chunks in {collection_name} collection")
            
        except Exception as e:
            logger.error(f"❌ Failed to store {collection_name} chunks: {e}")
            raise
            
    async def store_in_postgresql(self, chunks: List[Dict[str, Any]]):
        """Store processed chunks in PostgreSQL coaching tables."""
        logger.info("💾 Storing content in PostgreSQL...")
        
        try:
            cursor = self.pg_connection.cursor()
            
            # Store AST methodology content
            ast_chunks = [c for c in chunks if c['source'] == 'AST_Compendium']
            await self._store_knowledge_base(ast_chunks, cursor)
            
            # Store team profiles
            team_chunks = [c for c in chunks if c['source'] == 'team_profiles']
            await self._store_team_profiles(team_chunks, cursor)
            
            # Store vector metadata
            await self._store_vector_metadata(chunks, cursor)
            
            self.pg_connection.commit()
            cursor.close()
            
            logger.info("✅ PostgreSQL storage complete")
            
        except Exception as e:
            logger.error(f"❌ PostgreSQL storage failed: {e}")
            self.pg_connection.rollback()
            raise
            
    async def _store_knowledge_base(self, chunks: List[Dict[str, Any]], cursor):
        """Store AST methodology in coach_knowledge_base table."""
        for chunk in chunks:
            try:
                insert_query = """
                INSERT INTO coach_knowledge_base 
                (id, title, content, category, tags, metadata, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                content = EXCLUDED.content,
                metadata = EXCLUDED.metadata,
                updated_at = EXCLUDED.updated_at
                """
                
                cursor.execute(insert_query, (
                    chunk['id'],
                    chunk['title'],
                    chunk['content'],
                    chunk['metadata'].get('content_type', 'general'),
                    Json(chunk['metadata'].get('key_concepts', [])),
                    Json(chunk['metadata']),
                    datetime.now(),
                    datetime.now()
                ))
                
            except Exception as e:
                logger.warning(f"⚠️ Failed to store knowledge chunk {chunk['id']}: {e}")
                continue
                
    async def _store_team_profiles(self, chunks: List[Dict[str, Any]], cursor):
        """Store team profiles in user_profiles_extended table."""
        for chunk in chunks:
            try:
                # Create a profile entry for the team
                profile_id = str(uuid.uuid4())
                
                insert_query = """
                INSERT INTO user_profiles_extended 
                (id, user_id, strengths_profile, work_style_preferences, 
                 collaboration_patterns, values_alignment, team_context, 
                 created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE SET
                strengths_profile = EXCLUDED.strengths_profile,
                team_context = EXCLUDED.team_context,
                updated_at = EXCLUDED.updated_at
                """
                
                # Extract team data
                metadata = chunk['metadata']
                
                strengths_profile = {
                    'distribution': metadata.get('strengths_distribution', {}),
                    'individual_profiles': metadata.get('individual_profiles', [])
                }
                
                work_style = {
                    'flow_synergies': metadata.get('flow_synergies', []),
                    'collaboration_patterns': metadata.get('flow_synergies', [])
                }
                
                team_context = {
                    'team_name': chunk['name'],
                    'department': metadata.get('department', 'other'),
                    'team_size': metadata.get('team_size', 0),
                    'composition': metadata.get('team_composition', [])
                }
                
                cursor.execute(insert_query, (
                    profile_id,
                    f"team_{chunk['id']}",  # Use team_ prefix for team profiles
                    Json(strengths_profile),
                    Json(work_style),
                    Json(metadata.get('flow_synergies', [])),
                    Json(metadata.get('key_insights', [])),
                    Json(team_context),
                    datetime.now(),
                    datetime.now()
                ))
                
            except Exception as e:
                logger.warning(f"⚠️ Failed to store team profile {chunk['id']}: {e}")
                continue
                
    async def _store_vector_metadata(self, chunks: List[Dict[str, Any]], cursor):
        """Store vector embedding metadata."""
        for chunk in chunks:
            try:
                insert_query = """
                INSERT INTO vector_embeddings 
                (id, content_id, content_type, collection_name, 
                 embedding_metadata, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (content_id, content_type) DO UPDATE SET
                embedding_metadata = EXCLUDED.embedding_metadata
                """
                
                collection_name = "ast_methodology" if chunk['source'] == 'AST_Compendium' else "team_profiles"
                
                cursor.execute(insert_query, (
                    str(uuid.uuid4()),
                    chunk['id'],
                    chunk['type'],
                    collection_name,
                    Json({
                        'source': chunk['source'],
                        'title': chunk['title'],
                        'metadata': chunk['metadata']
                    }),
                    datetime.now()
                ))
                
            except Exception as e:
                logger.warning(f"⚠️ Failed to store vector metadata for {chunk['id']}: {e}")
                continue
                
    async def process_all_data(self):
        """Main processing pipeline for all AST data."""
        logger.info("🚀 Starting AST knowledge processing pipeline...")
        
        try:
            # Initialize connections
            await self.initialize()
            
            # Process AST Compendium
            compendium_path = "coaching-data/source-files/AST_Compendium.md"
            if os.path.exists(compendium_path):
                ast_chunks = self.parse_ast_compendium(compendium_path)
            else:
                logger.warning(f"⚠️ AST Compendium not found at {compendium_path}")
                ast_chunks = []
                
            # Process team profiles
            team_pattern = "coaching-data/source-files/*team*.md"
            team_chunks = self.parse_team_profiles(team_pattern)
            
            # Combine all chunks
            all_chunks = ast_chunks + team_chunks
            
            if not all_chunks:
                logger.error("❌ No content processed - check file paths")
                return
                
            # Store in databases
            await self.store_in_chromadb(all_chunks)
            await self.store_in_postgresql(all_chunks)
            
            # Generate summary report
            self._generate_processing_report(ast_chunks, team_chunks)
            
            logger.info("🎉 AST knowledge processing completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Processing pipeline failed: {e}")
            raise
        finally:
            if self.pg_connection:
                self.pg_connection.close()
                
    def _generate_processing_report(self, ast_chunks: List[Dict], team_chunks: List[Dict]):
        """Generate a summary report of the processing."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_chunks": len(ast_chunks) + len(team_chunks),
                "ast_methodology_chunks": len(ast_chunks),
                "team_profile_chunks": len(team_chunks)
            },
            "ast_content_types": {},
            "team_departments": {},
            "total_word_count": 0
        }
        
        # Analyze AST content types
        for chunk in ast_chunks:
            content_type = chunk['metadata'].get('content_type', 'unknown')
            report["ast_content_types"][content_type] = report["ast_content_types"].get(content_type, 0) + 1
            report["total_word_count"] += chunk.get('word_count', 0)
            
        # Analyze team departments
        for chunk in team_chunks:
            dept = chunk['metadata'].get('department', 'unknown')
            report["team_departments"][dept] = report["team_departments"].get(dept, 0) + 1
            
        # Save report
        with open('coaching-data/processing_report.json', 'w') as f:
            json.dump(report, f, indent=2)
            
        logger.info(f"📊 Processing Report Generated:")
        logger.info(f"   • Total chunks: {report['summary']['total_chunks']}")
        logger.info(f"   • AST methodology: {report['summary']['ast_methodology_chunks']}")
        logger.info(f"   • Team profiles: {report['summary']['team_profile_chunks']}")
        logger.info(f"   • Total words: {report['total_word_count']:,}")

async def main():
    """Main execution function."""
    processor = ASTKnowledgeProcessor()
    await processor.process_all_data()

if __name__ == "__main__":
    asyncio.run(main())
