const API_URL = "http://localhost:8000";

function getUrl(route: string) {
  return `${API_URL}${route}`;
}

function getFunkyGreeting() {
  const hours = new Date().getHours();
  let greeting = "";

  if (hours >= 5 && hours < 12) {
    const morningVibes = [
      "🌞 Good Morning Sunshine!",
      "☕ Rise and Shine!",
      "🌅 Morning Vibes Only!",
    ];
    greeting = morningVibes[Math.floor(Math.random() * morningVibes.length)];
  } else if (hours >= 12 && hours < 17) {
    const afternoonVibes = [
      "🌞 Good Afternoon Champ!",
      "🍹 Afternoon Chill Mode!",
      "🔥 Keep Rockin’ this Afternoon!",
    ];
    greeting =
      afternoonVibes[Math.floor(Math.random() * afternoonVibes.length)];
  } else if (hours >= 17 && hours < 21) {
    const eveningVibes = [
      "🌇 Good Evening Legend!",
      "🍷 Evening Bliss Awaits!",
      "✨ Chill Evening Energy!",
    ];
    greeting = eveningVibes[Math.floor(Math.random() * eveningVibes.length)];
  } else {
    const nightVibes = [
      "🌙 Good Night Rockstar!",
      "😴 Sleep Tight, Code Bright!",
      "💤 Night Mode: Activated!",
    ];
    greeting = nightVibes[Math.floor(Math.random() * nightVibes.length)];
  }

  return greeting;
}

function formatTimeWithAmPm(
  timestamp: Date | number | string,
  showSeconds: boolean = false,
  lowercaseAmPm: boolean = false
): string {
  // Ensure timestamp is a Date object
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  if (showSeconds) {
    options.second = "2-digit";
  }

  let timeString = date.toLocaleTimeString("en-US", options);

  if (lowercaseAmPm) {
    timeString = timeString.replace("AM", "am").replace("PM", "pm");
  }

  return timeString;
}

export { getFunkyGreeting, getUrl, formatTimeWithAmPm };
