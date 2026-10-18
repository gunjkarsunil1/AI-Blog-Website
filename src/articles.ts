export type Article = {
  slug: string
  category: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  gradient: string
  art: string
  featured?: boolean
  trending?: boolean
  sourceUrl?: string
  sourceName?: string
  body: string[]
}

export const articles: Article[] = [
  {
    slug: 'quiet-intelligence-next-wave',
    category: 'The big picture',
    title: 'The next wave of AI won’t announce itself',
    excerpt: 'The most consequential change in artificial intelligence may not be one extraordinary machine. It may be a thousand unremarkable moments when the machine simply gets out of the way.',
    author: 'Maya Chen',
    date: 'October 18, 2026',
    readTime: '8 min read',
    gradient: 'art-hero',
    art: 'A quieter kind of intelligence',
    featured: true,
    trending: true,
    body: [
      'Imagine a machine that helps a team make a complicated decision, then politely disappears from the story. No robot unveiling. No breathless demo. Just fewer missed signals, a clearer next step, and more time for the people doing the work.',
      'Much of the public conversation about artificial intelligence is drawn to spectacle: bigger models, faster benchmarks, more fluent answers. But the technology’s deepest value may come from changes that are easy to overlook. A tool spots the pattern a tired analyst missed. A patient receives an explanation in the language they actually use. A scientist spends another hour asking better questions instead of formatting spreadsheets.',
      'These quiet moments are not inevitable, and they are not automatically good. They depend on thoughtfully designed systems, clear boundaries around sensitive information, and people who can challenge a confident-sounding mistake. The design choices matter as much as the intelligence.',
      'That might make this next chapter harder to capture in a launch video, but much easier to recognize in daily life. The measure of an intelligent tool is not how much attention it demands. It is what people can do once the friction is gone.',
    ],
  },
  {
    slug: 'small-models-big-ideas',
    category: 'AI research',
    title: 'Small models are making a surprisingly big case for themselves',
    excerpt: 'Smaller systems are finding their way onto devices and into workflows where privacy, speed and predictable costs matter.',
    author: 'Noah Bennett',
    date: 'October 17, 2026',
    readTime: '6 min read',
    gradient: 'art-model',
    art: 'Less machine, more possibility',
    trending: true,
    body: [
      'For years, the received wisdom was that useful AI had to be bigger. That logic still holds for some demanding tasks, but a more nuanced picture is coming into focus: matching a model to a job can matter more than maximizing its size.',
      'A compact system can answer a specific question in milliseconds and keep sensitive information on a device. In the right setting, those are not compromises; they are the feature. Researchers and product teams are increasingly interested in what good specialization makes possible.',
      'There is a practical question here, too. Running a model has a cost, in electricity, money and latency. A smaller model that does enough is an appealing option for organizations with real constraints, not just engineering teams optimizing a chart.',
      'None of this means “small” is synonymous with safe or capable. An evaluation still needs to match the actual task, and deployment choices deserve scrutiny. But it does suggest that AI’s future could look more varied than one model doing everything.',
    ],
  },
  {
    slug: 'who-gets-to-build-the-future',
    category: 'People & society',
    title: 'Who gets to decide what “helpful” AI really means?',
    excerpt: 'The hard questions about AI seldom fit neatly into a benchmark. That’s exactly why more people should have a say in answering them.',
    author: 'Amara Okafor',
    date: 'October 16, 2026',
    readTime: '7 min read',
    gradient: 'art-society',
    art: 'More voices, better questions',
    trending: true,
    body: [
      '“Helpful” sounds like a straightforward goal until a system has to make a real trade-off. Helpful to whom? In what context? With what consequences for everyone else?',
      'These questions cannot all be answered by model builders alone. Teachers, translators, community organizations and people affected by automated decisions bring different ways of seeing the problem. Including them early changes not only the answers, but often which questions get asked.',
      'That participation has to mean more than a consultation after all the important choices are locked in. It calls for meaningful opportunities to shape the work, feedback channels that result in change, and enough transparency to understand what a system is doing.',
      'There is no single process that guarantees a fair result. But there is a recurring opportunity: treat the people using a technology and living with its consequences as participants in the design, not as an afterthought.',
    ],
  },
  {
    slug: 'the-new-shape-of-work',
    category: 'Work & future',
    title: 'The best AI colleague might be the one that knows when to stop',
    excerpt: 'A thought experiment on trust, teamwork and what useful workplace AI looks like on a very ordinary Tuesday.',
    author: 'Leo Martinez',
    date: 'October 15, 2026',
    readTime: '5 min read',
    gradient: 'art-work',
    art: 'Room for the human',
    body: [
      'The best teammate does not make every meeting about themselves. They read the room, contribute when it helps, and leave room for everyone else to think. That is a useful place to start when we imagine AI at work.',
      'Useful workplace tools tend to handle the small, repetitive work that steals attention: pulling related notes together, flagging a detail for review or making a first draft easier to edit. Their value is measured in the attention people get back.',
      'That depends on control. Teams need to know when the system is acting, understand where a suggestion came from, and have a real chance to say no. Without those conditions, a convenient assistant can quietly become one more thing to manage.',
      'The most promising future of collaboration may be a technology that helps make a good team even better, and makes itself less noticeable over time.',
    ],
  },
  {
    slug: 'inside-the-thinking-machine',
    category: 'Explainers',
    title: 'What actually happens when an AI answers a question?',
    excerpt: 'A calm, jargon-free tour through how language models turn a prompt into something that feels like a reply.',
    author: 'Maya Chen',
    date: 'October 14, 2026',
    readTime: '9 min read',
    gradient: 'art-explainer',
    art: 'From prompt to possibility',
    body: [
      'Ask a language model a question and it can produce an answer in seconds. It feels conversational, even perceptive. But what is happening behind that smooth reply?',
      'At a high level, the model is using patterns learned during training to estimate which piece of text is likely to come next. It repeats that process many times, one small prediction at a time, until a complete answer appears.',
      'This is powerful, but it is not the same thing as looking up a fact in a perfectly maintained database. A model can produce a plausible-sounding answer without a reliable source. Context, task-specific design and careful verification all matter.',
      'Understanding that distinction makes it easier to use these tools thoughtfully: as capable assistants for drafting, summarizing and exploring ideas, not as unquestionable authorities.',
    ],
  },
  {
    slug: 'the-language-divide',
    category: 'People & society',
    title: 'A world of AI in one language is not a world of AI for all',
    excerpt: 'Making new technologies useful across languages is about more than translation. It starts with listening.',
    author: 'Amara Okafor',
    date: 'October 13, 2026',
    readTime: '6 min read',
    gradient: 'art-language',
    art: 'Every language belongs',
    body: [
      'Digital tools often work best in the languages and settings that appear most often in their training data. For everyone else, a little translation may improve access, but it rarely solves the deeper problem.',
      'Language is not just a set of words with equivalents elsewhere. It carries local context, humor and knowledge. A useful system has to respect those differences and work with speakers rather than making assumptions about them.',
      'That requires long-term investment in local expertise and appropriate data stewardship. It also means measuring quality with the people a technology claims to serve.',
      'Better language support will not happen automatically as systems grow. It is a design choice, and a signal of whose experiences count.',
    ],
  },
  {
    slug: 'finding-a-better-ai-question',
    category: 'The big picture',
    title: 'A better question than “can AI do this?”',
    excerpt: 'Capability is only one piece of the story. Perhaps the more useful question is when a tool genuinely improves what people can do.',
    author: 'Noah Bennett',
    date: 'October 12, 2026',
    readTime: '4 min read',
    gradient: 'art-question',
    art: 'Better questions, better tools',
    body: [
      '“Can AI do this?” is an exciting question, and sometimes a useful one. It is also the beginning of a conversation, not the end.',
      'A capability tells us what is possible under certain conditions. It does not tell us whether the tool is dependable for this use, what it might get wrong or whether a person would be better served another way.',
      'Adding context changes everything. Who is relying on it? What happens when an answer is wrong? Can someone check it? Does it add something that could not otherwise happen?',
      'Those are harder questions to fit on a product launch slide. But they are the questions that turn a technological possibility into a good decision.',
    ],
  },
  {
    slug: 'a-note-on-what-we-know',
    category: 'Field notes',
    title: 'On staying curious without losing your footing',
    excerpt: 'AI can be fascinating without every announcement being a turning point. A field guide to keeping perspective.',
    author: 'Leo Martinez',
    date: 'October 11, 2026',
    readTime: '5 min read',
    gradient: 'art-notes',
    art: 'Stay curious. Stay grounded.',
    body: [
      'A new tool appears, the conversation gets louder and the future seems to arrive all at once. A calmer way to follow AI is not to give up curiosity, but to pair it with the question “what do we know so far?”',
      'Look at what a system can reliably do, not just what it managed in a particularly polished demonstration. Notice what information it uses and where a human still needs to make a call.',
      'Watch what happens after a technology reaches everyday use. The unglamorous details—a clear correction, a privacy setting you can actually find—often tell you more about a product than its launch day.',
      'Most of all, remember that the future of a tool is still shaped by decisions people make. Keeping your footing is a way of taking those decisions seriously.',
    ],
  },
]

export const categories = [
  'All stories',
  'The big picture',
  'AI research',
  'People & society',
  'Work & future',
  'Explainers',
  'Field notes',
]
