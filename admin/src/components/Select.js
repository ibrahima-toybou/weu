import { useState, useRef, useEffect } from "react";
import styles from "./Select.module.css";

function Select({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const ref = useRef(null);
  const triggerRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen(!open);
  }

  function handleSelect(val) {
    onChange({ target: { value: val } });
    setOpen(false);
  }

  return (
    <div
      className={`${styles.wrap} ${disabled ? styles.disabled : ""}`}
      ref={ref}
    >
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={handleOpen}
        disabled={disabled}
      >
        <span
          className={selected ? styles.triggerVal : styles.triggerPlaceholder}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} style={dropdownStyle}>
          {options.map((o, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.option} ${String(o.value) === String(value) ? styles.optionActive : ""}`}
              onClick={() => handleSelect(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Select;
