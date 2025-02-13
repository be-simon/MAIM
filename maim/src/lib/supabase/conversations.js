import { getAuthenticatedClient } from './client';

export async function saveConversation(session, messages, sessionId = null, summary = null) {
  try {
    const supabase = getAuthenticatedClient(session);

    // 1. 대화 생성
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: session.user.id,
        session_id: sessionId,
        title: messages[0]?.content?.slice(0, 100) || 'New Conversation',
        summary: summary
      })
      .select()
      .single();

    if (convError) throw convError;

    // 2. 메시지 저장
    const messagesData = messages.map(msg => ({
      conversation_id: conversation.id,
      content: msg.content,
      type: msg.type,
      additional_kwargs: msg.additional_kwargs || {}
    }));

    const { error: msgError } = await supabase
      .from('messages')
      .insert(messagesData);

    if (msgError) throw msgError;

    // 3. 액션 아이템 저장
    const actionItems = messages
      .filter(msg => msg.type === 'ai' && msg.additional_kwargs?.action_items)
      .flatMap(msg => msg.additional_kwargs.action_items)
      .map(item => ({
        conversation_id: conversation.id,
        content: item
      }));

    if (actionItems.length > 0) {
      const { error: actionError } = await supabase
        .from('action_items')
        .insert(actionItems);

      if (actionError) throw actionError;
    }

    return conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

export async function getConversations(userId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          content,
          type,
          additional_kwargs,
          created_at
        ),
        action_items (
          content,
          completed,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

export async function getConversation(id, userId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          content,
          type,
          additional_kwargs,
          created_at
        ),
        action_items (
          content,
          completed,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

export async function toggleActionItem(itemId, completed) {
  try {
    const { error } = await supabase
      .from('action_items')
      .update({ completed })
      .eq('id', itemId);

    if (error) throw error;
  } catch (error) {
    console.error('Error toggling action item:', error);
    throw error;
  }
}

export async function deleteConversation(id, userId) {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
} 