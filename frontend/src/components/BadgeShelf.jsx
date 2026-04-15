const BadgeShelf = ({ badges = [] }) => {
  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 md:p-5">
      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4">Milestones & Badges</h3>

      {badges.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-400">No badges earned yet. Keep tracking daily progress.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {badges.map((badge) => (
            <div
              key={badge._id}
              className="rounded-lg p-2 sm:p-3 md:p-4 bg-purple-500/10 border border-purple-500/40 hover:border-purple-500/60 transition-all duration-200 hover:bg-purple-500/15"
            >
              <p className="text-xs sm:text-sm md:text-base font-semibold text-purple-300">{badge.badgeCode}</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">
                {new Date(badge.earnedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeShelf;
