import Link from 'next/link'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Welcome to AI Bots Hub
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TalkBetter Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">TalkBetter AI</h2>
              <p className="text-gray-600 mb-4">
                Improve your communication skills with our AI-powered conversation partner.
              </p>
              <Link 
                href="/talkbetter"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Meeting with TalkBetter
              </Link>
            </div>
          </div>

          {/* PlayAI Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">PlayAI</h2>
              <p className="text-gray-600 mb-4">
                Engage in fun and interactive games with our AI game master.
              </p>
              <Link 
                href="/playai"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Meeting with PlayAI
              </Link>
            </div>
          </div>


          {/* PlayAI Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">HeyGen</h2>
              <p className="text-gray-600 mb-4">
                Engage in fun and interactive games with our AI game master.
              </p>
              <Link 
                href="/heygen"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Meeting with HeyGen
              </Link>
            </div>
          </div>



          {/* PlayAI Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gemini</h2>
              <p className="text-gray-600 mb-4">
                Engage in fun and interactive games with our AI game master.
              </p>
              <Link 
                href="/gemini"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Meeting with Gemini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

