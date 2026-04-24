const AnnouncementBar = () => {
  const text = "10% OFF YOUR FIRST ORDER \u2726 USE CODE NAIRA10";

  return (
    <div
      className="pause-animation w-full overflow-hidden"
      style={{ backgroundColor: "#AEBDB6", height: "var(--announcement-h)" }}
    >
      <div className="flex items-center h-full">
        <div className="animate-marquee flex shrink-0 items-center whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="font-cormorant text-[11px] md:text-[12px] lg:text-[13px] font-medium uppercase tracking-[0.18em] px-8"
              style={{ color: "#FFFFFF" }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
