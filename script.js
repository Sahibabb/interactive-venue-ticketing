const seatMap = document.getElementById("seat-map");
const statusMessage = document.getElementById("status-message");
function rowLetter(index) {
    return String.fromCharCode(65 + index);
  }
  function createSeat(section, rowName, seatNumber) {
    const seatId = section.id + "-" + rowName + "-" + seatNumber;
  
    const seat = document.createElement("button");
    seat.type = "button";
    seat.className = "seat";
    seat.textContent = seatNumber;
    seat.dataset.id = seatId;
    seat.style.setProperty("--seat-color", section.color);
    seat.title = section.name + " - Row " + rowName + ", Seat " + seatNumber;
  
    if (venue.unavailableSeats.includes(seatId)) {
      seat.classList.add("unavailable");
    }
  
    return seat;
  }
  function createRow(section, rowIndex) {
    const rowName = rowLetter(rowIndex);
  
    const row = document.createElement("div");
    row.className = "row";
  
    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = rowName;
    row.appendChild(label);
  
    for (let number = 1; number <= section.seatsPerRow; number++) {
      row.appendChild(createSeat(section, rowName, number));
    }
  
    return row;
  }
  function createSection(section) {
    const sectionBox = document.createElement("div");
    sectionBox.className = "section";
  
    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = section.name + " - " + section.price + " " + venue.currency;
    sectionBox.appendChild(title);
  
    for (let rowIndex = 0; rowIndex < section.rows; rowIndex++) {
      sectionBox.appendChild(createRow(section, rowIndex));
    }
  
    return sectionBox;
  }
  let totalSeats = 0;

for (const section of venue.sections) {
  seatMap.appendChild(createSection(section));
  totalSeats = totalSeats + section.rows * section.seatsPerRow;
}

statusMessage.textContent =
  venue.name + " - total seats: " + totalSeats + " (click a seat later to inspect it)";
        