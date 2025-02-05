// import { ChatOpenAI } from '@langchain/openai';
// import { BufferMemory } from '@langchain/community/memories/buffer';
// import { LLMChain } from '@langchain/core/chains';
// import { ChatPromptTemplate } from '@langchain/core/prompts';

// export const chat = new ChatOpenAI({
//   temperature: 0.7,
//   modelName: 'gpt-3.5-turbo',
// });

// export const memory = new BufferMemory();

// const prompt = ChatPromptTemplate.fromTemplate(`{input}`);

// export const chain = new LLMChain({
//   llm: chat,
//   memory: memory,
//   prompt: prompt
// }); 