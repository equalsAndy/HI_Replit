#!/usr/bin/env tsx

/**
 * AST Video Transcript & Glossary Update Script
 * Updates AST videos with the new transcripts and glossaries provided
 * 
 * Run with: tsx update-ast-video-content.ts
 */

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: './.env' });
config({ path: './.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

// New transcript and glossary data based on provided content
const videoUpdates = {
  '1-1': {
    title: 'Self-Awareness Gap',
    transcript: `# Self-Awareness Gap Video Transcript

> *"Self-awareness is a core human asset and the foundation for trust, collaboration, and growth. This Microcourse Workshop offers a practical way to enhance individual and team self-awareness."*

> *"Self-awareness appears hard to achieve for deep reasons."*

> *"Lack of self-awareness adversely impacts how we think, act, and connect."*

> *"Our brains are wired for survival. That's why threats and flaws stick more strongly than positive thinking."*

> *"Fear-based commentary and the introspection illusion make us believe we see ourselves clearly, when we don't."*

> *"At work, the gap shows up as projection, misinterpreted signals, and a bias toward flaws instead of strengths."*

> *"On teams, the problem multiplies—miscommunication, friction, lower trust, and weaker results."*

> *"The good news: with intention, self-awareness can be enhanced naturally as we'll learn next."*`,
    glossary: [
      {"term": "Self-Awareness", "definition": "Understanding your own thoughts, feelings, and behaviors, and how they affect others."},
      {"term": "Self-Awareness Gap", "definition": "The difference between how aware we think we are of ourselves and how aware we actually are."},
      {"term": "Psychological Safety", "definition": "A team environment where people feel safe to speak up, share ideas, and make mistakes without fear."},
      {"term": "Disengagement", "definition": "When people lose interest, energy, or commitment to their work."},
      {"term": "Negative Mind", "definition": "Our brain's natural tendency to focus more on threats and problems than on positives."},
      {"term": "Self-Reflection", "definition": "The practice of looking inward to better understand your own thoughts and actions."},
      {"term": "Introspection Illusion", "definition": "The false belief that our inner thoughts and feelings give us a perfectly clear picture of ourselves."},
      {"term": "False Certainty", "definition": "When we feel overly sure about our self-judgments, even if they are inaccurate."},
      {"term": "Projection", "definition": "Attributing our own feelings or flaws to others instead of recognizing them in ourselves."},
      {"term": "Team Impact", "definition": "The combined effect of self-awareness gaps on groups — leading to miscommunication, loss of trust, and weaker results."}
    ]
  },
  '1-2': {
    title: 'Self-Awareness Opportunity',
    transcript: `# Self-Awareness Opportunity Video Transcript

> *"Self-awareness is a core human asset and the foundation for trust, collaboration, and growth. This Microcourse Workshop offers a practical way to enhance individual and team self-awareness."*

> *"With intention we can move from instinct and surviving to well-being and thriving."*

> *"This course develops four dimensions: strengths, flow, well-being, and vision."*

> *"Real self-awareness starts with wholeness — knowing your strengths, flow, and well-being — not just a list of flaws."*

> *"Humans don't just react — we imagine what's next. Prospective psychology explains how we think ahead. Imagination powers that leap."*

> *"With shared awareness, trust deepens, communications improve, collaboration is better, and leadership strengthens."*

> *"Next, we'll show how this Microcourse workshop is structured, what to expect, and how to get the most from your experience."*`,
    glossary: [
      {"term": "Self-Awareness (Opportunity)", "definition": "Seeing yourself clearly, not by focusing on flaws, but by recognizing strengths, balance, and future goals."},
      {"term": "Flip the Script", "definition": "Changing the usual way of thinking — from self-criticism to self-approval."},
      {"term": "Strengths", "definition": "The talents and abilities you naturally do best."},
      {"term": "Flow", "definition": "A mental state where you are fully focused, performing at your peak, and often losing track of time."},
      {"term": "Well-Being", "definition": "The balance of physical, emotional, and mental health that supports thriving."},
      {"term": "Vision", "definition": "A clear sense of the future you want to create for yourself."},
      {"term": "Positive Psychology", "definition": "The study of happiness, resilience, and human flourishing — focusing on what helps people grow."},
      {"term": "Human Flourishing", "definition": "Living with health, purpose, and positive relationships."},
      {"term": "Resilience", "definition": "The ability to bounce back from challenges and stress."},
      {"term": "Prospective Psychology", "definition": "The study of how people think ahead, imagine possibilities, and plan for the future."},
      {"term": "Default Mode Network (DMN)", "definition": "A brain system active during daydreaming and reflection, important for imagination and planning."},
      {"term": "Distributed Self-Awareness", "definition": "When all team members practice self-awareness, building trust, smooth collaboration, and stronger leadership."}
    ]
  },
  '1-3': {
    title: 'Course Guidelines',
    transcript: `# Course Guidelines Video Transcript

> *"This video introduces the AllStarTeams microcourse workshop outline, activities, and suggestions as to how to get the best experience from the content."*

> *"This microcourse has four steps: discover your strengths, explore flow and well-being, visualize your potential, and prepare