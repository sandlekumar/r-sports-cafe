import { Helmet } from "react-helmet-async";

const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["CafeOrCoffeeShop", "Restaurant"],

    name: "R SPORTS & CAFE",

    url: "https://rsportscafe.com",

    telephone: "+917358585151",

    address: {
      "@type": "PostalAddress",
      streetAddress: "SNR Nagar, 4/4, Caldwell Colony",
      addressLocality: "Thoothukudi",
      addressRegion: "Tamil Nadu",
      postalCode: "628003",
      addressCountry: "IN"
    },

    geo: {
      "@type": "GeoCoordinates",
      latitude: 8.7859027,
      longitude: 78.1408559
    },

    hasMap:
      "https://www.google.com/maps/place/R+SPORTS+%26+CAFE/@8.7912405,78.1450406,15z/data=!4m6!3m5!1s0x3b03ef5a831e4fcb:0x6d5a035b4757c634!8m2!3d8.7859027!4d78.1408559!16s%2Fg%2F11nhm7b7hs",

    priceRange: "₹400–₹1,600",

    servesCuisine: [
      "Cafe",
      "Continental",
      "Coffee",
      "Pizza",
      "Desserts"
    ],

    image: "https://rsportscafe.com/r-sports-cafe-thoothukudi.jpg",

    description:
      "R Sports & Cafe in Thoothukudi combines a premium cafe, food, coffee, desserts and sports facilities in one destination.",

    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        opens: "11:00",
        closes: "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "11:00",
        closes: "23:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:30",
        closes: "23:00"
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default LocalBusinessSchema;
