import React from 'react';
import '../App.css';

export const ErrorBoundry = ({ isNotFound }) => {
  return (
    <>
      {isNotFound ? (
        <div className='flexWrapper'>
          <div className='text-xl'>404</div>
          <p className='text-md'>Oops! Page not found.</p>
        </div>
      ) : (
        <div className='flexWrapper'>
          <div className='text-xl'>404</div>
          <p className='text-md'>Oops! User not found.</p>
        </div>
      )}
    </>
  )
}

