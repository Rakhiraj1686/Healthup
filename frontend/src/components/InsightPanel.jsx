const InsightPanel = ({ insight }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
      <h3 className="text-lg font-semibold text-white mb-2">AI Progress Insight</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{insight?.summary || "No insight generated yet."}</p>

      {Array.isArray(insight?.riskFlags) && insight.riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {insight.riskFlags.map((flag) => (
            <span
              key={flag}
              className="text-xs px-2 py-1 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300"
            >
              {flag.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightPanel;
