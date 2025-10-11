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
      300: { q: "Your team is stuck in old ways of thinking about a problem. What helps you shift perspectives?", a: "Self-awareness helps you recognize when fresh thinking is needed and how to facilitate it." },
      400: { q: "You must advocate for an unpopular but necessary change. What gives you the foundation to speak up?", a: "Self-awareness helps you find the courage to do what's right even when it's uncomfortable." },
      500: { q: "You're facing a career-defining moment that requires vulnerable leadership. What enables authentic action?", a: "Self-awareness helps you lead with authenticity and courage even in high-stakes situations." }
    },
    4: {
      100: { q: "You notice your energy crashes every afternoon. What helps you understand and address this?", a: "Self-awareness helps you recognize your natural energy patterns and work with them effectively." },
      200: { q: "You're working hard but not feeling productive or satisfied. What helps you diagnose the issue?", a: "Self-awareness helps you understand the difference between busyness and meaningful engagement." },
      300: { q: "You realize you're most creative in the morning but schedule important meetings then. What pattern does this reveal?", a: "Self-awareness helps you recognize misalignment between your natural rhythms and your choices." },
      400: { q: "Your work-life integration feels completely out of balance. What helps you make sustainable changes?", a: "Self-awareness helps you honestly assess what's working and what needs to change for long-term sustainability." },
      500: { q: "You're experiencing burnout but feel guilty about setting boundaries. What enables healthy self-management?", a: "Self-awareness helps you recognize burnout patterns and manage guilt around necessary self-care." }
    }
  };

  const handleSquareClick = (categoryIndex, value) => {
    const questionKey = `${categoryIndex}-${value}`;
    if (answeredQuestions.has(questionKey)) return;
    
    setSelectedQuestion({ categoryIndex, value, key: questionKey });
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleCorrect = () => {
    const newAnswered = new Set(answeredQuestions);
    newAnswered.add(selectedQuestion.key);
    setAnsweredQuestions(newAnswered);
    setSelectedQuestion(null);
    setShowAnswer(false);
    
    if (newAnswered.size >= 3) {
      setGameComplete(true);
    }
  };

  const handleClose = () => {
    setSelectedQuestion(null);
    setShowAnswer(false);
  };

  const resetGame = () => {
    setGameComplete(false);
    setAnsweredQuestions(new Set());
    setSelectedQuestion(null);
    setShowAnswer(false);
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 text-center rounded-t-lg">
            <h2 className="text-3xl font-bold mb-2">JEOPARDY: THE SELF-AWARENESS GAME</h2>
            <p className="text-blue-100 mb-2">Click any dollar amount to reveal a question</p>
            <p className="text-yellow-200 font-semibold">Answer 3 questions to complete</p>
          </div>

          {/* Game Complete Message */}
          {gameComplete && (
            <div className="bg-green-50 border-l-4 border-green-400 p-6 text-center">
              <h3 className="text-2xl font-bold text-green-800 mb-3">🎉 You Get the Point!</h3>
              <p className="text-green-700 text-lg mb-4">
                Self-awareness is a key, core skill that has sweeping effects throughout an organization and its challenges.
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Game Board */}
          <div className="bg-white border-x border-b rounded-b-lg">
            <div className="p-6">
              <div className="grid grid-cols-5 gap-2 mb-6">
                {/* Category Headers */}
                {categories.map((category, index) => (
                  <div key={index} className="bg-blue-700 text-white p-4 text-center min-h-[80px] flex flex-col justify-center rounded">
                    <div className="font-bold text-sm leading-tight">{category.name}</div>
                    {category.subtitle && (
                      <div className="text-xs mt-1 text-blue-200 font-bold">{category.subtitle}</div>
                    )}
                  </div>
                ))}
                
                {/* Question Squares */}
                {[100, 200, 300, 400, 500].map(value => (
                  categories.map((_, categoryIndex) => {
                    const questionKey = `${categoryIndex}-${value}`;
                    const isAnswered = answeredQuestions.has(questionKey);
                    
                    return (
                      <button
                        key={questionKey}
                        onClick={() => handleSquareClick(categoryIndex, value)}
                        disabled={isAnswered || answeredQuestions.size >= 3}
                        className={`
                          h-16 text-2xl font-bold border-2 transition-all rounded
                          ${isAnswered 
                            ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed' 
                            : answeredQuestions.size >= 3
                            ? 'bg-gray-400 text-gray-600 border-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 text-yellow-400 border-blue-500 hover:bg-blue-500 cursor-pointer'
                          }
                        `}
                      >
                        {isAnswered ? <Check className="w-8 h-8 mx-auto" /> : `$${value}`}
                      </button>
                    );
                  })
                )).flat()}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-blue-900 text-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto">
            {/* Modal Header */}
            <div className="bg-blue-800 p-4 rounded-t-lg">
              <div className="flex justify-center items-center">
                <h3 className="text-xl font-bold text-yellow-400 text-center">
                  {categories[selectedQuestion.categoryIndex].name}
                  {categories[selectedQuestion.categoryIndex].subtitle && (
                    <span className="block text-lg">{categories[selectedQuestion.categoryIndex].subtitle}</span>
                  )}
                  <span className="block text-lg mt-1">${selectedQuestion.value}</span>
                </h3>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-8">
              {!showAnswer ? (
                <div className="text-center">
                  <div className="bg-blue-800 border-4 border-yellow-400 rounded-lg p-8 mb-8">
                    <p className="text-xl text-white leading-relaxed font-semibold">
                      {questions[selectedQuestion.categoryIndex][selectedQuestion.value].q}
                    </p>
                  </div>
                  <button
                    onClick={handleShowAnswer}
                    className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-lg text-xl border-2 border-yellow-400"
                  >
                    Answer (in the form of a question)
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-green-700 border-4 border-green-400 rounded-lg p-6 mb-6">
                    <h4 className="text-2xl font-bold text-yellow-400 mb-3">What is Self-Awareness?</h4>
                    <p className="text-green-100 text-lg">
                      {questions[selectedQuestion.categoryIndex][selectedQuestion.value].a}
                    </p>
                  </div>
                  <button
                    onClick={handleCorrect}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center gap-2 mx-auto"
                  >
                    <Check className="w-5 h-5" />
                    Correct!
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JeopardySelfAwarenessGame;