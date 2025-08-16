import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth';
import { Principal } from '@dfinity/principal';
import './index.css';

// Simple test version
const Factory = () => {
  return (
    <div className="factory-container">
      <div className="factory-header">
        <h2>🏭 Payment Canister Factory</h2>
        <p>Deploy and manage your payment canisters</p>
      </div>
      <div className="factory-content">
        <p>Factory component is working! The full factory UI will load here.</p>
      </div>
    </div>
  );
};

export default Factory;

// Full component (commenting out for now to test basic functionality)
/*

const DeploymentForm = ({ onDeploy, isDeploying }) => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    supported_tokens: [{
      symbol: 'ckBTC',
      name: 'Chain Key Bitcoin',
      decimals: 8,
      canister_id: 'mxzaz-hqaaa-aaaar-qaada-cai',
      fee: 10,
      logo: null,
      is_active: true
    }],
    webhook: '',
    merchant_fee: 250, // 2.5%
    auto_withdraw: false,
    withdraw_threshold: null,
    custom_settings: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert form data to proper format
    const deployConfig = {
      ...config,
      supported_tokens: config.supported_tokens.map(token => ({
        ...token,
        canister_id: Principal.fromText(token.canister_id),
        logo: token.logo ? [token.logo] : [],
      })),
      webhook: config.webhook ? [config.webhook] : [],
      withdraw_threshold: config.withdraw_threshold ? [BigInt(config.withdraw_threshold)] : []
    };

    onDeploy(deployConfig);
  };

  const addToken = () => {
    setConfig(prev => ({
      ...prev,
      supported_tokens: [...prev.supported_tokens, {
        symbol: '',
        name: '',
        decimals: 8,
        canister_id: '',
        fee: 10,
        logo: null,
        is_active: true
      }]
    }));
  };

  const removeToken = (index) => {
    setConfig(prev => ({
      ...prev,
      supported_tokens: prev.supported_tokens.filter((_, i) => i !== index)
    }));
  };

  const updateToken = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      supported_tokens: prev.supported_tokens.map((token, i) => 
        i === index ? { ...token, [field]: value } : token
      )
    }));
  };

  return (
    <div className="deployment-form-container">
      <h3>Deploy New Payment Canister</h3>
      <form onSubmit={handleSubmit} className="deployment-form">
        <div className="form-group">
          <label htmlFor="name">Canister Name *</label>
          <input
            type="text"
            id="name"
            value={config.name}
            onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My Payment System"
            required
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={config.description}
            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description of your payment system"
            maxLength={200}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="merchant_fee">Merchant Fee (basis points, max 1000 = 10%)</label>
          <input
            type="number"
            id="merchant_fee"
            value={config.merchant_fee}
            onChange={(e) => setConfig(prev => ({ ...prev, merchant_fee: parseInt(e.target.value) }))}
            min={0}
            max={1000}
            placeholder="250"
          />
          <small>Current fee: {(config.merchant_fee / 100).toFixed(2)}%</small>
        </div>

        <div className="form-group">
          <label>Supported Tokens</label>
          {config.supported_tokens.map((token, index) => (
            <div key={index} className="token-config">
              <div className="token-fields">
                <input
                  type="text"
                  placeholder="Symbol (e.g., ckBTC)"
                  value={token.symbol}
                  onChange={(e) => updateToken(index, 'symbol', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Name (e.g., Chain Key Bitcoin)"
                  value={token.name}
                  onChange={(e) => updateToken(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Canister ID"
                  value={token.canister_id}
                  onChange={(e) => updateToken(index, 'canister_id', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Decimals"
                  value={token.decimals}
                  onChange={(e) => updateToken(index, 'decimals', parseInt(e.target.value))}
                  min={0}
                  max={18}
                />
                <input
                  type="number"
                  placeholder="Fee"
                  value={token.fee}
                  onChange={(e) => updateToken(index, 'fee', parseInt(e.target.value))}
                  min={0}
                />
                {config.supported_tokens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeToken(index)}
                    className="remove-token-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addToken} className="add-token-btn">
            Add Token
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="webhook">Webhook URL (optional)</label>
          <input
            type="url"
            id="webhook"
            value={config.webhook}
            onChange={(e) => setConfig(prev => ({ ...prev, webhook: e.target.value }))}
            placeholder="https://your-webhook-url.com"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={config.auto_withdraw}
              onChange={(e) => setConfig(prev => ({ ...prev, auto_withdraw: e.target.checked }))}
            />
            Enable Auto Withdraw
          </label>
        </div>

        {config.auto_withdraw && (
          <div className="form-group">
            <label htmlFor="withdraw_threshold">Auto Withdraw Threshold</label>
            <input
              type="number"
              id="withdraw_threshold"
              value={config.withdraw_threshold || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, withdraw_threshold: e.target.value }))}
              placeholder="Minimum amount for auto withdrawal"
            />
          </div>
        )}

        <button type="submit" disabled={isDeploying} className="deploy-btn">
          {isDeploying ? 'Deploying...' : 'Deploy Canister'}
        </button>
      </form>
    </div>
  );
};

const CanistersList = ({ canisters, onRefresh }) => {
  return (
    <div className="canisters-list-container">
      <div className="list-header">
        <h3>My Deployed Canisters</h3>
        <button onClick={onRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      {canisters.length === 0 ? (
        <div className="empty-state">
          <p>No canisters deployed yet. Deploy your first payment canister above!</p>
        </div>
      ) : (
        <div className="canisters-grid">
          {canisters.map((canister) => (
            <div key={canister.id.toString()} className="canister-card">
              <div className="canister-header">
                <h4>{canister.name}</h4>
                <span className={`status ${canister.is_active ? 'active' : 'inactive'}`}>
                  {canister.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="canister-details">
                <p><strong>ID:</strong> {canister.id.toString()}</p>
                <p><strong>Description:</strong> {canister.description}</p>
                <p><strong>Version:</strong> {canister.version}</p>
                <p><strong>Created:</strong> {new Date(canister.created_at / 1000000).toLocaleDateString()}</p>
                
                <div className="supported-tokens">
                  <strong>Supported Tokens:</strong>
                  <ul>
                    {canister.supported_tokens.map((token, index) => (
                      <li key={index}>{token.symbol} ({token.name})</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="canister-actions">
                <a 
                  href={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=${canister.id.toString()}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-candid-btn"
                >
                  View Candid UI
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FactoryStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="factory-stats-container">
      <h3>Factory Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_canisters}</div>
          <div className="stat-label">Total Canisters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active_canisters}</div>
          <div className="stat-label">Active Canisters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_users}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">v{stats.current_version}</div>
          <div className="stat-label">Current Version</div>
        </div>
      </div>
    </div>
  );
};

const Factory = () => {
  const { backendActor } = useAuth();
  const [activeView, setActiveView] = useState('overview');
  const [canisters, setCanisters] = useState([]);
  const [factoryStats, setFactoryStats] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (backendActor) {
      loadData();
    }
  }, [backendActor]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load user's canisters and factory stats
      const [userCanisters, stats] = await Promise.all([
        backendActor.get_user_canisters(await backendActor.whoami()),
        backendActor.get_factory_stats()
      ]);

      setCanisters(userCanisters);
      setFactoryStats(stats);
    } catch (err) {
      console.error('Error loading factory data:', err);
      setError('Failed to load factory data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (config) => {
    try {
      setIsDeploying(true);
      setError(null);
      setDeploymentResult(null);

      console.log('Deploying canister with config:', config);
      const result = await backendActor.deploy_user_payment_canister(config);
      
      if (result.Ok) {
        setDeploymentResult({ 
          success: true, 
          message: result.Ok,
          canisterId: result.Ok.match(/ID: (\S+)/)?.[1] 
        });
        // Reload data to show the new canister
        await loadData();
      } else {
        setDeploymentResult({ 
          success: false, 
          message: result.Err || 'Deployment failed' 
        });
      }
    } catch (err) {
      console.error('Deployment error:', err);
      setDeploymentResult({ 
        success: false, 
        message: `Deployment failed: ${err.message}` 
      });
    } finally {
      setIsDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="factory-container">
        <div className="loading">Loading factory data...</div>
      </div>
    );
  }

  return (
    <div className="factory-container">
      <div className="factory-header">
        <h2>Payment Canister Factory</h2>
        <p>Deploy and manage your payment canisters</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      <div className="factory-nav">
        <button 
          className={activeView === 'overview' ? 'active' : ''} 
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button 
          className={activeView === 'deploy' ? 'active' : ''} 
          onClick={() => setActiveView('deploy')}
        >
          Deploy New
        </button>
        <button 
          className={activeView === 'manage' ? 'active' : ''} 
          onClick={() => setActiveView('manage')}
        >
          My Canisters
        </button>
      </div>

      <div className="factory-content">
        {activeView === 'overview' && (
          <div className="overview-section">
            <FactoryStats stats={factoryStats} />
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  onClick={() => setActiveView('deploy')}
                  className="primary-action-btn"
                >
                  Deploy New Canister
                </button>
                <button 
                  onClick={() => setActiveView('manage')}
                  className="secondary-action-btn"
                >
                  View My Canisters ({canisters.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'deploy' && (
          <div className="deploy-section">
            {deploymentResult && (
              <div className={`deployment-result ${deploymentResult.success ? 'success' : 'error'}`}>
                <h4>{deploymentResult.success ? '✅ Deployment Successful!' : '❌ Deployment Failed'}</h4>
                <p>{deploymentResult.message}</p>
                {deploymentResult.success && deploymentResult.canisterId && (
                  <div className="deployed-canister-info">
                    <p><strong>Canister ID:</strong> {deploymentResult.canisterId}</p>
                    <a 
                      href={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=${deploymentResult.canisterId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-canister-btn"
                    >
                      View Canister
                    </a>
                  </div>
                )}
              </div>
            )}
            <DeploymentForm onDeploy={handleDeploy} isDeploying={isDeploying} />
          </div>
        )}

        {activeView === 'manage' && (
          <CanistersList canisters={canisters} onRefresh={loadData} />
        )}
      </div>
    </div>
  );
};

export default Factory;
