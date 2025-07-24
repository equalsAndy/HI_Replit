/**
 * AST Coaching Chat API Routes
 * ============================
 * Handles AI coaching conversations with different personas
 */

import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
// import { 
//     generateCoachingResponse, 
//     getConversationHistory, 
//     saveCoachingMessage, 
//     getOrCreateConversation,
//     COACHING_PERSONAS 
// } from '../services/coaching-chat-service.js';

const router = express.Router();

// Coaching prompts for different scenarios
const COACHING_PROMPTS = {
  workshop_assistant: {
    system: `You are a helpful workshop assistant for the AllStarTeams (AST) workshop. Your role is to:
    
    - Guide users through the workshop steps
    - Explain concepts clearly and encouragingly  
    - Help clarify instructions and exercises
    - Provide emotional support and motivation
    - NEVER write assessment answers for users (unless in demo mode)
    - Encourage authentic self-reflection
    
    Be warm, supportive, and knowledgeable about the AST methodology including:
    - Five Strengths: Imagination, Thinking, Planning, Acting, Feeling
    - Flow state theory and assessment
    - Star Card visualization
    - Future self visioning
    
    Keep responses concise but helpful.`,
    
    demo_system: `You are a workshop assistant in DEMO MODE. You can:
    
    - Provide example responses to assessment questions
    - Fill in sample reflections when requested
    - Show what good answers look like
    - Guide through all workshop features
    
    When providing examples, make them realistic and diverse. Always indicate these are examples, not the user's actual responses.`
  },
  
  post_workshop_coach: {
    system: `You are Talia, a warm and insightful growth coach specializing in the AllStarTeams methodology. You help users:
    
    - Build on their workshop insights
    - Create actionable growth plans  
    - Apply strengths in real-world situations
    - Prepare for team collaboration
    - Maintain momentum after the workshop
    
    Use their workshop data (strengths, flow attributes, reflections) to provide personalized guidance. Be encouraging, practical, and focused on strengths-based development.
    
    Remember: Imagination is the apex strength that enhances all others. Help users see connections between their strengths and their goals.`
  },
  
  team_prep_with_access: {
    system: `You are a team workshop preparation coach. Help users get ready for their upcoming team AST session by:
    
    - Explaining how individual strengths contribute to team dynamics
    - Preparing them for team exercises and discussions  
    - Building excitement about collaboration
    - Addressing concerns about sharing and vulnerability
    
    Focus on the benefits of diverse strengths, team flow states, and collective vision creation.`
  },
  
  team_info_no_access: {
    system: `You are an advisor helping users understand the benefits of team AST workshops. Provide information about:
    
    - How team workshops build on individual insights
    - Benefits of strengths-based team development
    - What team sessions typically include
    - How to make the business case to managers
    - ROI of team development investments
    
    Be informative and persuasive about the value, but respectful that they don't currently have access.`
  }
};

// Start a new coaching conversation
router.post('/conversation/start', authenticateUser, async (req, res) => {
  try {
    const { userId, conversationType, context, demoMode = false, teamAccess = true } = req.body;
    
    // Create new conversation
    const [conversation] = await db.insert(coachingConversations).values({
      userId: parseInt(userId),
      conversationType,
      context,
      conversationData: [],
      demoMode,
      sessionStartedAt: new Date(),
      lastMessageAt: new Date()
    }).returning();

    res.json({ 
      conversationId: conversation.id,
      message: 'Conversation started successfully'
    });
    
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send a message and get AI response
router.post('/message', authenticateUser, async (req, res) => {
  try {
    const { conversationId, message, context } = req.body;
    const userId = req.session.userId;
    
    // Get conversation details
    const [conversation] = await db
      .select()
      .from(coachingConversations)
      .where(eq(coachingConversations.id, conversationId))
      .limit(1);
      
    if (!conversation || conversation.userId !== userId) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Save user message
    const [userMessage] = await db.insert(coachingMessages).values({
      conversationId,
      messageType: 'user',
      content: message,
      workshopStep: context.currentStep,
      demoMode: conversation.demoMode
    }).returning();

    // Get user's workshop data for context
    const userData = await getUserWorkshopContext(userId);
    
    // Generate AI response
    const aiResponse = await generateCoachingResponse(
      message,
      conversation.conversationType,
      context,
      userData,
      conversation.demoMode
    );

    // Save AI message
    const [assistantMessage] = await db.insert(coachingMessages).values({
      conversationId,
      messageType: 'assistant', 
      content: aiResponse.content,
      contextUsed: aiResponse.contextUsed,
      workshopStep: context.currentStep,
      demoMode: conversation.demoMode
    }).returning();

    // Update conversation timestamp
    await db
      .update(coachingConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(coachingConversations.id, conversationId));

    res.json({
      messageId: assistantMessage.id,
      response: aiResponse.content,
      contextUsed: aiResponse.contextUsed
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get conversation history
router.get('/conversation/:conversationId', authenticateUser, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.session.userId;
    
    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(coachingConversations)
      .where(and(
        eq(coachingConversations.id, conversationId),
        eq(coachingConversations.userId, userId)
      ))
      .limit(1);
      
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get messages
    const messages = await db
      .select()
      .from(coachingMessages)
      .where(eq(coachingMessages.conversationId, conversationId))
      .orderBy(coachingMessages.timestamp);
    
    res.json({
      conversation,
      messages
    });
    
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Helper function to get user's workshop context
async function getUserWorkshopContext(userId: number) {
  try {
    // Get user basic info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
    // Get star card data
    const [starCard] = await db
      .select()
      .from(starCards)
      .where(eq(starCards.userId, userId))
      .orderBy(desc(starCards.createdAt))
      .limit(1);
      
    // Get flow attributes
    const [flowData] = await db
      .select()
      .from(flowAttributes)
      .where(eq(flowAttributes.userId, userId))
      .orderBy(desc(flowAttributes.createdAt))
      .limit(1);
    
    return {
      user,
      starCard,
      flowData: flowData?.attributes || null,
      workshopCompleted: user?.astWorkshopCompleted || false
    };
    
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

// Helper function to generate AI coaching response
async function generateCoachingResponse(
  userMessage: string, 
  conversationType: string,
  context: any,
  userData: any,
  demoMode: boolean
) {
  try {
    // Select appropriate prompt
    let systemPrompt;
    if (conversationType === 'workshop_assistant') {
      systemPrompt = demoMode ? COACHING_PROMPTS.workshop_assistant.demo_system : COACHING_PROMPTS.workshop_assistant.system;
    } else if (conversationType === 'post_workshop_coach') {
      systemPrompt = COACHING_PROMPTS.post_workshop_coach.system;
    } else if (conversationType === 'team_prep') {
      systemPrompt = context.teamAccess ? COACHING_PROMPTS.team_prep_with_access.system : COACHING_PROMPTS.team_info_no_access.system;
    }
    
    // Build context string
    let contextString = '';
    if (userData) {
      if (userData.starCard) {
        contextString += `\nUser's Strengths: Thinking ${userData.starCard.thinking}%, Planning ${userData.starCard.planning}%, Feeling ${userData.starCard.feeling}%, Acting ${userData.starCard.acting}%`;
      }
      if (userData.flowData) {
        contextString += `\nFlow Attributes: ${JSON.stringify(userData.flowData)}`;
      }
      if (context.currentStep) {
        contextString += `\nCurrent Workshop Step: ${context.currentStep}`;
      }
    }

    // For now, return a structured response (replace with actual AI call later)
    const response = await generateStructuredResponse(userMessage, conversationType, contextString, demoMode);
    
    return {
      content: response,
      contextUsed: {
        systemPrompt: systemPrompt.substring(0, 100) + '...',
        userContext: contextString,
        responseType: conversationType
      }
    };
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      content: "I'm having trouble generating a response right now. Could you try rephrasing your question?",
      contextUsed: null
    };
  }
}

// Temporary structured response generator (replace with actual AI integration)
async function generateStructuredResponse(userMessage: string, conversationType: string, context: string, demoMode: boolean): Promise<string> {
  const message = userMessage.toLowerCase();
  
  if (conversationType === 'workshop_assistant') {
    if (message.includes('star card') || message.includes('strengths')) {
      return `Your Star Card shows your unique strengths distribution across the Five Strengths: Imagination (apex), Thinking, Planning, Feeling, and Acting. Each strength represents a different way you naturally contribute. ${context.includes('Thinking') ? 'I can see you have strong analytical capabilities!' : ''} What specific aspect would you like me to explain?`;
    }
    if (message.includes('flow') || message.includes('assessment')) {
      return `The Flow Assessment helps identify when you feel most engaged and productive. Flow happens when challenge matches your skills perfectly. ${demoMode && message.includes('example') ? 'Here\'s an example response: "I feel most in flow during collaborative problem-solving sessions where I can analyze data while working with others."' : 'Think about times when you lose track of time because you\'re so engaged in your work.'}`;
    }
    if (message.includes('reflection') || message.includes('stuck')) {
      return demoMode && message.includes('fill') 
        ? `Here's an example reflection: "I use my thinking strength when analyzing complex problems at work. Recently, I helped my team identify the root cause of a recurring issue by breaking down the process into steps and examining each component systematically."`
        : `Take your time with reflections - they're meant to capture your authentic experiences. Think about specific situations where you felt energized and effective. What were you doing? How did you approach the challenge?`;
    }
    return `I'm here to help guide you through the workshop! I can explain concepts, clarify instructions, or provide encouragement. ${demoMode ? 'In demo mode, I can also provide example responses.' : ''} What would you like to explore?`;
  }
  
  if (conversationType === 'post_workshop_coach') {
    if (message.includes('growth plan') || message.includes('develop')) {
      return `Great question! Based on your workshop insights, let's create a growth plan that builds on your strengths. ${context.includes('Thinking') ? 'With your strong analytical abilities, you might focus on how to apply strategic thinking to new challenges.' : ''} What area of growth feels most important to you right now?`;
    }
    if (message.includes('strengths at work') || message.includes('apply')) {
      return `Your strengths are your natural superpowers! The key is recognizing opportunities to use them intentionally. ${context.includes('Planning') ? 'Your planning strength could help you organize complex projects or create systems that help your team.' : ''} What work situations do you find most energizing?`;
    }
    if (message.includes('momentum') || message.includes('continue')) {
      return `Momentum comes from small, consistent actions aligned with your strengths. Try the "weekly strengths check-in" - each week, identify one way you used your top strength and one opportunity to use it more. How has your workshop experience already started showing up in your daily work?`;
    }
    return `I'm so glad you completed your AST workshop! You now have powerful insights about your unique strengths and flow patterns. I'm here to help you apply these discoveries and keep growing. What's on your mind?`;
  }
  
  if (conversationType === 'team_prep') {
    if (context.includes('teamAccess')) {
      if (message.includes('prepare') || message.includes('expect')) {
        return `The team workshop builds beautifully on your individual insights! You'll create a Team Constellation Map showing how everyone's strengths combine. ${context.includes('Feeling') ? 'Your feeling strength will be valuable for building team connections and trust.' : ''} The focus is on collective capability, not individual performance. What excites you most about working with your team?`;
      }
      if (message.includes('questions') || message.includes('ready')) {
        return `Great preparation mindset! Some helpful questions to think about: How do your strengths complement others? What does your team do at its best? What challenges could benefit from diverse perspectives? Come with curiosity and openness - the magic happens when different strengths combine!`;
      }
      return `You're going to love the team workshop! It's where individual insights become collective power. Your unique strengths will contribute to something bigger than any one person could create alone. What aspects of team collaboration are you most curious about?`;
    } else {
      if (message.includes('benefits') || message.includes('team workshop')) {
        return `Team AST workshops are transformative! Teams typically see improved communication, better role clarity, and stronger collaboration. When everyone understands their strengths AND how they connect with others, projects flow more smoothly and innovation increases. Teams often report feeling more energized and aligned after these sessions.`;
      }
      if (message.includes('manager') || message.includes('propose')) {
        return `Here's how to make the case: Focus on business outcomes - better collaboration, clearer communication, and stronger team performance. You could say: "I completed individual strengths training and learned valuable insights about my work style. A team session would help us understand how our different strengths can work together more effectively." Would you like help crafting a specific proposal?`;
      }
      return `Team AST workshops unlock the collective potential of diverse strengths working together. While you don't currently have access, these sessions create powerful team dynamics and shared understanding. I'm happy to share more about the benefits and how you might explore this opportunity with your organization!`;
    }
  }
  
  return `Thank you for your message! I'm here to help with your AST journey. Could you tell me more about what you'd like to explore or what specific guidance would be most helpful?`;
}

export default router;