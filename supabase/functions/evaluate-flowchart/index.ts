import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("🚀 Grading with Groq Started");

    // 1. Check Secrets
    const groqKey = Deno.env.get('GROQ_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!groqKey) throw new Error("CRITICAL: GROQ_API_KEY is missing!");
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials missing!");

    const { submission_id } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Fetch Submission Data
    const { data: record, error: fetchError } = await supabase
      .from('flowchart_submissions')
      .select('*, flowchart_problems(title, description, requirements)')
      .eq('id', submission_id)
      .single();

    if (fetchError || !record) throw new Error(`DB Error: ${fetchError?.message}`);

    // 3. Prepare Data for AI
    const nodes = record.nodes || [];
    const edges = record.edges || [];
    
    // Simplify for AI context window
    const simpleNodes = nodes.map((n: any) => ({ id: n.id, text: n.data?.label, type: n.type }));
    const simpleEdges = edges.map((e: any) => ({ from: e.source, to: e.target, label: e.label || "" }));

    const prompt = `
      Act as a strict Computer Science Professor. Evaluate this flowchart logic.
      
      PROBLEM:
      "${record.flowchart_problems?.title}"
      ${record.flowchart_problems?.description}
      Requirements: ${JSON.stringify(record.flowchart_problems?.requirements)}

      STUDENT SUBMISSION:
      Nodes: ${JSON.stringify(simpleNodes)}
      Connections: ${JSON.stringify(simpleEdges)}

      TASK:
      1. Analyze if the flow logically solves the problem.
      2. Check if decision nodes are handled correctly.
      3. Assign a score (0-100).
      4. Give a 1-line feedback string.

      OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
      { "score": number, "feedback": "string" }
    `;

    // 4. Call Groq API (Llama 3.3)
    console.log("⚡ Calling Groq Llama 3...");
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast & Intelligent
        messages: [
            { role: 'system', content: 'You are a JSON-only API. Never output markdown or explanations.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1, // Zero creativity, pure logic
        response_format: { type: "json_object" } // Force JSON mode
      }),
    });

    if (!groqResponse.ok) {
        const errText = await groqResponse.text();
        throw new Error(`Groq API Error: ${errText}`);
    }

    const aiData = await groqResponse.json();
    const content = aiData.choices[0].message.content;
    const result = JSON.parse(content); // Direct parse (Llama 3 handles JSON mode perfectly)

    console.log("✅ Groq Result:", result);

    // 5. Update Database
    const { error: updateError } = await supabase
      .from('flowchart_submissions')
      .update({
        ai_score: result.score,
        ai_feedback: result.feedback,
        status: 'graded'
      })
      .eq('id', submission_id);

    if (updateError) throw new Error("DB Update Failed");

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("🔥 Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});