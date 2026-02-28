import { MonitorSmartphone, ArrowLeft } from "lucide-react";

const MobileBlockPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Icon Area */}
          <div className="pt-12 pb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <MonitorSmartphone className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-12 text-center">
            <h1 className="text-2xl font-bold text-white mb-3">
              Larger Screen Required
            </h1>
            
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              The admin management system requires a larger screen for optimal experience. 
              Please access from a desktop or laptop computer.
            </p>

            {/* Screen Size Indicator */}
            <div className="bg-white/5 rounded-xl px-4 py-3 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Current screen</span>
                <span className="text-white font-mono">{window.innerWidth}px</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${Math.min((window.innerWidth / 1024) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                Minimum: 1024px
              </p>
            </div>

            {/* Return Button */}
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-medium w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBlockPage;