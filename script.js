const seatMap = document.getElementById("seat-map");
const statusMessage = document.getElementById("status-message");
const seatDetails = document.getElementById("seat-details");

const seatsById = {};

let inspectedSeatId = null;

function rowLetter(index) {
  return String.fromCharCode(65 + index);
}

function createSeat(section, rowName, seatNumber) {
  const seatId = section.id + "-" + rowName + "-" + seatNumber;
  const isUnavailable = venue.unavailableSeats.includes(seatId);

  seatsById[seatId] = {
    id: seatId,
    sectionName: section.name,
    row: rowName,
    number: seatNumber,
    price: section.price,
    unavailable: isUnavailable
  };

  const seat = document.createElement("button");
  seat.type = "button";
  seat.className = "seat";
  seat.textContent = seatNumber;
  seat.dataset.id = seatId;
  seat.style.setProperty("--seat-color", section.color);

  if (isUnavailable) {
    seat.classList.add("unavailable");
  }

  seat.addEventListener("click", function () {
    inspectSeat(seatId);
  });

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

function showSeatDetails(seat) {
  let statusText = "Available";
  let statusClass = "status-available";

  if (seat.unavailable) {
    statusText = "Unavailable (sold)";
    statusClass = "status-unavailable";
  }

  seatDetails.innerHTML = `
    <p class="detail-line"><strong>Section:</strong> ${seat.sectionName}</p>
    <p class="detail-line"><strong>Row:</strong> ${seat.row}</p>
    <p class="detail-line"><strong>Seat:</strong> ${seat.number}</p>
    <p class="detail-line detail-price">${seat.price} ${venue.currency}</p>
    <p class="detail-line"><strong>Status:</strong> <span class="${statusClass}">${statusText}</span></p>
  `;
}

function inspectSeat(seatId) {
  const previousButton = seatMap.querySelector(".seat.inspected");
  if (previousButton) {
    previousButton.classList.remove("inspected");
  }

  const newButton = seatMap.querySelector('[data-id="' + seatId + '"]');
  newButton.classList.add("inspected");

  inspectedSeatId = seatId;
  showSeatDetails(seatsById[seatId]);
}

let totalSeats = 0;

for (const section of venue.sections) {
  seatMap.appendChild(createSection(section));
  totalSeats = totalSeats + section.rows * section.seatsPerRow;
}

statusMessage.textContent =
  venue.name + " - total seats: " + totalSeats + ". Click a seat to inspect it.";