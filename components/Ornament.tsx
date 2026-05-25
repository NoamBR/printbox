type Props = {
  variant?: "default" | "onEspresso";
};

/**
 * Ornamental section divider: hairline rule with a centered rotated square.
 * Use `variant="onEspresso"` when the surrounding bg is brand-espresso so the
 * line stays visible against the deep brown.
 */
export default function Ornament({ variant = "default" }: Props) {
  const isOnEspresso = variant === "onEspresso";
  const lineColor = isOnEspresso ? "bg-brand-onEspresso/25" : "bg-brand-gold/35";
  const dotColor = isOnEspresso ? "bg-brand-onEspresso/50" : "bg-brand-gold/70";
  const bandBg = isOnEspresso ? "bg-brand-espresso" : "bg-transparent";

  return (
    <div className={`relative w-full py-8 ${bandBg}`} aria-hidden="true">
      <div className="max-w-container mx-auto px-6 lg:px-10 flex items-center gap-6">
        <span className={`flex-1 h-px ${lineColor}`} />
        <span
          className={`block w-2.5 h-2.5 rotate-45 ${dotColor}`}
          style={{ boxShadow: "0 0 0 1px rgb(var(--c-gold) / 0.35)" }}
        />
        <span className={`flex-1 h-px ${lineColor}`} />
      </div>
    </div>
  );
}
