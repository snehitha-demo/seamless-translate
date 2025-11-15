const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, insights, targetLanguage } = await req.json();
    console.log('Translation request:', { targetLanguage, textLength: text?.length, insightsCount: insights?.length });

    if (!text || !targetLanguage) {
      throw new Error('Missing required fields: text and targetLanguage');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('Translation service is not configured');
    }

    // Map language codes to language names
    const languageNames: Record<string, string> = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      ar: 'Arabic',
      hi: 'Hindi',
      ru: 'Russian',
    };

    const targetLanguageName = languageNames[targetLanguage] || targetLanguage;
    console.log(`Translating to: ${targetLanguageName}`);

    // Translate summary
    const summaryPrompt = `Translate the following text to ${targetLanguageName}. Maintain the professional tone and technical accuracy. Only provide the translation, no additional text:

${text}`;

    console.log('Calling Lovable AI for summary translation...');
    const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional translator. Translate text accurately while maintaining the original meaning and tone.' },
          { role: 'user', content: summaryPrompt }
        ],
      }),
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('Lovable AI summary translation error:', summaryResponse.status, errorText);
      
      if (summaryResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (summaryResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Translation service requires payment. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI translation failed: ${errorText}`);
    }

    const summaryData = await summaryResponse.json();
    const translatedSummary = summaryData.choices[0].message.content;
    console.log('Summary translated successfully');

    // Translate insights if provided
    let translatedInsights: string[] = [];
    if (insights && insights.length > 0) {
      console.log('Translating insights...');
      const insightsPrompt = `Translate the following list items to ${targetLanguageName}. Maintain the professional tone. Return ONLY the translated items, one per line:

${insights.join('\n')}`;

      const insightsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a professional translator. Translate text accurately while maintaining the original meaning and tone.' },
            { role: 'user', content: insightsPrompt }
          ],
        }),
      });

      if (!insightsResponse.ok) {
        const errorText = await insightsResponse.text();
        console.error('Lovable AI insights translation error:', insightsResponse.status, errorText);
        // Continue without insights if translation fails
        translatedInsights = insights;
      } else {
        const insightsData = await insightsResponse.json();
        const translatedText = insightsData.choices[0].message.content;
        translatedInsights = translatedText.split('\n').filter((line: string) => line.trim());
        console.log('Insights translated successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        translatedSummary, 
        translatedInsights 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
