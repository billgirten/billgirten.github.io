export function watchPosition(onSuccess, onError) {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    onError && onError(new Error("Geolocation not supported"));
    return null;
  }

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      onSuccess({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      });
    },
    (err) => {
      onError && onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  );

  return id;
}

export function clearWatch(id) {
  if (id != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(id);
  }
}