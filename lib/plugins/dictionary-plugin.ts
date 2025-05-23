import type { Plugin } from "../types"

export interface DictionaryDefinition {
  definition: string
  example?: string
}

export interface DictionaryMeaning {
  partOfSpeech: string
  definitions: DictionaryDefinition[]
}

export interface DictionaryData {
  word: string
  phonetic?: string
  meanings: DictionaryMeaning[]
  synonyms?: string[]
  antonyms?: string[]
}

export class DictionaryPlugin implements Plugin {
  name = "define"
  description = "Look up the definition of a word"
  triggers = [/^\/define\s+(.+)$/i]
  naturalLanguageTriggers = ["define", "what does", "meaning of", "definition of"]

  async execute(word: string): Promise<{ response: string; data: DictionaryData }> {
    if (!word) {
      throw new Error("Word is required")
    }

    try {
      // Clean up the word
      const cleanWord = word.trim().toLowerCase()
      
      // For multi-word queries, use just the first word for better API compatibility
      const searchWord = cleanWord.split(/\s+/)[0]

      // Base URL for the dictionary API
      const baseUrl = "https://api.dictionaryapi.dev"

      let definitionData: any = null
      let synonymsData: any = null
      let antonymsData: any = null
      let usedMockData = false

      try {
        // Make parallel requests to different endpoints
        // Using the correct endpoint format as provided in the documentation
        const [definitionResponse, synonymsResponse, antonymsResponse] = await Promise.all([
          fetch(`${baseUrl}/api/v2/entries/en/${encodeURIComponent(searchWord)}`),
          fetch(`${baseUrl}/api/v2/entries/en/${encodeURIComponent(searchWord)}`),
          fetch(`${baseUrl}/api/v2/entries/en/${encodeURIComponent(searchWord)}`)
        ])

        // Check if the main API request failed
        if (!definitionResponse.ok) {
          console.warn(`Dictionary API error: ${definitionResponse.status} ${definitionResponse.statusText}`)
        } else {
          // Process the API response which contains definitions, synonyms, and antonyms
          const apiData = await definitionResponse.json();
          if (Array.isArray(apiData) && apiData.length > 0) {
            const entry = apiData[0]; // Get the first entry
            
            // Extract definitions from meanings
            definitionData = {
              word: entry.word,
              definition: entry.meanings.flatMap((m: any) => 
                m.definitions.map((d: any) => d.definition))
            };
            
            // Extract synonyms and antonyms from meanings
            const allSynonyms = entry.meanings.flatMap((m: any) => 
              m.definitions.flatMap((d: any) => d.synonyms || []));
            const allAntonyms = entry.meanings.flatMap((m: any) => 
              m.definitions.flatMap((d: any) => d.antonyms || []));
              
            synonymsData = { word: entry.word, synonyms: allSynonyms };
            antonymsData = { word: entry.word, antonyms: allAntonyms };
          }
        }

        // If definition request failed, fall back to mock data
        if (!definitionData) {
          const mockData = this.getMockDictionaryData(searchWord)
          definitionData = {
            word: mockData.word,
            definition: mockData.meanings.flatMap((m: DictionaryMeaning) => m.definitions.map(d => d.definition))
          }
          synonymsData = { word: mockData.word, synonyms: mockData.synonyms || [] }
          antonymsData = { word: mockData.word, antonyms: mockData.antonyms || [] }
          usedMockData = true
        }
      } catch (error) {
        // If any API call fails, use mock data
        const errorMsg = (error instanceof Error && error.message) ? error.message : String(error)
        console.warn(`Dictionary API failed: ${errorMsg}, using mock data`)
        const mockData = this.getMockDictionaryData(searchWord)
        definitionData = {
          word: mockData.word,
          definition: mockData.meanings.flatMap((m: DictionaryMeaning) => m.definitions.map(d => d.definition))
        }
        synonymsData = { word: mockData.word, synonyms: mockData.synonyms || [] }
        antonymsData = { word: mockData.word, antonyms: mockData.antonyms || [] }
        usedMockData = true
      }

      // Process API response data (or mock data if API failed)
      let meanings: DictionaryMeaning[] = []
      
      if (!definitionData && usedMockData) {
        // If using mock data, use the prepared meanings
        const mockData = this.getMockDictionaryData(searchWord)
        meanings = mockData.meanings;
      } else if (definitionData) {
        // For the actual API data, use the original definition format
        const apiData = await fetch(`${baseUrl}/api/v2/entries/en/${encodeURIComponent(searchWord)}`)
          .then(res => res.json())
          .catch(() => null);
          
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          // Use the original meanings structure from the API
          meanings = apiData[0].meanings.map((meaning: any) => ({
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions.map((def: any) => ({
              definition: def.definition,
              example: def.example,
            })),
          }));
        } else {
          // Fallback: Organize definitions by potential parts of speech
          const definitions = definitionData.definition || []
          const possiblePartsOfSpeech = ['noun', 'verb', 'adjective', 'adverb']
          
          if (definitions.length > 0) {
            // Simple heuristic: assign first def to noun, second to verb, etc.
            definitions.forEach((def: string, index: number) => {
              const partOfSpeech = index < possiblePartsOfSpeech.length ? 
                possiblePartsOfSpeech[index] : 'other'
              
              meanings.push({
                partOfSpeech,
                definitions: [{ definition: def }]
              })
            })
          } else {
            meanings.push({
              partOfSpeech: 'unknown',
              definitions: [{ definition: 'No definition available' }]
            })
          }
        }
      } else {
        meanings.push({
          partOfSpeech: 'unknown',
          definitions: [{ definition: 'No definition available' }]
        })
      }

      // Format the data
      const data: DictionaryData = {
        word: definitionData.word || searchWord,
        // No phonetic in this API
        phonetic: undefined,
        meanings,
        synonyms: synonymsData?.synonyms || [],
        antonyms: antonymsData?.antonyms || [],
      }

      // Generate response text
      let response = `Definition of "${data.word}": `

      if (data.meanings.length > 0) {
        // Add the first definition
        const firstMeaning = data.meanings[0]
        response += `(${firstMeaning.partOfSpeech}) ${firstMeaning.definitions[0].definition}`

        // Add a second meaning if available
        if (data.meanings.length > 1) {
          response += `\nAlso (${data.meanings[1].partOfSpeech}): ${data.meanings[1].definitions[0].definition}`
        }

        // Add synonyms if available (up to 5)
        if (data.synonyms && data.synonyms.length > 0) {
          const uniqueSynonyms = [...new Set(data.synonyms)].slice(0, 5)
          if (uniqueSynonyms.length > 0) {
            response += `\nSynonyms: ${uniqueSynonyms.join(', ')}`
          }
        }

        // Add antonyms if available (up to 3)
        if (data.antonyms && data.antonyms.length > 0) {
          const uniqueAntonyms = [...new Set(data.antonyms)].slice(0, 3)
          if (uniqueAntonyms.length > 0) {
            response += `\nAntonyms: ${uniqueAntonyms.join(', ')}`
          }
        }
      } else {
        response += "No definition found."
      }

      if (usedMockData) {
        response += "\n(Note: Using backup dictionary data as the API request failed)"
      }

      return { response, data }
    } catch (error) {
      console.error("Dictionary plugin error:", error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      throw new Error(`Could not fetch definition for "${word}". ${errorMsg}`)
    }
  }

  private getMockDictionaryData(word: string): any {
    // Generate mock dictionary data for testing
    const mockDefinitions = {
      hello: {
        word: "hello",
        phonetic: "/həˈloʊ/",
        meanings: [
          {
            partOfSpeech: "exclamation",
            definitions: [
              {
                definition: "Used as a greeting or to begin a phone conversation.",
                example: "hello there, Katie!",
              },
            ],
            synonyms: ["hi", "greetings", "hey"],
          },
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition: 'An utterance of "hello"; a greeting.',
                example: "she was getting polite nods and hellos from people",
              },
            ],
          },
        ],
      },
      weather: {
        word: "weather",
        phonetic: "/ˈwɛðər/",
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition:
                  "The state of the atmosphere at a particular place and time as regards heat, cloudiness, dryness, sunshine, wind, rain, etc.",
                example: "if the weather's good, we can go for a walk",
              },
            ],
          },
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition:
                  "Wear away or change the appearance or texture of (something) by long exposure to the atmosphere.",
                example: "his skin was weathered by the sun and wind",
              },
            ],
          },
        ],
        synonyms: ["climate", "atmospheric conditions", "meteorological conditions"],
      },
      calculate: {
        word: "calculate",
        phonetic: "/ˈkælkjəˌleɪt/",
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "Determine (the amount or number of something) mathematically.",
                example: "the program can calculate the number of words in a text",
              },
              {
                definition: "Plan or devise (something) carefully.",
                example: "the candidate is calculating his next move",
              },
            ],
          },
        ],
        synonyms: ["compute", "reckon", "work out", "determine"],
      },
    }

    // Return mock data for known words or generate generic data
    if (word in mockDefinitions) {
      return mockDefinitions[word as keyof typeof mockDefinitions]
    }

    // Generate generic mock data
    return {
      word: word,
      phonetic: `/ˈ${word}/`,
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition: `This is a mock definition for "${word}". In a real application, this would be fetched from a dictionary API.`,
              example: `Using "${word}" in a sentence.`,
            },
          ],
        },
      ],
      synonyms: ["similar", "comparable", "equivalent"],
    }
  }
}
