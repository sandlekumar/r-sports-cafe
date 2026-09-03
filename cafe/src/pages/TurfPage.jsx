import React from 'react';
import Turf from '../components/Turf.jsx';
import SmoothScroll from '../components/SmoothScroll.jsx';
import SEO from '../components/SEO.jsx';

export default function TurfPage() {
  return (
    <>
      <SEO
        title="Turf Booking in Thoothukudi | R Sports & Cafe"
        description="Book your sports turf in Thoothukudi at R Sports & Cafe. Choose your preferred time, gather your team and enjoy your game."
        canonical="/turf"
      />
      <SmoothScroll>
        <Turf />
      </SmoothScroll>
    </>
  );
}

