import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const JeopardySelfAwarenessGame = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const categories = [
    { name: "STRENGTHS", subtitle: "(IMAGINATION APEX)" },
    { name: "TRIGGERS &", subtitle: "BLINDSPOTS" },
    { name: "VALUES &", subtitle: "BOUNDARIES" },
    { name: "I4C", subtitle: "" },
    { name: "AUTOFLOW &", subtitle: "WELLBEING" }
  ];

  const questions = {
    0: {
      100: { q: "Your team needs someone to lead a brainstorming session. What helps you know if you're the right person?", a: "Self-awareness helps you understand your natural strengths and energy around creative facilitation." },
      200: { q: "You notice you're naturally drawn to solving complex problems while others prefer routine tasks. What explains this preference?", a: "Self-awareness helps you recognize your unique cognitive patterns and what energizes you most." },
      300: { q: "You consistently volunteer for creative projects but avoid detailed execution work. What pattern does this reveal?", a: "Self-awareness helps you understand your consistent behavior patterns and underlying motivations." },
      400: { q: "Your manager asks you to take on a role that feels completely outside your wheelhouse. What helps you decide?", a: "Self-awareness helps you honestly assess your capabilities and growth edges before committing." },
      500: { q: "You're considering a career change that would use different strengths entirely. What's your foundation for this decision?", a: "Self-awareness helps you understand your core talents and whether they align with new directions." }
    },
    1: {
      100: { q: "You feel frustrated during a meeting but can't pinpoint why. What skill helps you understand this reaction?", a: "Self-awareness helps you notice and examine your emotional responses in real-time." },
      200: { q: "You realize you always get defensive when receiving feedback about deadlines. What helps you recognize this pattern?", a: "Self-awareness helps you identify your recurring reactive patterns and underlying triggers." },
      300: { q: "Your team members seem to avoid bringing certain topics to you. What helps you understand why?", a: "Self-awareness helps you recognize how your responses may be creating barriers to open communication." },
      400: { q: "You discover a major project assumption you made was completely wrong. What helps you learn from this?", a: "Self-awareness helps you examine your thinking patterns and blind spots without defensiveness." },
      500: { q: "You realize your leadership style creates anxiety for some team members. What enables you to address this honestly?", a: "Self-awareness helps you face difficult truths about your impact and make vulnerable adjustments." }
    },
    2: {
      100: { q: "Your company asks you to work on something that feels 'off' to you. What helps you navigate this?", a: "Self-awareness helps you identify when situations conflict with your core values." },
      200: { q: "You need to set boundaries with a colleague who constantly interrupts your work. What guides your approach?", a: "Self-awareness helps you understand your limits and communicate them clearly and kindly." },
      300: { q: "You notice you say 'yes' to everything and feel overwhelmed. What helps you understand this pattern?", a: "Self-awareness helps you recognize your people-pleasing patterns and underlying fears." },
      400: { q: "Your team's approach to work conflicts with your core beliefs about collaboration. What helps you address this?", a: "Self-awareness helps you articulate your values and navigate values-based conflicts constructively." },
      500: { q: "You must choose between a promotion and maintaining your work-life balance principles. What guides this decision?", a: "Self-awareness helps you stay true to your deepest values even when facing difficult trade-offs." }
    },
    3: {
      100: { q: "A project requires trying a completely new approach. What helps you engage with uncertainty?", a: "Self-awareness helps you recognize your relationship with uncertainty and manage your response to it." },
      200: { q: "You need to have a difficult conversation with an underperforming team member. What enables you to do this effectively?", a: "Self-awareness helps you approach challenging conversations with both courage and compassion." },
      300: { q: "Your team is stuck in old ways