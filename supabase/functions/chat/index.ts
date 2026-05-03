import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

try {
    const { message } = await req.json()
    console.log("Received message:", message);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', 
        messages: [
          { role: 'system', content: 'You are Dreamer AI, an empathetic assistant focused on recovery, healing, and hope.' },
          { role: 'user', content: message }
        ],
      }),
    })

    const data = await response.json()
    
    // LOG THE FULL DATA TO SEE THE ERROR
    console.log("Groq API Response:", JSON.stringify(data)); 

    if (!data.choices) {
        throw new Error("Groq API returned an error: " + JSON.stringify(data));
    }

    const reply = data.choices[0].message.content

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("Function Error:", error.message); // This will show in your logs
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})