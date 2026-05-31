import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { 
  Search, MapPin, Navigation as NavIcon, X, ArrowUpRight, 
  Clock, Fuel, Utensils, CircleParking, 
  Zap, Volume2, VolumeX, Compass, MousePointer2 
} from 'lucide-react';

const POI_ICONS = {
  Fuel: Fuel,
  Utensils: Utensils,
  CircleParking: CircleParking,
  Zap: Zap
};

const panelVariants = {
  initial: { x: -400, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 100 } },
  exit: { x: -400, opacity: 0 }
};

const hudVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { delay: 0.2, type: "spring", damping: 20, stiffness: 100 } },
  exit: { y: -100, opacity: 0 }
};

function Navigation() {
  const { 
    isRouting, 
    destination, 
    recentDestinations, 
    poiCategories,
    searchResults,
    startRouting, 
    cancelRouting,
    searchQuery,
    setSearchQuery,
    viewMode,
    toggleViewMode,
    isMuted,
    toggleMute
  } = useNavigation();

  const isSearching = searchQuery.length > 0;

  return (
    <div className="navigation-screen">
      {/* Map Background Placeholder */}
      <motion.div 
        className={`map-background ${viewMode === '3D' ? 'view-3d' : 'view-2d'}`}
        animate={viewMode === '3D' ? { scale: 1.4, y: -100 } : { scale: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="map-grid"></div>
        
        {/* Mock Map Features */}
        <div className="map-labels">
          <span className="road-label label-main">MAIN STREET</span>
          <span className="road-label label-broad">BROADWAY</span>
        </div>

        <div className="map-marker-current">
          <div className="marker-arrow"></div>
          <div className="marker-pulse"></div>
        </div>

        {isRouting && (
          <div className="map-route-container">
            <svg className="map-route-line" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <path 
                d="M500 800 L500 600 L700 400 L700 200" 
                stroke="#3b82f6" 
                strokeWidth="15" 
                fill="none" 
                strokeLinecap="round"
                className="route-path-bg"
              />
              <path 
                d="M500 800 L500 600 L700 400 L700 200" 
                stroke="#60a5fa" 
                strokeWidth="8" 
                fill="none" 
                strokeLinecap="round"
                strokeDasharray="20, 20"
                className="route-path-anim"
              />
            </svg>
            <motion.div 
              className="map-marker-dest"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <MapPin size={32} fill="#ef4444" color="white" />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* UI Overlay */}
      <div className="nav-overlay">
        
        {/* Left Panel: Search & History */}
        <AnimatePresence>
          {!isRouting && (
            <motion.aside 
              key="panel"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`nav-side-panel ${isSearching ? 'searching' : ''}`}
            >
              <div className="nav-search-header">
                <div className="search-bar">
                  <Search size={24} className="icon-dim" />
                  <input 
                    type="text" 
                    placeholder="Search destinations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && (
                    <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="nav-panel-content">
                {isSearching ? (
                  <motion.div 
                    className="search-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map(result => (
                        <motion.div 
                          key={result.id} 
                          className="dest-item result" 
                          onClick={() => startRouting(result)}
                          whileHover={{ x: 10, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                        >
                          <div className="dest-icon"><MapPin size={20} /></div>
                          <div className="dest-info">
                            <span className="dest-name">{result.name}</span>
                            <span className="dest-address">{result.address}</span>
                          </div>
                          <div className="dest-meta">
                            <span className="dest-distance">{result.distance}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="no-results">No destinations found</div>
                    )}
                  </motion.div>
                ) : (
                  <>
                    <motion.div 
                      className="poi-grid"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {poiCategories.map(poi => {
                        const Icon = POI_ICONS[poi.icon];
                        return (
                          <motion.button 
                            key={poi.id} 
                            className="poi-btn"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon size={24} />
                            <span>{poi.name}</span>
                          </motion.button>
                        );
                      })}
                    </motion.div>

                    <motion.div 
                      className="recent-destinations"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="section-label">RECENT DESTINATIONS</span>
                      {recentDestinations.map(dest => (
                        <motion.div 
                          key={dest.id} 
                          className="dest-item" 
                          onClick={() => startRouting(dest)}
                          whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                          <div className="dest-icon"><Clock size={20} /></div>
                          <div className="dest-info">
                            <span className="dest-name">{dest.name}</span>
                            <span className="dest-address">{dest.address}</span>
                          </div>
                          <span className="dest-distance">{dest.distance}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Active Routing HUD */}
        <AnimatePresence>
          {isRouting && (
            <motion.div 
              key="hud"
              variants={hudVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="routing-hud"
            >
              <div className="routing-instruction">
                <motion.div 
                  className="instruction-icon-main"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArrowUpRight size={56} />
                </motion.div>
                <div className="instruction-details">
                  <span className="dist-to-turn">0.4 mi</span>
                  <span className="road-name">MAIN STREET</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
                  whileTap={{ scale: 0.9 }}
                  className="btn-stop-nav" 
                  onClick={cancelRouting}
                >
                  <X size={28} />
                </motion.button>
              </div>

              <motion.div 
                className="routing-stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="stat-group">
                  <span className="stat-value">12:48</span>
                  <span className="stat-label">ARRIVAL</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-group">
                  <span className="stat-value">{destination?.time || '15 min'}</span>
                  <span className="stat-label">REMAINING</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-group">
                  <span className="stat-value">{destination?.distance || '4.2 mi'}</span>
                  <span className="stat-label">DISTANCE</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="nav-floating-controls">
          <motion.div 
            className="compass-widget"
            animate={{ rotate: viewMode === '3D' ? 45 : 0 }}
          >
            <Compass size={32} />
          </motion.div>
          
          <div className="map-action-buttons">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-map-control" 
              onClick={toggleViewMode}
            >
              <span className="view-mode-label">{viewMode}</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-map-control" 
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-map-control"
            >
              <MousePointer2 size={24} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-map-control btn-recenter"
            >
              <NavIcon size={24} />
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Navigation;
