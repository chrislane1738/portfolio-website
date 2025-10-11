'use client';

interface PeerGridProps {
  peerPEs: { ticker: string; pe: number }[];
  targetTicker: string;
  targetPE: number;
}

export default function PeerGrid({ peerPEs, targetTicker, targetPE }: PeerGridProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Peer P/E Comparison</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Target Stock Card */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-400">{targetTicker}</p>
            <p className="text-lg font-bold text-white">{targetPE.toFixed(2)}</p>
            <p className="text-xs text-gray-400">Target</p>
          </div>
        </div>
        
        {/* Peer Cards */}
        {peerPEs.map((peer, index) => (
          <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-300">{peer.ticker}</p>
              <p className="text-lg font-bold text-white">{peer.pe.toFixed(2)}</p>
              <p className="text-xs text-gray-400">P/E Ratio</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-4 bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">Peer Count</p>
            <p className="text-white font-semibold">{peerPEs.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Average</p>
            <p className="text-white font-semibold">
              {peerPEs.length > 0 ? (peerPEs.reduce((sum, peer) => sum + peer.pe, 0) / peerPEs.length).toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Median</p>
            <p className="text-white font-semibold">
              {peerPEs.length > 0 ? peerPEs.map(p => p.pe).sort((a, b) => a - b)[Math.floor(peerPEs.length / 2)].toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Range</p>
            <p className="text-white font-semibold">
              {peerPEs.length > 0 ? 
                `${Math.min(...peerPEs.map(p => p.pe)).toFixed(1)} - ${Math.max(...peerPEs.map(p => p.pe)).toFixed(1)}` : 
                'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
