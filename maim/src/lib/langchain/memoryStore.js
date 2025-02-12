import { Redis } from '@upstash/redis';
import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/redis";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

export class MemoryStore {
  constructor(sessionId) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Upstash Redis 클라이언트를 RedisChatMessageHistory와 호환되게 만듭니다
    const upstashClient = {
      ...client,
      connect: async () => {},
      disconnect: async () => {},
      get: async (key) => client.get(key),
      set: async (key, value) => client.set(key, value),
      del: async (key) => client.del(key),
      exists: async (key) => {
        const value = await client.get(key);
        return value !== null;
      },
      // Redis list 작업을 위한 메서드 수정
      lPush: async (key, value) => {
        try {
          console.log('=== Redis lPush ===');
          console.log('Key:', key);
          console.log('Value before processing:', value);
          
          // 값이 이미 문자열인 경우 파싱
          let processedValue = typeof value === 'string' ? JSON.parse(value) : value;
          
          // LangChain 메시지 객체를 직렬화 가능한 형태로 변환
          const serializable = {
            type: processedValue.type || 'unknown',
            data: {
              content: processedValue.data?.content || processedValue.content || '',
              additional_kwargs: processedValue.data?.additional_kwargs || processedValue.additional_kwargs || {},
              example: processedValue.data?.example || false
            }
          };

          console.log('Serializable object:', serializable);
          const serializedValue = JSON.stringify(serializable);
          console.log('Final serialized value:', serializedValue);

          const result = await client.lpush(key, serializedValue);
          console.log('Redis push result:', result);
          return result;
        } catch (error) {
          console.error('Error in lPush:', error);
          console.error('Problematic value:', value);
          throw error;
        }
      },
      lRange: async (key, start, end) => {
        try {
          const values = await client.lrange(key, start, end);
          console.log('Retrieved values:', values);

          return values.map(v => {
            try {
              // 문자열이 아닌 경우 처리
              if (typeof v === 'object' && v !== null) {
                if (v.type === 'human') {
                  return new HumanMessage({
                    content: v.data?.content || '',
                    additional_kwargs: v.data?.additional_kwargs || {}
                  });
                } else if (v.type === 'ai') {
                  return new AIMessage({
                    content: v.data?.content || '',
                    additional_kwargs: v.data?.additional_kwargs || {}
                  });
                }
              }

              // 문자열인 경우 파싱 시도
              const parsed = JSON.parse(typeof v === 'string' ? v : JSON.stringify(v));
              
              // 파싱된 데이터를 LangChain 메시지 형식으로 변환
              if (parsed.type === 'human' || parsed.type === 'Human') {
                return new HumanMessage({
                  content: parsed.data?.content || '',
                  additional_kwargs: parsed.data?.additional_kwargs || {}
                });
              } else if (parsed.type === 'ai' || parsed.type === 'AI') {
                return new AIMessage({
                  content: parsed.data?.content || '',
                  additional_kwargs: parsed.data?.additional_kwargs || {}
                });
              }

              console.warn('Unknown message type:', parsed.type);
              return new HumanMessage({ content: '' });
            } catch (parseError) {
              console.error('Error parsing message:', parseError, 'Raw value:', v);
              // 객체가 이미 LangChain 메시지인 경우
              if (v && typeof v === 'object' && v.content) {
                return v;
              }
              return new HumanMessage({ content: '' }); // 기본값 반환
            }
          });
        } catch (error) {
          console.error('Error in lRange:', error);
          throw error;
        }
      },
      lLen: async (key) => client.llen(key)
    };

    this.messageHistory = new RedisChatMessageHistory({
      sessionId,
      sessionTTL: 300,  // 5분
      client: upstashClient
    });

    this.memory = new BufferMemory({
      chatHistory: this.messageHistory,
      returnMessages: true,
      memoryKey: "chat_history",
    });
  }

  async initialize() {
    try {
      return this;
    } catch (error) {
      console.error('Failed to initialize memory store:', error);
      throw error;
    }
  }

  async addMessage(message) {
    try {
      console.log('=== Adding Message ===');
      console.log('Input message:', message);

      // LangChain 메시지 생성
      const langChainMessage = message.type === 'human' 
        ? new HumanMessage({
            content: message.content || '',
            additional_kwargs: message.additional_kwargs || {}
          })
        : new AIMessage({
            content: message.content || '',
            additional_kwargs: message.additional_kwargs || {}
          });
      
      // 직접 Redis에 저장
      const key = `messages:${this.messageHistory.sessionId}`;
      await this.messageHistory.client.lPush(key, JSON.stringify({
        type: langChainMessage._getType(),
        data: {
          content: langChainMessage.content,
          additional_kwargs: langChainMessage.additional_kwargs || {}
        }
      }));

      return langChainMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  async getMessages() {
    try {
      const key = `messages:${this.messageHistory.sessionId}`;
      const messages = await this.messageHistory.client.lRange(key, 0, -1);
      
      return messages.map(msg => {
        try {
          // 문자열인 경우 파싱
          const parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
          
          // 메시지 데이터 추출
          const type = parsed.type || parsed.data?.type || 'unknown';
          const content = parsed.content || parsed.data?.content || '';
          
          // 새로운 메시지 객체 생성
          return {
            type,
            content,
            additional_kwargs: parsed.additional_kwargs || {}
          };
        } catch (error) {
          console.error('Error processing message:', error);
          return {
            type: 'unknown',
            content: String(msg),
            additional_kwargs: {}
          };
        }
      });
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  async clearMemory() {
    try {
      await this.messageHistory.clear();
    } catch (error) {
      console.error('Failed to clear memory:', error);
      throw error;
    }
  }

  // 대화 요약을 위한 메서드
  async loadMemoryVariables() {
    try {
      return await this.memory.loadMemoryVariables({});
    } catch (error) {
      console.error('Failed to load memory variables:', error);
      throw error;
    }
  }

  // 대화 저장
  async saveConversation(conversation) {
    try {
      const key = `conversation:${conversation.id}`;
      await this.messageHistory.client.set(key, JSON.stringify(conversation));
      return conversation;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw error;
    }
  }

  // 대화 목록 조회
  async getConversations(filter = {}) {
    try {
      const keys = await this.messageHistory.client.keys('conversation:*');
      const conversations = await Promise.all(
        keys.map(async (key) => {
          const data = await this.messageHistory.client.get(key);
          return JSON.parse(data);
        })
      );

      // 필터 적용
      let filtered = conversations;

      // 날짜 필터
      if (filter.startDate && filter.endDate) {
        filtered = filtered.filter(conv => {
          const convDate = new Date(conv.createdAt);
          return convDate >= new Date(filter.startDate) && 
                 convDate <= new Date(filter.endDate);
        });
      }

      // 정렬
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return filter.sort === 'asc' ? dateA - dateB : dateB - dateA;
      });

      return filtered;
    } catch (error) {
      console.error('Failed to get conversations:', error);
      throw error;
    }
  }

  // 특정 대화 조회
  async getConversation(id) {
    try {
      const key = `conversation:${id}`;
      const data = await this.messageHistory.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }

  // 대화 삭제
  async deleteConversation(id) {
    try {
      const key = `conversation:${id}`;
      await this.messageHistory.client.del(key);
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  // 저장 로직 추가
  async save() {
    try {
      console.log('=== Saving Messages ===');
      const messages = await this.messageHistory.getMessages();
      console.log('Messages to save:', messages);

      if (!messages || !Array.isArray(messages)) {
        throw new Error('Invalid messages array');
      }

      messages.forEach((msg, index) => {
        console.log(`Validating message ${index}:`, {
          type: msg._getType?.() || msg.type,
          content: msg.content,
          hasGetType: '_getType' in msg
        });

        if (!msg || !msg.content) {
          throw new Error(`Invalid message at index ${index}`);
        }
      });

      return true;
    } catch (error) {
      console.error('Error saving messages:', error);
      throw error;
    }
  }
}

// 메모리 스토어 인스턴스 생성 헬퍼 함수
export async function createMemoryStore(sessionId) {
  const store = new MemoryStore(sessionId);
  await store.initialize();
  return store;
}
