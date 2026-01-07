import Link from 'next/link';
import { Shield, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/simple-ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-slate-900 p-4 shadow-lg shadow-slate-200">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Understand Legal Documents <br />
            <span className="text-blue-600">Without the Panic</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Upload any Government Notice or Employment Contract.
            Get a safe, simple explanation in plain English.
            No jargon, no anxiety.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/analyze">
              <Button className="h-12 px-8 text-lg rounded-full shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all bg-blue-600 hover:bg-blue-700">
                Start Analysis
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-lg bg-red-50 p-3">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Government Notices</h3>
            <p className="mt-2 text-slate-600">Know exactly how urgent it is. We explain Section 143(1), 156, and more without scary language.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-lg bg-blue-50 p-3">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Employment Contracts</h3>
            <p className="mt-2 text-slate-600">Spot hidden risks like lock-in periods, bonds, and one-sided termination clauses before you sign.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-lg bg-green-50 p-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Safety First</h3>
            <p className="mt-2 text-slate-600">We prioritize accuracy and conservatism. We never give legal advice, only helpful explanations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
