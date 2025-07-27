const foodOptions = [
  "Pizza", "Sushi", "Burgers", "Tacos", "BBQ", "Steak", "Chinese", "Thai",
  "Indian", "Mexican", "Italian", "Seafood", "Sandwiches", "Ramen", "Pho",
  "Korean", "Breakfast", "Brunch", "Desserts", "Ice Cream", "Coffee",
  "Bubble Tea", "Vegan", "Vegetarian", "Healthy", "Wings", "Salads",
  "Fried Chicken", "Food Trucks", "Bakery"
];

document.addEventListener("DOMContentLoaded", function () {
  const foodSelect = document.getElementById("foodDropdown");
  const radiusSelect = document.getElementById("radiusDropdown");
  const output = document.getElementById("output");
  const zipInput = document.getElementById("zip");

  // Populate dropdown
  foodOptions.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    foodSelect.appendChild(opt);
  });

  // Init Choices.js
  const choices = new Choices(foodSelect, {
    removeItemButton: true,
    placeholderValue: "Select food categories",
    searchEnabled: true
  });


  async function searchByMoodAndZip(mood, zip) {
  const output = document.getElementById('output');

  try {
    const response = await fetch('https://randomnoms-backend.onrender.com/api/mood-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mood, zip })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.length) {
      output.innerHTML = "No results found.";
    } else {
      output.innerHTML = data.map(place => `<p>${place.name}</p>`).join('');
    }
  } catch (error) {
    console.error("Geo fallback error:", error);
    output.innerHTML = "Something went wrong. Try another zip.";
  }
}


  // ⭐ NEW: helper for star PNG
  function getStarImage(rating) {
    const rounded = Math.round(rating * 2) / 2;
    return `/images/stars/${rounded}.png`;
  }

  // 🎲 Let Randy Randomize button
  document.getElementById("randomizeButton").addEventListener("click", () => {
    const selectedFoods = Array.from(foodSelect.selectedOptions).map(opt => opt.value);
    const selectedRadius = radiusSelect.value;

    if (selectedFoods.length === 0) {
      output.textContent = "🐶 Randy says: Pick at least one food category!";
      return;
    }

    if (!navigator.geolocation) {
      output.textContent = "⚠️ Geolocation not supported by your browser.";
      return;
    }

    output.textContent = "🐾 Randy is sniffing out some noms near you...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch('https://randomnoms-backend.onrender.com/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: lat,
            longitude: lon,
            radius: selectedRadius,
            categories: selectedFoods
          })
        })
        .then(res => res.json())
        .then(data => {
          const businesses = data.businesses;

          if (!businesses || businesses.length === 0) {
            output.textContent = "😕 Randy couldn't find anything nearby. Try adding more categories or widening your radius!";
            return;
          }

          const randomPick = businesses[Math.floor(Math.random() * businesses.length)];

          // ⭐ UPDATED: use star PNGs
          output.innerHTML = `
            <strong>🎯 Randy picked: ${randomPick.name}</strong><br>
            📍 ${randomPick.location.address1 || 'Address not available'}<br>
            <div class="rating-wrapper">
              <img src="${getStarImage(randomPick.rating)}" alt="${randomPick.rating} stars" />
              <img src="/images/yelp-logo.png" alt="Yelp logo" style="height: 20px;" />
            </div>
            <a href="${randomPick.url}" target="_blank">View on Yelp</a>
          `;
        })
        .catch(err => {
          console.error("Fetch error:", err);
          output.textContent = "🐶 Randy hit a snag trying to fetch noms.";
        });
      },
      () => {
        output.textContent = "📍 Randy couldn't get your location. Try again!";
      }
    );
  });

  // 🎭 Mood Filter Buttons (ZIP or Geolocation)
  document.querySelectorAll('#mood-buttons button').forEach(button => {
    button.addEventListener('click', () => {
      const mood = button.dataset.mood;
      searchByMoodAndLocation(mood);
    });
  });

  // 🔍 ZIP-only Search Button
  document.getElementById("use-zip").addEventListener("click", () => {
    const zip = zipInput.value.trim();
    if (!zip) {
      output.innerHTML = `<p>Please enter a ZIP code.</p>`;
      return;
    }

    searchByMoodAndZip("random", zip); // Default to random mood if ZIP only
  });

  // 🧠 Fetch mood using ZIP or geolocation
  function searchByMoodAndLocation(mood) {
    const zip = zipInput.value.trim();
    output.innerHTML = `<p>Fetching Randy’s picks...</p>`;


 function searchByMoodAndLocation(mood) {
  const zip = zipInput.value.trim();
  output.innerHTML = `<p>Fetching Randy’s picks...</p>`;

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




    // ZIP provided
    if (zip) {
      fetch('/api/mood-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, zip })
      })
      .then(res => res.json())
      .then(displayMoodResults)
      .catch(err => {
        console.error("ZIP fetch error:", err);
        output.innerHTML = `<p>🐶 Something went wrong. Try again!</p>`;
      });

    // No ZIP? Try geolocation
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetch('/api/mood-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mood,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          })
          .then(res => res.json())
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

  // 📦 Show mood-based results
  function displayMoodResults(businesses) {
    if (!businesses.length) {
      output.innerHTML = `<p>No results found for that mood & ZIP!</p>`;
      return;
    }

    output.innerHTML = '';
    businesses.forEach(biz => {
      const card = document.createElement('div');
      card.classList.add('result');

      // ⭐ UPDATED: use star PNGs
      card.innerHTML = `
        <strong>${biz.name}</strong><br />
        ${biz.location.address1 || ''}, ${biz.location.city}<br />
        <div class="rating-wrapper">
          <img src="${getStarImage(biz.rating)}" alt="${biz.rating} stars" />
          <img src="/images/yelp-logo.png" alt="Yelp logo" style="height: 20px;" />
        </div>
        ${biz.price || 'Price unlisted'}<br />
        <a href="${biz.url}" target="_blank">View on Yelp</a>
      `;
      output.appendChild(card);
    });
  }
});
