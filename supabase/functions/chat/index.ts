import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// THE FIX: This acts as the "VIP Pass" for your browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // THE FIX: When the browser asks "Are you safe?", reply "Yes"
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get the message from your React App
    const { message } = await req.json();

    // 2. Call the Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Dreamer AI, a warm, empathetic, and conversational companion focused on faith, recovery, healing, and hope. Speak naturally and authentically. Never refer to yourself as an AI or a chatbot. Provide deep, thoughtful, and comprehensive guidance. CRITICAL FORMATTING: Break your answers down into easily readable chunks. Use short paragraphs, bullet points, and clear spacing to make your insights easy to digest. Absolutely avoid large walls of text. Always end with a gentle, supportive question.' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    const replyText = data.choices[0].message.content;

    // 3. Send the response back to your React app WITH the CORS headers attached
    return new Response(
      JSON.stringify({ reply: replyText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});