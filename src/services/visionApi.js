const VISION_KEY_STORAGE = 'mealprep_openai_api_key'

export function getVisionApiKey() {
  try {
    return localStorage.getItem(VISION_KEY_STORAGE) || ''
  } catch {
    return ''
  }
}

export function setVisionApiKey(key) {
  localStorage.setItem(VISION_KEY_STORAGE, key)
}

export function clearVisionApiKey() {
  localStorage.removeItem(VISION_KEY_STORAGE)
}

export function isVisionConfigured() {
  return !!getVisionApiKey()
}

export async function analyzeImage(imageBase64) {
  const apiKey = getVisionApiKey()
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a food inventory assistant. Analyze the image and identify all visible food items.
Return a JSON array of detected items. Each item should have:
- "name": lowercase name (e.g., "chicken breast")
- "displayName": properly capitalized name (e.g., "Chicken Breast")
- "amount": numeric amount if you can estimate it, or null if uncertain
- "unit": unit of measurement (e.g., "lbs", "oz", "count"), or null if uncertain
- "section": one of "fridge", "pantry", "freezer", or "spices"

Return ONLY the JSON array, no other text. Example:
[{"name":"chicken breast","displayName":"Chicken Breast","amount":2,"unit":"lbs","section":"fridge"}]`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What food items do you see in this image? Return them as a JSON array.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:')
                  ? imageBase64
                  : `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API request failed: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '[]'

  // Parse JSON, handling markdown code blocks
  let jsonStr = content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const items = JSON.parse(jsonStr)
    if (!Array.isArray(items)) return []
    return items.map(item => ({
      name: String(item.name || '').toLowerCase(),
      displayName: String(item.displayName || item.name || ''),
      amount: item.amount != null ? Number(item.amount) : null,
      unit: item.unit || null,
      section: ['fridge', 'pantry', 'freezer', 'spices'].includes(item.section)
        ? item.section
        : 'pantry',
    }))
  } catch {
    console.error('Failed to parse vision API response:', content)
    return []
  }
}
