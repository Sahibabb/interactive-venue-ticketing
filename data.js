const venue = {
    name: "Baku Grand Theatre",
    currency: "AZN",
    sections: [
        {
          id: "vip",
          name: "VIP",
          rows: 4,
          seatsPerRow: 10,
          price: 50,
          color: "#d4a017"
        },
        {
          id: "standard",
          name: "Standard",
          rows: 8,
          seatsPerRow: 14,
          price: 30,
          color: "#2e86de"
        },
        {
          id: "balcony",
          name: "Balcony",
          rows: 6,
          seatsPerRow: 18,
          price: 15,
          color: "#27ae60"
        }
      ],
      unavailableSeats: [
        "vip-A-3",
        "vip-A-4",
        "vip-B-5",
        "standard-C-7",
        "standard-C-8",
        "standard-E-2",
        "balcony-A-10",
        "balcony-D-1",
        "balcony-F-18"
      ]
    };    