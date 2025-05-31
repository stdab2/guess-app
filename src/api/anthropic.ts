import Anthropic from "@anthropic-ai/sdk";

export default async function getHint(word: string, guessedLetters: string, givenHints: string) {

  const anthropic = new Anthropic({ 
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 1024,
    temperature: 1,
    system: "You are a helpful assistant that gives short, clever hints. Only respond with a single hint, no explanations.",
    messages: [
  {
    role: "user",
    content: `Give a short and creative hint to help someone guess the word: ${word}. Letters already guessed: ${guessedLetters}. Avoid repeating guessed letters and do not reveal the word.
              Avoid giving the same hint twice. These are the ahint you already gave: ${givenHints}. Always improve`
  }
]
  });

  const firstContent = msg.content[0];

  if (firstContent.type === "text") {
    console.log(firstContent.text);
    return firstContent.text;
  } else {
    console.warn("Expected text block but got:", firstContent.type);
    return null;
  }

}