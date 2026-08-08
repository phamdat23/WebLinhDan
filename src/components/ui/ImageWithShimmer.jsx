import React, { useState } from 'react';
import './ImageWithShimmer.css';

export const ImageWithShimmer = ({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  style = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`shimmer-img-wrapper ${wrapperClassName}`}>
      {!isLoaded && !hasError && <div className="shimmer-placeholder-overlay" />}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'shimmer-img-loaded' : 'shimmer-img-loading'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setHasError(true);
        }}
        style={style}
        {...props}
      />
    </div>
  );
};

export default ImageWithShimmer;
