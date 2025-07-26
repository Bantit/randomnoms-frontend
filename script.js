function searchByMoodAndLocation(mood) {
  const zip = zipInput.value.trim();
  output.innerHTML = `<p>Fetching Randy’s picks...</p>`;

  // ZIP provided
  if (zip) {
    fetch('https://randomnoms-backend.onrender.com/api/mood-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, zip })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`API responded with ${res.status}`);
        }
        return res.json();
      })
      .then(displayMoodResults)
      .catch(err => {
        console.error("ZIP fetch error:", err);
        output.innerHTML = `<p>🐶 Something went wrong. Try again!</p>`;
      });

    // No ZIP? Try geolocation
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetch('https://randomnoms-backend.onrender.com/api/mood-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mood,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`API responded with ${res.status}`);
            }
            return res.json();
          })
          .then(displayMoodResults)
          .catch(err => {
            console.error("Geo fallback error:", err);
            output.innerHTML = `<p>🐾 Randy got lost trying to find you.</p>`;
          });
      },
      () => {
        output.innerHTML = `<p>📍 Please enable location or enter a ZIP code.</p>`;
      }
    );
  } else {
    output.innerHTML = `<p>📍 Please enable location or enter a ZIP code.</p>`;
  }
}
