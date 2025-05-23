"use client"

import { Calculator } from "lucide-react"
import type { CalculatorData } from "@/lib/plugins/calculator-plugin"

interface CalculatorCardProps {
  data: CalculatorData
}

export default function CalculatorCard({ data }: CalculatorCardProps) {
  if (!data) return null

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 text-gray-800">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-5 w-5 text-purple-500" />
          <h3 className="font-medium">Calculator</h3>
        </div>

        <div className="bg-gray-50 p-3 rounded-md font-mono">
          <div className="text-gray-600">{data.expression}</div>
          <div className="text-xl font-bold mt-1">{data.result}</div>
        </div>
      </div>
    </div>
  )
}
