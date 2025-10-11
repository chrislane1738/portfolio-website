'use client';

interface TickerInputProps {
  targetTicker: string;
  setTargetTicker: (value: string) => void;
  peerTickers: string[];
  setPeerTickers: (value: string[]) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
}

export default function TickerInput({
  targetTicker,
  setTargetTicker,
  peerTickers,
  setPeerTickers,
  onRunAnalysis,
  isLoading
}: TickerInputProps) {
  const addPeerTicker = () => {
    setPeerTickers([...peerTickers, '']);
  };

  const removePeerTicker = (index: number) => {
    if (peerTickers.length > 1) {
      setPeerTickers(peerTickers.filter((_, i) => i !== index));
    }
  };

  const updatePeerTicker = (index: number, value: string) => {
    const updated = [...peerTickers];
    updated[index] = value.toUpperCase();
    setPeerTickers(updated);
  };
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Analysis Input</h3>
      
      <div className="space-y-6">
        {/* Target Ticker Input */}
        <div>
          <label htmlFor="target-ticker" className="block text-sm font-medium text-gray-300 mb-2">
            Target Stock Ticker
          </label>
          <input
            id="target-ticker"
            type="text"
            value={targetTicker}
            onChange={(e) => setTargetTicker(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Peer Tickers Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Peer Stock Tickers
            </label>
            <button
              type="button"
              onClick={addPeerTicker}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
            >
              + Add Peer
            </button>
          </div>
          
          <div className="space-y-3">
            {peerTickers.map((ticker, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => updatePeerTicker(index, e.target.value)}
                  placeholder={`Peer ${index + 1} (e.g., MSFT)`}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                {peerTickers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePeerTicker(index)}
                    disabled={isLoading}
                    className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Add peer companies in the same industry for comparison. These should be similar companies to your target stock.
          </p>
        </div>

        {/* Run Analysis Button */}
        <div className="pt-4">
          <button
            onClick={onRunAnalysis}
            disabled={!targetTicker.trim() || peerTickers.every(ticker => !ticker.trim()) || isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              !targetTicker.trim() || peerTickers.every(ticker => !ticker.trim()) || isLoading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Running Analysis...
              </div>
            ) : (
              'Run P/E Analysis'
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">How it works:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Analyzes the target stock&apos;s current P/E ratio</li>
            <li>• Calculates 5-year historical average P/E</li>
            <li>• Compares with peer company P/E ratios</li>
            <li>• Filters out statistical outliers</li>
            <li>• Provides fair value estimate and investment rating</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
