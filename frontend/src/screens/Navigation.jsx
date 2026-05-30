import { useNavigation } from '../context/NavigationContext';
import { Search, MapPin, Navigation as NavIcon, X, ArrowUpRight, Clock, Map as MapIcon } from 'lucide-react';

function Navigation() {
  const { 
    isRouting, 
    destination, 
    recentDestinations, 
    startRouting, 
    cancelRouting,
    searchQuery,
    setSearchQuery
  } = useNavigation();

  return (
    <div className="navigation-screen">
      {/* Map Background Placeholder */}
      <div className="map-background">
        <div className="map-grid"></div>
        <div className="map-marker-current">
          <div className="marker-pulse"></div>
        </div>
        {isRouting && (
          <svg className="map-route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M50 50 L60 40 L55 30 L70 20" stroke="#44aaff" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          </svg>
        )}
      </div>

      {/* UI Overlay */}
      <div className="nav-overlay">
        {!isRouting ? (
          <section className="nav-search-panel">
            <div className="search-bar">
              <Search size={24} className="icon-dim" />
              <input 
                type="text" 
                placeholder="Where to?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="recent-destinations">
              <span className="section-label">RECENT</span>
              {recentDestinations.map(dest => (
                <div key={dest.id} className="dest-item" onClick={() => startRouting(dest)}>
                  <div className="dest-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="dest-info">
                    <span className="dest-name">{dest.name}</span>
                    <span className="dest-address">{dest.address}</span>
                  </div>
                  <span className="dest-time">{dest.time}</span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="routing-panel">
            <div className="instruction-card">
              <div className="instruction-icon">
                <ArrowUpRight size={48} />
              </div>
              <div className="instruction-text">
                <span className="distance">0.5 mi</span>
                <span className="street">Turn right onto Main St</span>
              </div>
              <button className="btn-cancel-nav" onClick={cancelRouting}>
                <X size={24} />
              </button>
            </div>

            <div className="route-info-bar">
              <div className="info-item">
                <Clock size={20} />
                <span>12:45 PM arrival</span>
              </div>
              <div className="info-item">
                <NavIcon size={20} />
                <span>{destination.time} remaining</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Quick Map Controls */}
      <div className="map-controls">
        <button className="map-control-btn"><MapIcon size={24} /></button>
        <button className="map-control-btn"><MapPin size={24} /></button>
      </div>
    </div>
  );
}

export default Navigation;
