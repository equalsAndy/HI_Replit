/**
 * Assessment Type Descriptions for AST Module 5-2
 * MBTI and Enneagram type data
 */

export interface MBTIType {
  code: string;
  name: string;
  description: string;
}

export interface EnneagramType {
  number: number;
  name: string;
  coreFear: string;
  coreDesire: string;
  keyTraits: string;
}

export const mbtiTypes: Record<string, MBTIType> = {
  'INTJ': {
    code: 'INTJ',
    name: 'The Architect',
    description: 'Architects are analytical problem-solvers who enjoy improving systems and processes. They are independent, strategic thinkers with high standards for both themselves and others. INTJs work best when they can control their schedule and work alone to implement their vision.'
  },
  'INTP': {
    code: 'INTP',
    name: 'The Thinker',
    description: 'Thinkers are philosophical innovators fascinated by logical analysis, systems, and design. They seek to understand the universe and pride themselves on their unique perspective and vigorous intellect. INTPs are often quiet and reserved but become enthusiastic when discussing ideas.'
  },
  'ENTJ': {
    code: 'ENTJ',
    name: 'The Commander',
    description: 'Commanders are natural-born leaders who live to solve problems and achieve goals. They are strategic, organized, and excel at seeing the big picture. ENTJs are confident, assertive, and naturally take charge in group situations.'
  },
  'ENTP': {
    code: 'ENTP',
    name: 'The Debater',
    description: 'Debaters are innovative, clever, and expressive. They enjoy exploring ideas and possibilities, often thinking outside the box. ENTPs are energetic communicators who love intellectual debates and finding creative solutions to complex problems.'
  },
  'INFJ': {
    code: 'INFJ',
    name: 'The Advocate',
    description: 'Advocates are creative and insightful, inspired and independent. They are principled and passionate about helping others and making the world a better place. INFJs often have a strong sense of intuition and are deeply empathetic.'
  },
  'INFP': {
    code: 'INFP',
    name: 'The Mediator',
    description: 'Mediators are idealistic and loyal to their values and important people. They are curious, quick to see possibilities, and often serve as catalysts for implementing ideas. INFPs seek to understand people and help them fulfill their potential.'
  },
  'ENFJ': {
    code: 'ENFJ',
    name: 'The Protagonist',
    description: 'Protagonists are warm, empathetic, responsive, and responsible. They are highly attuned to the emotions and needs of others. ENFJs feel genuine concern for what others think or want and try to handle things with due regard for others\' feelings.'
  },
  'ENFP': {
    code: 'ENFP',
    name: 'The Campaigner',
    description: 'Campaigners are enthusiastic, creative, and sociable free spirits who can always find a reason to smile. They are spontaneous, open-minded, and able to connect seemingly unrelated phenomena in surprising ways. ENFPs see life as a big, complex puzzle.'
  },
  'ISTJ': {
    code: 'ISTJ',
    name: 'The Logistician',
    description: 'Logisticians are practical and fact-minded, reliable and responsible. They are organized, hardworking, and play by the rules. ISTJs like to work within established procedures and prefer structure and predictability.'
  },
  'ISFJ': {
    code: 'ISFJ',
    name: 'The Protector',
    description: 'Protectors are warm-hearted and dedicated, always ready to protect loved ones. They are responsible, patient, and loyal. ISFJs focus on fulfilling their duties and are sensitive to the needs of others, often putting others\' needs before their own.'
  },
  'ESTJ': {
    code: 'ESTJ',
    name: 'The Executive',
    description: 'Executives are organized, logical, and assertive natural leaders. They like to get things done and tend to focus on results. ESTJs are efficient, outgoing, and enjoy organizing people and projects to get things accomplished.'
  },
  'ESFJ': {
    code: 'ESFJ',
    name: 'The Consul',
    description: 'Consuls are caring, social, and community-minded. They seek to be helpful and please others, and they feel best when giving practical care and social support. ESFJs are warm, loyal, and have a strong desire for harmony.'
  },
  'ISTP': {
    code: 'ISTP',
    name: 'The Virtuoso',
    description: 'Virtuosos are tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions. They enjoy discovering how things work and are often skilled with tools and mechanical things.'
  },
  'ISFP': {
    code: 'ISFP',
    name: 'The Adventurer',
    description: 'Adventurers are quiet, friendly, sensitive, and kind. They enjoy the present moment and prefer a flexible approach to life. ISFPs are loyal and committed to their values and people who are important to them.'
  },
  'ESTP': {
    code: 'ESTP',
    name: 'The Entrepreneur',
    description: 'Entrepreneurs are flexible, tolerant, and take a pragmatic approach focused on immediate results. They prefer to learn through doing and enjoy being around people. ESTPs are spontaneous and enjoy each moment they can be active with others.'
  },
  'ESFP': {
    code: 'ESFP',
    name: 'The Entertainer',
    description: 'Entertainers are outgoing, friendly, and accepting. They exude warmth and enthusiasm, and genuinely enjoy being with people. ESFPs bring common sense to their work and make it fun, while being flexible and spontaneous.'
  }
};

export const enneagramTypes: Record<number, EnneagramType> = {
  1: {
    number: 1,
    name: 'The Perfectionist',
    coreFear: 'Being corrupt, defective, or wrong',
    coreDesire: 'To be good, right, and perfect',
    keyTraits: 'Principled, purposeful, self-controlled, and perfectionistic'
  },
  2: {
    number: 2,
    name: 'The Helper',
    coreFear: 'Being unloved or unwanted',
    coreDesire: 'To feel loved and be needed',
    keyTraits: 'Caring, interpersonal, demonstrative, and people-pleasing'
  },
  3: {
    number: 3,
    name: 'The Achiever',
    coreFear: 'Being worthless without achievement',
    coreDesire: 'To feel valuable and worthwhile',
    keyTraits: 'Success-oriented, pragmatic, driven, and image-conscious'
  },
  4: {
    number: 4,
    name: 'The Individualist',
    coreFear: 'Having no identity or significance',
    coreDesire: 'To find themselves and their significance',
    keyTraits: 'Expressive, dramatic, self-absorbed, and temperamental'
  },
  5: {
    number: 5,
    name: 'The Investigator',
    coreFear: 'Being useless, helpless, or invaded',
    coreDesire: 'To be capable and competent',
    keyTraits: 'Intense, cerebral, perceptive, and innovative'
  },
  6: {
    number: 6,
    name: 'The Loyalist',
    coreFear: 'Being without support or guidance',
    coreDesire: 'To have security and support',
    keyTraits: 'Committed, security-oriented, anxious, and suspicious'
  },
  7: {
    number: 7,
    name: 'The Enthusiast',
    coreFear: 'Being trapped in pain or deprivation',
    coreDesire: 'To maintain happiness and satisfaction',
    keyTraits: 'Spontaneous, versatile, distractible, and scattered'
  },
  8: {
    number: 8,
    name: 'The Challenger',
    coreFear: 'Being controlled or vulnerable',
    coreDesire: 'To be self-reliant and in control',
    keyTraits: 'Self-confident, decisive, willful, and confrontational'
  },
  9: {
    number: 9,
    name: 'The Peacemaker',
    coreFear: 'Loss of connection and fragmentation',
    coreDesire: 'To have inner and outer peace',
    keyTraits: 'Easygoing, self-effacing, receptive, and complacent'
  }
};
