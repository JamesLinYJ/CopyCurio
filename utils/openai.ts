type OpenAIInputText = { type: "input_text"; text: string };
type OpenAIInputImage = { type: "input_image"; image_url: string };
type OpenAIInputContent = OpenAIInputText | OpenAIInputImage;
type OpenAIInputItem = {
  role: "user" | "assistant" | "system";
  content: OpenAIInputContent[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const resolveUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

export const createOpenAIResponse = async (
  input: string | OpenAIInputItem[],
  options?: { instructions?: string; temperature?: number; model?: string }
): Promise<string> => {
  const response = await fetch(resolveUrl('/api/ai/responses'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      instructions: options?.instructions,
      temperature: options?.temperature,
      model: options?.model
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as { text?: string };
  return (data.text || '').trim();
};

export const buildTextInput = (text: string): OpenAIInputText => ({
  type: 'input_text',
  text
});

export const buildImageInput = (imageUrl: string): OpenAIInputImage => ({
  type: 'input_image',
  image_url: imageUrl
});

export type { OpenAIInputItem };
