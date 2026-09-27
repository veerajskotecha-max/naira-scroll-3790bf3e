/*
  Structured data (JSON-LD) for Google, rendered in the page body.

  Not through <Helmet>: when the price changed after first render — the
  pre-built page's price giving way to Shopify's live one — Helmet added a
  second Product block and never removed the first. 17 of 55 product pages
  carried two prices this way (Molten Bloom Hoops: ₹2,949 and ₹1,300). In the
  body, React updates the one block in place. Google reads JSON-LD anywhere on
  the page. "<" is escaped so no text can close the script early.
*/
const JsonLd = ({ data }: { data: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
  />
);

export default JsonLd;
