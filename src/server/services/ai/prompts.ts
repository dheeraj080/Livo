export const AI_PROMPTS = {
  summarizeNote: (
    title: string,
    content: string,
  ) => `You are livo AI, an expert knowledge management assistant. Provide a concise, high-impact summary of the following note. Include 3-5 key bullet points and a one-sentence takeaway.

Note Title: ${title || "Untitled"}
Content:
${content}`,

  generateNoteTitle: (
    content: string,
  ) => `Analyze the following note content and suggest a clear, concise, professional, and descriptive title (maximum 8 words). Return only the title string without surrounding quotes or markdown.

Content:
${content}`,

  generateTags: (
    title: string,
    content: string,
  ) => `Analyze the following note and generate 3 to 6 relevant topical tags (lowercase, hyphen-separated keywords).

Note Title: ${title || "Untitled"}
Content:
${content}`,

  rewriteText: (
    text: string,
    instruction: string,
  ) => `You are an expert editor and writing assistant. Rewrite the following text based strictly on this instruction: "${instruction}". Preserve the core meaning and tone while improving clarity, flow, and impact. Return only the rewritten text.

Text to rewrite:
${text}`,

  explainText: (
    text: string,
  ) => `Explain the following concept, passage, or snippet clearly and thoroughly. Break down complex ideas into easy-to-understand explanations with practical examples where helpful.

Passage:
${text}`,

  answerQuestion: (
    question: string,
    context: string,
  ) => `You are livo AI knowledge assistant. Answer the user's question accurately using only the provided context. If the answer cannot be determined from the context, state so politely.

Context:
${context}

User Question:
${question}`,
};
