import { useState, useRef, useEffect } from "react";

import { signUpUser, signInUser, getCurrentUser, signOutUser, updateUserProfile, createFund, updateFund, deleteFund, loadFundBySlug, loadFundsByCreator, getContributions, updateContributionStatus, recordContribution } from "./supabaseClient";

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
    heading: "'Poppins', sans-serif",
    body: "'Rubik', sans-serif",
  },
  radius: { circle: 999, card: 16, input: 8 },
  shadow: { card: "0 0 8px rgba(0,0,0,0.2)" },
  gradient: {
    bg: "radial-gradient(ellipse at 0% 0%, rgba(255,200,180,0.35) 0%, transparent 55%), radial-gradient(ellipse at 100% 0%, rgba(200,245,200,0.35) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(200,225,255,0.35) 0%, transparent 55%), #FFFFFF",
  },
};

// ============================================================
// SCREEN DIRECTORY (last updated: 2026-04-20)
// Sitemap #  |  Code #  |  Description
// ============================================================
//
// 1.0 MARKETING (overlay pages, not in screens map)
//   1.0  —   LandingPage .............. Home / marketing landing page
//   1.1  —   PrivacyPolicyPage ........ Privacy policy
//   1.2  —   TermsOfUsePage ........... Terms of use
//
// 2.0 AUTHENTICATION
//   2.0  —   SignUpScreen .............. Sign up (first name, last name, email, pw, phone)
//   2.1  22  SignInScreen .............. Sign in (email + password)
//
// 3.0 FUND CREATION
//   3.0   0  SetupASummaFund0 ......... Fund for — start (Myself or Someone)
//   3.1   1  SetupASummaFund1a ........ Who — Myself
//   3.2   2  SetupASummaFund1b ........ Who — Someone I care for
//   3.3   3  SetupASummaFund2 ......... Title
//   3.4   4  SetupASummaFund3 ......... Description
//   3.5   5  SetupASummaFund4 ......... Goal & target date
//   3.6   6  SetupASummaFund5 ......... Cover photo
//   3.7   7  SetupASummaFund6 ......... Payment methods
//   3.8   8  ReviewSummaFund .......... Review & publish
//   3.8.1 23 AddToPage ................ Add content block
//   3.8.2 24 EditContentBlock ......... Edit content block
//   3.9   9  ScreenComplete ........... Fund created — success
//
// 4.0 CREATOR FUND VIEW
//   4.0  10  FundPage ................. Fund page (creator view)
//   4.1  11  FundPageShare ............ Share fund link
//
// 5.0 SUPPORTER FUND VIEW
//   5.0  12  FundPageSupporter ........ Fund page (public / supporter view)
//   5.1  18  FundPageSupporterShare ... Supporter share
//
// 6.0 CONTRIBUTION FLOW
//   6.0  13  SupportChooseAmount ...... Choose amount
//   6.1  14  SupportPaymentMethod ..... Pick payment method
//   6.2  15  SupportRecordPayment ..... Record payment disclosure
//   6.3  16  SupportSenderDetails ..... Sender name & message
//   6.4  17  SupportComplete .......... Thank you / confirmation
//
// 7.0 GUARDIAN DASHBOARD
//   7.0  19  GuardianHome ............. Dashboard (list of funds)
//   7.1  20  GuardianFundPage ......... Fund detail view
//   7.2  21  GuardianReviewFund ....... Donation list / review
//   7.3  25  EditSummaFund ............ Edit existing fund
//
// 8.0 ACCOUNT
//   8.0  26  EditProfileScreen ........ Edit profile (phone, email, pw)
//
// ============================================================

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
// SHARED COMPONENTS & HOOKS
// ============================================================

// --- useIsDesktop Hook ---
function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= breakpoint);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isDesktop;
}

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
  const isDesktop = useIsDesktop();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: isDesktop ? "auto" : "100%", maxWidth: isDesktop ? undefined : 343,
      height: 60, borderRadius: T.radius.circle,
      padding: isDesktop ? "0 48px" : undefined,
      background: "linear-gradient(to right, #d6ff76, #eafe7e)",
      opacity: disabled ? 0.2 : 1,
      color: T.color.primary, border: "1px solid #191919", cursor: disabled ? "default" : "pointer",
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

// --- Rich Text Display (preserves paragraphs, bold, links) ---
function RichText({ children, style = {} }) {
  if (!children || typeof children !== "string") {
    return <span style={style}>{children}</span>;
  }
  const text = children;

  // Split into paragraphs on double-newline or single-newline
  const paragraphs = text.split(/\n\n+/);

  // Parse inline formatting within a paragraph string:
  // - **bold** or __bold__
  // - URLs become clickable links
  const parseInline = (str, keyPrefix) => {
    // Regex: match **bold**, __bold__, or URLs
    const inlineRegex = /(\*\*(.+?)\*\*|__(.+?)__|(https?:\/\/[^\s,;)]+))/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let i = 0;

    while ((match = inlineRegex.exec(str)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(str.slice(lastIndex, match.index));
      }
      if (match[2] || match[3]) {
        // Bold text
        parts.push(
          <strong key={`${keyPrefix}-b${i}`}>{match[2] || match[3]}</strong>
        );
      } else if (match[4]) {
        // URL link
        parts.push(
          <a
            key={`${keyPrefix}-a${i}`}
            href={match[4]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1a73e8", textDecoration: "underline", wordBreak: "break-all" }}
          >
            {match[4]}
          </a>
        );
      }
      lastIndex = match.index + match[0].length;
      i++;
    }
    // Remaining text
    if (lastIndex < str.length) {
      parts.push(str.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [str];
  };

  return (
    <div style={{ ...style }}>
      {paragraphs.map((para, pi) => {
        // Handle single line breaks within a paragraph
        const lines = para.split(/\n/);
        return (
          <p key={pi} style={{ margin: pi === 0 ? 0 : "12px 0 0 0" }}>
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {parseInline(line, `${pi}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// --- Draggable Image Preview (drag to reposition) ---
function DraggableImagePreview({ src, position = { x: 50, y: 50 }, onPositionChange, alt = "Preview", style = {} }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const dragging = useRef(false);
  const startPos = useRef({ clientX: 0, clientY: 0, posX: 50, posY: 50 });
  const [pos, setPos] = useState(position);
  const latestPos = useRef(position);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Sync with external position prop
  useEffect(() => { setPos(position); latestPos.current = position; }, [position.x, position.y]);

  // Hide hint after first drag
  const hideHint = () => { if (showHint) setShowHint(false); };

  const handleStart = (clientX, clientY) => {
    dragging.current = true;
    setIsDragging(true);
    hideHint();
    startPos.current = { clientX, clientY, posX: latestPos.current.x, posY: latestPos.current.y };
  };

  const handleMove = (clientX, clientY) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Convert pixel drag to percentage offset (inverted: drag right = image moves left = lower %)
    const dx = ((clientX - startPos.current.clientX) / rect.width) * -100;
    const dy = ((clientY - startPos.current.clientY) / rect.height) * -100;
    const newX = Math.max(0, Math.min(100, startPos.current.posX + dx));
    const newY = Math.max(0, Math.min(100, startPos.current.posY + dy));
    const newPos = { x: newX, y: newY };
    setPos(newPos);
    latestPos.current = newPos;
  };

  const handleEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    if (onPositionChange) onPositionChange(latestPos.current);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX, e.clientY); }}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={() => { if (dragging.current) handleEnd(); }}
      onTouchStart={(e) => { handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchEnd={handleEnd}
      style={{
        width: "100%", aspectRatio: "3/4", borderRadius: T.radius.card,
        overflow: "hidden", boxSizing: "border-box",
        cursor: isDragging ? "grabbing" : "grab",
        position: "relative", touchAction: "none",
        userSelect: "none", WebkitUserSelect: "none",
        ...style,
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          objectPosition: `${pos.x}% ${pos.y}%`,
          pointerEvents: "none",
        }}
      />
      {/* Drag hint overlay */}
      {showHint && (
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 20,
          padding: "6px 14px", display: "flex", alignItems: "center", gap: 6,
          pointerEvents: "none",
          animation: "fadeIn 0.3s ease",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: T.font.body, fontSize: 11, color: "white", whiteSpace: "nowrap" }}>
            Drag to reposition
          </span>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

// --- Screen Layout Wrapper ---
function ScreenLayout({ children, onBack, activeStep, bottomContent, gap = 32 }) {
  const isDesktop = useIsDesktop();
  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column", gap,
      width: "100%", maxWidth: isDesktop ? 520 : 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, paddingTop: isDesktop ? 60 : 80, paddingBottom: 60, paddingLeft: isDesktop ? 48 : 0, paddingRight: isDesktop ? 48 : 0, boxSizing: "border-box",
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
  const [childName, setChildName] = useState(data.recipientName || "");

  const handleContinue = () => {
    setData(d => ({ ...d, fundFor: "someone", recipientName: childName }));
    // Skip Screen 2 (recipient name) since we already collected it here — go straight to Screen 3 (title)
    goTo(3);
  };

  const handleForMe = () => {
    setData(d => ({ ...d, fundFor: "myself" }));
    // Skip name entry (Screen 1) — we already have the creator's name from sign-up
    goTo(3);
  };

  return (
    <ScreenLayout
      onBack={onBack}
      activeStep={1}
      bottomContent={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
          <ButtonPrimary text="Continue" onClick={handleContinue} disabled={!childName.trim()} />
          <span
            onClick={handleForMe}
            style={{
              fontFamily: T.font.heading,
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.2,
              color: T.color.primary,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            This fund is for me
          </span>
        </div>
      }
    >
      <Headline subtitle="First thing's first 🫡" title={"Who is this\nSumma fund for?"} />
      <InputField
        label="Child's First Name"
        value={childName}
        onChange={v => setChildName(v)}
      />
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
          <DraggableImagePreview
            src={data.coverImage}
            alt="Cover preview"
            position={data.coverImagePosition || { x: 50, y: 50 }}
            onPositionChange={(pos) => setData(d => ({ ...d, coverImagePosition: pos }))}
            style={{ border: `2px solid ${T.color.green}` }}
          />
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

function ReviewSummaFund({ data, setData, onNext, onBack, goTo, onEditBlock }) {
  const goalFormatted = data.goal
    ? `$${Number(data.goal).toLocaleString()}`
    : "$0";
  const blocks = data.contentBlocks || [];
  const hasBlocks = blocks.length > 0;

  const handleRemoveBlock = (blockId) => {
    setData(d => ({ ...d, contentBlocks: (d.contentBlocks || []).filter(b => b.id !== blockId) }));
  };

  // Plus icon for the "Add to page/plan" button
  const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

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

        {/* Overview card — label changes to "Overview" when content blocks exist */}
        <div style={{
          backgroundColor: T.color.white, borderRadius: 24,
          padding: "0 16px", width: "100%", boxSizing: "border-box",
        }}>
          {/* Cover / Overview */}
          <ReviewSection label={hasBlocks ? "Overview" : "Cover"} onEdit={() => goTo(6)}>
            <div style={{
              width: "100%", aspectRatio: "3/4", backgroundColor: T.color.white,
              border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {data.coverImage ? (
                <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
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
            <RichText style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
              {data.description || "—"}
            </RichText>
          </ReviewSection>
        </div>

        {/* Content block cards */}
        {blocks.map((block) => (
          <div key={block.id} style={{
            backgroundColor: T.color.white, borderRadius: 24,
            padding: "0 16px", width: "100%", boxSizing: "border-box",
          }}>
            {/* Remove button + Plan Item header + Edit */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 0" }}>
              <button
                onClick={() => handleRemoveBlock(block.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", gap: 4,
                }}
                aria-label="Remove plan item"
              >
                <span style={{ fontFamily: T.font.body, fontWeight: 600, fontSize: 12, color: "#E53935" }}>Remove</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="#E53935" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <EditButton onClick={() => onEditBlock(block.id)} />
            </div>
            {/* Plan Item image */}
            <div style={{ paddingBottom: 0 }}>
              {block.image && (
                <div style={{
                  width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
                  border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
                  overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src={block.image} alt={block.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(block.imagePosition || {x:50,y:50}).x}% ${(block.imagePosition || {x:50,y:50}).y}%` }} />
                </div>
              )}
            </div>

            {/* Block title + description */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              padding: "16px 0", width: "100%",
              borderTop: `1px solid ${T.color.neutral300}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.6, color: T.color.primary, flex: 1, minWidth: 0 }}>
                  {block.title || "Untitled"}
                </span>
              </div>
              {block.description && (
                <RichText style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
                  {block.description}
                </RichText>
              )}
            </div>
          </div>
        ))}

        {/* Add to page / Add to plan button */}
        <button
          onClick={() => goTo(23)}
          style={{
            backgroundColor: T.color.white, border: `2px solid #d6ff76`,
            borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
            color: T.color.primary, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, whiteSpace: "nowrap", alignSelf: "flex-start",
          }}
        >
          {hasBlocks ? "Add to plan" : "Add to page"}
          <PlusIcon />
        </button>

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
// SCREEN: Add To Page — add a content block to the fund
// ============================================================
function AddToPage({ data, setData, onBack }) {
  const fileInputRef = useRef(null);
  const [blockImage, setBlockImage] = useState(null);
  const [blockImagePosition, setBlockImagePosition] = useState({ x: 50, y: 50 });
  const [blockTitle, setBlockTitle] = useState("");
  const [blockDescription, setBlockDescription] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBlockImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setBlockImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdd = () => {
    const newBlock = {
      id: Date.now(),
      image: blockImage,
      imagePosition: blockImagePosition,
      title: blockTitle,
      description: blockDescription,
    };
    setData(d => ({ ...d, contentBlocks: [...(d.contentBlocks || []), newBlock] }));
    onBack();
  };

  const canAdd = blockTitle.trim().length > 0;

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 48, width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, paddingTop: 80, paddingBottom: 60, boxSizing: "border-box",
    }}>
      {/* Back arrow */}
      <div style={{ padding: "0 16px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "0 16px", boxSizing: "border-box" }}>
        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          <h2 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 24, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>
            Add more information{"\n"}about your plans for this fund
          </h2>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* Upload area / Preview */}
        {blockImage ? (
          <div style={{
            width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
          }}>
            <DraggableImagePreview
              src={blockImage}
              alt="Block preview"
              position={blockImagePosition}
              onPositionChange={setBlockImagePosition}
              style={{ border: `2px solid ${T.color.green}`, aspectRatio: "316/178" }}
            />
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button onClick={() => fileInputRef.current?.click()} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
                textDecoration: "underline", padding: 0,
              }}>
                Change photo
              </button>
              <button onClick={removeImage} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
                textDecoration: "underline", padding: 0,
              }}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            border: `2px solid ${T.color.neutral500}`, borderRadius: T.radius.input,
            padding: 12, display: "flex", flexDirection: "column", gap: 24,
            alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 343,
            boxSizing: "border-box", backgroundColor: T.color.white,
          }}>
            <GalleryIcon />
            <p style={{ fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
              Upload photo
            </p>
            <ButtonPrimary text="Add media" onClick={() => fileInputRef.current?.click()} />
          </div>
        )}

        {/* Title + Description inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <InputField
            label="Title"
            value={blockTitle}
            onChange={setBlockTitle}
          />
          <InputField
            label="Description"
            value={blockDescription}
            onChange={setBlockDescription}
            multiline
            characterCount
            maxChars={1000}
          />
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
        <ButtonPrimary text="Add to page" onClick={handleAdd} disabled={!canAdd} />
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
          color: T.color.primary, textDecoration: "underline", padding: 0,
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Edit Content Block (edit existing plan item)
// ============================================================
function EditContentBlock({ data, setData, blockId, onBack }) {
  const existingBlock = (data.contentBlocks || []).find(b => b.id === blockId);
  const fileInputRef = useRef(null);
  const [blockImage, setBlockImage] = useState(existingBlock?.image || null);
  const [blockImagePosition, setBlockImagePosition] = useState(existingBlock?.imagePosition || { x: 50, y: 50 });
  const [blockTitle, setBlockTitle] = useState(existingBlock?.title || "");
  const [blockDescription, setBlockDescription] = useState(existingBlock?.description || "");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBlockImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setBlockImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    setData(d => ({
      ...d,
      contentBlocks: (d.contentBlocks || []).map(b =>
        b.id === blockId
          ? { ...b, image: blockImage, imagePosition: blockImagePosition, title: blockTitle, description: blockDescription }
          : b
      ),
    }));
    onBack();
  };

  const canSave = blockTitle.trim().length > 0;

  if (!existingBlock) {
    // Block not found — go back
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p>Content block not found.</p>
        <button onClick={onBack}>Go back</button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 48, width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, paddingTop: 80, paddingBottom: 60, boxSizing: "border-box",
    }}>
      {/* Back arrow */}
      <div style={{ padding: "0 16px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "0 16px", boxSizing: "border-box" }}>
        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          <h2 style={{ fontFamily: T.font.heading, fontWeight: 500, fontSize: 24, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>
            Edit your plan item
          </h2>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* Upload area / Preview */}
        {blockImage ? (
          <div style={{
            width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
          }}>
            <DraggableImagePreview
              src={blockImage}
              alt="Block preview"
              position={blockImagePosition}
              onPositionChange={setBlockImagePosition}
              style={{ border: `2px solid ${T.color.green}`, aspectRatio: "316/178" }}
            />
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button onClick={() => fileInputRef.current?.click()} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
                textDecoration: "underline", padding: 0,
              }}>
                Change photo
              </button>
              <button onClick={removeImage} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.primary,
                textDecoration: "underline", padding: 0,
              }}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            border: `2px solid ${T.color.neutral500}`, borderRadius: T.radius.input,
            padding: 12, display: "flex", flexDirection: "column", gap: 24,
            alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 343,
            boxSizing: "border-box", backgroundColor: T.color.white,
          }}>
            <GalleryIcon />
            <p style={{ fontFamily: T.font.body, fontSize: 20, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
              Upload photo
            </p>
            <ButtonPrimary text="Add media" onClick={() => fileInputRef.current?.click()} />
          </div>
        )}

        {/* Title + Description inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <InputField
            label="Title"
            value={blockTitle}
            onChange={setBlockTitle}
          />
          <InputField
            label="Description"
            value={blockDescription}
            onChange={setBlockDescription}
            multiline
            characterCount
            maxChars={1000}
          />
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
        <ButtonPrimary text="Save changes" onClick={handleSave} disabled={!canSave} />
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
          color: T.color.primary, textDecoration: "underline", padding: 0,
        }}>
          Cancel
        </button>
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

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <line x1="6" y1="6" x2="18" y2="18" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round"/>
    <line x1="18" y1="6" x2="6" y2="18" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function HamburgerMenu({ isSignedIn, goTo, goHome, currentScreen }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Menu">
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 998,
          }} />
          {/* Menu dropdown */}
          <div style={{
            position: "absolute", top: 36, right: 0, zIndex: 999,
            backgroundColor: "#fff", borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            border: `1px solid ${T.color.neutral500}`,
            minWidth: 200, overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            {isSignedIn && (
              <button onClick={() => { setOpen(false); goTo(26); }} style={{
                background: "none", border: "none", borderBottom: `1px solid ${T.color.neutral500}`,
                padding: "16px 20px", cursor: "pointer", textAlign: "left",
                fontFamily: T.font.body, fontSize: 15, fontWeight: 500, color: T.color.primary,
              }}>
                Edit Profile
              </button>
            )}
            <button onClick={() => { setOpen(false); goHome(); }} style={{
              background: "none", border: "none", borderBottom: `1px solid ${T.color.neutral500}`,
              padding: "16px 20px", cursor: "pointer", textAlign: "left",
              fontFamily: T.font.body, fontSize: 15, fontWeight: 500, color: T.color.primary,
            }}>
              Home
            </button>
            {isSignedIn && (
              <button onClick={() => { setOpen(false); goTo(19); }} style={{
                background: "none", border: "none",
                padding: "16px 20px", cursor: "pointer", textAlign: "left",
                fontFamily: T.font.body, fontSize: 15, fontWeight: 500, color: T.color.primary,
              }}>
                Dashboard
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

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
        <HamburgerMenu isSignedIn={isSignedIn} goTo={goTo} goHome={goHome} currentScreen={10} />
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
          width: "100%", aspectRatio: "3/4", backgroundColor: T.color.white,
          border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {data.coverImage ? (
            <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 375 500" preserveAspectRatio="xMidYMid slice">
              <rect width="375" height="500" fill={T.color.neutral300} />
              <polygon points="75,420 160,180 250,420" fill="white" opacity="0.6" />
              <polygon points="200,420 265,250 330,420" fill="white" opacity="0.4" />
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
          width: "100%", backgroundColor: "rgba(255,255,255,0.6)",
          borderRadius: 8, padding: 16, boxSizing: "border-box",
        }}>
          <RichText style={{
            fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
            color: T.color.primary,
          }}>
            {data.description || "No description provided."}
          </RichText>
        </div>

        {/* Content Blocks — "More info about this fund" */}
        {(data.contentBlocks || []).length > 0 && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 24, width: "100%",
            padding: "24px 0",
          }}>
            <h2 style={{
              fontFamily: T.font.heading, fontWeight: 700, fontSize: 20, lineHeight: 1.4,
              color: T.color.primary, margin: 0, textAlign: "center", width: "100%",
            }}>
              More info about this fund
            </h2>
            {(data.contentBlocks || []).map((block) => (
              <div key={block.id} style={{
                display: "flex", flexDirection: "column", width: "100%",
                borderRadius: 16, overflow: "hidden",
              }}>
                {block.image && (
                  <div style={{
                    width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
                    border: `1px solid ${T.color.neutral500}`, borderRadius: "16px 16px 0 0",
                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img src={block.image} alt={block.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(block.imagePosition || {x:50,y:50}).x}% ${(block.imagePosition || {x:50,y:50}).y}%` }} />
                  </div>
                )}
                <div style={{
                  backgroundColor: "rgba(255,255,255,0.6)", padding: 16,
                  display: "flex", flexDirection: "column", gap: 10,
                  boxSizing: "border-box",
                }}>
                  {block.title && (
                    <p style={{
                      fontFamily: T.font.body, fontWeight: 700, fontSize: 20, lineHeight: 1.6,
                      color: T.color.primary, margin: 0,
                    }}>
                      {block.title}
                    </p>
                  )}
                  {block.description && (
                    <RichText style={{
                      fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
                      color: T.color.primary,
                    }}>
                      {block.description}
                    </RichText>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
              navigator.clipboard.writeText(fundUrl).catch(() => {});
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

  // Derive the recipient's first name for the CTA button
  const recipientFirstName = data.fundFor === "someone" && data.recipientName
    ? data.recipientName.split(/\s+/)[0]
    : data.firstName || null;
  const ctaText = recipientFirstName ? `Support ${recipientFirstName}` : "Support this fund";

  const supporterCount = data.supporterCount || 0;
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fundUrl = data.fundSlug ? `${window.location.origin}/fund/${data.fundSlug}` : window.location.href;

  const handleShare = async () => {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          text: `Support ${displayName} on Summa!`,
          url: fundUrl,
        });
        return; // User completed or cancelled native share
      } catch (e) {
        // User cancelled or share failed — fall through to modal
      }
    }
    // Fallback: show share modal
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fundUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = fundUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleShareViaText = () => {
    window.open(`sms:?body=${encodeURIComponent(`Support ${displayName} on Summa! ${fundUrl}`)}`, "_blank");
    setShowShareModal(false);
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(`Support ${displayName} on Summa`);
    const body = encodeURIComponent(`Hi! I'd love your support for ${displayName}.\n\nCheck it out here: ${fundUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    setShowShareModal(false);
  };

  const isDesktop = useIsDesktop();

  // Shared content sections rendered in both desktop right column and mobile content card
  const renderFundContent = () => (<>
        {/* Progress Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span style={{ fontFamily: T.font.body, fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: T.color.primary }}>
              {raisedFormatted} raised
            </span>
            <span style={{ fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4, color: T.color.neutral700 }}>
              {goalFormatted} goal
            </span>
          </div>
          <div style={{
            width: "100%", height: 8, backgroundColor: "#e8e8e8",
            borderRadius: 4, overflow: "hidden", position: "relative",
          }}>
            {totalPct > confirmedPct && (
              <div style={{
                position: "absolute", left: 0, top: 0,
                width: `${Math.max(totalPct, 0.3)}%`, height: "100%",
                backgroundColor: "#e7fd57", borderRadius: 4, opacity: 0.35,
                transition: "width 0.6s ease",
              }} />
            )}
            <div style={{
              position: "absolute", left: 0, top: 0,
              width: `${Math.max(confirmedPct, confirmed > 0 ? 0.3 : 0)}%`, height: "100%",
              backgroundColor: "#e7fd57", borderRadius: 4, transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{ fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4, color: T.color.neutral700 }}>
            {supporterCount} {supporterCount === 1 ? "supporter" : "supporters"}
          </span>
        </div>

        {/* Description */}
        <div style={{
          width: "100%", backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: 16, padding: 20, boxSizing: "border-box",
        }}>
          <RichText style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.5, color: T.color.primary }}>
            {data.description || "No description provided."}
          </RichText>
        </div>

        {/* Content Blocks — "More info about this fund" */}
        {(data.contentBlocks || []).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
            <h2 style={{
              fontFamily: T.font.heading, fontWeight: 700, fontSize: 20, lineHeight: 1.4,
              color: "#131820", margin: 0, textAlign: "left", width: "100%",
            }}>
              More info about this fund
            </h2>
            {(data.contentBlocks || []).map((block) => (
              <div key={block.id} style={{
                display: "flex", flexDirection: "column", width: "100%",
                borderRadius: 16, overflow: "hidden",
              }}>
                {block.image && (
                  <div style={{
                    width: "100%", aspectRatio: "480/270", backgroundColor: T.color.neutral300,
                    borderRadius: 16, overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img src={block.image} alt={block.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(block.imagePosition || {x:50,y:50}).x}% ${(block.imagePosition || {x:50,y:50}).y}%` }} />
                  </div>
                )}
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
                  {block.title && (
                    <p style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 20, lineHeight: 1.6, color: T.color.primary, margin: 0 }}>
                      {block.title}
                    </p>
                  )}
                  {block.description && (
                    <RichText style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
                      {block.description}
                    </RichText>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Latest Activity Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          <h3 style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: 20, lineHeight: 1.4,
            color: T.color.primary, margin: 0, textAlign: "left",
          }}>
            Latest activity
          </h3>
          {(data.donations || []).length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4, color: T.color.primary }}>
                Be the first to support!
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(data.donations || []).map((donation) => {
                const initial = (donation.name || "A").charAt(0).toUpperCase();
                return (
                  <div key={donation.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #d6ff76, #eafe7e)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 14, color: T.color.primary, lineHeight: 1 }}>
                        {initial}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0, paddingTop: (36 - 14 * 1.4) / 2 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 14, lineHeight: 1.4, color: T.color.primary }}>
                          {donation.name} donated ${donation.amount.toLocaleString()}
                        </span>
                        <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>
                          {donation.time}
                        </span>
                      </div>
                      {donation.message && (
                        <p style={{ fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4, color: T.color.primary, margin: 0, opacity: 0.8 }}>
                          {donation.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Organizer Section — white card with Contact button */}
        <div style={{
          backgroundColor: T.color.white, borderRadius: 16, padding: 24,
          width: "100%", boxSizing: "border-box",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 20, flexShrink: 0,
                backgroundColor: T.color.neutral300, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 16, color: T.color.primary, lineHeight: 1 }}>
                  {(organizer || "O").charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: T.color.neutral700 }}>
                  Organized by
                </span>
                <span style={{ fontFamily: T.font.body, fontWeight: 600, fontSize: 14, lineHeight: 1.4, color: T.color.primary }}>
                  {organizer}
                </span>
              </div>
            </div>
            <button onClick={() => {
              const email = data.email || "";
              if (email) window.open(`mailto:${email}`, "_blank");
            }} style={{
              backgroundColor: T.color.white, border: "2px solid #eafe7e",
              borderRadius: T.radius.circle, padding: "16px 24px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 14, fontWeight: 400, lineHeight: 1.4,
              color: "#131820", whiteSpace: "nowrap",
            }}>
              Contact
            </button>
          </div>
        </div>

        {/* Report this Summa Fund */}
        <p style={{ fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4, color: "#000", margin: 0, width: "100%" }}>
          🚩{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>Report this Summa Fund</span>
        </p>
  </>);

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 0, alignItems: "center", paddingTop: 0, paddingBottom: isDesktop ? 48 : 0,
      width: "100%", maxWidth: isDesktop ? 1200 : undefined, minHeight: isDesktop ? "auto" : "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Share Modal Overlay */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 375, backgroundColor: T.color.white,
              borderRadius: "24px 24px 0 0", padding: "24px 16px 40px",
              display: "flex", flexDirection: "column", gap: 20,
              boxSizing: "border-box",
              animation: "slideUp 0.25s ease",
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

            {/* Drag handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.color.neutral300, alignSelf: "center" }} />

            {/* Title */}
            <h3 style={{
              fontFamily: T.font.heading, fontWeight: 500, fontSize: 20, lineHeight: 1.4,
              color: T.color.primary, margin: 0, textAlign: "center",
            }}>
              Share this fund
            </h3>

            {/* Fund URL preview */}
            <div style={{
              backgroundColor: "rgba(143,143,143,0.1)", borderRadius: 8, padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <span style={{
                fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4, color: T.color.neutral700,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
              }}>
                {fundUrl}
              </span>
              <button onClick={handleCopyLink} style={{
                backgroundColor: linkCopied ? T.color.green : T.color.white,
                border: `2px solid ${linkCopied ? T.color.green : "#d6ff76"}`,
                borderRadius: T.radius.circle, padding: "6px 12px", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
                color: T.color.primary, whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}>
                {linkCopied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Share options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={handleShareViaText} style={{
                width: "100%", height: 51, borderRadius: T.radius.circle,
                backgroundColor: T.color.primary, color: T.color.white,
                border: "none", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send via text
              </button>

              <button onClick={handleShareViaEmail} style={{
                width: "100%", height: 51, borderRadius: T.radius.circle,
                backgroundColor: "transparent", color: T.color.primary,
                border: `2px solid ${T.color.primary}`, cursor: "pointer",
                fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send via email
              </button>
            </div>

            {/* Cancel */}
            <button onClick={() => setShowShareModal(false)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
              color: T.color.primary, textDecoration: "underline", padding: 0,
              alignSelf: "center",
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== DESKTOP LAYOUT ===== */}
      {isDesktop && (<>
        {/* Desktop Header — "with Summa" tag + Share */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "16px 48px", boxSizing: "border-box",
        }}>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 8,
            padding: 8, height: 36, display: "flex", alignItems: "center",
          }}>
            <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: "#000" }}>
              This funding plan was created{" "}
              <a href="https://withsumma.com" target="_blank" rel="noopener noreferrer" style={{ color: "#000", textDecoration: "underline" }}>with Summa</a>
            </span>
          </div>
          <button onClick={handleShare} style={{
            backgroundColor: T.color.white, border: "2px solid #d6ff76",
            borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
            color: T.color.primary, whiteSpace: "nowrap",
          }}>
            Share
          </button>
        </div>

        {/* Desktop Two-column body */}
        <div style={{
          display: "flex", flexDirection: "row", gap: 48, alignItems: "stretch",
          width: "100%", padding: "24px 48px 48px", boxSizing: "border-box",
        }}>
          {/* LEFT COLUMN — Cover Image */}
          <div style={{
            flex: 1, position: "sticky", top: 80, alignSelf: "flex-start",
            height: "calc(100vh - 128px)", display: "flex", flexDirection: "column",
          }}>
            <div style={{
              width: "100%", height: "100%", backgroundColor: T.color.white, borderRadius: 16,
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {data.coverImage ? (
                <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
              ) : (
                <svg width="100%" height="100%" viewBox="0 0 375 500" preserveAspectRatio="xMidYMid slice">
                  <rect width="375" height="500" fill={T.color.neutral300} />
                  <polygon points="75,420 160,180 250,420" fill="white" opacity="0.6" />
                  <polygon points="200,420 265,250 330,420" fill="white" opacity="0.4" />
                </svg>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Content */}
          <div style={{
            flex: "0 0 480px", display: "flex", flexDirection: "column", gap: 24,
            alignItems: "flex-start", width: "100%", boxSizing: "border-box",
          }}>
            <div style={{ width: "100%", textAlign: "left" }}>
              <h1 style={{ fontFamily: T.font.heading, fontWeight: 700, fontSize: 32, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>
                {displayName}
              </h1>
            </div>
            <ButtonPrimary text={ctaText} onClick={() => goTo(13)} />
            {renderFundContent()}
          </div>
        </div>
      </>)}

      {/* ===== MOBILE LAYOUT ===== */}
      {!isDesktop && (<>
        {/* Mobile Full-bleed cover with overlay header */}
        <div style={{ position: "relative", width: "100%", marginBottom: -24 }}>
          <div style={{
            width: "100%", height: 500, backgroundColor: T.color.neutral300,
            border: `1px solid ${T.color.neutral500}`,
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {data.coverImage ? (
              <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 375 500" preserveAspectRatio="xMidYMid slice">
                <rect width="375" height="500" fill={T.color.neutral300} />
                <polygon points="75,420 160,180 250,420" fill="white" opacity="0.6" />
                <polygon points="200,420 265,250 330,420" fill="white" opacity="0.4" />
              </svg>
            )}
          </div>
          {/* Overlay header */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: 16, boxSizing: "border-box",
          }}>
            <div style={{
              backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 8,
              padding: 8, height: 36, display: "flex", alignItems: "center",
            }}>
              <span style={{ fontFamily: T.font.body, fontSize: 12, lineHeight: 1.4, color: "#000" }}>
                This funding plan was created{" "}
                <a href="https://withsumma.com" target="_blank" rel="noopener noreferrer" style={{ color: "#000", textDecoration: "underline" }}>with Summa</a>
              </span>
            </div>
            <button onClick={handleShare} style={{
              backgroundColor: T.color.white, border: "2px solid #d6ff76",
              borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
              color: T.color.primary, whiteSpace: "nowrap",
            }}>
              Share
            </button>
          </div>
        </div>

        {/* Mobile Content card — overlaps cover image, rounded top corners */}
        <div style={{
          position: "relative", width: "100%",
          borderRadius: "24px 24px 0 0", overflow: "hidden",
          display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
          padding: "24px 16px 48px", boxSizing: "border-box",
          background: T.gradient.bg,
        }}>
          <div style={{ width: "100%", textAlign: "left" }}>
            <h1 style={{ fontFamily: T.font.heading, fontWeight: 700, fontSize: 28, lineHeight: 1.4, color: T.color.primary, margin: 0 }}>
              {displayName}
            </h1>
          </div>
          <ButtonPrimary text={ctaText} onClick={() => goTo(13)} />
          {renderFundContent()}
        </div>
      </>)}
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const fundUrl = data.fundSlug ? `${window.location.origin}/fund/${data.fundSlug}` : window.location.href;
  const displayName = data.title || "My Summa Fund";

  const handleShareVia = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, text: message, url: fundUrl });
        return;
      } catch (e) { /* cancelled */ }
    }
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fundUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {});
  };

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
          <button onClick={handleShareVia} style={{
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

      {/* Share Modal Overlay */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 375, backgroundColor: T.color.white,
              borderRadius: "24px 24px 0 0", padding: "24px 16px 40px",
              display: "flex", flexDirection: "column", gap: 20,
              boxSizing: "border-box",
              animation: "slideUp 0.25s ease",
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.color.neutral300, alignSelf: "center" }} />
            <h3 style={{
              fontFamily: T.font.heading, fontWeight: 500, fontSize: 20, lineHeight: 1.4,
              color: T.color.primary, margin: 0, textAlign: "center",
            }}>
              Share this fund
            </h3>
            <div style={{
              backgroundColor: "rgba(143,143,143,0.1)", borderRadius: 8, padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <span style={{
                fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4, color: T.color.neutral700,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
              }}>
                {fundUrl}
              </span>
              <button onClick={handleCopyLink} style={{
                backgroundColor: linkCopied ? T.color.green : T.color.white,
                border: `2px solid ${linkCopied ? T.color.green : "#d6ff76"}`,
                borderRadius: T.radius.circle, padding: "6px 12px", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
                color: T.color.primary, whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}>
                {linkCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => {
                window.open(`sms:?body=${encodeURIComponent(`${message}\n\n${fundUrl}`)}`, "_blank");
                setShowShareModal(false);
              }} style={{
                width: "100%", height: 51, borderRadius: T.radius.circle,
                backgroundColor: T.color.primary, color: T.color.white,
                border: "none", cursor: "pointer",
                fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send via text
              </button>
              <button onClick={() => {
                const subject = encodeURIComponent(`Support ${displayName} on Summa`);
                const body = encodeURIComponent(`${message}\n\nCheck it out here: ${fundUrl}`);
                window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
                setShowShareModal(false);
              }} style={{
                width: "100%", height: 51, borderRadius: T.radius.circle,
                backgroundColor: "transparent", color: T.color.primary,
                border: `2px solid ${T.color.primary}`, cursor: "pointer",
                fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send via email
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
              color: T.color.primary, textDecoration: "underline", padding: 0,
              alignSelf: "center",
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// SCREEN: Guardian Dashboard (Home)
// ============================================================
function GuardianHome({ data, setData, goTo, goHome, isSignedIn, refreshKey }) {
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
  }, [refreshKey]);

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
      coverImagePosition: fund.cover_image_position || { x: 50, y: 50 },
      contentBlocks: fund.content_blocks || [],
      supporterContribution: confirmedTotal,
      supporterCount: donations.length,
      pendingContribution: pendingTotal,
      donations,
    }));
    goTo(20);
  };

  const isDesktop = useIsDesktop();

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 24, alignItems: "center", paddingTop: 48, paddingBottom: 48,
      width: "100%", maxWidth: isDesktop ? 1200 : 375, minHeight: "100vh", margin: "0 auto",
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
        <HamburgerMenu isSignedIn={isSignedIn} goTo={goTo} goHome={goHome} currentScreen={19} />
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
            onClick={() => {
              // Reset all fund data so the new fund starts fresh
              setData({
                fundFor: null, firstName: data.firstName || "", lastName: data.lastName || "",
                recipientName: "", title: "", description: "", goal: "", targetDate: "",
                paymentHandles: {}, coverImage: null, coverImagePosition: { x: 50, y: 50 },
                contentBlocks: [], email: data.email || "", userId: data.userId || null,
              });
              goTo(0);
            }}
            style={{
              width: isDesktop ? "auto" : "100%", height: 60, borderRadius: T.radius.circle,
              padding: isDesktop ? "0 48px" : undefined,
              background: "linear-gradient(90deg, #d6ff76, #eafe7e)",
              border: "1px solid #191919", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
              color: T.color.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            Create a fund
          </button>
        </div>

        {/* Hosting section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: isDesktop ? "0 48px" : "0 16px", width: "100%", boxSizing: "border-box" }}>
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

          <div style={{
            display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr", gap: 16,
            width: "100%", boxSizing: "border-box",
          }}>
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
                    padding: 16, display: "flex", flexDirection: isDesktop ? "column" : "row", gap: isDesktop ? 12 : 10, alignItems: isDesktop ? "flex-start" : "center",
                    cursor: "pointer", width: isDesktop ? "100%" : 343, boxSizing: "border-box",
                  }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: isDesktop ? "100%" : 80, height: isDesktop ? 200 : 80, borderRadius: 16, backgroundColor: T.color.neutral300,
                  flexShrink: 0, overflow: "hidden", aspectRatio: isDesktop ? "1/1" : undefined,
                }}>
                  {fund.cover_photo_url && (
                    <img src={fund.cover_photo_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(fund.cover_image_position || {x:50,y:50}).x}% ${(fund.cover_image_position || {x:50,y:50}).y}%` }} />
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
        </div>

        {/* Supporting section */}
        <div style={{ padding: isDesktop ? "0 48px" : "0 16px", width: "100%", boxSizing: "border-box" }}>
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
  const isDesktop = useIsDesktop();

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      gap: 0, alignItems: "center", paddingTop: 0, paddingBottom: 48,
      width: "100%", maxWidth: isDesktop ? 1200 : 375, minHeight: isDesktop ? "auto" : "100vh", margin: "0 auto",
      fontFamily: T.font.body, boxSizing: "border-box",
    }}>
      {/* Header: back + pill buttons */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: isDesktop ? "16px 48px" : "16px 16px", boxSizing: "border-box",
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
            onClick={() => goTo(25)}
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

      {/* Two-column wrapper (desktop) / single column (mobile) */}
      <div style={{
        display: "flex", flexDirection: isDesktop ? "row" : "column",
        gap: isDesktop ? 48 : 24, alignItems: isDesktop ? "flex-start" : "center",
        width: "100%", padding: isDesktop ? "24px 48px 0" : "0", boxSizing: "border-box",
      }}>

      {/* LEFT COLUMN (Cover Image) - Desktop: sticky sidebar */}
      {isDesktop && (
        <div style={{
          flex: 1, position: "sticky", top: 80, maxHeight: "calc(100vh - 128px)",
          display: "flex", flexDirection: "column", gap: 0,
        }}>
          <div style={{
            width: "100%", aspectRatio: "3/4", backgroundColor: T.color.white,
            border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {data.coverImage ? (
              <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 375 500" preserveAspectRatio="xMidYMid slice">
                <rect width="375" height="500" fill={T.color.neutral300} />
                <polygon points="75,420 160,180 250,420" fill="white" opacity="0.6" />
                <polygon points="200,420 265,250 330,420" fill="white" opacity="0.4" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* RIGHT COLUMN (Content) */}
      <div style={{
        flex: isDesktop ? 1 : undefined, maxWidth: isDesktop ? 520 : undefined,
        display: "flex", flexDirection: "column", gap: 24, alignItems: isDesktop ? "flex-start" : "center",
        padding: isDesktop ? 0 : "0 16px", width: isDesktop ? "100%" : "100%", boxSizing: "border-box",
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

        {/* Cover Image (Mobile only) */}
        {!isDesktop && (
          <div style={{
            width: "100%", aspectRatio: "3/4", backgroundColor: T.color.white,
            border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          {data.coverImage ? (
            <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 375 500" preserveAspectRatio="xMidYMid slice">
              <rect width="375" height="500" fill={T.color.neutral300} />
              <polygon points="75,420 160,180 250,420" fill="white" opacity="0.6" />
              <polygon points="200,420 265,250 330,420" fill="white" opacity="0.4" />
            </svg>
          )}
        </div>
        )}

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
          width: "100%", backgroundColor: "rgba(255,255,255,0.6)",
          borderRadius: 8, padding: 16, boxSizing: "border-box",
        }}>
          <RichText style={{
            fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
            color: T.color.primary,
          }}>
            {data.description || "No description provided."}
          </RichText>
        </div>

        {/* Content Blocks — "More info about this fund" */}
        {(data.contentBlocks || []).length > 0 && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 24, width: "100%",
            padding: "24px 0",
          }}>
            <h2 style={{
              fontFamily: T.font.heading, fontWeight: 700, fontSize: 20, lineHeight: 1.4,
              color: T.color.primary, margin: 0, textAlign: "center", width: "100%",
            }}>
              More info about this fund
            </h2>
            {(data.contentBlocks || []).map((block) => (
              <div key={block.id} style={{
                display: "flex", flexDirection: "column", width: "100%",
                borderRadius: 16, overflow: "hidden",
              }}>
                {block.image && (
                  <div style={{
                    width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
                    border: `1px solid ${T.color.neutral500}`, borderRadius: "16px 16px 0 0",
                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img src={block.image} alt={block.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(block.imagePosition || {x:50,y:50}).x}% ${(block.imagePosition || {x:50,y:50}).y}%` }} />
                  </div>
                )}
                <div style={{
                  backgroundColor: "rgba(255,255,255,0.6)", padding: 16,
                  display: "flex", flexDirection: "column", gap: 10,
                  boxSizing: "border-box",
                }}>
                  {block.title && (
                    <p style={{
                      fontFamily: T.font.body, fontWeight: 700, fontSize: 20, lineHeight: 1.6,
                      color: T.color.primary, margin: 0,
                    }}>
                      {block.title}
                    </p>
                  )}
                  {block.description && (
                    <RichText style={{
                      fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6,
                      color: T.color.primary,
                    }}>
                      {block.description}
                    </RichText>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* END RIGHT COLUMN */}
      </div>{/* END Two-column wrapper */}
    </div>
  );
}

// ============================================================
// SCREEN: Edit Summa Fund (guardian edits an existing fund)
// ============================================================
function EditSummaFund({ data, setData, onBack, goTo, onEditBlock, onSave, onDelete }) {
  const goalFormatted = data.goal
    ? `$${Number(data.goal).toLocaleString()}`
    : "$0";
  const blocks = data.contentBlocks || [];
  const hasBlocks = blocks.length > 0;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRemoveBlock = (blockId) => {
    setData(d => ({ ...d, contentBlocks: (d.contentBlocks || []).filter(b => b.id !== blockId) }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this fund? This action cannot be undone.")) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  // Plus icon for "Add to plan" button
  const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke={T.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Trash icon for delete
  const TrashIcon = ({ color = "#E53935", size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div style={{
      backgroundColor: "transparent", display: "flex", flexDirection: "column",
      width: "100%", maxWidth: 375, minHeight: "100vh", margin: "0 auto",
      fontFamily: T.font.body, paddingTop: 48, boxSizing: "border-box",
    }}>
      {/* Header: back arrow + fund title */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 16px 24px", boxSizing: "border-box",
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
        <h1 style={{
          fontFamily: T.font.heading, fontWeight: 700, fontSize: 22, lineHeight: 1.4,
          color: T.color.primary, margin: 0, flex: 1, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {data.title || "My Summa Fund"}
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "0 16px", boxSizing: "border-box" }}>
        {/* Overview card */}
        <div style={{
          backgroundColor: T.color.white, borderRadius: 24,
          padding: "0 16px", width: "100%", boxSizing: "border-box",
        }}>
          {/* Cover / Overview */}
          <ReviewSection label={hasBlocks ? "Overview" : "Cover"} onEdit={() => goTo(6)}>
            <div style={{
              width: "100%", aspectRatio: "3/4", backgroundColor: T.color.white,
              border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {data.coverImage ? (
                <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
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
            <RichText style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
              {data.description || "—"}
            </RichText>
          </ReviewSection>
        </div>

        {/* Content block cards */}
        {blocks.map((block) => (
          <div key={block.id} style={{
            backgroundColor: T.color.white, borderRadius: 24,
            padding: "0 16px", width: "100%", boxSizing: "border-box",
          }}>
            {/* Remove button + Plan Item header + Edit */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 0" }}>
              <button
                onClick={() => handleRemoveBlock(block.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", gap: 4,
                }}
                aria-label="Remove plan item"
              >
                <span style={{ fontFamily: T.font.body, fontWeight: 600, fontSize: 12, color: "#E53935" }}>Remove</span>
                <TrashIcon />
              </button>
              <EditButton onClick={() => onEditBlock(block.id)} />
            </div>
            {/* Plan Item image */}
            <div style={{ paddingBottom: 0 }}>
              {block.image && (
                <div style={{
                  width: "100%", aspectRatio: "316/178", backgroundColor: T.color.white,
                  border: `1px solid ${T.color.neutral500}`, borderRadius: 16,
                  overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src={block.image} alt={block.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(block.imagePosition || {x:50,y:50}).x}% ${(block.imagePosition || {x:50,y:50}).y}%` }} />
                </div>
              )}
            </div>

            {/* Block title + description */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              padding: "16px 0", width: "100%",
              borderTop: `1px solid ${T.color.neutral300}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span style={{ fontFamily: T.font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.6, color: T.color.primary, flex: 1, minWidth: 0 }}>
                  {block.title || "Untitled"}
                </span>
              </div>
              {block.description && (
                <RichText style={{ fontFamily: T.font.body, fontSize: 16, lineHeight: 1.6, color: T.color.primary }}>
                  {block.description}
                </RichText>
              )}
            </div>
          </div>
        ))}

        {/* Add to plan button */}
        <button
          onClick={() => goTo(23)}
          style={{
            backgroundColor: T.color.white, border: `2px solid #d6ff76`,
            borderRadius: T.radius.circle, padding: "8px 16px", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 12, fontWeight: 400, lineHeight: 1.4,
            color: T.color.primary, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, whiteSpace: "nowrap", alignSelf: "flex-start",
          }}
        >
          Add to plan
          <PlusIcon />
        </button>

        {/* Save Changes CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%", paddingBottom: 24 }}>
          <ButtonPrimary text={saving ? "Saving..." : "Save Changes"} onClick={handleSave} disabled={saving} />
        </div>

        {/* Delete this fund */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 60 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: "none", border: "none", cursor: deleting ? "default" : "pointer",
              padding: 0, display: "flex", alignItems: "center", gap: 6,
              opacity: deleting ? 0.5 : 1,
            }}
          >
            <span style={{ fontFamily: T.font.body, fontWeight: 600, fontSize: 14, color: "#E53935" }}>
              {deleting ? "Deleting..." : "Delete this fund"}
            </span>
            <TrashIcon color="#E53935" size={16} />
          </button>
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
              <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(data.coverImagePosition || {x:50,y:50}).x}% ${(data.coverImagePosition || {x:50,y:50}).y}%` }} />
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
// LANDING PAGE — Marketing Home (1.0 Home from Figma)
// ============================================================

// Landing page image assets
const LANDING_IMAGES = {
  heroBg: "/summa-hero.png",
  providers: {
    nySociety: "https://www.figma.com/api/mcp/asset/b7535dc8-7585-4cf9-aa44-31a3e10eeb60",
    devoreDance: "https://www.figma.com/api/mcp/asset/f5ca2262-b600-4d4b-9457-fd147137a59e",
    bricks4kids: "https://www.figma.com/api/mcp/asset/991191a5-5765-46ac-923d-2c58094fc145",
    whyHateMath: "https://www.figma.com/api/mcp/asset/ef6efa65-f1dc-49e0-bd87-cffb99867095",
    binnsMartial: "https://www.figma.com/api/mcp/asset/8c6f9f31-2485-4fae-9450-95700e95542d",
  },
};

const PROVIDER_DATA = [
  { name: "NY Society of Play", address: "724 Manhattan Ave, Brooklyn, NY 11222", color: "#8bd5ff", image: LANDING_IMAGES.providers.nySociety, url: "https://nyplays.org/", desc: "A unique space for kids 6+ to enjoy board games, role-playing, and storytelling. After-school, weekend, and break programs in a cozy, welcoming setting." },
  { name: "Devore Dance", address: "Flatbush, Brooklyn 11203", color: "#ffa1c9", image: LANDING_IMAGES.providers.devoreDance, url: "https://www.devoredancecenter.com/", desc: "A beloved dance studio in Hollis, Queens serving local families for generations. Saturday classes for ages 4+ in a dedicated space that encourages creativity." },
  { name: "Bricks 4 Kidz", address: "114-02 Guy R Brewer Blvd Suite 224, Rochdale, NY 11434", color: "#e7fd57", image: LANDING_IMAGES.providers.bricks4kids, url: "https://bricks4kidz.us/newyork-jamaica/", desc: "A hands-on STEM program at the Multi Service Center in South Jamaica, Queens. After-school and summer sessions focused on building and problem-solving." },
  { name: "Why Hate Math", address: "304 Tompkins Ave, Brooklyn, NY 11216", color: "#93fff9", image: LANDING_IMAGES.providers.whyHateMath, url: "https://www.whyhatemath.com/", desc: "A friendly center for kids 6+ offering one-on-one and group sessions, homework help, and school break camps to keep them learning year-round." },
  { name: "Binns Victory Martial Arts", address: "Flatbush, Brooklyn 11203", color: "#ff9b82", image: LANDING_IMAGES.providers.binnsMartial, url: "https://flatbushkaratekids.com/", desc: "A family-owned karate dojo in Flatbush, Brooklyn with classes for ages 2\u201317+. Discounted intro sessions and free Baby Cubs trials for ages 2\u20134." },
];

const FAQ_DATA = [
  {
    question: "What makes Summa special?",
    answer: "Most fundraising platforms are built around need. Summa is built around joy. We help parents share the cost of the experiences that build memories with their child — sports, camps, lessons, and more. Summa is designed to make it easy to tap into your circle — the friends and family who already love your child and want to be an active part of their growth.",
  },
  {
    question: "Does Summa process payments?",
    answer: "No. Summa does not process or hold any money. When someone supports your fund, they send money directly to you through the payment methods you've set up — like Venmo, Cash App, or Zelle. Summa simply helps you organize, share, and track your fund.",
  },
  {
    question: "Does Summa cost money?",
    answer: "Nope — Summa is completely free.",
  },
  {
    question: "Do I need an account to contribute to someone's fund?",
    answer: "No, you don't need to sign up to give. But creating a free account gives you access to extras like setting up your own fund and tracking fund progress.",
  },
];

// Social icon SVGs for provider cards and footer
const GlobeIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#131820" strokeWidth="1.5"/>
    <path d="M2 12h20M12 2c2.5 2.5 4 5.5 4 10s-1.5 7.5-4 10c-2.5-2.5-4-5.5-4-10s1.5-7.5 4-10z" stroke="#131820" strokeWidth="1.5"/>
  </svg>
);
const TikTokIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 12a4 4 0 1 0 4 4V4c1 2.5 3.5 4 6 4" stroke="#131820" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const InstagramIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#131820" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" stroke="#131820" strokeWidth="1.5"/>
    <circle cx="17.5" cy="6.5" r="1" fill="#131820"/>
  </svg>
);
const FacebookIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" stroke="#131820" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ProviderCard({ provider, isDesktop }) {
  return (
    <div style={{
      backgroundColor: provider.color,
      borderRadius: 24, padding: 24,
      display: "flex", flexDirection: "column", gap: 24,
      width: isDesktop ? 343 : 300, minWidth: isDesktop ? 343 : 300, flexShrink: 0,
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isDesktop ? 24 : 20,
            lineHeight: 1.4, color: "#131820", margin: 0, textDecoration: "none",
          }}
        >
          {provider.name}
        </a>
        <p style={{
          fontFamily: T.font.body, fontWeight: 400, fontSize: 14, lineHeight: 1.4,
          color: "#131820", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {provider.address}
        </p>
      </div>
      {/* Image */}
      <div style={{
        width: "100%", aspectRatio: "316/178", borderRadius: 24, overflow: "hidden",
        backgroundColor: "#ddd",
      }}>
        <img src={provider.image} alt={provider.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* Description */}
      <p style={{
        fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 20 : 16, lineHeight: 1.6,
        color: "#131820", margin: 0,
      }}>
        {provider.desc}
      </p>
    </div>
  );
}

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  return (
    <div style={{
      backgroundColor: "#ffffff", border: "1px solid #fbfaf3", borderRadius: 24,
      padding: isDesktop ? 32 : 24, width: "100%", boxSizing: "border-box",
      display: "flex", flexDirection: "column", gap: open ? 24 : 0,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isDesktop ? 20 : 18,
          lineHeight: 1.4, color: "#131820", flex: 1,
        }}>
          {question}
        </span>
        <svg
          width={48} height={48} viewBox="0 0 48 48" fill="none"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}
        >
          <path d="M14 20L24 30L34 20" stroke="#131820" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <p style={{
          fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 20 : 16,
          lineHeight: 1.6, color: "#000", margin: 0,
        }}>
          {answer}
        </p>
      )}
    </div>
  );
}

function LandingPage({ onStart, onLogin, onPrivacy, onTerms }) {
  const isDesktop = useIsDesktop();
  const scrollRef = useRef(null);
  const [showPreAlpha, setShowPreAlpha] = useState(false);

  const scrollProviders = (dir) => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -375 : 375;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const px = isDesktop ? 160 : 20;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      width: "100%", minHeight: "100vh", fontFamily: T.font.body,
      backgroundColor: "#fff", position: "relative", overflow: "hidden",
    }}>
      {/* Font imports */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Subtle multi-color gradient background */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
        background: [
          "radial-gradient(ellipse 80% 50% at 10% 10%, rgba(200,230,255,0.35) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 40% at 0% 30%, rgba(230,250,140,0.2) 0%, transparent 50%)",
          "radial-gradient(ellipse 70% 50% at 5% 60%, rgba(240,180,210,0.25) 0%, transparent 55%)",
          "radial-gradient(ellipse 60% 40% at 90% 80%, rgba(200,220,255,0.2) 0%, transparent 50%)",
          "radial-gradient(ellipse 50% 30% at 50% 45%, rgba(220,210,240,0.12) 0%, transparent 50%)",
        ].join(", "),
      }} />

      {/* ---- FLOATING NAV BAR ---- */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "center",
        padding: `24px ${px}px`, boxSizing: "border-box",
      }}>
        <div style={{
          width: "100%", maxWidth: 1120,
          backgroundColor: "#fff", borderRadius: 999,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isDesktop ? "16px 64px" : "12px 24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {/* Logo */}
          <span style={{
            fontFamily: T.font.heading, fontWeight: 700, fontSize: isDesktop ? 24 : 20,
            color: T.color.primary, letterSpacing: 1, cursor: "pointer",
          }}>
            summa<span style={{ color: T.color.green, fontSize: 10, verticalAlign: "super" }}>{"\u25CF"}</span>
          </span>
          {/* Nav right */}
          <div style={{ display: "flex", alignItems: "center", gap: isDesktop ? 32 : 16 }}>
            <button onClick={onLogin} style={{
              backgroundColor: "#fbfaf3", border: "none", borderRadius: 16,
              cursor: "pointer", padding: isDesktop ? 24 : "12px 16px",
              fontFamily: T.font.body, fontSize: isDesktop ? 16 : 14, fontWeight: 500, lineHeight: 1.2,
              color: "#000", whiteSpace: "nowrap",
            }}>
              Log in
            </button>
            {/* PRE-ALPHA: "Start with Summa" and hamburger menu hidden during pre-alpha testing */}
          </div>
        </div>
      </div>

      {/* ---- HERO SECTION ---- */}
      <div style={{
        width: "100%", height: isDesktop ? 580 : "auto", minHeight: isDesktop ? 580 : 420,
        background: "linear-gradient(90deg, #eafe7e, #d7ff77)",
        padding: isDesktop ? `64px ${px}px` : `140px ${px}px 48px`, boxSizing: "border-box",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
        position: "relative", overflow: "hidden",
      }}>
        {/* Hero background image overlay */}
        <img
          src="/summa-hero.png" alt="" aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -40%)",
            width: "110%", height: "auto", opacity: 0.08,
            pointerEvents: "none", mixBlendMode: "darken",
          }}
        />
        {/* Hero content */}
        <div style={{
          maxWidth: 960, width: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 32, position: "relative", zIndex: 1,
          textAlign: "center",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800,
              fontSize: isDesktop ? 48 : 32, lineHeight: 1.4,
              color: "#131820", margin: 0,
            }}>
              The experiences that shape them, funded by the people who love them
            </h1>
            <p style={{
              fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 20 : 16, lineHeight: 1.6,
              color: "#131820", margin: 0, maxWidth: 640,
            }}>
              Summa makes it easy to set up a page, share it with your community, and turn your child&rsquo;s aspirations into achievements.
            </p>
          </div>
          <button onClick={() => setShowPreAlpha(true)} style={{
            backgroundColor: "#fff", border: "none", borderRadius: 999,
            padding: "24px 32px", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
            color: "#191919",
          }}>
            Start with Summa
          </button>
        </div>
      </div>

      {/* PRE-ALPHA MODAL */}
      {showPreAlpha && (
        <div
          onClick={() => setShowPreAlpha(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff", borderRadius: 24, padding: 32,
              maxWidth: 400, width: "100%", textAlign: "center",
              display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
            }}
          >
            <span style={{ fontSize: 32 }}>🚧</span>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1.4,
              color: "#131820", margin: 0,
            }}>
              Coming Soon
            </h3>
            <p style={{
              fontFamily: T.font.body, fontWeight: 400, fontSize: 16, lineHeight: 1.6,
              color: "#131820", margin: 0,
            }}>
              This feature is currently unavailable during pre-alpha.
            </p>
            <button onClick={() => setShowPreAlpha(false)} style={{
              backgroundColor: "#131820", color: "#fff", border: "none", borderRadius: 999,
              padding: "12px 32px", cursor: "pointer",
              fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
              marginTop: 8,
            }}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ---- SECTION: ABOUT / HOW IT WORKS ---- */}
      <div style={{
        width: "100%", padding: `64px ${px}px`, boxSizing: "border-box",
        maxWidth: 1440, margin: "0 auto",
        display: "flex", flexDirection: "column", gap: 24,
      }}>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 24, lineHeight: 1.4,
          color: "#131820", margin: 0,
        }}>
          Raising funds with Summa is easy
        </h2>
        <div style={{
          display: "flex", gap: 64, alignItems: isDesktop ? "center" : "flex-start",
          flexDirection: isDesktop ? "row" : "column",
        }}>
          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: isDesktop ? undefined : 1, width: isDesktop ? 640 : "100%" }}>
            {/* Step 1 */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, minWidth: 48, borderRadius: 999,
                border: "1px solid #ccff5d", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 32, lineHeight: 1.4, color: "#000" }}>1</span>
              </div>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isDesktop ? 24 : 20, lineHeight: 1.4,
                  color: "#131820", margin: "0 0 16px 0",
                }}>
                  Set up a fund for your child
                </h3>
                <p style={{ fontFamily: T.font.body, fontWeight: 400, fontSize: 16, lineHeight: 1.6, color: "#131820", margin: 0 }}>
                  <strong style={{ fontWeight: 700 }}>It&rsquo;s free and takes just a few minutes.</strong> Follow the prompts to add details and set your goal. You can make changes anytime.
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, minWidth: 48, borderRadius: 999,
                border: "1px solid #ccff5d", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 32, lineHeight: 1.4, color: "#000" }}>2</span>
              </div>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isDesktop ? 24 : 20, lineHeight: 1.4,
                  color: "#131820", margin: "0 0 16px 0",
                }}>
                  Share with your circle
                </h3>
                <p style={{ fontFamily: T.font.body, fontWeight: 400, fontSize: 16, lineHeight: 1.6, color: "#131820", margin: 0 }}>
                  Send your link to the friends and family who love your kid. They can view and give right from their browser — no app needed, no sign-up required.
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, minWidth: 48, borderRadius: 999,
                border: "1px solid #ccff5d", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 32, lineHeight: 1.4, color: "#000" }}>3</span>
              </div>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: isDesktop ? 24 : 20, lineHeight: 1.4,
                  color: "#131820", margin: "0 0 16px 0",
                }}>
                  Receive contributions directly
                </h3>
                <p style={{ fontFamily: T.font.body, fontWeight: 400, fontSize: 16, lineHeight: 1.6, color: "#131820", margin: 0 }}>
                  Connect Venmo, Cash App, or Zelle and receive support straight from your community. We&rsquo;ll help you track every dollar.
                </p>
              </div>
            </div>
          </div>
          {/* Phone screenshot */}
          <div style={{
            width: isDesktop ? 303 : "100%", maxWidth: isDesktop ? 303 : 280,
            height: isDesktop ? 492 : "auto",
            aspectRatio: isDesktop ? undefined : "303/492",
            borderRadius: 24, overflow: "hidden", flexShrink: 0,
            alignSelf: isDesktop ? undefined : "center",
          }}>
            <img
              src="https://www.figma.com/api/mcp/asset/fca59069-6243-4faa-a2af-1ebc39e80a1d"
              alt="Summa fund page preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>

      {/* ---- PROVIDERS WE LOVE ---- */}
      <div style={{
        width: "100%", padding: `64px 0`, boxSizing: "border-box",
      }}>
        {/* Section header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `0 ${px}px`, maxWidth: 1440, margin: "0 auto", boxSizing: "border-box",
        }}>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 24, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            Providers we love
          </h2>
          {/* Carousel controls */}
          <div style={{ display: "flex", gap: 32 }}>
            <button onClick={() => scrollProviders("left")} style={{
              width: 40, height: 40, borderRadius: 999, border: "none", cursor: "pointer",
              backgroundColor: "#131820",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => scrollProviders("right")} style={{
              width: 40, height: 40, borderRadius: 999, border: "none", cursor: "pointer",
              backgroundColor: "#131820",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <path d="M5 3L9 7L5 11" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Subtitle */}
        <p style={{
          fontFamily: T.font.body, fontWeight: 400, fontSize: 18, lineHeight: 1.4,
          color: "#131820", margin: 0, padding: `16px ${px}px 24px`,
          maxWidth: 1440, boxSizing: "border-box",
        }}>
          We&rsquo;re proud to spotlight local programs and providers that go above and beyond for kids in their community.
        </p>
        {/* Scrollable row */}
        <div
          ref={scrollRef}
          data-providers-scroll=""
          style={{
            display: "flex", gap: 32, overflowX: "auto", scrollBehavior: "smooth",
            paddingLeft: px, paddingRight: px, paddingBottom: 8,
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none", scrollbarWidth: "none",
          }}
        >
          <style>{`[data-providers-scroll]::-webkit-scrollbar { display: none; }`}</style>
          {PROVIDER_DATA.map((provider, i) => (
            <ProviderCard key={i} provider={provider} isDesktop={isDesktop} />
          ))}
        </div>
      </div>

      {/* ---- FAQ ---- */}
      <div style={{
        width: "100%", padding: `64px ${px}px`, boxSizing: "border-box",
        maxWidth: 1440, margin: "0 auto",
      }}>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: isDesktop ? 32 : 24, lineHeight: 1.4,
          color: "#131820", margin: "0 0 24px 0",
        }}>
          Have questions?
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 34, width: "100%" }}>
          {FAQ_DATA.map((faq, i) => (
            <AccordionItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* ---- FOOTER ---- */}
      <div style={{
        width: "100%", padding: `64px ${px}px`, boxSizing: "border-box",
        maxWidth: 1440, margin: "0 auto",
      }}>
        <div style={{
          background: "linear-gradient(90deg, #eafe7e, #d7ff77)",
          borderRadius: 24, padding: 32,
          display: "flex", flexDirection: isDesktop ? "row" : "column",
          alignItems: isDesktop ? "center" : "flex-start",
          justifyContent: "space-between", gap: isDesktop ? 0 : 32,
          width: "100%", boxSizing: "border-box",
        }}>
          {/* Left: Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onTerms && onTerms(); }} style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.2,
              color: "#131820", textDecoration: "underline", cursor: "pointer",
            }}>
              Terms of Service
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onPrivacy && onPrivacy(); }} style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.2,
              color: "#131820", textDecoration: "underline", cursor: "pointer",
            }}>
              Privacy Policy
            </a>
          </div>
          {/* Center: Logo + copyright */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            order: isDesktop ? 0 : -1,
          }}>
            <span style={{
              fontFamily: T.font.heading, fontWeight: 700, fontSize: 24,
              color: T.color.primary, letterSpacing: 1,
            }}>
              summa<span style={{ color: T.color.green, fontSize: 10, verticalAlign: "super" }}>{"\u25CF"}</span>
            </span>
            <span style={{
              fontFamily: T.font.body, fontWeight: 400, fontSize: 14, lineHeight: 1.4,
              color: "#131820", textAlign: "center",
            }}>
              Summa &copy; 2026
            </span>
          </div>
          {/* Right: Social icons */}
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="https://www.instagram.com/with_summa" target="_blank" rel="noopener noreferrer" style={{ display: "flex" }}>
              <InstagramIcon size={32} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRIVACY POLICY PAGE
// ============================================================

const PRIVACY_SECTIONS = [
  {
    title: "1. Scope and Updates to This Privacy Notice",
    paragraphs: [
      'This Privacy Notice applies to personal information processed by With Summa across our websites and other online or offline services, collectively referred to as the "Services."',
      "Updates to This Privacy Notice: We may update this Privacy Notice periodically to reflect changes in our practices or applicable laws. In the event of significant updates, we will notify you as required. By continuing to use our Services after updates become effective, you agree to the revised Privacy Notice.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: [
      "We collect personal information through direct interactions, automatic data collection, and third-party sources.",
      "Personal Information You Provide: This includes information shared during account creation, communications, surveys, contests, and events. For example:",
    ],
    bullets: ["\u2022 Guardians: Name, email, phone, address, and professional details."],
  },
  {
    title: "Automatically Collected Information",
    paragraphs: [
      "When you interact with our Services, we may collect data such as IP addresses, browser settings, and usage patterns through cookies and similar technologies.",
      "Examples of Automatically Collected Data:",
    ],
    bullets: [
      "\u2022 Cookies: Small files that remember your preferences.",
      "\u2022 Pixel Tags/Web Beacons: Help us understand engagement with emails and web pages.",
      "\u2022 Analytics Data: Information on how you navigate and use our Services.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    paragraphs: ["Your personal information is used to:"],
    bullets: [
      "\u2022 Provide Services: Manage accounts, process transactions, and respond to inquiries.",
      "\u2022 Administrative Purposes: Improve security, ensure compliance, and enhance functionality.",
      "\u2022 Marketing: Share relevant offers and communications.",
      "\u2022 Other Uses: With your consent or as required by law.",
    ],
  },
  {
    title: "4. Sharing Your Information",
    paragraphs: ["We may share your information with:"],
    bullets: [
      "\u2022 Service Providers: To support operations like IT support.",
      "\u2022 Business Partners: To provide joint services or products.",
      "\u2022 Third Parties: For legal compliance, or protection against fraud.",
    ],
  },
  {
    title: "5. Your Privacy Choices and Rights",
    paragraphs: ["We respect your privacy preferences and rights, including the ability to:"],
    bullets: [
      "\u2022 Access and Request Data: View and request a copy of your information.",
      "\u2022 Correct or Delete Data: Update inaccuracies or delete personal data.",
      "\u2022 Restrict or Object to Processing: Limit how we use your information.",
      "\u2022 Manage Communications: Opt out of marketing emails or text messages.",
    ],
  },
  {
    title: "6. Data Security",
    paragraphs: ["We prioritize the security of your personal information and employ measures to protect it. However, no system is completely secure. We encourage vigilance when sharing sensitive information."],
  },
  {
    title: "7. International Data Transfers",
    paragraphs: ["Your information may be transferred to and processed in countries with differing data protection laws. We follow legal safeguards, such as EU Standard Contractual Clauses, for international data transfers."],
  },
  {
    title: "8. Data Retention",
    paragraphs: ["We retain personal information for as long as necessary to provide services, fulfill legal obligations, or meet business purposes."],
  },
  {
    title: "9. California Residents",
    paragraphs: ["California residents have specific rights under the California Consumer Privacy Act (CCPA), including access, deletion, and non-discrimination when exercising these rights. Contact us to exercise these rights."],
  },
  {
    title: "10. Nevada Residents",
    paragraphs: ["Nevada residents may opt out of the sale of their personal information, though With Summa does not currently sell personal data."],
  },
  {
    title: "11. Children\u2019s Information",
    paragraphs: ["Our Services are not intended for children under 18. If you believe a child has shared personal information with us, please contact us so we can take appropriate action."],
  },
  {
    title: "12. Third-Party Services",
    paragraphs: ["Our Services may link to third-party websites or services, which operate independently. We encourage reviewing their privacy policies."],
  },
];

function PrivacyPolicyPage({ onStart, onLogin, onBack, onTerms }) {
  const isDesktop = useIsDesktop();
  const px = isDesktop ? 160 : 20;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      width: "100%", minHeight: "100vh", fontFamily: T.font.body,
      backgroundColor: "#fff",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Rubik:wght@400;500;700&family=Syne:wght@400&display=swap" rel="stylesheet" />

      {/* ---- NAV BAR ---- */}
      <div style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        padding: `24px ${px}px`, boxSizing: "border-box", backgroundColor: "#fff",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          width: "100%", maxWidth: 1120, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span onClick={onBack} style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: isDesktop ? 28 : 22,
            color: "#131820", cursor: "pointer",
          }}>
            summa
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: isDesktop ? 32 : 16 }}>
            {/* PRE-ALPHA: "Start with Summa" hidden during pre-alpha testing */}
            <button onClick={onLogin} style={{
              backgroundColor: "#fbfaf3", border: "none", borderRadius: 16,
              cursor: "pointer", padding: isDesktop ? 24 : "12px 16px",
              fontFamily: T.font.body, fontSize: isDesktop ? 16 : 14, fontWeight: 500, lineHeight: 1.2,
              color: "#000", whiteSpace: "nowrap",
            }}>
              Log in
            </button>
          </div>
        </div>
      </div>

      {/* ---- HERO ---- */}
      <div style={{
        width: "100%", background: "linear-gradient(90deg, #eafe7e, #d7ff77)",
        padding: `${isDesktop ? 96 : 64}px ${px}px`, boxSizing: "border-box",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 960, width: "100%", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800,
            fontSize: isDesktop ? 48 : 32, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            Privacy Notice
          </h1>
          <p style={{
            fontFamily: T.font.body, fontWeight: 400, fontSize: 20, lineHeight: 1.6,
            color: "#131820", margin: 0,
          }}>
            Last Updated: April 11, 2026
          </p>
        </div>
      </div>

      {/* ---- CONTENT ---- */}
      <div style={{
        width: "100%", maxWidth: isDesktop ? 800 : undefined,
        padding: `64px ${isDesktop ? 0 : px}px`, boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: 32,
      }}>
        {/* Intro */}
        <p style={{
          fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 20 : 16, lineHeight: 1.6,
          color: "#333", margin: 0,
        }}>
          We at With Summa (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) are committed to protecting your personal information. This Privacy Notice is designed to provide a clear understanding of how we collect, use, process, and share your personal information, and to inform you of your privacy rights.
        </p>

        {/* Key Highlights Card */}
        <div style={{
          backgroundColor: "#62c6ff", borderRadius: 24, padding: 32,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            Key Highlights
          </h2>
          {[
            "\u2022 What We Collect: Information you provide directly, data collected automatically, and information from third parties.",
            "\u2022 How We Use It: To provide and improve our Services and for administrative purposes.",
            "\u2022 Your Rights: Access, correct, delete, and manage your data preferences.",
            "\u2022 Contact Us: For any concerns or to exercise your rights, email us at hello@withsumma.com",
          ].map((text, i) => (
            <p key={i} style={{
              fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
              color: "#131820", margin: 0,
            }}>
              {text}
            </p>
          ))}
        </div>

        {/* Numbered Sections */}
        {PRIVACY_SECTIONS.map((section, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.4,
              color: "#131820", margin: 0,
            }}>
              {section.title}
            </h2>
            {(section.paragraphs || []).map((p, j) => (
              <p key={j} style={{
                fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
                color: "#333", margin: 0,
              }}>
                {p}
              </p>
            ))}
            {(section.bullets || []).map((b, j) => (
              <p key={`b${j}`} style={{
                fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
                color: "#333", margin: 0,
              }}>
                {b}
              </p>
            ))}
          </div>
        ))}

        {/* Glossary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            Glossary
          </h2>
          {[
            "\u2022 Cookies: Small text files used to enhance your experience.",
            "\u2022 Pixel Tags: Tools for measuring email and web engagement.",
            "\u2022 IP Address: A unique address identifying devices on the internet.",
            "\u2022 De-identified Information: Data that has been stripped of personal identifiers.",
          ].map((text, i) => (
            <p key={i} style={{
              fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
              color: "#333", margin: 0,
            }}>
              {text}
            </p>
          ))}
        </div>

        {/* Contact Card */}
        <div style={{
          backgroundColor: "#ff7cb4", borderRadius: 24, padding: 32,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            13. Contact Us
          </h2>
          <div style={{
            fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
            color: "#131820",
          }}>
            <p style={{ margin: 0 }}>For questions or to exercise your rights, please contact us at:</p>
            <br />
            <p style={{ margin: 0 }}>With Summa</p>
            <p style={{ margin: 0 }}>Email: Hello@withsumma.com</p>
            <br />
            <p style={{ margin: 0 }}>We are here to ensure your privacy is respected and your concerns are addressed promptly.</p>
          </div>
        </div>
      </div>

      {/* ---- FOOTER ---- */}
      <div style={{
        width: "100%", padding: `64px ${px}px`, boxSizing: "border-box",
        maxWidth: 1440, margin: "0 auto",
      }}>
        <div style={{
          background: "linear-gradient(90deg, #eafe7e, #d7ff77)",
          borderRadius: 24, padding: 32,
          display: "flex", flexDirection: isDesktop ? "row" : "column",
          alignItems: isDesktop ? "center" : "flex-start",
          justifyContent: "space-between", gap: isDesktop ? 0 : 32,
          width: "100%", boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onTerms && onTerms(); }} style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.2,
              color: "#131820", textDecoration: "underline", cursor: "pointer",
            }}>
              Terms of Service
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.2,
              color: "#131820", textDecoration: "underline", cursor: "pointer",
            }}>
              Privacy Policy
            </a>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            order: isDesktop ? 0 : -1,
          }}>
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 32,
              color: "#131820",
            }}>
              summa
            </span>
            <span style={{
              fontFamily: T.font.body, fontWeight: 400, fontSize: 14, lineHeight: 1.4,
              color: "#131820", textAlign: "center",
            }}>
              Summa &copy; 2026
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="https://www.instagram.com/with_summa" target="_blank" rel="noopener noreferrer" style={{ display: "flex" }}>
              <InstagramIcon size={32} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Edit Profile — 26
// ============================================================
function EditProfileScreen({ data, onBack, onSave, onSignOut }) {
  const isDesktop = useIsDesktop();
  const [phone, setPhone] = useState(data.phone || "");
  const [email, setEmail] = useState(data.email || "");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Your Account";

  const hasChanges = (
    email !== (data.email || "") ||
    phone !== (data.phone || "") ||
    (showPasswordFields && newPassword !== "" && confirmPassword !== "")
  );

  const passwordMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  const handleSave = async () => {
    if (passwordMismatch) {
      setErrorMsg("Passwords don't match.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const updates = {};
    if (email !== (data.email || "")) updates.email = email;
    if (phone !== (data.phone || "")) updates.phone = phone;
    if (showPasswordFields && newPassword) updates.password = newPassword;

    const { user, error } = await onSave(updates);
    setSaving(false);

    if (error) {
      setErrorMsg(typeof error === "string" ? error : error.message || "Failed to save. Please try again.");
    } else {
      setSuccessMsg(
        updates.email && updates.email !== (data.email || "")
          ? "Profile updated! Check your new email for a confirmation link."
          : "Profile updated!"
      );
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 32,
      width: "100%", maxWidth: isDesktop ? 420 : 375, minHeight: "100vh", margin: "0 auto",
      padding: isDesktop ? "40px 48px 60px 48px" : "40px 16px 60px 16px", boxSizing: "border-box",
      fontFamily: T.font.body,
    }}>
      {/* Back button */}
      <div style={{ width: "100%", maxWidth: 343 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Go back">
          <ArrowBackIcon />
        </button>
      </div>

      {/* Heading */}
      <div style={{ width: "100%", maxWidth: 343 }}>
        <h1 style={{
          fontFamily: T.font.heading, fontWeight: 500, fontSize: 28, lineHeight: 1.4,
          color: T.color.primary, margin: 0,
        }}>
          Edit Profile
        </h1>
      </div>

      {/* Name (read-only) */}
      <div style={{ width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{
          fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.color.neutral700,
        }}>
          Name
        </span>
        <div style={{
          width: "100%", height: 56, borderRadius: 12,
          backgroundColor: T.color.neutral300, border: `1px solid ${T.color.neutral500}`,
          display: "flex", alignItems: "center", padding: "0 16px", boxSizing: "border-box",
          fontFamily: T.font.body, fontSize: 16, color: T.color.neutral700,
          opacity: 0.7,
        }}>
          {fullName}
        </div>
        <span style={{
          fontFamily: T.font.body, fontSize: 12, fontWeight: 400, color: T.color.neutral700,
          paddingLeft: 4, fontStyle: "italic",
        }}>
          Name cannot be changed for security purposes.
        </span>
      </div>

      {/* Editable fields */}
      <InputField label="Email" value={email} onChange={setEmail} type="email" />
      <div style={{ width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 8 }}>
        <InputField label="Phone number (optional)" value={phone} onChange={setPhone} type="tel" />
        <span style={{
          fontFamily: T.font.body, fontSize: 13, fontWeight: 400, lineHeight: 1.4,
          color: T.color.neutral700, paddingLeft: 4,
        }}>
          Add your number to get text notifications when you receive a donation.
        </span>
      </div>

      {/* Password section */}
      <div style={{
        width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 4,
        borderTop: `1px solid ${T.color.neutral500}`, paddingTop: 24,
      }}>
        {!showPasswordFields ? (
          <button
            onClick={() => setShowPasswordFields(true)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.color.primary,
              textDecoration: "underline", textAlign: "left",
            }}
          >
            Change Password
          </button>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{
                fontFamily: T.font.body, fontSize: 14, fontWeight: 500, color: T.color.primary,
              }}>
                Change Password
              </span>
              <button
                onClick={() => { setShowPasswordFields(false); setNewPassword(""); setConfirmPassword(""); setErrorMsg(""); }}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontFamily: T.font.body, fontSize: 13, fontWeight: 400, color: T.color.neutral700,
                  textDecoration: "underline",
                }}
              >
                Cancel
              </button>
            </div>
            <InputField label="New password" value={newPassword} onChange={setNewPassword} type="password" />
            <div style={{ height: 16 }} />
            <InputField label="Confirm new password" value={confirmPassword} onChange={(v) => { setConfirmPassword(v); setErrorMsg(""); }} type="password" />
            {passwordMismatch && (
              <span style={{
                fontFamily: T.font.body, fontSize: 13, color: "#e74c3c", paddingLeft: 4, marginTop: 4,
              }}>
                Passwords don&rsquo;t match.
              </span>
            )}
          </>
        )}
      </div>

      {/* Status messages */}
      {errorMsg && (
        <div style={{
          width: "100%", maxWidth: 343, padding: "12px 16px", boxSizing: "border-box",
          borderRadius: 12, backgroundColor: "#ffeaea",
          fontFamily: T.font.body, fontSize: 14, color: "#c0392b", lineHeight: 1.4,
        }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{
          width: "100%", maxWidth: 343, padding: "12px 16px", boxSizing: "border-box",
          borderRadius: 12, backgroundColor: "#eaffea",
          fontFamily: T.font.body, fontSize: 14, color: "#27ae60", lineHeight: 1.4,
        }}>
          {successMsg}
        </div>
      )}

      {/* Save button */}
      <div style={{ width: "100%", maxWidth: 343, margin: "0 auto" }}>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving || passwordMismatch}
          style={{
            width: "100%", height: 60, borderRadius: T.radius.circle,
            background: hasChanges && !saving && !passwordMismatch
              ? "linear-gradient(90deg, #d6ff76, #eafe7e)"
              : T.color.neutral300,
            border: hasChanges && !saving && !passwordMismatch ? "1px solid #191919" : "none",
            cursor: hasChanges && !saving && !passwordMismatch ? "pointer" : "default",
            fontFamily: T.font.body, fontSize: 16, fontWeight: 500, lineHeight: 1.2,
            color: T.color.primary, opacity: hasChanges && !saving && !passwordMismatch ? 1 : 0.5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Sign out button */}
      <div style={{ width: "100%", maxWidth: 343, margin: "0 auto", display: "flex", justifyContent: "center" }}>
        <button
          onClick={onSignOut}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "12px",
            fontFamily: T.font.body, fontSize: 14, fontWeight: 500,
            color: "#e74c3c", textDecoration: "underline",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: Terms of Use
// ============================================================
const TERMS_SECTIONS = [
  {
    title: "1. Who We Are",
    paragraphs: [
      "With Summa (\u201Cwe,\u201D \u201Cus,\u201D or \u201Cour\u201D) operates the Summa platform, which enables parents, guardians, and communities to crowdfund enrichment activities for children.",
      "These Terms of Use (\u201CTerms\u201D) govern your access to and use of our website, mobile applications, and related services (collectively, the \u201CServices\u201D). By accessing or using any part of the Services, you agree to be bound by these Terms.",
    ],
  },
  {
    title: "2. Eligibility",
    paragraphs: [
      "You must be at least 18 years old to use the Services. By using the Services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into a binding agreement.",
    ],
  },
  {
    title: "3. Account Registration",
    paragraphs: [
      "To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date.",
    ],
    subtitles: [
      { subtitle: "Account Security", text: "You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify us immediately at hello@withsumma.com if you suspect unauthorized access." },
      { subtitle: "Account Termination", text: "We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason at our discretion." },
    ],
  },
  {
    title: "4. Use of the Services",
    paragraphs: [
      "You agree to use the Services only for lawful purposes and in compliance with these Terms. You shall not:",
    ],
    bullets: [
      "\u2022 Use the Services for any fraudulent, misleading, or deceptive purpose.",
      "\u2022 Attempt to interfere with the security or proper functioning of the Services.",
      "\u2022 Upload or share content that is harmful, offensive, or infringes on the rights of others.",
      "\u2022 Impersonate any person or entity, or falsely represent your affiliation.",
      "\u2022 Use the Services to solicit funds for purposes unrelated to children\u2019s enrichment activities.",
    ],
  },
  {
    title: "5. Fundraising and Payments",
    paragraphs: [
      "Summa facilitates crowdfunding campaigns for children\u2019s enrichment activities. By creating or contributing to a campaign, you agree to the following:",
    ],
    subtitles: [
      { subtitle: "Campaign Organizers", text: "You are responsible for ensuring that all information in your campaign is accurate and truthful. Funds raised must be used for the stated purpose. Misuse of funds may result in account suspension and legal action." },
      { subtitle: "Contributors", text: "Contributions are voluntary. We do not guarantee that funds will be used as described by the organizer. Refunds are subject to our Refund Policy." },
      { subtitle: "Payment Processing", text: "Payments are processed through third-party payment providers. By making a payment, you agree to the terms and conditions of those providers. We are not responsible for errors or delays caused by payment processors." },
    ],
  },
  {
    title: "6. Intellectual Property",
    paragraphs: [
      "All content, trademarks, logos, and intellectual property displayed on the Services are owned by With Summa or our licensors. You may not copy, reproduce, distribute, or create derivative works without our prior written consent.",
    ],
    subtitles: [
      { subtitle: "User Content", text: "By submitting content to the Services (e.g., campaign descriptions, images), you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Services." },
    ],
  },
  {
    title: "7. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, With Summa and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Services.",
      "Our total liability for any claims arising under these Terms shall not exceed the amount you paid to us, if any, in the 12 months preceding the claim.",
    ],
  },
  {
    title: "8. Dispute Resolution",
    paragraphs: [
      "Any disputes arising out of or relating to these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association (AAA), rather than in court.",
    ],
    subtitles: [
      { subtitle: "Class Action Waiver", text: "You agree that any arbitration or proceeding shall be limited to the dispute between us individually. You waive any right to participate in a class action lawsuit or class-wide arbitration." },
      { subtitle: "Governing Law", text: "These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles." },
    ],
  },
  {
    title: "9. Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time. If we make material changes, we will notify you by posting the updated Terms on our website and updating the \u201CEffective Date\u201D above. Your continued use of the Services after any changes constitutes your acceptance of the revised Terms.",
    ],
  },
];

function TermsOfUsePage({ onStart, onLogin, onBack, onPrivacy }) {
  const isDesktop = useIsDesktop();
  const px = isDesktop ? 160 : 20;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      width: "100%", minHeight: "100vh", fontFamily: T.font.body,
      backgroundColor: "#fff",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Rubik:wght@400;500;700&family=Syne:wght@400&display=swap" rel="stylesheet" />

      {/* ---- NAV BAR ---- */}
      <div style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        padding: `24px ${px}px`, boxSizing: "border-box", backgroundColor: "#fff",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          width: "100%", maxWidth: 1120, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span onClick={onBack} style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: isDesktop ? 28 : 22,
            color: "#131820", cursor: "pointer",
          }}>
            summa
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: isDesktop ? 32 : 16 }}>
            {/* PRE-ALPHA: "Start with Summa" hidden during pre-alpha testing */}
            <button onClick={onLogin} style={{
              backgroundColor: "#fbfaf3", border: "none", borderRadius: 16,
              cursor: "pointer", padding: isDesktop ? 24 : "12px 16px",
              fontFamily: T.font.body, fontSize: isDesktop ? 16 : 14, fontWeight: 500, lineHeight: 1.2,
              color: "#000", whiteSpace: "nowrap",
            }}>
              Log in
            </button>
          </div>
        </div>
      </div>

      {/* ---- HERO ---- */}
      <div style={{
        width: "100%", background: "linear-gradient(90deg, #eafe7e, #d7ff77)",
        padding: `${isDesktop ? 96 : 64}px ${px}px`, boxSizing: "border-box",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 960, width: "100%", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800,
            fontSize: isDesktop ? 48 : 32, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            Terms of Use
          </h1>
          <p style={{
            fontFamily: T.font.body, fontWeight: 400, fontSize: 20, lineHeight: 1.6,
            color: "#131820", margin: 0,
          }}>
            Effective Date: April 11, 2026
          </p>
        </div>
      </div>

      {/* ---- CONTENT ---- */}
      <div style={{
        width: "100%", maxWidth: isDesktop ? 800 : undefined,
        padding: `64px ${isDesktop ? 0 : px}px`, boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: 32,
      }}>
        {/* Intro */}
        <p style={{
          fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 20 : 16, lineHeight: 1.6,
          color: "#333", margin: 0,
        }}>
          Welcome to Summa! These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of our platform. By using our Services, you agree to these Terms. Please read them carefully.
        </p>

        {/* Arbitration Notice Card */}
        <div style={{
          backgroundColor: "#e7fd57", borderRadius: 24, padding: 32,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            Important Notice
          </h2>
          <p style={{
            fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
            color: "#131820", margin: 0,
          }}>
            These Terms contain a mandatory arbitration provision and class action waiver (see Section 8). By using our Services, you agree to resolve disputes through binding individual arbitration and waive your right to participate in class actions.
          </p>
        </div>

        {/* Numbered Sections */}
        {TERMS_SECTIONS.map((section, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.4,
              color: "#131820", margin: 0,
            }}>
              {section.title}
            </h2>
            {(section.paragraphs || []).map((p, j) => (
              <p key={j} style={{
                fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
                color: "#333", margin: 0,
              }}>
                {p}
              </p>
            ))}
            {(section.bullets || []).map((b, j) => (
              <p key={`b${j}`} style={{
                fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
                color: "#333", margin: 0, paddingLeft: 16,
              }}>
                {b}
              </p>
            ))}
            {(section.subtitles || []).map((sub, j) => (
              <div key={`s${j}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{
                  fontFamily: T.font.body, fontWeight: 500, fontSize: isDesktop ? 18 : 16, lineHeight: 1.4,
                  color: "#131820", margin: 0,
                }}>
                  {sub.subtitle}
                </h3>
                <p style={{
                  fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
                  color: "#333", margin: 0,
                }}>
                  {sub.text}
                </p>
              </div>
            ))}
          </div>
        ))}

        {/* Contact Card */}
        <div style={{
          backgroundColor: "#ffa967", borderRadius: 24, padding: 32,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.4,
            color: "#131820", margin: 0,
          }}>
            Contact Us
          </h2>
          <div style={{
            fontFamily: T.font.body, fontWeight: 400, fontSize: isDesktop ? 18 : 16, lineHeight: 1.6,
            color: "#131820",
          }}>
            <p style={{ margin: 0 }}>If you have any questions about these Terms, please contact us at:</p>
            <br />
            <p style={{ margin: 0 }}>With Summa</p>
            <p style={{ margin: 0 }}>Email: hello@withsumma.com</p>
            <br />
            <p style={{ margin: 0 }}>We appreciate your trust in Summa and look forward to supporting your community.</p>
          </div>
        </div>
      </div>

      {/* ---- FOOTER ---- */}
      <div style={{
        width: "100%", padding: `64px ${px}px`, boxSizing: "border-box",
        maxWidth: 1440, margin: "0 auto",
      }}>
        <div style={{
          background: "linear-gradient(90deg, #eafe7e, #d7ff77)",
          borderRadius: 24, padding: 32,
          display: "flex", flexDirection: isDesktop ? "row" : "column",
          alignItems: isDesktop ? "center" : "flex-start",
          justifyContent: "space-between", gap: isDesktop ? 0 : 32,
          width: "100%", boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.2,
              color: "#131820", textDecoration: "underline", cursor: "pointer",
            }}>
              Terms of Service
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onPrivacy && onPrivacy(); }} style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.2,
              color: "#131820", textDecoration: "underline", cursor: "pointer",
            }}>
              Privacy Policy
            </a>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            order: isDesktop ? 0 : -1,
          }}>
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 32,
              color: "#131820",
            }}>
              summa
            </span>
            <span style={{
              fontFamily: T.font.body, fontWeight: 400, fontSize: 14, lineHeight: 1.4,
              color: "#131820", textAlign: "center",
            }}>
              Summa &copy; 2026
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="https://www.instagram.com/with_summa" target="_blank" rel="noopener noreferrer" style={{ display: "flex" }}>
              <InstagramIcon size={32} />
            </a>
          </div>
        </div>
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
  const isDesktop = useIsDesktop();
  return (
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      width: "100%", maxWidth: isDesktop ? 420 : 375, minHeight: "100vh", margin: "0 auto",
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
            border: "1px solid #191919", cursor: "pointer",
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
  const [phone, setPhone] = useState("");
  const isDesktop = useIsDesktop();

  const handleCreate = () => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    onCreateAccount({ firstName, lastName, email, password, phone: phone.trim() || null });
  };

  const canSubmit = fullName.trim() && email.trim() && password.trim();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 48,
      width: "100%", maxWidth: isDesktop ? 420 : 375, minHeight: "100vh", margin: "0 auto",
      padding: isDesktop ? "80px 48px 60px 48px" : "80px 16px 60px 16px", boxSizing: "border-box",
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
        <div style={{ width: "100%", maxWidth: 343, display: "flex", flexDirection: "column", gap: 8 }}>
          <InputField label="Phone number (optional)" value={phone} onChange={setPhone} type="tel" />
          <span style={{
            fontFamily: T.font.body, fontSize: 13, fontWeight: 400, lineHeight: 1.4,
            color: T.color.neutral700, paddingLeft: 4,
          }}>
            Add your number to get text notifications when you receive a donation.
          </span>
        </div>
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
  const [rememberMe, setRememberMe] = useState(false);
  const isDesktop = useIsDesktop();

  const canSubmit = email.trim() && password.trim();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 48,
      width: "100%", maxWidth: isDesktop ? 420 : 375, minHeight: "100vh", margin: "0 auto",
      padding: isDesktop ? "80px 48px 60px 48px" : "80px 16px 60px 16px", boxSizing: "border-box",
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

        {/* Remember me */}
        <label style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          width: "100%", maxWidth: 343,
        }}>
          <div
            onClick={() => setRememberMe(v => !v)}
            style={{
              width: 20, height: 20, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${rememberMe ? T.color.primary : T.color.neutral500}`,
              backgroundColor: rememberMe ? T.color.primary : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s ease", cursor: "pointer",
            }}
          >
            {rememberMe && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke={T.color.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{
            fontFamily: T.font.body, fontSize: 14, lineHeight: 1.4,
            color: T.color.primary,
          }}>
            Remember me
          </span>
        </label>
      </div>

      {/* Sign in button — pinned to bottom */}
      <div style={{ width: "100%", maxWidth: 343, margin: "0 auto" }}>
        <button
          onClick={() => onSignIn({ email, password, rememberMe })}
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
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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
    coverImagePosition: { x: 50, y: 50 },
    contentBlocks: [],
  });
  const [slideDir, setSlideDir] = useState("right");
  const [animating, setAnimating] = useState(false);
  const [returnTo, setReturnTo] = useState(null); // screen index to return to after editing
  const [editingBlockId, setEditingBlockId] = useState(null); // content block ID being edited
  const [prevScreen, setPrevScreen] = useState(null); // track previous screen for back navigation
  const [fundsRefreshKey, setFundsRefreshKey] = useState(0); // increment to re-fetch funds on dashboard

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
          phone: meta.phone || "",
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
      loadFundBySlug(slug).then(async ({ fund, error }) => {
        if (fund) {
          // Fetch contributions for this fund to show activity feed
          const { contributions } = await getContributions(fund.id);
          const confirmedDonations = (contributions || [])
            .filter(c => c.status === "confirmed")
            .map(c => ({
              id: c.id,
              name: c.supporter_name || "Anonymous",
              amount: Number(c.amount) || 0,
              message: c.message || "",
              time: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            }));
          const totalRaised = confirmedDonations.reduce((s, d) => s + d.amount, 0);
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
            coverImagePosition: fund.cover_image_position || { x: 50, y: 50 },
            contentBlocks: fund.content_blocks || [],
            supporterContribution: totalRaised,
            supporterCount: confirmedDonations.length,
            donations: confirmedDonations,
          });
          setLoading(false);
          // Skip start screen, go directly to supporter fund page
          setShowStart(false);
          setScreen(12);
        } else {
          setLoading(false);
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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Rubik:wght@400;500;700&family=Syne:wght@400&display=swap" rel="stylesheet" />
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
    setPrevScreen(screen);
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
      goTo(data.fundFor === "myself" ? 3 : 2);
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
    else if (screen === 3) goTo(0, "left");
    else if (screen === 4) goTo(3, "left");
    else if (screen === 5) goTo(4, "left");
    else if (screen === 6) goTo(5, "left");
    else if (screen === 7) goTo(6, "left");
    else if (screen === 8) goTo(7, "left");
    else if (screen === 9) {
      // Reset
      setData(prev => ({
        fundFor: null, firstName: prev.firstName || "", lastName: prev.lastName || "",
        recipientName: "", title: "", description: "", goal: "", targetDate: "",
        paymentHandles: {}, coverImage: null, coverImagePosition: { x: 50, y: 50 },
        contentBlocks: [], email: prev.email || "", userId: prev.userId || null,
      }));
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
    8: <ReviewSummaFund data={data} setData={setData} onNext={next} onBack={back} goTo={(dest) => { setReturnTo(8); goTo(dest); }} onEditBlock={(blockId) => { setEditingBlockId(blockId); setReturnTo(8); goTo(24); }} />,
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
    19: <GuardianHome data={data} setData={setData} goTo={goTo} goHome={goHome} isSignedIn={isSignedIn} refreshKey={fundsRefreshKey} />,
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
          phone: meta.phone || "",
          userId: user?.id,
        }));
        setIsSignedIn(true);
        goTo(19);
      }}
      onBack={() => goTo(10, "left")}
    />,
    23: <AddToPage data={data} setData={setData} onBack={() => goTo(returnTo || 8, "left")} />,
    24: <EditContentBlock data={data} setData={setData} blockId={editingBlockId} onBack={() => { const ret = returnTo || 8; setEditingBlockId(null); goTo(ret, "left"); }} />,
    25: <EditSummaFund
      data={data} setData={setData}
      onBack={() => goTo(20, "left")}
      goTo={(dest) => { setReturnTo(25); goTo(dest); }}
      onEditBlock={(blockId) => { setEditingBlockId(blockId); setReturnTo(25); goTo(24); }}
      onSave={async () => {
        if (data.fundId) {
          const fundUpdates = {
            title: data.title,
            description: data.description,
            goal: data.goal,
            targetDate: data.targetDate,
            paymentHandles: data.paymentHandles,
            coverImage: data.coverImage,
            coverImagePosition: data.coverImagePosition,
            contentBlocks: data.contentBlocks,
          };
          const { fund, error } = await updateFund(data.fundId, fundUpdates);
          if (error) { alert("Failed to save changes: " + (error.message || error)); return; }
          if (!fund) { alert("Changes could not be saved. Please add an UPDATE policy to your Supabase RLS for the funds table:\n\nCREATE POLICY \"Users can update own funds\" ON public.funds FOR UPDATE USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);"); return; }
          setFundsRefreshKey(k => k + 1);
          alert("Changes saved!");
          goTo(20, "left");
        }
      }}
      onDelete={async () => {
        if (data.fundId) {
          const { error } = await deleteFund(data.fundId);
          if (error) { alert("Failed to delete fund: " + (error.message || error)); return; }
          // Reset data, bump refresh key, and go to dashboard
          setData(prev => ({
            fundFor: null, firstName: prev.firstName || "", lastName: prev.lastName || "",
            recipientName: "", title: "", description: "", goal: "", targetDate: "",
            paymentHandles: {}, coverImage: null, coverImagePosition: { x: 50, y: 50 },
            contentBlocks: [], email: prev.email || "", userId: prev.userId || null,
          }));
          setFundsRefreshKey(k => k + 1);
          goTo(19);
        }
      }}
    />,
    26: <EditProfileScreen
      data={data}
      onBack={() => goTo(prevScreen || 19, "left")}
      onSave={async (updates) => {
        const { user, error } = await updateUserProfile(updates);
        if (!error && user) {
          const meta = user.user_metadata || {};
          setData(prev => ({
            ...prev,
            email: user.email || prev.email,
            phone: meta.phone || "",
          }));
        }
        return { user, error };
      }}
      onSignOut={async () => {
        await signOutUser();
        setIsSignedIn(false);
        setShowStart(true);
        setData(prev => ({
          fundFor: null, firstName: "", lastName: "",
          recipientName: "", title: "", description: "", goal: "", targetDate: "",
          paymentHandles: {}, coverImage: null, coverImagePosition: { x: 50, y: 50 },
          contentBlocks: [], email: "", userId: null,
        }));
      }}
    />,
  };

  if (showStart) {
    // Sign up or sign in screens (shown over the landing page)
    if (showSignUp) {
      return (
        <div style={{ background: T.gradient.bg, minHeight: "100vh" }}>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
          <style>{`input::placeholder, textarea::placeholder { color: ${T.color.neutral700} !important; opacity: 1; }`}</style>
          <SignUpScreen
            onCreateAccount={async ({ firstName, lastName, email, password, phone }) => {
              const { user, error } = await signUpUser({ email, password, firstName, lastName, phone });
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
        </div>
      );
    }
    if (showSignIn) {
      return (
        <div style={{ background: T.gradient.bg, minHeight: "100vh" }}>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
          <style>{`input::placeholder, textarea::placeholder { color: ${T.color.neutral700} !important; opacity: 1; }`}</style>
          <SignInScreen
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
                phone: meta.phone || "",
                userId: user?.id,
              }));
              setIsSignedIn(true);
              setShowStart(false);
              setShowSignIn(false);
              setScreen(19);
            }}
            onBack={() => setShowSignIn(false)}
          />
        </div>
      );
    }
    // Privacy Policy page
    if (showPrivacy) {
      return (
        <PrivacyPolicyPage
          onStart={() => {
            setShowPrivacy(false);
            if (isSignedIn) {
              setShowStart(false);
              setScreen(0);
            } else {
              setShowSignUp(true);
            }
          }}
          onLogin={() => { setShowPrivacy(false); setShowSignIn(true); }}
          onBack={() => { setShowPrivacy(false); }}
          onTerms={() => { setShowPrivacy(false); setShowTerms(true); window.scrollTo({ top: 0 }); }}
        />
      );
    }
    // Terms of Use page
    if (showTerms) {
      return (
        <TermsOfUsePage
          onStart={() => {
            setShowTerms(false);
            if (isSignedIn) {
              setShowStart(false);
              setScreen(0);
            } else {
              setShowSignUp(true);
            }
          }}
          onLogin={() => { setShowTerms(false); setShowSignIn(true); }}
          onBack={() => { setShowTerms(false); }}
          onPrivacy={() => { setShowTerms(false); setShowPrivacy(true); window.scrollTo({ top: 0 }); }}
        />
      );
    }
    // Default: show the marketing landing page
    return (
      <LandingPage
        onStart={() => {
          if (isSignedIn) {
            setShowStart(false);
            setScreen(0);
          } else {
            setShowSignUp(true);
          }
        }}
        onLogin={() => setShowSignIn(true)}
        onPrivacy={() => { setShowPrivacy(true); window.scrollTo({ top: 0 }); }}
        onTerms={() => { setShowTerms(true); window.scrollTo({ top: 0 }); }}
      />
    );
  }

  return (
    <div style={{ background: T.gradient.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`input::placeholder, textarea::placeholder { color: ${T.color.neutral700} !important; opacity: 1; }`}</style>
      <div style={containerStyle}>
        {screens[screen]}
      </div>
    </div>
  );
}