import React, { useState, useEffect } from 'react';
import { createicrc1Actor } from "../ic/icpswap/icrc1/index.js";

export default function TokenIcon({ 
  tokenCanisterId, 
  size = "w-5 h-5", 
  className = "", 
  showFallback = true 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokenCanisterId) {
      fetchTokenLogo(tokenCanisterId);
    }
  }, [tokenCanisterId]);

  const fetchTokenLogo = async (canisterId) => {
    console.log("logo token")
    try {
      let actor = createicrc1Actor(canisterId)

      const metadata = await actor.icrc1_metadata();
      console.log("metadata", metadata)
      // Look for logo in metadata
      const logoEntry = metadata.find(([key]) => key === 'icrc1:logo');
      console.log("logo entry", logoEntry)
      if (logoEntry && logoEntry[1].Text) {
        // If logo is a data URL or HTTP URL, use it directly
        const logoData = logoEntry[1].Text;
        if (logoData.startsWith('data:') || logoData.startsWith('http')) {
          setLogoUrl(logoData);
        } else {
          // If it's base64 encoded, create a data URL
          setLogoUrl(`data:image/svg+xml;base64,${logoData}`);
        }
      } else {
        // Fallback to ICPSwap URL if no logo in metadata
        setLogoUrl(`https://app.icpswap.com/images/tokens/${canisterId}.svg`);
      }
    } catch (error) {
      console.log(`Could not fetch metadata for ${canisterId}, using fallback:`, error);
      // Fallback to ICPSwap URL on error
      setLogoUrl(`https://app.icpswap.com/images/tokens/${canisterId}.svg`);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackText = (canisterId) => {
    const tokenMap = {
      'ryjl3-tyaaa-aaaaa-aaaba-cai': 'ICP',
      '4zmwe-paaaa-aaaam-qdwxa-cai': 'DV',
      'icaf7-3aaaa-aaaam-qcx3q-cai': 'RG',
      '7pail-xaaaa-aaaas-aabmq-cai': 'BOB',
      'iwv6l-6iaaa-aaaal-ajjjq-cai': 'CL',
      '6yaih-jyaaa-aaaab-aaxia-cai': 'VL'
    };
    return tokenMap[canisterId?.toString()] || '?';
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Show loading state while fetching metadata
  if (loading) {
    return (
      <div className={`${size} ${className} rounded-full bg-gray-200 flex items-center justify-center animate-pulse`}>
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
      </div>
    );
  }

  // Show fallback if no logo URL or error occurred
  if (imageError || !logoUrl || !tokenCanisterId) {
    if (!showFallback) return null;
    
    return (
      <div className={`${size} ${className} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs`}>
        {getFallbackText(tokenCanisterId)}
      </div>
    );
  }

  return (
    <div className={`${size} ${className} relative`}>
      {!imageLoaded && showFallback && (
        <div className={`${size} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs absolute inset-0`}>
          {getFallbackText(tokenCanisterId)}
        </div>
      )}
      <img
        src={logoUrl}
        alt={`${getFallbackText(tokenCanisterId)} token`}
        className={`${size} rounded-full object-cover transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
}
