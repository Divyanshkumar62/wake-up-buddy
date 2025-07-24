const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;

export const getMotivationMessage = async (
  streakCount: number,
  wakeTime: string
): Promise<string> => {
  const prompt = `\nYou are a friendly wake-up coach. The user woke up at ${wakeTime} and is currently on a ${streakCount}-day streak.\n\nGive a short, uplifting motivational message based on that. Avoid repeating phrases. Always be encouraging and fresh.\n`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Keep pushing forward! 🌅";
  } catch (e) {
    return "Keep pushing forward! 🌅";
  }
};
