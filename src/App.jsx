import { useState, useRef, useEffect } from "react";

import { signUpUser, signInUser, getCurrentUser, signOutUser, createFund, loadFundBySlug, loadFundsByCreator, getContributions, updateContributionStatus, recordContribution } from "./supabaseClient";

// ============================================================
// DESIGN TOKENS
// ============================================================
const T = {
  color: {
    primary: "#191919",
    white: "#FFFFFF",
    green: "#E7FD57",
    neutral300: "#E8E8E8",
    neutral500: "#B9B9B9",
    neutral700: "#606763",
  },
  font: {
    heading: "'Rubik', sans-serif",
    body: "'Rubik', sans-serif",
  },
  radius: { circle: 999, card: 16, input: 8 },
  shadow: { card: "0 0 8px rgba(0,0,0,0.2)" },
  gradient: {
    bg: "radial-gradient(ellipse at 0% 0%, rgba(255,200,180,0.35) 0%, transparent 55%), radial-gradient(ellipse at 100% 0%, rgba(200,245,200,0.35) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(200,225,255,0.35) 0%, transparent 55%), #FFFFFF",
  },
};

// ============================================================
// SVG ICONS
// ============================================================
const ArrowBackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
    <path d="M1 6L6 11L15 1" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const GalleryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={T.color.primary} strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill={T.color.primary} />
    <path d="M21 15L16 10L5 21" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Payment method logo icons (matching Figma)
const LogoCashApp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#00D632" />
    <path d="M15.09 8.04c-.36-.36-.81-.6-1.35-.72l-.96-.2c-.57-.12-.84-.36-.84-.72 0-.42.36-.72.96-.72.54 0 .96.18 1.26.54.12.12.24.18.42.18h.48c.24 0 .42-.18.36-.42-.24-.72-.84-1.26-1.62-1.44v-.6c0-.24-.18-.42-.42-.42h-.36c-.24 0-.42.18-.42.42v.6c-1.02.24-1.68.96-1.68 1.86 0 1.02.72 1.62 1.74 1.86l.96.2c.6.12.9.42.9.78s-.42.78-1.08.78c-.6 0-1.08-.24-1.38-.66-.12-.12-.24-.24-.42-.24h-.48c-.24 0-.42.24-.36.42.3.78.96 1.38 1.8 1.56v.6c0 .24.18.42.42.42h.36c.24 0 .42-.18.42-.42v-.6c1.08-.24 1.8-1.02 1.8-1.98 0-1.02-.66-1.62-1.8-1.88z" fill="white" />
  </svg>
);

const LogoVenmo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#008CFF" />
    <path d="M16.2 5.4c.36.6.54 1.2.54 1.98 0 2.46-2.1 5.64-3.84 7.86H9.6L8.4 6.18l2.82-.3.66 5.34c.6-1.02 1.38-2.64 1.38-3.72 0-.72-.12-1.2-.36-1.62l2.3-.48z" fill="white" />
  </svg>
);

const LogoZelle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#6D1ED4" />
    <path d="M15 7.5V9H11.1L15 14.1V16.5H9V15H12.9L9 9.9V7.5H15Z" fill="white" />
  </svg>
);

const GiveIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Heart */}
    <path d="M12 5.5C12 5.5 11.4 4.2 10 3.5C8.6 2.8 6.8 3.1 5.8 4.3C4.8 5.5 4.9 7.3 6.2 8.7C7.5 10.1 12 13.5 12 13.5C12 13.5 16.5 10.1 17.8 8.7C19.1 7.3 19.2 5.5 18.2 4.3C17.2 3.1 15.4 2.8 14 3.5C12.6 4.2 12 5.5 12 5.5Z" fill={T.color.primary} />
    {/* Cupped hand */}
    <path d="M3.5 21L7.5 21L10.5 17.5H15C15.8 17.5 16.5 16.8 16.5 16C16.5 15.2 15.8 14.5 15 14.5H10.5" stroke={T.color.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 16L20 14" stroke={T.color.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.5 18.5V22H4.5V18.5H1.5Z" fill={T.color.primary} stroke={T.color.primary} strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

// ============================================================
// SHARED COMPONENTS
// ============================================================

// --- Swipe Button ---
function SwipeButton({ text = "Swipe to give", onSwipeComplete, disabled = false }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [completed, setCompleted] = useState(false);
  const thumbSize = 56;

  const getMaxX = () => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - thumbSize;
  };

  const handleStart = (clientX) => {
    if (completed || disabled) return;
    setDragging(true);
  };

  const handleMove = (clientX) => {
    if (!dragging || completed) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left - thumbSize / 2;
    const maxX = getMaxX();
    setOffsetX(Math.max(0, Math.min(x, maxX)));
  };

  const handleEnd = () => {
    if (!dragging || completed) return;
    setDragging(false);
    const maxX = getMaxX();
    if (offsetX > maxX * 0.75) {
      setOffsetX(maxX);
      setCompleted(true);
      setTimeout(() => {
        if (onSwipeComplete) onSwipeComplete();
      }, 300);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div
      ref={trackRef}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={() => { if (dragging) handleEnd(); }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      style={{
        position: "relative",
        width: "100%", height: 56, borderRadius: T.radius.circle,
        background: disabled ? T.color.neutral300 : "#f4ffaa",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "grab", userSelect: "none",
        touchAction: "none",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.2s ease, opacity 0.2s ease",
      }}
    >
      {/* Thumb */}
      <div style={{
        position: "absolute", left: offsetX, top: 0,
        width: thumbSize, height: thumbSize,
        borderRadius: 16,
        background: disabled ? T.color.neutral300 : T.color.green,
        border: disabled ? `1px solid ${T.color.neutral500}` : "1px solid #c2df00",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2,
        transition: dragging ? "none" : "left 0.3s ease, background 0.2s ease",
      }}>
        <GiveIcon />
      </div>
      {/* Label */}
      <span style={{
        fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
        color: T.color.primary, zIndex: 1,
        opacity: completed ? 0 : 1, transition: "opacity 0.2s ease",
      }}>
        {completed ? "Sent!" : text}
      </span>
    </div>
  );
}

// --- Progress Indicator ---
/*
  ProgressIndicator — matches Figma exactly.

  Layout: always 3 node positions + 2 connecting bars.
    [LEFT node]  ——bar——  [CENTER node + label]  ——bar——  [RIGHT node]

  activeStep 1 (Who):   [hidden]  ———  [① "Who"]  ———  [②]
  activeStep 2 (What):  [①]  ===filled===  [② "What"]  ———  [③]
  activeStep 3 (Goal):  [②]  ===filled===  [③ "Goal"]  ———  [✓]

  - Center node is always the current step with its label underneath.
  - Left bar is filled when the left node is visible (steps 2 & 3).
  - Right bar is always unfilled.
  - The checkmark node (step 3's right) has a green background.
*/
function ProgressIndicator({ activeStep }) {
  const STEPS = {
    1: { leftNum: null, centerNum: 1, centerLabel: "Who", rightNum: 2, rightIsCheck: false },
    2: { leftNum: 1,    centerNum: 2, centerLabel: "What", rightNum: 3, rightIsCheck: false },
    3: { leftNum: 2,    centerNum: 3, centerLabel: "Goal", rightNum: null, rightIsCheck: true },
  };

  const cfg = STEPS[activeStep] || STEPS[1];
  const leftVisible = cfg.leftNum !== null;
  const leftBarFill = leftVisible ? 100 : 0;

  // Circle styles
  const circleBase = {
    width: 24, height: 24, borderRadius: T.radius.circle,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
  const numStyle = { fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.white };

  const renderCircle = (num, isCheck = false) => (
    <div style={{
      ...circleBase,
      backgroundColor: isCheck ? T.color.green : T.color.primary,
    }}>
      {isCheck ? <CheckIcon /> : <span style={numStyle}>{num}</span>}
    </div>
  );

  const renderBar = (fill) => (
    <div style={{ flex: 1, height: 2, backgroundColor: T.color.neutral300, borderRadius: 1, position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: `${fill}%`, backgroundColor: T.color.primary,
        borderRadius: 1, transition: "width 0.4s ease",
      }} />
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 343, padding: "0 16px", boxSizing: "border-box" }}>
      {/* LEFT node */}
      <div style={{ opacity: leftVisible ? 1 : 0, flexShrink: 0 }}>
        {renderCircle(cfg.leftNum || 0)}
      </div>

      {/* LEFT bar */}
      {renderBar(leftBarFill)}

      {/* CENTER node + label — label sits below, circle stays aligned with bars */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0, position: "relative" }}>
        {renderCircle(cfg.centerNum)}
        <span style={{
          fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
          whiteSpace: "nowrap", position: "absolute", top: "100%", marginTop: 2,
        }}>
          {cfg.centerLabel}
        </span>
      </div>

      {/* RIGHT bar */}
      {renderBar(0)}

      {/* RIGHT node */}
      <div style={{ flexShrink: 0 }}>
        {renderCircle(cfg.rightNum || 0, cfg.rightIsCheck)}
      </div>
    </div>
  );
}

// --- Input Field ---
function InputField({ label, value, onChange, type = "text", multiline = false, characterCount = false, maxChars = 1000, focused = false }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value && value.length > 0;
  const showFloatingLabel = hasValue || isFocused;
  const borderColor = (isFocused || focused) ? T.color.green : T.color.neutral500;
  const borderWidth = (isFocused || focused) ? 2 : 1;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const sharedStyle = {
    fontFamily: T.font.body, fontWeight: 400, fontSize: showFloatingLabel ? 16 : 20,
    lineHeight: 1.6, color: T.color.primary, border: "none", outline: "none",
    backgroundColor: "transparent", width: "100%", resize: "none", padding: 0,
  };

  return (
    <div style={{ width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        backgroundColor: T.color.white, border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: T.radius.input, padding: 12, display: "flex", flexDirection: "column",
        minHeight: multiline ? 180 : 56, justifyContent: multiline ? "flex-start" : "center",
        boxSizing: "border-box", transition: "border-color 0.2s ease",
        position: "relative",
      }}>
        {showFloatingLabel && (
          <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>{label}</span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={!showFloatingLabel ? label : ""}
            maxLength={maxChars}
            style={{ ...sharedStyle, flex: 1, minHeight: 100 }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type={inputType}
              value={value}
              onChange={e => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={!showFloatingLabel ? label : ""}
              style={{ ...sharedStyle, flex: 1, height: showFloatingLabel ? "auto" : "100%" }}
            />
            {isPassword && hasValue && (
              <button
                onClick={() => setShowPassword(s => !s)}
                type="button"
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontFamily: T.font.body, fontSize: 12, fontWeight: 500, lineHeight: 1.4,
                  color: T.color.neutral700, whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            )}
          </div>
        )}
      </div>
      {characterCount && (
        <p style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700, textAlign: "right", margin: 0 }}>
          {(value || "").length}/{maxChars} characters
        </p>
      )}
    </div>
  );
}

// --- Primary Button ---
function ButtonPrimary({ text, onClick, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", maxWidth: 343, height: 60, borderRadius: T.radius.circle,
      background: "linear-gradient(to right, #d6ff76, #eafe7e)",
      opacity: disabled ? 0.2 : 1,
      color: T.color.primary, border: "none", cursor: disabled ? "default" : "pointer",
      fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "opacity 0.2s ease",
    }}>
      {text}
    </button>
  );
}

// --- Mega Selection Button ---
function ButtonMega({ title, description, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", gap: 10, alignItems: "center", padding: 16,
      height: 112, width: "100%", maxWidth: 343,
      backgroundColor: T.color.white, borderRadius: T.radius.card,
      border: selected ? `2px solid ${T.color.primary}` : "none",
      boxShadow: T.shadow.card, cursor: "pointer", textAlign: "left",
      transition: "box-shadow 0.2s ease, border 0.2s ease", boxSizing: "border-box",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: T.radius.card, backgroundColor: T.color.neutral300,
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
        <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>{title}</p>
        <p style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>{description}</p>
      </div>
    </button>
  );
}

// --- Screen Layout Wrapper ---
function ScreenLayout({ children, onBack, activeStep, bottomContent, gap = 32 }) {
  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column", gap,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, paddingTop: 80, paddingBottom: 60, boxSizing: "border-box",
    }}>
      {/* Back Arrow */}
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 16px", alignSelf: "flex-start" }} aria-label="Go back">
        <ArrowBackIcon />
      </button>

      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ProgressIndicator activeStep={activeStep} />
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 48, padding: "0 16px", boxSizing: "border-box" }}>
        {children}
      </div>

      {/* Bottom CTA */}
      {bottomContent && (
        <div style={{ padding: "0 16px", boxSizing: "border-box" }}>
          {bottomContent}
        </div>
      )}
    </div>
  );
}

// --- Headline ---
function Headline({ subtitle, title, body, align = "center" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: align, alignItems: align === "center" ? "center" : "flex-start", width: "100%" }}>
      {subtitle && (
        <h2 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 24, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>{subtitle}</h2>
      )}
      {title && (
        <h1 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>{title}</h1>
      )}
      {body && (
        <p style={{ fontFamily: T.font.body, fontWeight: 400, fontSize: 16, lineHeight: 1.6, color: T.color.neutral700, margin: 0, textAlign: "left", width: "100%" }}>{body}</p>
      )}
    </div>
  );
}


// ============================================================
// SCREEN: Setup a Summa Fund - 0
// ============================================================
function SetupASummaFund0({ data, setData, onNext, onBack, goTo }) {
  const handleSelect = (choice) => {
    setData(d => ({ ...d, fundFor: choice }));
    // Navigate directly — avoids stale closure on data.fundFor
    setTimeout(() => goTo(choice === "myself" ? 1 : 2), 300);
  };

  return (
    <ScreenLayout onBack={onBack} activeStep={1}>
      <Headline subtitle="First thing's first 🫡" title="Who will this Summa fund be for?" />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ButtonMega
          title="Myself"
          description="I am creating a Summa Fund to raise money for my own goals"
          selected={data.fundFor === "myself"}
          onClick={() => handleSelect("myself")}
        />
        <ButtonMega
          title="Someone I care for"
          description="I am setting up a Summa Fund on behalf of someone else"
          selected={data.fundFor === "someone"}
          onClick={() => handleSelect("someone")}
        />
      </div>
    </ScreenLayout>
  );
}

// ============================================================
// SCREEN: Setup a Summa Fund - 1a - Who - Myself
// ============================================================
function SetupASummaFund1aWhoMyself({ data, setData, onNext, onBack }) {
  return (
    <ScreenLayout
      onBack={onBack} activeStep={1}      bottomContent={
        <ButtonPrimary text="Continue" onClick={onNext} disabled={!data.firstName} />
      }
    >
      <Headline title="What's your name?" align="left" />
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        <InputField label="First Name" value={data.firstName} onChange={v => setData(d => ({ ...d, firstName: v }))} />
        <InputField label="Last Name" value={data.lastName} onChange={v => setData(d => ({ ...d, lastName: v }))} />
      </div>
    </ScreenLayout>
  );
}

// ============================================================
// SCREEN: Setup a Summa Fund - 1b - Who - Someone I care for
// ============================================================
function SetupASummaFund1bWhoSomeone({ data, setData, onNext, onBack }) {
  return (
    <ScreenLayout
      onBack={onBack} activeStep={1}      bottomContent={
        <ButtonPrimary text="Continue" onClick={onNext} disabled={!data.recipientName} />
      }
    >
      <Headline title="What's their name?" align="left" />
      <InputField label="First Name" value={data.recipientName} onChange={v => setData(d => ({ ...d, recipientName: v }))} />
    </ScreenLayout>
  );
}

// ============================================================
// SCREEN: Setup a Summa Fund - 2
// ============================================================
function SetupASummaFund2({ data, setData, onNext, onBack }) {
  return (
    <ScreenLayout
      onBack={onBack} activeStep={2}
      bottomContent={
        <ButtonPrimary text="Continue" onClick={onNext} disabled={!data.title} />
      }
    >
      <Headline subtitle="Cool 😎" title="Let's create a title for your Summa Fund" />
      <InputField label="Title" value={data.title} onChange={v => setData(d => ({ ...d, title: v }))} />
    </ScreenLayout>
  );
}

// ============================================================
// SCREEN: Setup a Summa Fund - 3
// ============================================================
function SetupASummaFund3({ data, setData, onNext, onBack }) {
  return (
    <ScreenLayout
      onBack={onBack} activeStep={2}      bottomContent={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <ButtonPrimary text="Continue" onClick={onNext} disabled={!data.description} />
          <button onClick={onNext} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
            textDecoration: "underline", padding: 0,
          }}>
            Skip for now
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
        <h2 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 24, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>Nice. 👍</h2>
        <h1 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>What are you raising money for?</h1>
        <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.neutral700, margin: 0, textAlign: "left" }}>
          Introduce yourself and write a description that helps your community understand what the funds will be used for.
        </p>
      </div>
      <div style={{ flex: 1, display: "flex" }}>
        <InputField
          label="Description"
          value={data.description}
          onChange={v => setData(d => ({ ...d, description: v }))}
          multiline
          characterCount
          maxChars={1000}
        />
      </div>
    </ScreenLayout>
  );
}

// ============================================================
// SCREEN: Setup a Summa Fund - 4
// ============================================================
function SetupASummaFund4({ data, setData, onNext, onBack }) {
  const [goalFocused, setGoalFocused] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);
  const dateRef = useRef(null);

  const handleGoalChange = (v) => {
    const num = v.replace(/[^0-9]/g, "");
    setData(d => ({ ...d, goal: num }));
  };

  const hasGoalValue = data.goal && data.goal.length > 0;
  const goalBorderColor = goalFocused ? T.color.green : T.color.neutral500;
  const goalBorderWidth = goalFocused ? 2 : 1;

  // Format the stored date (YYYY-MM-DD) into a readable string
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const hasDateValue = !!data.targetDate;
  const dateBorderColor = dateFocused ? T.color.green : T.color.neutral500;
  const dateBorderWidth = dateFocused ? 2 : 1;

  return (
    <ScreenLayout
      onBack={onBack} activeStep={3} gap={48}
      bottomContent={
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <p style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>You can always change this later!</p>
          <ButtonPrimary text="Let's go!" onClick={onNext} disabled={!data.goal} />
        </div>
      }
    >
      <Headline subtitle="Let's set some goals 💪" title="What is fundraising target for your Summa fund?" />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Goal input with $ prefix */}
        <div style={{ width: "100%", maxWidth: 343 }}>
          <div style={{
            backgroundColor: T.color.white, border: `${goalBorderWidth}px solid ${goalBorderColor}`,
            borderRadius: T.radius.input, padding: 12, display: "flex", flexDirection: "column",
            minHeight: 56, justifyContent: "center", boxSizing: "border-box",
            transition: "border-color 0.2s ease",
          }}>
            {hasGoalValue && (
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>Goal</span>
            )}
            <div style={{ display: "flex", alignItems: "center" }}>
              {hasGoalValue && (
                <span style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>$</span>
              )}
              <input
                type="text"
                inputMode="numeric"
                value={data.goal || ""}
                placeholder={!hasGoalValue ? "Goal" : ""}
                onChange={e => handleGoalChange(e.target.value)}
                onFocus={() => setGoalFocused(true)}
                onBlur={() => setGoalFocused(false)}
                style={{
                  fontFamily: T.font.body, fontSize: hasGoalValue ? 16 : 20, lineHeight: 1.6,
                  color: hasGoalValue ? T.color.primary : T.color.neutral700,
                  border: "none", outline: "none", backgroundColor: "transparent", width: "100%", padding: 0,
                }}
              />
            </div>
          </div>
        </div>

        {/* Target date — native date picker */}
        <div style={{ width: "100%", maxWidth: 343, position: "relative" }}>
          <div style={{
            backgroundColor: T.color.white, border: `${dateBorderWidth}px solid ${dateBorderColor}`,
            borderRadius: T.radius.input, padding: 12, display: "flex", flexDirection: "column",
            minHeight: 56, justifyContent: "center", boxSizing: "border-box",
            transition: "border-color 0.2s ease", position: "relative",
          }}>
            {hasDateValue && (
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>Target date</span>
            )}
            {!hasDateValue && (
              <span style={{
                fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6,
                color: T.color.neutral700, pointerEvents: "none",
              }}>
                Target date
              </span>
            )}
            {hasDateValue && (
              <span style={{
                fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
                color: T.color.primary, pointerEvents: "none",
              }}>
                {formatDate(data.targetDate)}
              </span>
            )}
            {/* Native date input covers entire area */}
            <input
              ref={dateRef}
              type="date"
              value={data.targetDate || ""}
              onChange={e => setData(d => ({ ...d, targetDate: e.target.value }))}
              onFocus={() => setDateFocused(true)}
              onBlur={() => setDateFocused(false)}
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                opacity: 0, cursor: "pointer", zIndex: 1,
              }}
            />
          </div>
        </div>
      </div>
    </ScreenLayout>
  );
}

// ============================================================
// SCREEN: Setup a Summa Fund - 5 - Add cover photo
// ============================================================
function SetupASummaFund5AddCoverPhoto({ data, setData, onNext, onBack }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setData(d => ({ ...d, coverImage: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setData(d => ({ ...d, coverImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ScreenLayout onBack={onBack} activeStep={3} gap={48}
      bottomContent={
        data.coverImage ? (
          <ButtonPrimary text="Continue" onClick={onNext} />
        ) : null
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 24, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>
          Add a cover photo or video
        </h2>
        <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
          If you don't have one ready now, you can always add it later.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {data.coverImage ? (
        /* Preview state */
        <div style={{
          width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
        }}>
          <div style={{
            width: "100%", aspectRatio: "316/178", borderRadius: T.radius.card,
            overflow: "hidden", border: `2px solid ${T.color.green}`, boxSizing: "border-box",
          }}>
            <img src={data.coverImage} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={() => fileInputRef.current?.click()} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
              textDecoration: "underline", padding: 0,
            }}>
              Change photo
            </button>
            <button onClick={removeCover} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
              textDecoration: "underline", padding: 0,
            }}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Upload area */
        <div style={{
          border: `2px solid ${T.color.neutral500}`, borderRadius: T.radius.input,
          padding: 12, display: "flex", flexDirection: "column", gap: 24,
          alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 343,
          boxSizing: "border-box",
        }}>
          <GalleryIcon />
          <p style={{ fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
            Upload photo or video
          </p>
          <ButtonPrimary text="Add media" onClick={() => fileInputRef.current?.click()} />
        </div>
      )}

      {/* Skip link */}
      <button onClick={onNext} style={{
        background: "none", border: "none", cursor: "pointer", alignSelf: "center",
        fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
        textDecoration: "underline", padding: 0,
      }}>
        Skip for now
      </button>
    </ScreenLayout>
  );
}

// ============================================================
// SCREEN: Setup a Summa Fund - 6 - Link Payment Methods
// ============================================================
const LinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UnlinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 7h3a5 5 0 0 1 0 10h-1M9 17H6a5 5 0 0 1 0-10h1" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="2" y1="2" x2="22" y2="22" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CashAppIcon = () => (
  <div style={{ width: 24, height: 24, borderRadius: 5, backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ color: "#00D632", fontSize: 14, fontWeight: 700 }}>$</span>
  </div>
);

const VenmoIcon = () => (
  <div style={{ width: 24, height: 24, borderRadius: 5, backgroundColor: "#008CFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ color: "#FFF", fontSize: 14, fontWeight: 700 }}>V</span>
  </div>
);

const ZelleIcon = () => (
  <div style={{ width: 24, height: 24, borderRadius: 5, backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ color: "#6C1CD3", fontSize: 14, fontWeight: 700 }}>Z</span>
  </div>
);

// --- Payment Link Modal ---
function PaymentLinkModal({ name, fieldLabel, fieldPrefix, onSubmit, onCancel }) {
  const [value, setValue] = useState(fieldPrefix || "");

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      zIndex: 1000, paddingTop: 180,
    }}>
      {/* Overlay */}
      <div onClick={onCancel} style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(25, 25, 25, 0.6)",
      }} />

      {/* Popup */}
      <div style={{
        position: "relative", backgroundColor: T.color.white,
        borderRadius: 24, padding: 16, width: 293,
        display: "flex", flexDirection: "column", gap: 32,
        boxSizing: "border-box", zIndex: 1,
      }}>
        {/* Header + Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
          <h3 style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: 20,
            lineHeight: 1.4, color: T.color.primary, margin: 0, textAlign: "center",
          }}>
            Link your {name} account
          </h3>

          {/* Input field */}
          <div style={{
            backgroundColor: T.color.white, border: `2px solid ${T.color.green}`,
            borderRadius: T.radius.input, padding: 12, width: "100%",
            display: "flex", flexDirection: "column", height: 56,
            justifyContent: "center", boxSizing: "border-box",
          }}>
            <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>
              {fieldLabel}
            </span>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
              style={{
                fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary,
                border: "none", outline: "none", backgroundColor: "transparent",
                width: "100%", padding: 0,
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
          <button onClick={() => onSubmit(value)} style={{
            width: "100%", height: 51, borderRadius: T.radius.circle,
            backgroundColor: T.color.primary, color: T.color.white,
            border: "none", cursor: "pointer", fontFamily: T.font.body,
            fontSize: 16, fontWeight: 400, lineHeight: 1.2,
          }}>
            Add my account
          </button>
          <button onClick={onCancel} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, lineHeight: 1.2,
            color: T.color.primary, textDecoration: "underline", padding: 0,
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Payment Method Row (default + linked success state) ---
function PaymentMethodRow({ icon, name, linked, username, onLink, onUnlink }) {
  return (
    <div style={{
      position: "relative",
      backgroundColor: T.color.white, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: 16, borderRadius: T.radius.card,
      boxShadow: T.shadow.card, width: "100%", maxWidth: 343, boxSizing: "border-box",
      border: linked ? `1px solid ${T.color.green}` : "1px solid transparent",
      transition: "border 0.2s ease",
    }}>
      {/* Green checkmark badge (linked state) */}
      {linked && (
        <div style={{
          position: "absolute", top: -6, left: -10, width: 24, height: 24,
          borderRadius: T.radius.circle, backgroundColor: T.color.green,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckIcon />
        </div>
      )}

      {/* Left: icon + name/username */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {icon}
        {linked ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>{name}</span>
            <span style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>{username}</span>
          </div>
        ) : (
          <span style={{ fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6, color: T.color.primary }}>{name}</span>
        )}
      </div>

      {/* Right: Link / Unlink action */}
      <button onClick={linked ? onUnlink : onLink} style={{
        display: "flex", gap: 8, alignItems: "center", background: "none",
        border: "none", cursor: "pointer", padding: 0,
      }}>
        <span style={{
          fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary,
          textDecoration: "underline",
        }}>{linked ? "Unlink" : "Link"}</span>
        {linked ? <UnlinkIcon /> : <LinkIcon />}
      </button>
    </div>
  );
}

// --- Payment methods config ---
const PAYMENT_METHODS = [
  { key: "cashapp", name: "Cash App", icon: <CashAppIcon />, fieldLabel: "Cash App username", fieldPrefix: "$" },
  { key: "venmo", name: "Venmo", icon: <VenmoIcon />, fieldLabel: "Venmo username", fieldPrefix: "@" },
  { key: "zelle", name: "Zelle", icon: <ZelleIcon />, fieldLabel: "Zelle email or phone", fieldPrefix: "" },
];

function SetupASummaFund6LinkPaymentMethods({ data, setData, onNext, onBack }) {
  const [linked, setLinked] = useState({ cashapp: null, venmo: null, zelle: null }); // null = not linked, string = username
  const [modalKey, setModalKey] = useState(null); // which payment method modal is open

  const activeMethod = PAYMENT_METHODS.find(m => m.key === modalKey);

  return (
    <>
      <ScreenLayout onBack={onBack} activeStep={3} gap={24}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>
            How will you collect the money?
          </h1>
          <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
            Connect your account to various payment methods so your community can have plenty of ways to support your Summa fund.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          {PAYMENT_METHODS.map(m => (
            <PaymentMethodRow
              key={m.key}
              icon={m.icon}
              name={m.name}
              linked={!!linked[m.key]}
              username={linked[m.key]}
              onLink={() => setModalKey(m.key)}
              onUnlink={() => {
                setLinked(l => ({ ...l, [m.key]: null }));
                setData(prev => {
                  const handles = { ...(prev.paymentHandles || {}) };
                  delete handles[m.key];
                  return { ...prev, paymentHandles: handles };
                });
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%" }}>
          <ButtonPrimary text="Finish" onClick={onNext} />
          <button onClick={onNext} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
            textDecoration: "underline", padding: 0,
          }}>
            Skip for now
          </button>
        </div>
      </ScreenLayout>

      {/* Link account modal */}
      {activeMethod && (
        <PaymentLinkModal
          name={activeMethod.name}
          fieldLabel={activeMethod.fieldLabel}
          fieldPrefix={activeMethod.fieldPrefix}
          onSubmit={(username) => {
            if (username.trim()) {
              setLinked(l => ({ ...l, [modalKey]: username }));
              setData(prev => ({
                ...prev,
                paymentHandles: { ...(prev.paymentHandles || {}), [modalKey]: username },
              }));
            }
            setModalKey(null);
          }}
          onCancel={() => setModalKey(null)}
        />
      )}
    </>
  );
}

// ============================================================
// SCREEN: Review Summa Fund
// ============================================================

// --- Edit pill button ---
function EditButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      backgroundColor: T.color.white, border: `2px solid #d6ff76`,
      borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
      fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
      color: T.color.primary, display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, whiteSpace: "nowrap",
    }}>
      Edit
    </button>
  );
}

// --- Review section row ---
function ReviewSection({ label, children, onEdit, noBorder = false }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 8,
      padding: "16px 0", width: "100%",
      borderBottom: noBorder ? "none" : `1px solid ${T.color.neutral300}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>{label}</span>
        <EditButton onClick={onEdit} />
      </div>
      {children}
    </div>
  );
}

function ReviewSummaFund({ data, onNext, onBack, goTo }) {
  const goalFormatted = data.goal
    ? `$${Number(data.goal).toLocaleString()}`
    : "$0";

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, paddingTop: 80, boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "0 16px", boxSizing: "border-box" }}>
        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", justifyContent: "center", width: "100%" }}>
          <h1 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4, color: T.color.primary, margin: 0, textAlign: "center", width: "100%" }}>
            Review your Summa fund
          </h1>
          <p style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, margin: 0, width: "100%" }}>
            This will be a public web page you and your community can share to garner support and reach your goal.
          </p>
        </div>

        {/* Review card */}
        <div style={{
          backgroundColor: T.color.white, borderRadius: 24,
          padding: "0 16px", width: "100%", boxSizing: "border-box",
        }}>
          {/* Cover */}
          <ReviewSection label="Cover" onEdit={() => goTo(6)}>
            <div style={{
              width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
              border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {data.coverImage ? (
                <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                  <rect width="80" height="60" fill={T.color.neutral300} />
                  <polygon points="20,50 40,20 60,50" fill="white" opacity="0.6" />
                  <polygon points="45,50 58,30 71,50" fill="white" opacity="0.4" />
                </svg>
              )}
            </div>
          </ReviewSection>

          {/* Title */}
          <ReviewSection label="Title" onEdit={() => goTo(3)}>
            <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
              {data.title || "—"}
            </p>
          </ReviewSection>

          {/* Goal */}
          <ReviewSection label="Goal" onEdit={() => goTo(5)}>
            <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
              {goalFormatted}
            </p>
          </ReviewSection>

          {/* Description */}
          <ReviewSection label="Description" onEdit={() => goTo(4)} noBorder>
            <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
              {data.description || "—"}
            </p>
          </ReviewSection>
        </div>

        {/* CTA section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%", paddingBottom: 60 }}>
          <ButtonPrimary text="Publish" onClick={onNext} />
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
            color: T.color.primary, textDecoration: "underline", padding: 0,
          }}>
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Complete (simple success state)
// ============================================================
function ScreenComplete({ data, setData, onNext }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fundUrl, setFundUrl] = useState("");
  const [error, setError] = useState(null);

  // Save fund to Supabase on mount
  useEffect(() => {
    if (saved || saving) return;
    setSaving(true);

    createFund(data).then(({ fund, error: err }) => {
      setSaving(false);
      if (err) {
        console.warn("Supabase save error:", err);
        const msg = typeof err === "string" ? err : (err?.message || JSON.stringify(err));
        setError(msg);
        setSaved(true);
        return;
      }
      if (fund) {
        setSaved(true);
        const baseUrl = window.location.origin;
        setFundUrl(`${baseUrl}/fund/${fund.slug}`);
        // Store the fund ID and slug in data for later use
        setData(prev => ({ ...prev, fundId: fund.id, fundSlug: fund.slug }));
      } else {
        setError("Fund was created but no data returned. Please try again.");
        setSaved(true);
      }
    }).catch(e => {
      setSaving(false);
      setSaved(true);
      setError(e?.message || "Unexpected error creating fund");
      console.error("createFund exception:", e);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyLink = () => {
    if (fundUrl) {
      navigator.clipboard.writeText(fundUrl).catch(() => {});
    }
  };

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, alignItems: "center", justifyContent: "center",
      padding: "0 16px", boxSizing: "border-box", gap: 24, textAlign: "center",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: T.radius.circle, backgroundColor: T.color.green,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {saving ? (
          <div style={{
            width: 28, height: 28, border: `3px solid ${T.color.neutral300}`,
            borderTopColor: T.color.primary, borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        ) : (
          <svg width="40" height="30" viewBox="0 0 16 12" fill="none">
            <path d="M1 6L6 11L15 1" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h1 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>
        {saving ? "Creating your fund..." : "You're all set! 🎉"}
      </h1>
      <p style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.neutral700, margin: 0 }}>
        Your Summa Fund{data.title ? ` "${data.title}"` : ""} has been created{data.fundFor === "myself" && data.firstName ? ` for ${data.firstName}` : data.fundFor === "someone" && data.recipientName ? ` for ${data.recipientName}` : ""}.
      </p>

      {/* Shareable URL */}
      {fundUrl && (
        <div style={{
          width: "100%", display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
        }}>
          <p style={{ fontFamily: T.font.body, fontSize: 13, color: T.color.neutral700, margin: 0 }}>
            Your shareable fund link:
          </p>
          <div
            onClick={handleCopyLink}
            style={{
              width: "100%", padding: "12px 16px", boxSizing: "border-box",
              borderRadius: 12, backgroundColor: T.color.white,
              border: `1px solid ${T.color.neutral300}`, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span style={{
              flex: 1, fontFamily: "monospace", fontSize: 13, color: T.color.primary,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left",
            }}>
              {fundUrl}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="9" y="9" width="13" height="13" rx="2" stroke={T.color.neutral700} strokeWidth="2"/>
              <path d="M5 15H4C2.895 15 2 14.105 2 13V4C2 2.895 2.895 2 4 2H13C14.105 2 15 2.895 15 4V5" stroke={T.color.neutral700} strokeWidth="2"/>
            </svg>
          </div>
          <p style={{ fontFamily: T.font.body, fontSize: 11, color: T.color.neutral700, margin: 0 }}>
            Tap to copy
          </p>
        </div>
      )}

      {/* Error fallback — still lets user continue in demo mode */}
      {error && (
        <p style={{ fontFamily: T.font.body, fontSize: 13, color: T.color.neutral700, margin: 0, fontStyle: "italic" }}>
          {error}
        </p>
      )}

      <button onClick={() => {
        if (fundUrl) {
          window.open(fundUrl, "_blank");
        } else {
          onNext();
        }
      }} style={{
        background: "none", border: "none", cursor: "pointer", padding: 0,
        fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
        color: T.color.primary, textDecoration: "underline",
        opacity: saving ? 0.4 : 1, pointerEvents: saving ? "none" : "auto",
      }}>
        Tap to see your live Summa fund!
      </button>
    </div>
  );
}

// ============================================================
// SCREEN: Fund Page
// ============================================================
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <line x1="3" y1="6" x2="21" y2="6" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round"/>
    <line x1="3" y1="12" x2="21" y2="12" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round"/>
    <line x1="3" y1="18" x2="21" y2="18" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const AccountIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={T.color.primary} strokeWidth="2"/>
    <circle cx="12" cy="10" r="3" stroke={T.color.primary} strokeWidth="2"/>
    <path d="M6.168 18.849C6.583 16.634 9.066 15 12 15C14.934 15 17.417 16.634 17.832 18.849" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function FundPage({ data, goTo, goHome, isSignedIn }) {
  const goalNum = Number(data.goal) || 0;
  const goalFormatted = `$${goalNum.toLocaleString()}`;
  const displayName = data.title || "My Summa Fund";
  // Organizer is always the account creator, not the beneficiary
  const organizer = data.firstName
    ? `${data.firstName}${data.lastName ? ` ${data.lastName}` : ""}`
    : "the organizer";

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 0, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(isSignedIn ? 19 : 22)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label={isSignedIn ? "Dashboard" : "Sign in"}>
          <AccountIcon />
        </button>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary,
          letterSpacing: 1,
        }}>
          summa
        </button>
        <button onClick={() => alert("This feature is coming soon! We're working on the menu.")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Menu">
          <MenuIcon />
        </button>
      </div>

      {/* Fund Details Section */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Title */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            {displayName}
          </h1>
        </div>

        {/* Cover Image */}
        <div style={{
          width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
          border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {data.coverImage ? (
            <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 316 178" preserveAspectRatio="xMidYMid slice">
              <rect width="316" height="178" fill={T.color.neutral300} />
              <polygon points="60,160 130,50 200,160" fill="white" opacity="0.6" />
              <polygon points="170,160 220,80 270,160" fill="white" opacity="0.4" />
            </svg>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <div style={{
            width: "100%", height: 8, backgroundColor: "rgba(143,143,143,0.2)",
            borderRadius: 8, overflow: "hidden",
          }}>
            <div style={{ width: 1, height: 16, backgroundColor: T.color.primary, marginTop: -4 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>RAISED</span>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, fontWeight: 700 }}>$0</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>GOAL</span>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, fontWeight: 700 }}>{goalFormatted}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{
          width: "100%", backgroundColor: "rgba(143,143,143,0.1)",
          borderRadius: 8, padding: 8, boxSizing: "border-box",
        }}>
          <p style={{
            fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6,
            color: T.color.primary, margin: 0,
          }}>
            {data.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Share + Edit Buttons */}
      <div style={{
        display: "flex", gap: 24, padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        <button onClick={() => goTo(11)} style={{
          display: "flex", gap: 10, alignItems: "center", justifyContent: "center",
          backgroundColor: T.color.primary, color: T.color.white,
          borderRadius: T.radius.circle, border: "none", cursor: "pointer",
          padding: "16px 32px", fontFamily: T.font.body, fontSize: 16,
          fontWeight: 400, lineHeight: 1.2, width: 200, flexShrink: 0,
        }}>
          Share <SendIcon />
        </button>
        <button style={{
          display: "flex", gap: 10, alignItems: "center", justifyContent: "center",
          backgroundColor: T.color.primary, color: T.color.white,
          borderRadius: T.radius.circle, border: "none", cursor: "pointer",
          padding: "16px 32px", fontFamily: T.font.body, fontSize: 16,
          fontWeight: 400, lineHeight: 1.2, flex: 1,
        }}>
          Edit <EditIcon />
        </button>
      </div>

      {/* Organizer Section */}
      <div style={{ padding: "16px 16px", width: "100%", boxSizing: "border-box" }}>
        <div style={{
          backgroundColor: T.color.neutral300, borderRadius: 8, padding: 16,
          display: "flex", flexDirection: "column", gap: 8, width: "100%", boxSizing: "border-box",
        }}>
          <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
            Organizer
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: T.radius.circle,
                backgroundColor: T.color.neutral500, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: T.radius.circle, backgroundColor: T.color.green,
                }} />
              </div>
              <span style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
                {organizer}
              </span>
            </div>
            <button onClick={() => alert("This feature is coming soon! We're working on making it easy to message the organizer directly.")} style={{
              backgroundColor: T.color.neutral300, border: `2px solid ${T.color.primary}`,
              borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
            }}>
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Preview as supporter link */}
      <div style={{ padding: "0 16px", width: "100%", boxSizing: "border-box", textAlign: "center" }}>
        <button
          onClick={() => {
            if (data.fundSlug) {
              window.open(`${window.location.origin}/fund/${data.fundSlug}`, "_blank");
            } else {
              goTo(12);
            }
          }}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontFamily: T.font.body, fontSize: 14, lineHeight: 1.6,
            color: T.color.neutral700, textDecoration: "underline",
          }}
        >
          Preview as a supporter
        </button>
      </div>
    </div>
  );
}


// ============================================================
// SCREEN: Fund Page - Share
// ============================================================
function FundPageShare({ data, onBack }) {
  const fundUrl = data.fundSlug ? `${window.location.origin}/fund/${data.fundSlug}` : "";
  const defaultMsg = `Hi there! I've setup a Summa Fund and could use your help!${fundUrl ? `\n\n${fundUrl}` : ""}`;
  const [message, setMessage] = useState(defaultMsg);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(defaultMsg);
  const maxChars = 1000;

  // Shared header
  const header = (
    <div style={{
      display: "flex", alignItems: "center", width: "100%",
      padding: "16px 16px", boxSizing: "border-box",
      borderBottom: `1px solid ${T.color.neutral500}`,
    }}>
      <button onClick={editing ? () => setEditing(false) : onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
        <ArrowBackIcon />
      </button>
    </div>
  );

  // ---- Customize Message View ----
  if (editing) {
    return (
      <div style={{
        backgroundColor: T.color.white, display: "flex", flexDirection: "column",
        gap: 24, alignItems: "center", paddingTop: 0, paddingBottom: 48,
        width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
        fontFamily: T.font.body, boxSizing: "border-box",
      }}>
        {header}
        <div style={{
          display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
          padding: "0 16px", width: "100%", boxSizing: "border-box",
        }}>
          {/* Headline */}
          <div style={{ width: "100%", textAlign: "left" }}>
            <h1 style={{
              fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
              color: T.color.primary, margin: 0,
            }}>
              Encourage your community to support with a custom message
            </h1>
          </div>

          {/* Editable message field */}
          <div style={{ width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              backgroundColor: T.color.white, border: `2px solid ${T.color.green}`,
              borderRadius: T.radius.input, padding: 12, display: "flex", flexDirection: "column",
              height: 180, boxSizing: "border-box",
            }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>
                Message
              </span>
              <textarea
                value={draft}
                onChange={e => { if (e.target.value.length <= maxChars) setDraft(e.target.value); }}
                autoFocus
                style={{
                  fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary,
                  border: "none", outline: "none", backgroundColor: "transparent",
                  width: "100%", resize: "none", padding: 0, flex: 1,
                }}
              />
            </div>
            <p style={{
              fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700,
              textAlign: "right", margin: 0,
            }}>
              {draft.length}/{maxChars} characters
            </p>
          </div>
        </div>

        {/* Save changes button */}
        <div style={{ padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
          <ButtonPrimary text="Save changes" onClick={() => { setMessage(draft); setEditing(false); }} />
        </div>
      </div>
    );
  }

  // ---- Default Share View ----
  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 0, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {header}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Headline */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Reach your community by sharing
          </h1>
        </div>

        {/* Message preview (read-only) */}
        <div style={{ width: "100%", maxWidth: 343 }}>
          <div style={{
            backgroundColor: T.color.white, border: `2px solid ${T.color.neutral500}`,
            borderRadius: T.radius.input, padding: 12, display: "flex", flexDirection: "column",
            boxSizing: "border-box",
          }}>
            <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>
              Message
            </span>
            <p style={{
              fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
              color: T.color.primary, margin: 0,
            }}>
              {message}
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%" }}>
          {/* Customize message — outlined */}
          <button onClick={() => { setDraft(message); setEditing(true); }} style={{
            width: "100%", maxWidth: 343, height: 51, borderRadius: T.radius.circle,
            backgroundColor: T.color.white, color: T.color.primary,
            border: `1px solid ${T.color.primary}`, cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 400, lineHeight: 1.2,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            Customize message
          </button>

          {/* Share via... — filled */}
          <button onClick={() => {
            if (navigator.share && fundUrl) {
              navigator.share({
                title: data.title || "Summa Fund",
                text: message,
                url: fundUrl,
              }).catch(() => {});
            } else if (fundUrl) {
              navigator.clipboard.writeText(`${message}\n\n${fundUrl}`).catch(() => {});
            }
          }} style={{
            width: "100%", maxWidth: 343, height: 51, borderRadius: T.radius.circle,
            backgroundColor: T.color.primary, color: T.color.white,
            border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 400, lineHeight: 1.2,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            Share via... <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Fund Page — Supporter View (non-creator)
// ============================================================
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartFilledIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" fill={T.color.green} stroke={T.color.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FundPageSupporter({ data, goTo, goHome, isSignedIn }) {
  const goalNum = Number(data.goal) || 0;
  const goalFormatted = `$${goalNum.toLocaleString()}`;
  const confirmed = data.supporterContribution || 0;
  const pending = data.pendingContribution || 0;
  const raised = confirmed + pending;
  const raisedFormatted = `$${confirmed.toLocaleString()}`;
  const confirmedPct = goalNum > 0 ? Math.min((confirmed / goalNum) * 100, 100) : 0;
  const totalPct = goalNum > 0 ? Math.min((raised / goalNum) * 100, 100) : 0;
  const progressPct = confirmedPct;
  const displayName = data.title || "My Summa Fund";
  // Organizer is always the account creator, not the beneficiary
  const organizer = data.firstName
    ? `${data.firstName}${data.lastName ? ` ${data.lastName}` : ""}`
    : "the organizer";

  const supporterCount = data.supporterCount || 0;

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 0, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(isSignedIn ? 19 : 22)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label={isSignedIn ? "Dashboard" : "Sign in"}>
          <AccountIcon />
        </button>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary,
          letterSpacing: 1,
        }}>
          summa
        </button>
        <button onClick={() => alert("This feature is coming soon! We're working on the menu.")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Menu">
          <MenuIcon />
        </button>
      </div>

      {/* Fund Details Section */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Title */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            {displayName}
          </h1>
        </div>

        {/* Cover Image */}
        <div style={{
          width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
          border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {data.coverImage ? (
            <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 316 178" preserveAspectRatio="xMidYMid slice">
              <rect width="316" height="178" fill={T.color.neutral300} />
              <polygon points="60,160 130,50 200,160" fill="white" opacity="0.6" />
              <polygon points="170,160 220,80 270,160" fill="white" opacity="0.4" />
            </svg>
          )}
        </div>

        {/* Progress Bar — two layers: confirmed (solid green) + pending (faded green) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <div style={{
            width: "100%", height: 8, backgroundColor: "rgba(143,143,143,0.2)",
            borderRadius: 8, overflow: "hidden", position: "relative",
          }}>
            {/* Pending layer (lighter) */}
            {totalPct > confirmedPct && (
              <div style={{
                position: "absolute", left: 0, top: 0,
                width: `${Math.max(totalPct, 0.3)}%`, height: "100%",
                background: `linear-gradient(90deg, ${T.color.green}, #d6ff76)`,
                borderRadius: 8, opacity: 0.35,
                transition: "width 0.6s ease",
              }} />
            )}
            {/* Confirmed layer (solid) */}
            <div style={{
              position: "absolute", left: 0, top: 0,
              width: `${Math.max(confirmedPct, confirmed > 0 ? 0.3 : 0)}%`, height: "100%",
              background: `linear-gradient(90deg, ${T.color.green}, #d6ff76)`,
              borderRadius: 8, transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>RAISED</span>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, fontWeight: 700 }}>{raisedFormatted}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>GOAL</span>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, fontWeight: 700 }}>{goalFormatted}</span>
            </div>
          </div>
          {/* Supporter count */}
          {supporterCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <HeartFilledIcon />
              <span style={{ fontFamily: T.font.body, fontSize: 14, color: T.color.primary }}>
                {supporterCount} {supporterCount === 1 ? "supporter" : "supporters"}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{
          width: "100%", backgroundColor: "rgba(143,143,143,0.1)",
          borderRadius: 8, padding: 8, boxSizing: "border-box",
        }}>
          <p style={{
            fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6,
            color: T.color.primary, margin: 0,
          }}>
            {data.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Support CTA Button */}
      <div style={{
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        <ButtonPrimary text="Support this fund" onClick={() => goTo(13)} />
      </div>

      {/* Organizer Section */}
      <div style={{ padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
        <div style={{
          backgroundColor: T.color.neutral300, borderRadius: 8, padding: 16,
          display: "flex", flexDirection: "column", gap: 8, width: "100%", boxSizing: "border-box",
        }}>
          <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
            Organizer
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: T.radius.circle,
                backgroundColor: T.color.neutral500, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: T.radius.circle, backgroundColor: T.color.green,
                }} />
              </div>
              <span style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
                {organizer}
              </span>
            </div>
            <button onClick={() => alert("This feature is coming soon! We're working on making it easy to message the organizer directly.")} style={{
              backgroundColor: T.color.neutral300, border: `2px solid ${T.color.primary}`,
              borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
            }}>
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// SCREEN: Support — Choose Amount
// ============================================================
function SupportChooseAmount({ data, setData, goTo, goHome }) {
  const [amount, setAmount] = useState("");
  const inputRef = useRef(null);
  const presetAmounts = [5, 10, 25, 50, 100, 250];

  const goalNum = Number(data.goal) || 0;
  const confirmed = data.supporterContribution || 0;
  const pendingAmount = parseFloat(amount) || 0;
  const previewTotal = confirmed + pendingAmount;
  const raisedFormatted = `$${confirmed.toLocaleString()}`;
  const previewFormatted = pendingAmount > 0 ? `$${previewTotal.toLocaleString()}` : raisedFormatted;
  const goalFormatted = `$${goalNum.toLocaleString()}`;
  const basePct = goalNum > 0 ? Math.min((confirmed / goalNum) * 100, 100) : 0;
  const previewPct = goalNum > 0 ? Math.min((previewTotal / goalNum) * 100, 100) : 0;
  const supporterCount = data.supporterCount || 0;

  const recipientFirstName = data.fundFor === "myself" && data.firstName
    ? data.firstName
    : data.fundFor === "someone" && data.recipientName
      ? data.recipientName.split(" ")[0]
      : "them";

  const handlePreset = (val) => {
    setAmount(String(val));
    setData(prev => ({ ...prev, supportAmount: val }));
  };

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(raw);
    const num = parseFloat(raw);
    setData(prev => ({ ...prev, supportAmount: num > 0 ? num : 0 }));
  };

  const handleSwipeComplete = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    goTo(14);
  };

  // Format display amount
  const displayAmount = amount
    ? parseFloat(amount) ? parseFloat(amount).toFixed(2) : "00.00"
    : "00.00";

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: back arrow + logo + Share pill */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(12, "left")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary,
          letterSpacing: 1,
        }}>
          summa
        </button>
        <button style={{
          backgroundColor: T.color.neutral300, border: `2px solid ${T.color.primary}`,
          borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
          fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
        }}>
          Share
        </button>
      </div>

      {/* Content Section */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Headline */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            How much would you like to contribute?
          </h1>
        </div>

        {/* Progress Bar — shows base + preview of pending contribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <div style={{
            width: "100%", height: 8, backgroundColor: "rgba(143,143,143,0.2)",
            borderRadius: 8, overflow: "hidden", position: "relative",
          }}>
            {/* Preview (pending) fill — lighter green */}
            <div style={{
              position: "absolute", left: 0, top: 0,
              width: `${Math.max(previewPct, 0.3)}%`, height: "100%",
              background: `linear-gradient(90deg, ${T.color.green}, #d6ff76)`,
              borderRadius: 8, transition: "width 0.4s ease",
              opacity: pendingAmount > 0 ? 1 : 0,
            }} />
            {/* Base (already raised) fill — solid dark */}
            <div style={{
              position: "relative",
              width: `${Math.max(basePct, 0.3)}%`, height: "100%",
              backgroundColor: T.color.primary, borderRadius: 8,
              transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>RAISED</span>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, fontWeight: 700 }}>{raisedFormatted}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>GOAL</span>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary, fontWeight: 700 }}>{goalFormatted}</span>
            </div>
          </div>
          {/* Supporter count */}
          {supporterCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <HeartFilledIcon />
              <span style={{ fontFamily: T.font.body, fontSize: 14, color: T.color.primary }}>
                {supporterCount} {supporterCount === 1 ? "supporter" : "supporters"}
              </span>
            </div>
          )}
        </div>

        {/* Amount Input Field */}
        <div
          onClick={() => { if (inputRef.current) inputRef.current.focus(); }}
          style={{
            width: "100%", borderRadius: 16,
            border: `2px solid ${T.color.primary}`, backgroundColor: T.color.white,
            display: "flex", gap: 10, alignItems: "center",
            padding: "12px 16px", boxSizing: "border-box", cursor: "text",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}>
            <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.2, color: T.color.primary }}>$</span>
            <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.2, color: T.color.primary }}>USD</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleInputChange}
            placeholder="00.00"
            style={{
              flex: 1, minWidth: 0, border: "none", outline: "none", backgroundColor: "transparent",
              fontFamily: T.font.heading, fontSize: 28, fontWeight: 500, lineHeight: 1,
              color: T.color.primary, textAlign: "right", padding: 0,
            }}
          />
        </div>

        {/* Suggested Amounts — 3x2 Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          {/* Row 1 */}
          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            {presetAmounts.slice(0, 3).map(val => (
              <button
                key={val}
                onClick={() => handlePreset(val)}
                style={{
                  flex: 1, height: 56, borderRadius: 16,
                  border: `2px solid ${amount === String(val) ? T.color.green : T.color.primary}`,
                  backgroundColor: amount === String(val) ? "rgba(231,253,87,0.15)" : T.color.white,
                  cursor: "pointer", fontFamily: T.font.body, fontSize: 16, fontWeight: 700,
                  lineHeight: 1.6, color: T.color.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                ${val}
              </button>
            ))}
          </div>
          {/* Row 2 */}
          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            {presetAmounts.slice(3, 6).map(val => (
              <button
                key={val}
                onClick={() => handlePreset(val)}
                style={{
                  flex: 1, height: 56, borderRadius: 16,
                  border: `2px solid ${amount === String(val) ? T.color.green : T.color.primary}`,
                  backgroundColor: amount === String(val) ? "rgba(231,253,87,0.15)" : T.color.white,
                  cursor: "pointer", fontFamily: T.font.body, fontSize: 16, fontWeight: 700,
                  lineHeight: 1.6, color: T.color.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Swipe to Give CTA */}
      <div style={{ padding: "0 16px", width: "100%", boxSizing: "border-box", marginTop: "auto" }}>
        <SwipeButton
          text="Swipe to give"
          onSwipeComplete={handleSwipeComplete}
          disabled={!data.supportAmount || data.supportAmount <= 0}
        />
      </div>
    </div>
  );
}


// ============================================================
// SCREEN: Support — Choose Payment Method
// ============================================================
function SupportPaymentMethod({ data, setData, goTo, goHome }) {
  const [selected, setSelected] = useState(null);
  const amountNum = data.supportAmount || 0;
  const amountFormatted = `$${amountNum.toLocaleString()}`;
  const supporterCount = data.supporterCount || 0;

  const recipientFirstName = data.fundFor === "myself" && data.firstName
    ? data.firstName
    : data.fundFor === "someone" && data.recipientName
      ? data.recipientName.split(" ")[0]
      : "them";

  const handles = data.paymentHandles || {};
  const methods = [
    { id: "cashapp", name: "Cash App", icon: <LogoCashApp />, linked: !!handles.cashapp },
    { id: "venmo", name: "Venmo", icon: <LogoVenmo />, linked: !!handles.venmo },
    { id: "zelle", name: "Zelle", icon: <LogoZelle />, linked: !!handles.zelle },
    { id: "cash", name: "Record Cash Payment", icon: null, linked: true },
  ];

  const selectedName = methods.find(m => m.id === selected)?.name || "";

  const handleSubmit = () => {
    if (!selected) return;
    setData(prev => ({ ...prev, supportPaymentMethod: selected }));
    goTo(15);
  };

  // Radio component inline
  const Radio = ({ active }) => (
    <div style={{
      width: 24, height: 24, borderRadius: T.radius.circle,
      border: active ? `6px solid ${T.color.green}` : `2px solid ${T.color.neutral500}`,
      backgroundColor: T.color.white,
      boxSizing: "border-box", flexShrink: 0,
    }} />
  );

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: back + logo + Share */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(13, "left")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary,
          letterSpacing: 1,
        }}>
          summa
        </button>
        <button style={{
          backgroundColor: T.color.neutral300, border: `2px solid ${T.color.primary}`,
          borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
          fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
        }}>
          Share
        </button>
      </div>

      {/* Content */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Headline */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Choose how to send{"\n"}the {amountFormatted} for {recipientFirstName}
          </h1>
        </div>

        {/* Supporter count */}
        {supporterCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <HeartFilledIcon />
            <span style={{ fontFamily: T.font.body, fontSize: 14, color: T.color.primary }}>
              {supporterCount} {supporterCount === 1 ? "supporter" : "supporters"}
            </span>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start",
        justifyContent: "center", padding: "16px 16px", width: "100%", boxSizing: "border-box",
      }}>
        <span style={{
          fontFamily: T.font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.6,
          color: T.color.primary,
        }}>
          Payment Methods
        </span>
        {methods.map(m => (
          <button
            key={m.id}
            onClick={() => m.linked && setSelected(m.id)}
            disabled={!m.linked}
            style={{
              display: "flex", alignItems: "center", gap: 32,
              width: "100%", borderRadius: 16,
              backgroundColor: T.color.white,
              boxShadow: T.shadow.card,
              border: "none", cursor: m.linked ? "pointer" : "default",
              padding: 16, boxSizing: "border-box",
              opacity: m.linked ? 1 : 0.4,
            }}
          >
            <Radio active={selected === m.id} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {m.icon}
              <span style={{
                fontFamily: T.font.body, fontSize: 20, fontWeight: 400, lineHeight: 1.6,
                color: T.color.primary, whiteSpace: "nowrap",
              }}>
                {m.name}
              </span>
            </div>
            {!m.linked && (
              <span style={{
                fontFamily: T.font.body, fontSize: 11, color: T.color.neutral700,
                marginLeft: "auto",
              }}>
                Not set up
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CTA Button */}
      <div style={{ padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
        <ButtonPrimary
          text={selected ? `Send via ${selectedName}` : `Select a method`}
          onClick={handleSubmit}
          disabled={!selected}
        />
      </div>

      {/* Disclaimer */}
      <div style={{ padding: "0 16px 16px", width: "100%", boxSizing: "border-box" }}>
        <p style={{
          fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4,
          color: T.color.primary, margin: 0,
        }}>
          Summa helps record payments but do not process the payments. When you use any external payment service, your payment is shared with that company under its Privacy Policy and Terms.
        </p>
      </div>
    </div>
  );
}


// ============================================================
// SCREEN: Support — Record Payment Disclosure
// ============================================================
function SupportRecordPayment({ data, setData, goTo, goHome }) {
  const amount = data.supportAmount || 0;
  const amountFormatted = `$${amount.toLocaleString()}`;
  const methodId = data.supportPaymentMethod || "venmo";
  const methodNames = { cashapp: "Cash App", venmo: "Venmo", zelle: "Zelle", cash: "cash" };
  const methodName = methodNames[methodId] || methodId;
  const isApp = methodId !== "cash";
  const handles = data.paymentHandles || {};
  const handle = handles[methodId] || "";

  const organizer = data.fundFor === "myself" && data.firstName
    ? `${data.firstName}${data.lastName ? ` ${data.lastName}` : ""}`
    : data.fundFor === "someone" && data.recipientName
      ? data.recipientName
      : "the organizer";

  const fundTitle = data.title || "Summa Fund";

  // Build deep link URLs for each payment method
  const buildDeepLink = () => {
    const note = encodeURIComponent(`${fundTitle} — via Summa`);
    if (methodId === "venmo" && handle) {
      const username = handle.replace(/^@/, "");
      return `https://venmo.com/${encodeURIComponent(username)}?txn=pay&amount=${amount}&note=${note}`;
    }
    if (methodId === "cashapp" && handle) {
      const cashtag = handle.replace(/^\$/, "");
      return `https://cash.app/$${encodeURIComponent(cashtag)}/${amount}`;
    }
    // Zelle has no universal deep link — falls back to null
    return null;
  };

  const deepLink = buildDeepLink();
  const [appOpened, setAppOpened] = useState(false);

  const handleOpenApp = () => {
    if (deepLink) {
      window.open(deepLink, "_blank");
      setAppOpened(true);
    }
  };

  const handleRecordPayment = () => {
    // Navigate to sender details screen — Supabase save happens there
    // after the supporter optionally provides their name and message
    goTo(16);
  };

  // Brand colors for the "Open" button
  const brandColors = {
    venmo: { bg: "#008CFF", text: "#FFFFFF" },
    cashapp: { bg: "#00D632", text: "#FFFFFF" },
    zelle: { bg: "#6D1ED4", text: "#FFFFFF" },
  };
  const brand = brandColors[methodId] || { bg: T.color.primary, text: T.color.white };

  // Brand logos for the open-app button
  const brandLogos = {
    cashapp: <LogoCashApp />,
    venmo: <LogoVenmo />,
    zelle: <LogoZelle />,
  };

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: back + logo */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(14, "left")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary,
          letterSpacing: 1,
        }}>
          summa
        </button>
        <div style={{ width: 24 }} />
      </div>

      {/* Content */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: T.radius.circle,
          backgroundColor: "rgba(231,253,87,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {methodId === "cashapp" && <LogoCashApp />}
          {methodId === "venmo" && <LogoVenmo />}
          {methodId === "zelle" && <LogoZelle />}
          {methodId === "cash" && <DollarIcon />}
        </div>

        {/* Headline */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            {isApp ? `Send ${amountFormatted} via ${methodName}` : `Record your ${amountFormatted} cash payment`}
          </h1>
          {handle && isApp && (
            <p style={{
              fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4,
              color: T.color.neutral700, margin: "8px 0 0 0",
            }}>
              to {methodId === "cashapp" ? "$" : "@"}{handle.replace(/^[@$]/, "")}
            </p>
          )}
        </div>

        {/* Open App CTA — the main action for Venmo and Cash App */}
        {isApp && deepLink && (
          <button onClick={handleOpenApp} style={{
            width: "100%", height: 56, borderRadius: T.radius.circle,
            backgroundColor: brand.bg, color: brand.text, border: "none",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 600, lineHeight: 1.2,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Open {methodName} to pay {amountFormatted}
          </button>
        )}

        {/* Fallback for Zelle or no handle — informational card */}
        {isApp && !deepLink && (
          <div style={{
            width: "100%", backgroundColor: T.color.white,
            borderRadius: 16, padding: 20, boxSizing: "border-box",
            boxShadow: T.shadow.card,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: T.radius.circle, flexShrink: 0,
                backgroundColor: "rgba(231,253,87,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                ℹ
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: T.font.body, fontSize: 14, lineHeight: 1.6,
                  color: T.color.primary, margin: 0,
                }}>
                  {methodId === "zelle"
                    ? `Open your banking app and send ${amountFormatted} via Zelle to ${handle || organizer}. Zelle is built into most banking apps.`
                    : `Open ${methodName} and send ${amountFormatted} directly to ${organizer}.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notice card — always visible */}
        <div style={{
          width: "100%", backgroundColor: T.color.white,
          borderRadius: 16, padding: 20, boxSizing: "border-box",
          border: `1px solid ${T.color.neutral300}`,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <p style={{
            fontFamily: T.font.body, fontSize: 13, fontWeight: 600, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            How it works
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isApp && deepLink ? (
              <>
                <StepRow num={1} text={`Tap "Open ${methodName}" above — the amount and recipient will be pre-filled`} />
                <StepRow num={2} text={`Confirm and send the payment in ${methodName}`} />
                <StepRow num={3} text={`Come back here and tap "I've sent the payment"`} />
              </>
            ) : isApp ? (
              <>
                <StepRow num={1} text={`Open the ${methodName} ${methodId === "zelle" ? "section in your banking app" : "app on your phone"}`} />
                <StepRow num={2} text={`Send ${amountFormatted} to ${handle ? (methodId === "zelle" ? handle : (methodId === "cashapp" ? "$" : "@") + handle.replace(/^[@$]/, "")) : organizer}`} />
                <StepRow num={3} text={`Return here and tap "I've sent the payment"`} />
              </>
            ) : (
              <>
                <StepRow num={1} text={`Give ${amountFormatted} in cash to ${organizer}`} />
                <StepRow num={2} text={`Tap "Record payment" below to notify them`} />
              </>
            )}
          </div>
          <p style={{
            fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4,
            color: T.color.neutral700, margin: "4px 0 0 0",
          }}>
            Summa does not process payments directly. Your payment goes to the organizer via {methodName}.
          </p>
        </div>

        {/* Success state after opening app */}
        {appOpened && (
          <div style={{
            width: "100%", padding: "12px 16px", boxSizing: "border-box",
            borderRadius: 12, backgroundColor: "rgba(231,253,87,0.2)",
            border: `1px solid ${T.color.green}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#2d7a1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{
              fontFamily: T.font.body, fontSize: 14, fontWeight: 500, lineHeight: 1.4,
              color: "#2d7a1e", margin: 0,
            }}>
              {methodName} opened — confirm your payment there, then come back
            </p>
          </div>
        )}
      </div>

      {/* Record Payment Button */}
      <div style={{ padding: "0 16px", width: "100%", boxSizing: "border-box", marginTop: "auto" }}>
        <ButtonPrimary
          text={appOpened ? "I've sent the payment" : (methodId === "cash" ? "Record payment" : (deepLink ? "I've already paid" : "I've sent the payment"))}
          onClick={handleRecordPayment}
        />
        <p style={{
          fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4,
          color: T.color.neutral700, margin: "12px 0 0 0", textAlign: "center",
        }}>
          This will notify {organizer} that you've sent {amountFormatted}
        </p>
      </div>
    </div>
  );
}

// Helper for step rows
function StepRow({ num, text }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        width: 28, height: 28, borderRadius: T.radius.circle, flexShrink: 0,
        backgroundColor: T.color.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: T.color.white, fontFamily: T.font.body, fontSize: 14, fontWeight: 700,
      }}>
        {num}
      </div>
      <p style={{
        fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
        color: T.color.primary, margin: 0, paddingTop: 2,
      }}>
        {text}
      </p>
    </div>
  );
}


// ============================================================
// SCREEN: Support — Sender Details (name + message after payment)
// ============================================================
function SupportSenderDetails({ data, setData, goTo, goHome }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const handleSend = async () => {
    const displayName = anonymous ? "Anonymous" : (name.trim() || "Anonymous");

    // Save contribution to Supabase with name and message
    if (data.fundId) {
      const { error } = await recordContribution({
        fundId: data.fundId,
        amount: data.supportAmount || 0,
        paymentMethod: data.supportPaymentMethod || "venmo",
        supporterName: displayName,
        message: message.trim(),
      });
      if (error) console.warn("Contribution save error:", error);
    }

    // Add as a pending donation — raised amount only increases when guardian confirms
    const methodNames = { cashapp: "Cash App", venmo: "Venmo", zelle: "Zelle", cash: "Cash" };
    const newDonation = {
      id: Date.now(),
      name: displayName,
      amount: data.supportAmount || 0,
      method: methodNames[data.supportPaymentMethod] || data.supportPaymentMethod || "Venmo",
      message: message.trim(),
      time: "Just now",
      fundTitle: data.title || "My Summa Fund",
      confirmed: false,
    };
    setData(prev => ({
      ...prev,
      supporterDisplayName: displayName,
      supporterMessage: message.trim(),
      supporterCount: (prev.supporterCount || 0) + 1,
      pendingContribution: (prev.pendingContribution || 0) + (prev.supportAmount || 0),
      donations: [...(prev.donations || []), newDonation],
    }));
    goTo(17);
  };

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: back + logo + Share */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(15, "left")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary,
          letterSpacing: 1,
        }}>
          summa
        </button>
        <div style={{
          backgroundColor: T.color.white, border: `2px solid #d6ff76`,
          borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
          fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
          color: T.color.primary,
        }}>
          Share
        </div>
      </div>

      {/* Content */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Headline */}
        <div style={{
          width: "100%", display: "flex", flexDirection: "column", gap: 10,
        }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: 24, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Thank you!
          </h1>
          <p style={{
            fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6, fontWeight: 400,
            color: T.color.primary, margin: 0,
          }}>
            Your support helps make this possible. If you'd like, you can leave your name and a short message to be shared with the creator.
          </p>
        </div>

        {/* Name input */}
        <div style={{ width: "100%" }}>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={anonymous ? "" : name}
            onChange={e => setName(e.target.value)}
            disabled={anonymous}
            style={{
              width: "100%", height: 56, boxSizing: "border-box",
              padding: "12px", borderRadius: T.radius.input,
              border: `1px solid ${T.color.neutral500}`, backgroundColor: T.color.white,
              fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6,
              color: anonymous ? T.color.neutral500 : T.color.primary,
              outline: "none",
            }}
          />
        </div>

        {/* Message textarea */}
        <div style={{ width: "100%" }}>
          <textarea
            placeholder="Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{
              width: "100%", height: 156, boxSizing: "border-box",
              padding: "12px", borderRadius: T.radius.input,
              border: `1px solid ${T.color.neutral500}`, backgroundColor: T.color.white,
              fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6,
              color: T.color.primary, outline: "none",
              resize: "none", verticalAlign: "top",
            }}
          />
        </div>

        {/* Remain anonymous checkbox */}
        <div
          onClick={() => setAnonymous(a => !a)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 32,
            padding: 16, borderRadius: 16, cursor: "pointer",
            boxShadow: "0px 4px 16px rgba(0,0,0,0.08)",
            backgroundColor: "transparent",
          }}
        >
          {/* Checkbox */}
          <div style={{
            width: 24, height: 24, borderRadius: 2, flexShrink: 0,
            backgroundColor: anonymous ? T.color.green : T.color.white,
            border: anonymous ? `2px solid ${T.color.green}` : `2px solid ${T.color.neutral500}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s ease",
          }}>
            {anonymous && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke={T.color.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{
            fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6, fontWeight: 400,
            color: T.color.primary, whiteSpace: "nowrap",
          }}>
            Remain anonymous
          </span>
        </div>

        {/* Send button */}
        <div style={{ width: "100%" }}>
          <ButtonPrimary text="Send" onClick={handleSend} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Support — Confirmation / Thank You
// ============================================================
function SupportComplete({ data, goTo }) {
  const amountFormatted = `$${(data.supportAmount || 0).toLocaleString()}`;
  const displayName = data.title || "this fund";

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 32, alignItems: "center", justifyContent: "center",
      paddingTop: 0, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Success Icon */}
      <div style={{
        width: 80, height: 80, borderRadius: T.radius.circle,
        background: `linear-gradient(135deg, ${T.color.green}, #d6ff76)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(231,253,87,0.4)",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke={T.color.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Message */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
        textAlign: "center", padding: "0 32px",
      }}>
        <h1 style={{
          fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
          color: T.color.primary, margin: 0,
        }}>
          Thank you!
        </h1>
        <p style={{
          fontFamily: T.font.body, fontSize: 18, lineHeight: 1.6, color: T.color.primary,
          margin: 0,
        }}>
          Your {amountFormatted} contribution to {displayName} has been sent.
        </p>
        <p style={{
          fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.neutral700,
          margin: 0,
        }}>
          The organizer has been notified.
        </p>
      </div>

      {/* Actions */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        <ButtonPrimary text="Back to fund page" onClick={() => goTo(12)} />
        <button
          onClick={() => goTo(18)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
            color: T.color.primary, textDecoration: "underline",
          }}
        >
          Share this fund
        </button>
      </div>
    </div>
  );
}


// ============================================================
// SCREEN: Fund Page — Supporter Share
// ============================================================
function FundPageSupporterShare({ data, onBack }) {
  const defaultMsg = `Check out ${data.title || "this Summa fund"}! Every little bit helps.`;
  const [message, setMessage] = useState(defaultMsg);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(defaultMsg);
  const maxChars = 1000;

  // Shared header
  const header = (
    <div style={{
      display: "flex", alignItems: "center", width: "100%",
      padding: "16px 16px", boxSizing: "border-box",
      borderBottom: `1px solid ${T.color.neutral500}`,
    }}>
      <button onClick={editing ? () => setEditing(false) : onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
        <ArrowBackIcon />
      </button>
    </div>
  );

  // ---- Customize Message View ----
  if (editing) {
    return (
      <div style={{
        backgroundColor: T.color.white, display: "flex", flexDirection: "column",
        gap: 24, alignItems: "center", paddingTop: 0, paddingBottom: 48,
        width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
        fontFamily: T.font.body, boxSizing: "border-box",
      }}>
        {header}
        <div style={{
          display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
          padding: "0 16px", width: "100%", boxSizing: "border-box",
        }}>
          <div style={{ width: "100%", textAlign: "left" }}>
            <h1 style={{
              fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
              color: T.color.primary, margin: 0,
            }}>
              Share a personal message with your friends
            </h1>
          </div>
          <div style={{ width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              backgroundColor: T.color.white, border: `2px solid ${T.color.green}`,
              borderRadius: T.radius.input, padding: 12, display: "flex", flexDirection: "column",
              height: 180, boxSizing: "border-box",
            }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>
                Message
              </span>
              <textarea
                value={draft}
                onChange={e => { if (e.target.value.length <= maxChars) setDraft(e.target.value); }}
                autoFocus
                style={{
                  fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary,
                  border: "none", outline: "none", backgroundColor: "transparent",
                  width: "100%", resize: "none", padding: 0, flex: 1,
                }}
              />
            </div>
            <p style={{
              fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700,
              textAlign: "right", margin: 0,
            }}>
              {draft.length}/{maxChars} characters
            </p>
          </div>
        </div>
        <div style={{ padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
          <ButtonPrimary text="Save changes" onClick={() => { setMessage(draft); setEditing(false); }} />
        </div>
      </div>
    );
  }

  // ---- Default Share View ----
  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 0, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {header}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Help spread the word
          </h1>
        </div>
        <div style={{ width: "100%", maxWidth: 343 }}>
          <div style={{
            backgroundColor: T.color.white, border: `2px solid ${T.color.neutral500}`,
            borderRadius: T.radius.input, padding: 12, display: "flex", flexDirection: "column",
            boxSizing: "border-box",
          }}>
            <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>
              Message
            </span>
            <p style={{
              fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
              color: T.color.primary, margin: 0,
            }}>
              {message}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%" }}>
          <button onClick={() => { setDraft(message); setEditing(true); }} style={{
            width: "100%", maxWidth: 343, height: 51, borderRadius: T.radius.circle,
            backgroundColor: T.color.white, color: T.color.primary,
            border: `1px solid ${T.color.primary}`, cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 400, lineHeight: 1.2,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            Customize message
          </button>
          <button style={{
            width: "100%", maxWidth: 343, height: 51, borderRadius: T.radius.circle,
            backgroundColor: T.color.primary, color: T.color.white,
            border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 400, lineHeight: 1.2,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            Share via... <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// SCREEN: Guardian Dashboard (Home)
// ============================================================
function GuardianHome({ data, setData, goTo, goHome, isSignedIn }) {
  const [funds, setFunds] = useState([]);
  const [loadingFunds, setLoadingFunds] = useState(true);

  // Fetch user's funds from Supabase on mount, with real contribution totals
  useEffect(() => {
    setLoadingFunds(true);
    loadFundsByCreator().then(async ({ funds: fetchedFunds }) => {
      if (!fetchedFunds || fetchedFunds.length === 0) {
        setFunds([]);
        setLoadingFunds(false);
        return;
      }
      // For each fund, fetch contributions to get accurate totals (only confirmed)
      const enriched = await Promise.all(fetchedFunds.map(async (fund) => {
        const { contributions } = await getContributions(fund.id);
        const active = (contributions || []).filter(c => c.status !== "rejected");
        const confirmedOnly = active.filter(c => c.status === "confirmed");
        const totalRaised = confirmedOnly.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
        const count = active.length;
        return { ...fund, raised_amount: totalRaised, supporter_count: count };
      }));
      setFunds(enriched);
      setLoadingFunds(false);
    }).catch(() => setLoadingFunds(false));
  }, []);

  const handleFundTap = async (fund) => {
    // Fetch contributions from Supabase for this fund
    const { contributions } = await getContributions(fund.id);
    const methodNames = { cashapp: "Cash App", venmo: "Venmo", zelle: "Zelle", cash: "Cash" };
    const donations = (contributions || []).map(c => ({
      id: c.id,
      name: c.supporter_name || "Anonymous",
      amount: Number(c.amount) || 0,
      method: methodNames[c.payment_method] || c.payment_method || "Venmo",
      message: c.message || "",
      time: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fundTitle: fund.title,
      confirmed: c.status === "confirmed",
      ignored: c.status === "rejected",
    }));

    // Calculate confirmed vs pending from real data (exclude ignored)
    const confirmedTotal = donations.filter(d => d.confirmed).reduce((s, d) => s + d.amount, 0);
    const pendingTotal = donations.filter(d => !d.confirmed && !d.ignored).reduce((s, d) => s + d.amount, 0);

    // Hydrate the app data with this fund's details + real donations
    setData(prev => ({
      ...prev,
      fundId: fund.id,
      fundSlug: fund.slug,
      fundFor: fund.fund_for,
      firstName: fund.first_name || prev.firstName || "",
      lastName: fund.last_name || prev.lastName || "",
      recipientName: fund.recipient_name || "",
      title: fund.title || "",
      description: fund.description || "",
      goal: fund.goal ? String(fund.goal) : "",
      targetDate: fund.target_date || "",
      paymentHandles: fund.payment_handles || {},
      coverImage: fund.cover_photo_url || null,
      supporterContribution: confirmedTotal,
      supporterCount: donations.length,
      pendingContribution: pendingTotal,
      donations,
    }));
    goTo(20);
  };

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: account + logo + menu */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(isSignedIn ? 19 : 22)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label={isSignedIn ? "Dashboard" : "Sign in"}>
          <AccountIcon />
        </button>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary,
          letterSpacing: 1,
        }}>
          summa
        </button>
        <button onClick={() => alert("This feature is coming soon! We're working on the menu.")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Menu">
          <MenuIcon />
        </button>
      </div>

      {/* Body */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 48, width: "100%",
      }}>
        {/* Title */}
        <div style={{ padding: "0 16px" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Your Summa Plans
          </h1>
        </div>

        {/* Create a fund button */}
        <div style={{ padding: "0 16px" }}>
          <button
            onClick={() => goTo(0)}
            style={{
              width: "100%", height: 60, borderRadius: T.radius.circle,
              background: "linear-gradient(90deg, #d6ff76, #eafe7e)",
              border: "none", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
              color: T.color.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            Create a fund
          </button>
        </div>

        {/* Hosting section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 16px" }}>
          <h2 style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: 20, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Hosting
          </h2>

          {loadingFunds && (
            <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.color.neutral700, margin: 0 }}>
              Loading your funds...
            </p>
          )}

          {!loadingFunds && funds.length === 0 && (
            <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.color.neutral700, margin: 0 }}>
              You haven't created any funds yet. Tap "Create a fund" to get started!
            </p>
          )}

          {funds.map(fund => {
            const goalNum = Number(fund.goal) || 0;
            const raised = Number(fund.raised_amount) || 0;
            const pct = goalNum > 0 ? Math.min((raised / goalNum) * 100, 100) : 0;
            return (
              <div
                key={fund.id}
                onClick={() => handleFundTap(fund)}
                style={{
                  backgroundColor: T.color.white, borderRadius: 16,
                  boxShadow: "0px 4px 16px rgba(0,0,0,0.08)",
                  padding: 16, display: "flex", gap: 10, alignItems: "center",
                  cursor: "pointer", width: 343, boxSizing: "border-box",
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 80, height: 80, borderRadius: 16, backgroundColor: T.color.neutral300,
                  flexShrink: 0, overflow: "hidden",
                }}>
                  {fund.cover_photo_url && (
                    <img src={fund.cover_photo_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                {/* Text + progress */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                  <p style={{
                    fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
                    color: T.color.primary, margin: 0,
                  }}>
                    {fund.title || "Untitled Fund"}
                  </p>
                  {/* Progress bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                    <div style={{
                      width: "100%", height: 8, borderRadius: 8,
                      backgroundColor: "rgba(143,143,143,0.2)", overflow: "hidden",
                      position: "relative",
                    }}>
                      <div style={{
                        position: "absolute", left: 0, top: -4,
                        width: `${pct}%`, height: 16, borderRadius: 8,
                        backgroundColor: T.color.primary,
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <div>
                        <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>RAISED</span>
                        <br />
                        <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: T.color.primary }}>
                          ${raised.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>GOAL</span>
                        <br />
                        <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: T.color.primary }}>
                          ${goalNum.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Supporting section */}
        <div style={{ padding: "0 16px" }}>
          <h2 style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: 20, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Supporting
          </h2>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Guardian Fund Page — Fund detail view for the creator
// ============================================================
function GuardianFundPage({ data, goTo, goHome }) {
  const goalNum = Number(data.goal) || 0;
  const confirmed = data.supporterContribution || 0;
  const pending = data.pendingContribution || 0;
  const pct = goalNum > 0 ? Math.min((confirmed / goalNum) * 100, 100) : 0;
  const totalPct = goalNum > 0 ? Math.min(((confirmed + pending) / goalNum) * 100, 100) : 0;
  const fundTitle = data.title || "My Summa Fund";
  const pendingCount = (data.donations || []).filter(d => !d.confirmed && !d.ignored).length;

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: back + pill buttons */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(19, "left")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Share pill */}
          <button
            onClick={() => {
              const fundUrl = data.fundSlug ? `${window.location.origin}/fund/${data.fundSlug}` : "";
              if (navigator.share && fundUrl) {
                navigator.share({ title: fundTitle, text: `Support ${fundTitle}`, url: fundUrl }).catch(() => {});
              } else if (fundUrl) {
                navigator.clipboard.writeText(fundUrl).then(() => alert("Fund link copied!")).catch(() => {});
              } else {
                alert("No shareable link yet.");
              }
            }}
            style={{
              backgroundColor: T.color.white, border: "2px solid #d6ff76",
              borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
              color: T.color.primary, display: "flex", alignItems: "center", gap: 8,
            }}
          >
            Share
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Edit pill */}
          <button
            onClick={() => alert("This feature is coming soon! We're working on fund editing.")}
            style={{
              backgroundColor: T.color.white, border: "2px solid #d6ff76",
              borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
              color: T.color.primary, display: "flex", alignItems: "center", gap: 8,
            }}
          >
            Edit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4C3.47 4 2.96 4.21 2.59 4.59C2.21 4.96 2 5.47 2 6V20C2 20.53 2.21 21.04 2.59 21.41C2.96 21.79 3.47 22 4 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V13" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5C18.9 2.1 19.44 1.88 20 1.88C20.56 1.88 21.1 2.1 21.5 2.5C21.9 2.9 22.12 3.44 22.12 4C22.12 4.56 21.9 5.1 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Transactions pill — green gradient */}
          <button
            onClick={() => goTo(21)}
            style={{
              background: "linear-gradient(90deg, #d6ff76, #eafe7e)",
              border: "2px solid #d6ff76",
              borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
              color: T.color.primary, display: "flex", alignItems: "center", gap: 8,
              position: "relative",
            }}
          >
            Transactions
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {pendingCount > 0 && (
              <div style={{
                position: "absolute", top: -4, right: -4,
                width: 18, height: 18, borderRadius: T.radius.circle,
                backgroundColor: "#ff4444", color: T.color.white,
                fontSize: 10, fontWeight: 700, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                {pendingCount}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Fund details */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Title */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            {fundTitle}
          </h1>
        </div>

        {/* Cover Image */}
        <div style={{
          width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
          border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {data.coverImage ? (
            <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 316 178" preserveAspectRatio="xMidYMid slice">
              <rect width="316" height="178" fill={T.color.neutral300} />
              <polygon points="60,160 130,50 200,160" fill="white" opacity="0.6" />
              <polygon points="170,160 220,80 270,160" fill="white" opacity="0.4" />
            </svg>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <div style={{
            width: "100%", height: 8, backgroundColor: "rgba(143,143,143,0.2)",
            borderRadius: 8, overflow: "hidden", position: "relative",
          }}>
            {totalPct > pct && (
              <div style={{
                position: "absolute", left: 0, top: -4,
                width: `${totalPct}%`, height: 16, borderRadius: 8,
                backgroundColor: T.color.primary, opacity: 0.4,
              }} />
            )}
            <div style={{
              position: "absolute", left: 0, top: -4,
              width: `${pct}%`, height: 16, borderRadius: 8,
              backgroundColor: T.color.primary,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>RAISED</span>
              <br />
              <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: T.color.primary }}>
                ${confirmed.toLocaleString()}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>GOAL</span>
              <br />
              <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: T.color.primary }}>
                ${goalNum.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{
          width: "100%", backgroundColor: "rgba(143,143,143,0.1)",
          borderRadius: 8, padding: 8,
        }}>
          <p style={{
            fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6,
            color: T.color.primary, margin: 0,
          }}>
            {data.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Guardian Review Fund — Donation List
// ============================================================
function GuardianReviewFund({ data, setData, goTo }) {
  const goalNum = Number(data.goal) || 0;
  const confirmed = data.supporterContribution || 0;
  const pending = data.pendingContribution || 0;
  const raised = confirmed + pending;
  const fundTitle = data.title || "My Summa Fund";

  // Two-layer progress: confirmed (dark solid) + pending (dark 40% opacity)
  const totalPct = goalNum > 0 ? Math.min((raised / goalNum) * 100, 100) : 0;
  const confirmedPct = goalNum > 0 ? Math.min((confirmed / goalNum) * 100, 100) : 0;

  const donations = data.donations || [];

  const handleConfirm = async (donationId) => {
    // Persist to Supabase
    await updateContributionStatus(donationId, "confirmed");

    const donation = donations.find(d => d.id === donationId);
    const confirmAmount = donation ? donation.amount : 0;
    const updated = donations.map(d =>
      d.id === donationId ? { ...d, confirmed: true } : d
    );
    setData(prev => ({
      ...prev,
      donations: updated,
      supporterContribution: (prev.supporterContribution || 0) + confirmAmount,
      pendingContribution: Math.max(0, (prev.pendingContribution || 0) - confirmAmount),
    }));
  };

  const handleIgnore = async (donationId) => {
    // Persist to Supabase
    await updateContributionStatus(donationId, "rejected");

    const donation = donations.find(d => d.id === donationId);
    const ignoreAmount = donation ? donation.amount : 0;
    const updated = donations.map(d =>
      d.id === donationId ? { ...d, ignored: true } : d
    );
    setData(prev => ({
      ...prev,
      donations: updated,
      pendingContribution: Math.max(0, (prev.pendingContribution || 0) - ignoreAmount),
    }));
  };

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: back arrow + Share */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "16px 16px", boxSizing: "border-box",
        borderBottom: `1px solid ${T.color.neutral500}`,
      }}>
        <button onClick={() => goTo(20, "left")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
        <button
          onClick={() => {
            const fundUrl = data.fundSlug ? `${window.location.origin}/fund/${data.fundSlug}` : "";
            if (navigator.share && fundUrl) {
              navigator.share({ title: fundTitle, text: `Support ${fundTitle}`, url: fundUrl }).catch(() => {});
            } else if (fundUrl) {
              navigator.clipboard.writeText(fundUrl).then(() => alert("Fund link copied!")).catch(() => {});
            } else {
              alert("No shareable link yet. The fund URL is created when you finish the setup flow.");
            }
          }}
          style={{
            backgroundColor: T.color.white, border: `2px solid #d6ff76`,
            borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
            color: T.color.primary,
          }}
        >
          Share
        </button>
      </div>

      {/* Fund overview */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {/* Headline */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Review
          </h1>
        </div>

        {/* Fund card */}
        <div style={{
          backgroundColor: T.color.white, borderRadius: 16,
          boxShadow: "0px 4px 16px rgba(0,0,0,0.08)",
          padding: 16, display: "flex", gap: 10, alignItems: "center",
          width: 343, boxSizing: "border-box",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 16, backgroundColor: T.color.neutral300,
            flexShrink: 0, overflow: "hidden",
          }}>
            {data.coverImage && (
              <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
            <p style={{
              fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
              color: T.color.primary, margin: 0,
            }}>
              {fundTitle}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {/* Two-layer progress bar */}
              <div style={{
                width: "100%", height: 8, borderRadius: 8,
                backgroundColor: "rgba(143,143,143,0.2)", overflow: "hidden",
                position: "relative",
              }}>
                {/* Pending (lighter) */}
                <div style={{
                  position: "absolute", left: 0, top: -4,
                  width: `${totalPct}%`, height: 16, borderRadius: 8,
                  backgroundColor: T.color.primary, opacity: 0.4,
                }} />
                {/* Confirmed (solid) */}
                <div style={{
                  position: "absolute", left: 0, top: -4,
                  width: `${confirmedPct}%`, height: 16, borderRadius: 8,
                  backgroundColor: T.color.primary,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <div>
                  <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>RAISED</span>
                  <br />
                  <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: T.color.primary }}>
                    ${raised.toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary }}>GOAL</span>
                  <br />
                  <span style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: T.color.primary }}>
                    ${goalNum.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation list */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 24,
        padding: "0 16px", width: "100%", boxSizing: "border-box",
      }}>
        {donations.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{
              fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
              color: T.color.neutral700, margin: 0,
            }}>
              No donations yet. When supporters contribute to this fund, their donations will appear here for you to review and confirm.
            </p>
          </div>
        )}
        {donations.map((donation, i) => (
          <div key={donation.id} style={{ opacity: donation.ignored ? 0.4 : 1, transition: "opacity 0.3s ease" }}>
            {/* Donation item */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.6 }}>
                <span style={{
                  fontFamily: T.font.body, fontWeight: 700, fontSize: 16,
                  color: T.color.primary,
                }}>
                  {donation.name}
                </span>
                <span style={{
                  fontFamily: T.font.body, fontWeight: 400, fontSize: 16,
                  color: T.color.primary,
                }}>
                  Donated ${donation.amount.toLocaleString()} via {donation.method}
                </span>
                <span style={{
                  fontFamily: T.font.body, fontWeight: 400, fontSize: 16,
                  color: T.color.primary, fontStyle: "italic",
                }}>
                  {donation.time} &bull; {donation.fundTitle || fundTitle}
                </span>
                {donation.message && (
                  <span style={{
                    fontFamily: T.font.body, fontWeight: 400, fontSize: 14,
                    color: T.color.neutral700, fontStyle: "normal", marginTop: 4,
                  }}>
                    &ldquo;{donation.message}&rdquo;
                  </span>
                )}
              </div>

              {/* Action buttons — show for unconfirmed, non-ignored donations */}
              {!donation.confirmed && !donation.ignored ? (
                <div style={{ display: "flex", gap: 20 }}>
                  <button
                    onClick={() => handleConfirm(donation.id)}
                    style={{
                      background: "linear-gradient(90deg, #d6ff76, #eafe7e)",
                      border: "2px solid #d6ff76", borderRadius: 4,
                      padding: "8px 16px", cursor: "pointer",
                      fontFamily: T.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.4,
                      color: T.color.primary, whiteSpace: "nowrap",
                    }}
                  >
                    Confirm you've received
                  </button>
                  <button
                    onClick={() => handleIgnore(donation.id)}
                    style={{
                      backgroundColor: T.color.white, border: "2px solid #d6ff76",
                      borderRadius: 4, padding: "8px 16px", cursor: "pointer",
                      fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
                      color: T.color.primary,
                    }}
                  >
                    Ignore
                  </button>
                </div>
              ) : donation.ignored ? (
                <span style={{
                  fontFamily: T.font.body, fontSize: 12, fontWeight: 500, lineHeight: 1.4,
                  color: T.color.neutral700,
                }}>
                  Ignored
                </span>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#2d7a1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{
                    fontFamily: T.font.body, fontSize: 12, fontWeight: 500, lineHeight: 1.4,
                    color: "#2d7a1e",
                  }}>
                    Confirmed
                  </span>
                </div>
              )}
            </div>

            {/* Divider between donations */}
            {i < donations.length - 1 && (
              <div style={{
                width: "100%", height: 1, backgroundColor: T.color.neutral300,
                marginTop: 24,
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Start (Landing / Splash)
// ============================================================
const HERO_IMAGE = "/summa-hero.png";

const SummaLogo = () => (
  <svg width="76" height="22" viewBox="0 0 76 22" fill="none">
    <text x="0" y="18" fontFamily="'Rubik', sans-serif" fontWeight="700" fontSize="18" fill={T.color.primary} letterSpacing="0.5">summa</text>
    <circle cx="72" cy="4" r="2.5" fill={T.color.green} />
  </svg>
);

function StartScreen({ onSignUp, onSignIn, onJumpToLatest }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      position: "relative", overflow: "hidden",
    }}>
      {/* Invisible dev shortcut — tap top-left corner to jump to latest screen */}
      {onJumpToLatest && (
        <div
          onClick={onJumpToLatest}
          style={{
            position: "absolute", top: 0, left: 0, width: 44, height: 44,
            zIndex: 999, cursor: "default",
          }}
        />
      )}
      {/* Hero image — top ~40% of screen */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "40%",
        overflow: "hidden",
      }}>
        <img
          src={HERO_IMAGE}
          alt="Kids dancing"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
        />
      </div>

      {/* White card overlapping from below */}
      <div style={{
        position: "relative", backgroundColor: T.color.white,
        borderRadius: "48px 48px 0 0",
        padding: "32px 32px 120px 32px",
        display: "flex", flexDirection: "column", gap: 48,
        alignItems: "center", justifyContent: "flex-end",
        boxSizing: "border-box",
      }}>
        {/* Logo */}
        <SummaLogo />

        {/* Headline */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          alignItems: "center", textAlign: "center", width: "100%",
        }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Say &lsquo;yes&rsquo;{"\n"}to their dreams,{"\n"}with support from{"\n"}your community
          </h1>
          <p style={{
            fontFamily: T.font.body, fontWeight: 400, fontSize: 20, lineHeight: 1.6,
            color: T.color.primary, margin: 0,
          }}>
            Sign up for free{"\n"}and get started in minutes
          </p>
        </div>

        {/* Button group */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 32,
          alignItems: "center", width: "100%",
        }}>
          {/* Sign up — primary button (60px tall) */}
          <button onClick={onSignUp} style={{
            width: "100%", height: 60, borderRadius: T.radius.circle,
            background: "linear-gradient(90deg, #d6ff76, #eafe7e)",
            border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
            color: T.color.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            Sign up
          </button>

          {/* Sign in — text link */}
          <button onClick={onSignIn} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontFamily: T.font.body, fontSize: 16, fontWeight: 400, lineHeight: 1.2,
            color: T.color.primary, textDecoration: "underline",
          }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Sign Up
// ============================================================
function SignUpScreen({ onCreateAccount, onBack }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreate = () => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    onCreateAccount({ firstName, lastName, email, password });
  };

  const canSubmit = fullName.trim() && email.trim() && password.trim();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      padding: "80px 16px 60px 16px", boxSizing: "border-box",
      fontFamily: T.font.body, position: "relative",
    }}>
      {/* Content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", gap: 48, width: "100%",
        alignItems: "center",
      }}>
        {/* Back button */}
        <div style={{ width: "100%", maxWidth: 343 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
            <ArrowBackIcon />
          </button>
        </div>

        {/* Headline */}
        <div style={{ width: "100%", maxWidth: 343 }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            What&rsquo;s your name?
          </h1>
        </div>

        {/* Form fields — using existing InputField with floating labels */}
        <InputField label="Full name" value={fullName} onChange={setFullName} />
        <InputField label="Email" value={email} onChange={setEmail} type="email" />
        <InputField label="Password" value={password} onChange={setPassword} type="password" />
      </div>

      {/* Create account button */}
      <div style={{ width: "100%", maxWidth: 343, margin: "0 auto" }}>
        <button
          onClick={handleCreate}
          disabled={!canSubmit}
          style={{
            width: "100%", height: 60, borderRadius: T.radius.circle,
            background: canSubmit ? "linear-gradient(90deg, #d6ff76, #eafe7e)" : T.color.neutral300,
            border: canSubmit ? "1px solid #191919" : "none",
            cursor: canSubmit ? "pointer" : "default",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
            color: T.color.primary, opacity: canSubmit ? 1 : 0.5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          Create My Free Account
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Sign In
// ============================================================
function SignInScreen({ onSignIn, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim() && password.trim();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 48,
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      padding: "80px 16px 60px 16px", boxSizing: "border-box",
      fontFamily: T.font.body, position: "relative",
    }}>
      {/* Content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", gap: 48, width: "100%",
        alignItems: "center",
      }}>
        {/* Back button */}
        <div style={{ width: "100%", maxWidth: 343 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
            <ArrowBackIcon />
          </button>
        </div>

        {/* Headline */}
        <div style={{ width: "100%", maxWidth: 343 }}>
          <h1 style={{
            fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
            color: T.color.primary, margin: 0,
          }}>
            Please sign in
          </h1>
        </div>

        {/* Form fields */}
        <InputField label="Email" value={email} onChange={setEmail} type="email" />
        <InputField label="Password" value={password} onChange={setPassword} type="password" />
      </div>

      {/* Sign in button — pinned to bottom */}
      <div style={{ width: "100%", maxWidth: 343, margin: "0 auto" }}>
        <button
          onClick={() => onSignIn({ email, password })}
          disabled={!canSubmit}
          style={{
            width: "100%", height: 60, borderRadius: T.radius.circle,
            background: canSubmit ? "linear-gradient(90deg, #d6ff76, #eafe7e)" : T.color.neutral300,
            border: canSubmit ? "1px solid #191919" : "none",
            cursor: canSubmit ? "pointer" : "default",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
            color: T.color.primary, opacity: canSubmit ? 1 : 0.5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP — Screen Router with Transitions + URL Routing
// ============================================================
export default function SummaFundSetup() {
  const [showStart, setShowStart] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [screen, setScreen] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    fundFor: null,     // "myself" | "someone"
    firstName: "",
    lastName: "",
    recipientName: "",
    title: "",
    description: "",
    goal: "",
    targetDate: "",
    paymentHandles: {},
    coverImage: null,
  });
  const [slideDir, setSlideDir] = useState("right");
  const [animating, setAnimating] = useState(false);
  const [returnTo, setReturnTo] = useState(null); // screen index to return to after editing

  // ---- SESSION PERSISTENCE ----
  // On app load, check if the user has an existing session (returning user)
  useEffect(() => {
    getCurrentUser().then(({ user }) => {
      if (user) {
        const meta = user.user_metadata || {};
        setData(prev => ({
          ...prev,
          firstName: meta.first_name || prev.firstName || "",
          lastName: meta.last_name || prev.lastName || "",
          email: user.email || prev.email || "",
          userId: user.id,
        }));
        setIsSignedIn(true);
      }
    });
  }, []);

  // ---- URL ROUTING ----
  // If the URL is /fund/{slug}, load that fund from Supabase and show supporter view
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/fund\/([a-z0-9-]+)$/i);
    if (match) {
      const slug = match[1];
      setLoading(true);
      loadFundBySlug(slug).then(({ fund, error }) => {
        setLoading(false);
        if (fund) {
          // Hydrate app state with the fund data from Supabase
          setData({
            fundId: fund.id,
            fundSlug: fund.slug,
            fundFor: fund.fund_for,
            firstName: fund.first_name || "",
            lastName: fund.last_name || "",
            recipientName: fund.recipient_name || "",
            title: fund.title || "",
            description: fund.description || "",
            goal: fund.goal ? String(fund.goal) : "",
            targetDate: fund.target_date || "",
            paymentHandles: fund.payment_handles || {},
            coverImage: fund.cover_photo_url || null,
            supporterContribution: Number(fund.raised_amount) || 0,
            supporterCount: fund.supporter_count || 0,
          });
          // Skip start screen, go directly to supporter fund page
          setShowStart(false);
          setScreen(12);
        } else {
          console.warn("Fund not found:", slug, error);
          // Fund not found — show start screen as fallback
        }
      });
    }
  }, []);

  // Show loading spinner while fetching fund
  if (loading) {
    return (
      <div style={{
        background: T.gradient.bg, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16, fontFamily: T.font.body,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 40, height: 40, border: `3px solid ${T.color.neutral300}`,
          borderTopColor: T.color.primary, borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ fontFamily: T.font.heading, fontWeight: 700, fontSize: 18, color: T.color.primary, letterSpacing: 1 }}>
          summa
        </span>
      </div>
    );
  }

  const goTo = (nextScreen, dir = "right") => {
    setSlideDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setScreen(nextScreen);
      setAnimating(false);
    }, 200);
  };

  // Return to the Start screen (logo tap)
  const goHome = () => {
    setShowStart(true);
    setShowSignUp(false);
    setShowSignIn(false);
    setScreen(0);
  };

  const next = () => {
    // If we came from Review via Edit, return there instead of advancing
    if (returnTo !== null) {
      const dest = returnTo;
      setReturnTo(null);
      goTo(dest);
      return;
    }
    if (screen === 0) {
      goTo(data.fundFor === "myself" ? 1 : 2);
    } else if (screen === 1 || screen === 2) {
      goTo(3);
    } else if (screen === 3) {
      goTo(4);
    } else if (screen === 4) {
      goTo(5);
    } else if (screen === 5) {
      goTo(6);
    } else if (screen === 6) {
      goTo(7);
    } else if (screen === 7) {
      goTo(8);
    } else if (screen === 8) {
      goTo(9);
    } else if (screen === 9) {
      goTo(10);
    }
  };

  const back = () => {
    // If we came from Review via Edit, back also returns to Review
    if (returnTo !== null) {
      const dest = returnTo;
      setReturnTo(null);
      goTo(dest, "left");
      return;
    }
    if (screen === 0) return;
    if (screen === 1 || screen === 2) goTo(0, "left");
    else if (screen === 3) goTo(data.fundFor === "myself" ? 1 : 2, "left");
    else if (screen === 4) goTo(3, "left");
    else if (screen === 5) goTo(4, "left");
    else if (screen === 6) goTo(5, "left");
    else if (screen === 7) goTo(6, "left");
    else if (screen === 8) goTo(7, "left");
    else if (screen === 9) {
      // Reset
      setData({ fundFor: null, firstName: "", lastName: "", recipientName: "", title: "", description: "", goal: "", targetDate: "" });
      goTo(0, "left");
    }
  };

  const containerStyle = {
    opacity: animating ? 0 : 1,
    transform: animating ? (slideDir === "right" ? "translateX(30px)" : "translateX(-30px)") : "translateX(0)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  };

  const screens = {
    0: <SetupASummaFund0 data={data} setData={setData} onNext={next} onBack={back} goTo={goTo} />,
    1: <SetupASummaFund1aWhoMyself data={data} setData={setData} onNext={next} onBack={back} />,
    2: <SetupASummaFund1bWhoSomeone data={data} setData={setData} onNext={next} onBack={back} />,
    3: <SetupASummaFund2 data={data} setData={setData} onNext={next} onBack={back} />,
    4: <SetupASummaFund3 data={data} setData={setData} onNext={next} onBack={back} />,
    5: <SetupASummaFund4 data={data} setData={setData} onNext={next} onBack={back} />,
    6: <SetupASummaFund5AddCoverPhoto data={data} setData={setData} onNext={next} onBack={back} />,
    7: <SetupASummaFund6LinkPaymentMethods data={data} setData={setData} onNext={next} onBack={back} />,
    8: <ReviewSummaFund data={data} onNext={next} onBack={back} goTo={(dest) => { setReturnTo(8); goTo(dest); }} />,
    9: <ScreenComplete data={data} setData={setData} onNext={next} />,
    10: <FundPage data={data} goTo={goTo} goHome={goHome} isSignedIn={isSignedIn} />,
    11: <FundPageShare data={data} onBack={() => goTo(10, "left")} />,
    12: <FundPageSupporter data={data} goTo={goTo} goHome={goHome} isSignedIn={isSignedIn} />,
    13: <SupportChooseAmount data={data} setData={setData} goTo={goTo} goHome={goHome} />,
    14: <SupportPaymentMethod data={data} setData={setData} goTo={goTo} goHome={goHome} />,
    15: <SupportRecordPayment data={data} setData={setData} goTo={goTo} goHome={goHome} />,
    16: <SupportSenderDetails data={data} setData={setData} goTo={goTo} goHome={goHome} />,
    17: <SupportComplete data={data} goTo={goTo} />,
    18: <FundPageSupporterShare data={data} onBack={() => goTo(12, "left")} />,
    19: <GuardianHome data={data} setData={setData} goTo={goTo} goHome={goHome} isSignedIn={isSignedIn} />,
    20: <GuardianFundPage data={data} goTo={goTo} goHome={goHome} />,
    21: <GuardianReviewFund data={data} setData={setData} goTo={goTo} />,
    22: <SignInScreen
      onSignIn={async ({ email, password }) => {
        const { user, error } = await signInUser({ email, password });
        if (error) {
          alert(typeof error === "string" ? error : error.message || "Sign in failed. Check your email and password.");
          return;
        }
        const meta = user?.user_metadata || {};
        setData(prev => ({
          ...prev,
          email,
          firstName: meta.first_name || prev.firstName || "",
          lastName: meta.last_name || prev.lastName || "",
          userId: user?.id,
        }));
        setIsSignedIn(true);
        goTo(19);
      }}
      onBack={() => goTo(10, "left")}
    />,
  };

  if (showStart) {
    return (
      <div style={{ background: T.gradient.bg, minHeight: "100vh" }}>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`input::placeholder, textarea::placeholder { color: ${T.color.neutral700} !important; opacity: 1; }`}</style>
        {showSignUp ? (
          <SignUpScreen
            onCreateAccount={async ({ firstName, lastName, email, password }) => {
              const { user, error } = await signUpUser({ email, password, firstName, lastName });
              if (error) {
                alert(typeof error === "string" ? error : error.message || "Sign up failed. Please try again.");
                return;
              }
              setData(prev => ({ ...prev, firstName, lastName, email, userId: user?.id }));
              setIsSignedIn(true);
              setShowStart(false);
              setShowSignUp(false);
              setScreen(0);
            }}
            onBack={() => setShowSignUp(false)}
          />
        ) : showSignIn ? (
          <SignInScreen
            onSignIn={async ({ email, password }) => {
              const { user, error } = await signInUser({ email, password });
              if (error) {
                alert(typeof error === "string" ? error : error.message || "Sign in failed. Check your email and password.");
                return;
              }
              // Restore name from user metadata
              const meta = user?.user_metadata || {};
              setData(prev => ({
                ...prev,
                email,
                firstName: meta.first_name || prev.firstName || "",
                lastName: meta.last_name || prev.lastName || "",
                userId: user?.id,
              }));
              setIsSignedIn(true);
              setShowStart(false);
              setShowSignIn(false);
              setScreen(19);
            }}
            onBack={() => setShowSignIn(false)}
          />
        ) : (
          <StartScreen
            onSignUp={() => setShowSignUp(true)}
            onSignIn={() => setShowSignIn(true)}
            onJumpToLatest={() => { setShowStart(false); setScreen(12); }}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ background: T.gradient.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`input::placeholder, textarea::placeholder { color: ${T.color.neutral700} !important; opacity: 1; }`}</style>
      <div style={containerStyle}>
        {screens[screen]}
      </div>
    </div>
  );
}