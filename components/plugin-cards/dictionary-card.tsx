"use client"

import { BookOpen } from "lucide-react"
import type { DictionaryData } from "@/lib/plugins/dictionary-plugin"

interface DictionaryCardProps {
  data: DictionaryData
}

export default function DictionaryCard({ data }: DictionaryCardProps) {
  if (!data) return null

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 text-gray-800">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-green-600" />
          <h3 className="font-medium">Dictionary</h3>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-lg font-bold">{data.word}</h4>
            {data.phonetic && <span className="text-sm text-gray-500">{data.phonetic}</span>}
          </div>

          <div className="mt-3 space-y-3">
            {data.meanings.map((meaning, index) => (
              <div key={index}>
                <div className="text-sm font-medium text-gray-500 italic">{meaning.partOfSpeech}</div>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                    <li key={defIndex} className="text-sm">
                      {def.definition}
                      {def.example && (
                        <p className="text-xs text-gray-500 ml-5 mt-1 italic">&quot;{def.example}&quot;</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {data.synonyms && data.synonyms.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-gray-500">Synonyms: </span>
              <span className="text-xs">{data.synonyms.slice(0, 5).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">Data from Free Dictionary API</div>
    </div>
  )
}
