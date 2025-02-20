import { supabase } from './client';

export async function getTemplateByKey(templateKey) {
  try {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('template_key', templateKey)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(`Template not found for key: ${templateKey}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

export async function getAllTemplates() {
  try {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}