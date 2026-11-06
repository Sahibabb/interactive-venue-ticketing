let totalSeats = 0;

for (const section of venue.sections) {
  totalSeats = totalSeats + section.rows * section.seatsPerRow;
}

document.getElementById("status").textContent =
  "Venue: " + venue.name + " - total seats: " + totalSeats;


