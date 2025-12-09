import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../lib/api/analytics';

export const AnalyticsDashboard = () => {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const analytics = await analyticsAPI.getUserAnalyticsSummary();
        setUserAnalytics(analytics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userAnalytics) return <div>No analytics data available</div>;

  return (
    <div className="analytics-dashboard">
      <h1>User Analytics Dashboard</h1>
      
      {}
      <div className="analytics-overview">
        <div className="stat-card">
          <h3>Total Page Views</h3>
          <p>{userAnalytics.total_page_views || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Properties Viewed</h3>
          <p>{userAnalytics.browsingPatterns?.uniquePropertiesViewed || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Investments</h3>
          <p>{userAnalytics.portfolioAnalytics?.totalInvestments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Investment Amount</h3>
          <p>${userAnalytics.portfolioAnalytics?.totalInvestmentAmount?.toLocaleString() || 0}</p>
        </div>
      </div>

      {}
      <div className="analytics-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {userAnalytics.recentActivity?.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-type">{activity.event_type}</span>
              <span className="activity-time">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
              <span className="activity-category">{activity.event_category}</span>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="analytics-section">
        <h2>Recent Property Views</h2>
        <div className="property-views-list">
          {userAnalytics.recentPropertyViews?.map((view, index) => (
            <div key={index} className="property-view-item">
              <span className="property-id">{view.property_id}</span>
              <span className="view-time">
                {new Date(view.timestamp).toLocaleString()}
              </span>
              {view.view_duration && (
                <span className="view-duration">{view.view_duration}s</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="analytics-section">
        <h2>Investment History</h2>
        <div className="investment-list">
          {userAnalytics.recentInvestments?.map((investment, index) => (
            <div key={index} className="investment-item">
              <span className="investment-type">{investment.event_type}</span>
              <span className="investment-property">{investment.property_id}</span>
              <span className="investment-amount">
                ${investment.investment_amount || 0}
              </span>
              <span className="investment-status">{investment.status}</span>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="analytics-section">
        <h2>Browsing Patterns</h2>
        <div className="browsing-stats">
          <div className="browsing-stat">
            <span>Total Page Views: {userAnalytics.browsingPatterns?.pageViews || 0}</span>
          </div>
          <div className="browsing-stat">
            <span>Searches Performed: {userAnalytics.browsingPatterns?.searchesPerformed || 0}</span>
          </div>
          <div className="browsing-stat">
            <span>Favorite Property Type: {userAnalytics.browsingPatterns?.favoritePropertyType || 'None'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .analytics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          color: var(--accent-primary);
        }

        .stat-card p {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .analytics-section {
          margin-bottom: 30px;
        }

        .analytics-section h2 {
          color: var(--accent-primary);
          border-bottom: 2px solid var(--accent-blue);
          padding-bottom: 10px;
        }

        .activity-list, .property-views-list, .investment-list {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 15px;
        }

        .activity-item, .property-view-item, .investment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid var(--bg-tertiary);
        }

        .activity-item:last-child, .property-view-item:last-child, .investment-item:last-child {
          border-bottom: none;
        }

        .activity-type, .investment-type {
          font-weight: bold;
          color: var(--accent-blue);
        }

        .activity-category {
          color: var(--accent-green);
        }

        .activity-time, .view-time {
          color: #888;
          font-size: 14px;
        }

        .browsing-stats {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 15px;
        }

        .browsing-stat {
          padding: 10px;
          border-bottom: 1px solid var(--bg-tertiary);
        }

        .browsing-stat:last-child {
          border-bottom: none;
        }

        .browsing-stat span {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
